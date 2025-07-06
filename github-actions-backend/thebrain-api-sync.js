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
    
    // Initialize API client with correct endpoint
    this.api = axios.create({
      baseURL: 'https://api.bra.in',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      timeout: 30000 // 30 second timeout
    });
    
    // Track created thoughts to avoid duplicates
    this.thoughtCache = new Map();
    
    // Track link creation statistics
    this.linkStats = {
      attempted: 0,
      successful: 0,
      failed: 0,
      duplicates: 0
    };
    
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
      if (error.response?.status === 401) {
        console.error('   Authentication failed - check your API key');
      }
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
      console.log(`   Created/Updated ${this.thoughtCache.size} thoughts`);
      console.log(`   Link Statistics:`);
      console.log(`     - Attempted: ${this.linkStats.attempted}`);
      console.log(`     - Successful: ${this.linkStats.successful}`);
      console.log(`     - Failed: ${this.linkStats.failed}`);
      console.log(`     - Duplicates: ${this.linkStats.duplicates}`);
      
      return true;
      
    } catch (error) {
      console.error('❌ Sync failed:', error.message);
      console.error(error);
      return false;
    }
  }

  async createRootThought() {
    console.log('Creating root thought...');
    
    // CRITICAL: Connect to the brain's central thought
    const BRAIN_CENTRAL_THOUGHT_ID = process.env.THEBRAIN_CENTRAL_THOUGHT_ID || 'db45db5e-da4c-45a3-97a0-31abd02a5a3f';
    
    // Check if we have a stored root thought
    const existingRoot = this.getMapping('root', 'system');
    
    const rootData = {
      name: '🎯 AI Competitive Monitor',
      label: 'SYSTEM',
      kind: 2, // Type
      acType: 0, // Public
      foregroundColor: '#ffffff',
      backgroundColor: '#4c1d95'
    };
    
    let thoughtId;
    if (existingRoot) {
      thoughtId = existingRoot;
      try {
        await this.updateThought(thoughtId, rootData);
      } catch (error) {
        if (error.response?.status === 404) {
          console.log(`Root thought ${thoughtId} not found in brain, creating new one`);
          thoughtId = await this.createThought(rootData);
          await this.storeMapping('root', 'system', thoughtId);
        } else {
          throw error;
        }
      }
    } else {
      thoughtId = await this.createThought(rootData);
      await this.storeMapping('root', 'system', thoughtId);
      
      // CRITICAL: Link to brain's central thought
      console.log('Linking to brain\'s central thought...');
      try {
        await this.createLink(BRAIN_CENTRAL_THOUGHT_ID, thoughtId, 1); // Child link from brain central
        console.log('✅ Successfully linked to brain\'s central thought');
      } catch (error) {
        console.error('⚠️  Failed to link to central thought:', error.message);
        // Try reverse link if forward link fails
        try {
          await this.createLink(thoughtId, BRAIN_CENTRAL_THOUGHT_ID, 2); // Parent link to brain central
          console.log('✅ Successfully created parent link to brain\'s central thought');
        } catch (reverseError) {
          console.error('⚠️  Failed to create reverse link:', reverseError.message);
        }
      }
    }
    
    this.thoughtCache.set('root', thoughtId);
    
    // Add note with system overview
    await this.updateNote(thoughtId, `# AI Competitive Monitor

## System Overview
Real-time monitoring and analysis of 52+ companies in the AI space.

### Architecture
- **Raw Content DB**: HTML snapshots and change detection
- **Processed Content DB**: Markdown and structured text
- **Intelligence DB**: AI analysis and insights

### Categories
- 🤖 LLM Providers
- 💻 AI Coding Tools
- 🏗️ AI Infrastructure
- 🔬 AI Research
- ⚔️ Competitors
- 🤝 Partners
- 🏭 Industry Players

Last sync: ${new Date().toISOString()}`);
    
    return thoughtId;
  }

  async createCategories(rootId) {
    console.log('Creating main categories...');
    
    const categories = {
      companies: { name: '🏢 Monitored Companies', color: '#ffffff', bgColor: '#dc2626', icon: '🏢' },
      changes: { name: '🔄 Recent Changes', color: '#ffffff', bgColor: '#d97706', icon: '🔄' },
      architecture: { name: '🏗️ System Architecture', color: '#ffffff', bgColor: '#2563eb', icon: '🏗️' },
      insights: { name: '🧠 AI Insights', color: '#ffffff', bgColor: '#059669', icon: '🧠' },
      threats: { name: '⚔️ Competitive Intelligence', color: '#ffffff', bgColor: '#7c2d12', icon: '⚔️' }
    };
    
    const categoryIds = {};
    
    for (const [key, cat] of Object.entries(categories)) {
      // Check for existing category
      const existingId = this.getMapping('category', key);
      
      const thoughtData = {
        name: cat.name,
        label: cat.icon,
        kind: 2, // Type
        foregroundColor: cat.color,
        backgroundColor: cat.bgColor
      };
      
      let catId;
      if (existingId) {
        catId = existingId;
        try {
          await this.updateThought(catId, thoughtData);
        } catch (error) {
          if (error.response?.status === 404) {
            console.log(`Category thought ${catId} not found in brain, creating new one`);
            catId = await this.createThought(thoughtData);
            await this.createLink(rootId, catId, 1); // Child link
            await this.storeMapping('category', key, catId);
          } else {
            throw error;
          }
        }
      } else {
        catId = await this.createThought(thoughtData);
        await this.createLink(rootId, catId, 1); // Child link
        await this.storeMapping('category', key, catId);
      }
      
      categoryIds[key] = catId;
      this.thoughtCache.set(cat.name, catId);
    }
    
    return categoryIds;
  }

  async createArchitecture(archId) {
    console.log('Creating architecture visualization...');
    
    const databases = [
      {
        name: '🗜️ Raw Content DB',
        desc: 'HTML & Changes',
        color: '#ffffff',
        bgColor: '#991b1b',
        tables: ['content_snapshots', 'changes']
      },
      {
        name: '📄 Processed Content DB',
        desc: 'Markdown & Text',
        color: '#ffffff',
        bgColor: '#d97706',
        tables: ['processed_content', 'markdown_content']
      },
      {
        name: '🧠 Intelligence DB',
        desc: 'Analysis & Insights',
        color: '#ffffff',
        bgColor: '#059669',
        tables: ['companies', 'urls', 'baseline_analysis', 'ai_analysis']
      }
    ];
    
    for (const db of databases) {
      const existingDbId = this.getMapping('database', db.name);
      
      const dbData = {
        name: db.name,
        label: db.desc,
        kind: 1, // Normal
        foregroundColor: db.color,
        backgroundColor: db.bgColor
      };
      
      let dbId;
      if (existingDbId) {
        dbId = existingDbId;
        try {
          await this.updateThought(dbId, dbData);
        } catch (error) {
          if (error.response?.status === 404) {
            console.log(`Database thought ${dbId} not found in brain, creating new one`);
            dbId = await this.createThought(dbData);
            await this.createLink(archId, dbId, 1);
            await this.storeMapping('database', db.name, dbId);
          } else {
            throw error;
          }
        }
      } else {
        dbId = await this.createThought(dbData);
        await this.createLink(archId, dbId, 1);
        await this.storeMapping('database', db.name, dbId);
      }
      
      // Add note with database details
      await this.updateNote(dbId, `# ${db.name}

## Purpose
${db.desc}

## Tables
${db.tables.map(t => `- **${t}**`).join('\n')}

## Location
\`github-actions-backend/data/${db.name.toLowerCase().replace(/ /g, '_')}.db\``);
      
      // Add tables
      for (const table of db.tables) {
        const existingTableId = this.getMapping('table', `${db.name}:${table}`);
        
        const tableData = {
          name: `📊 ${table}`,
          label: 'TABLE',
          kind: 1,
          foregroundColor: '#ffffff',
          backgroundColor: '#6b7280'
        };
        
        if (!existingTableId) {
          const tableId = await this.createThought(tableData);
          await this.createLink(dbId, tableId, 1);
          await this.storeMapping('table', `${db.name}:${table}`, tableId);
        }
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
      'llm-provider': { name: '🤖 LLM Providers', color: '#ffffff', bgColor: '#7c3aed', icon: '🤖' },
      'ai-coding': { name: '💻 AI Coding Tools', color: '#ffffff', bgColor: '#db2777', icon: '💻' },
      'ai-infrastructure': { name: '🏗️ AI Infrastructure', color: '#ffffff', bgColor: '#ea580c', icon: '🏗️' },
      'ai-research': { name: '🔬 AI Research', color: '#ffffff', bgColor: '#0891b2', icon: '🔬' },
      'competitor': { name: '⚔️ Competitors', color: '#ffffff', bgColor: '#dc2626', icon: '⚔️' },
      'partner': { name: '🤝 Partners', color: '#ffffff', bgColor: '#16a34a', icon: '🤝' },
      'industry': { name: '🏭 Industry Players', color: '#ffffff', bgColor: '#2563eb', icon: '🏭' }
    };
    
    const categoryGroups = {};
    
    // Create category groups
    for (const [key, info] of Object.entries(categoryMap)) {
      const existingGroupId = this.getMapping('company-category', key);
      
      const groupData = {
        name: info.name,
        label: info.icon,
        kind: 2, // Type
        foregroundColor: info.color,
        backgroundColor: info.bgColor
      };
      
      let groupId;
      if (existingGroupId) {
        groupId = existingGroupId;
        try {
          await this.updateThought(groupId, groupData);
        } catch (error) {
          if (error.response?.status === 404) {
            console.log(`Company category thought ${groupId} not found in brain, creating new one`);
            groupId = await this.createThought(groupData);
            await this.createLink(companiesId, groupId, 1);
            await this.storeMapping('company-category', key, groupId);
          } else {
            throw error;
          }
        }
      } else {
        groupId = await this.createThought(groupData);
        await this.createLink(companiesId, groupId, 1);
        await this.storeMapping('company-category', key, groupId);
      }
      
      categoryGroups[key] = groupId;
    }
    
    // Add companies
    let companyCount = 0;
    let updatedCount = 0;
    
    for (const company of companies) {
      const category = company.category || 'industry';
      const groupId = categoryGroups[category] || categoryGroups.industry;
      
      let companyThoughtId;
      
      // Check if we already have a thought ID for this company
      if (company.thebrain_thought_id) {
        // Update existing thought
        companyThoughtId = company.thebrain_thought_id;
        
        const updateData = {
          name: company.name,
          label: `${company.url_count} URLs`,
          kind: 1,
          foregroundColor: '#ffffff',
          backgroundColor: categoryMap[category]?.bgColor || '#4b5563'
        };
        
        try {
          await this.updateThought(companyThoughtId, updateData);
          updatedCount++;
        } catch (error) {
          if (error.response?.status === 404) {
            console.log(`Company thought ${companyThoughtId} not found, creating new one for ${company.name}`);
            companyThoughtId = await this.createThought(updateData);
            await this.createLink(groupId, companyThoughtId, 1);
            // Update the database with the new thought ID
            this.intelligenceDb.prepare(`
              UPDATE companies SET thebrain_thought_id = ? WHERE id = ?
            `).run(companyThoughtId, company.id);
          } else {
            throw error;
          }
        }
      } else {
        // Create new thought
        const companyData = {
          name: company.name,
          label: `${company.url_count} URLs`,
          kind: 1,
          foregroundColor: '#ffffff',
          backgroundColor: categoryMap[category]?.bgColor || '#4b5563'
        };
        
        companyThoughtId = await this.createThought(companyData);
        await this.createLink(groupId, companyThoughtId, 1);
        
        // Store thought ID in database
        this.intelligenceDb.prepare(`
          UPDATE companies SET thebrain_thought_id = ? WHERE id = ?
        `).run(companyThoughtId, company.id);
      }
      
      // Update company note
      await this.updateNote(companyThoughtId, `# ${company.name}

## Category
${categoryMap[category]?.name || 'Industry'}

## Overview
${company.description || 'No description available'}

## URLs Monitored
${company.url_count} URLs

## Key Focus Areas
${company.tags ? company.tags.split(',').map(t => `- ${t.trim()}`).join('\n') : 'Not specified'}

## Last Updated
${new Date().toISOString()}`);
      
      // Store in cache for this session
      this.thoughtCache.set(`company_${company.id}`, companyThoughtId);
      
      companyCount++;
    }
    
    console.log(`✅ Synced ${companyCount} companies (${updatedCount} updated, ${companyCount - updatedCount} created)`);
  }

  async syncChanges(changesId) {
    console.log('Syncing recent changes...');
    
    try {
      // Get recent high-value changes with company thought IDs from change_intelligence table
      const changes = this.intelligenceDb.prepare(`
        SELECT 
          ci.id,
          ci.analyzed_at as created_at,
          u.url_type,
          ci.company_name,
          c.id as company_id,
          c.thebrain_thought_id as company_thought_id,
          ci.relevance_score,
          ci.category,
          ci.key_changes
        FROM change_intelligence ci
        JOIN urls u ON ci.url_id = u.id
        JOIN companies c ON c.name = ci.company_name
        WHERE ci.analyzed_at > datetime('now', '-7 days')
        AND ci.relevance_score >= 6
        ORDER BY ci.relevance_score DESC
        LIMIT 20
      `).all();
      
      if (changes.length === 0) {
        console.log('No recent high-value changes found');
        return;
      }
      
      // Create priority groups
      const groups = {
        high: { name: '🔴 High Priority', color: '#ffffff', bgColor: '#b91c1c', icon: '🔴', min: 8 },
        medium: { name: '🟡 Medium Priority', color: '#ffffff', bgColor: '#d97706', icon: '🟡', min: 6 }
      };
      
      const groupIds = {};
      for (const [key, info] of Object.entries(groups)) {
        const existingGroupId = this.getMapping('change-priority', key);
        
        const groupData = {
          name: info.name,
          label: info.icon,
          kind: 2,
          foregroundColor: info.color,
          backgroundColor: info.bgColor
        };
        
        let groupId;
        if (existingGroupId) {
          groupId = existingGroupId;
          try {
            await this.updateThought(groupId, groupData);
          } catch (error) {
            if (error.response?.status === 404) {
              console.log(`Change priority thought ${groupId} not found in brain, creating new one`);
              groupId = await this.createThought(groupData);
              await this.createLink(changesId, groupId, 1);
              await this.storeMapping('change-priority', key, groupId);
            } else {
              throw error;
            }
          }
        } else {
          groupId = await this.createThought(groupData);
          await this.createLink(changesId, groupId, 1);
          await this.storeMapping('change-priority', key, groupId);
        }
        
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
          backgroundColor: groups[priority].bgColor
        };
        
        const changeId = await this.createThought(changeData);
        await this.createLink(groupId, changeId, 1);
        
        // Add change details as note
        if (change.key_changes) {
          await this.updateNote(changeId, `# ${change.company_name} Update

## Category
${change.category || 'General Update'}

## Relevance Score
${change.relevance_score}/10

## Key Changes
${change.key_changes}

## Detected
${new Date(change.created_at).toLocaleString()}`);
        }
        
        // Link to company if available (use database ID or cache)
        const companyThoughtId = change.company_thought_id || this.thoughtCache.get(`company_${change.company_id}`);
        if (companyThoughtId) {
          await this.createLink(companyThoughtId, changeId, 3, 'detected');
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
      { name: '📈 Technology Trends', icon: '📈', color: '#ffffff', bgColor: '#047857' },
      { name: '⚠️ Competitive Threats', icon: '⚠️', color: '#ffffff', bgColor: '#dc2626' },
      { name: '💡 Market Opportunities', icon: '💡', color: '#ffffff', bgColor: '#d97706' }
    ];
    
    for (const insight of insights) {
      const existingId = this.getMapping('insight', insight.name);
      
      const insightData = {
        name: insight.name,
        label: insight.icon,
        kind: 2,
        foregroundColor: insight.color,
        backgroundColor: insight.bgColor
      };
      
      if (!existingId) {
        const insightId = await this.createThought(insightData);
        await this.createLink(insightsId, insightId, 1);
        await this.storeMapping('insight', insight.name, insightId);
      }
    }
  }

  // API helper methods
  async createThought(data) {
    try {
      const response = await this.api.post(`/thoughts/${this.brainId}`, data);
      return response.data.id;
      
    } catch (error) {
      console.error(`Failed to create thought "${data.name}":`, error.response?.data || error.message);
      throw error;
    }
  }

  async updateThought(thoughtId, data) {
    try {
      // Use PATCH with JSON Patch format instead of PUT
      const patchData = [];
      
      // Convert data to JSON Patch operations
      for (const [key, value] of Object.entries(data)) {
        patchData.push({
          op: 'replace',
          path: `/${key}`,
          value: value
        });
      }
      
      await this.api.patch(`/thoughts/${this.brainId}/${thoughtId}`, patchData, {
        headers: {
          'Content-Type': 'application/json-patch+json'
        }
      });
      
      return thoughtId;
    } catch (error) {
      console.error(`Failed to update thought ${thoughtId}:`, error.response?.data || error.message);
      throw error;
    }
  }

  async createLink(thoughtIdA, thoughtIdB, relation, name = '') {
    this.linkStats.attempted++;
    
    try {
      const payload = {
        thoughtIdA,
        thoughtIdB,
        relation,
        name
      };
      
      const response = await this.api.post(`/links/${this.brainId}`, payload);
      this.linkStats.successful++;
      console.log(`✅ Created link: ${thoughtIdA} -> ${thoughtIdB} (${name || 'unlabeled'})`);
      return response.data;
      
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message;
      console.error(`❌ Failed to create link between ${thoughtIdA} and ${thoughtIdB}: ${errorMsg}`);
      
      // Check if it's a duplicate link error (common and can be ignored)
      if (errorMsg?.toLowerCase().includes('duplicate') || 
          errorMsg?.toLowerCase().includes('already exists') ||
          errorMsg?.toLowerCase().includes('conflict')) {
        console.log('   (Link already exists, continuing...)');
        this.linkStats.duplicates++;
        return null;
      }
      
      // For other errors, increment failed count and throw
      this.linkStats.failed++;
      throw new Error(errorMsg);
    }
  }

  async updateNote(thoughtId, markdown) {
    try {
      await this.api.post(`/notes/${this.brainId}/${thoughtId}/update`, {
        markdown
      });
    } catch (error) {
      console.error(`Failed to update note for thought ${thoughtId}:`, error.response?.data || error.message);
      // Don't throw - notes are optional
    }
  }

  async addUrlAttachment(thoughtId, url, name) {
    try {
      await this.api.post(`/attachments/${this.brainId}/${thoughtId}/url`, null, {
        params: { url, name }
      });
    } catch (error) {
      console.error(`Failed to add URL attachment:`, error.response?.data || error.message);
      // Don't throw - attachments are optional
    }
  }

  // Helper methods for tracking mappings
  storeMapping(entityType, entityId, thoughtId) {
    try {
      // Check if mapping table exists
      const hasTable = this.intelligenceDb.prepare(
        "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='thebrain_mappings'"
      ).get().count > 0;
      
      if (hasTable) {
        this.intelligenceDb.prepare(`
          INSERT OR REPLACE INTO thebrain_mappings (entity_type, entity_id, thought_id, updated_at)
          VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        `).run(entityType, entityId.toString(), thoughtId);
      }
    } catch (error) {
      console.log(`Note: Could not store mapping - table may not exist yet`);
    }
  }

  getMapping(entityType, entityId) {
    try {
      // Check if mapping table exists
      const hasTable = this.intelligenceDb.prepare(
        "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='thebrain_mappings'"
      ).get().count > 0;
      
      if (!hasTable) {
        return null;
      }
      
      const result = this.intelligenceDb.prepare(`
        SELECT thought_id FROM thebrain_mappings 
        WHERE entity_type = ? AND entity_id = ?
      `).get(entityType, entityId.toString());
      
      return result?.thought_id;
    } catch (error) {
      return null;
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
