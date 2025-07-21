#!/usr/bin/env node

// Fix missing columns in PostgreSQL schema

require('dotenv').config();
const { db, end } = require('./postgres-db');

async function fixSchema() {
  try {
    console.log('🔧 Fixing PostgreSQL schema...');
    
    // Add missing columns to scraped_pages table
    console.log('Adding missing columns to scraped_pages...');
    
    // Add scrape_status column if missing
    await db.run(`
      ALTER TABLE raw_content.scraped_pages 
      ADD COLUMN IF NOT EXISTS scrape_status VARCHAR(50) DEFAULT 'success'
    `).catch(err => {
      if (!err.message.includes('already exists')) throw err;
    });
    
    // Add captcha_type column if missing
    await db.run(`
      ALTER TABLE raw_content.scraped_pages 
      ADD COLUMN IF NOT EXISTS captcha_type VARCHAR(50)
    `).catch(err => {
      if (!err.message.includes('already exists')) throw err;
    });
    
    // Add missing columns to change_detection table
    console.log('Adding missing columns to change_detection...');
    
    // Add url column if missing (seems to be required based on the error)
    await db.run(`
      ALTER TABLE processed_content.change_detection 
      ADD COLUMN IF NOT EXISTS url TEXT
    `).catch(err => {
      if (!err.message.includes('already exists')) throw err;
    });
    
    // Add missing columns to scraping_runs table
    console.log('Adding missing columns to scraping_runs...');
    
    await db.run(`
      ALTER TABLE intelligence.scraping_runs 
      ADD COLUMN IF NOT EXISTS captchas_encountered INTEGER DEFAULT 0
    `).catch(err => {
      if (!err.message.includes('already exists')) throw err;
    });
    
    // Create indexes for better performance
    console.log('Creating indexes...');
    
    // Index on scraped_pages for faster lookups
    await db.run(`
      CREATE INDEX IF NOT EXISTS idx_scraped_pages_url_scraped_at 
      ON raw_content.scraped_pages(url, scraped_at DESC)
    `);
    
    // Index on change_detection
    await db.run(`
      CREATE INDEX IF NOT EXISTS idx_change_detection_detected_at 
      ON processed_content.change_detection(detected_at DESC)
    `);
    
    await db.run(`
      CREATE INDEX IF NOT EXISTS idx_change_detection_interest_level 
      ON processed_content.change_detection(interest_level DESC)
    `);
    
    console.log('✅ Schema fixes applied successfully!');
    
    // Verify the columns exist
    console.log('\nVerifying schema...');
    
    const scraped_pages_cols = await db.all(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'raw_content' 
      AND table_name = 'scraped_pages'
      ORDER BY ordinal_position
    `);
    
    console.log('\nscraped_pages columns:');
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
    
  } catch (error) {
    console.error('❌ Error fixing schema:', error);
    process.exit(1);
  } finally {
    await end();
  }
}

// Run the migration
fixSchema();
