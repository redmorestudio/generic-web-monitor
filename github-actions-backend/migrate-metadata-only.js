#!/usr/bin/env node

/**
 * Metadata-Only PostgreSQL Migration Script
 * 
 * This script migrates ONLY the company and URL metadata to PostgreSQL,
 * skipping all historical data. Perfect for a fresh start.
 */

const Database = require('better-sqlite3');
const { Client } = require('pg');
const path = require('path');
const fs = require('fs');

// Configuration
const POSTGRES_CONNECTION_STRING = process.env.POSTGRES_CONNECTION_STRING;

if (!POSTGRES_CONNECTION_STRING) {
  console.error('❌ ERROR: POSTGRES_CONNECTION_STRING environment variable not set');
  process.exit(1);
}

// Database path
const intelligenceDbPath = path.join(__dirname, 'data', 'intelligence.db');

// Check if database exists
if (!fs.existsSync(intelligenceDbPath)) {
  console.error(`❌ ERROR: intelligence database not found at ${intelligenceDbPath}`);
  process.exit(1);
}

async function migrateMetadataOnly() {
  console.log('🚀 Starting Metadata-Only PostgreSQL Migration...\n');
  console.log('ℹ️  This will migrate ONLY companies and URLs, no historical data.\n');
  
  // Connect to Postgres
  const pg = new Client({
    connectionString: POSTGRES_CONNECTION_STRING,
    ssl: { rejectUnauthorized: false }
  });
  
  const db = new Database(intelligenceDbPath, { readonly: true });
  
  try {
    await pg.connect();
    console.log('✅ Connected to PostgreSQL');
    
    // Create schema
    console.log('\n📁 Creating schema...');
    await pg.query('CREATE SCHEMA IF NOT EXISTS intelligence');
    console.log('✅ Schema created');
    
    // Create companies table
    console.log('\n📊 Creating companies table...');
    await pg.query(`
      CREATE TABLE IF NOT EXISTS intelligence.companies (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        category TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        thebrain_thought_id TEXT
      )
    `);
    
    // Create URLs table
    console.log('📊 Creating URLs table...');
    await pg.query(`
      CREATE TABLE IF NOT EXISTS intelligence.urls (
        id INTEGER PRIMARY KEY,
        company_id INTEGER NOT NULL,
        url TEXT NOT NULL,
        url_type TEXT,
        selector_config TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_scraped TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES intelligence.companies(id)
      )
    `);
    
    // Create indexes
    console.log('\n🔍 Creating indexes...');
    await pg.query('CREATE INDEX IF NOT EXISTS idx_urls_company_id ON intelligence.urls(company_id)');
    await pg.query('CREATE INDEX IF NOT EXISTS idx_urls_last_scraped ON intelligence.urls(last_scraped)');
    await pg.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_name ON intelligence.companies(name)');
    console.log('✅ Indexes created');
    
    // Get companies from SQLite
    console.log('\n📤 Reading companies from SQLite...');
    const companies = db.prepare('SELECT * FROM companies').all();
    console.log(`   Found ${companies.length} companies`);
    
    // Migrate companies
    console.log('\n📥 Migrating companies to PostgreSQL...');
    for (const company of companies) {
      await pg.query(`
        INSERT INTO intelligence.companies (id, name, category, description, created_at, thebrain_thought_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          category = EXCLUDED.category,
          description = EXCLUDED.description,
          thebrain_thought_id = EXCLUDED.thebrain_thought_id
      `, [
        company.id,
        company.name,
        company.category,
        company.description,
        company.created_at || new Date().toISOString(),
        company.thebrain_thought_id
      ]);
    }
    console.log(`✅ ${companies.length} companies migrated`);
    
    // Get URLs from SQLite
    console.log('\n📤 Reading URLs from SQLite...');
    const urls = db.prepare('SELECT * FROM urls').all();
    console.log(`   Found ${urls.length} URLs`);
    
    // Migrate URLs
    console.log('\n📥 Migrating URLs to PostgreSQL...');
    for (const url of urls) {
      await pg.query(`
        INSERT INTO intelligence.urls (id, company_id, url, url_type, selector_config, created_at, last_scraped)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO UPDATE SET
          url = EXCLUDED.url,
          url_type = EXCLUDED.url_type,
          selector_config = EXCLUDED.selector_config,
          last_scraped = EXCLUDED.last_scraped
      `, [
        url.id,
        url.company_id,
        url.url,
        url.url_type,
        url.selector_config,
        url.created_at || new Date().toISOString(),
        url.last_scraped
      ]);
    }
    console.log(`✅ ${urls.length} URLs migrated`);
    
    // Create empty tables for future use
    console.log('\n📊 Creating empty tables for future data...');
    
    // Create raw_content schema and table
    await pg.query('CREATE SCHEMA IF NOT EXISTS raw_content');
    await pg.query(`
      CREATE TABLE IF NOT EXISTS raw_content.raw_html (
        id SERIAL PRIMARY KEY,
        url_id INTEGER NOT NULL,
        company_name TEXT,
        url TEXT,
        content_hash TEXT,
        html_content TEXT,
        status_code INTEGER,
        error_message TEXT,
        scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create processed_content schema and tables
    await pg.query('CREATE SCHEMA IF NOT EXISTS processed_content');
    await pg.query(`
      CREATE TABLE IF NOT EXISTS processed_content.markdown_content (
        id SERIAL PRIMARY KEY,
        raw_html_id INTEGER NOT NULL,
        url_id INTEGER NOT NULL,
        company_name TEXT,
        url TEXT,
        markdown_text TEXT,
        markdown_hash TEXT,
        structured_text TEXT,
        processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        processing_status TEXT DEFAULT 'pending'
      )
    `);
    
    await pg.query(`
      CREATE TABLE IF NOT EXISTS processed_content.change_detection (
        id SERIAL PRIMARY KEY,
        url_id INTEGER NOT NULL,
        change_type TEXT,
        summary TEXT,
        old_content_id INTEGER,
        new_content_id INTEGER,
        relevance_score INTEGER,
        interest_level INTEGER,
        interest_data TEXT,
        detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create baseline_analysis and enhanced_analysis tables
    await pg.query(`
      CREATE TABLE IF NOT EXISTS intelligence.baseline_analysis (
        id SERIAL PRIMARY KEY,
        company_id INTEGER,
        url_id INTEGER,
        snapshot_id INTEGER UNIQUE,
        entities TEXT,
        relationships TEXT,
        semantic_categories TEXT,
        competitive_data TEXT,
        smart_groups TEXT,
        quantitative_data TEXT,
        extracted_text TEXT,
        full_extraction TEXT,
        summary TEXT,
        relevance_score INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pg.query(`
      CREATE TABLE IF NOT EXISTS intelligence.enhanced_analysis (
        id SERIAL PRIMARY KEY,
        change_id INTEGER UNIQUE,
        entities TEXT,
        relationships TEXT,
        semantic_categories TEXT,
        competitive_data TEXT,
        smart_groups TEXT,
        quantitative_data TEXT,
        extracted_text TEXT,
        full_extraction TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create scrape_runs table
    await pg.query(`
      CREATE TABLE IF NOT EXISTS raw_content.scrape_runs (
        id SERIAL PRIMARY KEY,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        urls_processed INTEGER DEFAULT 0,
        urls_changed INTEGER DEFAULT 0,
        errors_count INTEGER DEFAULT 0,
        status TEXT DEFAULT 'running'
      )
    `);
    
    console.log('✅ All tables created');
    
    // Verify migration
    console.log('\n🔍 Verifying migration...');
    const companyCount = await pg.query('SELECT COUNT(*) FROM intelligence.companies');
    const urlCount = await pg.query('SELECT COUNT(*) FROM intelligence.urls');
    
    console.log(`   Companies: ${companyCount.rows[0].count}`);
    console.log(`   URLs: ${urlCount.rows[0].count}`);
    
    console.log('\n🎉 Metadata migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Update your scripts to use PostgreSQL connection');
    console.log('   2. Run the scraper to start collecting fresh data');
    console.log('   3. The system will build up new historical data over time');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    db.close();
    await pg.end();
  }
}

// Run the migration
migrateMetadataOnly()
  .then(() => {
    console.log('\n✨ All done!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
