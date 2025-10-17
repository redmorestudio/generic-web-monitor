#!/usr/bin/env node

// SSL Certificate fix
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { db, end } = require('./postgres-db');
const chalk = require('chalk');

async function cleanupOldData() {
  console.log(chalk.blue.bold('\n🧹 PostgreSQL Data Cleanup\n'));
  
  try {
    // Start transaction
    await db.run('BEGIN');
    
    // Get valid companies
    const validCompanies = await db.all('SELECT name FROM intelligence.companies');
    const companyNames = validCompanies.map(c => `'${c.name.replace(/'/g, "''")}'`).join(', ');
    
    console.log(chalk.yellow(`✅ Valid companies (${validCompanies.length}): ${validCompanies.map(c => c.name).join(', ')}`));
    
    if (validCompanies.length === 0) {
      console.log(chalk.red('❌ No valid companies found! Aborting cleanup.'));
      await db.run('ROLLBACK');
      return;
    }
    
    // Clean up markdown_pages
    console.log(chalk.yellow('\n📄 Cleaning markdown_pages...'));
    const markdownDeleted = await db.get(`
      WITH deleted AS (
        DELETE FROM processed_content.markdown_pages
        WHERE company NOT IN (${companyNames})
        RETURNING *
      )
      SELECT COUNT(*) as count FROM deleted
    `);
    console.log(chalk.green(`   Removed ${markdownDeleted.count || 0} orphaned markdown pages`));
    
    // Clean up scraped_pages
    console.log(chalk.yellow('\n📦 Cleaning scraped_pages...'));
    const scrapedDeleted = await db.get(`
      WITH deleted AS (
        DELETE FROM raw_content.scraped_pages
        WHERE company NOT IN (${companyNames})
        AND scraped_at < NOW() - INTERVAL '7 days'
        RETURNING *
      )
      SELECT COUNT(*) as count FROM deleted
    `);
    console.log(chalk.green(`   Removed ${scrapedDeleted.count || 0} old scraped pages`));
    
    // Clean up company_pages_baseline
    console.log(chalk.yellow('\n🗄️  Cleaning company_pages_baseline...'));
    const baselineDeleted = await db.get(`
      WITH deleted AS (
        DELETE FROM raw_content.company_pages_baseline
        WHERE company NOT IN (${companyNames})
        RETURNING *
      )
      SELECT COUNT(*) as count FROM deleted
    `);
    console.log(chalk.green(`   Removed ${baselineDeleted.count || 0} orphaned baseline pages`));
    
    // Clean up change_detection
    console.log(chalk.yellow('\n🔄 Cleaning change_detection...'));
    const changeDeleted = await db.get(`
      WITH deleted AS (
        DELETE FROM processed_content.change_detection
        WHERE company NOT IN (${companyNames})
        RETURNING *
      )
      SELECT COUNT(*) as count FROM deleted
    `);
    console.log(chalk.green(`   Removed ${changeDeleted.count || 0} orphaned change records`));
    
    // Clean up baseline_analysis
    console.log(chalk.yellow('\n🧠 Cleaning baseline_analysis...'));
    const analysisDeleted = await db.get(`
      WITH deleted AS (
        DELETE FROM intelligence.baseline_analysis
        WHERE company NOT IN (${companyNames})
        RETURNING *
      )
      SELECT COUNT(*) as count FROM deleted
    `);
    console.log(chalk.green(`   Removed ${analysisDeleted.count || 0} orphaned baseline analyses`));
    
    // Clean up intelligence.changes
    console.log(chalk.yellow('\n📝 Cleaning intelligence.changes...'));
    const changesDeleted = await db.get(`
      WITH deleted AS (
        DELETE FROM intelligence.changes
        WHERE company NOT IN (${companyNames})
        RETURNING *
      )
      SELECT COUNT(*) as count FROM deleted
    `);
    console.log(chalk.green(`   Removed ${changesDeleted.count || 0} orphaned change records`));
    
    // Commit transaction
    await db.run('COMMIT');
    
    console.log(chalk.green.bold('\n✅ Cleanup complete!\n'));
    
    // Show current stats
    console.log(chalk.blue('📊 Current Database Stats:'));
    
    const stats = await db.all(`
      SELECT 
        'markdown_pages' as table_name,
        COUNT(DISTINCT company) as companies,
        COUNT(*) as records
      FROM processed_content.markdown_pages
      UNION ALL
      SELECT 
        'scraped_pages',
        COUNT(DISTINCT company),
        COUNT(*)
      FROM raw_content.scraped_pages
      UNION ALL
      SELECT 
        'baseline_analysis',
        COUNT(DISTINCT company),
        COUNT(*)
      FROM intelligence.baseline_analysis
      UNION ALL
      SELECT 
        'change_detection',
        COUNT(DISTINCT company),
        COUNT(*)
      FROM processed_content.change_detection
      ORDER BY table_name
    `);
    
    console.log(chalk.cyan('\n   Table Stats:'));
    stats.forEach(stat => {
      console.log(chalk.cyan(`   ${stat.table_name}: ${stat.companies} companies, ${stat.records} records`));
    });
    
    // Show company list
    console.log(chalk.cyan('\n   Current companies in database:'));
    validCompanies.forEach(c => {
      console.log(chalk.cyan(`   - ${c.name}`));
    });
    
  } catch (error) {
    await db.run('ROLLBACK');
    console.error(chalk.red('❌ Cleanup failed:'), error);
    throw error;
  } finally {
    await end();
  }
}

// Run if called directly
if (require.main === module) {
  cleanupOldData()
    .then(() => {
      console.log(chalk.green('\n✨ Database cleaned!\n'));
      process.exit(0);
    })
    .catch((err) => {
      console.error(chalk.red('\n💥 Fatal error:'), err);
      process.exit(1);
    });
}

module.exports = { cleanupOldData };
