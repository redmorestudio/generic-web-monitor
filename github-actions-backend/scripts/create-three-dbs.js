#!/usr/bin/env node

/**
 * Create Three Databases Script
 * Sets up the new three-database architecture
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '..', 'data');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('✅ Created data directory');
}

// Database paths
const rawDbPath = path.join(dataDir, 'raw_content.db');
const processedDbPath = path.join(dataDir, 'processed_content.db');
const intelligenceDbPath = path.join(dataDir, 'intelligence.db');

console.log('🏗️  Creating three-database architecture...\n');

// 1. Create Raw Content Database
console.log('📊 Creating raw_content.db...');
const rawDb = new Database(rawDbPath);

rawDb.exec(`
  -- Raw HTML content storage
  CREATE TABLE IF NOT EXISTS raw_html (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url_id INTEGER NOT NULL,
    company_name TEXT,
    url TEXT,
    content_hash TEXT,
    html_content TEXT,
    status_code INTEGER,
    error_message TEXT,
    scraped_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Create indexes for performance
  CREATE INDEX IF NOT EXISTS idx_raw_html_url ON raw_html(url);
  CREATE INDEX IF NOT EXISTS idx_raw_html_hash ON raw_html(content_hash);
  CREATE INDEX IF NOT EXISTS idx_raw_html_scraped ON raw_html(scraped_at);

  -- Scraping run metadata
  CREATE TABLE IF NOT EXISTS scrape_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    urls_processed INTEGER DEFAULT 0,
    urls_changed INTEGER DEFAULT 0,
    errors_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'running'
  );
`);

console.log('✅ Created raw_content.db');
rawDb.close();

// 2. Create Processed Content Database
console.log('\n📊 Creating processed_content.db...');
const processedDb = new Database(processedDbPath);

processedDb.exec(`
  -- Markdown and structured content
  CREATE TABLE IF NOT EXISTS markdown_content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    raw_html_id INTEGER NOT NULL,
    url_id INTEGER NOT NULL,
    company_name TEXT,
    url TEXT,
    markdown_text TEXT,
    markdown_hash TEXT,
    structured_text TEXT,
    processed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    processing_status TEXT DEFAULT 'pending'
  );

  -- Create indexes
  CREATE INDEX IF NOT EXISTS idx_markdown_url ON markdown_content(url);
  CREATE INDEX IF NOT EXISTS idx_markdown_raw_id ON markdown_content(raw_html_id);
  CREATE INDEX IF NOT EXISTS idx_markdown_status ON markdown_content(processing_status);

  -- Processing metadata
  CREATE TABLE IF NOT EXISTS processing_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    items_processed INTEGER DEFAULT 0,
    items_failed INTEGER DEFAULT 0,
    status TEXT DEFAULT 'running'
  );

  -- Change tracking (links to raw_html)
  CREATE TABLE IF NOT EXISTS content_changes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url_id INTEGER NOT NULL,
    company_name TEXT,
    url TEXT,
    old_raw_id INTEGER,
    new_raw_id INTEGER,
    old_hash TEXT,
    new_hash TEXT,
    change_type TEXT,
    detected_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

console.log('✅ Created processed_content.db');
processedDb.close();

// 3. Create Intelligence Database
console.log('\n📊 Creating intelligence.db...');
const intelligenceDb = new Database(intelligenceDbPath);

intelligenceDb.exec(`
  -- Company registry
  CREATE TABLE IF NOT EXISTS companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    category TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- URL registry
  CREATE TABLE IF NOT EXISTS urls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    url TEXT NOT NULL,
    url_type TEXT,
    selector_config TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_scraped DATETIME,
    FOREIGN KEY (company_id) REFERENCES companies(id)
  );

  -- Create indexes
  CREATE INDEX IF NOT EXISTS idx_urls_company ON urls(company_id);
  CREATE INDEX IF NOT EXISTS idx_urls_url ON urls(url);

  -- Current state intelligence
  CREATE TABLE IF NOT EXISTS current_intelligence (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url_id INTEGER NOT NULL,
    company_name TEXT,
    url TEXT,
    ai_summary TEXT,
    extracted_entities TEXT,
    key_topics TEXT,
    key_technologies TEXT,
    key_people TEXT,
    sentiment TEXT,
    relevance_score REAL,
    last_analyzed DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (url_id) REFERENCES urls(id)
  );

  -- Create indexes
  CREATE INDEX IF NOT EXISTS idx_intel_url ON current_intelligence(url_id);
  CREATE INDEX IF NOT EXISTS idx_intel_score ON current_intelligence(relevance_score);

  -- Change intelligence
  CREATE TABLE IF NOT EXISTS change_intelligence (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url_id INTEGER NOT NULL,
    change_id INTEGER,
    company_name TEXT,
    url TEXT,
    change_summary TEXT,
    relevance_score REAL,
    key_changes TEXT,
    entities_mentioned TEXT,
    impact_assessment TEXT,
    category TEXT,
    sub_category TEXT,
    tags TEXT,
    detected_at DATETIME,
    analyzed_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Create indexes
  CREATE INDEX IF NOT EXISTS idx_change_intel_url ON change_intelligence(url_id);
  CREATE INDEX IF NOT EXISTS idx_change_intel_score ON change_intelligence(relevance_score);
  CREATE INDEX IF NOT EXISTS idx_change_intel_date ON change_intelligence(detected_at);

  -- High-priority alerts
  CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    change_id INTEGER,
    alert_type TEXT,
    severity INTEGER,
    title TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    acknowledged_at DATETIME,
    github_issue_id INTEGER,
    FOREIGN KEY (change_id) REFERENCES change_intelligence(id)
  );

  -- Analysis run metadata
  CREATE TABLE IF NOT EXISTS analysis_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    run_type TEXT,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    items_analyzed INTEGER DEFAULT 0,
    high_relevance_count INTEGER DEFAULT 0,
    alerts_created INTEGER DEFAULT 0,
    status TEXT DEFAULT 'running'
  );

  -- Enhanced analysis with entity extraction
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

  -- Create index for enhanced analysis
  CREATE INDEX IF NOT EXISTS idx_enhanced_change ON enhanced_analysis(change_id);
`);

console.log('✅ Created intelligence.db');
intelligenceDb.close();

// Summary
console.log('\n✅ Three-database architecture created successfully!');
console.log('\n📁 Database locations:');
console.log('   - Raw HTML:', rawDbPath);
console.log('   - Processed:', processedDbPath);
console.log('   - Intelligence:', intelligenceDbPath);
console.log('\n🚀 Ready for migration!');
