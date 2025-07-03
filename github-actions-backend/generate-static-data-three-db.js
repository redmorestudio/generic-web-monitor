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

// Helper function to deduplicate arrays by name property
function deduplicateByName(arr) {
    const seen = new Set();
    return arr.filter(item => {
        const key = item.name || JSON.stringify(item);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
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
                c.category,
                COUNT(DISTINCT u.id) as url_count,
                MAX(ba.created_at) as last_check
            FROM companies c
            LEFT JOIN urls u ON c.id = u.company_id
            LEFT JOIN baseline_analysis ba ON u.id = ba.url_id
            GROUP BY c.id, c.name, c.category
            ORDER BY c.name
        `).all();
        
        // Get URLs for each company
        const urlsStmt = intelligenceDb.prepare('SELECT url FROM urls WHERE company_id = ?');
        
        // Process company data
        const processedCompanies = companyActivity.map(company => {
            const urls = urlsStmt.all(company.id).map(row => row.url);
            return {
                company: company.company,
                type: company.category || 'competitor',
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
                c.category,
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
                type: company.category || 'competitor',
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
 * Generate company details data with full AI analysis
 */
function generateCompanyDetailsData(intelligenceDb) {
    try {
        console.log('🏢 Generating detailed company intelligence data...');
        
        const companies = intelligenceDb.prepare('SELECT id, name, category FROM companies').all();
        const companyDetails = {};
        
        for (const company of companies) {
            // Get latest baseline analysis for all company URLs
            const analyses = intelligenceDb.prepare(`
                SELECT 
                    ba.*,
                    u.url,
                    u.url_type
                FROM baseline_analysis ba
                JOIN urls u ON ba.url_id = u.id
                WHERE u.company_id = ?
                ORDER BY ba.created_at DESC
            `).all(company.id);
            
            // Initialize aggregated data structure
            const aggregated = {
                company_name: company.name,
                company_id: company.id,
                company_category: company.category,
                last_analyzed: analyses[0]?.created_at || null,
                urls_analyzed: analyses.length,
                
                // Core Entities
                products: [],
                technologies: [],
                integrations: [],
                partnerships: [],
                people: [],
                pricing: [],
                markets: [],
                competitors: [],
                
                // AI/ML Capabilities
                ai_ml_concepts: [],
                
                // Relationships
                relationships: [],
                
                // Strategic Intelligence
                current_state: {},
                strategic_intelligence: {},
                capabilities: {},
                
                // Quantitative Data
                metrics: [],
                benchmarks: [],
                kpis: [],
                claims: [],
                
                // Summary
                summary: {},
                relevance_score: 0
            };
            
            // Merge data from all URL analyses
            for (const analysis of analyses) {
                try {
                    const entities = JSON.parse(analysis.entities || '{}');
                    const relationships = JSON.parse(analysis.relationships || '[]');
                    const strategicIntel = JSON.parse(analysis.competitive_data || '{}');
                    const currentState = JSON.parse(analysis.semantic_categories || '{}');
                    const quantData = JSON.parse(analysis.quantitative_data || '{}');
                    const fullExtraction = JSON.parse(analysis.full_extraction || '{}');
                    
                    // Aggregate entities (arrays will be deduplicated later)
                    if (entities.products) aggregated.products.push(...entities.products);
                    if (entities.technologies) aggregated.technologies.push(...entities.technologies);
                    if (entities.integrations) aggregated.integrations.push(...entities.integrations);
                    if (entities.partnerships) aggregated.partnerships.push(...entities.partnerships);
                    if (entities.people) aggregated.people.push(...entities.people);
                    if (entities.pricing) aggregated.pricing.push(...entities.pricing);
                    if (entities.markets) aggregated.markets.push(...entities.markets);
                    if (entities.competitors) aggregated.competitors.push(...entities.competitors);
                    if (entities.ai_ml_concepts) aggregated.ai_ml_concepts.push(...entities.ai_ml_concepts);
                    
                    // Aggregate relationships
                    aggregated.relationships.push(...relationships);
                    
                    // Use highest relevance score
                    aggregated.relevance_score = Math.max(aggregated.relevance_score, analysis.relevance_score || 0);
                    
                    // Merge strategic intelligence (use latest/most complete)
                    if (strategicIntel && Object.keys(strategicIntel).length > 0) {
                        aggregated.strategic_intelligence = strategicIntel;
                    }
                    
                    // Merge current state and capabilities
                    aggregated.current_state = fullExtraction.current_state || currentState || aggregated.current_state;
                    aggregated.capabilities = fullExtraction.capabilities || aggregated.capabilities;
                    
                    // Aggregate quantitative data
                    if (quantData.metrics) aggregated.metrics.push(...quantData.metrics);
                    if (quantData.benchmarks) aggregated.benchmarks.push(...quantData.benchmarks);
                    if (quantData.kpis) aggregated.kpis.push(...quantData.kpis);
                    if (quantData.claims) aggregated.claims.push(...quantData.claims);
                    
                    // Use latest/best summary
                    if (fullExtraction.summary && Object.keys(fullExtraction.summary).length > 0) {
                        aggregated.summary = fullExtraction.summary;
                    }
                } catch (e) {
                    console.error(`Error parsing analysis for ${company.name}:`, e.message);
                }
            }
            
            // De-duplicate all arrays
            aggregated.products = deduplicateByName(aggregated.products);
            aggregated.technologies = deduplicateByName(aggregated.technologies);
            aggregated.integrations = deduplicateByName(aggregated.integrations);
            aggregated.partnerships = deduplicateByName(aggregated.partnerships);
            aggregated.people = deduplicateByName(aggregated.people);
            aggregated.pricing = deduplicateByName(aggregated.pricing);
            aggregated.markets = deduplicateByName(aggregated.markets);
            aggregated.competitors = deduplicateByName(aggregated.competitors);
            aggregated.ai_ml_concepts = deduplicateByName(aggregated.ai_ml_concepts);
            
            // De-duplicate relationships (by combination of from/to/type)
            const relSeen = new Set();
            aggregated.relationships = aggregated.relationships.filter(rel => {
                const key = `${rel.from}-${rel.to}-${rel.type}`;
                if (relSeen.has(key)) return false;
                relSeen.add(key);
                return true;
            });
            
            companyDetails[company.id] = aggregated;
        }
        
        return {
            companies: companyDetails,
            generated_at: new Date().toISOString(),
            total_companies: Object.keys(companyDetails).length
        };
    } catch (error) {
        console.error('❌ Error generating company details data:', error);
        return {
            companies: {},
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
                    mc.markdown_text,
                    intelligence.urls.url,
                    intelligence.urls.url_type as url_type,
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
                WHERE snapshot_id = ?
            `);
            
            const processedSnapshots = snapshots.map(snapshot => {
                // Get AI analysis
                const analysis = analysisStmt.get(snapshot.id);
                
                let keywords = [];
                let relevanceScore = 0;
                let aiProcessed = false;
                let category = 'uncategorized';
                let extractedEntities = {};
                
                if (analysis) {
                    relevanceScore = analysis.relevance_score || 0;
                    aiProcessed = true;
                    
                    try {
                        const semanticCategories = JSON.parse(analysis.semantic_categories || '{}');
                        category = semanticCategories.primary || 'uncategorized';
                        
                        const entities = JSON.parse(analysis.entities || '{}');
                        extractedEntities = entities;
                        
                        // Create rich keywords from all entity types
                        const keywordSources = [];
                        
                        if (entities.products) {
                            keywordSources.push(...entities.products.map(p => p.name));
                        }
                        if (entities.technologies) {
                            keywordSources.push(...entities.technologies.map(t => t.name));
                        }
                        if (entities.ai_ml_concepts) {
                            keywordSources.push(...entities.ai_ml_concepts.map(c => c.concept));
                        }
                        if (entities.partnerships) {
                            keywordSources.push(...entities.partnerships.map(p => p.partner_name));
                        }
                        if (entities.integrations) {
                            keywordSources.push(...entities.integrations.map(i => i.integration_name));
                        }
                        
                        // Get unique keywords, prioritize AI/ML concepts
                        keywords = [...new Set(keywordSources)].slice(0, 15); // More keywords
                    } catch (e) {
                        console.error('Error parsing entities:', e);
                    }
                }
                
                return {
                    id: snapshot.id.toString(),
                    url: snapshot.url,
                    company: snapshot.company,
                    type: snapshot.url_type || 'general',
                    title: snapshot.company + ' - ' + (snapshot.url_type || 'Page'),
                    relevance_score: relevanceScore,
                    keywords: keywords,  // Array, not JSON string
                    summary: analysis?.summary || 'No summary available',
                    extracted_at: snapshot.created_at,
                    entities: extractedEntities,  // Full entity data
                    content_length: snapshot.markdown_text ? snapshot.markdown_text.length : 0,
                    extractedContent: snapshot.markdown_text ? 
                        snapshot.markdown_text.substring(0, 500) + '...' : 'No content',
                    aiProcessed: aiProcessed,
                    category: category,
                    source: 'GitHub Actions Monitor',
                    // Add entity counts for quick reference
                    entity_counts: {
                        products: extractedEntities.products?.length || 0,
                        technologies: extractedEntities.technologies?.length || 0,
                        ai_ml_concepts: extractedEntities.ai_ml_concepts?.length || 0,
                        partnerships: extractedEntities.partnerships?.length || 0,
                        integrations: extractedEntities.integrations?.length || 0
                    }
                };
            });
            
            return {
                items: processedSnapshots,
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
            items: [],
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
        fs.writeFileSync(path.join(OUTPUT_DIR, 'extracted-data.json'), JSON.stringify({ items: [] }, null, 2));
        fs.writeFileSync(path.join(OUTPUT_DIR, 'changes.json'), JSON.stringify({ changes: [] }, null, 2));
        fs.writeFileSync(path.join(OUTPUT_DIR, 'monitoring-runs.json'), JSON.stringify({ logs: [] }, null, 2));
        fs.writeFileSync(path.join(OUTPUT_DIR, 'company-details.json'), JSON.stringify({ companies: {} }, null, 2));
        
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
            { name: 'extracted-data.json', generator: () => generateContentSnapshotsData(processedDb, intelligenceDb) },
            { name: 'changes.json', generator: () => generateRecentChangesData(processedDb, intelligenceDb) },
            { name: 'monitoring-runs.json', generator: generateMonitoringRunsData },
            { name: 'company-details.json', generator: () => generateCompanyDetailsData(intelligenceDb) }
        ];
        
        let aiAnalysisCount = 0;
        
        for (const file of files) {
            console.log(`📝 Generating ${file.name}...`);
            const data = file.generator();
            
            // Count AI-processed items
            if (file.name === 'extracted-data.json') {
                aiAnalysisCount = data.items ? data.items.filter(item => item.aiProcessed).length : 0;
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
