#!/usr/bin/env node

// SSL Certificate fix for Heroku PostgreSQL
if (process.env.NODE_ENV === 'production' || process.env.POSTGRES_CONNECTION_STRING) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const { db, end } = require('./postgres-db');

async function fixAnalyzeSchema() {
  console.log('🔧 Fixing PostgreSQL analyzer schema...');
  
  try {
    // Check if enhanced_analysis table exists
    const tableExists = await db.get(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'intelligence' 
        AND table_name = 'enhanced_analysis'
      )
    `);
    
    if (!tableExists.exists) {
      console.log('❌ enhanced_analysis table does not exist! Please run the full schema creation.');
      process.exit(1);
    }
    
    // Check if change_id column exists
    const columnExists = await db.get(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'intelligence' 
        AND table_name = 'enhanced_analysis'
        AND column_name = 'change_id'
      )
    `);
    
    if (!columnExists.exists) {
      console.log('⚠️  Adding missing change_id column to enhanced_analysis...');
      await db.run(`
        ALTER TABLE intelligence.enhanced_analysis 
        ADD COLUMN IF NOT EXISTS change_id INTEGER REFERENCES intelligence.changes(id)
      `);
      console.log('✅ Added change_id column');
    }
    
    // Check for unique constraint and add if missing
    const constraintExists = await db.get(`
      SELECT EXISTS (
        SELECT FROM pg_constraint 
        WHERE conname = 'enhanced_analysis_change_id_key'
      )
    `);
    
    if (!constraintExists.exists) {
      console.log('⚠️  Adding unique constraint on change_id...');
      await db.run(`
        ALTER TABLE intelligence.enhanced_analysis 
        ADD CONSTRAINT enhanced_analysis_change_id_key UNIQUE (change_id)
      `);
      console.log('✅ Added unique constraint');
    }
    
    console.log('✅ Schema fixes complete!');
    
  } catch (error) {
    console.error('❌ Error fixing schema:', error);
    process.exit(1);
  } finally {
    await end();
  }
}

// Run if called directly
if (require.main === module) {
  fixAnalyzeSchema();
}

module.exports = { fixAnalyzeSchema };
