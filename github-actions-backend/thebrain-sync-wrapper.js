#!/usr/bin/env node

/**
 * TheBrain Sync Wrapper - Enhanced
 * Provides multiple sync modes:
 * - sync: Normal sync (uses enhanced sync)
 * - fix: Fix disconnected thoughts
 * - export: Export only mode
 * - clean: Full clean sync (removes and recreates)
 */

const path = require('path');

async function main() {
  const mode = process.argv[2] || 'sync';
  
  console.log('🧠 TheBrain Sync Wrapper');
  console.log(`   Mode: ${mode}`);
  console.log(`   Environment: ${process.env.GITHUB_ACTIONS ? 'GitHub Actions' : 'Local'}`);
  console.log(`   Brain ID: ${process.env.THEBRAIN_BRAIN_ID || 'Not set'}\n`);
  
  try {
    switch (mode) {
      case 'sync':
        await runEnhancedSync();
        break;
        
      case 'fix':
        await runConnectionFixer();
        break;
        
      case 'export':
        await runExportOnly();
        break;
        
      case 'clean':
        await runCleanSync();
        break;
        
      case 'legacy':
        await runLegacySync();
        break;
        
      default:
        console.error(`Unknown mode: ${mode}`);
        console.log('Available modes:');
        console.log('  sync   - Enhanced sync with proper connections (default)');
        console.log('  fix    - Fix disconnected thoughts');
        console.log('  export - Export only (for manual import)');
        console.log('  clean  - Clean sync (removes and recreates)');
        console.log('  legacy - Use original sync method');
        process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ TheBrain sync error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

async function runEnhancedSync() {
  console.log('🚀 Running enhanced sync with proper connections...\n');
  
  try {
    const TheBrainEnhancedSync = require('./thebrain-sync-enhanced');
    const sync = new TheBrainEnhancedSync();
    await sync.syncToTheBrain();
    console.log('\n✅ Enhanced sync completed successfully!');
  } catch (error) {
    console.error('Enhanced sync failed, trying API sync...');
    await runAPISync();
  }
}

async function runConnectionFixer() {
  console.log('🔧 Running connection fixer...\n');
  
  const TheBrainConnectionFixer = require('./thebrain-fix-connections');
  const fixer = new TheBrainConnectionFixer();
  await fixer.fixConnections();
  console.log('\n✅ Connection fixing completed!');
}

async function runExportOnly() {
  console.log('📤 Running export only mode...\n');
  
  const TheBrainThreeDBIntegration = require('./thebrain-sync-three-db');
  const integration = new TheBrainThreeDBIntegration();
  
  await integration.setupDatabase();
  await integration.initialize();
  await integration.syncToTheBrain();
  
  console.log('\n✅ Export completed!');
  console.log('📁 Export file: github-actions-backend/data/thebrain-export-3db.json');
}

async function runCleanSync() {
  console.log('🧹 Running clean sync (this will recreate all thoughts)...\n');
  console.log('⚠️  WARNING: This mode is not yet implemented');
  console.log('   It would delete all existing thoughts and recreate them.');
  console.log('   Use "fix" mode instead to reconnect orphaned thoughts.');
}

async function runLegacySync() {
  console.log('📟 Running legacy sync...\n');
  
  const TheBrainThreeDBIntegration = require('./thebrain-sync-three-db');
  const integration = new TheBrainThreeDBIntegration();
  
  await integration.setupDatabase();
  const initialized = await integration.initialize();
  if (!initialized) {
    throw new Error('Failed to initialize TheBrain integration');
  }
  
  await integration.syncToTheBrain();
  console.log('\n✅ Legacy sync completed!');
}

async function runAPISync() {
  console.log('🌐 Trying API-based sync...\n');
  
  try {
    const TheBrainAPISync = require('./thebrain-api-sync');
    const apiSync = new TheBrainAPISync();
    
    const success = await apiSync.syncToTheBrain();
    if (success) {
      console.log('\n✅ API sync completed successfully!');
    } else {
      throw new Error('API sync returned false');
    }
  } catch (error) {
    console.log('API sync failed, falling back to export mode...');
    await runExportOnly();
  }
}

// Run main function
main();
