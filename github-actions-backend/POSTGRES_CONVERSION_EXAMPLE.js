#!/usr/bin/env node

/**
 * EXAMPLE: Converting scraper-three-db.js to use Postgres
 * 
 * This shows the key changes needed to convert from SQLite to Postgres
 * The same pattern applies to all other scripts
 */

// BEFORE (SQLite):
// const Database = require('better-sqlite3');
// const rawDb = new Database(path.join(__dirname, 'data', 'raw_content.db'));
// const intelligenceDb = new Database(path.join(__dirname, 'data', 'intelligence.db'));

// AFTER (Postgres):
const { db, utils, end } = require('./postgres-db');

// Example function conversions:

// BEFORE (SQLite):
/*
function getUrlsToScrape() {
  const stmt = intelligenceDb.prepare(`
    SELECT u.*, c.name as company_name 
    FROM urls u
    JOIN companies c ON u.company_id = c.id
    WHERE u.last_scraped IS NULL 
    OR datetime(u.last_scraped) < datetime('now', '-' || u.scrape_frequency || ' seconds')
    ORDER BY u.last_scraped ASC
  `);
  return stmt.all();
}
*/

// AFTER (Postgres):
async function getUrlsToScrape() {
  return await db.all(`
    SELECT u.*, c.name as company_name 
    FROM intelligence.urls u
    JOIN intelligence.companies c ON u.company_id = c.id
    WHERE u.last_scraped IS NULL 
    OR u.last_scraped < NOW() - (u.scrape_frequency || ' seconds')::INTERVAL
    ORDER BY u.last_scraped ASC
  `);
}

// BEFORE (SQLite):
/*
function saveRawContent(urlId, content, headers, httpStatus) {
  const stmt = rawDb.prepare(`
    INSERT INTO raw_html (url_id, content, headers, scraped_at, content_hash, http_status)
    VALUES (?, ?, ?, datetime('now'), ?, ?)
  `);
  
  const contentHash = crypto.createHash('md5').update(content).digest('hex');
  const result = stmt.run(urlId, content, JSON.stringify(headers), contentHash, httpStatus);
  return result.lastInsertRowid;
}
*/

// AFTER (Postgres):
async function saveRawContent(urlId, content, headers, httpStatus) {
  const contentHash = crypto.createHash('md5').update(content).digest('hex');
  
  const result = await db.get(`
    INSERT INTO raw_content.raw_html (url_id, content, headers, scraped_at, content_hash, http_status)
    VALUES ($1, $2, $3, NOW(), $4, $5)
    RETURNING id
  `, [urlId, content, JSON.stringify(headers), contentHash, httpStatus]);
  
  return result.id;
}

// BEFORE (SQLite with transaction):
/*
function updateUrlLastScraped(urlId) {
  const updateStmt = intelligenceDb.prepare(`
    UPDATE urls SET last_scraped = datetime('now') WHERE id = ?
  `);
  
  const insertStatusStmt = intelligenceDb.prepare(`
    INSERT INTO scrape_status (url_id, status, scraped_at)
    VALUES (?, 'success', datetime('now'))
  `);
  
  const transaction = intelligenceDb.transaction(() => {
    updateStmt.run(urlId);
    insertStatusStmt.run(urlId);
  });
  
  transaction();
}
*/

// AFTER (Postgres with transaction):
async function updateUrlLastScraped(urlId) {
  await transaction(async (client) => {
    await client.query(
      'UPDATE intelligence.urls SET last_scraped = NOW() WHERE id = $1',
      [urlId]
    );
    
    await client.query(
      'INSERT INTO intelligence.scrape_status (url_id, status, scraped_at) VALUES ($1, $2, NOW())',
      [urlId, 'success']
    );
  });
}

// Key differences to remember:
// 1. All functions become async
// 2. Use schema prefixes (intelligence., raw_content., processed_content.)
// 3. Use $1, $2 placeholders instead of ?
// 4. Use NOW() instead of datetime('now')
// 5. Use INTERVAL for date math
// 6. Use RETURNING clause to get inserted IDs
// 7. Transactions use the transaction() helper

// Example main function structure:
async function main() {
  try {
    // Your scraping logic here
    const urls = await getUrlsToScrape();
    
    for (const url of urls) {
      console.log(`Scraping ${url.url}...`);
      // ... scraping logic ...
      
      const contentId = await saveRawContent(url.id, content, headers, 200);
      await updateUrlLastScraped(url.id);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // IMPORTANT: Always close the connection pool when done
    await end();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}
