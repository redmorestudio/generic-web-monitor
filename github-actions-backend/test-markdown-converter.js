#!/usr/bin/env node

/**
 * Test Markdown Converter
 * Verify that the markdown converter actually processes data
 */

const MarkdownConverterThreeDB = require('./markdown-converter-three-db');
const Database = require('better-sqlite3');
const path = require('path');

console.log('🧪 Testing Markdown Converter Three-DB\n');

async function test() {
  const converter = new MarkdownConverterThreeDB();
  
  try {
    console.log('1️⃣ Initializing converter...');
    converter.initialize();
    console.log('   ✅ Initialized successfully\n');
    
    // Check raw HTML availability
    console.log('2️⃣ Checking raw HTML data...');
    const rawDb = converter.rawDb;
    const rawCount = rawDb.prepare('SELECT COUNT(*) as count FROM raw_html WHERE html_content IS NOT NULL').get();
    console.log(`   Found ${rawCount.count} raw HTML records\n`);
    
    if (rawCount.count === 0) {
      console.log('   ❌ No raw HTML to process!');
      console.log('   Run the scraper first: node scraper-three-db.js\n');
      return;
    }
    
    // Check existing markdown
    console.log('3️⃣ Checking existing markdown conversions...');
    const processedDb = converter.processedDb;
    const mdCountBefore = processedDb.prepare('SELECT COUNT(*) as count FROM markdown_content').get();
    console.log(`   Currently have ${mdCountBefore.count} markdown records\n`);
    
    // Get a sample raw HTML record
    console.log('4️⃣ Processing a sample record...');
    const sampleRaw = rawDb.prepare(`
      SELECT * FROM raw_html 
      WHERE html_content IS NOT NULL 
      ORDER BY scraped_at DESC 
      LIMIT 1
    `).get();
    
    console.log(`   Processing: ${sampleRaw.company_name} - ${sampleRaw.url}`);
    console.log(`   HTML length: ${sampleRaw.html_content.length} chars`);
    
    // Test the conversion
    const result = await converter.processRawHtml(sampleRaw.id);
    
    if (result) {
      console.log(`   ✅ Conversion successful!`);
      console.log(`   Markdown length: ${result.markdownLength} chars`);
      console.log(`   Hash: ${result.markdownHash}\n`);
      
      // Verify it's in the database
      const verify = processedDb.prepare(`
        SELECT * FROM markdown_content 
        WHERE raw_html_id = ?
      `).get(sampleRaw.id);
      
      if (verify) {
        console.log('5️⃣ Verification:');
        console.log(`   ✅ Markdown saved to database`);
        console.log(`   ID: ${verify.id}`);
        console.log(`   Processed at: ${verify.processed_at}`);
        console.log(`   First 200 chars of markdown:`);
        console.log(`   ${verify.markdown_text.substring(0, 200)}...\n`);
      } else {
        console.log('   ❌ Markdown NOT found in database!\n');
      }
    } else {
      console.log('   ❌ Conversion failed!\n');
    }
    
    // Try processing latest for each URL
    console.log('6️⃣ Testing processLatestForEachUrl...');
    const count = await converter.processLatestForEachUrl();
    console.log(`   ✅ Processed ${count} URLs\n`);
    
    // Final count
    const mdCountAfter = processedDb.prepare('SELECT COUNT(*) as count FROM markdown_content').get();
    console.log('7️⃣ Final Results:');
    console.log(`   Started with: ${mdCountBefore.count} markdown records`);
    console.log(`   Ended with: ${mdCountAfter.count} markdown records`);
    console.log(`   New conversions: ${mdCountAfter.count - mdCountBefore.count}\n`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error(error.stack);
  } finally {
    converter.close();
  }
}

// Run the test
test().then(() => {
  console.log('✨ Test complete!\n');
}).catch(error => {
  console.error('💥 Test crashed:', error);
  process.exit(1);
});
