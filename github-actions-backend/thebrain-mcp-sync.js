const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

// Import the MCP client if available
let mcpClient = null;
try {
  // This would be the MCP client library when running with MCP
  mcpClient = global.mcpClient || null;
} catch (e) {
  console.log('MCP client not available, will use export mode');
}

class TheBrainMCPSync {
  constructor() {
    this.brainId = process.env.THEBRAIN_BRAIN_ID || '134f1325-4a8d-46d7-a078-5386c8ab3542';
    
    // Initialize three databases
    const dataDir = path.join(__dirname, 'data');
    this.rawDb = new Database(path.join(dataDir, 'raw_content.db'));
    this.processedDb = new Database(path.join(dataDir, 'processed_content.db'));
    this.intelligenceDb = new Database(path.join(dataDir, 'intelligence.db'));
    
    // Track created thoughts
    this.thoughtMap = new Map();
    
    console.log('🧠 TheBrain MCP Sync initialized');
    console.log(`   Brain ID: ${this.brainId}`);
  }

  async syncToTheBrain() {
    console.log('🚀 Starting TheBrain MCP sync...');
    
    if (mcpClient) {
      console.log('✅ Using MCP direct sync mode');
      await this.directMCPSync();
    } else {
      console.log('⚠️  MCP not available, using export mode');
      await this.exportSync();
    }
    
    console.log('✅ TheBrain sync complete!');
  }

  async directMCPSync() {
    // This method would use MCP tools directly
    // For now, we'll use the export approach until MCP is properly integrated
    console.log('Direct MCP sync not yet implemented, falling back to export');
    await this.exportSync();
  }

  async exportSync() {
    // Ensure tables exist
    this.ensureTablesExist();
    
    // 1. Create root structure
    const rootId = await this.createRootThought();
    
    // 2. Create architecture view
    await this.createArchitectureView(rootId);
    
    // 3. Sync companies
    await this.syncCompanies(rootId);
    
    // 4. Sync recent changes
    await this.syncRecentChanges(rootId);
    
    // 5. Create insights
    await this.createInsights(rootId);
    
    // 6. Export for import
    await this.exportData();
  }

  ensureTablesExist() {
    // Create export tables in intelligence.db
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
    
    // Add thebrain_thought_id to companies if needed
    try {
      this.intelligenceDb.exec(`
        ALTER TABLE companies ADD COLUMN thebrain_thought_id TEXT;
      `);
    } catch (e) {
      // Column exists
    }
  }

  async createRootThought() {
    const rootData = {
      name: 'AI Competitive Monitor',
      label: 'SYSTEM',
      kind: 2, // Type
      acType: 0, // Public
      foregroundColor: '#667eea',
      backgroundColor: '#1a1a2e'
    };
    
    const rootId = this.generateId(rootData.name);
    await this.storeThought(rootId, rootData, 'root');
    
    // Create main categories
    const categories = [
      { name: 'Monitored Companies', color: '#ef4444', icon: '🏢' },
      { name: 'Recent Changes', color: '#f59e0b', icon: '🔄' },
      { name: 'System Architecture', color: '#3b82f6', icon: '🏗️' },
      { name: 'AI Insights', color: '#22c55e', icon: '🧠' },
      { name: 'Competitive Intelligence', color: '#dc2626', icon: '⚔️' }
    ];
    
    for (const cat of categories) {
      const catId = this.generateId(cat.name);
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
    const archId = this.generateId('System Architecture');
    
    // Database structure
    const databases = [
      {
        name: 'Raw Content DB',
        desc: 'HTML & Changes',
        color: '#dc2626',
        tables: ['content_snapshots', 'changes']
      },
      {
        name: 'Processed Content DB',
        desc: 'Markdown & Text',
        color: '#f59e0b',
        tables: ['processed_content', 'markdown_content']
      },
      {
        name: 'Intelligence DB',
        desc: 'Analysis & Insights',
        color: '#22c55e',
        tables: ['companies', 'urls', 'baseline_analysis', 'ai_analysis']
      }
    ];
    
    for (const db of databases) {
      const dbId = this.generateId(db.name);
      await this.storeThought(dbId, {
        name: db.name,
        label: db.desc,
        kind: 1, // Normal
        foregroundColor: db.color,
        backgroundColor: '#1a1a2e'
      }, 'database', archId);
      
      for (const table of db.tables) {
        const tableId = this.generateId(`${db.name}-${table}`);
        await this.storeThought(tableId, {
          name: table,
          label: 'TABLE',
          kind: 1,
          foregroundColor: '#6b7280',
          backgroundColor: '#111827'
        }, 'table', dbId);
      }
    }
  }

  async syncCompanies(rootId) {
    const companiesId = this.generateId('Monitored Companies');
    
    // Get companies from intelligence.db
    const companies = this.intelligenceDb.prepare(`
      SELECT c.*, COUNT(DISTINCT u.id) as url_count
      FROM companies c
      LEFT JOIN urls u ON c.id = u.company_id
      GROUP BY c.id
      ORDER BY c.category, c.name
    `).all();
    
    // Group by category
    const categoryMap = {
      'llm-provider': { name: 'LLM Providers', color: '#8b5cf6', icon: '🤖' },
      'ai-coding': { name: 'AI Coding Tools', color: '#ec4899', icon: '💻' },
      'ai-infrastructure': { name: 'AI Infrastructure', color: '#f97316', icon: '🏗️' },
      'competitor': { name: 'Competitors', color: '#ef4444', icon: '⚔️' }
    };
    
    const groups = {};
    
    // Create category groups
    for (const [key, info] of Object.entries(categoryMap)) {
      const groupId = this.generateId(`Companies-${info.name}`);
      groups[key] = groupId;
      
      await this.storeThought(groupId, {
        name: info.name,
        label: info.icon,
        kind: 2, // Type
        foregroundColor: info.color,
        backgroundColor: '#1a1a2e'
      }, 'company-type', companiesId);
    }
    
    // Add companies
    for (const company of companies) {
      const companyId = this.generateId(`Company-${company.name}`);
      const groupId = groups[company.category] || groups.competitor;
      
      await this.storeThought(companyId, {
        name: company.name,
        label: `${company.url_count} URLs`,
        kind: 1,
        foregroundColor: categoryMap[company.category]?.color || '#667eea',
        backgroundColor: '#111827'
      }, 'company', groupId);
      
      // Update company record
      this.intelligenceDb.prepare(`
        UPDATE companies SET thebrain_thought_id = ? WHERE id = ?
      `).run(companyId, company.id);
    }
    
    console.log(`✅ Synced ${companies.length} companies`);
  }

  async syncRecentChanges(rootId) {
    const changesId = this.generateId('Recent Changes');
    
    try {
      // Get recent changes with analysis
      let changes = [];
      
      // Check if we have ai_analysis
      const hasAnalysis = this.intelligenceDb.prepare(
        "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='ai_analysis'"
      ).get().count > 0;
      
      if (hasAnalysis) {
        changes = this.intelligenceDb.prepare(`
          SELECT 
            aa.change_id as id,
            aa.created_at,
            u.url_type,
            c.name as company_name,
            c.thebrain_thought_id as company_thought_id,
            aa.relevance_score,
            aa.category
          FROM ai_analysis aa
          JOIN urls u ON aa.url_id = u.id
          JOIN companies c ON aa.company_id = c.id
          WHERE aa.created_at > datetime('now', '-7 days')
          ORDER BY aa.relevance_score DESC
          LIMIT 20
        `).all();
      }
      
      // Create groups
      const groups = {
        high: { name: 'High Priority', color: '#dc2626', icon: '🔴' },
        medium: { name: 'Medium Priority', color: '#f59e0b', icon: '🟡' },
        low: { name: 'Low Priority', color: '#3b82f6', icon: '🔵' }
      };
      
      for (const [key, info] of Object.entries(groups)) {
        const groupId = this.generateId(`Changes-${info.name}`);
        await this.storeThought(groupId, {
          name: info.name,
          label: info.icon,
          kind: 2,
          foregroundColor: info.color,
          backgroundColor: '#1a1a2e'
        }, 'change-group', changesId);
      }
      
      console.log(`✅ Created change groups, found ${changes.length} recent changes`);
      
    } catch (e) {
      console.log(`⚠️  Could not sync changes: ${e.message}`);
    }
  }

  async createInsights(rootId) {
    const insightsId = this.generateId('AI Insights');
    
    // Create insight categories
    const insights = [
      { name: 'Technology Trends', icon: '📈', color: '#10b981' },
      { name: 'Competitive Threats', icon: '⚠️', color: '#ef4444' },
      { name: 'Market Opportunities', icon: '💡', color: '#f59e0b' }
    ];
    
    for (const insight of insights) {
      const insightId = this.generateId(insight.name);
      await this.storeThought(insightId, {
        name: insight.name,
        label: insight.icon,
        kind: 2,
        foregroundColor: insight.color,
        backgroundColor: '#1a1a2e'
      }, 'insight', insightsId);
    }
  }

  async exportData() {
    const exportData = {
      brain: {
        id: this.brainId,
        name: 'AI Competitive Monitor',
        exportDate: new Date().toISOString()
      },
      thoughts: [],
      links: []
    };
    
    // Get thoughts
    const thoughts = this.intelligenceDb.prepare(`
      SELECT * FROM thebrain_export_data ORDER BY created_at
    `).all();
    
    for (const record of thoughts) {
      const data = JSON.parse(record.data);
      exportData.thoughts.push({
        id: record.thought_id,
        ...data.thought
      });
      
      if (data.parentId) {
        exportData.links.push({
          thoughtIdA: data.parentId,
          thoughtIdB: record.thought_id,
          relation: 1 // Child
        });
      }
    }
    
    // Get links
    const links = this.intelligenceDb.prepare(`
      SELECT * FROM thebrain_export_links
    `).all();
    
    exportData.links.push(...links.map(l => ({
      thoughtIdA: l.thought_id_a,
      thoughtIdB: l.thought_id_b,
      relation: l.relation_type,
      name: l.link_name || ''
    })));
    
    // Save export
    const exportPath = path.join(__dirname, 'data', 'thebrain-mcp-export.json');
    require('fs').writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
    
    console.log(`\n📊 Export Summary:`);
    console.log(`   Thoughts: ${exportData.thoughts.length}`);
    console.log(`   Links: ${exportData.links.length}`);
    console.log(`   Export: ${exportPath}`);
    
    return exportData;
  }

  // Helper methods
  async storeThought(thoughtId, thoughtData, type, parentId = null) {
    const data = {
      thought: thoughtData,
      type: type,
      parentId: parentId
    };
    
    this.intelligenceDb.prepare(`
      INSERT OR REPLACE INTO thebrain_export_data (thought_id, data, type)
      VALUES (?, ?, ?)
    `).run(thoughtId, JSON.stringify(data), type);
    
    this.thoughtMap.set(thoughtData.name, thoughtId);
  }
  
  async storeLink(thoughtA, thoughtB, relationType, linkName = '') {
    const relationMap = {
      'child': 1,
      'parent': 2,
      'jump': 3,
      'sibling': 4
    };
    
    this.intelligenceDb.prepare(`
      INSERT OR IGNORE INTO thebrain_export_links 
      (thought_id_a, thought_id_b, relation_type, link_name)
      VALUES (?, ?, ?, ?)
    `).run(thoughtA, thoughtB, relationMap[relationType] || 3, linkName);
  }

  generateId(name) {
    const crypto = require('crypto');
    return crypto.createHash('md5').update(name).digest('hex');
  }
}

// Export for use
module.exports = TheBrainMCPSync;

// Run if called directly
if (require.main === module) {
  async function main() {
    const sync = new TheBrainMCPSync();
    await sync.syncToTheBrain();
  }
  
  main().catch(console.error);
}
