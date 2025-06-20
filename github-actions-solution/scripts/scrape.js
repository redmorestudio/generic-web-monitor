// scripts/scrape.js
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

// Import configuration
const config = require('./config.json');

async function scrapeAllCompetitors() {
  console.log('🚀 Starting competitor scraping...');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const results = [];
  const timestamp = new Date().toISOString();
  
  try {
    for (const company of config.companies) {
      console.log(`\n📊 Processing ${company.name}...`);
      
      for (const urlConfig of company.urls) {
        try {
          console.log(`  🔍 Scraping ${urlConfig.type}: ${urlConfig.url}`);
          
          const page = await browser.newPage();
          await page.setUserAgent('Mozilla/5.0 (compatible; AI-Monitor/1.0)');
          
          // Navigate with timeout
          await page.goto(urlConfig.url, { 
            waitUntil: 'networkidle2',
            timeout: 30000 
          });
          
          // Extract content
          const content = await page.evaluate(() => {
            // Remove scripts and styles
            const scripts = document.querySelectorAll('script, style');
            scripts.forEach(s => s.remove());
            
            return {
              title: document.title,
              text: document.body.innerText,
              html: document.documentElement.outerHTML,
              meta: {
                description: document.querySelector('meta[name="description"]')?.content,
                keywords: document.querySelector('meta[name="keywords"]')?.content
              }
            };
          });
          
          // Calculate content hash
          const crypto = require('crypto');
          const contentHash = crypto
            .createHash('md5')
            .update(content.text)
            .digest('hex');
          
          results.push({
            timestamp,
            company: company.name,
            url: urlConfig.url,
            type: urlConfig.type,
            contentHash,
            contentLength: content.text.length,
            title: content.title,
            content: content.text.substring(0, 5000), // First 5k chars
            fullContent: content.text,
            meta: content.meta,
            success: true
          });
          
          await page.close();
          
          // Be respectful with delays
          await new Promise(resolve => setTimeout(resolve, 2000));
          
        } catch (error) {
          console.error(`  ❌ Failed to scrape ${urlConfig.url}:`, error.message);
          results.push({
            timestamp,
            company: company.name,
            url: urlConfig.url,
            type: urlConfig.type,
            error: error.message,
            success: false
          });
        }
      }
    }
    
  } finally {
    await browser.close();
  }
  
  // Save raw scraped data
  const dataDir = path.join(__dirname, '..', 'data', 'raw');
  await fs.mkdir(dataDir, { recursive: true });
  
  const filename = `scrape-${timestamp.split('T')[0]}-${Date.now()}.json`;
  await fs.writeFile(
    path.join(dataDir, filename),
    JSON.stringify(results, null, 2)
  );
  
  // Also save as latest
  await fs.writeFile(
    path.join(dataDir, 'latest.json'),
    JSON.stringify(results, null, 2)
  );
  
  console.log(`\n✅ Scraping complete! ${results.length} URLs processed`);
  console.log(`📁 Data saved to data/raw/${filename}`);
  
  return results;
}

// Run if called directly
if (require.main === module) {
  scrapeAllCompetitors()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { scrapeAllCompetitors };
