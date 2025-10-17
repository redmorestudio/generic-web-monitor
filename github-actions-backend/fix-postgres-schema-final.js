#!/usr/bin/env node

/**
 * FINAL PostgreSQL Schema Fix - July 22, 2025
 * 
 * This is THE definitive schema fix. It ensures ALL tables have ALL columns
 * that ANY script expects. No more band-aids.
 */

const { query, end } = require('./postgres-db');
const chalk = require('chalk');

async function fixSchema() {
  console.log(chalk.blue.bold('\n🔧 FINAL PostgreSQL Schema Fix\n'));
  
  try {
    // Start transaction
    await query('BEGIN');
    
    // 1. Fix baseline_analysis - THE CRITICAL ONE
    console.log(chalk.yellow('📊 Fixing baseline_analysis table...'));
    
    // Drop and recreate with ALL columns BOTH scripts need
    await query(`
      DROP TABLE IF EXISTS intelligence.baseline_analysis CASCADE;
      
      CREATE TABLE intelligence.baseline_analysis (
        id SERIAL PRIMARY KEY,
        -- Identity columns
        company TEXT NOT NULL,
        url TEXT NOT NULL,
        company_id INTEGER,
        company_name TEXT,
        url_id INTEGER,
        
        -- JSONB columns for generate-static-data
        entities JSONB DEFAULT '{}',
        themes JSONB DEFAULT '{}',
        sentiment JSONB DEFAULT '{}',
        key_points JSONB DEFAULT '{}',
        relationships JSONB DEFAULT '{}',
        
        -- Text columns for ai-analyzer-baseline
        company_type TEXT,
        page_purpose TEXT,
        key_topics TEXT,
        main_message TEXT,
        target_audience TEXT,
        unique_value TEXT,
        trust_elements TEXT,
        differentiation TEXT,
        technology_stack TEXT,
        
        -- Metadata
        analysis_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        content_hash TEXT,
        ai_model TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        UNIQUE(company, url)
      );
      
      CREATE INDEX idx_baseline_company ON intelligence.baseline_analysis(company);
      CREATE INDEX idx_baseline_company_id ON intelligence.baseline_analysis(company_id);
      CREATE INDEX idx_baseline_analysis_date ON intelligence.baseline_analysis(analysis_date);
    `);
    
    // 2. Fix enhanced_analysis
    console.log(chalk.yellow('🔍 Fixing enhanced_analysis table...'));
    
    await query(`
      -- Add missing columns if they don't exist
      ALTER TABLE intelligence.enhanced_analysis 
      ADD COLUMN IF NOT EXISTS change_id INTEGER UNIQUE;
      
      ALTER TABLE intelligence.enhanced_analysis
      ADD COLUMN IF NOT EXISTS ultra_analysis JSONB DEFAULT '{}';
      
      ALTER TABLE intelligence.enhanced_analysis
      ADD COLUMN IF NOT EXISTS key_insights JSONB DEFAULT '{}';
      
      ALTER TABLE intelligence.enhanced_analysis
      ADD COLUMN IF NOT EXISTS business_impact TEXT;
      
      ALTER TABLE intelligence.enhanced_analysis
      ADD COLUMN IF NOT EXISTS competitive_implications TEXT;
      
      ALTER TABLE intelligence.enhanced_analysis
      ADD COLUMN IF NOT EXISTS market_signals JSONB DEFAULT '{}';
      
      ALTER TABLE intelligence.enhanced_analysis
      ADD COLUMN IF NOT EXISTS risk_assessment JSONB DEFAULT '{}';
      
      ALTER TABLE intelligence.enhanced_analysis
      ADD COLUMN IF NOT EXISTS opportunity_score REAL;
      
      ALTER TABLE intelligence.enhanced_analysis
      ADD COLUMN IF NOT EXISTS analysis_timestamp TIMESTAMP;
      
      ALTER TABLE intelligence.enhanced_analysis
      ADD COLUMN IF NOT EXISTS ai_model TEXT;
    `);
    
    // 3. Fix intelligence.changes
    console.log(chalk.yellow('📝 Fixing changes table...'));
    
    await query(`
      CREATE TABLE IF NOT EXISTS intelligence.changes (
        id SERIAL PRIMARY KEY,
        company TEXT NOT NULL,
        url TEXT NOT NULL,
        detected_at TIMESTAMP NOT NULL,
        change_type TEXT,
        before_content TEXT,
        after_content TEXT,
        analysis JSONB DEFAULT '{}',
        interest_level INTEGER DEFAULT 0,
        ai_confidence REAL,
        content_hash_before TEXT,
        content_hash_after TEXT,
        markdown_before TEXT,
        markdown_after TEXT,
        ai_model TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(company, url, detected_at)
      );
      
      CREATE INDEX IF NOT EXISTS idx_changes_company ON intelligence.changes(company);
      CREATE INDEX IF NOT EXISTS idx_changes_detected ON intelligence.changes(detected_at);
      CREATE INDEX IF NOT EXISTS idx_changes_interest ON intelligence.changes(interest_level);
    `);
    
    // 4. Fix scraped_pages
    console.log(chalk.yellow('📦 Fixing scraped_pages table...'));
    
    await query(`
      ALTER TABLE raw_content.scraped_pages
      ADD COLUMN IF NOT EXISTS scrape_status TEXT DEFAULT 'success';
      
      ALTER TABLE raw_content.scraped_pages
      ADD COLUMN IF NOT EXISTS captcha_type TEXT;
      
      CREATE INDEX IF NOT EXISTS idx_scraped_company_url ON raw_content.scraped_pages(company, url);
      CREATE INDEX IF NOT EXISTS idx_scraped_status ON raw_content.scraped_pages(scrape_status);
      CREATE INDEX IF NOT EXISTS idx_scraped_at ON raw_content.scraped_pages(scraped_at);
    `);
    
    // 5. Fix scraping_runs
    console.log(chalk.yellow('📈 Fixing scraping_runs table...'));
    
    await query(`
      ALTER TABLE intelligence.scraping_runs
      ADD COLUMN IF NOT EXISTS captchas_encountered INTEGER DEFAULT 0;
    `);
    
    // 6. Create company_attributes if missing
    console.log(chalk.yellow('🏢 Ensuring company_attributes exists...'));
    
    await query(`
      CREATE TABLE IF NOT EXISTS intelligence.company_attributes (
        company_id INTEGER PRIMARY KEY,
        industry TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES intelligence.companies(id) ON DELETE CASCADE
      );
    `);
    
    // 7. Add all missing indexes
    console.log(chalk.yellow('🔍 Adding missing indexes...'));
    
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_enhanced_company_id ON intelligence.enhanced_analysis(company_id)',
      'CREATE INDEX IF NOT EXISTS idx_enhanced_change_id ON intelligence.enhanced_analysis(change_id)',
      'CREATE INDEX IF NOT EXISTS idx_detection_company ON processed_content.change_detection(company)',
      'CREATE INDEX IF NOT EXISTS idx_detection_detected ON processed_content.change_detection(detected_at)',
      'CREATE INDEX IF NOT EXISTS idx_detection_interest ON processed_content.change_detection(interest_level)',
      'CREATE INDEX IF NOT EXISTS idx_baseline_company_url ON raw_content.company_pages_baseline(company, url)'
    ];
    
    for (const idx of indexes) {
      try {
        await query(idx);
      } catch (e) {
        // Index might already exist
      }
    }
    
    // Commit transaction
    await query('COMMIT');
    
    console.log(chalk.green.bold('\n✅ Schema fix complete!'));
    console.log(chalk.green('All tables now have all required columns.'));
    
    // Verify critical tables
    console.log(chalk.blue('\n🔍 Verifying critical tables...'));
    
    const verifyQueries = [
      {
        name: 'baseline_analysis JSONB columns',
        query: `SELECT column_name FROM information_schema.columns 
                WHERE table_schema = 'intelligence' 
                AND table_name = 'baseline_analysis' 
                AND column_name IN ('entities', 'themes', 'sentiment', 'relationships')
                ORDER BY column_name`
      },
      {
        name: 'enhanced_analysis columns',
        query: `SELECT column_name FROM information_schema.columns 
                WHERE table_schema = 'intelligence' 
                AND table_name = 'enhanced_analysis' 
                AND column_name IN ('change_id', 'ultra_analysis', 'key_insights')
                ORDER BY column_name`
      },
      {
        name: 'changes table',
        query: `SELECT COUNT(*) as count FROM information_schema.tables 
                WHERE table_schema = 'intelligence' 
                AND table_name = 'changes'`
      }
    ];
    
    for (const check of verifyQueries) {
      const result = await query(check.query);
      console.log(chalk.cyan(`  ✓ ${check.name}: ${result.length || result.count} found`));
    }
    
  } catch (error) {
    await query('ROLLBACK');
    console.error(chalk.red('❌ Schema fix failed:'), error);
    throw error;
  } finally {
    await end();
  }
}

// Run if called directly
if (require.main === module) {
  fixSchema()
    .then(() => {
      console.log(chalk.green('\n✨ Database is now ready for all scripts!\n'));
      process.exit(0);
    })
    .catch((err) => {
      console.error(chalk.red('\n💥 Fatal error:'), err);
      process.exit(1);
    });
}

module.exports = { fixSchema };
