#!/usr/bin/env node

// SSL Certificate fix for Heroku PostgreSQL
if (process.env.NODE_ENV === 'production' || process.env.POSTGRES_CONNECTION_STRING) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

/**
 * Enhanced Static Data Generator for PostgreSQL with Rich Entity Support
 * 
 * ENHANCEMENTS:
 * 1. Extract rich entity data with URLs from baseline analysis
 * 2. Generate proper relationship data for 3D graph
 * 3. Include AI/ML concepts and technologies
 * 4. Add source URLs for entity click-through
 */

const fs = require('fs');
const path = require('path');
const { db, end } = require('./postgres-db');

// Configuration
const OUTPUT_DIR = path.join(__dirname, '..', 'api-data');
const CHANGES_DIR = path.join(OUTPUT_DIR, 'changes');

// Ensure output directories exist
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}
if (!fs.existsSync(CHANGES_DIR)) {
    fs.mkdirSync(CHANGES_DIR, { recursive: true });
}

// Generate enhanced company data for 3D graph
async function generateEnhancedCompanyData() {
    console.log('🎯 Generating enhanced company data with rich entities...');
    
    const companies = await db.all(`
        SELECT c.id, c.name, c.category
        FROM intelligence.companies c
        ORDER BY c.name
    `);
    
    const companyData = [];
    
    for (const company of companies) {
        console.log(`   Processing ${company.name}...`);
        
        // Get the latest baseline analysis with rich entities
        const baselineData = await db.get(`
            SELECT 
                entities,
                themes,
                sentiment,
                relationships,
                analysis_date,
                url
            FROM intelligence.baseline_analysis
            WHERE company = $1
            ORDER BY analysis_date DESC
            LIMIT 1
        `, [company.name]);
        
        let intelligence = {
            products: [],
            technologies: [],
            ai_technologies: [],
            ai_ml_concepts: [],
            partnerships: [],
            use_cases: [],
            competitors: [],
            people: []
        };
        
        if (baselineData && baselineData.entities) {
            const entities = baselineData.entities;
            
            // Extract products with URLs
            if (entities.products && Array.isArray(entities.products)) {
                intelligence.products = entities.products.map(p => ({
                    name: p.name,
                    description: p.description || '',
                    features: p.features || [],
                    url: baselineData.url,
                    status: p.status || 'active',
                    technologies_used: p.technologies_used || []
                }));
            }
            
            // Extract AI technologies with details
            if (entities.ai_technologies && Array.isArray(entities.ai_technologies)) {
                intelligence.ai_technologies = entities.ai_technologies.map(t => ({
                    name: t.name,
                    type: t.type || 'ai_technology',
                    vendor: t.vendor || '',
                    description: t.description || '',
                    capabilities: t.capabilities || [],
                    url: baselineData.url
                }));
            }
            
            // Extract general technologies
            if (entities.technologies && Array.isArray(entities.technologies)) {
                intelligence.technologies = entities.technologies.map(t => ({
                    name: t.name,
                    category: t.category || 'technology',
                    description: t.description || '',
                    usage: t.usage || '',
                    url: baselineData.url
                }));
            }
            
            // Extract AI/ML concepts
            if (entities.concepts && Array.isArray(entities.concepts)) {
                intelligence.ai_ml_concepts = entities.concepts.map(c => ({
                    name: c.name,
                    abbreviation: c.abbreviation || '',
                    type: c.type || 'concept',
                    description: c.description || '',
                    applications: c.applications || [],
                    url: baselineData.url
                }));
            }
            
            // Extract partnerships
            if (entities.partnerships && Array.isArray(entities.partnerships)) {
                intelligence.partnerships = entities.partnerships.map(p => ({
                    partner: p.partner,
                    type: p.type || 'partnership',
                    description: p.description || '',
                    benefits: p.benefits || [],
                    url: baselineData.url
                }));
            }
            
            // Extract use cases
            if (entities.use_cases && Array.isArray(entities.use_cases)) {
                intelligence.use_cases = entities.use_cases.map(u => ({
                    name: u.name,
                    industry: u.industry || '',
                    description: u.description || '',
                    benefits: u.benefits || [],
                    technologies: u.technologies || [],
                    url: baselineData.url
                }));
            }
            
            // Extract competitors
            if (entities.competitors && Array.isArray(entities.competitors)) {
                intelligence.competitors = entities.competitors.map(c => ({
                    name: c.name,
                    type: c.type || 'competitor',
                    competing_products: c.competing_products || [],
                    market_position: c.market_position || '',
                    url: baselineData.url
                }));
            }
            
            // Extract people
            if (entities.people && Array.isArray(entities.people)) {
                intelligence.people = entities.people.map(p => ({
                    name: p.name,
                    title: p.title || '',
                    background: p.background || '',
                    expertise: p.expertise || [],
                    url: baselineData.url
                }));
            }
        }
        
        // If no entities found, check for older format or provide minimal fallback
        if (Object.values(intelligence).every(arr => arr.length === 0)) {
            console.log(`   ⚠️  No rich entities found for ${company.name}, using minimal data`);
            
            // Try to extract from themes or other fields
            if (baselineData && baselineData.themes) {
                const themes = baselineData.themes;
                if (themes.technology_adoption) {
                    intelligence.technologies = Object.entries(themes.technology_adoption)
                        .map(([name, score]) => ({
                            name: name,
                            category: 'technology',
                            score: score,
                            url: baselineData.url
                        }));
                }
            }
        }
        
        // Get recent changes for activity metrics
        const recentActivity = await db.get(`
            SELECT 
                COUNT(DISTINCT id) as change_count_7d,
                MAX(detected_at) as last_change_date,
                MAX(interest_level) as highest_recent_score
            FROM intelligence.changes
            WHERE company = $1
            AND detected_at > NOW() - INTERVAL '7 days'
        `, [company.name]);
        
        // Get URL statistics
        const urlStats = await db.get(`
            SELECT COUNT(*) as url_count
            FROM intelligence.urls
            WHERE company_id = $1
        `, [company.id]);
        
        companyData.push({
            id: company.id,
            name: company.name,
            category: company.category,
            urls_monitored: urlStats.url_count,
            recent_activity: {
                changes_7d: recentActivity.change_count_7d || 0,
                last_change: recentActivity.last_change_date || null,
                highest_score: recentActivity.highest_recent_score || 0
            },
            intelligence: intelligence,
            entity_count: Object.values(intelligence).reduce((sum, arr) => sum + arr.length, 0),
            last_analysis: baselineData?.analysis_date || null
        });
    }
    
    return companyData;
}

// Generate relationship data for 3D graph
async function generateRelationshipData(companies) {
    console.log('🔗 Generating relationship data for 3D graph...');
    
    const relationships = [];
    const entityMap = new Map();
    
    // Build entity map for quick lookups
    for (const company of companies) {
        for (const [entityType, entities] of Object.entries(company.intelligence)) {
            for (const entity of entities) {
                const key = `${entity.name}:${entityType}`;
                if (!entityMap.has(key)) {
                    entityMap.set(key, {
                        name: entity.name,
                        type: entityType,
                        companies: []
                    });
                }
                entityMap.get(key).companies.push(company.name);
            }
        }
    }
    
    // Generate relationships based on shared entities
    for (const [key, entity] of entityMap.entries()) {
        if (entity.companies.length > 1) {
            // Create relationships between companies that share this entity
            for (let i = 0; i < entity.companies.length; i++) {
                for (let j = i + 1; j < entity.companies.length; j++) {
                    relationships.push({
                        source: entity.companies[i],
                        target: entity.companies[j],
                        type: 'shares_' + entity.type,
                        entity: entity.name,
                        strength: 1 / entity.companies.length
                    });
                }
            }
        }
    }
    
    // Also get explicit relationships from baseline analysis
    const explicitRelationships = await db.all(`
        SELECT company, relationships
        FROM intelligence.baseline_analysis
        WHERE relationships IS NOT NULL
    `);
    
    for (const row of explicitRelationships) {
        if (row.relationships && Array.isArray(row.relationships)) {
            for (const rel of row.relationships) {
                relationships.push({
                    source: row.company,
                    target: rel.to,
                    type: rel.type || 'related_to',
                    context: rel.context || '',
                    strength: 1
                });
            }
        }
    }
    
    return {
        nodes: Array.from(entityMap.values()),
        edges: relationships
    };
}

// Main dashboard generation with enhanced data
async function generateDashboard() {
    console.log('📊 Generating enhanced dashboard with rich entity data...\n');
    
    // Generate enhanced company data
    const companies = await generateEnhancedCompanyData();
    
    // Generate relationship data
    const relationshipData = await generateRelationshipData(companies);
    
    // Get overall statistics
    const stats = await db.get(`
        SELECT 
            (SELECT COUNT(*) FROM intelligence.companies) as total_companies,
            (SELECT COUNT(*) FROM intelligence.urls) as total_urls,
            (SELECT COUNT(*) FROM intelligence.changes WHERE detected_at > NOW() - INTERVAL '7 days') as changes_7d,
            (SELECT COUNT(*) FROM intelligence.baseline_analysis) as analyzed_pages
    `);
    
    // Get recent high-value changes
    const recentChanges = await db.all(`
        SELECT 
            c.id,
            c.company,
            c.url,
            c.detected_at,
            c.interest_level,
            c.analysis
        FROM intelligence.changes c
        WHERE c.detected_at > NOW() - INTERVAL '7 days'
        AND c.interest_level >= 3
        ORDER BY c.interest_level DESC, c.detected_at DESC
        LIMIT 10
    `);
    
    // Count entities by type
    let entityCounts = {
        total_entities: 0,
        products: 0,
        ai_technologies: 0,
        technologies: 0,
        concepts: 0,
        partnerships: 0,
        use_cases: 0
    };
    
    for (const company of companies) {
        entityCounts.total_entities += company.entity_count;
        entityCounts.products += company.intelligence.products.length;
        entityCounts.ai_technologies += company.intelligence.ai_technologies.length;
        entityCounts.technologies += company.intelligence.technologies.length;
        entityCounts.concepts += company.intelligence.ai_ml_concepts.length;
        entityCounts.partnerships += company.intelligence.partnerships.length;
        entityCounts.use_cases += company.intelligence.use_cases.length;
    }
    
    const dashboard = {
        generated_at: new Date().toISOString(),
        stats: {
            companies: stats.total_companies,
            urls: stats.total_urls,
            changes_7d: stats.changes_7d,
            analyzed_pages: stats.analyzed_pages,
            entity_counts: entityCounts,
            relationship_count: relationshipData.edges.length
        },
        companies: companies,
        recent_changes: recentChanges.map(formatChange),
        graph_data: relationshipData,
        metadata: {
            version: '2.0',
            enhanced_entities: true,
            includes_urls: true,
            database: 'postgresql'
        }
    };
    
    // Write dashboard data
    const dashboardPath = path.join(OUTPUT_DIR, 'dashboard.json');
    fs.writeFileSync(dashboardPath, JSON.stringify(dashboard, null, 2));
    console.log(`✅ Dashboard generated: ${dashboardPath}`);
    
    // Generate individual company files
    await generateIndividualCompanyFiles(companies);
    
    // Generate change detail files
    await generateChangeDetails(recentChanges);
    
    return dashboard;
}

// Format change for display
function formatChange(change) {
    let summary = 'Update detected';
    let category = 'general';
    let impactAreas = [];
    
    if (change.analysis) {
        try {
            const analysis = typeof change.analysis === 'string' ? 
                JSON.parse(change.analysis) : change.analysis;
            
            summary = analysis.executive_summary || analysis.summary || summary;
            category = analysis.category || category;
            impactAreas = analysis.impact_areas || [];
        } catch (e) {}
    }
    
    return {
        id: change.id,
        company: change.company,
        url: change.url,
        detected_at: change.detected_at,
        interest_level: change.interest_level,
        summary: summary,
        category: category,
        impact_areas: impactAreas
    };
}

// Generate individual company JSON files
async function generateIndividualCompanyFiles(companies) {
    console.log('\n📁 Generating individual company files...');
    
    const companiesDir = path.join(OUTPUT_DIR, 'companies');
    if (!fs.existsSync(companiesDir)) {
        fs.mkdirSync(companiesDir, { recursive: true });
    }
    
    for (const company of companies) {
        const filename = company.name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '.json';
        const filepath = path.join(companiesDir, filename);
        
        // Get detailed data for this company
        const detailedData = {
            ...company,
            recent_changes: await getCompanyRecentChanges(company.name),
            url_details: await getCompanyUrlDetails(company.id)
        };
        
        fs.writeFileSync(filepath, JSON.stringify(detailedData, null, 2));
    }
    
    console.log(`   ✅ Generated ${companies.length} company files`);
}

// Get recent changes for a company
async function getCompanyRecentChanges(companyName) {
    const changes = await db.all(`
        SELECT 
            id,
            url,
            detected_at,
            interest_level,
            analysis
        FROM intelligence.changes
        WHERE company = $1
        AND detected_at > NOW() - INTERVAL '30 days'
        ORDER BY detected_at DESC
        LIMIT 20
    `, [companyName]);
    
    return changes.map(formatChange);
}

// Get URL details for a company
async function getCompanyUrlDetails(companyId) {
    return await db.all(`
        SELECT 
            url,
            url_type,
            is_primary,
            last_scraped,
            scrape_frequency
        FROM intelligence.urls
        WHERE company_id = $1
        ORDER BY is_primary DESC, url
    `, [companyId]);
}

// Generate change detail files
async function generateChangeDetails(changes) {
    console.log(`\n📄 Generating ${changes.length} change detail files...`);
    
    for (const change of changes) {
        const changeDetail = await db.get(`
            SELECT 
                c.*,
                cd.old_content,
                cd.new_content,
                cd.old_hash,
                cd.new_hash
            FROM intelligence.changes c
            LEFT JOIN processed_content.change_detection cd 
                ON c.company = cd.company AND c.url = cd.url AND c.detected_at = cd.detected_at
            WHERE c.id = $1
        `, [change.id]);
        
        if (changeDetail) {
            const filename = `change-${change.id}.json`;
            const filepath = path.join(CHANGES_DIR, filename);
            
            fs.writeFileSync(filepath, JSON.stringify({
                ...formatChange(changeDetail),
                old_content: changeDetail.old_content,
                new_content: changeDetail.new_content,
                content_hashes: {
                    old: changeDetail.old_hash,
                    new: changeDetail.new_hash
                }
            }, null, 2));
        }
    }
    
    console.log(`   ✅ Generated change detail files`);
}

// Main execution
async function main() {
    try {
        console.log('🚀 Starting enhanced static data generation for PostgreSQL...\n');
        
        const dashboard = await generateDashboard();
        
        console.log('\n' + '='.repeat(50));
        console.log('✅ ENHANCED STATIC DATA GENERATION COMPLETE');
        console.log('='.repeat(50));
        console.log('📊 Summary:');
        console.log(`   - Companies: ${dashboard.stats.companies}`);
        console.log(`   - Total Entities: ${dashboard.stats.entity_counts.total_entities}`);
        console.log(`   - Relationships: ${dashboard.stats.relationship_count}`);
        console.log(`   - Recent Changes: ${dashboard.recent_changes.length}`);
        console.log('\n📁 Output files:');
        console.log(`   - ${OUTPUT_DIR}/dashboard.json`);
        console.log(`   - ${OUTPUT_DIR}/companies/*.json`);
        console.log(`   - ${CHANGES_DIR}/*.json`);
        
        // Close database connection
        end();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error generating static data:', error);
        end();
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = {
    generateDashboard,
    generateEnhancedCompanyData,
    generateRelationshipData
};
