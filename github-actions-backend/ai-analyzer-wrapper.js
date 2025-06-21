#!/usr/bin/env node

require('dotenv').config();
const axios = require('axios');

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:3000/api';
const IS_GITHUB_ACTIONS = process.env.GITHUB_ACTIONS === 'true';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

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
  console.log('🤖 AI Analyzer Starting...');
  console.log(`   Environment: ${IS_GITHUB_ACTIONS ? 'GitHub Actions' : 'Local'}`);
  console.log(`   Mode: ${IS_PRODUCTION ? 'Production' : 'Development'}`);
  
  const serverAvailable = await checkServerAvailable();
  const command = process.argv[2] || 'analyze';
  
  if (serverAvailable) {
    console.log('   ✅ API server detected - using API mode');
    // Use the original API-based analyzer
    const EnhancedAIAnalyzer = require('./ai-analyzer-enhanced.js');
    const analyzer = new EnhancedAIAnalyzer();
    
    try {
      await analyzer.initialize();
      
      switch (command) {
        case 'analyze':
          await analyzer.analyzeAllChanges();
          break;
          
        case 'brief':
          await analyzer.generateExecutiveBrief();
          break;
          
        case 'both':
          await analyzer.analyzeAllChanges();
          await analyzer.generateExecutiveBrief();
          break;
          
        default:
          console.log('Unknown command:', command);
          console.log('Usage: node ai-analyzer-wrapper.js [analyze|brief|both]');
          process.exit(1);
      }
    } finally {
      await analyzer.shutdown();
    }
  } else {
    console.log('   🔄 No API server - using direct database mode');
    // Use the direct database analyzer
    const EnhancedAIAnalyzerDirect = require('./ai-analyzer-enhanced-direct.js');
    const analyzer = new EnhancedAIAnalyzerDirect();
    
    try {
      await analyzer.initialize();
      
      switch (command) {
        case 'analyze':
          await analyzer.analyzeAllChanges();
          break;
          
        case 'brief':
          await analyzer.generateExecutiveBrief();
          break;
          
        case 'both':
          await analyzer.analyzeAllChanges();
          await analyzer.generateExecutiveBrief();
          break;
          
        default:
          console.log('Unknown command:', command);
          console.log('Usage: node ai-analyzer-wrapper.js [analyze|brief|both]');
          process.exit(1);
      }
    } finally {
      await analyzer.shutdown();
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
