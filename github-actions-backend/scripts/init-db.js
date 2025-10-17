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
    category TEXT DEFAULT 'AI',
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

// Load the comprehensive 50+ company configuration
function loadCompanyConfig() {
  try {
    // Try to load from the scripts config.json
    const configPath = path.join(__dirname, '..', 'scripts', 'config.json');
    if (fs.existsSync(configPath)) {
      const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return configData.companies || [];
    }
    
    // Fallback to github-actions-solution config
    const fallbackPath = path.join(__dirname, '..', '..', 'github-actions-solution', 'scripts', 'config.json');
    if (fs.existsSync(fallbackPath)) {
      const configData = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
      return configData.companies || [];
    }
    
    console.log('⚠️  Config file not found, using default companies');
    return [];
  } catch (error) {
    console.log('⚠️  Error loading config, using default companies:', error.message);
    return [];
  }
}

// Insert initial companies if database is empty
const companyCount = db.prepare('SELECT COUNT(*) as count FROM companies').get().count;

if (companyCount === 0) {
  console.log('📊 Inserting comprehensive AI landscape companies...');
  
  const insertCompany = db.prepare(`
    INSERT INTO companies (name, type, category) VALUES (?, ?, ?)
  `);
  
  const insertUrl = db.prepare(`
    INSERT INTO urls (company_id, url, type, keywords) VALUES (?, ?, ?, ?)
  `);
  
  // Load comprehensive configuration
  const configCompanies = loadCompanyConfig();
  
  // Complete 50+ company configuration covering entire AI landscape
  const comprehensiveCompanies = configCompanies.length > 0 ? configCompanies : [
    // LLM Providers
    {
      name: "OpenAI", category: "LLM Providers",
      urls: [
        { url: "https://openai.com", type: "homepage" },
        { url: "https://openai.com/chatgpt", type: "product" },
        { url: "https://openai.com/pricing", type: "pricing" },
        { url: "https://openai.com/blog", type: "blog" }
      ]
    },
    {
      name: "Anthropic", category: "LLM Providers",
      urls: [
        { url: "https://anthropic.com", type: "homepage" },
        { url: "https://anthropic.com/claude", type: "product" },
        { url: "https://anthropic.com/pricing", type: "pricing" },
        { url: "https://anthropic.com/news", type: "news" }
      ]
    },
    {
      name: "Google DeepMind", category: "LLM Providers",
      urls: [
        { url: "https://deepmind.google", type: "homepage" },
        { url: "https://ai.google/discover/gemini", type: "product" },
        { url: "https://blog.google/technology/ai", type: "blog" }
      ]
    },
    {
      name: "Meta AI", category: "LLM Providers",
      urls: [
        { url: "https://ai.meta.com", type: "homepage" },
        { url: "https://ai.meta.com/llama", type: "product" },
        { url: "https://ai.meta.com/blog", type: "blog" }
      ]
    },
    {
      name: "Mistral AI", category: "LLM Providers",
      urls: [
        { url: "https://mistral.ai", type: "homepage" },
        { url: "https://mistral.ai/technology", type: "product" },
        { url: "https://mistral.ai/pricing", type: "pricing" }
      ]
    },
    {
      name: "Cohere", category: "LLM Providers",
      urls: [
        { url: "https://cohere.ai", type: "homepage" },
        { url: "https://cohere.ai/products", type: "product" },
        { url: "https://cohere.ai/pricing", type: "pricing" }
      ]
    },
    {
      name: "AI21 Labs", category: "LLM Providers",
      urls: [
        { url: "https://ai21.com", type: "homepage" },
        { url: "https://ai21.com/jamba", type: "product" },
        { url: "https://ai21.com/blog", type: "blog" }
      ]
    },
    {
      name: "Stability AI", category: "LLM Providers",
      urls: [
        { url: "https://stability.ai", type: "homepage" },
        { url: "https://stability.ai/stable-diffusion", type: "product" },
        { url: "https://stability.ai/blog", type: "blog" }
      ]
    },
    
    // AI Coding
    {
      name: "GitHub Copilot", category: "AI Coding",
      urls: [
        { url: "https://github.com/features/copilot", type: "homepage" },
        { url: "https://github.com/pricing", type: "pricing" },
        { url: "https://github.blog/tag/github-copilot", type: "blog" }
      ]
    },
    {
      name: "Codeium", category: "AI Coding",
      urls: [
        { url: "https://codeium.com", type: "homepage" },
        { url: "https://codeium.com/windsurf", type: "product" },
        { url: "https://codeium.com/pricing", type: "pricing" }
      ]
    },
    {
      name: "Cursor", category: "AI Coding",
      urls: [
        { url: "https://cursor.com", type: "homepage" },
        { url: "https://cursor.com/features", type: "features" },
        { url: "https://cursor.com/pricing", type: "pricing" }
      ]
    },
    {
      name: "Tabnine", category: "AI Coding",
      urls: [
        { url: "https://tabnine.com", type: "homepage" },
        { url: "https://tabnine.com/pricing", type: "pricing" },
        { url: "https://tabnine.com/blog", type: "blog" }
      ]
    },
    
    // AI Search
    {
      name: "Perplexity AI", category: "AI Search",
      urls: [
        { url: "https://perplexity.ai", type: "homepage" },
        { url: "https://perplexity.ai/pro", type: "product" },
        { url: "https://blog.perplexity.ai", type: "blog" }
      ]
    },
    {
      name: "You.com", category: "AI Search",
      urls: [
        { url: "https://you.com", type: "homepage" },
        { url: "https://you.com/code", type: "product" }
      ]
    },
    
    // Video AI
    {
      name: "Synthesia", category: "Video AI",
      urls: [
        { url: "https://synthesia.io", type: "homepage" },
        { url: "https://synthesia.io/pricing", type: "pricing" },
        { url: "https://synthesia.io/blog", type: "blog" }
      ]
    },
    {
      name: "HeyGen", category: "Video AI",
      urls: [
        { url: "https://heygen.com", type: "homepage" },
        { url: "https://heygen.com/pricing", type: "pricing" },
        { url: "https://heygen.com/blog", type: "blog" }
      ]
    },
    {
      name: "Runway", category: "Video AI",
      urls: [
        { url: "https://runwayml.com", type: "homepage" },
        { url: "https://runwayml.com/pricing", type: "pricing" },
        { url: "https://runwayml.com/blog", type: "blog" }
      ]
    },
    
    // Voice AI
    {
      name: "ElevenLabs", category: "AI Voice/Audio",
      urls: [
        { url: "https://elevenlabs.io", type: "homepage" },
        { url: "https://elevenlabs.io/pricing", type: "pricing" },
        { url: "https://elevenlabs.io/blog", type: "blog" }
      ]
    },
    {
      name: "Descript", category: "AI Voice/Audio",
      urls: [
        { url: "https://descript.com", type: "homepage" },
        { url: "https://descript.com/pricing", type: "pricing" },
        { url: "https://descript.com/blog", type: "blog" }
      ]
    },
    
    // Image Generation
    {
      name: "Midjourney", category: "Image Generation",
      urls: [
        { url: "https://midjourney.com", type: "homepage" },
        { url: "https://docs.midjourney.com", type: "docs" }
      ]
    },
    {
      name: "Ideogram", category: "Image Generation",
      urls: [
        { url: "https://ideogram.ai", type: "homepage" },
        { url: "https://ideogram.ai/pricing", type: "pricing" }
      ]
    },
    
    // Enterprise AI
    {
      name: "Palantir", category: "Enterprise AI",
      urls: [
        { url: "https://palantir.com", type: "homepage" },
        { url: "https://palantir.com/platforms/aip", type: "product" },
        { url: "https://blog.palantir.com", type: "blog" }
      ]
    },
    {
      name: "Scale AI", category: "Enterprise AI",
      urls: [
        { url: "https://scale.com", type: "homepage" },
        { url: "https://scale.com/enterprise", type: "product" },
        { url: "https://scale.com/blog", type: "blog" }
      ]
    },
    
    // AI Infrastructure
    {
      name: "Hugging Face", category: "AI Infrastructure",
      urls: [
        { url: "https://huggingface.co", type: "homepage" },
        { url: "https://huggingface.co/pricing", type: "pricing" },
        { url: "https://huggingface.co/blog", type: "blog" }
      ]
    },
    {
      name: "LangChain", category: "AI Infrastructure",
      urls: [
        { url: "https://langchain.com", type: "homepage" },
        { url: "https://langchain.com/langsmith", type: "product" },
        { url: "https://blog.langchain.dev", type: "blog" }
      ]
    },
    
    // AI Hardware
    {
      name: "NVIDIA", category: "AI Hardware",
      urls: [
        { url: "https://nvidia.com/ai", type: "homepage" },
        { url: "https://blogs.nvidia.com/ai", type: "blog" }
      ]
    }
  ];
  
  const transaction = db.transaction(() => {
    for (const company of comprehensiveCompanies) {
      const result = insertCompany.run(
        company.name, 
        'competitor', 
        company.category || 'AI'
      );
      const companyId = result.lastInsertRowid;
      
      const keywords = JSON.stringify([
        company.name.toLowerCase(),
        'AI', 'artificial intelligence', 'release', 'update', 'pricing'
      ]);
      
      for (const urlData of company.urls) {
        insertUrl.run(
          companyId,
          urlData.url,
          urlData.type,
          keywords
        );
      }
    }
  });
  
  transaction();
  console.log(`✅ Inserted ${comprehensiveCompanies.length} companies across the entire AI landscape`);
  
  // Display categories
  const categoryStats = {};
  comprehensiveCompanies.forEach(company => {
    const category = company.category || 'AI';
    categoryStats[category] = (categoryStats[category] || 0) + 1;
  });
  
  console.log('\n📊 Coverage by Category:');
  for (const [category, count] of Object.entries(categoryStats)) {
    console.log(`   ${category}: ${count} companies`);
  }
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

// Show recent companies
if (stats.companies > 0) {
  const recentCompanies = db.prepare(`
    SELECT name, category, COUNT(urls.id) as url_count
    FROM companies 
    LEFT JOIN urls ON companies.id = urls.company_id 
    GROUP BY companies.id 
    ORDER BY companies.created_at DESC 
    LIMIT 10
  `).all();
  
  console.log('\n🏢 Recent Companies:');
  recentCompanies.forEach(company => {
    console.log(`   ${company.name} (${company.category || 'AI'}) - ${company.url_count} URLs`);
  });
}

db.close();

console.log('\n✅ Database initialization complete!');
console.log(`📁 Database location: ${dbPath}`);
console.log('🚀 Ready to monitor the entire AI competitive landscape!');
