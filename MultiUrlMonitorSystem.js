/**
 * Multi-URL Monitor System Updates
 * Updates the existing monitoring system to properly handle multiple URLs per company
 */

// ============ OVERRIDE EXISTING FUNCTIONS ============

/**
 * Override the default getMonitorConfigurations to use multi-URL
 */
function getMonitorConfigurations() {
  const props = PropertiesService.getScriptProperties();
  const useMultiUrl = props.getProperty('USE_MULTI_URL') === 'true';
  
  if (useMultiUrl) {
    // Use the new multi-URL configuration
    return getMonitorConfigurationsMultiUrl();
  }
  
  // Fallback to old configuration (but convert to multi-URL format)
  const oldConfig = JSON.parse(props.getProperty('monitorConfig') || '[]');
  
  // If old config is in single-URL format, convert it
  return oldConfig.map(monitor => {
    if (Array.isArray(monitor.urls)) {
      return monitor; // Already in correct format
    }
    // Convert single URL to array format
    return {
      company: monitor.company,
      urls: [monitor.url || monitor.urls]
    };
  });
}

/**
 * Process monitor with multi-URL support and URL type awareness
 */
function processMonitorMultiUrl(monitor) {
  const results = {
    company: monitor.company,
    urls: [],
    changes: [],
    errors: [],
    intelligence: {
      totalAnalyzed: 0,
      byType: {},
      llmUsed: 0,
      magnitudeDetected: 0
    }
  };
  
  const apiKey = PropertiesService.getScriptProperties().getProperty('CLAUDE_API_KEY');
  const llmEnabled = !!apiKey;
  
  // Get full configuration to access URL types
  const fullConfig = COMPLETE_MONITOR_CONFIG.find(c => c.company === monitor.company);
  
  monitor.urls.forEach((url, index) => {
    try {
      // Get URL type if available
      const urlType = fullConfig?.urls[index]?.type || 'general';
      
      // Track by type
      results.intelligence.byType[urlType] = (results.intelligence.byType[urlType] || 0) + 1;
      
      // Extract current content
      const extraction = extractPageContent(url);
      
      if (!extraction.success) {
        results.errors.push({
          url: url,
          type: urlType,
          error: extraction.error
        });
        return;
      }
      
      results.intelligence.totalAnalyzed++;
      
      // Get baseline and previous content
      const baseline = getBaselineForUrl(url);
      const previousContent = getPreviousFullContent(url);
      
      if (!baseline) {
        // First time - create baseline
        handleNewBaselineMultiUrl(monitor.company, url, urlType, extraction, results);
      } else if (baseline.contentHash !== extraction.contentHash) {
        // Content changed - full analysis with URL type context
        const analysis = analyzeChangeWithUrlType(
          monitor.company,
          url,
          urlType,
          previousContent || baseline.content || '',
          extraction.content,
          baseline,
          extraction,
          llmEnabled
        );
        
        results.changes.push(analysis.change);
        results.urls.push(analysis.urlResult);
        
        if (analysis.usedLLM) results.intelligence.llmUsed++;
        if (analysis.magnitudeDetected) results.intelligence.magnitudeDetected++;
        
        // Update storage with URL type
        storeBaselineWithType(monitor.company, url, urlType, extraction);
        storeFullPageContent(url, extraction.content, analysis.magnitude, extraction);
        
      } else {
        results.urls.push({
          url: url,
          type: urlType,
          status: 'unchanged'
        });
      }
      
      Utilities.sleep(2000); // Respectful crawling
      
    } catch (error) {
      results.errors.push({
        url: url,
        type: fullConfig?.urls[index]?.type || 'general',
        error: error.toString()
      });
    }
  });
  
  return results;
}

/**
 * Analyze change with URL type context for better intelligence
 */
function analyzeChangeWithUrlType(company, url, urlType, oldContent, newContent, baseline, extraction, llmEnabled) {
  // Get base analysis
  const baseAnalysis = analyzeChangeUnified(
    company, url, oldContent, newContent, baseline, extraction, llmEnabled
  );
  
  // Enhance with URL type specific intelligence
  const typeWeights = {
    'pricing': 2.0,      // Pricing changes are critical
    'product': 1.8,      // Product updates very important
    'features': 1.8,     // Feature changes very important
    'news': 1.5,         // News/announcements important
    'blog': 1.2,         // Blog posts moderately important
    'docs': 1.0,         // Documentation changes standard
    'homepage': 1.5,     // Homepage changes important
    'about': 0.8,        // About page less critical
    'general': 1.0       // Default weight
  };
  
  const typeWeight = typeWeights[urlType] || 1.0;
  
  // Adjust relevance score based on URL type
  baseAnalysis.change.relevanceScore = Math.min(10, 
    Math.round(baseAnalysis.change.relevanceScore * typeWeight)
  );
  
  // Add URL type to change data
  baseAnalysis.change.urlType = urlType;
  baseAnalysis.urlResult.type = urlType;
  
  // Re-evaluate alert decision with type weight
  if (urlType === 'pricing' && baseAnalysis.change.magnitude.percentageChange >= 10) {
    baseAnalysis.change.shouldAlert = true;
    baseAnalysis.change.alertReason += ', Pricing page change';
  }
  
  return baseAnalysis;
}

/**
 * Handle new baseline with URL type
 */
function handleNewBaselineMultiUrl(company, url, urlType, extraction, results) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('CLAUDE_API_KEY');
  
  let intelligence = extraction.intelligence;
  if (apiKey && ['pricing', 'product', 'features'].includes(urlType)) {
    // Always analyze high-value pages with LLM
    try {
      intelligence = analyzeContentWithLLM(extraction.content, '', url, company);
    } catch (error) {
      console.error('LLM analysis failed for baseline:', error);
    }
  }
  
  storeBaselineWithType(company, url, urlType, { ...extraction, intelligence });
  storeFullPageContent(url, extraction.content, null, extraction);
  
  results.urls.push({
    url: url,
    type: urlType,
    status: 'baseline_created',
    contentLength: extraction.contentLength,
    intelligence: intelligence
  });
}

/**
 * Store baseline with URL type information
 */
function storeBaselineWithType(company, url, urlType, extraction) {
  const baseline = {
    company: company,
    url: url,
    urlType: urlType,
    contentHash: extraction.contentHash,
    content: extraction.content.substring(0, 1000), // Store preview
    title: extraction.title,
    timestamp: new Date().toISOString(),
    intelligence: extraction.intelligence
  };
  
  // Store in properties with type info
  const key = `baseline_${Utilities.computeDigest(
    Utilities.DigestAlgorithm.MD5, 
    company + url
  )}`;
  
  PropertiesService.getScriptProperties().setProperty(
    key, 
    JSON.stringify(baseline)
  );
  
  // Also update sheet with type info
  updateBaselineSheet(company, url, urlType, extraction);
}

/**
 * Update baseline sheet with URL type
 */
function updateBaselineSheet(company, url, urlType, extraction) {
  try {
    const sheet = getOrCreateMonitorSheet();
    if (!sheet.success) return;
    
    const ss = sheet.spreadsheet;
    let baselineSheet = ss.getSheetByName('BaselineMultiUrl');
    
    if (!baselineSheet) {
      baselineSheet = ss.insertSheet('BaselineMultiUrl');
      const headers = [
        'Company', 'URL', 'Type', 'Last Checked', 'Content Hash', 
        'Page Title', 'Status', 'Intelligence Score'
      ];
      baselineSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      baselineSheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      baselineSheet.setFrozenRows(1);
    }
    
    // Find or add row
    const data = baselineSheet.getDataRange().getValues();
    let rowIndex = -1;
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === url) {
        rowIndex = i + 1; // 1-based index
        break;
      }
    }
    
    const rowData = [
      company,
      url,
      urlType,
      new Date().toISOString(),
      extraction.contentHash,
      extraction.title || '',
      'Active',
      extraction.intelligence?.relevanceScore || '-'
    ];
    
    if (rowIndex > 0) {
      // Update existing row
      baselineSheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
    } else {
      // Add new row
      baselineSheet.appendRow(rowData);
    }
    
  } catch (error) {
    console.error('Error updating baseline sheet:', error);
  }
}

// ============ ENHANCED MONITORING FUNCTIONS ============

/**
 * Run complete multi-URL monitoring for all companies
 */
function runCompleteMultiUrlMonitoring() {
  console.log('Starting complete multi-URL monitoring...');
  
  const monitors = getMonitorConfigurations();
  const allChanges = [];
  const errors = [];
  const stats = {
    companies: monitors.length,
    totalUrls: 0,
    monitored: 0,
    changed: 0,
    alerted: 0,
    byType: {},
    byCompany: {}
  };
  
  monitors.forEach(monitor => {
    try {
      stats.totalUrls += monitor.urls.length;
      stats.byCompany[monitor.company] = {
        urls: monitor.urls.length,
        changes: 0,
        alerts: 0
      };
      
      const result = processMonitorMultiUrl(monitor);
      
      stats.monitored += result.urls.length;
      stats.changed += result.changes.length;
      stats.alerted += result.changes.filter(c => c.shouldAlert).length;
      
      // Update company stats
      stats.byCompany[monitor.company].changes = result.changes.length;
      stats.byCompany[monitor.company].alerts = result.changes.filter(c => c.shouldAlert).length;
      
      // Aggregate type stats
      Object.entries(result.intelligence.byType).forEach(([type, count]) => {
        stats.byType[type] = (stats.byType[type] || 0) + count;
      });
      
      if (result.changes.length > 0) {
        allChanges.push(...result.changes);
      }
      
      if (result.errors.length > 0) {
        errors.push(...result.errors);
      }
      
    } catch (error) {
      errors.push({
        company: monitor.company,
        error: error.toString()
      });
    }
  });
  
  // Generate comprehensive reports
  const reports = generateMultiUrlReports(allChanges, stats);
  
  // Send alerts for significant changes
  const alertableChanges = allChanges.filter(c => c.shouldAlert);
  if (alertableChanges.length > 0) {
    sendMultiUrlAlert(alertableChanges, reports, stats);
  }
  
  // Update dashboard
  updateMultiUrlDashboard(allChanges, stats, reports);
  
  // Log summary
  console.log(`Multi-URL Monitoring complete:`);
  console.log(`- ${stats.companies} companies, ${stats.totalUrls} total URLs`);
  console.log(`- ${stats.monitored} URLs checked, ${stats.changed} changes detected`);
  console.log(`- ${stats.alerted} alerts triggered`);
  console.log(`- URL types monitored:`, stats.byType);
  
  return {
    success: true,
    stats: stats,
    changes: allChanges,
    alerts: alertableChanges,
    errors: errors,
    reports: reports
  };
}

/**
 * Generate comprehensive multi-URL reports
 */
function generateMultiUrlReports(changes, stats) {
  const reports = {
    byType: {},
    byCompany: {},
    criticalChanges: [],
    trends: [],
    competitiveInsights: []
  };
  
  // Analyze by URL type
  changes.forEach(change => {
    const type = change.urlType || 'general';
    
    if (!reports.byType[type]) {
      reports.byType[type] = {
        count: 0,
        companies: [],
        avgMagnitude: 0,
        examples: []
      };
    }
    
    reports.byType[type].count++;
    reports.byType[type].companies.push(change.company);
    reports.byType[type].avgMagnitude += change.magnitude.percentageChange;
    
    if (reports.byType[type].examples.length < 3) {
      reports.byType[type].examples.push({
        company: change.company,
        summary: change.summary,
        relevance: change.relevanceScore
      });
    }
  });
  
  // Calculate averages
  Object.keys(reports.byType).forEach(type => {
    const typeData = reports.byType[type];
    typeData.avgMagnitude = (typeData.avgMagnitude / typeData.count).toFixed(1);
    typeData.companies = [...new Set(typeData.companies)]; // Unique companies
  });
  
  // Identify critical changes
  reports.criticalChanges = changes
    .filter(c => 
      (c.urlType === 'pricing' && c.magnitude.percentageChange >= 15) ||
      (c.urlType === 'product' && c.relevanceScore >= 8) ||
      c.relevanceScore >= 9
    )
    .slice(0, 5);
  
  // Detect trends
  if (reports.byType.pricing?.count >= 3) {
    reports.trends.push({
      type: 'pricing_movement',
      description: `${reports.byType.pricing.count} companies updated pricing`,
      companies: reports.byType.pricing.companies
    });
  }
  
  if (reports.byType.product?.count >= 4) {
    reports.trends.push({
      type: 'product_wave',
      description: 'Multiple product updates detected across industry',
      companies: reports.byType.product.companies
    });
  }
  
  // Extract competitive insights
  const pricingChanges = changes.filter(c => c.urlType === 'pricing');
  if (pricingChanges.length > 0) {
    reports.competitiveInsights.push({
      insight: 'Pricing pressure detected',
      evidence: `${pricingChanges.length} competitors adjusted pricing`,
      action: 'Review pricing strategy'
    });
  }
  
  return reports;
}

/**
 * Send enhanced multi-URL alert
 */
function sendMultiUrlAlert(changes, reports, stats) {
  const subject = `🚨 AI Monitor: ${changes.length} Important Changes Across ${stats.companies} Companies`;
  
  let html = `
    <h2>AI Competitive Monitor - Multi-URL Intelligence Report</h2>
    <p><strong>${stats.totalUrls} URLs monitored across ${stats.companies} companies</strong></p>
    
    <h3>📊 Overview</h3>
    <ul>
      <li>Total Changes: ${stats.changed}</li>
      <li>Critical Alerts: ${changes.length}</li>
      <li>Most Active Category: ${Object.entries(stats.byType).sort((a,b) => b[1] - a[1])[0]?.[0] || 'N/A'}</li>
    </ul>
  `;
  
  // Critical changes section
  if (reports.criticalChanges.length > 0) {
    html += `
      <h3>🚨 Critical Changes Requiring Immediate Attention</h3>
      <table border="1" cellpadding="5" style="border-collapse: collapse; width: 100%;">
        <tr style="background-color: #f0f0f0;">
          <th>Company</th>
          <th>Page Type</th>
          <th>Change %</th>
          <th>Relevance</th>
          <th>Summary</th>
        </tr>
    `;
    
    reports.criticalChanges.forEach(change => {
      const rowColor = change.urlType === 'pricing' ? '#ffe6e6' : 
                       change.urlType === 'product' ? '#fff9e6' : 
                       '#e6f3ff';
      
      html += `
        <tr style="background-color: ${rowColor};">
          <td><strong>${change.company}</strong></td>
          <td>${change.urlType}</td>
          <td>${change.magnitude.percentageChange}%</td>
          <td>⭐ ${change.relevanceScore}/10</td>
          <td>${change.summary}</td>
        </tr>
      `;
    });
    
    html += '</table>';
  }
  
  // Trends section
  if (reports.trends.length > 0) {
    html += '<h3>📈 Market Trends Detected</h3><ul>';
    reports.trends.forEach(trend => {
      html += `
        <li>
          <strong>${trend.description}</strong><br>
          Companies: ${trend.companies.join(', ')}
        </li>
      `;
    });
    html += '</ul>';
  }
  
  // Competitive insights
  if (reports.competitiveInsights.length > 0) {
    html += '<h3>💡 Strategic Insights</h3><ul>';
    reports.competitiveInsights.forEach(insight => {
      html += `
        <li>
          <strong>${insight.insight}</strong><br>
          ${insight.evidence}<br>
          <em>Recommended: ${insight.action}</em>
        </li>
      `;
    });
    html += '</ul>';
  }
  
  // Changes by type
  html += '<h3>📑 Changes by Page Type</h3>';
  html += '<table border="1" cellpadding="5" style="border-collapse: collapse;">';
  html += '<tr><th>Type</th><th>Count</th><th>Avg Change %</th><th>Companies</th></tr>';
  
  Object.entries(reports.byType).forEach(([type, data]) => {
    html += `
      <tr>
        <td>${type}</td>
        <td>${data.count}</td>
        <td>${data.avgMagnitude}%</td>
        <td>${data.companies.length}</td>
      </tr>
    `;
  });
  html += '</table>';
  
  // Company summary
  html += '<h3>🏢 Activity by Company</h3>';
  html += '<table border="1" cellpadding="5" style="border-collapse: collapse;">';
  html += '<tr><th>Company</th><th>URLs Monitored</th><th>Changes</th><th>Alerts</th></tr>';
  
  Object.entries(stats.byCompany)
    .sort((a, b) => b[1].alerts - a[1].alerts)
    .forEach(([company, data]) => {
      if (data.changes > 0) {
        html += `
          <tr>
            <td>${company}</td>
            <td>${data.urls}</td>
            <td>${data.changes}</td>
            <td>${data.alerts}</td>
          </tr>
        `;
      }
    });
  html += '</table>';
  
  // Footer
  html += `
    <hr>
    <p><em>Multi-URL Monitoring: Comprehensive coverage across all competitor touchpoints</em></p>
    <p>Dashboard: <a href="https://redmorestudio.github.io/ai-competitive-monitor">View Full Dashboard</a></p>
  `;
  
  const email = Session.getActiveUser().getEmail();
  GmailApp.sendEmail(email, subject, '', {
    htmlBody: html
  });
  
  console.log('Multi-URL alert sent to:', email);
}

/**
 * Update dashboard with multi-URL data
 */
function updateMultiUrlDashboard(changes, stats, reports) {
  const sheet = getOrCreateMonitorSheet();
  if (!sheet.success) return;
  
  const ss = sheet.spreadsheet;
  let dashboardSheet = ss.getSheetByName('MultiUrlDashboard');
  
  if (!dashboardSheet) {
    dashboardSheet = ss.insertSheet('MultiUrlDashboard');
    const headers = [
      'Timestamp', 'Companies', 'Total URLs', 'URLs Checked', 
      'Changes', 'Alerts', 'Top Change Type', 'Avg Change %',
      'Critical Changes', 'Trends Detected'
    ];
    dashboardSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    dashboardSheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    dashboardSheet.setFrozenRows(1);
  }
  
  // Calculate metrics
  const avgChange = changes.length > 0 ?
    changes.reduce((sum, c) => sum + c.magnitude.percentageChange, 0) / changes.length : 0;
  
  const topChangeType = Object.entries(stats.byType)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'none';
  
  // Add dashboard row
  dashboardSheet.appendRow([
    new Date().toISOString(),
    stats.companies,
    stats.totalUrls,
    stats.monitored,
    stats.changed,
    stats.alerted,
    topChangeType,
    avgChange.toFixed(1) + '%',
    reports.criticalChanges.length,
    reports.trends.length
  ]);
}

// ============ MIGRATION AND SETUP ============

/**
 * Complete setup for multi-URL monitoring
 */
function setupMultiUrlMonitoring() {
  console.log('Setting up multi-URL monitoring system...');
  
  // 1. Update configuration
  const configResult = updateToMultiUrlConfig();
  console.log('Configuration updated:', configResult);
  
  // 2. Migrate existing data
  const migrationResult = migrateToMultiUrl();
  console.log('Migration completed:', migrationResult);
  
  // 3. Override monitor functions
  PropertiesService.getScriptProperties().setProperty('USE_MULTI_URL', 'true');
  
  // 4. Test with one company
  const testResult = testMultiUrlMonitoring('Anthropic');
  console.log('Test completed:', testResult);
  
  return {
    success: true,
    config: configResult,
    migration: migrationResult,
    test: testResult,
    message: 'Multi-URL monitoring is now active!'
  };
}

/**
 * Get current multi-URL status
 */
function getMultiUrlStatus() {
  const props = PropertiesService.getScriptProperties();
  const isEnabled = props.getProperty('USE_MULTI_URL') === 'true';
  const config = getMonitorConfigurations();
  
  const urlStats = config.reduce((acc, company) => {
    acc.totalCompanies++;
    acc.totalUrls += company.urls.length;
    acc.minUrls = Math.min(acc.minUrls, company.urls.length);
    acc.maxUrls = Math.max(acc.maxUrls, company.urls.length);
    return acc;
  }, { totalCompanies: 0, totalUrls: 0, minUrls: 999, maxUrls: 0 });
  
  urlStats.avgUrls = (urlStats.totalUrls / urlStats.totalCompanies).toFixed(1);
  
  return {
    enabled: isEnabled,
    stats: urlStats,
    typeDistribution: getUrlTypeStats(),
    lastRun: props.getProperty('LAST_MULTI_URL_RUN') || 'Never',
    configuredCompanies: config.map(c => ({
      company: c.company,
      urlCount: c.urls.length
    }))
  };
}
