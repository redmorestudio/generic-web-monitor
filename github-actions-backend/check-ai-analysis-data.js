#!/usr/bin/env node

// SSL Certificate fix for Heroku PostgreSQL
if (process.env.NODE_ENV === 'production' || process.env.POSTGRES_CONNECTION_STRING) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const { db, end } = require('./postgres-db');

async function checkAIAnalysisData() {
    console.log('🔍 Checking PostgreSQL for AI Analysis Data');
    console.log('=' .repeat(60));
    
    try {
        // Check intelligence.changes table
        console.log('\n📊 Checking intelligence.changes table:');
        const changesCount = await db.get(`
            SELECT 
                COUNT(*) as total_changes,
                COUNT(CASE WHEN analysis IS NOT NULL THEN 1 END) as with_analysis,
                COUNT(CASE WHEN interest_level >= 7 THEN 1 END) as high_interest
            FROM intelligence.changes
        `);
        console.log('Total changes:', changesCount.total_changes);
        console.log('With AI analysis:', changesCount.with_analysis);
        console.log('High interest (7+):', changesCount.high_interest);
        
        // Sample a change with analysis
        const sampleChange = await db.get(`
            SELECT id, company, url, interest_level, analysis
            FROM intelligence.changes
            WHERE analysis IS NOT NULL
            LIMIT 1
        `);
        
        if (sampleChange) {
            console.log('\nSample change with analysis:');
            console.log('ID:', sampleChange.id);
            console.log('Company:', sampleChange.company);
            console.log('URL:', sampleChange.url);
            console.log('Interest:', sampleChange.interest_level);
            console.log('Analysis preview:', JSON.stringify(sampleChange.analysis).substring(0, 200) + '...');
        }
        
        // Check intelligence.enhanced_analysis table
        console.log('\n📈 Checking intelligence.enhanced_analysis table:');
        const enhancedCount = await db.get(`
            SELECT 
                COUNT(*) as total_enhanced,
                COUNT(CASE WHEN ultra_analysis IS NOT NULL THEN 1 END) as with_ultra,
                COUNT(CASE WHEN business_impact IS NOT NULL THEN 1 END) as with_impact
            FROM intelligence.enhanced_analysis
        `);
        console.log('Total enhanced analyses:', enhancedCount.total_enhanced);
        console.log('With ultra analysis:', enhancedCount.with_ultra);
        console.log('With business impact:', enhancedCount.with_impact);
        
        // Check change_detection table (original)
        console.log('\n📋 Checking processed_content.change_detection table:');
        const detectionCount = await db.get(`
            SELECT 
                COUNT(*) as total_detections,
                COUNT(CASE WHEN ai_analysis IS NOT NULL THEN 1 END) as with_ai_analysis
            FROM processed_content.change_detection
        `);
        console.log('Total detections:', detectionCount.total_detections);
        console.log('With AI analysis:', detectionCount.with_ai_analysis);
        
        // Check if tables are properly linked
        console.log('\n🔗 Checking table relationships:');
        const linkedData = await db.get(`
            SELECT COUNT(*) as linked_count
            FROM intelligence.changes c
            JOIN intelligence.enhanced_analysis ea ON c.id = ea.change_id
        `);
        console.log('Changes linked to enhanced analysis:', linkedData.linked_count);
        
        // Get recent high-value changes
        console.log('\n⭐ Recent high-value changes:');
        const recentHighValue = await db.all(`
            SELECT 
                c.company,
                c.interest_level,
                c.detected_at,
                CASE 
                    WHEN c.analysis IS NOT NULL THEN 'Yes'
                    ELSE 'No'
                END as has_basic_analysis,
                CASE 
                    WHEN ea.ultra_analysis IS NOT NULL THEN 'Yes'
                    ELSE 'No'
                END as has_enhanced_analysis
            FROM intelligence.changes c
            LEFT JOIN intelligence.enhanced_analysis ea ON c.id = ea.change_id
            WHERE c.interest_level >= 7
            AND c.detected_at > NOW() - INTERVAL '7 days'
            ORDER BY c.detected_at DESC
            LIMIT 5
        `);
        
        if (recentHighValue.length > 0) {
            console.table(recentHighValue);
        } else {
            console.log('No high-value changes in last 7 days');
        }
        
    } catch (error) {
        console.error('❌ Error checking data:', error);
    } finally {
        await end();
    }
}

checkAIAnalysisData().catch(console.error);
