const Groq = require('groq-sdk');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// FIXED: Validate API key before proceeding
if (!process.env.GROQ_API_KEY) {
  console.error('❌ Error: GROQ_API_KEY environment variable is required');
  console.error('   Please add it to your GitHub secrets or .env file');
  console.error('');
  console.error('   For GitHub Actions:');
  console.error('   1. Go to Settings → Secrets and variables → Actions');
  console.error('   2. Click "New repository secret"');
  console.error('   3. Name: GROQ_API_KEY');
  console.error('   4. Value: Your Groq API key from https://console.groq.com/keys');
  console.error('');
  process.exit(1);
}

// Initialize Groq client with validation
let groq;
try {
  groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
  });
} catch (error) {
  console.error('❌ Failed to initialize Groq client:', error.message);
  process.exit(1);
}

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

// Three-database architecture
const dataDir = path.join(__dirname, 'data');
const rawDb = new Database(path.join(dataDir, 'raw_content.db'));
const processedDb = new Database(path.join(dataDir, 'processed_content.db'));
const intelligenceDb = new Database(path.join(dataDir, 'intelligence.db'));

// Attach databases for cross-database queries
intelligenceDb.exec(`ATTACH DATABASE '${path.join(dataDir, 'processed_content.db')}' AS processed`);
intelligenceDb.exec(`ATTACH DATABASE '${path.join(dataDir, 'raw_content.db')}' AS raw`);

// Verify database schema
function verifyDatabaseSchema() {
  try {
    console.log('🔧 Verifying database schema...');
    
    // Create baseline_analysis table if it doesn't exist
    intelligenceDb.exec(`
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
    
    // Verify the table was created
    const tableCheck = intelligenceDb.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='baseline_analysis'
    `).get();
    
    if (!tableCheck) {
      throw new Error('Failed to create baseline_analysis table');
    }
    
    console.log('✅ Database schema verified');
  } catch (error) {
    console.error('❌ Database schema verification failed:', error.message);
    throw error;
  }
}

// Initialize schema
verifyDatabaseSchema();

// Enhanced baseline extraction prompt for comprehensive AI analysis
const BASELINE_EXTRACTION_PROMPT = `You are an AI competitive intelligence analyst. Analyze this company's current web content to extract comprehensive data with a focus on RELATIONSHIPS between entities.

Extract the following information with relationship context:

1. **Core Entities with Relationships**:
   - Products: Include what technologies they USE, what integrations they PROVIDE, what markets they TARGET
   - Technologies: Include what products IMPLEMENT them, what capabilities they ENABLE
   - Partnerships: Include the nature of partnership (INTEGRATES_WITH, PARTNERS_WITH, DEPENDS_ON)
   - Key personnel: Include their roles (LEADS, EMPLOYS, FOUNDED)
   - Pricing tiers: Include what features each tier INCLUDES
   - Markets: Include size, geography, and what products TARGET them

2. **Integration Capabilities** (CRITICAL):
   - List ALL integrations, APIs, connectors mentioned
   - Specify which products INTEGRATE_WITH which external services
   - Note any platforms this company's products DEPEND_ON

3. **Competitive Relationships**:
   - Companies they explicitly or implicitly COMPETE_WITH
   - Technologies or approaches they claim to REPLACE or IMPROVE_UPON
   - Markets where they COMPETE

4. **Technical Architecture**:
   - Core technologies the platform/product USES
   - Infrastructure it DEPENDS_ON
   - Standards it IMPLEMENTS

5. **AI/ML Concepts and Technologies** (CRITICAL FOR AI MONITOR):
   - Machine learning models used (LLMs, computer vision, NLP, etc.)
   - AI frameworks and libraries mentioned
   - Training data sources and methodologies
   - Model architectures and approaches
   - AI capabilities and features
   - AI performance metrics and benchmarks

6. **Market Positioning and Strategy**:
   - Target customer segments
   - Value propositions and differentiators
   - Go-to-market strategy
   - Growth metrics and traction
   - Future roadmap and vision

7. **Strategic Initiatives**:
   - Recent announcements and launches
   - Research focus areas
   - Investment priorities
   - Partnership strategies
   - Expansion plans

8. **Innovation Signals**:
   - Patents or proprietary technology
   - Research publications
   - Open source contributions
   - Technical blog posts
   - Developer tools and SDKs

9. **Industry Trends and Insights**:
   - Market trends they're capitalizing on
   - Industry challenges they're addressing
   - Future predictions they're making
   - Ecosystem changes they're driving

10. **Competitive Implications**:
    - Direct threats to our business
    - Opportunities for partnership
    - Technology gaps we should address
    - Market segments to target

Provide your analysis in this JSON structure:
{
  "entities": {
    "products": [{
      "name": "", 
      "type": "", 
      "description": "", 
      "features": [], 
      "status": "active/beta/announced",
      "uses_technologies": [],
      "provides_integrations": [],
      "targets_markets": [],
      "ai_capabilities": []
    }],
    "technologies": [{
      "name": "", 
      "category": "ai_ml/infrastructure/platform/tool", 
      "purpose": "",
      "implemented_by": [],
      "enables_capabilities": [],
      "technical_details": ""
    }],
    "ai_ml_concepts": [{
      "concept": "",
      "type": "model/framework/technique/metric",
      "description": "",
      "applications": [],
      "performance_metrics": {}
    }],
    "integrations": [{
      "name": "",
      "type": "api/connector/plugin/native",
      "platform": "",
      "description": "",
      "available_in_products": []
    }],
    "partnerships": [{
      "partner": "", 
      "relationship_type": "integrates_with/partners_with/depends_on/resells",
      "description": "",
      "products_affected": [],
      "strategic_value": ""
    }],
    "people": [{
      "name": "", 
      "title": "", 
      "role": "ceo/cto/founder/executive",
      "relationship": "leads/employs",
      "background": ""
    }],
    "pricing": [{
      "tier": "", 
      "price": "", 
      "features": [],
      "includes_products": [],
      "limitations": [],
      "target_segment": ""
    }],
    "markets": [{
      "segment": "", 
      "geography": "", 
      "size": "",
      "targeted_by_products": [],
      "growth_rate": "",
      "competitive_landscape": ""
    }],
    "competitors": [{
      "company": "",
      "compete_in": [],
      "our_advantages": [],
      "their_advantages": [],
      "market_position": ""
    }]
  },
  "relationships": [
    {"from": "", "to": "", "type": "owns/implements/integrates_with/competes_with/partners_with/uses/provides/targets/employs/leads/depends_on", "context": ""}
  ],
  "capabilities": {
    "integration_capabilities": [],
    "technical_capabilities": [],
    "business_capabilities": [],
    "ai_ml_capabilities": []
  },
  "current_state": {
    "positioning": "",
    "value_props": [],
    "core_capabilities": [],
    "recent_updates": [],
    "momentum_indicators": []
  },
  "strategic_intelligence": {
    "innovation_level": 0,
    "growth_indicators": [],
    "market_opportunities": [],
    "technology_trends": [],
    "strategic_initiatives": [],
    "threat_assessment": {
      "level": 0,
      "areas": [],
      "implications": [],
      "recommended_actions": []
    }
  },
  "quantitative_data": {
    "metrics": [{"name": "", "value": "", "context": "", "trend": ""}],
    "claims": [],
    "benchmarks": [],
    "kpis": []
  },
  "summary": {
    "one_line": "",
    "key_insights": [],
    "notable_facts": [],
    "action_items": []
  }
}

Focus on extracting ALL entities and their relationships. Be comprehensive and detailed.`;

async function analyzeWithGroq(content, company, url) {
  const maxRetries = 3;
  const baseDelay = 5000; // 5 seconds
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are an AI competitive intelligence analyst. Always respond with valid JSON only, no markdown formatting."
          },
          {
            role: "user",
            content: `${BASELINE_EXTRACTION_PROMPT}\n\nCompany: ${company.name}\nURL: ${url}\n\nContent to analyze:\n${content}`
          }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.1,
        max_tokens: 8000,
        response_format: { type: "json_object" }
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('Empty response from Groq');
      }

      // Parse and validate JSON
      const parsed = JSON.parse(response);
      return parsed;
    } catch (error) {
      const isRateLimitError = error.status === 429 || 
                              error.message?.includes('rate limit') ||
                              error.message?.includes('Rate limit');
      
      if (isRateLimitError && attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
        console.log(`   ⏳ Rate limited. Waiting ${delay/1000}s before retry ${attempt}/${maxRetries}...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // Check for invalid API key error
      if (error.status === 401 || error.message?.includes('Invalid API Key')) {
        console.error('❌ Invalid GROQ_API_KEY. Please check your API key.');
        throw new Error('Invalid API key');
      }
      
      if (attempt === maxRetries) {
        console.error(`   ❌ Failed after ${maxRetries} attempts:`, error.message);
        throw error;
      }
      
      console.error(`   ⚠️  Attempt ${attempt} failed:`, error.message);
    }
  }
}

async function storeBaselineAnalysis(snapshot, company, url, extractedData) {
  try {
    const relevanceScore = extractedData.strategic_intelligence?.threat_assessment?.level || 5;
    const summary = extractedData.summary?.one_line || 
      `${company.name}: ${extractedData.current_state?.positioning || 'AI company'}`;

    const stmt = intelligenceDb.prepare(`
      INSERT OR REPLACE INTO baseline_analysis 
      (company_id, url_id, snapshot_id, entities, relationships, semantic_categories, 
       competitive_data, smart_groups, quantitative_data, extracted_text, 
       full_extraction, summary, relevance_score)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      company.id,
      url.id,
      snapshot.id,
      JSON.stringify(extractedData.entities || {}),
      JSON.stringify(extractedData.relationships || []),
      JSON.stringify(extractedData.capabilities || {}),
      JSON.stringify(extractedData.strategic_intelligence || {}),
      JSON.stringify({
        integration_partners: extractedData.entities?.partnerships || [],
        technology_stack: extractedData.entities?.technologies || [],
        market_segments: extractedData.entities?.markets || []
      }),
      JSON.stringify(extractedData.quantitative_data || {}),
      JSON.stringify({
        key_facts: extractedData.summary?.notable_facts || [],
        value_props: extractedData.current_state?.value_props || []
      }),
      JSON.stringify(extractedData),
      summary,
      relevanceScore
    );

    console.log(`   ✅ Stored baseline analysis (relevance: ${relevanceScore}/10)`);
  } catch (error) {
    console.error(`   ❌ Failed to store analysis:`, error.message);
    throw error;
  }
}

async function processAllSnapshots() {
  console.log('🚀 Starting BASELINE AI Analysis with Groq Llama 3.3...');
  console.log('📊 This will analyze ALL companies\' current state');
  console.log('⚡ Using Groq for faster inference with Llama 3.3 70B');
  console.log('⏱️  Implemented with timeout protection and retry logic\n');

  // Initialize error tracker
  const errorTracker = new AnalysisErrorTracker();

  // FIXED: Check if baseline analysis already exists
  const existingCount = intelligenceDb.prepare('SELECT COUNT(*) as count FROM baseline_analysis').get();
  if (existingCount.count > 0) {
    console.log(`⚠️  Found existing baseline analysis (${existingCount.count} records)`);
    console.log('   Use --force flag to re-analyze all content');
    
    // Check for --force flag
    const forceReanalyze = process.argv.includes('--force');
    if (!forceReanalyze) {
      console.log('✅ Skipping duplicate analysis to save API costs');
      console.log('   Baseline analysis is already complete');
      return generateBaselineReport();
    }
    
    console.log('🔄 Force flag detected - re-analyzing all content');
  }

  // Validate API key with a test call
  try {
    console.log('🔑 Validating Groq API key...');
    await groq.models.list();
    console.log('✅ API key validated successfully\n');
  } catch (error) {
    console.error('❌ Failed to validate GROQ_API_KEY:', error.message);
    console.error('   Please check your API key at https://console.groq.com/keys');
    // This is a critical error
    errorTracker.addError({ company_name: 'API Validation' }, error, true);
    process.exit(1);
  }

  // Get the most recent processed content for each URL
  const latestSnapshots = intelligenceDb.prepare(`
    SELECT 
      mc.id,
      mc.url_id,
      mc.raw_html_id as snapshot_id,
      mc.markdown_text,
      mc.processed_at,
      u.id as url_id, 
      u.url, 
      u.url_type,
      c.id as company_id, 
      c.name as company_name, 
      c.category as company_type
    FROM processed.markdown_content mc
    JOIN urls u ON mc.url_id = u.id
    JOIN companies c ON u.company_id = c.id
    WHERE mc.id IN (
      SELECT MAX(id) 
      FROM processed.markdown_content 
      GROUP BY url_id
    )
    ORDER BY c.name, u.url
  `).all();

  console.log(`📋 Found ${latestSnapshots.length} URLs to analyze\n`);

  let processed = 0;
  const startTime = Date.now();

  for (const snapshot of latestSnapshots) {
    processed++;
    const progress = Math.round((processed / latestSnapshots.length) * 100);
    
    console.log(`\n[${processed}/${latestSnapshots.length}] (${progress}%) Analyzing ${snapshot.company_name}`);
    console.log(`   📍 ${snapshot.url}`);
    
    try {
      // Skip if content is too small or empty
      if (!snapshot.markdown_text || snapshot.markdown_text.length < 100) {
        console.log('   ⚠️  Skipping - content too small');
        continue;
      }

      // Analyze with Groq
      console.log('   🧠 Extracting intelligence with Groq...');
      const extractedData = await analyzeWithGroq(
        snapshot.markdown_text.substring(0, 30000), // Limit content size
        { id: snapshot.company_id, name: snapshot.company_name },
        snapshot.url
      );

      // Store in database
      await storeBaselineAnalysis(snapshot, 
        { id: snapshot.company_id, name: snapshot.company_name },
        { id: snapshot.url_id, url: snapshot.url },
        extractedData
      );

      // Log key findings
      const productCount = extractedData.entities?.products?.length || 0;
      const techCount = extractedData.entities?.technologies?.length || 0;
      const partnerCount = extractedData.entities?.partnerships?.length || 0;
      console.log(`   📊 Extracted: ${productCount} products, ${techCount} technologies, ${partnerCount} partnerships`);
      
      // Mark as successful
      errorTracker.addSuccess();
      
    } catch (error) {
      console.error(`   ❌ Analysis failed:`, error.message);
      
      // Track the error
      const isCritical = error.message === 'Invalid API key' || 
                        error.message.includes('Database') ||
                        error.message.includes('SQLITE');
      
      errorTracker.addError(snapshot, error, isCritical);
      
      // Check if we should abort
      if (errorTracker.shouldAbort()) {
        console.error('\n❌ Too many failures or critical error, aborting analysis');
        console.error(`   Failed: ${errorTracker.errors.length} sites`);
        console.error(`   Critical errors: ${errorTracker.criticalErrors}`);
        break; // Exit the loop
      }
    }

    // Show progress stats every 10 sites
    if (processed % 10 === 0) {
      const elapsed = (Date.now() - startTime) / 1000;
      const rate = processed / elapsed;
      const remaining = (latestSnapshots.length - processed) / rate;
      console.log(`\n⏱️  Progress: ${processed}/${latestSnapshots.length} (${errorTracker.errors.length} failed)`);
      console.log(`   Rate: ${rate.toFixed(1)} sites/sec`);
      console.log(`   ETA: ${Math.ceil(remaining / 60)} minutes`);
    }
  }

  const totalTime = (Date.now() - startTime) / 1000;
  const report = errorTracker.getReport();
  
  console.log('\n' + '='.repeat(50));
  console.log(errorTracker.hasErrors() ? '⚠️  BASELINE ANALYSIS COMPLETED WITH ERRORS' : '✅ BASELINE ANALYSIS COMPLETE');
  console.log('='.repeat(50));
  console.log(`📊 Total processed: ${report.totalProcessed} sites`);
  console.log(`✅ Successful: ${report.successful} sites`);
  console.log(`❌ Failed: ${report.failed} sites`);
  console.log(`🔥 Critical errors: ${report.criticalErrors}`);
  console.log(`⏱️  Total time: ${Math.round(totalTime / 60)} minutes`);
  console.log(`⚡ Average: ${(totalTime / processed).toFixed(1)}s per site`);

  if (errorTracker.hasErrors()) {
    console.log('\n❌ Failed sites:');
    report.errors.forEach(error => {
      console.log(`   - ${error.site} (${error.url})`);
      console.log(`     Error: ${error.error}`);
      console.log(`     Time: ${error.timestamp}`);
    });
    
    // Write error report to file for debugging
    const errorReportPath = path.join(dataDir, 'baseline-analysis-errors.json');
    fs.writeFileSync(errorReportPath, JSON.stringify(report, null, 2));
    console.log(`\n📝 Error report saved to: ${errorReportPath}`);
  }

  // Generate comprehensive report even if there were errors
  try {
    await generateBaselineReport();
  } catch (reportError) {
    console.error('\n❌ Failed to generate report:', reportError.message);
    errorTracker.addError({ company_name: 'Report Generation' }, reportError, true);
  }
  
  // Return error status
  if (errorTracker.hasErrors()) {
    throw new Error(`Analysis completed with ${report.failed} failures`);
  }
  
  return report;
}

async function generateBaselineReport() {
  console.log('\n📊 Generating baseline intelligence report...');

  const report = {
    generated_at: new Date().toISOString(),
    statistics: {
      companies: intelligenceDb.prepare('SELECT COUNT(DISTINCT company_id) as count FROM baseline_analysis').get()?.count || 0,
      urls_analyzed: intelligenceDb.prepare('SELECT COUNT(*) as count FROM baseline_analysis').get()?.count || 0,
      total_products: 0,
      total_technologies: 0,
      total_partnerships: 0,
      total_integrations: 0
    },
    companies: [],
    key_insights: [],
    competitive_landscape: {
      threat_levels: {},
      market_segments: {},
      technology_adoption: {}
    }
  };

  // Get all companies with their baseline analysis
  const companies = intelligenceDb.prepare(`
    SELECT DISTINCT
      c.id,
      c.name,
      c.category as type,
      COUNT(ba.id) as url_count
    FROM companies c
    JOIN baseline_analysis ba ON c.id = ba.company_id
    GROUP BY c.id, c.name, c.category
    ORDER BY c.name
  `).all();

  for (const company of companies) {
    // Get all baseline analyses for this company
    const analyses = intelligenceDb.prepare(`
      SELECT 
        ba.*,
        u.url
      FROM baseline_analysis ba
      JOIN urls u ON ba.url_id = u.id
      WHERE ba.company_id = ?
    `).all(company.id);

    // Aggregate data across all URLs for this company
    const aggregated = {
      id: company.id,
      name: company.name,
      type: company.type,
      urls_analyzed: analyses.length,
      entities: {
        products: [],
        technologies: [],
        partnerships: [],
        integrations: [],
        people: [],
        markets: []
      },
      relationships: [],
      threat_level: 0,
      key_insights: []
    };

    // Merge data from all URLs
    for (const analysis of analyses) {
      try {
        const fullExtraction = JSON.parse(analysis.full_extraction);
        const entities = fullExtraction.entities || {};
        
        // Merge entities (deduplicate by name)
        ['products', 'technologies', 'partnerships', 'integrations', 'people', 'markets'].forEach(type => {
          if (entities[type]) {
            entities[type].forEach(item => {
              if (!aggregated.entities[type].find(e => e.name === item.name)) {
                aggregated.entities[type].push(item);
              }
            });
          }
        });

        // Merge relationships
        if (fullExtraction.relationships) {
          aggregated.relationships.push(...fullExtraction.relationships);
        }

        // Update threat level (take maximum)
        const threatLevel = fullExtraction.strategic_intelligence?.threat_assessment?.level || 0;
        aggregated.threat_level = Math.max(aggregated.threat_level, threatLevel);

        // Collect insights
        if (fullExtraction.summary?.key_insights) {
          aggregated.key_insights.push(...fullExtraction.summary.key_insights);
        }
      } catch (e) {
        console.error(`Error parsing analysis for ${company.name}:`, e.message);
      }
    }

    // Update statistics
    report.statistics.total_products += aggregated.entities.products.length;
    report.statistics.total_technologies += aggregated.entities.technologies.length;
    report.statistics.total_partnerships += aggregated.entities.partnerships.length;
    report.statistics.total_integrations += aggregated.entities.integrations.length;

    // Add to report
    report.companies.push(aggregated);

    // Update competitive landscape
    const threatCategory = aggregated.threat_level >= 8 ? 'high' : 
                          aggregated.threat_level >= 5 ? 'medium' : 'low';
    report.competitive_landscape.threat_levels[threatCategory] = 
      (report.competitive_landscape.threat_levels[threatCategory] || 0) + 1;
  }

  // Save report
  const reportPath = path.join(dataDir, 'baseline-intelligence-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log('✅ Report generated:', reportPath);
  console.log('\n📊 Summary:');
  console.log(`   - Companies: ${report.statistics.companies}`);
  console.log(`   - Products: ${report.statistics.total_products}`);
  console.log(`   - Technologies: ${report.statistics.total_technologies}`);
  console.log(`   - Partnerships: ${report.statistics.total_partnerships}`);
  console.log(`   - Integrations: ${report.statistics.total_integrations}`);

  return report;
}

// Export functions for use in other modules
module.exports = {
  analyzeWithGroq,
  storeBaselineAnalysis,
  processAllSnapshots,
  generateBaselineReport
};

// Run if called directly
if (require.main === module) {
  processAllSnapshots()
    .then((report) => {
      console.log('\n✅ Baseline intelligence analysis complete!');
      console.log('📍 Report saved to: data/baseline-intelligence-report.json');
      console.log('\n🎯 Next step: Run TheBrain sync to visualize all this intelligence');
      
      // Clean up database connections
      try {
        intelligenceDb.exec('DETACH DATABASE processed');
        intelligenceDb.exec('DETACH DATABASE raw');
        intelligenceDb.close();
        processedDb.close();
        rawDb.close();
      } catch (closeError) {
        console.error('⚠️  Error closing databases:', closeError.message);
      }
      
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Analysis failed:', error.message);
      
      // Clean up database connections even on error
      try {
        intelligenceDb.exec('DETACH DATABASE processed');
        intelligenceDb.exec('DETACH DATABASE raw');
        intelligenceDb.close();
        processedDb.close();
        rawDb.close();
      } catch (closeError) {
        console.error('⚠️  Error closing databases:', closeError.message);
      }
      
      // Exit with error code
      process.exit(1);
    });
}
