#!/usr/bin/env node

require('dotenv').config();

// Choose between advanced relationship mode and standard mode
const useAdvancedMode = process.argv.includes('--advanced') || process.env.THEBRAIN_ADVANCED_MODE === 'true';

async function main() {
  console.log('🧠 TheBrain Sync Starting...');
  console.log(`   Mode: ${useAdvancedMode ? 'Advanced Relationships' : 'Standard'}`);
  console.log(`   Brain ID: ${process.env.THEBRAIN_BRAIN_ID || 'Not configured'}`);
  
  // Check if TheBrain credentials are available
  if (!process.env.THEBRAIN_API_KEY) {
    console.log('⚠️  Warning: TheBrain API key not found in environment');
    console.log('   Skipping TheBrain sync...');
    return;
  }

  const command = process.argv[2] || 'sync';
  
  try {
    let integration;
    
    if (useAdvancedMode) {
      // Use advanced relationship mode
      const TheBrainAdvanced = require('./thebrain-advanced-relationships.js');
      integration = new TheBrainAdvanced();
      
      await integration.initialize();
      
      switch (command) {
        case 'sync':
        case 'full':
          await integration.syncAll();
          break;
          
        case 'export':
          await integration.exportKnowledgeGraph();
          break;
          
        default:
          console.log('Advanced mode commands:');
          console.log('  node thebrain-sync-enhanced.js sync --advanced');
          console.log('  node thebrain-sync-enhanced.js export --advanced');
      }
    } else {
      // Use standard mode
      const isGitHubActions = process.env.GITHUB_ACTIONS === 'true';
      const TheBrainIntegration = require(isGitHubActions ? './thebrain-sync-direct.js' : './thebrain-sync.js');
      integration = new TheBrainIntegration();
      
      await integration.setupDatabase();
      const initialized = await integration.initialize();
      
      if (!initialized) {
        console.error('Failed to initialize TheBrain integration');
        return;
      }
      
      switch (command) {
        case 'sync':
          await integration.syncAllCompanies();
          await integration.syncBaselineAnalyses();
          await integration.syncRecentChanges(24);
          break;
          
        case 'full':
          await integration.syncAllCompanies();
          await integration.syncBaselineAnalyses();
          await integration.syncRecentChanges(168);
          await integration.createCompetitiveLandscapeView();
          break;
          
        default:
          console.log('Standard mode commands:');
          console.log('  node thebrain-sync-enhanced.js sync');
          console.log('  node thebrain-sync-enhanced.js full');
      }
    }
    
    console.log('✅ TheBrain sync complete!');
    
  } catch (error) {
    console.error('❌ TheBrain sync error:', error);
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
  if (process.env.GITHUB_ACTIONS !== 'true') {
    process.exit(1);
  }
});
