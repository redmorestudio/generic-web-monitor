#!/usr/bin/env node

// SSL Certificate fix for Heroku PostgreSQL
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { db } = require('./postgres-db');

async function fixAllSchemas() {
    console.log('🔧 Fixing all PostgreSQL schemas comprehensively...\n');
    
    try {
        // 1. Fix baseline_analysis table
        console.log('📊 Fixing baseline_analysis table...');
        
        // Check current structure
        const baColumns = await db.all(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'intelligence' 
            AND table_name = 'baseline_analysis'
            ORDER BY ordinal_position
        `);
        
        console.log('Current baseline_analysis columns:', baColumns.map(c => c.column_name).join(', '));
        
        // Add missing columns if they don't exist
        const requiredColumns = [
            { name: 'company_name', type: 'TEXT' },
            { name: 'company_id', type: 'INTEGER' },
            { name: 'url', type: 'TEXT' },
            { name: 'url_id', type: 'INTEGER' },
            { name: 'entities', type: 'JSONB' },
            { name: 'themes', type: 'JSONB' },
            { name: 'sentiment', type: 'JSONB' },
            { name: 'key_points', type: 'JSONB' },
            { name: 'relationships', type: 'JSONB' },
            { name: 'analysis_date', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' }
        ];
        
        for (const col of requiredColumns) {
            const exists = baColumns.some(c => c.column_name === col.name);
            if (!exists) {
                console.log(`  Adding column ${col.name}...`);
                await db.run(`
                    ALTER TABLE intelligence.baseline_analysis 
                    ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}
                `);
            }
        }
        
        // 2. Fix company_analysis table
        console.log('\n📊 Fixing company_analysis table...');
        
        // Create table if it doesn't exist
        await db.run(`
            CREATE TABLE IF NOT EXISTS intelligence.company_analysis (
                id SERIAL PRIMARY KEY,
                company_id INTEGER REFERENCES intelligence.companies(id),
                company_name TEXT,
                focus_areas JSONB,
                key_technologies JSONB,
                recent_updates JSONB,
                competitive_position TEXT,
                market_presence TEXT,
                analysis_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(company_id)
            )
        `);
        
        // Check if focus_areas column exists
        const caColumns = await db.all(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_schema = 'intelligence' 
            AND table_name = 'company_analysis'
        `);
        
        if (!caColumns.some(c => c.column_name === 'focus_areas')) {
            console.log('  Adding focus_areas column...');
            await db.run(`
                ALTER TABLE intelligence.company_analysis 
                ADD COLUMN focus_areas JSONB
            `);
        }
        
        // 3. Ensure enhanced_analysis has required columns
        console.log('\n📊 Checking enhanced_analysis table...');
        
        await db.run(`
            CREATE TABLE IF NOT EXISTS intelligence.enhanced_analysis (
                id SERIAL PRIMARY KEY,
                change_id INTEGER,
                company_name TEXT,
                url TEXT,
                analysis_type TEXT,
                interest_level INTEGER,
                key_insights JSONB,
                entities_mentioned JSONB,
                business_impact TEXT,
                technical_details JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // 4. Ensure changes table exists
        console.log('\n📊 Checking changes table...');
        
        await db.run(`
            CREATE TABLE IF NOT EXISTS intelligence.changes (
                id SERIAL PRIMARY KEY,
                company TEXT,
                url TEXT,
                detected_at TIMESTAMP,
                content_hash TEXT,
                change_summary TEXT,
                change_details JSONB,
                interest_level INTEGER DEFAULT 1,
                UNIQUE(company, url, detected_at)
            )
        `);
        
        // 5. Create indexes for performance
        console.log('\n📈 Creating indexes...');
        
        const indexes = [
            'CREATE INDEX IF NOT EXISTS idx_ba_company_name ON intelligence.baseline_analysis(company_name)',
            'CREATE INDEX IF NOT EXISTS idx_ba_analysis_date ON intelligence.baseline_analysis(analysis_date DESC)',
            'CREATE INDEX IF NOT EXISTS idx_ca_company_name ON intelligence.company_analysis(company_name)',
            'CREATE INDEX IF NOT EXISTS idx_ea_company_name ON intelligence.enhanced_analysis(company_name)',
            'CREATE INDEX IF NOT EXISTS idx_changes_company ON intelligence.changes(company)',
            'CREATE INDEX IF NOT EXISTS idx_changes_detected ON intelligence.changes(detected_at DESC)'
        ];
        
        for (const idx of indexes) {
            await db.run(idx);
        }
        
        // 6. Verify all required columns exist
        console.log('\n✅ Verifying schema...');
        
        const verifyQueries = [
            {
                table: 'baseline_analysis',
                columns: ['company_name', 'entities', 'themes']
            },
            {
                table: 'company_analysis',
                columns: ['company_name', 'focus_areas']
            },
            {
                table: 'enhanced_analysis',
                columns: ['change_id', 'company_name']
            }
        ];
        
        let allGood = true;
        for (const check of verifyQueries) {
            const cols = await db.all(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_schema = 'intelligence' 
                AND table_name = $1
            `, [check.table]);
            
            const colNames = cols.map(c => c.column_name);
            for (const required of check.columns) {
                if (!colNames.includes(required)) {
                    console.error(`❌ Missing column ${required} in ${check.table}`);
                    allGood = false;
                } else {
                    console.log(`✅ ${check.table}.${required} exists`);
                }
            }
        }
        
        if (allGood) {
            console.log('\n✅ All schemas fixed successfully!');
        } else {
            console.log('\n⚠️  Some columns are still missing');
        }
        
    } catch (error) {
        console.error('❌ Error fixing schemas:', error);
        process.exit(1);
    } finally {
        await db.end();
    }
}

// Run the fix
fixAllSchemas();
