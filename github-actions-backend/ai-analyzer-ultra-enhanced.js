const Anthropic = require('@anthropic-ai/sdk');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Database connection
const dbPath = path.join(__dirname, 'data', 'monitor.db');
const db = new Database(dbPath);

// Enhanced extraction prompt
const EXTRACTION_PROMPT = `You are an AI competitive intelligence analyst specializing in deep content extraction and analysis. Your goal is to extract comprehensive, structured data from web content changes to populate a knowledge graph and enable smart grouping.

Extract the following information in a structured format:

1. **Core Entities** - Identify and extract:
   - Product names and features
   - Technology stacks and frameworks
   - Company names and partnerships
   - People (executives, key personnel)
   - Pricing tiers and amounts
   - Dates and timelines
   - Locations and markets

2. **Semantic Categories** - Classify content into:
   - Product launches/updates
   - Feature announcements
   - Pricing changes
   - Partnership/acquisition news
   - Technical capabilities
   - Market expansion
   - Company milestones
   - Industry trends

3. **Extracted Attributes** - For each entity, extract:
   - Description
   - Relationships to other entities
   - Quantitative metrics
   - Temporal information
   - Geographic scope
   - Target audience

4. **Competitive Signals** - Identify:
   - Direct competitive moves
   - Market positioning changes
   - Strategic pivots
   - Innovation indicators
   - Growth metrics
   - Customer focus shifts

5. **Knowledge Graph Data** - Structure for graph database:
   - Nodes (entities with properties)
   - Edges (relationships with types)
   - Clusters (thematic groupings)
   - Hierarchies (parent-child relations)

Provide your analysis in the following JSON structure:
{
  "entities": {
    "products": [{"name": "", "type": "", "description": "", "features": [], "metadata": {}}],
    "technologies": [{"name": "", "category": "", "purpose": "", "related_products": []}],
    "companies": [{"name": "", "role": "", "relationship": ""}],
    "people": [{"name": "", "title": "", "company": "", "context": ""}],
    "pricing": [{"tier": "", "amount": "", "currency": "", "period": "", "features": []}],
    "dates": [{"date": "", "event": "", "significance": ""}],
    "locations": [{"place": "", "type": "", "context": ""}]
  },
  "semantic_categories": {
    "primary": "",
    "secondary": [],
    "confidence": 0.0
  },
  "relationships": [
    {"from": "", "to": "", "type": "", "description": ""}
  ],
  "competitive_intelligence": {
    "threat_level": 0,
    "opportunity_score": 0,
    "market_impact": "",
    "strategic_implications": [],
    "recommended_actions": []
  },
  "smart_groups": {
    "suggested_groups": [],
    "entity_clusters": {},
    "theme_tags": []
  },
  "quantitative_data": {
    "metrics": [{"name": "", "value": "", "unit": "", "context": ""}],
    "comparisons": [{"metric": "", "our_value": "", "their_value": "", "difference": ""}]
  },
  "extracted_text": {
    "key_phrases": [],
    "important_quotes": [],
    "technical_terms": []
  }
}`;

async function analyzeWithEnhancedExtraction(change, oldContent, newContent, company, url) {
  try {
    const prompt = `${EXTRACTION_PROMPT}

Company: ${company.name} (${company.type})
URL: ${url.url} (${url.type})
Change Date: ${new Date(change.created_at).toISOString()}

OLD CONTENT:
${oldContent.substring(0, 3000)}

NEW CONTENT:
${newContent.substring(0, 3000)}

Analyze the changes and provide comprehensive extraction following the specified JSON structure. Focus on what's NEW or CHANGED.`;

    console.log('🧠 Using Claude Sonnet 4 for sophisticated entity extraction...');
    
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',  // Claude Sonnet 4 for efficiency
      max_tokens: 4000,
      temperature: 0.3,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const content = response.content[0].text;
    
    // Parse JSON response
    let extractedData;
    try {
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      extractedData = { error: 'Failed to parse extraction' };
    }

    return extractedData;
  } catch (error) {
    console.error('Enhanced extraction error:', error);
    return null;
  }
}

async function storeEnhancedAnalysis(changeId, extractedData) {
  try {
    // Create enhanced_analysis table if not exists
    db.exec(`
      CREATE TABLE IF NOT EXISTS enhanced_analysis (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        change_id INTEGER UNIQUE,
        entities TEXT,
        relationships TEXT,
        semantic_categories TEXT,
        competitive_data TEXT,
        smart_groups TEXT,
        quantitative_data TEXT,
        extracted_text TEXT,
        full_extraction TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (change_id) REFERENCES changes(id)
      )
    `);

    // Store the enhanced analysis
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO enhanced_analysis 
      (change_id, entities, relationships, semantic_categories, competitive_data, 
       smart_groups, quantitative_data, extracted_text, full_extraction)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      changeId,
      JSON.stringify(extractedData.entities || {}),
      JSON.stringify(extractedData.relationships || []),
      JSON.stringify(extractedData.semantic_categories || {}),
      JSON.stringify(extractedData.competitive_intelligence || {}),
      JSON.stringify(extractedData.smart_groups || {}),
      JSON.stringify(extractedData.quantitative_data || {}),
      JSON.stringify(extractedData.extracted_text || {}),
      JSON.stringify(extractedData)
    );

    // Update smart group assignments based on suggestions
    if (extractedData.smart_groups?.suggested_groups) {
      for (const groupName of extractedData.smart_groups.suggested_groups) {
        // Find or create the group
        let group = db.prepare('SELECT id FROM groups WHERE name = ?').get(groupName);
        
        if (!group) {
          // Create the group if it doesn't exist
          const result = db.prepare(
            'INSERT INTO groups (name, description, color) VALUES (?, ?, ?)'
          ).run(
            groupName,
            `Auto-created group for ${groupName}`,
            generateColorForGroup(groupName)
          );
          group = { id: result.lastInsertRowid };
        }

        // Get URL id from change
        const urlId = db.prepare('SELECT url_id FROM changes WHERE id = ?').get(changeId).url_id;

        // Assign URL to group if not already assigned
        try {
          db.prepare(
            'INSERT INTO url_groups (url_id, group_id) VALUES (?, ?)'
          ).run(urlId, group.id);
        } catch (e) {
          // Already assigned, ignore
        }
      }
    }

    console.log(`✅ Stored enhanced analysis for change ${changeId} using Claude 4 Opus`);
  } catch (error) {
    console.error('Error storing enhanced analysis:', error);
  }
}

function generateColorForGroup(groupName) {
  // Generate consistent colors based on group name
  const colors = [
    '#ef4444', '#f59e0b', '#22c55e', '#3b82f6', 
    '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'
  ];
  
  let hash = 0;
  for (let i = 0; i < groupName.length; i++) {
    hash = groupName.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}

async function generateSmartGroupReport() {
  const report = {
    timestamp: new Date().toISOString(),
    model: 'Claude 4 Opus',
    groups: {},
    entities: {
      products: new Set(),
      technologies: new Set(),
      companies: new Set(),
      people: new Set()
    },
    themes: {},
    recommendations: []
  };

  // Aggregate all enhanced analyses
  const analyses = db.prepare(`
    SELECT ea.*, c.created_at, u.url, comp.name as company_name
    FROM enhanced_analysis ea
    JOIN changes c ON ea.change_id = c.id
    JOIN urls u ON c.url_id = u.id
    JOIN companies comp ON u.company_id = comp.id
    WHERE c.created_at > datetime('now', '-7 days')
    ORDER BY c.created_at DESC
  `).all();

  for (const analysis of analyses) {
    try {
      const entities = JSON.parse(analysis.entities);
      const smartGroups = JSON.parse(analysis.smart_groups);
      const competitive = JSON.parse(analysis.competitive_data);

      // Collect entities
      if (entities.products) {
        entities.products.forEach(p => report.entities.products.add(p.name));
      }
      if (entities.technologies) {
        entities.technologies.forEach(t => report.entities.technologies.add(t.name));
      }
      if (entities.companies) {
        entities.companies.forEach(c => report.entities.companies.add(c.name));
      }
      if (entities.people) {
        entities.people.forEach(p => report.entities.people.add(p.name));
      }

      // Aggregate smart groups
      if (smartGroups.suggested_groups) {
        smartGroups.suggested_groups.forEach(group => {
          if (!report.groups[group]) {
            report.groups[group] = {
              count: 0,
              companies: new Set(),
              changes: []
            };
          }
          report.groups[group].count++;
          report.groups[group].companies.add(analysis.company_name);
          report.groups[group].changes.push({
            company: analysis.company_name,
            url: analysis.url,
            date: analysis.created_at,
            threat_level: competitive.threat_level || 0
          });
        });
      }

      // Collect themes
      if (smartGroups.theme_tags) {
        smartGroups.theme_tags.forEach(theme => {
          report.themes[theme] = (report.themes[theme] || 0) + 1;
        });
      }
    } catch (e) {
      console.error('Error processing analysis:', e);
    }
  }

  // Convert sets to arrays
  for (const key in report.entities) {
    report.entities[key] = Array.from(report.entities[key]);
  }

  for (const group in report.groups) {
    report.groups[group].companies = Array.from(report.groups[group].companies);
  }

  // Generate recommendations
  const topThemes = Object.entries(report.themes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  report.recommendations = [
    `Monitor "${topThemes[0]?.[0]}" closely - appearing in ${topThemes[0]?.[1]} changes`,
    `Create alerts for companies: ${Array.from(report.entities.companies).slice(0, 3).join(', ')}`,
    `Track technologies: ${Array.from(report.entities.technologies).slice(0, 3).join(', ')}`
  ];

  return report;
}

async function processRecentChanges() {
  console.log('🔍 Starting enhanced AI analysis with Claude 4 Opus...');
  console.log('🧠 Using the most powerful model for maximum intelligence extraction');

  // Get unanalyzed changes
  const changes = db.prepare(`
    SELECT c.*, u.url, u.type as url_type, comp.id as company_id, 
           comp.name as company_name, comp.type as company_type,
           cs_old.extracted_content as old_content,
           cs_new.extracted_content as new_content
    FROM changes c
    JOIN urls u ON c.url_id = u.id
    JOIN companies comp ON u.company_id = comp.id
    JOIN content_snapshots cs_old ON c.old_snapshot_id = cs_old.id
    JOIN content_snapshots cs_new ON c.new_snapshot_id = cs_new.id
    LEFT JOIN enhanced_analysis ea ON c.id = ea.change_id
    WHERE ea.id IS NULL
    ORDER BY c.created_at DESC
    LIMIT 10
  `).all();

  console.log(`Found ${changes.length} changes to analyze with Claude 4 Opus`);

  for (const change of changes) {
    console.log(`\n🎯 Analyzing change for ${change.company_name} - ${change.url_type}`);
    
    const company = {
      id: change.company_id,
      name: change.company_name,
      type: change.company_type
    };
    
    const url = {
      url: change.url,
      type: change.url_type
    };

    const extractedData = await analyzeWithEnhancedExtraction(
      change,
      change.old_content,
      change.new_content,
      company,
      url
    );

    if (extractedData && !extractedData.error) {
      await storeEnhancedAnalysis(change.id, extractedData);
      
      // Also update the regular AI analysis for compatibility
      const relevanceScore = extractedData.competitive_intelligence?.threat_level || 5;
      const summary = `Detected ${Object.keys(extractedData.entities).reduce((sum, key) => 
        sum + (extractedData.entities[key]?.length || 0), 0)} entities. ` +
        `Categories: ${extractedData.semantic_categories?.primary || 'General'}. ` +
        (extractedData.competitive_intelligence?.market_impact || '');

      db.prepare(`
        INSERT OR REPLACE INTO ai_analysis 
        (change_id, relevance_score, summary, category, competitive_threats, strategic_opportunities)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        change.id,
        relevanceScore,
        summary,
        extractedData.semantic_categories?.primary || 'General',
        JSON.stringify(extractedData.competitive_intelligence?.strategic_implications || []),
        JSON.stringify(extractedData.competitive_intelligence?.recommended_actions || [])
      );
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Generate smart group report
  const report = await generateSmartGroupReport();
  
  // Save report
  const reportPath = path.join(__dirname, 'data', 'smart-groups-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log('\n📊 Smart Groups Report (Generated with Claude 4 Opus):');
  console.log(`- Total entities found: ${Object.values(report.entities).reduce((sum, arr) => sum + arr.length, 0)}`);
  console.log(`- Suggested groups: ${Object.keys(report.groups).length}`);
  console.log(`- Top themes: ${Object.keys(report.themes).slice(0, 5).join(', ')}`);
  console.log(`\nReport saved to: ${reportPath}`);
}

// Export for use in other modules
module.exports = {
  analyzeWithEnhancedExtraction,
  storeEnhancedAnalysis,
  generateSmartGroupReport,
  processRecentChanges
};

// Run if called directly
if (require.main === module) {
  processRecentChanges()
    .then(() => {
      console.log('\n✅ Enhanced analysis with Claude 4 Opus complete!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Analysis failed:', error);
      process.exit(1);
    });
}
