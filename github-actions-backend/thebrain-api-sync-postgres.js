// SSL Certificate fix for Heroku PostgreSQL
if (process.env.NODE_ENV === 'production' || process.env.POSTGRES_CONNECTION_STRING) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const axios = require('axios');
const path = require('path');
const { db, end } = require('./postgres-db');
require('dotenv').config();

// Error tracking class for TheBrain sync
class TheBrainErrorTracker {
  constructor() {
    this.errors = [];
    this.notFoundCount = 0;
    this.createSuccessCount = 0;
    this.updateSuccessCount = 0;
    this.linkSuccessCount = 0;
    this.linkFailureCount = 0;
    this.criticalErrors = 0;
    this.recreatedThoughts = new Set();
  }
  
  addNotFound(entity, id, name) {
    this.notFoundCount++;
    this.recreatedThoughts.add(`${entity}:${id}`);
    console.log(`⚠️  Thought not found: ${name} (${id}) - will create new one`);
  }
  
  addCreateSuccess() {
    this.createSuccessCount++;
  }
  
  addUpdateSuccess() {
    this.updateSuccessCount++;
  }
  
  addLinkSuccess() {
    this.linkSuccessCount++;
  }
  
  addLinkFailure() {
    this.linkFailureCount++;
  }
  
  addCriticalError(operation, error) {
    this.criticalErrors++;
    this.errors.push({
      type: 'critical',
      operation,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
  
  hasErrors() {
    return this.criticalErrors > 0;
  }
  
  getReport() {
    return {
      summary: {
        thoughts_not_found: this.notFoundCount,
        thoughts_recreated: this.recreatedThoughts.size,
        thoughts_created: this.createSuccessCount,
        thoughts_updated: this.updateSuccessCount,
        links_created: this.linkSuccessCount,
        links_failed: this.linkFailureCount,
        critical_errors: this.criticalErrors
      },
      recreated_thoughts: Array.from(this.recreatedThoughts),
      errors: this.errors,
      status: this.criticalErrors === 0 ? 'success_with_warnings' : 'failed'
    };
  }
}

class TheBrainAPISyncPostgreSQL {
  constructor() {
    this.apiKey = process.env.THEBRAIN_API_KEY;
    this.brainId = process.env.THEBRAIN_BRAIN_ID || process.env.THEBRAIN_DEFAULT_BRAIN_ID;
    
    if (!this.apiKey) {
      throw new Error('THEBRAIN_API_KEY not found in environment variables');
    }
    
    if (!this.brainId) {
      throw new Error('THEBRAIN_BRAIN_ID not found in environment variables');
    }
    
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
    
    // Initialize error tracker
    this.errorTracker = new TheBrainErrorTracker();
    
    console.log('🧠 TheBrain API Sync (PostgreSQL) initialized');
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
      this.errorTracker.addCriticalError('connection', error);
      return false;
    }
  }

  async syncToTheBrain() {
    console.log('🚀 Starting TheBrain API sync (PostgreSQL)...');
    
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
      
      // Generate and log the error report
      const report = this.errorTracker.getReport();
      
      console.log('\n📊 TheBrain API Sync Report (PostgreSQL):');
      console.log('==========================================');
      console.log(`✅ Thoughts created: ${report.summary.thoughts_created}`);
      console.log(`✅ Thoughts updated: ${report.summary.thoughts_updated}`);
      console.log(`✅ Links created: ${report.summary.links_created}`);
      
      if (report.summary.thoughts_not_found > 0) {
        console.log(`\n⚠️  Thoughts not found and recreated: ${report.summary.thoughts_not_found}`);
        console.log('   This happens when thoughts were deleted from TheBrain');
        console.log('   or when switching between different brains.');
      }
      
      if (report.summary.links_failed > 0) {
        console.log(`\n⚠️  Links that failed (likely duplicates): ${report.summary.links_failed}`);
      }
      
      if (report.summary.critical_errors > 0) {
        console.log(`\n❌ Critical errors: ${report.summary.critical_errors}`);
        report.errors.forEach(err => {
          console.log(`   - ${err.operation}: ${err.error}`);
        });
      }
      
      // Save detailed report to file
      const fs = require('fs');
      const reportPath = path.join(__dirname, 'thebrain-sync-report-postgres.json');
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      console.log(`\n📄 Detailed report saved to: ${reportPath}`);
      
      // Return success only if no critical errors
      return !this.errorTracker.hasErrors();
      
    } catch (error) {
      console.error('❌ Sync failed:', error.message);
      console.error(error);
      this.errorTracker.addCriticalError('sync', error);
      return false;
    } finally {
      // Clean up PostgreSQL connection
      await end();
    }
  }

  async createRootThought() {
    console.log('Creating root thought...');
    
    // CRITICAL: Connect to the brain's central thought
    const BRAIN_CENTRAL_THOUGHT_ID = process.env.THEBRAIN_CENTRAL_THOUGHT_ID || 'db45db5e-da4c-45a3-97a0-31abd02a5a3f';
    
    // Check if we have a stored root thought
    const existingRoot = await this.getMapping('root', 'system');
    
    const rootData = {
      name: '🎯 AI Competitive Monitor (PostgreSQL)',
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
        this.errorTracker.addUpdateSuccess();
      } catch (error) {
        if (error.response?.status === 404) {
          this.errorTracker.addNotFound('root', thoughtId, rootData.name);
          thoughtId = await this.createThought(rootData);
          await this.storeMapping('root', 'system', thoughtId);
          this.errorTracker.addCreateSuccess();
        } else {
          throw error;
        }
      }
    } else {
      thoughtId = await this.createThought(rootData);
      await this.storeMapping('root', 'system', thoughtId);
      this.errorTracker.addCreateSuccess();
    }
    
    // ALWAYS ensure link to brain's central thought exists
    console.log('Ensuring link to brain\\'s central thought...');
    try {
      await this.createLink(BRAIN_CENTRAL_THOUGHT_ID, thoughtId, 1); // Child link from brain central
      console.log('✅ Successfully linked to brain\\'s central thought');
      this.errorTracker.addLinkSuccess();
    } catch (error) {
      if (error.message?.toLowerCase().includes('duplicate') || 
          error.message?.toLowerCase().includes('already exists')) {
        console.log('✅ Link to central thought already exists');
      } else {
        console.error('⚠️  Failed to link to central thought:', error.message);
        this.errorTracker.addLinkFailure();
        // Try reverse link if forward link fails
        try {
          await this.createLink(thoughtId, BRAIN_CENTRAL_THOUGHT_ID, 2); // Parent link to brain central
          console.log('✅ Successfully created parent link to brain\\'s central thought');
          this.errorTracker.addLinkSuccess();
        } catch (reverseError) {
          if (reverseError.message?.toLowerCase().includes('duplicate') || 
              reverseError.message?.toLowerCase().includes('already exists')) {
            console.log('✅ Reverse link to central thought already exists');
          } else {
            console.error('⚠️  Failed to create reverse link:', reverseError.message);
            this.errorTracker.addLinkFailure();
          }
        }
      }
    }
    
    this.thoughtCache.set('root', thoughtId);
    
    // Add note with system overview
    await this.updateNote(thoughtId, `# AI Competitive Monitor (PostgreSQL)\n\n## System Overview\nReal-time monitoring and analysis of 52+ companies in the AI space using PostgreSQL backend.\n\n### PostgreSQL Architecture\n- **Raw Content Schema**: HTML snapshots and change detection\n- **Processed Content Schema**: Markdown and structured text\n- **Intelligence Schema**: AI analysis and insights\n\n### Categories\n- 🤖 LLM Providers\n- 💻 AI Coding Tools\n- 🏗️ AI Infrastructure\n- 🔬 AI Research\n- ⚔️ Competitors\n- 🤝 Partners\n- 🏭 Industry Players\n\nLast sync: ${new Date().toISOString()}\nDatabase: PostgreSQL`);
    
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
      const existingId = await this.getMapping('category', key);
      
      const thoughtData = {
        name: cat.name,
        kind: 1, // Normal
        acType: 0, // Public
        foregroundColor: cat.color,
        backgroundColor: cat.bgColor
      };
      
      let catId;
      if (existingId) {
        catId = existingId;
        try {
          await this.updateThought(catId, thoughtData);
          this.errorTracker.addUpdateSuccess();
        } catch (error) {
          if (error.response?.status === 404) {
            this.errorTracker.addNotFound('category', catId, cat.name);
            catId = await this.createThought(thoughtData);
            await this.createLink(rootId, catId, 1); // Child link
            await this.storeMapping('category', key, catId);
            this.errorTracker.addCreateSuccess();
          } else {
            throw error;
          }
        }
      } else {
        catId = await this.createThought(thoughtData);
        await this.createLink(rootId, catId, 1); // Child link
        await this.storeMapping('category', key, catId);
        this.errorTracker.addCreateSuccess();
      }
      
      categoryIds[key] = catId;
      this.thoughtCache.set(`category-${key}`, catId);
    }
    
    return categoryIds;
  }

  async createArchitecture(archId) {
    console.log('Creating PostgreSQL architecture visualization...');
    
    const schemas = [
      { name: '💾 Raw Content Schema', desc: 'scraped_pages & change detection tables' },
      { name: '📝 Processed Content Schema', desc: 'markdown_pages & structured text tables' },
      { name: '🧠 Intelligence Schema', desc: 'baseline_analysis, enhanced_analysis & changes tables' }
    ];
    
    for (const schema of schemas) {
      const existingSchemaId = await this.getMapping('schema', schema.name);
      
      const schemaData = {
        name: schema.name,
        label: 'SCHEMA',
        kind: 1,
        acType: 0,
        foregroundColor: '#ffffff',
        backgroundColor: '#1e40af'
      };
      
      let schemaId;
      if (existingSchemaId) {
        schemaId = existingSchemaId;
        try {
          await this.updateThought(schemaId, schemaData);
          this.errorTracker.addUpdateSuccess();
        } catch (error) {
          if (error.response?.status === 404) {
            this.errorTracker.addNotFound('schema', schemaId, schema.name);
            schemaId = await this.createThought(schemaData);
            await this.createLink(archId, schemaId, 1);
            await this.storeMapping('schema', schema.name, schemaId);
            this.errorTracker.addCreateSuccess();
          } else {
            throw error;
          }
        }
      } else {
        schemaId = await this.createThought(schemaData);
        await this.createLink(archId, schemaId, 1);
        await this.storeMapping('schema', schema.name, schemaId);
        this.errorTracker.addCreateSuccess();
      }
      
      await this.updateNote(schemaId, `# ${schema.name}\n\n${schema.desc}\n\nPostgreSQL schema with full ACID compliance and advanced querying capabilities.`);
    }
  }

  async syncCompanies(companiesId) {
    console.log('Syncing companies from PostgreSQL...');
    
    // Get company summary from intelligence schema
    const companySummary = await db.manyOrNone(`
      SELECT category, COUNT(*) as count 
      FROM intelligence.companies 
      GROUP BY category
    `);
    
    // Create category groups
    const categoryGroups = {};
    
    for (const cat of companySummary) {
      const key = cat.category || 'Other';
      const existingGroupId = await this.getMapping('company-category', key);
      
      const groupData = {
        name: `${key} (${cat.count})`,
        kind: 2, // Type
        acType: 0,
        foregroundColor: '#ffffff',
        backgroundColor: '#dc2626'
      };
      
      let groupId;
      if (existingGroupId) {
        groupId = existingGroupId;
        try {
          await this.updateThought(groupId, groupData);
          this.errorTracker.addUpdateSuccess();
        } catch (error) {
          if (error.response?.status === 404) {
            this.errorTracker.addNotFound('company-category', groupId, groupData.name);
            groupId = await this.createThought(groupData);
            await this.createLink(companiesId, groupId, 1);
            await this.storeMapping('company-category', key, groupId);
            this.errorTracker.addCreateSuccess();
          } else {
            throw error;
          }
        }
      } else {
        groupId = await this.createThought(groupData);
        await this.createLink(companiesId, groupId, 1);
        await this.storeMapping('company-category', key, groupId);
        this.errorTracker.addCreateSuccess();
      }
      
      categoryGroups[key] = groupId;
    }
    
    // Sync individual companies from PostgreSQL
    const companies = await db.manyOrNone(`
      SELECT 
        c.*,
        tm.thought_id
      FROM intelligence.companies c
      LEFT JOIN intelligence.thebrain_mappings tm ON tm.entity_type = 'company' AND tm.entity_id = c.id::text
      ORDER BY c.category, c.name
    `);
    
    let createdCount = 0;
    let updatedCount = 0;
    
    for (const company of companies) {
      const groupId = categoryGroups[company.category || 'Other'];
      
      // Use existing thought_id if available
      let companyThoughtId = company.thought_id;
      
      const updateData = {
        name: company.name,
        label: company.importance || 'MEDIUM',
        kind: 1,
        acType: 0,
        foregroundColor: '#ffffff',
        backgroundColor: this.getCompanyColor(company.importance)
      };
      
      if (companyThoughtId) {
        // Try to update existing thought
        try {
          await this.updateThought(companyThoughtId, updateData);
          updatedCount++;
          this.errorTracker.addUpdateSuccess();
        } catch (error) {
          if (error.response?.status === 404) {
            this.errorTracker.addNotFound('company', companyThoughtId, company.name);
            companyThoughtId = await this.createThought(updateData);
            await this.createLink(groupId, companyThoughtId, 1);
            // Update the database with the new thought ID
            await db.none(`
              UPDATE intelligence.thebrain_mappings 
              SET thought_id = $1, updated_at = NOW() 
              WHERE entity_type = 'company' AND entity_id = $2
            `, [companyThoughtId, company.id.toString()]);
            createdCount++;
            this.errorTracker.addCreateSuccess();
          } else {
            throw error;
          }
        }
      } else {
        // No thought_id stored, create new thought
        companyThoughtId = await this.createThought(updateData);
        await this.createLink(groupId, companyThoughtId, 1);
        await this.storeMapping('company', company.id.toString(), companyThoughtId);
        createdCount++;
        this.errorTracker.addCreateSuccess();
      }
      
      // Add note with company details
      const note = `# ${company.name}\n\n**Category**: ${company.category}\n**Description**: ${company.description || 'No description available'}\n\n## Monitoring Details\n- Added: ${company.created_at}\n- Database: PostgreSQL\n- Schema: intelligence.companies`;
      
      await this.updateNote(companyThoughtId, note);
    }
    
    console.log(`   Created ${createdCount} new company thoughts`);
    console.log(`   Updated ${updatedCount} existing company thoughts`);
  }

  async syncChanges(changesId) {
    console.log('Syncing recent changes from PostgreSQL...');
    
    // Check if changes table exists in intelligence schema
    const hasTable = await db.oneOrNone(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'intelligence' AND table_name = 'changes'
    `);
    
    if (!hasTable || hasTable.count === '0') {
      console.log('   No intelligence.changes table found, skipping changes');
      return;
    }
    
    // Get recent high-priority changes
    const recentChanges = await db.manyOrNone(`
      SELECT 
        c.*,
        c.company as company_name,
        c.url as company_url
      FROM intelligence.changes c
      WHERE c.interest_level >= 7
      ORDER BY c.detected_at DESC
      LIMIT 20
    `);
    
    if (recentChanges.length === 0) {
      console.log('   No high-priority changes found');
      return;
    }
    
    // Group changes by priority
    const priorityGroups = {
      critical: { changes: [], color: '#dc2626' }, // Red
      high: { changes: [], color: '#d97706' }, // Orange
      medium: { changes: [], color: '#eab308' } // Yellow
    };
    
    for (const change of recentChanges) {
      if (change.interest_level >= 9) {
        priorityGroups.critical.changes.push(change);
      } else if (change.interest_level >= 8) {
        priorityGroups.high.changes.push(change);
      } else {
        priorityGroups.medium.changes.push(change);
      }
    }
    
    // Create priority group thoughts
    for (const [key, group] of Object.entries(priorityGroups)) {
      if (group.changes.length === 0) continue;
      
      const existingGroupId = await this.getMapping('change-priority', key);
      
      const groupData = {
        name: `${key.toUpperCase()} Priority (${group.changes.length})`,
        kind: 2,
        acType: 0,
        foregroundColor: '#ffffff',
        backgroundColor: group.color
      };
      
      let groupId;
      if (existingGroupId) {
        groupId = existingGroupId;
        try {
          await this.updateThought(groupId, groupData);
          this.errorTracker.addUpdateSuccess();
        } catch (error) {
          if (error.response?.status === 404) {
            this.errorTracker.addNotFound('change-priority', groupId, groupData.name);
            groupId = await this.createThought(groupData);
            await this.createLink(changesId, groupId, 1);
            await this.storeMapping('change-priority', key, groupId);
            this.errorTracker.addCreateSuccess();
          } else {
            throw error;
          }
        }
      } else {
        groupId = await this.createThought(groupData);
        await this.createLink(changesId, groupId, 1);
        await this.storeMapping('change-priority', key, groupId);
        this.errorTracker.addCreateSuccess();
      }
      
      // Create individual change thoughts
      for (const change of group.changes) {
        let changeSummary = 'Change Detected';
        try {
          if (change.analysis && typeof change.analysis === 'object') {
            changeSummary = change.analysis.summary || changeSummary;
          } else if (typeof change.analysis === 'string') {
            const parsed = JSON.parse(change.analysis);
            changeSummary = parsed.summary || changeSummary;
          }
        } catch (e) {
          // Use default if JSON parsing fails
        }
        
        const changeTitle = changeSummary.substring(0, 50) + '...';
        
        const changeData = {
          name: `${change.company_name}: ${changeTitle}`,
          label: `Score: ${Math.round(change.interest_level)}/10`,
          kind: 1,
          acType: 0,
          foregroundColor: '#ffffff',
          backgroundColor: group.color
        };
        
        const changeId = await this.createThought(changeData);
        await this.createLink(groupId, changeId, 1);
        this.errorTracker.addCreateSuccess();
        
        // Add detailed note
        const note = `# ${changeTitle}\n\n**Company**: ${change.company_name}\n**Interest Level**: ${Math.round(change.interest_level)}/10\n**Detected**: ${change.detected_at}\n\n## Summary\n${changeSummary}\n\n## Change Type\n${change.change_type || 'Unknown'}\n\n## Database Info\n- Source: PostgreSQL\n- Schema: intelligence.changes\n- Change ID: ${change.id}\n\n[View Company Page](${change.company_url})`;
        
        await this.updateNote(changeId, note);
      }
    }
  }

  async createInsights(insightsId) {
    console.log('Creating AI insights from PostgreSQL...');
    
    // Get system statistics from PostgreSQL
    const stats = {
      totalCompanies: 0,
      totalChanges: 0,
      highPriorityChanges: 0
    };
    
    try {
      const companyCount = await db.one('SELECT COUNT(*) as count FROM intelligence.companies');
      stats.totalCompanies = parseInt(companyCount.count);
    } catch (error) {
      console.log('   Could not get company count:', error.message);
    }
    
    // Check if changes table exists before querying
    try {
      const changesCount = await db.one('SELECT COUNT(*) as count FROM intelligence.changes');
      stats.totalChanges = parseInt(changesCount.count);
      
      const highPriorityCount = await db.one('SELECT COUNT(*) as count FROM intelligence.changes WHERE interest_level >= 8');
      stats.highPriorityChanges = parseInt(highPriorityCount.count);
    } catch (error) {
      console.log('   Could not get changes count (table may not exist):', error.message);
    }
    
    // Create insights
    const insightData = {
      name: `📊 PostgreSQL Stats (${new Date().toLocaleDateString()})`,
      kind: 1,
      acType: 0,
      foregroundColor: '#ffffff',
      backgroundColor: '#059669'
    };
    
    const insightId = await this.createThought(insightData);
    await this.createLink(insightsId, insightId, 1);
    this.errorTracker.addCreateSuccess();
    
    const insightNote = `# AI Competitive Monitor - PostgreSQL Statistics\n\n## Overview\n- **Total Companies Monitored**: ${stats.totalCompanies}\n- **Total Changes Detected**: ${stats.totalChanges}\n- **High Priority Changes**: ${stats.highPriorityChanges}\n\n## System Health\n- **Last Sync**: ${new Date().toISOString()}\n- **Database Status**: ✅ PostgreSQL Operational\n- **API Status**: ✅ Connected\n\n## PostgreSQL Architecture\n- Three-schema system for efficient processing\n- ACID compliance and advanced querying\n- AI-powered change detection and analysis\n- Real-time monitoring of competitor activities\n\n## Schema Information\n- **raw_content**: HTML storage and change tracking\n- **processed_content**: Markdown and structured data\n- **intelligence**: AI analysis and insights`;
    
    await this.updateNote(insightId, insightNote);
  }

  // Helper methods
  getCompanyColor(importance) {
    switch (importance) {
      case 'CRITICAL': return '#dc2626'; // Red
      case 'HIGH': return '#d97706'; // Orange
      case 'MEDIUM': return '#eab308'; // Yellow
      default: return '#22c55e'; // Green
    }
  }

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

  // Helper methods for tracking mappings in PostgreSQL
  async storeMapping(entityType, entityId, thoughtId) {
    try {
      // Check if thebrain_mappings table exists
      const hasTable = await db.oneOrNone(`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = 'intelligence' AND table_name = 'thebrain_mappings'
      `);
      
      if (hasTable && hasTable.count > 0) {
        await db.none(`
          INSERT INTO intelligence.thebrain_mappings (entity_type, entity_id, thought_id, updated_at)
          VALUES ($1, $2, $3, NOW())
          ON CONFLICT (entity_type, entity_id) DO UPDATE SET
            thought_id = EXCLUDED.thought_id,
            updated_at = NOW()
        `, [entityType, entityId.toString(), thoughtId]);
      }
    } catch (error) {
      console.log(`Note: Could not store mapping - table may not exist yet:`, error.message);
    }
  }

  async getMapping(entityType, entityId) {
    try {
      // Check if thebrain_mappings table exists
      const hasTable = await db.oneOrNone(`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = 'intelligence' AND table_name = 'thebrain_mappings'
      `);
      
      if (!hasTable || hasTable.count === '0') {
        return null;
      }
      
      const result = await db.oneOrNone(`
        SELECT thought_id FROM intelligence.thebrain_mappings 
        WHERE entity_type = $1 AND entity_id = $2
      `, [entityType, entityId.toString()]);
      
      return result?.thought_id;
    } catch (error) {
      return null;
    }
  }
}

// Export for use
module.exports = TheBrainAPISyncPostgreSQL;

// Run if called directly
if (require.main === module) {
  async function main() {
    const sync = new TheBrainAPISyncPostgreSQL();
    const success = await sync.syncToTheBrain();
    
    // Exit with proper code based on critical errors
    if (!success) {
      console.error('\n❌ Sync failed due to critical errors');
      process.exit(1);
    } else if (sync.errorTracker.notFoundCount > 0) {
      console.log('\n⚠️  Sync completed with warnings');
      console.log('   Some thoughts were recreated due to missing IDs');
      process.exit(0); // Success with warnings
    } else {
      console.log('\n✅ Sync completed successfully');
      process.exit(0);
    }
  }
  
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
