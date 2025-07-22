#!/usr/bin/env node

/**
 * Fix PostgreSQL Schema for Analysis Issues
 * 
 * Addresses missing intelligence.changes table and enhanced_analysis constraints
 */

require('dotenv').config();
const { db, end } = require('./postgres-db');

async function fixAnalysisSchema() {
  try {
    console.log('🔧 Fixing PostgreSQL analysis schema...\n');
    
    // 1. Create the missing intelligence.changes table
    console.log('📊 Creating intelligence.changes table...');
    await db.run(`
      CREATE TABLE IF NOT EXISTS intelligence.changes (
        id SERIAL PRIMARY KEY,
        company TEXT NOT NULL,
        url TEXT NOT NULL,
        detected_at TIMESTAMP NOT NULL,
        change_type TEXT,
        before_content TEXT,
        after_content TEXT,
        analysis JSONB,
        interest_level INTEGER DEFAULT 5,
        ai_confidence FLOAT DEFAULT 0.8,
        content_hash_before TEXT,
        content_hash_after TEXT,
        markdown_before TEXT,
        markdown_after TEXT,
        ai_model TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(company, url, detected_at)
      )
    `);
    console.log('✅ intelligence.changes table created\n');

    // 2. Fix the enhanced_analysis table to reference the correct foreign key
    console.log('📊 Fixing enhanced_analysis table...');
    
    // First, drop the existing table if it has wrong structure
    await db.run(`
      DROP TABLE IF EXISTS intelligence.enhanced_analysis CASCADE
    `);
    
    // Recreate with correct structure
    await db.run(`
      CREATE TABLE intelligence.enhanced_analysis (
        id SERIAL PRIMARY KEY,
        change_id INTEGER NOT NULL,
        ultra_analysis JSONB,
        key_insights JSONB,
        business_impact TEXT,
        competitive_implications TEXT,
        market_signals JSONB,
        risk_assessment TEXT,
        opportunity_score INTEGER,
        analysis_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ai_model TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (change_id) REFERENCES intelligence.changes(id) ON DELETE CASCADE,
        UNIQUE(change_id)
      )
    `);
    console.log('✅ enhanced_analysis table recreated\n');

    // 3. Create necessary indexes
    console.log('🔍 Creating indexes...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_changes_company ON intelligence.changes(company)',
      'CREATE INDEX IF NOT EXISTS idx_changes_url ON intelligence.changes(url)',
      'CREATE INDEX IF NOT EXISTS idx_changes_detected_at ON intelligence.changes(detected_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_changes_interest_level ON intelligence.changes(interest_level DESC)',
      'CREATE INDEX IF NOT EXISTS idx_enhanced_analysis_change_id ON intelligence.enhanced_analysis(change_id)',
      'CREATE INDEX IF NOT EXISTS idx_enhanced_analysis_opportunity_score ON intelligence.enhanced_analysis(opportunity_score DESC)'
    ];

    for (const index of indexes) {
      await db.run(index);
    }
    console.log('✅ Indexes created\n');

    // 4. Create the markdown_pages table if missing
    console.log('📊 Ensuring markdown_pages table exists...');
    await db.run(`
      CREATE TABLE IF NOT EXISTS processed_content.markdown_pages (
        id SERIAL PRIMARY KEY,
        source_hash TEXT UNIQUE NOT NULL,
        content TEXT,
        word_count INTEGER,
        processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ markdown_pages table ready\n');

    // 5. Add index for source_hash lookups
    await db.run(`
      CREATE INDEX IF NOT EXISTS idx_markdown_pages_source_hash 
      ON processed_content.markdown_pages(source_hash)
    `);

    // 6. Verify the schema
    console.log('🔍 Verifying schema...\n');
    
    const changes_cols = await db.all(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'intelligence' 
      AND table_name = 'changes'
      ORDER BY ordinal_position
    `);
    
    console.log('intelligence.changes columns:');
    changes_cols.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    
    const enhanced_cols = await db.all(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'intelligence' 
      AND table_name = 'enhanced_analysis'
      ORDER BY ordinal_position
    `);
    
    console.log('\nintelligence.enhanced_analysis columns:');
    enhanced_cols.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });

    // Check constraints
    const constraints = await db.all(`
      SELECT conname, contype
      FROM pg_constraint 
      WHERE conrelid = 'intelligence.changes'::regclass
    `);
    
    console.log('\nintelligence.changes constraints:');
    constraints.forEach(con => {
      console.log(`  - ${con.conname}: ${con.contype}`);
    });

    console.log('\n✨ Analysis schema fixes complete!\n');
    
  } catch (error) {
    console.error('❌ Error fixing analysis schema:', error);
    process.exit(1);
  } finally {
    await end();
  }
}

// Run if called directly
if (require.main === module) {
  fixAnalysisSchema()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { fixAnalysisSchema };
