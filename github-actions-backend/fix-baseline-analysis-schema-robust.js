#!/usr/bin/env node

/**
 * Fix Intelligence Baseline Analysis Schema - Robust Version
 * 
 * This version handles all edge cases and ensures the table exists with correct schema
 */

// Only load dotenv in development (not in GitHub Actions)
if (!process.env.GITHUB_ACTIONS && !process.env.POSTGRES_CONNECTION_STRING) {
  try {
    require('dotenv').config();
  } catch (e) {
    // dotenv not available or no .env file - this is fine
  }
}
const { db, end } = require('./postgres-db');

async function fixBaselineAnalysisSchema() {
  try {
    console.log('🔧 Running robust baseline_analysis schema fix...\n');
    
    // 1. Create schemas if they don't exist
    console.log('📂 Ensuring schemas exist...');
    await db.run('CREATE SCHEMA IF NOT EXISTS raw_content');
    await db.run('CREATE SCHEMA IF NOT EXISTS processed_content');
    await db.run('CREATE SCHEMA IF NOT EXISTS intelligence');
    console.log('✅ Schemas ready\n');
    
    // 2. Drop any existing baseline_analysis tables in wrong locations
    console.log('🧹 Cleaning up old tables...');
    const locations = [
      'processed_content.baseline_analysis',
      'intelligence.baseline_analysis'
    ];
    
    for (const location of locations) {
      try {
        await db.run(`DROP TABLE IF EXISTS ${location} CASCADE`);
        console.log(`   Dropped ${location} if it existed`);
      } catch (err) {
        console.log(`   Note: ${err.message}`);
      }
    }
    
    // 3. Create the table with correct schema
    console.log('\n📊 Creating intelligence.baseline_analysis table...');
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
    
    console.log('✅ Table created successfully\n');
    
    // 4. Create indexes one by one with error handling
    console.log('🔍 Creating indexes...');
    const indexes = [
      { name: 'idx_baseline_analysis_company', sql: 'CREATE INDEX idx_baseline_analysis_company ON intelligence.baseline_analysis(company)' },
      { name: 'idx_baseline_analysis_url', sql: 'CREATE INDEX idx_baseline_analysis_url ON intelligence.baseline_analysis(url)' },
      { name: 'idx_baseline_analysis_analysis_date', sql: 'CREATE INDEX idx_baseline_analysis_analysis_date ON intelligence.baseline_analysis(analysis_date DESC)' }
    ];
    
    for (const index of indexes) {
      try {
        await db.run(index.sql);
        console.log(`✅ Created index: ${index.name}`);
      } catch (err) {
        if (err.message.includes('already exists')) {
          console.log(`⚠️  Index already exists: ${index.name}`);
        } else {
          console.error(`❌ Failed to create index ${index.name}: ${err.message}`);
          // Don't throw - indexes are nice to have but not critical
        }
      }
    }
    
    // 5. Verify the final table structure
    console.log('\n🔍 Verifying final table structure...');
    
    const tableCheck = await db.get(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'intelligence' 
        AND table_name = 'baseline_analysis'
      )
    `);
    
    if (!tableCheck.exists) {
      throw new Error('Table creation verification failed - table does not exist!');
    }
    
    const columns = await db.all(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'intelligence' 
      AND table_name = 'baseline_analysis'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Final table structure:');
    columns.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });
    
    // Check for critical columns
    const columnNames = columns.map(c => c.column_name);
    const requiredColumns = ['company', 'url', 'company_type', 'page_purpose'];
    const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));
    
    if (missingColumns.length > 0) {
      throw new Error(`Missing critical columns: ${missingColumns.join(', ')}`);
    }
    
    console.log('\n✨ Schema fix complete! Table is ready for use.');
    
  } catch (error) {
    console.error('\n❌ Error fixing schema:', error.message);
    console.error('Full error:', error.stack);
    
    // Try the comprehensive fix as last resort
    console.log('\n🔄 Attempting comprehensive fix...');
    try {
      const { fixAllAnalyzerSchemas } = require('./fix-all-analyzer-schemas');
      await fixAllAnalyzerSchemas();
    } catch (fallbackError) {
      console.error('❌ Comprehensive fix also failed:', fallbackError.message);
      process.exit(1);
    }
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
