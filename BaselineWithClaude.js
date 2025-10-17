/**
 * Enhanced Baseline with Claude Analysis
 * This generates baseline AND gets Claude's insights on current state
 */

function generateBaselineWithClaude() {
  const startTime = new Date();
  const apiKey = PropertiesService.getScriptProperties().getProperty('CLAUDE_API_KEY');
  const useClaudeAnalysis = !!apiKey;
  
  console.log('Starting baseline generation with Claude analysis:', useClaudeAnalysis);
  
  const monitors = getMonitorConfigurations();
  const results = [];
  const claudeInsights = [];
  
  monitors.forEach((monitor, index) => {
    console.log(`Processing ${monitor.company} (${index + 1}/${monitors.length})`);
    
    try {
      // Process each URL for this company
      const companyResults = {
        company: monitor.company,
        urls: [],
        claudeAnalysis: null
      };
      
      let allContent = ''; // Aggregate content for Claude
      
      monitor.urls.forEach(url => {
        try {
          // Extract content
          const extraction = extractPageContent(url);
          
          if (extraction.success) {
            // Store baseline
            storeBaseline(monitor.company, url, extraction);
            
            companyResults.urls.push({
              url: url,
              status: 'baseline_created',
              keywords: extraction.intelligence?.keywords || [],
              pageType: extraction.intelligence?.pageType || 'unknown'
            });
            
            // Aggregate content for Claude analysis
            allContent += `\n\n=== ${url} ===\n${extraction.content.substring(0, 1500)}`;
          }
          
          // Respect crawl delay
          Utilities.sleep(2000);
          
        } catch (error) {
          console.error(`Error processing ${url}:`, error);
        }
      });
      
      // Get Claude's analysis of this company
      if (useClaudeAnalysis && allContent) {
        try {
          const claudeAnalysis = analyzeCompanyBaseline(
            monitor.company,
            allContent,
            companyResults.urls
          );
          
          companyResults.claudeAnalysis = claudeAnalysis;
          claudeInsights.push({
            company: monitor.company,
            analysis: claudeAnalysis
          });
          
          console.log(`Claude analyzed ${monitor.company}:`, claudeAnalysis.summary);
          
        } catch (error) {
          console.error('Claude analysis failed for', monitor.company, error);
        }
      }
      
      results.push(companyResults);
      
    } catch (error) {
      results.push({
        company: monitor.company,
        error: error.toString()
      });
    }
  });
  
  // Write results to sheet with Claude insights
  if (results.length > 0) {
    writeBaselineWithClaudeToSheet(results, claudeInsights);
  }
  
  // Store completion
  PropertiesService.getScriptProperties().setProperty('lastBaselineRun', new Date().toISOString());
  
  return {
    success: true,
    companiesProcessed: results.length,
    claudeAnalyses: claudeInsights.length,
    duration: (new Date() - startTime) / 1000,
    timestamp: new Date().toISOString(),
    insights: claudeInsights
  };
}

/**
 * Analyze a company's baseline with Claude
 */
function analyzeCompanyBaseline(company, content, urls) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('CLAUDE_API_KEY');
  
  if (!apiKey) {
    return null;
  }
  
  const prompt = `You are analyzing the current state of ${company} for competitive intelligence.

URLs analyzed:
${urls.map(u => `- ${u.url} (${u.pageType})`).join('\n')}

Content from their website:
${content}

Provide a comprehensive analysis in JSON format:
{
  "summary": "2-3 sentence executive summary of what this company is doing",
  "keyOfferings": ["main product/service 1", "main product/service 2"],
  "targetMarket": "Who they're targeting",
  "uniqueValue": "What makes them different",
  "recentFocus": ["current priority 1", "current priority 2"],
  "competitivePosition": "How they position against competitors",
  "notableFeatures": ["feature 1", "feature 2"],
  "pricingStrategy": "Their pricing approach if visible",
  "strengthScore": 1-10,
  "threatLevel": 1-10,
  "recommendations": ["strategic recommendation 1", "strategic recommendation 2"]
}`;

  try {
    const response = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
      method: 'post',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      payload: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1000,
        temperature: 0.3,
        messages: [{
          role: 'user',
          content: prompt
        }]
      }),
      muteHttpExceptions: true
    });
    
    if (response.getResponseCode() === 200) {
      const result = JSON.parse(response.getContentText());
      const analysis = JSON.parse(result.content[0].text);
      
      return analysis;
    } else {
      console.error('Claude API error:', response.getContentText());
      return null;
    }
    
  } catch (error) {
    console.error('Claude baseline analysis error:', error);
    return null;
  }
}

/**
 * Write baseline results with Claude insights to sheet
 */
function writeBaselineWithClaudeToSheet(results, claudeInsights) {
  const ss = getOrCreateMonitorSheet();
  
  // Create or get Claude Analysis sheet
  let claudeSheet = ss.getSheetByName('Claude Analysis');
  if (!claudeSheet) {
    claudeSheet = ss.insertSheet('Claude Analysis');
    
    // Set up headers
    const headers = [
      'Company',
      'Summary',
      'Key Offerings',
      'Target Market',
      'Unique Value',
      'Recent Focus',
      'Competitive Position',
      'Notable Features',
      'Pricing Strategy',
      'Strength Score',
      'Threat Level',
      'Recommendations',
      'Analysis Date'
    ];
    
    claudeSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    claudeSheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
  
  // Write Claude insights
  const claudeData = claudeInsights.map(insight => {
    const analysis = insight.analysis;
    return [
      insight.company,
      analysis.summary || '',
      (analysis.keyOfferings || []).join('; '),
      analysis.targetMarket || '',
      analysis.uniqueValue || '',
      (analysis.recentFocus || []).join('; '),
      analysis.competitivePosition || '',
      (analysis.notableFeatures || []).join('; '),
      analysis.pricingStrategy || '',
      analysis.strengthScore || 0,
      analysis.threatLevel || 0,
      (analysis.recommendations || []).join('; '),
      new Date().toISOString()
    ];
  });
  
  if (claudeData.length > 0) {
    claudeSheet.getRange(2, 1, claudeData.length, claudeData[0].length).setValues(claudeData);
  }
  
  // Also write standard baseline data
  const baselineSheet = ss.getSheetByName('Baseline') || ss.insertSheet('Baseline');
  // ... standard baseline writing code ...
  
  return {
    status: 'written',
    claudeAnalyses: claudeInsights.length,
    sheetUrl: ss.getUrl()
  };
}

/**
 * API endpoint for baseline with Claude
 */
function handleBaselineWithClaude(data) {
  try {
    const result = generateBaselineWithClaude();
    
    return createJsonResponse({
      success: true,
      action: 'baselineWithClaude',
      result,
      summary: {
        companiesAnalyzed: result.companiesProcessed,
        claudeInsights: result.claudeAnalyses,
        duration: result.duration + ' seconds'
      }
    });
    
  } catch (error) {
    return createJsonResponse({
      success: false,
      action: 'baselineWithClaude',
      error: error.toString()
    }, 500);
  }
}