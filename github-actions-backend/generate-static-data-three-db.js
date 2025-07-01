#!/usr/bin/env node

/**
 * Generate Static Data Files for GitHub Pages
 * 
 * This script converts our dynamic API into static JSON files
 * that can be served by GitHub Pages and consumed by the frontend
 */

const fs = require('fs');
const path = require('path');
const dbManager = require('./db-manager');

// Configuration
const DATA_DIR = path.join(__dirname, 'data');
const OUTPUT_DIR = path.join(__dirname, '..', 'api-data');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Generate dashboard data
 */
function generateDashboardData(intelligenceDb) {
    try {
        console.log('📊 Generating dashboard data...');
        
        // Get stats
        const stats = {
            companies: intelligenceDb.prepare('SELECT COUNT(*) as count FROM companies').get()?.count || 0,
            urls: intelligenceDb.prepare('SELECT COUNT(*) as count FROM urls').get()?.count || 0,
            snapshots: intelligenceDb.prepare('SELECT COUNT(*) as count FROM baseline_analysis').get()?.count || 0,
            lastCheck: new Date().toISOString()
        };
        
        // Get company activity
        const companyActivity = intelligenceDb.prepare(`
            SELECT 
                c.id,
                c.name as company,
                c.type,
                COUNT(DISTINCT u.id) as url_count,
                MAX(ba.created_at) as last_check
            FROM companies c
            LEFT JOIN urls u ON c.id = u.company_id
            LEFT JOIN baseline_analysis ba ON u.id = ba.url_id
            GROUP BY c.id, c.name, c.type
            ORDER BY c.name
        `).all();
        
        // Get URLs for each company
        const urlsStmt = intelligenceDb.prepare('SELECT url FROM urls WHERE company_id = ?');
        
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
            backend: 'github-actions-static-three-db'
        };
        
        return dashboardData;
    } catch (error) {
        console.error('❌ Error generating dashboard data:', error);
        return {
            stats: { companies: 0, urls: 0, snapshots: 0, lastCheck: new Date().toISOString() },
            company_activity: [],
            generated_at: new Date().toISOString(),
            backend: 'github-actions-static-three-db',
            error: error.message
        };
    }
}

/**
 * Generate companies data
 */
function generateCompaniesData(intelligenceDb) {
    try {
        console.log('🏢 Generating companies data...');
        
        const companies = intelligenceDb.prepare(`
            SELECT 
                c.id,
                c.name as company,
                c.type,
                c.created_at
            FROM companies c
            ORDER BY c.name
        `).all();
        
        // Get URLs for each company
        const urlsStmt = intelligenceDb.prepare('SELECT url FROM urls WHERE company_id = ?');
        
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
function generateContentSnapshotsData(processedDb, intelligenceDb) {
    try {
        console.log('📄 Generating content snapshots data with AI analysis...');
        
        // FIXED: Attach intelligence database for cross-database queries
        const intelligenceDbPath = path.join(DATA_DIR, 'intelligence.db');
        processedDb.exec(`ATTACH DATABASE '${intelligenceDbPath}' AS intelligence`);
        
        try {
            // Get latest content with AI analysis data
            const snapshots = processedDb.prepare(`
                SELECT 
                    mc.id,
                    mc.url_id,
                    mc.processed_at as created_at,
                    mc.markdown_content,
                    intelligence.urls.url,
                    intelligence.urls.type as url_type,
                    intelligence.companies.name as company,
                    intelligence.companies.id as company_id
                FROM markdown_content mc
                JOIN intelligence.urls ON mc.url_id = intelligence.urls.id
                JOIN intelligence.companies ON intelligence.urls.company_id = intelligence.companies.id
                WHERE mc.id IN (
                    SELECT MAX(id) 
                    FROM markdown_content 
                    GROUP BY url_id
                )
                ORDER BY mc.processed_at DESC
                LIMIT 100
            `).all();
            
            // Get AI analysis for each snapshot
            const analysisStmt = intelligenceDb.prepare(`
                SELECT relevance_score, summary, semantic_categories, entities
                FROM baseline_analysis
                WHERE content_id = ?
            `);
            
            const processedSnapshots = snapshots.map(snapshot => {
                // Get AI analysis
                const analysis = analysisStmt.get(snapshot.id);
                
                let keywords = [];
                let relevanceScore = 0;
                let aiProcessed = false;
                let category = 'uncategorized';
                
                if (analysis) {
                    relevanceScore = analysis.relevance_score || 0;
                    aiProcessed = true;
                    
                    try {
                        const semanticCategories = JSON.parse(analysis.semantic_categories || '{}');
                        category = semanticCategories.primary || 'uncategorized';
                        
                        const entities = JSON.parse(analysis.entities || '{}');
                        // Extract keywords from entities
                        if (entities.technologies) {
                            keywords = keywords.concat(entities.technologies.map(t => t.name));
                        }
                        if (entities.products) {
                            keywords = keywords.concat(entities.products.map(p => p.name));
                        }
                        keywords = [...new Set(keywords)].slice(0, 10); // Unique keywords, max 10
                    } catch (e) {
                        // Ignore parsing errors
                    }
                }
                
                return {
                    id: snapshot.id,
                    url: snapshot.url,
                    company: snapshot.company,
                    type: snapshot.url_type || 'general',
                    timestamp: snapshot.created_at,
                    content_length: snapshot.markdown_content ? snapshot.markdown_content.length : 0,
                    extractedContent: snapshot.markdown_content ? 
                        snapshot.markdown_content.substring(0, 500) + '...' : 'No content',
                    relevanceScore: relevanceScore,
                    keywords: JSON.stringify(keywords),
                    aiProcessed: aiProcessed,
                    category: category,
                    summary: analysis?.summary || '',
                    source: 'GitHub Actions Monitor'
                };
            });
            
            return {
                extractedData: processedSnapshots,
                totalUnfiltered: snapshots.length,
                generated_at: new Date().toISOString()
            };
        } finally {
            // Always detach the database
            processedDb.exec('DETACH DATABASE intelligence');
        }
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
function generateRecentChangesData(processedDb, intelligenceDb) {
    try {
        console.log('📈 Generating recent changes data with AI analysis...');
        
        // FIXED: Attach intelligence database for cross-database queries
        const intelligenceDbPath = path.join(DATA_DIR, 'intelligence.db');
        processedDb.exec(`ATTACH DATABASE '${intelligenceDbPath}' AS intelligence`);
        
        try {
            // Get recent changes
            const recentChanges = processedDb.prepare(`
                SELECT 
                    cd.id,
                    cd.detected_at as created_at,
                    cd.change_type,
                    cd.summary,
                    intelligence.urls.url,
                    intelligence.companies.name as company,
                    cd.new_content_id
                FROM change_detection cd
                JOIN intelligence.urls ON cd.url_id = intelligence.urls.id
                JOIN intelligence.companies ON intelligence.urls.company_id = intelligence.companies.id
                WHERE cd.detected_at > datetime('now', '-30 days')
                ORDER BY cd.detected_at DESC
                LIMIT 100
            `).all();
            
            // Get AI analysis for changes
            const analysisStmt = intelligenceDb.prepare(`
                SELECT relevance_score, summary, competitive_data, extracted_text
                FROM enhanced_analysis
                WHERE change_id = ?
            `);
            
            const processedChanges = recentChanges.map(change => {
                const analysis = analysisStmt.get(change.id);
                
                let threats = [];
                let opportunities = [];
                let relevanceScore = 0;
                let aiSummary = change.summary || 'No AI analysis available';
                
                if (analysis) {
                    relevanceScore = analysis.relevance_score || 0;
                    aiSummary = analysis.summary || aiSummary;
                    
                    try {
                        const competitiveData = JSON.parse(analysis.competitive_data || '{}');
                        threats = competitiveData.strategic_implications || [];
                        opportunities = competitiveData.recommended_actions || [];
                    } catch (e) {
                        // Ignore parsing errors
                    }
                }
                
                return {
                    id: change.id,
                    url: change.url,
                    company: change.company,
                    change_percentage: 0, // Not tracked in new schema
                    relevance_score: relevanceScore,
                    summary: aiSummary,
                    category: change.change_type || 'content_change',
                    keywords_found: '[]',
                    created_at: change.created_at,
                    ai_processed: !!analysis,
                    threats: threats,
                    opportunities: opportunities
                };
            });
            
            return {
                changes: processedChanges,
                aiFiltered: true,
                generated_at: new Date().toISOString()
            };
        } finally {
            // Always detach the database
            processedDb.exec('DETACH DATABASE intelligence');
        }
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
function generateMonitoringRunsData() {
    try {
        console.log('📝 Generating monitoring runs data...');
        
        // For three-database architecture, we'll generate synthetic logs
        // based on the workflow runs
        const logs = [
            {
                timestamp: new Date().toISOString(),
                type: 'success',
                level: 'info',
                message: 'Static data generation completed - 🤖 AI Enhanced',
                details: {
                    run_type: 'generate_static',
                    architecture: 'three-database'
                }
            }
        ];
        
        return {
            logs: logs,
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
    console.log('📊 Using three-database architecture...');
    
    // Check if three-database architecture exists
    if (!dbManager.hasThreeDbArchitecture()) {
        console.log('⚠️ Three-database architecture not found, creating sample data...');
        
        // Create sample data for when no database exists
        const sampleData = {
            stats: { companies: 0, urls: 0, snapshots: 0, lastCheck: new Date().toISOString() },
            company_activity: [],
            generated_at: new Date().toISOString(),
            backend: 'github-actions-static-three-db',
            status: 'No data yet - run scraper and analyzer first'
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
        // Get database connections
        const processedDb = dbManager.getProcessedDb();
        const intelligenceDb = dbManager.getIntelligenceDb();
        
        // Generate each data file
        const files = [
            { name: 'dashboard.json', generator: () => generateDashboardData(intelligenceDb) },
            { name: 'companies.json', generator: () => generateCompaniesData(intelligenceDb) },
            { name: 'content-snapshots.json', generator: () => generateContentSnapshotsData(processedDb, intelligenceDb) },
            { name: 'changes.json', generator: () => generateRecentChangesData(processedDb, intelligenceDb) },
            { name: 'monitoring-runs.json', generator: generateMonitoringRunsData }
        ];
        
        let aiAnalysisCount = 0;
        
        for (const file of files) {
            console.log(`📝 Generating ${file.name}...`);
            const data = file.generator();
            
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
            architecture: 'three-database',
            database_info: dbManager.getDatabaseInfo(),
            backend_type: 'github-actions-static-three-db',
            version: '2.0.0',
            ai_analysis: {
                enabled: true,
                processed_items: aiAnalysisCount
            }
        };
        
        fs.writeFileSync(path.join(OUTPUT_DIR, 'status.json'), JSON.stringify(statusData, null, 2));
        
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
