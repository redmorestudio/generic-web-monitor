#!/usr/bin/env node

/**
 * Fix Disconnected TheBrain Thoughts
 * This script finds orphaned thoughts and connects them properly
 */

const axios = require('axios');
require('dotenv').config();

class TheBrainConnectionFixer {
  constructor() {
    this.apiKey = process.env.THEBRAIN_API_KEY;
    this.brainId = process.env.THEBRAIN_BRAIN_ID || process.env.THEBRAIN_DEFAULT_BRAIN_ID;
    
    if (!this.apiKey || !this.brainId) {
      throw new Error('THEBRAIN_API_KEY and THEBRAIN_BRAIN_ID required');
    }
    
    // Initialize API client
    this.api = axios.create({
      baseURL: 'https://api.thebrain.com/v1',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
    
    console.log('🔧 TheBrain Connection Fixer initialized');
  }

  async fixConnections() {
    console.log('🔍 Analyzing TheBrain structure...\n');
    
    try {
      // 1. Find or create root thought
      const rootId = await this.findOrCreateRoot();
      
      // 2. Find all orphaned thoughts
      const orphans = await this.findOrphanedThoughts();
      console.log(`Found ${orphans.length} potentially disconnected thoughts\n`);
      
      // 3. Organize thoughts by type
      const organized = this.organizeThoughts(orphans);
      
      // 4. Create main categories if needed
      const categories = await this.ensureCategories(rootId);
      
      // 5. Connect orphans to appropriate categories
      await this.connectOrphans(organized, categories, rootId);
      
      // 6. Create cross-connections
      await this.createCrossConnections(categories);
      
      console.log('\n✅ Connection fixing complete!');
      
    } catch (error) {
      console.error('❌ Failed to fix connections:', error.message);
      if (error.response?.data) {
        console.error('API Error:', error.response.data);
      }
    }
  }

  async findOrCreateRoot() {
    console.log('🏠 Finding root thought...');
    
    // Search for main root thought
    const searchResponse = await this.api.get(`/brains/${this.brainId}/thoughts/search`, {
      params: { queryText: 'AI Competitive Monitor', maxResults: 20 }
    });
    
    // Look for the main system thought
    let rootThought = searchResponse.data.thoughts?.find(t => 
      t.name === 'AI Competitive Monitor' && (t.kind === 2 || t.label === 'SYSTEM')
    );
    
    if (rootThought) {
      console.log('✅ Found root thought:', rootThought.name);
      return rootThought.id;
    }
    
    // Create root if not found
    console.log('📝 Creating root thought...');
    const createResponse = await this.api.post(`/brains/${this.brainId}/thoughts`, {
      name: 'AI Competitive Monitor',
      label: 'SYSTEM',
      kind: 2, // Type
      acType: 0, // Public
      foregroundColor: '#667eea',
      backgroundColor: '#1a1a2e'
    });
    
    return createResponse.data.id;
  }

  async findOrphanedThoughts() {
    console.log('🔍 Finding all thoughts...');
    
    const allThoughts = [];
    let pageToken = null;
    
    // Get all thoughts (paginated)
    do {
      const params = { maxResults: 100 };
      if (pageToken) params.pageToken = pageToken;
      
      const response = await this.api.get(`/brains/${this.brainId}/thoughts`, { params });
      
      if (response.data.thoughts) {
        allThoughts.push(...response.data.thoughts);
      }
      
      pageToken = response.data.nextPageToken;
    } while (pageToken);
    
    console.log(`Total thoughts found: ${allThoughts.length}`);
    
    // Find thoughts without parents (orphans)
    const orphans = [];
    
    for (const thought of allThoughts) {
      try {
        const graphResponse = await this.api.get(`/brains/${this.brainId}/thoughts/${thought.id}/graph`);
        const graph = graphResponse.data;
        
        // Check if thought has no parents and is not the root
        if ((!graph.parents || graph.parents.length === 0) && 
            thought.name !== 'AI Competitive Monitor') {
          orphans.push({
            ...thought,
            graph: graph
          });
        }
      } catch (error) {
        console.log(`Failed to get graph for ${thought.name}`);
      }
    }
    
    return orphans;
  }

  organizeThoughts(thoughts) {
    const organized = {
      categories: [],
      companies: [],
      changes: [],
      architecture: [],
      insights: [],
      other: []
    };
    
    for (const thought of thoughts) {
      // Categorize based on name patterns
      if (thought.name.includes('Companies') || thought.name.includes('Competitors') || 
          thought.name.includes('Partners') || thought.name.includes('Tools')) {
        organized.categories.push(thought);
      } else if (thought.name.includes('Changes') || thought.name.includes('Priority')) {
        organized.categories.push(thought);
      } else if (thought.name.includes('Architecture') || thought.name.includes('Workflow') || 
                 thought.name.includes('Database')) {
        organized.architecture.push(thought);
      } else if (thought.name.includes('Insights') || thought.name.includes('Threats') || 
                 thought.name.includes('Trends')) {
        organized.insights.push(thought);
      } else if (thought.kind === 1 && !thought.name.includes('DB')) {
        // Normal thoughts are likely companies or changes
        if (thought.label?.includes('URLs') || thought.label?.includes('analyses')) {
          organized.companies.push(thought);
        } else if (thought.label?.includes('Score')) {
          organized.changes.push(thought);
        } else {
          organized.other.push(thought);
        }
      } else {
        organized.other.push(thought);
      }
    }
    
    console.log('\nOrganized thoughts:');
    console.log(`- Categories: ${organized.categories.length}`);
    console.log(`- Companies: ${organized.companies.length}`);
    console.log(`- Changes: ${organized.changes.length}`);
    console.log(`- Architecture: ${organized.architecture.length}`);
    console.log(`- Insights: ${organized.insights.length}`);
    console.log(`- Other: ${organized.other.length}`);
    
    return organized;
  }

  async ensureCategories(rootId) {
    console.log('\n📁 Ensuring main categories exist...');
    
    const mainCategories = {
      companies: 'Monitored Companies',
      changes: 'Recent Changes',
      architecture: 'System Architecture',
      insights: 'AI Insights',
      threats: 'Threat Analysis'
    };
    
    const categoryIds = {};
    
    for (const [key, name] of Object.entries(mainCategories)) {
      // Search for existing category
      const searchResponse = await this.api.get(`/brains/${this.brainId}/thoughts/search`, {
        params: { queryText: name, maxResults: 10 }
      });
      
      let category = searchResponse.data.thoughts?.find(t => t.name === name);
      
      if (category) {
        categoryIds[key] = category.id;
        
        // Ensure it's connected to root
        await this.ensureConnection(rootId, category.id, 1, 'contains');
      } else {
        // Create category
        console.log(`Creating category: ${name}`);
        const response = await this.api.post(`/brains/${this.brainId}/thoughts`, {
          sourceThoughtId: rootId,
          relation: 1, // Child
          name: name,
          kind: 2, // Type
          foregroundColor: this.getCategoryColor(key),
          backgroundColor: '#0f0f1e'
        });
        categoryIds[key] = response.data.id;
      }
    }
    
    return categoryIds;
  }

  async connectOrphans(organized, categories, rootId) {
    console.log('\n🔗 Connecting orphaned thoughts...');
    
    // Connect category thoughts
    for (const catThought of organized.categories) {
      let parentId = rootId;
      
      // Determine which main category this belongs under
      if (catThought.name.includes('Competitor') || catThought.name.includes('Partner') || 
          catThought.name.includes('Tool')) {
        parentId = categories.companies;
      } else if (catThought.name.includes('Change') || catThought.name.includes('Priority')) {
        parentId = categories.changes;
      }
      
      await this.ensureConnection(parentId, catThought.id, 1, 'contains');
      console.log(`Connected ${catThought.name} to parent`);
    }
    
    // Connect companies
    for (const company of organized.companies) {
      // Find appropriate parent based on existing connections or default to main companies
      let parentId = categories.companies;
      
      // Try to find a more specific parent
      if (company.graph?.jumps?.length > 0) {
        // If it has jump connections, it might belong to a subcategory
        const jump = company.graph.jumps[0];
        if (jump.name.includes('Competitor') || jump.name.includes('Partner')) {
          // Find that subcategory
          const subcat = await this.findThoughtByName(jump.name);
          if (subcat) parentId = subcat.id;
        }
      }
      
      await this.ensureConnection(parentId, company.id, 1, 'includes');
      console.log(`Connected company: ${company.name}`);
    }
    
    // Connect changes
    for (const change of organized.changes) {
      await this.ensureConnection(categories.changes, change.id, 1, 'includes');
      console.log(`Connected change: ${change.name}`);
    }
    
    // Connect architecture thoughts
    for (const arch of organized.architecture) {
      await this.ensureConnection(categories.architecture, arch.id, 1, 'includes');
      console.log(`Connected architecture: ${arch.name}`);
    }
    
    // Connect insights
    for (const insight of organized.insights) {
      await this.ensureConnection(categories.insights, insight.id, 1, 'includes');
      console.log(`Connected insight: ${insight.name}`);
    }
    
    // Handle other thoughts
    for (const other of organized.other) {
      console.log(`Unclassified thought: ${other.name} (${other.kind})`);
      // You might want to connect these to a miscellaneous category
    }
  }

  async createCrossConnections(categories) {
    console.log('\n🌐 Creating cross-connections...');
    
    // Connect high-priority changes to threats
    if (categories.changes && categories.threats) {
      await this.ensureConnection(categories.changes, categories.threats, 3, 'analyzed by');
      console.log('Connected Recent Changes to Threat Analysis');
    }
    
    // Connect architecture to insights
    if (categories.architecture && categories.insights) {
      await this.ensureConnection(categories.architecture, categories.insights, 3, 'generates');
      console.log('Connected System Architecture to AI Insights');
    }
    
    // Connect companies to changes
    if (categories.companies && categories.changes) {
      await this.ensureConnection(categories.companies, categories.changes, 3, 'monitored for');
      console.log('Connected Monitored Companies to Recent Changes');
    }
  }

  async ensureConnection(thoughtA, thoughtB, relation, linkName = '') {
    try {
      // Check if connection already exists
      const graphResponse = await this.api.get(`/brains/${this.brainId}/thoughts/${thoughtA}/graph`);
      const graph = graphResponse.data;
      
      const hasConnection = 
        graph.children?.some(c => c.id === thoughtB) ||
        graph.parents?.some(p => p.id === thoughtB) ||
        graph.jumps?.some(j => j.id === thoughtB);
      
      if (!hasConnection) {
        await this.api.post(`/brains/${this.brainId}/links`, {
          thoughtIdA: thoughtA,
          thoughtIdB: thoughtB,
          relation: relation,
          name: linkName
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Failed to create connection: ${error.message}`);
      return false;
    }
  }

  async findThoughtByName(name) {
    try {
      const response = await this.api.get(`/brains/${this.brainId}/thoughts/search`, {
        params: { queryText: name, maxResults: 10 }
      });
      
      const thought = response.data.thoughts?.find(t => t.name === name);
      return thought || null;
    } catch (error) {
      return null;
    }
  }

  getCategoryColor(key) {
    const colors = {
      companies: '#ef4444',
      changes: '#f59e0b',
      architecture: '#3b82f6',
      insights: '#22c55e',
      threats: '#dc2626'
    };
    return colors[key] || '#667eea';
  }
}

// Run the fixer
if (require.main === module) {
  async function main() {
    const fixer = new TheBrainConnectionFixer();
    await fixer.fixConnections();
  }
  
  main().catch(console.error);
}
