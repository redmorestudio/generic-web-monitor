#!/usr/bin/env node

// Fix PostgreSQL enhanced_analysis table to match SQLite schema
// This adds the change_id column and other missing columns

const { query, end } = require('./postgres-db');

async function fixEnhancedAnalysisTable() {
  console.log('🔧 Fixing PostgreSQL enhanced_analysis table schema...');
  
  try {
    // First, let's check current schema
    console.log('📋 Checking current schema...');
    const currentColumns = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'intelligence' 
      AND table_name = 'enhanced_analysis'
      ORDER BY ordinal_position
    `);
    
    console.log('Current columns:', currentColumns.rows.map(c => c.column_name).join(', '));
    
    // Drop the old table and recreate with correct schema
    console.log('\n🔄 Recreating enhanced_analysis table with correct schema...');
    
    await query('BEGIN');
    
    try {
      // Drop the old table
      await query('DROP TABLE IF EXISTS intelligence.enhanced_analysis CASCADE');
      
      // Create new table matching what the analyzer expects
      await query(`
        CREATE TABLE intelligence.enhanced_analysis (
          id SERIAL PRIMARY KEY,
          change_id INTEGER UNIQUE,
          ultra_analysis JSONB,
          key_insights TEXT[],
          business_impact TEXT,
          competitive_implications TEXT,
          market_signals TEXT[],
          risk_assessment TEXT,
          opportunity_score REAL,
          analysis_timestamp TIMESTAMP DEFAULT NOW(),
          ai_model TEXT,
          
          -- Legacy columns for compatibility
          entities TEXT,
          relationships TEXT,
          semantic_categories TEXT,
          competitive_data TEXT,
          smart_groups TEXT,
          quantitative_data TEXT,
          extracted_text TEXT,
          full_extraction TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
      
      // Create index
      await query('CREATE INDEX idx_enhanced_change ON intelligence.enhanced_analysis(change_id)');
      
      // Create foreign key to changes table
      await query(`
        ALTER TABLE intelligence.enhanced_analysis 
        ADD CONSTRAINT fk_change_id 
        FOREIGN KEY (change_id) 
        REFERENCES intelligence.changes(id) 
        ON DELETE CASCADE
      `);
      
      await query('COMMIT');
      console.log('✅ Enhanced analysis table recreated successfully!');
      
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
    
    // Verify new schema
    const newColumns = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'intelligence' 
      AND table_name = 'enhanced_analysis'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 New columns:', newColumns.rows.map(c => c.column_name).join(', '));
    
  } catch (error) {
    console.error('❌ Error fixing table:', error.message);
    throw error;
  } finally {
    await end();
  }
}

// Run if called directly
if (require.main === module) {
  fixEnhancedAnalysisTable()
    .then(() => {
      console.log('\n✅ Schema fix complete!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Schema fix failed:', error);
      process.exit(1);
    });
}

module.exports = fixEnhancedAnalysisTable;
