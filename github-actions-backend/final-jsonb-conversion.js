#!/usr/bin/env node

/**
 * Final JSONB Conversion Script
 * Converts the last 2 remaining text columns to JSONB
 * Uses schema protection for safe operations
 */

require('dotenv').config();

// SSL Certificate fix for Heroku PostgreSQL
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { Pool } = require('pg');
const { execSync } = require('child_process');
const path = require('path');

const pool = new Pool({
    connectionString: process.env.POSTGRES_CONNECTION_STRING,
    ssl: { rejectUnauthorized: false }
});

const protectorPath = path.join(__dirname, 'schema-protector.js');

// The final 2 columns to convert
const columnsToConvert = [
    'key_changes',
    'competitive_implications'
];

async function convertColumns() {
    console.log('🚀 Final JSONB Column Conversion');
    console.log('================================\n');
    console.log('Converting the last 2 remaining text columns to JSONB...\n');
    
    try {
        for (const column of columnsToConvert) {
            console.log(`\n🔧 Converting ${column}...`);
            
            // Create the conversion SQL script
            const conversionScript = `
-- Backup data before conversion
CREATE TEMP TABLE IF NOT EXISTS ${column}_backup AS 
SELECT id, ${column} FROM enhanced_analysis WHERE ${column} IS NOT NULL;

-- Add new JSONB column
ALTER TABLE enhanced_analysis ADD COLUMN IF NOT EXISTS ${column}_new JSONB;

-- Convert data with comprehensive handling
UPDATE enhanced_analysis 
SET ${column}_new = 
    CASE 
        WHEN ${column} IS NULL THEN NULL
        WHEN ${column} = '' THEN NULL
        WHEN ${column} ~ '^\\s*\\{.*\\}\\s*$' THEN 
            CASE 
                WHEN jsonb_typeof(${column}::jsonb) IS NOT NULL THEN ${column}::jsonb
                ELSE NULL
            END
        WHEN ${column} ~ '^\\s*\\[.*\\]\\s*$' THEN 
            CASE 
                WHEN jsonb_typeof(${column}::jsonb) IS NOT NULL THEN ${column}::jsonb
                ELSE NULL
            END
        ELSE to_jsonb(${column})
    END;

-- Drop old column
ALTER TABLE enhanced_analysis DROP COLUMN ${column};

-- Rename new column
ALTER TABLE enhanced_analysis RENAME COLUMN ${column}_new TO ${column};

-- Verify conversion
SELECT '${column} conversion complete' as status;
            `.trim();
            
            // Run through schema protector
            try {
                console.log(`  Running protected conversion...`);
                const result = execSync(
                    `node "${protectorPath}" run "${conversionScript}"`,
                    { encoding: 'utf8', stdio: 'pipe' }
                );
                console.log(`  ✅ ${column} converted successfully`);
                console.log(result.trim());
            } catch (error) {
                console.error(`  ❌ Error converting ${column}:`, error.message);
                if (error.stdout) console.log('Output:', error.stdout.toString());
                if (error.stderr) console.error('Error:', error.stderr.toString());
                throw error;
            }
        }
        
        // Final verification
        console.log('\n📊 Verifying final state...');
        const verifyQuery = `
            SELECT 
                column_name, 
                data_type,
                CASE 
                    WHEN data_type = 'jsonb' THEN '✅'
                    ELSE '❌'
                END as status
            FROM information_schema.columns 
            WHERE table_name = 'enhanced_analysis' 
            AND column_name IN ('${columnsToConvert.join("','")}')
            ORDER BY column_name
        `;
        
        const result = await pool.query(verifyQuery);
        console.log('\nFinal column types:');
        result.rows.forEach(row => {
            console.log(`  ${row.status} ${row.column_name}: ${row.data_type}`);
        });
        
        // Check all columns one more time
        const allColumnsQuery = `
            SELECT column_name, data_type
            FROM information_schema.columns 
            WHERE table_name = 'enhanced_analysis' 
            AND column_name IN (
                'key_changes', 'competitive_implications', 'technical_details', 
                'market_impact', 'strategic_insights', 'tags', 
                'related_companies', 'data_sources'
            )
            AND data_type = 'text'
        `;
        
        const remainingText = await pool.query(allColumnsQuery);
        
        if (remainingText.rows.length === 0) {
            console.log('\n✅ SUCCESS! All columns have been converted to JSONB.');
            console.log('   The malformed array literal issue is now fully resolved.');
        } else {
            console.log(`\n⚠️  Warning: ${remainingText.rows.length} columns still have text type:`);
            remainingText.rows.forEach(row => {
                console.log(`   - ${row.column_name}`);
            });
        }
        
    } catch (error) {
        console.error('\n❌ Fatal error:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Run if called directly
if (require.main === module) {
    convertColumns().catch(console.error);
}

module.exports = { convertColumns };