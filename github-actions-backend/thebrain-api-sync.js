const axios = require('axios');
const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

class TheBrainAPISync {
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
    
    // Initialize API client
    this.api = axios.create({
      baseURL: 'https://api.thebrain.com/v1',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      timeout: 30000 // 30 second timeout
    });
    
    // Track created thoughts to avoid duplicates
    this.thoughtCache = new Map();
    
    console.log('🧠 TheBrain API Sync initialized');
    console.log(`   Brain ID: ${this.brainId}`);
  }

  async testConnection() {
    try {
      console.log('Testing TheBrain API connection...');
      const response = await this.api.get(`/brains/${this.brainId}`);
      console.log(`✅ Connected to brain: ${response.data.name || 'Unknown'}`);
      return true;
    } catch (error) {
      console.error('❌ API connection failed:', error.response?.data || error.message);
      return false;
    }
  }

  async syncToTheBrain() {
    console.log('🚀 Starting TheBrain API sync...');
    
    // Test connection first
    const connected = await this.testConnection();
    if (!connected) {
      console.error('❌ Cannot sync - API connection failed');
      console.log('   Please check THEBRAIN_API_KEY and THEBRAIN_BRAIN_ID');
      return false;
    }
    
    try {
      // Clear any existing thoughts for clean sync
      await this.clearExistingThoughts();
      
      // 1. Create root thought
      const rootId = await this.createRootThought();
      
      // 2. Create main categories
      const categories = await this.createCategories(rootId);
      
      // 3. Create architecture visualization
      await this.createArchitecture(categories.architecture);
      
      // 4. Sync companies
      await this.syncCompanies(categories.companies);
      
      // 5. Sync recent changes
      await this.syncChanges(categories.changes);
      
      // 6. Create insights
      await this.createInsights(categories.insights);
      
      console.log('✅ TheBrain API sync complete!');
      console.log(`   Created ${this.thoughtCache.size} thoughts`);
      
      return true;
      
    } catch (error) {
      console.error('❌ Sync failed:', error.message);
      console.error(error);
      return false;
    }
  }

  async clearExistingThoughts() {
    // For now, we'll skip clearing to preserve existing data
    console.log('Preserving existing thoughts...');
  }

  async createRootThought() {
    console.log('Creating root thought...');
    
    const rootData = {
      name: 'AI Competitive Monitor',
      label: 'SYSTEM',
      kind: 2, // Type
      acType: 0, // Public
      foregroundColor: '#667eea',
      backgroundColor: '#1a1a2e'
    };
    
    const thoughtId = await this.createThought(rootData);
    this.thoughtCache.set('root', thoughtId);
    
    return thoughtId;
  }

  async createCategories(rootId) {
    console.log('Creating main categories...');
    
    const categories = {
      companies: { name: 'Monitored Companies', color: '#ef4444', icon: '🏢' },
      changes: { name: 'Recent Changes', color: '#f59e0b', icon: '🔄' },
      architecture: { name: 'System Architecture', color: '#3b82f6', icon: '🏗️' },
      insights: { name: 'AI Insights', color: '#22c55e', icon: '🧠' },
      threats: { name: 'Competitive Intelligence', color: '#dc2626', icon: '⚔️' }
    };
    
    const categoryIds = {};
    
    for (const [key, cat of Object.entries(categories)) {
      const thoughtData = {
        name: cat.name,
        label: cat.icon,
        kind: 2, // Type
        foregroundColor: cat.color,
        backgroundColor: '#0f0f1e'
      };
      
      const catId = await this.createThought(thoughtData);
      await this.createLink(rootId, catId, 1); // Child link
      
      categoryIds[key] = catId;
      this.thoughtCache.set(cat.name, catId);
    }
    
    return categoryIds;
  }

  async createArchitecture(archId) {
    console.log('Creating architecture visualization...');
    
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
      const dbData = {
        name: db.name,
        label: db.desc,
        kind: 1, // Normal
        foregroundColor: db.color,
        backgroundColor: '#1a1a2e'
      };
      
      const dbId = await this.createThought(dbData);
      await this.createLink(archId, dbId, 1);
      
      // Add tables
      for (const table of db.tables) {
        const tableData = {
          name: table,
          label: 'TABLE',
          kind: 1,
          foregroundColor: '#6b7280',
          backgroundColor: '#111827'
        };
        
        const tableId = await this.createThought(tableData);
        await this.createLink(dbId, tableId, 1);
      }
    }
  }

  async syncCompanies(companiesId) {
    console.log('Syncing companies...');
    
    // Get companies from database
    const companies = this.intelligenceDb.prepare(`
      SELECT c.*, COUNT(DISTINCT u.id) as url_count
      FROM companies c
      LEFT JOIN urls u ON c.id = u.company_id
      GROUP BY c.id
      ORDER BY c.category, c.name
    `).all();
    
    // Category mapping
    const categoryMap = {
      'llm-provider': { name: 'LLM Providers', color: '#8b5cf6', icon: '🤖' },
      'ai-coding': { name: 'AI Coding Tools', color: '#ec4899', icon: '💻' },
      'ai-infrastructure': { name: 'AI Infrastructure', color: '#f97316', icon: '🏗️' },
      'ai-research': { name: 'AI Research', color: '#14b8a6', icon: '🔬' },
      'competitor': { name: 'Competitors', color: '#ef4444', icon: '⚔️' },
      'partner': { name: 'Partners', color: '#22c55e', icon: '🤝' },
      'industry': { name: 'Industry Players', color: '#3b82f6', icon: '🏭' }
    };
    
    const categoryGroups = {};
    
    // Create category groups
    for (const [key, info] of Object.entries(categoryMap)) {
      const groupData = {
        name: info.name,
        label: info.icon,
        kind: 2, // Type
        foregroundColor: info.color,
        backgroundColor: '#1a1a2e'
      };
      
      const groupId = await this.createThought(groupData);
      await this.createLink(companiesId, groupId, 1);
      categoryGroups[key] = groupId;
    }
    
    // Add companies
    let companyCount = 0;
    for (const company of companies) {
      const category = company.category || 'industry';
      const groupId = categoryGroups[category] || categoryGroups.industry;
      
      const companyData = {
        name: company.name,
        label: `${company.url_count} URLs`,
        kind: 1,
        foregroundColor: categoryMap[category]?.color || '#667eea',
        backgroundColor: '#111827'
      };
      
      const companyId = await this.createThought(companyData);
      await this.createLink(groupId, companyId, 1);
      
      // Store thought ID for future reference
      this.intelligenceDb.prepare(`
        UPDATE companies SET thebrain_thought_id = ? WHERE id = ?
      `).run(companyId, company.id);
      
      companyCount++;
    }
    
    console.log(`✅ Synced ${companyCount} companies`);
  }

  async syncChanges(changesId) {
    console.log('Syncing recent changes...');
    
    try {
      // Check for ai_analysis table
      const hasAnalysis = this.intelligenceDb.prepare(
        "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='ai_analysis'"
      ).get().count > 0;
      
      if (!hasAnalysis) {
        console.log('⚠️  No ai_analysis table found, skipping changes');
        return;
      }
      
      // Get recent high-value changes
      const changes = this.intelligenceDb.prepare(`
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
        AND aa.relevance_score >= 6
        ORDER BY aa.relevance_score DESC
        LIMIT 20
      `).all();
      
      if (changes.length === 0) {
        console.log('No recent high-value changes found');
        return;
      }
      
      // Create priority groups
      const groups = {
        high: { name: 'High Priority', color: '#dc2626', icon: '🔴', min: 8 },
        medium: { name: 'Medium Priority', color: '#f59e0b', icon: '🟡', min: 6 }
      };
      
      const groupIds = {};
      for (const [key, info] of Object.entries(groups)) {
        const groupData = {
          name: info.name,
          label: info.icon,
          kind: 2,
          foregroundColor: info.color,
          backgroundColor: '#1a1a2e'
        };
        
        const groupId = await this.createThought(groupData);
        await this.createLink(changesId, groupId, 1);
        groupIds[key] = groupId;
      }
      
      // Add changes
      for (const change of changes) {
        const priority = change.relevance_score >= 8 ? 'high' : 'medium';
        const groupId = groupIds[priority];
        
        const changeData = {
          name: `${change.company_name}: ${change.category || 'Update'}`,
          label: `Score: ${change.relevance_score}/10`,
          kind: 3, // Event
          foregroundColor: groups[priority].color,
          backgroundColor: '#111827'
        };
        
        const changeId = await this.createThought(changeData);
        await this.createLink(groupId, changeId, 1);
        
        // Link to company if available
        if (change.company_thought_id) {
          await this.createLink(change.company_thought_id, changeId, 3, 'detected');
        }
      }
      
      console.log(`✅ Synced ${changes.length} changes`);
      
    } catch (error) {
      console.log(`⚠️  Error syncing changes: ${error.message}`);
    }
  }

  async createInsights(insightsId) {
    console.log('Creating AI insights...');
    
    const insights = [
      { name: 'Technology Trends', icon: '📈', color: '#10b981' },
      { name: 'Competitive Threats', icon: '⚠️', color: '#ef4444' },
      { name: 'Market Opportunities', icon: '💡', color: '#f59e0b' }
    ];
    
    for (const insight of insights) {
      const insightData = {
        name: insight.name,
        label: insight.icon,
        kind: 2,
        foregroundColor: insight.color,
        backgroundColor: '#1a1a2e'
      };
      
      const insightId = await this.createThought(insightData);
      await this.createLink(insightsId, insightId, 1);
    }
  }

  // API helper methods
  async createThought(data) {
    try {
      const payload = {
        brainId: this.brainId,
        ...data
      };
      
      const response = await this.api.post('/thoughts', payload);
      return response.data.id;
      
    } catch (error) {
      console.error(`Failed to create thought "${data.name}":`, error.response?.data || error.message);
      throw error;
    }
  }

  async createLink(thoughtIdA, thoughtIdB, relation, name = '') {
    try {
      const payload = {
        brainId: this.brainId,
        thoughtIdA,
        thoughtIdB,
        relation,
        name
      };
      
      await this.api.post('/links', payload);
      
    } catch (error) {
      console.error(`Failed to create link:`, error.response?.data || error.message);
      // Don't throw - links are less critical
    }
  }
}

// Export for use
module.exports = TheBrainAPISync;

// Run if called directly
if (require.main === module) {
  async function main() {
    const sync = new TheBrainAPISync();
    const success = await sync.syncToTheBrain();
    process.exit(success ? 0 : 1);
  }
  
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
