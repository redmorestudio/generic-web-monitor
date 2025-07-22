#!/usr/bin/env node

/**
 * Fix Intelligence Baseline Analysis Schema - Smart Version
 * 
 * This version checks if data exists in the old location and only
 * modifies schemas if needed, preserving existing data structure
 */

require('dotenv').config();
const { db, end } = require('./postgres-db');

async function fixBaselineAnalysisSchema() {
  try {
    console.log('🔧 Running smart baseline_analysis schema fix...\n');
    
    // 1. Create schemas if they don't exist
    console.log('📂 Ensuring schemas exist...');
    await db.run('CREATE SCHEMA IF NOT EXISTS raw_content');
    await db.run('CREATE SCHEMA IF NOT EXISTS processed_content');
    await db.run('CREATE SCHEMA IF NOT EXISTS intelligence');
    console.log('✅ Schemas ready\n');
    
    // 2. Check what exists in processed_content
    console.log('🔍 Checking existing baseline_analysis tables...');
    
    const processedContentTable = await db.get(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'processed_content' 
        AND table_name = 'baseline_analysis'
      )
    `);
    
    const intelligenceTable = await db.get(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'intelligence' 
        AND table_name = 'baseline_analysis'
      )
    `);
    
    // If table exists in processed_content with data, keep it there
    if (processedContentTable.exists) {
      console.log('✅ Found baseline_analysis in processed_content schema');
      
      // Check if it has data
      const dataCount = await db.get(`
        SELECT COUNT(*) as count FROM processed_content.baseline_analysis
      `);
      
      if (dataCount.count > 0) {
        console.log(`✅ Table has ${dataCount.count} records - keeping existing structure`);
        
        // Just ensure indexes exist
        console.log('\n🔍 Ensuring indexes exist...');
        const indexes = [
          'CREATE INDEX IF NOT EXISTS idx_baseline_analysis_url_id ON processed_content.baseline_analysis(url_id)',
          'CREATE INDEX IF NOT EXISTS idx_baseline_analysis_created_at ON processed_content.baseline_analysis(created_at DESC)'
        ];
        
        for (const index of indexes) {
          try {
            await db.run(index);
          } catch (err) {
            // Ignore if already exists
          }
        }
        
        console.log('✅ Existing structure preserved');
        return;
      }
    }
    
    // If table exists in intelligence, check its structure
    if (intelligenceTable.exists) {
      console.log('✅ Found baseline_analysis in intelligence schema');
      
      const columns = await db.all(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'intelligence' 
        AND table_name = 'baseline_analysis'
      `);
      
      const columnNames = columns.map(c => c.column_name);
      console.log('📋 Existing columns:', columnNames.join(', '));
      
      // Check if it's the simple structure (company, url) or complex structure (entities, themes)
      if (columnNames.includes('entities')) {
        console.log('✅ Table has complex structure with entities - keeping it');
        return;
      }
    }
    
    // 3. Create the table in processed_content with the complex structure
    // that generate-static-data-three-db-postgres.js expects
    console.log('\n📊 Creating processed_content.baseline_analysis with expected structure...');
    
    await db.run('DROP TABLE IF EXISTS processed_content.baseline_analysis CASCADE');
    
    await db.run(`
      CREATE TABLE processed_content.baseline_analysis (
        id SERIAL PRIMARY KEY,
        url_id INTEGER REFERENCES intelligence.company_urls(id),
        entities JSONB,
        themes JSONB,
        key_points JSONB,
        sentiment TEXT,
        summary TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Table created with expected structure\n');
    
    // 4. Create indexes
    console.log('🔍 Creating indexes...');
    const indexes = [
      { name: 'idx_baseline_analysis_url_id', sql: 'CREATE INDEX idx_baseline_analysis_url_id ON processed_content.baseline_analysis(url_id)' },
      { name: 'idx_baseline_analysis_created_at', sql: 'CREATE INDEX idx_baseline_analysis_created_at ON processed_content.baseline_analysis(created_at DESC)' }
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
        }
      }
    }
    
    // 5. Also ensure the simple structure exists in intelligence for the baseline analyzer
    if (!intelligenceTable.exists) {
      console.log('\n📊 Creating intelligence.baseline_analysis for baseline analyzer...');
      
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
      
      console.log('✅ Created intelligence.baseline_analysis for analyzer');
    }
    
    console.log('\n✨ Schema fix complete! Both table structures ready.');
    
  } catch (error) {
    console.error('\n❌ Error fixing schema:', error.message);
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
