#!/usr/bin/env node

require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const axios = require('axios');
const diff = require('diff');

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:3000/api';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!ANTHROPIC_API_KEY) {
  console.error('❌ ANTHROPIC_API_KEY environment variable is required');
  process.exit(1);
}

const anthropic = new Anthropic({
  apiKey: ANTHROPIC_API_KEY,
});

class EnhancedAIAnalyzer {
  constructor() {
    this.runId = null;
    this.analysisCache = new Map();
  }

  async initialize() {
    console.log('🤖 Starting Enhanced AI Analyzer...');
    
    // Create monitoring run
    const runResponse = await axios.post(`${API_URL}/monitoring-runs`, {
      run_type: 'enhanced_ai_analysis',
      status: 'running'
    }).catch(() => ({ data: { id: Date.now() } }));
    
    this.runId = runResponse.data.id;
  }

  async shutdown() {
    // Update monitoring run status
    if (this.runId) {
      await axios.put(`${API_URL}/monitoring-runs/${this.runId}`, {
        status: 'completed',
        completed_at: new Date().toISOString()
      }).catch(() => {});
    }
    
    console.log('✅ Enhanced AI Analyzer shutdown complete');
  }

  /**
   * Stage 1: Advanced Topic Extraction and Entity Recognition
   */
  async extractTopicsAndEntities(content, context) {
    const prompt = `You are an expert competitive intelligence analyst. Extract key topics, entities, and strategic information from this content change.

CONTEXT:
Company: ${context.company_name}
URL: ${context.url}
Page Type: ${context.url_type}
Change Magnitude: ${context.change_percentage?.toFixed(1)}%

CONTENT TO ANALYZE:
${content.substring(0, 3000)}

Extract and analyze the following in JSON format:
{
  "topics": {
    "primary_topics": ["list of 3-5 main topics"],
    "technology_mentions": ["specific technologies, frameworks, tools"],
    "product_mentions": ["specific products or services"],
    "business_concepts": ["business strategy, market positioning concepts"]
  },
  "entities": {
    "competitors": ["direct and indirect competitors mentioned"],
    "partners": ["partnerships, integrations, collaborations"],
    "technologies": ["technical platforms, standards, protocols"],
    "markets": ["target markets, customer segments, industries"],
    "executives": ["leadership mentions, quotes, appointments"]
  },
  "strategic_signals": {
    "market_positioning": "how is the company positioning itself",
    "competitive_strategy": "what competitive strategy is evident",
    "innovation_focus": "what areas of innovation are highlighted",
    "customer_focus": "what customer needs or segments are targeted"
  },
  "content_metadata": {
    "tone": "professional|marketing|technical|executive|casual",
    "urgency": "high|medium|low",
    "audience": "customers|investors|developers|partners|general",
    "content_depth": "announcement|detailed_explanation|brief_mention|comprehensive_guide"
  }
}

Focus on competitive intelligence value - what strategic information can be gleaned?`;

    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        temperature: 0.2,
        messages: [{ role: 'user', content: prompt }]
      });

      const responseText = response.content[0].text;
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No JSON found in topic extraction response');
    } catch (error) {
      console.error('❌ Topic extraction failed:', error.message);
      return {
        topics: { primary_topics: [], technology_mentions: [], product_mentions: [], business_concepts: [] },
        entities: { competitors: [], partners: [], technologies: [], markets: [], executives: [] },
        strategic_signals: {},
        content_metadata: {}
      };
    }
  }

  /**
   * Stage 2: Sentiment Analysis and Competitive Impact
   */
  async analyzeSentimentAndImpact(content, topics, context) {
    const prompt = `You are a competitive intelligence expert analyzing the sentiment and competitive impact of a content change.

CONTEXT:
Company: ${context.company_name}
Topics Found: ${topics.topics.primary_topics.join(', ')}
Competitors Mentioned: ${topics.entities.competitors.join(', ')}
Technologies: ${topics.entities.technologies.join(', ')}

CONTENT CHANGE:
${content.substring(0, 2500)}

Analyze the sentiment and competitive implications in JSON format:
{
  "sentiment_analysis": {
    "overall_sentiment": "very_positive|positive|neutral|negative|very_negative",
    "confidence_tone": "confident|uncertain|defensive|aggressive|collaborative",
    "market_sentiment": "bullish|optimistic|neutral|cautious|bearish",
    "competitive_tone": "competitive|collaborative|dismissive|respectful|aggressive"
  },
  "competitive_impact": {
    "immediate_threats": ["specific immediate competitive threats"],
    "long_term_implications": ["strategic long-term implications"],
    "market_disruption_potential": "high|medium|low",
    "customer_acquisition_impact": "positive|neutral|negative",
    "pricing_pressure_indicators": ["signs of pricing strategy changes"],
    "differentiation_signals": ["how they're trying to differentiate"]
  },
  "strategic_significance": {
    "innovation_leadership": "leading|following|catching_up|falling_behind",
    "market_expansion": "expanding|maintaining|contracting|pivoting",
    "investment_signals": ["signs of where they're investing resources"],
    "partnership_strategy": ["partnership and ecosystem strategy indicators"]
  },
  "urgency_indicators": {
    "time_sensitive_actions": ["actions that suggest urgency"],
    "competitive_response_needed": "immediate|short_term|long_term|monitoring",
    "market_window_signals": ["signs of market timing or windows"]
  }
}

Focus on actionable competitive intelligence and strategic implications.`;

    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        temperature: 0.3,
        messages: [{ role: 'user', content: prompt }]
      });

      const responseText = response.content[0].text;
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No JSON found in sentiment analysis response');
    } catch (error) {
      console.error('❌ Sentiment analysis failed:', error.message);
      return {
        sentiment_analysis: {},
        competitive_impact: {},
        strategic_significance: {},
        urgency_indicators: {}
      };
    }
  }

  /**
   * Stage 3: Advanced Change Categorization
   */
  async categorizeChange(content, topics, sentiment, context) {
    const prompt = `You are an expert at categorizing competitive intelligence changes. Analyze this change and provide detailed categorization.

CONTEXT:
Company: ${context.company_name}
Primary Topics: ${topics.topics.primary_topics.join(', ')}
Overall Sentiment: ${sentiment.sentiment_analysis.overall_sentiment}
Competitive Tone: ${sentiment.sentiment_analysis.competitive_tone}

CONTENT:
${content.substring(0, 2000)}

Categorize this change with confidence scores in JSON format:
{
  "primary_category": {
    "category": "one of: product_launch|feature_update|pricing_change|partnership_announcement|acquisition|funding|executive_change|strategy_pivot|market_expansion|technology_adoption|competitive_response|marketing_campaign|regulatory_compliance|financial_results|research_publication|event_announcement|policy_change|infrastructure_update|service_expansion|other",
    "confidence": 0.95,
    "reasoning": "why this category was chosen"
  },
  "secondary_categories": [
    {
      "category": "additional relevant category",
      "confidence": 0.75,
      "reasoning": "why this is also relevant"
    }
  ],
  "change_characteristics": {
    "scope": "internal|customer_facing|market_wide|industry_wide",
    "timeline": "immediate|short_term|long_term|ongoing",
    "reversibility": "reversible|partially_reversible|irreversible",
    "strategic_importance": "tactical|operational|strategic|transformational",
    "public_visibility": "internal|limited|public|high_profile"
  },
  "change_triggers": {
    "likely_triggers": ["competitive_pressure|customer_demand|technology_advancement|regulatory_change|market_opportunity|internal_initiative|external_partnership"],
    "reactive_vs_proactive": "reactive|proactive|mixed",
    "market_timing": "early|optimal|late|defensive"
  },
  "impact_dimensions": {
    "customer_impact": "high|medium|low",
    "revenue_impact": "positive|neutral|negative|unknown",
    "competitive_impact": "advantage|parity|disadvantage|neutral",
    "innovation_impact": "breakthrough|incremental|maintenance|regression"
  }
}

Be precise and provide high-confidence categorizations with clear reasoning.`;

    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        temperature: 0.1,
        messages: [{ role: 'user', content: prompt }]
      });

      const responseText = response.content[0].text;
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No JSON found in categorization response');
    } catch (error) {
      console.error('❌ Change categorization failed:', error.message);
      return {
        primary_category: { category: 'other', confidence: 0.5, reasoning: 'Analysis failed' },
        secondary_categories: [],
        change_characteristics: {},
        change_triggers: {},
        impact_dimensions: {}
      };
    }
  }

  /**
   * Stage 4: Executive Summary and Strategic Assessment
   */
  async generateExecutiveSummary(content, topics, sentiment, categorization, context) {
    const prompt = `You are writing an executive brief for senior leadership about this competitive intelligence change.

CONTEXT:
Company: ${context.company_name}
Category: ${categorization.primary_category.category}
Strategic Importance: ${categorization.change_characteristics.strategic_importance}
Competitive Impact: ${sentiment.competitive_impact.market_disruption_potential}
Urgency: ${sentiment.urgency_indicators.competitive_response_needed}

ANALYSIS SUMMARY:
Topics: ${topics.topics.primary_topics.join(', ')}
Entities: ${Object.values(topics.entities).flat().slice(0, 10).join(', ')}
Sentiment: ${sentiment.sentiment_analysis.overall_sentiment}

Provide an executive summary in JSON format:
{
  "executive_summary": {
    "headline": "One sentence describing what happened",
    "strategic_summary": "2-3 sentences on strategic implications",
    "competitive_threat_level": "critical|high|medium|low|minimal",
    "recommended_actions": ["specific actions we should consider"],
    "monitoring_priorities": ["what to watch for next"],
    "timeline_for_response": "immediate|1-2_weeks|1-3_months|ongoing_monitoring"
  },
  "intelligence_assessment": {
    "reliability": "high|medium|low",
    "completeness": "comprehensive|partial|limited",
    "strategic_value": "critical|high|medium|low",
    "confidence_level": "high|medium|low",
    "information_gaps": ["what additional information is needed"]
  },
  "scoring": {
    "overall_relevance": 8.5,
    "strategic_impact": 7.2,
    "urgency": 6.8,
    "competitive_threat": 7.5,
    "innovation_significance": 6.3
  },
  "key_insights": [
    "Top 3-5 insights that senior leadership needs to know"
  ],
  "competitive_implications": {
    "for_our_strategy": "how this affects our strategy",
    "for_our_products": "impact on our products/services",
    "for_our_market_position": "impact on market positioning",
    "for_our_customers": "potential customer impact"
  }
}

All scores should be 1.0-10.0 with one decimal place. Focus on actionable intelligence.`;

    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2500,
        temperature: 0.4,
        messages: [{ role: 'user', content: prompt }]
      });

      const responseText = response.content[0].text;
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No JSON found in executive summary response');
    } catch (error) {
      console.error('❌ Executive summary generation failed:', error.message);
      return {
        executive_summary: {
          headline: 'Analysis failed',
          strategic_summary: 'Unable to generate strategic assessment',
          competitive_threat_level: 'medium',
          recommended_actions: [],
          monitoring_priorities: [],
          timeline_for_response: 'ongoing_monitoring'
        },
        intelligence_assessment: {
          reliability: 'low',
          completeness: 'limited',
          strategic_value: 'low',
          confidence_level: 'low',
          information_gaps: ['Analysis system error']
        },
        scoring: {
          overall_relevance: 5.0,
          strategic_impact: 5.0,
          urgency: 5.0,
          competitive_threat: 5.0,
          innovation_significance: 5.0
        },
        key_insights: ['Analysis system encountered an error'],
        competitive_implications: {}
      };
    }
  }

  /**
   * Main analysis pipeline - runs all stages
   */
  async analyzeChange(change) {
    console.log(`\n🔬 Starting enhanced analysis for ${change.company_name} - ${change.url}`);
    
    try {
      // Get full content for both snapshots
      const oldSnapshotResponse = change.old_snapshot_id ? 
        await axios.get(`${API_URL}/content-snapshots/${change.old_snapshot_id}`) : null;
      const newSnapshotResponse = await axios.get(`${API_URL}/content-snapshots/${change.new_snapshot_id}`);
      
      const oldContent = oldSnapshotResponse?.data?.extracted_content || '';
      const newContent = newSnapshotResponse.data.extracted_content;
      
      // Calculate detailed diff
      const textDiff = diff.diffWords(oldContent, newContent);
      
      const additions = textDiff
        .filter(part => part.added)
        .map(part => part.value)
        .join(' ');
        
      const deletions = textDiff
        .filter(part => part.removed)
        .map(part => part.value)
        .join(' ');
      
      // Prepare comprehensive content for analysis
      const analysisContent = `
CONTENT ADDITIONS:
${additions.substring(0, 2000)}

CONTENT REMOVALS:
${deletions.substring(0, 1000)}

NEW PAGE TITLE: ${change.new_title || 'N/A'}
OLD PAGE TITLE: ${change.old_title || 'N/A'}

FULL NEW CONTENT (SAMPLE):
${newContent.substring(0, 2000)}
`;

      const context = {
        company_name: change.company_name,
        url: change.url,
        url_type: change.url_type,
        change_percentage: change.change_percentage
      };

      console.log('   📊 Stage 1: Topic and Entity Extraction...');
      const topics = await this.extractTopicsAndEntities(analysisContent, context);
      
      console.log('   🎭 Stage 2: Sentiment and Impact Analysis...');
      const sentiment = await this.analyzeSentimentAndImpact(analysisContent, topics, context);
      
      console.log('   🏷️  Stage 3: Advanced Categorization...');
      const categorization = await this.categorizeChange(analysisContent, topics, sentiment, context);
      
      console.log('   📋 Stage 4: Executive Summary Generation...');
      const executiveSummary = await this.generateExecutiveSummary(analysisContent, topics, sentiment, categorization, context);

      // Compile comprehensive analysis results
      const analysis = {
        // Legacy fields for compatibility
        relevance_score: Math.round(executiveSummary.scoring.overall_relevance),
        summary: executiveSummary.executive_summary.headline,
        category: categorization.primary_category.category,
        competitive_threats: sentiment.competitive_impact.immediate_threats?.join('; ') || 'None identified',
        strategic_opportunities: sentiment.strategic_significance.investment_signals?.join('; ') || 'None identified',
        
        // Enhanced fields
        enhanced_analysis: {
          topics,
          sentiment,
          categorization,
          executive_summary: executiveSummary,
          analysis_timestamp: new Date().toISOString(),
          analysis_version: '2.0'
        }
      };

      // Store comprehensive AI analysis
      await axios.post(`${API_URL}/changes/${change.id}/ai-analysis`, {
        ...analysis,
        raw_response: JSON.stringify(analysis.enhanced_analysis, null, 2)
      });

      console.log(`   ✅ Overall Relevance: ${executiveSummary.scoring.overall_relevance}/10`);
      console.log(`   🎯 Strategic Impact: ${executiveSummary.scoring.strategic_impact}/10`);
      console.log(`   ⚡ Urgency: ${executiveSummary.scoring.urgency}/10`);
      console.log(`   🔥 Competitive Threat: ${executiveSummary.scoring.competitive_threat}/10`);
      console.log(`   📝 Summary: ${executiveSummary.executive_summary.headline}`);
      console.log(`   🏷️  Category: ${categorization.primary_category.category} (${Math.round(categorization.primary_category.confidence * 100)}%)`);

      return analysis;

    } catch (error) {
      console.error(`   ❌ Error in enhanced analysis:`, error.message);
      throw error;
    }
  }

  /**
   * Analyze all recent changes needing analysis
   */
  async analyzeRecentChanges() {
    try {
      // Get configuration
      const configResponse = await axios.get(`${API_URL}/config`);
      const config = configResponse.data;
      const changeThreshold = parseFloat(config.change_threshold || '10');
      
      // Get recent changes without AI analysis
      const changesResponse = await axios.get(`${API_URL}/changes/recent?limit=100`);
      const changes = changesResponse.data;
      
      // Filter changes that need analysis
      const unanalyzedChanges = changes.filter(change => 
        !change.relevance_score && 
        (change.change_percentage >= changeThreshold || (change.keywords_found && JSON.parse(change.keywords_found).length > 0))
      );
      
      console.log(`📊 Found ${unanalyzedChanges.length} changes requiring enhanced analysis`);
      
      let analyzed = 0;
      let highPriority = 0;
      let criticalPriority = 0;
      
      for (const change of unanalyzedChanges) {
        try {
          const analysis = await this.analyzeChange(change);
          
          analyzed++;
          if (analysis.enhanced_analysis.executive_summary.scoring.overall_relevance >= 7) {
            highPriority++;
          }
          if (analysis.enhanced_analysis.executive_summary.scoring.overall_relevance >= 9) {
            criticalPriority++;
          }
          
          // Rate limiting - more conservative for enhanced analysis
          await new Promise(resolve => setTimeout(resolve, 2000));
          
        } catch (error) {
          console.error(`   ❌ Error analyzing change ${change.id}:`, error.message);
        }
      }
      
      console.log(`\n📈 Enhanced Analysis Summary:`);
      console.log(`   Total Analyzed: ${analyzed}`);
      console.log(`   High Priority (7+): ${highPriority}`);
      console.log(`   Critical Priority (9+): ${criticalPriority}`);
      
    } catch (error) {
      console.error('❌ Enhanced analysis error:', error.message);
      throw error;
    }
  }

  /**
   * Generate sophisticated intelligence brief with trend analysis
   */
  async generateIntelligenceBrief() {
    try {
      console.log('\n📋 Generating Enhanced Intelligence Brief...');
      
      // Get high-priority changes from the last 48 hours
      const changesResponse = await axios.get(
        `${API_URL}/changes/recent?limit=100&min_relevance=6`
      );
      
      const changes = changesResponse.data.filter(c => 
        new Date(c.created_at) > new Date(Date.now() - 48 * 60 * 60 * 1000)
      );
      
      if (changes.length === 0) {
        console.log('   No significant changes in the last 48 hours');
        return null;
      }

      // Extract enhanced analysis data
      const enhancedChanges = changes.map(change => {
        try {
          const enhanced = JSON.parse(change.raw_response || '{}');
          return { ...change, enhanced };
        } catch {
          return change;
        }
      });

      // Generate comprehensive brief
      const briefPrompt = `You are preparing a comprehensive competitive intelligence brief for senior executives. Analyze these significant changes detected in the last 48 hours and provide strategic insights.

${enhancedChanges.map((change, i) => `
**Change ${i + 1}: ${change.company_name}**
- URL: ${change.url}
- Relevance Score: ${change.relevance_score}/10
- Category: ${change.category}
- Summary: ${change.summary}
- Strategic Impact: ${change.enhanced?.executive_summary?.scoring?.strategic_impact || 'N/A'}/10
- Competitive Threat: ${change.enhanced?.executive_summary?.scoring?.competitive_threat || 'N/A'}/10
- Threat Level: ${change.enhanced?.executive_summary?.competitive_threat_level || 'N/A'}
- Key Insights: ${change.enhanced?.key_insights?.join('; ') || 'N/A'}
- Recommended Actions: ${change.enhanced?.executive_summary?.recommended_actions?.join('; ') || 'N/A'}
`).join('\n')}

Create a comprehensive executive intelligence brief with the following structure:

# EXECUTIVE INTELLIGENCE BRIEF - ${new Date().toLocaleDateString()}

## 🔴 CRITICAL ALERTS
[Any threats requiring immediate attention]

## 📊 STRATEGIC OVERVIEW
[High-level summary of competitive landscape changes]

## 🎯 KEY DEVELOPMENTS BY COMPANY
[Organized analysis by competitor]

## 🔍 TREND ANALYSIS
[Patterns and emerging trends across all changes]

## ⚡ IMMEDIATE ACTION ITEMS
[Specific actions leadership should take]

## 🔮 STRATEGIC IMPLICATIONS
[Long-term competitive implications]

## 📈 MONITORING PRIORITIES
[What to watch closely in coming weeks]

Focus on actionable intelligence that enables strategic decision-making. Use professional tone suitable for C-level executives.`;

      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        temperature: 0.5,
        messages: [
          {
            role: 'user',
            content: briefPrompt
          }
        ]
      });
      
      const brief = response.content[0].text;
      
      console.log('\n=== ENHANCED INTELLIGENCE BRIEF ===\n');
      console.log(brief);
      console.log('\n====================================\n');
      
      // TODO: Store brief and send alerts
      
      return brief;
      
    } catch (error) {
      console.error('❌ Error generating enhanced brief:', error.message);
      throw error;
    }
  }
}

// Main execution
async function main() {
  const analyzer = new EnhancedAIAnalyzer();
  
  try {
    await analyzer.initialize();
    
    const command = process.argv[2] || 'analyze';
    
    switch (command) {
      case 'analyze':
        await analyzer.analyzeRecentChanges();
        break;
        
      case 'brief':
        await analyzer.generateIntelligenceBrief();
        break;
        
      case 'change':
        const changeId = process.argv[3];
        if (!changeId) {
          console.error('❌ Change ID required for change command');
          process.exit(1);
        }
        const changeResponse = await axios.get(`${API_URL}/changes/${changeId}`);
        await analyzer.analyzeChange(changeResponse.data);
        break;
        
      default:
        console.error(`❌ Unknown command: ${command}`);
        console.log('Usage: ai-analyzer-enhanced.js [analyze|brief|change <id>]');
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

// Run the analyzer
if (require.main === module) {
  main();
}

module.exports = EnhancedAIAnalyzer;
