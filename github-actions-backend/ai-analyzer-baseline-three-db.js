const Anthropic = require('@anthropic-ai/sdk');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Three-database architecture
const dataDir = path.join(__dirname, 'data');
const rawDb = new Database(path.join(dataDir, 'raw_content.db'));
const processedDb = new Database(path.join(dataDir, 'processed_content.db'));
const intelligenceDb = new Database(path.join(dataDir, 'intelligence.db'));

// Attach databases for cross-database queries
intelligenceDb.exec(`ATTACH DATABASE '${path.join(dataDir, 'processed_content.db')}' AS processed`);
intelligenceDb.exec(`ATTACH DATABASE '${path.join(dataDir, 'raw_content.db')}' AS raw`);

// Create baseline_analysis table in intelligence.db
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

// Timeout wrapper for AI analysis
async function analyzeWithTimeout(snapshot, company, url, timeoutMs = 30000) {
  return Promise.race([
    analyzeSnapshot(snapshot, company, url),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error(`Timeout analyzing ${company.name} after ${timeoutMs/1000}s`)), timeoutMs)
    )
  ]);
}

async function analyzeSnapshot(snapshot, company, url) {
  try {
    const prompt = `${BASELINE_EXTRACTION_PROMPT}

Company: ${company.name} (${company.category})
URL: ${url.url} (${url.url_type})
Snapshot Date: ${new Date(snapshot.processed_at).toISOString()}

CURRENT CONTENT:
${snapshot.markdown_text.substring(0, 5000)}

Analyze this company's current state and provide comprehensive extraction following the specified JSON structure.`;

    console.log(`🧠 Analyzing ${company.name} - ${url.url_type} with Claude Sonnet 4...`);
    
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
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
      const jsonMatch = content.match(/\{[\s\S]*\}/);
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
      JSON.stringify(extractedData.current_state || {}),
      JSON.stringify(extractedData.strategic_intelligence || {}),
      JSON.stringify(extractedData.smart_groups || {}),
      JSON.stringify(extractedData.quantitative_data || {}),
      JSON.stringify(extractedData.summary || {}),
      JSON.stringify(extractedData),
      summary,
      relevanceScore
    );

    console.log(`✅ Stored baseline analysis for ${company.name} - ${url.url_type}`);
    return true;
  } catch (error) {
    console.error('Error storing baseline analysis:', error);
    return false;
  }
}

// Process with retry logic
async function processSnapshotWithRetry(snapshot, company, url, maxRetries = 2, timeoutMs = 30000) {
  for (let retry = 0; retry <= maxRetries; retry++) {
    try {
      console.log(`  🔄 Processing ${company.name} - ${url.url_type} (attempt ${retry + 1}/${maxRetries + 1})`);
      
      const extractedData = await analyzeWithTimeout(snapshot, company, url, timeoutMs);
      if (extractedData) {
        const stored = await storeBaselineAnalysis(snapshot, company, url, extractedData);
        if (stored) {
          console.log(`  ✓ ${company.name} - ${url.url_type} succeeded`);
          return { success: true, company: company.name, url_type: url.url_type };
        }
      }
      throw new Error('Failed to extract or store data');
    } catch (error) {
      if (retry === maxRetries) {
        console.error(`  ✗ ${company.name} - ${url.url_type} failed after ${maxRetries + 1} attempts: ${error.message}`);
        return { success: false, company: company.name, url_type: url.url_type, error: error.message };
      }
      console.log(`  ⚠️ Retry ${retry + 1} for ${company.name} - ${url.url_type}: ${error.message}`);
      // Wait 2 seconds before retry
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

async function processAllSnapshots() {
  console.log('🚀 Starting BASELINE AI Analysis for Three-Database Architecture...');
  console.log('📊 This will analyze ALL companies\' current state');
  console.log('⏱️  Implemented with timeout protection and retry logic\n');

  // Track failed sites for reporting
  const failedSites = [];

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
    AND mc.markdown_text IS NOT NULL
    AND LENGTH(mc.markdown_text) > 100
    ORDER BY c.name, u.url_type
  `).all();

  console.log(`Found ${latestSnapshots.length} URLs to analyze for baseline intelligence\n`);

  let successCount = 0;
  let errorCount = 0;

  // Process in smaller batches to reduce concurrent load
  const batchSize = 5; // Reduced from 10
  const batches = [];
  for (let i = 0; i < latestSnapshots.length; i += batchSize) {
    batches.push(latestSnapshots.slice(i, i + batchSize));
  }

  console.log(`Processing ${batches.length} batches of up to ${batchSize} URLs each...`);
  console.log(`Timeout protection: 30s per URL, 2 retries\n`);

  const startTime = Date.now();

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    const batchStartTime = Date.now();
    
    console.log(`\n📦 Batch ${batchIndex + 1}/${batches.length} (${batch.length} URLs)`);
    
    // Process batch in parallel with timeout protection
    const batchPromises = batch.map(async (snapshot) => {
      const company = {
        id: snapshot.company_id,
        name: snapshot.company_name,
        category: snapshot.company_type
      };
      
      const url = {
        id: snapshot.url_id,
        url: snapshot.url,
        url_type: snapshot.url_type
      };

      return processSnapshotWithRetry(snapshot, company, url);
    });

    const results = await Promise.all(batchPromises);
    
    // Track results
    results.forEach(result => {
      if (result.success) {
        successCount++;
      } else {
        errorCount++;
        failedSites.push(result);
      }
    });

    const batchTime = ((Date.now() - batchStartTime) / 1000).toFixed(1);
    console.log(`  ⏱️  Batch completed in ${batchTime}s`);

    // NO DELAY between batches - removed the 3-second wait
    if (batchIndex < batches.length - 1) {
      const progress = Math.round(((batchIndex + 1) / batches.length) * 100);
      console.log(`  📊 Progress: ${progress}% complete`);
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);

  // Generate summary report
  const report = generateBaselineReport();
  
  console.log('\n📊 Baseline Analysis Complete!');
  console.log(`✅ Success: ${successCount} URLs`);
  console.log(`❌ Errors: ${errorCount} URLs`);
  console.log(`⏱️  Total time: ${totalTime}s`);
  
  if (failedSites.length > 0) {
    console.log('\n❌ Failed sites:');
    failedSites.forEach(site => {
      console.log(`  - ${site.company} (${site.url_type}): ${site.error}`);
    });
  }
  
  console.log('\n🔍 Top Insights:');
  console.log(report.summary);

  return report;
}

function generateBaselineReport() {
  const analyses = intelligenceDb.prepare(`
    SELECT ba.*, c.name as company_name, c.category as company_type,
           u.url, u.url_type
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
  analyzeSnapshot,
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
      
      // Clean up database connections
      intelligenceDb.exec('DETACH DATABASE processed');
      intelligenceDb.exec('DETACH DATABASE raw');
      intelligenceDb.close();
      processedDb.close();
      rawDb.close();
      
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Analysis failed:', error);
      process.exit(1);
    });
}
