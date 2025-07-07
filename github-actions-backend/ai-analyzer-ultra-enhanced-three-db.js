const Groq = require('groq-sdk');
const path = require('path');
const fs = require('fs');
const dbManager = require('./db-manager');
require('dotenv').config();

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || process.env.ANTHROPIC_API_KEY // Fallback for testing
});

// Error tracking class
class AnalysisErrorTracker {
  constructor() {
    this.errors = [];
    this.failedSites = [];
    this.criticalErrors = 0;
    this.successCount = 0;
  }
  
  addError(site, error, critical = false) {
    this.errors.push({ 
      site: site.company_name || site, 
      url: site.url || 'unknown',
      error: error.message, 
      timestamp: new Date().toISOString() 
    });
    this.failedSites.push(site.company_name || site);
    if (critical) this.criticalErrors++;
  }
  
  addSuccess() {
    this.successCount++;
  }
  
  hasErrors() {
    return this.errors.length > 0;
  }
  
  shouldAbort() {
    // Abort if any critical errors or >50% failed (with min threshold)
    return this.criticalErrors > 0 || 
           (this.errors.length > 10 && this.errors.length > this.successCount / 2);
  }
  
  getReport() {
    return {
      totalProcessed: this.successCount + this.errors.length,
      successful: this.successCount,
      failed: this.errors.length,
      criticalErrors: this.criticalErrors,
      errors: this.errors
    };
  }
}

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

6. **Interest Level Assessment** - Rate how interesting/important this change is:

Provide TWO separate scores (1-10) that will be averaged:

A. TECHNICAL INNOVATION SCORE:
   - 9-10: Breakthrough AI models, SOTA achievements, novel architectures, 10x improvements
   - 7-8: Significant technical advances, 2-5x improvements, new capabilities
   - 5-6: Notable optimizations, useful tools, incremental improvements
   - 3-4: Minor updates, bug fixes, routine maintenance
   - 1-2: No technical relevance

B. BUSINESS IMPACT SCORE:
   - 9-10: Major launches, $100M+ funding, acquisitions, market-reshaping moves
   - 7-8: Important partnerships, $10M+ funding, market expansion
   - 5-6: Product updates, new features, team growth
   - 3-4: Routine updates, minor news
   - 1-2: Trivial changes

The final interest_level should be the average of these two scores.

For "category", use one of: "breakthrough", "major_development", "notable_update", "routine_change", "trivial"

For "impact_areas", include relevant tags like: "ai_models", "funding", "partnership", "product_launch", "technical_innovation", "market_expansion", "team", "infrastructure"

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
  "interest_assessment": {
    "interest_level": 0,
    "interest_drivers": [],
    "category": "",
    "impact_areas": [],
    "technical_innovation_score": 0,
    "business_impact_score": 0,
    "summary": ""
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

async function analyzeWithEnhancedExtraction(change, company, url) {
  try {
    const prompt = `${EXTRACTION_PROMPT}

Company: ${company.name} (${company.category})
URL: ${url.url} (${url.url_type})
Change Date: ${new Date(change.detected_at).toISOString()}

PREVIOUS CONTENT:
${change.old_content ? change.old_content.substring(0, 3000) : '[No previous content]'}

CURRENT CONTENT:
${change.new_content ? change.new_content.substring(0, 3000) : '[No new content]'}

Analyze the changes and provide comprehensive extraction following the specified JSON structure. Focus on what's NEW or CHANGED.`;

    console.log('🚀 Using Groq Llama 3.3 for fast entity extraction...');
    
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{
        role: 'user',
        content: prompt
      }],
      temperature: 0.5,
      max_completion_tokens: 10000,
      top_p: 1,
      stream: false
    });

    const content = response.choices[0].message.content;
    
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

async function storeEnhancedAnalysis(intelligenceDb, changeId, extractedData) {
  try {
    // Store the enhanced analysis (table should exist in intelligence.db)
    const stmt = intelligenceDb.prepare(`
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
      JSON.stringify(extractedData.interest_assessment || {}),
      JSON.stringify(extractedData.smart_groups || {}),
      JSON.stringify(extractedData.quantitative_data || {}),
      JSON.stringify(extractedData.extracted_text || {}),
      JSON.stringify(extractedData)
    );

    // Create groups table if not exists
    intelligenceDb.exec(`
      CREATE TABLE IF NOT EXISTS groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        description TEXT,
        color TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create url_groups table if not exists
    intelligenceDb.exec(`
      CREATE TABLE IF NOT EXISTS url_groups (
        url_id INTEGER,
        group_id INTEGER,
        PRIMARY KEY (url_id, group_id),
        FOREIGN KEY (url_id) REFERENCES urls(id),
        FOREIGN KEY (group_id) REFERENCES groups(id)
      )
    `);

    // Update smart group assignments based on suggestions
    if (extractedData.smart_groups?.suggested_groups) {
      for (const groupName of extractedData.smart_groups.suggested_groups) {
        // Find or create the group
        let group = intelligenceDb.prepare('SELECT id FROM groups WHERE name = ?').get(groupName);
        
        if (!group) {
          // Create the group if it doesn't exist
          const result = intelligenceDb.prepare(
            'INSERT INTO groups (name, description, color) VALUES (?, ?, ?)'
          ).run(
            groupName,
            `Auto-created group for ${groupName}`,
            generateColorForGroup(groupName)
          );
          group = { id: result.lastInsertRowid };
        }
      }
    }

    console.log(`✅ Stored enhanced analysis for change ${changeId} using Groq Llama 3.3`);
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
  const processedDb = dbManager.getProcessedDb();
  const intelligenceDb = dbManager.getIntelligenceDb();

  // Attach intelligence database for cross-database queries
  const intelligenceDbPath = path.join(__dirname, 'data', 'intelligence.db');
  processedDb.exec(`ATTACH DATABASE '${intelligenceDbPath}' AS intelligence`);

  const report = {
    timestamp: new Date().toISOString(),
    model: 'Groq Llama 3.3 70B',
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

  // Get recent changes with enhanced analysis
  // Fixed: Using correct column names
  const changes = processedDb.prepare(`
    SELECT cd.*, mc.markdown_text, u.url, u.url_type as url_type,
           c.name as company_name, c.category as company_category
    FROM main.change_detection cd
    JOIN main.markdown_content mc ON cd.new_content_id = mc.id
    JOIN intelligence.urls u ON cd.url_id = u.id
    JOIN intelligence.companies c ON u.company_id = c.id
    WHERE cd.detected_at > datetime('now', '-7 days')
    ORDER BY cd.detected_at DESC
    LIMIT 50
  `).all();

  // Detach after query
  processedDb.exec('DETACH DATABASE intelligence');

  for (const change of changes) {
    // Get enhanced analysis from intelligence db
    const analysis = intelligenceDb.prepare(`
      SELECT * FROM enhanced_analysis WHERE change_id = ?
    `).get(change.id);

    if (analysis) {
      try {
        const entities = JSON.parse(analysis.entities);
        const smartGroups = JSON.parse(analysis.smart_groups);
        const interestData = JSON.parse(analysis.competitive_data);

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
            report.groups[group].companies.add(change.company_name);
            report.groups[group].changes.push({
              company: change.company_name,
              url: change.url,
              date: change.detected_at,
              interest_level: interestData.interest_level || 0
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
  console.log('🔍 Starting enhanced AI analysis with Groq Llama 3.3...');
  console.log('⚡ Ultra-fast inference for entity extraction');
  console.log('📊 Using three-database architecture for optimal performance');

  // Initialize error tracker
  const errorTracker = new AnalysisErrorTracker();

  const processedDb = dbManager.getProcessedDb();
  const intelligenceDb = dbManager.getIntelligenceDb();
  
  // Verify enhanced_analysis table exists
  try {
    intelligenceDb.exec(`
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
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_enhanced_change ON enhanced_analysis(change_id);
    `);
    console.log('✅ Database schema verified');
  } catch (error) {
    console.error('❌ Database schema verification failed:', error.message);
    errorTracker.addError({ company_name: 'Schema Verification' }, error, true);
    throw error;
  }

  // Attach intelligence database for cross-database queries
  const intelligenceDbPath = path.join(__dirname, 'data', 'intelligence.db');
  processedDb.exec(`ATTACH DATABASE '${intelligenceDbPath}' AS intelligence`);

  // Get unanalyzed changes
  // Fixed: Using correct column names
  const changes = processedDb.prepare(`
    SELECT cd.*, 
           mc_old.markdown_text as old_content,
           mc_new.markdown_text as new_content,
           u.url, u.url_type as url_type,
           c.id as company_id, c.name as company_name, c.category as company_category
    FROM main.change_detection cd
    JOIN intelligence.urls u ON cd.url_id = u.id
    JOIN intelligence.companies c ON u.company_id = c.id
    LEFT JOIN main.markdown_content mc_old ON cd.old_content_id = mc_old.id
    JOIN main.markdown_content mc_new ON cd.new_content_id = mc_new.id
    WHERE NOT EXISTS (
      SELECT 1 FROM intelligence.enhanced_analysis ea 
      WHERE ea.change_id = cd.id
    )
    ORDER BY cd.detected_at DESC
    LIMIT 10
  `).all();

  // Detach after query
  processedDb.exec('DETACH DATABASE intelligence');

  console.log(`Found ${changes.length} changes to analyze with Groq Llama 3.3`);

  for (const change of changes) {
    console.log(`\n🎯 Analyzing change for ${change.company_name} - ${change.url_type}`);
    
    try {
      const company = {
        id: change.company_id,
        name: change.company_name,
        category: change.company_category || 'AI'
      };
      
      const url = {
        url: change.url,
        url_type: change.url_type
      };

      const extractedData = await analyzeWithEnhancedExtraction(
        change,
        company,
        url
      );

      if (extractedData && !extractedData.error) {
        await storeEnhancedAnalysis(intelligenceDb, change.id, extractedData);
      
      // Also update the regular AI analysis for compatibility
      intelligenceDb.exec(`
        CREATE TABLE IF NOT EXISTS ai_analysis (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          change_id INTEGER UNIQUE,
          relevance_score INTEGER,
          summary TEXT,
          category TEXT,
          competitive_threats TEXT,
          strategic_opportunities TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      const relevanceScore = extractedData.interest_assessment?.interest_level || 5;
      const summary = `Detected ${Object.keys(extractedData.entities).reduce((sum, key) => 
        sum + (extractedData.entities[key]?.length || 0), 0)} entities. ` +
        `Categories: ${extractedData.semantic_categories?.primary || 'General'}. ` +
        (extractedData.interest_assessment?.summary || '');

      intelligenceDb.prepare(`
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
        
        // Mark as successful
        errorTracker.addSuccess();
      } else {
        throw new Error('Failed to extract data or extraction returned error');
      }
      
    } catch (error) {
      console.error(`   ❌ Analysis failed:`, error.message);
      
      // Track the error
      const isCritical = error.message.includes('Database') ||
                        error.message.includes('SQLITE') ||
                        error.message.includes('Invalid API');
      
      errorTracker.addError(change, error, isCritical);
      
      // Check if we should abort
      if (errorTracker.shouldAbort()) {
        console.error('\n❌ Too many failures or critical error, aborting analysis');
        console.error(`   Failed: ${errorTracker.errors.length} changes`);
        console.error(`   Critical errors: ${errorTracker.criticalErrors}`);
        break; // Exit the loop
      }
    }

    // Rate limiting - shorter delay with Groq
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Report errors if any
  const errorReport = errorTracker.getReport();
  if (errorTracker.hasErrors()) {
    console.log('\n⚠️  ANALYSIS COMPLETED WITH ERRORS');
    console.log(`📊 Total processed: ${errorReport.totalProcessed} changes`);
    console.log(`✅ Successful: ${errorReport.successful} changes`);
    console.log(`❌ Failed: ${errorReport.failed} changes`);
    console.log(`🔥 Critical errors: ${errorReport.criticalErrors}`);
    
    // Write error report
    const errorReportPath = path.join(__dirname, 'data', 'ultra-analysis-errors.json');
    fs.writeFileSync(errorReportPath, JSON.stringify(errorReport, null, 2));
    console.log(`\n📝 Error report saved to: ${errorReportPath}`);
  }

  // Generate smart group report
  try {
    const report = await generateSmartGroupReport();
    
    // Save report
    const reportPath = path.join(__dirname, 'data', 'smart-groups-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n📊 Smart Groups Report (Generated with Groq Llama 3.3):');
    console.log(`- Total entities found: ${Object.values(report.entities).reduce((sum, arr) => sum + arr.length, 0)}`);
    console.log(`- Suggested groups: ${Object.keys(report.groups).length}`);
    console.log(`- Top themes: ${Object.keys(report.themes).slice(0, 5).join(', ')}`);
    console.log(`\nReport saved to: ${reportPath}`);
  } catch (reportError) {
    console.error('\n❌ Failed to generate report:', reportError.message);
    errorTracker.addError({ company_name: 'Report Generation' }, reportError, true);
  }
  
  // Throw error if there were failures
  if (errorTracker.hasErrors()) {
    throw new Error(`Ultra analysis completed with ${errorReport.failed} failures`);
  }
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
  if (!process.env.GROQ_API_KEY && !process.env.ANTHROPIC_API_KEY) {
    console.error('❌ Error: GROQ_API_KEY environment variable is required');
    console.error('Please add it to your GitHub secrets or .env file');
    process.exit(1);
  }

  if (!dbManager.hasThreeDbArchitecture()) {
    console.error('❌ Error: Three-database architecture not found!');
    console.error('   Please run the scraper and processor first.');
    process.exit(1);
  }

  processRecentChanges()
    .then(() => {
      console.log('\n✅ Enhanced analysis with Groq Llama 3.3 complete!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Analysis failed:', error);
      process.exit(1);
    });
}
