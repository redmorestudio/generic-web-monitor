const axios = require('axios');
const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

class TheBrainEnhancedSingleDBIntegration {
  constructor() {
    this.apiKey = process.env.THEBRAIN_API_KEY;
    this.brainId = process.env.THEBRAIN_BRAIN_ID || process.env.THEBRAIN_DEFAULT_BRAIN_ID;
    
    if (!this.apiKey) {
      throw new Error('THEBRAIN_API_KEY not found in environment variables');
    }
    
    if (!this.brainId) {
      throw new Error('THEBRAIN_BRAIN_ID not found in environment variables');
    }
    
    // Initialize single database
    const dataDir = path.join(__dirname, 'data');
    this.db = new Database(path.join(dataDir, 'monitor.db'));
    
    // Initialize direct API client
    this.api = axios.create({
      baseURL: 'https://api.thebrain.com/v1',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'X-Brain-Id': this.brainId
      }
    });
    
    // Relationship types
    this.relationships = {
      OWNS: 'owns',
      IMPLEMENTS: 'implements',
      INTEGRATES_WITH: 'integrates with',
      COMPETES_WITH: 'competes with',
      PARTNERS_WITH: 'partners with',
      USES: 'uses',
      PROVIDES: 'provides',
      OFFERS: 'offers',
      LEADS: 'leads',
      EMPLOYS: 'employs',
      PRICED_AT: 'priced at'
    };
    
    console.log('🧠 Enhanced TheBrain Single-DB Integration initialized');
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
    console.log('🚀 Starting Enhanced TheBrain visualization sync...');
    
    // 1. Create root and smart groups
    const rootId = await this.createRootAndSmartGroups();
    
    // 2. Create architecture view
    await this.createArchitectureView(rootId);
    
    // 3. Sync companies with smart categorization
    await this.syncCompaniesWithSmartGroups(rootId);
    
    // 4. Extract and sync entities with relationships
    await this.extractAndSyncEntities();
    
    // 5. Sync recent changes with intelligence
    await this.syncIntelligentChanges(rootId);
    
    // 6. Create competitive relationships
    await this.createCompetitiveRelationships();
    
    // 7. Export for manual import if API fails
    await this.exportToTheBrainFormat();
    
    console.log('✅ Enhanced TheBrain sync complete!');
  }

  async createRootAndSmartGroups() {
    console.log('Creating root thought and smart groups...');
    
    const rootThought = {
      name: 'AI Competitive Monitor',
      label: 'INTELLIGENCE HUB',
      kind: 2, // Type thought
      acType: 0, // Public
      foregroundColor: '#667eea',
      backgroundColor: '#1a1a2e'
    };
    
    const rootId = this.generateThoughtId(rootThought.name);
    await this.storeThought(rootId, rootThought, 'root');
    
    // Create smart groups based on company types
    const smartGroups = [
      // Company Type Groups
      { name: '🤖 LLM Providers', type: 'llm_provider', color: '#ff6b6b' },
      { name: '💻 AI Coding Tools', type: 'ai_coding', color: '#4ecdc4' },
      { name: '🎨 AI Image Generation', type: 'ai_image', color: '#f7b731' },
      { name: '🎬 AI Video Generation', type: 'ai_video', color: '#5f27cd' },
      { name: '🎤 AI Voice & Audio', type: 'ai_voice', color: '#00d2d3' },
      { name: '🔍 AI Search Engines', type: 'ai_search', color: '#ff9ff3' },
      { name: '🏢 Enterprise AI', type: 'enterprise_ai', color: '#48dbfb' },
      { name: '⚡ AI Infrastructure', type: 'ai_infrastructure', color: '#0abde3' },
      { name: '🖥️ AI Hardware', type: 'ai_hardware', color: '#ee5a24' },
      
      // Entity Groups
      { name: '📦 Products & Services', type: 'products', color: '#6c5ce7' },
      { name: '🔬 Technologies', type: 'technologies', color: '#a29bfe' },
      { name: '👥 Key People', type: 'people', color: '#fd79a8' },
      { name: '💰 Pricing & Plans', type: 'pricing', color: '#fdcb6e' },
      
      // Intelligence Groups
      { name: '🚨 High Priority Intelligence', type: 'high_priority', color: '#ff4444' },
      { name: '📈 Market Movements', type: 'market', color: '#ff8800' },
      { name: '🤝 Partnerships & Alliances', type: 'partnerships', color: '#00cc88' },
      { name: '🚀 Product Launches', type: 'launches', color: '#667eea' }
    ];
    
    // Create smart groups under root
    for (const group of smartGroups) {
      const groupId = this.generateThoughtId(group.name);
      await this.storeThought(groupId, {
        name: group.name,
        label: 'SMART GROUP',
        kind: 2, // Type
        foregroundColor: group.color,
        backgroundColor: '#0f0f1e'
      }, 'smart-group', rootId);
      
      // Store group mapping for later use
      await this.storeSmartGroupMapping(group.type, groupId);
    }
    
    return rootId;
  }

  async syncCompaniesWithSmartGroups(rootId) {
    console.log('Syncing companies to smart groups...');
    
    // Get companies with their data - using enhanced_analysis table instead
    const companies = this.db.prepare(`
      SELECT 
        c.*,
        COUNT(DISTINCT u.id) as url_count,
        COUNT(DISTINCT ea.id) as analysis_count
      FROM companies c
      LEFT JOIN urls u ON c.id = u.company_id
      LEFT JOIN enhanced_analysis ea ON c.id = ea.company_id
      WHERE c.enabled = 1
      GROUP BY c.id
      ORDER BY c.category, c.name
    `).all();
    
    const typeToGroupMap = {
      'llm_provider': '🤖 LLM Providers',
      'ai_coding': '💻 AI Coding Tools',
      'ai_image': '🎨 AI Image Generation',
      'ai_video': '🎬 AI Video Generation',
      'ai_voice': '🎤 AI Voice & Audio',
      'ai_search': '🔍 AI Search Engines',
      'enterprise_ai': '🏢 Enterprise AI',
      'ai_infrastructure': '⚡ AI Infrastructure',
      'ai_hardware': '🖥️ AI Hardware'
    };
    
    // Add companies to their smart groups
    for (const company of companies) {
      const companyType = company.category || 'enterprise_ai'; // Using category field
      const groupName = typeToGroupMap[companyType] || '🏢 Enterprise AI';
      const groupId = await this.getSmartGroupId(companyType);
      
      if (!groupId) continue;
      
      const companyId = this.generateThoughtId(`Company-${company.name}`);
      
      await this.storeThought(companyId, {
        name: company.name,
        label: `${company.url_count} URLs | ${company.analysis_count} analyses`,
        kind: 1,
        foregroundColor: this.getColorForType(companyType),
        backgroundColor: '#111827'
      }, 'company', groupId);
      
      // Store mapping for later use
      this.db.prepare(`
        UPDATE companies SET thebrain_thought_id = ? WHERE id = ?
      `).run(companyId, company.id);
    }
    
    console.log(`✅ Synced ${companies.length} companies to smart groups`);
  }

  async extractAndSyncEntities() {
    console.log('Extracting and syncing entities with relationships...');
    
    // Get enhanced analyses with entities
    const analyses = this.db.prepare(`
      SELECT 
        ea.*,
        c.name as company_name,
        c.thebrain_thought_id as company_thought_id
      FROM enhanced_analysis ea
      JOIN companies c ON ea.company_id = c.id
      WHERE ea.entities IS NOT NULL
      LIMIT 100
    `).all();
    
    const productsGroupId = await this.getSmartGroupId('products');
    const techGroupId = await this.getSmartGroupId('technologies');
    const peopleGroupId = await this.getSmartGroupId('people');
    const pricingGroupId = await this.getSmartGroupId('pricing');
    
    for (const analysis of analyses) {
      try {
        const entities = JSON.parse(analysis.entities);
        const companyThoughtId = analysis.company_thought_id;
        
        if (!companyThoughtId) continue;
        
        // Process Products
        if (entities.products?.length > 0) {
          for (const product of entities.products.slice(0, 5)) {
            const productName = typeof product === 'string' ? product : product.name;
            if (!productName) continue;
            
            const productId = this.generateThoughtId(`Product-${productName}`);
            await this.storeThought(productId, {
              name: productName,
              label: 'PRODUCT',
              kind: 1,
              foregroundColor: '#22c55e',
              backgroundColor: '#111827'
            }, 'product', productsGroupId);
            
            // Company OFFERS Product
            await this.storeLink(
              companyThoughtId, 
              productId, 
              'jump',
              this.relationships.OFFERS
            );
          }
        }
        
        // Process Technologies
        if (entities.technologies?.length > 0) {
          for (const tech of entities.technologies.slice(0, 5)) {
            const techName = typeof tech === 'string' ? tech : tech.name;
            if (!techName) continue;
            
            const techId = this.generateThoughtId(`Tech-${techName}`);
            await this.storeThought(techId, {
              name: techName,
              label: 'TECHNOLOGY',
              kind: 1,
              foregroundColor: '#8b5cf6',
              backgroundColor: '#111827'
            }, 'technology', techGroupId);
            
            // Company IMPLEMENTS Technology
            await this.storeLink(
              companyThoughtId,
              techId,
              'jump',
              this.relationships.IMPLEMENTS
            );
          }
        }
        
        // Process People
        if (entities.people?.length > 0) {
          for (const person of entities.people.slice(0, 3)) {
            const personName = typeof person === 'string' ? person : person.name;
            const role = typeof person === 'object' ? person.title || person.role : '';
            if (!personName) continue;
            
            const personId = this.generateThoughtId(`Person-${personName}`);
            await this.storeThought(personId, {
              name: personName,
              label: role || 'PERSON',
              kind: 1,
              foregroundColor: '#f59e0b',
              backgroundColor: '#111827'
            }, 'person', peopleGroupId);
            
            // Determine relationship based on role
            const isLeader = role?.toLowerCase().includes('ceo') || 
                           role?.toLowerCase().includes('founder') ||
                           role?.toLowerCase().includes('president');
            
            if (isLeader) {
              // Person LEADS Company
              await this.storeLink(
                personId,
                companyThoughtId,
                'jump',
                this.relationships.LEADS
              );
            } else {
              // Company EMPLOYS Person
              await this.storeLink(
                companyThoughtId,
                personId,
                'jump',
                this.relationships.EMPLOYS
              );
            }
          }
        }
        
        // Process Pricing
        if (entities.pricing?.length > 0) {
          for (const pricing of entities.pricing.slice(0, 3)) {
            const priceName = typeof pricing === 'string' ? pricing : 
                            `${pricing.tier || 'Plan'} - ${pricing.price || pricing}`;
            
            const priceId = this.generateThoughtId(`Pricing-${analysis.company_name}-${priceName}`);
            await this.storeThought(priceId, {
              name: priceName,
              label: 'PRICING',
              kind: 1,
              foregroundColor: '#ef4444',
              backgroundColor: '#111827'
            }, 'pricing', pricingGroupId);
            
            // Company PRICED_AT Pricing
            await this.storeLink(
              companyThoughtId,
              priceId,
              'jump',
              this.relationships.PRICED_AT
            );
          }
        }
        
      } catch (e) {
        console.error(`Error processing entities for ${analysis.company_name}:`, e.message);
      }
    }
    
    console.log('✅ Extracted and synced entities with relationships');
  }

  async syncIntelligentChanges(rootId) {
    console.log('Syncing high-value changes with intelligence...');
    
    const changes = this.db.prepare(`
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
        aa.raw_response
      FROM changes c
      JOIN urls u ON c.url_id = u.id
      JOIN companies comp ON u.company_id = comp.id
      LEFT JOIN ai_analysis aa ON c.id = aa.change_id
      WHERE aa.relevance_score >= 6
      AND c.created_at > datetime('now', '-30 days')
      ORDER BY aa.relevance_score DESC, c.created_at DESC
      LIMIT 30
    `).all();
    
    const categoryToGroupMap = {
      'Product Launch': 'launches',
      'Partnership': 'partnerships',
      'Pricing Change': 'market',
      'Feature Update': 'launches',
      'Strategic Move': 'market'
    };
    
    for (const change of changes) {
      const category = change.category || 'Change';
      const groupType = categoryToGroupMap[category] || 'high_priority';
      const groupId = await this.getSmartGroupId(groupType);
      
      if (!groupId) continue;
      
      const changeDate = new Date(change.created_at).toLocaleDateString();
      const changeName = `${change.company_name}: ${category} (${changeDate})`;
      const changeId = this.generateThoughtId(`Change-${change.id}`);
      
      await this.storeThought(changeId, {
        name: changeName,
        label: `Score: ${change.relevance_score}/10`,
        kind: 3, // Event
        foregroundColor: this.getColorForRelevance(change.relevance_score),
        backgroundColor: '#111827'
      }, 'change', groupId);
      
      // Link to company if exists
      if (change.company_thought_id) {
        await this.storeLink(
          change.company_thought_id,
          changeId,
          'jump',
          'announced'
        );
      }
      
      // Extract and link entities from the change
      try {
        if (change.raw_response) {
          const analysis = JSON.parse(change.raw_response);
          if (analysis.entities?.products?.length > 0) {
            for (const product of analysis.entities.products) {
              const productId = this.generateThoughtId(`Product-${product}`);
              // Check if product thought exists
              const productExists = this.checkThoughtExists(productId);
              if (productExists) {
                await this.storeLink(changeId, productId, 'jump', 'involves');
              }
            }
          }
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }
    
    console.log(`✅ Synced ${changes.length} high-value changes`);
  }

  async createCompetitiveRelationships() {
    console.log('Creating competitive relationships...');
    
    // Get companies grouped by type
    const competitorGroups = this.db.prepare(`
      SELECT 
        c1.name as company1,
        c1.thebrain_thought_id as thought1,
        c2.name as company2,
        c2.thebrain_thought_id as thought2,
        c1.category as type
      FROM companies c1
      JOIN companies c2 ON c1.category = c2.category AND c1.id < c2.id
      WHERE c1.enabled = 1 AND c2.enabled = 1
      AND c1.thebrain_thought_id IS NOT NULL 
      AND c2.thebrain_thought_id IS NOT NULL
      LIMIT 50
    `).all();
    
    for (const rel of competitorGroups) {
      await this.storeLink(
        rel.thought1,
        rel.thought2,
        'jump',
        this.relationships.COMPETES_WITH
      );
    }
    
    console.log(`✅ Created ${competitorGroups.length} competitive relationships`);
  }

  async createArchitectureView(rootId) {
    console.log('Creating architecture visualization...');
    
    const archId = this.generateThoughtId('System Architecture');
    const archThought = await this.getThoughtById(archId);
    
    if (!archThought) {
      await this.storeThought(archId, {
        name: 'System Architecture',
        label: '🏗️',
        kind: 2,
        foregroundColor: '#3b82f6',
        backgroundColor: '#0f0f1e'
      }, 'architecture', rootId);
    }
    
    // Current database architecture
    const databases = [
      {
        name: 'Monitor DB',
        desc: 'All-in-one database',
        color: '#22c55e',
        tables: ['companies', 'urls', 'content_snapshots', 'changes', 'enhanced_analysis', 'ai_analysis']
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
    }
    
    // Workflow thoughts
    const workflows = [
      { name: 'Scrape → Analyze → Sync → Deploy', desc: 'Data pipeline', color: '#8b5cf6' }
    ];
    
    const workflowsId = this.generateThoughtId('GitHub Workflows');
    await this.storeThought(workflowsId, {
      name: 'GitHub Workflows',
      label: 'WORKFLOWS',
      kind: 2,
      foregroundColor: '#8b5cf6',
      backgroundColor: '#1a1a2e'
    }, 'workflows', archId);
  }

  async exportToTheBrainFormat() {
    console.log('Exporting data in TheBrain-compatible format...');
    
    const exportData = {
      brain: {
        id: this.brainId,
        name: 'AI Competitive Monitor - Enhanced',
        exportDate: new Date().toISOString(),
        version: '3.0'
      },
      thoughts: [],
      links: [],
      notes: {},
      statistics: {
        smartGroups: 0,
        companies: 0,
        entities: 0,
        relationships: 0
      }
    };
    
    // Get all stored thoughts
    const thoughts = this.db.prepare(`
      SELECT * FROM thebrain_export_data ORDER BY created_at
    `).all();
    
    for (const record of thoughts) {
      const data = JSON.parse(record.data);
      
      // Add thought
      exportData.thoughts.push({
        id: record.thought_id,
        ...data.thought
      });
      
      // Count types
      if (data.type === 'smart-group') exportData.statistics.smartGroups++;
      else if (data.type === 'company') exportData.statistics.companies++;
      else if (['product', 'technology', 'person', 'pricing'].includes(data.type)) {
        exportData.statistics.entities++;
      }
      
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
    const links = this.db.prepare(`
      SELECT * FROM thebrain_export_links
    `).all();
    
    for (const link of links) {
      exportData.links.push({
        thoughtIdA: link.thought_id_a,
        thoughtIdB: link.thought_id_b,
        relation: link.relation_type,
        name: link.link_name || ''
      });
      
      if (link.link_name && Object.values(this.relationships).includes(link.link_name)) {
        exportData.statistics.relationships++;
      }
    }
    
    // Save export
    const exportPath = path.join(__dirname, 'data', 'thebrain-export-enhanced.json');
    require('fs').writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
    
    console.log(`\n✅ Enhanced Export Complete!`);
    console.log(`   Total Thoughts: ${exportData.thoughts.length}`);
    console.log(`   Smart Groups: ${exportData.statistics.smartGroups}`);
    console.log(`   Companies: ${exportData.statistics.companies}`);
    console.log(`   Entities: ${exportData.statistics.entities}`);
    console.log(`   Relationships: ${exportData.statistics.relationships}`);
    console.log(`   Total Links: ${exportData.links.length}`);
    console.log(`   Export saved to: ${exportPath}`);
    
    return exportData;
  }

  // Helper methods
  async storeThought(thoughtId, thoughtData, type, parentId = null) {
    // Create tables if not exist
    this.db.exec(`
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
      
      CREATE TABLE IF NOT EXISTS smart_group_mappings (
        group_type TEXT PRIMARY KEY,
        thought_id TEXT
      );
    `);
    
    const data = {
      thought: thoughtData,
      type: type,
      parentId: parentId
    };
    
    this.db.prepare(`
      INSERT OR REPLACE INTO thebrain_export_data (thought_id, data, type)
      VALUES (?, ?, ?)
    `).run(thoughtId, JSON.stringify(data), type);
  }
  
  async storeLink(thoughtA, thoughtB, relationType, linkName = '') {
    const relationMap = {
      'child': 1,
      'parent': 2,
      'jump': 3,
      'sibling': 4
    };
    
    const relation = relationMap[relationType] || 3;
    
    this.db.prepare(`
      INSERT OR IGNORE INTO thebrain_export_links 
      (thought_id_a, thought_id_b, relation_type, link_name)
      VALUES (?, ?, ?, ?)
    `).run(thoughtA, thoughtB, relation, linkName);
  }

  async storeSmartGroupMapping(groupType, thoughtId) {
    this.db.prepare(`
      INSERT OR REPLACE INTO smart_group_mappings (group_type, thought_id)
      VALUES (?, ?)
    `).run(groupType, thoughtId);
  }

  async getSmartGroupId(groupType) {
    const result = this.db.prepare(`
      SELECT thought_id FROM smart_group_mappings WHERE group_type = ?
    `).get(groupType);
    
    return result?.thought_id || null;
  }

  checkThoughtExists(thoughtId) {
    const result = this.db.prepare(`
      SELECT thought_id FROM thebrain_export_data WHERE thought_id = ?
    `).get(thoughtId);
    
    return !!result;
  }

  async getThoughtById(thoughtId) {
    const result = this.db.prepare(`
      SELECT data FROM thebrain_export_data WHERE thought_id = ?
    `).get(thoughtId);
    
    return result ? JSON.parse(result.data) : null;
  }

  generateThoughtId(name) {
    const crypto = require('crypto');
    return crypto.createHash('md5').update(name).digest('hex');
  }

  getColorForType(type) {
    const colors = {
      'llm_provider': '#ff6b6b',
      'ai_coding': '#4ecdc4',
      'ai_image': '#f7b731',
      'ai_video': '#5f27cd',
      'ai_voice': '#00d2d3',
      'ai_search': '#ff9ff3',
      'enterprise_ai': '#48dbfb',
      'ai_infrastructure': '#0abde3',
      'ai_hardware': '#ee5a24'
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

  async setupDatabase() {
    console.log('Setting up database columns for TheBrain integration...');
    
    try {
      // Add thebrain_thought_id to companies table
      this.db.exec(`
        ALTER TABLE companies ADD COLUMN thebrain_thought_id TEXT;
      `);
    } catch (e) {
      // Column might already exist
    }
    
    console.log('✅ Database setup complete');
  }
}

// Export for use
module.exports = TheBrainEnhancedSingleDBIntegration;

// Run if called directly
if (require.main === module) {
  async function main() {
    const integration = new TheBrainEnhancedSingleDBIntegration();
    
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
