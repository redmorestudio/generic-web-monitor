#!/usr/bin/env node

/**
 * Migration to add interest_level and interest_data columns to change_detection table
 */

const path = require('path');
const dbManager = require('../db-manager');

console.log('🔧 Running migration to add interest level fields...');

try {
  // Get processed content database
  const processedDb = dbManager.getProcessedDb();
  
  // Check if columns already exist
  const tableInfo = processedDb.prepare("PRAGMA table_info(change_detection)").all();
  const hasInterestLevel = tableInfo.some(col => col.name === 'interest_level');
  const hasInterestData = tableInfo.some(col => col.name === 'interest_data');
  
  if (!hasInterestLevel) {
    console.log('Adding interest_level column...');
    processedDb.prepare(`
      ALTER TABLE change_detection 
      ADD COLUMN interest_level INTEGER DEFAULT 5
    `).run();
    console.log('✅ Added interest_level column');
  } else {
    console.log('✓ interest_level column already exists');
  }
  
  if (!hasInterestData) {
    console.log('Adding interest_data column...');
    processedDb.prepare(`
      ALTER TABLE change_detection 
      ADD COLUMN interest_data TEXT
    `).run();
    console.log('✅ Added interest_data column');
  } else {
    console.log('✓ interest_data column already exists');
  }
  
  // Create index for interest_level
  console.log('Creating index on interest_level...');
  processedDb.prepare(`
    CREATE INDEX IF NOT EXISTS idx_change_interest_level 
    ON change_detection(interest_level)
  `).run();
  
  // Migrate existing relevance_score to interest_level if needed
  if (hasInterestLevel) {
    console.log('Migrating relevance_score values to interest_level...');
    const updated = processedDb.prepare(`
      UPDATE change_detection 
      SET interest_level = relevance_score 
      WHERE interest_level = 5 AND relevance_score != 5
    `).run();
    console.log(`✅ Migrated ${updated.changes} records`);
  }
  
  console.log('\n✅ Migration completed successfully!');
  
} catch (error) {
  console.error('❌ Migration failed:', error);
  process.exit(1);
} finally {
  dbManager.closeAll();
}