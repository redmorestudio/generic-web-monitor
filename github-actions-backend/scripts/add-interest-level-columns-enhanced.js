#!/usr/bin/env node
/**
 * Enhanced migration to add interest_level and interest_data columns to change_detection table
 * This migration ensures the table exists in the correct database and adds the new interest tracking fields
 * 
 * ANALYSIS: From examining the code, the change_detection table should be in processed_content.db
 * but the scraper code writes to it directly. This migration fixes any schema discrepancies.
 */
const path = require('path');
const dbManager = require('../db-manager');

console.log('🔧 Enhanced migration: Adding interest_level columns to change_detection table...');

try {
  // Get database connections
  const processedDb = dbManager.getProcessedDb();
  const intelligenceDb = dbManager.getIntelligenceDb();
  
  console.log('📊 Checking change_detection table location and schema...');
  
  // Check if change_detection exists in processed_content.db (correct location)
  let changeDetectionExists = false;
  try {
    const processedTableInfo = processedDb.prepare("PRAGMA table_info(change_detection)").all();
    changeDetectionExists = processedTableInfo.length > 0;
    console.log(`✅ change_detection table ${changeDetectionExists ? 'exists' : 'does not exist'} in processed_content.db`);
  } catch (error) {
    console.log('⚠️  Could not check processed_content.db for change_detection table');
  }
  
  // If table doesn't exist in processed_content.db, create it with the correct schema
  if (!changeDetectionExists) {
    console.log('🏗️  Creating change_detection table in processed_content.db...');
    processedDb.exec(`
      CREATE TABLE IF NOT EXISTS change_detection (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url_id INTEGER NOT NULL,
        change_type TEXT,  -- 'initial_scrape' or 'content_update'
        summary TEXT,
        old_content_id INTEGER,  -- FK to raw_html.id
        new_content_id INTEGER,  -- FK to raw_html.id
        relevance_score INTEGER,  -- Deprecated, use interest_level
        interest_level INTEGER DEFAULT 5,   -- 1-10 score
        interest_data TEXT,       -- JSON with full assessment
        detected_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Create indexes for performance
      CREATE INDEX IF NOT EXISTS idx_change_detection_url ON change_detection(url_id);
      CREATE INDEX IF NOT EXISTS idx_change_detection_type ON change_detection(change_type);
      CREATE INDEX IF NOT EXISTS idx_change_detection_interest ON change_detection(interest_level);
      CREATE INDEX IF NOT EXISTS idx_change_detection_date ON change_detection(detected_at);
    `);
    console.log('✅ Created change_detection table with full schema');
  } else {
    // Table exists, check and add missing columns
    const tableInfo = processedDb.prepare("PRAGMA table_info(change_detection)").all();
    const interestLevelExists = tableInfo.some(col => col.name === 'interest_level');
    const interestDataExists = tableInfo.some(col => col.name === 'interest_data');
    
    if (!interestLevelExists) {
      // Add interest_level column
      processedDb.exec(`
        ALTER TABLE change_detection ADD COLUMN interest_level INTEGER DEFAULT 5;
      `);
      console.log('✅ Added interest_level column');
      
      // Copy relevance_score to interest_level for existing records
      const updateStmt = processedDb.prepare(`
        UPDATE change_detection
        SET interest_level = COALESCE(relevance_score, 5)
        WHERE interest_level IS NULL OR interest_level = 5
      `);
      const result = updateStmt.run();
      console.log(`✅ Updated ${result.changes} existing records with interest_level from relevance_score`);
    } else {
      console.log('✅ interest_level column already exists');
    }
    
    if (!interestDataExists) {
      // Add interest_data column for storing full assessment JSON
      processedDb.exec(`
        ALTER TABLE change_detection ADD COLUMN interest_data TEXT;
      `);
      console.log('✅ Added interest_data column');
    } else {
      console.log('✅ interest_data column already exists');
    }
  }
  
  // Add AI-generated insight columns if they don't exist
  const finalTableInfo = processedDb.prepare("PRAGMA table_info(change_detection)").all();
  const aiExplanationExists = finalTableInfo.some(col => col.name === 'ai_explanation');
  const aiKeyChangesExists = finalTableInfo.some(col => col.name === 'ai_key_changes');
  const aiBusinessContextExists = finalTableInfo.some(col => col.name === 'ai_business_context');
  
  if (!aiExplanationExists) {
    processedDb.exec(`
      ALTER TABLE change_detection ADD COLUMN ai_explanation TEXT;
    `);
    console.log('✅ Added ai_explanation column');
  }
  
  if (!aiKeyChangesExists) {
    processedDb.exec(`
      ALTER TABLE change_detection ADD COLUMN ai_key_changes TEXT;
    `);
    console.log('✅ Added ai_key_changes column');
  }
  
  if (!aiBusinessContextExists) {
    processedDb.exec(`
      ALTER TABLE change_detection ADD COLUMN ai_business_context TEXT;
    `);
    console.log('✅ Added ai_business_context column');
  }
  
  // Create indexes for performance
  processedDb.exec(`
    CREATE INDEX IF NOT EXISTS idx_change_detection_interest ON change_detection(interest_level);
    CREATE INDEX IF NOT EXISTS idx_change_detection_url ON change_detection(url_id);
    CREATE INDEX IF NOT EXISTS idx_change_detection_date ON change_detection(detected_at);
  `);
  console.log('✅ Created/verified indexes on change_detection table');
  
  // Display final schema
  console.log('\n📋 Final change_detection table schema:');
  const finalSchema = processedDb.prepare("PRAGMA table_info(change_detection)").all();
  finalSchema.forEach(col => {
    console.log(`   ${col.name} (${col.type}${col.dflt_value ? `, default: ${col.dflt_value}` : ''})`);
  });
  
  // Verify recent changes exist
  const recentChanges = processedDb.prepare(`
    SELECT COUNT(*) as count FROM change_detection 
    WHERE detected_at > datetime('now', '-7 days')
  `).get();
  console.log(`\n📊 Recent changes in last 7 days: ${recentChanges.count}`);
  
  // Show sample with interest levels
  const sampleChanges = processedDb.prepare(`
    SELECT url_id, change_type, interest_level, LEFT(summary, 60) as summary_preview, detected_at
    FROM change_detection 
    ORDER BY detected_at DESC 
    LIMIT 5
  `).all();
  
  if (sampleChanges.length > 0) {
    console.log('\n📝 Sample recent changes:');
    sampleChanges.forEach(change => {
      console.log(`   URL ${change.url_id}: ${change.change_type} (interest: ${change.interest_level || 'null'}) - ${change.summary_preview || 'no summary'}...`);
    });
  }
  
  console.log('\n✅ Enhanced migration complete!');
  
} catch (error) {
  console.error('❌ Migration failed:', error);
  console.error('Stack trace:', error.stack);
  process.exit(1);
} finally {
  dbManager.closeAll();
}
