#!/usr/bin/env node

/**
 * Comprehensive PostgreSQL Schema Fix
 * Creates all missing tables and columns that the scraper expects
 */

// SSL Certificate fix for Heroku PostgreSQL
if (process.env.NODE_ENV === 'production' || process.env.POSTGRES_CONNECTION_STRING) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

require('dotenv').config();
const { db, end } = require('./postgres-db');

async function fixSchema() {
  try {
    console.log('🔧 Applying comprehensive PostgreSQL schema fixes...\n');
    
    // 1. Create missing tables in raw_content schema
    console.log('📦 Creating scraped_pages table...');
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
        scrape_status VARCHAR(50) DEFAULT 'success',
        captcha_type VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('📦 Creating company_pages_baseline table...');
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
    
    // 2. Create missing tables in processed_content schema
    console.log('📝 Creating change_detection table...');
    await db.run(`
      CREATE TABLE IF NOT EXISTS processed_content.change_detection (
        id SERIAL PRIMARY KEY,
        company TEXT NOT NULL,
        url TEXT NOT NULL,
        url_id INTEGER,  -- Make nullable for now
        url_name TEXT,
        change_type VARCHAR(50),
        old_hash TEXT,
        new_hash TEXT,
        detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        interest_level INTEGER DEFAULT 5,
        ai_analysis JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 3. Add missing columns to intelligence.scraping_runs
    console.log('🔧 Updating scraping_runs table...');
    await db.run(`
      ALTER TABLE intelligence.scraping_runs 
      ADD COLUMN IF NOT EXISTS captchas_encountered INTEGER DEFAULT 0
    `).catch(err => {
      if (!err.message.includes('already exists')) throw err;
    });
    
    await db.run(`
      ALTER TABLE intelligence.scraping_runs 
      ADD COLUMN IF NOT EXISTS urls_changed INTEGER DEFAULT 0
    `).catch(err => {
      if (!err.message.includes('already exists')) throw err;
    });
    
    await db.run(`
      ALTER TABLE intelligence.scraping_runs 
      ADD COLUMN IF NOT EXISTS urls_unchanged INTEGER DEFAULT 0
    `).catch(err => {
      if (!err.message.includes('already exists')) throw err;
    });
    
    await db.run(`
      ALTER TABLE intelligence.scraping_runs 
      ADD COLUMN IF NOT EXISTS urls_new INTEGER DEFAULT 0
    `).catch(err => {
      if (!err.message.includes('already exists')) throw err;
    });
    
    // 4. Create indexes for performance
    console.log('🔍 Creating performance indexes...');
    
    // Indexes on scraped_pages
    await db.run(`
      CREATE INDEX IF NOT EXISTS idx_scraped_pages_url_scraped_at 
      ON raw_content.scraped_pages(url, scraped_at DESC)
    `);
    
    await db.run(`
      CREATE INDEX IF NOT EXISTS idx_scraped_pages_company_url 
      ON raw_content.scraped_pages(company, url)
    `);
    
    await db.run(`
      CREATE INDEX IF NOT EXISTS idx_scraped_pages_content_hash 
      ON raw_content.scraped_pages(content_hash)
    `);
    
    // Indexes on company_pages_baseline
    await db.run(`
      CREATE INDEX IF NOT EXISTS idx_baseline_company_url 
      ON raw_content.company_pages_baseline(company, url)
    `);
    
    await db.run(`
      CREATE INDEX IF