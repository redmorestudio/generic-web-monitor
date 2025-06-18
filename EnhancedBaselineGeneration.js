/**
 * Enhanced Baseline Generation with Better Error Handling and Progress Tracking
 * v82 - Fixes timeout issues, adds visibility, and improves error recovery
 */

/**
 * Enhanced generateBaselineForAPIBatched with better error handling
 */
function generateBaselineForAPIBatchedEnhanced(params = {}) {
  try {
    console.log('🚀 Starting enhanced batched baseline generation...');
    
    const mode = params.mode || 'all';
    const clearExisting = params.clearExisting !== false;
    
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
      console.log(`📋 Creating new baseline job with mode: ${mode}`);
      
      // Clear existing data if requested
      if (mode === 'all' && clearExisting) {
        clearExistingBaselineData();
      }
      
      // Get configuration
      let config = [];
      try {
        config = getMonitorConfigurationsMultiUrl();
      } catch (error) {
        console.error('Error getting config:', error);
        config = COMPLETE_MONITOR_CONFIG || [];
      }
      
      // Collect URLs to process
      const urlsToProcess = [];
      const existingUrls = mode === 'new' ? getExistingBaselineUrls() : new Set();
      
      config.forEach(company => {
        if (company.urls && Array.isArray(company.urls)) {
          company.urls.forEach(urlObj => {
            const url = typeof urlObj === 'string' ? urlObj : (urlObj?.url || '');
            
            // Skip if in 'new' mode and URL already exists
            if (url && (mode !== 'new' || !existingUrls.has(url))) {
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
          success: true,
          status: 'completed',
          message: mode === 'new' ? 'No new URLs to process' : 'No URLs found to process',
          processed: 0,
          total: 0
        };
      }
      
      // Create job with error tracking
      job = {
        id: 'baseline_' + new Date().toISOString().replace(/[:.]/g, ''),
        status: 'in_progress',
        mode: mode,
        total_urls: urlsToProcess.length,
        processed_urls: 0,
        successful_urls: 0,
        failed_urls: 0,
        current_batch: 0,
        start_time: new Date().toISOString(),
        last_update: new Date().toISOString(),
        urls: urlsToProcess,
        errors: [],
        consecutive_errors: 0
      };
      
      props.setProperty('BASELINE_JOB', JSON.stringify(job));
      console.log(`📊 Created job for ${urlsToProcess.length} URLs`);
    }
    
    // Process next batch with better error handling
    const BATCH_SIZE = 3; // Smaller batch size for reliability
    const MAX_CONSECUTIVE_ERRORS = 3;
    const startIndex = job.processed_urls;
    const endIndex = Math.min(startIndex + BATCH_SIZE, job.urls.length);
    
    console.log(`🔄 Processing batch: URLs ${startIndex + 1} to ${endIndex} of ${job.urls.length}`);
    
    let processedInBatch = 0;
    let errorsInBatch = 0;
    
    for (let i = startIndex; i < endIndex; i++) {
      const urlData = job.urls[i];
      let attemptSuccess = false;
      
      try {
        console.log(`🔄 Processing ${i + 1}/${job.urls.length}: ${urlData.company} - ${urlData.url}`);
        
        // Add timeout wrapper
        const extractionResult = withTimeout(() => extractPageContent(urlData.url), 20000);
        
        if (extractionResult.success) {
          // Store the baseline data
          const baselineData = {
            timestamp: new Date().toISOString(),
            company: urlData.company,
            url: urlData.url,
            type: urlData.type,
            contentLength: extractionResult.contentLength || 0,
            contentHash: extractionResult.contentHash || '',
            extractedContent: extractionResult.content || '',
            title: extractionResult.title || '',
            intelligence: extractionResult.intelligence || {},
            relevanceScore: extractionResult.intelligence?.relevanceScore || 0,
            keywords: (extractionResult.intelligence?.keywords || []).join(', '),
            processed: true
          };
          
          // Store in spreadsheet
          if (storeBaselineData(baselineData)) {
            processedInBatch++;
            job.successful_urls++;
            attemptSuccess = true;
            job.consecutive_errors = 0; // Reset error counter
            console.log(`✅ Successfully processed: ${urlData.company}`);
          } else {
            throw new Error('Failed to store baseline data');
          }
          
        } else {
          throw new Error(extractionResult.error || 'Unknown extraction error');
        }
        
      } catch (error) {
        console.error(`❌ Error processing ${urlData.url}:`, error.toString());
        errorsInBatch++;
        job.failed_urls++;
        job.consecutive_errors++;
        
        // Store error details
        job.errors.push({
          url: urlData.url,
          company: urlData.company,
          error: error.toString(),
          timestamp: new Date().toISOString()
        });
        
        // Check if we should abort due to consecutive errors
        if (job.consecutive_errors >= MAX_CONSECUTIVE_ERRORS) {
          console.error('🛑 Too many consecutive errors, pausing job');
          job.status = 'paused_error';
          props.setProperty('BASELINE_JOB', JSON.stringify(job));
          
          return {
            success: false,
            status: 'paused_error',
            message: `Job paused due to ${MAX_CONSECUTIVE_ERRORS} consecutive errors. Last error: ${error.toString()}`,
            processed: job.processed_urls,
            successful: job.successful_urls,
            failed: job.failed_urls,
            total: job.total_urls,
            lastError: error.toString(),
            errors: job.errors.slice(-5) // Last 5 errors
          };
        }
      }
      
      // Update job progress
      job.processed_urls++;
      
      // Add delay between requests (longer if we had an error)
      Utilities.sleep(attemptSuccess ? 1000 : 2000);
    }
    
    // Update job status
    job.current_batch++;
    job.last_update = new Date().toISOString();
    
    // Calculate progress and time estimate
    const elapsedMinutes = Math.floor((new Date() - new Date(job.start_time)) / 60000);
    const avgTimePerUrl = elapsedMinutes / (job.processed_urls || 1);
    const remainingUrls = job.total_urls - job.processed_urls;
    const estimatedMinutesRemaining = Math.ceil(avgTimePerUrl * remainingUrls);
    
    if (job.processed_urls >= job.total_urls) {
      // Job complete!
      job.status = 'completed';
      props.setProperty('BASELINE_JOB', JSON.stringify(job));
      
      // Store completion timestamp
      props.setProperty('LAST_BASELINE_GENERATED', new Date().toISOString());
      props.setProperty('BASELINE_COMPLETED', 'true');
      
      console.log(`🎯 Baseline generation complete: ${job.successful_urls} successful, ${job.failed_urls} errors`);
      
      return {
        success: true,
        status: 'completed',
        message: `Baseline generation completed! Successfully processed ${job.successful_urls} of ${job.total_urls} URLs.`,
        processed: job.processed_urls,
        successful: job.successful_urls,
        failed: job.failed_urls,
        total: job.total_urls,
        errors: job.failed_urls,
        percentComplete: 100,
        errorDetails: job.errors
      };
      
    } else {
      // More to process
      props.setProperty('BASELINE_JOB', JSON.stringify(job));
      
      // Schedule next batch with a trigger
      scheduleNextBaselineBatch(job.id);
      
      return {
        success: true,
        status: 'in_progress',
        message: `Processing baseline... ${job.processed_urls} of ${job.total_urls} URLs completed (${job.successful_urls} successful, ${job.failed_urls} failed).`,
        processed: job.processed_urls,
        successful: job.successful_urls,
        failed: job.failed_urls,
        total: job.total_urls,
        errors: job.failed_urls,
        percentComplete: Math.round((job.processed_urls / job.total_urls) * 100),
        estimatedTimeRemaining: estimatedMinutesRemaining + ' minutes',
        nextBatch: true,
        recentErrors: job.errors.slice(-3) // Last 3 errors
      };
    }
    
  } catch (error) {
    console.error('❌ Critical error in batched baseline generation:', error);
    
    // Try to save error state
    try {
      const props = PropertiesService.getScriptProperties();
      const jobData = props.getProperty('BASELINE_JOB');
      if (jobData) {
        const job = JSON.parse(jobData);
        job.status = 'error';
        job.lastCriticalError = error.toString();
        props.setProperty('BASELINE_JOB', JSON.stringify(job));
      }
    } catch (saveError) {
      console.error('Failed to save error state:', saveError);
    }
    
    return {
      success: false,
      error: error.toString(),
      stack: error.stack,
      status: 'error'
    };
  }
}

/**
 * Helper function to add timeout to operations
 */
function withTimeout(fn, timeout) {
  const start = Date.now();
  try {
    return fn();
  } catch (error) {
    if (Date.now() - start >= timeout) {
      throw new Error(`Operation timed out after ${timeout}ms: ${error.toString()}`);
    }
    throw error;
  }
}

/**
 * Get full content for a specific URL from baseline
 */
function getFullBaselineContent(url) {
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
          fullContent: data[i][6], // Full extracted content
          title: data[i][7],
          intelligence: JSON.parse(data[i][8] || '{}'),
          processed: data[i][9],
          relevanceScore: data[i][10],
          keywords: data[i][11]
        };
      }
    }
    
    return null;
    
  } catch (error) {
    console.error('Error getting full baseline content:', error);
    return null;
  }
}

/**
 * Export baseline content as markdown
 */
function exportBaselineAsMarkdown(url) {
  try {
    const baseline = getFullBaselineContent(url);
    if (!baseline) {
      return null;
    }
    
    // Convert to markdown format
    const markdown = `# ${baseline.title || baseline.url}

**Company:** ${baseline.company}  
**URL:** ${baseline.url}  
**Type:** ${baseline.type}  
**Extracted:** ${new Date(baseline.timestamp).toLocaleString()}  
**Content Length:** ${baseline.contentLength} characters  
**Relevance Score:** ${baseline.relevanceScore}/10  
**Keywords:** ${baseline.keywords}

## Content

${baseline.fullContent}

## AI Intelligence Analysis

**Page Type:** ${baseline.intelligence.pageType || 'Unknown'}  
**Key Insights:** 
${(baseline.intelligence.keyInsights || []).map(insight => `- ${insight}`).join('\n')}

**Competitor Mentions:**
${(baseline.intelligence.competitorMentions || []).map(mention => 
  `- ${mention.competitor}: ${mention.count} times`
).join('\n')}
`;
    
    return markdown;
    
  } catch (error) {
    console.error('Error exporting baseline as markdown:', error);
    return null;
  }
}

/**
 * Check if baseline has been completed
 */
function isBaselineCompleted() {
  try {
    const props = PropertiesService.getScriptProperties();
    
    // Check if baseline was completed
    const completed = props.getProperty('BASELINE_COMPLETED') === 'true';
    const lastGenerated = props.getProperty('LAST_BASELINE_GENERATED');
    
    if (completed && lastGenerated) {
      // Check if we have actual data
      const sheet = getOrCreateMonitorSheet();
      if (sheet && sheet.spreadsheet) {
        const ss = sheet.spreadsheet;
        const baselineSheet = ss.getSheetByName('AI_Baselines');
        
        if (baselineSheet && baselineSheet.getLastRow() > 1) {
          return {
            completed: true,
            timestamp: lastGenerated,
            rowCount: baselineSheet.getLastRow() - 1,
            message: `Baseline completed on ${new Date(lastGenerated).toLocaleString()}`
          };
        }
      }
    }
    
    return {
      completed: false,
      message: 'No baseline has been generated yet'
    };
    
  } catch (error) {
    console.error('Error checking baseline status:', error);
    return {
      completed: false,
      error: error.toString()
    };
  }
}

/**
 * Resume a paused baseline job
 */
function resumeBaselineJob() {
  try {
    const props = PropertiesService.getScriptProperties();
    const jobData = props.getProperty('BASELINE_JOB');
    
    if (!jobData) {
      return {
        success: false,
        error: 'No paused job found'
      };
    }
    
    const job = JSON.parse(jobData);
    
    if (job.status !== 'paused_error') {
      return {
        success: false,
        error: 'Job is not in paused state'
      };
    }
    
    // Reset error counter and resume
    job.consecutive_errors = 0;
    job.status = 'in_progress';
    props.setProperty('BASELINE_JOB', JSON.stringify(job));
    
    // Continue processing
    return generateBaselineForAPIBatchedEnhanced();
    
  } catch (error) {
    console.error('Error resuming baseline job:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Cancel current baseline job
 */
function cancelBaselineJob() {
  try {
    const props = PropertiesService.getScriptProperties();
    props.deleteProperty('BASELINE_JOB');
    
    // Clean up any scheduled triggers
    ScriptApp.getProjectTriggers().forEach(trigger => {
      if (trigger.getHandlerFunction() === 'processNextBaselineBatch') {
        ScriptApp.deleteTrigger(trigger);
      }
    });
    
    return {
      success: true,
      message: 'Baseline job cancelled successfully'
    };
    
  } catch (error) {
    console.error('Error cancelling baseline job:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}
