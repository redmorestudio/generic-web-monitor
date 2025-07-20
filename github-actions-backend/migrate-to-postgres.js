#!/usr/bin/env node

/**
 * SQLite to Heroku Postgres Migration Script
 * 
 * This script migrates all data from the 3 SQLite databases to Heroku Postgres
 * in a single, fast operation.
 */

const Database = require('better-sqlite3');
const { Client } = require('pg');
const path = require('path');
const fs = require('fs');

// Configuration
const BATCH_SIZE = 1000; // Insert records in batches for speed
const POSTGRES_CONNECTION_STRING = process.env.POSTGRES_CONNECTION_STRING;

if (!POSTGRES_CONNECTION_STRING) {
  console.error('❌ ERROR: POSTGRES_CONNECTION_STRING environment variable not set');
  process.exit(1);
}

// Database paths
const dbPaths = {
  raw: path.join(__dirname, 'data', 'raw_content.db'),
  processed: path.join(__dirname, 'data', 'processed_content.db'),
  intelligence: path.join(__dirname, 'data', 'intelligence.db')
};

// Check if databases exist
for (const [name, dbPath] of Object.entries(dbPaths)) {
  if (!fs.existsSync(dbPath)) {
    console.error(`❌ ERROR: ${name} database not found at ${dbPath}`);
    process.exit(1);
  }
}

async function migrateToPostgres() {
  console.log('🚀 Starting SQLite to Postgres Migration...\n');
  
  // Connect to Postgres
  const pg = new Client({
    connectionString: POSTGRES_CONNECTION_STRING,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await pg.connect();
    console.log('✅ Connected to Heroku Postgres');
    
    // Create schemas
    console.log('\n📁 Creating schemas...');
    await pg.query('CREATE SCHEMA IF NOT EXISTS raw_content');
    await pg.query('CREATE SCHEMA IF NOT EXISTS processed_content');
    await pg.query('CREATE SCHEMA IF NOT EXISTS intelligence');
    console.log('✅ Schemas created');
    
    // Migrate each database
    await migrateIntelligenceDb(pg);
    await migrateRawContentDb(pg);
    await migrateProcessedContentDb(pg);
    
    console.log('\n🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    await pg.end();
  }
}

async function migrateIntelligenceDb(pg) {
  console.log('\n📊 Migrating intelligence database...');
  const db = new Database(dbPaths.intelligence, { readonly: true });
  
  try {
    // Create tables
    await pg.query(`
      CREATE TABLE IF NOT EXISTS intelligence.companies (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT,
        interest_level INTEGER DEFAULT 5,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pg.query(`
      CREATE TABLE IF NOT EXISTS intelligence.urls (
        id INTEGER PRIMARY KEY,
        company_id INTEGER NOT NULL,
        url TEXT NOT NULL,
        url_type TEXT,
        is_primary BOOLEAN DEFAULT false,
        last_scraped TIMESTAMP,
        scrape_frequency INTEGER DEFAULT 86400,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES intelligence.companies(id)
      )
    `);
    
    await pg.query(`
      CREATE TABLE IF NOT EXISTS intelligence.enhanced_analysis (
        id INTEGER PRIMARY KEY,
        company_id INTEGER NOT NULL,
        content_id INTEGER,
        analysis_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        key_changes TEXT,
        change_magnitude REAL DEFAULT 0,
        interest_score REAL DEFAULT 0,
        categories TEXT,
        summary TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES intelligence.companies(id)
      )
    `);
    
    await pg.query(`
      CREATE TABLE IF NOT EXISTS intelligence.thebrain_sync (
        id INTEGER PRIMARY KEY,
        company_id INTEGER NOT NULL,
        thought_id TEXT UNIQUE,
        last_synced TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        sync_status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES intelligence.companies(id)
      )
    `);
    
    await pg.query(`
      CREATE TABLE IF NOT EXISTS intelligence.scrape_status (
        id INTEGER PRIMARY KEY,
        url_id INTEGER NOT NULL,
        status TEXT NOT NULL,
        scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        error_message TEXT,
        http_status INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (url_id) REFERENCES intelligence.urls(id)
      )
    `);
    
    // Migrate data
    console.log('  - Migrating companies...');
    const companies = db.prepare('SELECT * FROM companies').all();
    await batchInsert(pg, 'intelligence.companies', companies);
    console.log(`    ✓ ${companies.length} companies migrated`);
    
    console.log('  - Migrating URLs...');
    const urls = db.prepare('SELECT * FROM urls').all();
    await batchInsert(pg, 'intelligence.urls', urls);
    console.log(`    ✓ ${urls.length} URLs migrated`);
    
    console.log('  - Migrating enhanced analysis...');
    const analyses = db.prepare('SELECT * FROM enhanced_analysis').all();
    await batchInsert(pg, 'intelligence.enhanced_analysis', analyses);
    console.log(`    ✓ ${analyses.length} analyses migrated`);
    
    console.log('  - Migrating TheBrain sync data...');
    const syncData = db.prepare('SELECT * FROM thebrain_sync').all();
    await batchInsert(pg, 'intelligence.thebrain_sync', syncData);
    console.log(`    ✓ ${syncData.length} sync records migrated`);
    
    console.log('  - Migrating scrape status...');
    const scrapeStatus = db.prepare('SELECT * FROM scrape_status').all();
    await batchInsert(pg, 'intelligence.scrape_status', scrapeStatus);
    console.log(`    ✓ ${scrapeStatus.length} status records migrated`);
    
  } finally {
    db.close();
  }
}

async function migrateRawContentDb(pg) {
  console.log('\n📦 Migrating raw content database...');
  const db = new Database(dbPaths.raw, { readonly: true });
  
  try {
    // Create table
    await pg.query(`
      CREATE TABLE IF NOT EXISTS raw_content.raw_html (
        id INTEGER PRIMARY KEY,
        url_id INTEGER NOT NULL,
        content TEXT,
        headers TEXT,
        scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        content_hash TEXT,
        http_status INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Migrate data - this is the big one!
    console.log('  - Migrating raw HTML content (this may take a while)...');
    const totalCount = db.prepare('SELECT COUNT(*) as count FROM raw_html').get().count;
    console.log(`    Total records: ${totalCount}`);
    
    let offset = 0;
    while (offset < totalCount) {
      const batch = db.prepare('SELECT * FROM raw_html LIMIT ? OFFSET ?').all(BATCH_SIZE, offset);
      await batchInsert(pg, 'raw_content.raw_html', batch);
      offset += BATCH_SIZE;
      
      const progress = Math.min(100, Math.round((offset / totalCount) * 100));
      process.stdout.write(`\r    Progress: ${progress}%`);
    }
    console.log('\n    ✓ Raw content migration complete');
    
  } finally {
    db.close();
  }
}

async function migrateProcessedContentDb(pg) {
  console.log('\n📝 Migrating processed content database...');
  const db = new Database(dbPaths.processed, { readonly: true });
  
  try {
    // Create table
    await pg.query(`
      CREATE TABLE IF NOT EXISTS processed_content.markdown_content (
        id INTEGER PRIMARY KEY,
        raw_content_id INTEGER NOT NULL,
        content TEXT,
        word_count INTEGER,
        processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        processing_error TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Migrate data
    console.log('  - Migrating markdown content...');
    const totalCount = db.prepare('SELECT COUNT(*) as count FROM markdown_content').get().count;
    console.log(`    Total records: ${totalCount}`);
    
    let offset = 0;
    while (offset < totalCount) {
      const batch = db.prepare('SELECT * FROM markdown_content LIMIT ? OFFSET ?').all(BATCH_SIZE, offset);
      await batchInsert(pg, 'processed_content.markdown_content', batch);
      offset += BATCH_SIZE;
      
      const progress = Math.min(100, Math.round((offset / totalCount) * 100));
      process.stdout.write(`\r    Progress: ${progress}%`);
    }
    console.log('\n    ✓ Processed content migration complete');
    
  } finally {
    db.close();
  }
}

async function batchInsert(pg, tableName, records) {
  if (records.length === 0) return;
  
  const columns = Object.keys(records[0]);
  const values = [];
  const placeholders = [];
  
  records.forEach((record, recordIndex) => {
    const recordPlaceholders = columns.map((col, colIndex) => {
      const paramIndex = recordIndex * columns.length + colIndex + 1;
      values.push(record[col]);
      return `$${paramIndex}`;
    });
    placeholders.push(`(${recordPlaceholders.join(', ')})`);
  });
  
  const query = `
    INSERT INTO ${tableName} (${columns.join(', ')})
    VALUES ${placeholders.join(', ')}
    ON CONFLICT DO NOTHING
  `;
  
  await pg.query(query, values);
}

// Create indexes after migration
async function createIndexes(pg) {
  console.log('\n🔍 Creating indexes for performance...');
  
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_urls_company_id ON intelligence.urls(company_id)',
    'CREATE INDEX IF NOT EXISTS idx_urls_last_scraped ON intelligence.urls(last_scraped)',
    'CREATE INDEX IF NOT EXISTS idx_raw_html_url_id ON raw_content.raw_html(url_id)',
    'CREATE INDEX IF NOT EXISTS idx_raw_html_scraped_at ON raw_content.raw_html(scraped_at)',
    'CREATE INDEX IF NOT EXISTS idx_markdown_content_raw_id ON processed_content.markdown_content(raw_content_id)',
    'CREATE INDEX IF NOT EXISTS idx_enhanced_analysis_company_id ON intelligence.enhanced_analysis(company_id)',
    'CREATE INDEX IF NOT EXISTS idx_thebrain_sync_company_id ON intelligence.thebrain_sync(company_id)',
    'CREATE INDEX IF NOT EXISTS idx_scrape_status_url_id ON intelligence.scrape_status(url_id)'
  ];
  
  for (const index of indexes) {
    await pg.query(index);
    console.log(`  ✓ ${index.match(/idx_\w+/)[0]}`);
  }
  
  console.log('✅ All indexes created');
}

// Run the migration
migrateToPostgres()
  .then(async () => {
    // Create indexes after successful migration
    const pg = new Client({
      connectionString: POSTGRES_CONNECTION_STRING,
      ssl: { rejectUnauthorized: false }
    });
    await pg.connect();
    await createIndexes(pg);
    await pg.end();
    
    console.log('\n✨ Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Update all your scripts to use Postgres instead of SQLite');
    console.log('2. Test the application thoroughly');
    console.log('3. Remove SQLite operations from GitHub Actions');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  });
