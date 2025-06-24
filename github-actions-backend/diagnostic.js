#!/usr/bin/env node

/**
 * Database Diagnostic Script
 * Checks the current state of the monitoring database
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

console.log('🔍 AI Monitor Database Diagnostic');
console.log('=================================');

// Check if database exists
const dbPath = path.join(__dirname, 'data', 'monitor.db');
if (!fs.existsSync(dbPath)) {
  console.error('❌ Database not found at:', dbPath);
  console.log('Running init-db.js from scripts directory...');
  require('./scripts/init-db.js');
  console.log('✅ Database initialized');
}

// Check if database exists now
if (!fs.existsSync(dbPath)) {
  console.error('❌ Database still not found after initialization');
  process.exit(1);
}

console.log('✅ Database found at:', dbPath);

// Open database
const db = new Database(dbPath);

// Check tables
console.log('\n📊 Database Tables:');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
tables.forEach(table => {
  const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get();
  console.log(`  - ${table.name}: ${count.count} rows`);
});

// Check companies
console.log('\n🏢 Companies:');
const companies = db.prepare('SELECT COUNT(*) as count FROM companies').get();
console.log(`  Total: ${companies.count}`);

// Check URLs
console.log('\n🔗 URLs:');
const urls = db.prepare('SELECT COUNT(*) as count FROM urls').get();
console.log(`  Total: ${urls.count}`);

// Check recent activity
console.log('\n📈 Recent Activity:');
const recentSnapshots = db.prepare(`
  SELECT COUNT(*) as count 
  FROM content_snapshots 
  WHERE scraped_at > datetime('now', '-24 hours')
`).get();
console.log(`  Snapshots (last 24h): ${recentSnapshots.count}`);

const recentAnalysis = db.prepare(`
  SELECT COUNT(*) as count 
  FROM baseline_analysis 
  WHERE analysis_date > datetime('now', '-24 hours')
`).get();
console.log(`  Analysis (last 24h): ${recentAnalysis.count}`);

// Check for errors
console.log('\n❗ Recent Errors:');
const errors = db.prepare(`
  SELECT error_message, COUNT(*) as count 
  FROM content_snapshots 
  WHERE error_message IS NOT NULL 
  GROUP BY error_message 
  LIMIT 5
`).all();

if (errors.length === 0) {
  console.log('  No errors found');
} else {
  errors.forEach(error => {
    console.log(`  - ${error.error_message}: ${error.count} occurrences`);
  });
}

db.close();
console.log('\n✅ Diagnostic complete');
