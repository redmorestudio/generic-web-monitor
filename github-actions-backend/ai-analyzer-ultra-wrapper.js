#!/usr/bin/env node

require('dotenv').config();
const dbManager = require('./db-manager');

// Configuration
const USE_THREE_DB = process.env.USE_THREE_DB !== 'false'; // Default to true

async function main() {
  console.log('🚀 Ultra-Enhanced AI Analyzer Starting...');
  console.log(`   Architecture: ${USE_THREE_DB ? 'Three-Database' : 'Legacy'}`);
  console.log(`   Environment: ${process.env.GITHUB_ACTIONS === 'true' ? 'GitHub Actions' : 'Local'}`);
  console.log(`   Features: Entity extraction, relationships, automatic grouping`);
  
  const command = process.argv[2] || 'analyze';
  
  let analyzer;
  
  if (USE_THREE_DB) {
    // Check if three-database architecture exists
    if (!dbManager.hasThreeDbArchitecture()) {
      console.error('❌ Three-database architecture not found!');
      console.error('   Please run the scraper and processor first.');
      process.exit(1);
    }
    
    // Use three-database analyzer
    console.log('   ✅ Using three-database ultra-enhanced analyzer');
    analyzer = require('./ai-analyzer-ultra-enhanced-three-db.js');
  } else {
    // Use legacy analyzer
    console.log('   ⚠️  Using legacy ultra-enhanced analyzer (monitor.db)');
    analyzer = require('./ai-analyzer-ultra-enhanced.js');
  }
  
  const {
    analyzeWithEnhancedExtraction,
    storeEnhancedAnalysis,
    generateSmartGroupReport,
    processRecentChanges
  } = analyzer;
  
  try {
    switch (command) {
      case 'analyze':
      case 'full':
        // Process recent changes with enhanced extraction
        await processRecentChanges();
        
        // Generate smart group report
        const report = await generateSmartGroupReport();
        console.log('\n📊 Analysis complete!');
        console.log(`   Entities discovered: ${Object.values(report.entities).reduce((sum, arr) => sum + arr.length, 0)}`);
        console.log(`   Smart groups: ${Object.keys(report.groups).length}`);
        console.log(`   Top themes: ${Object.keys(report.themes).slice(0, 3).join(', ')}`);
        break;
        
      case 'report':
        // Just generate the report
        const reportOnly = await generateSmartGroupReport();
        console.log('\n📊 Smart Groups Report Generated:');
        console.log(JSON.stringify(reportOnly, null, 2));
        break;
        
      default:
        console.log('Unknown command:', command);
        console.log('Usage: node ai-analyzer-ultra-wrapper.js [analyze|report|full]');
        process.exit(1);
    }
    
    console.log('\n✅ Ultra-enhanced analysis complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
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
