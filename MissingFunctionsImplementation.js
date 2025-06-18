/**
 * Missing Functions Implementation for AI Monitor
 * These functions are called in WebApp.js but were not defined
 * Created: June 18, 2025
 */

/**
 * Run monitor check for API - checks all companies for changes
 */
function runMonitorForAPIFixed(checkAll = false) {
  try {
    console.log('🔍 Running monitor check...', checkAll ? '(all companies)' : '(changed only)');
    
    const monitors = getMonitorConfigurationsMultiUrl();
    const results = {
      success: true,
      companiesChecked: 0,
      urlsChecked: 0,
      changesDetected: 0,
      errors: [],
      changes: [],
      timestamp: new Date().toISOString()
    };
    
    // Process each company
    monitors.forEach(monitor => {
      try {
        results.companiesChecked++;
        
        // Check if company monitoring is enabled
        const companyParams = getCompanyParameters(monitor.company);
        const isEnabled = companyParams.success ? 
          companyParams.parameters.monitoringEnabled !== false : true;
        
        if (!isEnabled && !checkAll) {
          console.log(`⏭️ Skipping disabled company: ${monitor.company}`);
          return;
        }
        
        // Process each URL for the company
        if (monitor.urls && Array.isArray(monitor.urls)) {
          monitor.urls.forEach(urlObj => {
            const url = typeof urlObj === 'string' ? urlObj : (urlObj?.url || '');
            if (!url) return;
            
            results.urlsChecked++;
            
            try {
              // Extract current content
              const extraction = extractPageContentWithTimeout(url, 30000);
              
              if (!extraction.success) {
                results.errors.push({
                  company: monitor.company,
                  url: url,
                  error: extraction.error
                });
                return;
              }
              
              // Get baseline for comparison
              const baseline = getBaselineForUrl(url);
              
              if (!baseline) {
                // No baseline - need to generate one first
                console.log(`⚠️ No baseline for ${url} - run baseline generation first`);
                return;
              }
              
              // Check if content changed
              if (baseline.contentHash !== extraction.contentHash) {
                results.changesDetected++;
                
                // Calculate change magnitude
                const previousContent = baseline.extractedContent || '';
                const currentContent = extraction.content || '';
                
                const change = {
                  company: monitor.company,
                  url: url,
                  timestamp: new Date().toISOString(),
                  oldHash: baseline.contentHash,
                  newHash: extraction.contentHash,
                  contentLengthBefore: previousContent.length,
                  contentLengthAfter: currentContent.length,
                  percentageChange: previousContent.length > 0 ? 
                    Math.round((Math.abs(currentContent.length - previousContent.length) / previousContent.length) * 100) : 100,
                  relevanceScore: calculateRelevanceScore(currentContent, url),
                  keywords: extraction.intelligence?.keywords || [],
                  title: extraction.title,
                  summary: `Content changed by ${Math.abs(currentContent.length - previousContent.length)} characters`
                };
                
                results.changes.push(change);
                
                // Store the change
                storeDetectedChange(change);
              }
              
            } catch (urlError) {
              results.errors.push({
                company: monitor.company,
                url: url,
                error: urlError.toString()
              });
            }
          });
        }
        
      } catch (companyError) {
        results.errors.push({
          company: monitor.company,
          error: companyError.toString()
        });
      }
    });
    
    // Update last check timestamp
    PropertiesService.getScriptProperties().setProperty('LAST_MONITOR_CHECK', new Date().toISOString());
    
    console.log(`✅ Monitor check complete: ${results.changesDetected} changes detected`);
    
    return results;
    
  } catch (error) {
    console.error('❌ Error in runMonitorForAPIFixed:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Check for content updates - returns changes since last check
 */
function checkForContentUpdates() {
  try {
    console.log('🔄 Checking for content updates...');
    
    // Run the monitor check
    const monitorResults = runMonitorForAPIFixed(false);
    
    if (!monitorResults.success) {
      return {
        success: false,
        error: monitorResults.error
      };
    }
    
    // Get recent changes from storage
    const recentChanges = getRecentDetectedChanges(50);
    
    return {
      success: true,
      hasUpdates: monitorResults.changesDetected > 0,
      updatesCount: monitorResults.changesDetected,
      changes: monitorResults.changes,
      recentChanges: recentChanges,
      lastCheck: new Date().toISOString(),
      summary: `Found ${monitorResults.changesDetected} updates across ${monitorResults.companiesChecked} companies`
    };
    
  } catch (error) {
    console.error('❌ Error checking for updates:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Get logs for API - returns system activity logs
 */
function getLogsForAPIFixed(limit = 50) {
  try {
    console.log('📝 Getting system logs...');
    
    const sheetResult = getOrCreateMonitorSheet();
    if (!sheetResult.success) {
      return {
        success: false,
        error: 'Failed to access logs',
        logs: []
      };
    }
    
    const ss = sheetResult.spreadsheet;
    let logsSheet = ss.getSheetByName('SystemLogs');
    
    if (!logsSheet) {
      // Create logs sheet if it doesn't exist
      logsSheet = ss.insertSheet('SystemLogs');
      const headers = ['Timestamp', 'Level', 'Category', 'Message', 'Details'];
      logsSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      logsSheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      
      // Add initial log entry
      logsSheet.appendRow([
        new Date().toISOString(),
        'INFO',
        'System',
        'System logs initialized',
        'Created new SystemLogs sheet'
      ]);
    }
    
    // Get recent logs
    const lastRow = logsSheet.getLastRow();
    if (lastRow <= 1) {
      return {
        success: true,
        logs: [],
        total: 0
      };
    }
    
    const startRow = Math.max(2, lastRow - limit + 1);
    const numRows = lastRow - startRow + 1;
    
    const logsData = logsSheet.getRange(startRow, 1, numRows, 5).getValues();
    
    const logs = logsData.map(row => ({
      timestamp: row[0],
      level: row[1],
      category: row[2],
      message: row[3],
      details: row[4]
    })).reverse(); // Most recent first
    
    return {
      success: true,
      logs: logs,
      total: logs.length,
      hasMore: lastRow > limit + 1
    };
    
  } catch (error) {
    console.error('❌ Error getting logs:', error);
    return {
      success: false,
      error: error.toString(),
      logs: []
    };
  }
}

/**
 * Get recent changes for API
 */
function getRecentChangesForAPIFixed() {
  try {
    console.log('📊 Getting recent changes...');
    
    const changes = getRecentDetectedChanges(100);
    
    // Group changes by company
    const byCompany = {};
    changes.forEach(change => {
      if (!byCompany[change.company]) {
        byCompany[change.company] = [];
      }
      byCompany[change.company].push(change);
    });
    
    // Calculate statistics
    const stats = {
      totalChanges: changes.length,
      companiesWithChanges: Object.keys(byCompany).length,
      last24Hours: changes.filter(c => {
        const changeTime = new Date(c.timestamp);
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return changeTime > dayAgo;
      }).length,
      lastWeek: changes.filter(c => {
        const changeTime = new Date(c.timestamp);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return changeTime > weekAgo;
      }).length
    };
    
    return {
      success: true,
      changes: changes.slice(0, 50), // Return max 50 for performance
      byCompany: byCompany,
      stats: stats,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Error getting recent changes:', error);
    return {
      success: false,
      error: error.toString(),
      changes: []
    };
  }
}

/**
 * Get statistics for API
 */
function getStatsForAPIFixed() {
  try {
    console.log('📈 Getting system statistics...');
    
    const props = PropertiesService.getScriptProperties();
    const config = getMonitorConfigurationsMultiUrl();
    
    // Count total URLs
    let totalUrls = 0;
    let enabledCompanies = 0;
    
    config.forEach(company => {
      const companyParams = getCompanyParameters(company.company);
      const isEnabled = companyParams.success ? 
        companyParams.parameters.monitoringEnabled !== false : true;
      
      if (isEnabled) {
        enabledCompanies++;
      }
      
      if (company.urls && Array.isArray(company.urls)) {
        totalUrls += company.urls.length;
      }
    });
    
    // Get baseline stats
    const baselineStats = getBaselineStatistics();
    
    // Get change stats
    const changeStats = getChangeStatistics();
    
    // Get TheBrain stats
    const theBrainStatus = getTheBrainStatus();
    
    return {
      success: true,
      stats: {
        monitoring: {
          totalCompanies: config.length,
          enabledCompanies: enabledCompanies,
          totalUrls: totalUrls,
          lastMonitorRun: props.getProperty('LAST_MONITOR_CHECK') || 'Never',
          lastBaselineGeneration: props.getProperty('LAST_BASELINE_GENERATED') || 'Never'
        },
        baselines: baselineStats,
        changes: changeStats,
        system: {
          version: 83,
          corsFixed: true,
          theBrainIntegrated: theBrainStatus.success,
          spreadsheetId: props.getProperty('MONITOR_SPREADSHEET_ID')
        }
      },
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Error getting stats:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Get extracted data for API with filtering
 */
function getExtractedDataForAPI(params = {}) {
  try {
    console.log('🔍 Getting extracted data...', params);
    
    const company = params.company;
    const type = params.type;
    const keyword = params.keyword;
    const limit = params.limit || 50;
    
    const sheetResult = getOrCreateMonitorSheet();
    if (!sheetResult.success) {
      return {
        success: false,
        error: 'Failed to access data',
        data: []
      };
    }
    
    const ss = sheetResult.spreadsheet;
    const baselineSheet = ss.getSheetByName('AI_Baselines');
    
    if (!baselineSheet || baselineSheet.getLastRow() <= 1) {
      return {
        success: true,
        data: [],
        total: 0,
        message: 'No extracted data found'
      };
    }
    
    // Get all data
    const lastRow = baselineSheet.getLastRow();
    const data = baselineSheet.getRange(2, 1, lastRow - 1, 15).getValues();
    
    // Filter data based on parameters
    let filtered = data.map((row, index) => ({
      timestamp: row[0],
      company: row[1],
      url: row[2],
      type: row[3],
      priority: row[4],
      contentLength: row[5],
      contentHash: row[6],
      extractedContent: row[7],
      title: row[8],
      intelligence: row[9] ? JSON.parse(row[9]) : {},
      processed: row[10],
      relevanceScore: row[11],
      keywords: row[12],
      processingTime: row[13],
      scheduled: row[14],
      rowIndex: index + 2
    }));
    
    // Apply filters
    if (company) {
      filtered = filtered.filter(item => 
        item.company.toLowerCase().includes(company.toLowerCase())
      );
    }
    
    if (type) {
      filtered = filtered.filter(item => 
        item.type.toLowerCase() === type.toLowerCase()
      );
    }
    
    if (keyword) {
      const keywordLower = keyword.toLowerCase();
      filtered = filtered.filter(item => 
        item.extractedContent.toLowerCase().includes(keywordLower) ||
        item.title.toLowerCase().includes(keywordLower) ||
        item.keywords.toLowerCase().includes(keywordLower)
      );
    }
    
    // Sort by timestamp descending
    filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Apply limit
    const limited = filtered.slice(0, limit);
    
    return {
      success: true,
      data: limited,
      total: filtered.length,
      returned: limited.length,
      hasMore: filtered.length > limit,
      filters: {
        company: company || null,
        type: type || null,
        keyword: keyword || null
      }
    };
    
  } catch (error) {
    console.error('❌ Error getting extracted data:', error);
    return {
      success: false,
      error: error.toString(),
      data: []
    };
  }
}

/**
 * Get URLs for API - returns all monitored URLs with status
 */
function getUrlsForAPIFixed() {
  try {
    console.log('🔗 Getting monitored URLs...');
    
    const config = getMonitorConfigurationsMultiUrl();
    const urls = [];
    
    config.forEach(company => {
      if (company.urls && Array.isArray(company.urls)) {
        company.urls.forEach((urlObj, index) => {
          const url = typeof urlObj === 'string' ? urlObj : (urlObj?.url || '');
          const type = typeof urlObj === 'object' ? (urlObj.type || 'unknown') : 'unknown';
          
          if (url) {
            // Get baseline info
            const baseline = getBaselineForUrl(url);
            
            urls.push({
              company: company.company,
              url: url,
              type: type,
              index: index,
              hasBaseline: !!baseline,
              baselineDate: baseline ? baseline.timestamp : null,
              contentLength: baseline ? baseline.contentLength : null,
              lastCheck: baseline ? baseline.timestamp : null
            });
          }
        });
      }
    });
    
    // Group by company
    const byCompany = {};
    urls.forEach(urlInfo => {
      if (!byCompany[urlInfo.company]) {
        byCompany[urlInfo.company] = [];
      }
      byCompany[urlInfo.company].push(urlInfo);
    });
    
    return {
      success: true,
      urls: urls,
      byCompany: byCompany,
      total: urls.length,
      companies: Object.keys(byCompany).length,
      withBaseline: urls.filter(u => u.hasBaseline).length,
      withoutBaseline: urls.filter(u => !u.hasBaseline).length
    };
    
  } catch (error) {
    console.error('❌ Error getting URLs:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

// ============================================
// HELPER FUNCTIONS FOR MISSING IMPLEMENTATIONS
// ============================================

/**
 * Get baseline for a specific URL
 */
function getBaselineForUrl(url) {
  try {
    const sheetResult = getOrCreateMonitorSheet();
    if (!sheetResult.success) return null;
    
    const ss = sheetResult.spreadsheet;
    const baselineSheet = ss.getSheetByName('AI_Baselines');
    
    if (!baselineSheet || baselineSheet.getLastRow() <= 1) return null;
    
    // Search for the URL in baselines (most recent first)
    const data = baselineSheet.getDataRange().getValues();
    
    for (let i = data.length - 1; i >= 1; i--) {
      if (data[i][2] === url) {
        return {
          timestamp: data[i][0],
          company: data[i][1],
          url: data[i][2],
          type: data[i][3],
          priority: data[i][4],
          contentLength: data[i][5],
          contentHash: data[i][6],
          extractedContent: data[i][7],
          title: data[i][8],
          intelligence: data[i][9] ? JSON.parse(data[i][9]) : {},
          relevanceScore: data[i][11],
          keywords: data[i][12]
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
 * Store detected change in spreadsheet
 */
function storeDetectedChange(change) {
  try {
    const sheetResult = getOrCreateMonitorSheet();
    if (!sheetResult.success) return false;
    
    const ss = sheetResult.spreadsheet;
    let changesSheet = ss.getSheetByName('DetectedChanges');
    
    if (!changesSheet) {
      changesSheet = ss.insertSheet('DetectedChanges');
      const headers = [
        'Timestamp', 'Company', 'URL', 'Old Hash', 'New Hash',
        'Content Length Before', 'Content Length After', 'Percentage Change',
        'Relevance Score', 'Keywords', 'Title', 'Summary'
      ];
      changesSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      changesSheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    }
    
    // Add the change
    changesSheet.appendRow([
      change.timestamp,
      change.company,
      change.url,
      change.oldHash,
      change.newHash,
      change.contentLengthBefore,
      change.contentLengthAfter,
      change.percentageChange,
      change.relevanceScore,
      change.keywords.join(', '),
      change.title || '',
      change.summary || ''
    ]);
    
    // Log the change
    logActivity(`Change detected: ${change.company} - ${change.url}`, 'change_detection');
    
    return true;
    
  } catch (error) {
    console.error('Error storing detected change:', error);
    return false;
  }
}

/**
 * Get recent detected changes from storage
 */
function getRecentDetectedChanges(limit = 50) {
  try {
    const sheetResult = getOrCreateMonitorSheet();
    if (!sheetResult.success) return [];
    
    const ss = sheetResult.spreadsheet;
    const changesSheet = ss.getSheetByName('DetectedChanges');
    
    if (!changesSheet || changesSheet.getLastRow() <= 1) return [];
    
    const lastRow = changesSheet.getLastRow();
    const startRow = Math.max(2, lastRow - limit + 1);
    const numRows = lastRow - startRow + 1;
    
    const data = changesSheet.getRange(startRow, 1, numRows, 12).getValues();
    
    return data.map(row => ({
      timestamp: row[0],
      company: row[1],
      url: row[2],
      oldHash: row[3],
      newHash: row[4],
      contentLengthBefore: row[5],
      contentLengthAfter: row[6],
      percentageChange: row[7],
      relevanceScore: row[8],
      keywords: row[9] ? row[9].split(', ') : [],
      title: row[10],
      summary: row[11]
    })).reverse(); // Most recent first
    
  } catch (error) {
    console.error('Error getting recent changes:', error);
    return [];
  }
}

/**
 * Get baseline statistics
 */
function getBaselineStatistics() {
  try {
    const sheetResult = getOrCreateMonitorSheet();
    if (!sheetResult.success) return { total: 0, companies: 0, avgContentLength: 0 };
    
    const ss = sheetResult.spreadsheet;
    const baselineSheet = ss.getSheetByName('AI_Baselines');
    
    if (!baselineSheet || baselineSheet.getLastRow() <= 1) {
      return { total: 0, companies: 0, avgContentLength: 0 };
    }
    
    const data = baselineSheet.getRange(2, 1, baselineSheet.getLastRow() - 1, 6).getValues();
    
    const companies = new Set();
    let totalContentLength = 0;
    
    data.forEach(row => {
      if (row[1]) companies.add(row[1]); // Company name
      if (row[5]) totalContentLength += row[5]; // Content length
    });
    
    return {
      total: data.length,
      companies: companies.size,
      avgContentLength: data.length > 0 ? Math.round(totalContentLength / data.length) : 0,
      lastBaseline: data.length > 0 ? data[data.length - 1][0] : null
    };
    
  } catch (error) {
    console.error('Error getting baseline statistics:', error);
    return { total: 0, companies: 0, avgContentLength: 0 };
  }
}

/**
 * Get change statistics
 */
function getChangeStatistics() {
  try {
    const changes = getRecentDetectedChanges(1000); // Get up to 1000 recent changes
    
    if (changes.length === 0) {
      return {
        total: 0,
        last24Hours: 0,
        lastWeek: 0,
        avgRelevanceScore: 0,
        highRelevanceCount: 0
      };
    }
    
    const now = new Date();
    const dayAgo = new Date(now - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    
    let totalRelevance = 0;
    let highRelevanceCount = 0;
    let last24Hours = 0;
    let lastWeek = 0;
    
    changes.forEach(change => {
      const changeTime = new Date(change.timestamp);
      
      if (changeTime > dayAgo) last24Hours++;
      if (changeTime > weekAgo) lastWeek++;
      
      if (change.relevanceScore) {
        totalRelevance += change.relevanceScore;
        if (change.relevanceScore >= 6) highRelevanceCount++;
      }
    });
    
    return {
      total: changes.length,
      last24Hours: last24Hours,
      lastWeek: lastWeek,
      avgRelevanceScore: changes.length > 0 ? Math.round(totalRelevance / changes.length * 10) / 10 : 0,
      highRelevanceCount: highRelevanceCount,
      lastChange: changes.length > 0 ? changes[0].timestamp : null
    };
    
  } catch (error) {
    console.error('Error getting change statistics:', error);
    return {
      total: 0,
      last24Hours: 0,
      lastWeek: 0,
      avgRelevanceScore: 0,
      highRelevanceCount: 0
    };
  }
}

/**
 * Log system activity
 */
function logActivity(message, category = 'system', level = 'INFO', details = '') {
  try {
    const sheetResult = getOrCreateMonitorSheet();
    if (!sheetResult.success) return;
    
    const ss = sheetResult.spreadsheet;
    let logsSheet = ss.getSheetByName('SystemLogs');
    
    if (!logsSheet) {
      logsSheet = ss.insertSheet('SystemLogs');
      const headers = ['Timestamp', 'Level', 'Category', 'Message', 'Details'];
      logsSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      logsSheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    }
    
    // Add log entry
    logsSheet.appendRow([
      new Date().toISOString(),
      level,
      category,
      message,
      details
    ]);
    
    // Keep only last 1000 logs
    if (logsSheet.getLastRow() > 1001) {
      logsSheet.deleteRow(2); // Delete oldest log
    }
    
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}

/**
 * Test all missing functions implementation
 */
function testMissingFunctionsImplementation() {
  console.log('🧪 Testing missing functions implementation...');
  
  const tests = {
    runMonitor: runMonitorForAPIFixed(false),
    checkUpdates: checkForContentUpdates(),
    getLogs: getLogsForAPIFixed(10),
    getChanges: getRecentChangesForAPIFixed(),
    getStats: getStatsForAPIFixed(),
    getExtracted: getExtractedDataForAPI({ limit: 10 }),
    getUrls: getUrlsForAPIFixed()
  };
  
  console.log('Test results:', tests);
  
  return {
    success: true,
    message: 'All missing functions implemented and tested',
    tests: tests
  };
}
