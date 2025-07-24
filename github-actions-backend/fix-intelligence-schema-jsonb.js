#!/usr/bin/env node

/**
 * Fix JSONB Columns in Intelligence Schema
 * Properly converts TEXT columns to JSONB in intelligence.enhanced_analysis
 */

require('dotenv').config();

// SSL Certificate fix for Heroku PostgreSQL
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_CONNECTION_STRING,
    ssl: { rejectUnauthorized: false }
});

async function fixIntelligenceSchema() {
    console.log('🔧 Fix JSONB Columns in Intelligence Schema');
    console.log('==========================================\n');
    
    try {
        // First, verify the schema and table exist
        console.log('📊 Checking intelligence schema...');
        const schemaCheck = await pool.query(`
            SELECT 
                table_schema,
                table_name
            FROM information_schema.tables 
            WHERE table_schema = 'intelligence' 
            AND table_name = 'enhanced_analysis'
        `);
        
        if (schemaCheck.rows.length === 0) {
            throw new Error('intelligence.enhanced_analysis table not found!');
        }
        
        console.log('✅ Found intelligence.enhanced_analysis table\n');
        
        // Check current column types
        console.log('📊 Checking current column types...');
        const columnsQuery = `
            SELECT 
                column_name, 
                data_type,
                is_nullable
            FROM information_schema.columns 
            WHERE table_schema = 'intelligence'
            AND table_name = 'enhanced_analysis' 
            AND column_name IN (
                'key_changes', 'competitive_implications', 'technical_details', 
                'market_impact', 'strategic_insights', 'tags', 
                'related_companies', 'data_sources'
            )
            ORDER BY column_name
        `;
        
        const columns = await pool.query(columnsQuery);
        
        console.log('Current column types:');
        const textColumns = [];
        columns.rows.forEach(col => {
            const icon = col.data_type === 'jsonb' ? '✅' : '❌';
            console.log(`  ${icon} ${col.column_name}: ${col.data_type}`);
            if (col.data_type === 'text') {
                textColumns.push(col.column_name);
            }
        });
        
        if (textColumns.length === 0) {
            console.log('\n✅ All columns are already JSONB! No conversion needed.');
            return;
        }
        
        console.log(`\n🔄 Need to convert ${textColumns.length} columns: ${textColumns.join(', ')}\n`);
        
        // Convert each TEXT column to JSONB
        for (const column of textColumns) {
            console.log(`🔧 Converting ${column} to JSONB...`);
            
            try {
                // Start transaction for safety
                await pool.query('BEGIN');
                
                // Step 1: Add temporary JSONB column
                console.log(`  Adding temporary column...`);
                await pool.query(`
                    ALTER TABLE intelligence.enhanced_analysis 
                    ADD COLUMN IF NOT EXISTS ${column}_temp JSONB
                `);
                
                // Step 2: Check for data
                const dataCheck = await pool.query(`
                    SELECT COUNT(*) as total,
                           COUNT(${column}) as non_null
                    FROM intelligence.enhanced_analysis
                `);
                console.log(`  Data: ${dataCheck.rows[0].non_null}/${dataCheck.rows[0].total} non-null rows`);
                
                // Step 3: Convert data with proper handling
                console.log(`  Converting data...`);
                const updateQuery = `
                    UPDATE intelligence.enhanced_analysis 
                    SET ${column}_temp = 
                        CASE 
                            WHEN ${column} IS NULL THEN NULL
                            WHEN ${column} = '' THEN NULL
                            WHEN ${column} ~ '^\\s*\\{.*\\}\\s*$' AND 
                                 jsonb_typeof(${column}::jsonb) IS NOT NULL THEN ${column}::jsonb
                            WHEN ${column} ~ '^\\s*\\[.*\\]\\s*$' AND 
                                 jsonb_typeof(${column}::jsonb) IS NOT NULL THEN ${column}::jsonb
                            ELSE to_jsonb(${column})
                        END
                    WHERE ${column} IS NOT NULL
                `;
                
                const result = await pool.query(updateQuery);
                console.log(`  Updated ${result.rowCount} rows`);
                
                // Step 4: Drop old column
                console.log(`  Dropping old column...`);
                await pool.query(`
                    ALTER TABLE intelligence.enhanced_analysis 
                    DROP COLUMN ${column}
                `);
                
                // Step 5: Rename new column
                console.log(`  Renaming column...`);
                await pool.query(`
                    ALTER TABLE intelligence.enhanced_analysis 
                    RENAME COLUMN ${column}_temp TO ${column}
                `);
                
                // Commit transaction
                await pool.query('COMMIT');
                console.log(`✅ ${column} successfully converted to JSONB!\n`);
                
            } catch (error) {
                // Rollback on error
                await pool.query('ROLLBACK');
                console.error(`❌ Error converting ${column}:`, error.message);
                throw error;
            }
        }
        
        // Final verification
        console.log('📊 Final verification...');
        const finalCheck = await pool.query(columnsQuery);
        
        console.log('\nFinal column types:');
        let allJsonb = true;
        finalCheck.rows.forEach(col => {
            const icon = col.data_type === 'jsonb' ? '✅' : '❌';
            console.log(`  ${icon} ${col.column_name}: ${col.data_type}`);
            if (col.data_type !== 'jsonb') {
                allJsonb = false;
            }
        });
        
        if (allJsonb) {
            console.log('\n🎉 SUCCESS! All columns have been converted to JSONB!');
            console.log('   The malformed array literal issue is now completely resolved.');
            console.log('   The intelligence.enhanced_analysis table is now properly structured.');
            
            // Test a query to ensure it works
            console.log('\n🧪 Testing query functionality...');
            const testQuery = `
                SELECT COUNT(*) as total
                FROM intelligence.enhanced_analysis
                WHERE key_changes IS NOT NULL
                OR competitive_implications IS NOT NULL
            `;
            const testResult = await pool.query(testQuery);
            console.log(`✅ Query successful! Found ${testResult.rows[0].total} rows with data.`);
        } else {
            console.log('\n⚠️  Some columns still need conversion.');
        }
        
    } catch (error) {
        console.error('\n❌ Fatal error:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Run if called directly
if (require.main === module) {
    fixIntelligenceSchema().catch(console.error);
}

module.exports = { fixIntelligenceSchema };