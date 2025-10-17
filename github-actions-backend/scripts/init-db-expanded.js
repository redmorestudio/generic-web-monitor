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

console.log('🔧 Initializing AI Monitor database with expanded company list...');

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

// Enhanced analysis table
db.exec(`
  CREATE TABLE IF NOT EXISTS enhanced_analysis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    change_id INTEGER NOT NULL,
    products TEXT,
    technologies TEXT,
    companies TEXT,
    people TEXT,
    pricing TEXT,
    dates TEXT,
    locations TEXT,
    partnerships TEXT,
    acquisitions TEXT,
    threat_score INTEGER CHECK(threat_score >= 0 AND threat_score <= 10),
    strategic_implications TEXT,
    suggested_groups TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (change_id) REFERENCES changes(id) ON DELETE CASCADE
  )
`);

// Groups table
db.exec(`
  CREATE TABLE IF NOT EXISTS groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT,
    icon TEXT,
    ai_suggested BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
  CREATE INDEX IF NOT EXISTS idx_enhanced_analysis_threat ON enhanced_analysis(threat_score);
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

// Clear existing companies to load the expanded set
console.log('🧹 Clearing existing companies to load expanded set...');
db.exec('DELETE FROM companies');

// Insert expanded company list
console.log('📊 Inserting expanded company list (~50 companies)...');

const insertCompany = db.prepare(`
  INSERT INTO companies (name, type) VALUES (?, ?)
`);

const insertUrl = db.prepare(`
  INSERT INTO urls (company_id, url, type, keywords) VALUES (?, ?, ?, ?)
`);

// Expanded companies across all AI sectors
const expandedCompanies = [
  // === MAJOR LLM PROVIDERS ===
  {
    name: 'OpenAI',
    type: 'llm_provider',
    urls: [
      { url: 'https://openai.com', type: 'homepage' },
      { url: 'https://openai.com/pricing', type: 'pricing' },
      { url: 'https://openai.com/blog', type: 'blog' },
      { url: 'https://openai.com/chatgpt', type: 'product' }
    ],
    keywords: ['GPT', 'ChatGPT', 'DALL-E', 'API', 'model', 'release', 'o3', 'GPT-4', 'GPT-5']
  },
  {
    name: 'Anthropic',
    type: 'llm_provider',
    urls: [
      { url: 'https://anthropic.com', type: 'homepage' },
      { url: 'https://anthropic.com/claude', type: 'product' },
      { url: 'https://anthropic.com/pricing', type: 'pricing' },
      { url: 'https://anthropic.com/news', type: 'news' }
    ],
    keywords: ['Claude', 'Opus', 'Sonnet', 'Haiku', 'constitutional AI', 'safety', 'assistant']
  },
  {
    name: 'Google DeepMind',
    type: 'llm_provider',
    urls: [
      { url: 'https://deepmind.google', type: 'homepage' },
      { url: 'https://ai.google/discover/gemini', type: 'product' },
      { url: 'https://blog.google/technology/ai/', type: 'blog' }
    ],
    keywords: ['Gemini', 'Bard', 'PaLM', 'DeepMind', 'Duet AI', 'Ultra', 'Pro']
  },
  {
    name: 'Meta AI',
    type: 'llm_provider',
    urls: [
      { url: 'https://ai.meta.com', type: 'homepage' },
      { url: 'https://ai.meta.com/llama/', type: 'product' },
      { url: 'https://ai.meta.com/blog/', type: 'blog' }
    ],
    keywords: ['Llama', 'Meta AI', 'open source', 'PyTorch', 'research']
  },
  {
    name: 'Mistral AI',
    type: 'llm_provider',
    urls: [
      { url: 'https://mistral.ai', type: 'homepage' },
      { url: 'https://mistral.ai/news/', type: 'news' },
      { url: 'https://mistral.ai/technology/', type: 'technology' }
    ],
    keywords: ['Mistral', 'Mixtral', 'open model', 'European AI']
  },
  {
    name: 'Cohere',
    type: 'llm_provider',
    urls: [
      { url: 'https://cohere.com', type: 'homepage' },
      { url: 'https://cohere.com/products', type: 'products' },
      { url: 'https://cohere.com/pricing', type: 'pricing' },
      { url: 'https://cohere.com/blog', type: 'blog' }
    ],
    keywords: ['Command', 'Embed', 'Rerank', 'enterprise AI', 'RAG']
  },
  {
    name: 'AI21 Labs',
    type: 'llm_provider',
    urls: [
      { url: 'https://ai21.com', type: 'homepage' },
      { url: 'https://ai21.com/blog', type: 'blog' }
    ],
    keywords: ['Jurassic', 'Jamba', 'Wordtune', 'AI21 Studio']
  },
  {
    name: 'Inflection AI',
    type: 'llm_provider',
    urls: [
      { url: 'https://inflection.ai', type: 'homepage' },
      { url: 'https://pi.ai', type: 'product' }
    ],
    keywords: ['Pi', 'personal AI', 'Inflection-2', 'conversational']
  },
  {
    name: 'Aleph Alpha',
    type: 'llm_provider',
    urls: [
      { url: 'https://aleph-alpha.com', type: 'homepage' },
      { url: 'https://aleph-alpha.com/luminous', type: 'product' }
    ],
    keywords: ['Luminous', 'European AI', 'sovereign AI', 'multimodal']
  },
  {
    name: 'Stability AI',
    type: 'llm_provider',
    urls: [
      { url: 'https://stability.ai', type: 'homepage' },
      { url: 'https://stability.ai/news', type: 'news' }
    ],
    keywords: ['Stable Diffusion', 'StableLM', 'open source', 'generative']
  },

  // === AI-ASSISTED CODING ===
  {
    name: 'GitHub Copilot',
    type: 'ai_coding',
    urls: [
      { url: 'https://github.com/features/copilot', type: 'product' },
      { url: 'https://github.blog/tag/github-copilot/', type: 'blog' }
    ],
    keywords: ['Copilot', 'code completion', 'pair programming', 'GitHub']
  },
  {
    name: 'Codeium',
    type: 'ai_coding',
    urls: [
      { url: 'https://codeium.com', type: 'homepage' },
      { url: 'https://codeium.com/windsurf', type: 'product' },
      { url: 'https://codeium.com/pricing', type: 'pricing' },
      { url: 'https://codeium.com/blog', type: 'blog' }
    ],
    keywords: ['Windsurf', 'code editor', 'AI IDE', 'autocomplete']
  },
  {
    name: 'Cursor',
    type: 'ai_coding',
    urls: [
      { url: 'https://cursor.com', type: 'product' },
      { url: 'https://cursor.com/features', type: 'features' },
      { url: 'https://cursor.com/pricing', type: 'pricing' }
    ],
    keywords: ['Cursor', 'AI editor', 'code generation', 'Anysphere']
  },
  {
    name: 'Tabnine',
    type: 'ai_coding',
    urls: [
      { url: 'https://tabnine.com', type: 'homepage' },
      { url: 'https://tabnine.com/pricing', type: 'pricing' },
      { url: 'https://tabnine.com/blog', type: 'blog' }
    ],
    keywords: ['Tabnine', 'code completion', 'AI assistant', 'privacy']
  },
  {
    name: 'Replit',
    type: 'ai_coding',
    urls: [
      { url: 'https://replit.com', type: 'homepage' },
      { url: 'https://replit.com/ai', type: 'product' },
      { url: 'https://blog.replit.com', type: 'blog' }
    ],
    keywords: ['Replit AI', 'Ghostwriter', 'online IDE', 'collaborative']
  },
  {
    name: 'Amazon CodeWhisperer',
    type: 'ai_coding',
    urls: [
      { url: 'https://aws.amazon.com/codewhisperer/', type: 'product' },
      { url: 'https://aws.amazon.com/codewhisperer/features/', type: 'features' }
    ],
    keywords: ['CodeWhisperer', 'AWS', 'code generation', 'security scanning']
  },
  {
    name: 'Sourcegraph',
    type: 'ai_coding',
    urls: [
      { url: 'https://sourcegraph.com/cody', type: 'product' },
      { url: 'https://sourcegraph.com/pricing', type: 'pricing' },
      { url: 'https://about.sourcegraph.com/blog', type: 'blog' }
    ],
    keywords: ['Cody', 'code search', 'AI assistant', 'code intelligence']
  },
  {
    name: 'Pieces',
    type: 'ai_coding',
    urls: [
      { url: 'https://pieces.app', type: 'homepage' },
      { url: 'https://pieces.app/updates', type: 'updates' }
    ],
    keywords: ['Pieces', 'code snippets', 'developer productivity', 'AI copilot']
  },

  // === AI SEARCH & RESEARCH ===
  {
    name: 'Perplexity AI',
    type: 'ai_search',
    urls: [
      { url: 'https://perplexity.ai', type: 'homepage' },
      { url: 'https://perplexity.ai/pro', type: 'pricing' },
      { url: 'https://blog.perplexity.ai', type: 'blog' }
    ],
    keywords: ['Perplexity', 'AI search', 'research', 'citations', 'Pro']
  },
  {
    name: 'You.com',
    type: 'ai_search',
    urls: [
      { url: 'https://you.com', type: 'homepage' },
      { url: 'https://you.com/pro', type: 'pricing' },
      { url: 'https://about.you.com/blog/', type: 'blog' }
    ],
    keywords: ['You.com', 'personalized search', 'AI chat', 'privacy']
  },
  {
    name: 'Phind',
    type: 'ai_search',
    urls: [
      { url: 'https://phind.com', type: 'homepage' },
      { url: 'https://phind.com/about', type: 'about' }
    ],
    keywords: ['Phind', 'developer search', 'code search', 'technical']
  },
  {
    name: 'Andi',
    type: 'ai_search',
    urls: [
      { url: 'https://andisearch.com', type: 'homepage' }
    ],
    keywords: ['Andi', 'conversational search', 'privacy-focused', 'ad-free']
  },
  {
    name: 'Neeva',
    type: 'ai_search',
    urls: [
      { url: 'https://neeva.com', type: 'homepage' }
    ],
    keywords: ['Neeva', 'ad-free search', 'privacy', 'subscription']
  },

  // === AI VOICE & AUDIO ===
  {
    name: 'ElevenLabs',
    type: 'ai_voice',
    urls: [
      { url: 'https://elevenlabs.io', type: 'homepage' },
      { url: 'https://elevenlabs.io/pricing', type: 'pricing' },
      { url: 'https://elevenlabs.io/blog', type: 'blog' }
    ],
    keywords: ['ElevenLabs', 'voice synthesis', 'voice cloning', 'text-to-speech']
  },
  {
    name: 'Descript',
    type: 'ai_voice',
    urls: [
      { url: 'https://descript.com', type: 'homepage' },
      { url: 'https://descript.com/pricing', type: 'pricing' },
      { url: 'https://descript.com/blog', type: 'blog' }
    ],
    keywords: ['Descript', 'Overdub', 'podcast editing', 'transcription']
  },
  {
    name: 'Resemble AI',
    type: 'ai_voice',
    urls: [
      { url: 'https://resemble.ai', type: 'homepage' },
      { url: 'https://resemble.ai/pricing/', type: 'pricing' }
    ],
    keywords: ['Resemble', 'voice cloning', 'speech synthesis', 'deepfake detection']
  },
  {
    name: 'Murf AI',
    type: 'ai_voice',
    urls: [
      { url: 'https://murf.ai', type: 'homepage' },
      { url: 'https://murf.ai/pricing', type: 'pricing' }
    ],
    keywords: ['Murf', 'voiceover', 'text-to-speech', 'studio quality']
  },
  {
    name: 'WellSaid Labs',
    type: 'ai_voice',
    urls: [
      { url: 'https://wellsaidlabs.com', type: 'homepage' },
      { url: 'https://wellsaidlabs.com/pricing/', type: 'pricing' }
    ],
    keywords: ['WellSaid', 'voice avatar', 'enterprise TTS', 'studio']
  },

  // === VIDEO & MEDIA AI ===
  {
    name: 'Synthesia',
    type: 'ai_video',
    urls: [
      { url: 'https://synthesia.io', type: 'homepage' },
      { url: 'https://synthesia.io/features', type: 'features' },
      { url: 'https://synthesia.io/pricing', type: 'pricing' }
    ],
    keywords: ['Synthesia', 'AI avatar', 'video generation', 'training videos']
  },
  {
    name: 'RunwayML',
    type: 'ai_video',
    urls: [
      { url: 'https://runwayml.com', type: 'homepage' },
      { url: 'https://runwayml.com/pricing', type: 'pricing' },
      { url: 'https://runwayml.com/research', type: 'research' }
    ],
    keywords: ['Runway', 'Gen-2', 'video editing', 'creative AI']
  },
  {
    name: 'Pika',
    type: 'ai_video',
    urls: [
      { url: 'https://pika.art', type: 'homepage' },
      { url: 'https://pika.art/pricing', type: 'pricing' }
    ],
    keywords: ['Pika', 'video generation', 'text-to-video', 'animation']
  },
  {
    name: 'HeyGen',
    type: 'ai_video',
    urls: [
      { url: 'https://heygen.com', type: 'homepage' },
      { url: 'https://heygen.com/pricing', type: 'pricing' }
    ],
    keywords: ['HeyGen', 'AI spokesperson', 'video avatar', 'localization']
  },

  // === IMAGE GENERATION ===
  {
    name: 'Midjourney',
    type: 'ai_image',
    urls: [
      { url: 'https://midjourney.com', type: 'homepage' },
      { url: 'https://docs.midjourney.com', type: 'docs' }
    ],
    keywords: ['Midjourney', 'image generation', 'Discord', 'v6', 'artistic']
  },
  {
    name: 'Ideogram',
    type: 'ai_image',
    urls: [
      { url: 'https://ideogram.ai', type: 'homepage' },
      { url: 'https://ideogram.ai/about', type: 'about' }
    ],
    keywords: ['Ideogram', 'text rendering', 'image generation', 'typography']
  },
  {
    name: 'Leonardo AI',
    type: 'ai_image',
    urls: [
      { url: 'https://leonardo.ai', type: 'homepage' },
      { url: 'https://leonardo.ai/pricing', type: 'pricing' }
    ],
    keywords: ['Leonardo', 'game assets', 'concept art', 'AI canvas']
  },

  // === ENTERPRISE AI ===
  {
    name: 'Scale AI',
    type: 'enterprise_ai',
    urls: [
      { url: 'https://scale.com', type: 'homepage' },
      { url: 'https://scale.com/llm', type: 'product' },
      { url: 'https://scale.com/blog', type: 'blog' }
    ],
    keywords: ['Scale', 'data labeling', 'RLHF', 'enterprise', 'government']
  },
  {
    name: 'Dataiku',
    type: 'enterprise_ai',
    urls: [
      { url: 'https://dataiku.com', type: 'homepage' },
      { url: 'https://dataiku.com/product/', type: 'product' },
      { url: 'https://blog.dataiku.com', type: 'blog' }
    ],
    keywords: ['Dataiku', 'MLOps', 'data science', 'platform', 'governance']
  },
  {
    name: 'DataRobot',
    type: 'enterprise_ai',
    urls: [
      { url: 'https://datarobot.com', type: 'homepage' },
      { url: 'https://datarobot.com/platform/', type: 'platform' },
      { url: 'https://datarobot.com/blog/', type: 'blog' }
    ],
    keywords: ['DataRobot', 'AutoML', 'prediction', 'deployment', 'monitoring']
  },

  // === AI INFRASTRUCTURE ===
  {
    name: 'Hugging Face',
    type: 'ai_infrastructure',
    urls: [
      { url: 'https://huggingface.co', type: 'homepage' },
      { url: 'https://huggingface.co/blog', type: 'blog' },
      { url: 'https://huggingface.co/pricing', type: 'pricing' }
    ],
    keywords: ['Hugging Face', 'transformers', 'model hub', 'datasets', 'spaces']
  },
  {
    name: 'LangChain',
    type: 'ai_infrastructure',
    urls: [
      { url: 'https://langchain.com', type: 'homepage' },
      { url: 'https://langchain.com/langsmith', type: 'product' },
      { url: 'https://blog.langchain.dev', type: 'blog' }
    ],
    keywords: ['LangChain', 'LangSmith', 'orchestration', 'agents', 'RAG']
  },
  {
    name: 'Weights & Biases',
    type: 'ai_infrastructure',
    urls: [
      { url: 'https://wandb.ai', type: 'homepage' },
      { url: 'https://wandb.ai/pricing', type: 'pricing' },
      { url: 'https://wandb.ai/fully-connected', type: 'blog' }
    ],
    keywords: ['W&B', 'MLOps', 'experiment tracking', 'model registry']
  },
  {
    name: 'Modular',
    type: 'ai_infrastructure',
    urls: [
      { url: 'https://modular.com', type: 'homepage' },
      { url: 'https://modular.com/mojo', type: 'product' }
    ],
    keywords: ['Mojo', 'AI compiler', 'performance', 'Python compatible']
  },

  // === AI HARDWARE ===
  {
    name: 'NVIDIA AI',
    type: 'ai_hardware',
    urls: [
      { url: 'https://nvidia.com/ai', type: 'homepage' },
      { url: 'https://blogs.nvidia.com/blog/category/artificial-intelligence/', type: 'blog' }
    ],
    keywords: ['NVIDIA', 'GPU', 'CUDA', 'DGX', 'H100', 'inference']
  },
  {
    name: 'Cerebras',
    type: 'ai_hardware',
    urls: [
      { url: 'https://cerebras.net', type: 'homepage' },
      { url: 'https://cerebras.net/blog/', type: 'blog' }
    ],
    keywords: ['Cerebras', 'WSE', 'wafer scale', 'CS-2', 'training']
  },
  {
    name: 'Graphcore',
    type: 'ai_hardware',
    urls: [
      { url: 'https://graphcore.ai', type: 'homepage' },
      { url: 'https://graphcore.ai/posts', type: 'blog' }
    ],
    keywords: ['Graphcore', 'IPU', 'Bow', 'intelligence processing', 'Poplar']
  }
];

const transaction = db.transaction(() => {
  for (const company of expandedCompanies) {
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
console.log(`✅ Inserted ${expandedCompanies.length} companies with their URLs`);

// Display database statistics
const stats = {
  companies: db.prepare('SELECT COUNT(*) as count FROM companies').get().count,
  urls: db.prepare('SELECT COUNT(*) as count FROM urls').get().count,
  companyTypes: db.prepare('SELECT type, COUNT(*) as count FROM companies GROUP BY type').all(),
  urlTypes: db.prepare('SELECT type, COUNT(*) as count FROM urls GROUP BY type').all()
};

console.log('\n📊 Database Statistics:');
console.log(`   Total Companies: ${stats.companies}`);
console.log(`   Total URLs: ${stats.urls}`);
console.log('\n   Companies by Type:');
stats.companyTypes.forEach(ct => {
  console.log(`     ${ct.type}: ${ct.count}`);
});
console.log('\n   URLs by Type:');
stats.urlTypes.forEach(ut => {
  console.log(`     ${ut.type}: ${ut.count}`);
});

db.close();

console.log('\n✅ Database initialization complete with expanded company list!');
console.log(`📁 Database location: ${dbPath}`);
console.log('\n🚀 Ready to monitor the entire AI landscape!');
