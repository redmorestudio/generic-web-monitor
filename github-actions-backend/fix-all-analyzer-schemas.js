#!/usr/bin/env node

/**
 * Fix All Analyzer Schemas
 * 
 * Runs all necessary schema fixes for the analyzer stage
 * This ensures all required tables exist with correct structure
 */

require('dotenv').config();
const { db, end } = require('./postgres-db');

async function fixAllAnalyzerSchemas() {
  try {
    console.log('🔧 Running comprehensive analyzer schema fixes...\n');
    
    // 1. Create schemas if they don't exist
    console.log('📂 Ensuring schemas exist...');
    await db.run('CREATE SCHEMA IF NOT EXISTS raw_content');
    await db.run('CREATE SCHEMA IF NOT EXISTS processed_content');
    await db.run('CREATE SCHEMA IF NOT EXISTS intelligence');
    console.log('✅ Schemas ready\n');
    
    // 2. Fix baseline_analysis table
    console.log('📊 Fixing baseline_analysis table...');
    
    // Drop existing table if it's in wrong location or has wrong schema
    await db.run('DROP TABLE IF EXISTS processed_content.baseline_analysis CASCADE');
    await db.run('DROP TABLE IF EXISTS intelligence.baseline_analysis CASCADE');
    
    // Create with correct schema
    await db.run(`
      CREATE TABLE intelligence.baseline_analysis (
        id SERIAL PRIMARY KEY,
        company TEXT NOT NULL,
        url TEXT NOT NULL,
        company_type TEXT,
        page_purpose TEXT,
        key_topics TEXT[],
        main_message TEXT,
        target_audience TEXT,
        unique_value TEXT,
        trust_elements TEXT[],
        differentiation TEXT,
        technology_stack TEXT[],
        analysis_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        content_hash TEXT,
        ai_model TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(company, url)
      )
    `);
    
    console.log('✅ baseline_analysis table created\n');
    
    // 3. Fix enhanced_analysis table
    console.log('📊 Fixing enhanced_analysis table...');
    
    // Check if change_id column exists
    const changeIdExists = await db.get(`
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'intelligence' 
        AND table_name = 'enhanced_analysis' 
        AND column_name = 'change_id'
      )
    `);
    
    if (!changeIdExists.exists) {
      console.log('Adding change_id column...');
      await db.run(`
        ALTER TABLE intelligence.enhanced_analysis 
        ADD COLUMN IF NOT EXISTS change_id INTEGER
      `);
    }
    
    console.log('✅ enhanced_analysis table ready\n');
    
    // 4. Fix changes table
    console.log('📊 Ensuring intelligence.changes table exists...');
    
    await db.run(`
      CREATE TABLE IF NOT EXISTS intelligence.changes (
        id SERIAL PRIMARY KEY,
        company TEXT NOT NULL,
        url TEXT NOT NULL,
        detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        change_type TEXT,
        before_hash TEXT,
        after_hash TEXT,
        before_content TEXT,
        after_content TEXT,
        change_summary TEXT,
        relevance_score INTEGER DEFAULT 5,
        enhanced_analysis JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(company, url, detected_at)
      )
    `);
    
    console.log('✅ changes table ready\n');
    
    // 5. Create all indexes
    console.log('🔍 Creating indexes...');
    
    const indexes = [
      // baseline_analysis indexes
      'CREATE INDEX IF NOT EXISTS idx_baseline_analysis_company ON intelligence.baseline_analysis(company)',
      'CREATE INDEX IF NOT EXISTS idx_baseline_analysis_url ON intelligence.baseline_analysis(url)',
      'CREATE INDEX IF NOT EXISTS idx_baseline_analysis_analysis_date ON intelligence.baseline_analysis(analysis_date DESC)',
      
      // enhanced_analysis indexes
      'CREATE INDEX IF NOT EXISTS idx_enhanced_analysis_company_id ON intelligence.enhanced_analysis(company_id)',
      'CREATE INDEX IF NOT EXISTS idx_enhanced_analysis_change_id ON intelligence.enhanced_analysis(change_id)',
      'CREATE INDEX IF NOT EXISTS idx_enhanced_analysis_created_at ON intelligence.enhanced_analysis(created_at DESC)',
      
      // changes indexes
      'CREATE INDEX IF NOT EXISTS idx_changes_company ON intelligence.changes(company)',
      'CREATE INDEX IF NOT EXISTS idx_changes_url ON intelligence.changes(url)',
      'CREATE INDEX IF NOT EXISTS idx_changes_detected_at ON intelligence.changes(detected_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_changes_relevance_score ON intelligence.changes(relevance_score DESC)'
    ];
    
    for (const index of indexes) {
      try {
        await db.run(index);
      } catch (err) {
        if (!err.message.includes('already exists')) {
          console.error(`Error creating index: ${err.message}`);
        }
      }
    }
    
    console.log('✅ Indexes created\n');
    
    // 6. Verify all tables
    console.log('🔍 Verifying analyzer tables...');
    
    const tables = [
      { schema: 'intelligence', table: 'baseline_analysis' },
      { schema: 'intelligence', table: 'enhanced_analysis' },
      { schema: 'intelligence', table: 'changes' }
    ];
    
    for (const { schema, table } of tables) {
      const exists = await db.get(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = $1 
          AND table_name = $2
        )
      `, [schema, table]);
      
      if (exists.exists) {
        console.log(`✅ ${schema}.${table}`);
      } else {
        console.log(`❌ ${schema}.${table} - MISSING!`);
      }
    }
    
    console.log('\n✨ All analyzer schemas fixed!');
    
  } catch (error) {
    console.error('❌ Error fixing schemas:', error);
    console.error('Full error:', error.stack);
    process.exit(1);
  } finally {
    await end();
  }
}

// Run if called directly
if (require.main === module) {
  fixAllAnalyzerSchemas()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { fixAllAnalyzerSchemas };
