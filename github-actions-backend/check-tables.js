require('dotenv').config();

// SSL Certificate fix for Heroku PostgreSQL
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_CONNECTION_STRING,
    ssl: { rejectUnauthorized: false }
});

async function checkTables() {
    try {
        console.log('Checking database tables...\n');
        
        // List all tables
        const tablesQuery = `
            SELECT 
                table_name,
                table_type
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `;
        
        const tables = await pool.query(tablesQuery);
        
        console.log('Tables in database:');
        console.log('==================');
        tables.rows.forEach(table => {
            console.log(`  - ${table.table_name} (${table.table_type})`);
        });
        
        console.log(`\nTotal tables: ${tables.rows.length}`);
        
        // Check if enhanced_analysis exists
        const hasEnhancedAnalysis = tables.rows.some(t => t.table_name === 'enhanced_analysis');
        console.log(`\nenhanced_analysis table exists: ${hasEnhancedAnalysis ? 'YES' : 'NO'}`);
        
        // If it exists, show its structure
        if (hasEnhancedAnalysis) {
            const columnsQuery = `
                SELECT 
                    column_name,
                    data_type,
                    is_nullable
                FROM information_schema.columns
                WHERE table_name = 'enhanced_analysis'
                ORDER BY ordinal_position
            `;
            
            const columns = await pool.query(columnsQuery);
            console.log('\nenhanced_analysis columns:');
            columns.rows.forEach(col => {
                console.log(`  - ${col.column_name}: ${col.data_type}`);
            });
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

checkTables();