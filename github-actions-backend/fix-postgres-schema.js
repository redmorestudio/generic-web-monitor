#!/usr/bin/env node

/**
 * Fix PostgreSQL Schema Issues
 * 
 * Addresses missing tables and columns for the scraper-three-db-postgres.js
 */

require('dotenv').config();
const { db, end } = require('./postgres-db');

async function fixSchema() {
  try {
    console.log('🔧 Fixing PostgreSQL schema...\n');
    
    // 1. Create missing scraped_pages table in raw_content schema
    console.log('📊 Creating/updating scraped_pages table...');
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ scraped_pages table ready\n');

    // 2. Create company_pages_baseline table
    console.log('📊 Creating/updating company_pages_baseline table...');
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
    console.log('✅ company_pages_baseline table ready\n');

    // 3. Create change_detection table with correct schema
    console.log('📊 Creating/updating change_detection table...');
    await db.run(`
      CREATE TABLE IF NOT EXISTS processed_content.change_detection (
        id SERIAL PRIMARY KEY,
        company TEXT NOT NULL,
        url TEXT NOT NULL,
        url_name TEXT,
        url_id INTEGER,
        change_type TEXT,
        old_hash TEXT,
        new_hash TEXT,
        detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        interest_level INTEGER DEFAULT 5,
        ai_analysis TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ change_detection table ready\n');

    // 4. Add missing columns to existing tables
    console.log('📊 Adding missing columns to existing tables...');
    
    // Add captchas_encountered column to scraping_runs if missing
    await db.run(`
      ALTER TABLE intelligence.scraping_runs 
      ADD COLUMN IF NOT EXISTS captchas_encountered INTEGER DEFAULT 0
    `).catch(err => {
      if (!err.message.includes('already exists')) throw err;
    });
    
    // Add scrape_status column to scraped_pages if missing
    await db.run(`
      ALTER TABLE raw_content.scraped_pages 
      ADD COLUMN IF NOT EXISTS scrape_status VARCHAR(50) DEFAULT 'success'
    `).catch(err => {
      if (!err.message.includes('already exists')) throw err;
    });
    
    // Add captcha_type column to scraped_pages if missing
    await db.run(`
      ALTER TABLE raw_content.scraped_pages 
      ADD COLUMN IF NOT EXISTS captcha_type VARCHAR(50)
    `).catch(err => {
      if (!err.message.includes('already exists')) throw err;
    });
    
    // Add url column to change_detection if missing
    await db.run(`
      ALTER TABLE processed_content.change_detection 
      ADD COLUMN IF NOT EXISTS url TEXT
    `).catch(err => {
      if (!err.message.includes('already exists')) throw err;
    });
    
    console.log('✅ All columns updated\n');

    // 5. Create indexes for new tables
    console.log('🔍 Creating indexes...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_scraped_pages_company ON raw_content.scraped_pages(company)',
      'CREATE INDEX IF NOT EXISTS idx_scraped_pages_url ON raw_content.scraped_pages(url)',
      'CREATE INDEX IF NOT EXISTS idx_scraped_pages_scraped_at ON raw_content.scraped_pages(scraped_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_scraped_pages_url_scraped_at ON raw_content.scraped_pages(url, scraped_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_company_pages_baseline_company_url ON raw_content.company_pages_baseline(company, url)',
      'CREATE INDEX IF NOT EXISTS idx_change_detection_company ON processed_content.change_detection(company)',
      'CREATE INDEX IF NOT EXISTS idx_change_detection_detected_at ON processed_content.change_detection(detected_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_change_detection_interest_level ON processed_content.change_detection(interest_level DESC)'
    ];

    for (const index of indexes) {
      await db.run(index);
    }
    console.log('✅ Indexes created\n');

    // 6. Ensure url_id is nullable in change_detection (for the error we saw)
    console.log('🔧 Ensuring url_id is nullable in change_detection...');
    await db.run(`
      ALTER TABLE processed_content.change_detection 
      ALTER COLUMN url_id DROP NOT NULL
    `).catch(() => {
      // Column might already be nullable or not exist, that's fine
    });
    console.log('✅ Column constraints updated\n');

    // 7. Verify the schema
    console.log('🔍 Verifying schema...\n');
    
    const scraped_pages_cols = await db.all(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'raw_content' 
      AND table_name = 'scraped_pages'
      ORDER BY ordinal_position
    `);
    
    console.log('scraped_pages columns:');
    scraped_pages_cols.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    
    const change_detection_cols = await db.all(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'processed_content' 
      AND table_name = 'change_detection'
      ORDER BY ordinal_position
    `);
    
    console.log('\nchange_detection columns:');
    change_detection_cols.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });

    console.log('\n✨ Schema fixes complete!\n');
    
  } catch (error) {
    console.error('❌ Error fixing schema:', error);
    process.exit(1);
  } finally {
    await end();
  }
}

// Run if called directly
if (require.main === module) {
  fixSchema()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { fixSchema };
