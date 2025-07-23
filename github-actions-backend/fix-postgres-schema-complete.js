#!/usr/bin/env node

/**
 * Complete PostgreSQL Schema Fix - July 22, 2025
 * Fixes all schema issues after recent corruption
 */

// Load environment variables
// Only load dotenv in development (not in GitHub Actions)
if (!process.env.GITHUB_ACTIONS && !process.env.POSTGRES_CONNECTION_STRING) {
  try {
    require('dotenv').config();
  } catch (e) {
    // dotenv not available or no .env file - this is fine
  }
}

// SSL Certificate fix for Heroku PostgreSQL
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { db, end } = require('./postgres-db');

async function fixPostgresSchema() {
  console.log('🔧 Complete PostgreSQL Schema Fix - Starting...\n');
  
  try {
    // 1. Create schemas if missing
    console.log('📂 Creating schemas...');
    await db.run('CREATE SCHEMA IF NOT EXISTS intelligence');
    await db.run('CREATE SCHEMA IF NOT EXISTS raw_content');
    await db.run('CREATE SCHEMA IF NOT EXISTS processed_content');
    
    // 2. Fix intelligence schema tables
    console.log('\n🏢 Fixing intelligence.companies...');
    await db.run(`
      CREATE TABLE IF NOT EXISTS intelligence.companies (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        category TEXT,
        interest_level INTEGER DEFAULT 5
      )
    `);
    
    console.log('🔗 Fixing intelligence.urls...');
    await db.run(`
      CREATE TABLE IF NOT EXISTS intelligence.urls (
        id SERIAL PRIMARY KEY,
        company_id INTEGER REFERENCES intelligence.companies(id),
        url TEXT NOT NULL,
        url_type VARCHAR(50) DEFAULT 'homepage',
        is_primary BOOLEAN DEFAULT false,
        UNIQUE(company_id, url)
      )
    `);
    
    console.log('👁️ Creating intelligence.company_urls view...');
    // Drop table if it exists (it might be a table instead of view)
    await db.run('DROP TABLE IF EXISTS intelligence.company_urls CASCADE').catch(() => {});
    await db.run('DROP VIEW IF EXISTS intelligence.company_urls CASCADE').catch(() => {});
    await db.run(`
      CREATE VIEW intelligence.company_urls AS 
      SELECT * FROM intelligence.urls
    `);
    
    console.log('📊 Fixing intelligence.baseline_analysis...');
    await db.run(`
      CREATE TABLE IF NOT EXISTS intelligence.baseline_analysis (
        id SERIAL PRIMARY KEY,
        -- Identity columns
        company TEXT,
        url TEXT,
        company_id INTEGER,
        url_id INTEGER,
        -- JSONB fields for rich data
        entities JSONB,
        themes JSONB,
        sentiment JSONB,
        key_points JSONB,
        relationships JSONB,
        -- Text fields for compatibility
        company_type TEXT,
        page_purpose TEXT,
        key_topics TEXT,
        main_message TEXT,
        target_audience TEXT,
        unique_value TEXT,
        trust_elements TEXT,
        differentiation TEXT,
        technology_stack TEXT,
        -- Timestamps
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('🔬 Fixing intelligence.enhanced_analysis...');
    await db.run(`
      CREATE TABLE IF NOT EXISTS intelligence.enhanced_analysis (
        id SERIAL PRIMARY KEY,
        change_id INTEGER UNIQUE,
        ultra_analysis JSONB,
        key_insights JSONB,
        market_signals JSONB,
        risk_assessment JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('🔄 Fixing intelligence.changes...');
    await db.run(`
      CREATE TABLE IF NOT EXISTS intelligence.changes (
        id SERIAL PRIMARY KEY,
        company TEXT,
        url TEXT,
        detected_at TIMESTAMP,
        analysis JSONB,
        interest_level INTEGER DEFAULT 5,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(company, url, detected_at)
      )
    `);
    
    console.log('📈 Fixing intelligence.scraping_runs...');
    await db.run(`
      CREATE TABLE IF NOT EXISTS intelligence.scraping_runs (
        id SERIAL PRIMARY KEY,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        urls_total INTEGER DEFAULT 0,
        urls_succeeded INTEGER DEFAULT 0,
        urls_failed INTEGER DEFAULT 0,
        changes_detected INTEGER DEFAULT 0,
        captchas_encountered INTEGER DEFAULT 0
      )
    `);
    
    console.log('🏷️ Fixing intelligence.groups...');
    await db.run(`
      CREATE TABLE IF NOT EXISTS intelligence.groups (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        color VARCHAR(7) DEFAULT '#4A90E2'
      )
    `);
    
    console.log('🔗 Fixing intelligence.company_groups...');
    await db.run(`
      CREATE TABLE IF NOT EXISTS intelligence.company_groups (
        company_id INTEGER REFERENCES intelligence.companies(id),
        group_id INTEGER REFERENCES intelligence.groups(id),
        PRIMARY KEY (company_id, group_id)
      )
    `);
    
    console.log('🧠 Fixing intelligence.thebrain_sync...');
    await db.run(`
      CREATE TABLE IF NOT EXISTS intelligence.thebrain_sync (
        company_id INTEGER REFERENCES intelligence.companies(id),
        thought_id TEXT NOT NULL,
        last_synced TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (company_id)
      )
    `);
    
    console.log('📊 Fixing intelligence.scrape_status...');
    await db.run(`
      CREATE TABLE IF NOT EXISTS intelligence.scrape_status (
        url_id INTEGER REFERENCES intelligence.urls(id),
        status VARCHAR(50),
        error_message TEXT,
        last_attempted TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (url_id)
      )
    `);
    
    console.log('🏭 Fixing intelligence.company_attributes...');
    await db.run(`
      CREATE TABLE IF NOT EXISTS intelligence.company_attributes (
        company_id INTEGER REFERENCES intelligence.companies(id),
        industry TEXT,
        attributes JSONB,
        PRIMARY KEY (company_id)
      )
    `);
    
    // 3. Fix raw_content schema tables
    console.log('\n📄 Fixing raw_content.scraped_pages...');
    await db.run(`
      CREATE TABLE IF NOT EXISTS raw_content.scraped_pages (
        id SERIAL PRIMARY KEY,
        company TEXT,
        url TEXT,
        url_name TEXT,
        content TEXT,
        html TEXT,
        title TEXT,
        content_hash TEXT,
        scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        change_detected BOOLEAN DEFAULT false,
        previous_hash TEXT,
        interest_level INTEGER DEFAULT 5,
        scrape_status TEXT DEFAULT 'success',
        captcha_type TEXT
      )
    `);
    
    console.log('📋 Fixing raw_content.company_pages_baseline...');
    await db.run(`
      CREATE TABLE IF NOT EXISTS raw_content.company_pages_baseline (
        id SERIAL PRIMARY KEY,
        company TEXT,
        url TEXT,
        content_hash TEXT,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        update_count INTEGER DEFAULT 0,
        UNIQUE(company, url)
      )
    `);
    
    // 4. Fix processed_content schema tables
    console.log('\n📝 Fixing processed_content.markdown_content...');
    await db.run(`
      CREATE TABLE IF NOT EXISTS processed_content.markdown_content (
        id SERIAL PRIMARY KEY,
        raw_content_id INTEGER,
        content TEXT,
        word_count INTEGER,
        processing_error TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('📄 Fixing processed_content.markdown_pages...');
    await db.run(`
      CREATE TABLE IF NOT EXISTS processed_content.markdown_pages (
        id SERIAL PRIMARY KEY,
        company TEXT,
        url TEXT,
        content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('🔍 Fixing processed_content.change_detection...');
    await db.run(`
      CREATE TABLE IF NOT EXISTS processed_content.change_detection (
        id SERIAL PRIMARY KEY,
        company TEXT,
        url TEXT,
        url_name TEXT,
        change_type TEXT,
        old_hash TEXT,
        new_hash TEXT,
        detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        interest_level INTEGER DEFAULT 5,
        ai_analysis JSONB
      )
    `);
    
    // 5. Create indexes
    console.log('\n🔍 Creating indexes...');
    const indexes = [
      // intelligence schema indexes
      'CREATE INDEX IF NOT EXISTS idx_ba_company ON intelligence.baseline_analysis(company)',
      'CREATE INDEX IF NOT EXISTS idx_ba_url ON intelligence.baseline_analysis(url)',
      'CREATE INDEX IF NOT EXISTS idx_ba_company_url ON intelligence.baseline_analysis(company, url)',
      'CREATE INDEX IF NOT EXISTS idx_changes_company ON intelligence.changes(company)',
      'CREATE INDEX IF NOT EXISTS idx_changes_detected ON intelligence.changes(detected_at DESC)',
      
      // raw_content schema indexes
      'CREATE INDEX IF NOT EXISTS idx_sp_company_url ON raw_content.scraped_pages(company, url)',
      'CREATE INDEX IF NOT EXISTS idx_sp_scraped_at ON raw_content.scraped_pages(scraped_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_sp_hash ON raw_content.scraped_pages(content_hash)',
      
      // processed_content schema indexes
      'CREATE INDEX IF NOT EXISTS idx_cd_company_url ON processed_content.change_detection(company, url)',
      'CREATE INDEX IF NOT EXISTS idx_cd_detected ON processed_content.change_detection(detected_at DESC)'
    ];
    
    for (const idx of indexes) {
      await db.run(idx).catch(err => console.log(`  Index might already exist: ${err.message}`));
    }
    
    // 6. Verify schema
    console.log('\n✅ Verifying schema...');
    const tables = await db.all(`
      SELECT schemaname, tablename 
      FROM pg_tables 
      WHERE schemaname IN ('intelligence', 'raw_content', 'processed_content')
      ORDER BY schemaname, tablename
    `);
    
    console.log('\nTables created:');
    let currentSchema = '';
    for (const table of tables) {
      if (table.schemaname !== currentSchema) {
        currentSchema = table.schemaname;
        console.log(`\n${currentSchema}:`);
      }
      console.log(`  - ${table.tablename}`);
    }
    
    console.log('\n✅ Schema fix complete!');
    
  } catch (error) {
    console.error('❌ Error fixing schema:', error);
    throw error;
  } finally {
    await end();
  }
}

// Run if called directly
if (require.main === module) {
  fixPostgresSchema().catch(console.error);
}

module.exports = { fixPostgresSchema };
