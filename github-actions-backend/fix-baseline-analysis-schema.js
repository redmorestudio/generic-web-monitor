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
    
    // Check if table already exists
    console.log('🔍 Checking for existing baseline_analysis table...');
    const tableExists = await db.get(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'intelligence' 
        AND table_name = 'baseline_analysis'
      )
    `);
    
    if (tableExists.exists) {
      console.log('⚠️  Table intelligence.baseline_analysis already exists');
      
      // Check if it has the required columns
      const columns = await db.all(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'intelligence' 
        AND table_name = 'baseline_analysis'
      `);
      
      const columnNames = columns.map(c => c.column_name);
      console.log('📋 Existing columns:', columnNames.join(', '));
      
      // Check for required columns
      const requiredColumns = ['company', 'url', 'company_type', 'page_purpose'];
      const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));
      
      if (missingColumns.length > 0) {
        console.log('❌ Missing required columns:', missingColumns.join(', '));
        
        // Drop and recreate the table
        console.log('🔄 Dropping and recreating table with correct schema...');
        await db.run('DROP TABLE IF EXISTS intelligence.baseline_analysis CASCADE');
      } else {
        console.log('✅ Table has all required columns');
        return;
      }
    }
    
    // Create the baseline_analysis table in intelligence schema with correct columns
    console.log('📊 Creating intelligence.baseline_analysis table...');
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
    
    console.log('✅ Table created successfully');
    
    // Create indexes
    console.log('🔍 Creating indexes...');
    const indexes = [
      'CREATE INDEX idx_baseline_analysis_company ON intelligence.baseline_analysis(company)',
      'CREATE INDEX idx_baseline_analysis_url ON intelligence.baseline_analysis(url)',
      'CREATE INDEX idx_baseline_analysis_analysis_date ON intelligence.baseline_analysis(analysis_date DESC)'
    ];
    
    for (const index of indexes) {
      try {
        await db.run(index);
        console.log('✅ Created index:', index.match(/idx_\w+/)[0]);
      } catch (err) {
        if (err.message.includes('already exists')) {
          console.log('⚠️  Index already exists:', index.match(/idx_\w+/)[0]);
        } else {
          throw err;
        }
      }
    }
    
    // Verify the final table structure
    const finalColumns = await db.all(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'intelligence' 
      AND table_name = 'baseline_analysis'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Final table structure:');
    finalColumns.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });
    
    console.log('\n✨ Schema fix complete!');
    
  } catch (error) {
    console.error('❌ Error fixing schema:', error);
    console.error('Full error:', error.stack);
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
