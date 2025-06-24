#!/usr/bin/env node

/**
 * Setup Database Script
 * Creates an empty SQLite database with the required schema
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'data', 'monitor.db');

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('✅ Created data directory');
}

// Create database
console.log('📊 Creating database at:', dbPath);
const db = new Database(dbPath);

// Create tables
console.log('📊 Creating tables...');

// Initialize with the basic schema
db.exec(`
  -- Companies table
  CREATE TABLE IF NOT EXISTS companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    category TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- URLs table
  CREATE TABLE IF NOT EXISTS urls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    url TEXT NOT NULL,
    url_type TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id)
  );

  -- Content snapshots table
  CREATE TABLE IF NOT EXISTS content_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url_id INTEGER NOT NULL,
    company_name TEXT,
    url TEXT,
    content_hash TEXT,
    full_content TEXT,
    markdown_content TEXT,
    status_code INTEGER,
    error_message TEXT,
    scraped_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (url_id) REFERENCES urls(id)
  );

  -- Changes table
  CREATE TABLE IF NOT EXISTS changes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url_id INTEGER NOT NULL,
    company_name TEXT,
    url TEXT,
    old_hash TEXT,
    new_hash TEXT,
    change_type TEXT,
    detected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (url_id) REFERENCES urls(id)
  );

  -- Baseline analysis table
  CREATE TABLE IF NOT EXISTS baseline_analysis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    snapshot_id INTEGER NOT NULL,
    company_name TEXT,
    url TEXT,
    ai_summary TEXT,
    extracted_data TEXT,
    relevance_score REAL,
    analysis_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (snapshot_id) REFERENCES content_snapshots(id)
  );

  -- AI analysis table
  CREATE TABLE IF NOT EXISTS ai_analysis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    change_id INTEGER NOT NULL,
    company_name TEXT,
    url TEXT,
    summary TEXT,
    relevance_score REAL,
    key_changes TEXT,
    entities_mentioned TEXT,
    sentiment TEXT,
    category TEXT,
    sub_category TEXT,
    tags TEXT,
    analyzed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (change_id) REFERENCES changes(id)
  );

  -- Monitoring runs table
  CREATE TABLE IF NOT EXISTS monitoring_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    run_type TEXT,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    urls_processed INTEGER DEFAULT 0,
    changes_detected INTEGER DEFAULT 0,
    errors_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'running'
  );
`);

console.log('✅ Database created successfully!');
console.log('📊 Database location:', dbPath);

// Verify tables were created
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('📊 Created tables:', tables.map(t => t.name).join(', '));

db.close();
console.log('✅ Setup complete!');
