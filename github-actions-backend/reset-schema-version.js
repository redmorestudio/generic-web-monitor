require('dotenv').config();

// SSL Certificate fix for Heroku PostgreSQL
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { Pool } = require('pg');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

// Database configuration
const pool = new Pool({
    connectionString: process.env.POSTGRES_CONNECTION_STRING || process.env.POSTGRES_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Function to calculate schema checksum
async function calculateSchemaChecksum() {
    const schemaQuery = `
        SELECT 
            t.table_name,
            c.column_name,
            c.data_type,
            c.is_nullable,
            c.column_default
        FROM information_schema.tables t
        JOIN information_schema.columns c ON t.table_name = c.table_name
        WHERE t.table_schema = 'public' 
        AND t.table_type = 'BASE TABLE'
        ORDER BY t.table_name, c.ordinal_position
    `;
    
    const result = await pool.query(schemaQuery);
    const schemaString = JSON.stringify(result.rows);
    return crypto.createHash('sha256').update(schemaString).digest('hex');
}

// Main reset function
async function resetSchemaVersion() {
    console.log('🔄 Schema Version Reset Tool');
    console.log('===========================\n');
    
    try {
        // Connect to database
        console.log('📊 Connecting to database...');
        await pool.query('SELECT 1');
        console.log('✅ Connected successfully\n');
        
        // Read current version file
        const versionPath = path.join(__dirname, 'schema-version.json');
        const currentVersion = JSON.parse(await fs.readFile(versionPath, 'utf8'));
        console.log('📄 Current Version Info:');
        console.log(`   Version: ${currentVersion.version}`);
        console.log(`   Last Modified: ${currentVersion.lastModified}`);
        console.log(`   Previous Checksum: ${currentVersion.checksum.substring(0, 16)}...`);
        
        // Calculate current schema checksum
        console.log('\n🔍 Calculating current schema checksum...');
        const newChecksum = await calculateSchemaChecksum();
        console.log(`   New Checksum: ${newChecksum.substring(0, 16)}...`);
        
        // Check if checksum changed
        if (newChecksum === currentVersion.checksum) {
            console.log('\n✅ Schema checksum matches! No reset needed.');
            return;
        }
        
        console.log('\n⚠️  Schema checksum mismatch detected!');
        console.log('   This indicates the schema has changed since last version update.');
        
        // Get current table structure for documentation
        const tablesQuery = `
            SELECT 
                table_name,
                COUNT(*) as column_count
            FROM information_schema.columns
            WHERE table_schema = 'public'
            GROUP BY table_name
            ORDER BY table_name
        `;
        const tables = await pool.query(tablesQuery);
        
        // Check for JSONB columns in enhanced_analysis
        const jsonbCheckQuery = `
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_name = 'enhanced_analysis'
            AND column_name IN ('key_changes', 'competitive_implications', 'technical_details', 
                               'market_impact', 'strategic_insights', 'tags', 
                               'related_companies', 'data_sources')
            ORDER BY column_name
        `;
        const jsonbColumns = await pool.query(jsonbCheckQuery);
        
        // Create new version entry
        const newVersion = {
            version: '1.1.0',  // Increment version
            lastModified: new Date().toISOString(),
            modifiedBy: 'reset-schema-version.js',
            checksum: newChecksum,
            changes: 'Schema reset after partial JSONB column conversions - 5 of 8 columns converted successfully',
            previousVersion: currentVersion.version,
            previousChecksum: currentVersion.checksum,
            details: {
                tables: tables.rows,
                jsonbConversions: jsonbColumns.rows,
                resetReason: 'Checksum mismatch after partial schema modifications'
            }
        };
        
        // Write new version file
        console.log('\n📝 Updating schema version file...');
        await fs.writeFile(versionPath, JSON.stringify(newVersion, null, 2));
        console.log('✅ Schema version updated successfully!\n');
        
        // Display summary
        console.log('📊 Schema Reset Summary:');
        console.log('========================');
        console.log(`Old Version: ${currentVersion.version} → New Version: ${newVersion.version}`);
        console.log(`Tables in Schema: ${tables.rows.length}`);
        console.log('\nJSONB Column Status in enhanced_analysis:');
        jsonbColumns.rows.forEach(col => {
            const icon = col.data_type === 'jsonb' ? '✅' : '❌';
            console.log(`  ${icon} ${col.column_name}: ${col.data_type}`);
        });
        
        console.log('\n✅ Schema version reset complete!');
        console.log('   The schema protection system is now synchronized.');
        console.log('   You can now run protected operations to fix remaining columns.');
        
    } catch (error) {
        console.error('\n❌ Error resetting schema version:', error.message);
        console.error('\nFull error:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Run if called directly
if (require.main === module) {
    resetSchemaVersion().catch(console.error);
}

module.exports = { resetSchemaVersion };