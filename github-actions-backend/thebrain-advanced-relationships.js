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

class TheBrainAdvancedRelationships {
  constructor() {
    this.apiKey = process.env.THEBRAIN_API_KEY;
    this.brainId = process.env.THEBRAIN_BRAIN_ID;
    
    if (!this.apiKey || !this.brainId) {
      throw new Error('TheBrain API credentials not found');
    }
    
    // Initialize database
    const dbPath = path.join(__dirname, 'data', 'monitor.db');
    this.db = new Database(dbPath);
    
    // Track created thoughts to avoid duplicates
    this.thoughtCache = new Map();
    
    // Relationship types
    this.relationships = {
      OWNS: 'owns',
      IMPLEMENTS: 'implements',
      INTEGRATES_WITH: 'integrates with',
      COMPETES_WITH: 'competes with',
      PARTNERS_WITH: 'partners with',
      USES: 'uses',
      PROVIDES: 'provides',
      ANNOUNCED: 'announced',
      FEATURES: 'features',
      TARGETS: 'targets',
      PRICED_AT: 'priced at',
      EMPLOYS: 'employs',
      LEADS: 'leads',
      BASED_IN: 'based in',
      LAUNCHED: 'launched',
      UPDATED: 'updated',
      THREATENS: 'threatens',
      ENABLES: 'enables',
      DEPENDS_ON: 'depends on'
    };
  }

  async initialize() {
    await this.setupDatabase();
    console.log('🧠 Advanced TheBrain integration initialized');
    console.log(`   Creating rich entity web with labeled relationships`);
    return true;
  }

  async setupDatabase() {
    // Create entity tracking table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS entity_thoughts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entity_type TEXT,
        entity_name TEXT,
        thought_id TEXT UNIQUE,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create relationships table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS thought_relationships (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        from_thought_id TEXT,
        to_thought_id TEXT,
        relationship_type TEXT,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  // Generate consistent thought IDs
  generateThoughtId(type, name) {
    const crypto = require('crypto');
    return crypto.createHash('md5').update(`${type}:${name}`).digest('hex');
  }

  // Create or get a thought for any entity
  async createEntityThought(entityType, entityName, metadata = {}) {
    const thoughtId = this.generateThoughtId(entityType, entityName);
    
    // Check cache first
    if (this.thoughtCache.has(thoughtId)) {
      return thoughtId;
    }
    
    // Check database
    const existing = this.db.prepare(
      'SELECT thought_id FROM entity_thoughts WHERE thought_id = ?'
    ).get(thoughtId);
    
    if (existing) {
      this.thoughtCache.set(thoughtId, true);
      return thoughtId;
    }
    
    // Create new thought
    const color = this.getColorForEntityType(entityType);
    const icon = this.getIconForEntityType(entityType);
    
    const thoughtData = {
      name: entityName,
      label: entityType.toUpperCase(),
      kind: this.getKindForEntityType(entityType),
      acType: 0, // Public
      foregroundColor: color,
      backgroundColor: '#0f0f1e'
    };
    
    // Store in database
    this.db.prepare(`
      INSERT INTO entity_thoughts (entity_type, entity_name, thought_id, metadata)
      VALUES (?, ?, ?, ?)
    `).run(entityType, entityName, thoughtId, JSON.stringify(metadata));
    
    // Store thought data for export
    this.storeThoughtData(thoughtId, {
      thought: thoughtData,
      type: entityType,
      metadata
    });
    
    this.thoughtCache.set(thoughtId, true);
    console.log(`✅ Created ${entityType} thought: ${entityName}`);
    
    return thoughtId;
  }

  // Create a relationship between thoughts
  async createRelationship(fromThoughtId, toThoughtId, relationshipType, metadata = {}) {
    // Check if relationship already exists
    const existing = this.db.prepare(`
      SELECT id FROM thought_relationships 
      WHERE from_thought_id = ? AND to_thought_id = ? AND relationship_type = ?
    `).get(fromThoughtId, toThoughtId, relationshipType);
    
    if (existing) return;
    
    // Store relationship
    this.db.prepare(`
      INSERT INTO thought_relationships (from_thought_id, to_thought_id, relationship_type, metadata)
      VALUES (?, ?, ?, ?)
    `).run(fromThoughtId, toThoughtId, relationshipType, JSON.stringify(metadata));
    
    console.log(`🔗 Created relationship: ${relationshipType}`);
  }

  // Process a company and all its entities
  async processCompany(company) {
    console.log(`\n🏢 Processing ${company.name}...`);
    
    // Create company thought
    const companyThoughtId = await this.createEntityThought('company', company.name, {
      type: company.type,
      enabled: company.enabled,
      id: company.id
    });
    
    // Get all baseline analyses for this company
    const analyses = this.db.prepare(`
      SELECT ba.*, u.url, u.type as url_type
      FROM baseline_analysis ba
      JOIN urls u ON ba.url_id = u.id
      WHERE ba.company_id = ?
    `).all(company.id);
    
    for (const analysis of analyses) {
      await this.processBaselineAnalysis(analysis, companyThoughtId);
    }
    
    // Get all changes for this company
    const changes = this.db.prepare(`
      SELECT c.*, u.url, u.type as url_type, aa.*, ea.*
      FROM changes c
      JOIN urls u ON c.url_id = u.id
      LEFT JOIN ai_analysis aa ON c.id = aa.change_id
      LEFT JOIN enhanced_analysis ea ON c.id = ea.change_id
      WHERE u.company_id = ?
      ORDER BY c.created_at DESC
      LIMIT 50
    `).all(company.id);
    
    for (const change of changes) {
      await this.processChange(change, companyThoughtId);
    }
  }

  // Process baseline analysis and create entity thoughts
  async processBaselineAnalysis(analysis, companyThoughtId) {
    try {
      const entities = JSON.parse(analysis.entities);
      const currentState = JSON.parse(analysis.semantic_categories);
      const strategic = JSON.parse(analysis.competitive_data);
      
      // Process Products
      if (entities.products?.length > 0) {
        for (const product of entities.products) {
          const productThoughtId = await this.createEntityThought(
            'product', 
            product.name,
            { 
              description: product.description,
              status: product.status,
              features: product.features 
            }
          );
          
          // Company OWNS Product
          await this.createRelationship(
            companyThoughtId, 
            productThoughtId, 
            this.relationships.OWNS
          );
          
          // Product features
          if (product.features?.length > 0) {
            for (const feature of product.features) {
              const featureThoughtId = await this.createEntityThought(
                'feature',
                feature,
                { product: product.name }
              );
              
              await this.createRelationship(
                productThoughtId,
                featureThoughtId,
                this.relationships.FEATURES
              );
            }
          }
        }
      }
      
      // Process Technologies
      if (entities.technologies?.length > 0) {
        for (const tech of entities.technologies) {
          const techThoughtId = await this.createEntityThought(
            'technology',
            tech.name,
            {
              category: tech.category,
              purpose: tech.purpose
            }
          );
          
          // Company IMPLEMENTS Technology
          await this.createRelationship(
            companyThoughtId,
            techThoughtId,
            this.relationships.IMPLEMENTS
          );
        }
      }
      
      // Process Partnerships
      if (entities.partnerships?.length > 0) {
        for (const partnership of entities.partnerships) {
          const partnerThoughtId = await this.createEntityThought(
            'company',
            partnership.partner,
            { role: 'partner' }
          );
          
          // Company PARTNERS_WITH Partner
          await this.createRelationship(
            companyThoughtId,
            partnerThoughtId,
            this.relationships.PARTNERS_WITH,
            { type: partnership.type, description: partnership.description }
          );
        }
      }
      
      // Process Pricing
      if (entities.pricing?.length > 0) {
        for (const pricing of entities.pricing) {
          const pricingThoughtId = await this.createEntityThought(
            'pricing',
            `${pricing.tier} - ${pricing.price}`,
            pricing
          );
          
          // Company PRICED_AT Pricing
          await this.createRelationship(
            companyThoughtId,
            pricingThoughtId,
            this.relationships.PRICED_AT
          );
        }
      }
      
      // Process People
      if (entities.people?.length > 0) {
        for (const person of entities.people) {
          const personThoughtId = await this.createEntityThought(
            'person',
            person.name,
            {
              title: person.title,
              role: person.role
            }
          );
          
          // Company EMPLOYS Person or Person LEADS Company
          const relationship = person.role?.toLowerCase().includes('ceo') || 
                             person.role?.toLowerCase().includes('founder') ?
                             this.relationships.LEADS : this.relationships.EMPLOYS;
          
          await this.createRelationship(
            relationship === this.relationships.LEADS ? personThoughtId : companyThoughtId,
            relationship === this.relationships.LEADS ? companyThoughtId : personThoughtId,
            relationship
          );
        }
      }
      
      // Process Markets
      if (entities.markets?.length > 0) {
        for (const market of entities.markets) {
          const marketThoughtId = await this.createEntityThought(
            'market',
            `${market.segment} (${market.geography})`,
            market
          );
          
          // Company TARGETS Market
          await this.createRelationship(
            companyThoughtId,
            marketThoughtId,
            this.relationships.TARGETS
          );
        }
      }
      
      // Process Smart Groups as Capabilities
      if (currentState.core_capabilities?.length > 0) {
        for (const capability of currentState.core_capabilities) {
          const capabilityThoughtId = await this.createEntityThought(
            'capability',
            capability,
            { companies: [analysis.company_name] }
          );
          
          // Company PROVIDES Capability
          await this.createRelationship(
            companyThoughtId,
            capabilityThoughtId,
            this.relationships.PROVIDES
          );
        }
      }
      
      // Process Competitive Relationships
      if (strategic.threat_assessment?.areas?.length > 0) {
        for (const threatArea of strategic.threat_assessment.areas) {
          // Find other companies in this threat area
          const competitors = this.findCompetitorsInArea(threatArea, analysis.company_id);
          
          for (const competitor of competitors) {
            const competitorThoughtId = await this.createEntityThought(
              'company',
              competitor.name,
              { type: competitor.type }
            );
            
            // Company COMPETES_WITH Competitor
            await this.createRelationship(
              companyThoughtId,
              competitorThoughtId,
              this.relationships.COMPETES_WITH,
              { area: threatArea, level: strategic.threat_assessment.level }
            );
          }
        }
      }
      
    } catch (e) {
      console.error(`Error processing baseline analysis:`, e);
    }
  }

  // Process changes and create event thoughts
  async processChange(change, companyThoughtId) {
    try {
      // Create change event thought
      const changeDate = new Date(change.created_at).toLocaleDateString();
      const changeThoughtId = await this.createEntityThought(
        'event',
        `${change.company_name} - ${change.url_type} Change (${changeDate})`,
        {
          url: change.url,
          relevance_score: change.relevance_score,
          summary: change.summary,
          category: change.category
        }
      );
      
      // Company ANNOUNCED Change
      await this.createRelationship(
        companyThoughtId,
        changeThoughtId,
        this.relationships.ANNOUNCED
      );
      
      // Process enhanced analysis if available
      if (change.entities) {
        const entities = JSON.parse(change.entities);
        
        // Extract new products from changes
        if (entities.products?.length > 0) {
          for (const product of entities.products) {
            const productThoughtId = await this.createEntityThought(
              'product',
              product.name,
              product
            );
            
            // Change LAUNCHED Product
            await this.createRelationship(
              changeThoughtId,
              productThoughtId,
              this.relationships.LAUNCHED
            );
          }
        }
        
        // Extract new technologies
        if (entities.technologies?.length > 0) {
          for (const tech of entities.technologies) {
            const techThoughtId = await this.createEntityThought(
              'technology',
              tech.name,
              tech
            );
            
            // Change FEATURES Technology
            await this.createRelationship(
              changeThoughtId,
              techThoughtId,
              this.relationships.FEATURES
            );
          }
        }
      }
      
      // Process smart groups from changes
      if (change.smart_groups) {
        const smartGroups = JSON.parse(change.smart_groups);
        
        if (smartGroups.suggested_groups?.length > 0) {
          for (const group of smartGroups.suggested_groups) {
            const groupThoughtId = await this.createEntityThought(
              'capability',
              group,
              { type: 'smart_group' }
            );
            
            // Change ENABLES Capability
            await this.createRelationship(
              changeThoughtId,
              groupThoughtId,
              this.relationships.ENABLES
            );
          }
        }
      }
      
    } catch (e) {
      console.error(`Error processing change:`, e);
    }
  }

  // Create integration feature thoughts
  async createIntegrationWeb() {
    console.log('\n🕸️  Creating integration capability web...');
    
    // Find all integration-related entities
    const integrationCapabilities = this.db.prepare(`
      SELECT DISTINCT entity_name, thought_id 
      FROM entity_thoughts 
      WHERE entity_type = 'capability' 
      AND (entity_name LIKE '%integration%' OR entity_name LIKE '%connect%' OR entity_name LIKE '%api%')
    `).all();
    
    // Create master integration thought
    const integrationMasterThoughtId = await this.createEntityThought(
      'concept',
      'Integration Capabilities',
      { type: 'master_concept' }
    );
    
    // Connect all integration capabilities
    for (const capability of integrationCapabilities) {
      await this.createRelationship(
        integrationMasterThoughtId,
        capability.thought_id,
        this.relationships.ENABLES
      );
      
      // Find all companies implementing this capability
      const companies = this.db.prepare(`
        SELECT DISTINCT et.entity_name, et.thought_id
        FROM thought_relationships tr
        JOIN entity_thoughts et ON tr.from_thought_id = et.thought_id
        WHERE tr.to_thought_id = ? 
        AND tr.relationship_type IN (?, ?)
        AND et.entity_type = 'company'
      `).all(capability.thought_id, this.relationships.PROVIDES, this.relationships.IMPLEMENTS);
      
      console.log(`   Found ${companies.length} companies with ${capability.entity_name}`);
    }
  }

  // Create technology landscape view
  async createTechnologyLandscape() {
    console.log('\n🔬 Creating technology landscape...');
    
    // Group technologies by category
    const techCategories = this.db.prepare(`
      SELECT DISTINCT 
        json_extract(metadata, '$.category') as category,
        COUNT(*) as count
      FROM entity_thoughts
      WHERE entity_type = 'technology'
      AND json_extract(metadata, '$.category') IS NOT NULL
      GROUP BY category
    `).all();
    
    for (const category of techCategories) {
      if (!category.category) continue;
      
      const categoryThoughtId = await this.createEntityThought(
        'tech_category',
        `${category.category} Technologies`,
        { count: category.count }
      );
      
      // Connect all technologies in this category
      const techs = this.db.prepare(`
        SELECT thought_id, entity_name
        FROM entity_thoughts
        WHERE entity_type = 'technology'
        AND json_extract(metadata, '$.category') = ?
      `).all(category.category);
      
      for (const tech of techs) {
        await this.createRelationship(
          categoryThoughtId,
          tech.thought_id,
          this.relationships.ENABLES
        );
      }
    }
  }

  // Helper methods
  findCompetitorsInArea(area, excludeCompanyId) {
    return this.db.prepare(`
      SELECT DISTINCT c.* 
      FROM companies c
      JOIN baseline_analysis ba ON c.id = ba.company_id
      WHERE c.id != ?
      AND (
        json_extract(ba.competitive_data, '$.threat_assessment.areas') LIKE ?
        OR json_extract(ba.semantic_categories, '$.business_focus') LIKE ?
      )
      LIMIT 5
    `).all(excludeCompanyId, `%${area}%`, `%${area}%`);
  }

  getColorForEntityType(type) {
    const colors = {
      company: '#3b82f6',      // Blue
      product: '#22c55e',      // Green
      technology: '#8b5cf6',   // Purple
      feature: '#14b8a6',      // Teal
      person: '#f59e0b',       // Amber
      pricing: '#ef4444',      // Red
      market: '#ec4899',       // Pink
      capability: '#6366f1',   // Indigo
      event: '#f97316',        // Orange
      concept: '#06b6d4',      // Cyan
      tech_category: '#7c3aed' // Violet
    };
    return colors[type] || '#6b7280';
  }

  getKindForEntityType(type) {
    const kinds = {
      company: 1,      // Normal
      product: 1,      // Normal
      technology: 1,   // Normal
      feature: 1,      // Normal
      person: 1,       // Normal
      pricing: 1,      // Normal
      market: 1,       // Normal
      capability: 4,   // Tag
      event: 3,        // Event
      concept: 2,      // Type
      tech_category: 2 // Type
    };
    return kinds[type] || 1;
  }

  getIconForEntityType(type) {
    const icons = {
      company: '🏢',
      product: '📦',
      technology: '⚙️',
      feature: '✨',
      person: '👤',
      pricing: '💰',
      market: '🎯',
      capability: '🔧',
      event: '📅',
      concept: '💡',
      tech_category: '🔬'
    };
    return icons[type] || '📌';
  }

  storeThoughtData(thoughtId, data) {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS thebrain_export_data (
        thought_id TEXT PRIMARY KEY,
        data TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    this.db.prepare(`
      INSERT OR REPLACE INTO thebrain_export_data (thought_id, data)
      VALUES (?, ?)
    `).run(thoughtId, JSON.stringify(data));
  }

  // Export complete knowledge graph
  async exportKnowledgeGraph() {
    console.log('\n📊 Exporting knowledge graph...');
    
    const exportData = {
      brain: {
        id: this.brainId,
        name: 'AI Competitive Intelligence Web',
        exportDate: new Date().toISOString()
      },
      thoughts: [],
      links: [],
      statistics: {}
    };
    
    // Get all thoughts
    const thoughts = this.db.prepare(`
      SELECT et.*, ted.data
      FROM entity_thoughts et
      JOIN thebrain_export_data ted ON et.thought_id = ted.thought_id
    `).all();
    
    for (const thought of thoughts) {
      const data = JSON.parse(thought.data);
      exportData.thoughts.push({
        id: thought.thought_id,
        entityType: thought.entity_type,
        ...data.thought
      });
    }
    
    // Get all relationships
    const relationships = this.db.prepare(`
      SELECT tr.*, 
        et1.entity_name as from_name, et1.entity_type as from_type,
        et2.entity_name as to_name, et2.entity_type as to_type
      FROM thought_relationships tr
      JOIN entity_thoughts et1 ON tr.from_thought_id = et1.thought_id
      JOIN entity_thoughts et2 ON tr.to_thought_id = et2.thought_id
    `).all();
    
    for (const rel of relationships) {
      exportData.links.push({
        thoughtIdA: rel.from_thought_id,
        thoughtIdB: rel.to_thought_id,
        relation: 'jump',
        name: rel.relationship_type,
        metadata: {
          fromType: rel.from_type,
          toType: rel.to_type,
          fromName: rel.from_name,
          toName: rel.to_name
        }
      });
    }
    
    // Calculate statistics
    exportData.statistics = {
      totalThoughts: exportData.thoughts.length,
      totalLinks: exportData.links.length,
      thoughtsByType: this.db.prepare(`
        SELECT entity_type, COUNT(*) as count
        FROM entity_thoughts
        GROUP BY entity_type
      `).all(),
      relationshipsByType: this.db.prepare(`
        SELECT relationship_type, COUNT(*) as count
        FROM thought_relationships
        GROUP BY relationship_type
      `).all()
    };
    
    // Save export
    const exportPath = path.join(__dirname, 'data', 'thebrain-knowledge-graph.json');
    require('fs').writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
    
    console.log(`\n✅ Knowledge Graph Export Complete!`);
    console.log(`   Thoughts: ${exportData.statistics.totalThoughts}`);
    console.log(`   Relationships: ${exportData.statistics.totalLinks}`);
    console.log(`   File: ${exportPath}`);
    
    return exportData;
  }

  // Main sync process
  async syncAll() {
    console.log('🚀 Starting advanced TheBrain sync with entity relationships...\n');
    
    // Get all companies
    const companies = this.db.prepare(`
      SELECT * FROM companies WHERE enabled = 1
    `).all();
    
    let processedCount = 0;
    for (const company of companies) {
      await this.processCompany(company);
      processedCount++;
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Create cross-cutting views
    await this.createIntegrationWeb();
    await this.createTechnologyLandscape();
    
    // Export the complete graph
    const exportData = await this.exportKnowledgeGraph();
    
    console.log(`\n✅ Advanced sync complete!`);
    console.log(`   Companies processed: ${processedCount}`);
    console.log(`   Total entities created: ${exportData.statistics.totalThoughts}`);
    console.log(`   Total relationships: ${exportData.statistics.totalLinks}`);
  }
}

// Export for use
module.exports = TheBrainAdvancedRelationships;

// Run if called directly
if (require.main === module) {
  async function main() {
    const integration = new TheBrainAdvancedRelationships();
    await integration.initialize();
    await integration.syncAll();
  }
  
  main().catch(console.error);
}
