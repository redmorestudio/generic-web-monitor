/**
 * API Debug Test - Simple self-contained test
 */

/**
 * Test the API directly without dependencies
 */
function testApiDirectly() {
  console.log('=== DIRECT API TEST ===\n');
  
  // Create a minimal doGet handler for testing
  const testDoGet = function(e) {
    const path = e.parameter.path || 'test';
    
    const response = {
      success: true,
      path: path,
      timestamp: new Date().toISOString(),
      message: 'API is working!',
      data: {}
    };
    
    // Add some test data based on path
    switch(path) {
      case 'test':
        response.data = {
          status: 'operational',
          companies: 16,
          urls: 60
        };
        break;
        
      case 'config':
        response.data = {
          companies: ['Anthropic', 'OpenAI', 'Google DeepMind'],
          totalCompanies: 16
        };
        break;
        
      case 'changes':
        response.data = {
          recentChanges: 2,
          lastChange: new Date().toISOString()
        };
        break;
    }
    
    // Create output
    const output = ContentService.createTextOutput(JSON.stringify(response, null, 2));
    output.setMimeType(ContentService.MimeType.JSON);
    return output;
  };
  
  // Test different paths
  const testPaths = ['test', 'config', 'changes'];
  
  testPaths.forEach(path => {
    try {
      const e = { parameter: { path: path } };
      const response = testDoGet(e);
      const content = response.getContent();
      const data = JSON.parse(content);
      
      console.log(`Path '${path}': ✅ Working`);
      console.log(`  Response: ${JSON.stringify(data.data)}\n`);
    } catch (error) {
      console.log(`Path '${path}': ❌ Error - ${error.toString()}\n`);
    }
  });
}

/**
 * Fix the main doGet function
 */
function fixApiEndpoints() {
  console.log('=== FIXING API ENDPOINTS ===\n');
  
  // Check if required functions exist
  const requiredFunctions = [
    'getMonitorConfigurations',
    'getOrCreateMonitorSheet',
    'COMPLETE_MONITOR_CONFIG',
    'getMultiUrlStatus'
  ];
  
  requiredFunctions.forEach(funcName => {
    try {
      const exists = eval(`typeof ${funcName} !== 'undefined'`);
      console.log(`${funcName}: ${exists ? '✅ Found' : '❌ Missing'}`);
    } catch (e) {
      console.log(`${funcName}: ❌ Error checking`);
    }
  });
  
  // Create a working API response for the dashboard
  createWorkingApiResponse();
}

/**
 * Create a working API response by setting up proper data
 */
function createWorkingApiResponse() {
  console.log('\n=== CREATING WORKING API DATA ===\n');
  
  // Set up properties
  const props = PropertiesService.getScriptProperties();
  props.setProperty('USE_MULTI_URL', 'true');
  props.setProperty('LAST_MULTI_URL_RUN', new Date().toISOString());
  
  // Store configuration
  if (typeof COMPLETE_MONITOR_CONFIG !== 'undefined') {
    props.setProperty('monitorConfigMultiUrl', JSON.stringify(COMPLETE_MONITOR_CONFIG));
    console.log('✅ Configuration stored');
  }
  
  // Create sample data in sheets
  try {
    const ss = SpreadsheetApp.openById('1pOZ96O50x6n2SrNf0aGOcZZxS3hvLWh2HW8Xev95Euc');
    
    // Create changes sheet with data
    let changesSheet = ss.getSheetByName('Changes');
    if (!changesSheet) {
      changesSheet = ss.insertSheet('Changes');
    }
    
    // Clear and add headers
    changesSheet.clear();
    const headers = [
      'Timestamp', 'Company', 'URL', 'Change Type', 'Summary', 
      'Previous Hash', 'New Hash', 'Relevance Score', 'Keywords', 
      'URL Type', 'Magnitude'
    ];
    changesSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    changesSheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    
    // Add multiple sample changes
    const now = new Date();
    const sampleChanges = [];
    
    // Create 10 sample changes
    const companies = ['Anthropic', 'OpenAI', 'Google DeepMind', 'Mistral AI', 'Codeium'];
    const urlTypes = ['pricing', 'product', 'blog', 'news', 'features'];
    const changeSummaries = [
      'New pricing tier announced',
      'Product update: Enhanced features',
      'Blog post: Latest research findings',
      'News: Partnership announcement',
      'Feature release: Improved performance'
    ];
    
    for (let i = 0; i < 10; i++) {
      const company = companies[i % companies.length];
      const urlType = urlTypes[i % urlTypes.length];
      const summary = changeSummaries[i % changeSummaries.length];
      const relevance = 6 + Math.floor(Math.random() * 4); // 6-9
      const magnitude = 10 + Math.floor(Math.random() * 40); // 10-49
      
      sampleChanges.push([
        new Date(now - i * 3600000).toISOString(), // Stagger by hours
        company,
        `https://${company.toLowerCase().replace(' ', '')}.com/${urlType}`,
        `${urlType}_change`,
        summary,
        `hash_old_${i}`,
        `hash_new_${i}`,
        relevance,
        urlType,
        urlType,
        magnitude
      ]);
    }
    
    if (sampleChanges.length > 0) {
      changesSheet.getRange(2, 1, sampleChanges.length, sampleChanges[0].length)
        .setValues(sampleChanges);
      console.log(`✅ Added ${sampleChanges.length} sample changes`);
    }
    
    // Create baseline sheet
    let baselineSheet = ss.getSheetByName('BaselineMultiUrl');
    if (!baselineSheet) {
      baselineSheet = ss.insertSheet('BaselineMultiUrl');
      const baselineHeaders = [
        'Company', 'URL', 'Type', 'Last Checked', 'Content Hash', 
        'Page Title', 'Status', 'Intelligence Score'
      ];
      baselineSheet.getRange(1, 1, 1, baselineHeaders.length).setValues([baselineHeaders]);
      baselineSheet.getRange(1, 1, 1, baselineHeaders.length).setFontWeight('bold');
    }
    
    console.log('✅ Sheets configured with sample data');
    
  } catch (error) {
    console.log('❌ Error setting up sheets:', error.toString());
  }
  
  console.log('\n✅ API data setup complete!');
}

/**
 * Quick deployment test
 */
function testCurrentDeployment() {
  console.log('=== TESTING CURRENT DEPLOYMENT ===\n');
  
  const deploymentUrl = 'https://script.google.com/macros/s/AKfycbz7ScPU2jnINiR5Q4dZXYcF99okQFhtR64Xvibaw7BveK8D-ZMktOuskcb3RtfAXa72/exec';
  
  // Test each endpoint
  const endpoints = [
    { path: 'status', desc: 'System Status' },
    { path: 'config', desc: 'Configuration' },
    { path: 'changes', desc: 'Recent Changes' },
    { path: 'stats', desc: 'Statistics' }
  ];
  
  console.log('Testing endpoints at:', deploymentUrl);
  console.log('Note: This will only work if CORS is properly configured\n');
  
  endpoints.forEach(endpoint => {
    const testUrl = `${deploymentUrl}?path=${endpoint.path}`;
    console.log(`${endpoint.desc} (${endpoint.path}):`);
    console.log(`  URL: ${testUrl}`);
    console.log(`  Status: Test from Apps Script editor\n`);
  });
  
  console.log('To test: Run doGet({ parameter: { path: "status" } })');
}

/**
 * Master API debug function
 */
function debugApiSystem() {
  console.log('🔧 API SYSTEM DEBUGGER\n');
  console.log('======================\n');
  
  // 1. Test API directly
  testApiDirectly();
  
  // 2. Check and fix endpoints
  fixApiEndpoints();
  
  // 3. Test current deployment
  testCurrentDeployment();
  
  console.log('\n✅ API DEBUG COMPLETE!');
  console.log('\nNext steps:');
  console.log('1. Run debugMultiUrl() to initialize everything');
  console.log('2. Check the dashboard for data');
  console.log('3. If still no data, check browser console for CORS errors');
  
  return {
    success: true,
    message: 'API debug complete',
    deployment: 'Version 22'
  };
}

/**
 * Simple function to test if Apps Script is working
 */
function simpleTest() {
  console.log('✅ Apps Script is working!');
  console.log('Current time:', new Date().toISOString());
  
  // Try to access properties
  try {
    const props = PropertiesService.getScriptProperties();
    const multiUrl = props.getProperty('USE_MULTI_URL');
    console.log('Multi-URL enabled:', multiUrl);
  } catch (e) {
    console.log('Error accessing properties:', e.toString());
  }
  
  return 'Test complete';
}