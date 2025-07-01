const TurndownService = require('turndown');
const crypto = require('crypto');
const dbManager = require('./db-manager');
require('dotenv').config();

// Initialize Turndown with custom rules
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  emDelimiter: '_'
});

// Add custom rules for better AI readability
turndownService.addRule('removeScripts', {
  filter: ['script', 'style', 'noscript'],
  replacement: () => ''
});

turndownService.addRule('preserveTables', {
  filter: 'table',
  replacement: (content, node) => {
    // Keep table structure for better data extraction
    return '\n\n[TABLE]\n' + content + '\n[/TABLE]\n\n';
  }
});

class MarkdownConverterThreeDB {
  constructor() {
    this.rawDb = null;
    this.processedDb = null;
  }

  initialize() {
    // Check if three-database architecture exists
    if (!dbManager.hasThreeDbArchitecture()) {
      console.log('📊 Three-database architecture not found. Creating it now...');
      // Run the create-three-dbs script
      require('./scripts/create-three-dbs');
    }
    
    // Get database connections
    this.rawDb = dbManager.getRawDb();
    this.processedDb = dbManager.getProcessedDb();
    
    console.log('📊 Markdown converter initialized with three-database architecture');
    
    // Log database stats
    const rawCount = this.rawDb.prepare('SELECT COUNT(*) as count FROM raw_html').get().count;
    const mdCount = this.processedDb.prepare('SELECT COUNT(*) as count FROM markdown_content').get().count;
    console.log(`   Raw HTML records: ${rawCount}`);
    console.log(`   Markdown records: ${mdCount}`);
  }

  convertHtmlToMarkdown(html, metadata = {}) {
    try {
      // Clean HTML first
      let cleanedHtml = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<!--[\s\S]*?-->/g, '');

      // Convert to markdown
      let markdown = turndownService.turndown(cleanedHtml);

      // Add metadata header
      const header = `---\nurl: ${metadata.url || 'unknown'}\ncompany: ${metadata.company || 'unknown'}\nscraped_at: ${metadata.scraped_at || new Date().toISOString()}\n---\n\n`;

      markdown = header + markdown;

      // Clean up excessive whitespace
      markdown = markdown
        .replace(/\n{4,}/g, '\n\n\n')
        .replace(/[ \t]+$/gm, '')
        .trim();

      return markdown;
    } catch (error) {
      console.error('Error converting HTML to Markdown:', error);
      return null;
    }
  }

  async processRawHtml(rawHtmlId) {
    const rawHtml = this.rawDb.prepare(`
      SELECT * FROM raw_html
      WHERE id = ?
    `).get(rawHtmlId);

    if (!rawHtml) {
      throw new Error(`Raw HTML record ${rawHtmlId} not found`);
    }

    if (!rawHtml.html_content) {
      console.log(`⚠️  No HTML content for record ${rawHtmlId}`);
      return null;
    }

    console.log(`📝 Converting raw HTML ${rawHtmlId} to Markdown...`);
    console.log(`   Company: ${rawHtml.company_name}`);
    console.log(`   URL: ${rawHtml.url}`);
    console.log(`   HTML size: ${rawHtml.html_content.length} chars`);

    const markdown = this.convertHtmlToMarkdown(rawHtml.html_content, {
      url: rawHtml.url,
      company: rawHtml.company_name,
      scraped_at: rawHtml.scraped_at
    });

    if (!markdown) {
      console.log('   ❌ Conversion failed - no markdown generated');
      return null;
    }

    // Calculate markdown hash
    const markdownHash = crypto
      .createHash('sha256')
      .update(markdown)
      .digest('hex');

    // Check if already converted
    const existing = this.processedDb.prepare(`
      SELECT id FROM markdown_content WHERE raw_html_id = ?
    `).get(rawHtmlId);
    
    if (existing) {
      console.log(`   ⚠️  Already converted (ID: ${existing.id})`);
      return null;
    }

    try {
      // Store in processed_content database
      const stmt = this.processedDb.prepare(`
        INSERT INTO markdown_content (
          raw_html_id, url_id, company_name, url,
          markdown_text, markdown_hash, 
          processed_at
        ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `);

      const result = stmt.run(
        rawHtml.id,
        rawHtml.url_id,
        rawHtml.company_name,
        rawHtml.url,
        markdown,
        markdownHash
      );

      console.log(`   ✅ Converted to Markdown (${markdown.length} chars)`);
      console.log(`   ✅ Saved to database (ID: ${result.lastInsertRowid})`);
      
      // Verify it was saved
      const verify = this.processedDb.prepare('SELECT COUNT(*) as count FROM markdown_content').get();
      console.log(`   📊 Total markdown records now: ${verify.count}`);

      return {
        rawHtmlId,
        markdownLength: markdown.length,
        markdownHash,
        dbId: result.lastInsertRowid
      };
    } catch (error) {
      console.error(`   ❌ Database error:`, error.message);
      throw error;
    }
  }

  async processAllUnconverted() {
    console.log('🔄 Processing all unconverted HTML content...');

    // Need to attach processed_content database to raw database for cross-database query
    this.rawDb.exec(`ATTACH DATABASE '${this.processedDb.name}' AS processed_content`);

    // Find HTML that hasn't been converted yet
    const unconverted = this.rawDb.prepare(`
      SELECT rh.id 
      FROM raw_html rh
      LEFT JOIN processed_content.markdown_content mc ON rh.id = mc.raw_html_id
      WHERE mc.id IS NULL
      AND rh.html_content IS NOT NULL
      AND rh.error_message IS NULL
      ORDER BY rh.scraped_at DESC
    `).all();

    this.rawDb.exec('DETACH DATABASE processed_content');

    console.log(`Found ${unconverted.length} HTML records to convert`);

    let successCount = 0;
    let errorCount = 0;

    for (const { id } of unconverted) {
      try {
        const result = await this.processRawHtml(id);
        if (result) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        console.error(`Error processing HTML ${id}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n📊 Conversion Complete!\n✅ Success: ${successCount}\n❌ Errors: ${errorCount}\n`);
    
    // Final database check
    const finalCount = this.processedDb.prepare('SELECT COUNT(*) as count FROM markdown_content').get();
    console.log(`📊 Total markdown records in database: ${finalCount.count}`);

    return { successCount, errorCount, totalInDb: finalCount.count };
  }

  async processLatestForEachUrl() {
    console.log('🔄 Processing latest HTML for each URL...');

    // Need to attach processed_content database to raw database for cross-database query
    this.rawDb.exec(`ATTACH DATABASE '${this.processedDb.name}' AS processed_content`);

    // Get the latest successful scrape for each URL
    const latestScrapes = this.rawDb.prepare(`
      SELECT rh.id
      FROM raw_html rh
      INNER JOIN (
        SELECT url_id, MAX(scraped_at) as max_scraped_at
        FROM raw_html
        WHERE html_content IS NOT NULL
        AND error_message IS NULL
        GROUP BY url_id
      ) latest ON rh.url_id = latest.url_id 
        AND rh.scraped_at = latest.max_scraped_at
      LEFT JOIN processed_content.markdown_content mc ON rh.id = mc.raw_html_id
      WHERE mc.id IS NULL
    `).all();

    this.rawDb.exec('DETACH DATABASE processed_content');

    console.log(`Found ${latestScrapes.length} latest HTML records to convert`);

    let successCount = 0;
    for (const { id } of latestScrapes) {
      try {
        const result = await this.processRawHtml(id);
        if (result) successCount++;
      } catch (error) {
        console.error(`Error processing HTML ${id}:`, error.message);
      }
    }
    
    // Final database check
    const finalCount = this.processedDb.prepare('SELECT COUNT(*) as count FROM markdown_content').get();
    console.log(`\n✅ Processed ${successCount} URLs`);
    console.log(`📊 Total markdown records in database: ${finalCount.count}`);

    return successCount;
  }

  async processScrapingRun(runId) {
    console.log(`🔄 Processing all HTML from scraping run ${runId}...`);

    // Get all HTML from this scraping run
    const htmlRecords = this.rawDb.prepare(`
      SELECT rh.id
      FROM raw_html rh
      WHERE DATE(rh.scraped_at) = (
        SELECT DATE(started_at) 
        FROM scrape_runs 
        WHERE id = ?
      )
      AND rh.html_content IS NOT NULL
      AND rh.error_message IS NULL
      ORDER BY rh.scraped_at
    `).all(runId);

    console.log(`Found ${htmlRecords.length} HTML records from run ${runId}`);

    let successCount = 0;
    for (const { id } of htmlRecords) {
      try {
        const result = await this.processRawHtml(id);
        if (result) successCount++;
      } catch (error) {
        console.error(`Error processing HTML ${id}:`, error.message);
      }
    }

    return successCount;
  }

  close() {
    // Log final state before closing
    const finalCount = this.processedDb.prepare('SELECT COUNT(*) as count FROM markdown_content').get();
    console.log(`\n📊 Final state: ${finalCount.count} markdown records in database`);
    
    dbManager.closeAll();
  }
}

// Export for use in other modules
module.exports = MarkdownConverterThreeDB;

// Run if called directly
if (require.main === module) {
  const converter = new MarkdownConverterThreeDB();
  
  const mode = process.argv[2] || 'latest';
  const runId = process.argv[3];
  
  async function run() {
    try {
      converter.initialize();
      
      if (mode === 'all') {
        await converter.processAllUnconverted();
      } else if (mode === 'latest') {
        await converter.processLatestForEachUrl();
      } else if (mode === 'run' && runId) {
        await converter.processScrapingRun(parseInt(runId));
      } else if (mode && !isNaN(mode)) {
        // Process specific HTML ID
        await converter.processRawHtml(parseInt(mode));
      } else {
        console.log('Usage: node markdown-converter-three-db.js [all|latest|run <runId>|<html-id>]');
      }
    } catch (error) {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    } finally {
      converter.close();
    }
  }

  run().catch(console.error);
}
