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
            companies: db.prepare('SELECT COUNT(*) as count FROM companies').get()?.count || 0,
            urls: db.prepare('SELECT COUNT(*) as count FROM urls').get()?.count || 0,
            snapshots: db.prepare('SELECT COUNT(*) as count FROM content_snapshots').get()?.count || 0,
            lastCheck: new Date().toISOString()
        };
        
        // Get company activity
        const companyActivity = db.prepare(`
            SELECT 
                c.id,
                c.name as company,
                c.type,
                COUNT(u.id) as url_count,
                MAX(cs.created_at) as last_check
            FROM companies c
            LEFT JOIN urls u ON c.id = u.company_id
            LEFT JOIN content_snapshots cs ON u.id = cs.url_id
            GROUP BY c.id, c.name, c.type
            ORDER BY c.name
        `).all();
        
        // Get URLs for each company
        const urlsStmt = db.prepare('SELECT url FROM urls WHERE company_id = ?');
        
        // Process company data
        const processedCompanies = companyActivity.map(company => {
            const urls = urlsStmt.all(company.id).map(row => row.url);
            return {
                company: company.company,
                type: company.type || 'competitor',
                url_count: company.url_count || 0,
                last_check: company.last_check,
                urls: urls
            };
        });
        
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
                c.id,
                c.name as company,
                c.type,
                c.created_at
            FROM companies c
            ORDER BY c.name
        `).all();
        
        // Get URLs for each company
        const urlsStmt = db.prepare('SELECT url FROM urls WHERE company_id = ?');
        
        const processedCompanies = companies.map(company => {
            const urls = urlsStmt.all(company.id).map(row => row.url);
            return {
                company: company.company,
                type: company.type || 'competitor',
                created_at: company.created_at,
                urls: urls
            };
        });
        
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
 * Generate content snapshots data with AI analysis
 */
function generateContentSnapshotsData(db) {
    try {
        console.log('📄 Generating content snapshots data with AI analysis...');
        
        // Get snapshots with AI analysis data
        const snapshots = db.prepare(`
            SELECT 
                cs.*,
                u.url,
                u.type as url_type,
                c.name as company,
                aa.relevance_score,
                aa.summary,
                aa.category,
                aa.raw_response
            FROM content_snapshots cs
            JOIN urls u ON cs.url_id = u.id
            JOIN companies c ON u.company_id = c.id
            LEFT JOIN changes ch ON ch.new_snapshot_id = cs.id
            LEFT JOIN ai_analysis aa ON ch.id = aa.change_id
            ORDER BY cs.created_at DESC
            LIMIT 100
        `).all();
        
        const processedSnapshots = snapshots.map(snapshot => {
            // Extract keywords from AI analysis if available
            let keywords = [];
            let relevanceScore = 0;
            let aiProcessed = false;
            
            if (snapshot.raw_response) {
                try {
                    const aiData = JSON.parse(snapshot.raw_response);
                    
                    // Extract keywords from entities
                    if (aiData.entities) {
                        const allKeywords = [];
                        
                        // Add high-confidence entities as keywords
                        ['technologies', 'companies', 'products', 'topics'].forEach(category => {
                            if (aiData.entities[category]) {
                                aiData.entities[category].forEach(item => {
                                    if (item.confidence === 'HIGH' || item.confidence === 'MEDIUM') {
                                        allKeywords.push(item.name);
                                    }
                                });
                            }
                        });
                        
                        keywords = [...new Set(allKeywords)].slice(0, 10); // Unique keywords, max 10
                    }
                    
                    relevanceScore = snapshot.relevance_score || 
                                   aiData.summary?.scores?.overall_relevance || 0;
                    aiProcessed = true;
                    
                } catch (e) {
                    console.log('Failed to parse AI data for snapshot', snapshot.id);
                }
            }
            
            return {
                id: snapshot.id,
                url: snapshot.url,
                company: snapshot.company,
                type: snapshot.url_type || 'general',
                timestamp: snapshot.created_at,
                content_length: snapshot.extracted_content ? snapshot.extracted_content.length : 0,
                extractedContent: snapshot.extracted_content ? 
                    snapshot.extracted_content.substring(0, 500) + '...' : 'No content',
                relevanceScore: relevanceScore,
                keywords: JSON.stringify(keywords),
                aiProcessed: aiProcessed,
                category: snapshot.category || 'uncategorized',
                summary: snapshot.summary || '',
                source: 'GitHub Actions Monitor'
            };
        });
        
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
 * Generate recent changes data with enhanced AI analysis
 */
function generateRecentChangesData(db) {
    try {
        console.log('📈 Generating recent changes data with AI analysis...');
        
        // Get recent changes with AI analysis
        const recentChanges = db.prepare(`
            SELECT 
                ch.id,
                ch.created_at,
                ch.change_percentage,
                ch.keywords_found,
                u.url,
                c.name as company,
                aa.relevance_score,
                aa.summary,
                aa.category,
                aa.competitive_threats,
                aa.strategic_opportunities,
                aa.raw_response
            FROM changes ch
            JOIN urls u ON ch.url_id = u.id
            JOIN companies c ON u.company_id = c.id
            LEFT JOIN ai_analysis aa ON ch.id = aa.change_id
            WHERE ch.created_at > datetime('now', '-30 days')
            ORDER BY ch.created_at DESC
            LIMIT 100
        `).all();
        
        const processedChanges = recentChanges.map(change => {
            let threats = [];
            let opportunities = [];
            
            // Parse competitive threats and opportunities
            try {
                if (change.competitive_threats) {
                    threats = JSON.parse(change.competitive_threats);
                }
                if (change.strategic_opportunities) {
                    opportunities = JSON.parse(change.strategic_opportunities);
                }
            } catch (e) {
                // Ignore parsing errors
            }
            
            return {
                id: change.id,
                url: change.url,
                company: change.company,
                change_percentage: change.change_percentage || 0,
                relevance_score: change.relevance_score || 0,
                summary: change.summary || 'No AI analysis available',
                category: change.category || 'uncategorized',
                keywords_found: change.keywords_found || '[]',
                created_at: change.created_at,
                ai_processed: !!change.relevance_score,
                threats: threats,
                opportunities: opportunities
            };
        });
        
        return {
            changes: processedChanges,
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
            ORDER BY started_at DESC
            LIMIT 100
        `).all();
        
        const processedLogs = logs.map(log => ({
            timestamp: log.started_at,
            type: log.status === 'completed' ? 'success' : 'error',
            level: log.status === 'completed' ? 'info' : 'error',
            message: `${log.run_type} - ${log.status}` + 
                    (log.changes_detected ? ` - ${log.changes_detected} changes detected` : '') +
                    (log.run_type === 'ai_analysis' ? ' - 🤖 AI Enhanced' : ''),
            details: {
                run_type: log.run_type,
                urls_checked: log.urls_checked,
                changes_detected: log.changes_detected,
                errors: log.errors
            }
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
    console.log('📊 Including AI analysis data for enhanced insights...');
    
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
        
        let aiAnalysisCount = 0;
        
        for (const file of files) {
            console.log(`📝 Generating ${file.name}...`);
            const data = file.generator(db);
            
            // Count AI-processed items
            if (file.name === 'content-snapshots.json') {
                aiAnalysisCount = data.extractedData.filter(item => item.aiProcessed).length;
            }
            
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
            version: '1.0.0',
            ai_analysis: {
                enabled: true,
                processed_items: aiAnalysisCount
            }
        };
        
        fs.writeFileSync(path.join(OUTPUT_DIR, 'status.json'), JSON.stringify(statusData, null, 2));
        
        db.close();
        console.log('✅ All static data files generated successfully!');
        console.log(`📁 Files created in: ${OUTPUT_DIR}`);
        console.log(`🤖 AI-processed items: ${aiAnalysisCount}`);
        
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
