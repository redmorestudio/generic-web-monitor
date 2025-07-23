#!/usr/bin/env node

// SSL Certificate fix for Heroku PostgreSQL
if (process.env.NODE_ENV === 'production' || process.env.DATABASE_URL || process.env.POSTGRES_CONNECTION_STRING) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

/**
 * Enhanced Baseline Analyzer for PostgreSQL - Rich Entity Extraction
 * 
 * ENHANCEMENTS:
 * 1. Extract detailed entities with source URLs
 * 2. Capture relationships between entities
 * 3. Extract AI/ML concepts and technologies
 * 4. Build knowledge graph data for 3D visualization
 */

const Groq = require('groq-sdk');
const path = require('path');
const fs = require('fs');
const { db, end } = require('./postgres-db');
require('dotenv').config();

// Validate API key
if (!process.env.GROQ_API_KEY) {
  console.error('❌ Error: GROQ_API_KEY environment variable is required');
  process.exit(1);
}

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Enhanced extraction prompt focused on entities and relationships
const ENHANCED_EXTRACTION_PROMPT = `You are an AI competitive intelligence analyst specializing in entity extraction and relationship mapping. Your goal is to extract rich, interconnected data that can be visualized in a knowledge graph.

Analyze this company's web content and extract:

1. **AI/ML Technologies** (CRITICAL - Be very specific):
   - Large Language Models (GPT-4, Claude, Llama, etc.)
   - ML Frameworks (TensorFlow, PyTorch, JAX, etc.)
   - AI Techniques (RAG, fine-tuning, RLHF, etc.)
   - Model architectures (Transformer, CNN, RNN, etc.)
   - AI capabilities (NLP, computer vision, speech, etc.)
   - Performance metrics and benchmarks

2. **Products and Services**:
   - Product names and versions
   - Key features and capabilities
   - Target use cases
   - Pricing tiers and models
   - Integration capabilities
   - Status (GA, beta, preview, deprecated)

3. **Technologies and Infrastructure**:
   - Programming languages used
   - Cloud platforms (AWS, Azure, GCP)
   - Databases and storage systems
   - DevOps and deployment tools
   - APIs and SDKs offered
   - Open source projects

4. **Partnerships and Integrations**:
   - Technology partners
   - Integration partners
   - Channel partners
   - Strategic alliances
   - Ecosystem relationships

5. **Key People**:
   - Founders and executives
   - Technical leaders
   - Notable employees
   - Board members
   - Advisors

6. **Use Cases and Applications**:
   - Industry verticals served
   - Specific use cases
   - Customer segments
   - Success stories
   - Case studies

7. **Concepts and Methodologies**:
   - AI/ML concepts discussed
   - Technical approaches
   - Best practices mentioned
   - Research areas
   - Innovation focus

8. **Competitive Intelligence**:
   - Direct competitors mentioned
   - Indirect competitors
   - Market positioning
   - Differentiators
   - Competitive advantages

For each entity, capture:
- The exact name/term as mentioned
- A brief description
- The context where it appears
- Related entities (what it connects to)
- The type of relationship

Return a JSON object with this structure:
{
  "entities": {
    "ai_technologies": [
      {
        "name": "GPT-4",
        "type": "language_model",
        "vendor": "OpenAI",
        "description": "Large language model with 175B+ parameters",
        "capabilities": ["text generation", "code generation", "reasoning"],
        "mentioned_context": "Used in our AI assistant product",
        "relationships": [
          {"to": "AI Assistant Pro", "type": "powers"},
          {"to": "OpenAI", "type": "created_by"}
        ]
      }
    ],
    "products": [
      {
        "name": "AI Assistant Pro",
        "type": "saas_product",
        "description": "Enterprise AI assistant platform",
        "features": ["chatbot", "document analysis", "workflow automation"],
        "status": "ga",
        "pricing": "$99/month",
        "technologies_used": ["GPT-4", "RAG", "Vector Database"],
        "integrations": ["Slack", "Teams", "Salesforce"],
        "target_market": "enterprise",
        "relationships": [
          {"to": "GPT-4", "type": "uses"},
          {"to": "Slack", "type": "integrates_with"}
        ]
      }
    ],
    "technologies": [
      {
        "name": "Kubernetes",
        "type": "infrastructure",
        "category": "container_orchestration",
        "description": "Container orchestration platform",
        "usage": "Deployment and scaling",
        "relationships": [
          {"to": "AWS EKS", "type": "deployed_on"}
        ]
      }
    ],
    "concepts": [
      {
        "name": "Retrieval Augmented Generation",
        "abbreviation": "RAG",
        "type": "ai_technique",
        "description": "Combining LLMs with external knowledge retrieval",
        "applications": ["question answering", "document search"],
        "benefits": ["reduced hallucination", "up-to-date information"],
        "relationships": [
          {"to": "Vector Database", "type": "requires"},
          {"to": "GPT-4", "type": "enhances"}
        ]
      }
    ],
    "partnerships": [
      {
        "partner": "Microsoft",
        "type": "strategic_partnership",
        "description": "Azure cloud infrastructure partnership",
        "benefits": ["cloud credits", "technical support", "co-marketing"],
        "products_affected": ["AI Assistant Pro"],
        "relationships": [
          {"to": "Azure", "type": "provides"},
          {"to": "AI Assistant Pro", "type": "supports"}
        ]
      }
    ],
    "people": [
      {
        "name": "John Doe",
        "title": "CEO & Founder",
        "background": "Former Google AI researcher",
        "expertise": ["machine learning", "distributed systems"],
        "relationships": [
          {"to": "Company Name", "type": "leads"}
        ]
      }
    ],
    "use_cases": [
      {
        "name": "Customer Support Automation",
        "industry": "SaaS",
        "description": "Automating tier-1 customer support",
        "benefits": ["70% reduction in response time", "24/7 availability"],
        "technologies": ["GPT-4", "RAG", "Sentiment Analysis"],
        "relationships": [
          {"to": "AI Assistant Pro", "type": "enabled_by"}
        ]
      }
    ],
    "competitors": [
      {
        "name": "Anthropic",
        "type": "direct_competitor",
        "competing_products": ["Claude"],
        "market_position": "AI safety focused",
        "relationships": [
          {"to": "Claude", "type": "offers"},
          {"to": "Constitutional AI", "type": "pioneered"}
        ]
      }
    ]
  },
  "entity_stats": {
    "total_entities": 0,
    "ai_technologies": 0,
    "products": 0,
    "technologies": 0,
    "concepts": 0,
    "partnerships": 0,
    "people": 0,
    "use_cases": 0,
    "competitors": 0
  },
  "relationship_stats": {
    "total_relationships": 0,
    "relationship_types": {}
  },
  "extraction_metadata": {
    "company": "",
    "url": "",
    "extraction_date": "",
    "content_length": 0,
    "extraction_quality": "high/medium/low"
  }
}

Be comprehensive and extract ALL entities mentioned. Focus on AI/ML technologies and concepts. Build a rich knowledge graph.`;

async function analyzeWithEnhancedPrompt(content, company, url) {
  const maxRetries = 3;
  const baseDelay = 5000;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are an AI competitive intelligence analyst. Extract entities and relationships for knowledge graph visualization. Always respond with valid JSON only, no markdown formatting."
          },
          {
            role: "user",
            content: `Company: ${company}
URL: ${url}

Content to analyze:
${content}

${ENHANCED_EXTRACTION_PROMPT}`
          }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.1,
        max_tokens: 8000,
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(completion.choices[0].message.content);
      
      // Add metadata
      result.extraction_metadata = {
        company: company,
        url: url,
        extraction_date: new Date().toISOString(),
        content_length: content.length,
        extraction_quality: determineQuality(result)
      };
      
      // Calculate stats
      result.entity_stats = calculateEntityStats(result.entities);
      result.relationship_stats = calculateRelationshipStats(result.entities);
      
      return result;
      
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.log(`   ⚠️  Attempt ${attempt} failed, retrying in ${delay/1000}s...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

function determineQuality(result) {
  const entityCount = Object.values(result.entities || {})
    .reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0);
  
  if (entityCount > 50) return 'high';
  if (entityCount > 20) return 'medium';
  return 'low';
}

function calculateEntityStats(entities) {
  const stats = {
    total_entities: 0,
    ai_technologies: 0,
    products: 0,
    technologies: 0,
    concepts: 0,
    partnerships: 0,
    people: 0,
    use_cases: 0,
    competitors: 0
  };
  
  for (const [type, items] of Object.entries(entities || {})) {
    if (Array.isArray(items)) {
      stats[type] = items.length;
      stats.total_entities += items.length;
    }
  }
  
  return stats;
}

function calculateRelationshipStats(entities) {
  const stats = {
    total_relationships: 0,
    relationship_types: {}
  };
  
  for (const items of Object.values(entities || {})) {
    if (Array.isArray(items)) {
      for (const item of items) {
        if (item.relationships && Array.isArray(item.relationships)) {
          stats.total_relationships += item.relationships.length;
          
          for (const rel of item.relationships) {
            stats.relationship_types[rel.type] = (stats.relationship_types[rel.type] || 0) + 1;
          }
        }
      }
    }
  }
  
  return stats;
}

async function storeEnhancedAnalysis(company, url, extractedData) {
  try {
    // Store in the same baseline_analysis table but with enhanced data
    await db.run(`
      INSERT INTO intelligence.baseline_analysis 
      (company, url, 
       entities, themes, sentiment, key_points, relationships,
       company_type, page_purpose, key_topics, main_message, 
       target_audience, unique_value, trust_elements, differentiation, 
       technology_stack, analysis_date, ai_model)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), $17)
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
        ai_model = EXCLUDED.ai_model
    `, [
      company,
      url,
      JSON.stringify(extractedData.entities || {}), // Rich entity data
      JSON.stringify(extractedData.entity_stats || {}), // Entity statistics
      JSON.stringify(extractedData.relationship_stats || {}), // Relationship stats
      JSON.stringify(extractedData.extraction_metadata || {}), // Metadata
      JSON.stringify(buildRelationshipGraph(extractedData.entities) || []), // Graph data
      extractedData.entities?.products?.[0]?.type || 'AI Company',
      'competitive_intelligence',
      JSON.stringify(extractTopTechnologies(extractedData.entities)),
      generateSummaryMessage(extractedData),
      extractedData.entities?.products?.[0]?.target_market || 'enterprise',
      extractedData.entities?.products?.[0]?.description || '',
      JSON.stringify(extractedData.entities?.concepts || []),
      extractedData.entities?.products?.[0]?.features?.[0] || '',
      JSON.stringify(extractedData.entities?.technologies || []),
      'groq-llama-3.3-70b-enhanced'
    ]);

    console.log(`   ✅ Stored enhanced analysis (${extractedData.entity_stats.total_entities} entities, ${extractedData.relationship_stats.total_relationships} relationships)`);
  } catch (error) {
    console.error(`   ❌ Failed to store enhanced analysis:`, error.message);
    throw error;
  }
}

function buildRelationshipGraph(entities) {
  const relationships = [];
  
  for (const [entityType, items] of Object.entries(entities || {})) {
    if (Array.isArray(items)) {
      for (const item of items) {
        if (item.relationships && Array.isArray(item.relationships)) {
          for (const rel of item.relationships) {
            relationships.push({
              from: item.name,
              from_type: entityType,
              to: rel.to,
              to_type: rel.to_type || 'unknown',
              relationship: rel.type,
              context: rel.context || ''
            });
          }
        }
      }
    }
  }
  
  return relationships;
}

function extractTopTechnologies(entities) {
  const technologies = [];
  
  // Extract AI technologies
  if (entities.ai_technologies) {
    technologies.push(...entities.ai_technologies.map(t => ({
      name: t.name,
      type: 'ai_technology',
      category: t.type
    })));
  }
  
  // Extract general technologies
  if (entities.technologies) {
    technologies.push(...entities.technologies.map(t => ({
      name: t.name,
      type: 'technology',
      category: t.category
    })));
  }
  
  // Extract concepts
  if (entities.concepts) {
    technologies.push(...entities.concepts.map(c => ({
      name: c.name,
      type: 'concept',
      category: c.type
    })));
  }
  
  return technologies;
}

function generateSummaryMessage(extractedData) {
  const productCount = extractedData.entities?.products?.length || 0;
  const techCount = (extractedData.entities?.ai_technologies?.length || 0) + 
                    (extractedData.entities?.technologies?.length || 0);
  const partnerCount = extractedData.entities?.partnerships?.length || 0;
  
  return `Offers ${productCount} products using ${techCount} technologies with ${partnerCount} key partnerships`;
}

async function processAllSnapshots() {
  console.log('🚀 Starting ENHANCED Entity Extraction for PostgreSQL 3D Graph...');
  console.log('🎯 Focus: AI/ML technologies, products, concepts, and relationships');
  console.log('📊 Building rich knowledge graph data\n');

  // Check for --force flag
  const forceReanalyze = process.argv.includes('--force');
  
  try {
    // Check if baseline analysis already exists
    const existingCount = await db.get('SELECT COUNT(*) as count FROM intelligence.baseline_analysis');
    if (existingCount && parseInt(existingCount.count) > 0 && !forceReanalyze) {
      console.log(`⚠️  Found existing baseline analysis (${existingCount.count} records)`);
      console.log('   Use --force flag to re-analyze all content');
      console.log('✅ Skipping duplicate analysis to save API costs');
      return { successful: 0, failed: 0, totalEntities: 0, totalRelationships: 0 };
    }
  } catch (error) {
    console.log('⚠️  Could not check existing analysis:', error.message);
    console.log('   Proceeding with analysis...');
  }
  
  if (forceReanalyze) {
    console.log('🔄 Force flag detected - re-analyzing all content with enhanced extraction');
  }

  // Get all companies and their latest content
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
  const results = {
    successful: 0,
    failed: 0,
    totalEntities: 0,
    totalRelationships: 0
  };

  for (const snapshot of latestSnapshots) {
    processed++;
    const progress = Math.round((processed / latestSnapshots.length) * 100);
    
    console.log(`\n[${processed}/${latestSnapshots.length}] (${progress}%) Analyzing ${snapshot.company}`);
    console.log(`   📍 ${snapshot.url}`);
    
    try {
      // Skip if content is too small
      if (!snapshot.markdown_text || snapshot.markdown_text.length < 100) {
        console.log('   ⚠️  Skipping - content too small');
        continue;
      }

      // Analyze with enhanced prompt
      console.log('   🧠 Extracting entities and relationships...');
      const extractedData = await analyzeWithEnhancedPrompt(
        snapshot.markdown_text.substring(0, 30000),
        snapshot.company,
        snapshot.url
      );

      // Store enhanced analysis
      await storeEnhancedAnalysis(
        snapshot.company,
        snapshot.url,
        extractedData
      );

      // Update statistics
      results.successful++;
      results.totalEntities += extractedData.entity_stats.total_entities;
      results.totalRelationships += extractedData.relationship_stats.total_relationships;
      
      // Log extraction results
      console.log(`   📊 Extracted:`);
      console.log(`      - AI Technologies: ${extractedData.entity_stats.ai_technologies}`);
      console.log(`      - Products: ${extractedData.entity_stats.products}`);
      console.log(`      - Technologies: ${extractedData.entity_stats.technologies}`);
      console.log(`      - Concepts: ${extractedData.entity_stats.concepts}`);
      console.log(`      - Partnerships: ${extractedData.entity_stats.partnerships}`);
      console.log(`      - Relationships: ${extractedData.relationship_stats.total_relationships}`);
      
    } catch (error) {
      console.error(`   ❌ Analysis failed:`, error.message);
      results.failed++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('✅ ENHANCED ENTITY EXTRACTION COMPLETE');
  console.log('='.repeat(50));
  console.log(`📊 Results:`);
  console.log(`   - Successful: ${results.successful}`);
  console.log(`   - Failed: ${results.failed}`);
  console.log(`   - Total Entities: ${results.totalEntities}`);
  console.log(`   - Total Relationships: ${results.totalRelationships}`);
  console.log(`   - Avg Entities/Company: ${Math.round(results.totalEntities / results.successful)}`);
  console.log(`   - Avg Relationships/Company: ${Math.round(results.totalRelationships / results.successful)}`);

  return results;
}

// Export for use in other modules
module.exports = {
  analyzeWithEnhancedPrompt,
  storeEnhancedAnalysis,
  processAllSnapshots
};

// Run if called directly
if (require.main === module) {
  processAllSnapshots()
    .then((results) => {
      console.log('\n✅ Enhanced entity extraction complete!');
      console.log('🎯 Next step: Run generate-static-data-three-db-postgres-fixed.js');
      
      end();
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Extraction failed:', error.message);
      end();
      process.exit(1);
    });
}
