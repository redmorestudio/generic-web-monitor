#!/usr/bin/env node

/**
 * Test Script for AI Change Detection Features
 * 
 * Verifies all components work correctly
 */

const dbManager = require('./db-manager');
const { extractContentSnippets } = require('./generate-static-data-three-db');
const { analyzeChange } = require('./ai-change-analyzer');

async function runTests() {
    console.log('🧪 Running AI Change Detection Tests...\n');
    
    const processedDb = dbManager.getProcessedDb();
    const intelligenceDb = dbManager.getIntelligenceDb();
    
    // Test 1: Content Snippet Extraction
    console.log('Test 1: Content Snippet Extraction');
    console.log('─'.repeat(40));
    
    const testCases = [
        {
            name: 'Normal content change',
            old: 'OpenAI is a research organization focused on artificial intelligence.\n\nWe develop AI systems.',
            new: 'OpenAI is a research organization focused on artificial intelligence.\n\nWe are announcing GPT-5 with revolutionary capabilities.\n\nWe develop AI systems.'
        },
        {
            name: 'No old content',
            old: null,
            new: 'Brand new content here'
        },
        {
            name: 'Very long content',
            old: 'Short content',
            new: 'A'.repeat(1000)
        }
    ];
    
    for (const test of testCases) {
        console.log(`\n📝 ${test.name}:`);
        const result = extractContentSnippets(test.old, test.new);
        console.log('Before:', result.before?.substring(0, 50) + '...');
        console.log('After:', result.after?.substring(0, 50) + '...');
    }
    
    // Test 2: Check Database Schema
    console.log('\n\nTest 2: Database Schema Check');
    console.log('─'.repeat(40));
    
    try {
        // Check if AI columns exist
        const changeRecord = processedDb.prepare(`
            SELECT ai_explanation, ai_key_changes, ai_business_context 
            FROM change_detection 
            LIMIT 1
        `).get();
        
        console.log('✅ AI columns exist in change_detection table');
        
        // Check for recent changes with AI analysis
        const aiAnalyzed = processedDb.prepare(`
            SELECT COUNT(*) as count 
            FROM change_detection 
            WHERE ai_explanation IS NOT NULL
        `).get();
        
        console.log(`✅ Changes with AI analysis: ${aiAnalyzed.count}`);
        
    } catch (error) {
        console.log('❌ AI columns missing:', error.message);
    }
    
    // Test 3: Mock AI Analysis
    console.log('\n\nTest 3: Mock AI Analysis');
    console.log('─'.repeat(40));
    
    const mockChange = {
        old_content: 'OpenAI develops AI systems for research.',
        new_content: 'OpenAI announces GPT-5 launch with new pricing model for API access.',
        url_type: 'homepage'
    };
    
    const mockCompany = {
        name: 'OpenAI',
        category: 'LLM Providers'
    };
    
    const analysis = await analyzeChange(mockChange, mockCompany);
    console.log('AI Explanation:', analysis.explanation);
    console.log('Key Changes:', analysis.key_changes);
    console.log('Business Context:', analysis.business_context);
    
    // Test 4: Integration Test
    console.log('\n\nTest 4: Integration Test - Recent Changes');
    console.log('─'.repeat(40));
    
    const recentChanges = processedDb.prepare(`
        SELECT 
            cd.*,
            mc_old.markdown_text as old_content,
            mc_new.markdown_text as new_content
        FROM change_detection cd
        LEFT JOIN markdown_content mc_old ON cd.old_content_id = mc_old.id
        LEFT JOIN markdown_content mc_new ON cd.new_content_id = mc_new.id
        ORDER BY cd.detected_at DESC
        LIMIT 5
    `).all();
    
    console.log(`Found ${recentChanges.length} recent changes`);
    
    for (const change of recentChanges) {
        console.log(`\nChange ${change.id}:`);
        console.log(`- Has old content: ${!!change.old_content}`);
        console.log(`- Has new content: ${!!change.new_content}`);
        console.log(`- Has AI explanation: ${!!change.ai_explanation}`);
        console.log(`- Interest level: ${change.relevance_score}`);
        
        if (change.old_content && change.new_content) {
            const snippets = extractContentSnippets(change.old_content, change.new_content);
            console.log(`- Snippet extraction: ✅ (${snippets.before?.length || 0} / ${snippets.after?.length || 0} chars)`);
        }
    }
    
    // Test 5: JSON Export Check
    console.log('\n\nTest 5: JSON Export Verification');
    console.log('─'.repeat(40));
    
    const fs = require('fs');
    const path = require('path');
    const changesPath = path.join(__dirname, '..', 'api-data', 'changes.json');
    
    if (fs.existsSync(changesPath)) {
        const changesData = JSON.parse(fs.readFileSync(changesPath, 'utf8'));
        console.log(`✅ changes.json exists with ${changesData.changes.length} changes`);
        
        if (changesData.changes.length > 0) {
            const firstChange = changesData.changes[0];
            console.log('\nFirst change structure:');
            console.log(`- Has before_content: ${!!firstChange.before_content}`);
            console.log(`- Has after_content: ${!!firstChange.after_content}`);
            console.log(`- Has ai_explanation: ${!!firstChange.ai_explanation}`);
            console.log(`- Has key_developments: ${!!firstChange.key_developments}`);
            console.log(`- Has ai_business_context: ${!!firstChange.ai_business_context}`);
        }
    } else {
        console.log('❌ changes.json not found');
    }
    
    console.log('\n\n✅ All tests completed!');
    console.log('\nNext steps:');
    console.log('1. Check the dashboard at the deployed URL');
    console.log('2. Click on a change to see the modal');
    console.log('3. Verify content snippets and AI explanations display correctly');
}

// Run tests
runTests().catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
});
