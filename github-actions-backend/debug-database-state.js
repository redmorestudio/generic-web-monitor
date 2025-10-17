#!/usr/bin/env node

/**
 * Debug Database State
 * Checks what data exists in each of the three databases
 */

const dbManager = require('./db-manager');
const fs = require('fs');
const path = require('path');

console.log('🔍 Database State Diagnostic Tool');
console.log('=================================\n');

// Check if databases exist
console.log('📁 Database Files:');
const dbInfo = dbManager.getDatabaseInfo();
console.log(JSON.stringify(dbInfo, null, 2));
console.log('\n');

if (!dbManager.hasThreeDbArchitecture()) {
    console.error('❌ Three-database architecture not found!');
    process.exit(1);
}

try {
    // Check RAW_CONTENT.DB
    console.log('📊 RAW_CONTENT.DB Analysis:');
    const rawDb = dbManager.getRawDb();
    
    // Check tables
    const rawTables = rawDb.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log('Tables:', rawTables.map(t => t.name).join(', '));
    
    // Check content_snapshots
    const snapshotCount = rawDb.prepare('SELECT COUNT(*) as count FROM content_snapshots').get();
    console.log('Total snapshots:', snapshotCount.count);
    
    const recentSnapshots = rawDb.prepare(`
        SELECT url_id, scraped_at, LENGTH(full_content) as content_size 
        FROM content_snapshots 
        ORDER BY scraped_at DESC 
        LIMIT 5
    `).all();
    console.log('Recent snapshots:');
    recentSnapshots.forEach(s => {
        console.log(`  - URL ID ${s.url_id}: ${s.scraped_at} (${s.content_size} bytes)`);
    });
    console.log('\n');
    
    // Check PROCESSED_CONTENT.DB
    console.log('📊 PROCESSED_CONTENT.DB Analysis:');
    const processedDb = dbManager.getProcessedDb();
    
    const processedTables = processedDb.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log('Tables:', processedTables.map(t => t.name).join(', '));
    
    // Check if markdown_content table exists
    const hasMarkdownTable = processedTables.some(t => t.name === 'markdown_content');
    if (hasMarkdownTable) {
        const markdownCount = processedDb.prepare('SELECT COUNT(*) as count FROM markdown_content').get();
        console.log('Total markdown content:', markdownCount.count);
        
        const recentMarkdown = processedDb.prepare(`
            SELECT url_id, processed_at, LENGTH(markdown_content) as content_size 
            FROM markdown_content 
            ORDER BY processed_at DESC 
            LIMIT 5
        `).all();
        console.log('Recent markdown:');
        recentMarkdown.forEach(m => {
            console.log(`  - URL ID ${m.url_id}: ${m.processed_at} (${m.content_size} bytes)`);
        });
    } else {
        console.log('⚠️ No markdown_content table found!');
    }
    
    // Check change_detection
    const hasChangeTable = processedTables.some(t => t.name === 'change_detection');
    if (hasChangeTable) {
        const changeCount = processedDb.prepare('SELECT COUNT(*) as count FROM change_detection').get();
        console.log('Total changes detected:', changeCount.count);
    }
    console.log('\n');
    
    // Check INTELLIGENCE.DB
    console.log('📊 INTELLIGENCE.DB Analysis:');
    const intelligenceDb = dbManager.getIntelligenceDb();
    
    const intelligenceTables = intelligenceDb.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log('Tables:', intelligenceTables.map(t => t.name).join(', '));
    
    // Check companies
    const hasCompaniesTable = intelligenceTables.some(t => t.name === 'companies');
    if (hasCompaniesTable) {
        const companyCount = intelligenceDb.prepare('SELECT COUNT(*) as count FROM companies').get();
        console.log('Total companies:', companyCount.count);
    } else {
        console.log('⚠️ No companies table found!');
    }
    
    // Check urls
    const hasUrlsTable = intelligenceTables.some(t => t.name === 'urls');
    if (hasUrlsTable) {
        const urlCount = intelligenceDb.prepare('SELECT COUNT(*) as count FROM urls').get();
        console.log('Total URLs:', urlCount.count);
    } else {
        console.log('⚠️ No urls table found!');
    }
    
    // Check baseline_analysis
    const hasBaselineTable = intelligenceTables.some(t => t.name === 'baseline_analysis');
    if (hasBaselineTable) {
        const baselineCount = intelligenceDb.prepare('SELECT COUNT(*) as count FROM baseline_analysis').get();
        console.log('Total baseline analyses:', baselineCount.count);
        
        const recentBaseline = intelligenceDb.prepare(`
            SELECT url_id, created_at, relevance_score 
            FROM baseline_analysis 
            ORDER BY created_at DESC 
            LIMIT 5
        `).all();
        console.log('Recent analyses:');
        recentBaseline.forEach(b => {
            console.log(`  - URL ID ${b.url_id}: ${b.created_at} (score: ${b.relevance_score})`);
        });
    } else {
        console.log('⚠️ No baseline_analysis table found!');
    }
    
    // Check enhanced_analysis
    const hasEnhancedTable = intelligenceTables.some(t => t.name === 'enhanced_analysis');
    if (hasEnhancedTable) {
        const enhancedCount = intelligenceDb.prepare('SELECT COUNT(*) as count FROM enhanced_analysis').get();
        console.log('Total enhanced analyses:', enhancedCount?.count || 0);
    }
    
    console.log('\n');
    
    // Summary
    console.log('📋 SUMMARY:');
    if (snapshotCount.count > 0 && (!hasMarkdownTable || markdownCount.count === 0)) {
        console.log('❌ Raw content exists but no processed markdown - PROCESSOR NOT WORKING');
    }
    if (hasMarkdownTable && markdownCount.count > 0 && (!hasBaselineTable || baselineCount.count === 0)) {
        console.log('❌ Processed content exists but no AI analysis - ANALYZER NOT WORKING');
    }
    if (hasBaselineTable && baselineCount.count > 0) {
        console.log('✅ Full pipeline appears to have data');
        
        // Check if data is recent
        const latestAnalysis = intelligenceDb.prepare(`
            SELECT MAX(created_at) as latest FROM baseline_analysis
        `).get();
        console.log(`Latest analysis: ${latestAnalysis.latest}`);
        
        const daysSinceAnalysis = (new Date() - new Date(latestAnalysis.latest)) / (1000 * 60 * 60 * 24);
        if (daysSinceAnalysis > 1) {
            console.log(`⚠️ Analysis is ${daysSinceAnalysis.toFixed(1)} days old`);
        }
    }
    
} catch (error) {
    console.error('❌ Error checking databases:', error);
    process.exit(1);
}

console.log('\n✅ Diagnostic complete');
