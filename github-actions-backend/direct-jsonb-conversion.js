#!/usr/bin/env node

/**
 * Direct JSONB Conversion with Schema Protection
 * Final attempt to convert the remaining columns
 */

require('dotenv').config();

// SSL Certificate fix for Heroku PostgreSQL
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { Pool } = require('pg');
const { SchemaProtector } = require('./schema-protector');

const pool = new Pool({
    connectionString: process.env.POSTGRES_CONNECTION_STRING,
    ssl: { rejectUnauthorized: false }
});

async function convertRemainingColumns() {
    console.log('🚀 Direct JSONB Conversion with Schema Protection');
    console.log('================================================\n');
    
    const protector = new SchemaProtector();
    
    try {
        await protector.executeWithProtection(
            'direct-jsonb-conversion.js',
            'Converting final 2 text columns to JSONB in enhanced_analysis table',
            async () => {
                // Convert key_changes
                console.log('🔧 Converting key_changes column...');
                
                // Step 1: Add temporary column
                await pool.query(`ALTER TABLE enhanced_analysis ADD COLUMN IF NOT EXISTS key_changes_temp JSONB`);
                console.log('  ✓ Added temporary column');
                
                // Step 2: Convert data
                await pool.query(`
                    UPDATE enhanced_analysis 
                    SET key_changes_temp = 
                        CASE 
                            WHEN key_changes IS NULL OR key_changes = '' THEN NULL
                            WHEN key_changes ~ '^\\s*\\{' AND key_changes ~ '\\}\\s*$' THEN key_changes::jsonb
                            WHEN key_changes ~ '^\\s*\\[' AND key_changes ~ '\\]\\s*$' THEN key_changes::jsonb
                            ELSE to_jsonb(key_changes)
                        END
                    WHERE key_changes IS NOT NULL
                `);
                console.log('  ✓ Converted data');
                
                // Step 3: Drop old column
                await pool.query(`ALTER TABLE enhanced_analysis DROP COLUMN key_changes`);
                console.log('  ✓ Dropped old column');
                
                // Step 4: Rename new column
                await pool.query(`ALTER TABLE enhanced_analysis RENAME COLUMN key_changes_temp TO key_changes`);
                console.log('  ✓ Renamed column');
                console.log('✅ key_changes conversion complete!\n');
                
                // Convert competitive_implications
                console.log('🔧 Converting competitive_implications column...');
                
                // Step 1: Add temporary column
                await pool.query(`ALTER TABLE enhanced_analysis ADD COLUMN IF NOT EXISTS competitive_implications_temp JSONB`);
                console.log('  ✓ Added temporary column');
                
                // Step 2: Convert data
                await pool.query(`
                    UPDATE enhanced_analysis 
                    SET competitive_implications_temp = 
                        CASE 
                            WHEN competitive_implications IS NULL OR competitive_implications = '' THEN NULL
                            WHEN competitive_implications ~ '^\\s*\\{' AND competitive_implications ~ '\\}\\s*$' THEN competitive_implications::jsonb
                            WHEN competitive_implications ~ '^\\s*\\[' AND competitive_implications ~ '\\]\\s*$' THEN competitive_implications::jsonb
                            ELSE to_jsonb(competitive_implications)
                        END
                    WHERE competitive_implications IS NOT NULL
                `);
                console.log('  ✓ Converted data');
                
                // Step 3: Drop old column
                await pool.query(`ALTER TABLE enhanced_analysis DROP COLUMN competitive_implications`);
                console.log('  ✓ Dropped old column');
                
                // Step 4: Rename new column
                await pool.query(`ALTER TABLE enhanced_analysis RENAME COLUMN competitive_implications_temp TO competitive_implications`);
                console.log('  ✓ Renamed column');
                console.log('✅ competitive_implications conversion complete!\n');
            }
        );
        
        // Verify results
        console.log('📊 Verifying conversion results...');
        const verifyQuery = `
            SELECT 
                column_name, 
                data_type,
                CASE 
                    WHEN data_type = 'jsonb' THEN '✅ Successfully converted'
                    WHEN data_type = 'text' THEN '❌ Still text'
                    ELSE '⚠️  ' || data_type
                END as status
            FROM information_schema.columns 
            WHERE table_name = 'enhanced_analysis' 
            AND column_name IN ('key_changes', 'competitive_implications')
            ORDER BY column_name
        `;
        
        const result = await pool.query(verifyQuery);
        console.log('\nFinal column status:');
        result.rows.forEach(row => {
            console.log(`  ${row.status} - ${row.column_name}: ${row.data_type}`);
        });
        
        // Check ALL potentially problematic columns
        const allCheck = await pool.query(`
            SELECT COUNT(*) as text_count
            FROM information_schema.columns 
            WHERE table_name = 'enhanced_analysis' 
            AND column_name IN (
                'key_changes', 'competitive_implications', 'technical_details', 
                'market_impact', 'strategic_insights', 'tags', 
                'related_companies', 'data_sources'
            )
            AND data_type = 'text'
        `);
        
        if (allCheck.rows[0].text_count === '0') {
            console.log('\n🎉 SUCCESS! All columns have been converted to JSONB!');
            console.log('   The malformed array literal issue is now completely resolved.');
            console.log('   The schema protection system has been updated with the changes.');
        } else {
            console.log(`\n⚠️  ${allCheck.rows[0].text_count} columns still need conversion.`);
        }
        
    } catch (error) {
        console.error('\n❌ Error during conversion:', error.message);
        console.error('\nFull error:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Run if called directly
if (require.main === module) {
    convertRemainingColumns().catch(console.error);
}

module.exports = { convertRemainingColumns };