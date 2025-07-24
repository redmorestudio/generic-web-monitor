require('dotenv').config();

// SSL Certificate fix for Heroku PostgreSQL
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_CONNECTION_STRING,
    ssl: { rejectUnauthorized: false }
});

async function checkColumns() {
    try {
        console.log('Checking column types in enhanced_analysis...\n');
        
        const query = `
            SELECT 
                column_name, 
                data_type,
                CASE 
                    WHEN data_type = 'jsonb' THEN '✅ Already JSONB'
                    WHEN data_type = 'text' THEN '❌ Still TEXT - needs conversion'
                    ELSE '⚠️  ' || data_type
                END as status
            FROM information_schema.columns 
            WHERE table_name = 'enhanced_analysis' 
            AND column_name IN (
                'key_changes', 'competitive_implications', 'technical_details', 
                'market_impact', 'strategic_insights', 'tags', 
                'related_companies', 'data_sources'
            )
            ORDER BY 
                CASE WHEN data_type = 'text' THEN 0 ELSE 1 END,
                column_name
        `;
        
        const result = await pool.query(query);
        
        console.log('Column Status:');
        console.log('==============');
        result.rows.forEach(row => {
            console.log(`${row.status} ${row.column_name}: ${row.data_type}`);
        });
        
        const textColumns = result.rows.filter(r => r.data_type === 'text');
        console.log(`\nTotal columns needing conversion: ${textColumns.length}`);
        
        if (textColumns.length > 0) {
            console.log('\nColumns that still need conversion:');
            textColumns.forEach(col => {
                console.log(`  - ${col.column_name}`);
            });
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

checkColumns();