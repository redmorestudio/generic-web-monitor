const axios = require('axios');
const Database = require('better-sqlite3');
const path = require('path');
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
    
    // Initialize error tracker
    this.errorTracker = new TheBrainErrorTracker();
    
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
      this.errorTracker.addCriticalError('connection', error);
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
      
      // Generate and log the error report
      const report = this.errorTracker.getReport();
      
      console.log('\n📊 TheBrain API Sync Report:');
      console.log('================================');
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
      const reportPath = path.join(__dirname, 'thebrain-sync-report.json');
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      console.log(`\n📄 Detailed report saved to: ${reportPath}`);
      
      // Return success only if no critical errors
      return !this.errorTracker.hasErrors();
      
    } catch (error) {
      console.error('❌ Sync failed:', error.message);
      console.error(error);
      this.errorTracker.addCriticalError('sync', error);
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
      
      // CRITICAL: Link to brain's central thought
      console.log('Linking to brain\'s central thought...');
      try {
        await this.createLink(BRAIN_CENTRAL_THOUGHT_ID, thoughtId, 1); // Child link from brain central
        console.log('✅ Successfully linked to brain\'s central thought');
        this.errorTracker.addLinkSuccess();
      } catch (error) {
        console.error('⚠️  Failed to link to central thought:', error.message);
        this.errorTracker.addLinkFailure();
        // Try reverse link if forward link fails
        try {
          await this.createLink(thoughtId, BRAIN_CENTRAL_THOUGHT_ID, 2); // Parent link to brain central
          console.log('✅ Successfully created parent link to brain\'s central thought');
          this.errorTracker.addLinkSuccess();
        } catch (reverseError) {
          console.error('⚠️  Failed to create reverse link:', reverseError.message);
          this.errorTracker.addLinkFailure();
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
      const existingId = this.getMapping('category', key);
      
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
    console.log('Creating architecture visualization...');
    
    const databases = [
      { name: '💾 Raw Content DB', desc: 'HTML snapshots & change detection' },
      { name: '📝 Processed Content DB', desc: 'Markdown & structured text' },
      { name: '🧠 Intelligence DB', desc: 'AI analysis & insights' }
    ];
    
    for (const db of databases) {
      const existingDbId = this.getMapping('database', db.name);
      
      const dbData = {
        name: db.name,
        label: 'DATABASE',
        kind: 1,
        acType: 0,
        foregroundColor: '#ffffff',
        backgroundColor: '#1e40af'
      };
      
      let dbId;
      if (existingDbId) {
        dbId = existingDbId;
        try {
          await this.updateThought(dbId, dbData);
          this.errorTracker.addUpdateSuccess();
        } catch (error) {
          if (error.response?.status === 404) {
            this.errorTracker.addNotFound('database', dbId, db.name);
            dbId = await this.createThought(dbData);
            await this.createLink(archId, dbId, 1);
            await this.storeMapping('database', db.name, dbId);
            this.errorTracker.addCreateSuccess();
          } else {
            throw error;
          }
        }
      } else {
        dbId = await this.createThought(dbData);
        await this.createLink(archId, dbId, 1);
        await this.storeMapping('database', db.name, dbId);
        this.errorTracker.addCreateSuccess();
      }
      
      await this.updateNote(dbId, `# ${db.name}\n\n${db.desc}`);
    }
  }

  async syncCompanies(companiesId) {
    console.log('Syncing companies...');
    
    // Get company summary from intelligence db
    const companySummary = this.intelligenceDb.prepare(`
      SELECT company_category, COUNT(*) as count 
      FROM companies 
      GROUP BY company_category
    `).all();
    
    // Create category groups
    const categoryGroups = {};
    
    for (const cat of companySummary) {
      const key = cat.company_category || 'Other';
      const existingGroupId = this.getMapping('company-category', key);
      
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
    
    // Sync individual companies
    const companies = this.intelligenceDb.prepare(`
      SELECT 
        c.*,
        b.thought_id
      FROM companies c
      LEFT JOIN thebrain_mappings b ON b.entity_type = 'company' AND b.entity_id = c.id
      ORDER BY c.company_category, c.name
    `).all();
    
    let createdCount = 0;
    let updatedCount = 0;
    
    for (const company of companies) {
      const groupId = categoryGroups[company.company_category || 'Other'];
      
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
            this.intelligenceDb.prepare(`
              UPDATE thebrain_mappings 
              SET thought_id = ?, updated_at = CURRENT_TIMESTAMP 
              WHERE entity_type = 'company' AND entity_id = ?
            `).run(companyThoughtId, company.id);
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
        await this.storeMapping('company', company.id, companyThoughtId);
        createdCount++;
        this.errorTracker.addCreateSuccess();
      }
      
      // Add note with company details
      const note = `# ${company.name}

**Category**: ${company.company_category}
**Importance**: ${company.importance}
**URL**: ${company.url}

## Description
${company.description || 'No description available'}

## Monitoring Details
- Added: ${company.created_at}
- Last Updated: ${company.updated_at || 'Never'}`;
      
      await this.updateNote(companyThoughtId, note);
      
      // Add URL attachment
      if (company.url) {
        await this.addUrlAttachment(companyThoughtId, company.url, company.name);
      }
    }
    
    console.log(`   Created ${createdCount} new company thoughts`);
    console.log(`   Updated ${updatedCount} existing company thoughts`);
  }

  async syncChanges(changesId) {
    console.log('Syncing recent changes...');
    
    // Check if baseline_analysis table exists
    const hasTable = this.intelligenceDb.prepare(
      "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='baseline_analysis'"
    ).get().count > 0;
    
    if (!hasTable) {
      console.log('   No baseline_analysis table found, skipping changes');
      return;
    }
    
    // Get recent high-priority changes
    const recentChanges = this.intelligenceDb.prepare(`
      SELECT 
        ba.*,
        c.name as company_name,
        c.url as company_url
      FROM baseline_analysis ba
      JOIN companies c ON ba.company_id = c.id
      WHERE ba.relevance_score >= 7
      ORDER BY ba.created_at DESC
      LIMIT 20
    `).all();
    
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
      if (change.relevance_score >= 9) {
        priorityGroups.critical.changes.push(change);
      } else if (change.relevance_score >= 8) {
        priorityGroups.high.changes.push(change);
      } else {
        priorityGroups.medium.changes.push(change);
      }
    }
    
    // Create priority group thoughts
    for (const [key, group] of Object.entries(priorityGroups)) {
      if (group.changes.length === 0) continue;
      
      const existingGroupId = this.getMapping('change-priority', key);
      
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
        const changeData = {
          name: `${change.company_name}: ${change.title}`,
          label: `Score: ${change.relevance_score}/10`,
          kind: 1,
          acType: 0,
          foregroundColor: '#ffffff',
          backgroundColor: group.color
        };
        
        const changeId = await this.createThought(changeData);
        await this.createLink(groupId, changeId, 1);
        this.errorTracker.addCreateSuccess();
        
        // Add detailed note
        const note = `# ${change.title}

**Company**: ${change.company_name}
**Relevance Score**: ${change.relevance_score}/10
**Detected**: ${change.created_at}

## Summary
${change.summary}

## Key Points
${change.key_points}

## Analysis
${change.analysis}

[View on ${change.company_name}](${change.company_url})`;
        
        await this.updateNote(changeId, note);
      }
    }
  }

  async createInsights(insightsId) {
    console.log('Creating AI insights...');
    
    // Get system statistics
    const stats = {
      totalCompanies: this.intelligenceDb.prepare('SELECT COUNT(*) as count FROM companies').get().count,
      totalChanges: 0,
      highPriorityChanges: 0
    };
    
    // Check if baseline_analysis exists before querying
    const hasAnalysis = this.intelligenceDb.prepare(
      "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='baseline_analysis'"
    ).get().count > 0;
    
    if (hasAnalysis) {
      stats.totalChanges = this.intelligenceDb.prepare('SELECT COUNT(*) as count FROM baseline_analysis').get().count;
      stats.highPriorityChanges = this.intelligenceDb.prepare('SELECT COUNT(*) as count FROM baseline_analysis WHERE relevance_score >= 8').get().count;
    }
    
    // Create insights
    const insightData = {
      name: `📊 System Stats (${new Date().toLocaleDateString()})`,
      kind: 1,
      acType: 0,
      foregroundColor: '#ffffff',
      backgroundColor: '#059669'
    };
    
    const insightId = await this.createThought(insightData);
    await this.createLink(insightsId, insightId, 1);
    this.errorTracker.addCreateSuccess();
    
    const insightNote = `# AI Competitive Monitor - System Statistics

## Overview
- **Total Companies Monitored**: ${stats.totalCompanies}
- **Total Changes Detected**: ${stats.totalChanges}
- **High Priority Changes**: ${stats.highPriorityChanges}

## System Health
- **Last Sync**: ${new Date().toISOString()}
- **Database Status**: ✅ Operational
- **API Status**: ✅ Connected

## Architecture
- Three-database system for efficient processing
- AI-powered change detection and analysis
- Real-time monitoring of competitor activities`;
    
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
