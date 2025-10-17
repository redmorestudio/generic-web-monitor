#!/usr/bin/env node

// SSL Certificate fix for Heroku PostgreSQL
if (process.env.NODE_ENV === 'production' || process.env.POSTGRES_CONNECTION_STRING) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const Groq = require('groq-sdk');
const path = require('path');
const fs = require('fs');
const { db, end } = require('./postgres-db');
// Only load dotenv in development (not in GitHub Actions)
if (!process.env.GITHUB_ACTIONS && !process.env.POSTGRES_CONNECTION_STRING) {
  try {
    require('dotenv').config();
  } catch (e) {
    // dotenv not available or no .env file - this is fine
  }
}

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

10. **Interest Assessment** (CRITICAL - Dual Scoring System):
    - **Technical Innovation Score (1-10)**:
      * 9-10: Breakthrough AI models, SOTA achievements, novel architectures, 10x improvements
      * 7-8: Significant technical advances, 2-5x improvements, new capabilities
      * 5-6: Notable optimizations, useful tools, incremental improvements
      * 3-4: Minor updates, bug fixes, routine maintenance
      * 1-2: No technical relevance
    
    - **Business Impact Score (1-10)**:
      * 9-10: Major launches, $100M+ funding, acquisitions, market-reshaping moves
      * 7-8: Important partnerships, $10M+ funding, market expansion
      * 5-6: Product updates, new features, team growth
      * 3-4: Routine updates, minor news
      * 1-2: Trivial changes
    
    - **Final Interest Level**: Average of technical and business scores
    - **Category**: "breakthrough", "major_development", "notable_update", "routine_change", "trivial"
    - **Impact Areas**: "ai_models", "funding", "partnership", "product_launch", "technical_innovation", "market_expansion", "team", "infrastructure"

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
    "interest_assessment": {
      "interest_level": 0,
      "interest_drivers": [],
      "category": "",
      "impact_areas": [],
      "technical_innovation_score": 0,
      "business_impact_score": 0,
      "summary": ""
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
            content: `${BASELINE_EXTRACTION_PROMPT}\n\nCompany: ${company}\nURL: ${url}\n\nContent to analyze:\n${content}`
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

async function storeBaselineAnalysis(company, url, extractedData) {
  try {
    const relevanceScore = extractedData.strategic_intelligence?.interest_assessment?.interest_level || 5;
    const summary = extractedData.summary?.one_line || 
      `${company}: ${extractedData.current_state?.positioning || 'AI company'}`;

    // Get the latest markdown content hash for this URL
    const contentHash = await db.get(`
      SELECT markdown_hash 
      FROM processed_content.markdown_pages 
      WHERE company = $1 AND url = $2 
      ORDER BY created_at DESC 
      LIMIT 1
    `, [company, url]);

    // Store using PostgreSQL syntax with ON CONFLICT
    // Schema expects JSONB columns for entities, themes, sentiment, key_points, relationships
    await db.run(`
      INSERT INTO intelligence.baseline_analysis 
      (company, url, 
       entities, themes, sentiment, key_points, relationships,
       company_type, page_purpose, key_topics, main_message, 
       target_audience, unique_value, trust_elements, differentiation, 
       technology_stack, analysis_date, content_hash, ai_model)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), $17, $18)
      ON CONFLICT (company, url) DO UPDATE SET
        entities = EXCLUDED.entities,
        themes = EXCLUDED.themes,
        sentiment = EXCLUDED.sentiment,
        key_points = EXCLUDED.key_points,
        relationships = EXCLUDED.relationships,
        company_type = EXCLUDED.company_type,
        page_purpose = EXCLUDED.page_purpose,
        key_topics = EXCLUDED.key_topics,
        main_message = EXCLUDED.main_message,
        target_audience = EXCLUDED.target_audience,
        unique_value = EXCLUDED.unique_value,
        trust_elements = EXCLUDED.trust_elements,
        differentiation = EXCLUDED.differentiation,
        technology_stack = EXCLUDED.technology_stack,
        analysis_date = NOW(),
        content_hash = EXCLUDED.content_hash,
        ai_model = EXCLUDED.ai_model
    `, [
      company,
      url,
      JSON.stringify(extractedData.entities || {}), // entities JSONB
      JSON.stringify(extractedData.capabilities || {}), // themes JSONB
      JSON.stringify(extractedData.strategic_intelligence?.interest_assessment || {}), // sentiment JSONB
      JSON.stringify(extractedData.summary?.key_insights || []), // key_points JSONB
      JSON.stringify(extractedData.relationships || []), // relationships JSONB
      extractedData.entities?.products?.[0]?.type || 'AI Company',
      extractedData.current_state?.positioning || '',
      JSON.stringify(extractedData.summary?.key_insights || []), // key_topics as text
      extractedData.summary?.one_line || '',
      extractedData.entities?.markets?.[0]?.segment || '',
      extractedData.current_state?.value_props?.[0] || '',
      JSON.stringify(extractedData.current_state?.core_capabilities || []), // trust_elements as text
      extractedData.strategic_intelligence?.innovation_level || '',
      JSON.stringify(extractedData.entities?.technologies?.map(t => t.name) || []), // technology_stack as text
      contentHash?.markdown_hash || null,
      'groq-llama-3.3-70b'
    ]);

    console.log(`   ✅ Stored baseline analysis (relevance: ${relevanceScore}/10)`);
  } catch (error) {
    console.error(`   ❌ Failed to store analysis:`, error.message);
    throw error;
  }
}

async function processAllSnapshots() {
  console.log('🚀 Starting BASELINE AI Analysis with Groq Llama 3.3 (PostgreSQL)...');
  console.log('📊 This will analyze ALL companies\' current state');
  console.log('⚡ Using Groq for faster inference with Llama 3.3 70B');
  console.log('🐘 Using PostgreSQL for data storage');
  console.log('⏱️  Implemented with timeout protection and retry logic\n');

  // Initialize error tracker
  const errorTracker = new AnalysisErrorTracker();

  // Check if baseline analysis already exists
  const existingCount = await db.get('SELECT COUNT(*) as count FROM intelligence.baseline_analysis');
  if (parseInt(existingCount.count) > 0) {
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
    errorTracker.addError({ company_name: 'API Validation' }, error, true);
    process.exit(1);
  }

  // Get the most recent processed content for each URL
  const latestSnapshots = await db.all(`
    SELECT DISTINCT ON (company, url)
      company,
      url,
      content as markdown_text,
      created_at
    FROM processed_content.markdown_pages
    WHERE content IS NOT NULL AND LENGTH(content) > 100
    ORDER BY company, url, created_at DESC
  `);

  console.log(`📋 Found ${latestSnapshots.length} URLs to analyze\n`);

  let processed = 0;
  const startTime = Date.now();

  for (const snapshot of latestSnapshots) {
    processed++;
    const progress = Math.round((processed / latestSnapshots.length) * 100);
    
    console.log(`\n[${processed}/${latestSnapshots.length}] (${progress}%) Analyzing ${snapshot.company}`);
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
        snapshot.company,
        snapshot.url
      );

      // Store in database
      await storeBaselineAnalysis(
        snapshot.company,
        snapshot.url,
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
                        error.message.includes('database');
      
      errorTracker.addError(snapshot, error, isCritical);
      
      // Check if we should abort
      if (errorTracker.shouldAbort()) {
        console.error('\n❌ Too many failures or critical error, aborting analysis');
        console.error(`   Failed: ${errorTracker.errors.length} sites`);
        console.error(`   Critical errors: ${errorTracker.criticalErrors}`);
        break;
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
    const dataDir = path.join(__dirname, 'data');
    const errorReportPath = path.join(dataDir, 'baseline-analysis-errors-postgres.json');
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
    throw new Error(`Analysis completed with ${errorTracker.errors.length} failures`);
  }
  
  return report;
}

async function generateBaselineReport() {
  console.log('\n📊 Generating baseline intelligence report (PostgreSQL)...');

  const report = {
    generated_at: new Date().toISOString(),
    database: 'PostgreSQL',
    statistics: {
      companies: 0,
      urls_analyzed: 0,
      total_products: 0,
      total_technologies: 0,
      total_partnerships: 0,
      total_integrations: 0
    },
    companies: [],
    key_insights: [],
    competitive_landscape: {
      interest_levels: {},
      market_segments: {},
      technology_adoption: {}
    }
  };

  // Get statistics
  const stats = await db.get(`
    SELECT 
      COUNT(DISTINCT company) as companies,
      COUNT(*) as urls_analyzed
    FROM intelligence.baseline_analysis
  `);
  
  report.statistics.companies = parseInt(stats.companies);
  report.statistics.urls_analyzed = parseInt(stats.urls_analyzed);

  // Get all companies with their baseline analysis
  const companies = await db.all(`
    SELECT DISTINCT
      company,
      COUNT(*) as url_count
    FROM intelligence.baseline_analysis
    GROUP BY company
    ORDER BY company
  `);

  for (const company of companies) {
    // Get all baseline analyses for this company
    const analyses = await db.all(`
      SELECT *
      FROM intelligence.baseline_analysis
      WHERE company = $1
    `, [company.company]);

    // Create aggregated data for this company
    const aggregated = {
      name: company.company,
      urls_analyzed: analyses.length,
      technologies: [],
      key_topics: [],
      trust_elements: [],
      page_purposes: [],
      unique_values: []
    };

    // Merge data from all URLs
    for (const analysis of analyses) {
      // Parse JSON strings back to arrays
      if (analysis.technology_stack) {
        try {
          const techs = typeof analysis.technology_stack === 'string' 
            ? JSON.parse(analysis.technology_stack) 
            : analysis.technology_stack;
          if (Array.isArray(techs)) {
            aggregated.technologies.push(...techs);
          }
        } catch (e) {
          // If not valid JSON, treat as single value
          aggregated.technologies.push(analysis.technology_stack);
        }
      }
      if (analysis.key_topics) {
        try {
          const topics = typeof analysis.key_topics === 'string' 
            ? JSON.parse(analysis.key_topics) 
            : analysis.key_topics;
          if (Array.isArray(topics)) {
            aggregated.key_topics.push(...topics);
          }
        } catch (e) {
          aggregated.key_topics.push(analysis.key_topics);
        }
      }
      if (analysis.trust_elements) {
        try {
          const elements = typeof analysis.trust_elements === 'string' 
            ? JSON.parse(analysis.trust_elements) 
            : analysis.trust_elements;
          if (Array.isArray(elements)) {
            aggregated.trust_elements.push(...elements);
          }
        } catch (e) {
          aggregated.trust_elements.push(analysis.trust_elements);
        }
      }
      if (analysis.page_purpose) {
        aggregated.page_purposes.push(analysis.page_purpose);
      }
      if (analysis.unique_value) {
        aggregated.unique_values.push(analysis.unique_value);
      }
    }

    // Deduplicate arrays
    aggregated.technologies = [...new Set(aggregated.technologies)];
    aggregated.key_topics = [...new Set(aggregated.key_topics)];
    aggregated.trust_elements = [...new Set(aggregated.trust_elements)];
    aggregated.page_purposes = [...new Set(aggregated.page_purposes)];
    aggregated.unique_values = [...new Set(aggregated.unique_values)];

    // Update statistics
    report.statistics.total_technologies += aggregated.technologies.length;

    // Add to report
    report.companies.push(aggregated);
  }

  // Save report
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  const reportPath = path.join(dataDir, 'baseline-intelligence-report-postgres.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log('✅ Report generated:', reportPath);
  console.log('\n📊 Summary:');
  console.log(`   - Companies: ${report.statistics.companies}`);
  console.log(`   - URLs analyzed: ${report.statistics.urls_analyzed}`);
  console.log(`   - Total technologies: ${report.statistics.total_technologies}`);

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
      console.log('📍 Report saved to: data/baseline-intelligence-report-postgres.json');
      console.log('\n🎯 Next step: Run change detection analysis');
      
      // Clean up database connection
      end();
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Analysis failed:', error.message);
      
      // Clean up database connection even on error
      end();
      process.exit(1);
    });
}
