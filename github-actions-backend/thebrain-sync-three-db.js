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
    
    // Initialize mapping table for deduplication
    this.ensureMappingTable();
    
    console.log('🧠 TheBrain Three-DB Integration initialized');
    console.log(`   Brain ID: ${this.brainId}`);
  }

  ensureMappingTable() {
    // Create a mapping table to track what's already been created
    this.intelligenceDb.exec(`
      CREATE TABLE IF NOT EXISTS thebrain_mapping (
        local_id TEXT,
        local_type TEXT,
        thought_id TEXT,
        thought_name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (local_id, local_type)
      )
    `);
  }

  getMapping(localId, localType) {
    return this.intelligenceDb.prepare(`
      SELECT thought_id FROM thebrain_mapping
      WHERE local_id = ? AND local_type = ?
    `).get(localId, localType);
  }

  saveMapping(localId, localType, thoughtId, thoughtName) {
    this.intelligenceDb.prepare(`
      INSERT OR REPLACE INTO thebrain_mapping (local_id, local_type, thought_id, thought_name)
      VALUES (?, ?, ?, ?)
    `).run(localId, localType, thoughtId, thoughtName);
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
    
    // 3. Sync companies with hierarchy (with proper category mapping)
    await this.syncCompaniesWithHierarchy(rootId);
    
    // 4. Sync URLs for each company
    await this.syncCompanyURLs();
    
    // 5. Sync recent changes
    await this.syncRecentChanges(rootId);
    
    // 6. Create insight thoughts
    await this.createInsightThoughts(rootId);
    
    // 7. Export for manual import if API fails
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
    
    // Check if root already exists
    const existingRoot = this.getMapping('root', 'system');
    if (existingRoot) {
      console.log('✅ Root thought already exists');
      return existingRoot.thought_id;
    }
    
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
    this.saveMapping('root', 'system', rootId, rootThought.name);
    
    // Create main categories
    const categories = [
      { name: 'Monitored Companies', color: '#ef4444', icon: '🏢' },
      { name: 'Recent Changes', color: '#f59e0b', icon: '🔄' },
      { name: 'System Architecture', color: '#3b82f6', icon: '🏗️' },
      { name: 'AI Insights', color: '#22c55e', icon: '🧠' },
      { name: 'Competitive Intelligence', color: '#dc2626', icon: '🎯' }
    ];
    
    for (const cat of categories) {
      const existing = this.getMapping(cat.name, 'category');
      if (!existing) {
        const catId = this.generateThoughtId(cat.name);
        await this.storeThought(catId, {
          name: cat.name,
          label: cat.icon,
          kind: 2, // Type
          foregroundColor: cat.color,
          backgroundColor: '#0f0f1e'
        }, 'category');
        
        // Create link from root to category
        await this.storeLink(rootId, catId, 'child', cat.name);
        this.saveMapping(cat.name, 'category', catId, cat.name);
      }
    }
    
    return rootId;
  }

  async createArchitectureView(rootId) {
    console.log('Creating architecture visualization...');
    
    const archId = this.getMapping('System Architecture', 'category')?.thought_id || 
                   this.generateThoughtId('System Architecture');
    
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
      const existing = this.getMapping(db.name, 'database');
      if (!existing) {
        const dbId = this.generateThoughtId(db.name);
        await this.storeThought(dbId, {
          name: db.name,
          label: 'DATABASE',
          kind: 1,
          foregroundColor: db.color,
          backgroundColor: '#1a1a2e'
        }, 'database');
        
        await this.storeLink(archId, dbId, 'child', db.desc);
        this.saveMapping(db.name, 'database', dbId, db.name);
        
        // Add table thoughts
        for (const table of db.tables) {
          const tableKey = `${db.name}-${table}`;
          const existingTable = this.getMapping(tableKey, 'table');
          if (!existingTable) {
            const tableId = this.generateThoughtId(tableKey);
            await this.storeThought(tableId, {
              name: table,
              label: 'TABLE',
              kind: 1,
              foregroundColor: '#6b7280',
              backgroundColor: '#111827'
            }, 'table');
            
            await this.storeLink(dbId, tableId, 'child', 'contains');
            this.saveMapping(tableKey, 'table', tableId, table);
          }
        }
      }
    }
  }

  async syncCompaniesWithHierarchy(rootId) {
    console.log('Syncing companies with hierarchy...');
    
    const companiesId = this.getMapping('Monitored Companies', 'category')?.thought_id || 
                        this.generateThoughtId('Monitored Companies');
    
    // Map actual database categories to display groups
    const categoryMapping = {
      'LLM Providers': { name: 'LLM Providers', color: '#8b5cf6', icon: '🤖' },
      'AI Coding': { name: 'AI Coding Tools', color: '#ec4899', icon: '💻' },
      'AI Infrastructure': { name: 'AI Infrastructure', color: '#f97316', icon: '🏗️' },
      'AI Hardware': { name: 'AI Hardware', color: '#dc2626', icon: '🖥️' },
      'AI Search': { name: 'AI Search', color: '#3b82f6', icon: '🔍' },
      'Video AI': { name: 'Video AI', color: '#10b981', icon: '🎬' },
      'Image Generation': { name: 'Image Generation', color: '#f59e0b', icon: '🎨' },
      'AI Voice/Audio': { name: 'AI Voice/Audio', color: '#14b8a6', icon: '🎤' },
      'Enterprise AI': { name: 'Enterprise AI', color: '#6366f1', icon: '🏢' },
      'AI Research': { name: 'AI Research', color: '#84cc16', icon: '🔬' },
      'competitor': { name: 'Competitors', color: '#ef4444', icon: '⚔️' },
      'partner': { name: 'Partners', color: '#22c55e', icon: '🤝' }
    };
    
    // Get companies with their data
    const companies = this.intelligenceDb.prepare(`
      SELECT 
        c.*,
        COUNT(DISTINCT u.id) as url_count
      FROM companies c
      LEFT JOIN urls u ON c.id = u.company_id
      GROUP BY c.id
      ORDER BY c.category, c.name
    `).all();
    
    console.log(`Found ${companies.length} companies to sync`);
    
    // Group companies by category
    const companiesByCategory = {};
    for (const company of companies) {
      const category = company.category || 'Other';
      if (!companiesByCategory[category]) {
        companiesByCategory[category] = [];
      }
      companiesByCategory[category].push(company);
    }
    
    // Create category groups and add companies
    for (const [category, categoryCompanies] of Object.entries(companiesByCategory)) {
      const categoryInfo = categoryMapping[category] || 
                          { name: category, color: '#667eea', icon: '📌' };
      
      const groupKey = `Companies-${categoryInfo.name}`;
      let groupId = this.getMapping(groupKey, 'company-type')?.thought_id;
      
      if (!groupId) {
        groupId = this.generateThoughtId(groupKey);
        await this.storeThought(groupId, {
          name: categoryInfo.name,
          label: categoryInfo.icon,
          kind: 2,
          foregroundColor: categoryInfo.color,
          backgroundColor: '#1a1a2e'
        }, 'company-type');
        
        await this.storeLink(companiesId, groupId, 'child', categoryInfo.name);
        this.saveMapping(groupKey, 'company-type', groupId, categoryInfo.name);
      }
      
      // Add companies to their category group
      for (const company of categoryCompanies) {
        const companyKey = `Company-${company.id}`;
        let companyId = this.getMapping(companyKey, 'company')?.thought_id;
        
        if (!companyId) {
          companyId = this.generateThoughtId(`Company-${company.name}`);
          
          // Create company thought with note content
          await this.storeThought(companyId, {
            name: company.name,
            label: `${company.url_count} URLs`,
            kind: 1,
            foregroundColor: categoryInfo.color,
            backgroundColor: '#111827'
          }, 'company');
          
          // Add note with company details
          const noteContent = `# ${company.name}\n\n` +
            `**Category**: ${company.category || 'N/A'}\n` +
            `**URLs Monitored**: ${company.url_count}\n` +
            (company.description ? `\n## Description\n${company.description}\n` : '');
          
          await this.storeNote(companyId, noteContent);
          
          await this.storeLink(groupId, companyId, 'child', 'member');
          this.saveMapping(companyKey, 'company', companyId, company.name);
          
          // Update company record with thought ID
          this.intelligenceDb.prepare(`
            UPDATE companies SET thebrain_thought_id = ? WHERE id = ?
          `).run(companyId, company.id);
        }
      }
    }
    
    console.log(`✅ Synced ${companies.length} companies across ${Object.keys(companiesByCategory).length} categories`);
  }

  async syncCompanyURLs() {
    console.log('Syncing company URLs...');
    
    // Get all URLs with company info
    const urls = this.intelligenceDb.prepare(`
      SELECT 
        u.*,
        c.name as company_name,
        c.thebrain_thought_id as company_thought_id
      FROM urls u
      JOIN companies c ON u.company_id = c.id
      WHERE c.thebrain_thought_id IS NOT NULL
      ORDER BY c.id, u.url_type
    `).all();
    
    console.log(`Found ${urls.length} URLs to sync`);
    
    let urlCount = 0;
    for (const url of urls) {
      const urlKey = `URL-${url.id}`;
      const existing = this.getMapping(urlKey, 'url');
      
      if (!existing && url.company_thought_id) {
        const urlId = this.generateThoughtId(`URL-${url.company_name}-${url.url}`);
        const urlTitle = url.title || url.url_type || 'Web Page';
        
        await this.storeThought(urlId, {
          name: urlTitle,
          label: url.url_type || 'URL',
          kind: 1,
          foregroundColor: '#3b82f6',
          backgroundColor: '#111827'
        }, 'url');
        
        // Add note with URL details
        const noteContent = `# ${urlTitle}\n\n` +
          `**URL**: ${url.url}\n` +
          `**Type**: ${url.url_type || 'N/A'}\n` +
          `**Company**: ${url.company_name}\n` +
          `**Last Checked**: ${url.last_scraped || 'Never'}\n`;
        
        await this.storeNote(urlId, noteContent);
        
        // Link URL to its company
        await this.storeLink(url.company_thought_id, urlId, 'child', 'monitors');
        this.saveMapping(urlKey, 'url', urlId, urlTitle);
        urlCount++;
      }
    }
    
    console.log(`✅ Created ${urlCount} new URL thoughts`);
  }

  async syncRecentChanges(rootId) {
    console.log('Syncing recent changes...');
    
    const changesId = this.getMapping('Recent Changes', 'category')?.thought_id || 
                      this.generateThoughtId('Recent Changes');
    
    try {
      // Get recent changes with analysis
      const changes = this.intelligenceDb.prepare(`
        SELECT 
          aa.id,
          aa.created_at,
          u.url,
          u.url_type,
          comp.name as company_name,
          comp.category as company_type,
          comp.thebrain_thought_id as company_thought_id,
          aa.relevance_score,
          aa.summary,
          aa.category as analysis_category,
          aa.competitive_threats
        FROM ai_analysis aa
        JOIN urls u ON aa.url_id = u.id
        JOIN companies comp ON u.company_id = comp.id
        WHERE aa.created_at > datetime('now', '-7 days')
        AND aa.relevance_score >= 6
        ORDER BY aa.relevance_score DESC, aa.created_at DESC
        LIMIT 50
      `).all();
      
      if (changes.length === 0) {
        console.log('No recent high-relevance changes found');
        return;
      }
      
      // Group changes by relevance
      const relevanceGroups = {
        high: { name: 'High Priority Changes', min: 8, color: '#dc2626', icon: '🔴' },
        medium: { name: 'Medium Priority Changes', min: 6, color: '#f59e0b', icon: '🟡' },
        low: { name: 'Low Priority Changes', min: 4, color: '#3b82f6', icon: '🔵' }
      };
      
      const groups = {};
      
      // Create relevance groups
      for (const [key, info] of Object.entries(relevanceGroups)) {
        const groupKey = `Changes-${info.name}`;
        let groupId = this.getMapping(groupKey, 'change-group')?.thought_id;
        
        if (!groupId) {
          groupId = this.generateThoughtId(groupKey);
          groups[key] = groupId;
          
          await this.storeThought(groupId, {
            name: info.name,
            label: info.icon,
            kind: 2,
            foregroundColor: info.color,
            backgroundColor: '#1a1a2e'
          }, 'change-group');
          
          await this.storeLink(changesId, groupId, 'child', info.name);
          this.saveMapping(groupKey, 'change-group', groupId, info.name);
        } else {
          groups[key] = groupId;
        }
      }
      
      // Add changes to groups
      for (const change of changes) {
        const changeKey = `Change-${change.id}`;
        const existing = this.getMapping(changeKey, 'change');
        
        if (!existing) {
          const score = change.relevance_score || 0;
          let groupKey = 'low';
          if (score >= 8) groupKey = 'high';
          else if (score >= 6) groupKey = 'medium';
          
          const changeDate = new Date(change.created_at).toLocaleDateString();
          const changeName = `${change.company_name} - ${change.url_type || 'Change'} (${changeDate})`;
          const changeId = this.generateThoughtId(`Change-${change.id}-${changeName}`);
          
          await this.storeThought(changeId, {
            name: changeName,
            label: `Score: ${score}/10`,
            kind: 3, // Event
            foregroundColor: this.getColorForRelevance(score),
            backgroundColor: '#111827'
          }, 'change');
          
          // Add detailed note
          let noteContent = `# ${changeName}\n\n` +
            `**Relevance Score**: ${score}/10\n` +
            `**Date**: ${changeDate}\n` +
            `**Company**: ${change.company_name}\n` +
            `**URL Type**: ${change.url_type || 'N/A'}\n`;
          
          if (change.summary) {
            noteContent += `\n## Summary\n${change.summary}\n`;
          }
          
          if (change.competitive_threats) {
            noteContent += `\n## Competitive Threats\n${change.competitive_threats}\n`;
          }
          
          await this.storeNote(changeId, noteContent);
          
          await this.storeLink(groups[groupKey], changeId, 'child', 'contains');
          
          // Link to company if exists
          if (change.company_thought_id) {
            await this.storeLink(change.company_thought_id, changeId, 'jump', 'detected');
          }
          
          this.saveMapping(changeKey, 'change', changeId, changeName);
        }
      }
      
      console.log(`✅ Synced ${changes.length} recent changes`);
    } catch (error) {
      console.log(`⚠️  Error syncing changes: ${error.message}`);
      console.log('   Continuing with other sync tasks...');
    }
  }

  async createInsightThoughts(rootId) {
    console.log('Creating AI insight thoughts...');
    
    const insightsId = this.getMapping('AI Insights', 'category')?.thought_id || 
                       this.generateThoughtId('AI Insights');
    
    // Create competitive intelligence section
    const compIntelId = this.getMapping('Competitive Intelligence', 'category')?.thought_id || 
                        this.generateThoughtId('Competitive Intelligence');
    
    // Top threats by company
    const topThreats = this.intelligenceDb.prepare(`
      SELECT 
        c.name,
        c.category,
        c.thebrain_thought_id,
        COUNT(DISTINCT aa.id) as threat_count,
        AVG(aa.relevance_score) as avg_score
      FROM companies c
      JOIN urls u ON c.id = u.company_id
      JOIN ai_analysis aa ON aa.company_id = c.id
      WHERE aa.relevance_score >= 7
      AND aa.created_at > datetime('now', '-30 days')
      GROUP BY c.id
      ORDER BY avg_score DESC, threat_count DESC
      LIMIT 10
    `).all();
    
    if (topThreats.length > 0) {
      const threatsKey = 'Top Competitive Threats';
      let threatsId = this.getMapping(threatsKey, 'threats')?.thought_id;
      
      if (!threatsId) {
        threatsId = this.generateThoughtId(threatsKey);
        await this.storeThought(threatsId, {
          name: 'Top Competitive Threats',
          label: '⚠️',
          kind: 2,
          foregroundColor: '#dc2626',
          backgroundColor: '#1a1a2e'
        }, 'threats');
        
        await this.storeLink(compIntelId, threatsId, 'child', 'analysis');
        this.saveMapping(threatsKey, 'threats', threatsId, threatsKey);
      }
      
      for (const threat of topThreats) {
        const threatKey = `Threat-${threat.name}`;
        const existing = this.getMapping(threatKey, 'threat');
        
        if (!existing) {
          const threatId = this.generateThoughtId(threatKey);
          await this.storeThought(threatId, {
            name: `${threat.name} - ${threat.threat_count} threats`,
            label: `Avg: ${threat.avg_score.toFixed(1)}/10`,
            kind: 1,
            foregroundColor: '#ef4444',
            backgroundColor: '#111827'
          }, 'threat');
          
          await this.storeLink(threatsId, threatId, 'child', 'identified');
          
          // Link to company
          if (threat.thebrain_thought_id) {
            await this.storeLink(threat.thebrain_thought_id, threatId, 'jump', 'poses');
          }
          
          this.saveMapping(threatKey, 'threat', threatId, threat.name);
        }
      }
    }
    
    console.log('✅ Created insight thoughts');
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
    console.log(`🧠 Using Brain ID: ${this.brainId}`);
    
    // Also create a visualization summary
    const summary = {
      brainId: this.brainId,
      timestamp: new Date().toISOString(),
      statistics: {
        totalThoughts: exportData.thoughts.length,
        totalLinks: exportData.links.length,
        thoughtTypes: this.countThoughtTypes(exportData),
        notesCount: Object.keys(exportData.notes).length
      },
      categories: this.getCategoryBreakdown()
    };
    
    const summaryPath = path.join(__dirname, 'data', 'thebrain-visualization-summary.json');
    require('fs').writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    
    return exportData;
  }

  countThoughtTypes(exportData) {
    const types = {};
    for (const thought of exportData.thoughts) {
      const kind = thought.kind || 1;
      const kindNames = {
        1: 'Normal',
        2: 'Type',
        3: 'Event',
        4: 'Tag',
        5: 'System'
      };
      const typeName = kindNames[kind] || 'Unknown';
      types[typeName] = (types[typeName] || 0) + 1;
    }
    return types;
  }

  getCategoryBreakdown() {
    const categories = this.intelligenceDb.prepare(`
      SELECT category, COUNT(*) as count 
      FROM companies 
      GROUP BY category 
      ORDER BY count DESC
    `).all();
    
    return categories;
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
  
  async storeNote(thoughtId, noteContent) {
    // Update the existing thought record with note content
    const existing = this.intelligenceDb.prepare(`
      SELECT data FROM thebrain_export_data WHERE thought_id = ?
    `).get(thoughtId);
    
    if (existing) {
      const data = JSON.parse(existing.data);
      data.note = noteContent;
      
      this.intelligenceDb.prepare(`
        UPDATE thebrain_export_data SET data = ? WHERE thought_id = ?
      `).run(JSON.stringify(data), thoughtId);
    }
  }
  
  async storeLink(thoughtA, thoughtB, relationType, linkName = '') {
    const relationMap = {
      'child': 1,
      'parent': 2,
      'jump': 3,
      'sibling': 4
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
      'LLM Providers': '#8b5cf6',
      'AI Coding': '#ec4899',
      'AI Infrastructure': '#f97316',
      'AI Hardware': '#dc2626',
      'AI Search': '#3b82f6',
      'Video AI': '#10b981',
      'Image Generation': '#f59e0b',
      'AI Voice/Audio': '#14b8a6',
      'Enterprise AI': '#6366f1',
      'AI Research': '#84cc16',
      'competitor': '#ef4444',
      'partner': '#22c55e'
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
}

// Export for use
module.exports = TheBrainThreeDBIntegration;

// Run if called directly
if (require.main === module) {
  async function main() {
    const integration = new TheBrainThreeDBIntegration();
    
    const initialized = await integration.initialize();
    if (!initialized) {
      console.error('Failed to initialize TheBrain integration');
      process.exit(1);
    }
    
    await integration.syncToTheBrain();
  }
  
  main().catch(console.error);
}
