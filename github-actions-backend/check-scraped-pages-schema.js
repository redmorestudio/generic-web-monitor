#!/usr/bin/env node

if (process.env.NODE_ENV === 'production' || process.env.POSTGRES_CONNECTION_STRING) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const { db, end } = require('./postgres-db');

async function checkSchema() {
    console.log('Checking scraped_pages schema...\n');
    
    try {
        // Check raw_content.scraped_pages columns
        const columns = await db.all(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_schema = 'raw_content' 
            AND table_name = 'scraped_pages'
            ORDER BY ordinal_position
        `);
        
        console.log('raw_content.scraped_pages columns:');
        columns.forEach(col => {
            console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
        });
        
    } catch (error) {
        console.error('Error checking schema:', error);
    } finally {
        await end();
    }
}

checkSchema();
