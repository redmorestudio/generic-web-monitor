/**
 * ONE-TIME SETUP FOR API KEY
 * 
 * Instructions:
 * 1. Replace 'YOUR_ACTUAL_API_KEY_HERE' with your real Anthropic API key
 * 2. Run setupApiKeyOnce() function ONCE in the Script Editor
 * 3. Delete this file or remove the API key from the code after running
 * 4. The key will be securely stored in Script Properties
 */

function setupApiKeyOnce() {
  // IMPORTANT: Replace this with your actual API key
  const API_KEY = 'YOUR_ACTUAL_API_KEY_HERE';
  
  if (API_KEY === 'YOUR_ACTUAL_API_KEY_HERE') {
    return { 
      error: 'Please replace YOUR_ACTUAL_API_KEY_HERE with your actual API key first!' 
    };
  }
  
  try {
    // Store the API key securely
    PropertiesService.getScriptProperties().setProperty('CLAUDE_API_KEY', API_KEY);
    
    // Test the connection
    const testResult = testApiKeyConnection(API_KEY);
    
    // Log the setup
    console.log('API Key Setup Complete:', testResult);
    
    // Clear the key from memory
    API_KEY = null;
    
    return {
      success: true,
      message: 'API key stored securely in Script Properties',
      test: testResult,
      nextStep: 'You can now delete this file or remove the API key from the code'
    };
  } catch (error) {
    return {
      error: 'Failed to set API key: ' + error.toString()
    };
  }
}

function testApiKeyConnection(apiKey) {
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
    
    return {
      connected: response.getResponseCode() === 200,
      status: response.getResponseCode()
    };
  } catch (error) {
    return {
      connected: false,
      error: error.toString()
    };
  }
}

// Function to verify API key is set (safe to keep in code)
function verifyApiKeySetup() {
  const hasKey = PropertiesService.getScriptProperties().getProperty('CLAUDE_API_KEY') !== null;
  
  if (!hasKey) {
    return {
      setup: false,
      message: 'No API key found. Please run setupApiKeyOnce() with your API key.'
    };
  }
  
  const testResult = testLLMConnection();
  
  return {
    setup: true,
    connection: testResult.success,
    message: testResult.success ? 
      'API key is set and working!' : 
      'API key is set but connection failed: ' + testResult.error
  };
}
