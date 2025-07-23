#!/usr/bin/env node

/**
 * Fixed PostgreSQL company cleanup script
 * Handles transaction issues and reduces companies to only 6
 */

// SSL Certificate fix for PostgreSQL
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Only load dotenv in development (not in GitHub Actions)
if (!process.env.GITHUB_ACTIONS && !process.env.POSTGRES_CONNECTION_STRING) {
  try {
    require('dotenv').config();
  } catch (e) {
    // dotenv not available or no .env file - this is fine
  }
}
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
    
    // End any existing transaction first
    try {
      await client.query('ROLLBACK');
    } catch (e) {
      // Ignore rollback errors
    }
    
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
    
    // Start fresh transaction
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
          
          // Delete in order to handle foreign key constraints
          
          // 1. Delete from tables that reference company_id
          const deleteQueries = [
            // Raw content tables
            `DELETE FROM raw_content.scraped_pages WHERE company = $1`,
            `DELETE FROM raw_content.company_pages_baseline WHERE company = $1`,
            
            // Processed content tables
            `DELETE FROM processed_content.change_detection WHERE company = $1`,
            
            // Intelligence tables
            `DELETE FROM intelligence.company_urls WHERE company_id = $2`,
            `DELETE FROM intelligence.urls WHERE company_id = $2`,
            `DELETE FROM intelligence.enhanced_analysis WHERE company_id = $2`,
            `DELETE FROM intelligence.baseline_analysis WHERE company = $1`,
            `DELETE FROM intelligence.thebrain_sync WHERE company_id = $2`,
            `DELETE FROM intelligence.company_groups WHERE company_id = $2`,
          ];
          
          for (const query of deleteQueries) {
            try {
              if (query.includes('$2')) {
                await client.query(query, [company.name, company.id]);
              } else {
                await client.query(query, [company.name]);
              }
            } catch (e) {
              // Some tables might not exist, continue
              console.log(`   ⚠️  Skipped: ${e.message}`);
            }
          }
          
          // Finally delete the company
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
