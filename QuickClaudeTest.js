/**
 * Super Simple Claude Test
 * Add this ONE function to test if Claude is working
 */

function quickClaudeTest() {
  // Check if API key exists
  const apiKey = PropertiesService.getScriptProperties().getProperty('CLAUDE_API_KEY');
  
  if (!apiKey) {
    return {
      status: '❌ No API key found',
      instruction: 'Run setupClaudeNow() first'
    };
  }
  
  // Try to analyze something simple
  try {
    const testContent = "Mistral AI just launched their new Large 2 model with 123B parameters, competing directly with GPT-4.";
    
    const response = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
      method: 'post',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      payload: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 200,
        messages: [{
          role: 'user',
          content: 'Analyze this competitive intelligence: ' + testContent + '\n\nWhat are the key implications?'
        }]
      })
    });
    
    if (response.getResponseCode() === 200) {
      const result = JSON.parse(response.getContentText());
      return {
        status: '✅ Claude is working!',
        apiKeyStored: true,
        testAnalysis: result.content[0].text,
        readyToMonitor: true,
        nextStep: 'Claude will automatically analyze any detected changes'
      };
    }
  } catch (error) {
    return {
      status: '❌ Claude connection failed',
      error: error.toString(),
      apiKeyPresent: true
    };
  }
}