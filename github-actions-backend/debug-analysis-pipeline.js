#!/usr/bin/env node

/**
 * Debug Script for Analysis Pipeline
 * Identifies why JSON files are not being generated
 */

const fs = require('fs');
const path = require('path');
const dbManager = require('./db-manager');

console.log('🔍 AI Monitor Analysis Pipeline Debugger');
console.log('========================================\n');

// Check database architecture
console.log('1. Checking Database Architecture:');
console.log('   Has three-db architecture:', dbManager.hasThreeDbArchitecture());
console.log('   Database info:', JSON.stringify(dbManager.getDatabaseInfo(), null, 2));

// Check if databases can be opened
console.log('\n2. Testing Database Connections:');
try {
  const intelligenceDb = dbManager.getIntelligenceDb();
  console.log('   ✅ Intelligence DB connected');
  
  // Check table existence
  const tables = intelligenceDb.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('   Tables in intelligence.db:', tables.map(t => t.name).join(', '));
  
  // Check for data
  const companyCount = intelligenceDb.prepare('SELECT COUNT(*) as count FROM companies').get();
  console.log('   Companies:', companyCount.count);
  
  const urlCount = intelligenceDb.prepare('SELECT COUNT(*) as count FROM urls').get();
  console.log('   URLs:', urlCount.count);
  
  const analysisCount = intelligenceDb.prepare('SELECT COUNT(*) as count FROM baseline_analysis').get();
  console.log('   Baseline analyses:', analysisCount.count);
  
} catch (error) {
  console.error('   ❌ Intelligence DB error:', error.message);
}

try {
  const processedDb = dbManager.getProcessedDb();
  console.log('   ✅ Processed DB connected');
  
  // Check table existence
  const tables = processedDb.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('   Tables in processed_content.db:', tables.map(t => t.name).join(', '));
  
  // Check for markdown content
  const markdownCount = processedDb.prepare('SELECT COUNT(*) as count FROM markdown_content').get();
  console.log('   Markdown content entries:', markdownCount.count);
  
} catch (error) {
  console.error('   ❌ Processed DB error:', error.message);
}

// Check output directory
console.log('\n3. Checking Output Directory:');
const OUTPUT_DIR = path.join(__dirname, '..', 'api-data');
console.log('   Output dir path:', OUTPUT_DIR);
console.log('   Output dir exists:', fs.existsSync(OUTPUT_DIR));

if (fs.existsSync(OUTPUT_DIR)) {
  const files = fs.readdirSync(OUTPUT_DIR);
  console.log('   Files in api-data:', files.join(', '));
  
  // Check dashboard.json modification time
  const dashboardPath = path.join(OUTPUT_DIR, 'dashboard.json');
  if (fs.existsSync(dashboardPath)) {
    const stats = fs.statSync(dashboardPath);
    console.log('   dashboard.json last modified:', stats.mtime);
    
    // Read and check the generated_at field
    const dashboardData = JSON.parse(fs.readFileSync(dashboardPath, 'utf8'));
    console.log('   dashboard.json generated_at:', dashboardData.generated_at);
    console.log('   dashboard.json backend:', dashboardData.backend);
  }
}

// Test the generate function
console.log('\n4. Testing Static Data Generation:');
try {
  const generator = require('./generate-static-data-three-db.js');
  console.log('   ✅ Generator module loaded successfully');
  
  // Check if it's trying to use the right architecture
  if (!dbManager.hasThreeDbArchitecture()) {
    console.log('   ⚠️  Three-database architecture not found!');
    console.log('   Generator will create sample data instead of real data');
  } else {
    console.log('   ✅ Three-database architecture found');
    console.log('   Attempting to generate static data...');
    
    // Try to generate just dashboard data
    try {
      const intelligenceDb = dbManager.getIntelligenceDb();
      
      // Test a simple query
      const testQuery = intelligenceDb.prepare(`
        SELECT COUNT(*) as count FROM companies
      `).get();
      console.log('   Test query result:', testQuery);
      
      // Test the complex dashboard query
      const companyActivity = intelligenceDb.prepare(`
        SELECT 
          c.id,
          c.name as company,
          c.type,
          COUNT(DISTINCT u.id) as url_count,
          MAX(ba.created_at) as last_check
        FROM companies c
        LEFT JOIN urls u ON c.id = u.company_id
        LEFT JOIN baseline_analysis ba ON u.id = ba.url_id
        GROUP BY c.id, c.name, c.type
        ORDER BY c.name
        LIMIT 5
      `).all();
      console.log('   Sample company activity:', companyActivity.length, 'companies found');
      if (companyActivity.length > 0) {
        console.log('   First company:', JSON.stringify(companyActivity[0], null, 2));
      }
      
    } catch (error) {
      console.error('   ❌ Error during test generation:', error.message);
      console.error('   Stack trace:', error.stack);
    }
  }
  
} catch (error) {
  console.error('   ❌ Generator module error:', error.message);
}

// Check environment variables
console.log('\n5. Environment Check:');
console.log('   NODE_ENV:', process.env.NODE_ENV);
console.log('   USE_THREE_DB:', process.env.USE_THREE_DB);
console.log('   GITHUB_ACTIONS:', process.env.GITHUB_ACTIONS);

// Close database connections
dbManager.closeAll();

console.log('\n✅ Debug complete');
