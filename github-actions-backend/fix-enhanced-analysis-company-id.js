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
  const protector = new SchemaProtector();

  await protector.executeWithProtection(
    'fix-enhanced-analysis-company-id.js',
    'Add missing company_id and content_id columns to intelligence.enhanced_analysis table',
    async () => {
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
            ultra_analysis JSONB,
            key_insights JSONB,
            market_signals JSONB,
            risk_assessment JSONB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        console.log('🔗 Creating indexes for enhanced_analysis...');
        await db.run('CREATE INDEX IF NOT EXISTS idx_enhanced_analysis_company ON intelligence.enhanced_analysis(company_id)');
        await db.run('CREATE INDEX IF NOT EXISTS idx_enhanced_analysis_change ON intelligence.enhanced_analysis(change_id)');
        
        console.log('✅ intelligence.enhanced_analysis table created with all required columns');
        return;
      }

      // Check if company_id column exists
      const companyIdExists = await db.get(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_schema = 'intelligence' 
          AND table_name = 'enhanced_analysis' 
          AND column_name = 'company_id'
        ) as exists
      `);

      if (!companyIdExists.exists) {
        console.log('🔧 Adding company_id column to enhanced_analysis...');
        await db.run('ALTER TABLE intelligence.enhanced_analysis ADD COLUMN company_id INTEGER NOT NULL DEFAULT 1');
        console.log('✅ company_id column added');
      } else {
        console.log('✅ company_id column already exists');
      }

      // Check if content_id column exists
      const contentIdExists = await db.get(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_schema = 'intelligence' 
          AND table_name = 'enhanced_analysis' 
          AND column_name = 'content_id'
        ) as exists
      `);

      if (!contentIdExists.exists) {
        console.log('🔧 Adding content_id column to enhanced_analysis...');
        await db.run('ALTER TABLE intelligence.enhanced_analysis ADD COLUMN content_id INTEGER');
        console.log('✅ content_id column added');
      } else {
        console.log('✅ content_id column already exists');
      }

      // Ensure companies table exists for foreign key
      console.log('🏢 Ensuring intelligence.companies table exists...');
      await db.run(`
        CREATE TABLE IF NOT EXISTS intelligence.companies (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          category TEXT,
          interest_level INTEGER DEFAULT 5,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create indexes if they don't exist
      console.log('🔍 Creating indexes...');
      await db.run('CREATE INDEX IF NOT EXISTS idx_enhanced_analysis_company ON intelligence.enhanced_analysis(company_id)');
      await db.run('CREATE INDEX IF NOT EXISTS idx_enhanced_analysis_change ON intelligence.enhanced_analysis(change_id)');

      // Verify final structure
      console.log('🔍 Verifying final table structure...');
      const columns = await db.all(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_schema = 'intelligence' 
        AND table_name = 'enhanced_analysis'
        ORDER BY ordinal_position
      `);

      console.log('\\n📋 Final enhanced_analysis table structure:');
      columns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
      });

      console.log('\\n✅ Enhanced analysis schema fix completed successfully!');
    }
  );
}

// Run if called directly
if (require.main === module) {
  fixEnhancedAnalysisSchema().catch(console.error);
}

module.exports = { fixEnhancedAnalysisSchema };
