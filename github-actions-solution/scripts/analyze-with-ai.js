// scripts/analyze-with-ai.js
const fs = require('fs').promises;
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');

// Initialize Claude
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function analyzeWithAI() {
  console.log('🤖 Starting AI analysis with Claude...');
  
  // Load latest scraped data
  const rawDataPath = path.join(__dirname, '..', 'data', 'raw', 'latest.json');
  const rawData = JSON.parse(await fs.readFile(rawDataPath, 'utf8'));
  
  // Filter successful scrapes
  const successfulScrapes = rawData.filter(item => item.success);
  console.log(`📊 Analyzing ${successfulScrapes.length} successfully scraped pages`);
  
  const analyses = [];
  
  for (const scrape of successfulScrapes) {
    try {
      console.log(`\n🔍 Analyzing ${scrape.company} - ${scrape.type}`);
      
      // Prepare prompt for Claude
      const prompt = `You are an AI competitive intelligence analyst. Analyze this content from ${scrape.company}'s ${scrape.type} page and extract key insights.

URL: ${scrape.url}
Title: ${scrape.title}
Content preview (first 3000 chars):
${scrape.content.substring(0, 3000)}

Please provide:
1. **Key Changes**: What appears new or recently updated?
2. **Product/Feature Updates**: Any new features, products, or capabilities mentioned?
3. **Pricing Intelligence**: Any pricing information or changes?
4. **Strategic Insights**: What does this reveal about their strategy?
5. **Competitive Threats**: What should we be concerned about?
6. **Opportunities**: What opportunities does this reveal?
7. **Relevance Score**: Rate 1-10 how important this intel is
8. **Summary**: One paragraph executive summary

Format as JSON with these exact keys: keyChanges, productUpdates, pricingIntel, strategicInsights, competitiveThreats, opportunities, relevanceScore, summary`;

      // Call Claude for analysis
      const response = await anthropic.messages.create({
        model: 'claude-3-sonnet-20241022',
        max_tokens: 1500,
        temperature: 0.3,
        system: "You are a competitive intelligence analyst. Always respond with valid JSON.",
        messages: [{
          role: 'user',
          content: prompt
        }]
      });
      
      // Parse Claude's response
      let analysis;
      try {
        // Extract JSON from response
        const jsonMatch = response.content[0].text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        analysis = {
          error: 'Failed to parse AI response',
          rawResponse: response.content[0].text
        };
      }
      
      analyses.push({
        ...scrape,
        aiAnalysis: analysis,
        analyzedAt: new Date().toISOString()
      });
      
      // Rate limit - Claude allows 50 req/min
      await new Promise(resolve => setTimeout(resolve, 1500));
      
    } catch (error) {
      console.error(`❌ AI analysis failed for ${scrape.url}:`, error.message);
      analyses.push({
        ...scrape,
        aiAnalysis: {
          error: error.message
        }
      });
    }
  }
  
  // Save analyzed data
  const analysisDir = path.join(__dirname, '..', 'data', 'analysis');
  await fs.mkdir(analysisDir, { recursive: true });
  
  const timestamp = new Date().toISOString();
  const filename = `analysis-${timestamp.split('T')[0]}-${Date.now()}.json`;
  
  await fs.writeFile(
    path.join(analysisDir, filename),
    JSON.stringify(analyses, null, 2)
  );
  
  await fs.writeFile(
    path.join(analysisDir, 'latest.json'),
    JSON.stringify(analyses, null, 2)
  );
  
  // Generate summary report
  await generateSummaryReport(analyses);
  
  console.log(`\n✅ AI analysis complete! ${analyses.length} pages analyzed`);
  console.log(`📁 Analysis saved to data/analysis/${filename}`);
}

async function generateSummaryReport(analyses) {
  console.log('\n📝 Generating summary report...');
  
  // Group by company
  const byCompany = {};
  analyses.forEach(item => {
    if (!byCompany[item.company]) {
      byCompany[item.company] = [];
    }
    byCompany[item.company].push(item);
  });
  
  // Create markdown report
  let report = `# AI Competitive Intelligence Report
Generated: ${new Date().toISOString()}

## Executive Summary

`;

  // High-relevance findings
  const highRelevance = analyses
    .filter(a => a.aiAnalysis?.relevanceScore >= 7)
    .sort((a, b) => (b.aiAnalysis?.relevanceScore || 0) - (a.aiAnalysis?.relevanceScore || 0));
  
  if (highRelevance.length > 0) {
    report += `### 🔴 High Priority Findings (Relevance ≥ 7)\n\n`;
    highRelevance.forEach(item => {
      if (item.aiAnalysis?.summary) {
        report += `**${item.company} - ${item.type}** (Score: ${item.aiAnalysis.relevanceScore}/10)\n`;
        report += `${item.aiAnalysis.summary}\n\n`;
      }
    });
  }
  
  // Company sections
  Object.entries(byCompany).forEach(([company, items]) => {
    report += `\n## ${company}\n\n`;
    
    items.forEach(item => {
      if (item.aiAnalysis && !item.aiAnalysis.error) {
        report += `### ${item.type} (${item.url})\n`;
        report += `**Relevance Score**: ${item.aiAnalysis.relevanceScore || 'N/A'}/10\n\n`;
        
        if (item.aiAnalysis.keyChanges) {
          report += `**Key Changes**:\n${item.aiAnalysis.keyChanges}\n\n`;
        }
        
        if (item.aiAnalysis.productUpdates) {
          report += `**Product Updates**:\n${item.aiAnalysis.productUpdates}\n\n`;
        }
        
        if (item.aiAnalysis.competitiveThreats) {
          report += `**⚠️ Competitive Threats**:\n${item.aiAnalysis.competitiveThreats}\n\n`;
        }
        
        if (item.aiAnalysis.opportunities) {
          report += `**💡 Opportunities**:\n${item.aiAnalysis.opportunities}\n\n`;
        }
        
        report += `---\n\n`;
      }
    });
  });
  
  // Save report
  const reportPath = path.join(__dirname, '..', 'data', 'reports', `report-${new Date().toISOString().split('T')[0]}.md`);
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, report);
  
  // Also save as latest
  await fs.writeFile(
    path.join(__dirname, '..', 'data', 'reports', 'latest.md'),
    report
  );
  
  console.log('📄 Report saved to data/reports/latest.md');
}

// Run if called directly
if (require.main === module) {
  analyzeWithAI()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { analyzeWithAI };
