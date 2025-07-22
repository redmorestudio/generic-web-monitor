#!/usr/bin/env node

/**
 * Debug and fix baseline_analysis schema comprehensively
 */

// SSL Certificate fix
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { Client } = require('pg');

async function debugAndFixSchema() {
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
    
    // First, check what baseline_analysis tables exist across ALL schemas
    console.log('\n🔍 Checking for baseline_analysis tables in all schemas...');
    const tables = await client.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_name = 'baseline_analysis'
      ORDER BY table_schema;
    `);
    
    console.log(`\nFound ${tables.rows.length} baseline_analysis tables:`);
    tables.rows.forEach(t => {
      console.log(`   - ${t.table_schema}.${t.table_name}`);
    });
    
    // Check columns for each table
    for (const table of tables.rows) {
      console.log(`\n📋 Columns in ${table.table_schema}.baseline_analysis:`);
      const columns = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_schema = $1 AND table_name = 'baseline_analysis'
        ORDER BY ordinal_position;
      `, [table.table_schema]);
      
      columns.rows.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
      });
      
      // Check if entities column exists
      const hasEntities = columns.rows.some(col => col.column_name === 'entities');
      if (!hasEntities) {
        console.log(`   ⚠️  Missing entities column!`);
      }
    }
    
    // Now fix the intelligence schema table
    console.log('\n🔧 Fixing intelligence.baseline_analysis table...');
    
    // Check if table exists in intelligence schema
    const intelTable = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'intelligence' 
        AND table_name = 'baseline_analysis'
      );
    `);
    
    if (!intelTable.rows[0].exists) {
      console.log('Creating intelligence.baseline_analysis table with all columns...');
      await client.query(`
        CREATE TABLE intelligence.baseline_analysis (
          id SERIAL PRIMARY KEY,
          company_id INTEGER,
          company_name TEXT,
          url_id INTEGER,
          url TEXT,
          analysis_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          summary TEXT,
          key_offerings TEXT,
          target_market TEXT,
          competitive_advantages TEXT,
          recent_developments TEXT,
          market_position TEXT,
          entities JSONB DEFAULT '[]'::jsonb,
          themes JSONB DEFAULT '[]'::jsonb,
          sentiment JSONB DEFAULT '{}'::jsonb,
          key_points JSONB DEFAULT '[]'::jsonb,
          relationships JSONB DEFAULT '[]'::jsonb,
          analysis_version TEXT DEFAULT '1.0',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✅ Created table with all columns');
    } else {
      // Table exists, add missing columns
      console.log('Table exists, adding missing columns...');
      
      const columnsToAdd = [
        { name: 'entities', type: 'JSONB', default: "'[]'::jsonb" },
        { name: 'themes', type: 'JSONB', default: "'[]'::jsonb" },
        { name: 'sentiment', type: 'JSONB', default: "'{}'::jsonb" },
        { name: 'key_points', type: 'JSONB', default: "'[]'::jsonb" },
        { name: 'relationships', type: 'JSONB', default: "'[]'::jsonb" }
      ];
      
      for (const col of columnsToAdd) {
        try {
          await client.query(`
            ALTER TABLE intelligence.baseline_analysis 
            ADD COLUMN IF NOT EXISTS ${col.name} ${col.type} DEFAULT ${col.default};
          `);
          console.log(`✅ Added/verified column: ${col.name}`);
        } catch (err) {
          console.log(`⚠️  Error adding ${col.name}: ${err.message}`);
        }
      }
    }
    
    // Create index
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_baseline_analysis_company 
      ON intelligence.baseline_analysis(company_id);
    `);
    
    // Final verification
    console.log('\n✅ Final table structure:');
    const finalColumns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'intelligence' 
      AND table_name = 'baseline_analysis'
      ORDER BY ordinal_position;
    `);
    
    finalColumns.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });
    
    // Check if any data exists
    const dataCount = await client.query(`
      SELECT COUNT(*) as count FROM intelligence.baseline_analysis;
    `);
    console.log(`\n📊 Existing records: ${dataCount.rows[0].count}`);
    
    console.log('\n🎉 Schema fix completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await client.end();
  }
}

debugAndFixSchema();