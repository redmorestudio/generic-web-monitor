#!/usr/bin/env node

require('dotenv').config();
const puppeteer = require('puppeteer');
const axios = require('axios');
const crypto = require('crypto');
const cheerio = require('cheerio');

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:3000/api';
const BATCH_SIZE = 5; // Process URLs in batches
const TIMEOUT = 30000; // 30 seconds per page

class IntelligentScraper {
  constructor() {
    this.browser = null;
    this.runId = null;
  }

  async initialize() {
    console.log('🚀 Starting Intelligent Scraper...');
    
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
    const runResponse = await axios.post(`${API_URL}/monitoring-runs`, {
      run_type: 'scraper',
      status: 'running'
    }).catch(() => ({ data: { id: Date.now() } })); // Fallback if endpoint doesn't exist yet
    
    this.runId = runResponse.data.id;
  }

  async shutdown() {
    if (this.browser) {
      await this.browser.close();
    }
    
    // Update monitoring run status
    if (this.runId) {
      await axios.put(`${API_URL}/monitoring-runs/${this.runId}`, {
        status: 'completed',
        completed_at: new Date().toISOString()
      }).catch(() => {});
    }
    
    console.log('✅ Scraper shutdown complete');
  }

  async scrapeAll() {
    try {
      // Get all enabled URLs
      const companiesResponse = await axios.get(`${API_URL}/companies`);
      const companies = companiesResponse.data.filter(c => c.enabled);
      
      console.log(`📊 Found ${companies.length} enabled companies`);
      
      let totalUrls = 0;
      let processedUrls = 0;
      let changesDetected = 0;
      
      // Process each company
      for (const company of companies) {
        console.log(`\n🏢 Processing ${company.name}...`);
        
        const companyDetailsResponse = await axios.get(`${API_URL}/companies/${company.id}`);
        const { urls } = companyDetailsResponse.data;
        
        const enabledUrls = urls.filter(u => u.enabled);
        totalUrls += enabledUrls.length;
        
        // Process URLs in batches
        for (let i = 0; i < enabledUrls.length; i += BATCH_SIZE) {
          const batch = enabledUrls.slice(i, i + BATCH_SIZE);
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
      
      console.log(`\n📈 Scraping Summary:`);
      console.log(`   Total URLs: ${totalUrls}`);
      console.log(`   Processed: ${processedUrls}`);
      console.log(`   Changes Detected: ${changesDetected}`);
      console.log(`   Success Rate: ${((processedUrls / totalUrls) * 100).toFixed(1)}%`);
      
    } catch (error) {
      console.error('❌ Scraping error:', error.message);
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
          url: window.location.href
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
      const historyResponse = await axios.get(
        `${API_URL}/urls/${urlConfig.id}/history?limit=1`
      );
      
      const latestSnapshot = historyResponse.data.snapshots[0];
      const hasChanged = !latestSnapshot || latestSnapshot.content_hash !== contentHash;
      
      if (hasChanged) {
        console.log(`      ✨ Change detected!`);
        
        // Store new snapshot
        const snapshotResponse = await axios.post(`${API_URL}/content-snapshots`, {
          url_id: urlConfig.id,
          content_hash: contentHash,
          full_content: fullHtml.substring(0, 500000), // Limit size
          extracted_content: extractedData.mainContent,
          title: extractedData.title,
          meta_description: extractedData.metaDescription
        });
        
        // Create change record if this isn't the first snapshot
        if (latestSnapshot) {
          const changeResponse = await axios.post(`${API_URL}/changes`, {
            url_id: urlConfig.id,
            old_snapshot_id: latestSnapshot.id,
            new_snapshot_id: snapshotResponse.data.id,
            keywords_found: JSON.stringify(keywordsFound)
          });
          
          console.log(`      📊 Change ID: ${changeResponse.data.id}`);
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
        await page.screenshot({ 
          path: `error-${Date.now()}.png`,
          fullPage: true 
        });
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
      const urlResponse = await axios.get(`${API_URL}/urls/${urlId}`);
      const urlConfig = urlResponse.data;
      
      // Get company details
      const companyResponse = await axios.get(`${API_URL}/companies/${urlConfig.company_id}`);
      const company = companyResponse.data;
      
      console.log(`🎯 Scraping single URL: ${urlConfig.url}`);
      const result = await this.scrapeUrl(urlConfig, company.name);
      
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
  const scraper = new IntelligentScraper();
  
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

module.exports = IntelligentScraper;
