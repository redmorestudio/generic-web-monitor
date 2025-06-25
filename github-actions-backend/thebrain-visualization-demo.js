#!/usr/bin/env node

/**
 * TheBrain Visualization Demo
 * 
 * This script demonstrates how the AI Competitive Monitor data
 * will be visualized in TheBrain with the three-database architecture
 */

const path = require('path');
const fs = require('fs');

class TheBrainVisualizationDemo {
  constructor() {
    this.thoughts = [];
    this.links = [];
    this.thoughtMap = new Map();
  }

  generateDemo() {
    console.log('🧠 TheBrain Visualization Structure for AI Competitive Monitor\n');
    console.log('='.repeat(60));
    
    // Create root structure
    this.createRootStructure();
    
    // Add architecture visualization
    this.createArchitectureView();
    
    // Add company hierarchy
    this.createCompanyHierarchy();
    
    // Add recent changes
    this.createChangesView();
    
    // Add insights
    this.createInsightsView();
    
    // Display the structure
    this.displayVisualization();
    
    // Save as JSON
    this.saveVisualization();
  }

  createRootStructure() {
    const root = this.addThought('AI Competitive Monitor', 'SYSTEM', '#667eea', null, {
      description: 'Root node for the entire competitive monitoring system',
      icon: '🎯'
    });

    const categories = [
      { name: 'Monitored Companies', icon: '🏢', color: '#ef4444', desc: '52 AI companies being tracked' },
      { name: 'Recent Changes', icon: '🔄', color: '#f59e0b', desc: 'Latest detected changes' },
      { name: 'System Architecture', icon: '🏗️', color: '#3b82f6', desc: 'Three-database design' },
      { name: 'AI Insights', icon: '🧠', color: '#22c55e', desc: 'Analysis and patterns' },
      { name: 'Threat Analysis', icon: '⚠️', color: '#dc2626', desc: 'Competitive threats' }
    ];

    categories.forEach(cat => {
      this.addThought(cat.name, cat.icon, cat.color, root, {
        description: cat.desc,
        type: 'category'
      });
    });
  }

  createArchitectureView() {
    const archRoot = this.getThought('System Architecture');
    
    // Three databases
    const databases = [
      {
        name: 'Raw Content Database',
        color: '#dc2626',
        icon: '💾',
        tables: [
          { name: 'content_snapshots', desc: 'Stores scraped HTML' },
          { name: 'changes', desc: 'Tracks content changes' }
        ]
      },
      {
        name: 'Processed Content Database',
        color: '#f59e0b',
        icon: '📄',
        tables: [
          { name: 'processed_content', desc: 'Markdown conversions' },
          { name: 'markdown_content', desc: 'Structured text' }
        ]
      },
      {
        name: 'Intelligence Database',
        color: '#22c55e',
        icon: '🧩',
        tables: [
          { name: 'companies', desc: '52 monitored companies' },
          { name: 'urls', desc: '115 tracked URLs' },
          { name: 'baseline_analysis', desc: 'Current state AI analysis' },
          { name: 'ai_analysis', desc: 'Change-specific analysis' }
        ]
      }
    ];

    databases.forEach(db => {
      const dbThought = this.addThought(db.name, db.icon, db.color, archRoot, {
        type: 'database',
        description: db.desc
      });

      db.tables.forEach(table => {
        this.addThought(table.name, 'TABLE', '#6b7280', dbThought, {
          type: 'table',
          description: table.desc
        });
      });
    });

    // Workflows
    const workflowRoot = this.addThought('GitHub Workflows', '⚙️', '#8b5cf6', archRoot, {
      type: 'workflow-container'
    });

    const workflows = [
      { name: 'Scrape Workflow', desc: 'Runs every 6 hours', color: '#dc2626' },
      { name: 'Process Workflow', desc: 'Converts HTML to Markdown', color: '#f59e0b' },
      { name: 'Analyze Workflow', desc: 'AI analysis of content', color: '#22c55e' },
      { name: 'Sync Workflow', desc: 'Deploy & notifications', color: '#3b82f6' }
    ];

    workflows.forEach(wf => {
      this.addThought(wf.name, '🔄', wf.color, workflowRoot, {
        type: 'workflow',
        description: wf.desc
      });
    });
  }

  createCompanyHierarchy() {
    const compRoot = this.getThought('Monitored Companies');
    
    const companyTypes = {
      competitor: { name: 'Competitors', icon: '⚔️', color: '#ef4444', count: 18 },
      partner: { name: 'Partners', icon: '🤝', color: '#22c55e', count: 12 },
      tool: { name: 'AI Tools', icon: '🛠️', color: '#f59e0b', count: 15 },
      industry: { name: 'Industry Players', icon: '🏭', color: '#3b82f6', count: 7 }
    };

    Object.entries(companyTypes).forEach(([type, info]) => {
      const typeThought = this.addThought(info.name, info.icon, info.color, compRoot, {
        type: 'company-type',
        count: info.count
      });

      // Add sample companies
      const sampleCompanies = this.getSampleCompanies(type);
      sampleCompanies.forEach(company => {
        const compThought = this.addThought(company.name, type.toUpperCase(), info.color, typeThought, {
          type: 'company',
          urls: company.urls,
          lastChange: company.lastChange
        });

        // Add recent activity
        if (company.recentChange) {
          const changeThought = this.addThought(
            `${company.name} - Recent Change`,
            '📍',
            this.getRelevanceColor(company.recentChange.score),
            compThought,
            {
              type: 'change',
              score: company.recentChange.score,
              date: company.recentChange.date
            }
          );
        }
      });
    });
  }

  createChangesView() {
    const changesRoot = this.getThought('Recent Changes');
    
    const priorityGroups = [
      { name: 'High Priority (8-10)', icon: '🔴', color: '#dc2626', scoreRange: [8, 10] },
      { name: 'Medium Priority (6-7)', icon: '🟡', color: '#f59e0b', scoreRange: [6, 7] },
      { name: 'Low Priority (4-5)', icon: '🔵', color: '#3b82f6', scoreRange: [4, 5] },
      { name: 'Unanalyzed', icon: '⏳', color: '#6b7280', scoreRange: [0, 0] }
    ];

    priorityGroups.forEach(group => {
      const groupThought = this.addThought(group.name, group.icon, group.color, changesRoot, {
        type: 'priority-group',
        scoreRange: group.scoreRange
      });

      // Add sample changes
      const sampleChanges = this.getSampleChanges(group.scoreRange);
      sampleChanges.forEach(change => {
        this.addThought(
          change.title,
          `Score: ${change.score}`,
          group.color,
          groupThought,
          {
            type: 'change',
            ...change
          }
        );
      });
    });
  }

  createInsightsView() {
    const insightsRoot = this.getThought('AI Insights');
    
    // Top threats
    const threatsThought = this.addThought('Top Competitive Threats', '⚠️', '#dc2626', insightsRoot, {
      type: 'threat-analysis'
    });

    const topThreats = [
      { company: 'OpenAI', threatCount: 8, avgScore: 8.5 },
      { company: 'Anthropic', threatCount: 6, avgScore: 7.8 },
      { company: 'Google AI', threatCount: 5, avgScore: 7.2 }
    ];

    topThreats.forEach(threat => {
      this.addThought(
        `${threat.company} - ${threat.threatCount} threats`,
        `Avg: ${threat.avgScore}/10`,
        '#ef4444',
        threatsThought,
        {
          type: 'threat',
          ...threat
        }
      );
    });

    // Technology trends
    const trendsThought = this.addThought('Technology Trends', '📈', '#10b981', insightsRoot, {
      type: 'trends'
    });

    const techTrends = [
      { tech: 'Large Language Models', mentions: 45 },
      { tech: 'Computer Vision', mentions: 32 },
      { tech: 'Reinforcement Learning', mentions: 28 },
      { tech: 'Multimodal AI', mentions: 25 }
    ];

    techTrends.forEach(trend => {
      this.addThought(
        trend.tech,
        `${trend.mentions} mentions`,
        '#3b82f6',
        trendsThought,
        {
          type: 'technology',
          ...trend
        }
      );
    });

    // Strategic opportunities
    const oppsThought = this.addThought('Strategic Opportunities', '💡', '#22c55e', insightsRoot, {
      type: 'opportunities'
    });

    const opportunities = [
      'Partnership potential with Hugging Face',
      'Gap in enterprise AI solutions market',
      'Emerging market: AI for healthcare'
    ];

    opportunities.forEach(opp => {
      this.addThought(opp, 'OPPORTUNITY', '#10b981', oppsThought, {
        type: 'opportunity'
      });
    });
  }

  // Helper methods
  addThought(name, label, color, parent = null, metadata = {}) {
    const id = this.generateId(name);
    const thought = {
      id,
      name,
      label,
      color,
      parent: parent ? parent.id : null,
      metadata,
      children: []
    };

    this.thoughts.push(thought);
    this.thoughtMap.set(id, thought);

    if (parent) {
      parent.children.push(thought);
      this.links.push({
        from: parent.id,
        to: id,
        type: 'parent-child'
      });
    }

    return thought;
  }

  getThought(name) {
    const id = this.generateId(name);
    return this.thoughtMap.get(id);
  }

  generateId(name) {
    return name.toLowerCase().replace(/\s+/g, '-');
  }

  getRelevanceColor(score) {
    if (score >= 8) return '#dc2626';
    if (score >= 6) return '#f59e0b';
    if (score >= 4) return '#3b82f6';
    return '#6b7280';
  }

  getSampleCompanies(type) {
    const companies = {
      competitor: [
        { name: 'OpenAI', urls: 3, recentChange: { score: 9, date: '2025-06-24' } },
        { name: 'Anthropic', urls: 2, recentChange: { score: 8, date: '2025-06-23' } },
        { name: 'Google AI', urls: 4, recentChange: { score: 7, date: '2025-06-25' } }
      ],
      partner: [
        { name: 'Hugging Face', urls: 2, recentChange: { score: 6, date: '2025-06-24' } },
        { name: 'Weights & Biases', urls: 1, recentChange: null }
      ],
      tool: [
        { name: 'LangChain', urls: 2, recentChange: { score: 5, date: '2025-06-22' } },
        { name: 'Pinecone', urls: 1, recentChange: { score: 7, date: '2025-06-23' } }
      ],
      industry: [
        { name: 'NVIDIA', urls: 2, recentChange: { score: 8, date: '2025-06-24' } }
      ]
    };

    return companies[type] || [];
  }

  getSampleChanges(scoreRange) {
    const allChanges = [
      { title: 'OpenAI Announces GPT-5', score: 9, date: '2025-06-24', company: 'OpenAI' },
      { title: 'Anthropic Updates Claude Pricing', score: 8, date: '2025-06-23', company: 'Anthropic' },
      { title: 'Google AI New Research Paper', score: 7, date: '2025-06-25', company: 'Google AI' },
      { title: 'Hugging Face Model Release', score: 6, date: '2025-06-24', company: 'Hugging Face' },
      { title: 'LangChain Documentation Update', score: 5, date: '2025-06-22', company: 'LangChain' },
      { title: 'Pinecone Infrastructure Change', score: 4, date: '2025-06-23', company: 'Pinecone' },
      { title: 'Cohere API Update', score: 0, date: '2025-06-25', company: 'Cohere' }
    ];

    const [min, max] = scoreRange;
    return allChanges.filter(change => 
      (min === 0 && change.score === 0) || 
      (change.score >= min && change.score <= max)
    );
  }

  displayVisualization() {
    console.log('\n📊 VISUALIZATION STRUCTURE:');
    console.log('─'.repeat(60));
    
    // Display tree structure
    const rootThoughts = this.thoughts.filter(t => !t.parent);
    rootThoughts.forEach(root => {
      this.displayThought(root, 0);
    });

    // Display statistics
    console.log('\n📈 STATISTICS:');
    console.log('─'.repeat(60));
    console.log(`Total Thoughts: ${this.thoughts.length}`);
    console.log(`Total Links: ${this.links.length}`);
    
    const typeCounts = {};
    this.thoughts.forEach(t => {
      const type = t.metadata.type || 'other';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
    
    console.log('\nThought Types:');
    Object.entries(typeCounts).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });
  }

  displayThought(thought, level) {
    const indent = '  '.repeat(level);
    const icon = thought.metadata.icon || thought.label || '•';
    console.log(`${indent}${icon} ${thought.name} [${thought.color}]`);
    
    if (thought.metadata.description) {
      console.log(`${indent}  └─ ${thought.metadata.description}`);
    }
    
    thought.children.forEach(child => {
      this.displayThought(child, level + 1);
    });
  }

  saveVisualization() {
    const exportData = {
      metadata: {
        name: 'AI Competitive Monitor - TheBrain Visualization',
        created: new Date().toISOString(),
        architecture: 'three-database',
        statistics: {
          totalThoughts: this.thoughts.length,
          totalLinks: this.links.length,
          databases: 3,
          companies: 52,
          workflows: 4
        }
      },
      thoughts: this.thoughts.map(t => ({
        id: t.id,
        name: t.name,
        label: t.label,
        color: t.color,
        parent: t.parent,
        metadata: t.metadata
      })),
      links: this.links,
      hierarchy: this.buildHierarchy()
    };

    const filename = 'thebrain-visualization-demo.json';
    fs.writeFileSync(filename, JSON.stringify(exportData, null, 2));
    
    console.log(`\n💾 Visualization saved to: ${filename}`);
    console.log('📤 This file demonstrates the structure that will be created in TheBrain');
  }

  buildHierarchy() {
    const hierarchy = {};
    
    this.thoughts.filter(t => !t.parent).forEach(root => {
      hierarchy[root.id] = this.buildSubHierarchy(root);
    });
    
    return hierarchy;
  }

  buildSubHierarchy(thought) {
    return {
      name: thought.name,
      type: thought.metadata.type || 'unknown',
      children: thought.children.map(child => this.buildSubHierarchy(child))
    };
  }
}

// Run the demo
console.log('🚀 TheBrain Visualization Demo for AI Competitive Monitor\n');

const demo = new TheBrainVisualizationDemo();
demo.generateDemo();

console.log('\n✅ Demo complete!');
console.log('\n📝 Next Steps:');
console.log('1. Run the actual TheBrain sync: node thebrain-sync-wrapper.js sync');
console.log('2. Import the generated JSON file into TheBrain');
console.log('3. Or use the TheBrain API to create thoughts programmatically');
console.log('\n🔗 TheBrain Integration Ready!');
