#!/usr/bin/env node

require('dotenv').config();
const dbManager = require('./db-manager');

// Configuration
const USE_THREE_DB = process.env.USE_THREE_DB !== 'false'; // Default to true

async function main() {
  console.log('🧠 AI Baseline Analyzer Starting...');
  console.log(`   Architecture: ${USE_THREE_DB ? 'Three-Database' : 'Legacy'}`);
  
  if (USE_THREE_DB) {
    // Check if three-database architecture exists
    if (!dbManager.hasThreeDbArchitecture()) {
      console.error('❌ Three-database architecture not found!');
      console.error('   Please run the scraper first to create the databases.');
      process.exit(1);
    }
    
    // Use three-database analyzer
    console.log('   ✅ Using three-database analyzer');
    const analyzer = require('./ai-analyzer-baseline-three-db.js');
    
    try {
      const report = await analyzer.processAllSnapshots();
      console.log('\n✅ Analysis complete!');
      process.exit(0);
    } catch (error) {
      console.error('❌ Analysis failed:', error);
      process.exit(1);
    }
  } else {
    // Use legacy analyzer
    console.log('   ⚠️  Using legacy analyzer (monitor.db)');
    const analyzer = require('./ai-analyzer-baseline.js');
    
    try {
      const report = await analyzer.processAllSnapshots();
      console.log('\n✅ Analysis complete!');
      process.exit(0);
    } catch (error) {
      console.error('❌ Analysis failed:', error);
      process.exit(1);
    }
  }
}

// Run the main function
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
