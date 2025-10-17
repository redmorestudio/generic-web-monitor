#!/usr/bin/env node

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

console.log('🔧 Adding enhanced_analysis table to existing database...');

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Open database
const dbPath = path.join(dataDir, 'monitor.db');
const db = new Database(dbPath);

// Create enhanced_analysis table if not exists
db.exec(`
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (change_id) REFERENCES changes(id)
  )
`);

// Create groups table if not exists
db.exec(`
  CREATE TABLE IF NOT EXISTS groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT DEFAULT '#3b82f6',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create url_groups table if not exists
db.exec(`
  CREATE TABLE IF NOT EXISTS url_groups (
    url_id INTEGER NOT NULL,
    group_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (url_id, group_id),
    FOREIGN KEY (url_id) REFERENCES urls(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
  )
`);

console.log('✅ Enhanced analysis tables created successfully!');

// Check if we have any changes that need analysis
const unanalyzedCount = db.prepare(`
  SELECT COUNT(*) as count 
  FROM changes c
  LEFT JOIN enhanced_analysis ea ON c.id = ea.change_id
  WHERE ea.id IS NULL
`).get().count;

console.log(`📊 Found ${unanalyzedCount} changes that need enhanced analysis`);

db.close();
console.log('✅ Database fix complete!');
