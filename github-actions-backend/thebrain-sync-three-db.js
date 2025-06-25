const axios = require('axios');
const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

class TheBrainThreeDBIntegration {
  constructor() {
    this.apiKey = process.env.THEBRAIN_API_KEY;
    this.brainId = process.env.THEBRAIN_BRAIN_ID || process.env.THEBRAIN_DEFAULT_BRAIN_ID;
    
    if (!this.apiKey) {
      throw new Error('THEBRAIN_API_KEY not found in environment variables');
    }
    
    if (!this.brainId) {
      throw new Error('THEBRAIN_BRAIN_ID not found in environment variables');
    }
    
    // Initialize three databases
    const dataDir = path.join(__dirname, 'data');
    this.rawDb = new Database(path.join(dataDir, 'raw_content.db'));
    this.processedDb = new Database(path.join(dataDir, 'processed_content.db'));
    this.intelligenceDb = new Database(path.join(dataDir, 'intelligence.db'));
    
    // Initialize direct API client
    this.api = axios.create({
      baseURL: 'https://api.thebrain.com/v1',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'X-Brain-Id': this.brainId
      }
    });
    
    console.log('🧠 TheBrain Three-DB Integration initialized');
    console.log(`   Brain ID: ${this.brainId}`);
  }

  async initialize() {
    try {
      console.log('Testing TheBrain API connection...');
      
      // Test API connection
      try {
        const response = await this.api.get(`/brains/${this.brainId}`);
        console.log(`✅ Connected to brain: ${response.data.name || 'AI Competitive Monitor'}`);
        return true;
      } catch (error) {
        console.log('⚠️  Direct API test failed, will use structured export approach');
        return true;
      }
    } catch (error) {
      console.error('Failed to initialize TheBrain integration:', error.message);
      return false;
    }
  }

  async syncToTheBrain() {
    console.log('🚀 Starting TheBrain visualization sync...');
    
    // Ensure required tables exist
    this.ensureTablesExist();
    
    // 1. Create root thoughts
    const rootId = await this.createRootThought();
    
    // 2. Create architecture thoughts
    await this.createArchitectureView(rootId);
    
    // 3. Sync companies with hierarchy
    await this.syncCompaniesWithHierarchy(rootId);
    
    // 4. Sync recent changes
    await this.syncRecentChanges(rootId);
    
    // 5. Create insight thoughts
    await this.createInsightThoughts(rootId);
    
    // 6. Export for manual import if API fails
    await this.exportToTheBrainFormat();
    
    console.log('✅ TheBrain sync complete!');
  }

  ensureTablesExist() {
    console.log('Ensuring required tables exist...');
    
    // Create baseline_analysis table if it doesn't exist
    this.intelligenceDb.exec(`
      CREATE TABLE IF NOT EXISTS baseline_analysis (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_id INTEGER,
        url_id INTEGER,
        snapshot_id INTEGER UNIQUE,
        entities TEXT,
        relationships TEXT,
        semantic_categories TEXT,
        competitive_data TEXT,
        smart_groups TEXT,
        quantitative_data TEXT,
        extracted_text TEXT,
        full_extraction TEXT,
        summary TEXT,
        relevance_score INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id),
        FOREIGN KEY (url_id) REFERENCES urls(id)
      )
    `);
    
    // Create ai_analysis table if it doesn't exist (for enhanced analysis)
    this.intelligenceDb.exec(`
      CREATE TABLE IF NOT EXISTS ai_analysis (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        change_id INTEGER,
        company_id INTEGER,
        url_id INTEGER,
        analysis_type TEXT,
        entities TEXT,
        summary TEXT,
        category TEXT,
        relevance_score INTEGER,
        competitive_threats TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (change_id) REFERENCES changes(id),
        FOREIGN KEY (company_id) REFERENCES companies(id),
        FOREIGN KEY (url_id) REFERENCES urls(id)
      )
    `);
    
    // Add thebrain_thought_id column to companies if not exists
    try {
      this.intelligenceDb.exec(`
        ALTER TABLE companies ADD COLUMN thebrain_thought_id TEXT;
      `);
    } catch (e) {
      // Column might already exist
    }
    
    console.log('✅ Tables verified/created');
  }

  async createRootThought() {
    console.log('Creating root thought structure...');
    
    const rootThought = {
      name: 'AI Competitive Monitor',
      label: 'SYSTEM',
      kind: 2, // Type thought
      acType: 0, // Public
      foregroundColor: '#667eea',
      backgroundColor: '#1a1a2e'
    };
    
    const rootId = this.generateThoughtId(rootThought.name);
    await this.storeThought(rootId, rootThought, 'root');
    
    // Create main categories
    const categories = [
      { name: 'Monitored Companies', color: '#ef4444', icon: '🏢' },
      { name: 'Recent Changes', color: '#f59e0b', icon: '🔄' },
      { name: 'System Architecture', color: '#3b82f6', icon: '🏗️' },
      { name: 'AI Insights', color: '#22c55e', icon: '🧠' },
      { name: 'Threat Analysis', color: '#dc2626', icon: '⚠️' }
    ];
    
    for (const cat of categories) {
      const catId = this.generateThoughtId(cat.name);
      await this.storeThought(catId, {
        name: cat.name,
        label: cat.icon,
        kind: 2, // Type
        foregroundColor: cat.color,
        backgroundColor: '#0f0f1e'
      }, 'category', rootId);
    }
    
    return rootId;
  }

  async createArchitectureView(rootId) {
    console.log('Creating architecture visualization...');
    
    const archId = this.generateThoughtId('System Architecture');
    
    // Three database architecture
    const databases = [
      {
        name: 'Raw Content DB',
        desc: 'Stores scraped HTML',
        color: '#dc2626',
        tables: ['content_snapshots', 'changes']
      },
      {
        name: 'Processed Content DB', 
        desc: 'Markdown & structured text',
        color: '#f59e0b',
        tables: ['processed_content', 'markdown_content']
      },
      {
        name: 'Intelligence DB',
        desc: 'AI analysis & insights',
        color: '#22c55e',
        tables: ['companies', 'urls', 'baseline_analysis', 'ai_analysis']
      }
    ];
    
    for (const db of databases) {
      const dbId = this.generateThoughtId(db.name);
      await this.storeThought(dbId, {
        name: db.name,
        label: 'DATABASE',
        kind: 1,
        foregroundColor: db.color,
        backgroundColor: '#1a1a2e'
      }, 'database', archId);
      
      // Add table thoughts
      for (const table of db.tables) {
        const tableId = this.generateThoughtId(`${db.name}-${table}`);
        await this.storeThought(tableId, {
          name: table,
          label: 'TABLE',
          kind: 1,
          foregroundColor: '#6b7280',
          backgroundColor: '#111827'
        }, 'table', dbId);
      }
    }
    
    // Workflow thoughts
    const workflows = [
      { name: 'Scrape Workflow', desc: 'Collects raw HTML', color: '#dc2626' },
      { name: 'Process Workflow', desc: 'Converts to markdown', color: '#f59e0b' },
      { name: 'Analyze Workflow', desc: 'AI analysis', color: '#22c55e' },
      { name: 'Sync Workflow', desc: 'Deploy & alerts', color: '#3b82f6' }
    ];
    
    const workflowsId = this.generateThoughtId('GitHub Workflows');
    await this.storeThought(workflowsId, {
      name: 'GitHub Workflows',
      label: 'WORKFLOWS',
      kind: 2,
      foregroundColor: '#8b5cf6',
      backgroundColor: '#1a1a2e'
    }, 'workflows', archId);
    
    for (const wf of workflows) {
      const wfId = this.generateThoughtId(wf.name);
      await this.storeThought(wfId, {
        name: wf.name,
        label: 'WORKFLOW',
        kind: 1,
        foregroundColor: wf.color,
        backgroundColor: '#111827'
      }, 'workflow', workflowsId);
    }
  }

  async syncCompaniesWithHierarchy(rootId) {
    console.log('Syncing companies with hierarchy...');
    
    const companiesId = this.generateThoughtId('Monitored Companies');
    
    // Check if 'enabled' column exists
    const companyColumns = this.intelligenceDb.prepare(
      "PRAGMA table_info(companies)"
    ).all();
    const hasEnabledColumn = companyColumns.some(col => col.name === 'enabled');
    
    // Get companies with their data - check if baseline_analysis has data
    const hasBaselineData = this.intelligenceDb.prepare(
      "SELECT COUNT(*) as count FROM baseline_analysis"
    ).get().count > 0;
    
    let companiesQuery;
    if (hasBaselineData) {
      companiesQuery = `
        SELECT 
          c.*,
          COUNT(DISTINCT u.id) as url_count,
          COUNT(DISTINCT ba.id) as analysis_count
        FROM companies c
        LEFT JOIN urls u ON c.id = u.company_id
        LEFT JOIN baseline_analysis ba ON c.id = ba.company_id
        ${hasEnabledColumn ? 'WHERE c.enabled = 1' : ''}
        GROUP BY c.id
        ORDER BY c.category, c.name
      `;
    } else {
      // Fallback query without baseline_analysis
      companiesQuery = `
        SELECT 
          c.*,
          COUNT(DISTINCT u.id) as url_count,
          0 as analysis_count
        FROM companies c
        LEFT JOIN urls u ON c.id = u.company_id
        ${hasEnabledColumn ? 'WHERE c.enabled = 1' : ''}
        GROUP BY c.id
        ORDER BY c.category, c.name
      `;
    }
    
    const companies = this.intelligenceDb.prepare(companiesQuery).all();
    
    // Group companies by category
    const companyTypes = {
      competitor: { name: 'Competitors', color: '#ef4444', icon: '⚔️' },
      partner: { name: 'Partners', color: '#22c55e', icon: '🤝' },
      tool: { name: 'AI Tools', color: '#f59e0b', icon: '🛠️' },
      industry: { name: 'Industry Players', color: '#3b82f6', icon: '🏭' },
      'llm-provider': { name: 'LLM Providers', color: '#8b5cf6', icon: '🤖' },
      'ai-coding': { name: 'AI Coding Tools', color: '#ec4899', icon: '💻' },
      'ai-research': { name: 'AI Research', color: '#14b8a6', icon: '🔬' },
      'ai-infrastructure': { name: 'AI Infrastructure', color: '#f97316', icon: '🏗️' }
    };
    
    const typeGroups = {};
    
    // Create type groups
    for (const [type, info] of Object.entries(companyTypes)) {
      const groupId = this.generateThoughtId(`Companies-${info.name}`);
      typeGroups[type] = groupId;
      
      await this.storeThought(groupId, {
        name: info.name,
        label: info.icon,
        kind: 2,
        foregroundColor: info.color,
        backgroundColor: '#1a1a2e'
      }, 'company-type', companiesId);
    }
    
    // Add companies to their type groups
    for (const company of companies) {
      const companyId = this.generateThoughtId(`Company-${company.name}`);
      const groupId = typeGroups[company.category] || typeGroups.industry;
      
      await this.storeThought(companyId, {
        name: company.name,
        label: `${company.url_count} URLs | ${company.analysis_count} analyses`,
        kind: 1,
        foregroundColor: this.getColorForType(company.category),
        backgroundColor: '#111827'
      }, 'company', groupId);
      
      // Store mapping for later use
      this.intelligenceDb.prepare(`
        UPDATE companies SET thebrain_thought_id = ? WHERE id = ?
      `).run(companyId, company.id);
    }
    
    console.log(`✅ Synced ${companies.length} companies`);
  }

  async syncRecentChanges(rootId) {
    console.log('Syncing recent changes...');
    
    const changesId = this.generateThoughtId('Recent Changes');
    
    // Get recent high-relevance changes - handle case where ai_analysis might not exist
    const hasAiAnalysis = this.intelligenceDb.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='ai_analysis'"
    ).get();
    
    let changesQuery;
    if (hasAiAnalysis) {
      changesQuery = `
        SELECT 
          c.*,
          u.url,
          u.url_type,
          comp.name as company_name,
          comp.category as company_type,
          comp.thebrain_thought_id as company_thought_id,
          aa.relevance_score,
          aa.summary,
          aa.category,
          aa.competitive_threats
        FROM changes c
        JOIN urls u ON c.url_id = u.id
        JOIN companies comp ON u.company_id = comp.id
        LEFT JOIN ai_analysis aa ON c.id = aa.change_id
        WHERE c.created_at > datetime('now', '-7 days')
        AND (aa.relevance_score >= 6 OR aa.relevance_score IS NULL)
        ORDER BY aa.relevance_score DESC, c.created_at DESC
        LIMIT 50
      `;
    } else {
      // Fallback without ai_analysis
      changesQuery = `
        SELECT 
          c.*,
          u.url,
          u.url_type,
          comp.name as company_name,
          comp.category as company_type,
          comp.thebrain_thought_id as company_thought_id,
          NULL as relevance_score,
          NULL as summary,
          NULL as category,
          NULL as competitive_threats
        FROM changes c
        JOIN urls u ON c.url_id = u.id
        JOIN companies comp ON u.company_id = comp.id
        WHERE c.created_at > datetime('now', '-7 days')
        ORDER BY c.created_at DESC
        LIMIT 50
      `;
    }
    
    const changes = this.intelligenceDb.prepare(changesQuery).all();
    
    // Group changes by relevance
    const relevanceGroups = {
      high: { name: 'High Priority Changes', min: 8, color: '#dc2626', icon: '🔴' },
      medium: { name: 'Medium Priority Changes', min: 6, color: '#f59e0b', icon: '🟡' },
      recent: { name: 'Unanalyzed Changes', min: 0, color: '#6b7280', icon: '⏳' }
    };
    
    const groups = {};
    
    // Create relevance groups
    for (const [key, info] of Object.entries(relevanceGroups)) {
      const groupId = this.generateThoughtId(`Changes-${info.name}`);
      groups[key] = groupId;
      
      await this.storeThought(groupId, {
        name: info.name,
        label: info.icon,
        kind: 2,
        foregroundColor: info.color,
        backgroundColor: '#1a1a2e'
      }, 'change-group', changesId);
    }
    
    // Add changes to groups
    for (const change of changes) {
      const score = change.relevance_score || 0;
      let groupKey = 'recent';
      if (score >= 8) groupKey = 'high';
      else if (score >= 6) groupKey = 'medium';
      
      const changeDate = new Date(change.created_at).toLocaleDateString();
      const changeName = `${change.company_name} - ${change.url_type} (${changeDate})`;
      const changeId = this.generateThoughtId(`Change-${change.id}`);
      
      await this.storeThought(changeId, {
        name: changeName,
        label: `Score: ${score}/10`,
        kind: 3, // Event
        foregroundColor: this.getColorForRelevance(score),
        backgroundColor: '#111827'
      }, 'change', groups[groupKey]);
      
      // Link to company if exists
      if (change.company_thought_id) {
        await this.storeLink(change.company_thought_id, changeId, 'change', 'detected');
      }
    }
    
    console.log(`✅ Synced ${changes.length} recent changes`);
  }

  async createInsightThoughts(rootId) {
    console.log('Creating AI insight thoughts...');
    
    const insightsId = this.generateThoughtId('AI Insights');
    
    // Check if we have ai_analysis data
    const hasAiAnalysis = this.intelligenceDb.prepare(
      "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='ai_analysis'"
    ).get().count > 0;
    
    if (hasAiAnalysis) {
      // Get top insights
      const topThreats = this.intelligenceDb.prepare(`
        SELECT 
          c.name,
          c.category,
          c.thebrain_thought_id,
          COUNT(DISTINCT aa.id) as threat_count,
          AVG(aa.relevance_score) as avg_score
        FROM companies c
        JOIN urls u ON c.id = u.company_id
        JOIN changes ch ON u.id = ch.url_id
        JOIN ai_analysis aa ON ch.id = aa.change_id
        WHERE aa.relevance_score >= 7
        AND ch.created_at > datetime('now', '-30 days')
        GROUP BY c.id
        ORDER BY avg_score DESC, threat_count DESC
        LIMIT 10
      `).all();
      
      if (topThreats.length > 0) {
        const threatsId = this.generateThoughtId('Top Competitive Threats');
        await this.storeThought(threatsId, {
          name: 'Top Competitive Threats',
          label: '⚠️',
          kind: 2,
          foregroundColor: '#dc2626',
          backgroundColor: '#1a1a2e'
        }, 'threats', insightsId);
        
        for (const threat of topThreats) {
          const threatId = this.generateThoughtId(`Threat-${threat.name}`);
          await this.storeThought(threatId, {
            name: `${threat.name} - ${threat.threat_count} threats`,
            label: `Avg: ${threat.avg_score.toFixed(1)}/10`,
            kind: 1,
            foregroundColor: '#ef4444',
            backgroundColor: '#111827'
          }, 'threat', threatsId);
          
          // Link to company
          if (threat.thebrain_thought_id) {
            await this.storeLink(threat.thebrain_thought_id, threatId, 'threat', 'poses');
          }
        }
      }
    }
    
    // Technology trends from baseline_analysis if it exists
    const hasBaselineAnalysis = this.intelligenceDb.prepare(
      "SELECT COUNT(*) as count FROM baseline_analysis"
    ).get().count > 0;
    
    if (hasBaselineAnalysis) {
      const techTrends = this.intelligenceDb.prepare(`
        SELECT 
          json_extract(entities, '$.technologies') as tech_json,
          COUNT(*) as mention_count
        FROM baseline_analysis
        WHERE tech_json IS NOT NULL
        AND created_at > datetime('now', '-7 days')
      `).all();
      
      const techMap = new Map();
      for (const row of techTrends) {
        try {
          const techs = JSON.parse(row.tech_json);
          if (Array.isArray(techs)) {
            for (const tech of techs) {
              const count = techMap.get(tech.name) || 0;
              techMap.set(tech.name, count + 1);
            }
          }
        } catch (e) {}
      }
      
      if (techMap.size > 0) {
        const trendsId = this.generateThoughtId('Technology Trends');
        await this.storeThought(trendsId, {
          name: 'Technology Trends',
          label: '📈',
          kind: 2,
          foregroundColor: '#10b981',
          backgroundColor: '#1a1a2e'
        }, 'trends', insightsId);
        
        // Top 10 technologies
        const sortedTech = Array.from(techMap.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10);
          
        for (const [tech, count] of sortedTech) {
          const techId = this.generateThoughtId(`Tech-${tech}`);
          await this.storeThought(techId, {
            name: tech,
            label: `${count} mentions`,
            kind: 4, // Tag
            foregroundColor: '#3b82f6',
            backgroundColor: '#111827'
          }, 'technology', trendsId);
        }
      }
    }
  }

  async exportToTheBrainFormat() {
    console.log('Exporting data in TheBrain-compatible format...');
    
    const exportData = {
      brain: {
        id: this.brainId,
        name: 'AI Competitive Monitor - Three DB Architecture',
        exportDate: new Date().toISOString(),
        version: '2.0'
      },
      thoughts: [],
      links: [],
      notes: {}
    };
    
    // Get all stored thoughts
    const thoughts = this.intelligenceDb.prepare(`
      SELECT * FROM thebrain_export_data ORDER BY created_at
    `).all();
    
    for (const record of thoughts) {
      const data = JSON.parse(record.data);
      
      // Add thought
      exportData.thoughts.push({
        id: record.thought_id,
        ...data.thought
      });
      
      // Add note if exists
      if (data.note) {
        exportData.notes[record.thought_id] = data.note;
      }
      
      // Add parent link
      if (data.parentId) {
        exportData.links.push({
          thoughtIdA: data.parentId,
          thoughtIdB: record.thought_id,
          relation: 1, // Child
          name: data.linkName || ''
        });
      }
    }
    
    // Get all stored links
    const links = this.intelligenceDb.prepare(`
      SELECT * FROM thebrain_export_links
    `).all();
    
    for (const link of links) {
      exportData.links.push({
        thoughtIdA: link.thought_id_a,
        thoughtIdB: link.thought_id_b,
        relation: link.relation_type,
        name: link.link_name || ''
      });
    }
    
    // Save export
    const exportPath = path.join(__dirname, 'data', 'thebrain-export-3db.json');
    require('fs').writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
    
    console.log(`✅ Exported ${exportData.thoughts.length} thoughts with ${exportData.links.length} links`);
    console.log(`📁 Export saved to: ${exportPath}`);
    
    // Also create a visualization summary
    const summary = {
      statistics: {
        totalThoughts: exportData.thoughts.length,
        totalLinks: exportData.links.length,
        thoughtTypes: {},
        databases: ['raw_content.db', 'processed_content.db', 'intelligence.db']
      },
      hierarchyDepth: this.calculateHierarchyDepth(exportData),
      topLevelCategories: exportData.thoughts.filter(t => t.kind === 2).map(t => t.name)
    };
    
    const summaryPath = path.join(__dirname, 'data', 'thebrain-visualization-summary.json');
    require('fs').writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    
    return exportData;
  }

  // Helper methods
  async storeThought(thoughtId, thoughtData, type, parentId = null) {
    // Create tables if not exist
    this.intelligenceDb.exec(`
      CREATE TABLE IF NOT EXISTS thebrain_export_data (
        thought_id TEXT PRIMARY KEY,
        data TEXT,
        type TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS thebrain_export_links (
        thought_id_a TEXT,
        thought_id_b TEXT,
        relation_type INTEGER,
        link_name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (thought_id_a, thought_id_b)
      );
    `);
    
    const data = {
      thought: thoughtData,
      type: type,
      parentId: parentId
    };
    
    this.intelligenceDb.prepare(`
      INSERT OR REPLACE INTO thebrain_export_data (thought_id, data, type)
      VALUES (?, ?, ?)
    `).run(thoughtId, JSON.stringify(data), type);
  }
  
  async storeLink(thoughtA, thoughtB, relationType, linkName = '') {
    const relationMap = {
      'child': 1,
      'parent': 2,
      'jump': 3,
      'sibling': 4,
      'change': 3,
      'threat': 3
    };
    
    const relation = relationMap[relationType] || 3;
    
    this.intelligenceDb.prepare(`
      INSERT OR IGNORE INTO thebrain_export_links 
      (thought_id_a, thought_id_b, relation_type, link_name)
      VALUES (?, ?, ?, ?)
    `).run(thoughtA, thoughtB, relation, linkName);
  }

  generateThoughtId(name) {
    const crypto = require('crypto');
    return crypto.createHash('md5').update(name).digest('hex');
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
    if (!score) return '#6b7280';
    if (score >= 8) return '#ef4444';
    if (score >= 6) return '#f59e0b';
    if (score >= 4) return '#3b82f6';
    return '#6b7280';
  }

  calculateHierarchyDepth(exportData) {
    // Simple depth calculation
    const parentMap = new Map();
    for (const link of exportData.links) {
      if (link.relation === 1) { // Child relation
        parentMap.set(link.thoughtIdB, link.thoughtIdA);
      }
    }
    
    let maxDepth = 0;
    for (const thought of exportData.thoughts) {
      let depth = 0;
      let current = thought.id;
      while (parentMap.has(current) && depth < 10) {
        current = parentMap.get(current);
        depth++;
      }
      maxDepth = Math.max(maxDepth, depth);
    }
    
    return maxDepth;
  }

  async setupDatabase() {
    console.log('Setting up database columns for TheBrain integration...');
    
    try {
      // Add thebrain_thought_id to companies table in intelligence.db
      this.intelligenceDb.exec(`
        ALTER TABLE companies ADD COLUMN thebrain_thought_id TEXT;
      `);
    } catch (e) {
      // Column might already exist
    }
    
    console.log('✅ Database setup complete');
  }
}

// Export for use
module.exports = TheBrainThreeDBIntegration;

// Run if called directly
if (require.main === module) {
  async function main() {
    const integration = new TheBrainThreeDBIntegration();
    
    await integration.setupDatabase();
    
    const initialized = await integration.initialize();
    if (!initialized) {
      console.error('Failed to initialize TheBrain integration');
      process.exit(1);
    }
    
    await integration.syncToTheBrain();
  }
  
  main().catch(console.error);
}
