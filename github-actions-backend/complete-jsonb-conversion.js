#!/usr/bin/env node

/**
 * Complete JSONB Column Conversion Script
 * Converts remaining text columns to JSONB in enhanced_analysis table
 * Uses schema protection for safe operations
 */

const { spawn } = require('child_process');
const path = require('path');

// SSL Certificate fix for Heroku PostgreSQL
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const protectorPath = path.join(__dirname, 'schema-protector.js');

// Columns that still need conversion
const columnsToConvert = [
    'key_changes',
    'competitive_implications',
    'technical_details',
    'market_impact',
    'strategic_insights'
];

async function runProtectedCommand(command, description) {
    console.log(`\n🔄 ${description}...`);
    
    return new Promise((resolve, reject) => {
        const child = spawn('node', [protectorPath, 'run', command], {
            stdio: 'inherit',
            env: process.env
        });
        
        child.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Command failed with code ${code}`));
            }
        });
    });
}

async function completeJsonbConversion() {
    console.log('🚀 Complete JSONB Column Conversion');
    console.log('===================================\n');
    
    try {
        // First, check current status
        console.log('📊 Checking current column status...');
        await runProtectedCommand(
            `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'enhanced_analysis' AND column_name IN ('${columnsToConvert.join("','")}') ORDER BY column_name`,
            'Checking column types'
        );
        
        // Convert each column that needs it
        for (const column of columnsToConvert) {
            console.log(`\n🔧 Processing column: ${column}`);
            
            // First backup the data
            await runProtectedCommand(
                `CREATE TEMP TABLE temp_${column}_backup AS SELECT id, ${column} FROM enhanced_analysis WHERE ${column} IS NOT NULL`,
                `Creating backup for ${column}`
            );
            
            // Add new JSONB column
            const newColumnName = `${column}_jsonb`;
            await runProtectedCommand(
                `ALTER TABLE enhanced_analysis ADD COLUMN IF NOT EXISTS ${newColumnName} JSONB`,
                `Adding ${newColumnName} column`
            );
            
            // Convert data with proper error handling
            await runProtectedCommand(
                `UPDATE enhanced_analysis 
                 SET ${newColumnName} = 
                    CASE 
                        WHEN ${column} IS NULL THEN NULL
                        WHEN ${column} = '' THEN NULL
                        WHEN ${column} ~ '^\\s*\\{.*\\}\\s*$' THEN ${column}::jsonb
                        WHEN ${column} ~ '^\\s*\\[.*\\]\\s*$' THEN ${column}::jsonb
                        ELSE to_jsonb(${column})
                    END
                 WHERE ${column} IS NOT NULL`,
                `Converting data for ${column}`
            );
            
            // Drop old column
            await runProtectedCommand(
                `ALTER TABLE enhanced_analysis DROP COLUMN ${column}`,
                `Dropping old ${column} column`
            );
            
            // Rename new column
            await runProtectedCommand(
                `ALTER TABLE enhanced_analysis RENAME COLUMN ${newColumnName} TO ${column}`,
                `Renaming ${newColumnName} to ${column}`
            );
            
            console.log(`✅ Successfully converted ${column} to JSONB`);
        }
        
        // Final verification
        console.log('\n📊 Final column status:');
        await runProtectedCommand(
            `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'enhanced_analysis' AND column_name IN ('${columnsToConvert.join("','")}') ORDER BY column_name`,
            'Verifying final column types'
        );
        
        // Check for any remaining text columns in the problematic set
        console.log('\n🔍 Checking all potentially problematic columns:');
        await runProtectedCommand(
            `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'enhanced_analysis' AND column_name IN ('key_changes', 'competitive_implications', 'technical_details', 'market_impact', 'strategic_insights', 'tags', 'related_companies', 'data_sources') ORDER BY column_name`,
            'Full column status check'
        );
        
        console.log('\n✅ JSONB conversion complete!');
        console.log('   All columns have been successfully converted.');
        console.log('   The malformed array literal issue should now be resolved.');
        
    } catch (error) {
        console.error('\n❌ Error during conversion:', error.message);
        console.error('\n⚠️  Partial conversion may have occurred.');
        console.error('   Run "node schema-protector.js status" to check current state.');
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    completeJsonbConversion().catch(console.error);
}

module.exports = { completeJsonbConversion };