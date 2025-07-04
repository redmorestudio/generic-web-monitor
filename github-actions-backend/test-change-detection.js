#!/usr/bin/env node

const Database = require('better-sqlite3');
const path = require('path');

// Open databases
const processedDb = new Database(path.join(__dirname, 'data', 'processed_content.db'));
const intelligenceDb = new Database(path.join(__dirname, 'data', 'intelligence.db'));

console.log('🔍 Testing change detection...\n');

// Check if change_detection table exists
const tableCheck = processedDb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='change_detection'").get();
console.log('✅ change_detection table exists:', !!tableCheck);

// Get count of changes
const changeCount = processedDb.prepare('SELECT COUNT(*) as count FROM change_detection').get();
console.log(`📊 Total changes in database: ${changeCount.count}`);

// Get recent changes
if (changeCount.count > 0) {
    console.log('\n📋 Recent changes:');
    
    // Attach intelligence database for the query
    processedDb.exec(`ATTACH DATABASE '${path.join(__dirname, 'data', 'intelligence.db')}' AS intelligence`);
    
    const recentChanges = processedDb.prepare(`
        SELECT 
            cd.id,
            cd.detected_at,
            cd.change_type,
            cd.summary,
            cd.relevance_score,
            intelligence.urls.url,
            intelligence.companies.name as company
        FROM change_detection cd
        JOIN intelligence.urls ON cd.url_id = intelligence.urls.id
        JOIN intelligence.companies ON intelligence.urls.company_id = intelligence.companies.id
        ORDER BY cd.detected_at DESC
        LIMIT 5
    `).all();
    
    recentChanges.forEach(change => {
        console.log(`\n  ID: ${change.id}`);
        console.log(`  Company: ${change.company}`);
        console.log(`  URL: ${change.url}`);
        console.log(`  Type: ${change.change_type}`);
        console.log(`  Summary: ${change.summary}`);
        console.log(`  Score: ${change.relevance_score}`);
        console.log(`  Detected: ${change.detected_at}`);
    });
    
    processedDb.exec('DETACH DATABASE intelligence');
} else {
    console.log('\n⚠️  No changes detected yet.');
    console.log('Run the scraper first to detect changes.');
}

// Close databases
processedDb.close();
intelligenceDb.close();
