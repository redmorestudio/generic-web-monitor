// TheBrain sync wrapper that uses the proper API integration
const path = require('path');

async function main() {
  console.log('🧠 TheBrain Sync Starting...');
  console.log(`   Environment: ${process.env.GITHUB_ACTIONS ? 'GitHub Actions' : 'Local'}`);
  console.log(`   Brain ID: ${process.env.THEBRAIN_BRAIN_ID || 'Not set'}`);
  
  try {
    // Try API sync first
    const TheBrainAPISync = require('./thebrain-api-sync');
    const apiSync = new TheBrainAPISync();
    
    console.log('Attempting API-based sync...');
    const success = await apiSync.syncToTheBrain();
    
    if (success) {
      console.log('✅ TheBrain API sync completed successfully!');
      process.exit(0);
    } else {
      console.log('⚠️  API sync failed, falling back to export mode...');
    }
    
  } catch (apiError) {
    console.log('⚠️  API sync error:', apiError.message);
    console.log('Falling back to export mode...');
  }
  
  // Fallback to export mode if API sync fails
  try {
    const TheBrainThreeDBIntegration = require('./thebrain-sync-three-db');
    const integration = new TheBrainThreeDBIntegration();
    
    // Setup database
    await integration.setupDatabase();
    
    // Initialize
    const initialized = await integration.initialize();
    if (!initialized) {
      console.error('❌ Failed to initialize TheBrain integration');
      process.exit(1);
    }
    
    // Run sync (export mode)
    await integration.syncToTheBrain();
    console.log('✅ TheBrain export completed (manual import required)');
    
  } catch (error) {
    console.error('❌ TheBrain sync error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run main function
main();
