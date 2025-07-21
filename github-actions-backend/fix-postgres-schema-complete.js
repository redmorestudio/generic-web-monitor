#!/usr/bin/env node

/**
 * Complete PostgreSQL Schema Fix
 * 
 * Creates ALL necessary tables and schemas for the AI Competitive Monitor
 * including the missing processed_content.markdown_pages table
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await db.run(`
      CREATE TABLE IF NOT EXISTS intelligence.urls (
        id SERIAL PRIMARY KEY,
        company_id INTEGER REFERENCES intelligence.companies(id),
        url TEXT NOT NULL,
        url_type TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(company_id, url)
      )
    `);
    console.log('✅ Intelligence tables ready\n');

    // 3. Create scraped_pages table in raw_content schema
    console.log('📊 Creating raw_content tables...');
    await db.run(`
      CREATE TABLE IF NOT EXISTS raw_content.scraped_pages (
        id SERIAL PRIMARY KEY,
        url_id INTEGER,
        company_name TEXT NOT NULL,
        url TEXT NOT NULL,
        html_content TEXT,
        content_hash TEXT,
        status_code INTEGER,
        error_message TEXT,
        scrape_status TEXT DEFAULT 'pending',
        captcha_type TEXT,
        scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

    await db.run(`
      CREATE TABLE IF NOT EXISTS raw_content.scraping_runs (
        id SERIAL PRIMARY KEY,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        urls_processed INTEGER DEFAULT 0,
        urls_changed INTEGER DEFAULT 0,
        urls_blocked INTEGER DEFAULT 0,
        captchas_encountered INTEGER DEFAULT 0,
        errors_count INTEGER DEFAULT 0,
        status TEXT DEFAULT 'running'
      )
    `);
    console.log('✅ Raw content tables ready\n');

    // 4. Create the MISSING markdown_pages table
    console.log('📊 Creating markdown_pages table (THE MISSING ONE)...');
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
    console.log('✅ markdown_pages table created!\n');

    // 5. Create change_detection table
    console.log('📊 Creating change_detection table...');
    await db.run(`
      CREATE TABLE IF NOT EXISTS processed_content.change_detection (
        id SERIAL PRIMARY KEY,
        url_id INTEGER,
        url TEXT,
        change_type TEXT,
        summary TEXT,
        old_content_id INTEGER,
        new_content_id INTEGER,
        interest_level INTEGER,
        technical_innovation_score INTEGER,
        business_impact_score INTEGER,
        interest_category TEXT,
        impact_areas TEXT[],
        interest_data JSONB,
        detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ change_detection table ready\n');

    // 6. Create indexes
    console.log('🔍 Creating indexes...');
    const indexes = [
      // scraped_pages indexes
      'CREATE INDEX IF NOT EXISTS idx_scraped_pages_company ON raw_content.scraped_pages(company_name)',
      'CREATE INDEX IF NOT EXISTS idx_scraped_pages_url ON raw_content.scraped_pages(url)',
      'CREATE INDEX IF NOT EXISTS idx_scraped_pages_scraped_at ON raw_content.scraped_pages(scraped_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_scraped_pages_content_hash ON raw_content.scraped_pages(content_hash)',
      
      // markdown_pages indexes
      'CREATE INDEX IF NOT EXISTS idx_markdown_pages_source_hash ON processed_content.markdown_pages(source_hash)',
      'CREATE INDEX IF NOT EXISTS idx_markdown_pages_company ON processed_content.markdown_pages(company)',
      'CREATE INDEX IF NOT EXISTS idx_markdown_pages_url ON processed_content.markdown_pages(url)',
      
      // change_detection indexes
      'CREATE INDEX IF NOT EXISTS idx_change_detection_url ON processed_content.change_detection(url)',
      'CREATE INDEX IF NOT EXISTS idx_change_detection_detected_at ON processed_content.change_detection(detected_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_change_detection_interest_level ON processed_content.change_detection(interest_level DESC)',
      
      // company and urls indexes
      'CREATE INDEX IF NOT EXISTS idx_companies_name ON intelligence.companies(name)',
      'CREATE INDEX IF NOT EXISTS idx_urls_company_id ON intelligence.urls(company_id)',
      'CREATE INDEX IF NOT EXISTS idx_urls_url ON intelligence.urls(url)'
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

    // 7. Verify all tables exist
    console.log('🔍 Verifying all required tables...\n');
    const requiredTables = [
      { schema: 'raw_content', table: 'scraped_pages' },
      { schema: 'raw_content', table: 'company_pages_baseline' },
      { schema: 'raw_content', table: 'scraping_runs' },
      { schema: 'processed_content', table: 'markdown_pages' },
      { schema: 'processed_content', table: 'change_detection' },
      { schema: 'intelligence', table: 'companies' },
      { schema: 'intelligence', table: 'urls' }
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

    // 8. Show markdown_pages schema specifically
    console.log('\n📋 markdown_pages table structure:');
    const mdColumns = await db.all(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'processed_content' 
      AND table_name = 'markdown_pages'
      ORDER BY ordinal_position
    `);
    
    if (mdColumns.length > 0) {
      mdColumns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
      });
    } else {
      console.log('  ❌ Table not found or no columns!');
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
