#!/usr/bin/env node

/**
 * Fix PostgreSQL schema to match what the scraper expects
 */

const { Client } = require('pg');

const POSTGRES_CONNECTION_STRING = process.env.POSTGRES_CONNECTION_STRING;

if (!POSTGRES_CONNECTION_STRING) {
  console.error('❌ ERROR: POSTGRES_CONNECTION_STRING environment variable not set');
  process.exit(1);
}

async function fixSchema() {
  console.log('🔧 Fixing PostgreSQL schema for scraper compatibility...\n');
  
  const pg = new Client({
    connectionString: POSTGRES_CONNECTION_STRING,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await pg.connect();
    console.log('✅ Connected to PostgreSQL');
    
    // Create company_urls table that the scraper expects
    console.log('\n📊 Creating company_urls table...');
    await pg.query(`
      CREATE TABLE IF NOT EXISTS intelligence.company_urls (
        id INTEGER PRIMARY KEY,
        company_id INTEGER NOT NULL,
        url TEXT NOT NULL,
        name TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES intelligence.companies(id)
      )
    `);
    
    // Copy data from urls to company_urls
    console.log('📋 Copying data from urls to company_urls...');
    const result = await pg.query(`
      INSERT INTO intelligence.company_urls (id, company_id, url, name)
      SELECT id, company_id, url, url_type
      FROM intelligence.urls
      ON CONFLICT (id) DO NOTHING
    `);
    console.log(`   Copied ${result.rowCount} URLs`);
    
    // Create the scraped_pages table
    console.log('\n📊 Creating scraped_pages table...');
    await pg.query(`
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
        interest_level INTEGER DEFAULT 5
      )
    `);
    
    // Create company_pages_baseline table
    console.log('📊 Creating company_pages_baseline table...');
    await pg.query(`
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
        UNIQUE(company, url)
      )
    `);
    
    // Update change_detection table structure
    console.log('📊 Updating change_detection table...');
    await pg.query(`
      ALTER TABLE processed_content.change_detection 
      ADD COLUMN IF NOT EXISTS company TEXT,
      ADD COLUMN IF NOT EXISTS url_name TEXT,
      ADD COLUMN IF NOT EXISTS old_hash TEXT,
      ADD COLUMN IF NOT EXISTS new_hash TEXT,
      ADD COLUMN IF NOT EXISTS ai_analysis TEXT
    `);
    
    // Create scraping_runs table
    console.log('📊 Creating scraping_runs table...');
    await pg.query(`
      CREATE TABLE IF NOT EXISTS intelligence.scraping_runs (
        id SERIAL PRIMARY KEY,
        started_at TIMESTAMP,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        urls_total INTEGER DEFAULT 0,
        urls_succeeded INTEGER DEFAULT 0,
        urls_failed INTEGER DEFAULT 0,
        changes_detected INTEGER DEFAULT 0,
        duration_seconds INTEGER,
        errors TEXT
      )
    `);
    
    // Create indexes
    console.log('\n🔍 Creating indexes...');
    await pg.query('CREATE INDEX IF NOT EXISTS idx_company_urls_company_id ON intelligence.company_urls(company_id)');
    await pg.query('CREATE INDEX IF NOT EXISTS idx_scraped_pages_company_url ON raw_content.scraped_pages(company, url)');
    await pg.query('CREATE INDEX IF NOT EXISTS idx_scraped_pages_scraped_at ON raw_content.scraped_pages(scraped_at)');
    await pg.query('CREATE INDEX IF NOT EXISTS idx_baseline_company_url ON raw_content.company_pages_baseline(company, url)');
    
    console.log('\n✅ Schema fixes completed!');
    
    // Verify
    console.log('\n🔍 Verifying tables...');
    const tables = await pg.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_schema IN ('intelligence', 'raw_content', 'processed_content')
      ORDER BY table_schema, table_name
    `);
    
    console.log('\nExisting tables:');
    tables.rows.forEach(row => {
      console.log(`  ${row.table_schema}.${row.table_name}`);
    });
    
  } catch (error) {
    console.error('\n❌ Fix failed:', error);
    throw error;
  } finally {
    await pg.end();
  }
}

// Run the fix
fixSchema()
  .then(() => {
    console.log('\n✨ All done! The scraper should work now.');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
