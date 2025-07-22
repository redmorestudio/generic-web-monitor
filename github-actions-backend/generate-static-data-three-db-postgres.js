#!/usr/bin/env node

// SSL Certificate fix for Heroku PostgreSQL
if (process.env.NODE_ENV === 'production' || process.env.POSTGRES_CONNECTION_STRING) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

/**
 * Generate Static Data Files for GitHub Pages (PostgreSQL Version) - FIXED
 * 
 * This script converts our dynamic API into static JSON files
 * that can be served by GitHub Pages and consumed by the frontend
 * 
 * FIXES:
 * - Proper company ID handling
 * - Eliminate duplicate changes
 * - Extract entities from JSONB properly
 * - Correct join logic
 */

const fs = require('fs');
const path = require('path');
const { db, end } = require('./postgres-db');

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

// Helper function to deduplicate preserving case
function deduplicatePreservingCase(arr) {
    const seen = new Map();
    return arr.filter(item => {
        const key = item.toLowerCase();
        if (!seen.has(key)) {
            seen.set(key, item);
            return true;
        }
        return false;
    });
}

// Helper function to get top entities for a company
async function getTopEntities(companyName, entityType, limit = 5) {
    try {
        // Get latest analysis for company from intelligence schema with JSONB
        const analyses = await db.all(`
            SELECT ba.entities
            FROM intelligence.baseline_analysis ba
            WHERE ba.company = $1
            AND ba.entities IS NOT NULL
            ORDER BY ba.analysis_date DESC
            LIMIT 10
        `, [companyName]);
        
        const allEntities = [];
        for (const analysis of analyses) {
            try {
                // Handle JSONB data properly
                const entities = analysis.entities;
                    
                if (entities && entities[entityType]) {
                    // Handle different entity types
                    if (entityType === 'technologies' || entityType === 'products') {
                        // These are arrays of objects with 'name' property
                        const items = Array.isArray(entities[entityType]) ? entities[entityType] : [];
                        allEntities.push(...items.map(e => e.name || e));
                    } else {
                        // Simple arrays
                        const items = Array.isArray(entities[entityType]) ? entities[entityType] : [];
                        allEntities.push(...items);
                    }
                }
            } catch (e) {
                console.error(`Error processing entities for ${companyName}:`, e);
            }
        }
        
        // Count occurrences and sort by frequency
        const entityCounts = {};
        allEntities.forEach(entity => {
            const key = (entity || '').toString().toLowerCase();
            if (key) {
                entityCounts[key] = (entityCounts[key] || 0) + 1;
            }
        });
        
        return Object.entries(entityCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([entity]) => entity);
            
    } catch (error) {
        console.error(`Error getting top entities for company ${companyName}:`, error);
        return [];
    }
}

// Generate dashboard.json - main dashboard data
async function generateDashboard() {
    console.log('📊 Generating dashboard data...');
    
    // Get all companies - FIXED: proper query
    const companies = await db.all(`
        SELECT c.id, c.name, c.category, ca.industry 
        FROM intelligence.companies c
        LEFT JOIN intelligence.company_attributes ca ON c.id = ca.company_id
        ORDER BY c.name
    `);
    
    const companyStats = [];
    
    for (const company of companies) {
        // Get URL count
        const urlCount = await db.get(`
            SELECT COUNT(*) as count 
            FROM intelligence.urls 
            WHERE company_id = $1
        `, [company.id]);
        
        // Get recent changes - FIXED: use distinct to avoid duplicates
        const changeCount = await db.get(`
            SELECT COUNT(DISTINCT cd.id) as count
            FROM processed_content.change_detection cd
            WHERE cd.company = $1
            AND cd.detected_at > NOW() - INTERVAL '7 days'
        `, [company.name]);
        
        // Get last scan time
        const lastScan = await db.get(`
            SELECT MAX(scraped_at) as last_scan
            FROM raw_content.scraped_pages
            WHERE company = $1
        `, [company.name]);
        
        // Get high interest changes
        const highInterest = await db.get(`
            SELECT COUNT(DISTINCT cd.id) as count
            FROM processed_content.change_detection cd
            WHERE cd.company = $1
            AND cd.interest_level >= 7
            AND cd.detected_at > NOW() - INTERVAL '30 days'
        `, [company.name]);
        
        // Get top entities - using company name
        const technologies = await getTopEntities(company.name, 'technologies');
        const products = await getTopEntities(company.name, 'products');
        
        companyStats.push({
            id: company.id,
            company: company.name,  // Use 'company' field as dashboard expects
            name: company.name,
            category: company.category,
            type: company.category,  // Dashboard also looks for 'type'
            industry: company.industry,
            url_count: urlCount.count,
            recent_changes: changeCount.count,
            high_interest_changes: highInterest.count,
            last_scan: lastScan.last_scan,
            intelligence: {  // Dashboard expects nested intelligence object
                interest_level: highInterest.count > 0 ? 8 : 5,
                interest_category: highInterest.count > 0 ? 'high' : 'medium',
                products: products,
                technologies: technologies,
                ai_ml_concepts: []
            }
        });
    }
    
    // Overall statistics
    const overallStats = await db.get(`
        SELECT 
            (SELECT COUNT(*) FROM intelligence.companies) as companies,
            (SELECT COUNT(*) FROM intelligence.urls) as urls,
            (SELECT COUNT(DISTINCT id) FROM processed_content.change_detection WHERE detected_at > NOW() - INTERVAL '24 hours') as changes_24h,
            (SELECT COUNT(DISTINCT id) FROM processed_content.change_detection WHERE detected_at > NOW() - INTERVAL '7 days') as changes_7d,
            (SELECT COUNT(DISTINCT id) FROM processed_content.change_detection WHERE interest_level >= 7 AND detected_at > NOW() - INTERVAL '7 days') as high_interest_7d,
            (SELECT COUNT(*) FROM raw_content.scraped_pages) as snapshots
    `);
    
    // Get recent changes for summary
    const recentChanges = await db.all(`
        SELECT DISTINCT ON (cd.id)
            cd.id,
            cd.company,
            cd.url,
            cd.url_name,
            cd.detected_at,
            cd.interest_level,
            cd.ai_analysis,
            sp.title
        FROM processed_content.change_detection cd
        LEFT JOIN raw_content.scraped_pages sp ON cd.new_hash = sp.content_hash
        WHERE cd.detected_at > NOW() - INTERVAL '7 days'
        ORDER BY cd.id, cd.detected_at DESC
        LIMIT 5
    `);
    
    // Format recent changes for dashboard
    const formattedChanges = recentChanges.map(change => {
        let analysis = {};
        try {
            analysis = change.ai_analysis || {};
        } catch (e) {}
        
        return {
            id: change.id,
            company: change.company,
            title: change.title || change.url_name,
            summary: analysis.summary || 'Content update detected',
            interest_level: change.interest_level,
            detected_at: change.detected_at,
            category: analysis.category || 'General Update',
            emoji: change.interest_level >= 7 ? '🌟' : '📌'
        };
    });
    
    return {
        company_activity: companyStats,  // Changed from 'companies' to match dashboard
        stats: overallStats,
        recent_changes_summary: {
            last_24h_count: parseInt(overallStats.changes_24h) || 0,
            last_7d_count: parseInt(overallStats.changes_7d) || 0,
            high_priority_count: parseInt(overallStats.high_interest_7d) || 0,
            last_5_changes: formattedChanges
        },
        last_updated: new Date().toISOString()
    };
}

// Generate companies.json - company list and metadata - FIXED
async function generateCompaniesData() {
    console.log('📁 Generating companies data...');
    
    const companies = await db.all(`
        SELECT 
            c.id, 
            c.name, 
            c.category,
            ca.industry
        FROM intelligence.companies c
        LEFT JOIN intelligence.company_attributes ca ON c.id = ca.company_id
        ORDER BY c.name
    `);
    
    return {
        companies: companies.map(company => ({
            id: company.id,
            name: company.name,
            category: company.category,
            industry: company.industry,
            // Note: Additional fields like focus_areas, description, etc. would need to be
            // added to the company_attributes table or stored elsewhere
            focus_areas: null,
            description: null,
            headquarters: null,
            founded: null,
            website: null,
            stock_symbol: null,
            employees: null,
            revenue: null,
            competitors: null,
            products: null,
            technologies: null,
            thebrain_thought_id: null
        })),
        generated_at: new Date().toISOString()
    };
}

// Generate changes.json - recent changes data - FIXED to avoid duplicates
async function generateRecentChangesData() {
    console.log('🔄 Generating recent changes data...');
    
    const changes = await db.all(`
        SELECT DISTINCT ON (cd.id)
            cd.id,
            cd.company,
            cd.url,
            cd.url_name,
            cd.detected_at,
            cd.interest_level,
            cd.ai_analysis,
            cd.before_hash,
            cd.new_hash,
            sp.title,
            SUBSTRING(sp.content, 1, 1000) as content_preview
        FROM processed_content.change_detection cd
        LEFT JOIN raw_content.scraped_pages sp ON cd.new_hash = sp.content_hash
        WHERE cd.detected_at > NOW() - INTERVAL '30 days'
        ORDER BY cd.id, cd.detected_at DESC
        LIMIT 500
    `);
    
    return {
        changes: changes.map(change => {
            let analysis = {};
            try {
                analysis = change.ai_analysis || {};
            } catch (e) {
                // Use defaults
            }
            
            return {
                id: change.id,
                company: change.company,
                url: change.url,
                url_name: change.url_name,
                detected_at: change.detected_at,
                interest_level: change.interest_level,
                relevance_score: change.interest_level, // For compatibility
                ai_analysis: analysis,
                title: change.title,
                summary: analysis.summary || (change.content_preview ? change.content_preview.substring(0, 200) + '...' : ''),
                category: analysis.category || 'General Update',
                impact_areas: analysis.impact_areas || [],
                before_hash: change.before_hash,
                after_hash: change.new_hash
            };
        }),
        generated_at: new Date().toISOString()
    };
}

// Generate extracted-data.json - content snapshots
async function generateContentSnapshotsData() {
    console.log('📸 Generating content snapshots data...');
    
    const snapshots = await db.all(`
        SELECT DISTINCT ON (sp.content_hash)
            sp.url,
            sp.company,
            sp.title,
            SUBSTRING(sp.content, 1, 2000) as content_preview,
            sp.scraped_at,
            sp.content_hash,
            cd.interest_level,
            cd.ai_analysis,
            u.company_id,
            sp.url_name
        FROM raw_content.scraped_pages sp
        LEFT JOIN processed_content.change_detection cd ON sp.content_hash = cd.new_hash
        LEFT JOIN intelligence.urls u ON sp.url = u.url
        WHERE sp.scraped_at > NOW() - INTERVAL '7 days'
        ORDER BY sp.content_hash, sp.scraped_at DESC
        LIMIT 200
    `);
    
    return {
        items: snapshots.map(snap => ({
            id: snap.content_hash,
            company: snap.company,
            url: snap.url,
            url_name: snap.url_name,
            title: snap.title,
            content_preview: snap.content_preview,
            scraped_at: snap.scraped_at,
            aiProcessed: !!snap.ai_analysis,
            interest_level: snap.interest_level || 0,
            content_hash: snap.content_hash
        })),
        generated_at: new Date().toISOString()
    };
}

// Generate monitoring-runs.json - scraping run history
async function generateMonitoringRunsData() {
    console.log('🏃 Generating monitoring runs data...');
    
    const runs = await db.all(`
        SELECT 
            sr.*,
            (SELECT COUNT(DISTINCT id) FROM processed_content.change_detection 
             WHERE detected_at >= sr.started_at AND detected_at <= sr.completed_at) as changes_detected
        FROM raw_content.scraping_runs sr
        WHERE sr.status = 'completed'
        ORDER BY sr.completed_at DESC
        LIMIT 50
    `);
    
    return {
        runs: runs.map(run => ({
            id: run.id,
            started_at: run.started_at,
            completed_at: run.completed_at,
            urls_processed: run.urls_processed,
            urls_changed: run.urls_changed,
            errors_count: run.errors_count || 0,
            changes_detected: run.changes_detected || 0,
            success_rate: run.urls_processed > 0 ? 
                ((run.urls_processed - (run.errors_count || 0)) / run.urls_processed * 100).toFixed(2) : 
                '0.00',
            duration_seconds: run.completed_at && run.started_at ? 
                Math.round((new Date(run.completed_at) - new Date(run.started_at)) / 1000) : 
                0
        })),
        generated_at: new Date().toISOString()
    };
}

// Generate company-details.json - detailed company data
async function generateCompanyDetailsData() {
    console.log('🏢 Generating company details data...');
    
    const companies = await db.all(`
        SELECT c.id, c.name FROM intelligence.companies c ORDER BY c.name
    `);
    
    const details = {};
    
    for (const company of companies) {
        // Get URLs
        const urls = await db.all(`
            SELECT * FROM intelligence.urls 
            WHERE company_id = $1
            ORDER BY url
        `, [company.id]);
        
        // Get recent change stats - FIXED with DISTINCT
        const recentStats = await db.get(`
            SELECT 
                COUNT(DISTINCT cd.id) as total_changes,
                COUNT(DISTINCT CASE WHEN cd.detected_at > NOW() - INTERVAL '7 days' THEN cd.id END) as changes_7d,
                COUNT(DISTINCT CASE WHEN cd.detected_at > NOW() - INTERVAL '30 days' THEN cd.id END) as changes_30d,
                MAX(cd.detected_at) as last_change,
                AVG(cd.interest_level) as avg_interest_level
            FROM processed_content.change_detection cd
            WHERE cd.company = $1
        `, [company.name]);
        
        // Get top insights
        const insights = await db.all(`
            SELECT * FROM intelligence.insights
            WHERE company_id = $1
            ORDER BY created_at DESC
            LIMIT 5
        `, [company.id]);
        
        details[company.name] = {
            id: company.id,
            name: company.name,
            urls: urls.map(url => ({
                id: url.id,
                url: url.url,
                name: url.url_type || url.url,  // Use url_type or fallback to url
                category: url.url_type,
                importance: null,  // Column doesn't exist
                check_frequency: url.scrape_frequency
            })),
            stats: {
                total_changes: recentStats.total_changes || 0,
                changes_7d: recentStats.changes_7d || 0,
                changes_30d: recentStats.changes_30d || 0,
                last_change: recentStats.last_change,
                avg_interest_level: recentStats.avg_interest_level ? 
                    parseFloat(recentStats.avg_interest_level).toFixed(2) : 
                    '0.00'
            },
            insights: insights.map(i => ({
                id: i.id,
                title: i.title,
                content: i.content,
                importance: i.importance,
                created_at: i.created_at
            }))
        };
    }
    
    return {
        companies: details,
        generated_at: new Date().toISOString()
    };
}

// Generate AI news items
async function generateAINews() {
    console.log('📰 Generating AI news...');
    
    // Get high-interest changes across all companies - FIXED with DISTINCT
    const changes = await db.all(`
        SELECT DISTINCT ON (cd.id)
            cd.id,
            cd.company,
            cd.url_name,
            cd.url,
            cd.detected_at,
            cd.interest_level,
            cd.ai_analysis,
            sp.title,
            SUBSTRING(sp.content, 1, 500) as content_preview
        FROM processed_content.change_detection cd
        JOIN raw_content.scraped_pages sp ON cd.new_hash = sp.content_hash
        WHERE cd.interest_level >= 6
        AND cd.detected_at > NOW() - INTERVAL '7 days'
        ORDER BY cd.id, cd.detected_at DESC
        LIMIT 20
    `);
    
    const news = changes.map(change => {
        let analysis = {};
        try {
            analysis = change.ai_analysis || {};
        } catch (e) {
            // Use defaults if JSON parsing fails
        }
        
        return {
            id: `${change.company}-${change.id}`,
            company: change.company,
            title: change.title || `Update on ${change.url_name}`,
            summary: analysis.summary || change.content_preview.substring(0, 200) + '...',
            category: analysis.category || 'General Update',
            interest_level: change.interest_level,
            impact_areas: analysis.impact_areas || [],
            url: change.url,
            date: change.detected_at
        };
    });
    
    return news;
}

// Generate individual company detail files
async function generateIndividualCompanyFiles(companyName) {
    console.log(`  📁 Generating data for ${companyName}...`);
    
    const company = await db.get(`
        SELECT c.id, c.name, c.category, c.interest_level, 
               c.created_at, c.updated_at,
               ca.industry
        FROM intelligence.companies c
        LEFT JOIN intelligence.company_attributes ca ON c.id = ca.company_id
        WHERE c.name = $1
    `, [companyName]);
    
    if (!company) {
        console.warn(`Company not found: ${companyName}`);
        return null;
    }
    
    // Get URLs
    const urls = await db.all(`
        SELECT * FROM intelligence.urls 
        WHERE company_id = $1
        ORDER BY url
    `, [company.id]);
    
    // Get recent changes with details - FIXED with DISTINCT
    const changes = await db.all(`
        SELECT DISTINCT ON (cd.id)
            cd.*,
            sp.title,
            SUBSTRING(sp.content, 1, 1000) as content_preview
        FROM processed_content.change_detection cd
        LEFT JOIN raw_content.scraped_pages sp ON cd.new_hash = sp.content_hash
        WHERE cd.company = $1
        ORDER BY cd.id, cd.detected_at DESC
        LIMIT 50
    `, [companyName]);
    
    // Process changes to add parsed AI analysis
    const processedChanges = changes.map(change => {
        let analysis = {};
        try {
            analysis = change.ai_analysis || {};
        } catch (e) {
            // Use defaults
        }
        
        return {
            ...change,
            ai_analysis: analysis,
            content_preview: change.content_preview
        };
    });
    
    // Get insights
    const insights = await db.all(`
        SELECT * FROM intelligence.insights
        WHERE company_id = $1
        ORDER BY created_at DESC
        LIMIT 10
    `, [company.id]);
    
    // Get aggregated stats - FIXED with DISTINCT
    const stats = await db.get(`
        SELECT 
            COUNT(DISTINCT cd.url) as monitored_urls,
            COUNT(DISTINCT cd.id) as total_changes,
            COUNT(DISTINCT CASE WHEN cd.interest_level >= 7 THEN cd.id END) as high_interest_changes,
            COUNT(DISTINCT CASE WHEN cd.detected_at > NOW() - INTERVAL '7 days' THEN cd.id END) as changes_last_week,
            AVG(cd.interest_level) as avg_interest_level
        FROM processed_content.change_detection cd
        WHERE cd.company = $1
    `, [companyName]);
    
    // Get entities from latest analyses in intelligence schema
    const latestAnalyses = await db.all(`
        SELECT ba.entities, ba.themes, ba.key_points
        FROM intelligence.baseline_analysis ba
        WHERE ba.company = $1
        ORDER BY ba.analysis_date DESC
        LIMIT 10
    `, [companyName]);
    
    // Aggregate entities and themes
    const allTechnologies = [];
    const allProducts = [];
    const allThemes = [];
    const allKeyPoints = [];
    
    for (const analysis of latestAnalyses) {
        try {
            // Parse JSONB entities
            if (analysis.entities) {
                const entities = analysis.entities;
                    
                if (entities.technologies) {
                    const techNames = entities.technologies.map(t => t.name || t);
                    allTechnologies.push(...techNames);
                }
                if (entities.products) {
                    const productNames = entities.products.map(p => p.name || p);
                    allProducts.push(...productNames);
                }
            }
            
            // Parse JSONB themes
            if (analysis.themes) {
                const themes = Array.isArray(analysis.themes) ? analysis.themes : [];
                allThemes.push(...themes);
            }
            
            // Parse JSONB key_points
            if (analysis.key_points) {
                const keyPoints = Array.isArray(analysis.key_points) ? analysis.key_points : [];
                allKeyPoints.push(...keyPoints);
            }
        } catch (e) {
            console.error(`Error parsing analysis data: ${e.message}`);
            // Skip invalid JSON
        }
    }
    
    // Deduplicate and get top items
    const topTechnologies = deduplicatePreservingCase(allTechnologies).slice(0, 20);
    const topProducts = deduplicatePreservingCase(allProducts).slice(0, 20);
    const topThemes = deduplicateByName(allThemes).slice(0, 10);
    const recentKeyPoints = deduplicateByName(allKeyPoints).slice(0, 15);
    
    return {
        company: {
            ...company,
            urls: urls
        },
        stats: stats,
        changes: processedChanges,
        insights: insights,
        entities: {
            technologies: topTechnologies,
            products: topProducts
        },
        themes: topThemes,
        key_points: recentKeyPoints,
        last_updated: new Date().toISOString()
    };
}

// Main generation function
async function generateAllData() {
    console.log('🚀 Static Data Generator for PostgreSQL (FIXED VERSION)');
    console.log('=' .repeat(60));
    
    try {
        // Generate all files matching SQLite structure
        const files = [
            { name: 'dashboard.json', generator: generateDashboard },
            { name: 'companies.json', generator: generateCompaniesData },
            { name: 'extracted-data.json', generator: generateContentSnapshotsData },
            { name: 'changes.json', generator: generateRecentChangesData },
            { name: 'monitoring-runs.json', generator: generateMonitoringRunsData },
            { name: 'company-details.json', generator: generateCompanyDetailsData }
        ];
        
        for (const file of files) {
            console.log(`\n📝 Generating ${file.name}...`);
            const data = await file.generator();
            fs.writeFileSync(
                path.join(OUTPUT_DIR, file.name),
                JSON.stringify(data, null, 2)
            );
            console.log(`✅ Generated ${file.name} (${JSON.stringify(data).length} bytes)`);
        }
        
        // Also generate new features (bonus)
        console.log('\n📰 Generating bonus files...');
        
        // AI News
        const news = await generateAINews();
        fs.writeFileSync(
            path.join(OUTPUT_DIR, 'ai-news.json'),
            JSON.stringify({ news, last_updated: new Date().toISOString() }, null, 2)
        );
        console.log('✅ Generated ai-news.json');
        
        // Generate individual company files (in subdirectory)
        console.log('\n📁 Generating individual company files...');
        const companies = await db.all(`
            SELECT name FROM intelligence.companies 
            ORDER BY name
        `);
        
        const companiesDir = path.join(OUTPUT_DIR, 'companies');
        if (!fs.existsSync(companiesDir)) {
            fs.mkdirSync(companiesDir, { recursive: true });
        }
        
        for (const company of companies) {
            const details = await generateIndividualCompanyFiles(company.name);
            if (details) {
                const filename = company.name.toLowerCase().replace(/\s+/g, '-') + '.json';
                fs.writeFileSync(
                    path.join(companiesDir, filename),
                    JSON.stringify(details, null, 2)
                );
            }
        }
        
        console.log(`✅ Generated ${companies.length} individual company files`);
        
        // Generate manifest for all files
        const manifest = {
            version: '2.1',
            backend: 'postgresql',
            compatible_with: 'sqlite-dashboard',
            generated_at: new Date().toISOString(),
            fixes_applied: [
                'proper_company_ids',
                'eliminate_duplicates',
                'extract_jsonb_entities',
                'correct_join_logic'
            ],
            files: {
                core: files.map(f => f.name),
                bonus: ['ai-news.json'],
                companies: companies.map(c => `companies/${c.name.toLowerCase().replace(/\s+/g, '-')}.json`)
            }
        };
        
        fs.writeFileSync(
            path.join(OUTPUT_DIR, 'manifest.json'),
            JSON.stringify(manifest, null, 2)
        );
        console.log('✅ Generated manifest.json');
        
        // Status file
        fs.writeFileSync(
            path.join(OUTPUT_DIR, 'status.json'),
            JSON.stringify({
                generated_at: new Date().toISOString(),
                backend: 'postgresql',
                files_generated: files.length + 2 + companies.length,
                compatible_with_dashboard: true,
                fixes_applied: true
            }, null, 2)
        );
        
        console.log('\n✨ All static data generated successfully!');
        console.log('📊 Dashboard-compatible files created in:', OUTPUT_DIR);
        
    } catch (error) {
        console.error('❌ Error generating static data:', error);
        process.exit(1);
    } finally {
        await end(); // Close PostgreSQL connection pool
    }
}

// Run the generator
generateAllData().catch(console.error);
