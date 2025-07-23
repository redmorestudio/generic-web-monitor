#!/usr/bin/env node

/**
 * Fix content ID mismatches in PostgreSQL change_detection table
 * PostgreSQL version - July 23, 2025
 */

// Load environment variables
require('dotenv').config();

// SSL Certificate fix for Heroku PostgreSQL
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { db, end } = require('./postgres-db');

async function fixContentIdMismatch() {
  console.log('🔧 Fixing content ID mismatches in change_detection table (PostgreSQL)...\n');
  
  try {
    // Find all changes with potential ID mismatches
    const changes = await db.all(`
      SELECT 
        cd.id,
        cd.url_id,
        cd.old_content_id,
        cd.new_content_id,
        cd.detected_at,
        u.url
      FROM processed_content.change_detection cd
      JOIN intelligence.urls u ON cd.url_id = u.id
      WHERE cd.old_content_id IS NOT NULL
      ORDER BY cd.detected_at DESC
    `);
    
    console.log(`Found ${changes.length} changes to check...\n`);
    
    let fixedCount = 0;
    let errorCount = 0;
    
    // Process each change
    for (const change of changes) {
      let needsFix = false;
      let correctOldId = change.old_content_id;
      let correctNewId = change.new_content_id;
      
      // Check old content
      if (change.old_content_id) {
        const oldContentCheck = await db.get(`
          SELECT url, url_id FROM raw_content.scraped_pages WHERE id = $1
        `, [change.old_content_id]);
        
        if (oldContentCheck && oldContentCheck.url !== change.url) {
          console.log(`❌ Change ${change.id}: old_content_id mismatch!`);
          console.log(`   Expected: ${change.url} (url_id: ${change.url_id})`);
          console.log(`   Got: ${oldContentCheck.url} (url_id: ${oldContentCheck.url_id})`);
          
          // Find the correct old content ID
          const correctOldContent = await db.get(`
            SELECT id FROM raw_content.scraped_pages 
            WHERE url = $1 AND scraped_at < $2
            ORDER BY scraped_at DESC
            LIMIT 1
          `, [change.url, change.detected_at]);
          
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
        const newContentCheck = await db.get(`
          SELECT url, url_id FROM raw_content.scraped_pages WHERE id = $1
        `, [change.new_content_id]);
        
        if (newContentCheck && newContentCheck.url !== change.url) {
          console.log(`❌ Change ${change.id}: new_content_id mismatch!`);
          console.log(`   Expected: ${change.url} (url_id: ${change.url_id})`);
          console.log(`   Got: ${newContentCheck.url} (url_id: ${newContentCheck.url_id})`);
          
          // Find the correct new content ID
          const correctNewContent = await db.get(`
            SELECT id FROM raw_content.scraped_pages 
            WHERE url = $1 AND scraped_at >= $2
            ORDER BY scraped_at ASC
            LIMIT 1
          `, [change.url, change.detected_at]);
          
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
          await db.run(`
            UPDATE processed_content.change_detection 
            SET old_content_id = $1, new_content_id = $2
            WHERE id = $3
          `, [correctOldId, correctNewId, change.id]);
          
          fixedCount++;
          console.log(`   ✅ Fixed change ${change.id}\n`);
        } catch (error) {
          console.error(`   ❌ Error fixing change ${change.id}: ${error.message}\n`);
          errorCount++;
        }
      }
    }
    
    console.log('\n📊 Summary:');
    console.log(`   Total changes checked: ${changes.length}`);
    console.log(`   Changes fixed: ${fixedCount}`);
    console.log(`   Errors: ${errorCount}`);
    
    if (fixedCount > 0) {
      console.log('\n✅ Content ID mismatches have been fixed!');
      console.log('   Run generate-change-details-postgres.js to regenerate the change detail files.');
    } else {
      console.log('\n✅ No mismatches found - all content IDs are correct!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await end();
  }
}

// Run if called directly
if (require.main === module) {
  fixContentIdMismatch().catch(console.error);
}

module.exports = { fixContentIdMismatch };