/**
 * Baseline Generation Fix - Handle timeouts for large datasets
 */

// Modified baseline generation with batching and progress tracking
function generateBaselineBatched() {
  const startTime = new Date();
  console.log('Starting batched baseline generation at', startTime);
  
  try {
    // Get all companies and URLs
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('URL_Monitor');
    if (!sheet) {
      return { error: 'URL_Monitor sheet not found' };
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1).filter(row => row[0] && row[1]); // Company and URL exist
    
    // Get or initialize batch progress
    const props = PropertiesService.getScriptProperties();
    let batchProgress = props.getProperty('BASELINE_BATCH_PROGRESS');
    let startIndex = 0;
    
    if (batchProgress) {
      const progress = JSON.parse(batchProgress);
      startIndex = progress.lastProcessed + 1;
      console.log('Resuming from index:', startIndex);
    }
    
    // Process in batches of 5 URLs (to avoid timeout)
    const BATCH_SIZE = 5;
    const endIndex = Math.min(startIndex + BATCH_SIZE, rows.length);
    
    let processed = 0;
    let errors = [];
    
    for (let i = startIndex; i < endIndex; i++) {
      const row = rows[i];
      const company = row[0];
      const url = row[1];
      
      try {
        console.log(`Processing ${i + 1}/${rows.length}: ${company} - ${url}`);
        
        // Extract content
        const extraction = extractPageContent(url);
        if (!extraction.success) {
          errors.push({ company, url, error: extraction.error });
          continue;
        }
        
        // Store baseline
        const baselineData = {
          company: company,
          url: url,
          content: extraction.content,
          extractedAt: new Date().toISOString(),
          contentHash: Utilities.computeDigest(
            Utilities.DigestAlgorithm.MD5, 
            extraction.content
          ).map(byte => ('0' + (byte & 0xFF).toString(16)).slice(-2)).join(''),
          metadata: extraction.metadata
        };
        
        // Store in Baseline sheet
        storeBaselineData(baselineData);
        processed++;
        
        // Add small delay to avoid rate limits
        Utilities.sleep(1000);
        
      } catch (error) {
        console.error(`Error processing ${company} - ${url}:`, error);
        errors.push({ company, url, error: error.toString() });
      }
    }
    
    // Update progress
    if (endIndex < rows.length) {
      // More to process
      props.setProperty('BASELINE_BATCH_PROGRESS', JSON.stringify({
        lastProcessed: endIndex - 1,
        totalUrls: rows.length,
        startedAt: startTime.toISOString()
      }));
      
      return {
        status: 'in_progress',
        message: `Processed ${endIndex} of ${rows.length} URLs`,
        processed: endIndex,
        total: rows.length,
        percentComplete: Math.round((endIndex / rows.length) * 100),
        errors: errors.length,
        nextBatch: true
      };
    } else {
      // All done!
      props.deleteProperty('BASELINE_BATCH_PROGRESS');
      
      return {
        status: 'completed',
        message: `Baseline generation complete! Processed ${rows.length} URLs`,
        processed: rows.length,
        total: rows.length,
        percentComplete: 100,
        errors: errors.length,
        errorDetails: errors
      };
    }
    
  } catch (error) {
    console.error('Baseline generation error:', error);
    return {
      status: 'error',
      error: error.toString(),
      message: 'Baseline generation failed'
    };
  }
}

// Helper function to store baseline data
function storeBaselineData(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Baselines');
  if (!sheet) {
    // Create Baselines sheet if it doesn't exist
    const newSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('Baselines');
    newSheet.getRange(1, 1, 1, 6).setValues([
      ['Company', 'URL', 'Content Hash', 'Extracted At', 'Content Length', 'Metadata']
    ]);
  }
  
  const baselineSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Baselines');
  baselineSheet.appendRow([
    data.company,
    data.url,
    data.contentHash,
    data.extractedAt,
    data.content.length,
    JSON.stringify(data.metadata || {})
  ]);
}

// Reset batch progress if needed
function resetBaselineProgress() {
  PropertiesService.getScriptProperties().deleteProperty('BASELINE_BATCH_PROGRESS');
  return { message: 'Baseline progress reset. You can start fresh.' };
}

// Get current baseline progress
function getBaselineProgress() {
  const progress = PropertiesService.getScriptProperties().getProperty('BASELINE_BATCH_PROGRESS');
  if (!progress) {
    return { status: 'not_started', message: 'No baseline generation in progress' };
  }
  
  const data = JSON.parse(progress);
  return {
    status: 'in_progress',
    lastProcessed: data.lastProcessed + 1,
    total: data.totalUrls,
    percentComplete: Math.round(((data.lastProcessed + 1) / data.totalUrls) * 100),
    startedAt: data.startedAt
  };
}

// Quick baseline for testing (just 3 URLs)
function generateQuickBaseline() {
  console.log('Generating quick baseline for testing...');
  
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('URL_Monitor');
    const data = sheet.getDataRange().getValues();
    const rows = data.slice(1, 4); // Just first 3 URLs
    
    let results = [];
    
    rows.forEach(row => {
      if (row[0] && row[1]) {
        const company = row[0];
        const url = row[1];
        
        try {
          const extraction = extractPageContent(url);
          results.push({
            company,
            url,
            success: extraction.success,
            contentLength: extraction.content ? extraction.content.length : 0
          });
        } catch (error) {
          results.push({
            company,
            url,
            success: false,
            error: error.toString()
          });
        }
      }
    });
    
    return {
      success: true,
      message: 'Quick baseline complete',
      results: results
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}