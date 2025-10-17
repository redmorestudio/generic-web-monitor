#!/usr/bin/env node

// SSL Certificate fix
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { db, end } = require('./postgres-db');

async function checkDataMismatch() {
  console.log('🔍 Checking for data mismatch between tables...\n');
  
  try {
    // Check companies count
    const companies = await db.get('SELECT COUNT(*) as count FROM intelligence.companies');
    console.log(`✅ Companies in intelligence.companies: ${companies.count}`);
    
    // Get company names
    const companyList = await db.all('SELECT name FROM intelligence.companies ORDER BY name');
    console.log('Company names:', companyList.map(c => c.name).join(', '));
    
    // Check markdown_pages
    const markdownStats = await db.get(`
      SELECT 
        COUNT(DISTINCT company) as unique_companies,
        COUNT(*) as total_pages
      FROM processed_content.markdown_pages
    `);
    console.log(`\n📄 Markdown pages stats:`);
    console.log(`   Unique companies: ${markdownStats.unique_companies}`);
    console.log(`   Total pages: ${markdownStats.total_pages}`);
    
    // Show sample of companies in markdown_pages
    const sampleCompanies = await db.all(`
      SELECT DISTINCT company 
      FROM processed_content.markdown_pages 
      ORDER BY company 
      LIMIT 10
    `);
    console.log('\n📋 Sample companies in markdown_pages:');
    sampleCompanies.forEach(c => console.log(`   - ${c.company}`));
    
    // Check which companies exist in both
    const validCompanies = await db.all(`
      SELECT DISTINCT mp.company 
      FROM processed_content.markdown_pages mp
      WHERE EXISTS (
        SELECT 1 FROM intelligence.companies c 
        WHERE c.name = mp.company
      )
    `);
    console.log(`\n✅ Companies that exist in BOTH tables: ${validCompanies.length}`);
    if (validCompanies.length > 0) {
      console.log('Valid companies:', validCompanies.map(c => c.company).join(', '));
    }
    
    // Check scraped_pages
    const scrapedStats = await db.get(`
      SELECT 
        COUNT(DISTINCT company) as unique_companies,
        COUNT(*) as total_pages
      FROM raw_content.scraped_pages
      WHERE scraped_at > NOW() - INTERVAL '7 days'
    `);
    console.log(`\n📦 Recent scraped pages (last 7 days):`);
    console.log(`   Unique companies: ${scrapedStats.unique_companies}`);
    console.log(`   Total pages: ${scrapedStats.total_pages}`);
    
    // The problem
    console.log('\n⚠️  THE PROBLEM:');
    console.log(`   - Baseline analyzer is trying to analyze ${markdownStats.total_pages} pages from ${markdownStats.unique_companies} companies`);
    console.log(`   - But only ${companies.count} companies exist in intelligence.companies`);
    console.log(`   - This causes "Company not found" errors for most pages`);
    
    // Solution
    console.log('\n💡 SOLUTION:');
    console.log('   The baseline analyzer should either:');
    console.log('   1. Only analyze pages for companies that exist in intelligence.companies');
    console.log('   2. OR clean up old data from processed_content.markdown_pages');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await end();
  }
}

checkDataMismatch();
