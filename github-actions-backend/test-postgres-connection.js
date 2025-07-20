#!/usr/bin/env node

/**
 * Test Postgres Connection
 * 
 * Quick script to verify we can connect to Heroku Postgres
 */

const { query, end } = require('./postgres-db');
const chalk = require('chalk');

async function testConnection() {
  console.log(chalk.blue.bold('\n🔌 Testing Postgres Connection...\n'));
  
  try {
    // Test basic connection
    console.log(chalk.yellow('Testing basic connection...'));
    const result = await query('SELECT NOW() as current_time, version() as version');
    console.log(chalk.green('✅ Connected successfully!'));
    console.log(chalk.gray(`   Server time: ${result.rows[0].current_time}`));
    console.log(chalk.gray(`   PostgreSQL: ${result.rows[0].version.split(',')[0]}`));
    
    // Check if schemas exist
    console.log(chalk.yellow('\nChecking schemas...'));
    const schemas = await query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name IN ('raw_content', 'processed_content', 'intelligence')
      ORDER BY schema_name
    `);
    
    if (schemas.rows.length === 0) {
      console.log(chalk.yellow('⚠️  No schemas found. Run init-db-postgres.js first.'));
    } else {
      console.log(chalk.green(`✅ Found ${schemas.rows.length} schemas:`));
      schemas.rows.forEach(row => {
        console.log(chalk.gray(`   - ${row.schema_name}`));
      });
    }
    
    // Check table counts if schemas exist
    if (schemas.rows.length > 0) {
      console.log(chalk.yellow('\nChecking tables...'));
      const tables = await query(`
        SELECT 
          schemaname as schema,
          tablename as table,
          (SELECT COUNT(*) FROM pg_catalog.pg_stat_user_tables 
           WHERE schemaname = t.schemaname AND tablename = t.tablename) as has_stats
        FROM pg_catalog.pg_tables t
        WHERE schemaname IN ('raw_content', 'processed_content', 'intelligence')
        ORDER BY schemaname, tablename
      `);
      
      console.log(chalk.green(`✅ Found ${tables.rows.length} tables:`));
      let currentSchema = '';
      tables.rows.forEach(row => {
        if (row.schema !== currentSchema) {
          currentSchema = row.schema;
          console.log(chalk.cyan(`\n   ${row.schema}:`));
        }
        console.log(chalk.gray(`     - ${row.table}`));
      });
      
      // Quick data check
      console.log(chalk.yellow('\nChecking for data...'));
      try {
        const companiesCount = await query('SELECT COUNT(*) as count FROM intelligence.companies');
        const urlsCount = await query('SELECT COUNT(*) as count FROM intelligence.urls');
        const rawCount = await query('SELECT COUNT(*) as count FROM raw_content.raw_html');
        
        console.log(chalk.green('✅ Data summary:'));
        console.log(chalk.gray(`   - Companies: ${companiesCount.rows[0].count}`));
        console.log(chalk.gray(`   - URLs: ${urlsCount.rows[0].count}`));
        console.log(chalk.gray(`   - Raw HTML: ${rawCount.rows[0].count}`));
      } catch (e) {
        console.log(chalk.yellow('⚠️  Could not query data (tables may not exist yet)'));
      }
    }
    
    console.log(chalk.green.bold('\n✨ Connection test complete!\n'));
    
  } catch (error) {
    console.error(chalk.red('❌ Connection failed:'), error.message);
    if (error.message.includes('POSTGRES_CONNECTION_STRING')) {
      console.log(chalk.yellow('\n💡 Make sure POSTGRES_CONNECTION_STRING is set in your environment'));
      console.log(chalk.yellow('   Example: export POSTGRES_CONNECTION_STRING="postgres://..."'));
    }
    throw error;
  } finally {
    await end();
  }
}

// Run if called directly
if (require.main === module) {
  testConnection()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { testConnection };
