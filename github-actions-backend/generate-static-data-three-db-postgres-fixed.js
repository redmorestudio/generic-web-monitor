#!/usr/bin/env node

// SSL Certificate fix for Heroku PostgreSQL
if (process.env.NODE_ENV === 'production' || process.env.POSTGRES_CONNECTION_STRING) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

/**
 * Generate Static Data Files for GitHub Pages (PostgreSQL Version) - CRITICAL FIX
 * 
 * CRITICAL FIXES:
 * 1. Pull AI analysis from intelligence.changes and enhanced_analysis tables
 * 2. Generate individual change detail files
 * 3. Include all fields required by dashboard
 * 4. Fix missing company names and URLs in modal
 */

const fs = require('fs');
const path = require('path');
const { db, end } = require('./postgres-db');

// Configuration
const DATA_DIR = path.join(__dirname, 'data');
const OUTPUT_DIR = path.join(__dirname, '..', 'api-data');
const CHANGES_DIR = path.join(OUTPUT_DIR, 'changes');

// Ensure output directories exist
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}
if (!fs.existsSync(CHANGES_DIR)) {
    fs.mkdirSync(CHANGES_DIR, { recursive: true });
}

// Helper to format relative time
function getRelativeTime(date) {
    const now = new Date();
    const then = new Date(date);
    const seconds = Math.floor((now - then) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return Math.floor(seconds / 60) + ' min ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + ' hours ago';
    if (seconds < 604800) return Math.floor(seconds / 86400) + ' days ago';
    
    return then.toLocaleDateString();
}

// Generate dashboard.json - FIXED to include AI analysis
async function generateDashboard() {
    console.log('📊 Generating dashboard data with AI analysis...');
    
    // Get all companies
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
        
        // Get recent activity with AI analysis
        const recentActivity = await db.get(`
            SELECT 
                COUNT(DISTINCT c.id) as change_count_7d,
                MAX(c.detected_at) as last_change_date,
                MAX(c.interest_level) as highest_recent_score
            FROM intelligence.changes c
            WHERE c.company = $1
            AND c.detected_at > NOW() - INTERVAL '7 days'
        `, [company.name]);
        
        // Get top entities from baseline analysis
        const baselineData = await db.get(`
            SELECT entities, themes
            FROM intelligence.baseline_analysis
            WHERE company = $1
            ORDER BY analysis_date DESC
            LIMIT 1
        `, [company.name]);
        
        let technologies = [];
        let products = [];
        
        if (baselineData && baselineData.entities) {
            const entities = baselineData.entities;
            if (entities.technologies) {
                technologies = entities.technologies.slice(0, 5).map(t => t.name || t);
            }
            if (entities.products) {
                products = entities.products.slice(0, 5).map(p => p.name || p);
            }
        }
        
        companyStats.push({
            company: company.name,
            type: company.category,
            url_count: urlCount.count,
            recent_activity: {
                change_count_7d: recentActivity.change_count_7d || 0,
                last_change: recentActivity.last_change_date ? 
                    getRelativeTime(recentActivity.last_change_date) : 
                    'No recent changes',
                highest_recent_score: recentActivity.highest_recent_score || 0
            },
            top_technologies: technologies,
            top_products: products
        });
    }
    
    // Overall statistics
    const overallStats = await db.get(`
        SELECT 
            (SELECT COUNT(*) FROM intelligence.companies) as companies,
            (SELECT COUNT(*) FROM intelligence.urls) as urls,
            (SELECT MAX(completed_at) FROM raw_content.scraping_runs WHERE status = 'completed') as lastCheck
    `);
    
    // Get recent high-value changes with full AI analysis
    const recentChanges = await db.all(`
        SELECT 
            c.id as change_id,
            c.company,
            c.url,
            c.detected_at,
            c.interest_level,
            c.analysis,
            c.ai_confidence,
            ea.ultra_analysis,
            ea.key_insights,
            ea.business_impact
        FROM intelligence.changes c
        LEFT JOIN intelligence.enhanced_analysis ea ON c.id = ea.change_id
        WHERE c.detected_at > NOW() - INTERVAL '7 days'
        AND c.interest_level >= 3
        ORDER BY c.interest_level DESC, c.detected_at DESC
        LIMIT 5
    `);
    
    // Format recent changes with proper AI summary
    const formattedChanges = recentChanges.map(change => {
        let summary = 'Content update detected';
        let category = 'general';
        
        // Extract summary from AI analysis
        if (change.analysis) {
            try {
                const analysis = typeof change.analysis === 'string' ? 
                    JSON.parse(change.analysis) : change.analysis;
                summary = analysis.what_changed || analysis.summary || summary;
                category = analysis.change_type || analysis.category || category;
            } catch (e) {}
        }
        
        // Try ultra analysis if available
        if (change.ultra_analysis) {
            try {
                const ultra = typeof change.ultra_analysis === 'string' ? 
                    JSON.parse(change.ultra_analysis) : change.ultra_analysis;
                if (ultra.change_summary && ultra.change_summary.what_changed) {
                    summary = ultra.change_summary.what_changed;
                }
                if (ultra.interest_assessment && ultra.interest_assessment.category) {
                    category = ultra.interest_assessment.category;
                }
            } catch (e) {}
        }
        
        return {
            change_id: change.change_id,
            company: change.company,
            url: change.url,
            summary: summary,
            interest_level: change.interest_level,
            time_ago: getRelativeTime(change.detected_at),
            category: category
        };
    });
    
    // Count changes by timeframe
    const changeCounts = await db.get(`
        SELECT 
            COUNT(DISTINCT CASE WHEN detected_at > NOW() - INTERVAL '24 hours' THEN id END) as last_24h_count,
            COUNT(DISTINCT CASE WHEN detected_at > NOW() - INTERVAL '7 days' THEN id END) as last_7d_count,
            COUNT(DISTINCT CASE WHEN detected_at > NOW() - INTERVAL '7 days' AND interest_level >= 7 THEN id END) as high_priority_last_7d
        FROM intelligence.changes
    `);
    
    return {
        company_activity: companyStats,
        stats: {
            companies: parseInt(overallStats.companies) || 0,
            urls: parseInt(overallStats.urls) || 0,
            lastCheck: overallStats.lastCheck
        },
        recent_changes_summary: {
            last_24h_count: parseInt(changeCounts.last_24h_count) || 0,
            last_7d_count: parseInt(changeCounts.last_7d_count) || 0,
            high_priority_last_7d: parseInt(changeCounts.high_priority_last_7d) || 0,
            last_5_changes: formattedChanges
        },
        last_updated: new Date().toISOString()
    };
}

// Generate individual change detail files - NEW CRITICAL FUNCTION
async function generateChangeDetailFiles() {
    console.log('📝 Generating individual change detail files...');
    
    // Get all recent changes that need detail files
    const changes = await db.all(`
        SELECT 
            c.id,
            c.company,
            c.url,
            c.detected_at,
            c.interest_level,
            c.change_type,
            c.analysis,
            c.ai_confidence,
            c.before_content,
            c.after_content,
            c.markdown_before,
            c.markdown_after,
            ea.ultra_analysis,
            ea.key_insights,
            ea.business_impact,
            ea.competitive_implications,
            ea.market_signals,
            ea.risk_assessment
        FROM intelligence.changes c
        LEFT JOIN intelligence.enhanced_analysis ea ON c.id = ea.change_id
        WHERE c.detected_at > NOW() - INTERVAL '30 days'
        ORDER BY c.detected_at DESC
        LIMIT 200
    `);
    
    let generated = 0;
    
    for (const change of changes) {
        try {
            // Parse AI analyses
            let basicAnalysis = {};
            let ultraAnalysis = {};
            
            if (change.analysis) {
                try {
                    basicAnalysis = typeof change.analysis === 'string' ? 
                        JSON.parse(change.analysis) : change.analysis;
                } catch (e) {}
            }
            
            if (change.ultra_analysis) {
                try {
                    ultraAnalysis = typeof change.ultra_analysis === 'string' ? 
                        JSON.parse(change.ultra_analysis) : change.ultra_analysis;
                } catch (e) {}
            }
            
            // Build interest explanation
            let interestExplanation = 'Change detected with moderate significance.';
            let interestCategory = 'general_update';
            let interestDrivers = [];
            
            if (ultraAnalysis.interest_assessment) {
                interestExplanation = ultraAnalysis.interest_assessment.reasoning || interestExplanation;
                interestCategory = ultraAnalysis.interest_assessment.category || interestCategory;
            }
            
            if (ultraAnalysis.strategic_analysis) {
                if (ultraAnalysis.strategic_analysis.business_impact) {
                    interestDrivers.push('Business Impact');
                }
                if (ultraAnalysis.strategic_analysis.market_signals && ultraAnalysis.strategic_analysis.market_signals.length > 0) {
                    interestDrivers.push('Market Signal');
                }
            }
            
            if (change.interest_level >= 7) {
                interestDrivers.push('High Priority');
            }
            
            // Build diff information
            const diff = {
                summary: ultraAnalysis.change_summary?.what_changed || basicAnalysis.what_changed || 'Content updated',
                key_changes: ultraAnalysis.insights?.key_findings || [],
                added_sentences: [],
                removed_sentences: []
            };
            
            // Extract keywords (if we have content)
            const keywords = {
                new_keywords: [],
                frequency_changes: {}
            };
            
            if (ultraAnalysis.entities) {
                // Extract new entities as keywords
                const allEntities = [
                    ...(ultraAnalysis.entities.products || []),
                    ...(ultraAnalysis.entities.technologies || []),
                    ...(ultraAnalysis.entities.features || [])
                ];
                
                keywords.new_keywords = allEntities.slice(0, 10).map(e => ({
                    word: e,
                    frequency: 1
                }));
            }
            
            // Create the detail object matching dashboard expectations
            const detail = {
                id: change.id,
                company: change.company,
                url: change.url,
                detected_at: change.detected_at,
                interest_level: change.interest_level,
                interest_category: interestCategory,
                interest_explanation: interestExplanation,
                interest_drivers: interestDrivers,
                has_content: !!(change.markdown_before || change.markdown_after),
                content_preview: {
                    before: change.markdown_before ? change.markdown_before.substring(0, 1000) : null,
                    after: change.markdown_after ? change.markdown_after.substring(0, 1000) : null
                },
                diff: diff,
                keywords: keywords,
                ai_analysis: {
                    basic: basicAnalysis,
                    enhanced: ultraAnalysis
                },
                business_context: {
                    impact: change.business_impact || ultraAnalysis.strategic_analysis?.business_impact || '',
                    implications: change.competitive_implications || ultraAnalysis.strategic_analysis?.competitive_implications || '',
                    market_signals: change.market_signals || ultraAnalysis.strategic_analysis?.market_signals || [],
                    risk_assessment: change.risk_assessment || ''
                }
            };
            
            // Write the file
            const filename = `change-${change.id}.json`;
            fs.writeFileSync(
                path.join(CHANGES_DIR, filename),
                JSON.stringify(detail, null, 2)
            );
            generated++;
            
        } catch (error) {
            console.error(`Error generating detail for change ${change.id}:`, error);
        }
    }
    
    console.log(`✅ Generated ${generated} change detail files`);
    return generated;
}

// Generate changes.json with AI summaries
async function generateRecentChangesData() {
    console.log('🔄 Generating recent changes data with AI summaries...');
    
    const changes = await db.all(`
        SELECT 
            c.id,
            c.company,
            c.url,
            c.detected_at as created_at,
            c.interest_level,
            c.analysis,
            ea.ultra_analysis,
            ea.business_impact
        FROM intelligence.changes c
        LEFT JOIN intelligence.enhanced_analysis ea ON c.id = ea.change_id
        WHERE c.detected_at > NOW() - INTERVAL '30 days'
        ORDER BY c.detected_at DESC
        LIMIT 500
    `);
    
    return {
        changes: changes.map(change => {
            let summary = 'Content update detected';
            
            // Extract summary from analyses
            if (change.analysis) {
                try {
                    const analysis = typeof change.analysis === 'string' ? 
                        JSON.parse(change.analysis) : change.analysis;
                    summary = analysis.what_changed || analysis.summary || summary;
                } catch (e) {}
            }
            
            if (change.ultra_analysis) {
                try {
                    const ultra = typeof change.ultra_analysis === 'string' ? 
                        JSON.parse(change.ultra_analysis) : change.ultra_analysis;
                    if (ultra.change_summary && ultra.change_summary.what_changed) {
                        summary = ultra.change_summary.what_changed;
                    }
                } catch (e) {}
            }
            
            return {
                id: change.id,
                company: change.company,
                summary: summary,
                interest_level: change.interest_level,
                created_at: change.created_at
            };
        }),
        generated_at: new Date().toISOString()
    };
}

// Main generation function
async function generateAllData() {
    console.log('🚀 CRITICAL FIX: Static Data Generator with AI Analysis');
    console.log('=' .repeat(60));
    
    try {
        // Generate dashboard with AI summaries
        console.log('\n📊 Generating dashboard.json with AI analysis...');
        const dashboardData = await generateDashboard();
        fs.writeFileSync(
            path.join(OUTPUT_DIR, 'dashboard.json'),
            JSON.stringify(dashboardData, null, 2)
        );
        console.log('✅ Dashboard generated with AI summaries');
        
        // Generate changes list
        console.log('\n📋 Generating changes.json...');
        const changesData = await generateRecentChangesData();
        fs.writeFileSync(
            path.join(OUTPUT_DIR, 'changes.json'),
            JSON.stringify(changesData, null, 2)
        );
        console.log('✅ Changes list generated');
        
        // Generate individual change details (CRITICAL)
        console.log('\n🔍 Generating individual change detail files...');
        const detailCount = await generateChangeDetailFiles();
        
        // Generate status file
        fs.writeFileSync(
            path.join(OUTPUT_DIR, 'status.json'),
            JSON.stringify({
                generated_at: new Date().toISOString(),
                backend: 'postgresql',
                ai_analysis_included: true,
                change_details_generated: detailCount,
                fixes_applied: ['ai_summaries', 'change_details', 'company_names', 'urls']
            }, null, 2)
        );
        
        console.log('\n✨ CRITICAL FIX APPLIED: AI analysis now included!');
        console.log('📊 Dashboard will now show:');
        console.log('   - Executive summaries in recent changes');
        console.log('   - Company names and URLs in detail modal');
        console.log('   - Full AI analysis and competitive intelligence');
        console.log('   - Business impact and strategic insights');
        
    } catch (error) {
        console.error('❌ Error generating static data:', error);
        process.exit(1);
    } finally {
        await end();
    }
}

// Run the generator
generateAllData().catch(console.error);
