/**
 * Store Page Content Function
 * This was missing and causing the "storePageContent is not defined" error
 */

// Configuration for sheet structure
const SHEET_CONFIG = {
  tabs: {
    pageContent: 'PageContent',
    baseline: 'Baseline',
    changes: 'Changes',
    summary: 'Summary',
    logs: 'Logs'
  }
};

/**
 * Store page content in the PageContent sheet
 * This function was missing and causing the error
 */
function storePageContent(url, content, intelligence) {
  try {
    const sheetResult = getOrCreateMonitorSheet();
    if (!sheetResult.success) {
      throw new Error('Failed to get monitor sheet');
    }
    
    const ss = sheetResult.spreadsheet;
    let pageContentSheet = ss.getSheetByName(SHEET_CONFIG.tabs.pageContent);
    
    // Create PageContent sheet if it doesn't exist
    if (!pageContentSheet) {
      pageContentSheet = ss.insertSheet(SHEET_CONFIG.tabs.pageContent);
      const headers = ['URL', 'Content', 'Intelligence', 'Last Updated', 'Content Hash', 'Content Length'];
      pageContentSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      pageContentSheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      pageContentSheet.setFrozenRows(1);
    }
    
    // Find existing row or add new one
    const data = pageContentSheet.getDataRange().getValues();
    let rowIndex = -1;
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === url) {
        rowIndex = i + 1; // 1-based index
        break;
      }
    }
    
    // Prepare data
    const timestamp = new Date().toISOString();
    const intelligenceStr = typeof intelligence === 'object' ? 
      JSON.stringify(intelligence) : String(intelligence || '');
    
    // Calculate content hash
    const contentHash = Utilities.computeDigest(
      Utilities.DigestAlgorithm.MD5,
      content
    ).map(byte => (byte & 0xFF).toString(16).padStart(2, '0')).join('');
    
    const rowData = [
      url,
      content.substring(0, 50000), // Limit content to 50k chars
      intelligenceStr,
      timestamp,
      contentHash,
      content.length
    ];
    
    if (rowIndex > 0) {
      // Update existing row
      pageContentSheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
    } else {
      // Add new row
      pageContentSheet.appendRow(rowData);
    }
    
    console.log(`Stored content for ${url} (${content.length} chars)`);
    return true;
    
  } catch (error) {
    console.error('Error storing page content:', error);
    logError(`Failed to store page content for ${url}: ${error.toString()}`);
    return false;
  }
}

/**
 * Get previous full content from PageContent sheet
 */
function getPreviousFullContent(url) {
  try {
    const sheetResult = getOrCreateMonitorSheet();
    if (!sheetResult.success) return '';
    
    const ss = sheetResult.spreadsheet;
    const pageContentSheet = ss.getSheetByName(SHEET_CONFIG.tabs.pageContent);
    
    if (!pageContentSheet || pageContentSheet.getLastRow() <= 1) {
      return '';
    }
    
    const data = pageContentSheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === url) {
        return data[i][1] || ''; // Return content column
      }
    }
    
    return '';
  } catch (error) {
    console.error('Error getting previous content:', error);
    return '';
  }
}

/**
 * Store baseline information with enhanced data
 */
function storeBaseline(company, url, extraction) {
  try {
    const sheetResult = getOrCreateMonitorSheet();
    if (!sheetResult.success) {
      throw new Error('Failed to get monitor sheet');
    }
    
    const ss = sheetResult.spreadsheet;
    let baselineSheet = ss.getSheetByName(SHEET_CONFIG.tabs.baseline);
    
    if (!baselineSheet) {
      baselineSheet = ss.insertSheet(SHEET_CONFIG.tabs.baseline);
      const headers = [
        'Company', 'URL', 'Last Checked', 'Content Hash', 
        'Page Title', 'Status', 'Content Length', 'Intelligence Score'
      ];
      baselineSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      baselineSheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      baselineSheet.setFrozenRows(1);
    }
    
    // Find existing row or add new one
    const data = baselineSheet.getDataRange().getValues();
    let rowIndex = -1;
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === url) {
        rowIndex = i + 1; // 1-based index
        break;
      }
    }
    
    const timestamp = new Date().toISOString();
    const intelligenceScore = extraction.intelligence?.relevanceScore || 
                            extraction.intelligence?.significanceScore || 
                            '-';
    
    const rowData = [
      company,
      url,
      timestamp,
      extraction.contentHash,
      extraction.title || '',
      'Active',
      extraction.contentLength,
      intelligenceScore
    ];
    
    if (rowIndex > 0) {
      // Update existing row
      baselineSheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
    } else {
      // Add new row
      baselineSheet.appendRow(rowData);
    }
    
    // Also store in properties for quick access
    const key = `baseline_${Utilities.computeDigest(
      Utilities.DigestAlgorithm.MD5,
      company + url
    ).map(byte => (byte & 0xFF).toString(16).padStart(2, '0')).join('')}`;
    
    const baselineData = {
      company: company,
      url: url,
      contentHash: extraction.contentHash,
      content: extraction.content.substring(0, 1000), // Store preview
      timestamp: timestamp,
      intelligence: extraction.intelligence
    };
    
    PropertiesService.getScriptProperties().setProperty(
      key,
      JSON.stringify(baselineData)
    );
    
    return true;
  } catch (error) {
    console.error('Error storing baseline:', error);
    logError(`Failed to store baseline for ${url}: ${error.toString()}`);
    return false;
  }
}

/**
 * Get baseline for URL
 */
function getBaselineForUrl(url) {
  try {
    // First try properties for quick access
    const props = PropertiesService.getScriptProperties();
    const keys = props.getKeys();
    
    for (const key of keys) {
      if (key.startsWith('baseline_')) {
        try {
          const baseline = JSON.parse(props.getProperty(key));
          if (baseline.url === url) {
            return baseline;
          }
        } catch (e) {
          // Skip invalid entries
        }
      }
    }
    
    // Fallback to sheet lookup
    const sheetResult = getOrCreateMonitorSheet();
    if (!sheetResult.success) return null;
    
    const ss = sheetResult.spreadsheet;
    const baselineSheet = ss.getSheetByName(SHEET_CONFIG.tabs.baseline);
    
    if (!baselineSheet || baselineSheet.getLastRow() <= 1) {
      return null;
    }
    
    const data = baselineSheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === url) {
        return {
          company: data[i][0],
          url: data[i][1],
          timestamp: data[i][2],
          contentHash: data[i][3],
          title: data[i][4],
          status: data[i][5],
          contentLength: data[i][6]
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting baseline:', error);
    return null;
  }
}

/**
 * Store full page content with magnitude information
 * This is the enhanced version that was missing
 */
function storeFullPageContent(url, content, magnitude, extraction) {
  try {
    const sheetResult = getOrCreateMonitorSheet();
    if (!sheetResult.success) {
      throw new Error('Failed to get monitor sheet');
    }
    
    const ss = sheetResult.spreadsheet;
    let contentSheet = ss.getSheetByName('PageContentFull');
    
    if (!contentSheet) {
      contentSheet = ss.insertSheet('PageContentFull');
      const headers = [
        'URL', 'Content', 'Content Hash', 'Content Length',
        'Magnitude', 'Percentage Change', 'Intelligence',
        'Last Updated'
      ];
      contentSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      contentSheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      contentSheet.setFrozenRows(1);
    }
    
    // Find existing row or add new one
    const data = contentSheet.getDataRange().getValues();
    let rowIndex = -1;
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === url) {
        rowIndex = i + 1;
        break;
      }
    }
    
    const timestamp = new Date().toISOString();
    const magnitudeStr = magnitude ? JSON.stringify(magnitude) : '';
    const percentageChange = magnitude?.percentageChange || 0;
    const intelligenceStr = extraction?.intelligence ? 
      JSON.stringify(extraction.intelligence) : '';
    
    const rowData = [
      url,
      content.substring(0, 50000),
      extraction?.contentHash || '',
      content.length,
      magnitudeStr,
      percentageChange,
      intelligenceStr,
      timestamp
    ];
    
    if (rowIndex > 0) {
      contentSheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
    } else {
      contentSheet.appendRow(rowData);
    }
    
    return true;
  } catch (error) {
    console.error('Error storing full page content:', error);
    return false;
  }
}

/**
 * Store detected changes
 */
function storeDetectedChanges(changes) {
  try {
    const sheetResult = getOrCreateMonitorSheet();
    if (!sheetResult.success) return;
    
    const ss = sheetResult.spreadsheet;
    const changesSheet = ss.getSheetByName(SHEET_CONFIG.tabs.changes);
    
    if (!changesSheet) {
      console.error('Changes sheet not found');
      return;
    }
    
    changes.forEach(change => {
      changesSheet.appendRow([
        new Date().toISOString(),
        change.company,
        change.url,
        change.category || 'content_change',
        change.summary,
        change.oldHash,
        change.newHash,
        change.relevanceScore,
        change.keywords?.join(', ') || '',
        change.urlType || '',
        change.magnitude?.percentageChange || 0
      ]);
    });
    
    console.log(`Stored ${changes.length} changes`);
  } catch (error) {
    console.error('Error storing changes:', error);
  }
}

/**
 * Log error helper function
 */
function logError(message) {
  console.error(message);
  
  // Try to log to sheet if available
  try {
    const sheetResult = getOrCreateMonitorSheet();
    if (sheetResult.success) {
      const ss = sheetResult.spreadsheet;
      let logsSheet = ss.getSheetByName('Logs');
      
      if (logsSheet) {
        logsSheet.appendRow([
          new Date().toISOString(),
          'error',
          message,
          ''
        ]);
      }
    }
  } catch (e) {
    // Silently fail if can't log to sheet
  }
}

/**
 * Test the fixed functions
 */
function testStorePageContent() {
  const testUrl = 'https://anthropic.com/claude';
  const testContent = 'This is test content for Claude page';
  const testIntelligence = {
    themes: ['AI', 'assistant'],
    relevanceScore: 7
  };
  
  const result = storePageContent(testUrl, testContent, testIntelligence);
  
  return {
    success: result,
    message: result ? 'storePageContent is now working!' : 'Function failed',
    test: {
      url: testUrl,
      contentLength: testContent.length,
      intelligence: testIntelligence
    }
  };
}