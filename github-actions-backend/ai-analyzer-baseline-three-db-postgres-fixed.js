#!/usr/bin/env node

// SSL Certificate fix for Heroku PostgreSQL
if (process.env.NODE_ENV === 'production' || process.env.POSTGRES_CONNECTION_STRING) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const Groq = require('groq-sdk');
const path = require('path');
const fs = require('fs');
const { db, end } = require('./postgres-db');
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

// Copy the BASELINE_EXTRACTION_PROMPT from the original file
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
    "people": [{
      "name": "",
      "role": "",
      "title": "",
      "focus_areas": [],
      "background": ""
    }],
    "partnerships": [{
      "partner": "",
      "relationship_type": "technology/channel/strategic/investment",
      "description": "",
      "impact": ""
    }],
    "pricing": [{
      "tier": "",
      "price": "",
      "billing": "monthly/annual/usage",
      "includes_features": [],
      "target_segment": ""
    }],
    "funding": {
      "total_raised": "",
      "latest_round": "",
      "investors": [],
      "valuation": ""
    }
  },
  "relationships": [
    {
      "from_entity": "",
      "relationship": "USES/PROVIDES/INTEGRATES_WITH/COMPETES_WITH/PARTNERS_WITH/DEPENDS_ON/TARGETS/IMPLEMENTS/ENABLES/REPLACES",
      "to_entity": "",
      "description": ""
    }
  ],
  "themes": {
    "technical_focus": [],
    "market_focus": [],
    "strategic_priorities": [],
    "innovation_areas": [],
    "competitive_advantages": []
  },
  "sentiment": {
    "market_positioning": "leader/challenger/innovator/niche",
    "growth_trajectory": "rapid/steady/emerging/mature",
    "innovation_level": "breakthrough/leading/competitive/following",
    "confidence_indicators": []
  },
  "key_points": {
    "summary": "",
    "unique_value_props": [],
    "critical_dependencies": [],
    "risk_factors": [],
    "opportunities": []
  },
  "interest_assessment": {
    "technical_innovation_score": 0,
    "business_impact_score": 0,
    "interest_level": 0,
    "category": "",
    "impact_areas": [],
    "key_reasons": []
  }
}`;

async function analyzeBaseline(content, company, url) {
  const maxRetries = 3;
  const baseDelay = 5000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const prompt = `${BASELINE_EXTRACTION_PROMPT}

Company: ${company}
URL: ${url}

Content to analyze:
${content.substring(0, 30000)}

Remember to extract entities with their RELATIONSHIPS and provide comprehensive assessment including AI/ML capabilities and innovation signals.`;

      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.3,
        max_tokens: 4000,
        response_format: { type: "json_object" }
      });

      const analysis = JSON.parse(completion.choices[0].message.content);
      
      // Calculate final interest level from dual scores
      if (analysis.interest_assessment) {
        analysis.interest_assessment.interest_level = Math.round(
          (analysis.interest_assessment.technical_innovation_score + 
           analysis.interest_assessment.business_impact_score) / 2
        );
      }
      
      return analysis;
    } catch (error) {
      console.error(`   ⚠️  Attempt ${attempt}/${maxRetries} failed:`, error.message);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.log(`   ⏳ Retrying in ${delay / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

async function runBaselineAnalysis() {
  console.log('🚀 Starting BASELINE AI Analysis with Groq Llama 3.3 (PostgreSQL)...');
  console.log('📊 This will analyze ALL companies\' current state');
  console.log('⚡ Using Groq for faster inference with Llama 3.3 70B');
  console.log('🐘 Using PostgreSQL with JSONB for rich data storage');
  console.log('⏱️  Implemented with timeout protection and retry logic');
  
  const errorTracker = new AnalysisErrorTracker();
  
  try {
    // FIXED: Test API key
    console.log('\n🔑 Validating Groq API key...');
    try {
      await groq.chat.completions.create({
        messages: [{ role: 'user', content: 'test' }],
        model: 'llama-3.3-70b-versatile',
        max_tokens: 5,
        temperature: 0
      });
      console.log('✅ API key validated successfully');
    } catch (error) {
      console.error('❌ Groq API key validation failed:', error.message);
      console.error('   Please check your GROQ_API_KEY in GitHub secrets');
      return;
    }

    // CRITICAL FIX: Only get pages for companies that exist in the database
    const latestSnapshots = await db.all(`
      WITH valid_companies AS (
        SELECT name FROM intelligence.companies
      )
      SELECT DISTINCT ON (mp.company, mp.url)
        mp.company,
        mp.url,
        mp.content as markdown_text,
        mp.created_at
      FROM processed_content.markdown_pages mp
      INNER JOIN valid_companies vc ON mp.company = vc.name
      WHERE mp.content IS NOT NULL AND LENGTH(mp.content) > 100
      ORDER BY mp.company, mp.url, mp.created_at DESC
    `);

    console.log(`\n📋 Found ${latestSnapshots.length} URLs to analyze`);
    console.log('✅ Only analyzing companies that exist in intelligence.companies\n');

    let processed = 0;
    const startTime = Date.now();

    for (const snapshot of latestSnapshots) {
      processed++;
      const progress = Math.round((processed / latestSnapshots.length) * 100);
      console.log(`[${processed}/${latestSnapshots.length}] (${progress}%) Analyzing ${snapshot.company}`);
      console.log(`   📍 ${snapshot.url}`);

      try {
        // Get company ID
        const company = await db.get(
          'SELECT id, name FROM intelligence.companies WHERE name = $1',
          [snapshot.company]
        );

        if (!company) {
          console.log(`   ⚠️  Skipping - company not in database: ${snapshot.company}`);
          continue;
        }

        // Get URL ID
        const urlRecord = await db.get(
          'SELECT id FROM intelligence.urls WHERE company_id = $1 AND url = $2',
          [company.id, snapshot.url]
        );

        const urlId = urlRecord ? urlRecord.id : null;

        console.log(`   🧠 Extracting intelligence with Groq...`);
        const analysis = await analyzeBaseline(
          snapshot.markdown_text,
          snapshot.company,
          snapshot.url
        );

        // Store baseline analysis with JSONB
        await db.run(`
          INSERT INTO intelligence.baseline_analysis (
            company, url, company_id, company_name, url_id,
            entities, themes, sentiment, key_points, relationships,
            company_type, page_purpose, key_topics, main_message,
            target_audience, unique_value, trust_elements, differentiation,
            technology_stack, analysis_date, content_hash, ai_model
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, NOW(), $20, $21)
          ON CONFLICT (company, url) DO UPDATE SET
            company_id = EXCLUDED.company_id,
            company_name = EXCLUDED.company_name,
            url_id = EXCLUDED.url_id,
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
            analysis_date = EXCLUDED.analysis_date,
            content_hash = EXCLUDED.content_hash,
            ai_model = EXCLUDED.ai_model
        `, [
          snapshot.company,
          snapshot.url,
          company.id,
          company.name,
          urlId,
          JSON.stringify(analysis.entities || {}),
          JSON.stringify(analysis.themes || {}),
          JSON.stringify(analysis.sentiment || {}),
          JSON.stringify(analysis.key_points || {}),
          JSON.stringify(analysis.relationships || []),
          analysis.entities?.company_type || 'Unknown',
          analysis.key_points?.summary || '',
          JSON.stringify(analysis.themes?.technical_focus || []),
          analysis.key_points?.summary || '',
          analysis.sentiment?.market_positioning || '',
          JSON.stringify(analysis.key_points?.unique_value_props || []),
          JSON.stringify(analysis.sentiment?.confidence_indicators || []),
          JSON.stringify(analysis.key_points?.critical_dependencies || []),
          JSON.stringify(analysis.entities?.technologies?.map(t => t.name) || []),
          'content_hash_placeholder',
          'llama-3.3-70b-versatile'
        ]);

        console.log(`   ✅ Baseline analysis stored (Interest: ${analysis.interest_assessment?.interest_level || 'N/A'})`);
        errorTracker.addSuccess();

      } catch (error) {
        console.error(`   ❌ Analysis failed:`, error.message);
        errorTracker.addError(snapshot, error);
        
        if (errorTracker.shouldAbort()) {
          console.error('\n🛑 Too many errors, aborting analysis');
          break;
        }
      }
    }

    // Summary
    const duration = Math.round((Date.now() - startTime) / 1000);
    const report = errorTracker.getReport();
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 Baseline Analysis Complete');
    console.log(`⏱️  Duration: ${Math.floor(duration / 60)}m ${duration % 60}s`);
    console.log(`✅ Successful: ${report.successful}`);
    console.log(`❌ Failed: ${report.failed}`);
    console.log(`📈 Success Rate: ${Math.round((report.successful / report.totalProcessed) * 100)}%`);
    
    if (errorTracker.hasErrors()) {
      console.log('\n⚠️  Errors encountered:');
      report.errors.slice(0, 5).forEach(err => {
        console.log(`   - ${err.site}: ${err.error}`);
      });
      if (report.errors.length > 5) {
        console.log(`   ... and ${report.errors.length - 5} more errors`);
      }
    }

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    errorTracker.addError({ company_name: 'System' }, error, true);
  } finally {
    await end();
  }

  // Exit with error code if critical errors
  if (errorTracker.criticalErrors > 0) {
    process.exit(1);
  }
}

// Run the analysis
runBaselineAnalysis().catch(console.error);
