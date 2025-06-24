#!/usr/bin/env node

require('dotenv').config();
const axios = require('axios');

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:3000/api';
const IS_GITHUB_ACTIONS = process.env.GITHUB_ACTIONS === 'true';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const USE_THREE_DB = process.env.USE_THREE_DB !== 'false'; // Default to true

async function checkServerAvailable() {
  if (IS_GITHUB_ACTIONS || IS_PRODUCTION) {
    // In GitHub Actions or production, always use direct mode
    return false;
  }
  
  try {
    // Try to connect to the API server
    await axios.get(`${API_URL}/health`, { timeout: 2000 });
    return true;
  } catch (error) {
    return false;
  }
}

async function main() {
  console.log('🔍 AI Monitor Scraper Starting...');
  console.log(`   Environment: ${IS_GITHUB_ACTIONS ? 'GitHub Actions' : 'Local'}`);
  console.log(`   Mode: ${IS_PRODUCTION ? 'Production' : 'Development'}`);
  console.log(`   Architecture: ${USE_THREE_DB ? 'Three-Database' : 'Legacy'}`);
  
  const serverAvailable = await checkServerAvailable();
  
  if (serverAvailable) {
    console.log('   ✅ API server detected - using API mode');
    // Use the original API-based scraper
    const IntelligentScraper = require('./scraper.js');
    const scraper = new IntelligentScraper();
    
    try {
      await scraper.initialize();
      
      const urlId = process.argv[2];
      if (urlId) {
        await scraper.scrapeSingle(urlId);
      } else {
        await scraper.scrapeAll();
      }
    } finally {
      await scraper.shutdown();
    }
  } else {
    console.log('   🔄 No API server - using direct database mode');
    
    // Choose between three-database and legacy scraper
    const ScraperClass = USE_THREE_DB 
      ? require('./scraper-three-db.js')
      : require('./scraper-direct.js');
      
    const scraper = new ScraperClass();
    
    try {
      await scraper.initialize();
      
      const urlId = process.argv[2];
      if (urlId) {
        await scraper.scrapeSingle(urlId);
      } else {
        await scraper.scrapeAll();
      }
    } finally {
      await scraper.shutdown();
    }
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

// Run the main function
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
