#!/usr/bin/env node

require('dotenv').config();
const puppeteer = require('puppeteer');
const crypto = require('crypto');
const path = require('path');
const dbManager = require('./db-manager');

// Configuration
const BATCH_SIZE = 5; // Process 5 URLs concurrently
const PAGE_TIMEOUT = 30000; // 30 seconds per page
const RATE_LIMIT_DELAY = 500; // 500ms between batch starts
const MAX_RETRIES = 2; // Retry failed URLs

class IntelligentScraperThreeDB {
  constructor() {
    this.browser = null;
    this.runId = null;
    this.rawDb = null;
    this.intelligenceDb = null;
    this.startTime = null;
  }

  async initialize() {
    console.log('🚀 Starting Intelligent Scraper (Three-Database Architecture)...');
    this.startTime = Date.now();
    
    // Check if three-database architecture exists
    if (!dbManager.hasThreeDbArchitecture()) {
      console.log('📊 Creating three-database architecture...');
      require('./scripts/create-three-dbs');
    }
    
    // Get database connections
    this.rawDb = dbManager.getRawDb();
    this.intelligenceDb = dbManager.getIntelligenceDb();
    
    // Launch Puppeteer with optimized settings
    this.browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-blink-features=AutomationControlled'
      ]
    });

    // Create scraping run record
    const stmt = this.rawDb.prepare(`
      INSERT INTO scrape_runs (status, started_at)
      VALUES ('running', datetime('now'))
    `);
    const result = stmt.run();
    this.runId = result.lastInsertRowid;
    
    console.log(`📊 Scrape run ID: ${this.runId}`);
  }

  async shutdown() {
    if (this.browser) {
      await this.browser.close();
    }
    
    // Update scraping run status
    if (this.runId && this.rawDb) {
      const stmt = this.rawDb.prepare(`
        UPDATE scrape_runs 
        SET status = 'completed', completed_at = datetime('now')
        WHERE id = ?
      `);
      stmt.run(this.runId);
    }
    
    // Close database connections
    dbManager.closeAll();
    
    const duration = ((Date.now() - this.startTime) / 1000 / 60).toFixed(1);
    console.log(`✅ Scraper shutdown complete (took ${duration} minutes)`);
  }

  async scrapeAll() {
    try {
      // Get all companies and their URLs from intelligence database
      const companiesStmt = this.intelligenceDb.prepare(`
        SELECT c.*, COUNT(u.id) as url_count
        FROM companies c
        LEFT JOIN urls u ON c.id = u.company_id
        GROUP BY c.id
        ORDER BY c.name
      `);
      const companies = companiesStmt.all();
      
      console.log(`📊 Found ${companies.length} companies to monitor`);
      
      // Collect all URLs with company info
      const allUrls = [];
      for (const company of companies) {
        const urlsStmt = this.intelligenceDb.prepare(`
          SELECT * FROM urls WHERE company_id = ?
        `);
        const urls = urlsStmt.all(company.id);
        
        urls.forEach(url => {
          allUrls.push({
            ...url,
            companyName: company.name
          });
        });
      }
      
      console.log(`📊 Total URLs to scrape: ${allUrls.length}`);
      
      let processedUrls = 0;
      let changesDetected = 0;
      let errors = 0;
      
      // Process URLs in batches
      for (let i = 0; i < allUrls.length; i += BATCH_SIZE) {
        const batch = allUrls.slice(i, i + BATCH_SIZE);
        const batchNum = Math.floor(i / BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(allUrls.length / BATCH_SIZE);
        
        console.log(`\n🔄 Processing batch ${batchNum}/${totalBatches} (${batch.length} URLs)...`);
        
        // Process batch concurrently
        const results = await Promise.all(
          batch.map(url => this.scrapeUrlWithRetry(url, url.companyName))
        );
        
        // Count results
        results.forEach(result => {
          if (result.success) {
            processedUrls++;
            if (result.changed) {
              changesDetected++;
            }
          } else {
            errors++;
          }
        });
        
        // Progress update
        const progress = ((i + batch.length) / allUrls.length * 100).toFixed(1);
        console.log(`   Progress: ${progress}% complete`);
        
        // Small delay between batches to prevent overwhelming targets
        if (i + BATCH_SIZE < allUrls.length) {
          await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
        }
      }
      
      // Update scraping run stats
      const updateStmt = this.rawDb.prepare(`
        UPDATE scrape_runs 
        SET urls_processed = ?, urls_changed = ?, errors_count = ?
        WHERE id = ?
      `);
      updateStmt.run(processedUrls, changesDetected, errors, this.runId);
      
      console.log(`\n📈 Scraping Summary:`);
      console.log(`   Total URLs: ${allUrls.length}`);
      console.log(`   Processed: ${processedUrls}`);
      console.log(`   Changes Detected: ${changesDetected}`);
      console.log(`   Errors: ${errors}`);
      console.log(`   Success Rate: ${((processedUrls / allUrls.length) * 100).toFixed(1)}%`);
      
    } catch (error) {
      console.error('❌ Scraping error:', error.message);
      
      // Update run status to failed
      if (this.runId && this.rawDb) {
        const errorStmt = this.rawDb.prepare(`
          UPDATE scrape_runs 
          SET status = 'failed'
          WHERE id = ?
        `);
        errorStmt.run(this.runId);
      }
      
      throw error;
    }
  }

  async scrapeUrlWithRetry(urlConfig, companyName, retryCount = 0) {
    try {
      return await this.scrapeUrl(urlConfig, companyName);
    } catch (error) {
      if (retryCount < MAX_RETRIES) {
        console.log(`      ⚠️ Retrying ${urlConfig.url} (attempt ${retryCount + 2}/${MAX_RETRIES + 1})...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.scrapeUrlWithRetry(urlConfig, companyName, retryCount + 1);
      }
      return {
        success: false,
        changed: false,
        url: urlConfig.url,
        error: error.message
      };
    }
  }

  async scrapeUrl(urlConfig, companyName) {
    const page = await this.browser.newPage();
    
    try {
      console.log(`   📄 [${companyName}] ${urlConfig.url}`);
      
      // Set user agent to avoid bot detection
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      // Set viewport
      await page.setViewport({ width: 1920, height: 1080 });
      
      // Navigate to URL with timeout
      const response = await page.goto(urlConfig.url, {
        waitUntil: 'networkidle2',
        timeout: PAGE_TIMEOUT
      });
      
      const statusCode = response.status();
      
      // Wait a bit for dynamic content (reduced from 2000ms)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get full HTML content
      const htmlContent = await page.content();
      
      // Calculate content hash
      const contentHash = crypto
        .createHash('sha256')
        .update(htmlContent)
        .digest('hex');
      
      // Check if content has changed
      const latestStmt = this.rawDb.prepare(`
        SELECT content_hash FROM raw_html
        WHERE url_id = ?
        ORDER BY scraped_at DESC
        LIMIT 1
      `);
      const latest = latestStmt.get(urlConfig.id);
      
      const hasChanged = !latest || latest.content_hash !== contentHash;
      
      // Always store the raw HTML (even if unchanged, for completeness)
      const insertStmt = this.rawDb.prepare(`
        INSERT INTO raw_html (
          url_id, company_name, url, content_hash, html_content,
          status_code, scraped_at
        ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `);
      
      insertStmt.run(
        urlConfig.id,
        companyName,
        urlConfig.url,
        contentHash,
        htmlContent,
        statusCode
      );
      
      if (hasChanged) {
        console.log(`      ✨ Change detected!`);
      }
      
      await page.close();
      
      return {
        success: true,
        changed: hasChanged,
        url: urlConfig.url
      };
      
    } catch (error) {
      console.error(`      ❌ Error: ${error.message.split('\n')[0]}`);
      
      // Store error in database
      const errorStmt = this.rawDb.prepare(`
        INSERT INTO raw_html (
          url_id, company_name, url, status_code, error_message,
          scraped_at
        ) VALUES (?, ?, ?, ?, ?, datetime('now'))
      `);
      
      errorStmt.run(
        urlConfig.id,
        companyName,
        urlConfig.url,
        0,
        error.message
      );
      
      await page.close();
      
      throw error;
    }
  }

  async scrapeSingle(urlId) {
    try {
      // Get URL details from intelligence database
      const urlStmt = this.intelligenceDb.prepare(`
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
      const result = await this.scrapeUrlWithRetry(urlConfig, urlConfig.company_name);
      
      // Update scraping run stats
      if (this.runId) {
        const updateStmt = this.rawDb.prepare(`
          UPDATE scrape_runs 
          SET urls_processed = 1, 
              urls_changed = ?,
              errors_count = ?
          WHERE id = ?
        `);
        updateStmt.run(
          result.changed ? 1 : 0,
          result.success ? 0 : 1,
          this.runId
        );
      }
      
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

// Export the class
module.exports = IntelligentScraperThreeDB;

// Main execution if run directly
if (require.main === module) {
  async function main() {
    const scraper = new IntelligentScraperThreeDB();
    
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
  main();
}
