/**
 * Quick Trigger for AI Monitor
 * Run this to start the monitoring process
 */

function triggerMonitoring() {
  console.log('🚀 Starting AI Monitor with expanded configuration...');
  console.log('📊 Monitoring ~45 companies across AI sectors');
  
  try {
    // Check Claude configuration
    const claudeStatus = checkClaudeConfiguration();
    console.log('Claude status:', claudeStatus);
    
    if (!claudeStatus.apiKeySet) {
      return {
        error: 'Claude API key not set. Please run setupClaudeApiKey() first.',
        instructions: 'Get your API key from https://console.anthropic.com/'
      };
    }
    
    // Run the monitoring
    const result = runAIMonitorAndUpdateTheBrain();
    
    console.log('✅ Monitoring complete!');
    console.log('📈 Results:', result);
    
    // Return data for TheBrain
    return {
      success: true,
      message: 'Monitoring complete. Data ready for TheBrain integration.',
      results: result,
      nextStep: 'Run integrateWithTheBrain() to update the knowledge graph'
    };
    
  } catch (error) {
    console.error('❌ Error during monitoring:', error);
    return {
      error: error.toString(),
      stack: error.stack
    };
  }
}

/**
 * Quick test with 3 companies
 */
function quickTest() {
  console.log('🧪 Running quick test with 3 companies...');
  
  const testCompanies = ['Anthropic', 'OpenAI', 'Perplexity AI'];
  const config = getExpandedMonitorConfigurations();
  const testConfigs = config.filter(c => testCompanies.includes(c.company));
  
  const results = {
    tested: [],
    entities: {
      products: [],
      technologies: []
    }
  };
  
  testConfigs.forEach(monitor => {
    console.log(`Testing ${monitor.company}...`);
    try {
      const result = processMonitorWithEntities(monitor);
      results.tested.push({
        company: monitor.company,
        urls: result.urls.length,
        changes: result.changes.length,
        entities: result.entities.length
      });
      
      // Aggregate entities
      result.entities.forEach(e => {
        if (e.products) results.entities.products.push(...e.products);
        if (e.technologies) results.entities.technologies.push(...e.technologies);
      });
      
    } catch (error) {
      console.error(`Error testing ${monitor.company}:`, error);
    }
  });
  
  console.log('✅ Quick test complete!');
  console.log('Results:', results);
  
  return results;
}

/**
 * Setup Claude API key
 */
function setupClaudeApiKey() {
  // This would normally have UI, but for now just log instructions
  return {
    instructions: [
      '1. Get your Claude API key from https://console.anthropic.com/',
      '2. In Google Apps Script, go to Project Settings (gear icon)',
      '3. Scroll down to Script Properties',
      '4. Add property: CLAUDE_API_KEY = your-api-key-here',
      '5. Save and run triggerMonitoring() again'
    ]
  };
}

/**
 * Main dashboard function
 */
function getMonitoringDashboard() {
  const claudeStatus = checkClaudeConfiguration();
  const props = PropertiesService.getScriptProperties();
  const lastResults = props.getProperty('latestMonitoringResults');
  
  return {
    status: {
      claude: claudeStatus,
      lastRun: lastResults ? JSON.parse(lastResults) : null
    },
    configuration: {
      totalCompanies: getExpandedMonitorConfigurations().length,
      categories: getCompaniesByCategory()
    },
    actions: {
      runFull: 'triggerMonitoring()',
      runTest: 'quickTest()',
      setupClaude: 'setupClaudeApiKey()'
    }
  };
}
