#!/usr/bin/env node

/**
 * Generate changes.json from PostgreSQL changelog data
 * This script creates the changes.json file that the dashboard expects
 */

const fs = require('fs');
const path = require('path');
const { db, end } = require('./postgres-db');

// Configuration
const OUTPUT_DIR = path.join(__dirname, '..', 'api-data');

async function generateChangesJson() {
    console.log('🚀 Generating changes.json from PostgreSQL data');
    console.log('=' .repeat(60));
    
    try {
        // Query recent changes with all necessary data
        const changes = await db.all(`
            SELECT 
                ch.id,
                ch.company,
                ch.url,
                ch.detected_at,
                ch.interest_level,
                ch.analysis as ai_analysis,
                ch.change_type,
                ch.url_name,
                ea.ultra_analysis,
                ea.business_impact,
                ea.competitive_implications,
                cd.old_hash as before_hash,
                cd.new_hash as after_hash,
                mp.content as summary
            FROM intelligence.changes ch
            LEFT JOIN intelligence.enhanced_analysis ea ON ea.change_id = ch.id
            LEFT JOIN processed_content.change_detection cd ON cd.id = ch.id
            LEFT JOIN processed_content.markdown_pages mp ON mp.url = ch.url 
                AND mp.company = ch.company
            WHERE ch.detected_at > NOW() - INTERVAL '30 days'
            ORDER BY ch.detected_at DESC
            LIMIT 500
        `);
        
        console.log(`Found ${changes.length} changes to process`);
        
        // Transform changes to match frontend expectations
        const changesData = {
            changes: changes.map(change => {
                // Calculate relative time
                const detectedAt = new Date(change.detected_at);
                const now = new Date();
                const diffMs = now - detectedAt;
                const diffMins = Math.floor(diffMs / 60000);
                const diffHours = Math.floor(diffMs / 3600000);
                const diffDays = Math.floor(diffMs / 86400000);
                
                let timeAgo = '';
                if (diffMins < 60) {
                    timeAgo = `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
                } else if (diffHours < 24) {
                    timeAgo = `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
                } else {
                    timeAgo = `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
                }
                
                // Truncate summary if needed
                let summary = change.summary || '';
                if (summary.length > 200) {
                    summary = summary.substring(0, 200);
                }
                
                return {
                    id: change.id,
                    change_id: change.id, // For compatibility
                    company: change.company,
                    url: change.url,
                    url_name: change.url_name || 'website',
                    detected_at: change.detected_at,
                    time_ago: timeAgo,
                    interest_level: change.interest_level || 0,
                    relevance_score: change.interest_level || 0, // For compatibility
                    ai_analysis: change.ai_analysis,
                    title: `${change.company} - ${change.url_name || 'Update'}`,
                    summary: summary,
                    category: change.change_type || 'General Update',
                    impact_areas: [], // Will be populated from AI analysis
                    before_hash: change.before_hash,
                    after_hash: change.after_hash
                };
            }),
            generated_at: new Date().toISOString(),
            total_changes: changes.length
        };
        
        // Write changes.json
        fs.writeFileSync(
            path.join(OUTPUT_DIR, 'changes.json'),
            JSON.stringify(changesData, null, 2)
        );
        
        console.log(`✅ Generated changes.json with ${changesData.changes.length} changes`);
        
        // Summary statistics
        const stats = {
            total: changesData.changes.length,
            high_interest: changesData.changes.filter(c => c.interest_level >= 8).length,
            medium_interest: changesData.changes.filter(c => c.interest_level >= 6 && c.interest_level < 8).length,
            low_interest: changesData.changes.filter(c => c.interest_level < 6).length
        };
        
        console.log('\n📊 Changes Summary:');
        console.log(`   Total changes: ${stats.total}`);
        console.log(`   High interest (8+): ${stats.high_interest}`);
        console.log(`   Medium interest (6-7): ${stats.medium_interest}`);
        console.log(`   Low interest (<6): ${stats.low_interest}`);
        
    } catch (error) {
        console.error('❌ Error generating changes.json:', error);
        process.exit(1);
    } finally {
        await end();
    }
}

// Run if called directly
if (require.main === module) {
    generateChangesJson().catch(console.error);
}

module.exports = { generateChangesJson };
