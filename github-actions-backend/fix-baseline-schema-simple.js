#!/usr/bin/env node

// SSL Certificate fix
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

require('dotenv').config();
const { Client } = require('pg');

async function fixBaselineSchema() {
  const client = new Client({
    connectionString: process.env.POSTGRES_CONNECTION_STRING,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL\n');
    
    // Drop the old table
    console.log('🗑️  Dropping old baseline_analysis table...');
    await client.query('DROP TABLE IF EXISTS intelligence.baseline_analysis CASCADE');
    
    // Create new table with JSONB columns
    console.log('📋 Creating new baseline_analysis table with JSONB structure...');
    await client.query(`
      CREATE TABLE intelligence.baseline_analysis (
        id SERIAL PRIMARY KEY,
        company TEXT NOT NULL,
        url TEXT NOT NULL,
        analysis_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        -- JSONB columns for structured data
        entities JSONB DEFAULT '{}',
        themes JSONB DEFAULT '[]',
        sentiment JSONB DEFAULT '{}',
        key_points JSONB DEFAULT '[]',
        
        -- Other columns
        summary TEXT,
        interest_level INTEGER DEFAULT 5,
        ai_model TEXT DEFAULT 'llama-3.3-70b-versatile',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create indexes
    console.log('🔍 Creating indexes...');
    await client.query('CREATE INDEX idx_baseline_company ON intelligence.baseline_analysis(company)');
    await client.query('CREATE INDEX idx_baseline_date ON intelligence.baseline_analysis(analysis_date)');
    await client.query('CREATE INDEX idx_baseline_entities ON intelligence.baseline_analysis USING gin(entities)');
    
    console.log('✅ Schema fixed successfully!\n');
    
    // Show the new structure
    const columns = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'intelligence' 
      AND table_name = 'baseline_analysis'
      ORDER BY ordinal_position;
    `);
    
    console.log('New table structure:');
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

fixBaselineSchema();
