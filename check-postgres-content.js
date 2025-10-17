#!/usr/bin/env node

// SSL Certificate fix for Heroku PostgreSQL
if (process.env.NODE_ENV === 'production' || process.env.POSTGRES_CONNECTION_STRING) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const { db, end } = require('./github-actions-backend/postgres-db');

async function checkDatabaseContent() {
    console.log('🔍 Checking PostgreSQL Database Content');
    console.log('=' .repeat(60));
    
    try {
        // Check connection
        const conn = await db.get('SELECT NOW() as current_time');
        console.log('✅ Connected to PostgreSQL at:', conn.current_time);
        console.log('');
        
        // Check schemas
        console.log('📊 Database Schemas:');
        const schemas = await db.all(`
            SELECT schema_name 
            FROM information_schema.schemata 
            WHERE schema_name IN ('raw_content', 'processed_content', 'intelligence')
            ORDER BY schema_name
        `);
        schemas.forEach(s => console.log(`  - ${s.schema_name}`));
        console.log('');
        
        // Check raw_content tables
        console.log('📦 Raw Content Tables:');
        const rawTables = await db.all(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'raw_content'
            ORDER BY table_name
        `);
        rawTables.forEach(t => console.log(`  - ${t.table_name}`));
        console.log('');
        
        // Check scraped_pages content
        console.log('🌐 Scraped Pages Summary:');
        const scrapedStats = await db.get(`
            SELECT 
                COUNT(*) as total_pages,
                COUNT(DISTINCT company) as unique_companies,
                COUNT(DISTINCT url) as unique_urls,
                MIN(scraped_at) as oldest_scrape,
                MAX(scraped_at) as newest_scrape
            FROM raw_content.scraped_pages
        `);
        console.log(`  Total pages: ${scrapedStats.total_pages}`);
        console.log(`  Unique companies: ${scrapedStats.unique_companies}`);
        console.log(`  Unique URLs: ${scrapedStats.unique_urls}`);
        console.log(`  Oldest scrape: ${scrapedStats.oldest_scrape || 'None'}`);
        console.log(`  Newest scrape: ${scrapedStats.newest_scrape || 'None'}`);
        console.log('');
        
        // Recent scrapes by company
        if (scrapedStats.total_pages > 0) {
            console.log('🏢 Recent Scrapes by Company (last 7 days):');
            const recentByCompany = await db.all(`
                SELECT 
                    company,
                    COUNT(*) as page_count,
                    MAX(scraped_at) as last_scrape
                FROM raw_content.scraped_pages
                WHERE scraped_at > NOW() - INTERVAL '7 days'
                GROUP BY company
                ORDER BY page_count DESC
                LIMIT 10
            `);
            recentByCompany.forEach(c => {
                console.log(`  ${c.company}: ${c.page_count} pages (last: ${c.last_scrape})`);
            });
            console.log('');
        }
        
        // Check scrape_runs
        console.log('🏃 Scrape Runs Summary:');
        const runsStats = await db.get(`
            SELECT 
                COUNT(*) as total_runs,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_runs,
                COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_runs,
                MAX(completed_at) as last_completed_run
            FROM raw_content.scrape_runs
        `);
        console.log(`  Total runs: ${runsStats.total_runs}`);
        console.log(`  Completed: ${runsStats.completed_runs}`);
        console.log(`  Failed: ${runsStats.failed_runs}`);
        console.log(`  Last completed: ${runsStats.last_completed_run || 'None'}`);
        console.log('');
        
        // Recent scrape runs
        if (runsStats.total_runs > 0) {
            console.log('📋 Recent Scrape Runs:');
            const recentRuns = await db.all(`
                SELECT 
                    id,
                    started_at,
                    completed_at,
                    status,
                    urls_processed,
                    urls_changed,
                    errors_count
                FROM raw_content.scrape_runs
                ORDER BY started_at DESC
                LIMIT 5
            `);
            recentRuns.forEach(r => {
                console.log(`  Run ${r.id}: ${r.status} - ${r.urls_processed} URLs processed, ${r.errors_count || 0} errors`);
                console.log(`    Started: ${r.started_at}, Completed: ${r.completed_at || 'In progress'}`);
            });
            console.log('');
        }
        
        // Check processed content
        console.log('🔄 Processed Content Summary:');
        const processedStats = await db.get(`
            SELECT 
                COUNT(*) as total_changes,
                COUNT(DISTINCT company) as companies_with_changes,
                AVG(interest_level) as avg_interest_level,
                MAX(detected_at) as latest_change
            FROM processed_content.change_detection
        `);
        console.log(`  Total changes detected: ${processedStats.total_changes}`);
        console.log(`  Companies with changes: ${processedStats.companies_with_changes}`);
        console.log(`  Average interest level: ${processedStats.avg_interest_level?.toFixed(2) || 'N/A'}`);
        console.log(`  Latest change: ${processedStats.latest_change || 'None'}`);
        console.log('');
        
        // Check intelligence data
        console.log('🧠 Intelligence Data Summary:');
        const intelligenceStats = await db.get(`
            SELECT 
                (SELECT COUNT(*) FROM intelligence.companies) as company_count,
                (SELECT COUNT(*) FROM intelligence.company_urls) as url_count,
                (SELECT COUNT(*) FROM intelligence.insights) as insight_count
        `);
        console.log(`  Companies: ${intelligenceStats.company_count}`);
        console.log(`  URLs configured: ${intelligenceStats.url_count}`);
        console.log(`  Insights: ${intelligenceStats.insight_count}`);
        
    } catch (error) {
        console.error('❌ Error checking database:', error.message);
        if (error.message.includes('ECONNREFUSED')) {
            console.error('   Cannot connect to PostgreSQL. Check POSTGRES_CONNECTION_STRING');
        } else if (error.message.includes('does not exist')) {
            console.error('   Schema or table might not exist. Run initialization first.');
        }
    } finally {
        await end();
    }
}

// Run the check
checkDatabaseContent().catch(console.error);
