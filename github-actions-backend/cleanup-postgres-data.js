#!/usr/bin/env node

// SSL Certificate fix
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { query, end } = require('./postgres-db');
const chalk = require('chalk');

async function cleanupOldData() {
  console.log(chalk.blue.bold('\n🧹 PostgreSQL Data Cleanup\n'));
  
  try {
    // Start transaction
    await query('BEGIN');
    
    // Get valid companies
    const validCompanies = await query('SELECT name FROM intelligence.companies');
    const companyNames = validCompanies.map(c => `'${c.name}'`).join(', ');
    
    console.log(chalk.yellow(`✅ Valid companies (${validCompanies.length}): ${validCompanies.map(c => c.name).join(', ')}`));
    
    // Clean up markdown_pages
    console.log(chalk.yellow('\n📄 Cleaning markdown_pages...'));
    const markdownResult = await query(`
      DELETE FROM processed_content.markdown_pages
      WHERE company NOT IN (${companyNames})
    `);
    console.log(chalk.green(`   Removed ${markdownResult.rowCount || 0} orphaned markdown pages`));
    
    // Clean up scraped_pages
    console.log(chalk.yellow('\n📦 Cleaning scraped_pages...'));
    const scrapedResult = await query(`
      DELETE FROM raw_content.scraped_pages
      WHERE company NOT IN (${companyNames})
      AND scraped_at < NOW() - INTERVAL '7 days'
    `);
    console.log(chalk.green(`   Removed ${scrapedResult.rowCount || 0} old scraped pages`));
    
    // Clean up company_pages_baseline
    console.log(chalk.yellow('\n🗄️  Cleaning company_pages_baseline...'));
    const baselineResult = await query(`
      DELETE FROM raw_content.company_pages_baseline
      WHERE company NOT IN (${companyNames})
    `);
    console.log(chalk.green(`   Removed ${baselineResult.rowCount || 0} orphaned baseline pages`));
    
    // Clean up change_detection
    console.log(chalk.yellow('\n🔄 Cleaning change_detection...'));
    const changeResult = await query(`
      DELETE FROM processed_content.change_detection
      WHERE company NOT IN (${companyNames})
    `);
    console.log(chalk.green(`   Removed ${changeResult.rowCount || 0} orphaned change records`));
    
    // Clean up baseline_analysis
    console.log(chalk.yellow('\n🧠 Cleaning baseline_analysis...'));
    const analysisResult = await query(`
      DELETE FROM intelligence.baseline_analysis
      WHERE company NOT IN (${companyNames})
    `);
    console.log(chalk.green(`   Removed ${analysisResult.rowCount || 0} orphaned baseline analyses`));
    
    // Commit transaction
    await query('COMMIT');
    
    console.log(chalk.green.bold('\n✅ Cleanup complete!\n'));
    
    // Show current stats
    console.log(chalk.blue('📊 Current Database Stats:'));
    
    const stats = await query(`
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
    `);
    
    stats.forEach(stat => {
      console.log(`   ${stat.table_name}: ${stat.companies} companies, ${stat.records} records`);
    });
    
  } catch (error) {
    await query('ROLLBACK');
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
