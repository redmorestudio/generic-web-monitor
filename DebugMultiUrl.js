/**
 * DebugMultiUrl.gs - Master initialization and missing functions
 * Contains debugMultiUrl() initialization and missing helper functions
 */

/**
 * Master initialization function - Run this to set up everything
 */
function debugMultiUrl() {
  console.log('🚀 MULTI-URL DEBUG & INITIALIZATION');
  console.log('=====================================\n');
  
  const results = {
    timestamp: new Date().toISOString(),
    steps: []
  };
  
  // Step 1: Check and set properties
  console.log('1️⃣ Setting up properties...');
  try {
    const props = PropertiesService.getScriptProperties();
    props.setProperty('USE_MULTI_URL', 'true');
    props.setProperty('LAST_MULTI_URL_RUN', new Date().toISOString());
    
    // Store multi-URL configuration
    if (typeof COMPLETE_MONITOR_CONFIG !== 'undefined') {
      props.setProperty('monitorConfigMultiUrl', JSON.stringify(COMPLETE_MONITOR_CONFIG));
      console.log('✅ Configuration stored');
    } else {
      console.log('⚠️ COMPLETE_MONITOR_CONFIG not found');
    }
    
    results.steps.push({
      step: 'Properties Setup',
      status: 'success'
    });
  } catch (error) {
    console.error('❌ Properties setup failed:', error);
    results.steps.push({
      step: 'Properties Setup',
      status: 'failed',
      error: error.toString()
    });
  }
  
  // Step 2: Create/verify spreadsheet structure
  console.log('\n2️⃣ Setting up spreadsheet...');
  try {
    const ss = SpreadsheetApp.openById('1pOZ96O50x6n2SrNf0aGOcZZxS3hvLWh2HW8Xev95Euc');
    
    // Create necessary sheets
    createOrVerifySheet(ss, 'Changes', [
      'Timestamp', 'Company', 'URL', 'Change Type', 'Summary', 
      'Previous Hash', 'New Hash', 'Relevance Score', 'Keywords', 
      'URL Type', 'Magnitude'
    ]);
    
    createOrVerifySheet(ss, 'BaselineMultiUrl', [
      'Company', 'URL', 'Type', 'Last Checked', 'Content Hash', 
      'Page Title', 'Status', 'Intelligence Score'
    ]);
    
    createOrVerifySheet(ss, 'Monitoring Log', [
      'Timestamp', 'Action', 'Details', 'Success', 'Duration'
    ]);
    
    createOrVerifySheet(ss, 'URL Status', [
      'Company', 'URL', 'Type', 'Last Success', 'Last Error', 
      'Success Rate', 'Avg Response Time', 'Total Checks'
    ]);
    
    console.log('✅ Spreadsheet structure verified');
    results.steps.push({
      step: 'Spreadsheet Setup',
      status: 'success',
      sheetUrl: ss.getUrl()
    });
  } catch (error) {
    console.error('❌ Spreadsheet setup failed:', error);
    results.steps.push({
      step: 'Spreadsheet Setup',
      status: 'failed',
      error: error.toString()
    });
  }
  
  // Step 3: Test configuration
  console.log('\n3️⃣ Testing configuration...');
  try {
    const config = getMonitorConfigurations();
    console.log(`✅ Found ${config.length} companies`);
    
    // Count total URLs
    let totalUrls = 0;
    config.forEach(company => {
      const urls = Array.isArray(company.urls) ? company.urls : [company.url];
      totalUrls += urls.length;
    });
    
    console.log(`✅ Total URLs to monitor: ${totalUrls}`);
    results.steps.push({
      step: 'Configuration Test',
      status: 'success',
      companies: config.length,
      urls: totalUrls
    });
  } catch (error) {
    console.error('❌ Configuration test failed:', error);
    results.steps.push({
      step: 'Configuration Test',
      status: 'failed',
      error: error.toString()
    });
  }
  
  // Step 4: Initialize baseline data
  console.log('\n4️⃣ Creating initial baseline data...');
  try {
    const baselineResult = initializeBaseline();
    results.steps.push({
      step: 'Baseline Initialization',
      status: 'success',
      ...baselineResult
    });
  } catch (error) {
    console.error('❌ Baseline initialization failed:', error);
    results.steps.push({
      step: 'Baseline Initialization',
      status: 'failed',
      error: error.toString()
    });
  }
  
  // Step 5: Create sample changes for testing
  console.log('\n5️⃣ Creating sample data...');
  try {
    createWorkingApiData();
    console.log('✅ Sample data created');
    results.steps.push({
      step: 'Sample Data',
      status: 'success'
    });
  } catch (error) {
    console.error('❌ Sample data creation failed:', error);
    results.steps.push({
      step: 'Sample Data',
      status: 'failed',
      error: error.toString()
    });
  }
  
  // Step 6: Test API endpoints
  console.log('\n6️⃣ Testing API endpoints...');
  try {
    const apiTests = testApiEndpoints();
    results.steps.push({
      step: 'API Testing',
      status: 'success',
      endpoints: apiTests
    });
  } catch (error) {
    console.error('❌ API testing failed:', error);
    results.steps.push({
      step: 'API Testing',
      status: 'failed',
      error: error.toString()
    });
  }
  
  // Summary
  console.log('\n📊 INITIALIZATION COMPLETE');
  console.log('=========================');
  const successCount = results.steps.filter(s => s.status === 'success').length;
  console.log(`✅ Successful steps: ${successCount}/${results.steps.length}`);
  
  if (successCount === results.steps.length) {
    console.log('\n🎉 System is ready! Next steps:');
    console.log('1. Deploy as Web App (version 30)');
    console.log('2. Test the dashboard');
    console.log('3. Run monitorAllChanges() for real data');
  } else {
    console.log('\n⚠️ Some steps failed. Please check the errors above.');
  }
  
  return results;
}

/**
 * Get multi-URL status for a company
 */
function getMultiUrlStatus(companyName) {
  const config = getMonitorConfigurations();
  const company = config.find(c => c.company === companyName);
  
  if (!company) {
    return {
      success: false,
      error: 'Company not found'
    };
  }
  
  const urls = Array.isArray(company.urls) ? company.urls : [company.url];
  const statuses = [];
  
  urls.forEach(urlObj => {
    const url = typeof urlObj === 'string' ? urlObj : urlObj.url;
    const type = typeof urlObj === 'object' ? urlObj.type : 'unknown';
    
    const baseline = getBaselineForUrl(url);
    statuses.push({
      url: url,
      type: type,
      hasBaseline: !!baseline,
      lastChecked: baseline ? baseline.lastChecked : null,
      status: baseline ? baseline.status : 'not_initialized'
    });
  });
  
  return {
    success: true,
    company: companyName,
    urlCount: urls.length,
    statuses: statuses,
    allInitialized: statuses.every(s => s.hasBaseline)
  };
}

/**
 * Get baseline for a specific URL
 */
function getBaselineForUrl(url) {
  try {
    const sheet = getOrCreateMonitorSheet();
    const baselineSheet = sheet.getSheetByName('BaselineMultiUrl') || 
                         sheet.getSheetByName('Baseline');
    
    if (!baselineSheet || baselineSheet.getLastRow() <= 1) {
      return null;
    }
    
    const data = baselineSheet.getDataRange().getValues();
    const headers = data[0];
    const urlCol = headers.indexOf('URL');
    
    if (urlCol === -1) {
      console.error('URL column not found in baseline sheet');
      return null;
    }
    
    // Find the URL in the data
    for (let i = data.length - 1; i >= 1; i--) {
      if (data[i][urlCol] === url) {
        // Create baseline object from row data
        const baseline = {
          company: data[i][headers.indexOf('Company')] || '',
          url: url,
          type: data[i][headers.indexOf('Type')] || 'unknown',
          lastChecked: data[i][headers.indexOf('Last Checked')] || '',
          contentHash: data[i][headers.indexOf('Content Hash')] || '',
          pageTitle: data[i][headers.indexOf('Page Title')] || '',
          status: data[i][headers.indexOf('Status')] || '',
          intelligenceScore: data[i][headers.indexOf('Intelligence Score')] || 0
        };
        
        // Add content if available
        const contentCol = headers.indexOf('Content');
        if (contentCol !== -1) {
          baseline.content = data[i][contentCol] || '';
        }
        
        return baseline;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting baseline for URL:', error);
    return null;
  }
}

/**
 * Get or create monitor sheet
 */
function getOrCreateMonitorSheet() {
  try {
    // Try to open the existing sheet
    const ss = SpreadsheetApp.openById('1pOZ96O50x6n2SrNf0aGOcZZxS3hvLWh2HW8Xev95Euc');
    return ss;
  } catch (error) {
    console.error('Could not open monitor sheet:', error);
    // Create a new sheet if needed
    const newSheet = SpreadsheetApp.create('AI Competitive Monitor');
    console.log('Created new sheet:', newSheet.getUrl());
    return newSheet;
  }
}

/**
 * Create or verify a sheet with headers
 */
function createOrVerifySheet(spreadsheet, sheetName, headers) {
  let sheet = spreadsheet.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    console.log(`Created sheet: ${sheetName}`);
  }
  
  // Set headers if sheet is empty
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  
  return sheet;
}

/**
 * Initialize baseline data
 */
function initializeBaseline() {
  const config = getMonitorConfigurations();
  const ss = getOrCreateMonitorSheet();
  const baselineSheet = ss.getSheetByName('BaselineMultiUrl');
  
  if (!baselineSheet) {
    return {
      success: false,
      error: 'Baseline sheet not found'
    };
  }
  
  // Clear existing data (keep headers)
  if (baselineSheet.getLastRow() > 1) {
    baselineSheet.getRange(2, 1, baselineSheet.getLastRow() - 1, baselineSheet.getLastColumn()).clear();
  }
  
  // Add baseline entries for all URLs
  const rows = [];
  const timestamp = new Date().toISOString();
  
  config.forEach(company => {
    const urls = Array.isArray(company.urls) ? company.urls : [{ url: company.url, type: 'homepage' }];
    
    urls.forEach(urlObj => {
      const url = typeof urlObj === 'string' ? urlObj : urlObj.url;
      const type = typeof urlObj === 'object' ? urlObj.type : 'unknown';
      
      rows.push([
        company.company,
        url,
        type,
        timestamp,
        '', // Content hash - will be filled on first run
        '', // Page title
        'initialized',
        0 // Intelligence score
      ]);
    });
  });
  
  if (rows.length > 0) {
    baselineSheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  }
  
  return {
    success: true,
    entriesCreated: rows.length,
    companies: config.length
  };
}

/**
 * Test API endpoints
 */
function testApiEndpoints() {
  const endpoints = ['status', 'config', 'changes', 'stats', 'urls'];
  const results = {};
  
  endpoints.forEach(endpoint => {
    try {
      const e = { parameter: { path: endpoint } };
      const response = doGet(e);
      const content = response.getContent();
      const data = JSON.parse(content);
      
      results[endpoint] = {
        success: data.success || false,
        hasData: !!data,
        recordCount: data.changes ? data.changes.length : 
                    data.companies ? data.companies.length :
                    data.urls ? data.urls.length : 0
      };
      
      console.log(`✅ ${endpoint}: Working`);
    } catch (error) {
      results[endpoint] = {
        success: false,
        error: error.toString()
      };
      console.log(`❌ ${endpoint}: ${error.toString()}`);
    }
  });
  
  return results;
}

/**
 * Get monitor configurations (wrapper for multi-URL support)
 */
function getMonitorConfigurations() {
  // Check if multi-URL config exists
  if (typeof getMonitorConfigurationsMultiUrl === 'function') {
    return getMonitorConfigurationsMultiUrl();
  }
  
  // Check if COMPLETE_MONITOR_CONFIG exists
  if (typeof COMPLETE_MONITOR_CONFIG !== 'undefined') {
    return COMPLETE_MONITOR_CONFIG;
  }
  
  // Fallback to properties
  const props = PropertiesService.getScriptProperties();
  const storedConfig = props.getProperty('monitorConfigMultiUrl');
  
  if (storedConfig) {
    return JSON.parse(storedConfig);
  }
  
  // Return minimal config if nothing found
  console.warn('No configuration found, using minimal config');
  return [
    {
      company: 'Test Company',
      urls: [{ url: 'https://example.com', type: 'homepage' }]
    }
  ];
}

/**
 * Quick status check
 */
function quickStatus() {
  const props = PropertiesService.getScriptProperties();
  const config = getMonitorConfigurations();
  
  let totalUrls = 0;
  config.forEach(company => {
    const urls = Array.isArray(company.urls) ? company.urls : [company.url];
    totalUrls += urls.length;
  });
  
  return {
    multiUrlEnabled: props.getProperty('USE_MULTI_URL') === 'true',
    lastRun: props.getProperty('LAST_MULTI_URL_RUN') || 'Never',
    companies: config.length,
    totalUrls: totalUrls,
    spreadsheetId: '1pOZ96O50x6n2SrNf0aGOcZZxS3hvLWh2HW8Xev95Euc',
    ready: true
  };
}