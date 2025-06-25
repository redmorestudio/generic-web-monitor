#!/usr/bin/env node

require('dotenv').config();

// Check if we're using the three-database architecture
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
const hasThreeDB = fs.existsSync(path.join(dataDir, 'intelligence.db'));

// Use appropriate integration based on architecture
let TheBrainIntegration;
if (hasThreeDB) {
  console.log('🎯 Detected three-database architecture');
  // Use the enhanced version for three databases
  TheBrainIntegration = require('./thebrain-sync-enhanced-three-db.js');
} else {
  console.log('📦 Detected single-database architecture');
  // Use the enhanced version for single database
  TheBrainIntegration = require('./thebrain-sync-enhanced-single-db.js');
}

async function main() {
  console.log('🧠 TheBrain Sync Starting...');
  console.log(`   Environment: ${process.env.GITHUB_ACTIONS === 'true' ? 'GitHub Actions' : 'Local'}`);
  console.log(`   Brain ID: ${process.env.THEBRAIN_BRAIN_ID || 'Not configured'}`);
  console.log(`   Architecture: ${hasThreeDB ? 'Three-Database (Enhanced)' : 'Single-Database (Enhanced)'}`);
  
  // Check if TheBrain credentials are available
  if (!process.env.THEBRAIN_API_KEY) {
    console.log('⚠️  Warning: TheBrain API key not found in environment');
    console.log('   Skipping TheBrain sync...');
    return;
  }
  
  const command = process.argv[2] || 'sync';
  
  try {
    const integration = new TheBrainIntegration();
    
    // Setup database
    await integration.setupDatabase();
    
    // Initialize connection
    const initialized = await integration.initialize();
    if (!initialized) {
      console.error('Failed to initialize TheBrain integration');
      // Don't exit with error - TheBrain sync is optional
      return;
    }
    
    // Both versions support the same interface
    switch (command) {
      case 'sync':
      case 'full':
        await integration.syncToTheBrain();
        break;
        
      case 'export':
        await integration.exportToTheBrainFormat();
        break;
        
      default:
        console.log('Unknown command:', command);
        console.log('Usage:');
        console.log('  node thebrain-sync-wrapper.js sync    - Full sync with visualization');
        console.log('  node thebrain-sync-wrapper.js export  - Export to TheBrain format');
        return;
    }
    
    console.log('✅ TheBrain sync complete!');
    
  } catch (error) {
    console.error('❌ TheBrain sync error:', error);
    // Don't exit with error in GitHub Actions - TheBrain sync is optional
    if (process.env.GITHUB_ACTIONS !== 'true') {
      process.exit(1);
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
  // Don't exit with error in GitHub Actions - TheBrain sync is optional
  if (process.env.GITHUB_ACTIONS !== 'true') {
    process.exit(1);
  }
});
