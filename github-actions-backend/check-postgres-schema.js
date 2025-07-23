#!/usr/bin/env node

if (process.env.NODE_ENV === 'production' || process.env.POSTGRES_CONNECTION_STRING) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const { db, end } = require('./postgres-db');

async function checkSchema() {
    console.log('Checking PostgreSQL schema...\n');
    
    try {
        // Check intelligence.changes columns
        const changesColumns = await db.all(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_schema = 'intelligence' 
            AND table_name = 'changes'
            ORDER BY ordinal_position
        `);
        
        console.log('intelligence.changes columns:');
        changesColumns.forEach(col => {
            console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
        });
        
        // Check intelligence.urls columns
        console.log('\nintelligence.urls columns:');
        const urlsColumns = await db.all(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_schema = 'intelligence' 
            AND table_name = 'urls'
            ORDER BY ordinal_position
        `);
        
        urlsColumns.forEach(col => {
            console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
        });
        
        // Check intelligence.baseline_analysis columns
        console.log('\nintelligence.baseline_analysis columns:');
        const baselineColumns = await db.all(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_schema = 'intelligence' 
            AND table_name = 'baseline_analysis'
            ORDER BY ordinal_position
        `);
        
        baselineColumns.forEach(col => {
            console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
        });
        
        // Check intelligence.enhanced_analysis columns
        console.log('\nintelligence.enhanced_analysis columns:');
        const enhancedColumns = await db.all(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_schema = 'intelligence' 
            AND table_name = 'enhanced_analysis'
            ORDER BY ordinal_position
        `);
        
        enhancedColumns.forEach(col => {
            console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
        });
        
    } catch (error) {
        console.error('Error checking schema:', error);
    } finally {
        await end();
    }
}

checkSchema();
