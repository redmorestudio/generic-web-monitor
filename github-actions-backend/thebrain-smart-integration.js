#!/usr/bin/env node

/**
 * TheBrain Smart Integration for AI Monitor
 * 
 * Creates an intelligent knowledge graph with:
 * - Smart groups by category
 * - Individual thoughts for products, technologies, concepts
 * - Meaningful connections showing relationships
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

const THEBRAIN_API_KEY = process.env.THEBRAIN_API_KEY;
const THEBRAIN_BRAIN_ID = process.env.THEBRAIN_BRAIN_ID;
const THEBRAIN_API_URL = 'https://api.thebrain.com/v1';

class TheBrainSmartIntegration {
    constructor() {
        if (!THEBRAIN_API_KEY || !THEBRAIN_BRAIN_ID) {
            throw new Error('TheBrain API credentials required in environment');
        }
        
        this.apiKey = THEBRAIN_API_KEY;
        this.brainId = THEBRAIN_BRAIN_ID;
        this.headers = {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
        };
        this.db = null;
        this.thoughtCache = new Map();
        this.rootThoughtId = null;
    }

    async initialize() {
        console.log('🧠 Initializing Smart TheBrain Integration...');
        
        const dbPath = path.join(__dirname, 'data', 'monitor.db');
        this.db = new Database(dbPath);
        
        await this.testConnection();
        await this.ensureRootThought();
        await this.setupSmartGroups();
    }

    async testConnection() {
        try {
            const response = await axios.get(
                `${THEBRAIN_API_URL}/brains/${this.brainId}`,
                { headers: this.headers }
            );
            console.log(`✅ Connected to brain: ${response.data.name}`);
        } catch (error) {
            throw new Error(`Failed to connect: ${error.message}`);
        }
    }

    async ensureRootThought() {
        const searchResponse = await axios.post(
            `${THEBRAIN_API_URL}/brains/${this.brainId}/thoughts/search`,
            {
                queryText: 'AI Competitive Monitor',
                onlySearchThoughtNames: true,
                maxResults: 1
            },
            { headers: this.headers }
        );

        if (searchResponse.data.searchResults?.length > 0) {
            this.rootThoughtId = searchResponse.data.searchResults[0].id;
            console.log('📍 Found root thought');
        } else {
            const createResponse = await axios.post(
                `${THEBRAIN_API_URL}/brains/${this.brainId}/thoughts`,
                {
                    name: 'AI Competitive Monitor',
                    label: 'Intelligence Hub',
                    kind: 1,
                    foregroundColor: '#00ff88',
                    backgroundColor: '#1a1a2e'
                },
                { headers: this.headers }
            );
            this.rootThoughtId = createResponse.data.id;
            console.log('✅ Created root thought');
        }
        this.thoughtCache.set('root', this.rootThoughtId);
    }

    async setupSmartGroups() {
        console.log('\n🎯 Setting up Smart Groups...');
        
        const smartGroups = [
            // Category Groups
            { name: '🤖 LLM Providers', color: '#ff6b6b', query: "type = 'llm_provider'" },
            { name: '💻 AI Coding Tools', color: '#4ecdc4', query: "type = 'ai_coding'" },
            { name: '🎨 AI Image Generation', color: '#f7b731', query: "type = 'ai_image'" },
            { name: '🎬 AI Video Generation', color: '#5f27cd', query: "type = 'ai_video'" },
            { name: '🎤 AI Voice & Audio', color: '#00d2d3', query: "type = 'ai_voice'" },
            { name: '🔍 AI Search Engines', color: '#ff9ff3', query: "type = 'ai_search'" },
            { name: '🏢 Enterprise AI', color: '#48dbfb', query: "type = 'enterprise_ai'" },
            { name: '⚡ AI Infrastructure', color: '#0abde3', query: "type = 'ai_infrastructure'" },
            { name: '🖥️ AI Hardware', color: '#ee5a24', query: "type = 'ai_hardware'" },
            
            // Concept Groups
            { name: '🧩 Products & Services', color: '#6c5ce7', isConceptGroup: true },
            { name: '🔬 Technologies', color: '#a29bfe', isConceptGroup: true },
            { name: '💡 AI Concepts', color: '#fd79a8', isConceptGroup: true },
            { name: '🏷️ Keywords & Topics', color: '#fdcb6e', isConceptGroup: true },
            
            // Intelligence Groups
            { name: '🚨 High Priority Changes', color: '#ff4444', isIntelligence: true },
            { name: '📈 Market Movements', color: '#ff8800', isIntelligence: true },
            { name: '🤝 Partnerships & Alliances', color: '#00cc88', isIntelligence: true },
            { name: '🚀 Product Launches', color: '#667eea', isIntelligence: true }
        ];

        for (const group of smartGroups) {
            await this.createOrUpdateThought(
                group.name,
                {
                    kind: 2, // Type
                    label: group.isConceptGroup ? 'Concept Group' : 
                           group.isIntelligence ? 'Intelligence' : 'Smart Group',
                    foregroundColor: group.color,
                    sourceThoughtId: this.rootThoughtId,
                    relation: 1
                }
            );
            await new Promise(resolve => setTimeout(resolve, 300));
        }
    }

    async syncAll() {
        try {
            await this.initialize();
            
            // Phase 1: Sync companies with smart categorization
            await this.syncCompaniesWithCategories();
            
            // Phase 2: Extract and sync products/technologies
            await this.syncProductsAndTechnologies();
            
            // Phase 3: Sync high-relevance changes with intelligence
            await this.syncIntelligentChanges();
            
            // Phase 4: Create concept and keyword network
            await this.createConceptNetwork();
            
            // Phase 5: Build competitive relationships
            await this.buildCompetitiveRelationships();
            
            console.log('\n✅ Smart TheBrain sync complete!');
            console.log(`🧠 View in TheBrain: https://app.thebrain.com/brain/${this.brainId}`);
            
        } catch (error) {
            console.error('❌ Fatal error:', error);
        } finally {
            if (this.db) this.db.close();
        }
    }

    async syncCompaniesWithCategories() {
        console.log('\n🏢 Syncing companies to smart groups...');
        
        const companies = this.db.prepare(`
            SELECT c.*, COUNT(u.id) as url_count
            FROM companies c
            LEFT JOIN urls u ON c.id = u.company_id
            GROUP BY c.id
            ORDER BY c.type, c.name
        `).all();

        const typeToGroupMap = {
            'llm_provider': '🤖 LLM Providers',
            'ai_coding': '💻 AI Coding Tools',
            'ai_image': '🎨 AI Image Generation',
            'ai_video': '🎬 AI Video Generation',
            'ai_voice': '🎤 AI Voice & Audio',
            'ai_search': '🔍 AI Search Engines',
            'enterprise_ai': '🏢 Enterprise AI',
            'ai_infrastructure': '⚡ AI Infrastructure',
            'ai_hardware': '🖥️ AI Hardware'
        };

        for (const company of companies) {
            const groupName = typeToGroupMap[company.type] || '🏢 Enterprise AI';
            const groupThoughtId = await this.getThoughtIdByName(groupName);
            
            if (!groupThoughtId) continue;
            
            // Create company thought under appropriate group
            const companyThoughtId = await this.createOrUpdateThought(
                company.name,
                {
                    label: `${company.url_count} URLs monitored`,
                    kind: 1,
                    sourceThoughtId: groupThoughtId,
                    relation: 1,
                    foregroundColor: '#667eea'
                }
            );
            
            // Add detailed note
            const noteContent = this.generateSmartCompanyNote(company);
            await this.updateThoughtNote(companyThoughtId, noteContent);
            
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    }

    async syncProductsAndTechnologies() {
        console.log('\n🧩 Extracting and syncing products & technologies...');
        
        // Get all extracted content with products/technologies
        const extractedData = this.db.prepare(`
            SELECT DISTINCT 
                e.company,
                e.extracted_content,
                e.keywords,
                aa.raw_response
            FROM extracted_info e
            LEFT JOIN ai_analysis aa ON e.url = aa.change_id
            WHERE e.keywords IS NOT NULL
            ORDER BY e.timestamp DESC
            LIMIT 100
        `).all();

        const productsGroupId = await this.getThoughtIdByName('🧩 Products & Services');
        const techGroupId = await this.getThoughtIdByName('🔬 Technologies');
        
        const products = new Set();
        const technologies = new Set();
        const productCompanyMap = new Map();
        
        // Extract products and technologies
        for (const item of extractedData) {
            const keywords = this.parseKeywords(item.keywords);
            
            // Smart extraction based on patterns
            keywords.forEach(keyword => {
                if (this.isProduct(keyword)) {
                    products.add(keyword);
                    if (!productCompanyMap.has(keyword)) {
                        productCompanyMap.set(keyword, new Set());
                    }
                    productCompanyMap.get(keyword).add(item.company);
                } else if (this.isTechnology(keyword)) {
                    technologies.add(keyword);
                }
            });
            
            // Also extract from AI analysis if available
            if (item.raw_response) {
                try {
                    const analysis = JSON.parse(item.raw_response);
                    if (analysis.entities) {
                        analysis.entities.products?.forEach(p => {
                            products.add(p);
                            if (!productCompanyMap.has(p)) {
                                productCompanyMap.set(p, new Set());
                            }
                            productCompanyMap.get(p).add(item.company);
                        });
                        analysis.entities.technologies?.forEach(t => technologies.add(t));
                    }
                } catch (e) {}
            }
        }

        // Create product thoughts
        console.log(`   Creating ${products.size} product thoughts...`);
        for (const product of products) {
            const productThoughtId = await this.createOrUpdateThought(
                product,
                {
                    label: 'Product',
                    kind: 1,
                    sourceThoughtId: productsGroupId,
                    relation: 1,
                    foregroundColor: '#6c5ce7'
                }
            );
            
            // Link to companies that have this product
            const companies = productCompanyMap.get(product) || new Set();
            for (const companyName of companies) {
                const companyThoughtId = await this.getThoughtIdByName(companyName);
                if (companyThoughtId) {
                    await this.createLink(productThoughtId, companyThoughtId, 'offers', '#6c5ce7');
                }
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Create technology thoughts
        console.log(`   Creating ${technologies.size} technology thoughts...`);
        for (const tech of technologies) {
            await this.createOrUpdateThought(
                tech,
                {
                    label: 'Technology',
                    kind: 1,
                    sourceThoughtId: techGroupId,
                    relation: 1,
                    foregroundColor: '#a29bfe'
                }
            );
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    async syncIntelligentChanges() {
        console.log('\n🚨 Syncing high-relevance changes with intelligence...');
        
        const changes = this.db.prepare(`
            SELECT 
                ch.*,
                aa.relevance_score,
                aa.summary,
                aa.category,
                aa.raw_response,
                u.url,
                c.name as company_name
            FROM changes ch
            JOIN ai_analysis aa ON ch.id = aa.change_id
            JOIN urls u ON ch.url_id = u.id
            JOIN companies c ON u.company_id = c.id
            WHERE aa.relevance_score >= 6
                AND ch.created_at > datetime('now', '-30 days')
            ORDER BY aa.relevance_score DESC, ch.created_at DESC
            LIMIT 50
        `).all();

        const categoryToGroupMap = {
            'Product Launch': '🚀 Product Launches',
            'Partnership': '🤝 Partnerships & Alliances',
            'Pricing Change': '📈 Market Movements',
            'Feature Update': '🚀 Product Launches',
            'Strategic Move': '📈 Market Movements'
        };

        for (const change of changes) {
            let fullAnalysis = {};
            try {
                fullAnalysis = JSON.parse(change.raw_response);
            } catch (e) {}

            const category = change.category || 'Change';
            const groupName = categoryToGroupMap[category] || '🚨 High Priority Changes';
            const groupThoughtId = await this.getThoughtIdByName(groupName);
            
            if (!groupThoughtId) continue;

            // Create change thought
            const thoughtName = `${change.company_name}: ${category}`;
            const changeThoughtId = await this.createOrUpdateThought(
                thoughtName,
                {
                    label: `Score: ${change.relevance_score}/10`,
                    kind: 3, // Event
                    sourceThoughtId: groupThoughtId,
                    relation: 1,
                    foregroundColor: change.relevance_score >= 8 ? '#ff4444' : '#ff8800'
                }
            );

            // Add intelligent note
            const noteContent = this.generateIntelligentChangeNote(change, fullAnalysis);
            await this.updateThoughtNote(changeThoughtId, noteContent);

            // Link to company
            const companyThoughtId = await this.getThoughtIdByName(change.company_name);
            if (companyThoughtId) {
                await this.createLink(changeThoughtId, companyThoughtId, 'affects', '#ff8800');
            }

            // Extract and link related products/technologies
            if (fullAnalysis.entities) {
                for (const product of (fullAnalysis.entities.products || [])) {
                    const productThoughtId = await this.getThoughtIdByName(product);
                    if (productThoughtId) {
                        await this.createLink(changeThoughtId, productThoughtId, 'involves', '#667eea');
                    }
                }
            }

            await new Promise(resolve => setTimeout(resolve, 200));
        }
    }

    async createConceptNetwork() {
        console.log('\n💡 Building concept and keyword network...');
        
        const conceptsGroupId = await this.getThoughtIdByName('💡 AI Concepts');
        const keywordsGroupId = await this.getThoughtIdByName('🏷️ Keywords & Topics');
        
        // Define core AI concepts
        const concepts = [
            { name: 'Large Language Models', related: ['GPT', 'Claude', 'Gemini', 'LLaMA'] },
            { name: 'Multimodal AI', related: ['Vision', 'Audio', 'Text'] },
            { name: 'Code Generation', related: ['Copilot', 'Cursor', 'Codeium'] },
            { name: 'AI Safety', related: ['Alignment', 'Ethics', 'Responsible AI'] },
            { name: 'Edge Computing', related: ['On-device AI', 'Privacy'] },
            { name: 'AI Infrastructure', related: ['GPU', 'TPU', 'Cloud'] }
        ];

        for (const concept of concepts) {
            const conceptThoughtId = await this.createOrUpdateThought(
                concept.name,
                {
                    label: 'Core Concept',
                    kind: 1,
                    sourceThoughtId: conceptsGroupId,
                    relation: 1,
                    foregroundColor: '#fd79a8'
                }
            );

            // Link to related technologies
            for (const related of concept.related) {
                const relatedThoughtId = await this.getThoughtIdByName(related);
                if (relatedThoughtId) {
                    await this.createLink(conceptThoughtId, relatedThoughtId, 'encompasses', '#fd79a8');
                }
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    async buildCompetitiveRelationships() {
        console.log('\n🤝 Building competitive relationships...');
        
        // Define competitive relationships
        const competitiveGroups = [
            {
                name: 'LLM Competition',
                competitors: ['OpenAI', 'Anthropic', 'Google', 'Mistral AI', 'Meta AI']
            },
            {
                name: 'AI Coding Competition',
                competitors: ['GitHub Copilot', 'Cursor', 'Codeium', 'Tabnine', 'Amazon CodeWhisperer']
            },
            {
                name: 'AI Image Competition',
                competitors: ['Midjourney', 'Stability AI', 'Leonardo AI', 'Adobe Firefly']
            }
        ];

        for (const group of competitiveGroups) {
            // Create connections between competitors
            for (let i = 0; i < group.competitors.length; i++) {
                for (let j = i + 1; j < group.competitors.length; j++) {
                    const thoughtA = await this.getThoughtIdByName(group.competitors[i]);
                    const thoughtB = await this.getThoughtIdByName(group.competitors[j]);
                    
                    if (thoughtA && thoughtB) {
                        await this.createLink(thoughtA, thoughtB, 'competes with', '#ff6b6b', 3); // Jump link
                    }
                }
            }
        }
    }

    // Helper methods
    async createOrUpdateThought(name, options = {}) {
        try {
            // Check cache first
            if (this.thoughtCache.has(name)) {
                return this.thoughtCache.get(name);
            }

            // Search for existing
            const searchResponse = await axios.post(
                `${THEBRAIN_API_URL}/brains/${this.brainId}/thoughts/search`,
                {
                    queryText: name,
                    onlySearchThoughtNames: true,
                    maxResults: 1
                },
                { headers: this.headers }
            );

            if (searchResponse.data.searchResults?.length > 0) {
                const thoughtId = searchResponse.data.searchResults[0].id;
                this.thoughtCache.set(name, thoughtId);
                return thoughtId;
            }

            // Create new
            const createResponse = await axios.post(
                `${THEBRAIN_API_URL}/brains/${this.brainId}/thoughts`,
                {
                    name,
                    ...options
                },
                { headers: this.headers }
            );

            const thoughtId = createResponse.data.id;
            this.thoughtCache.set(name, thoughtId);
            return thoughtId;

        } catch (error) {
            console.error(`Error creating thought "${name}":`, error.message);
            return null;
        }
    }

    async getThoughtIdByName(name) {
        if (this.thoughtCache.has(name)) {
            return this.thoughtCache.get(name);
        }

        try {
            const searchResponse = await axios.post(
                `${THEBRAIN_API_URL}/brains/${this.brainId}/thoughts/search`,
                {
                    queryText: name,
                    onlySearchThoughtNames: true,
                    maxResults: 1
                },
                { headers: this.headers }
            );

            if (searchResponse.data.searchResults?.length > 0) {
                const thoughtId = searchResponse.data.searchResults[0].id;
                this.thoughtCache.set(name, thoughtId);
                return thoughtId;
            }
        } catch (error) {
            console.error(`Error finding thought "${name}":`, error.message);
        }
        return null;
    }

    async createLink(thoughtIdA, thoughtIdB, name, color, relation = 3) {
        try {
            await axios.post(
                `${THEBRAIN_API_URL}/brains/${this.brainId}/links`,
                {
                    thoughtIdA,
                    thoughtIdB,
                    relation, // 3 = Jump
                    name,
                    color
                },
                { headers: this.headers }
            );
        } catch (error) {
            // Link might already exist
        }
    }

    async updateThoughtNote(thoughtId, markdown) {
        try {
            await axios.post(
                `${THEBRAIN_API_URL}/brains/${this.brainId}/thoughts/${thoughtId}/notes`,
                { markdown },
                { headers: this.headers }
            );
        } catch (error) {
            console.error('Error updating note:', error.message);
        }
    }

    parseKeywords(keywordsStr) {
        if (!keywordsStr || keywordsStr === '[]') return [];
        try {
            return JSON.parse(keywordsStr);
        } catch (e) {
            return keywordsStr.split(',').map(k => k.trim()).filter(k => k);
        }
    }

    isProduct(keyword) {
        const productPatterns = [
            /GPT-\d/, /Claude/, /Gemini/, /Copilot/, /CodeWhisperer/,
            /Midjourney/, /DALL-E/, /Firefly/, /Stable Diffusion/,
            /v\d+/, /Pro$/, /API$/, /SDK$/
        ];
        return productPatterns.some(pattern => pattern.test(keyword));
    }

    isTechnology(keyword) {
        const techPatterns = [
            /LLM/, /Transformer/, /Neural/, /Model/, /AI$/, /ML$/,
            /Vision/, /NLP/, /Generation/, /Synthesis/, /Recognition/
        ];
        return techPatterns.some(pattern => pattern.test(keyword));
    }

    generateSmartCompanyNote(company) {
        const urls = this.db.prepare('SELECT url, type FROM urls WHERE company_id = ?').all(company.id);
        
        return `# ${company.name}

## Company Profile
- **Category**: ${company.type?.replace(/_/g, ' ').toUpperCase()}
- **URLs Monitored**: ${urls.length}
- **Added**: ${new Date(company.created_at).toLocaleDateString()}

## Monitored Endpoints
${urls.map(u => `- **${u.type}**: ${u.url}`).join('\n')}

## Competitive Intelligence
- Monitor for: Product launches, pricing changes, partnerships
- Key competitors: See connected thoughts
- Market position: ${this.getMarketPosition(company.type)}

## Recent Activity
Check child thoughts for latest changes and insights.

---
*Smart sync: ${new Date().toLocaleString()}*`;
    }

    generateIntelligentChangeNote(change, analysis) {
        const scores = analysis.summary?.scores || {};
        const entities = analysis.entities || {};
        
        return `# ${change.company_name}: ${change.category || 'Strategic Change'}

## 🎯 Executive Summary
${change.summary || 'Significant change detected requiring attention.'}

## 📊 Intelligence Scores
- **Overall Relevance**: ${scores.overall_relevance || change.relevance_score}/10
- **Strategic Impact**: ${scores.strategic_impact || 'N/A'}/10
- **Competitive Threat**: ${scores.competitive_threat || 'N/A'}/10
- **Innovation Significance**: ${scores.innovation_significance || 'N/A'}/10
- **Urgency**: ${scores.urgency || 'N/A'}/10

## 🔍 Extracted Intelligence
### Entities Detected
- **Products**: ${entities.products?.join(', ') || 'None identified'}
- **Technologies**: ${entities.technologies?.join(', ') || 'None identified'}
- **People**: ${entities.people?.join(', ') || 'None identified'}
- **Competitors**: ${entities.competitors?.join(', ') || 'None identified'}

### Key Insights
${analysis.summary?.key_takeaways?.map(t => `- ${t}`).join('\n') || '- Monitoring for further developments'}

## 🎬 Recommended Actions
${analysis.summary?.recommended_actions?.map((a, i) => `${i + 1}. ${a}`).join('\n') || '1. Continue monitoring\n2. Analyze competitive impact'}

## 📍 Source
- **URL**: ${change.url}
- **Detected**: ${new Date(change.created_at).toLocaleString()}
- **Change Magnitude**: ${change.change_percentage || 0}%

---
*AI Analysis completed: ${new Date().toLocaleString()}*`;
    }

    getMarketPosition(type) {
        const positions = {
            'llm_provider': 'Core AI Model Provider',
            'ai_coding': 'Developer Tools Market',
            'ai_image': 'Creative AI Market',
            'ai_video': 'Video Generation Market',
            'ai_voice': 'Audio/Voice AI Market',
            'enterprise_ai': 'Enterprise Solutions',
            'ai_infrastructure': 'Infrastructure Provider',
            'ai_hardware': 'Hardware Manufacturer'
        };
        return positions[type] || 'AI Technology Provider';
    }
}

// Main execution
async function main() {
    const integration = new TheBrainSmartIntegration();
    await integration.syncAll();
}

if (require.main === module) {
    main();
}

module.exports = TheBrainSmartIntegration;
