/**
 * Authorization Test - Run this to trigger permission prompts
 */

function testAuthorizationAndApiKey() {
  console.log('Testing authorization and API key...');
  
  // Step 1: Check if we have the API key
  const apiKey = PropertiesService.getScriptProperties().getProperty('CLAUDE_API_KEY');
  
  if (!apiKey) {
    return 'No API key found in Script Properties';
  }
  
  console.log('API key found!');
  
  // Step 2: Test a simple external request first
  try {
    console.log('Testing basic external request...');
    const testResponse = UrlFetchApp.fetch('https://api.github.com');
    console.log('External request successful! Status:', testResponse.getResponseCode());
  } catch (error) {
    console.log('External request failed:', error.toString());
    return 'Need to authorize external requests: ' + error.toString();
  }
  
  // Step 3: Test Anthropic API
  try {
    console.log('Testing Anthropic API...');
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
        messages: [{ role: 'user', content: 'Hi' }]
      }),
      muteHttpExceptions: true
    });
    
    const code = response.getResponseCode();
    const text = response.getContentText();
    
    console.log('Anthropic API response code:', code);
    
    if (code === 200) {
      const result = JSON.parse(text);
      return {
        success: true,
        message: 'Everything is working! Claude responded with: ' + result.content[0].text,
        apiKeyWorking: true,
        authorizationWorking: true
      };
    } else {
      return {
        success: false,
        message: 'API key might be invalid. Response code: ' + code,
        responseText: text.substring(0, 200)
      };
    }
    
  } catch (error) {
    return {
      success: false,
      message: 'Error calling Anthropic API: ' + error.toString()
    };
  }
}

/**
 * Simple function to test basic connectivity
 */
function simpleTest() {
  return {
    timestamp: new Date().toISOString(),
    hasApiKey: PropertiesService.getScriptProperties().getProperty('CLAUDE_API_KEY') !== null,
    message: 'Basic test complete'
  };
}
