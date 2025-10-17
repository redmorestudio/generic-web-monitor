const TurndownService = require('turndown');
const Database = require('better-sqlite3');
const path = require('path');
const crypto = require('crypto');
// Only load dotenv in development (not in GitHub Actions)
if (!process.env.GITHUB_ACTIONS && !process.env.POSTGRES_CONNECTION_STRING) {
  try {
    // Only load dotenv in development (not in GitHub Actions)
if (!process.env.GITHUB_ACTIONS && !process.env.POSTGRES_CONNECTION_STRING) {
  try {
    require('dotenv').config();
  } catch (e) {
    // dotenv not available or no .env file - this is fine
  }
}
  } catch (e) {
    // dotenv not available or no .env file - this is fine
  }
}

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

class MarkdownConverter {
  constructor() {
    const dbPath = path.join(__dirname, 'data', 'monitor.db');
    this.db = new Database(dbPath);
    this.initDatabase();
  }

  initDatabase() {
    // Add markdown columns if they don't exist
    try {
      this.db.exec(`
        ALTER TABLE content_snapshots 
        ADD COLUMN markdown_content TEXT
      `);
    } catch (e) {
      // Column might already exist
    }

    try {
      this.db.exec(`
        ALTER TABLE content_snapshots 
        ADD COLUMN markdown_hash TEXT
      `);
    } catch (e) {
      // Column might already exist
    }

    try {
      this.db.exec(`
        ALTER TABLE content_snapshots 
        ADD COLUMN processing_status TEXT DEFAULT 'scraped'
      `);
    } catch (e) {
      // Column might already exist
    }
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
      const header = `---
url: ${metadata.url || 'unknown'}
company: ${metadata.company || 'unknown'}
type: ${metadata.type || 'unknown'}
scraped_at: ${metadata.scraped_at || new Date().toISOString()}
---

`;

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

  async processSnapshot(snapshotId) {
    const snapshot = this.db.prepare(`
      SELECT cs.*, u.url, u.type as url_type, c.name as company_name
      FROM content_snapshots cs
      JOIN urls u ON cs.url_id = u.id
      JOIN companies c ON u.company_id = c.id
      WHERE cs.id = ?
    `).get(snapshotId);

    if (!snapshot) {
      throw new Error(`Snapshot ${snapshotId} not found`);
    }

    if (!snapshot.full_content) {
      console.log(`⚠️  No HTML content for snapshot ${snapshotId}`);
      return null;
    }

    console.log(`📝 Converting snapshot ${snapshotId} to Markdown...`);

    const markdown = this.convertHtmlToMarkdown(snapshot.full_content, {
      url: snapshot.url,
      company: snapshot.company_name,
      type: snapshot.url_type,
      scraped_at: snapshot.created_at
    });

    if (!markdown) {
      return null;
    }

    // Calculate markdown hash
    const markdownHash = crypto
      .createHash('sha256')
      .update(markdown)
      .digest('hex');

    // Update snapshot with markdown
    const stmt = this.db.prepare(`
      UPDATE content_snapshots
      SET markdown_content = ?,
          markdown_hash = ?,
          processing_status = 'converted'
      WHERE id = ?
    `);

    stmt.run(markdown, markdownHash, snapshotId);

    console.log(`✅ Converted to Markdown (${markdown.length} chars)`);

    return {
      snapshotId,
      markdownLength: markdown.length,
      markdownHash
    };
  }

  async processAllUnconverted() {
    console.log('🔄 Processing all unconverted snapshots...');

    const unconverted = this.db.prepare(`
      SELECT id 
      FROM content_snapshots
      WHERE markdown_content IS NULL
      AND full_content IS NOT NULL
      ORDER BY created_at DESC
    `).all();

    console.log(`Found ${unconverted.length} snapshots to convert`);

    let successCount = 0;
    let errorCount = 0;

    for (const { id } of unconverted) {
      try {
        const result = await this.processSnapshot(id);
        if (result) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        console.error(`Error processing snapshot ${id}:`, error.message);
        errorCount++;
      }
    }

    console.log(`
📊 Conversion Complete!
✅ Success: ${successCount}
❌ Errors: ${errorCount}
`);

    return { successCount, errorCount };
  }

  async processLatestSnapshots() {
    console.log('🔄 Processing latest snapshots for each URL...');

    const latestSnapshots = this.db.prepare(`
      SELECT cs.id
      FROM content_snapshots cs
      WHERE cs.id IN (
        SELECT MAX(id) 
        FROM content_snapshots 
        GROUP BY url_id
      )
      AND cs.markdown_content IS NULL
      AND cs.full_content IS NOT NULL
    `).all();

    console.log(`Found ${latestSnapshots.length} latest snapshots to convert`);

    let successCount = 0;
    for (const { id } of latestSnapshots) {
      try {
        const result = await this.processSnapshot(id);
        if (result) successCount++;
      } catch (error) {
        console.error(`Error processing snapshot ${id}:`, error.message);
      }
    }

    return successCount;
  }

  close() {
    this.db.close();
  }
}

// Export for use in other modules
module.exports = MarkdownConverter;

// Run if called directly
if (require.main === module) {
  const converter = new MarkdownConverter();
  
  const mode = process.argv[2] || 'latest';
  
  async function run() {
    try {
      if (mode === 'all') {
        await converter.processAllUnconverted();
      } else if (mode === 'latest') {
        await converter.processLatestSnapshots();
      } else if (mode && !isNaN(mode)) {
        // Process specific snapshot ID
        await converter.processSnapshot(parseInt(mode));
      } else {
        console.log('Usage: node markdown-converter.js [all|latest|<snapshot-id>]');
      }
    } finally {
      converter.close();
    }
  }

  run().catch(console.error);
}
