const Anthropic = require('@anthropic-ai/sdk');
const path = require('path');
const fs = require('fs');
const dbManager = require('./db-manager');
require('dotenv').config();

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Baseline extraction prompt
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
      "targets_markets": []
    }],
    "technologies": [{
      "name": "", 
      "category": "", 
      "purpose": "",
      "implemented_by": [],
      "enables_capabilities": []
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
      "products_affected": []
    }],
    "people": [{
      "name": "", 
      "title": "", 
      "role": "ceo/cto/founder/executive",
      "relationship": "leads/employs"
    }],
    "pricing": [{
      "tier": "", 
      "price": "", 
      "features": [],
      "includes_products": [],
      "limitations": []
    }],
    "markets": [{
      "segment": "", 
      "geography": "", 
      "size": "",
      "targeted_by_products": []
    }],
    "competitors": [{
      "company": "",
      "compete_in": [],
      "our_advantages": [],
      "their_advantages": []
    }]
  },
  "relationships": [
    {"from": "", "to": "", "type": "owns/implements/integrates_with/competes_with/partners_with/uses/provides/targets/employs/leads/depends_on", "context": ""}
  ],
  "capabilities": {
    "integration_capabilities": [],
    "technical_capabilities": [],
    "business_capabilities": []
  },
  "current_state": {
    "positioning": "",
    "value_props": [],
    "core_capabilities": [],
    "business_focus": [],
    "competitive_advantages": []
  },
  "strategic_intelligence": {
    "innovation_level": 0,
    "growth_indicators": [],
    "market_opportunities": [],
    "threat_assessment": {
      "level": 0,
      "areas": [],
      "implications": []
    }
  },
  "quantitative_data": {
    "metrics": [{"name": "", "value": "", "context": ""}],
    "claims": []
  },
  "summary": {
    "one_line": "",
    "key_insights": [],
    "notable_facts": []
  }
}`;

async function analyzeContent(content, company, url, timestamp) {
  try {
    const prompt = `${BASELINE_EXTRACTION_PROMPT}

Company: ${company.name} (${company.type})
URL: ${url.url} (${url.type})
Snapshot Date: ${timestamp}

CURRENT CONTENT:
${content.substring(0, 5000)}

Analyze this company's current state and provide comprehensive extraction following the specified JSON structure.`;

    console.log(`🧠 Analyzing ${company.name} - ${url.type} with Claude Sonnet 4...`);
    
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      temperature: 0.3,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const responseContent = response.content[0].text;
    
    // Parse JSON response
    let extractedData;
    try {
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return null;
    }

    return extractedData;
  } catch (error) {
    console.error('Baseline extraction error:', error);
    return null;
  }
}

async function storeBaselineAnalysis(intelligenceDb, contentId, company, url, extractedData) {
  try {
    const relevanceScore = extractedData.strategic_intelligence?.threat_assessment?.level || 5;
    const summary = extractedData.summary?.one_line || 
      `${company.name}: ${extractedData.current_state?.positioning || 'AI company'}`;

    // Create baseline_analysis table if not exists
    intelligenceDb.exec(`
      CREATE TABLE IF NOT EXISTS baseline_analysis (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_id INTEGER,
        url_id INTEGER,
        content_id INTEGER UNIQUE,
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

    const stmt = intelligenceDb.prepare(`
      INSERT OR REPLACE INTO baseline_analysis 
      (company_id, url_id, content_id, entities, relationships, semantic_categories, 
       competitive_data, smart_groups, quantitative_data, extracted_text, 
       full_extraction, summary, relevance_score)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      company.id,
      url.id,
      contentId,
      JSON.stringify(extractedData.entities || {}),
      JSON.stringify(extractedData.relationships || []),
      JSON.stringify(extractedData.current_state || {}),
      JSON.stringify(extractedData.strategic_intelligence || {}),
      JSON.stringify(extractedData.smart_groups || {}),
      JSON.stringify(extractedData.quantitative_data || {}),
      JSON.stringify(extractedData.summary || {}),
      JSON.stringify(extractedData),
      summary,
      relevanceScore
    );

    console.log(`✅ Stored baseline analysis for ${company.name} - ${url.type}`);
    return true;
  } catch (error) {
    console.error('Error storing baseline analysis:', error);
    return false;
  }
}

async function processAllSnapshots() {
  console.log('🚀 Starting BASELINE AI Analysis (Three-Database Architecture)...');
  console.log('📊 This will analyze ALL companies\' current state, not just changes\n');

  // Get database connections
  const processedDb = dbManager.getProcessedDb();
  const intelligenceDb = dbManager.getIntelligenceDb();

  // Check command line arguments
  const onlyNew = process.argv.includes('--only-new');
  const force = process.argv.includes('--force');
  
  console.log(`Mode: ${force ? 'FORCE (re-analyze all)' : onlyNew ? 'ONLY NEW (skip analyzed)' : 'ALL'}\n`);

  // Get the most recent processed content for each URL
  let query = `
    SELECT mc.*, u.id as url_id, u.url, u.type as url_type, 
           c.id as company_id, c.name as company_name, c.type as company_type
    FROM markdown_content mc
    JOIN urls u ON mc.url_id = u.id
    JOIN companies c ON u.company_id = c.id
    WHERE mc.id IN (
      SELECT MAX(id) 
      FROM markdown_content 
      GROUP BY url_id
    )
    AND mc.markdown_content IS NOT NULL
    AND LENGTH(mc.markdown_content) > 100
  `;

  // For only-new mode, we need to check the intelligence database separately
  const latestContent = processedDb.prepare(query).all();
  
  let contentToAnalyze = latestContent;
  
  if (onlyNew && !force) {
    // Filter out already analyzed content
    const analyzedContentIds = intelligenceDb.prepare(`
      SELECT content_id FROM baseline_analysis
    `).all().map(row => row.content_id);
    
    contentToAnalyze = latestContent.filter(content => 
      !analyzedContentIds.includes(content.id)
    );
  }
  
  console.log(`Found ${contentToAnalyze.length} URLs to analyze for baseline intelligence\n`);

  let successCount = 0;
  let errorCount = 0;

  // Process in batches of 10 to avoid overwhelming the API
  const batchSize = 10;
  const batches = [];
  for (let i = 0; i < contentToAnalyze.length; i += batchSize) {
    batches.push(contentToAnalyze.slice(i, i + batchSize));
  }

  console.log(`Processing ${batches.length} batches of up to ${batchSize} URLs each...\n`);

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    console.log(`\n📦 Batch ${batchIndex + 1}/${batches.length} (${batch.length} URLs)`);
    
    // Process batch in parallel
    const batchPromises = batch.map(async (content) => {
      const company = {
        id: content.company_id,
        name: content.company_name,
        type: content.company_type
      };
      
      const url = {
        id: content.url_id,
        url: content.url,
        type: content.url_type
      };

      try {
        const extractedData = await analyzeContent(
          content.markdown_content, 
          company, 
          url, 
          content.processed_at
        );
        
        if (extractedData) {
          const stored = await storeBaselineAnalysis(
            intelligenceDb, 
            content.id, 
            company, 
            url, 
            extractedData
          );
          if (stored) {
            console.log(`  ✓ ${company.name} - ${url.type}`);
            return { success: true };
          }
        }
        return { success: false };
      } catch (error) {
        console.error(`  ✗ ${company.name} - ${url.type}: ${error.message}`);
        return { success: false };
      }
    });

    const results = await Promise.all(batchPromises);
    successCount += results.filter(r => r.success).length;
    errorCount += results.filter(r => !r.success).length;

    // Only add delay between batches, not individual URLs
    if (batchIndex < batches.length - 1) {
      console.log(`  ⏳ Waiting 3 seconds before next batch...`);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  // Generate summary report
  const report = generateBaselineReport(intelligenceDb);
  
  console.log('\n📊 Baseline Analysis Complete!');
  console.log(`✅ Success: ${successCount} URLs`);
  console.log(`❌ Errors: ${errorCount} URLs`);
  console.log('\n🔍 Top Insights:');
  console.log(report.summary);

  return report;
}

function generateBaselineReport(intelligenceDb) {
  const analyses = intelligenceDb.prepare(`
    SELECT ba.*, c.name as company_name, c.type as company_type,
           u.url, u.type as url_type
    FROM baseline_analysis ba
    JOIN companies c ON ba.company_id = c.id
    JOIN urls u ON ba.url_id = u.id
    ORDER BY ba.relevance_score DESC
  `).all();

  const report = {
    timestamp: new Date().toISOString(),
    total_companies: new Set(),
    total_products: 0,
    total_technologies: 0,
    high_threat_companies: [],
    key_insights: [],
    technology_landscape: {},
    competitive_landscape: {}
  };

  for (const analysis of analyses) {
    try {
      const entities = JSON.parse(analysis.entities);
      const strategic = JSON.parse(analysis.competitive_data);
      
      report.total_companies.add(analysis.company_name);
      
      if (entities.products) {
        report.total_products += entities.products.length;
      }
      
      if (entities.technologies) {
        report.total_technologies += entities.technologies.length;
        entities.technologies.forEach(tech => {
          report.technology_landscape[tech.category] = 
            (report.technology_landscape[tech.category] || 0) + 1;
        });
      }
      
      if (strategic.threat_assessment?.level >= 8) {
        report.high_threat_companies.push({
          company: analysis.company_name,
          threat_level: strategic.threat_assessment.level,
          areas: strategic.threat_assessment.areas
        });
      }
    } catch (e) {
      // Skip invalid entries
    }
  }

  report.total_companies = report.total_companies.size;
  report.summary = `Analyzed ${report.total_companies} companies, found ${report.total_products} products and ${report.total_technologies} technologies. ${report.high_threat_companies.length} high-priority competitive threats identified.`;

  // Save report
  const reportPath = path.join(__dirname, 'data', 'baseline-intelligence-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  return report;
}

// Export for use in other modules
module.exports = {
  analyzeContent,
  storeBaselineAnalysis,
  processAllSnapshots,
  generateBaselineReport
};

// Run if called directly
if (require.main === module) {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ Error: ANTHROPIC_API_KEY environment variable is required');
    console.error('Please add it to your .env file');
    process.exit(1);
  }

  processAllSnapshots()
    .then((report) => {
      console.log('\n✅ Baseline intelligence analysis complete!');
      console.log('📍 Report saved to: data/baseline-intelligence-report.json');
      console.log('\n🎯 Next step: Run TheBrain sync to visualize all this intelligence');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Analysis failed:', error);
      process.exit(1);
    });
}
