#!/usr/bin/env node

// Only load dotenv in development (not in GitHub Actions)
if (!process.env.GITHUB_ACTIONS && !process.env.POSTGRES_CONNECTION_STRING) {
  try {
    require('dotenv').config();
  } catch (e) {
    // dotenv not available or no .env file - this is fine
  }
}
const puppeteer = require('puppeteer');
const crypto = require('crypto');
const Database = require('better-sqlite3');
const path = require('path');

// Configuration
const BATCH_SIZE = 5; // Process URLs in batches
const TIMEOUT = 30000; // 30 seconds per page

class IntelligentScraperDirect {
  constructor() {
    this.browser = null;
    this.runId = null;
    this.db = null;
  }

  async initialize() {
    console.log('🚀 Starting Intelligent Scraper (Direct Database Mode)...');
    
    // Open database connection
    const dbPath = path.join(__dirname, 'data', 'monitor.db');
    this.db = new Database(dbPath);
    this.db.pragma('foreign_keys = ON');
    
    // Launch Puppeteer
    this.browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });

    // Create monitoring run
    const stmt = this.db.prepare(`
      INSERT INTO monitoring_runs (run_type, status, started_at)
      VALUES ('scraper', 'running', datetime('now'))
    `);
    const result = stmt.run();
    this.runId = result.lastInsertRowid;
  }

  async shutdown() {
    if (this.browser) {
      await this.browser.close();
    }
    
    // Update monitoring run status
    if (this.runId && this.db) {
      const stmt = this.db.prepare(`
        UPDATE monitoring_runs 
        SET status = 'completed', completed_at = datetime('now')
        WHERE id = ?
      `);
      stmt.run(this.runId);
    }
    
    if (this.db) {
      this.db.close();
    }
    
    console.log('✅ Scraper shutdown complete');
  }

  async scrapeAll() {
    try {
      // Get all enabled companies and their URLs
      const companiesStmt = this.db.prepare(`
        SELECT c.*, COUNT(u.id) as url_count
        FROM companies c
        LEFT JOIN urls u ON c.id = u.company_id AND u.enabled = 1
        WHERE c.enabled = 1
        GROUP BY c.id
      `);
      const companies = companiesStmt.all();
      
      console.log(`📊 Found ${companies.length} enabled companies`);
      
      let totalUrls = 0;
      let processedUrls = 0;
      let changesDetected = 0;
      
      // Process each company
      for (const company of companies) {
        console.log(`\n🏢 Processing ${company.name}...`);
        
        const urlsStmt = this.db.prepare(`
          SELECT * FROM urls
          WHERE company_id = ? AND enabled = 1
        `);
        const urls = urlsStmt.all(company.id);
        
        totalUrls += urls.length;
        
        // Process URLs in batches
        for (let i = 0; i < urls.length; i += BATCH_SIZE) {
          const batch = urls.slice(i, i + BATCH_SIZE);
          const results = await Promise.all(
            batch.map(url => this.scrapeUrl(url, company.name))
          );
          
          for (const result of results) {
            if (result.success) {
              processedUrls++;
              if (result.changed) {
                changesDetected++;
              }
            }
          }
        }
      }
      
      // Update monitoring run stats
      const updateStmt = this.db.prepare(`
        UPDATE monitoring_runs 
        SET urls_checked = ?, changes_detected = ?
        WHERE id = ?
      `);
      updateStmt.run(processedUrls, changesDetected, this.runId);
      
      console.log(`\n📈 Scraping Summary:`);
      console.log(`   Total URLs: ${totalUrls}`);
      console.log(`   Processed: ${processedUrls}`);
      console.log(`   Changes Detected: ${changesDetected}`);
      console.log(`   Success Rate: ${((processedUrls / totalUrls) * 100).toFixed(1)}%`);
      
    } catch (error) {
      console.error('❌ Scraping error:', error.message);
      
      // Log error to monitoring run
      if (this.runId && this.db) {
        const errorStmt = this.db.prepare(`
          UPDATE monitoring_runs 
          SET errors = ?, status = 'failed'
          WHERE id = ?
        `);
        errorStmt.run(error.message, this.runId);
      }
      
      throw error;
    }
  }

  async scrapeUrl(urlConfig, companyName) {
    const page = await this.browser.newPage();
    
    try {
      console.log(`   📄 Scraping ${urlConfig.url}...`);
      
      // Set user agent to avoid bot detection
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      // Navigate to URL with timeout
      await page.goto(urlConfig.url, {
        waitUntil: 'networkidle2',
        timeout: TIMEOUT
      });
      
      // Wait a bit for dynamic content
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Extract content using CSS selectors
      const cssSelectors = JSON.parse(urlConfig.css_selectors || '["main", "article", ".content", "[role=main]"]');
      
      const extractedData = await page.evaluate((selectors) => {
        // Helper function to extract text content
        const extractText = (element) => {
          // Skip script and style tags
          const cloned = element.cloneNode(true);
          const scripts = cloned.querySelectorAll('script, style, noscript');
          scripts.forEach(el => el.remove());
          
          return cloned.textContent.trim()
            .replace(/\s+/g, ' ')
            .replace(/\n{3,}/g, '\n\n');
        };
        
        // Try each selector until we find content
        let mainContent = '';
        for (const selector of selectors) {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            mainContent = Array.from(elements)
              .map(el => extractText(el))
              .join('\n\n');
            if (mainContent.length > 100) break; // Found substantial content
          }
        }
        
        // Fallback to body if no selectors matched
        if (mainContent.length < 100) {
          mainContent = extractText(document.body);
        }
        
        // Extract metadata
        const title = document.title || '';
        const metaDescription = document.querySelector('meta[name="description"]')?.content ||
                               document.querySelector('meta[property="og:description"]')?.content || '';
        
        // Get all text content for keyword matching
        const fullText = document.body.innerText || document.body.textContent || '';
        
        return {
          title,
          metaDescription,
          mainContent,
          fullText,
          url: window.location.href,
          wordCount: mainContent.split(/\s+/).length,
          charCount: mainContent.length
        };
      }, cssSelectors);
      
      // Get full HTML for complete storage
      const fullHtml = await page.content();
      
      // Calculate content hash
      const contentHash = crypto
        .createHash('sha256')
        .update(extractedData.mainContent)
        .digest('hex');
      
      // Check for keywords
      const keywords = JSON.parse(urlConfig.keywords || '[]');
      const keywordsFound = keywords.filter(keyword => 
        extractedData.fullText.toLowerCase().includes(keyword.toLowerCase())
      );
      
      // Get latest snapshot for comparison
      const latestSnapshotStmt = this.db.prepare(`
        SELECT * FROM content_snapshots
        WHERE url_id = ?
        ORDER BY created_at DESC
        LIMIT 1
      `);
      const latestSnapshot = latestSnapshotStmt.get(urlConfig.id);
      
      const hasChanged = !latestSnapshot || latestSnapshot.content_hash !== contentHash;
      
      if (hasChanged) {
        console.log(`      ✨ Change detected!`);
        
        // Store new snapshot
        const insertSnapshotStmt = this.db.prepare(`
          INSERT INTO content_snapshots (
            url_id, content_hash, full_content, extracted_content,
            title, meta_description, word_count, char_count
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        const snapshotResult = insertSnapshotStmt.run(
          urlConfig.id,
          contentHash,
          fullHtml.substring(0, 500000), // Limit size
          extractedData.mainContent,
          extractedData.title,
          extractedData.metaDescription,
          extractedData.wordCount,
          extractedData.charCount
        );
        
        const newSnapshotId = snapshotResult.lastInsertRowid;
        
        // Create change record if this isn't the first snapshot
        if (latestSnapshot) {
          // Calculate change percentage
          const oldWords = latestSnapshot.extracted_content.split(/\s+/).length;
          const newWords = extractedData.wordCount;
          const changePercentage = Math.abs(((newWords - oldWords) / oldWords) * 100);
          
          const insertChangeStmt = this.db.prepare(`
            INSERT INTO changes (
              url_id, old_snapshot_id, new_snapshot_id,
              change_percentage, keywords_found
            ) VALUES (?, ?, ?, ?, ?)
          `);
          
          const changeResult = insertChangeStmt.run(
            urlConfig.id,
            latestSnapshot.id,
            newSnapshotId,
            changePercentage,
            JSON.stringify(keywordsFound)
          );
          
          console.log(`      📊 Change ID: ${changeResult.lastInsertRowid}`);
          console.log(`      📈 Change: ${changePercentage.toFixed(1)}%`);
          console.log(`      🔍 Keywords found: ${keywordsFound.join(', ') || 'none'}`);
        }
      } else {
        console.log(`      ✓ No changes detected`);
      }
      
      await page.close();
      
      return {
        success: true,
        changed: hasChanged,
        url: urlConfig.url
      };
      
    } catch (error) {
      console.error(`      ❌ Error scraping ${urlConfig.url}:`, error.message);
      
      // Take screenshot for debugging
      try {
        const screenshotPath = `error-${Date.now()}.png`;
        await page.screenshot({ 
          path: screenshotPath,
          fullPage: true 
        });
        console.log(`      📸 Screenshot saved: ${screenshotPath}`);
      } catch (screenshotError) {
        // Ignore screenshot errors
      }
      
      await page.close();
      
      return {
        success: false,
        changed: false,
        url: urlConfig.url,
        error: error.message
      };
    }
  }

  async scrapeSingle(urlId) {
    try {
      // Get URL details
      const urlStmt = this.db.prepare(`
        SELECT u.*, c.name as company_name
        FROM urls u
        JOIN companies c ON u.company_id = c.id
        WHERE u.id = ?
      `);
      const urlConfig = urlStmt.get(urlId);
      
      if (!urlConfig) {
        throw new Error(`URL with ID ${urlId} not found`);
      }
      
      console.log(`🎯 Scraping single URL: ${urlConfig.url}`);
      const result = await this.scrapeUrl(urlConfig, urlConfig.company_name);
      
      return result;
    } catch (error) {
      console.error('❌ Error in single scrape:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Main execution
async function main() {
  const scraper = new IntelligentScraperDirect();
  
  try {
    await scraper.initialize();
    
    // Check if specific URL ID was provided
    const urlId = process.argv[2];
    
    if (urlId) {
      // Scrape single URL
      await scraper.scrapeSingle(urlId);
    } else {
      // Scrape all URLs
      await scraper.scrapeAll();
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await scraper.shutdown();
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Run the scraper
if (require.main === module) {
  main();
}

module.exports = IntelligentScraperDirect;
