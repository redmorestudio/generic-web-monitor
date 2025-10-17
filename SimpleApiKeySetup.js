/**
 * Simple API Key Check - Safe to run in Apps Script environment
 */

function checkApiKeyStatus() {
  try {
    const apiKey = PropertiesService.getScriptProperties().getProperty('CLAUDE_API_KEY');
    
    if (!apiKey) {
      return {
        hasKey: false,
        message: 'No API key found. You need to set one up.',
        instructions: [
          '1. Go to Project Settings in the Script Editor',
          '2. Add Script Property: CLAUDE_API_KEY = your-api-key',
          '3. Or use the manual setup function below'
        ]
      };
    }
    
    // Key exists, test if it works
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
          max_tokens: 10,
          messages: [{ role: 'user', content: 'test' }]
        }),
        muteHttpExceptions: true
      });
      
      const code = response.getResponseCode();
      
      return {
        hasKey: true,
        working: code === 200,
        status: code,
        message: code === 200 ? 'API key is set and working!' : 'API key exists but returned error code: ' + code
      };
      
    } catch (error) {
      return {
        hasKey: true,
        working: false,
        error: error.toString(),
        message: 'API key exists but connection failed'
      };
    }
    
  } catch (error) {
    return {
      error: error.toString(),
      message: 'Error checking API key status'
    };
  }
}

/**
 * Manual setup - Replace the key and run once
 */
function manualApiKeySetup() {
  // REPLACE WITH YOUR ACTUAL API KEY
  const YOUR_API_KEY = 'sk-ant-api03-YOUR-ACTUAL-KEY-HERE';
  
  if (YOUR_API_KEY.includes('YOUR-ACTUAL-KEY-HERE')) {
    return 'Please edit this function and replace with your actual API key first!';
  }
  
  PropertiesService.getScriptProperties().setProperty('CLAUDE_API_KEY', YOUR_API_KEY);
  
  return checkApiKeyStatus();
}
