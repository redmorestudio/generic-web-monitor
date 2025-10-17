/**
 * Diagnostic functions to check data storage and content extraction
 */

function checkDataStorage() {
  try {
    // Get the spreadsheet
    const config = getMonitorConfig();
    const spreadsheetId = config.spreadsheet.id;
    const ss = SpreadsheetApp.openById(spreadsheetId);
    
    // Check each sheet
    const dataSheet = ss.getSheetByName(config.spreadsheet.dataSheet);
    const changeSheet = ss.getSheetByName(config.spreadsheet.changeSheet);
    
    const dataRows = dataSheet.getLastRow();
    const changeRows = changeSheet.getLastRow();
    
    // Get sample of data to see what's actually stored
    let sampleData = [];
    if (dataRows > 1) {
      const range = dataSheet.getRange(2, 1, Math.min(10, dataRows - 1), dataSheet.getLastColumn());
      const values = range.getValues();
      sampleData = values.map(row => ({
        timestamp: row[0],
        url: row[1], 
        title: row[2],
        wordCount: row[3],
        hasContent: row[4] && row[4].length > 0
      }));
    }
    
    return {
      success: true,
      dataRows: dataRows,
      changeRows: changeRows,
      sampleData: sampleData,
      hasPermissions: checkFetchPermissions()
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

function checkFetchPermissions() {
  try {
    // Try a simple fetch to test permissions
    const response = UrlFetchApp.fetch('https://httpbin.org/status/200', {
      method: 'GET',
      muteHttpExceptions: true
    });
    return response.getResponseCode() === 200;
  } catch (error) {
    return false;
  }
}

function testSingleUrlExtraction() {
  try {
    // Test content extraction on a single URL
    const testUrl = 'https://anthropic.com';
    
    console.log(`Testing content extraction for: ${testUrl}`);
    
    const response = UrlFetchApp.fetch(testUrl, {
      method: 'GET',
      followRedirects: true,
      muteHttpExceptions: true,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AI Monitor Bot)'
      }
    });
    
    const content = response.getContentText();
    const responseCode = response.getResponseCode();
    
    return {
      success: true,
      url: testUrl,
      responseCode: responseCode,
      contentLength: content.length,
      contentPreview: content.substring(0, 200) + '...',
      hasContent: content.length > 0
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString(),
      permissionIssue: error.toString().includes('permission')
    };
  }
}

function getMonitoringConfiguration() {
  try {
    const monitors = getMonitorConfigurations();
    return {
      success: true,
      totalCompanies: monitors.length,
      totalUrls: monitors.reduce((sum, m) => sum + m.urls.length, 0),
      companies: monitors.map(m => ({
        company: m.company,
        urlCount: m.urls.length,
        urls: m.urls
      }))
    };
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}
