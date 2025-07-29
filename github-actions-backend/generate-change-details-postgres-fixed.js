#!/usr/bin/env node

// SSL Certificate fix for Heroku PostgreSQL
if (process.env.NODE_ENV === 'production' || process.env.POSTGRES_CONNECTION_STRING) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

/**
 * Generate Change Detail Files for GitHub Pages (PostgreSQL Version)
 * 
 * This script creates individual change detail files from PostgreSQL data
 * that can be served by GitHub Pages and consumed by the frontend
 * 
 * FIXED: Now uses change-{id}.json format for filenames to match dashboard expectations
 */

const fs = require('fs');
const path = require('path');
const { db, end } = require('./postgres-db');

// Configuration
const OUTPUT_DIR = path.join(__dirname, '..', 'api-data', 'changes');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function generateChangeDetails() {
    console.log('🚀 Generating Change Detail Files (PostgreSQL)');
    console.log('=' .repeat(60));
    
    try {
        // Check if intelligence.changes table exists
        const hasChangesTable = await db.get(`
            SELECT COUNT(*) as count 
            FROM information_schema.tables 
            WHERE table_schema = 'intelligence' AND table_name = 'changes'
        `);
        
        if (!hasChangesTable || hasChangesTable.count === '0') {
            console.log('⚠️  No intelligence.changes table found');
            console.log('   Change details will be empty');
            
            // Create empty manifest
            const manifest = {
                version: '1.0',
                generated_at: new Date().toISOString(),
                source: 'postgresql',
                total_changes: 0,
                files: []
            };
            
            fs.writeFileSync(
                path.join(OUTPUT_DIR, 'manifest.json'),
                JSON.stringify(manifest, null, 2)
            );
            
            console.log('✅ Created empty change details manifest');
            return;
        }
        
        // Get recent changes from PostgreSQL
        const changes = await db.all(`
            SELECT 
                c.*,
                c.company as company_name,
                c.url as page_url,
                ea.ultra_analysis,
                ea.key_insights,
                ea.business_impact,
                ea.competitive_implications
            FROM intelligence.changes c
            LEFT JOIN intelligence.enhanced_analysis ea ON ea.change_id = c.id
            WHERE c.detected_at > NOW() - INTERVAL '30 days'
            ORDER BY c.detected_at DESC, c.interest_level DESC
            LIMIT 500
        `);
        
        console.log(`📋 Found ${changes.length} changes to process`);
        
        if (changes.length === 0) {
            console.log('   No recent changes found');
            
            // Create empty manifest
            const manifest = {
                version: '1.0',
                generated_at: new Date().toISOString(),
                source: 'postgresql',
                total_changes: 0,
                files: []
            };
            
            fs.writeFileSync(
                path.join(OUTPUT_DIR, 'manifest.json'),
                JSON.stringify(manifest, null, 2)
            );
            
            console.log('✅ Created empty change details manifest');
            return;
        }
        
        // Process each change
        const manifest = {
            version: '1.0',
            generated_at: new Date().toISOString(),
            source: 'postgresql',
            total_changes: changes.length,
            files: []
        };
        
        let processedCount = 0;
        
        for (const change of changes) {
            processedCount++;
            
            try {
                // Parse analysis if it's a JSON string
                let analysis = {};
                let ultraAnalysis = {};
                
                try {
                    if (change.analysis && typeof change.analysis === 'string') {
                        analysis = JSON.parse(change.analysis);
                    } else if (change.analysis && typeof change.analysis === 'object') {
                        analysis = change.analysis;
                    }
                } catch (e) {
                    console.log(`   ⚠️  Could not parse analysis for change ${change.id}`);
                }
                
                try {
                    if (change.ultra_analysis && typeof change.ultra_analysis === 'string') {
                        ultraAnalysis = JSON.parse(change.ultra_analysis);
                    } else if (change.ultra_analysis && typeof change.ultra_analysis === 'object') {
                        ultraAnalysis = change.ultra_analysis;
                    }
                } catch (e) {
                    console.log(`   ⚠️  Could not parse ultra analysis for change ${change.id}`);
                }
                
                // Create detailed change object
                const changeDetail = {
                    id: change.id,
                    company: change.company_name,
                    page_url: change.page_url,
                    detected_at: change.detected_at,
                    change_type: change.change_type,
                    interest_level: change.interest_level,
                    ai_confidence: change.ai_confidence || 0.8,
                    
                    // Basic analysis
                    summary: analysis.summary || analysis.change_summary || 'Change detected',
                    category: analysis.category || 'General Update',
                    
                    // Enhanced analysis from ultra_analysis
                    change_summary: ultraAnalysis.change_summary || analysis.change_summary,
                    strategic_analysis: ultraAnalysis.strategic_analysis || {},
                    entities: ultraAnalysis.entities || {},
                    insights: ultraAnalysis.insights || {},
                    
                    // From enhanced_analysis table
                    key_insights: change.key_insights || [],
                    business_impact: change.business_impact || '',
                    competitive_implications: change.competitive_implications || '',
                    
                    // Content hashes
                    content_hash_before: change.content_hash_before,
                    content_hash_after: change.content_hash_after,
                    
                    // Metadata
                    ai_model: change.ai_model || 'groq-llama-3.3-70b',
                    database_source: 'postgresql',
                    schema: 'intelligence.changes'
                };
                
                // FIXED: Use change ID as the filename to match what dashboard expects
                const filename = `change-${change.id}.json`;
                
                // Write individual change file
                fs.writeFileSync(
                    path.join(OUTPUT_DIR, filename),
                    JSON.stringify(changeDetail, null, 2)
                );
                
                // Add to manifest with proper api_path for dashboard compatibility
                manifest.files.push({
                    filename: filename,
                    change_id: change.id,
                    api_path: `/api-data/changes/${filename}`,
                    company: change.company_name,
                    detected_at: change.detected_at,
                    interest_level: change.interest_level,
                    change_type: change.change_type,
                    summary: changeDetail.summary.substring(0, 100) + (changeDetail.summary.length > 100 ? '...' : '')
                });
                
                // Progress update
                if (processedCount % 50 === 0) {
                    console.log(`   Processed ${processedCount}/${changes.length} changes...`);
                }
                
            } catch (error) {
                console.error(`   ❌ Failed to process change ${change.id}:`, error.message);
                continue;
            }
        }
        
        // Sort manifest files by interest level and date
        manifest.files.sort((a, b) => {
            if (b.interest_level !== a.interest_level) {
                return b.interest_level - a.interest_level;
            }
            return new Date(b.detected_at).getTime() - new Date(a.detected_at).getTime();
        });
        
        // Write manifest file
        fs.writeFileSync(
            path.join(OUTPUT_DIR, 'manifest.json'),
            JSON.stringify(manifest, null, 2)
        );
        
        console.log(`✅ Generated ${manifest.files.length} change detail files`);
        console.log(`📄 Manifest saved with ${manifest.total_changes} total changes`);
        
        // Generate summary stats
        const stats = {
            high_interest: manifest.files.filter(f => f.interest_level >= 8).length,
            medium_interest: manifest.files.filter(f => f.interest_level >= 6 && f.interest_level < 8).length,
            low_interest: manifest.files.filter(f => f.interest_level < 6).length,
            by_company: {}
        };
        
        // Count by company
        manifest.files.forEach(file => {
            stats.by_company[file.company] = (stats.by_company[file.company] || 0) + 1;
        });
        
        console.log('\n📊 Change Details Summary:');
        console.log(`   High Interest (8+): ${stats.high_interest}`);
        console.log(`   Medium Interest (6-7): ${stats.medium_interest}`);
        console.log(`   Low Interest (<6): ${stats.low_interest}`);
        console.log(`   Companies with changes: ${Object.keys(stats.by_company).length}`);
        
        console.log('\n✨ PostgreSQL change details generated successfully!');
        
    } catch (error) {
        console.error('❌ Error generating change details:', error);
        process.exit(1);
    } finally {
        await end(); // Close PostgreSQL connection pool
    }
}

// Run the generator
generateChangeDetails().catch(console.error);
