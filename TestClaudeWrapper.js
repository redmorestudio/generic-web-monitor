/**
 * Test Claude Integration via Web API
 * This wrapper makes Claude testable through the existing infrastructure
 */

function testClaudeViaMonitor() {
  // Check if API key exists
  const apiKey = PropertiesService.getScriptProperties().getProperty('CLAUDE_API_KEY');
  
  if (!apiKey) {
    return {
      status: 'error',
      message: 'No Claude API key found. Run setupClaudeNow() first.',
      claudeEnabled: false
    };
  }
  
  // Test with a simple Claude call
  try {
    const testPrompt = "Respond with exactly: Claude is working!";
    
    const response = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
      method: 'post',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      payload: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 50,
        messages: [{
          role: 'user',
          content: testPrompt
        }]
      }),
      muteHttpExceptions: true
    });
    
    if (response.getResponseCode() === 200) {
      const result = JSON.parse(response.getContentText());
      return {
        status: 'success',
        message: 'Claude integration is working!',
        claudeEnabled: true,
        testResponse: result.content[0].text,
        apiKeyLength: apiKey.length,
        recommendation: 'Claude will automatically analyze any detected changes during monitoring'
      };
    } else {
      return {
        status: 'error',
        message: 'Claude API error',
        claudeEnabled: false,
        httpCode: response.getResponseCode(),
        error: response.getContentText()
      };
    }
  } catch (error) {
    return {
      status: 'error',
      message: 'Failed to connect to Claude',
      claudeEnabled: false,
      error: error.toString()
    };
  }
}

/**
 * Get Claude configuration status
 */
function getClaudeConfig() {
  const apiKey = PropertiesService.getScriptProperties().getProperty('CLAUDE_API_KEY');
  
  return {
    apiKeySet: !!apiKey,
    apiKeyLength: apiKey ? apiKey.length : 0,
    expectedKeyLength: 108,
    status: apiKey && apiKey.length === 108 ? 'Configured' : 'Not configured',
    enhancedMonitoringAvailable: typeof processMonitorEnhanced === 'function',
    functions: {
      processMonitorEnhanced: typeof processMonitorEnhanced === 'function',
      analyzeChangeWithClaude: typeof analyzeChangeWithClaude === 'function',
      monitorAllWithClaude: typeof monitorAllWithClaude === 'function'
    }
  };
}
