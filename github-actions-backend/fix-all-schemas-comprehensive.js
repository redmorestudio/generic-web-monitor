#!/usr/bin/env node

/**
 * Comprehensive Schema Fix Script for PostgreSQL
 * 
 * This script ensures ALL tables have ALL columns that ANY script expects.
 * It consolidates all the band-aid fixes into one comprehensive solution.
 * 
 * Run this before any other operations to ensure schema consistency.
 */

const { Client } = require('pg');

// Configuration
const connectionString = process.env.POSTGRES_CONNECTION_STRING || process.env.DATABASE_URL;

if (!connectionString) {
    console.error('❌ Error: POSTGRES_CONNECTION_STRING or DATABASE_URL environment variable is required');
    process.exit(1);
}

async function runFixes() {
    const client = new Client({
        connectionString,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    try {
        await client.connect();
        console.log('✅ Connected to PostgreSQL');

        // Start transaction
        await client.query('BEGIN');

        console.log('\n🔧 Starting comprehensive schema fixes...\n');

        // 1. Fix baseline_analysis table - ensure JSONB columns
        console.log('1️⃣ Fixing baseline_analysis table...');
        
        // First check if columns exist and their types
        const baColumns = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'intelligence' 
            AND table_name = 'baseline_analysis'
        `);
        
        const columnMap = {};
        baColumns.rows.forEach(row => {
            columnMap[row.column_name] = row.data_type;
        });

        // Convert TEXT columns to JSONB if needed
        const jsonbColumns = ['entities', 'themes', 'key_points', 'impact_areas'];
        
        for (const col of jsonbColumns) {
            if (columnMap[col] === 'text') {
                console.log(`  Converting ${col} from TEXT to JSONB...`);
                // First add a temporary JSONB column
                await client.query(`
                    ALTER TABLE intelligence.baseline_analysis 
                    ADD COLUMN IF NOT EXISTS ${col}_jsonb JSONB
                `);
                
                // Convert existing data
                await client.query(`
                    UPDATE intelligence.baseline_analysis 
                    SET ${col}_jsonb = 
                        CASE 
                            WHEN ${col} IS NULL THEN NULL
                            WHEN ${col} = '' THEN NULL
                            ELSE ${col}::jsonb
                        END
                    WHERE ${col}_jsonb IS NULL
                `);
                
                // Drop old column and rename new one
                await client.query(`ALTER TABLE intelligence.baseline_analysis DROP COLUMN ${col}`);
                await client.query(`ALTER TABLE intelligence.baseline_analysis RENAME COLUMN ${col}_jsonb TO ${col}`);
            } else if (!columnMap[col]) {
                console.log(`  Adding missing ${col} column...`);
                await client.query(`
                    ALTER TABLE intelligence.baseline_analysis 
                    ADD COLUMN IF NOT EXISTS ${col} JSONB
                `);
            }
        }

        // 2. Fix enhanced_analysis table
        console.log('\n2️⃣ Fixing enhanced_analysis table...');
        
        // Add missing change_id if not exists
        await client.query(`
            ALTER TABLE intelligence.enhanced_analysis 
            ADD COLUMN IF NOT EXISTS change_id INTEGER
        `);
        
        // Add foreign key if not exists
        await client.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.table_constraints 
                    WHERE constraint_name = 'enhanced_analysis_change_id_fkey'
                ) THEN
                    ALTER TABLE intelligence.enhanced_analysis 
                    ADD CONSTRAINT enhanced_analysis_change_id_fkey 
                    FOREIGN KEY (change_id) REFERENCES intelligence.changes(id);
                END IF;
            END $$;
        `);

        // 3. Fix scraped_pages table
        console.log('\n3️⃣ Fixing scraped_pages table...');
        
        await client.query(`
            ALTER TABLE raw_content.scraped_pages 
            ADD COLUMN IF NOT EXISTS captcha_encountered BOOLEAN DEFAULT false,
            ADD COLUMN IF NOT EXISTS captcha_solved BOOLEAN DEFAULT false
        `);

        // 4. Fix scraping_runs table
        console.log('\n4️⃣ Fixing scraping_runs table...');
        
        await client.query(`
            ALTER TABLE raw_content.scraping_runs 
            ADD COLUMN IF NOT EXISTS captchas_encountered INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS captchas_solved INTEGER DEFAULT 0
        `);

        // 5. Create missing indexes
        console.log('\n5️⃣ Creating missing indexes...');
        
        const indexes = [
            {
                name: 'idx_baseline_analysis_company_date',
                table: 'intelligence.baseline_analysis',
                columns: '(company, analysis_date DESC)'
            },
            {
                name: 'idx_enhanced_analysis_change_id',
                table: 'intelligence.enhanced_analysis',
                columns: '(change_id)'
            },
            {
                name: 'idx_changes_company_detected',
                table: 'intelligence