#!/usr/bin/env node

/**
 * Debug Pipeline State
 * Comprehensive check of the entire pipeline to find where it's breaking
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, 'data');

console.log('🔍 AI Monitor Pipeline Debug Report');
console.log('===================================\n');

// Check if databases exist
console.log('📁 Database Files:');
const dbFiles = ['raw_content.db', 'processed_content.db', 'intelligence.db', 'monitor.db'];
dbFiles.forEach(dbFile => {
  const dbPath = path.join(dataDir, dbFile);
  if (fs.existsSync(dbPath)) {
    const stats = fs.statSync(dbPath);
    console.log(`   ✅ ${dbFile} - ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  } else {
    console.log(`   ❌ ${dbFile} - NOT FOUND`);
  }
});

// Check Raw Content Database
console.log('\n📊 Raw Content Database:');
try {
  const rawDb = new Database(path.join(dataDir, 'raw_content.db'), { readonly: true });
  
  const rawStats = rawDb.prepare(`
    SELECT 
      COUNT(*) as total_records,
      COUNT(DISTINCT url_id) as unique_urls,
      COUNT(DISTINCT company_name) as unique_companies,
      COUNT(CASE WHEN html_content IS NOT NULL THEN 1 END) as with_content,
      COUNT(CASE WHEN error_message IS NOT NULL THEN 1 END) as with_errors,
      MAX(scraped_at) as latest_scrape
    FROM raw_html
  `).get();
  
  console.log(`   Total records: ${rawStats.total_records}`);
  console.log(`   Unique URLs: ${rawStats.unique_urls}`);
  console.log(`   Unique companies: ${rawStats.unique_companies}`);
  console.log(`   With HTML content: ${rawStats.with_content}`);
  console.log(`   With errors: ${rawStats.with_errors}`);
  console.log(`   Latest scrape: ${rawStats.latest_scrape}`);
  
  // Show latest 5 scrapes
  const latestScrapes = rawDb.prepare(`
    SELECT company_name, url, LENGTH(html_content) as content_length, scraped_at
    FROM raw_html
    WHERE html_content IS NOT NULL
    ORDER BY scraped_at DESC
    LIMIT 5
  `).all();
  
  if (latestScrapes.length > 0) {
    console.log('\n   Latest successful scrapes:');
    latestScrapes.forEach(s => {
      console.log(`   - ${s.company_name}: ${s.content_length} chars at ${s.scraped_at}`);
    });
  }
  
  rawDb.close();
} catch (error) {
  console.log(`   ❌ Error: ${error.message}`);
}

// Check Processed Content Database
console.log('\n📊 Processed Content Database:');
try {
  const processedDb = new Database(path.join(dataDir, 'processed_content.db'), { readonly: true });
  
  // Check if markdown_content table exists
  const tableExists = processedDb.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name='markdown_content'
  `).get();
  
  if (!tableExists) {
    console.log('   ❌ markdown_content table does NOT exist!');
  } else {
    const processedStats = processedDb.prepare(`
      SELECT 
        COUNT(*) as total_records,
        COUNT(DISTINCT url_id) as unique_urls,
        COUNT(DISTINCT company_name) as unique_companies,
        COUNT(CASE WHEN markdown_text IS NOT NULL THEN 1 END) as with_markdown,
        MAX(processed_at) as latest_process
      FROM markdown_content
    `).get();
    
    console.log(`   Total records: ${processedStats.total_records}`);
    console.log(`   Unique URLs: ${processedStats.unique_urls}`);
    console.log(`   Unique companies: ${processedStats.unique_companies}`);
    console.log(`   With markdown: ${processedStats.with_markdown}`);
    console.log(`   Latest process: ${processedStats.latest_process}`);
    
    // Show latest 5 conversions
    const latestConversions = processedDb.prepare(`
      SELECT company_name, url, LENGTH(markdown_text) as markdown_length, processed_at
      FROM markdown_content
      WHERE markdown_text IS NOT NULL
      ORDER BY processed_at DESC
      LIMIT 5
    `).all();
    
    if (latestConversions.length > 0) {
      console.log('\n   Latest conversions:');
      latestConversions.forEach(c => {
        console.log(`   - ${c.company_name}: ${c.markdown_length} chars at ${c.processed_at}`);
      });
    } else {
      console.log('\n   ⚠️  No markdown conversions found!');
    }
  }
  
  processedDb.close();
} catch (error) {
  console.log(`   ❌ Error: ${error.message}`);
}

// Check Intelligence Database
console.log('\n📊 Intelligence Database:');
try {
  const intelligenceDb = new Database(path.join(dataDir, 'intelligence.db'), { readonly: true });
  
  const companyCount = intelligenceDb.prepare('SELECT COUNT(*) as count FROM companies').get().count;
  const urlCount = intelligenceDb.prepare('SELECT COUNT(*) as count FROM urls').get().count;
  
  console.log(`   Companies: ${companyCount}`);
  console.log(`   URLs: ${urlCount}`);
  
  // Check for AI analysis
  const tables = intelligenceDb.prepare(`
    SELECT name FROM sqlite_master WHERE type='table'
  `).all().map(t => t.name);
  
  if (tables.includes('current_intelligence')) {
    const aiCount = intelligenceDb.prepare('SELECT COUNT(*) as count FROM current_intelligence').get().count;
    console.log(`   AI analyses: ${aiCount}`);
  }
  
  if (tables.includes('change_intelligence')) {
    const changeCount = intelligenceDb.prepare('SELECT COUNT(*) as count FROM change_intelligence').get().count;
    console.log(`   Change analyses: ${changeCount}`);
  }
  
  intelligenceDb.close();
} catch (error) {
  console.log(`   ❌ Error: ${error.message}`);
}

// Check API Data Files
console.log('\n📁 API Data Files:');
const apiDataDir = path.join(__dirname, '..', 'api-data');
const apiFiles = ['dashboard.json', 'extracted-data.json', 'companies.json', 'content-snapshots.json'];

apiFiles.forEach(file => {
  const filePath = path.join(apiDataDir, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const recordCount = Array.isArray(content) ? content.length : 
                       (content.data && Array.isArray(content.data) ? content.data.length : 'N/A');
    console.log(`   ✅ ${file} - ${(stats.size / 1024).toFixed(2)} KB, Records: ${recordCount}`);
  } else {
    console.log(`   ❌ ${file} - NOT FOUND`);
  }
});

// Pipeline Health Summary
console.log('\n🏥 Pipeline Health Summary:');
console.log('===========================');

let healthScore = 0;
const healthChecks = [];

// Check 1: Raw data exists
try {
  const rawDb = new Database(path.join(dataDir, 'raw_content.db'), { readonly: true });
  const rawCount = rawDb.prepare('SELECT COUNT(*) as count FROM raw_html WHERE html_content IS NOT NULL').get().count;
  rawDb.close();
  
  if (rawCount > 0) {
    healthScore += 25;
    healthChecks.push('✅ Raw HTML data exists');
  } else {
    healthChecks.push('❌ No raw HTML data found');
  }
} catch (e) {
  healthChecks.push('❌ Cannot read raw content database');
}

// Check 2: Markdown conversions exist
try {
  const processedDb = new Database(path.join(dataDir, 'processed_content.db'), { readonly: true });
  const mdCount = processedDb.prepare('SELECT COUNT(*) as count FROM markdown_content WHERE markdown_text IS NOT NULL').get().count;
  processedDb.close();
  
  if (mdCount > 0) {
    healthScore += 25;
    healthChecks.push('✅ Markdown conversions exist');
  } else {
    healthChecks.push('❌ No markdown conversions found');
  }
} catch (e) {
  healthChecks.push('❌ Cannot read processed content database');
}

// Check 3: AI analysis exists
try {
  const intelligenceDb = new Database(path.join(dataDir, 'intelligence.db'), { readonly: true });
  const tables = intelligenceDb.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(t => t.name);
  
  if (tables.includes('current_intelligence')) {
    const aiCount = intelligenceDb.prepare('SELECT COUNT(*) as count FROM current_intelligence').get().count;
    if (aiCount > 0) {
      healthScore += 25;
      healthChecks.push('✅ AI analysis data exists');
    } else {
      healthChecks.push('❌ No AI analysis found');
    }
  } else {
    healthChecks.push('❌ AI analysis table missing');
  }
  
  intelligenceDb.close();
} catch (e) {
  healthChecks.push('❌ Cannot read intelligence database');
}

// Check 4: Dashboard data exists
if (fs.existsSync(path.join(apiDataDir, 'extracted-data.json'))) {
  const data = JSON.parse(fs.readFileSync(path.join(apiDataDir, 'extracted-data.json'), 'utf8'));
  if (data && ((Array.isArray(data) && data.length > 0) || (data.data && data.data.length > 0))) {
    healthScore += 25;
    healthChecks.push('✅ Dashboard data exists');
  } else {
    healthChecks.push('❌ Dashboard data is empty');
  }
} else {
  healthChecks.push('❌ Dashboard data file missing');
}

healthChecks.forEach(check => console.log(`   ${check}`));
console.log(`\n   Overall Health Score: ${healthScore}%`);

if (healthScore < 100) {
  console.log('\n🚨 Pipeline Issues Detected!');
  console.log('   The pipeline is broken at one or more stages.');
  console.log('   Review the detailed output above to identify the failure point.');
} else {
  console.log('\n✅ Pipeline appears healthy!');
}

console.log('\n📝 Debugging Tips:');
console.log('   1. If raw HTML is missing: Check scraper workflow logs');
console.log('   2. If markdown is missing: Run process workflow and check logs');
console.log('   3. If AI analysis is missing: Run analyze workflow and check logs');
console.log('   4. If dashboard data is missing: Run sync workflow');

console.log('\n✨ Done!\n');
