const Database = require('better-sqlite3');
const path = require('path');

// Database connections
const rawDb = new Database(path.join(__dirname, 'data/raw_content.db'));
const processedDb = new Database(path.join(__dirname, 'data/processed_content.db'));
const intelligenceDb = new Database(path.join(__dirname, 'data/intelligence.db'));

console.log('🔄 Starting historical change migration...');

// Find all URLs that have multiple raw_html entries (indicating changes)
const changedUrls = rawDb.prepare(`
    SELECT url_id, company_name, url, COUNT(*) as snapshot_count
    FROM raw_html
    GROUP BY url_id
    HAVING COUNT(*) > 1
    ORDER BY snapshot_count DESC
`).all();

console.log(`📊 Found ${changedUrls.length} URLs with changes`);

let changeCount = 0;

for (const urlInfo of changedUrls) {
    // Get all snapshots for this URL
    const snapshots = rawDb.prepare(`
        SELECT id, content_hash, scraped_at
        FROM raw_html
        WHERE url_id = ?
        ORDER BY scraped_at DESC
        LIMIT 10
    `).all(urlInfo.url_id);
    
    // Compare consecutive snapshots
    for (let i = 0; i < snapshots.length - 1; i++) {
        const newer = snapshots[i];
        const older = snapshots[i + 1];
        
        if (newer.content_hash !== older.content_hash) {
            // Get markdown content IDs if they exist
            const newerMd = processedDb.prepare(`
                SELECT id FROM markdown_content 
                WHERE raw_html_id = ?
            `).get(newer.id);
            
            const olderMd = processedDb.prepare(`
                SELECT id FROM markdown_content 
                WHERE raw_html_id = ?
            `).get(older.id);
            
            // Check if change already recorded
            const existing = processedDb.prepare(`
                SELECT id FROM change_detection
                WHERE url_id = ? 
                AND detected_at = ?
            `).get(urlInfo.url_id, newer.scraped_at);
            
            if (!existing) {
                // Insert change detection record
                processedDb.prepare(`
                    INSERT INTO change_detection (
                        url_id,
                        detected_at,
                        change_type,
                        summary,
                        old_content_id,
                        new_content_id,
                        relevance_score
                    ) VALUES (?, ?, 'content_update', ?, ?, ?, 5)
                `).run(
                    urlInfo.url_id,
                    newer.scraped_at,
                    `Content changed for ${urlInfo.company_name} - ${urlInfo.url}`,
                    olderMd?.id || null,
                    newerMd?.id || null
                );
                
                changeCount++;
                console.log(`✅ Added change for ${urlInfo.company_name} at ${newer.scraped_at}`);
            }
        }
    }
}

console.log(`\n✅ Migration complete! Added ${changeCount} historical changes`);

// Show summary of changes by company
if (changeCount > 0) {
    const summary = processedDb.prepare(`
        SELECT 
            COUNT(DISTINCT url_id) as url_count,
            COUNT(id) as change_count
        FROM change_detection
    `).get();
    
    console.log(`\n📊 Summary: ${summary.change_count} changes across ${summary.url_count} URLs`);
}

// Close databases
rawDb.close();
processedDb.close();
intelligenceDb.close();
