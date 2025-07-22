#!/usr/bin/env node

/**
 * Simple PostgreSQL company cleanup - direct SQL approach
 */

// SSL Certificate fix for PostgreSQL
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

require('dotenv').config();
const { Client } = require('pg');

const POSTGRES_CONNECTION_STRING = process.env.POSTGRES_CONNECTION_STRING;

if (!POSTGRES_CONNECTION_STRING) {
  console.error('❌ ERROR: POSTGRES_CONNECTION_STRING environment variable not set');
  process.exit(1);
}

async function cleanupCompanies() {
  const client = new Client({
    connectionString: POSTGRES_CONNECTION_STRING,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL');
    
    // List of companies to KEEP
    const companiesToKeep = [
      'OpenAI',
      'Anthropic', 
      'Google DeepMind',
      'Perplexity AI',
      'GitHub Copilot',
      'Midjourney'
    ];
    
    console.log('\n📋 Companies to keep:', companiesToKeep.join(', '));
    
    // Create a SQL list for the IN clause
    const keepList = companiesToKeep.map(name => `'${name}'`).join(', ');
    
    // Get current count
    const beforeCount = await client.query('SELECT COUNT(*) as count FROM intelligence.companies');
    console.log(`\n📊 Current companies in PostgreSQL: ${beforeCount.rows[0].count}`);
    
    // Delete all related data for companies NOT in the keep list
    console.log('\n🗑️  Cleaning up data...');
    
    // First, delete from all dependent tables
    const cleanupQueries = [
      `DELETE FROM raw_content.scraped_pages WHERE company NOT IN (${keepList})`,
      `DELETE FROM raw_content.company_pages_baseline WHERE company NOT IN (${keepList})`,
      `DELETE FROM processed_content.change_detection WHERE company NOT IN (${keepList})`,
      `DELETE FROM intelligence.baseline_analysis WHERE company NOT IN (${keepList})`,
      `DELETE FROM intelligence.company_urls WHERE company_id IN (SELECT id FROM intelligence.companies WHERE name NOT IN (${keepList}))`,
      `DELETE FROM intelligence.urls WHERE company_id IN (SELECT id FROM intelligence.companies WHERE name NOT IN (${keepList}))`,
      `DELETE FROM intelligence.enhanced_analysis WHERE company_id IN (SELECT id FROM intelligence.companies WHERE name NOT IN (${keepList}))`,
      `DELETE FROM intelligence.thebrain_sync WHERE company_id IN (SELECT id FROM intelligence.companies WHERE name NOT IN (${keepList}))`,
      `DELETE FROM intelligence.company_groups WHERE company_id IN (SELECT id FROM intelligence.companies WHERE name NOT IN (${keepList}))`,
      // Finally delete the companies themselves
      `DELETE FROM intelligence.companies WHERE name NOT IN (${keepList})`
    ];
    
    for (const query of cleanupQueries) {
      try {
        const result = await client.query(query);
        if (result.rowCount > 0) {
          console.log(`   ✓ Deleted ${result.rowCount} rows from ${query.match(/FROM (\S+)/)[1]}`);
        }
      } catch (e) {
        console.log(`   ⚠️  Skipped: ${e.message}`);
      }
    }
    
    // Show final count
    const afterCount = await client.query('SELECT COUNT(*) as count FROM intelligence.companies');
    console.log(`\n📊 Final company count: ${afterCount.rows[0].count}`);
    
    // List remaining companies
    const remainingResult = await client.query(`
      SELECT name, category 
      FROM intelligence.companies 
      ORDER BY name
    `);
    
    console.log('\n📋 Remaining companies:');
    remainingResult.rows.forEach(company => {
      console.log(`   ✅ ${company.name} (${company.category})`);
    });
    
    console.log('\n✨ Cleanup complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run it
cleanupCompanies();
