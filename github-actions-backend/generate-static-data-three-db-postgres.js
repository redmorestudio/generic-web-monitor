#!/usr/bin/env node

// SSL Certificate fix for Heroku PostgreSQL
if (process.env.NODE_ENV === 'production' || process.env.POSTGRES_CONNECTION_STRING) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

/**
 * Generate Static Data Files for GitHub Pages (PostgreSQL Version)
 * 
 * This script converts our dynamic API into static JSON files
 * that can be served by GitHub Pages and consumed by the frontend
 * 
 * Updated to match SQLite output format for dashboard compatibility
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
async function getTopEntities(companyId, entityType, limit = 3) {
    try {
        // Get latest analysis for company
        const analyses = await db.all(`
            SELECT ba.entities
            FROM processed_content.baseline_analysis ba
            JOIN intelligence.company_urls u ON ba.url_id = u.id
            WHERE u.company_id = $1
            ORDER BY ba.created_at DESC
            LIMIT 5
        `, [companyId]);
        
        const allEntities = [];
        for (const analysis of analyses) {
            try {
                const entities = JSON.parse(analysis.entities);
                if (entities && entities[entityType]) {
                    allEntities.push(...entities[entityType]);
                }
            } catch (e) {
                // Skip invalid JSON
            }
        }
        
        // Count occurrences and sort by frequency
        const entityCounts = {};
        allEntities.forEach(entity => {
            const key = entity.toLowerCase();
            entityCounts[key] = (entityCounts[key] || 0) + 1;
        });
        
        return Object.entries(entityCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([entity]) => entity);
            
    } catch (error) {
        console.error(`Error getting top entities for company ${companyId}:`, error);
        return [];
    }
}

// Generate AI news items (keeping this new feature)
async function generateAINews() {
    console.log('📰 Generating AI news...');
    
    // Get high-interest changes across all companies
    const changes = await db.all(`
        SELECT 
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
        ORDER BY cd.detected_at DESC
        LIMIT 20
    `);
    
    const news = changes.map(change => {
        let analysis = {};
        try {
            analysis = change.ai_analysis ? JSON.parse(change.ai_analysis) : {};
        } catch (e) {
            // Use defaults if JSON parsing fails
        }
        
        return {
            id: `${change.company}-${new Date(change.detected_at).getTime()}`,
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

// Generate dashboard.json - main dashboard data
async function generateDashboard() {
    console.log('📊 Generating dashboard data...');
    
    // Get all companies
    const companies = await db.all(`
        SELECT c.*, ca.industry 
        FROM intelligence.companies c
        LEFT JOIN intelligence.company_attributes ca ON c.id = ca.company_id
        ORDER BY c.name
    `);
    
    const companyStats = [];
    
    for (const company of companies) {
        // Get URL count
        const urlCount = await db.get(`
            SELECT COUNT(*) as count 
            FROM intelligence.company_urls 
            WHERE company_id = $1
        `, [company.id]);
        
        // Get recent changes
        const changeCount = await db.get(`
            SELECT COUNT(*) as count
            FROM processed_content.change_detection
            WHERE company = $1
            AND detected_at > NOW() - INTERVAL '7 days'
        `, [company.name]);
        
        // Get last scan time
        const lastScan = await db.get(`
            SELECT MAX(scraped_at) as last_scan
            FROM raw_content.scraped_pages
            WHERE company = $1
        `, [company.name]);
        
        // Get high interest changes
        const highInterest = await db.get(`
            SELECT COUNT(*) as count
            FROM processed_content.change_detection
            WHERE company = $1
            AND interest_level >= 7
            AND detected_at > NOW() - INTERVAL '30 days'
        `, [company.name]);
        
        // Get top entities
        const technologies = await getTopEntities(company.id, 'technologies');
        const products = await getTopEntities(company.id, 'products');
        
        companyStats.push({
            id: company.id,
            name: company.name,
            category: company.category,
            industry: company.industry,
            url_count: urlCount.count,
            recent_changes: changeCount.count,
            high_interest_changes: highInterest.count,
            last_scan: lastScan.last_scan,
            top_technologies: technologies,
            top_products: products
        });
    }
    
    // Overall statistics
    const overallStats = await db.get(`
        SELECT 
            (SELECT COUNT(*) FROM intelligence.companies) as total_companies,
            (SELECT COUNT(*) FROM intelligence.company_urls) as total_urls,
            (SELECT COUNT(*) FROM processed_content.change_detection WHERE detected_at > NOW() - INTERVAL '24 hours') as changes_24h,
            (SELECT COUNT(*) FROM processed_content.change_detection WHERE detected_at > NOW() - INTERVAL '7 days') as changes_7d,
            (SELECT COUNT(*) FROM processed_content.change_detection WHERE interest_level >= 7 AND detected_at > NOW() - INTERVAL '7 days') as high_interest_7d
    `);
    
    return {
        companies: companyStats,
        stats: overallStats,
        last_updated: new Date().toISOString()
    };
}

// Generate companies.json - company list and metadata
async function generateCompaniesData() {
    console.log('📁 Generating companies data...');
    
    const companies = await db.all(`
        SELECT c.*, ca.* 
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
            focus_areas: company.focus_areas,
            description: company.description,
            headquarters: company.headquarters,
            founded: company.founded,
            website: company.website,
            stock_symbol: company.stock_symbol,
            employees: company.employees,
            revenue: company.revenue,
            competitors: company.competitors,
            products: company.products,
            technologies: company.technologies,
            thebrain_thought_id: company.thebrain_thought_id
        })),
        generated_at: new Date().toISOString()
    };
}

// Generate changes.json - recent changes data
async function generateRecentChangesData() {
    console.log('🔄 Generating recent changes data...');
    
    const changes = await db.all(`
        SELECT 
            cd.*,
            sp.title,
            SUBSTRING(sp.content, 1, 1000) as content_preview
        FROM processed_content.change_detection cd
        LEFT JOIN raw_content.scraped_pages sp ON cd.new_hash = sp.content_hash
        WHERE cd.detected_at > NOW() - INTERVAL '30 days'
        ORDER BY cd.detected_at DESC
        LIMIT 500
    `);
    
    return {
        changes: changes.map(change => {
            let analysis = {};
            try {
                analysis = change.ai_analysis ? JSON.parse(change.ai_analysis) : {};
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
        SELECT 
            sp.url,
            sp.company,
            sp.title,
            SUBSTRING(sp.content, 1, 2000) as content_preview,
            sp.scraped_at,
            sp.content_hash,
            cd.interest_level,
            cd.ai_analysis,
            u.company_id,
            u.name as url_name
        FROM raw_content.scraped_pages sp
        LEFT JOIN processed_content.change_detection cd ON sp.content_hash = cd.new_hash
        JOIN intelligence.company_urls u ON sp.url = u.url
        WHERE sp.scraped_at > NOW() - INTERVAL '7 days'
        ORDER BY sp.scraped_at DESC
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
            (SELECT COUNT(*) FROM processed_content.change_detection 
             WHERE detected_at >= sr.started_at AND detected_at <= sr.completed_at) as changes_detected
        FROM raw_content.scrape_runs sr
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
            SELECT * FROM intelligence.company_urls 
            WHERE company_id = $1
            ORDER BY name
        `, [company.id]);
        
        // Get recent change stats
        const recentStats = await db.get(`
            SELECT 
                COUNT(*) as total_changes,
                COUNT(CASE WHEN detected_at > NOW() - INTERVAL '7 days' THEN 1 END) as changes_7d,
                COUNT(CASE WHEN detected_at > NOW() - INTERVAL '30 days' THEN 1 END) as changes_30d,
                MAX(detected_at) as last_change,
                AVG(interest_level) as avg_interest_level
            FROM processed_content.change_detection
            WHERE company = $1
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
                name: url.name,
                category: url.category,
                importance: url.importance,
                check_frequency: url.check_frequency
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

// Generate individual company detail files (keeping this feature)
async function generateIndividualCompanyFiles(companyName) {
    console.log(`  📁 Generating data for ${companyName}...`);
    
    const company = await db.get(`
        SELECT c.*, ca.* 
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
        SELECT * FROM intelligence.company_urls 
        WHERE company_id = $1
        ORDER BY name
    `, [company.id]);
    
    // Get recent changes with details
    const changes = await db.all(`
        SELECT 
            cd.*,
            sp.title,
            SUBSTRING(sp.content, 1, 1000) as content_preview
        FROM processed_content.change_detection cd
        LEFT JOIN raw_content.scraped_pages sp ON cd.new_hash = sp.content_hash
        WHERE cd.company = $1
        ORDER BY cd.detected_at DESC
        LIMIT 50
    `, [companyName]);
    
    // Process changes to add parsed AI analysis
    const processedChanges = changes.map(change => {
        let analysis = {};
        try {
            analysis = change.ai_analysis ? JSON.parse(change.ai_analysis) : {};
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
    
    // Get aggregated stats
    const stats = await db.get(`
        SELECT 
            COUNT(DISTINCT cd.url) as monitored_urls,
            COUNT(*) as total_changes,
            COUNT(CASE WHEN cd.interest_level >= 7 THEN 1 END) as high_interest_changes,
            COUNT(CASE WHEN cd.detected_at > NOW() - INTERVAL '7 days' THEN 1 END) as changes_last_week,
            AVG(cd.interest_level) as avg_interest_level
        FROM processed_content.change_detection cd
        WHERE cd.company = $1
    `, [companyName]);
    
    // Get entities from latest analyses
    const latestAnalyses = await db.all(`
        SELECT ba.entities, ba.themes, ba.key_points
        FROM processed_content.baseline_analysis ba
        JOIN intelligence.company_urls u ON ba.url_id = u.id
        WHERE u.company_id = $1
        ORDER BY ba.created_at DESC
        LIMIT 10
    `, [company.id]);
    
    // Aggregate entities and themes
    const allTechnologies = [];
    const allProducts = [];
    const allThemes = [];
    const allKeyPoints = [];
    
    for (const analysis of latestAnalyses) {
        try {
            if (analysis.entities) {
                const entities = JSON.parse(analysis.entities);
                if (entities.technologies) allTechnologies.push(...entities.technologies);
                if (entities.products) allProducts.push(...entities.products);
            }
            if (analysis.themes) {
                const themes = JSON.parse(analysis.themes);
                allThemes.push(...themes);
            }
            if (analysis.key_points) {
                const keyPoints = JSON.parse(analysis.key_points);
                allKeyPoints.push(...keyPoints);
            }
        } catch (e) {
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
    console.log('🚀 Static Data Generator for PostgreSQL (SQLite-Compatible Output)');
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
            version: '2.0',
            backend: 'postgresql',
            compatible_with: 'sqlite-dashboard',
            generated_at: new Date().toISOString(),
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
                compatible_with_dashboard: true
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
