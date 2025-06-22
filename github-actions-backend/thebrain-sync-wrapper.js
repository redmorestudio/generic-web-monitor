#!/usr/bin/env node

require('dotenv').config();
const TheBrainIntegration = require('./thebrain-sync.js');

async function main() {
  console.log('🧠 TheBrain Sync Starting...');
  console.log(`   Environment: ${process.env.GITHUB_ACTIONS === 'true' ? 'GitHub Actions' : 'Local'}`);
  console.log(`   Brain ID: ${process.env.THEBRAIN_BRAIN_ID || 'Not configured'}`);
  
  // Check if TheBrain credentials are available
  if (!process.env.THEBRAIN_API_KEY) {
    console.log('⚠️  Warning: TheBrain API key not found in environment');
    console.log('   Skipping TheBrain sync...');
    return;
  }

  // Skip TheBrain sync in GitHub Actions for now (needs direct API instead of MCP)
  if (process.env.GITHUB_ACTIONS === 'true') {
    console.log('⚠️  TheBrain sync requires MCP server - skipping in GitHub Actions');
    console.log('   To enable: Use direct TheBrain API instead of MCP');
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
    
    switch (command) {
      case 'sync':
        // Sync companies and recent changes
        await integration.syncAllCompanies();
        await integration.syncRecentChanges(24);
        break;
        
      case 'companies':
        // Sync only companies
        await integration.syncAllCompanies();
        break;
        
      case 'changes':
        // Sync only recent changes
        await integration.syncRecentChanges(24);
        break;
        
      case 'landscape':
        // Create competitive landscape view
        await integration.createCompetitiveLandscapeView();
        break;
        
      case 'full':
        // Run everything
        await integration.syncAllCompanies();
        await integration.syncRecentChanges(168); // Last week
        await integration.createCompetitiveLandscapeView();
        break;
        
      default:
        console.log('Unknown command:', command);
        console.log('Usage: node thebrain-sync-wrapper.js [sync|companies|changes|landscape|full]');
        // Don't exit with error
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
