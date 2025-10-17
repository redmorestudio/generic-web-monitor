#!/usr/bin/env node

/**
 * PostgreSQL Company Cleanup - No Transactions
 * Deletes companies one by one without transactions
 */

// SSL Certificate fix
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { Client } = require('pg');

async function cleanupCompanies() {
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
    
    // Companies to keep
    const keepList = [
      'OpenAI',
      'Anthropic', 
      'Google DeepMind',
      'Perplexity AI',
      'GitHub Copilot',
      'Midjourney'
    ];
    
    console.log('\n📋 Companies to keep:', keepList.join(', '));
    
    // Get all companies
    const allCompanies = await client.query(`
      SELECT id, name 
      FROM intelligence.companies 
      ORDER BY name
    `);
    
    console.log(`\n📊 Current companies: ${allCompanies.rows.length}`);
    
    let deletedCount = 0;
    let errors = 0;
    
    // Process each company individually (no transaction)
    for (const company of allCompanies.rows) {
      if (!keepList.includes(company.name)) {
        console.log(`\n🗑️  Deleting ${company.name} (ID: ${company.id})...`);
        
        try {
          // Delete URLs first
          const urlResult = await client.query(
            'DELETE FROM intelligence.company_urls WHERE company_id = $1',
            [company.id]
          );
          console.log(`   - Deleted ${urlResult.rowCount} URLs`);
          
          // Try to delete from url_metadata (might not exist)
          try {
            const metaResult = await client.query(
              'DELETE FROM intelligence.url_metadata WHERE company_id = $1',
              [company.id]
            );
            console.log(`   - Deleted ${metaResult.rowCount} metadata entries`);
          } catch (e) {
            // Ignore if table doesn't exist
          }
          
          // Delete the company
          const companyResult = await client.query(
            'DELETE FROM intelligence.companies WHERE id = $1',
            [company.id]
          );
          console.log(`   - Deleted company: ${companyResult.rowCount}`);
          
          deletedCount++;
        } catch (error) {
          console.error(`   ❌ Error deleting ${company.name}:`, error.message);
          errors++;
        }
      } else {
        console.log(`✅ Keeping ${company.name}`);
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   - Deleted: ${deletedCount} companies`);
    console.log(`   - Errors: ${errors}`);
    
    // Show final state
    const remaining = await client.query(`
      SELECT name, category 
      FROM intelligence.companies 
      ORDER BY name
    `);
    
    console.log(`\n✅ Final companies (${remaining.rows.length}):`);
    remaining.rows.forEach(r => console.log(`   - ${r.name} (${r.category})`));
    
    if (remaining.rows.length === 6) {
      console.log('\n🎉 Success! Reduced to exactly 6 companies.');
    } else {
      console.log(`\n⚠️  Warning: Expected 6 companies but have ${remaining.rows.length}`);
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Disconnected from PostgreSQL');
  }
}

cleanupCompanies();