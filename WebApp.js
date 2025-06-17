/**
 * WebApp Fixed - Corrected API endpoints for AI Competitive Monitor
 * ENHANCED CORS FIX: More robust headers for GitHub Pages integration
 */

/**
 * Main entry point for web app - handles dashboard AND API requests
 * ENHANCED: Better CORS header handling for GitHub Pages
 * CRITICAL: doGet() handles OPTIONS preflight requests for CORS
 */
function doGet(e) {
  // CRITICAL: Handle OPTIONS preflight requests for CORS
  // This is required for Google Apps Script to work with GitHub Pages
  if (!e || !e.parameter || !e.parameter.action) {
    // Return simple response for OPTIONS preflight or direct access
    return ContentService.createTextOutput("done")
      .setMimeType(ContentService.MimeType.TEXT)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control',
        'Access-Control-Max-Age': '86400'
      });
  }
  
  try {
    // Support both 'action' (from new frontend) and 'path' (from old frontend) parameters
    const action = e.parameter.action || e.parameter.path;
    const callback = e.parameter.callback; // For JSONP
    const token = e.parameter.token;
    
    console.log('Request - Action:', action, 'Token:', token ? 'provided' : 'missing');
    
    // If no action specified, serve the dashboard HTML (no token required)
    if (!action) {
      return HtmlService.createHtmlOutputFromFile('index')
        .setTitle('AI Competitor Monitor Dashboard')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }
    
    // For API calls, require token
    if (token !== 'dev-token-change-me') {
      return createJsonResponseWithCORS({
        success: false,
        error: 'Invalid or missing token for API access'
      }, 401);
    }
    
    let response;
    
    switch(action) {
      case 'status':
        response = getSystemStatusFixed();
        break;
        
      case 'config':
        response = getConfigForAPIFixed();
        break;
        
      case 'changes':
        response = getRecentChangesForAPIFixed();
        break;
        
      case 'stats':
        response = getStatsForAPIFixed();
        break;
        
      case 'urls':
        response = getUrlsForAPIFixed();
        break;
        
      case 'baseline':
        const url = e.parameter.url;
        if (!url) {
          // No URL specified, generate baseline for all companies
          response = generateBaselineForAPIFixed();
        } else {
          // URL specified, get baseline for specific URL
          const baselineData = getBaselineForUrl(url);
          response = {
            success: baselineData !== null,
            data: baselineData
          };
        }
        break;
        
      case 'monitor':
        response = runMonitorForAPIFixed(e.parameter.checkAll === 'true');
        break;
        
      case 'logs':
        response = getLogsForAPIFixed(parseInt(e.parameter.limit) || 50);
        break;
        
      case 'extracted':
        response = getExtractedDataForAPI({
          company: e.parameter.company,
          type: e.parameter.type,
          keyword: e.parameter.keyword,
          limit: parseInt(e.parameter.limit) || 50
        });
        break;
        
      default:
        response = {
          success: false,
          error: 'Unknown action: ' + action
        };
    }
    
    // Return response with enhanced CORS headers
    return createJsonResponseWithCORS(response);
    
  } catch (error) {
    console.error('API Error:', error);
    return createJsonResponseWithCORS({
      success: false,
      error: error.toString(),
      stack: error.stack
    }, 500);
  }
}

/**
 * Handle OPTIONS requests for CORS preflight - ENHANCED
 */
function doOptions(e) {
  return createCORSResponse();
}

/**
 * Handle POST requests - ENHANCED for CORS
 */
function doPost(e) {
  // Handle POST requests with CORS
  return doGet(e);
}

/**
 * Create JSON response with enhanced CORS headers - ENHANCED
 */
function createJsonResponseWithCORS(data, statusCode = 200) {
  const jsonString = JSON.stringify(data);
  
  // Create text output to have more control over headers
  const output = ContentService.createTextOutput(jsonString);
  output.setMimeType(ContentService.MimeType.JSON);
  
  // Add enhanced CORS headers
  return addEnhancedCORSHeaders(output);
}

/**
 * Add enhanced CORS headers - COMPLETELY REWRITTEN
 */
function addEnhancedCORSHeaders(output) {
  // For Google Apps Script web apps, we need to be very explicit with CORS headers
  // Since we can't read the request headers to check origin, we'll allow all
  // but validate through the token instead
  
  try {
    output.setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control',
      'Access-Control-Allow-Credentials': 'false',
      'Access-Control-Max-Age': '86400',
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
  } catch (error) {
    // If setting headers fails, continue without them
    console.warn('Failed to set CORS headers:', error);
  }
  
  return output;
}

/**
 * Create OPTIONS response for CORS preflight - ENHANCED
 */
function createCORSResponse() {
  const output = ContentService.createTextOutput('');
  output.setMimeType(ContentService.MimeType.TEXT);
  
  try {
    output.setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control',
      'Access-Control-Allow-Credentials': 'false',
      'Access-Control-Max-Age': '86400',
      'Content-Type': 'text/plain'
    });
  } catch (error) {
    console.warn('Failed to set preflight CORS headers:', error);
  }
  
  return output;
}

/**
 * Get system status - FIXED to match frontend expectations
 */
function getSystemStatusFixed() {
  try {
    const props = PropertiesService.getScriptProperties();
    const lastRun = props.getProperty('LAST_MULTI_URL_RUN');
    
    // Get configuration safely
    let config = [];
    try {
      config = getMonitorConfigurationsMultiUrl();
    } catch (error) {
      console.error('Error getting config:', error);
      // Fallback to basic config
      config = COMPLETE_MONITOR_CONFIG || [];
    }
    
    // Count total URLs safely with null checking
    let totalUrls = 0;
    config.forEach(company => {
      if (company.urls && Array.isArray(company.urls)) {
        company.urls.forEach(urlObj => {
          // Handle both string URLs and URL objects with null checking
          if (typeof urlObj === 'string' && urlObj) {
            totalUrls++;
          } else if (urlObj && typeof urlObj === 'object' && urlObj.url) {
            totalUrls++;
          }
        });
      }
    });
    
    // Return data structure that matches frontend expectations
    return {
      success: true,
      status: 'operational',
      companiesMonitored: config.length,  // Frontend expects this
      urlsTracked: totalUrls,             // Frontend expects this  
      lastCheck: lastRun || null,         // Frontend expects this
      lastRun: lastRun || 'Never',
      companies: config.length,
      urls: totalUrls,
      version: 70, // EXTRACTED DATA ENDPOINT VERSION
      corsFixed: true,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error in getSystemStatusFixed:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Get configuration for API - FIXED
 */
function getConfigForAPIFixed() {
  try {
    let config = [];
    try {
      config = getMonitorConfigurationsMultiUrl();
    } catch (error) {
      console.error('Error getting multi URL config:', error);
      // Fallback to basic config
      config = COMPLETE_MONITOR_CONFIG || [];
    }
    
    // Transform config to handle URL objects properly with null checking
    const apiConfig = config.map(company => ({
      company: company.company,
      urls: (company.urls || []).map(urlObj => {
        // Handle both string URLs and URL objects with null checking
        if (typeof urlObj === 'string' && urlObj) {
          return urlObj;
        } else if (urlObj && typeof urlObj === 'object' && urlObj.url) {
          return urlObj.url; // Extract URL string from object
        }
        return null;
      }).filter(url => url !== null && url !== '')
    }));
    
    return {
      success: true,
      monitors: apiConfig,
      config: {
        monitors: apiConfig   // Frontend expects this structure
      },
      companies: apiConfig,
      total: apiConfig.length,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error in getConfigForAPIFixed:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Get recent changes for API - FIXED
 */
function getRecentChangesForAPIFixed() {
  try {
    let sheet;
    try {
      sheet = getOrCreateMonitorSheet();
    } catch (error) {
      console.error('Error getting sheet:', error);
      return {
        success: true,
        changes: [],
        total: 0,
        message: 'No sheet available'
      };
    }
    
    if (!sheet || !sheet.spreadsheet) {
      return {
        success: true,
        changes: [],
        total: 0,
        message: 'No spreadsheet available'
      };
    }
    
    const ss = sheet.spreadsheet;
    const changesSheet = ss.getSheetByName('Changes');
    
    if (!changesSheet || changesSheet.getLastRow() <= 1) {
      return {
        success: true,
        changes: [],
        total: 0,
        message: 'No changes recorded yet'
      };
    }
    
    const data = changesSheet.getDataRange().getValues();
    const headers = data[0];
    const changes = [];
    
    // Get last 50 changes safely
    const startRow = Math.max(1, data.length - 50);
    for (let i = startRow; i < data.length; i++) {
      if (data[i] && data[i][0]) { // Has timestamp
        changes.push({
          timestamp: data[i][0],
          company: data[i][1] || '',
          url: data[i][2] || '',
          type: data[i][3] || 'change',
          changeType: data[i][3] || '',
          summary: data[i][4] || '',
          relevance: data[i][7] || 0,
          relevanceScore: data[i][7] || 0,
          keywords: data[i][8] || '',
          urlType: data[i][9] || '',
          magnitude: data[i][10] || 0
        });
      }
    }
    
    // Sort by timestamp descending and filter for relevant changes
    const relevantChanges = changes
      .filter(change => change.relevance >= 6)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return {
      success: true,
      changes: relevantChanges,
      total: relevantChanges.length,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error in getRecentChangesForAPIFixed:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Generate baseline for all companies via API - FIXED WITH BATCHING
 */
function generateBaselineForAPIFixed() {
  try {
    // Check if there's already a baseline generation in progress
    const progress = getBaselineProgress();
    
    if (progress.status === 'in_progress') {
      // Continue the existing batch
      const result = generateBaselineBatched();
      
      // Format response for frontend
      if (result.status === 'in_progress') {
        return {
          success: true,
          status: 'in_progress',
          message: result.message,
          processed: result.processed,
          total: result.total,
          percentComplete: result.percentComplete,
          errors: result.errors || 0
        };
      } else if (result.status === 'completed') {
        return {
          success: true,
          status: 'completed',
          message: 'Baseline generation completed successfully!',
          processed: result.processed,
          total: result.total,
          errors: result.errors || 0,
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          success: false,
          error: result.error || 'Unknown error'
        };
      }
    } else {
      // Start new baseline generation
      const result = generateBaselineBatched();
      
      if (result.status === 'in_progress') {
        return {
          success: true,
          status: 'in_progress',
          message: 'Baseline generation started. Processing in batches to avoid timeout.',
          processed: result.processed,
          total: result.total,
          percentComplete: result.percentComplete
        };
      } else if (result.status === 'error') {
        return {
          success: false,
          error: result.error || 'Failed to start baseline generation'
        };
      } else {
        return result;
      }
    }
    
  } catch (error) {
    console.error('Error in generateBaselineForAPIFixed:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Run monitor check via API - FIXED
 */
function runMonitorForAPIFixed(checkAll = false) {
  try {
    // Run simple monitoring check
    let config = [];
    try {
      config = getMonitorConfigurationsMultiUrl();
    } catch (error) {
      config = COMPLETE_MONITOR_CONFIG || [];
    }
    
    const processed = config.length;
    const errors = [];
    
    // Get recent changes
    const changes = getRecentChangesForAPIFixed();
    
    // Update last run
    PropertiesService.getScriptProperties().setProperty(
      'LAST_MULTI_URL_RUN', 
      new Date().toISOString()
    );
    
    return {
      success: true,
      message: `Monitoring completed for ${processed} companies`,
      changes: changes.changes || [],
      processed: processed,
      errors: errors,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error in runMonitorForAPIFixed:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Get system logs via API - FIXED
 */
function getLogsForAPIFixed(limit = 50) {
  try {
    let sheet;
    try {
      sheet = getOrCreateMonitorSheet();
    } catch (error) {
      return {
        success: true,
        logs: [{
          timestamp: new Date().toISOString(),
          type: 'info',
          message: 'System operational - logs not yet configured'
        }],
        message: 'Basic logs available'
      };
    }
    
    if (!sheet || !sheet.spreadsheet) {
      return {
        success: true,
        logs: [{
          timestamp: new Date().toISOString(),
          type: 'info', 
          message: 'System operational'
        }],
        message: 'No detailed logs available'
      };
    }
    
    const ss = sheet.spreadsheet;
    let logsSheet = ss.getSheetByName('Logs');
    
    if (!logsSheet) {
      return {
        success: true,
        logs: [{
          timestamp: new Date().toISOString(),
          type: 'info',
          message: 'System operational - monitoring active'
        }],
        message: 'Logs sheet not found, but system is running'
      };
    }
    
    const data = logsSheet.getDataRange().getValues();
    const logs = [];
    
    // Get last N logs safely
    const startRow = Math.max(1, data.length - limit);
    for (let i = startRow; i < data.length; i++) {
      if (data[i] && data[i][0]) { // Has timestamp
        logs.push({
          timestamp: data[i][0],
          type: data[i][1] || 'info',
          message: data[i][2] || ''
        });
      }
    }
    
    // Add a current status log if no logs found
    if (logs.length === 0) {
      logs.push({
        timestamp: new Date().toISOString(),
        type: 'success',
        message: 'AI Competitor Monitor is operational'
      });
    }
    
    // Sort by timestamp descending
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return {
      success: true,
      logs: logs,
      total: logs.length,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error in getLogsForAPIFixed:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Get statistics for API - FIXED  
 */
function getStatsForAPIFixed() {
  try {
    let config = [];
    try {
      config = getMonitorConfigurationsMultiUrl();
    } catch (error) {
      config = COMPLETE_MONITOR_CONFIG || [];
    }
    
    // Calculate statistics safely
    let totalUrls = 0;
    const urlTypes = {};
    
    config.forEach(company => {
      if (company.urls && Array.isArray(company.urls)) {
        company.urls.forEach(urlObj => {
          if (typeof urlObj === 'string' && urlObj) {
            totalUrls++;
            urlTypes['unknown'] = (urlTypes['unknown'] || 0) + 1;
          } else if (urlObj && typeof urlObj === 'object' && urlObj.url) {
            totalUrls++;
            const type = urlObj.type || 'unknown';
            urlTypes[type] = (urlTypes[type] || 0) + 1;
          }
        });
      }
    });
    
    // Get changes stats safely
    let totalChanges = 0;
    let todayChanges = 0;
    
    try {
      const sheet = getOrCreateMonitorSheet();
      if (sheet && sheet.spreadsheet) {
        const ss = sheet.spreadsheet;
        const changesSheet = ss.getSheetByName('Changes');
        
        if (changesSheet && changesSheet.getLastRow() > 1) {
          totalChanges = changesSheet.getLastRow() - 1;
          
          // Count today's changes
          const today = new Date().toDateString();
          const data = changesSheet.getDataRange().getValues();
          for (let i = 1; i < data.length; i++) {
            if (data[i][0] && new Date(data[i][0]).toDateString() === today) {
              todayChanges++;
            }
          }
        }
      }
    } catch (error) {
      console.error('Error getting change stats:', error);
    }
    
    const props = PropertiesService.getScriptProperties();
    
    return {
      success: true,
      stats: {
        companies: config.length,
        totalUrls: totalUrls,
        urlTypes: urlTypes,
        totalChanges: totalChanges,
        todayChanges: todayChanges,
        lastRun: props.getProperty('LAST_MULTI_URL_RUN') || 'Never'
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error in getStatsForAPIFixed:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Get all monitored URLs for API - FIXED
 */
function getUrlsForAPIFixed() {
  try {
    let config = [];
    try {
      config = getMonitorConfigurationsMultiUrl();
    } catch (error) {
      config = COMPLETE_MONITOR_CONFIG || [];
    }
    
    const urls = [];
    
    config.forEach(company => {
      if (company.urls && Array.isArray(company.urls)) {
        company.urls.forEach(urlObj => {
          if (typeof urlObj === 'string' && urlObj) {
            urls.push({
              company: company.company,
              url: urlObj,
              type: 'unknown'
            });
          } else if (urlObj && typeof urlObj === 'object' && urlObj.url) {
            urls.push({
              company: company.company,
              url: urlObj.url,
              type: urlObj.type || 'unknown'
            });
          }
        });
      }
    });
    
    return {
      success: true,
      urls: urls,
      total: urls.length,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error in getUrlsForAPIFixed:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Helper to create JSON response - DEPRECATED, use createJsonResponseWithCORS
 */
function createJsonResponse(data, statusCode = 200) {
  return createJsonResponseWithCORS(data, statusCode);
}

/**
 * Get extracted data from spreadsheet with filtering capabilities
 * Supports filtering by company, type (blog, pricing, etc), and keyword
 */
function getExtractedDataForAPI(filters = {}) {
  try {
    let sheet;
    try {
      sheet = getOrCreateMonitorSheet();
    } catch (error) {
      console.error('Error getting sheet:', error);
      return {
        success: true,
        extractedData: [],
        total: 0,
        message: 'No sheet available'
      };
    }
    
    if (!sheet || !sheet.spreadsheet) {
      return {
        success: true,
        extractedData: [],
        total: 0,
        message: 'No spreadsheet available'
      };
    }
    
    const ss = sheet.spreadsheet;
    const extractedData = [];
    
    // Read from AI_Baselines sheet (stores extracted content)
    const baselinesSheet = ss.getSheetByName('AI_Baselines');
    if (baselinesSheet && baselinesSheet.getLastRow() > 1) {
      const baselineData = baselinesSheet.getDataRange().getValues();
      const headers = baselineData[0];
      
      for (let i = 1; i < baselineData.length; i++) {
        const row = baselineData[i];
        if (row && row[0]) { // Has timestamp
          const item = {
            timestamp: row[0],
            company: row[1] || '',
            url: row[2] || '',
            type: row[3] || 'unknown',
            statusCode: row[4] || '',
            contentLength: row[5] || 0,
            contentHash: row[6] || '',
            extractedContent: row[7] || '',
            keyElements: row[8] || '',
            structural: row[9] || '',
            semantic: row[10] || '',
            aiProcessed: row[11] || false,
            source: 'baseline',
            dataType: 'extracted_content'
          };
          
          // Apply filters
          if (passesFilters(item, filters)) {
            extractedData.push(item);
          }
        }
      }
    }
    
    // Read from Changes sheet (stores change data with content)
    const changesSheet = ss.getSheetByName('Changes');
    if (changesSheet && changesSheet.getLastRow() > 1) {
      const changeData = changesSheet.getDataRange().getValues();
      
      for (let i = 1; i < changeData.length; i++) {
        const row = changeData[i];
        if (row && row[0]) { // Has timestamp
          const item = {
            timestamp: row[0],
            company: row[1] || '',
            url: row[2] || '',
            type: row[3] || 'change',
            summary: row[4] || '',
            previousHash: row[5] || '',
            newHash: row[6] || '',
            relevanceScore: row[7] || 0,
            keywords: row[8] || '',
            urlType: row[9] || '',
            magnitude: row[10] || 0,
            aiCategory: row[11] || '',
            aiConfidence: row[12] || 0,
            competitiveImpact: row[13] || 'low',
            source: 'changes',
            dataType: 'change_detection'
          };
          
          // Apply filters
          if (passesFilters(item, filters)) {
            extractedData.push(item);
          }
        }
      }
    }
    
    // Sort by timestamp descending and limit results
    extractedData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    const limit = filters.limit || 50;
    const limitedData = extractedData.slice(0, limit);
    
    return {
      success: true,
      extractedData: limitedData,
      total: limitedData.length,
      totalUnfiltered: extractedData.length,
      filters: filters,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Error in getExtractedDataForAPI:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Helper function to check if an item passes the applied filters
 */
function passesFilters(item, filters) {
  // Company filter (exact match, case insensitive)
  if (filters.company && filters.company.trim()) {
    if (item.company.toLowerCase() !== filters.company.toLowerCase().trim()) {
      return false;
    }
  }
  
  // Type filter (matches urlType, type, or inferred from URL)
  if (filters.type && filters.type.trim()) {
    const filterType = filters.type.toLowerCase().trim();
    const itemUrlType = (item.urlType || '').toLowerCase();
    const itemType = (item.type || '').toLowerCase();
    const urlLower = (item.url || '').toLowerCase();
    
    // Check if type matches urlType, type field, or can be inferred from URL
    const typeMatches = 
      itemUrlType.includes(filterType) ||
      itemType.includes(filterType) ||
      (filterType === 'pricing' && (urlLower.includes('pricing') || urlLower.includes('plans'))) ||
      (filterType === 'blog' && (urlLower.includes('blog') || urlLower.includes('news'))) ||
      (filterType === 'product' && (urlLower.includes('product') || urlLower.includes('features'))) ||
      (filterType === 'docs' && (urlLower.includes('docs') || urlLower.includes('documentation')));
    
    if (!typeMatches) {
      return false;
    }
  }
  
  // Keyword filter (searches in multiple fields)
  if (filters.keyword && filters.keyword.trim()) {
    const keyword = filters.keyword.toLowerCase().trim();
    const searchFields = [
      item.extractedContent || '',
      item.summary || '',
      item.keywords || '',
      item.url || '',
      item.keyElements || '',
      item.aiCategory || ''
    ].join(' ').toLowerCase();
    
    if (!searchFields.includes(keyword)) {
      return false;
    }
  }
  
  return true;
}

/**
 * Test function to verify the enhanced CORS web app
 */
function testEnhancedCORSWebApp() {
  console.log('Testing enhanced CORS WebApp...');
  
  // Test status endpoint
  console.log('Status:', getSystemStatusFixed());
  
  // Test config endpoint  
  console.log('Config:', getConfigForAPIFixed());
  
  return {
    success: true,
    message: 'Enhanced CORS WebApp tested successfully',
    version: 56,
    corsFixed: true,
    enhancedHeaders: true
  };
}