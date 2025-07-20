#!/usr/bin/env node

/**
 * Initialize Postgres Database Schemas
 * 
 * Creates all necessary schemas and tables for the AI monitoring system
 * This replaces the SQLite init-db-three.js script
 */

const { query, end } = require('../postgres-db');
const chalk = require('chalk');

async function initDatabase() {
  console.log(chalk.blue.bold('\n🚀 Initializing Postgres Database...\n'));
  
  try {
    // Create schemas
    console.log(chalk.yellow('📁 Creating schemas...'));
    await query('CREATE SCHEMA IF NOT EXISTS raw_content');
    await query('CREATE SCHEMA IF NOT EXISTS processed_content');
    await query('CREATE SCHEMA IF NOT EXISTS intelligence');
    console.log(chalk.green('✅ Schemas created\n'));
    
    // Create intelligence tables
    console.log(chalk.yellow('📊 Creating intelligence tables...'));
    
    await query(`
      CREATE TABLE IF NOT EXISTS intelligence.companies (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT,
        interest_level INTEGER DEFAULT 5,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await query(`
      CREATE TABLE IF NOT EXISTS intelligence.urls (
        id SERIAL PRIMARY KEY,
        company_id INTEGER NOT NULL,
        url TEXT NOT NULL,
        url_type TEXT,
        is_primary BOOLEAN DEFAULT false,
        last_scraped TIMESTAMP,
        scrape_frequency INTEGER DEFAULT 86400,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES intelligence.companies(id) ON DELETE CASCADE
      )
    `);
    
    // Create company_urls view for backward compatibility
    await query(`
      CREATE OR REPLACE VIEW intelligence.company_urls AS
      SELECT * FROM intelligence.urls
    `);
    
    await query(`
      CREATE TABLE IF NOT EXISTS intelligence.enhanced_analysis (
        id SERIAL PRIMARY KEY,
        company_id INTEGER NOT NULL,
        content_id INTEGER,
        analysis_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        key_changes TEXT,
        change_magnitude REAL DEFAULT 0,
        interest_score REAL DEFAULT 0,
        categories TEXT,
        summary TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES intelligence.companies(id) ON DELETE CASCADE
      )
    `);
    
    await query(`
      CREATE TABLE IF NOT EXISTS intelligence.thebrain_sync (
        id SERIAL PRIMARY KEY,
        company_id INTEGER NOT NULL,
        thought_id TEXT UNIQUE,
        last_synced TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        sync_status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES intelligence.companies(id) ON DELETE CASCADE
      )
    `);
    
    await query(`
      CREATE TABLE IF NOT EXISTS intelligence.scrape_status (
        id SERIAL PRIMARY KEY,
        url_id INTEGER NOT NULL,
        status TEXT NOT NULL,
        scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        error_message TEXT,
        http_status INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (url_id) REFERENCES intelligence.urls(id) ON DELETE CASCADE
      )
    `);
    
    await query(`
      CREATE TABLE IF NOT EXISTS intelligence.groups (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        color TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await query(`
      CREATE TABLE IF NOT EXISTS intelligence.company_groups (
        company_id INTEGER NOT NULL,
        group_id INTEGER NOT NULL,
        PRIMARY KEY (company_id, group_id),
        FOREIGN KEY (company_id) REFERENCES intelligence.companies(id) ON DELETE CASCADE,
        FOREIGN KEY (group_id) REFERENCES intelligence.groups(id) ON DELETE CASCADE
      )
    `);
    
    // Add scraping_runs table that scraper expects
    await query(`
      CREATE TABLE IF NOT EXISTS intelligence.scraping_runs (
        id SERIAL PRIMARY KEY,
        started_at TIMESTAMP,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        urls_total INTEGER,
        urls_succeeded INTEGER,
        urls_failed INTEGER,
        changes_detected INTEGER,
        duration_seconds INTEGER,
        errors TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log(chalk.green('✅ Intelligence tables created\n'));
    
    // Create raw content tables
    console.log(chalk.yellow('📦 Creating raw content tables...'));
    
    await query(`
      CREATE TABLE IF NOT EXISTS raw_content.raw_html (
        id SERIAL PRIMARY KEY,
        url_id INTEGER NOT NULL,
        content TEXT,
        headers TEXT,
        scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        content_hash TEXT,
        http_status INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log(chalk.green('✅ Raw content tables created\n'));
    
    // Create processed content tables
    console.log(chalk.yellow('📝 Creating processed content tables...'));
    
    await query(`
      CREATE TABLE IF NOT EXISTS processed_content.markdown_content (
        id SERIAL PRIMARY KEY,
        raw_content_id INTEGER NOT NULL,
        content TEXT,
        word_count INTEGER,
        processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        processing_error TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Add changes table for tracking detected changes
    await query(`
      CREATE TABLE IF NOT EXISTS processed_content.changes (
        id SERIAL PRIMARY KEY,
        company_id INTEGER NOT NULL,
        url_id INTEGER NOT NULL,
        detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        before_content_id INTEGER,
        after_content_id INTEGER NOT NULL,
        change_summary TEXT,
        interest_level INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log(chalk.green('✅ Processed content tables created\n'));
    
    // Create indexes
    console.log(chalk.yellow('🔍 Creating indexes...'));
    
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_urls_company_id ON intelligence.urls(company_id)',
      'CREATE INDEX IF NOT EXISTS idx_urls_last_scraped ON intelligence.urls(last_scraped)',
      'CREATE INDEX IF NOT EXISTS idx_raw_html_url_id ON raw_content.raw_html(url_id)',
      'CREATE INDEX IF NOT EXISTS idx_raw_html_scraped_at ON raw_content.raw_html(scraped_at)',
      'CREATE INDEX IF NOT EXISTS idx_markdown_content_raw_id ON processed_content.markdown_content(raw_content_id)',
      'CREATE INDEX IF NOT EXISTS idx_enhanced_analysis_company_id ON intelligence.enhanced_analysis(company_id)',
      'CREATE INDEX IF NOT EXISTS idx_thebrain_sync_company_id ON intelligence.thebrain_sync(company_id)',
      'CREATE INDEX IF NOT EXISTS idx_scrape_status_url_id ON intelligence.scrape_status(url_id)',
      'CREATE UNIQUE INDEX IF NOT EXISTS idx_urls_url_company ON intelligence.urls(url, company_id)',
      'CREATE INDEX IF NOT EXISTS idx_changes_company_id ON processed_content.changes(company_id)',
      'CREATE INDEX IF NOT EXISTS idx_changes_detected_at ON processed_content.changes(detected_at)'
    ];
    
    for (const index of indexes) {
      await query(index);
    }
    
    console.log(chalk.green('✅ Indexes created\n'));
    
    // Insert default groups
    console.log(chalk.yellow('🏷️  Creating default groups...'));
    
    const defaultGroups = [
      { name: 'LLM Providers', color: '#FF6B6B' },
      { name: 'AI Assistants', color: '#4ECDC4' },
      { name: 'AI Development Tools', color: '#45B7D1' },
      { name: 'AI Infrastructure', color: '#F9844A' },
      { name: 'Enterprise AI', color: '#90BE6D' },
      { name: 'AI Research', color: '#F9C74F' },
      { name: 'Social/Marketing', color: '#F8961E' },
      { name: 'Media/Creative', color: '#A8DADC' },
      { name: 'Productivity', color: '#457B9D' },
      { name: 'Other', color: '#6C757D' }
    ];
    
    for (const group of defaultGroups) {
      await query(
        'INSERT INTO intelligence.groups (name, color) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING',
        [group.name, group.color]
      );
    }
    
    console.log(chalk.green('✅ Default groups created\n'));
    
    console.log(chalk.green.bold('✨ Database initialization complete!\n'));
    
  } catch (error) {
    console.error(chalk.red('❌ Error initializing database:'), error);
    throw error;
  } finally {
    await end();
  }
}

// Run if called directly
if (require.main === module) {
  initDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { initDatabase };
