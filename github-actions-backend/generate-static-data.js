#!/usr/bin/env node

/**
 * Generate Static Data Files for GitHub Pages
 * 
 * This script converts our dynamic API into static JSON files
 * that can be served by GitHub Pages and consumed by the frontend
 */

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

// Configuration
const DATA_DIR = path.join(__dirname, 'data');
const OUTPUT_DIR = path.join(__dirname, '..', 'api-data');
const DB_PATH = path.join(DATA_DIR, 'monitor.db');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Generate dashboard data
 */
function generateDashboardData(db) {
    try {
        console.log('📊 Generating dashboard data...');
        
        // Get stats
        const stats = {
            companies: db.prepare('SELECT COUNT(DISTINCT company) as count FROM companies').get()?.count || 0,
            urls: db.prepare('SELECT COUNT(*) as count FROM urls').get()?.count || 0,
            snapshots: db.prepare('SELECT COUNT(*) as count FROM content_snapshots').get()?.count || 0,
            lastCheck: new Date().toISOString()
        };
        
        // Get company activity
        const companyActivity = db.prepare(`
            SELECT 
                c.name as company,
                c.type,
                COUNT(u.id) as url_count,
                MAX(cs.created_at) as last_check,
                GROUP_CONCAT(u.url) as urls
            FROM companies c
            LEFT JOIN urls u ON c.name = u.company
            LEFT JOIN content_snapshots cs ON u.id = cs.url_id
            GROUP BY c.name
            ORDER BY c.name
        `).all();
        
        // Process company data
        const processedCompanies = companyActivity.map(company => ({
            company: company.company,
            type: company.type || 'competitor',
            url_count: company.url_count || 0,
            last_check: company.last_check,
            urls: company.urls ? company.urls.split(',').filter(u => u) : []
        }));
        
        const dashboardData = {
            stats,
            company_activity: processedCompanies,
            generated_at: new Date().toISOString(),
            backend: 'github-actions-static'
        };
        
        return dashboardData;
    } catch (error) {
        console.error('❌ Error generating dashboard data:', error);
        return {
            stats: { companies: 0, urls: 0, snapshots: 0, lastCheck: new Date().toISOString() },
            company_activity: [],
            generated_at: new Date().toISOString(),
            backend: 'github-actions-static',
            error: error.message
        };
    }
}

/**
 * Generate companies data
 */
function generateCompaniesData(db) {
    try {
        console.log('🏢 Generating companies data...');
        
        const companies = db.prepare(`
            SELECT 
                c.name as company,
                c.type,
                c.created_at,
                GROUP_CONCAT(u.url) as urls
            FROM companies c
            LEFT JOIN urls u ON c.name = u.company
            GROUP BY c.name
            ORDER BY c.name
        `).all();
        
        const processedCompanies = companies.map(company => ({
            company: company.company,
            type: company.type || 'competitor',
            created_at: company.created_at,
            urls: company.urls ? company.urls.split(',').filter(u => u) : []
        }));
        
        return {
            companies: processedCompanies,
            generated_at: new Date().toISOString()
        };
    } catch (error) {
        console.error('❌ Error generating companies data:', error);
        return {
            companies: [],
            generated_at: new Date().toISOString(),
            error: error.message
        };
    }
}

/**
 * Generate content snapshots data
 */
function generateContentSnapshotsData(db) {
    try {
        console.log('📄 Generating content snapshots data...');
        
        const snapshots = db.prepare(`
            SELECT 
                cs.*,
                u.url,
                u.company,
                u.url_type as type
            FROM content_snapshots cs
            JOIN urls u ON cs.url_id = u.id
            ORDER BY cs.created_at DESC
            LIMIT 100
        `).all();
        
        const processedSnapshots = snapshots.map(snapshot => ({
            id: snapshot.id,
            url: snapshot.url,
            company: snapshot.company,
            type: snapshot.type || 'general',
            timestamp: snapshot.created_at,
            content_length: snapshot.content ? snapshot.content.length : 0,
            extractedContent: snapshot.content ? snapshot.content.substring(0, 500) + '...' : 'No content',
            relevanceScore: snapshot.relevance_score || 0,
            keywords: snapshot.keywords || 'None detected',
            aiProcessed: !!snapshot.relevance_score,
            source: 'GitHub Actions Monitor'
        }));
        
        return {
            extractedData: processedSnapshots,
            totalUnfiltered: snapshots.length,
            generated_at: new Date().toISOString()
        };
    } catch (error) {
        console.error('❌ Error generating content snapshots data:', error);
        return {
            extractedData: [],
            totalUnfiltered: 0,
            generated_at: new Date().toISOString(),
            error: error.message
        };
    }
}

/**
 * Generate recent changes data
 */
function generateRecentChangesData(db) {
    try {
        console.log('📈 Generating recent changes data...');
        
        // Get recent monitoring runs
        const recentRuns = db.prepare(`
            SELECT *
            FROM monitoring_runs
            ORDER BY created_at DESC
            LIMIT 50
        `).all();
        
        const processedRuns = recentRuns.map(run => ({
            id: run.id,
            url: run.url,
            company: run.company,
            status: run.status,
            change_detected: !!run.change_detected,
            change_percentage: run.change_percentage || 0,
            relevance_score: run.relevance_score || 0,
            summary: run.summary || 'No summary available',
            created_at: run.created_at,
            error_message: run.error_message
        }));
        
        return {
            changes: processedRuns,
            aiFiltered: true,
            generated_at: new Date().toISOString()
        };
    } catch (error) {
        console.error('❌ Error generating recent changes data:', error);
        return {
            changes: [],
            aiFiltered: false,
            generated_at: new Date().toISOString(),
            error: error.message
        };
    }
}

/**
 * Generate monitoring runs (logs) data
 */
function generateMonitoringRunsData(db) {
    try {
        console.log('📝 Generating monitoring runs data...');
        
        const logs = db.prepare(`
            SELECT *
            FROM monitoring_runs
            ORDER BY created_at DESC
            LIMIT 100
        `).all();
        
        const processedLogs = logs.map(log => ({
            timestamp: log.created_at,
            type: log.status === 'success' ? 'success' : 'error',
            level: log.status === 'success' ? 'info' : 'error',
            message: log.summary || log.error_message || `${log.status} - ${log.url}`,
            company: log.company,
            url: log.url
        }));
        
        return {
            logs: processedLogs,
            aiEnhanced: true,
            generated_at: new Date().toISOString()
        };
    } catch (error) {
        console.error('❌ Error generating monitoring runs data:', error);
        return {
            logs: [],
            aiEnhanced: false,
            generated_at: new Date().toISOString(),
            error: error.message
        };
    }
}

/**
 * Main function to generate all static data files
 */
function generateAllStaticData() {
    console.log('🚀 Starting static data generation for GitHub Pages...');
    
    // Check if database exists
    if (!fs.existsSync(DB_PATH)) {
        console.log('⚠️ Database not found, creating sample data...');
        
        // Create sample data for when no database exists
        const sampleData = {
            stats: { companies: 0, urls: 0, snapshots: 0, lastCheck: new Date().toISOString() },
            company_activity: [],
            generated_at: new Date().toISOString(),
            backend: 'github-actions-static',
            status: 'No data yet - run baseline generation'
        };
        
        // Write sample files
        fs.writeFileSync(path.join(OUTPUT_DIR, 'dashboard.json'), JSON.stringify(sampleData, null, 2));
        fs.writeFileSync(path.join(OUTPUT_DIR, 'companies.json'), JSON.stringify({ companies: [] }, null, 2));
        fs.writeFileSync(path.join(OUTPUT_DIR, 'content-snapshots.json'), JSON.stringify({ extractedData: [] }, null, 2));
        fs.writeFileSync(path.join(OUTPUT_DIR, 'changes.json'), JSON.stringify({ changes: [] }, null, 2));
        fs.writeFileSync(path.join(OUTPUT_DIR, 'monitoring-runs.json'), JSON.stringify({ logs: [] }, null, 2));
        
        console.log('✅ Sample data files created');
        return;
    }
    
    try {
        // Open database
        const db = new Database(DB_PATH);
        db.pragma('journal_mode = WAL');
        
        // Generate each data file
        const files = [
            { name: 'dashboard.json', generator: generateDashboardData },
            { name: 'companies.json', generator: generateCompaniesData },
            { name: 'content-snapshots.json', generator: generateContentSnapshotsData },
            { name: 'changes.json', generator: generateRecentChangesData },
            { name: 'monitoring-runs.json', generator: generateMonitoringRunsData }
        ];
        
        for (const file of files) {
            console.log(`📝 Generating ${file.name}...`);
            const data = file.generator(db);
            const filePath = path.join(OUTPUT_DIR, file.name);
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
            console.log(`✅ Generated ${file.name} (${JSON.stringify(data).length} bytes)`);
        }
        
        // Create a status file
        const statusData = {
            generated_at: new Date().toISOString(),
            files_generated: files.length,
            database_path: DB_PATH,
            database_exists: true,
            backend_type: 'github-actions-static',
            version: '1.0.0'
        };
        
        fs.writeFileSync(path.join(OUTPUT_DIR, 'status.json'), JSON.stringify(statusData, null, 2));
        
        db.close();
        console.log('✅ All static data files generated successfully!');
        console.log(`📁 Files created in: ${OUTPUT_DIR}`);
        
    } catch (error) {
        console.error('❌ Error generating static data:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    generateAllStaticData();
}

module.exports = { generateAllStaticData };
