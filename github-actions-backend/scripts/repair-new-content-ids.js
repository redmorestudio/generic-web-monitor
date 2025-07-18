#!/usr/bin/env node

const Database = require('better-sqlite3');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const processedDb = new Database(path.join(dataDir, 'processed_content.db'));
const rawDb = new Database(path.join(dataDir, 'raw_content.db'));

// Attach raw database to processed database for cross-db queries
processedDb.exec(`ATTACH DATABASE '${path.join(dataDir, 'raw_content.db')}' AS raw`);

console.log('🔧 Repairing missing new_content_id values...');

// First, check how many need repair
const countStmt = processedDb.prepare(`
  SELECT COUNT(*) as count 
  FROM change_detection 
  WHERE new_content_id IS NULL
`);
const result = countStmt.get();
console.log(`📊 Found ${result.count} changes with missing new_content_id`);

if (result.count === 0) {
  console.log('✅ No repairs needed!');
  process.exit(0);
}

// Get all changes that need repair
const needsRepairStmt = processedDb.prepare(`
  SELECT 
    cd.id,
    cd.url_id,
    cd.detected_at,
    cd.old_content_id
  FROM change_detection cd
  WHERE cd.new_content_id IS NULL
  ORDER BY cd.detected_at DESC
`);

const changesNeedingRepair = needsRepairStmt.all();
console.log(`\n🔍 Attempting to repair ${changesNeedingRepair.length} records...`);

let repaired = 0;
let failed = 0;

// Prepare update statement
const updateStmt = processedDb.prepare(`
  UPDATE change_detection 
  SET new_content_id = ? 
  WHERE id = ?
`);

// Prepare query to find matching content
const findContentStmt = processedDb.prepare(`
  SELECT id 
  FROM raw.raw_html 
  WHERE url_id = ? 
    AND scraped_at >= ?
    AND scraped_at <= datetime(?, '+5 minutes')
  ORDER BY scraped_at ASC 
  LIMIT 1
`);

// Process each change
for (const change of changesNeedingRepair) {
  console.log(`\n📝 Processing change ID ${change.id} (URL ${change.url_id}, detected at ${change.detected_at})`);
  
  // Find raw content that was scraped around the same time as the change was detected
  const newContent = findContentStmt.get(
    change.url_id,
    change.detected_at,
    change.detected_at
  );
  
  if (newContent) {
    console.log(`  ✅ Found matching content ID ${newContent.id}`);
    updateStmt.run(newContent.id, change.id);
    repaired++;
  } else {
    console.log(`  ❌ No matching content found`);
    
    // Try a wider time window
    const widerSearchStmt = processedDb.prepare(`
      SELECT id, scraped_at 
      FROM raw.raw_html 
      WHERE url_id = ? 
        AND scraped_at >= datetime(?, '-1 hour')
        AND scraped_at <= datetime(?, '+1 hour')
      ORDER BY ABS(julianday(scraped_at) - julianday(?)) ASC
      LIMIT 1
    `);
    
    const widerResult = widerSearchStmt.get(
      change.url_id,
      change.detected_at,
      change.detected_at,
      change.detected_at
    );
    
    if (widerResult) {
      console.log(`  🔄 Found content with wider search: ID ${widerResult.id} (scraped at ${widerResult.scraped_at})`);
      updateStmt.run(widerResult.id, change.id);
      repaired++;
    } else {
      console.log(`  ❌ Still no content found even with wider search`);
      failed++;
    }
  }
}

console.log(`\n📊 Repair Summary:`);
console.log(`  ✅ Repaired: ${repaired}`);
console.log(`  ❌ Failed: ${failed}`);
console.log(`  📈 Success rate: ${((repaired / changesNeedingRepair.length) * 100).toFixed(1)}%`);

// Verify the repairs
const verifyStmt = processedDb.prepare(`
  SELECT COUNT(*) as count 
  FROM change_detection 
  WHERE new_content_id IS NULL
`);
const remaining = verifyStmt.get();
console.log(`\n🔍 Remaining NULL new_content_ids: ${remaining.count}`);

// Close databases
rawDb.close();
processedDb.close();

console.log('\n✅ Repair process complete!');
