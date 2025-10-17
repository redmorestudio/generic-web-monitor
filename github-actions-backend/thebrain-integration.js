#!/usr/bin/env node

/**
 * TheBrain Integration for AI Monitor
 * 
 * This script syncs monitoring data to TheBrain for visualization
 * and knowledge management.
 */

const axios = require('axios');
const Database = require('better-sqlite3');
const path = require('path');
// Only load dotenv in development (not in GitHub Actions)
if (!process.env.GITHUB_ACTIONS && !process.env.POSTGRES_CONNECTION_STRING) {
  try {
    require('dotenv').config();
  } catch (e) {
    // dotenv not available or no .env file - this is fine
  }
}

// Configuration - Use environment variables (no hardcoded keys!)
const THEBRAIN_API_KEY = process.env.THEBRAIN_API_KEY;
const THEBRAIN_BRAIN_ID = process.env.THEBRAIN_BRAIN_ID;
const THEBRAIN_API_URL = 'https://api.thebrain.com/v1';

class TheBrainIntegration {
    constructor() {
        // Validate environment variables
        if (!THEBRAIN_API_KEY) {
            throw new Error('THEBRAIN_API_KEY environment variable is required');
        }
        if (!THEBRAIN_BRAIN_ID) {
            throw new Error('THEBRAIN_BRAIN_ID environment variable is required');
        }
        
        this.apiKey = THEBRAIN_API_KEY;
        this.brainId = THEBRAIN_BRAIN_ID;
        this.headers = {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
        };
        this.db = null;
        this.rootThoughtId = null;
    }

    async initialize() {
        console.log('🧠 Initializing TheBrain Integration...');
        console.log('   Brain ID:', this.brainId);
        
        // Open database
        const dbPath = path.join(__dirname, 'data', 'monitor.db');
        this.db = new Database(dbPath);
        
        // Test connection
        await this.testConnection();
        
        // Get or create root thought
        await this.ensureRootThought();
    }

    async testConnection() {
        try {
            console.log('🔌 Testing TheBrain connection...');
            const response = await axios.get(
                `${THEBRAIN_API_URL}/brains/${this.brainId}`,
                { headers: this.headers }
            );
            console.log(`✅ Connected to brain: ${response.data.name}`);
        } catch (error) {
            console.error('❌ Failed to connect to TheBrain:', error.message);
            throw error;
        }
    }

    async ensureRootThought() {
        try {
            // Search for existing root thought
            const searchResponse = await axios.post(
                `${THEBRAIN_API_URL}/brains/${this.brainId}/thoughts/search`,
                {
                    queryText: 'AI Competitive Monitor',
                    onlySearchThoughtNames: true,
                    maxResults: 1
                },
                { headers: this.headers }
            );

            if (searchResponse.data.searchResults && searchResponse.data.searchResults.length > 0) {
                this.rootThoughtId = searchResponse.data.searchResults[0].id;
                console.log('📍 Found existing root thought:', this.rootThoughtId);
            } else {
                // Create root thought
                const createResponse = await axios.post(
                    `${THEBRAIN_API_URL}/brains/${this.brainId}/thoughts`,
                    {
                        name: 'AI Competitive Monitor',
                        label: 'AI Monitor Hub',
                        kind: 1, // Normal thought
                        foregroundColor: '#00ff88',
                        backgroundColor: '#1a1a2e'
                    },
                    { headers: this.headers }
                );
                this.rootThoughtId = createResponse.data.id;
                console.log('✅ Created root thought:', this.rootThoughtId);
            }
        } catch (error) {
            console.error('❌ Error ensuring root thought:', error.message);
            throw error;
        }
    }

    async syncCompanies() {
        console.log('\n🏢 Syncing companies to TheBrain...');
        
        const companies = this.db.prepare(`
            SELECT c.*, COUNT(u.id) as url_count
            FROM companies c
            LEFT JOIN urls u ON c.id = u.company_id
            GROUP BY c.id
            ORDER BY c.name
        `).all();

        for (const company of companies) {
            try {
                // Search for existing company thought
                const searchResponse = await axios.post(
                    `${THEBRAIN_API_URL}/brains/${this.brainId}/thoughts/search`,
                    {
                        queryText: company.name,
                        onlySearchThoughtNames: true,
                        maxResults: 1
                    },
                    { headers: this.headers }
                );

                let companyThoughtId;
                
                if (searchResponse.data.searchResults && searchResponse.data.searchResults.length > 0) {
                    companyThoughtId = searchResponse.data.searchResults[0].id;
                    console.log(`   📌 Found existing thought for ${company.name}`);
                } else {
                    // Create company thought
                    const createResponse = await axios.post(
                        `${THEBRAIN_API_URL}/brains/${this.brainId}/thoughts`,
                        {
                            name: company.name,
                            label: `${company.type || 'Competitor'} - ${company.url_count} URLs`,
                            kind: 1,
                            sourceThoughtId: this.rootThoughtId,
                            relation: 1, // Child
                            foregroundColor: '#667eea',
                            backgroundColor: '#2a2a3e'
                        },
                        { headers: this.headers }
                    );
                    companyThoughtId = createResponse.data.id;
                    console.log(`   ✅ Created thought for ${company.name}`);
                }

                // Add/Update note with company details
                const urls = this.db.prepare('SELECT url FROM urls WHERE company_id = ?').all(company.id);
                const noteContent = this.generateCompanyNote(company, urls);
                
                await axios.post(
                    `${THEBRAIN_API_URL}/brains/${this.brainId}/thoughts/${companyThoughtId}/notes`,
                    {
                        markdown: noteContent
                    },
                    { headers: this.headers }
                );

                // Rate limiting
                await new Promise(resolve => setTimeout(resolve, 500));

            } catch (error) {
                console.error(`   ❌ Error syncing ${company.name}:`, error.message);
            }
        }
    }

    generateCompanyNote(company, urls) {
        return `# ${company.name}

## Overview
- **Type**: ${company.type || 'Competitor'}
- **URLs Monitored**: ${urls.length}
- **Added**: ${new Date(company.created_at).toLocaleDateString()}

## Monitored URLs
${urls.map(u => `- ${u.url}`).join('\n')}

## Recent Activity
Check the AI Monitor dashboard for latest changes and insights.

---
*Last updated: ${new Date().toLocaleString()}*`;
    }

    async syncHighRelevanceChanges() {
        console.log('\n🔥 Syncing high-relevance changes to TheBrain...');
        
        const changes = this.db.prepare(`
            SELECT 
                ch.*,
                aa.relevance_score,
                aa.summary,
                aa.category,
                aa.raw_response,
                u.url,
                c.name as company_name,
                c.id as company_id
            FROM changes ch
            JOIN ai_analysis aa ON ch.id = aa.change_id
            JOIN urls u ON ch.url_id = u.id
            JOIN companies c ON u.company_id = c.id
            WHERE aa.relevance_score >= 7
                AND ch.created_at > datetime('now', '-7 days')
            ORDER BY aa.relevance_score DESC, ch.created_at DESC
            LIMIT 20
        `).all();

        console.log(`   Found ${changes.length} high-relevance changes to sync`);

        for (const change of changes) {
            try {
                // Parse full AI analysis
                let fullAnalysis = {};
                try {
                    fullAnalysis = JSON.parse(change.raw_response);
                } catch (e) {
                    console.log(`   ⚠️ Could not parse AI analysis for change ${change.id}`);
                }

                // Create thought for significant change
                const thoughtName = `${change.company_name}: ${change.category || 'Change'}`;
                const createResponse = await axios.post(
                    `${THEBRAIN_API_URL}/brains/${this.brainId}/thoughts`,
                    {
                        name: thoughtName,
                        label: `Relevance: ${change.relevance_score}/10`,
                        kind: 3, // Event
                        sourceThoughtId: this.rootThoughtId,
                        relation: 1, // Child
                        foregroundColor: change.relevance_score >= 8 ? '#ff4444' : '#ffa726',
                        backgroundColor: '#1e1e3e'
                    },
                    { headers: this.headers }
                );

                const changeThoughtId = createResponse.data.id;
                console.log(`   ✅ Created thought for ${thoughtName}`);

                // Add detailed note
                const noteContent = this.generateChangeNote(change, fullAnalysis);
                await axios.post(
                    `${THEBRAIN_API_URL}/brains/${this.brainId}/thoughts/${changeThoughtId}/notes`,
                    {
                        markdown: noteContent
                    },
                    { headers: this.headers }
                );

                // Link to company thought
                const companySearchResponse = await axios.post(
                    `${THEBRAIN_API_URL}/brains/${this.brainId}/thoughts/search`,
                    {
                        queryText: change.company_name,
                        onlySearchThoughtNames: true,
                        maxResults: 1
                    },
                    { headers: this.headers }
                );

                if (companySearchResponse.data.searchResults && companySearchResponse.data.searchResults.length > 0) {
                    const companyThoughtId = companySearchResponse.data.searchResults[0].id;
                    
                    // Create link between change and company
                    await axios.post(
                        `${THEBRAIN_API_URL}/brains/${this.brainId}/links`,
                        {
                            thoughtIdA: changeThoughtId,
                            thoughtIdB: companyThoughtId,
                            relation: 3, // Jump
                            name: 'Related to',
                            color: '#667eea'
                        },
                        { headers: this.headers }
                    );
                }

                // Rate limiting
                await new Promise(resolve => setTimeout(resolve, 500));

            } catch (error) {
                console.error(`   ❌ Error syncing change for ${change.company_name}:`, error.message);
            }
        }
    }

    generateChangeNote(change, fullAnalysis) {
        const scores = fullAnalysis.summary?.scores || {};
        const takeaways = fullAnalysis.summary?.key_takeaways || [];
        const actions = fullAnalysis.summary?.recommended_actions || [];
        
        return `# ${change.company_name}: ${change.category || 'Change Detected'}

## Executive Summary
${change.summary || 'No summary available'}

## Change Details
- **URL**: ${change.url}
- **Date**: ${new Date(change.created_at).toLocaleString()}
- **Change Magnitude**: ${change.change_percentage || 0}%
- **Relevance Score**: ${change.relevance_score}/10

## AI Analysis Scores
- **Overall Relevance**: ${scores.overall_relevance || 'N/A'}/10
- **Strategic Impact**: ${scores.strategic_impact || 'N/A'}/10
- **Urgency**: ${scores.urgency || 'N/A'}/10
- **Competitive Threat**: ${scores.competitive_threat || 'N/A'}/10
- **Innovation Significance**: ${scores.innovation_significance || 'N/A'}/10

## Key Takeaways
${takeaways.map(t => `- ${t}`).join('\n') || '- No takeaways available'}

## Recommended Actions
${actions.map(a => `1. ${a}`).join('\n') || '1. Continue monitoring'}

## Categories
- **Primary**: ${change.category || 'Uncategorized'}
${fullAnalysis.categorization?.secondary_categories ? 
    fullAnalysis.categorization.secondary_categories.map(c => `- ${c.category} (${c.confidence})`).join('\n') : ''}

---
*AI Analysis completed: ${new Date().toLocaleString()}*`;
    }

    async createExecutiveBriefThought() {
        console.log('\n📋 Creating Executive Brief thought...');
        
        try {
            const briefPath = path.join(__dirname, 'data', `executive-brief-${new Date().toISOString().split('T')[0]}.json`);
            
            if (require('fs').existsSync(briefPath)) {
                const briefData = JSON.parse(require('fs').readFileSync(briefPath, 'utf8'));
                
                const createResponse = await axios.post(
                    `${THEBRAIN_API_URL}/brains/${this.brainId}/thoughts`,
                    {
                        name: `Executive Brief: ${new Date().toLocaleDateString()}`,
                        label: 'Weekly Intelligence Summary',
                        kind: 1,
                        sourceThoughtId: this.rootThoughtId,
                        relation: 1,
                        foregroundColor: '#00ff88',
                        backgroundColor: '#1a1a2e'
                    },
                    { headers: this.headers }
                );

                const briefThoughtId = createResponse.data.id;
                
                // Add brief content as note
                await axios.post(
                    `${THEBRAIN_API_URL}/brains/${this.brainId}/thoughts/${briefThoughtId}/notes`,
                    {
                        markdown: briefData.content
                    },
                    { headers: this.headers }
                );

                console.log('   ✅ Created Executive Brief thought');
            } else {
                console.log('   ℹ️ No executive brief found for today');
            }
        } catch (error) {
            console.error('   ❌ Error creating executive brief thought:', error.message);
        }
    }

    async syncAll() {
        try {
            await this.initialize();
            await this.syncCompanies();
            await this.syncHighRelevanceChanges();
            await this.createExecutiveBriefThought();
            
            console.log('\n✅ TheBrain sync complete!');
            console.log(`🧠 View in TheBrain: https://app.thebrain.com/brain/${this.brainId}`);
            
        } catch (error) {
            console.error('❌ Fatal error during sync:', error);
            process.exit(1);
        } finally {
            if (this.db) {
                this.db.close();
            }
        }
    }
}

// Main execution
async function main() {
    const integration = new TheBrainIntegration();
    await integration.syncAll();
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = TheBrainIntegration;
