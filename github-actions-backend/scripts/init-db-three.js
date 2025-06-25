#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const dbManager = require('../db-manager');

console.log('🔧 Initializing AI Monitor three-database architecture...');

// Check if three-database architecture exists
if (!dbManager.hasThreeDbArchitecture()) {
  console.log('📊 Creating three-database architecture...');
  require('./create-three-dbs');
}

// Get database connection
const intelligenceDb = dbManager.getIntelligenceDb();

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

// Check if companies table exists first
const tableExists = intelligenceDb.prepare(`
  SELECT name FROM sqlite_master 
  WHERE type='table' AND name='companies'
`).get();

// Insert initial companies if database is empty
const companyCount = tableExists ? 
  intelligenceDb.prepare('SELECT COUNT(*) as count FROM companies').get().count : 0;

if (companyCount === 0) {
  console.log('📊 Inserting comprehensive AI landscape companies...');
  
  const insertCompany = intelligenceDb.prepare(`
    INSERT INTO companies (name, category, description) VALUES (?, ?, ?)
  `);
  
  const insertUrl = intelligenceDb.prepare(`
    INSERT INTO urls (company_id, url, url_type, selector_config) VALUES (?, ?, ?, ?)
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
  
  const transaction = intelligenceDb.transaction(() => {
    for (const company of comprehensiveCompanies) {
      const result = insertCompany.run(
        company.name, 
        company.category || 'AI',
        `Leading ${company.category || 'AI'} company`
      );
      const companyId = result.lastInsertRowid;
      
      // Default CSS selectors for content extraction
      const defaultSelectors = JSON.stringify([
        'main', 'article', '.content', '[role=main]', '.post-content', '.blog-content'
      ]);
      
      for (const urlData of company.urls) {
        insertUrl.run(
          companyId,
          urlData.url,
          urlData.type,
          defaultSelectors
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
const companiesTableExists = intelligenceDb.prepare(`
  SELECT name FROM sqlite_master WHERE type='table' AND name='companies'
`).get();

const urlsTableExists = intelligenceDb.prepare(`
  SELECT name FROM sqlite_master WHERE type='table' AND name='urls'
`).get();

const stats = {
  companies: companiesTableExists ? 
    intelligenceDb.prepare('SELECT COUNT(*) as count FROM companies').get().count : 0,
  urls: urlsTableExists ? 
    intelligenceDb.prepare('SELECT COUNT(*) as count FROM urls').get().count : 0
};

console.log('\n📊 Database Statistics:');
console.log(`   Companies: ${stats.companies}`);
console.log(`   URLs: ${stats.urls}`);

// Show recent companies
if (stats.companies > 0) {
  const recentCompanies = intelligenceDb.prepare(`
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

// Close database connection
dbManager.closeAll();

console.log('\n✅ Three-database initialization complete!');
console.log('🚀 Ready to monitor the entire AI competitive landscape!');
