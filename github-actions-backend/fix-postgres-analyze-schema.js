#!/usr/bin/env node

const { Client } = require('pg');

async function fixAnalyzeSchema() {
    const client = new Client({
        connectionString: process.env.POSTGRES_CONNECTION_STRING
    });

    try {
        await client.connect();
        console.log('🔧 Connected to PostgreSQL - Fixing schema for analyze step...');

        // Create schemas if they don't exist
        const schemas = ['raw_content', 'processed_content', 'intelligence'];
        for (const schema of schemas) {
            await client.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`);
            console.log(`✅ Ensured schema: ${schema}`);
        }

        // Create all required tables for the analyze step
        
        // 1. Raw content tables (should already exist from scraper)
        await client.query(`
            CREATE TABLE IF NOT EXISTS raw_content.scraped_pages (
                id SERIAL PRIMARY KEY,
                company TEXT NOT NULL,
                url TEXT NOT NULL,
                html_content TEXT,
                scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                content_hash TEXT,
                status TEXT DEFAULT 'success',
                error_message TEXT,
                captcha_detected BOOLEAN DEFAULT FALSE,
                access_blocked BOOLEAN DEFAULT FALSE,
                UNIQUE(company, url)
            )
        `);
        console.log('✅ Ensured table: raw_content.scraped_pages');

        // 2. Processed content tables
        await client.query(`
            CREATE TABLE IF NOT EXISTS processed_content.markdown_pages (
                id SERIAL PRIMARY KEY,
                company TEXT NOT NULL,
                url TEXT NOT NULL,
                url_name TEXT,
                content TEXT,
                markdown_hash TEXT,
                source_hash TEXT UNIQUE,
                source_type TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                title TEXT
            )
        `);
        console.log('✅ Ensured table: processed_content.markdown_pages');

        // 3. Intelligence tables for analysis results
        await client.query(`
            CREATE TABLE IF NOT EXISTS intelligence.baseline_analysis (
                id SERIAL PRIMARY KEY,
                company TEXT NOT NULL,
                url TEXT NOT NULL,
                company_type TEXT,
                page_purpose TEXT,
                key_topics TEXT[],
                main_message TEXT,
                target_audience TEXT,
                unique_value TEXT,
                trust_elements TEXT[],
                differentiation TEXT,
                technology_stack TEXT[],
                analysis_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                content_hash TEXT,
                ai_model TEXT DEFAULT 'groq-llama-3.3-70b',
                UNIQUE(company, url)
            )
        `);
        console.log('✅ Ensured table: intelligence.baseline_analysis');

        await client.query(`
            CREATE TABLE IF NOT EXISTS intelligence.changes (
                id SERIAL PRIMARY KEY,
                company TEXT NOT NULL,
                url TEXT NOT NULL,
                detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                change_type TEXT,
                before_content TEXT,
                after_content TEXT,
                analysis TEXT,
                interest_level INTEGER,
                ai_confidence FLOAT,
                content_hash_before TEXT,
                content_hash_after TEXT,
                markdown_before TEXT,
                markdown_after TEXT,
                ai_model TEXT DEFAULT 'groq-llama-3.3-70b'
            )
        `);
        console.log('✅ Ensured table: intelligence.changes');

        await client.query(`
            CREATE TABLE IF NOT EXISTS intelligence.enhanced_analysis (
                id SERIAL PRIMARY KEY,
                change_id INTEGER REFERENCES intelligence.changes(id),
                ultra_analysis JSONB,
                key_insights TEXT[],
                business_impact TEXT,
                competitive_implications TEXT,
                market_signals TEXT[],
                risk_assessment TEXT,
                opportunity_score INTEGER,
                analysis_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                ai_model TEXT DEFAULT 'groq-llama-3.3-70b',
                UNIQUE(change_id)
            )
        `);
        console.log('✅ Ensured table: intelligence.enhanced_analysis');

        await client.query(`
            CREATE TABLE IF NOT EXISTS intelligence.email_notifications (
                id SERIAL PRIMARY KEY,
                sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                recipient_email TEXT NOT NULL,
                email_type TEXT NOT NULL,
                subject TEXT NOT NULL,
                changes_included INTEGER,
                status TEXT DEFAULT 'sent',
                error_message TEXT
            )
        `);
        console.log('✅ Ensured table: intelligence.email_notifications');

        await client.query(`
            CREATE TABLE IF NOT EXISTS intelligence.summaries (
                id SERIAL PRIMARY KEY,
                company TEXT NOT NULL,
                summary_date DATE DEFAULT CURRENT_DATE,
                total_changes INTEGER,
                high_interest_changes INTEGER,
                key_themes TEXT[],
                executive_summary TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(company, summary_date)
            )
        `);
        console.log('✅ Ensured table: intelligence.summaries');

        // Create indexes for performance
        const indexes = [
            'CREATE INDEX IF NOT EXISTS idx_scraped_pages_company_url ON raw_content.scraped_pages(company, url)',
            'CREATE INDEX IF NOT EXISTS idx_scraped_pages_hash ON raw_content.scraped_pages(content_hash)',
            'CREATE INDEX IF NOT EXISTS idx_markdown_pages_company_url ON processed_content.markdown_pages(company, url)',
            'CREATE INDEX IF NOT EXISTS idx_markdown_pages_source_hash ON processed_content.markdown_pages(source_hash)',
            'CREATE INDEX IF NOT EXISTS idx_baseline_company_url ON intelligence.baseline_analysis(company, url)',
            'CREATE INDEX IF NOT EXISTS idx_changes_company ON intelligence.changes(company)',
            'CREATE INDEX IF NOT EXISTS idx_changes_detected_at ON intelligence.changes(detected_at)',
            'CREATE INDEX IF NOT EXISTS idx_changes_interest ON intelligence.changes(interest_level)',
            'CREATE INDEX IF NOT EXISTS idx_enhanced_change_id ON intelligence.enhanced_analysis(change_id)'
        ];

        for (const indexSql of indexes) {
            await client.query(indexSql);
        }
        console.log('✅ Created all indexes');

        // Verify schema
        const tableCheck = await client.query(`
            SELECT 
                schemaname,
                tablename
            FROM pg_tables 
            WHERE schemaname IN ('raw_content', 'processed_content', 'intelligence')
            ORDER BY schemaname, tablename
        `);
        
        console.log('\n📊 Schema verification:');
        tableCheck.rows.forEach(row => {
            console.log(`  - ${row.schemaname}.${row.tablename}`);
        });

        console.log('\n✅ PostgreSQL schema is ready for analyze step!');

    } catch (error) {
        console.error('❌ Error fixing schema:', error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

// Run if called directly
if (require.main === module) {
    fixAnalyzeSchema();
}

module.exports = { fixAnalyzeSchema };
