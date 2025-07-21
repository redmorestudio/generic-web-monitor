#!/usr/bin/env node

/**
 * Add error_message column to scraped_pages table
 * This migration adds support for storing detailed error messages when scraping fails
 */

// SSL Certificate fix for Heroku PostgreSQL
if (process.env.NODE_ENV === 'production' || process.env.POSTGRES_CONNECTION_STRING) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

require('dotenv').config();
const { db, end } = require('../postgres-db');

async function addErrorMessageColumn() {
  try {
    console.log('🔧 Adding error_message column to scraped_pages table...\n');
    
    // Add error_message column to raw_content.scraped_pages
    console.log('📝 Adding error_message column...');
    await db.run(`
      ALTER TABLE raw_content.scraped_pages 
      ADD COLUMN IF NOT EXISTS error_message TEXT
    `);
    
    console.log('✅ Successfully added error_message column');
    
    // Verify the column was added
    const result = await db.get(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'raw_content' 
        AND table_name = 'scraped_pages' 
        AND column_name = 'error_message'
    `);
    
    if (result) {
      console.log('✅ Verified: error_message column exists');
    } else {
      console.log('⚠️ Warning: error_message column may not have been created');
    }
    
  } catch (error) {
    console.error('❌ Error adding error_message column:', error);
    process.exit(1);
  } finally {
    await end();
  }
}

// Run the migration
addErrorMessageColumn();
