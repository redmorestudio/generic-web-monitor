#!/usr/bin/env node

const Database = require('better-sqlite3');
const path = require('path');

console.log('🔧 Fixing content ID mismatches in change_detection table...\n');

// Database paths
const dataDir = path.join(__dirname, 'data');
const processedDb = new Database(path.join(dataDir, 'processed_content.db'));
const rawDb = new Database(path.join(dataDir, 'raw_content.db'));
const intelligenceDb = new Database(path.join(dataDir, 'intelligence.db'));

// Attach databases for cross-database queries
processedDb.exec(`ATTACH DATABASE '${path.join(dataDir, 'raw_content.db')}' AS raw`);
processedDb.exec(`ATTACH DATABASE '${path.join(dataDir, 'intelligence.db')}' AS intel`);

// Find all changes with potential ID mismatches
const findMismatchesQuery = processedDb.prepare(`
  SELECT 
    cd.id,
    cd.url_id,
    cd.old_content_id,
    cd.new_content_id,
    cd.detected_at,
    u.url
  FROM change_detection cd
  JOIN intel.urls u ON cd.url_id = u.id
  WHERE cd.old_content_id IS NOT NULL
  ORDER BY cd.detected_at DESC
`);

const changes = findMismatchesQuery.all();
console.log(`Found ${changes.length} changes to check...\n`);

let fixedCount = 0;
let errorCount = 0;

// Prepare update statement
const updateChange = processedDb.prepare(`
  UPDATE change_detection 
  SET old_content_id = ?, new_content_id = ?
  WHERE id = ?
`);

// Process each change
for (const change of changes) {
  // Check if old_content_id points to correct URL
  let needsFix = false;
  let correctOldId = change.old_content_id;
  let correctNewId = change.new_content_id;
  
  // Check old content
  if (change.old_content_id) {
    const oldContentCheck = rawDb.prepare(`
      SELECT url, url_id FROM raw_html WHERE id = ?
    `).get(change.old_content_id);
    
    if (oldContentCheck && oldContentCheck.url !== change.url) {
      console.log(`❌ Change ${change.id}: old_content_id mismatch!`);
      console.log(`   Expected: ${change.url} (url_id: ${change.url_id})`);
      console.log(`   Got: ${oldContentCheck.url} (url_id: ${oldContentCheck.url_id})`);
      
      // Find the correct old content ID
      const correctOldContent = rawDb.prepare(`
        SELECT id FROM raw_html 
        WHERE url_id = ? AND scraped_at < ?
        ORDER BY scraped_at DESC
        LIMIT 1
      `).get(change.url_id, change.detected_at);
      
      if (correctOldContent) {
        correctOldId = correctOldContent.id;
        needsFix = true;
        console.log(`   ✅ Found correct old_content_id: ${correctOldId}`);
      } else {
        correctOldId = null;
        needsFix = true;
        console.log(`   ⚠️  No previous content found, setting to NULL`);
      }
    }
  }
  
  // Check new content
  if (change.new_content_id) {
    const newContentCheck = rawDb.prepare(`
      SELECT url, url_id FROM raw_html WHERE id = ?
    `).get(change.new_content_id);
    
    if (newContentCheck && newContentCheck.url !== change.url) {
      console.log(`❌ Change ${change.id}: new_content_id mismatch!`);
      console.log(`   Expected: ${change.url} (url_id: ${change.url_id})`);
      console.log(`   Got: ${newContentCheck.url} (url_id: ${newContentCheck.url_id})`);
      
      // Find the correct new content ID
      const correctNewContent = rawDb.prepare(`
        SELECT id FROM raw_html 
        WHERE url_id = ? AND scraped_at >= ?
        ORDER BY scraped_at ASC
        LIMIT 1
      `).get(change.url_id, change.detected_at);
      
      if (correctNewContent) {
        correctNewId = correctNewContent.id;
        needsFix = true;
        console.log(`   ✅ Found correct new_content_id: ${correctNewId}`);
      } else {
        // This shouldn't happen, but handle it
        console.log(`   ⚠️  No new content found, keeping current value`);
      }
    }
  }
  
  // Apply fix if needed
  if (needsFix) {
    try {
      updateChange.run(correctOldId, correctNewId, change.id);
      fixedCount++;
      console.log(`   ✅ Fixed change ${change.id}\n`);
    } catch (error) {
      console.error(`   ❌ Error fixing change ${change.id}: ${error.message}\n`);
      errorCount++;
    }
  }
}

// Detach databases
processedDb.exec('DETACH DATABASE raw');
processedDb.exec('DETACH DATABASE intel');

// Close databases
processedDb.close();
rawDb.close();
intelligenceDb.close();

console.log('\n📊 Summary:');
console.log(`   Total changes checked: ${changes.length}`);
console.log(`   Changes fixed: ${fixedCount}`);
console.log(`   Errors: ${errorCount}`);

if (fixedCount > 0) {
  console.log('\n✅ Content ID mismatches have been fixed!');
  console.log('   Run generate-change-details.js to regenerate the change detail files.');
} else {
  console.log('\n✅ No mismatches found - all content IDs are correct!');
}
