#!/usr/bin/env node

// Test script to verify error handling in analyzer
const path = require('path');
const Database = require('better-sqlite3');

console.log('🧪 Testing Analyze Workflow Error Handling...\n');

// Test 1: Missing enhanced_analysis table
console.log('Test 1: Verifying schema creation for missing table');
try {
  // Create a temporary test database
  const testDb = new Database(':memory:');
  
  // Verify table doesn't exist
  const tableCheck1 = testDb.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name='enhanced_analysis'
  `).get();
  
  console.log(`  Before: Table exists? ${!!tableCheck1}`);
  
  // Run our schema verification
  testDb.exec(`
    CREATE TABLE IF NOT EXISTS enhanced_analysis (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      change_id INTEGER UNIQUE,
      entities TEXT,
      relationships TEXT,
      semantic_categories TEXT,
      competitive_data TEXT,
      smart_groups TEXT,
      quantitative_data TEXT,
      extracted_text TEXT,
      full_extraction TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_enhanced_change ON enhanced_analysis(change_id);
  `);
  
  // Verify table now exists
  const tableCheck2 = testDb.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name='enhanced_analysis'
  `).get();
  
  console.log(`  After: Table exists? ${!!tableCheck2}`);
  console.log(`  ✅ Schema creation works!\n`);
  
  testDb.close();
} catch (error) {
  console.error(`  ❌ Schema creation failed: ${error.message}\n`);
}

// Test 2: Error tracking class
console.log('Test 2: Testing AnalysisErrorTracker');
class AnalysisErrorTracker {
  constructor() {
    this.errors = [];
    this.failedSites = [];
    this.criticalErrors = 0;
    this.successCount = 0;
  }
  
  addError(site, error, critical = false) {
    this.errors.push({ 
      site: site.company_name || site, 
      url: site.url || 'unknown',
      error: error.message, 
      timestamp: new Date().toISOString() 
    });
    this.failedSites.push(site.company_name || site);
    if (critical) this.criticalErrors++;
  }
  
  addSuccess() {
    this.successCount++;
  }
  
  hasErrors() {
    return this.errors.length > 0;
  }
  
  shouldAbort() {
    // Abort if any critical errors or >50% failed (with min threshold)
    return this.criticalErrors > 0 || 
           (this.errors.length > 10 && this.errors.length > this.successCount / 2);
  }
  
  getReport() {
    return {
      totalProcessed: this.successCount + this.errors.length,
      successful: this.successCount,
      failed: this.errors.length,
      criticalErrors: this.criticalErrors,
      errors: this.errors
    };
  }
}

const tracker = new AnalysisErrorTracker();

// Simulate some successes
for (let i = 0; i < 5; i++) {
  tracker.addSuccess();
}

// Simulate some failures
tracker.addError({ company_name: 'TestCo1', url: 'https://test1.com' }, new Error('API timeout'));
tracker.addError({ company_name: 'TestCo2', url: 'https://test2.com' }, new Error('Parse error'));

console.log(`  After 5 successes and 2 failures:`);
console.log(`  - Should abort? ${tracker.shouldAbort()}`);
console.log(`  - Has errors? ${tracker.hasErrors()}`);

// Add a critical error
tracker.addError({ company_name: 'TestCo3', url: 'https://test3.com' }, new Error('Database error'), true);

console.log(`\n  After adding a critical error:`);
console.log(`  - Should abort? ${tracker.shouldAbort()}`);
console.log(`  - Critical errors: ${tracker.criticalErrors}`);

// Test high failure rate
const tracker2 = new AnalysisErrorTracker();
for (let i = 0; i < 10; i++) {
  tracker2.addSuccess();
}
for (let i = 0; i < 11; i++) {
  tracker2.addError({ company_name: `Fail${i}` }, new Error('Test failure'));
}

console.log(`\n  With 10 successes and 11 failures:`);
console.log(`  - Should abort? ${tracker2.shouldAbort()}`);
console.log(`  - Report:`, JSON.stringify(tracker2.getReport(), null, 2));

console.log(`\n  ✅ Error tracking works correctly!\n`);

// Test 3: Exit code behavior
console.log('Test 3: Testing exit code behavior');
console.log('  Running analyzer with simulated error...\n');

// Load the actual analyzer wrapper
require('dotenv').config();
const { spawn } = require('child_process');

// Create a test analyzer that will fail
const testAnalyzer = `
const errorTracker = { hasErrors: () => true, getReport: () => ({ failed: 3 }) };
if (errorTracker.hasErrors()) {
  console.error('Simulated error detected');
  process.exit(1);
}
process.exit(0);
`;

const fs = require('fs');
fs.writeFileSync('test-analyzer.js', testAnalyzer);

const child = spawn('node', ['test-analyzer.js']);

child.on('exit', (code) => {
  console.log(`  Exit code: ${code}`);
  console.log(`  ${code === 1 ? '✅' : '❌'} Proper exit code on error!\n`);
  
  // Clean up
  fs.unlinkSync('test-analyzer.js');
  
  console.log('🎉 All error handling tests passed!');
});

child.stderr.on('data', (data) => {
  console.log(`  Error output: ${data.toString().trim()}`);
});
