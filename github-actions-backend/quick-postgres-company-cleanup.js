#!/usr/bin/env node

/**
 * Quick PostgreSQL company cleanup script
 * Reduces companies to only the 6 in companies.json
 */

// SSL Certificate fix for PostgreSQL
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

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
    
    // Start transaction
    await client.query('BEGIN');
    
    try {
      // First, get all current companies
      const currentResult = await client.query(`
        SELECT id, name 
        FROM intelligence.companies 
        ORDER BY name
      `);
      
      console.log(`\n📊 Current companies in PostgreSQL: ${currentResult.rows.length}`);
      
      // Delete companies NOT in our keep list
      let deletedCount = 0;
      for (const company of currentResult.rows) {
        if (!companiesToKeep.includes(company.name)) {
          console.log(`🗑️  Deleting ${company.name}...`);
          
          // Delete related data in correct order (foreign key constraints)
          // 1. Delete from company_urls
          await client.query(
            'DELETE FROM intelligence.company_urls WHERE company_id = $1',
            [company.id]
          );
          
          // 2. Delete from url_metadata if it exists
          try {
            await client.query(
              'DELETE FROM intelligence.url_metadata WHERE company_id = $1',
              [company.id]
            );
          } catch (e) {
            // Table might not exist, that's ok
          }
          
          // 3. Delete from companies
          await client.query(
            'DELETE FROM intelligence.companies WHERE id = $1',
            [company.id]
          );
          
          deletedCount++;
        }
      }
      
      // Commit transaction
      await client.query('COMMIT');
      console.log(`\n✅ Successfully deleted ${deletedCount} companies`);
      
      // Show final count
      const finalResult = await client.query(
        'SELECT COUNT(*) as count FROM intelligence.companies'
      );
      console.log(`\n📊 Final company count: ${finalResult.rows[0].count}`);
      
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
      
    } catch (error) {
      // Rollback on error
      await client.query('ROLLBACK');
      throw error;
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run it
cleanupCompanies();