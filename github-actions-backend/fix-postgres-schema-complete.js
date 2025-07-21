#!/usr/bin/env node

/**
 * Complete PostgreSQL Schema Fix
 * 
 * Creates ALL necessary tables and schemas for the AI Competitive Monitor
 * including all missing tables needed by the static data generator
 */

require('dotenv').config();
const { db, end } = require('./postgres-db');

async function fixSchemaComplete() {
  try {
    console.log('🔧 Running complete PostgreSQL schema fix...\n');
    
    // 1. Create schemas if they don't exist
    console.log('📂 Creating schemas...');
    await db.run('CREATE SCHEMA IF NOT EXISTS raw_content');
    await db.run('CREATE SCHEMA IF NOT EXISTS processed_content');
    await db.run('CREATE SCHEMA IF NOT EXISTS intelligence');
    console.log('✅ Schemas ready\n');

    // 2. Create companies and urls tables in intelligence schema
    console.log('📊 Creating intelligence tables...');
    await db.run(`
      CREATE TABLE IF NOT EXISTS intelligence.companies (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        category TEXT,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await db.run(`
      CREATE TABLE IF NOT EXISTS intelligence.company_urls (
        id SERIAL PRIMARY KEY,
        company_id INTEGER REFERENCES intelligence.companies(id),
        url TEXT NOT NULL,
        name TEXT,
        url_type TEXT,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(company_id, url)
      )
    `);

    // Create company_attributes table (MISSING)
    await db.run(`
      CREATE TABLE IF NOT EXISTS intelligence.company_attributes (
        id SERIAL PRIMARY KEY,
        company_id INTEGER REFERENCES intelligence.companies(id) UNIQUE,
        industry TEXT,
        description TEXT,
        founded_year INTEGER,
        headquarters TEXT,
        website TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create insights table (MISSING)
    await db.run(`
      CREATE TABLE IF NOT EXISTS intelligence.insights (
        id SERIAL PRIMARY KEY,
        company_id INTEGER REFERENCES intelligence.companies(id),
        insight_type TEXT,
        title TEXT,
        content TEXT,
        confidence_score DECIMAL(3,2),
        source_urls TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create scraping_runs table
    await db.run(`
      CREATE TABLE IF NOT EXISTS intelligence.scraping_runs (
        id SERIAL PRIMARY KEY,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        urls_total INTEGER DEFAULT 0,
        urls_succeeded INTEGER DEFAULT 0,
        urls_failed INTEGER DEFAULT 0,
        changes_detected INTEGER DEFAULT 0,
        duration_seconds INTEGER,
        errors JSONB,
        captchas_encountered INTEGER DEFAULT 0,
        status TEXT DEFAULT 'running'
      )
    `);

    console.log('✅ Intelligence tables ready\n');

    // 3. Create scraped_pages table in raw_content schema
    console.log('📊 Creating raw_content tables...');
    await db.run(`
      CREATE TABLE IF NOT EXISTS raw_content.scraped_pages (
        id SERIAL PRIMARY KEY,
        company TEXT NOT NULL,
        url TEXT NOT NULL,
        url_name TEXT,
        content TEXT,
        html TEXT,
        title TEXT,
        content_hash TEXT,
        scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        change_detected BOOLEAN DEFAULT false,
        previous_hash TEXT,
        interest_level INTEGER DEFAULT 5,
        scrape_status TEXT DEFAULT 'pending',
        captcha_type TEXT,
        error_message TEXT
      )
    `);

    await db.run(`
      CREATE TABLE IF NOT EXISTS raw_content.company_pages_baseline (
        id SERIAL PRIMARY KEY,
        company TEXT NOT NULL,
        url TEXT NOT NULL,
        url_name TEXT,
        content TEXT,
        html TEXT,
        title TEXT,
        content_hash TEXT,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        update_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(company, url)
      )
    `);

    console.log('✅ Raw content tables ready\n');

    // 4. Create the markdown_pages table
    console.log('📊 Creating processed_content tables...');
    await db.run(`
      CREATE TABLE IF NOT EXISTS processed_content.markdown_pages (
        id SERIAL PRIMARY KEY,
        company TEXT NOT NULL,
        url TEXT NOT NULL,
        url_name TEXT,
        content TEXT,
        markdown_hash TEXT,
        source_hash TEXT UNIQUE,
        source_type TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        title TEXT
      )
    `);

    // Create change_detection table
    await db.run(`
      CREATE TABLE IF NOT EXISTS processed_content.change_detection (
        id SERIAL PRIMARY KEY,
        company TEXT NOT NULL,
        url TEXT,
        url_name TEXT,
        change_type TEXT,
        old_hash TEXT,
        new_hash TEXT,
        detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        interest_level INTEGER DEFAULT 5,
        ai_analysis JSONB,
        title TEXT
      )
    `);

    // Create baseline_analysis table (MISSING)
    await db.run(`
      CREATE TABLE IF NOT EXISTS processed_content.baseline_analysis (
        id SERIAL PRIMARY KEY,
        url_id INTEGER REFERENCES intelligence.company_urls(id),
        company_id INTEGER REFERENCES intelligence.companies(id),
        content_hash TEXT,
        entities JSONB,
        themes JSONB,
        key_points JSONB,
        technologies TEXT[],
        products TEXT[],
        partnerships TEXT[],
        financial_data JSONB,
        sentiment_score DECIMAL(3,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Processed content tables ready\n');

    // 5. Create indexes
    console.log('🔍 Creating indexes...');
    const indexes = [
      // scraped_pages indexes
      'CREATE INDEX IF NOT EXISTS idx_scraped_pages_company ON raw_content.scraped_pages(company)',
      'CREATE INDEX IF NOT EXISTS idx_scraped_pages_url ON raw_content.scraped_pages(url)',
      'CREATE INDEX IF NOT EXISTS idx_scraped_pages_scraped_at ON raw_content.scraped_pages(scraped_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_scraped_pages_content_hash ON raw_content.scraped_pages(content_hash)',
      
      // markdown_pages indexes
      'CREATE INDEX IF NOT EXISTS idx_markdown_pages_source_hash ON processed_content.markdown_pages(source_hash)',
      'CREATE INDEX IF NOT EXISTS idx_markdown_pages_company ON processed_content.markdown_pages(company)',
      'CREATE INDEX IF NOT EXISTS idx_markdown_pages_url ON processed_content.markdown_pages(url)',
      
      // change_detection indexes
      'CREATE INDEX IF NOT EXISTS idx_change_detection_company ON processed_content.change_detection(company)',
      'CREATE INDEX IF NOT EXISTS idx_change_detection_detected_at ON processed_content.change_detection(detected_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_change_detection_interest_level ON processed_content.change_detection(interest_level DESC)',
      
      // baseline_analysis indexes
      'CREATE INDEX IF NOT EXISTS idx_baseline_analysis_url_id ON processed_content.baseline_analysis(url_id)',
      'CREATE INDEX IF NOT EXISTS idx_baseline_analysis_company_id ON processed_content.baseline_analysis(company_id)',
      'CREATE INDEX IF NOT EXISTS idx_baseline_analysis_created_at ON processed_content.baseline_analysis(created_at DESC)',
      
      // company and urls indexes
      'CREATE INDEX IF NOT EXISTS idx_companies_name ON intelligence.companies(name)',
      'CREATE INDEX IF NOT EXISTS idx_companies_active ON intelligence.companies(active)',
      'CREATE INDEX IF NOT EXISTS idx_company_urls_company_id ON intelligence.company_urls(company_id)',
      'CREATE INDEX IF NOT EXISTS idx_company_urls_url ON intelligence.company_urls(url)',
      'CREATE INDEX IF NOT EXISTS idx_company_urls_active ON intelligence.company_urls(active)',
      
      // insights indexes
      'CREATE INDEX IF NOT EXISTS idx_insights_company_id ON intelligence.insights(company_id)',
      'CREATE INDEX IF NOT EXISTS idx_insights_created_at ON intelligence.insights(created_at DESC)'
    ];

    for (const index of indexes) {
      try {
        await db.run(index);
      } catch (err) {
        // Ignore if index already exists
        if (!err.message.includes('already exists')) {
          console.error(`Error creating index: ${err.message}`);
        }
      }
    }
    console.log('✅ Indexes created\n');

    // 6. Verify all tables exist
    console.log('🔍 Verifying all required tables...\n');
    const requiredTables = [
      { schema: 'raw_content', table: 'scraped_pages' },
      { schema: 'raw_content', table: 'company_pages_baseline' },
      { schema: 'processed_content', table: 'markdown_pages' },
      { schema: 'processed_content', table: 'change_detection' },
      { schema: 'processed_content', table: 'baseline_analysis' },
      { schema: 'intelligence', table: 'companies' },
      { schema: 'intelligence', table: 'company_urls' },
      { schema: 'intelligence', table: 'company_attributes' },
      { schema: 'intelligence', table: 'insights' },
      { schema: 'intelligence', table: 'scraping_runs' }
    ];

    let allGood = true;
    for (const { schema, table } of requiredTables) {
      const exists = await db.get(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = $1 
          AND table_name = $2
        )`, [schema, table]);
      
      if (exists.exists) {
        console.log(`✅ ${schema}.${table}`);
      } else {
        console.log(`❌ ${schema}.${table} - MISSING!`);
        allGood = false;
      }
    }

    console.log('\n✨ Schema fix complete!');
    
    if (!allGood) {
      console.log('\n⚠️  Some tables are still missing. Please check the errors above.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Error fixing schema:', error);
    process.exit(1);
  } finally {
    await end();
  }
}

// Run if called directly
if (require.main === module) {
  fixSchemaComplete()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { fixSchemaComplete };
