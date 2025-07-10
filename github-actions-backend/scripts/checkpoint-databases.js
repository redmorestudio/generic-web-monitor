#!/usr/bin/env node

/**
 * Checkpoint all SQLite databases to ensure WAL changes are written to main database files
 * This is necessary before committing databases to Git
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '..', 'data');

const databases = [
  'raw_content.db',
  'processed_content.db',
  'intelligence.db'
];

console.log('🔄 Checkpointing SQLite databases...');

databases.forEach(dbFile => {
  const dbPath = path.join(dataDir, dbFile);
  
  if (!fs.existsSync(dbPath)) {
    console.log(`⚠️  ${dbFile} not found, skipping`);
    return;
  }
  
  try {
    console.log(`📊 Checkpointing ${dbFile}...`);
    const db = new Database(dbPath);
    
    // Force a checkpoint to write WAL changes to main database
    db.pragma('wal_checkpoint(TRUNCATE)');
    
    // Also vacuum to optimize the database
    console.log(`   Vacuuming ${dbFile}...`);
    db.pragma('vacuum');
    
    db.close();
    console.log(`   ✅ ${dbFile} checkpointed successfully`);
    
    // Check if WAL files still exist
    const walPath = dbPath + '-wal';
    const shmPath = dbPath + '-shm';
    
    if (fs.existsSync(walPath)) {
      const walSize = fs.statSync(walPath).size;
      console.log(`   ⚠️  WAL file still exists (${walSize} bytes)`);
    }
    
  } catch (error) {
    console.error(`❌ Error checkpointing ${dbFile}:`, error.message);
  }
});

console.log('✅ Database checkpoint complete');
