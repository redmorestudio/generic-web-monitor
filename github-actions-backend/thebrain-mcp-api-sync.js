const Database = require('better-sqlite3');
const path = require('path');
const axios = require('axios');
// Only load dotenv in development (not in GitHub Actions)
if (!process.env.GITHUB_ACTIONS && !process.env.POSTGRES_CONNECTION_STRING) {
  try {
    require('dotenv').config();
  } catch (e) {
    // dotenv not available or no .env file - this is fine
  }
}

class TheBrainMCPApiSync {
  constructor() {
    this.apiKey = process.env.THEBRAIN_API_KEY || '5f38bc2613cc51a2dc44c9a89decdfdd47b2912467114670326ad792f64342cb';
    this.brainId = process.env.THEBRAIN_BRAIN_ID || 'c05c7c2d-5e9b-4b9e-99ab-539d3fe4900e';
    
    // Initialize databases
    const dataDir = path.join(__dirname, 'data');
    this.rawDb = new Database(path.join(dataDir, 'raw_content.db'));
    this.processedDb = new Database(path.join(dataDir, 'processed_content.db'));
    this.intelligenceDb = new Database(path.join(dataDir, 'intelligence.db'));
    
    // Initialize TheBrain API client
    this.api = axios.create({
      baseURL: 'https://api.thebrain.com/v1',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    // Track created thoughts and links
    this.thoughtMap = new Map(); // name -> thoughtId
    this.linkMap = new Set(); // thoughtA-thoughtB-relation
    
    console.log('🧠 TheBrain MCP API Sync initialized');
    console.log(`   Brain ID: ${this.brainId}`);
  }

  async testConnection() {
    try {
      console.log('Testing TheBrain API connection...');
      const response = await this.api.get(`/brains/${this.brainId}`);
      console.log(`✅ Connected to brain: ${response.data.name}`);
      return true;
    } catch (error) {
      console.error('❌ API connection failed:', error.response?.data || error.message);
      return false;
    }
  }

  async syncToTheBrain() {
    console.log('🚀 Starting TheBrain API sync (proper implementation)...');
    
    // Test connection
    const connected = await this.testConnection();
    if (!connected) {
      console.error('Failed to connect to TheBrain API');
      return false;
    }
    
    try {
      // Phase 1: Create root and category structure
      console.log('\n📊 Phase 1: Creating root structure...');
      const rootId = await this.createRootThought();
      const categories = await this.createMainCategories(rootId);
      
      // Phase 2: Create companies hierarchy
      console.log('\n🏢 Phase 2: Creating companies...');
      await this.createCompaniesHierarchy(categories.companies);
      
      // Phase 3: Create system architecture
      console.log('\n🏗️ Phase 3: Creating architecture view...');
      await this.createArchitectureView(categories.architecture);
      
      // Phase 4: Create recent changes
      console.log('\n🔄 Phase 4: Creating recent changes...');
      await this.createRecentChanges(categories.changes);
      
      // Phase 5: Create insights
      console.log('\n🧠 Phase 5: Creating insights...');
      await this.createInsights(categories.insights);
      
      // Phase 6: Create all the links
      console.log('\n🔗 Phase 6: Creating all links...');
      await this.createAllLinks();
      
      console.log('\n✅ TheBrain sync complete!');
      console.log(`   Created ${this.thoughtMap.size} thoughts`);
      console.log(`   Created ${this.linkMap.size} links`);
      
      return true;
      
    } catch (error) {
      console.error('❌ Sync failed:', error);
      return false;
    }
  }

  async createThought(data) {
    try {
      // Check if thought already exists
      if (this.thoughtMap.has(data.name)) {
        console.log(`   ⏭️  Thought "${data.name}" already exists`);
        return this.thoughtMap.get(data.name);
      }
      
      const payload = {
        name: data.name,
        label: data.label || '',
        kind: data.kind || 1,
        acType: data.acType || 0,
        foregroundColor: data.foregroundColor || '#ffffff',
        backgroundColor: data.backgroundColor || '#1a1a2e'
      };
      
      const response = await this.api.post(`/brains/${this.brainId}/thoughts`, payload);
      const thoughtId = response.data.id;
      
      this.thoughtMap.set(data.name, thoughtId);
      console.log(`   ✅ Created thought: ${data.name}`);
      
      // Add note if provided
      if (data.note) {
        await this.updateNote(thoughtId, data.note);
      }
      
      return thoughtId;
      
    } catch (error) {
      console.error(`   ❌ Failed to create thought "${data.name}":`, error.response?.data || error.message);
      throw error;
    }
  }

  async queueLink(thoughtIdA, thoughtIdB, relation, name = '') {
    const linkKey = `${thoughtIdA}-${thoughtIdB}-${relation}`;
    if (!this.linkMap.has(linkKey)) {
      this.linkMap.add({
        thoughtIdA,
        thoughtIdB,
        relation,
        name,
        key: linkKey
      });
    }
  }

  async createAllLinks() {
    console.log(`Creating ${this.linkMap.size} links...`);
    let created = 0;
    let failed = 0;
    
    for (const link of this.linkMap) {
      try {
        await this.api.post(`/brains/${this.brainId}/links`, {
          thoughtIdA: link.thoughtIdA,
          thoughtIdB: link.thoughtIdB,
          relation: link.relation,
          name: link.name || ''
        });
        created++;
        
        if (created % 10 === 0) {
          console.log(`   Progress: ${created}/${this.linkMap.size} links created`);
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        failed++;
        console.error(`   ❌ Failed to create link: ${error.response?.data?.message || error.message}`);
      }
    }
    
    console.log(`   ✅ Created ${created} links (${failed} failed)`);
  }

  async updateNote(thoughtId, markdown) {
    try {
      await this.api.post(`/brains/${this.brainId}/thoughts/${thoughtId}/notes`, {
        markdown
      });
      console.log(`   📝 Added note to thought`);
    } catch (error) {
      console.error(`   ❌ Failed to update note:`, error.response?.data || error.message);
    }
  }

  async createRootThought() {
    const rootData = {
      name: 'AI Competitive Monitor',
      label: 'ROOT',
      kind: 2, // Type
      foregroundColor: '#667eea',
      backgroundColor: '#1a1a2e',
      note: `# AI Competitive Monitor

## Overview
Real-time monitoring and analysis system for 52+ AI companies.

## Key Features
- 🔄 Automated web scraping every 6 hours
- 📊 AI-powered entity extraction and analysis
- 🧠 Competitive intelligence insights
- 📧 Smart alerting system

## Architecture
- **3-Database System**: Raw → Processed → Intelligence
- **4-Stage Pipeline**: Scrape → Process → Analyze → Deploy
- **GitHub Actions**: Fully automated workflows

Last sync: ${new Date().toISOString()}`
    };
    
    return await this.createThought(rootData);
  }

  async createMainCategories(rootId) {
    const categories = [
      { 
        key: 'companies',
        name: 'Monitored Companies', 
        color: '#ef4444', 
        icon: '🏢',
        note: 'All companies being monitored by the system'
      },
      { 
        key: 'changes',
        name: 'Recent Changes', 
        color: '#f59e0b', 
        icon: '🔄',
        note: 'High-value changes detected in the last 7 days'
      },
      { 
        key: 'architecture',
        name: 'System Architecture', 
        color: '#3b82f6', 
        icon: '🏗️',
        note: 'Technical architecture and data flow'
      },
      { 
        key: 'insights',
        name: 'AI Insights', 
        color: '#22c55e', 
        icon: '🧠',
        note: 'Intelligence extracted by AI analysis'
      }
    ];
    
    const categoryIds = {};
    
    for (const cat of categories) {
      const thoughtId = await this.createThought({
        name: cat.name,
        label: cat.icon,
        kind: 2, // Type
        foregroundColor: cat.color,
        backgroundColor: '#0f0f1e',
        note: cat.note
      });
      
      categoryIds[cat.key] = thoughtId;
      await this.queueLink(rootId, thoughtId, 1); // Child link
    }
    
    return categoryIds;
  }

  async createCompaniesHierarchy(companiesId) {
    // Get companies from database
    const companies = this.intelligenceDb.prepare(`
      SELECT c.*, COUNT(DISTINCT u.id) as url_count
      FROM companies c
      LEFT JOIN urls u ON c.id = u.company_id
      GROUP BY c.id
      ORDER BY c.category, c.name
    `).all();
    
    console.log(`   Found ${companies.length} companies to sync`);
    
    // Create category groups
    const categoryTypes = {
      'llm-provider': { name: 'LLM Providers', color: '#8b5cf6', icon: '🤖' },
      'ai-coding': { name: 'AI Coding Tools', color: '#ec4899', icon: '💻' },
      'ai-infrastructure': { name: 'AI Infrastructure', color: '#f97316', icon: '🏗️' },
      'ai-research': { name: 'AI Research', color: '#14b8a6', icon: '🔬' },
      'competitor': { name: 'Direct Competitors', color: '#ef4444', icon: '⚔️' },
      'partner': { name: 'Partners', color: '#22c55e', icon: '🤝' },
      'tool': { name: 'AI Tools', color: '#f59e0b', icon: '🛠️' },
      'industry': { name: 'Industry Players', color: '#3b82f6', icon: '🏭' }
    };
    
    const categoryGroups = {};
    
    // Create category groups first
    for (const [key, info] of Object.entries(categoryTypes)) {
      const groupId = await this.createThought({
        name: info.name,
        label: info.icon,
        kind: 2, // Type
        foregroundColor: info.color,
        backgroundColor: '#1a1a2e'
      });
      
      categoryGroups[key] = groupId;
      await this.queueLink(companiesId, groupId, 1);
    }
    
    // Create company thoughts
    let companyCount = 0;
    for (const company of companies) {
      const category = company.category || 'industry';
      const groupId = categoryGroups[category] || categoryGroups.industry;
      const categoryInfo = categoryTypes[category] || categoryTypes.industry;
      
      const companyId = await this.createThought({
        name: company.name,
        label: `${company.url_count} URLs`,
        kind: 1, // Normal
        foregroundColor: categoryInfo.color,
        backgroundColor: '#111827',
        note: `# ${company.name}

## Category
${categoryInfo.name}

## URLs Monitored
${company.url_count} URLs

## Domain
${company.domain || 'Not specified'}

${company.description ? `## Description\n${company.description}` : ''}`
      });
      
      await this.queueLink(groupId, companyId, 1);
      
      // Update company record with thought ID
      this.intelligenceDb.prepare(`
        UPDATE companies SET thebrain_thought_id = ? WHERE id = ?
      `).run(companyId, company.id);
      
      companyCount++;
      if (companyCount % 10 === 0) {
        console.log(`   Progress: ${companyCount}/${companies.length} companies`);
      }
    }
    
    console.log(`   ✅ Created ${companyCount} company thoughts`);
  }

  async createArchitectureView(archId) {
    // Database architecture
    const databases = [
      {
        name: 'Raw Content DB',
        desc: 'Stores HTML snapshots',
        color: '#dc2626',
        tables: ['content_snapshots', 'changes'],
        note: `# Raw Content Database

## Purpose
Stores raw HTML content from web scraping

## Key Tables
- **content_snapshots**: Full HTML snapshots
- **changes**: Detected changes between snapshots

## Location
/github-actions-backend/data/raw_content.db`
      },
      {
        name: 'Processed Content DB',
        desc: 'Markdown & structured text',
        color: '#f59e0b',
        tables: ['processed_content', 'markdown_content'],
        note: `# Processed Content Database

## Purpose
Stores converted markdown and structured text

## Key Tables
- **processed_content**: Main processing results
- **markdown_content**: Clean markdown versions

## Location
/github-actions-backend/data/processed_content.db`
      },
      {
        name: 'Intelligence DB',
        desc: 'AI analysis & insights',
        color: '#22c55e',
        tables: ['companies', 'urls', 'baseline_analysis', 'ai_analysis'],
        note: `# Intelligence Database

## Purpose
Stores AI analysis results and competitive intelligence

## Key Tables
- **companies**: Company registry
- **urls**: Monitored URLs
- **baseline_analysis**: Entity extraction results
- **ai_analysis**: Enhanced AI insights

## Location
/github-actions-backend/data/intelligence.db`
      }
    ];
    
    for (const db of databases) {
      const dbId = await this.createThought({
        name: db.name,
        label: db.desc,
        kind: 1,
        foregroundColor: db.color,
        backgroundColor: '#1a1a2e',
        note: db.note
      });
      
      await this.queueLink(archId, dbId, 1);
      
      // Create table thoughts
      for (const table of db.tables) {
        const tableId = await this.createThought({
          name: `${db.name} - ${table}`,
          label: 'TABLE',
          kind: 1,
          foregroundColor: '#6b7280',
          backgroundColor: '#111827'
        });
        
        await this.queueLink(dbId, tableId, 1);
      }
    }
    
    // Workflow architecture
    const workflowsId = await this.createThought({
      name: 'GitHub Workflows',
      label: 'AUTOMATION',
      kind: 2,
      foregroundColor: '#8b5cf6',
      backgroundColor: '#1a1a2e'
    });
    
    await this.queueLink(archId, workflowsId, 1);
    
    const workflows = [
      { name: 'Scrape Workflow', desc: 'Runs every 6 hours', color: '#dc2626' },
      { name: 'Process Workflow', desc: 'Converts to markdown', color: '#f59e0b' },
      { name: 'Analyze Workflow', desc: 'AI entity extraction', color: '#22c55e' },
      { name: 'Deploy Workflow', desc: 'Sync & alerts', color: '#3b82f6' }
    ];
    
    for (const wf of workflows) {
      const wfId = await this.createThought({
        name: wf.name,
        label: wf.desc,
        kind: 1,
        foregroundColor: wf.color,
        backgroundColor: '#111827'
      });
      
      await this.queueLink(workflowsId, wfId, 1);
    }
  }

  async createRecentChanges(changesId) {
    try {
      // Check for ai_analysis data
      const hasAnalysis = this.intelligenceDb.prepare(
        "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='ai_analysis'"
      ).get().count > 0;
      
      if (!hasAnalysis) {
        console.log('   ⚠️  No ai_analysis table found');
        return;
      }
      
      // Get recent high-value changes
      const changes = this.intelligenceDb.prepare(`
        SELECT 
          aa.*,
          u.url,
          u.url_type,
          c.name as company_name,
          c.thebrain_thought_id as company_thought_id
        FROM ai_analysis aa
        JOIN urls u ON aa.url_id = u.id
        JOIN companies c ON aa.company_id = c.id
        WHERE aa.created_at > datetime('now', '-7 days')
        AND aa.relevance_score >= 6
        ORDER BY aa.relevance_score DESC
        LIMIT 30
      `).all();
      
      console.log(`   Found ${changes.length} recent changes`);
      
      if (changes.length === 0) return;
      
      // Create priority groups
      const groups = {
        high: { name: 'High Priority (8-10)', color: '#dc2626', icon: '🔴' },
        medium: { name: 'Medium Priority (6-7)', color: '#f59e0b', icon: '🟡' }
      };
      
      const groupIds = {};
      for (const [key, info] of Object.entries(groups)) {
        const groupId = await this.createThought({
          name: info.name,
          label: info.icon,
          kind: 2,
          foregroundColor: info.color,
          backgroundColor: '#1a1a2e'
        });
        
        groupIds[key] = groupId;
        await this.queueLink(changesId, groupId, 1);
      }
      
      // Create change thoughts
      for (const change of changes) {
        const priority = change.relevance_score >= 8 ? 'high' : 'medium';
        const groupId = groupIds[priority];
        
        const changeDate = new Date(change.created_at).toLocaleDateString();
        const changeName = `${change.company_name}: ${change.category || 'Update'} (${changeDate})`;
        
        const changeId = await this.createThought({
          name: changeName,
          label: `Score: ${change.relevance_score}/10`,
          kind: 3, // Event
          foregroundColor: groups[priority].color,
          backgroundColor: '#111827',
          note: `# ${change.company_name} Update

## Relevance Score
${change.relevance_score}/10

## Category
${change.category || 'General Update'}

## Summary
${change.summary || 'No summary available'}

## URL
${change.url}

## Detected
${new Date(change.created_at).toLocaleString()}`
        });
        
        await this.queueLink(groupId, changeId, 1);
        
        // Link to company if available
        if (change.company_thought_id) {
          await this.queueLink(change.company_thought_id, changeId, 3, 'detected');
        }
      }
      
    } catch (error) {
      console.error('   ❌ Error creating changes:', error.message);
    }
  }

  async createInsights(insightsId) {
    // Technology trends
    const trendsId = await this.createThought({
      name: 'Technology Trends',
      label: '📈',
      kind: 2,
      foregroundColor: '#10b981',
      backgroundColor: '#1a1a2e'
    });
    
    await this.queueLink(insightsId, trendsId, 1);
    
    // Competitive threats
    const threatsId = await this.createThought({
      name: 'Competitive Threats',
      label: '⚠️',
      kind: 2,
      foregroundColor: '#ef4444',
      backgroundColor: '#1a1a2e'
    });
    
    await this.queueLink(insightsId, threatsId, 1);
    
    // Try to extract some actual insights
    try {
      const hasBaseline = this.intelligenceDb.prepare(
        "SELECT COUNT(*) as count FROM baseline_analysis"
      ).get().count > 0;
      
      if (hasBaseline) {
        // Get top mentioned technologies
        const techData = this.intelligenceDb.prepare(`
          SELECT entities
          FROM baseline_analysis
          WHERE entities IS NOT NULL
          AND created_at > datetime('now', '-7 days')
          LIMIT 100
        `).all();
        
        const techCount = new Map();
        for (const row of techData) {
          try {
            const entities = JSON.parse(row.entities);
            if (entities.technologies && Array.isArray(entities.technologies)) {
              for (const tech of entities.technologies) {
                const name = typeof tech === 'string' ? tech : tech.name;
                if (name) {
                  techCount.set(name, (techCount.get(name) || 0) + 1);
                }
              }
            }
          } catch (e) {}
        }
        
        // Create thoughts for top technologies
        const topTech = Array.from(techCount.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10);
          
        for (const [tech, count] of topTech) {
          const techId = await this.createThought({
            name: tech,
            label: `${count} mentions`,
            kind: 4, // Tag
            foregroundColor: '#3b82f6',
            backgroundColor: '#111827'
          });
          
          await this.queueLink(trendsId, techId, 1);
        }
      }
    } catch (error) {
      console.error('   ❌ Error extracting insights:', error.message);
    }
  }
}

// Export for use
module.exports = TheBrainMCPApiSync;

// Run if called directly
if (require.main === module) {
  async function main() {
    const sync = new TheBrainMCPApiSync();
    const success = await sync.syncToTheBrain();
    process.exit(success ? 0 : 1);
  }
  
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
