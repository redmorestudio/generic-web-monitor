/**
 * Complete Diagnostic & Fix Script for AI Competitor Monitor
 * Run each function to diagnose and fix issues
 */

// ============= DIAGNOSTIC FUNCTIONS =============

/**
 * Run all diagnostics and report issues
 */
function runCompleteDiagnostics() {
  console.log('=== AI COMPETITOR MONITOR DIAGNOSTICS ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('');
  
  // Test 1: Authentication & Permissions
  console.log('1. AUTHENTICATION & PERMISSIONS:');
  testAuthenticationAndPermissions();
  console.log('');
  
  // Test 2: Script Properties
  console.log('2. SCRIPT PROPERTIES:');
  testScriptProperties();
  console.log('');
  
  // Test 3: Spreadsheet Access
  console.log('3. SPREADSHEET ACCESS:');
  testSpreadsheetAccess();
  console.log('');
  
  // Test 4: Web App Functions
  console.log('4. WEB APP FUNCTIONS:');
  testWebAppFunctions();
  console.log('');
  
  // Test 5: External Requests
  console.log('5. EXTERNAL REQUESTS:');
  testExternalRequests();
  console.log('');
  
  // Test 6: Deployment Status
  console.log('6. DEPLOYMENT STATUS:');
  checkDeploymentStatus();
  console.log('');
  
  console.log('=== DIAGNOSTICS COMPLETE ===');
}

/**
 * Test authentication and permissions
 */
function testAuthenticationAndPermissions() {
  try {
    // Check user email
    const email = Session.getActiveUser().getEmail();
    console.log('✓ Active user:', email || 'Not available (normal in web app context)');
    
    // Check effective user
    const effectiveEmail = Session.getEffectiveUser().getEmail();
    console.log('✓ Effective user:', effectiveEmail || 'Not available');
    
    // Check OAuth scopes
    const manifest = {
      timeZone: "America/New_York",
      dependencies: {},
      exceptionLogging: "STACKDRIVER",
      runtimeVersion: "V8",
      oauthScopes: [
        "https://www.googleapis.com/auth/script.external_request",
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/script.scriptapp",
        "https://www.googleapis.com/auth/userinfo.email"
      ]
    };
    console.log('✓ Required OAuth scopes:', manifest.oauthScopes);
    
  } catch (error) {
    console.error('✗ Authentication test failed:', error.toString());
  }
}

/**
 * Test Script Properties
 */
function testScriptProperties() {
  try {
    const props = PropertiesService.getScriptProperties();
    const allProps = props.getProperties();
    
    // Check required properties
    const required = ['SPREADSHEET_ID', 'USE_MULTI_URL'];
    const optional = ['CLAUDE_API_KEY', 'WEBHOOK_URL'];
    
    console.log('Required properties:');
    required.forEach(key => {
      if (allProps[key]) {
        console.log(`✓ ${key}: ${allProps[key].substring(0, 20)}...`);
      } else {
        console.log(`✗ ${key}: MISSING`);
      }
    });
    
    console.log('Optional properties:');
    optional.forEach(key => {
      if (allProps[key]) {
        console.log(`✓ ${key}: Set`);
      } else {
        console.log(`- ${key}: Not set`);
      }
    });
    
    console.log('Total properties:', Object.keys(allProps).length);
    
  } catch (error) {
    console.error('✗ Script Properties test failed:', error.toString());
  }
}

/**
 * Test Spreadsheet Access
 */
function testSpreadsheetAccess() {
  try {
    const props = PropertiesService.getScriptProperties();
    const ssId = props.getProperty('SPREADSHEET_ID');
    
    if (!ssId) {
      console.error('✗ No SPREADSHEET_ID found in Script Properties');
      return;
    }
    
    // Try to open spreadsheet
    const ss = SpreadsheetApp.openById(ssId);
    console.log('✓ Spreadsheet name:', ss.getName());
    console.log('✓ Spreadsheet URL:', ss.getUrl());
    
    // Check sheets
    const sheets = ss.getSheets();
    console.log('✓ Number of sheets:', sheets.length);
    console.log('✓ Sheet names:', sheets.map(s => s.getName()).join(', '));
    
    // Check for required sheets
    const requiredSheets = ['Data', 'Statistics', 'Configuration'];
    requiredSheets.forEach(sheetName => {
      const sheet = ss.getSheetByName(sheetName);
      if (sheet) {
        console.log(`✓ ${sheetName} sheet: Found (${sheet.getLastRow()} rows)`);
      } else {
        console.log(`✗ ${sheetName} sheet: MISSING`);
      }
    });
    
  } catch (error) {
    console.error('✗ Spreadsheet access test failed:', error.toString());
  }
}

/**
 * Test Web App Functions
 */
function testWebAppFunctions() {
  try {
    // Test getBaselineForUrl
    console.log('Testing getBaselineForUrl:');
    
    // Test with null
    const nullResult = getBaselineForUrl(null);
    console.log('- With null:', nullResult === null ? '✓ Returns null' : '✗ Unexpected result');
    
    // Test with empty string
    const emptyResult = getBaselineForUrl('');
    console.log('- With empty string:', emptyResult === null ? '✓ Returns null' : '✗ Unexpected result');
    
    // Test with valid URL
    const validResult = getBaselineForUrl('https://example.com');
    console.log('- With valid URL:', validResult !== undefined ? '✓ Returns value' : '✗ Failed');
    
    // Test getMultiUrlStatus
    console.log('Testing getMultiUrlStatus:');
    const multiUrlStatus = getMultiUrlStatus();
    console.log('- Enabled:', multiUrlStatus.enabled);
    console.log('- URL count:', multiUrlStatus.urlCount);
    console.log('- Companies:', multiUrlStatus.companies.length);
    
  } catch (error) {
    console.error('✗ Web app functions test failed:', error.toString());
  }
}

/**
 * Test External Requests
 */
function testExternalRequests() {
  try {
    // Test basic fetch
    const response = UrlFetchApp.fetch('https://api.ipify.org?format=json');
    const data = JSON.parse(response.getContentText());
    console.log('✓ Can make external requests. IP:', data.ip);
    
    // Test with headers
    const response2 = UrlFetchApp.fetch('https://httpbin.org/headers', {
      headers: {
        'User-Agent': 'AI-Competitor-Monitor/1.0'
      }
    });
    console.log('✓ Can send custom headers');
    
  } catch (error) {
    console.error('✗ External requests test failed:', error.toString());
  }
}

/**
 * Check deployment status
 */
function checkDeploymentStatus() {
  try {
    // Simulate doGet request
    const testRequest = {
      parameter: {
        path: 'status'
      }
    };
    
    const response = doGet(testRequest);
    const content = response.getContent();
    const data = JSON.parse(content);
    
    console.log('✓ Web app responds to requests');
    console.log('- Success:', data.success);
    console.log('- Has data:', data.data !== undefined);
    
  } catch (error) {
    console.error('✗ Deployment test failed:', error.toString());
  }
}

// ============= FIX FUNCTIONS =============

/**
 * Fix missing Script Properties
 */
function fixScriptProperties() {
  console.log('Fixing Script Properties...');
  
  const props = PropertiesService.getScriptProperties();
  
  // Get existing properties
  const existing = props.getProperties();
  
  // Set defaults for missing properties
  const defaults = {
    'USE_MULTI_URL': 'true',
    'SPREADSHEET_ID': existing.SPREADSHEET_ID || 'YOUR_SPREADSHEET_ID_HERE',
    'CLAUDE_API_KEY': existing.CLAUDE_API_KEY || 'YOUR_CLAUDE_API_KEY_HERE'
  };
  
  // Only set if not already present
  Object.keys(defaults).forEach(key => {
    if (!existing[key]) {
      props.setProperty(key, defaults[key]);
      console.log(`Set ${key} = ${defaults[key]}`);
    } else {
      console.log(`${key} already set`);
    }
  });
  
  console.log('Script Properties fixed!');
}

/**
 * Fix spreadsheet structure
 */
function fixSpreadsheetStructure() {
  console.log('Fixing Spreadsheet Structure...');
  
  try {
    const props = PropertiesService.getScriptProperties();
    const ssId = props.getProperty('SPREADSHEET_ID');
    
    if (!ssId || ssId === 'YOUR_SPREADSHEET_ID_HERE') {
      console.error('Please set a valid SPREADSHEET_ID first');
      return;
    }
    
    const ss = SpreadsheetApp.openById(ssId);
    
    // Required sheets with headers
    const requiredSheets = {
      'Data': ['Timestamp', 'Company', 'URL', 'Status', 'Hash', 'Error', 'Response Time'],
      'Statistics': ['Date', 'Total Checks', 'Successful', 'Failed', 'Changes Detected', 'Average Response Time'],
      'Configuration': ['Company', 'URL', 'Category', 'Check Frequency', 'Keywords', 'CSS Selectors', 'Enabled'],
      'PageContent': ['Timestamp', 'URL', 'Title', 'Description', 'Content', 'Keywords Found'],
      'Logs': ['Timestamp', 'Level', 'Message', 'Details']
    };
    
    Object.entries(requiredSheets).forEach(([sheetName, headers]) => {
      let sheet = ss.getSheetByName(sheetName);
      
      if (!sheet) {
        sheet = ss.insertSheet(sheetName);
        console.log(`Created sheet: ${sheetName}`);
        
        // Add headers
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
        console.log(`Added headers to ${sheetName}`);
      } else {
        console.log(`Sheet ${sheetName} already exists`);
      }
    });
    
    console.log('Spreadsheet structure fixed!');
    
  } catch (error) {
    console.error('Failed to fix spreadsheet:', error.toString());
  }
}

/**
 * Deploy/Redeploy Web App
 */
function deployWebApp() {
  console.log('=== WEB APP DEPLOYMENT GUIDE ===');
  console.log('');
  console.log('1. Click "Deploy" button in the toolbar');
  console.log('2. Choose "Manage deployments"');
  console.log('3. Click "Edit" on existing deployment OR "New deployment"');
  console.log('4. Configure as follows:');
  console.log('   - Description: AI Competitor Monitor API');
  console.log('   - Execute as: Me (' + Session.getEffectiveUser().getEmail() + ')');
  console.log('   - Who has access: Anyone');
  console.log('5. Click "Deploy"');
  console.log('6. Copy the Web app URL');
  console.log('7. Update your GitHub Pages config with this URL');
  console.log('');
  console.log('Test URL format:');
  console.log('https://script.google.com/macros/s/[DEPLOYMENT_ID]/exec?path=status');
}

/**
 * Quick fix all issues
 */
function quickFixAll() {
  console.log('=== RUNNING QUICK FIX ALL ===');
  console.log('');
  
  // 1. Fix Script Properties
  console.log('Step 1: Fixing Script Properties...');
  fixScriptProperties();
  console.log('');
  
  // 2. Fix Spreadsheet Structure
  console.log('Step 2: Fixing Spreadsheet Structure...');
  fixSpreadsheetStructure();
  console.log('');
  
  // 3. Run diagnostics
  console.log('Step 3: Running Diagnostics...');
  runCompleteDiagnostics();
  console.log('');
  
  console.log('=== QUICK FIX COMPLETE ===');
  console.log('Next steps:');
  console.log('1. Set your SPREADSHEET_ID in Script Properties');
  console.log('2. Deploy/Redeploy as Web App (see deployWebApp() output)');
  console.log('3. Update GitHub Pages with new deployment URL');
}