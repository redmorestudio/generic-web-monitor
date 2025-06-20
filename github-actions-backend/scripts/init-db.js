#!/usr/bin/env node

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Create or open database
const dbPath = path.join(dataDir, 'monitor.db');
const db = new Database(dbPath);

console.log('🔧 Initializing AI Monitor database...');

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON');

// Companies table
db.exec(`
  CREATE TABLE IF NOT EXISTS companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    type TEXT DEFAULT 'competitor',
    enabled BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// URLs table
db.exec(`
  CREATE TABLE IF NOT EXISTS urls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    url TEXT NOT NULL,
    type TEXT DEFAULT 'general',
    check_frequency TEXT DEFAULT '6h',
    css_selectors TEXT DEFAULT '["main", "article", ".content", "[role=main]"]',
    keywords TEXT DEFAULT '[]',
    enabled BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    UNIQUE(company_id, url)
  )
`);

// Content snapshots table - stores full page content
db.exec(`
  CREATE TABLE IF NOT EXISTS content_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url_id INTEGER NOT NULL,
    content_hash TEXT NOT NULL,
    full_content TEXT NOT NULL,
    extracted_content TEXT NOT NULL,
    title TEXT,
    meta_description TEXT,
    word_count INTEGER,
    char_count INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (url_id) REFERENCES urls(id) ON DELETE CASCADE
  )
`);

// Changes table - tracks differences between snapshots
db.exec(`
  CREATE TABLE IF NOT EXISTS changes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url_id INTEGER NOT NULL,
    old_snapshot_id INTEGER,
    new_snapshot_id INTEGER NOT NULL,
    change_percentage REAL,
    additions_count INTEGER,
    deletions_count INTEGER,
    additions_text TEXT,
    deletions_text TEXT,
    keywords_found TEXT DEFAULT '[]',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (url_id) REFERENCES urls(id) ON DELETE CASCADE,
    FOREIGN KEY (old_snapshot_id) REFERENCES content_snapshots(id),
    FOREIGN KEY (new_snapshot_id) REFERENCES content_snapshots(id)
  )
`);

// AI Analysis table - stores Claude's intelligence
db.exec(`
  CREATE TABLE IF NOT EXISTS ai_analysis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    change_id INTEGER NOT NULL,
    relevance_score INTEGER CHECK(relevance_score >= 1 AND relevance_score <= 10),
    summary TEXT,
    category TEXT,
    competitive_threats TEXT,
    strategic_opportunities TEXT,
    raw_response TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (change_id) REFERENCES changes(id) ON DELETE CASCADE
  )
`);

// Monitoring runs table - track execution history
db.exec(`
  CREATE TABLE IF NOT EXISTS monitoring_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    run_type TEXT NOT NULL,
    status TEXT DEFAULT 'running',
    urls_checked INTEGER DEFAULT 0,
    changes_detected INTEGER DEFAULT 0,
    errors TEXT,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME
  )
`);

// Configuration table
db.exec(`
  CREATE TABLE IF NOT EXISTS config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create indexes for performance
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_snapshots_url_created ON content_snapshots(url_id, created_at);
  CREATE INDEX IF NOT EXISTS idx_changes_created ON changes(created_at);
  CREATE INDEX IF NOT EXISTS idx_ai_analysis_score ON ai_analysis(relevance_score);
  CREATE INDEX IF NOT EXISTS idx_monitoring_runs_started ON monitoring_runs(started_at);
`);

// Insert default configuration
const insertConfig = db.prepare(`
  INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)
`);

const defaultConfig = {
  'ai_threshold': '6',
  'change_threshold': '10',
  'retention_days': '30',
  'brief_schedule': 'daily',
  'max_content_length': '500000',
  'default_check_frequency': '6h'
};

for (const [key, value] of Object.entries(defaultConfig)) {
  insertConfig.run(key, value);
}

// Insert initial companies if database is empty
const companyCount = db.prepare('SELECT COUNT(*) as count FROM companies').get().count;

if (companyCount === 0) {
  console.log('📊 Inserting initial companies...');
  
  const insertCompany = db.prepare(`
    INSERT INTO companies (name, type) VALUES (?, ?)
  `);
  
  const insertUrl = db.prepare(`
    INSERT INTO urls (company_id, url, type, keywords) VALUES (?, ?, ?, ?)
  `);
  
  // Initial companies from the Google Apps Script version
  const initialCompanies = [
    {
      name: 'OpenAI',
      type: 'competitor',
      urls: [
        { url: 'https://openai.com', type: 'homepage' },
        { url: 'https://openai.com/pricing', type: 'pricing' },
        { url: 'https://openai.com/blog', type: 'blog' }
      ],
      keywords: ['GPT', 'ChatGPT', 'DALL-E', 'API', 'model', 'release']
    },
    {
      name: 'Anthropic',
      type: 'competitor',
      urls: [
        { url: 'https://anthropic.com', type: 'homepage' },
        { url: 'https://anthropic.com/claude', type: 'product' }
      ],
      keywords: ['Claude', 'constitutional AI', 'safety', 'assistant']
    },
    {
      name: 'Google AI',
      type: 'competitor', 
      urls: [
        { url: 'https://ai.google', type: 'homepage' },
        { url: 'https://blog.google/technology/ai/', type: 'blog' }
      ],
      keywords: ['Bard', 'Gemini', 'PaLM', 'Duet AI']
    },
    {
      name: 'Microsoft AI',
      type: 'competitor',
      urls: [
        { url: 'https://www.microsoft.com/ai', type: 'homepage' },
        { url: 'https://azure.microsoft.com/en-us/products/ai-services/', type: 'product' }
      ],
      keywords: ['Copilot', 'Azure AI', 'Bing AI', 'partnership']
    }
  ];
  
  const transaction = db.transaction(() => {
    for (const company of initialCompanies) {
      const result = insertCompany.run(company.name, company.type);
      const companyId = result.lastInsertRowid;
      
      for (const urlData of company.urls) {
        insertUrl.run(
          companyId,
          urlData.url,
          urlData.type,
          JSON.stringify(company.keywords)
        );
      }
    }
  });
  
  transaction();
  console.log(`✅ Inserted ${initialCompanies.length} initial companies`);
}

// Display database statistics
const stats = {
  companies: db.prepare('SELECT COUNT(*) as count FROM companies').get().count,
  urls: db.prepare('SELECT COUNT(*) as count FROM urls').get().count,
  snapshots: db.prepare('SELECT COUNT(*) as count FROM content_snapshots').get().count,
  changes: db.prepare('SELECT COUNT(*) as count FROM changes').get().count,
  analyses: db.prepare('SELECT COUNT(*) as count FROM ai_analysis').get().count
};

console.log('\n📊 Database Statistics:');
console.log(`   Companies: ${stats.companies}`);
console.log(`   URLs: ${stats.urls}`);
console.log(`   Snapshots: ${stats.snapshots}`);
console.log(`   Changes: ${stats.changes}`);
console.log(`   AI Analyses: ${stats.analyses}`);

db.close();

console.log('\n✅ Database initialization complete!');
console.log(`📁 Database location: ${dbPath}`);
