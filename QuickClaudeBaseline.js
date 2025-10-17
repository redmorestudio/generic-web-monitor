/**
 * Quick Claude Baseline Test
 * Add this to any existing .gs file to test Claude baseline analysis
 */

function quickBaselineWithClaude() {
  // Get just the first company as a test
  const monitors = getMonitorConfigurations();
  const testMonitor = monitors[0]; // Mistral AI
  
  console.log('Testing Claude baseline analysis for:', testMonitor.company);
  
  // Extract content from each URL
  let aggregatedContent = '';
  const urlData = [];
  
  testMonitor.urls.forEach(url => {
    try {
      const extraction = extractPageContent(url);
      if (extraction.success) {
        aggregatedContent += `\n\n=== ${url} ===\n${extraction.content.substring(0, 1000)}`;
        urlData.push({
          url: url,
          keywords: extraction.intelligence?.keywords || []
        });
      }
    } catch (e) {
      console.error('Error extracting:', url, e);
    }
  });
  
  // Get Claude's analysis
  const apiKey = PropertiesService.getScriptProperties().getProperty('CLAUDE_API_KEY');
  if (!apiKey) {
    return { error: 'No Claude API key found' };
  }
  
  const prompt = `Analyze this AI company for competitive intelligence:

Company: ${testMonitor.company}
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
      
      return {
        company: testMonitor.company,
        claudeAnalysis: analysis,
        urlsAnalyzed: testMonitor.urls.length,
        timestamp: new Date().toISOString()
      };
    }
  } catch (error) {
    return {
      company: testMonitor.company,
      error: error.toString()
    };
  }
}