#!/usr/bin/env node

/**
 * Test PostgreSQL Connection
 */

const { Client } = require('pg');

const POSTGRES_CONNECTION_STRING = process.env.POSTGRES_CONNECTION_STRING;

if (!POSTGRES_CONNECTION_STRING) {
  console.error('❌ ERROR: POSTGRES_CONNECTION_STRING environment variable not set');
  process.exit(1);
}

async function testConnection() {
  console.log('🔌 Testing PostgreSQL connection...\n');
  
  const pg = new Client({
    connectionString: POSTGRES_CONNECTION_STRING,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await pg.connect();
    console.log('✅ Connected to PostgreSQL successfully!');
    
    // Test query
    const result = await pg.query('SELECT version()');
    console.log('PostgreSQL version:', result.rows[0].version);
    
    // Check if intelligence schema exists
    const schemaCheck = await pg.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name = 'intelligence'
    `);
    
    if (schemaCheck.rows.length > 0) {
      console.log('✅ Intelligence schema already exists');
      
      // Check for companies table
      const tableCheck = await pg.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'intelligence' 
        AND table_name = 'companies'
      `);
      
      if (tableCheck.rows.length > 0) {
        console.log('✅ Companies table already exists');
        
        // Count companies
        const countResult = await pg.query('SELECT COUNT(*) FROM intelligence.companies');
        console.log(`   Current companies count: ${countResult.rows[0].count}`);
      } else {
        console.log('ℹ️  Companies table does not exist yet');
      }
    } else {
      console.log('ℹ️  Intelligence schema does not exist yet');
    }
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    if (error.code) {
      console.error('   Error code:', error.code);
    }
    process.exit(1);
  } finally {
    await pg.end();
  }
}

testConnection();
