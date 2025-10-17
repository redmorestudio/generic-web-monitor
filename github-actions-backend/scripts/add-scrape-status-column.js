#!/usr/bin/env node

const Database = require('better-sqlite3');
const path = require('path');

console.log('🔧 Adding scrape_status column to raw_html table...');

// Get database path
const dbPath = path.join(__dirname, '../data/raw_content.db');

try {
  // Open database
  const db = new Database(dbPath);
  
  // Check if column already exists
  const tableInfo = db.prepare("PRAGMA table_info(raw_html)").all();
  const hasColumn = tableInfo.some(col => col.name === 'scrape_status');
  
  if (hasColumn) {
    console.log('✅ Column scrape_status already exists, skipping migration');
  } else {
    // Add the column
    db.prepare(`
      ALTER TABLE raw_html 
      ADD COLUMN scrape_status TEXT DEFAULT 'success'
    `).run();
    
    console.log('✅ Successfully added scrape_status column');
    
    // Update existing records to have 'success' status
    const updateResult = db.prepare(`
      UPDATE raw_html 
      SET scrape_status = 'success' 
      WHERE scrape_status IS NULL
    `).run();
    
    console.log(`✅ Updated ${updateResult.changes} existing records with default status`);
  }
  
  // Verify the column was added
  const newTableInfo = db.prepare("PRAGMA table_info(raw_html)").all();
  const verifyColumn = newTableInfo.find(col => col.name === 'scrape_status');
  
  if (verifyColumn) {
    console.log('✅ Verified: scrape_status column exists with type:', verifyColumn.type);
  } else {
    throw new Error('Failed to verify column creation');
  }
  
  // Close database
  db.close();
  
  console.log('✅ Migration completed successfully!');
  
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}
