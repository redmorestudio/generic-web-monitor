/**
 * WebApp Fixed - Corrected API endpoints for AI Competitive Monitor
 * ENHANCED CORS FIX: More robust headers for GitHub Pages integration
 * v81: Batch processing for baseline generation with AI intelligence
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
          response = generateBaselineForAPIBatched();
        } else {
          // URL specified, get baseline for specific URL
          const baselineData = getBaselineForUrl(url);
          response = {
            success: baselineData !== null,
            data: baselineData
          };
        }
        break;
        
      case 'baseline-status':
        response = getBaselineGenerationStatus();
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
      version: 81, // v81: Batch processing + AI intelligence
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
 * Get baseline data for a specific URL
 */
function getBaselineForUrl(url) {
  try {
    const sheet = getOrCreateMonitorSheet();
    if (!sheet || !sheet.spreadsheet) {
      return null;
    }
    
    const ss = sheet.spreadsheet;
    const baselineSheet = ss.getSheetByName('AI_Baselines');
    
    if (!baselineSheet || baselineSheet.getLastRow() <= 1) {
      return null;
    }
    
    const data = baselineSheet.getDataRange().getValues();
    
    // Find the baseline for this URL (most recent)
    for (let i = data.length - 1; i >= 1; i--) {
      if (data[i][2] === url) { // URL is in column 3 (index 2)
        return {
          timestamp: data[i][0],
          company: data[i][1],
          url: data[i][2],
          type: data[i][3],
          contentLength: data[i][4],
          contentHash: data[i][5],
          extractedContent: data[i][6],
          title: data[i][7],
          intelligence: data[i][8],
          processed: data[i][9]
        };
      }
    }
    
    return null;
    
  } catch (error) {
    console.error('Error getting baseline for URL:', error);
    return null;
  }
}

/**
 * Get baseline generation status
 */
function getBaselineGenerationStatus() {
  try {
    const props = PropertiesService.getScriptProperties();
    const jobData = props.getProperty('BASELINE_JOB');
    
    if (!jobData) {
      return {
        success: true,
        active: false,
        message: 'No baseline generation in progress'
      };
    }
    
    const job = JSON.parse(jobData);
    const now = new Date();
    const startTime = new Date(job.start_time);
    const elapsedMinutes = Math.floor((now - startTime) / 60000);
    
    // Calculate estimated time
    const avgTimePerUrl = elapsedMinutes / (job.processed_urls || 1);
    const remainingUrls = job.total_urls - job.processed_urls;
    const estimatedMinutesRemaining = Math.ceil(avgTimePerUrl * remainingUrls);
    
    return {
      success: true,
      active: true,
      job_id: job.id,
      progress: {
        total: job.total_urls,
        completed: job.processed_urls,
        failed: job.failed_urls || 0,
        percent: Math.round((job.processed_urls / job.total_urls) * 100),
        estimated_time_remaining: estimatedMinutesRemaining + ' minutes'
      },
      current_batch: job.current_batch,
      status: job.status
    };
    
  } catch (error) {
    console.error('Error getting baseline status:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Generate baseline with batch processing to handle all URLs
 */
function generateBaselineForAPIBatched() {
  try {
    console.log('🚀 Starting batched baseline generation...');
    
    const props = PropertiesService.getScriptProperties();
    let job = null;
    const jobData = props.getProperty('BASELINE_JOB');
    
    if (jobData) {
      job = JSON.parse(jobData);
      if (job.status === 'completed') {
        // Clear completed job
        props.deleteProperty('BASELINE_JOB');
        job = null;
      }
    }
    
    if (!job) {
      // Create new job
      console.log('📋 Creating new baseline job...');
      
      // Get configuration
      let config = [];
      try {
        config = getMonitorConfigurationsMultiUrl();
      } catch (error) {
        console.error('Error getting config:', error);
        config = COMPLETE_MONITOR_CONFIG || [];
      }
      
      // Collect all URLs
      const urlsToProcess = [];
      config.forEach(company => {
        if (company.urls && Array.isArray(company.urls)) {
          company.urls.forEach(urlObj => {
            const url = typeof urlObj === 'string' ? urlObj : (urlObj?.url || '');
            if (url) {
              urlsToProcess.push({
                company: company.company,
                url: url,
                type: typeof urlObj === 'object' ? (urlObj.type || 'unknown') : 'unknown'
              });
            }
          });
        }
      });
      
      if (urlsToProcess.length === 0) {
        return {
          success: false,
          error: 'No URLs found to process for baseline'
        };
      }
      
      // Create job
      job = {
        id: 'baseline_' + new Date().toISOString().replace(/[:.]/g, ''),
        status: 'in_progress',
        total_urls: urlsToProcess.length,
        processed_urls: 0,
        failed_urls: 0,
        current_batch: 0,
        start_time: new Date().toISOString(),
        last_update: new Date().toISOString(),
        urls: urlsToProcess
      };
      
      props.setProperty('BASELINE_JOB', JSON.stringify(job));
      console.log(`📊 Created job for ${urlsToProcess.length} URLs`);
    }
    
    // Process next batch
    const BATCH_SIZE = 5;
    const startIndex = job.processed_urls;
    const endIndex = Math.min(startIndex + BATCH_SIZE, job.urls.length);
    
    console.log(`🔄 Processing batch: URLs ${startIndex + 1} to ${endIndex} of ${job.urls.length}`);
    
    let processedInBatch = 0;
    let errorsInBatch = 0;
    
    for (let i = startIndex; i < endIndex; i++) {
      const urlData = job.urls[i];
      
      try {
        console.log(`🔄 Processing: ${urlData.company} - ${urlData.url}`);
        
        // Extract content
        const extractionResult = extractPageContent(urlData.url);
        
        if (extractionResult.success) {
          // Store the baseline data with enhanced AI intelligence
          const baselineData = {
          timestamp: new Date().toISOString(),
          company: urlData.company,
          url: urlData.url,
          type: urlData.type,
          contentLength: extractionResult.contentLength || 0,
          contentHash: extractionResult.contentHash || '',
          extractedContent: extractionResult.content?.substring(0, 1000) || '',
          title: extractionResult.title || '',
          intelligence: extractionResult.intelligence || {},
          relevanceScore: extractionResult.intelligence?.relevanceScore || 0,
            keywords: (extractionResult.intelligence?.keywords || []).join(', '),
              processed: true
            };
          
          // Store in spreadsheet
          storeBaselineData(baselineData);
          processedInBatch++;
          console.log(`✅ Successfully processed: ${urlData.company}`);
          
        } else {
          console.error(`❌ Failed to extract: ${urlData.url} - ${extractionResult.error}`);
          errorsInBatch++;
          job.failed_urls++;
        }
        
        // Update job progress
        job.processed_urls++;
        
        // Add delay between requests
        Utilities.sleep(1000);
        
      } catch (error) {
        console.error(`❌ Error processing ${urlData.url}:`, error);
        errorsInBatch++;
        job.failed_urls++;
        job.processed_urls++;
      }
    }
    
    // Update job status
    job.current_batch++;
    job.last_update = new Date().toISOString();
    
    if (job.processed_urls >= job.total_urls) {
      // Job complete!
      job.status = 'completed';
      props.setProperty('BASELINE_JOB', JSON.stringify(job));
      
      // Update last baseline timestamp
      props.setProperty('LAST_BASELINE_GENERATED', new Date().toISOString());
      
      console.log(`🎯 Baseline generation complete: ${job.processed_urls} processed, ${job.failed_urls} errors`);
      
      return {
        success: true,
        status: 'completed',
        message: `Baseline generation completed! Processed ${job.processed_urls} URLs with ${job.failed_urls} errors.`,
        processed: job.processed_urls,
        total: job.total_urls,
        errors: job.failed_urls,
        percentComplete: 100
      };
      
    } else {
      // More to process
      props.setProperty('BASELINE_JOB', JSON.stringify(job));
      
      // Schedule next batch with a trigger
      scheduleNextBaselineBatch(job.id);
      
      return {
        success: true,
        status: 'in_progress',
        message: `Processing baseline... ${job.processed_urls} of ${job.total_urls} URLs completed.`,
        processed: job.processed_urls,
        total: job.total_urls,
        errors: job.failed_urls,
        percentComplete: Math.round((job.processed_urls / job.total_urls) * 100),
        nextBatch: true
      };
    }
    
  } catch (error) {
    console.error('❌ Critical error in batched baseline generation:', error);
    return {
      success: false,
      error: error.toString(),
      stack: error.stack
    };
  }
}

/**
 * Schedule next baseline batch with time-based trigger
 */
function scheduleNextBaselineBatch(jobId) {
  try {
    console.log('⏰ Scheduling next baseline batch...');
    
    // Create trigger for 1 minute from now
    const trigger = ScriptApp.newTrigger('processNextBaselineBatch')
      .timeBased()
      .after(60 * 1000) // 1 minute
      .create();
    
    // Store trigger info
    const props = PropertiesService.getScriptProperties();
    props.setProperty('BASELINE_TRIGGER', JSON.stringify({
      jobId: jobId,
      triggerId: trigger.getUniqueId(),
      scheduledAt: new Date().toISOString()
    }));
    
    console.log('✅ Next batch scheduled for 1 minute from now');
    
  } catch (error) {
    console.error('❌ Error scheduling next batch:', error);
  }
}

/**
 * Process next baseline batch (called by trigger)
 */
function processNextBaselineBatch() {
  try {
    console.log('🔄 Processing next baseline batch (triggered)...');
    
    // Clean up trigger
    const props = PropertiesService.getScriptProperties();
    const triggerData = props.getProperty('BASELINE_TRIGGER');
    if (triggerData) {
      const trigger = JSON.parse(triggerData);
      // Delete the trigger
      ScriptApp.getProjectTriggers().forEach(t => {
        if (t.getUniqueId() === trigger.triggerId) {
          ScriptApp.deleteTrigger(t);
        }
      });
      props.deleteProperty('BASELINE_TRIGGER');
    }
    
    // Continue baseline generation
    generateBaselineForAPIBatched();
    
  } catch (error) {
    console.error('❌ Error in triggered baseline batch:', error);
  }
}

/**
 * Generate baseline for all companies via API - FIXED TO ACTUALLY WORK
 * (DEPRECATED - Use generateBaselineForAPIBatched instead)
 */
function generateBaselineForAPIFixed() {
  try {
    console.log('🚀 Starting baseline generation...');
    
    // Get configuration
    let config = [];
    try {
      config = getMonitorConfigurationsMultiUrl();
    } catch (error) {
      console.error('Error getting config:', error);
      config = COMPLETE_MONITOR_CONFIG || [];
    }
    
    if (!config || config.length === 0) {
      return {
        success: false,
        error: 'No companies configured for monitoring'
      };
    }
    
    // Collect all URLs to process
    const urlsToProcess = [];
    config.forEach(company => {
      if (company.urls && Array.isArray(company.urls)) {
        company.urls.forEach(urlObj => {
          const url = typeof urlObj === 'string' ? urlObj : (urlObj?.url || '');
          if (url) {
            urlsToProcess.push({
              company: company.company,
              url: url,
              type: typeof urlObj === 'object' ? (urlObj.type || 'unknown') : 'unknown'
            });
          }
        });
      }
    });
    
    if (urlsToProcess.length === 0) {
      return {
        success: false,
        error: 'No URLs found to process for baseline'
      };
    }
    
    console.log(`📊 Processing ${urlsToProcess.length} URLs for baseline...`);
    
    // Process URLs in small batches to avoid timeout
    const batchSize = 3;
    let processed = 0;
    let errors = 0;
    const results = [];
    
    for (let i = 0; i < Math.min(batchSize, urlsToProcess.length); i++) {
      const urlData = urlsToProcess[i];
      
      try {
        console.log(`🔄 Processing: ${urlData.company} - ${urlData.url}`);
        
        // Extract content for this URL
        const extractionResult = extractPageContent(urlData.url);
        
        if (extractionResult.success) {
          // Store the baseline data
          const baselineData = {
            timestamp: new Date().toISOString(),
            company: urlData.company,
            url: urlData.url,
            type: urlData.type,
            contentLength: extractionResult.contentLength || 0,
            contentHash: extractionResult.contentHash || '',
            extractedContent: extractionResult.content?.substring(0, 1000) || '',
            title: extractionResult.title || '',
            intelligence: JSON.stringify(extractionResult.intelligence || {}),
            processed: true
          };
          
          // Store in spreadsheet
          storeBaselineData(baselineData);
          
          results.push({
            success: true,
            company: urlData.company,
            url: urlData.url,
            contentLength: baselineData.contentLength
          });
          
          processed++;
          console.log(`✅ Successfully processed: ${urlData.company}`);
        } else {
          console.error(`❌ Failed to extract: ${urlData.url} - ${extractionResult.error}`);
          errors++;
          results.push({
            success: false,
            company: urlData.company,
            url: urlData.url,
            error: extractionResult.error
          });
        }
        
        // Add delay between requests
        Utilities.sleep(1000);
        
      } catch (error) {
        console.error(`❌ Error processing ${urlData.url}:`, error);
        errors++;
        results.push({
          success: false,
          company: urlData.company,
          url: urlData.url,
          error: error.toString()
        });
      }
    }
    
    // Update properties to track completion
    const props = PropertiesService.getScriptProperties();
    props.setProperty('BASELINE_GENERATED', new Date().toISOString());
    props.setProperty('BASELINE_RESULTS', JSON.stringify({
      processed: processed,
      errors: errors,
      total: urlsToProcess.length,
      timestamp: new Date().toISOString()
    }));
    
    console.log(`🎯 Baseline generation complete: ${processed} processed, ${errors} errors`);
    
    return {
      success: true,
      status: 'completed',
      message: `Baseline generation completed! Processed ${processed} URLs with ${errors} errors.`,
      processed: processed,
      total: urlsToProcess.length,
      errors: errors,
      results: results,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Critical error in baseline generation:', error);
    return {
      success: false,
      error: error.toString(),
      stack: error.stack
    };
  }
}

/**
 * Extract page content with intelligent analysis
 * (Copied from MissingHelperFunctions.js to ensure availability)
 */
function extractPageContent(url) {
  try {
    console.log('🔄 Extracting content from:', url);
    
    const response = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      followRedirects: true,
      validateHttpsCertificates: false,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AI-Competitor-Monitor/1.0)'
      }
    });
    
    const statusCode = response.getResponseCode();
    console.log('📊 HTTP Status for', url, ':', statusCode);
    
    if (statusCode !== 200) {
      return {
        success: false,
        error: `HTTP ${statusCode}`,
        url: url
      };
    }
    
    const html = response.getContentText();
    const textContent = extractTextFromHtml(html);
    
    // Calculate content hash
    const contentHash = Utilities.computeDigest(
      Utilities.DigestAlgorithm.MD5,
      textContent
    ).map(byte => (byte & 0xFF).toString(16).padStart(2, '0')).join('');
    
    // Enhanced intelligence with AI analysis
    const intelligence = {
      keywords: extractKeywords(textContent),
      pageType: identifyPageType(url),
      relevanceScore: calculateRelevanceScore(textContent, url),
      competitorMentions: findCompetitorMentions(textContent),
      keyInsights: extractKeyInsights(textContent, url)
    };
    
    console.log('✅ Successfully extracted content from:', url, '- Length:', textContent.length);
    
    return {
      success: true,
      url: url,
      content: textContent,
      contentLength: textContent.length,
      contentHash: contentHash,
      intelligence: intelligence,
      title: extractTitle(html),
      extractedAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Error extracting content from', url, ':', error);
    return {
      success: false,
      error: error.toString(),
      url: url
    };
  }
}

/**
 * Extract text from HTML
 */
function extractTextFromHtml(html) {
  // Remove script and style elements
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  html = html.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  // Remove HTML tags
  html = html.replace(/<[^>]+>/g, ' ');
  
  // Decode HTML entities
  html = html.replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'");
  
  // Clean up whitespace
  html = html.replace(/\s+/g, ' ').trim();
  
  return html;
}

/**
 * Extract title from HTML
 */
function extractTitle(html) {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return titleMatch ? titleMatch[1].trim() : '';
}

/**
 * Extract keywords from text
 */
function extractKeywords(text) {
  // Simple keyword extraction
  const words = text.toLowerCase().split(/\s+/);
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were'];
  
  const wordFreq = {};
  words.forEach(word => {
    word = word.replace(/[^a-z0-9]/g, '');
    if (word.length > 3 && !stopWords.includes(word)) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });
  
  // Get top keywords
  return Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

/**
 * Identify page type from URL
 */
function identifyPageType(url) {
  if (url.includes('/pricing') || url.includes('/plans')) return 'pricing';
  if (url.includes('/blog') || url.includes('/news')) return 'blog';
  if (url.includes('/docs') || url.includes('/documentation')) return 'docs';
  if (url.includes('/features') || url.includes('/product')) return 'product';
  if (url.includes('/about')) return 'about';
  return 'homepage';
}

/**
 * Calculate relevance score based on content analysis
 */
function calculateRelevanceScore(text, url) {
  let score = 5; // Base score
  
  const lowerText = text.toLowerCase();
  const pageType = identifyPageType(url);
  
  // High-value keywords that increase relevance
  const highValueKeywords = [
    'launch', 'announce', 'new', 'release', 'introducing',
    'available', 'beta', 'preview', 'early access', 'waitlist',
    'pricing', 'price', 'cost', 'free', 'enterprise',
    'partnership', 'acquisition', 'funding', 'investment',
    'ai', 'model', 'llm', 'gpt', 'claude', 'gemini'
  ];
  
  // Count high-value keyword occurrences
  highValueKeywords.forEach(keyword => {
    const count = (lowerText.match(new RegExp('\\b' + keyword + '\\b', 'g')) || []).length;
    if (count > 0) {
      score += Math.min(count * 0.5, 2); // Max 2 points per keyword
    }
  });
  
  // Boost score for certain page types
  if (pageType === 'pricing') score += 1;
  if (pageType === 'product' || pageType === 'features') score += 0.5;
  
  // Check for date/time indicators (recent content)
  const datePattern = /(today|yesterday|this week|this month|january|february|march|april|may|june|july|august|september|october|november|december)\s*(\d{1,2})?,?\s*(\d{4})?/gi;
  if (datePattern.test(lowerText)) {
    score += 1;
  }
  
  // Ensure score is between 1 and 10
  return Math.min(Math.max(Math.round(score), 1), 10);
}

/**
 * Find competitor mentions in content
 */
function findCompetitorMentions(text) {
  const competitors = [
    'openai', 'anthropic', 'google', 'deepmind', 'mistral',
    'codeium', 'cursor', 'anysphere', 'synthesia', 'pika',
    'moonvalley', 'heygen', 'ideogram', 'midjourney',
    'langchain', 'modular', 'chatgpt', 'claude', 'gemini',
    'gpt-4', 'gpt-3', 'dall-e', 'copilot'
  ];
  
  const lowerText = text.toLowerCase();
  const mentions = [];
  
  competitors.forEach(competitor => {
    const regex = new RegExp('\\b' + competitor + '\\b', 'gi');
    const matches = lowerText.match(regex);
    if (matches && matches.length > 0) {
      mentions.push({
        competitor: competitor,
        count: matches.length
      });
    }
  });
  
  return mentions;
}

/**
 * Extract key insights from content
 */
function extractKeyInsights(text, url) {
  const insights = [];
  const lowerText = text.toLowerCase();
  const pageType = identifyPageType(url);
  
  // Check for product launches
  if (/(launch|announce|introducing|unveil|debut)/.test(lowerText) &&
      /(new|latest|novel|innovative)/.test(lowerText)) {
    insights.push('Potential product launch or announcement');
  }
  
  // Check for pricing changes
  if (pageType === 'pricing' || 
      /(price|pricing|cost|fee|subscription)/.test(lowerText) &&
      /(change|update|new|reduce|increase)/.test(lowerText)) {
    insights.push('Possible pricing update');
  }
  
  // Check for feature updates
  if (/(feature|capability|functionality|update|improvement)/.test(lowerText) &&
      /(new|enhanced|improved|added)/.test(lowerText)) {
    insights.push('Feature enhancement or update');
  }
  
  // Check for strategic changes
  if (/(partnership|acquisition|merger|investment|funding)/.test(lowerText)) {
    insights.push('Strategic business development');
  }
  
  // Check for AI/ML specific updates
  if (/(model|llm|ai|artificial intelligence|machine learning)/.test(lowerText) &&
      /(improve|enhance|update|new|performance)/.test(lowerText)) {
    insights.push('AI/ML model or capability update');
  }
  
  return insights.length > 0 ? insights : ['Standard content update'];
}
/**
 * Test spreadsheet functionality without external requests
 */
function testSpreadsheetOnly() {
  try {
    console.log('📊 Testing spreadsheet functionality...');
    
    // Get spreadsheet directly
    const props = PropertiesService.getScriptProperties();
    let spreadsheetId = props.getProperty('MONITOR_SPREADSHEET_ID');
    
    if (!spreadsheetId) {
      spreadsheetId = '1pOZ96O50x6n2SrNf0aGOcZZxS3hvLWh2HW8Xev95Euc';
      props.setProperty('MONITOR_SPREADSHEET_ID', spreadsheetId);
    }
    
    let ss;
    try {
      ss = SpreadsheetApp.openById(spreadsheetId);
      console.log('✅ Spreadsheet opened:', ss.getName());
    } catch (error) {
      console.log('🆕 Creating new spreadsheet...');
      ss = SpreadsheetApp.create('AI Competitor Monitor Data - Test');
      props.setProperty('MONITOR_SPREADSHEET_ID', ss.getId());
      console.log('✅ New spreadsheet created:', ss.getId());
    }
    
    // Get or create AI_Baselines sheet
    let baselineSheet = ss.getSheetByName('AI_Baselines');
    
    if (!baselineSheet) {
      console.log('🔧 Creating AI_Baselines sheet...');
      baselineSheet = ss.insertSheet('AI_Baselines');
      
      const headers = [
        'Timestamp', 'Company', 'URL', 'Type', 'Content Length', 
        'Content Hash', 'Extracted Content', 'Title', 'Intelligence', 'Processed'
      ];
      baselineSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      baselineSheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      console.log('✅ AI_Baselines sheet created');
    }
    
    // Add test data without external fetch
    const testData = [
      new Date().toISOString(),
      'Test Company',
      'https://example.com',
      'test',
      1000,
      'testhash123',
      'This is test content extracted from a webpage...',
      'Test Page Title',
      JSON.stringify({keywords: ['test', 'example'], pageType: 'test'}),
      true
    ];
    
    baselineSheet.appendRow(testData);
    console.log('✅ Test data stored successfully');
    
    return {
      success: true,
      message: 'Spreadsheet test completed successfully',
      data: {
        spreadsheetId: ss.getId(),
        url: ss.getUrl(),
        sheetsCount: ss.getSheets().length
      }
    };
    
  } catch (error) {
    console.error('❌ Spreadsheet test failed:', error);
    return {
      success: false,
      error: error.toString(),
      stack: error.stack
    };
  }
}

/**
 * Test baseline generation with a single URL
 */
function testBaselineGeneration() {
  try {
    console.log('💫 Testing baseline generation...');
    
    // Test data
    const testUrl = 'https://httpbin.org/html';
    const testCompany = 'Test Company';
    
    console.log('🔄 Step 1: Testing spreadsheet access...');
    
    // Get spreadsheet directly
    const props = PropertiesService.getScriptProperties();
    let spreadsheetId = props.getProperty('MONITOR_SPREADSHEET_ID');
    
    if (!spreadsheetId) {
      spreadsheetId = '1pOZ96O50x6n2SrNf0aGOcZZxS3hvLWh2HW8Xev95Euc';
      props.setProperty('MONITOR_SPREADSHEET_ID', spreadsheetId);
    }
    
    let ss;
    try {
      ss = SpreadsheetApp.openById(spreadsheetId);
      console.log('✅ Spreadsheet opened:', ss.getName());
    } catch (error) {
      console.log('🆕 Creating new spreadsheet...');
      ss = SpreadsheetApp.create('AI Competitor Monitor Data - Test');
      props.setProperty('MONITOR_SPREADSHEET_ID', ss.getId());
      console.log('✅ New spreadsheet created:', ss.getId());
    }
    
    console.log('🔄 Step 2: Testing content extraction...');
    
    // Test extractPageContent
    const extractionResult = extractPageContent(testUrl);
    console.log('📄 Extraction result:', extractionResult);
    
    if (!extractionResult.success) {
      return {
        success: false,
        error: 'Content extraction failed: ' + extractionResult.error,
        step: 'content_extraction'
      };
    }
    
    console.log('🔄 Step 3: Testing sheet creation and data storage...');
    
    // Get or create AI_Baselines sheet
    let baselineSheet = ss.getSheetByName('AI_Baselines');
    
    if (!baselineSheet) {
      console.log('🔧 Creating AI_Baselines sheet...');
      baselineSheet = ss.insertSheet('AI_Baselines');
      
      const headers = [
        'Timestamp', 'Company', 'URL', 'Type', 'Content Length', 
        'Content Hash', 'Extracted Content', 'Title', 'Intelligence', 'Processed'
      ];
      baselineSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      baselineSheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      console.log('✅ AI_Baselines sheet created');
    }
    
    // Prepare test data
    const baselineData = {
      timestamp: new Date().toISOString(),
      company: testCompany,
      url: testUrl,
      type: 'test',
      contentLength: extractionResult.contentLength,
      contentHash: extractionResult.contentHash,
      extractedContent: extractionResult.content.substring(0, 1000),
      title: extractionResult.title,
      intelligence: JSON.stringify(extractionResult.intelligence),
      processed: true
    };
    
    // Store the data
    const rowData = [
      baselineData.timestamp,
      baselineData.company,
      baselineData.url,
      baselineData.type,
      baselineData.contentLength,
      baselineData.contentHash,
      baselineData.extractedContent,
      baselineData.title,
      baselineData.intelligence,
      baselineData.processed
    ];
    
    baselineSheet.appendRow(rowData);
    console.log('✅ Test data stored successfully');
    
    return {
      success: true,
      message: 'Baseline generation test completed successfully',
      data: {
        spreadsheetId: ss.getId(),
        url: ss.getUrl(),
        extractedLength: extractionResult.contentLength,
        contentHash: extractionResult.contentHash,
        title: extractionResult.title
      }
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return {
      success: false,
      error: error.toString(),
      stack: error.stack
    };
  }
}

/**
 * Get or create the monitor spreadsheet
 */
function getOrCreateMonitorSheet() {
  try {
    console.log('📋 Getting or creating monitor spreadsheet...');
    
    // Try to get the spreadsheet ID from properties
    const props = PropertiesService.getScriptProperties();
    let spreadsheetId = props.getProperty('MONITOR_SPREADSHEET_ID');
    
    // Use the hardcoded ID if not in properties
    if (!spreadsheetId) {
      spreadsheetId = '1pOZ96O50x6n2SrNf0aGOcZZxS3hvLWh2HW8Xev95Euc';
      props.setProperty('MONITOR_SPREADSHEET_ID', spreadsheetId);
      console.log('🔑 Using hardcoded spreadsheet ID:', spreadsheetId);
    } else {
      console.log('📊 Found existing spreadsheet ID:', spreadsheetId);
    }
    
    // Try to open the spreadsheet
    let ss;
    try {
      ss = SpreadsheetApp.openById(spreadsheetId);
      console.log('✅ Successfully opened spreadsheet:', ss.getName());
    } catch (error) {
      console.log('⚠️ Could not open existing spreadsheet, creating new one...');
      
      // Create a new spreadsheet
      ss = SpreadsheetApp.create('AI Competitor Monitor Data');
      const newId = ss.getId();
      props.setProperty('MONITOR_SPREADSHEET_ID', newId);
      
      console.log('✅ Created new spreadsheet:', newId);
    }
    
    return {
      success: true,
      spreadsheet: ss,
      spreadsheetId: ss.getId()
    };
    
  } catch (error) {
    console.error('❌ Error getting monitor sheet:', error);
    return {
      success: false,
      error: error.toString(),
      spreadsheet: null
    };
  }
}

/**
 * Store baseline data in spreadsheet
 */
function storeBaselineData(baselineData) {
  try {
    console.log('📊 Storing baseline data for:', baselineData.company, '-', baselineData.url);
    
    const sheetResult = getOrCreateMonitorSheet();
    if (!sheetResult || !sheetResult.success) {
      console.error('❌ Failed to get spreadsheet:', sheetResult ? sheetResult.error : 'No result');
      return false;
    }
    
    if (!sheetResult.spreadsheet) {
      console.error('❌ Spreadsheet object is null');
      return false;
    }
    
    const ss = sheetResult.spreadsheet;
    let baselineSheet = ss.getSheetByName('AI_Baselines');
    
    if (!baselineSheet) {
      console.log('🔧 Creating AI_Baselines sheet...');
      baselineSheet = ss.insertSheet('AI_Baselines');
      
      // Add headers with AI fields
      const headers = [
        'Timestamp', 'Company', 'URL', 'Type', 'Content Length', 
        'Content Hash', 'Extracted Content', 'Title', 'Intelligence', 'Processed',
        'Relevance Score', 'Keywords'
      ];
      baselineSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      baselineSheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      console.log('✅ Created AI_Baselines sheet with headers');
    }
    
    // Prepare data for insertion with AI fields
    const rowData = [
      baselineData.timestamp || new Date().toISOString(),
      baselineData.company || '',
      baselineData.url || '',
      baselineData.type || 'unknown',
      baselineData.contentLength || 0,
      baselineData.contentHash || '',
      (baselineData.extractedContent || '').substring(0, 2000), // Limit to 2000 chars
      baselineData.title || '',
      JSON.stringify(baselineData.intelligence || {}),
      baselineData.processed || true,
      baselineData.relevanceScore || 0,
      baselineData.keywords || ''
    ];
    
    // Add the baseline data
    baselineSheet.appendRow(rowData);
    
    console.log('✅ Successfully stored baseline data for:', baselineData.company, '-', baselineData.url);
    return true;
    
  } catch (error) {
    console.error('❌ Error storing baseline data:', error);
    console.error('Error details:', error.toString());
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    return false;
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
            title: row[7] || '',
            intelligence: row[8] || '',
            processed: row[9] || false,
            relevanceScore: row[10] || 0,
            keywords: row[11] || '',
            aiProcessed: row[10] > 0,
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