#!/usr/bin/env node

/**
 * PROTECTED Schema Fix - Enhanced Analysis company_id Column
 * Fixes missing company_id column in intelligence.enhanced_analysis table
 * 
 * CRITICAL: Uses schema-protector.js for safe schema modifications
 */

// Load environment variables
if (!process.env.GITHUB_ACTIONS && !process.env.POSTGRES_CONNECTION_STRING) {
  try {
    require('dotenv').config();
  } catch (e) {
    // dotenv not available or no .env file - this is fine
  }
}

// SSL Certificate fix for Heroku PostgreSQL
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { SchemaProtector } = require('./schema-protector');
const { db } = require('./postgres-db');

async function fixEnhancedAnalysisSchema() {
  try {
    console.log('🔍 Checking current enhanced_analysis table structure...');
    
    // Check if table exists
    const tableExists = await db.get(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'intelligence' 
        AND table_name = 'enhanced_analysis'
      ) as exists
    `);

    if (!tableExists.exists) {
      console.log('📋 Creating intelligence.enhanced_analysis table...');
      await db.run(`
        CREATE TABLE intelligence.enhanced_analysis (
          id SERIAL PRIMARY KEY,
          change_id INTEGER UNIQUE,
          company_id INTEGER NOT NULL,
          content_id INTEGER,
          analysis_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          key_changes TEXT,
          change_magnitude REAL DEFAULT 0,
          interest_score REAL DEFAULT 0,
          categories TEXT,
          summary TEXT,
          ultra_analysis JSONB,
          key_insights JSONB,
          business_impact TEXT,
          competitive_implications TEXT,
          market_signals JSONB,
          risk_assessment JSONB,
          opportunity_score REAL,
          analysis_timestamp TIMESTAMP,
          ai_model TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      console.log('🔗 Creating indexes for enhanced_analysis...');
      await db.run('CREATE INDEX IF NOT EXISTS idx_enhanced_analysis_company ON intelligence.enhanced_analysis(company_id)');
      await db.run('CREATE INDEX IF NOT EXISTS idx_enhanced_analysis_change ON intelligence.enhanced_analysis(change_id)');
      
      console.log('✅ intelligence.enhanced_analysis table created with all required columns');
      return;
    }

    // Check current table structure
    const columns = await db.all(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'intelligence' 
      AND table_name = 'enhanced_analysis'
      ORDER BY ordinal_position
    `);

    console.log('📋 Current enhanced_analysis table structure:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
    });

    // Check if company_id column exists
    const hasCompanyId = columns.some(col => col.column_name === 'company_id');
    const hasContentId = columns.some(col => col.column_name === 'content_id');

    // Ensure companies table exists for foreign key
    console.log('🏢 Ensuring intelligence.companies table exists...');
    await db.run(`
      CREATE TABLE IF NOT EXISTS intelligence.companies (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT,
        interest_level INTEGER DEFAULT 5,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add unique constraint on company name if needed
    await db.run(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_name_unique 
      ON intelligence.companies(name)
    `).catch(() => {
      // Index might already exist, ignore error
    });

    // Add missing columns
    if (!hasCompanyId) {
      console.log('🔧 Adding company_id column to enhanced_analysis...');
      
      // Count existing rows
      const rowCount = await db.get('SELECT COUNT(*) as count FROM intelligence.enhanced_analysis');
      console.log(`   📊 Table has ${rowCount.count} existing rows`);
      
      if (parseInt(rowCount.count) === 0) {
        // No existing data - can add NOT NULL column directly
        await db.run('ALTER TABLE intelligence.enhanced_analysis ADD COLUMN company_id INTEGER NOT NULL DEFAULT 1');
        console.log('   ✅ company_id column added (NOT NULL with default)');
      } else {
        // Has existing data - add as nullable first, then update values, then make NOT NULL
        await db.run('ALTER TABLE intelligence.enhanced_analysis ADD COLUMN company_id INTEGER');
        console.log('   ➕ company_id column added (nullable)');
        
        // Create a default company if none exists
        await db.run(`
          INSERT INTO intelligence.companies (id, name, category) 
          VALUES (1, 'Unknown Company', 'auto-created') 
          ON CONFLICT DO NOTHING
        `);
        
        // Update all existing rows to have company_id = 1
        await db.run('UPDATE intelligence.enhanced_analysis SET company_id = 1 WHERE company_id IS NULL');
        console.log('   🔄 Updated existing rows with default company_id');
        
        // Now make the column NOT NULL
        await db.run('ALTER TABLE intelligence.enhanced_analysis ALTER COLUMN company_id SET NOT NULL');
        console.log('   🔒 company_id column set to NOT NULL');
      }
    } else {
      console.log('✅ company_id column already exists');
    }

    if (!hasContentId) {
      console.log('🔧 Adding content_id column to enhanced_analysis...');
      await db.run('ALTER TABLE intelligence.enhanced_analysis ADD COLUMN content_id INTEGER');
      console.log('✅ content_id column added');
    } else {
      console.log('✅ content_id column already exists');
    }

    // Add missing columns that the analyzer expects
    const expectedColumns = [
      { name: 'analysis_date', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' },
      { name: 'key_changes', type: 'TEXT' },
      { name: 'change_magnitude', type: 'REAL DEFAULT 0' },
      { name: 'interest_score', type: 'REAL DEFAULT 0' },
      { name: 'categories', type: 'TEXT' },
      { name: 'summary', type: 'TEXT' },
      { name: 'ultra_analysis', type: 'JSONB' },
      { name: 'key_insights', type: 'JSONB' },
      { name: 'business_impact', type: 'TEXT' },
      { name: 'competitive_implications', type: 'TEXT' },
      { name: 'market_signals', type: 'JSONB' },
      { name: 'risk_assessment', type: 'JSONB' },
      { name: 'opportunity_score', type: 'REAL' },
      { name: 'analysis_timestamp', type: 'TIMESTAMP' },
      { name: 'ai_model', type: 'TEXT' }
    ];

    for (const col of expectedColumns) {
      const hasColumn = columns.some(existing => existing.column_name === col.name);
      if (!hasColumn) {
        console.log(`🔧 Adding missing column: ${col.name}`);
        await db.run(`ALTER TABLE intelligence.enhanced_analysis ADD COLUMN ${col.name} ${col.type}`);
        console.log(`✅ Added column: ${col.name}`);
      }
    }

    // Create indexes if they don't exist
    console.log('🔍 Creating indexes...');
    await db.run('CREATE INDEX IF NOT EXISTS idx_enhanced_analysis_company ON intelligence.enhanced_analysis(company_id)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_enhanced_analysis_change ON intelligence.enhanced_analysis(change_id)');

    // Verify final structure
    console.log('🔍 Verifying final table structure...');
    const finalColumns = await db.all(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'intelligence' 
      AND table_name = 'enhanced_analysis'
      ORDER BY ordinal_position
    `);

    console.log('\n📋 Final enhanced_analysis table structure:');
    finalColumns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
    });

    // Verify required columns exist
    const requiredColumns = ['company_id', 'change_id'];
    for (const required of requiredColumns) {
      const exists = finalColumns.some(col => col.column_name === required);
      if (!exists) {
        throw new Error(`Required column ${required} is missing from enhanced_analysis table!`);
      }
    }

    console.log('\n✅ Enhanced analysis schema fix completed successfully!');
    console.log('🎉 Table is ready for AI analysis!');

  } catch (error) {
    console.error('❌ Error fixing enhanced_analysis schema:', error.message);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  fixEnhancedAnalysisSchema()
    .then(() => {
      console.log('\n🎉 Schema fix completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Schema fix failed:', error.message);
      process.exit(1);
    });
}

module.exports = { fixEnhancedAnalysisSchema };
