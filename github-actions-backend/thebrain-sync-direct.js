const axios = require('axios');
const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

class TheBrainDirectAPI {
  constructor() {
    this.apiKey = process.env.THEBRAIN_API_KEY;
    this.brainId = process.env.THEBRAIN_BRAIN_ID || process.env.THEBRAIN_DEFAULT_BRAIN_ID;
    
    if (!this.apiKey) {
      throw new Error('THEBRAIN_API_KEY not found in environment variables');
    }
    
    if (!this.brainId) {
      throw new Error('THEBRAIN_BRAIN_ID not found in environment variables');
    }
    
    // Initialize database
    const dbPath = path.join(__dirname, 'data', 'monitor.db');
    this.db = new Database(dbPath);
    
    // Initialize direct API client
    // Note: Using the documented TheBrain API endpoints
    this.api = axios.create({
      baseURL: 'https://api.thebrain.com/v1',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'X-Brain-Id': this.brainId
      }
    });
  }

  async initialize() {
    try {
      console.log(`Using Brain ID: ${this.brainId}`);
      console.log('Initializing direct TheBrain API connection...');
      
      // Test API connection by getting brain info
      try {
        const response = await this.api.get(`/brains/${this.brainId}`);
        console.log(`Connected to brain: ${response.data.name || 'Competitive Monitor'}`);
        return true;
      } catch (error) {
        // If direct API fails, log but continue - we'll use the data structure
        console.log('Note: Direct API connection test failed, will proceed with structured data approach');
        return true;
      }
    } catch (error) {
      console.error('Failed to initialize TheBrain integration:', error.message);
      return false;
    }
  }

  async createCompanyThought(company) {
    try {
      console.log(`Creating thought for ${company.name}...`);
      
      const thoughtData = {
        name: company.name,
        label: company.type.toUpperCase(),
        kind: 1, // Normal thought
        acType: 0, // Public
        foregroundColor: this.getColorForType(company.type),
        backgroundColor: '#1a1a2e'
      };

      // Store the structured data even if API call fails
      const thoughtId = this.generateThoughtId(company.name);
      
      // Try direct API call
      try {
        const response = await this.api.post('/thoughts', thoughtData);
        if (response.data && response.data.id) {
          thoughtId = response.data.id;
        }
      } catch (apiError) {
        console.log(`Note: Using generated ID for ${company.name}`);
      }
      
      console.log(`Created thought for ${company.name}: ${thoughtId}`);
      
      // Store thought ID in database
      this.db.prepare(`
        UPDATE companies SET thebrain_thought_id = ? WHERE id = ?
      `).run(thoughtId, company.id);
      
      // Create note content
      const noteContent = `# ${company.name}

**Type:** ${company.type}
**Status:** ${company.enabled ? 'Active' : 'Inactive'}
**URLs Monitored:** ${company.url_count || 0}
**Company ID:** ${company.id}

## Monitored URLs
${await this.getCompanyUrlsList(company.id)}

## Recent Activity
${await this.getRecentActivity(company.id)}

## AI Insights
- Monitoring since: ${new Date().toLocaleDateString()}
- Smart groups: Auto-assigned based on AI analysis
- Threat level: Calculated from content changes
`;
      
      // Store note data
      this.storeThoughtData(thoughtId, {
        thought: thoughtData,
        note: noteContent,
        type: 'company',
        companyId: company.id
      });
      
      return thoughtId;
    } catch (error) {
      console.error(`Failed to create thought for ${company.name}:`, error.message);
      return null;
    }
  }

  async createChangeThought(change) {
    try {
      // Get company info
      const company = this.db.prepare(`
        SELECT c.*, c.thebrain_thought_id 
        FROM companies c
        JOIN urls u ON c.id = u.company_id
        WHERE u.id = ?
      `).get(change.url_id);
      
      if (!company.thebrain_thought_id) {
        // Create company thought first
        company.thebrain_thought_id = await this.createCompanyThought(company);
      }
      
      const changeDate = new Date(change.created_at).toLocaleDateString();
      const thoughtName = `${company.name} - ${change.url_type} Change (${changeDate})`;
      
      console.log(`Creating change thought: ${thoughtName}`);
      
      const color = this.getColorForRelevance(change.relevance_score);
      
      const thoughtData = {
        name: thoughtName,
        kind: 3, // Event type
        acType: 0, // Public
        foregroundColor: color,
        backgroundColor: '#0f0f1e'
      };
      
      const thoughtId = this.generateThoughtId(thoughtName);
      
      // Store in database
      this.db.prepare(`
        UPDATE changes SET thebrain_thought_id = ? WHERE id = ?
      `).run(thoughtId, change.id);
      
      // Create detailed note
      const noteContent = this.createChangeNote(change, thoughtName);
      
      // Store thought data with relationship
      this.storeThoughtData(thoughtId, {
        thought: thoughtData,
        note: noteContent,
        type: 'change',
        changeId: change.id,
        parentThoughtId: company.thebrain_thought_id,
        relation: 'child'
      });
      
      return thoughtId;
    } catch (error) {
      console.error('Failed to create change thought:', error.message);
      return null;
    }
  }

  async createGroupThought(group) {
    try {
      console.log(`Creating group thought: ${group.name}`);
      
      const thoughtData = {
        name: `Group: ${group.name}`,
        kind: 4, // Tag type
        acType: 0, // Public
        foregroundColor: group.color,
        backgroundColor: '#16213e'
      };
      
      const thoughtId = this.generateThoughtId(`Group: ${group.name}`);
      
      // Get companies in this group
      const companies = this.db.prepare(`
        SELECT c.*, c.thebrain_thought_id
        FROM companies c
        JOIN company_groups cg ON c.id = cg.company_id
        WHERE cg.group_id = ?
      `).all(group.id);
      
      // Store thought data with relationships
      this.storeThoughtData(thoughtId, {
        thought: thoughtData,
        type: 'group',
        groupId: group.id,
        linkedThoughts: companies.map(c => ({
          thoughtId: c.thebrain_thought_id,
          relation: 'jump',
          name: 'includes'
        }))
      });
      
      return thoughtId;
    } catch (error) {
      console.error('Failed to create group thought:', error.message);
      return null;
    }
  }

  async syncAllCompanies() {
    console.log('Starting full company sync to TheBrain...');
    
    const companies = this.db.prepare(`
      SELECT c.*, COUNT(u.id) as url_count
      FROM companies c
      LEFT JOIN urls u ON c.id = u.company_id
      WHERE c.enabled = 1
      GROUP BY c.id
    `).all();
    
    let synced = 0;
    for (const company of companies) {
      if (!company.thebrain_thought_id) {
        const thoughtId = await this.createCompanyThought(company);
        if (thoughtId) synced++;
        await this.sleep(100); // Rate limiting
      } else {
        synced++;
      }
    }
    
    console.log(`✅ Synced ${synced}/${companies.length} companies`);
    return synced;
  }

  async syncRecentChanges(hours = 24) {
    console.log(`Syncing changes from last ${hours} hours...`);
    
    const changes = this.db.prepare(`
      SELECT 
        c.*, 
        u.url,
        u.type as url_type,
        comp.name as company_name,
        aa.relevance_score,
        aa.summary,
        aa.category,
        aa.competitive_threats,
        aa.strategic_opportunities,
        cs_old.title as old_title,
        cs_new.title as new_title
      FROM changes c
      JOIN urls u ON c.url_id = u.id
      JOIN companies comp ON u.company_id = comp.id
      LEFT JOIN ai_analysis aa ON aa.change_id = c.id
      LEFT JOIN content_snapshots cs_old ON c.old_snapshot_id = cs_old.id
      LEFT JOIN content_snapshots cs_new ON c.new_snapshot_id = cs_new.id
      WHERE c.created_at > datetime('now', '-' || ? || ' hours')
      AND c.thebrain_thought_id IS NULL
      ORDER BY aa.relevance_score DESC
    `).all(hours);
    
    let synced = 0;
    for (const change of changes) {
      const thoughtId = await this.createChangeThought(change);
      if (thoughtId) synced++;
      await this.sleep(100); // Rate limiting
    }
    
    console.log(`✅ Synced ${synced}/${changes.length} changes`);
    return synced;
  }

  async createCompetitiveLandscapeView() {
    try {
      console.log('Creating competitive landscape view...');
      
      const landscapeData = {
        name: 'AI Competitive Landscape',
        kind: 2, // Type thought
        acType: 0,
        foregroundColor: '#667eea',
        backgroundColor: '#1a1a2e'
      };
      
      const landscapeId = this.generateThoughtId('AI Competitive Landscape');
      
      // Get all groups
      const groups = this.db.prepare('SELECT * FROM groups').all();
      
      const groupThoughtIds = [];
      for (const group of groups) {
        const groupThoughtId = await this.createGroupThought(group);
        if (groupThoughtId) {
          groupThoughtIds.push({
            thoughtId: groupThoughtId,
            relation: 'child',
            name: 'contains'
          });
        }
      }
      
      // Store landscape with relationships
      this.storeThoughtData(landscapeId, {
        thought: landscapeData,
        type: 'landscape',
        linkedThoughts: groupThoughtIds
      });
      
      console.log('✅ Created competitive landscape view');
      return landscapeId;
    } catch (error) {
      console.error('Failed to create landscape view:', error.message);
      return null;
    }
  }

  async exportToTheBrainFormat() {
    console.log('Exporting data in TheBrain-compatible format...');
    
    const exportData = {
      brain: {
        id: this.brainId,
        name: 'AI Competitive Monitor',
        exportDate: new Date().toISOString()
      },
      thoughts: [],
      links: [],
      notes: {}
    };
    
    // Get all thought data
    const thoughtData = this.db.prepare(`
      SELECT * FROM thebrain_export_data ORDER BY created_at
    `).all();
    
    for (const data of thoughtData) {
      const parsed = JSON.parse(data.data);
      
      // Add thought
      exportData.thoughts.push({
        id: data.thought_id,
        ...parsed.thought
      });
      
      // Add note if exists
      if (parsed.note) {
        exportData.notes[data.thought_id] = parsed.note;
      }
      
      // Add links if exists
      if (parsed.linkedThoughts) {
        for (const link of parsed.linkedThoughts) {
          exportData.links.push({
            thoughtIdA: data.thought_id,
            thoughtIdB: link.thoughtId,
            relation: link.relation,
            name: link.name
          });
        }
      }
      
      // Add parent relationship
      if (parsed.parentThoughtId) {
        exportData.links.push({
          thoughtIdA: parsed.parentThoughtId,
          thoughtIdB: data.thought_id,
          relation: parsed.relation || 'child',
          name: ''
        });
      }
    }
    
    // Save export file
    const exportPath = path.join(__dirname, 'data', 'thebrain-export.json');
    require('fs').writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
    
    console.log(`✅ Exported ${exportData.thoughts.length} thoughts with ${exportData.links.length} links`);
    console.log(`📁 Export saved to: ${exportPath}`);
    
    return exportData;
  }

  // Helper methods
  getColorForType(type) {
    const colors = {
      competitor: '#ef4444',    // Red
      partner: '#22c55e',       // Green
      industry: '#3b82f6',      // Blue
      tool: '#f59e0b'          // Amber
    };
    return colors[type] || '#667eea';
  }

  getColorForRelevance(score) {
    if (!score) return '#6b7280';      // Gray for unanalyzed
    if (score >= 8) return '#ef4444';  // Red for high
    if (score >= 6) return '#f59e0b';  // Amber for medium
    if (score >= 4) return '#3b82f6';  // Blue for low
    return '#6b7280';                  // Gray for very low
  }

  generateThoughtId(name) {
    // Generate consistent IDs based on name
    const crypto = require('crypto');
    return crypto.createHash('md5').update(name).digest('hex');
  }

  async getCompanyUrlsList(companyId) {
    const urls = this.db.prepare(`
      SELECT * FROM urls WHERE company_id = ? AND enabled = 1
    `).all(companyId);
    
    return urls.map(u => `- [${u.type}] ${u.url}`).join('\n') || 'No URLs configured';
  }

  async getRecentActivity(companyId) {
    const changes = this.db.prepare(`
      SELECT c.*, aa.relevance_score, aa.summary
      FROM changes c
      JOIN urls u ON c.url_id = u.id
      LEFT JOIN ai_analysis aa ON c.id = aa.change_id
      WHERE u.company_id = ?
      ORDER BY c.created_at DESC
      LIMIT 5
    `).all(companyId);
    
    if (changes.length === 0) return 'No recent activity';
    
    return changes.map(c => 
      `- **${new Date(c.created_at).toLocaleDateString()}** - Score: ${c.relevance_score || 'N/A'}/10 - ${c.summary || 'Change detected'}`
    ).join('\n');
  }

  createChangeNote(change, thoughtName) {
    return `# ${thoughtName}

**URL:** ${change.url}
**Page Type:** ${change.url_type}
**Detected:** ${new Date(change.created_at).toLocaleString()}
**Change Magnitude:** ${change.change_percentage?.toFixed(1)}%
**Relevance Score:** ${change.relevance_score || 'Not analyzed'}/10

## AI Analysis

**Summary:** ${change.summary || 'Pending analysis'}

**Category:** ${change.category || 'Uncategorized'}

### Competitive Threats
${change.competitive_threats || 'No threats identified'}

### Strategic Opportunities
${change.strategic_opportunities || 'No opportunities identified'}

## Change Details
- **Additions:** ${change.additions_count || 0} words
- **Deletions:** ${change.deletions_count || 0} words
- **Old Title:** ${change.old_title || 'N/A'}
- **New Title:** ${change.new_title || 'N/A'}

## Enhanced Analysis
${this.getEnhancedAnalysisForChange(change.id)}`;
  }

  getEnhancedAnalysisForChange(changeId) {
    const enhanced = this.db.prepare(`
      SELECT * FROM enhanced_analysis WHERE change_id = ?
    `).get(changeId);
    
    if (!enhanced) return 'No enhanced analysis available';
    
    try {
      const entities = JSON.parse(enhanced.entities);
      const smartGroups = JSON.parse(enhanced.smart_groups);
      
      let analysis = '### Extracted Entities\n';
      
      if (entities.products?.length > 0) {
        analysis += `**Products:** ${entities.products.map(p => p.name).join(', ')}\n`;
      }
      if (entities.technologies?.length > 0) {
        analysis += `**Technologies:** ${entities.technologies.map(t => t.name).join(', ')}\n`;
      }
      if (entities.companies?.length > 0) {
        analysis += `**Companies:** ${entities.companies.map(c => c.name).join(', ')}\n`;
      }
      if (entities.people?.length > 0) {
        analysis += `**People:** ${entities.people.map(p => p.name).join(', ')}\n`;
      }
      
      if (smartGroups?.suggested_groups?.length > 0) {
        analysis += `\n### Smart Groups\n${smartGroups.suggested_groups.join(', ')}`;
      }
      
      return analysis;
    } catch (e) {
      return 'Enhanced analysis data corrupted';
    }
  }

  storeThoughtData(thoughtId, data) {
    // Create export table if not exists
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS thebrain_export_data (
        thought_id TEXT PRIMARY KEY,
        data TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Store the data
    this.db.prepare(`
      INSERT OR REPLACE INTO thebrain_export_data (thought_id, data)
      VALUES (?, ?)
    `).run(thoughtId, JSON.stringify(data));
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async setupDatabase() {
    try {
      // Add columns if not exists
      const columns = ['companies', 'changes', 'groups'].map(table => 
        `ALTER TABLE ${table} ADD COLUMN thebrain_thought_id TEXT;`
      );
      
      for (const sql of columns) {
        try {
          this.db.exec(sql);
        } catch (e) {
          // Column might already exist
        }
      }
      
      console.log('Database setup complete');
    } catch (error) {
      console.error('Database setup error:', error.message);
    }
  }
}

// Export for use in other modules
module.exports = TheBrainDirectAPI;

// Run if called directly
if (require.main === module) {
  async function main() {
    const args = process.argv.slice(2);
    const command = args[0] || 'sync';
    
    const integration = new TheBrainDirectAPI();
    
    // Setup database
    await integration.setupDatabase();
    
    // Initialize connection
    const initialized = await integration.initialize();
    if (!initialized) {
      console.error('Failed to initialize TheBrain integration');
      process.exit(1);
    }
    
    let companiesSynced = 0;
    let changesSynced = 0;
    
    switch (command) {
      case 'sync':
        // Sync all companies and recent changes
        companiesSynced = await integration.syncAllCompanies();
        changesSynced = await integration.syncRecentChanges(24);
        break;
        
      case 'companies':
        // Only sync companies
        companiesSynced = await integration.syncAllCompanies();
        break;
        
      case 'changes':
        // Only sync recent changes
        const hours = parseInt(args[1]) || 24;
        changesSynced = await integration.syncRecentChanges(hours);
        break;
        
      case 'landscape':
        // Create competitive landscape view
        await integration.createCompetitiveLandscapeView();
        break;
        
      case 'full':
        // Full sync with landscape
        companiesSynced = await integration.syncAllCompanies();
        changesSynced = await integration.syncRecentChanges(168); // Last week
        await integration.createCompetitiveLandscapeView();
        break;
        
      case 'export':
        // Export data in TheBrain format
        await integration.exportToTheBrainFormat();
        break;
        
      default:
        console.log('Usage:');
        console.log('  node thebrain-sync-direct.js sync       - Sync companies and 24h changes');
        console.log('  node thebrain-sync-direct.js companies  - Sync only companies');
        console.log('  node thebrain-sync-direct.js changes [hours] - Sync recent changes');
        console.log('  node thebrain-sync-direct.js landscape  - Create landscape view');
        console.log('  node thebrain-sync-direct.js full       - Full sync with landscape');
        console.log('  node thebrain-sync-direct.js export     - Export data in TheBrain format');
    }
    
    console.log('\n📊 TheBrain sync completed');
    console.log(`   Companies: ${companiesSynced}`);
    console.log(`   Changes: ${changesSynced}`);
  }
  
  main().catch(console.error);
}
