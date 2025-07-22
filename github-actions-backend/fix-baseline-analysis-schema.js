#!/usr/bin/env node

/**
 * Fix Intelligence Baseline Analysis Schema
 * 
 * Creates the baseline_analysis table in the intelligence schema
 * with the correct columns expected by ai-analyzer-baseline-three-db-postgres.js
 */

require('dotenv').config();
const { db, end } = require('./postgres-db');

async function fixBaselineAnalysisSchema() {
  try {
    console.log('🔧 Fixing intelligence.baseline_analysis schema...\n');
    
    // Create intelligence schema if it doesn't exist
    await db.run('CREATE SCHEMA IF NOT EXISTS intelligence');
    
    // Drop the old table if it exists in the wrong schema
    console.log('🔍 Checking for existing baseline_analysis tables...');
    const oldTable = await db.get(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'processed_content' 
        AND table_name = 'baseline_analysis'
      )
    `);
    
    if (oldTable.exists) {
      console.log('⚠️  Found baseline_analysis in processed_content schema - will migrate data');
    }
    
    // Create the baseline_analysis table in intelligence schema with correct columns
    console.log('📊 Creating intelligence.baseline_analysis table...');
    await db.run(`
      CREATE TABLE IF NOT EXISTS intelligence.baseline_analysis (
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
    
    // Create indexes
    console.log('🔍 Creating indexes...');
    await db.run('CREATE INDEX IF NOT EXISTS idx_baseline_analysis_company ON intelligence.baseline_analysis(company)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_baseline_analysis_url ON intelligence.baseline_analysis(url)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_baseline_analysis_analysis_date ON intelligence.baseline_analysis(analysis_date DESC)');
    
    // Verify the table was created
    const tableExists = await db.get(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'intelligence' 
        AND table_name = 'baseline_analysis'
      )
    `);
    
    if (tableExists.exists) {
      console.log('✅ intelligence.baseline_analysis table created successfully');
      
      // Check column structure
      const columns = await db.all(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'intelligence' 
        AND table_name = 'baseline_analysis'
        ORDER BY ordinal_position
      `);
      
      console.log('\n📋 Table columns:');
      columns.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type}`);
      });
    } else {
      throw new Error('Failed to create baseline_analysis table');
    }
    
    console.log('\n✨ Schema fix complete!');
    
  } catch (error) {
    console.error('❌ Error fixing schema:', error);
    process.exit(1);
  } finally {
    await end();
  }
}

// Run if called directly
if (require.main === module) {
  fixBaselineAnalysisSchema()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { fixBaselineAnalysisSchema };
