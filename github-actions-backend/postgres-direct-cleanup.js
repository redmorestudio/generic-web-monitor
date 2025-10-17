#!/usr/bin/env node

/**
 * PostgreSQL Direct SQL Cleanup
 * Uses raw SQL to reduce companies to 6
 */

// SSL Certificate fix
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { Client } = require('pg');

async function runCleanup() {
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
    
    // Simple SQL to keep only 6 companies
    const keepCompanies = [
      'OpenAI',
      'Anthropic', 
      'Google DeepMind',
      'Perplexity AI',
      'GitHub Copilot',
      'Midjourney'
    ];
    
    const placeholders = keepCompanies.map((_, i) => `$${i + 1}`).join(', ');
    
    console.log('\n🗑️  Deleting companies not in keep list...');
    
    // Delete in correct order to avoid foreign key issues
    const deleteUrlsResult = await client.query(`
      DELETE FROM intelligence.company_urls 
      WHERE company_id IN (
        SELECT id FROM intelligence.companies 
        WHERE name NOT IN (${placeholders})
      )
    `, keepCompanies);
    
    console.log(`   Deleted ${deleteUrlsResult.rowCount} URLs`);
    
    const deleteCompaniesResult = await client.query(`
      DELETE FROM intelligence.companies 
      WHERE name NOT IN (${placeholders})
    `, keepCompanies);
    
    console.log(`   Deleted ${deleteCompaniesResult.rowCount} companies`);
    
    // Show what's left
    const remaining = await client.query('SELECT name FROM intelligence.companies ORDER BY name');
    console.log(`\n✅ Remaining companies (${remaining.rows.length}):`);
    remaining.rows.forEach(r => console.log(`   - ${r.name}`));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runCleanup();