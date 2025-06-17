/**
 * Analyze all companies with Claude - Simple Version
 */
function analyzeAllCompaniesWithClaude() {
  const monitors = getMonitorConfigurations();
  const results = [];
  const startTime = new Date();
  
  monitors.forEach((monitor, index) => {
    console.log(`Analyzing ${monitor.company} (${index + 1}/${monitors.length})...`);
    
    try {
      // Extract content from each URL
      let aggregatedContent = '';
      const urlData = [];
      
      monitor.urls.forEach(url => {
        try {
          const extraction = extractPageContent(url);
          if (extraction.success) {
            aggregatedContent += `\n\n=== ${url} ===\n${extraction.content.substring(0, 1000)}`;
            urlData.push({
              url: url,
              keywords: extraction.intelligence?.keywords || []
            });
          }
          Utilities.sleep(1000); // Respect crawl delay
        } catch (e) {
          console.error('Error extracting:', url, e);
        }
      });
      
      // Get Claude's analysis
      const apiKey = PropertiesService.getScriptProperties().getProperty('CLAUDE_API_KEY');
      if (!apiKey || !aggregatedContent) {
        results.push({
          company: monitor.company,
          error: 'No API key or content'
        });
        return;
      }
      
      const prompt = `Analyze this AI company for competitive intelligence:

Company: ${monitor.company}
Content from their website:
${aggregatedContent}

Provide a brief competitive analysis in JSON:
{
  "summary": "2-3 sentence summary",
  "mainProducts": ["product1", "product2"],
  "targetMarket": "their target audience",
  "competitiveStrength": "what makes them strong",
  "threatLevel": 1-10,
  "watchFor": ["thing to monitor 1", "thing to monitor 2"]
}`;

      const response = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
        method: 'post',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        payload: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 500,
          temperature: 0.3,
          messages: [{
            role: 'user',
            content: prompt
          }]
        })
      });
      
      if (response.getResponseCode() === 200) {
        const result = JSON.parse(response.getContentText());
        const analysis = JSON.parse(result.content[0].text);
        
        results.push({
          company: monitor.company,
          analysis: analysis,
          urlsAnalyzed: monitor.urls.length,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      results.push({
        company: monitor.company,
        error: error.toString()
      });
    }
  });
  
  const duration = (new Date() - startTime) / 1000;
  
  // Create summary
  const summary = {
    companiesAnalyzed: results.filter(r => r.analysis).length,
    totalCompanies: monitors.length,
    duration: duration + ' seconds',
    timestamp: new Date().toISOString(),
    results: results
  };
  
  // Log to sheet if available
  try {
    const ss = getOrCreateMonitorSheet();
    let summarySheet = ss.getSheetByName('Claude Summary');
    if (!summarySheet) {
      summarySheet = ss.insertSheet('Claude Summary');
      summarySheet.getRange(1, 1, 1, 8).setValues([['Company', 'Summary', 'Threat Level', 'Products', 'Target Market', 'Strength', 'Watch For', 'Timestamp']]);
    }
    
    const data = results.filter(r => r.analysis).map(r => [
      r.company,
      r.analysis.summary,
      r.analysis.threatLevel,
      r.analysis.mainProducts.join(', '),
      r.analysis.targetMarket,
      r.analysis.competitiveStrength,
      r.analysis.watchFor.join(', '),
      r.timestamp
    ]);
    
    if (data.length > 0) {
      summarySheet.getRange(2, 1, data.length, 8).setValues(data);
    }
    
    summary.sheetUrl = ss.getUrl();
  } catch (e) {
    console.log('Could not write to sheet:', e);
  }
  
  return summary;
}