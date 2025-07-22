#!/usr/bin/env node

/**
 * Fix PostgreSQL baseline_analysis schema
 * Adds missing entities column
 */

// SSL Certificate fix
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { Client } = require('pg');

async function fixSchema() {
  if (!process.env.POSTGRES_CONNECTION_STRING) {
    console.error('❌ POSTGRES_CONNECTION_STRING not set');
    process.exit(1);
  }

  const client = new Client({
    connectionString: process.env.POSTGRES_CONNECTION_STRING,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Connecting to PostgreSQL...');
    await client.connect();
    console.log('✅ Connected!');
    
    // Check if baseline_analysis table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'intelligence' 
        AND table_name = 'baseline_analysis'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ baseline_analysis table does not exist');
      console.log('Creating table with proper schema...');
      
      // Create the table with all required columns
      await client.query(`
        CREATE TABLE intelligence.baseline_analysis (
          id SERIAL PRIMARY KEY,
          company_id INTEGER REFERENCES intelligence.companies(id),
          company_name TEXT,
          analysis_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          summary TEXT,
          key_offerings TEXT,
          target_market TEXT,
          competitive_advantages TEXT,
          recent_developments TEXT,
          market_position TEXT,
          entities JSONB,
          relationships JSONB,
          analysis_version TEXT DEFAULT '1.0',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      console.log('✅ Created baseline_analysis table with entities column');
    } else {
      // Table exists, check if entities column exists
      const columnCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'intelligence' 
          AND table_name = 'baseline_analysis'
          AND column_name = 'entities'
        );
      `);
      
      if (!columnCheck.rows[0].exists) {
        console.log('⚠️  entities column missing, adding it...');
        
        await client.query(`
          ALTER TABLE intelligence.baseline_analysis 
          ADD COLUMN IF NOT EXISTS entities JSONB DEFAULT '[]'::jsonb;
        `);
        
        console.log('✅ Added entities column');
      } else {
        console.log('✅ entities column already exists');
      }
      
      // Also check for relationships column
      const relCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'intelligence' 
          AND table_name = 'baseline_analysis'
          AND column_name = 'relationships'
        );
      `);
      
      if (!relCheck.rows[0].exists) {
        console.log('⚠️  relationships column missing, adding it...');
        
        await client.query(`
          ALTER TABLE intelligence.baseline_analysis 
          ADD COLUMN IF NOT EXISTS relationships JSONB DEFAULT '[]'::jsonb;
        `);
        
        console.log('✅ Added relationships column');
      }
    }
    
    // Create index for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_baseline_analysis_company 
      ON intelligence.baseline_analysis(company_id);
    `);
    
    console.log('✅ Schema fix completed successfully!');
    
    // Show table structure
    const columns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'intelligence' 
      AND table_name = 'baseline_analysis'
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📋 baseline_analysis table structure:');
    columns.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Disconnected from PostgreSQL');
  }
}

fixSchema();