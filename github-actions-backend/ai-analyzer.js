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

class AIAnalyzer {
  constructor() {
    this.runId = null;
  }

  async initialize() {
    console.log('🤖 Starting AI Analyzer...');
    
    // Create monitoring run
    const runResponse = await axios.post(`${API_URL}/monitoring-runs`, {
      run_type: 'ai_analysis',
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
    
    console.log('✅ AI Analyzer shutdown complete');
  }

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
      
      console.log(`📊 Found ${unanalyzedChanges.length} changes to analyze`);
      
      let analyzed = 0;
      let highPriority = 0;
      
      for (const change of unanalyzedChanges) {
        console.log(`\n🔍 Analyzing change for ${change.company_name} - ${change.url}`);
        
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
            .join(' ')
            .substring(0, 1000);
            
          const deletions = textDiff
            .filter(part => part.removed)
            .map(part => part.value)
            .join(' ')
            .substring(0, 1000);
          
          // Prepare context for Claude
          const analysisPrompt = `You are an AI competitive intelligence analyst. Analyze this website change and provide strategic insights.

Company: ${change.company_name}
URL: ${change.url}
Page Type: ${change.url_type}
Change Magnitude: ${change.change_percentage?.toFixed(1)}% of content changed
Keywords Found: ${change.keywords_found || '[]'}

CONTENT ADDED:
${additions || 'No significant additions'}

CONTENT REMOVED:
${deletions || 'No significant removals'}

NEW PAGE TITLE: ${change.new_title || 'N/A'}
OLD PAGE TITLE: ${change.old_title || 'N/A'}

Provide your analysis in the following JSON format:
{
  "relevance_score": <number 1-10, where 10 is extremely important>,
  "summary": "<brief 1-2 sentence summary of what changed>",
  "category": "<one of: product_update, pricing_change, messaging_change, feature_update, partnership, other>",
  "competitive_threats": "<specific threats this change poses to competitors>",
  "strategic_opportunities": "<opportunities this reveals about the company's direction>"
}

Scoring guidelines:
- 9-10: Major product launches, significant pricing changes, strategic pivots
- 7-8: New features, partnership announcements, important messaging updates  
- 5-6: Minor feature updates, blog posts about existing products, small messaging tweaks
- 3-4: Typo fixes, small content updates, routine maintenance
- 1-2: Negligible changes, date updates, formatting only

Focus on STRATEGIC IMPORTANCE, not just the size of the change.`;

          // Call Claude for analysis
          const response = await anthropic.messages.create({
            model: 'claude-3-sonnet-20240229',
            max_tokens: 1000,
            temperature: 0.3,
            messages: [
              {
                role: 'user',
                content: analysisPrompt
              }
            ]
          });
          
          // Parse Claude's response
          const responseText = response.content[0].text;
          let analysis;
          
          try {
            // Extract JSON from response
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              analysis = JSON.parse(jsonMatch[0]);
            } else {
              throw new Error('No JSON found in response');
            }
          } catch (parseError) {
            console.error('Failed to parse AI response:', parseError);
            // Fallback analysis
            analysis = {
              relevance_score: 5,
              summary: 'Failed to parse AI analysis',
              category: 'other',
              competitive_threats: 'Analysis parsing failed',
              strategic_opportunities: 'Analysis parsing failed'
            };
          }
          
          // Validate and clamp relevance score
          analysis.relevance_score = Math.max(1, Math.min(10, Math.round(analysis.relevance_score)));
          
          // Store AI analysis
          await axios.post(`${API_URL}/changes/${change.id}/ai-analysis`, {
            relevance_score: analysis.relevance_score,
            summary: analysis.summary,
            category: analysis.category,
            competitive_threats: analysis.competitive_threats,
            strategic_opportunities: analysis.strategic_opportunities,
            raw_response: responseText
          });
          
          console.log(`   ✅ Relevance Score: ${analysis.relevance_score}/10`);
          console.log(`   📝 Summary: ${analysis.summary}`);
          console.log(`   🏷️  Category: ${analysis.category}`);
          
          analyzed++;
          if (analysis.relevance_score >= 7) {
            highPriority++;
          }
          
          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          console.error(`   ❌ Error analyzing change ${change.id}:`, error.message);
        }
      }
      
      console.log(`\n📈 Analysis Summary:`);
      console.log(`   Total Analyzed: ${analyzed}`);
      console.log(`   High Priority (7+): ${highPriority}`);
      
    } catch (error) {
      console.error('❌ Analysis error:', error.message);
      throw error;
    }
  }

  async generateIntelligenceBrief() {
    try {
      console.log('\n📋 Generating Intelligence Brief...');
      
      // Get high-priority changes from the last 24 hours
      const changesResponse = await axios.get(
        `${API_URL}/changes/recent?limit=50&min_relevance=6`
      );
      
      const changes = changesResponse.data.filter(c => 
        new Date(c.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      );
      
      if (changes.length === 0) {
        console.log('   No significant changes in the last 24 hours');
        return null;
      }
      
      // Group by company
      const changesByCompany = {};
      changes.forEach(change => {
        if (!changesByCompany[change.company_name]) {
          changesByCompany[change.company_name] = [];
        }
        changesByCompany[change.company_name].push(change);
      });
      
      // Generate brief with Claude
      const briefPrompt = `You are preparing an executive intelligence brief on competitor activity. Summarize the following important changes detected in the last 24 hours.

${Object.entries(changesByCompany).map(([company, companyChanges]) => `
**${company}** (${companyChanges.length} significant changes)
${companyChanges.map(c => `
- [Score: ${c.relevance_score}/10] ${c.summary}
  Category: ${c.category}
  URL: ${c.url}
  Threats: ${c.competitive_threats}
  Opportunities: ${c.strategic_opportunities}
`).join('\n')}
`).join('\n')}

Provide a concise executive brief that:
1. Highlights the most important developments
2. Identifies emerging patterns or trends
3. Recommends strategic actions
4. Flags urgent competitive threats

Format as a professional brief suitable for senior leadership.`;

      const response = await anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 2000,
        temperature: 0.5,
        messages: [
          {
            role: 'user',
            content: briefPrompt
          }
        ]
      });
      
      const brief = response.content[0].text;
      
      console.log('\n=== INTELLIGENCE BRIEF ===\n');
      console.log(brief);
      console.log('\n=========================\n');
      
      // TODO: Store brief or send via email/Slack
      
      return brief;
      
    } catch (error) {
      console.error('❌ Error generating brief:', error.message);
      throw error;
    }
  }

  async analyzeSpecificChange(changeId) {
    try {
      console.log(`🎯 Analyzing specific change ID: ${changeId}`);
      
      // Get change details
      const changeResponse = await axios.get(`${API_URL}/changes/${changeId}`);
      const change = changeResponse.data;
      
      // Create a temporary array with just this change
      const tempChange = { ...change, relevance_score: null };
      
      // Use the same analysis logic
      await this.analyzeRecentChanges.call(
        { ...this, analyzeRecentChanges: async () => {} },
        [tempChange]
      );
      
    } catch (error) {
      console.error('❌ Error analyzing specific change:', error.message);
      throw error;
    }
  }
}

// Main execution
async function main() {
  const analyzer = new AIAnalyzer();
  
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
        await analyzer.analyzeSpecificChange(changeId);
        break;
        
      default:
        console.error(`❌ Unknown command: ${command}`);
        console.log('Usage: ai-analyzer.js [analyze|brief|change <id>]');
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

module.exports = AIAnalyzer;
