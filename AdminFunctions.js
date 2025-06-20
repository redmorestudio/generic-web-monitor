/**
 * Admin Functions - Automated Solution
 * These run with full permissions via triggers - no manual operation required
 */

/**
 * Generate baseline for all or new URLs
 * Run this function directly from the editor to bypass web app authorization limits
 */
function adminGenerateBaseline(options = {}) {
  console.log('=== ADMIN BASELINE GENERATION ===');
  console.log('Running with full admin permissions...');
  
  const mode = options.mode || 'all'; // 'all' or 'new'
  const clearExisting = options.clearExisting !== false;
  
  try {
    // This calls the actual baseline generation function from WebApp.js
    const result = generateBaselineForAPIBatchedEnhanced({
      mode: mode,
      clearExisting: clearExisting,
      scheduled: false,
      adminRun: true
    });
    
    console.log('Baseline generation started!');
    console.log('Results:', JSON.stringify(result, null, 2));
    return result;
  } catch (e) {
    console.error('Failed:', e);
    return {error: e.toString()};
  }
}

/**
 * Continue a paused baseline job
 * Run this when a baseline job was paused due to errors
 */
function adminContinueBaseline() {
  console.log('=== ADMIN CONTINUE BASELINE ===');
  
  try {
    // This calls the continue function from WebApp.js
    const result = continueBaselineJob();
    console.log('Continue results:', JSON.stringify(result, null, 2));
    return result;
  } catch (e) {
    console.error('Failed to continue baseline:', e);
    return {error: e.toString()};
  }
}

/**
 * Run monitoring for all companies
 */
function adminMonitorAll() {
  console.log('=== ADMIN MONITORING RUN ===');
  
  try {
    // This calls the monitor function from WebApp.js
    const result = runMonitorForAPIFixed(true);
    console.log('Monitoring complete:', JSON.stringify(result, null, 2));
    return result;
  } catch (e) {
    console.error('Failed to run monitoring:', e);
    return {error: e.toString()};
  }
}

/**
 * Set up automatic monitoring using time-based triggers
 * Run this once to schedule regular monitoring
 */
function setupAutomaticMonitoring(intervalHours = 6) {
  console.log('=== SETTING UP AUTOMATIC MONITORING ===');
  
  try {
    // Delete existing triggers to prevent duplicates
    const triggers = ScriptApp.getProjectTriggers();
    triggers.forEach(trigger => {
      if (trigger.getHandlerFunction() === 'adminMonitorAll') {
        ScriptApp.deleteTrigger(trigger);
      }
    });
    
    // Create new trigger to run monitoring every X hours
    ScriptApp.newTrigger('adminMonitorAll')
      .timeBased()
      .everyHours(intervalHours)
      .create();
      
    console.log(`✅ Automatic monitoring set up! Will run every ${intervalHours} hours`);
    return {
      success: true,
      message: `Automatic monitoring set up to run every ${intervalHours} hours`,
      nextRun: new Date(new Date().getTime() + intervalHours * 60 * 60 * 1000).toISOString()
    };
  } catch (e) {
    console.error('Failed to set up automatic monitoring:', e);
    return {error: e.toString()};
  }
}

/**
 * Check authorization status for external URL fetching
 * Run this to test if URL fetching works
 */
function checkAuthorizationStatus() {
  console.log('=== CHECKING AUTHORIZATION STATUS ===');
  
  try {
    // Try to fetch a simple URL
    const testUrl = 'https://www.google.com';
    console.log('Testing URL fetch:', testUrl);
    
    const response = UrlFetchApp.fetch(testUrl, {
      muteHttpExceptions: true,
      followRedirects: true
    });
    
    const code = response.getResponseCode();
    console.log('✅ URL fetch successful! Response code:', code);
    
    // Also test extractPageContentWithTimeout function
    console.log('\nTesting extractPageContentWithTimeout function...');
    const extractResult = extractPageContentWithTimeout('https://www.google.com', 10000);
    
    if (extractResult.success) {
      console.log('✅ Content extraction successful!');
      console.log('Content length:', extractResult.contentLength);
      console.log('Title:', extractResult.title);
    } else {
      console.log('❌ Content extraction failed:', extractResult.error);
    }
    
    return {
      success: true,
      urlFetchWorks: true,
      extractionWorks: extractResult.success,
      message: 'Authorization is working correctly for URL fetching',
      responseCode: code,
      extractionResult: extractResult.success ? {
        title: extractResult.title,
        contentLength: extractResult.contentLength
      } : {error: extractResult.error}
    };
  } catch (e) {
    console.error('❌ Authorization issue:', e);
    return {
      success: false,
      urlFetchWorks: false,
      error: e.toString(),
      message: 'Authorization is NOT working for URL fetching. Run forceReauthorization() function.'
    };
  }
}

/**
 * Test extract function for a specific URL
 */
function testExtractSpecificUrl(url = 'https://www.anthropic.com') {
  console.log(`=== TESTING EXTRACTION FOR: ${url} ===`);
  
  try {
    const result = extractPageContentWithTimeout(url, 30000);
    
    if (result.success) {
      console.log('✅ Extraction successful!');
      console.log('Title:', result.title);
      console.log('Content length:', result.contentLength);
      console.log('Content hash:', result.contentHash);
      console.log('Intelligence:', JSON.stringify(result.intelligence, null, 2));
      console.log('Content preview:', result.content.substring(0, 200) + '...');
    } else {
      console.log('❌ Extraction failed:', result.error);
    }
    
    return result;
  } catch (e) {
    console.error('❌ Extraction error:', e);
    return {
      success: false,
      error: e.toString()
    };
  }
}

/**
 * Push latest code to live deployment
 * This creates a new deployment with the current code
 */
function deployLatestVersion() {
  console.log('=== DEPLOYING LATEST VERSION ===');
  
  try {
    // Create a new deployment
    const deployment = ScriptApp.getService().getDeployments()[0];
    const newDeployment = ScriptApp.getService().createDeployment();
    
    // Get the deployment ID and URL
    const deploymentId = newDeployment.getDeploymentId();
    const url = `https://script.google.com/macros/s/${deploymentId}/exec`;
    
    console.log('✅ New deployment created:');
    console.log('Deployment ID:', deploymentId);
    console.log('Web App URL:', url);
    
    return {
      success: true,
      deploymentId: deploymentId,
      url: url,
      message: 'New deployment created successfully'
    };
  } catch (e) {
    console.error('❌ Deployment failed:', e);
    return {
      success: false,
      error: e.toString()
    };
  }
}

/**
 * AUTOMATED SOLUTION - ONE-TIME SETUP
 * Run this once and everything will be fully automated
 */
function setupFullyAutomatedSystem() {
  console.log('======== SETTING UP FULLY AUTOMATED SYSTEM ========');
  console.log('This will configure ALL automation - no manual steps required');
  
  // Step 1: Clear any existing triggers to prevent duplicates
  console.log('\n1. Removing any existing triggers...');
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    ScriptApp.deleteTrigger(trigger);
  });
  console.log(`✅ Removed ${triggers.length} existing triggers`);
  
  // Step 2: Create trigger for daily baseline generation (new URLs only)
  console.log('\n2. Setting up daily baseline generation for new URLs...');
  ScriptApp.newTrigger('automatedDailyBaseline')
    .timeBased()
    .everyDays(1)
    .atHour(1) // 1 AM
    .create();
  console.log('✅ Daily baseline generation scheduled for 1 AM');
  
  // Step 3: Create trigger for weekly full baseline refresh
  console.log('\n3. Setting up weekly full baseline refresh...');
  ScriptApp.newTrigger('automatedWeeklyFullBaseline')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.SUNDAY)
    .atHour(2) // 2 AM on Sundays
    .create();
  console.log('✅ Weekly full baseline refresh scheduled for Sunday 2 AM');
  
  // Step 4: Create trigger for monitoring (every 6 hours)
  console.log('\n4. Setting up monitoring every 6 hours...');
  ScriptApp.newTrigger('adminMonitorAll')
    .timeBased()
    .everyHours(6)
    .create();
  console.log('✅ Monitoring scheduled every 6 hours');
  
  // Step 5: Run initial authorization check
  console.log('\n5. Running initial authorization check...');
  const authResult = checkAuthorizationStatus();
  
  if (!authResult.success) {
    console.log('\n⚠️ AUTHORIZATION NEEDED');
    console.log('Please ensure you complete these one-time steps:');
    console.log('1. Run the forceReauthorization() function in WebApp.js');
    console.log('2. Accept ALL permission prompts when they appear');
    console.log('3. Run this setupFullyAutomatedSystem() function again');
    
    return {
      success: false,
      message: 'Setup incomplete - authorization required',
      authorizationNeeded: true,
      nextSteps: 'Run forceReauthorization() function to authorize URL fetching'
    };
  }
  
  // Step 6: Initialize the system with a first baseline run
  console.log('\n6. Running initial baseline generation to verify system...');
  const baselineResult = adminGenerateBaseline({mode: 'new'});
  
  // Step 7: Create timestamp to track last setup
  console.log('\n7. Recording system initialization...');
  
  // Get user email safely with try/catch to handle permission issues
  let userEmail = 'system@automated';
  try {
    userEmail = Session.getEffectiveUser().getEmail();
  } catch (e) {
    console.log('Note: Unable to get user email due to permissions - using default');
  }
  
  PropertiesService.getScriptProperties().setProperty(
    'SYSTEM_FULLY_AUTOMATED', 
    JSON.stringify({
      setupAt: new Date().toISOString(),
      setupBy: userEmail,
      status: 'active',
      baselineResult: baselineResult.success,
      monitoringInterval: '6 hours',
      dailyBaseline: '1 AM',
      weeklyFullBaseline: 'Sunday 2 AM'
    })
  );
  
  console.log('\n======== SYSTEM FULLY AUTOMATED! ========');
  console.log('Everything is now running automatically. You never need to');
  console.log('manually run anything again!');
  console.log('\nScheduled tasks:');
  console.log('- Daily baseline for new URLs: 1 AM');
  console.log('- Weekly full baseline refresh: Sunday 2 AM');
  console.log('- Monitoring runs: Every 6 hours');
  
  return {
    success: true,
    message: 'System fully automated! No further action required.',
    baselineResult: baselineResult
  };
}

/**
 * Automated daily baseline generation for new URLs only
 * Called automatically by time-based trigger
 */
function automatedDailyBaseline() {
  console.log('=== AUTOMATED DAILY BASELINE (NEW URLS) ===');
  return adminGenerateBaseline({mode: 'new', adminRun: true});
}

/**
 * Automated weekly full baseline refresh
 * Called automatically by time-based trigger
 */
function automatedWeeklyFullBaseline() {
  console.log('=== AUTOMATED WEEKLY FULL BASELINE REFRESH ===');
  return adminGenerateBaseline({mode: 'all', clearExisting: false, adminRun: true});
}

/**
 * Get automation status - check if the system is running automatically
 */
function getAutomationStatus() {
  console.log('=== CHECKING AUTOMATION STATUS ===');
  
  try {
    // Check for automation setup record
    const props = PropertiesService.getScriptProperties();
    const automationData = props.getProperty('SYSTEM_FULLY_AUTOMATED');
    
    // Get current triggers
    const triggers = ScriptApp.getProjectTriggers();
    const triggerFunctions = triggers.map(t => t.getHandlerFunction());
    
    // Check which automated functions are scheduled
    const hasMonitoring = triggerFunctions.includes('adminMonitorAll');
    const hasDailyBaseline = triggerFunctions.includes('automatedDailyBaseline');
    const hasWeeklyBaseline = triggerFunctions.includes('automatedWeeklyFullBaseline');
    
    if (!automationData) {
      return {
        success: true,
        automated: false,
        triggers: triggers.length,
        message: 'System is not fully automated. Run setupFullyAutomatedSystem() to set up.',
        hasMonitoring: hasMonitoring,
        hasDailyBaseline: hasDailyBaseline,
        hasWeeklyBaseline: hasWeeklyBaseline
      };
    }
    
    // Parse automation data
    const automation = JSON.parse(automationData);
    
    // Check authorization
    const authWorks = checkSimpleAuthorization();
    
    return {
      success: true,
      automated: true,
      status: automation.status,
      setupAt: automation.setupAt,
      setupBy: automation.setupBy,
      monitoringInterval: automation.monitoringInterval,
      dailyBaseline: automation.dailyBaseline,
      weeklyFullBaseline: automation.weeklyFullBaseline,
      triggers: triggers.length,
      authorizationWorks: authWorks,
      monitoringScheduled: hasMonitoring,
      dailyBaselineScheduled: hasDailyBaseline,
      weeklyBaselineScheduled: hasWeeklyBaseline,
      allSchedulesActive: hasMonitoring && hasDailyBaseline && hasWeeklyBaseline,
      message: 'System is fully automated!'
    };
  } catch (e) {
    console.error('Error checking automation status:', e);
    return {
      success: false,
      error: e.toString(),
      message: 'Error checking automation status'
    };
  }
}

/**
 * Quick check if authorization works without detailed logging
 */
function checkSimpleAuthorization() {
  try {
    UrlFetchApp.fetch('https://www.google.com', {
      muteHttpExceptions: true,
      followRedirects: true
    });
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Force reset the spreadsheet ID and create the AI_Baselines sheet
 * This ensures data is stored in the correct spreadsheet
 */
function forceFixSpreadsheetSetup() {
  console.log('=== FORCE FIXING SPREADSHEET SETUP ===');
  
  try {
    // Force set the correct spreadsheet ID
    const correctSpreadsheetId = '18sv6UITXpNu0oMDjMkuQCBHjLYwjWNm21OmLNNwDQlM';
    const props = PropertiesService.getScriptProperties();
    
    // Save the correct ID
    props.setProperty('MONITOR_SPREADSHEET_ID', correctSpreadsheetId);
    console.log(`✅ Spreadsheet ID set to: ${correctSpreadsheetId}`);
    
    // Open the spreadsheet
    const ss = SpreadsheetApp.openById(correctSpreadsheetId);
    console.log(`✅ Successfully opened spreadsheet: ${ss.getName()}`);
    
    // Check if AI_Baselines sheet exists
    let baselineSheet = ss.getSheetByName('AI_Baselines');
    
    if (!baselineSheet) {
      console.log('🔧 Creating AI_Baselines sheet...');
      baselineSheet = ss.insertSheet('AI_Baselines');
      
      // Add headers with AI fields
      const headers = [
        'Timestamp', 'Company', 'URL', 'Type', 'Priority', 'Content Length', 
        'Content Hash', 'Extracted Content', 'Title', 'Intelligence', 'Processed',
        'Relevance Score', 'Keywords', 'Processing Time', 'Scheduled'
      ];
      baselineSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      baselineSheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      console.log('✅ Created AI_Baselines sheet with headers');
    } else {
      console.log('✅ AI_Baselines sheet already exists');
      
      // Check row count
      const rowCount = baselineSheet.getLastRow();
      console.log(`ℹ️ The sheet has ${rowCount} rows (including header)`);
    }
    
    // Test storing a sample row
    console.log('🧪 Testing data storage...');
    const testData = {
      timestamp: new Date().toISOString(),
      company: 'Test Company',
      url: 'https://test.example.com',
      type: 'test',
      priority: 'normal',
      contentLength: 123,
      contentHash: 'testhash123',
      extractedContent: 'This is test content',
      title: 'Test Page',
      intelligence: JSON.stringify({test: true}),
      processed: true,
      relevanceScore: 5,
      keywords: 'test, example',
      processingTime: 100,
      scheduled: false
    };
    
    const result = storeBaselineData(testData);
    
    if (result) {
      console.log('✅ Test data storage successful!');
    } else {
      console.log('❌ Test data storage failed. Check errors above.');
    }
    
    return {
      success: true,
      message: 'Spreadsheet setup fixed!',
      spreadsheetId: correctSpreadsheetId,
      spreadsheetName: ss.getName(),
      testDataStored: result
    };
    
  } catch (error) {
    console.error('❌ Error fixing spreadsheet setup:', error);
    return {
      success: false,
      error: error.toString(),
      stack: error.stack
    };
  }
}

/**
 * FORCE PROCESS ALL REMAINING URLS
 * This bypasses the slow batch processing and gets everything done NOW
 */
function forceProcessAllUrls() {
  console.log('=== FORCE PROCESSING ALL URLS ===');
  console.log('This will process ALL remaining URLs in efficient batches');
  
  try {
    // Get all configured URLs
    const monitors = getMonitorConfigurations();
    const allUrls = [];
    
    // Flatten all URLs into a single array
    monitors.forEach(monitor => {
      monitor.urls.forEach(url => {
        allUrls.push({
          company: monitor.company,
          url: url,
          type: 'unknown'
        });
      });
    });
    
    console.log(`Total URLs configured: ${allUrls.length}`);
    
    // Get existing baseline data to see what's already done
    const ss = SpreadsheetApp.openById('18sv6UITXpNu0oMDjMkuQCBHjLYwjWNm21OmLNNwDQlM');
    const baselineSheet = ss.getSheetByName('BaselineMultiUrl');
    const existingUrls = new Set();
    
    if (baselineSheet) {
      const data = baselineSheet.getDataRange().getValues();
      // Skip header row
      for (let i = 1; i < data.length; i++) {
        if (data[i][1]) { // URL is in column B
          existingUrls.add(data[i][1]);
        }
      }
    }
    
    console.log(`URLs already processed: ${existingUrls.size}`);
    
    // Filter to only unprocessed URLs
    const remainingUrls = allUrls.filter(item => !existingUrls.has(item.url));
    console.log(`URLs to process: ${remainingUrls.length}`);
    
    if (remainingUrls.length === 0) {
      return {
        success: true,
        message: 'All URLs already processed!',
        total: allUrls.length,
        processed: allUrls.length
      };
    }
    
    // Process in batches of 10
    const BATCH_SIZE = 10;
    let processed = 0;
    let successful = 0;
    let failed = 0;
    const errors = [];
    
    for (let i = 0; i < remainingUrls.length; i += BATCH_SIZE) {
      const batch = remainingUrls.slice(i, Math.min(i + BATCH_SIZE, remainingUrls.length));
      console.log(`\nProcessing batch ${Math.floor(i/BATCH_SIZE) + 1}: URLs ${i + 1} to ${i + batch.length}`);
      
      batch.forEach(item => {
        try {
          console.log(`Processing: ${item.company} - ${item.url}`);
          
          // Extract content
          const extraction = extractPageContentWithTimeout(item.url, 30000);
          
          if (extraction.success) {
            // Store baseline data
            storeBaselineMultiUrl(item.company, item.url, extraction, 'homepage');
            successful++;
            console.log(`✅ Success: ${item.url} (${extraction.contentLength} chars)`);
          } else {
            failed++;
            errors.push({
              company: item.company,
              url: item.url,
              error: extraction.error
            });
            console.log(`❌ Failed: ${item.url} - ${extraction.error}`);
          }
          
          processed++;
          
          // Small delay to be respectful
          Utilities.sleep(1000);
          
        } catch (error) {
          failed++;
          errors.push({
            company: item.company,
            url: item.url,
            error: error.toString()
          });
          console.error(`❌ Error processing ${item.url}:`, error);
        }
      });
      
      // Progress update
      const percentComplete = Math.round((processed / remainingUrls.length) * 100);
      console.log(`\nProgress: ${processed}/${remainingUrls.length} (${percentComplete}%)`);
      console.log(`Successful: ${successful}, Failed: ${failed}`);
    }
    
    // Final summary
    console.log('\n=== PROCESSING COMPLETE ===');
    console.log(`Total processed: ${processed}`);
    console.log(`Successful: ${successful}`);
    console.log(`Failed: ${failed}`);
    
    if (errors.length > 0) {
      console.log('\nErrors encountered:');
      errors.forEach(e => {
        console.log(`- ${e.company} (${e.url}): ${e.error}`);
      });
    }
    
    // Clear baseline progress tracker
    PropertiesService.getScriptProperties().deleteProperty('BASELINE_PROGRESS');
    
    return {
      success: true,
      message: 'Force processing complete!',
      totalUrls: allUrls.length,
      alreadyProcessed: existingUrls.size,
      newlyProcessed: processed,
      successful: successful,
      failed: failed,
      errors: errors.slice(0, 10) // First 10 errors
    };
    
  } catch (error) {
    console.error('Force processing failed:', error);
    return {
      success: false,
      error: error.toString(),
      message: 'Force processing failed'
    };
  }
}

/**
 * Test authorization with multiple domains
 * This helps identify which domains work and which don't
 */
function testAuthorizationWithMultipleDomains() {
  console.log('=== TESTING AUTHORIZATION WITH MULTIPLE DOMAINS ===');
  
  const domains = [
    'https://www.google.com',
    'https://anthropic.com',
    'https://openai.com',
    'https://azure.microsoft.com',
    'https://cloud.google.com',
    'https://redmorestudio.com',
    'https://github.com'
  ];
  
  const results = [];
  
  domains.forEach(domain => {
    try {
      console.log(`Testing domain: ${domain}`);
      const startTime = new Date().getTime();
      
      const response = UrlFetchApp.fetch(domain, {
        muteHttpExceptions: true,
        followRedirects: true,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; AI-Competitor-Monitor/1.0)'
        }
      });
      
      const endTime = new Date().getTime();
      const responseCode = response.getResponseCode();
      
      results.push({
        domain: domain,
        success: true,
        responseCode: responseCode,
        responseTime: endTime - startTime + ' ms',
        message: 'Success'
      });
      
      console.log(`✅ ${domain}: SUCCESS (${responseCode}) - ${endTime - startTime}ms`);
      
    } catch (e) {
      results.push({
        domain: domain,
        success: false,
        error: e.toString(),
        message: 'Failed'
      });
      
      console.log(`❌ ${domain}: FAILED - ${e.toString()}`);
    }
  });
  
  // Count successes and failures
  const successCount = results.filter(r => r.success).length;
  const failureCount = results.length - successCount;
  
  console.log('\n=== SUMMARY ===');
  console.log(`Total domains tested: ${results.length}`);
  console.log(`Successful: ${successCount}`);
  console.log(`Failed: ${failureCount}`);
  
  if (failureCount > 0) {
    console.log('\nFailed domains:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`- ${r.domain}: ${r.error}`);
    });
  }
  
  return {
    success: true,
    testedDomains: results.length,
    successfulDomains: successCount,
    failedDomains: failureCount,
    results: results
  };
}