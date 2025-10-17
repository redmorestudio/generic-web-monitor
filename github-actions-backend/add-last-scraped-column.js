#!/usr/bin/env node

/**
 * Migration script to add last_scraped column to urls table
 * Fixes the "no such column: last_scraped" error
 */

const dbManager = require('./db-manager');

console.log('🔧 Adding last_scraped column to urls table...');

try {
  const intelligenceDb = dbManager.getIntelligenceDb();
  
  // Check if column already exists
  const tableInfo = intelligenceDb.prepare('PRAGMA table_info(urls)').all();
  const hasLastScraped = tableInfo.some(col => col.name === 'last_scraped');
  
  if (hasLastScraped) {
    console.log('✅ Column last_scraped already exists');
  } else {
    // Add the column
    intelligenceDb.exec(`
      ALTER TABLE urls ADD COLUMN last_scraped DATETIME;
    `);
    console.log('✅ Successfully added last_scraped column to urls table');
    
    // Update any existing rows to have a default value
    intelligenceDb.exec(`
      UPDATE urls SET last_scraped = created_at WHERE last_scraped IS NULL;
    `);
    console.log('✅ Updated existing rows with default values');
  }
  
  // Show updated schema
  console.log('\n📊 Updated urls table schema:');
  const newTableInfo = intelligenceDb.prepare('PRAGMA table_info(urls)').all();
  newTableInfo.forEach(col => {
    console.log(`   ${col.name} (${col.type})`);
  });
  
} catch (error) {
  console.error('❌ Error adding column:', error.message);
  process.exit(1);
} finally {
  dbManager.closeAll();
}

console.log('\n✅ Migration complete!');
