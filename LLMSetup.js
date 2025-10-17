/**
 * Simple LLM Setup - Add this to your existing script
 * Copy this entire file into Google Apps Script as a new file called "LLMSetup.gs"
 */

// Store the API key
function setApiKey(apiKey) {
  PropertiesService.getScriptProperties().setProperty('CLAUDE_API_KEY', apiKey);
  logActivity('Claude API key set', 'success');
  return { success: true, message: 'API key stored successfully' };
}

// Test Claude connection
function testLLMConnection() {
  const apiKey = PropertiesService.getScriptProperties().getProperty('CLAUDE_API_KEY');
  if (!apiKey) {
    return { success: false, error: 'No API key set. Run setApiKey first.' };
  }
  
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
        messages: [{ role: 'user', content: 'Hi' }]
      }),
      muteHttpExceptions: true
    });
    
    const code = response.getResponseCode();
    if (code === 200) {
      return { success: true, message: 'Claude connection successful!' };
    } else {
      return { success: false, error: 'API returned code ' + code };
    }
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// Get LLM stats
function getLLMStats() {
  const props = PropertiesService.getScriptProperties();
  const apiKey = props.getProperty('CLAUDE_API_KEY');
  
  return {
    configured: !!apiKey,
    apiKeySet: !!apiKey,
    provider: 'anthropic',
    model: 'claude-3-haiku-20240307',
    status: apiKey ? 'Ready to use' : 'Need to set API key'
  };
}

// Quick setup function - Run this!
function setupClaudeNow() {
  // Your API key - REPLACE WITH YOUR ACTUAL KEY
  const apiKey = 'YOUR_ANTHROPIC_API_KEY_HERE';
  
  // Set the key
  const keyResult = setApiKey(apiKey);
  
  // Test connection
  const testResult = testLLMConnection();
  
  // Return results
  return {
    setup: keyResult,
    connection: testResult,
    stats: getLLMStats(),
    message: testResult.success ? 
      '🎉 Claude is connected and ready!' : 
      '❌ Setup complete but connection failed'
  };
}

// Test Claude analysis on a URL
function testClaudeAnalysis(url) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('CLAUDE_API_KEY');
  if (!apiKey) {
    return { success: false, error: 'No API key set' };
  }
  
  try {
    // Get the content first
    const extraction = testContentExtraction(url);
    if (!extraction.success) {
      return extraction;
    }
    
    // Create a simple prompt
    const prompt = `Analyze this website content for competitive intelligence:

URL: ${url}
Content preview: ${extraction.contentPreview}

Extract:
1. Main products/features mentioned
2. Key messaging themes
3. Any pricing information
4. Competitive positioning
5. Strategic insights

Format as JSON.`;

    // Call Claude
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
        messages: [{ role: 'user', content: prompt }]
      })
    });
    
    const result = JSON.parse(response.getContentText());
    const analysis = JSON.parse(result.content[0].text);
    
    return {
      success: true,
      url: url,
      basicIntelligence: extraction.intelligence,
      claudeAnalysis: analysis,
      preview: extraction.contentPreview.substring(0, 200)
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}