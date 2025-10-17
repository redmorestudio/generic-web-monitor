#!/usr/bin/env node

// Only load dotenv in development (not in GitHub Actions)
if (!process.env.GITHUB_ACTIONS && !process.env.POSTGRES_CONNECTION_STRING) {
  try {
    require('dotenv').config();
  } catch (e) {
    // dotenv not available or no .env file - this is fine
  }
}
const Anthropic = require('@anthropic-ai/sdk');
const Database = require('better-sqlite3');
const path = require('path');

// Configuration
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

class EnhancedAIAnalyzerDirect {
  constructor() {
    this.runId = null;
    this.db = null;
  }

  async initialize() {
    console.log('🤖 Starting Enhanced AI Analyzer (Direct Database Mode)...');
    
    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }
    
    // Open database connection
    const dbPath = path.join(__dirname, 'data', 'monitor.db');
    this.db = new Database(dbPath);
    this.db.pragma('foreign_keys = ON');
    
    // Create monitoring run
    const stmt = this.db.prepare(`
      INSERT INTO monitoring_runs (run_type, status, started_at)
      VALUES ('ai_analysis', 'running', datetime('now'))
    `);
    const result = stmt.run();
    this.runId = result.lastInsertRowid;
  }

  async shutdown() {
    // Update monitoring run status
    if (this.runId && this.db) {
      const stmt = this.db.prepare(`
        UPDATE monitoring_runs 
        SET status = 'completed', completed_at = datetime('now')
        WHERE id = ?
      `);
      stmt.run(this.runId);
    }
    
    if (this.db) {
      this.db.close();
    }
    
    console.log('✅ Enhanced AI Analyzer shutdown complete');
  }

  /**
   * Stage 1: Advanced Entity & Topic Extraction
   */
  async extractEntitiesAndTopics(change, oldSnapshot, newSnapshot) {
    const prompt = `You are an expert competitive intelligence analyst. Analyze this change and extract key entities and topics.

OLD CONTENT:
${oldSnapshot ? oldSnapshot.extracted_content.substring(0, 2000) : '[First snapshot - no previous content]'}

NEW CONTENT:
${newSnapshot.extracted_content.substring(0, 2000)}

Extract and categorize:
1. TECHNOLOGIES: Programming languages, frameworks, platforms, tools
2. COMPANIES: Company names, competitors, partners mentioned
3. MARKETS: Industries, sectors, customer segments
4. PRODUCTS: Product names, features, services
5. PEOPLE: Executives, founders, key personnel
6. TOPICS: Main themes, concepts, initiatives

For each category, list items found with confidence level (HIGH/MEDIUM/LOW).

Respond in this JSON format:
{
  "technologies": [{"name": "...", "confidence": "HIGH", "context": "brief context"}],
  "companies": [{"name": "...", "confidence": "...", "context": "..."}],
  "markets": [{"name": "...", "confidence": "...", "context": "..."}],
  "products": [{"name": "...", "confidence": "...", "context": "..."}],
  "people": [{"name": "...", "role": "...", "confidence": "...", "context": "..."}],
  "topics": [{"name": "...", "confidence": "...", "context": "..."}],
  "key_changes": ["main change 1", "main change 2", "..."]
}`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    });

    try {
      const content = response.content[0].text;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch (error) {
      console.error('Error parsing Stage 1 response:', error);
      return {};
    }
  }

  /**
   * Stage 2: Multi-dimensional Analysis
   */
  async analyzeMultiDimensional(change, entities) {
    const prompt = `As a competitive intelligence expert, analyze the strategic implications of this change.

COMPANY: ${change.company}
URL: ${change.url}
ENTITIES DETECTED: ${JSON.stringify(entities, null, 2)}

Analyze across these dimensions:

1. SENTIMENT ANALYSIS:
   - Overall tone (positive/negative/neutral)
   - Confidence level (aggressive/cautious/balanced)
   - Market positioning (leader/challenger/follower)

2. COMPETITIVE IMPACT:
   - Direct competitive threats
   - Market positioning changes
   - Strategic advantages gained/lost

3. INNOVATION SIGNALS:
   - New capabilities announced
   - Technology adoption
   - R&D focus areas

4. MARKET DYNAMICS:
   - Target audience shifts
   - Pricing strategy changes
   - Geographic expansion

5. STRATEGIC DIRECTION:
   - Business model evolution
   - Partnership strategies
   - Investment priorities

Respond in JSON format:
{
  "sentiment": {
    "overall_tone": "positive/negative/neutral",
    "confidence_level": "aggressive/cautious/balanced",
    "market_positioning": "leader/challenger/follower"
  },
  "competitive_impact": {
    "threat_level": "high/medium/low",
    "key_threats": ["..."],
    "advantages": ["..."]
  },
  "innovation_signals": {
    "new_capabilities": ["..."],
    "tech_adoption": ["..."],
    "rd_focus": ["..."]
  },
  "market_dynamics": {
    "audience_shifts": ["..."],
    "pricing_changes": ["..."],
    "geographic_expansion": ["..."]
  },
  "strategic_direction": {
    "business_model_changes": ["..."],
    "partnerships": ["..."],
    "investment_areas": ["..."]
  }
}`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    });

    try {
      const content = response.content[0].text;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch (error) {
      console.error('Error parsing Stage 2 response:', error);
      return {};
    }
  }

  /**
   * Stage 3: Advanced Categorization
   */
  async categorizeChange(change, entities, analysis) {
    const prompt = `Categorize this competitive intelligence with high precision.

ENTITIES: ${JSON.stringify(entities, null, 2)}
ANALYSIS: ${JSON.stringify(analysis, null, 2)}

Assign to categories with confidence scores (0.0-1.0):

PRIMARY CATEGORIES:
- product_launch: New product or major feature announcement
- pricing_change: Pricing model or cost structure changes
- partnership: Strategic partnerships or integrations
- acquisition: M&A activity or investment rounds
- market_expansion: Geographic or segment expansion
- technology_shift: Major technical architecture changes
- leadership_change: Executive team changes
- competitive_move: Direct competitive actions
- regulatory: Compliance or legal changes
- financial_results: Earnings or financial disclosures
- research_development: R&D breakthroughs or patents
- customer_win: Major customer announcements
- strategic_pivot: Business model changes
- marketing_campaign: Brand or marketing initiatives
- operational_change: Infrastructure or process changes
- security_incident: Data breaches or vulnerabilities
- sustainability: ESG or environmental initiatives
- developer_relations: API or developer ecosystem changes
- content_marketing: Thought leadership or content strategy

Respond in JSON format:
{
  "primary_category": "category_name",
  "primary_confidence": 0.95,
  "secondary_categories": [
    {"category": "...", "confidence": 0.8},
    {"category": "...", "confidence": 0.6}
  ],
  "category_rationale": "Brief explanation of categorization",
  "signals_detected": ["specific signal 1", "specific signal 2"]
}`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }]
    });

    try {
      const content = response.content[0].text;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch (error) {
      console.error('Error parsing Stage 3 response:', error);
      return {};
    }
  }

  /**
   * Stage 4: Executive Summary & Scoring
   */
  async generateExecutiveSummary(change, entities, analysis, categorization) {
    const prompt = `Generate an executive-level competitive intelligence summary with strategic scoring.

COMPANY: ${change.company}
URL: ${change.url}
ENTITIES: ${JSON.stringify(entities, null, 2)}
ANALYSIS: ${JSON.stringify(analysis, null, 2)}
CATEGORIZATION: ${JSON.stringify(categorization, null, 2)}

Provide:

1. EXECUTIVE SUMMARY (2-3 sentences):
   - What happened and why it matters
   - Strategic implications
   - Recommended response

2. STRATEGIC SCORING (1.0-10.0 scale):
   - Overall Relevance: How important is this change to the competitive landscape?
   - Strategic Impact: Long-term effect on market dynamics
   - Urgency: How quickly should we respond?
   - Competitive Threat: Direct threat level to our business
   - Innovation Significance: Breakthrough vs incremental change

3. KEY TAKEAWAYS (3-5 bullet points)

4. RECOMMENDED ACTIONS (2-3 specific steps)

Respond in JSON format:
{
  "executive_summary": "...",
  "scores": {
    "overall_relevance": 8.5,
    "strategic_impact": 7.2,
    "urgency": 6.0,
    "competitive_threat": 8.0,
    "innovation_significance": 5.5
  },
  "score_rationale": {
    "overall_relevance": "Brief explanation",
    "strategic_impact": "...",
    "urgency": "...",
    "competitive_threat": "...",
    "innovation_significance": "..."
  },
  "key_takeaways": ["takeaway 1", "takeaway 2", "..."],
  "recommended_actions": ["action 1", "action 2", "..."],
  "monitoring_priority": "high/medium/low"
}`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    });

    try {
      const content = response.content[0].text;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch (error) {
      console.error('Error parsing Stage 4 response:', error);
      return {};
    }
  }

  /**
   * Process a single change through all stages
   */
  async analyzeChange(change) {
    try {
      console.log(`\n🔍 Analyzing change for ${change.company} - ${change.url}`);
      
      // Get snapshots
      const oldSnapshot = change.old_snapshot_id ? 
        this.db.prepare('SELECT * FROM content_snapshots WHERE id = ?').get(change.old_snapshot_id) : null;
      const newSnapshot = this.db.prepare('SELECT * FROM content_snapshots WHERE id = ?').get(change.new_snapshot_id);
      
      if (!newSnapshot) {
        console.error(`❌ New snapshot not found for change ${change.id}`);
        return null;
      }
      
      // Stage 1: Entity Extraction
      console.log('   📊 Stage 1: Extracting entities and topics...');
      const entities = await this.extractEntitiesAndTopics(change, oldSnapshot, newSnapshot);
      
      // Stage 2: Multi-dimensional Analysis
      console.log('   🔬 Stage 2: Performing multi-dimensional analysis...');
      const analysis = await this.analyzeMultiDimensional(change, entities);
      
      // Stage 3: Categorization
      console.log('   🏷️  Stage 3: Advanced categorization...');
      const categorization = await this.categorizeChange(change, entities, analysis);
      
      // Stage 4: Executive Summary
      console.log('   📋 Stage 4: Generating executive summary...');
      const summary = await this.generateExecutiveSummary(change, entities, analysis, categorization);
      
      // Combine all analysis results
      const fullAnalysis = {
        change_id: change.id,
        company: change.company,
        url: change.url,
        timestamp: new Date().toISOString(),
        entities,
        analysis,
        categorization,
        summary,
        relevance_score: summary.scores?.overall_relevance || 5.0
      };
      
      console.log(`   ✅ Analysis complete! Relevance: ${fullAnalysis.relevance_score}/10`);
      
      // Store analysis in database
      const insertStmt = this.db.prepare(`
        INSERT INTO ai_analysis (
          change_id, relevance_score, summary, category,
          competitive_threats, strategic_opportunities, raw_response, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `);
      
      insertStmt.run(
        change.id,
        Math.round(fullAnalysis.relevance_score),
        fullAnalysis.summary.executive_summary,
        fullAnalysis.categorization.primary_category,
        JSON.stringify(fullAnalysis.analysis.competitive_impact?.key_threats || []),
        JSON.stringify(fullAnalysis.summary.recommended_actions || []),
        JSON.stringify(fullAnalysis)
      );
      
      return fullAnalysis;
      
    } catch (error) {
      console.error(`❌ Error analyzing change ${change.id}:`, error);
      
      // Log error to monitoring run
      if (this.runId && this.db) {
        const errorStmt = this.db.prepare(`
          UPDATE monitoring_runs 
          SET errors = errors || ? || '\n'
          WHERE id = ?
        `);
        errorStmt.run(`Change ${change.id}: ${error.message}`, this.runId);
      }
      
      return null;
    }
  }

  /**
   * Analyze all recent changes
   */
  async analyzeAllChanges() {
    try {
      // Get recent unanalyzed changes
      const changesStmt = this.db.prepare(`
        SELECT c.*, u.url, u.company_id, comp.name as company
        FROM changes c
        JOIN urls u ON c.url_id = u.id
        JOIN companies comp ON u.company_id = comp.id
        LEFT JOIN ai_analysis aa ON c.id = aa.change_id
        WHERE aa.id IS NULL
        ORDER BY c.created_at DESC
        LIMIT 100
      `);
      const changes = changesStmt.all();
      
      console.log(`📊 Found ${changes.length} changes to analyze`);
      
      if (changes.length === 0) {
        console.log('✅ No new changes to analyze');
        return;
      }
      
      const results = [];
      for (const change of changes) {
        const analysis = await this.analyzeChange(change);
        if (analysis) {
          results.push(analysis);
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Update monitoring run with results
      const updateStmt = this.db.prepare(`
        UPDATE monitoring_runs 
        SET changes_detected = ?
        WHERE id = ?
      `);
      updateStmt.run(results.length, this.runId);
      
      console.log(`\n✅ Enhanced AI analysis complete! Analyzed ${results.length} changes`);
      
      // Show summary of high-relevance changes
      const highRelevance = results.filter(r => r.relevance_score >= 7);
      if (highRelevance.length > 0) {
        console.log('\n🔴 High relevance changes detected:');
        highRelevance.forEach(change => {
          console.log(`   - ${change.company}: ${change.summary.executive_summary}`);
          console.log(`     Score: ${change.relevance_score}/10 | Category: ${change.categorization.primary_category}`);
        });
      }
      
    } catch (error) {
      console.error('❌ Error in analyzeAllChanges:', error);
      
      // Log error to monitoring run
      if (this.runId && this.db) {
        const errorStmt = this.db.prepare(`
          UPDATE monitoring_runs 
          SET errors = ?, status = 'failed'
          WHERE id = ?
        `);
        errorStmt.run(error.message, this.runId);
      }
      
      throw error;
    }
  }

  /**
   * Generate executive brief
   */
  async generateExecutiveBrief() {
    try {
      console.log('\n📋 Generating Executive Brief...');
      
      // Get high-relevance analyzed changes from the last 7 days
      const briefStmt = this.db.prepare(`
        SELECT 
          c.*, 
          aa.relevance_score,
          aa.summary,
          aa.category,
          aa.raw_response,
          u.url,
          comp.name as company
        FROM changes c
        JOIN ai_analysis aa ON c.id = aa.change_id
        JOIN urls u ON c.url_id = u.id
        JOIN companies comp ON u.company_id = comp.id
        WHERE aa.relevance_score >= 6
          AND c.created_at > datetime('now', '-7 days')
        ORDER BY aa.relevance_score DESC, c.created_at DESC
        LIMIT 20
      `);
      const relevantChanges = briefStmt.all();
      
      if (relevantChanges.length === 0) {
        console.log('📭 No high-relevance changes in the past 7 days');
        return;
      }
      
      // Parse the raw responses to get full analysis
      const changesWithAnalysis = relevantChanges.map(change => {
        try {
          const fullAnalysis = JSON.parse(change.raw_response);
          return {
            company: change.company,
            url: change.url,
            summary: fullAnalysis.summary.executive_summary,
            category: change.category,
            relevance: change.relevance_score,
            scores: fullAnalysis.summary.scores,
            takeaways: fullAnalysis.summary.key_takeaways,
            actions: fullAnalysis.summary.recommended_actions
          };
        } catch (e) {
          return null;
        }
      }).filter(Boolean);
      
      const briefPrompt = `Generate an executive intelligence brief summarizing these competitive changes:

${JSON.stringify(changesWithAnalysis, null, 2)}

Create a concise brief with:
1. EXECUTIVE SUMMARY (2-3 paragraphs): Overall competitive landscape shifts
2. KEY DEVELOPMENTS (grouped by theme): Major changes organized by strategic importance
3. COMPETITIVE THREATS: Top 3-5 threats requiring attention
4. STRATEGIC OPPORTUNITIES: Top 3-5 opportunities to pursue
5. RECOMMENDED ACTIONS: Prioritized list of strategic responses

Format for maximum executive impact and clarity.`;

      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 3000,
        messages: [{ role: 'user', content: briefPrompt }]
      });

      const brief = response.content[0].text;
      
      console.log('\n' + '='.repeat(60));
      console.log('EXECUTIVE INTELLIGENCE BRIEF');
      console.log('Generated:', new Date().toISOString());
      console.log('='.repeat(60));
      console.log(brief);
      console.log('='.repeat(60));
      
      // Store brief (you could save this to a file or database)
      const briefData = {
        generated_at: new Date().toISOString(),
        change_count: relevantChanges.length,
        content: brief
      };
      
      // Optionally save to file
      const fs = require('fs');
      const briefPath = path.join(__dirname, 'data', `executive-brief-${new Date().toISOString().split('T')[0]}.json`);
      fs.writeFileSync(briefPath, JSON.stringify(briefData, null, 2));
      
      console.log(`\n✅ Executive brief saved to: ${briefPath}`);
      
    } catch (error) {
      console.error('❌ Error generating executive brief:', error);
    }
  }
}

// Main execution
async function main() {
  const analyzer = new EnhancedAIAnalyzerDirect();
  
  try {
    await analyzer.initialize();
    
    const command = process.argv[2] || 'analyze';
    
    switch (command) {
      case 'analyze':
        await analyzer.analyzeAllChanges();
        break;
        
      case 'brief':
        await analyzer.generateExecutiveBrief();
        break;
        
      case 'both':
        await analyzer.analyzeAllChanges();
        await analyzer.generateExecutiveBrief();
        break;
        
      default:
        console.log('Unknown command:', command);
        console.log('Usage: node ai-analyzer-enhanced-direct.js [analyze|brief|both]');
        process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await analyzer.shutdown();
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = EnhancedAIAnalyzerDirect;
