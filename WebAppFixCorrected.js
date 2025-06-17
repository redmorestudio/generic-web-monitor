/**
 * Fixed version of WebApp.gs for AI Competitor Monitor
 * Includes proper null checking and error handling
 */

/**
 * Get baseline for a specific URL with proper null checking
 */
function getBaselineForUrl(url) {
  // Add null/undefined check
  if (!url || url === null || url === undefined || url === '') {
    console.error('getBaselineForUrl called with invalid URL:', url);
    return null;
  }
  
  try {
    const key = 'baseline_$' + Utilities.computeDigest(
      Utilities.DigestAlgorithm.MD5,
      url
    );
    
    const stored = PropertiesService.getScriptProperties().getProperty(key);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error in getBaselineForUrl:', error);
    return null;
  }
}

/**
 * Get multi-URL status with proper error handling
 */
function getMultiUrlStatus() {
  try {
    const props = PropertiesService.getScriptProperties();
    const isEnabled = props.getProperty('USE_MULTI_URL') === 'true';
    
    // Get configuration safely
    let config = [];
    try {
      config = getMonitorConfigurations();
    } catch (e) {
      // If getMonitorConfigurations fails, use COMPLETE_MONITOR_CONFIG directly
      if (typeof COMPLETE_MONITOR_CONFIG !== 'undefined') {
        config = COMPLETE_MONITOR_CONFIG;
      } else {
        console.error('Could not load monitor configurations:', e);
        config = [];
      }
    }
    
    return {
      enabled: isEnabled,
      urlCount: config.reduce((total, company) => {
        const urls = company.urls || [company.url].filter(u => u);
        return total + urls.length;
      }, 0),
      companies: config.map(company => ({
        name: company.name,
        urlCount: (company.urls || [company.url].filter(u => u)).length,
        urls: company.urls || [company.url].filter(u => u)
      }))
    };
  } catch (error) {
    console.error('Error in getMultiUrlStatus:', error);
    return {
      enabled: false,
      urlCount: 0,
      companies: []
    };
  }
}

/**
 * Main web app entry point with enhanced error handling
 */
function doGetOld(e) {
  try {
    const path = e.parameter.path || 'status';
    const response = {};
    
    switch(path) {
      case 'status':
        response.data = getSystemStatus();
        break;
        
      case 'baseline':
        const url = e.parameter.url;
        if (!url) {
          response.error = 'URL parameter is required for baseline endpoint';
          response.data = null;
        } else {
          response.data = getBaselineForUrl(url);
        }
        break;
        
      case 'monitor':
        response.data = checkAllCompanies();
        break;
        
      case 'config':
        response.data = getMonitorConfigurations ? getMonitorConfigurations() : COMPLETE_MONITOR_CONFIG || [];
        break;
        
      case 'logs':
        const limit = parseInt(e.parameter.limit) || 10;
        response.data = getRecentLogs ? getRecentLogs(limit) : [];
        break;
        
      case 'multiurl':
        response.data = getMultiUrlStatus();
        break;
        
      default:
        response.error = 'Unknown endpoint: ' + path;
        response.data = null;
    }
    
    response.success = !response.error;
    response.timestamp = new Date().toISOString();
    
    return ContentService
      .createTextOutput(JSON.stringify(response, null, 2))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error in doGet:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString(),
        stack: error.stack,
        timestamp: new Date().toISOString()
      }, null, 2))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Test function to verify the web app is working
 */
function testWebApp() {
  // Test getBaselineForUrl with null
  console.log('Test 1 - null URL:', getBaselineForUrl(null));
  
  // Test getBaselineForUrl with empty string
  console.log('Test 2 - empty URL:', getBaselineForUrl(''));
  
  // Test getBaselineForUrl with valid URL
  console.log('Test 3 - valid URL:', getBaselineForUrl('https://example.com'));
  
  // Test getMultiUrlStatus
  console.log('Test 4 - multiurl status:', getMultiUrlStatus());
  
  // Test doGetOld with various parameters
  console.log('Test 5 - doGetOld status:', doGetOld({parameter: {path: 'status'}}));
  console.log('Test 6 - doGetOld baseline without URL:', doGetOld({parameter: {path: 'baseline'}}));
  console.log('Test 7 - doGetOld baseline with URL:', doGetOld({parameter: {path: 'baseline', url: 'https://example.com'}}));
}

/**
 * Initialize missing functions if they don't exist
 */
function initializeMissingFunctions() {
  // Check if getSystemStatus exists
  if (typeof getSystemStatus === 'undefined') {
    this.getSystemStatus = function() {
      return {
        status: 'System status function not implemented',
        timestamp: new Date().toISOString()
      };
    };
  }
  
  // Check if checkAllCompanies exists
  if (typeof checkAllCompanies === 'undefined') {
    this.checkAllCompanies = function() {
      return {
        status: 'Monitor function not implemented',
        timestamp: new Date().toISOString()
      };
    };
  }
  
  // Check if getRecentLogs exists
  if (typeof getRecentLogs === 'undefined') {
    this.getRecentLogs = function(limit) {
      return [];
    };
  }
  
  // Check if getMonitorConfigurations exists
  if (typeof getMonitorConfigurations === 'undefined' && typeof COMPLETE_MONITOR_CONFIG !== 'undefined') {
    this.getMonitorConfigurations = function() {
      return COMPLETE_MONITOR_CONFIG;
    };
  }
}

// Initialize on load
initializeMissingFunctions();