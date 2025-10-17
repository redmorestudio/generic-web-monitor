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

class TheBrainIntegration {
  constructor() {
    this.apiKey = process.env.THEBRAIN_API_KEY;
    if (!this.apiKey) {
      throw new Error('THEBRAIN_API_KEY not found in environment variables');
    }
    
    // Initialize database
    const dbPath = path.join(__dirname, 'data', 'monitor.db');
    this.db = new Database(dbPath);
    
    // Initialize TheBrain MCP server
    this.brainAPI = axios.create({
      baseURL: 'http://localhost:3000', // Adjust if MCP server is on different port
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
    
    this.activeBrainId = null;
  }

  async initialize() {
    try {
      // List available brains
      const brainsResponse = await this.brainAPI.post('/mcp', {
        method: 'thebrain-mcp:list_brains',
        params: {}
      });
      
      const brains = brainsResponse.data.result;
      console.log(`Found ${brains.length} brains`);
      
      // Use first brain or create one for AI Monitor
      if (brains.length > 0) {
        // Look for AI Monitor brain or use first one
        const aiMonitorBrain = brains.find(b => b.name.includes('AI Monitor')) || brains[0];
        this.activeBrainId = aiMonitorBrain.id;
        console.log(`Using brain: ${aiMonitorBrain.name} (${this.activeBrainId})`);
      } else {
        console.log('No brains found. Please create a brain in TheBrain first.');
        return false;
      }
      
      // Set active brain
      await this.brainAPI.post('/mcp', {
        method: 'thebrain-mcp:set_active_brain',
        params: { brainId: this.activeBrainId }
      });
      
      return true;
    } catch (error) {
      console.error('Failed to initialize TheBrain integration:', error.message);
      return false;
    }
  }

  async createCompanyThought(company) {
    try {
      // Create main company thought
      const thought = await this.brainAPI.post('/mcp', {
        method: 'thebrain-mcp:create_thought',
        params: {
          brainId: this.activeBrainId,
          name: company.name,
          kind: 1, // Normal thought
          label: company.type.toUpperCase(),
          foregroundColor: this.getColorForType(company.type),
          backgroundColor: '#1a1a2e'
        }
      });
      
      console.log(`Created thought for ${company.name}: ${thought.data.result.id}`);
      
      // Store thought ID in database for reference
      this.db.prepare(`
        UPDATE companies SET thebrain_thought_id = ? WHERE id = ?
      `).run(thought.data.result.id, company.id);
      
      // Add note with company details
      const noteContent = `# ${company.name}

**Type:** ${company.type}
**Status:** ${company.enabled ? 'Active' : 'Inactive'}
**URLs Monitored:** ${company.url_count || 0}
**Company ID:** ${company.id}

## Monitored URLs
${await this.getCompanyUrlsList(company.id)}

## Recent Activity
${await this.getRecentActivity(company.id)}
`;
      
      await this.brainAPI.post('/mcp', {
        method: 'thebrain-mcp:create_or_update_note',
        params: {
          brainId: this.activeBrainId,
          thoughtId: thought.data.result.id,
          markdown: noteContent
        }
      });
      
      return thought.data.result.id;
    } catch (error) {
      console.error(`Failed to create thought for ${company.name}:`, error.message);
      return null;
    }
  }

  async createChangeThought(change) {
    try {
      // Get company thought ID
      const company = this.db.prepare(`
        SELECT c.*, c.thebrain_thought_id 
        FROM companies c
        JOIN urls u ON c.id = u.company_id
        WHERE u.id = ?
      `).get(change.url_id);
      
      if (!company.thebrain_thought_id) {
        // Create company thought first if it doesn't exist
        company.thebrain_thought_id = await this.createCompanyThought(company);
      }
      
      const changeDate = new Date(change.created_at).toLocaleDateString();
      const thoughtName = `${company.name} - ${change.url_type} Change (${changeDate})`;
      
      // Determine color based on relevance
      const color = this.getColorForRelevance(change.relevance_score);
      
      // Create change thought
      const thought = await this.brainAPI.post('/mcp', {
        method: 'thebrain-mcp:create_thought',
        params: {
          brainId: this.activeBrainId,
          name: thoughtName,
          kind: 3, // Event type for changes
          sourceThoughtId: company.thebrain_thought_id,
          relation: 1, // Child relation
          foregroundColor: color,
          backgroundColor: '#0f0f1e'
        }
      });
      
      console.log(`Created change thought: ${thought.data.result.id}`);
      
      // Add detailed note
      const noteContent = `# ${thoughtName}

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
`;
      
      await this.brainAPI.post('/mcp', {
        method: 'thebrain-mcp:create_or_update_note',
        params: {
          brainId: this.activeBrainId,
          thoughtId: thought.data.result.id,
          markdown: noteContent
        }
      });
      
      // Store thought ID
      this.db.prepare(`
        UPDATE changes SET thebrain_thought_id = ? WHERE id = ?
      `).run(thought.data.result.id, change.id);
      
      return thought.data.result.id;
    } catch (error) {
      console.error('Failed to create change thought:', error.message);
      return null;
    }
  }

  async createGroupThought(group) {
    try {
      const thought = await this.brainAPI.post('/mcp', {
        method: 'thebrain-mcp:create_thought',
        params: {
          brainId: this.activeBrainId,
          name: `Group: ${group.name}`,
          kind: 4, // Tag type for groups
          foregroundColor: group.color,
          backgroundColor: '#16213e'
        }
      });
      
      console.log(`Created group thought: ${thought.data.result.id}`);
      
      // Link companies to group
      const companies = this.db.prepare(`
        SELECT c.*, c.thebrain_thought_id
        FROM companies c
        JOIN company_groups cg ON c.id = cg.company_id
        WHERE cg.group_id = ?
      `).all(group.id);
      
      for (const company of companies) {
        if (company.thebrain_thought_id) {
          await this.brainAPI.post('/mcp', {
            method: 'thebrain-mcp:create_link',
            params: {
              brainId: this.activeBrainId,
              thoughtIdA: thought.data.result.id,
              thoughtIdB: company.thebrain_thought_id,
              relation: 3, // Jump relation for grouping
              name: 'includes',
              color: group.color
            }
          });
        }
      }
      
      return thought.data.result.id;
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
    
    for (const company of companies) {
      if (!company.thebrain_thought_id) {
        await this.createCompanyThought(company);
        await this.sleep(500); // Rate limiting
      }
    }
    
    console.log(`Synced ${companies.length} companies`);
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
    
    for (const change of changes) {
      await this.createChangeThought(change);
      await this.sleep(500); // Rate limiting
    }
    
    console.log(`Synced ${changes.length} changes`);
  }

  async createCompetitiveLandscapeView() {
    try {
      // Create central "Competitive Landscape" thought
      const landscape = await this.brainAPI.post('/mcp', {
        method: 'thebrain-mcp:create_thought',
        params: {
          brainId: this.activeBrainId,
          name: 'AI Competitive Landscape',
          kind: 2, // Type thought
          foregroundColor: '#667eea',
          backgroundColor: '#1a1a2e'
        }
      });
      
      // Get all groups
      const groups = this.db.prepare('SELECT * FROM groups').all();
      
      for (const group of groups) {
        const groupThoughtId = await this.createGroupThought(group);
        
        // Link group to landscape
        if (groupThoughtId) {
          await this.brainAPI.post('/mcp', {
            method: 'thebrain-mcp:create_link',
            params: {
              brainId: this.activeBrainId,
              thoughtIdA: landscape.data.result.id,
              thoughtIdB: groupThoughtId,
              relation: 1, // Child relation
              name: 'contains',
              color: '#667eea'
            }
          });
        }
      }
      
      console.log('Created competitive landscape view');
    } catch (error) {
      console.error('Failed to create landscape view:', error.message);
    }
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

  async getCompanyUrlsList(companyId) {
    const urls = this.db.prepare(`
      SELECT * FROM urls WHERE company_id = ? AND enabled = 1
    `).all(companyId);
    
    return urls.map(u => `- [${u.type}] ${u.url}`).join('\n');
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

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Add column for TheBrain thought IDs if not exists
  async setupDatabase() {
    try {
      // Add thebrain_thought_id columns
      this.db.exec(`
        ALTER TABLE companies ADD COLUMN thebrain_thought_id TEXT;
        ALTER TABLE changes ADD COLUMN thebrain_thought_id TEXT;
        ALTER TABLE groups ADD COLUMN thebrain_thought_id TEXT;
      `);
      console.log('Added TheBrain columns to database');
    } catch (error) {
      // Columns might already exist
      if (!error.message.includes('duplicate column')) {
        console.error('Database setup error:', error.message);
      }
    }
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'sync';
  
  const integration = new TheBrainIntegration();
  
  // Setup database
  await integration.setupDatabase();
  
  // Initialize connection
  const initialized = await integration.initialize();
  if (!initialized) {
    console.error('Failed to initialize TheBrain integration');
    process.exit(1);
  }
  
  switch (command) {
    case 'sync':
      // Sync all companies and recent changes
      await integration.syncAllCompanies();
      await integration.syncRecentChanges(24);
      break;
      
    case 'companies':
      // Only sync companies
      await integration.syncAllCompanies();
      break;
      
    case 'changes':
      // Only sync recent changes
      const hours = parseInt(args[1]) || 24;
      await integration.syncRecentChanges(hours);
      break;
      
    case 'landscape':
      // Create competitive landscape view
      await integration.createCompetitiveLandscapeView();
      break;
      
    case 'full':
      // Full sync with landscape
      await integration.syncAllCompanies();
      await integration.syncRecentChanges(168); // Last week
      await integration.createCompetitiveLandscapeView();
      break;
      
    default:
      console.log('Usage:');
      console.log('  node thebrain-sync.js sync       - Sync companies and 24h changes');
      console.log('  node thebrain-sync.js companies  - Sync only companies');
      console.log('  node thebrain-sync.js changes [hours] - Sync recent changes');
      console.log('  node thebrain-sync.js landscape  - Create landscape view');
      console.log('  node thebrain-sync.js full       - Full sync with landscape');
  }
  
  console.log('TheBrain sync completed');
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = TheBrainIntegration;
