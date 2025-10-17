/**
 * Integration Guide: Adding Magnitude Detection to Existing Functions
 * 
 * This shows how to update your existing monitoring functions to use
 * the new change magnitude detection feature.
 */

// ============ UPDATED DAILY MONITORING ============

/**
 * Run daily monitoring with magnitude detection
 */
function runDailyMonitoringWithMagnitude() {
  console.log('Starting daily monitoring with magnitude detection...');
  
  const monitors = getMonitorConfigurations();
  const allChanges = [];
  const errors = [];
  
  monitors.forEach(monitor => {
    try {
      // Use the magnitude-aware processor
      const result = processMonitorWithMagnitude(monitor);
      
      if (result.changes.length > 0) {
        allChanges.push(...result.changes);
      }
      
      if (result.errors.length > 0) {
        errors.push(...result.errors);
      }
      
      // Log magnitude statistics
      result.urls.forEach(url => {
        if (url.status === 'changed') {
          console.log(`${monitor.company} - ${url.url}: ${url.changePercentage}% change (${url.magnitude})`);
        }
      });
      
    } catch (error) {
      errors.push({
        company: monitor.company,
        error: error.toString()
      });
    }
  });
  
  // Generate magnitude report
  const magnitudeReport = generateMagnitudeReport(allChanges);
  
  // Store changes with magnitude data
  if (allChanges.length > 0) {
    storeChangesWithMagnitude(allChanges);
  }
  
  // Send alerts for significant changes
  const significantChanges = allChanges.filter(change => 
    change.magnitude.magnitude === 'major' || 
    change.magnitude.magnitude === 'significant' ||
    change.relevanceScore >= 6
  );
  
  if (significantChanges.length > 0) {
    sendMagnitudeAlert(significantChanges, magnitudeReport);
  }
  
  // Update summary with magnitude stats
  updateSummaryWithMagnitude(allChanges);
  
  return {
    monitored: monitors.length,
    changes: allChanges.length,
    significantChanges: significantChanges.length,
    magnitudeReport: magnitudeReport,
    errors: errors
  };
}

// ============ ENHANCED DATA STORAGE ============

/**
 * Store changes with magnitude information
 */
function storeChangesWithMagnitude(changes) {
  const sheet = getOrCreateMonitorSheet();
  const changesSheet = sheet.getSheetByName(SHEET_CONFIG.tabs.changes);
  
  changes.forEach(change => {
    changesSheet.appendRow([
      new Date().toISOString(),
      change.company,
      change.url,
      change.oldHash,
      change.newHash,
      change.relevanceScore,
      change.keywords.join(', '),
      // New magnitude columns
      change.magnitude.percentageChange + '%',
      change.magnitude.magnitude,
      change.magnitude.characterDiff,
      change.diff.summary,
      change.shouldAlert ? 'YES' : 'NO'
    ]);
  });
}

/**
 * Update summary with magnitude statistics
 */
function updateSummaryWithMagnitude(changes) {
  const sheet = getOrCreateMonitorSheet();
  let summarySheet = sheet.getSheetByName('MagnitudeSummary');
  
  // Create sheet if it doesn't exist
  if (!summarySheet) {
    summarySheet = sheet.insertSheet('MagnitudeSummary');
    summarySheet.getRange(1, 1, 1, 7).setValues([[
      'Date', 'Total Changes', 'Major (>50%)', 'Significant (25-50%)', 
      'Moderate (15-25%)', 'Minor (<15%)', 'Avg Change %'
    ]]);
    summarySheet.setFrozenRows(1);
  }
  
  // Calculate statistics
  const stats = {
    total: changes.length,
    major: changes.filter(c => c.magnitude.magnitude === 'major').length,
    significant: changes.filter(c => c.magnitude.magnitude === 'significant').length,
    moderate: changes.filter(c => c.magnitude.magnitude === 'moderate').length,
    minor: changes.filter(c => c.magnitude.magnitude === 'minor').length,
    avgChange: 0
  };
  
  if (changes.length > 0) {
    const totalPercent = changes.reduce((sum, c) => sum + c.magnitude.percentageChange, 0);
    stats.avgChange = Math.round((totalPercent / changes.length) * 10) / 10;
  }
  
  // Add summary row
  summarySheet.appendRow([
    new Date().toISOString(),
    stats.total,
    stats.major,
    stats.significant,
    stats.moderate,
    stats.minor,
    stats.avgChange
  ]);
}

// ============ ENHANCED ALERTING ============

/**
 * Send alert for significant magnitude changes
 */
function sendMagnitudeAlert(changes, report) {
  const subject = `🚨 AI Monitor: ${report.alerts.length} Significant Changes Detected`;
  
  let html = `
    <h2>AI Competitor Monitor - Magnitude Alert</h2>
    <p><strong>${report.summary}</strong></p>
    
    <h3>Major Changes (>50% content change)</h3>
  `;
  
  if (report.byMagnitude.major.length > 0) {
    html += '<ul>';
    report.byMagnitude.major.forEach(change => {
      html += `
        <li>
          <strong>${change.company}</strong> - ${change.url}<br>
          Change: ${change.changePercent}%<br>
          ${change.diff}
        </li>
      `;
    });
    html += '</ul>';
  } else {
    html += '<p>No major changes detected.</p>';
  }
  
  html += '<h3>Significant Changes (25-50% content change)</h3>';
  
  if (report.byMagnitude.significant.length > 0) {
    html += '<ul>';
    report.byMagnitude.significant.forEach(change => {
      html += `
        <li>
          <strong>${change.company}</strong> - ${change.url}<br>
          Change: ${change.changePercent}%
        </li>
      `;
    });
    html += '</ul>';
  } else {
    html += '<p>No significant changes detected.</p>';
  }
  
  html += `
    <h3>Change Details</h3>
    <table border="1" cellpadding="5" style="border-collapse: collapse;">
      <tr>
        <th>Company</th>
        <th>URL</th>
        <th>Change %</th>
        <th>Magnitude</th>
        <th>Keywords</th>
        <th>Alert</th>
      </tr>
  `;
  
  changes.forEach(change => {
    html += `
      <tr style="background-color: ${change.magnitude.magnitude === 'major' ? '#ffcccc' : 
                                     change.magnitude.magnitude === 'significant' ? '#fff3cd' : 
                                     '#ffffff'}">
        <td>${change.company}</td>
        <td><a href="${change.url}">${change.url}</a></td>
        <td><strong>${change.magnitude.percentageChange}%</strong></td>
        <td>${change.magnitude.magnitude}</td>
        <td>${change.keywords.join(', ') || 'N/A'}</td>
        <td>${change.shouldAlert ? '⚠️ YES' : 'No'}</td>
      </tr>
    `;
  });
  
  html += `
    </table>
    
    <h3>What This Means</h3>
    <p>Changes are categorized by how much content changed:</p>
    <ul>
      <li><strong>Major (>50%)</strong>: Significant overhaul, new product launch, or major pivot</li>
      <li><strong>Significant (25-50%)</strong>: Important updates, new features, or strategic changes</li>
      <li><strong>Moderate (15-25%)</strong>: Regular updates, blog posts, or minor features</li>
      <li><strong>Minor (<15%)</strong>: Typos, small tweaks, or routine maintenance</li>
    </ul>
    
    <p><em>Generated by AI Competitor Monitor with Change Magnitude Detection</em></p>
  `;
  
  // Send email
  const email = Session.getActiveUser().getEmail();
  GmailApp.sendEmail(email, subject, '', {
    htmlBody: html
  });
  
  console.log('Magnitude alert sent to:', email);
}

// ============ API ENDPOINTS ============

/**
 * Get latest data with magnitude information
 */
function getLatestDataWithMagnitude() {
  const sheet = getOrCreateMonitorSheet();
  const baselineSheet = sheet.getSheetByName(SHEET_CONFIG.tabs.baseline);
  const changesSheet = sheet.getSheetByName(SHEET_CONFIG.tabs.changes);
  const fullContentSheet = sheet.getSheetByName('FullContent');
  
  const baselineData = baselineSheet.getDataRange().getValues();
  const changesData = changesSheet.getDataRange().getValues();
  const magnitudeData = fullContentSheet ? fullContentSheet.getDataRange().getValues() : [];
  
  // Group by company with magnitude data
  const companies = {};
  
  for (let i = 1; i < baselineData.length; i++) {
    const company = baselineData[i][0];
    const url = baselineData[i][1];
    
    if (!companies[company]) {
      companies[company] = {
        name: company,
        urls: [],
        lastChange: null,
        totalChanges: 0,
        recentMagnitude: null
      };
    }
    
    // Find recent magnitude data
    let recentMagnitude = null;
    for (let j = magnitudeData.length - 1; j >= 1; j--) {
      if (magnitudeData[j][0] === url && magnitudeData[j][6] !== 'baseline') {
        recentMagnitude = {
          magnitude: magnitudeData[j][6],
          changePercent: magnitudeData[j][7],
          timestamp: magnitudeData[j][1]
        };
        break;
      }
    }
    
    companies[company].urls.push({
      url: url,
      lastChecked: baselineData[i][2],
      status: baselineData[i][5],
      recentMagnitude: recentMagnitude
    });
    
    if (recentMagnitude) {
      companies[company].recentMagnitude = recentMagnitude;
    }
  }
  
  // Add change counts
  for (let i = 1; i < changesData.length; i++) {
    const company = changesData[i][1];
    if (companies[company]) {
      companies[company].totalChanges++;
      if (!companies[company].lastChange || 
          new Date(changesData[i][0]) > new Date(companies[company].lastChange)) {
        companies[company].lastChange = changesData[i][0];
      }
    }
  }
  
  return {
    companies: Object.values(companies),
    stats: getMagnitudeStats(),
    lastUpdated: new Date().toISOString()
  };
}

// ============ TESTING FUNCTIONS ============

/**
 * Test magnitude detection on a specific URL
 */
function testMagnitudeOnUrl(url) {
  console.log(`Testing magnitude detection on: ${url}`);
  
  // Get current content
  const extraction = extractPageContent(url);
  if (!extraction.success) {
    return extraction;
  }
  
  // Get previous content
  const previousContent = getPreviousFullContent(url);
  
  if (!previousContent) {
    return {
      success: false,
      message: 'No previous content found. Run baseline first.',
      url: url
    };
  }
  
  // Calculate magnitude
  const magnitude = calculateChangeMagnitude(previousContent, extraction.content);
  const diff = generateDiffSummary(previousContent, extraction.content);
  
  return {
    success: true,
    url: url,
    currentLength: extraction.contentLength,
    previousLength: previousContent.length,
    magnitude: magnitude,
    diff: diff,
    interpretation: interpretMagnitude(magnitude)
  };
}

/**
 * Interpret magnitude results
 */
function interpretMagnitude(magnitude) {
  if (magnitude.magnitude === 'major') {
    return 'Major overhaul detected! This could be a product launch, major pivot, or complete redesign.';
  } else if (magnitude.magnitude === 'significant') {
    return 'Significant changes detected. Look for new features, pricing updates, or strategic shifts.';
  } else if (magnitude.magnitude === 'moderate') {
    return 'Moderate updates. Likely regular content updates, blog posts, or minor features.';
  } else {
    return 'Minor changes only. Probably typos, date updates, or small tweaks.';
  }
}

// ============ MIGRATION HELPER ============

/**
 * Migrate existing data to include magnitude analysis
 */
function migrateToMagnitudeDetection() {
  console.log('Starting migration to magnitude detection...');
  
  const sheet = getOrCreateMonitorSheet();
  const baselineSheet = sheet.getSheetByName(SHEET_CONFIG.tabs.baseline);
  const data = baselineSheet.getDataRange().getValues();
  
  let migrated = 0;
  
  for (let i = 1; i < data.length && i < 10; i++) { // Limit to 10 for testing
    const url = data[i][1];
    const content = data[i][3]; // Assuming content is stored here
    
    if (content && content.length > 0) {
      // Store in new full content format
      storeFullPageContent(url, content, null, {
        contentHash: data[i][2],
        contentLength: content.length
      });
      migrated++;
    }
  }
  
  return {
    success: true,
    migrated: migrated,
    message: `Migrated ${migrated} URLs to magnitude detection format`
  };
}