#!/usr/bin/env node

/**
 * Enhanced TheBrain Sync with Proper Connections
 * This version ensures all thoughts are connected in a navigable web
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

class TheBrainEnhancedSync {
  constructor() {
    this.apiKey = process.env.THEBRAIN_API_KEY;
    this.brainId = process.env.THEBRAIN_BRAIN_ID || process.env.THEBRAIN_DEFAULT_BRAIN_ID;
    
    if (!this.apiKey || !this.brainId) {
      throw new Error('THEBRAIN_API_KEY and THEBRAIN_BRAIN_ID required');
    }
    
    // Initialize databases
    const dataDir = path.join(__dirname, 'data');
    this.rawDb = new Database(path.join(dataDir, 'raw_content.db'));
    this.processedDb = new Database(path.join(dataDir, 'processed_content.db'));
    this.intelligenceDb = new Database(path.join(dataDir, 'intelligence.db'));
    
    // Initialize API client
    this.api = axios.create({
      baseURL: 'https://api.thebrain.com/v1',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
    
    // Track created thoughts to avoid duplicates
    this.thoughtMap = new Map();
    
    console.log('🧠 Enhanced TheBrain Sync initialized');
  }

  async syncToTheBrain() {
    console.log('🚀 Starting enhanced TheBrain sync with proper connections...');
    
    try {
      // 1. Create or find root thought
      const rootId = await this.createOrFindRootThought();
      
      // 2. Create main category structure
      const categories = await this.createMainCategories(rootId);
      
      // 3. Sync companies with proper hierarchy
      await this.syncCompaniesWithConnections(categories.companies);
      
      // 4. Sync recent changes with connections
      await this.syncRecentChangesWithConnections(categories.changes);
      
      // 5. Create system architecture view
      await this.createSystemArchitecture(categories.architecture);
      
      // 6. Create AI insights with connections
      await this.createAIInsights(categories.insights);
      
      // 7. Create cross-connections between related thoughts
      await this.createCrossConnections();
      
      console.log('✅ Enhanced TheBrain sync complete!');
      console.log(`📊 Created ${this.thoughtMap.size} thoughts with proper connections`);
      
    } catch (error) {
      console.error('❌ Sync failed:', error.message);
      if (error.response?.data) {
        console.error('API Error:', error.response.data);
      }
    }
  }

  async createOrFindRootThought() {
    console.log('🔍 Finding or creating root thought...');
    
    // Search for existing root
    const searchResponse = await this.api.get(`/brains/${this.brainId}/thoughts/search`, {
      params: { queryText: 'AI Competitive Monitor', maxResults: 10 }
    });
    
    let rootThought = searchResponse.data.thoughts?.find(t => 
      t.name === 'AI Competitive Monitor' && t.kind === 2
    );
    
    if (rootThought) {
      console.log('✅ Found existing root thought');
      this.thoughtMap.set('root', rootThought.id);
      return rootThought.id;
    }
    
    // Create new root
    console.log('📝 Creating new root thought...');
    const createResponse = await this.api.post(`/brains/${this.brainId}/thoughts`, {
      name: 'AI Competitive Monitor',
      label: 'SYSTEM',
      kind: 2, // Type
      acType: 0, // Public
      foregroundColor: '#667eea',
      backgroundColor: '#1a1a2e'
    });
    
    rootThought = createResponse.data;
    this.thoughtMap.set('root', rootThought.id);
    
    // Add note to root
    await this.api.post(`/brains/${this.brainId}/thoughts/${rootThought.id}/notes`, {
      markdown: `# AI Competitive Monitor System

## Overview
This is the central hub for all competitive intelligence monitoring.

## Structure
- **Monitored Companies**: All tracked companies organized by type
- **Recent Changes**: Latest updates and changes detected
- **System Architecture**: Technical implementation details  
- **AI Insights**: Patterns and trends identified by AI
- **Threat Analysis**: High-priority competitive threats

## Navigation
Click on any category to explore deeper. All thoughts are interconnected to show relationships.

Last Updated: ${new Date().toLocaleString()}`
    });
    
    return rootThought.id;
  }

  async createMainCategories(rootId) {
    console.log('📁 Creating main categories...');
    
    const categories = {
      companies: { name: 'Monitored Companies', icon: '🏢', color: '#ef4444' },
      changes: { name: 'Recent Changes', icon: '🔄', color: '#f59e0b' },
      architecture: { name: 'System Architecture', icon: '🏗️', color: '#3b82f6' },
      insights: { name: 'AI Insights', icon: '🧠', color: '#22c55e' },
      threats: { name: 'Threat Analysis', icon: '⚠️', color: '#dc2626' }
    };
    
    const categoryIds = {};
    
    for (const [key, cat] of Object.entries(categories)) {
      try {
        // Check if exists
        let thoughtId = await this.findThoughtByName(cat.name);
        
        if (!thoughtId) {
          // Create category
          const response = await this.api.post(`/brains/${this.brainId}/thoughts`, {
            sourceThoughtId: rootId,
            relation: 1, // Child
            name: cat.name,
            label: cat.icon,
            kind: 2, // Type
            foregroundColor: cat.color,
            backgroundColor: '#0f0f1e'
          });
          thoughtId = response.data.id;
        } else {
          // Ensure it's connected to root
          await this.ensureConnection(rootId, thoughtId, 1);
        }
        
        categoryIds[key] = thoughtId;
        this.thoughtMap.set(cat.name, thoughtId);
        
      } catch (error) {
        console.error(`Failed to create category ${cat.name}:`, error.message);
      }
    }
    
    return categoryIds;
  }

  async syncCompaniesWithConnections(companiesRootId) {
    console.log('🏢 Syncing companies with proper connections...');
    
    // Get all companies
    const companies = this.intelligenceDb.prepare(`
      SELECT 
        c.*,
        COUNT(DISTINCT u.id) as url_count,
        COUNT(DISTINCT ba.id) as baseline_count
      FROM companies c
      LEFT JOIN urls u ON c.id = u.company_id
      LEFT JOIN baseline_analysis ba ON c.id = ba.company_id
      GROUP BY c.id
      ORDER BY c.category, c.name
    `).all();
    
    // Company type definitions
    const companyTypes = {
      competitor: { name: 'Competitors', icon: '⚔️', color: '#ef4444' },
      partner: { name: 'Partners', icon: '🤝', color: '#22c55e' },
      tool: { name: 'AI Tools', icon: '🛠️', color: '#f59e0b' },
      industry: { name: 'Industry Players', icon: '🏭', color: '#3b82f6' },
      'llm-provider': { name: 'LLM Providers', icon: '🤖', color: '#8b5cf6' },
      'ai-coding': { name: 'AI Coding Tools', icon: '💻', color: '#ec4899' },
      'ai-research': { name: 'AI Research', icon: '🔬', color: '#14b8a6' },
      'ai-infrastructure': { name: 'AI Infrastructure', icon: '🏗️', color: '#f97316' }
    };
    
    // Create type groups
    const typeGroups = {};
    for (const [type, info] of Object.entries(companyTypes)) {
      let groupId = await this.findThoughtByName(info.name);
      
      if (!groupId) {
        const response = await this.api.post(`/brains/${this.brainId}/thoughts`, {
          sourceThoughtId: companiesRootId,
          relation: 1, // Child
          name: info.name,
          label: info.icon,
          kind: 2, // Type
          foregroundColor: info.color,
          backgroundColor: '#1a1a2e'
        });
        groupId = response.data.id;
      } else {
        await this.ensureConnection(companiesRootId, groupId, 1);
      }
      
      typeGroups[type] = groupId;
      this.thoughtMap.set(info.name, groupId);
    }
    
    // Create company thoughts
    for (const company of companies) {
      try {
        const groupId = typeGroups[company.category] || typeGroups.industry;
        let companyId = await this.findThoughtByName(company.name);
        
        if (!companyId) {
          const response = await this.api.post(`/brains/${this.brainId}/thoughts`, {
            sourceThoughtId: groupId,
            relation: 1, // Child
            name: company.name,
            label: `${company.url_count} URLs | ${company.baseline_count} analyses`,
            kind: 1, // Normal
            foregroundColor: this.getColorForType(company.category),
            backgroundColor: '#111827'
          });
          companyId = response.data.id;
          
          // Add company note
          if (company.description) {
            await this.api.post(`/brains/${this.brainId}/thoughts/${companyId}/notes`, {
              markdown: `# ${company.name}

${company.description}

**Category**: ${company.category}
**URLs Monitored**: ${company.url_count}`
            });
          }
        } else {
          await this.ensureConnection(groupId, companyId, 1);
        }
        
        // Store mapping
        this.thoughtMap.set(`company-${company.id}`, companyId);
        this.intelligenceDb.prepare(
          'UPDATE companies SET thebrain_thought_id = ? WHERE id = ?'
        ).run(companyId, company.id);
        
      } catch (error) {
        console.error(`Failed to sync company ${company.name}:`, error.message);
      }
    }
    
    console.log(`✅ Synced ${companies.length} companies`);
  }

  async syncRecentChangesWithConnections(changesRootId) {
    console.log('🔄 Syncing recent changes with connections...');
    
    // Get recent changes with AI analysis
    const changes = this.intelligenceDb.prepare(`
      SELECT 
        aa.id,
        aa.change_id,
        aa.created_at,
        u.url,
        u.url_type,
        c.name as company_name,
        c.id as company_id,
        c.thebrain_thought_id as company_thought_id,
        aa.relevance_score,
        aa.summary,
        aa.category,
        aa.competitive_threats
      FROM ai_analysis aa
      JOIN urls u ON aa.url_id = u.id
      JOIN companies c ON u.company_id = c.id
      WHERE aa.created_at > datetime('now', '-7 days')
      AND aa.relevance_score >= 6
      ORDER BY aa.relevance_score DESC, aa.created_at DESC
      LIMIT 50
    `).all();
    
    // Create priority groups
    const priorityGroups = {
      high: { name: 'High Priority (8-10)', icon: '🔴', color: '#dc2626' },
      medium: { name: 'Medium Priority (6-7)', icon: '🟡', color: '#f59e0b' },
      low: { name: 'Low Priority (4-5)', icon: '🔵', color: '#3b82f6' }
    };
    
    const groupIds = {};
    for (const [priority, info] of Object.entries(priorityGroups)) {
      const response = await this.api.post(`/brains/${this.brainId}/thoughts`, {
        sourceThoughtId: changesRootId,
        relation: 1, // Child
        name: info.name,
        label: info.icon,
        kind: 2, // Type
        foregroundColor: info.color,
        backgroundColor: '#1a1a2e'
      });
      groupIds[priority] = response.data.id;
    }
    
    // Create change thoughts
    for (const change of changes) {
      try {
        const priority = change.relevance_score >= 8 ? 'high' : 
                        change.relevance_score >= 6 ? 'medium' : 'low';
        const groupId = groupIds[priority];
        
        const changeName = `${change.company_name} - ${new Date(change.created_at).toLocaleDateString()}`;
        const response = await this.api.post(`/brains/${this.brainId}/thoughts`, {
          sourceThoughtId: groupId,
          relation: 1, // Child
          name: changeName,
          label: `Score: ${change.relevance_score}/10`,
          kind: 3, // Event
          foregroundColor: this.getColorForRelevance(change.relevance_score),
          backgroundColor: '#111827'
        });
        
        const changeId = response.data.id;
        
        // Add change note
        await this.api.post(`/brains/${this.brainId}/thoughts/${changeId}/notes`, {
          markdown: `# Change Detection

**Company**: ${change.company_name}
**URL Type**: ${change.url_type || 'Website'}
**Relevance Score**: ${change.relevance_score}/10
**Detected**: ${new Date(change.created_at).toLocaleString()}

## Summary
${change.summary || 'No summary available'}

## Category
${change.category || 'Uncategorized'}

## Competitive Threats
${change.competitive_threats || 'No specific threats identified'}`
        });
        
        // Connect to company
        if (change.company_thought_id) {
          await this.api.post(`/brains/${this.brainId}/links`, {
            thoughtIdA: change.company_thought_id,
            thoughtIdB: changeId,
            relation: 3, // Jump
            name: 'detected change'
          });
        }
        
      } catch (error) {
        console.error(`Failed to sync change:`, error.message);
      }
    }
    
    console.log(`✅ Synced ${changes.length} recent changes`);
  }

  async createSystemArchitecture(archRootId) {
    console.log('🏗️ Creating system architecture view...');
    
    // Database architecture
    const dbArchId = await this.createThought(archRootId, {
      name: 'Database Architecture',
      label: '💾',
      kind: 2,
      foregroundColor: '#8b5cf6'
    });
    
    const databases = [
      { name: 'Raw Content DB', desc: 'HTML storage', color: '#dc2626' },
      { name: 'Processed Content DB', desc: 'Markdown content', color: '#f59e0b' },
      { name: 'Intelligence DB', desc: 'AI analysis', color: '#22c55e' }
    ];
    
    for (const db of databases) {
      await this.createThought(dbArchId, {
        name: db.name,
        label: db.desc,
        kind: 1,
        foregroundColor: db.color
      });
    }
    
    // Workflow architecture
    const workflowId = await this.createThought(archRootId, {
      name: 'GitHub Workflows',
      label: '⚙️',
      kind: 2,
      foregroundColor: '#3b82f6'
    });
    
    const workflows = [
      { name: 'Scrape Workflow', desc: 'Collects HTML' },
      { name: 'Process Workflow', desc: 'Converts to markdown' },
      { name: 'Analyze Workflow', desc: 'AI analysis' },
      { name: 'Sync Workflow', desc: 'Updates & alerts' }
    ];
    
    let prevWorkflowId = null;
    for (const wf of workflows) {
      const wfId = await this.createThought(workflowId, {
        name: wf.name,
        label: wf.desc,
        kind: 1,
        foregroundColor: '#60a5fa'
      });
      
      // Chain workflows together
      if (prevWorkflowId) {
        await this.api.post(`/brains/${this.brainId}/links`, {
          thoughtIdA: prevWorkflowId,
          thoughtIdB: wfId,
          relation: 3, // Jump
          name: 'triggers'
        });
      }
      prevWorkflowId = wfId;
    }
  }

  async createAIInsights(insightsRootId) {
    console.log('🧠 Creating AI insights...');
    
    // Top threats
    const threatsId = await this.createThought(insightsRootId, {
      name: 'Top Competitive Threats',
      label: '⚠️',
      kind: 2,
      foregroundColor: '#dc2626'
    });
    
    const topThreats = this.intelligenceDb.prepare(`
      SELECT 
        c.name,
        c.thebrain_thought_id,
        COUNT(DISTINCT aa.id) as threat_count,
        AVG(aa.relevance_score) as avg_score
      FROM companies c
      JOIN ai_analysis aa ON aa.company_id = c.id
      WHERE aa.relevance_score >= 7
      AND aa.created_at > datetime('now', '-30 days')
      GROUP BY c.id
      ORDER BY avg_score DESC, threat_count DESC
      LIMIT 10
    `).all();
    
    for (const threat of topThreats) {
      const threatId = await this.createThought(threatsId, {
        name: `${threat.name} - ${threat.threat_count} threats`,
        label: `Avg: ${threat.avg_score.toFixed(1)}/10`,
        kind: 1,
        foregroundColor: '#ef4444'
      });
      
      // Connect to company
      if (threat.thebrain_thought_id) {
        await this.api.post(`/brains/${this.brainId}/links`, {
          thoughtIdA: threat.thebrain_thought_id,
          thoughtIdB: threatId,
          relation: 3, // Jump
          name: 'threat analysis'
        });
      }
    }
    
    // Technology trends
    const trendsId = await this.createThought(insightsRootId, {
      name: 'Technology Trends',
      label: '📈',
      kind: 2,
      foregroundColor: '#10b981'
    });
    
    // Add trend analysis here...
  }

  async createCrossConnections() {
    console.log('🔗 Creating cross-connections...');
    
    // Connect high-priority changes to threat analysis
    const threatAnalysisId = this.thoughtMap.get('Threat Analysis');
    const highPriorityId = await this.findThoughtByName('High Priority (8-10)');
    
    if (threatAnalysisId && highPriorityId) {
      await this.api.post(`/brains/${this.brainId}/links`, {
        thoughtIdA: highPriorityId,
        thoughtIdB: threatAnalysisId,
        relation: 3, // Jump
        name: 'feeds into'
      });
    }
    
    // Connect AI Insights to System Architecture
    const insightsId = this.thoughtMap.get('AI Insights');
    const archId = this.thoughtMap.get('System Architecture');
    
    if (insightsId && archId) {
      await this.api.post(`/brains/${this.brainId}/links`, {
        thoughtIdA: archId,
        thoughtIdB: insightsId,
        relation: 3, // Jump
        name: 'generates'
      });
    }
  }

  // Helper methods
  async findThoughtByName(name) {
    try {
      const response = await this.api.get(`/brains/${this.brainId}/thoughts/search`, {
        params: { queryText: name, maxResults: 10 }
      });
      
      const thought = response.data.thoughts?.find(t => t.name === name);
      return thought?.id || null;
    } catch (error) {
      return null;
    }
  }

  async createThought(parentId, thoughtData) {
    try {
      const response = await this.api.post(`/brains/${this.brainId}/thoughts`, {
        sourceThoughtId: parentId,
        relation: 1, // Child
        ...thoughtData
      });
      
      this.thoughtMap.set(thoughtData.name, response.data.id);
      return response.data.id;
    } catch (error) {
      console.error(`Failed to create thought ${thoughtData.name}:`, error.message);
      return null;
    }
  }

  async ensureConnection(thoughtA, thoughtB, relation) {
    try {
      // Check if link exists
      const response = await this.api.get(`/brains/${this.brainId}/thoughts/${thoughtA}`);
      const hasLink = response.data.links?.some(link => 
        (link.thoughtIdA === thoughtB || link.thoughtIdB === thoughtB)
      );
      
      if (!hasLink) {
        await this.api.post(`/brains/${this.brainId}/links`, {
          thoughtIdA: thoughtA,
          thoughtIdB: thoughtB,
          relation: relation
        });
      }
    } catch (error) {
      // Link might already exist
    }
  }

  getColorForType(type) {
    const colors = {
      competitor: '#ef4444',
      partner: '#22c55e',
      industry: '#3b82f6',
      tool: '#f59e0b',
      'llm-provider': '#8b5cf6',
      'ai-coding': '#ec4899',
      'ai-research': '#14b8a6',
      'ai-infrastructure': '#f97316'
    };
    return colors[type] || '#667eea';
  }

  getColorForRelevance(score) {
    if (score >= 8) return '#ef4444';
    if (score >= 6) return '#f59e0b';
    if (score >= 4) return '#3b82f6';
    return '#6b7280';
  }
}

// Export for use
module.exports = TheBrainEnhancedSync;

// Run if called directly
if (require.main === module) {
  async function main() {
    const sync = new TheBrainEnhancedSync();
    await sync.syncToTheBrain();
  }
  
  main().catch(console.error);
}
