#!/usr/bin/env node
// Only load dotenv in development (not in GitHub Actions)
if (!process.env.GITHUB_ACTIONS && !process.env.POSTGRES_CONNECTION_STRING) {
  try {
    require('dotenv').config();
  } catch (e) {
    // dotenv not available or no .env file - this is fine
  }
}
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { Client } = require('pg');

async function checkSchema() {
  const client = new Client({
    connectionString: process.env.POSTGRES_CONNECTION_STRING,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL\n');
    
    // Check if baseline_analysis table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'intelligence' 
        AND table_name = 'baseline_analysis'
      );
    `);
    
    console.log('Table exists:', tableCheck.rows[0].exists);
    
    if (tableCheck.rows[0].exists) {
      // Get column information
      const columns = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'intelligence' 
        AND table_name = 'baseline_analysis'
        ORDER BY ordinal_position;
      `);
      
      console.log('\nColumns in intelligence.baseline_analysis:');
      columns.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkSchema();
