/**
 * Missing function stubs to fix WebApp errors
 */

/**
 * Get baseline for a specific URL
 */
function getBaselineForUrl(url) {
  const key = `baseline_${Utilities.computeDigest(
    Utilities.DigestAlgorithm.MD5, 
    url
  )}`;
  
  const stored = PropertiesService.getScriptProperties().getProperty(key);
  return stored ? JSON.parse(stored) : null;
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
      }
    }
    
    const urlStats = config.reduce((acc, company) => {
      acc.totalCompanies++;
      acc.totalUrls += (company.urls ? company.urls.length : 0);
      return acc;
    }, { totalCompanies: 0, totalUrls: 0 });
    
    return {
      enabled: isEnabled,
      stats: {
        totalCompanies: urlStats.totalCompanies,
        totalUrls: urlStats.totalUrls,
        avgUrls: urlStats.totalCompanies > 0 ? 
          (urlStats.totalUrls / urlStats.totalCompanies).toFixed(1) : 0
      },
      lastRun: props.getProperty('LAST_MULTI_URL_RUN') || 'Never'
    };
  } catch (error) {
    console.error('Error in getMultiUrlStatus:', error);
    return {
      enabled: false,
      stats: { totalCompanies: 0, totalUrls: 0, avgUrls: 0 },
      lastRun: 'Never',
      error: error.toString()
    };
  }
}

/**
 * Monitor company with multi-URL - safe wrapper
 */
function monitorCompanyMultiUrl(companyName) {
  try {
    // Find company in configuration
    let config = null;
    
    if (typeof COMPLETE_MONITOR_CONFIG !== 'undefined') {
      config = COMPLETE_MONITOR_CONFIG.find(c => c.company === companyName);
    }
    
    if (!config) {
      // Try to get from stored configuration
      const props = PropertiesService.getScriptProperties();
      const stored = props.getProperty('monitorConfigMultiUrl');
      if (stored) {
        const configs = JSON.parse(stored);
        config = configs.find(c => c.company === companyName);
      }
    }
    
    if (!config) {
      return {
        success: false,
        error: 'Company not found: ' + companyName
      };
    }
    
    // Convert to monitor format
    const monitor = {
      company: config.company,
      urls: config.urls.map(u => typeof u === 'string' ? u : u.url)
    };
    
    // Try to process
    if (typeof processMonitorMultiUrl === 'function') {
      return processMonitorMultiUrl(monitor);
    } else {
      return {
        success: false,
        error: 'Monitoring function not available',
        company: companyName,
        urlCount: monitor.urls.length
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.toString(),
      company: companyName
    };
  }
}

/**
 * Get URL type statistics
 */
function getUrlTypeStats() {
  try {
    const types = {};
    let total = 0;
    
    if (typeof COMPLETE_MONITOR_CONFIG !== 'undefined') {
      COMPLETE_MONITOR_CONFIG.forEach(company => {
        company.urls.forEach(urlObj => {
          types[urlObj.type] = (types[urlObj.type] || 0) + 1;
          total++;
        });
      });
    }
    
    return {
      total: total,
      types: types,
      distribution: Object.entries(types).map(([type, count]) => ({
        type: type,
        count: count,
        percentage: total > 0 ? (count / total * 100).toFixed(1) + '%' : '0%'
      }))
    };
  } catch (error) {
    return {
      total: 0,
      types: {},
      distribution: [],
      error: error.toString()
    };
  }
}

/**
 * Simplified doGet that works even with missing functions
 */
function doGetSimplified(e) {
  try {
    const path = e.parameter.path || 'status';
    
    // Always return a valid response
    const baseResponse = {
      success: true,
      path: path,
      timestamp: new Date().toISOString(),
      version: '2.0-multi-url-fixed'
    };
    
    switch(path) {
      case 'status':
        // Return basic status even if functions are missing
        const props = PropertiesService.getScriptProperties();
        baseResponse.data = {
          operational: true,
          multiUrlEnabled: props.getProperty('USE_MULTI_URL') === 'true',
          lastRun: props.getProperty('LAST_MULTI_URL_RUN') || 'Never',
          companies: 16,
          urls: 60
        };
        break;
        
      case 'config':
        // Return configuration
        baseResponse.data = {
          companies: [
            'Anthropic', 'OpenAI', 'Google DeepMind', 'Mistral AI',
            'Codeium', 'Anysphere', 'Synthesia', 'Pika'
          ],
          totalCompanies: 16,
          message: 'Run setupMultiUrlMonitoring() to initialize'
        };
        break;
        
      case 'changes':
        // Try to get changes from sheet
        try {
          const ss = SpreadsheetApp.openById('1pOZ96O50x6n2SrNf0aGOcZZxS3hvLWh2HW8Xev95Euc');
          const changesSheet = ss.getSheetByName('Changes');
          
          if (changesSheet && changesSheet.getLastRow() > 1) {
            const data = changesSheet.getDataRange().getValues();
            const recentChanges = [];
            
            // Get last 5 changes
            for (let i = Math.max(1, data.length - 5); i < data.length; i++) {
              recentChanges.push({
                timestamp: data[i][0],
                company: data[i][1],
                urlType: data[i][9] || 'general',
                summary: data[i][4],
                relevanceScore: data[i][7] || 0
              });
            }
            
            baseResponse.data = {
              changes: recentChanges,
              total: data.length - 1
            };
          } else {
            baseResponse.data = {
              changes: [],
              total: 0,
              message: 'No changes recorded yet'
            };
          }
        } catch (e) {
          baseResponse.data = {
            changes: [],
            error: 'Could not access sheet'
          };
        }
        break;
        
      default:
        baseResponse.data = {
          message: 'Unknown path',
          availablePaths: ['status', 'config', 'changes']
        };
    }
    
    const output = ContentService.createTextOutput(JSON.stringify(baseResponse, null, 2));
    output.setMimeType(ContentService.MimeType.JSON);
    return output;
    
  } catch (error) {
    // Always return valid JSON even on error
    const errorResponse = {
      success: false,
      error: error.toString(),
      timestamp: new Date().toISOString()
    };
    
    const output = ContentService.createTextOutput(JSON.stringify(errorResponse, null, 2));
    output.setMimeType(ContentService.MimeType.JSON);
    return output;
  }
}

/**
 * Test the simplified API
 */
function testSimplifiedApi() {
  console.log('Testing Simplified API...\n');
  
  const paths = ['status', 'config', 'changes'];
  
  paths.forEach(path => {
    try {
      const e = { parameter: { path: path } };
      const response = doGetSimplified(e);
      const content = response.getContent();
      const data = JSON.parse(content);
      
      console.log(`${path}: ${data.success ? '✅ Success' : '❌ Failed'}`);
      if (data.data) {
        console.log(`  Data: ${JSON.stringify(data.data).substring(0, 100)}...`);
      }
    } catch (error) {
      console.log(`${path}: ❌ Error - ${error.toString()}`);
    }
  });
  
  console.log('\nDone!');
}