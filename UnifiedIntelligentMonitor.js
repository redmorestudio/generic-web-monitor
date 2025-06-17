/**
 * Unified Intelligent Monitor with LLM + Magnitude Detection
 * Combines AI scoring with change magnitude for complete intelligence
 */

// ============ UNIFIED CONFIGURATION ============
const UNIFIED_CONFIG = {
  // Magnitude thresholds
  magnitude: {
    minor: 5,        // < 5% - ignore
    moderate: 15,    // 5-15% - log but don't alert
    significant: 25, // 15-25% - consider alerting
    major: 50        // > 50% - always alert
  },
  
  // LLM settings
  llm: {
    provider: 'anthropic',
    model: 'claude-3-haiku-20240307',
    maxTokens: 2000,
    temperature: 0.3,
    apiKeyProperty: 'CLAUDE_API_KEY'
  },
  
  // Relevance scoring
  scoring: {
    baseThreshold: 6,     // Alert threshold
    magnitudeBoost: {     // Boost based on change %
      minor: 0,
      moderate: 1,
      significant: 2,
      major: 3
    },
    llmWeight: 0.7,       // How much to trust LLM vs keywords
    keywordWeight: 0.3    // Fallback to keywords
  },
  
  // Content analysis
  content: {
    maxContentLength: 50000,
    crawlDelay: 2000,
    retryAttempts: 3
  }
};

// ============ UNIFIED PROCESS MONITOR ============

/**
 * The ultimate monitoring function - combines magnitude + LLM intelligence
 */
function processMonitorUnified(monitor) {
  const results = {
    company: monitor.company,
    urls: [],
    changes: [],
    errors: [],
    intelligence: {
      totalAnalyzed: 0,
      llmUsed: 0,
      magnitudeDetected: 0
    }
  };
  
  const apiKey = PropertiesService.getScriptProperties().getProperty(UNIFIED_CONFIG.llm.apiKeyProperty);
  const llmEnabled = !!apiKey;
  
  monitor.urls.forEach(url => {
    try {
      // Extract current content
      const extraction = extractPageContent(url);
      
      if (!extraction.success) {
        results.errors.push({
          url: url,
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
        handleNewBaseline(monitor.company, url, extraction, results);
      } else if (baseline.contentHash !== extraction.contentHash) {
        // Content changed - full analysis
        const analysis = analyzeChangeUnified(
          monitor.company,
          url,
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
        
        // Update storage
        storeBaseline(monitor.company, url, extraction);
        storeFullPageContent(url, extraction.content, analysis.magnitude, extraction);
        
      } else {
        results.urls.push({
          url: url,
          status: 'unchanged'
        });
      }
      
      Utilities.sleep(UNIFIED_CONFIG.content.crawlDelay);
      
    } catch (error) {
      results.errors.push({
        url: url,
        error: error.toString()
      });
    }
  });
  
  return results;
}

/**
 * Unified change analysis - magnitude + LLM + keywords
 */
function analyzeChangeUnified(company, url, oldContent, newContent, baseline, extraction, llmEnabled) {
  // 1. Calculate magnitude of change
  const magnitude = calculateChangeMagnitude(oldContent, newContent);
  
  // 2. Generate diff
  const diff = generateDiffSummary(oldContent, newContent);
  
  // 3. Get LLM analysis if available
  let llmAnalysis = null;
  let usedLLM = false;
  
  if (llmEnabled && (magnitude.percentageChange >= 10 || shouldUseLLM(url))) {
    try {
      llmAnalysis = analyzeContentWithLLM(newContent, oldContent, url, company);
      usedLLM = true;
    } catch (error) {
      console.error('LLM analysis failed:', error);
    }
  }
  
  // 4. Calculate unified relevance score
  const relevanceScore = calculateUnifiedRelevanceScore(
    magnitude,
    llmAnalysis,
    oldContent,
    newContent,
    url
  );
  
  // 5. Determine if we should alert
  const shouldAlert = determineAlert(magnitude, relevanceScore, llmAnalysis);
  
  // 6. Get change category
  const category = categorizeChange(magnitude, llmAnalysis, diff);
  
  // 7. Generate intelligent summary
  const summary = generateUnifiedSummary(
    company,
    url,
    magnitude,
    llmAnalysis,
    diff,
    category
  );
  
  const change = {
    company: company,
    url: url,
    timestamp: new Date().toISOString(),
    
    // Hashes
    oldHash: baseline.contentHash,
    newHash: extraction.contentHash,
    
    // Magnitude data
    magnitude: magnitude,
    percentageChange: magnitude.percentageChange,
    characterDiff: magnitude.characterDiff,
    
    // Intelligence data
    relevanceScore: relevanceScore,
    category: category,
    shouldAlert: shouldAlert,
    
    // Analysis results
    llmAnalysis: llmAnalysis,
    keywords: extractChangeKeywords(oldContent, newContent),
    diff: diff,
    
    // Summary
    summary: summary,
    alertReason: getAlertReason(magnitude, relevanceScore, llmAnalysis)
  };
  
  const urlResult = {
    url: url,
    status: 'changed',
    changePercent: magnitude.percentageChange,
    magnitude: magnitude.magnitude,
    relevanceScore: relevanceScore,
    category: category,
    alert: shouldAlert,
    summary: summary
  };
  
  return {
    change: change,
    urlResult: urlResult,
    usedLLM: usedLLM,
    magnitudeDetected: magnitude.percentageChange >= 15
  };
}

/**
 * Calculate unified relevance score combining all signals
 */
function calculateUnifiedRelevanceScore(magnitude, llmAnalysis, oldContent, newContent, url) {
  let score = 5; // Base score
  
  // 1. Magnitude contribution
  const magnitudeBoost = UNIFIED_CONFIG.scoring.magnitudeBoost[magnitude.magnitude] || 0;
  score += magnitudeBoost;
  
  // 2. LLM contribution (if available)
  if (llmAnalysis) {
    const llmScore = llmAnalysis.significanceScore || 5;
    const llmContribution = llmScore * UNIFIED_CONFIG.scoring.llmWeight;
    score = score * (1 - UNIFIED_CONFIG.scoring.llmWeight) + llmContribution;
    
    // Additional boosts from LLM insights
    if (llmAnalysis.urgency === 'high') score += 1;
    if (llmAnalysis.competitiveIntel?.length > 0) score += 0.5;
    if (llmAnalysis.pricingSignals?.length > 0) score += 1;
  } else {
    // Fallback to keyword analysis
    const keywordScore = calculateRelevanceScore(oldContent, newContent, url);
    const keywordContribution = keywordScore * UNIFIED_CONFIG.scoring.keywordWeight;
    score = score * (1 - UNIFIED_CONFIG.scoring.keywordWeight) + keywordContribution;
  }
  
  // 3. Page type weighting
  const pageType = identifyPageType(url);
  const pageWeight = INTELLIGENT_CONFIG.pageWeights[pageType] || 1.0;
  score = score * pageWeight;
  
  return Math.max(1, Math.min(10, Math.round(score)));
}

/**
 * Determine if we should alert based on all factors
 */
function determineAlert(magnitude, relevanceScore, llmAnalysis) {
  // Alert if ANY of these conditions are met:
  
  // 1. Relevance score exceeds threshold
  if (relevanceScore >= UNIFIED_CONFIG.scoring.baseThreshold) return true;
  
  // 2. Magnitude is significant or major
  if (magnitude.percentageChange >= UNIFIED_CONFIG.magnitude.significant) return true;
  
  // 3. LLM says it's urgent
  if (llmAnalysis?.urgency === 'high') return true;
  
  // 4. Major pricing change detected
  if (llmAnalysis?.pricingSignals?.length > 0 && magnitude.percentageChange >= 15) return true;
  
  return false;
}

/**
 * Categorize the type of change
 */
function categorizeChange(magnitude, llmAnalysis, diff) {
  // Use LLM categorization if available
  if (llmAnalysis?.category) {
    return llmAnalysis.category;
  }
  
  // Otherwise, infer from magnitude and content
  if (magnitude.magnitude === 'major') {
    return 'major_update';
  } else if (llmAnalysis?.pricingSignals?.length > 0) {
    return 'pricing_change';
  } else if (llmAnalysis?.productFeatures?.length > 3) {
    return 'product_update';
  } else if (diff.addedCount > 20 || diff.removedCount > 20) {
    return 'content_update';
  } else if (magnitude.magnitude === 'minor') {
    return 'minor_update';
  }
  
  return 'general_update';
}

/**
 * Generate unified summary combining all insights
 */
function generateUnifiedSummary(company, url, magnitude, llmAnalysis, diff, category) {
  const parts = [];
  
  // Magnitude summary
  parts.push(`${magnitude.percentageChange}% content change (${magnitude.magnitude})`);
  
  // LLM summary if available
  if (llmAnalysis?.summary) {
    parts.push(llmAnalysis.summary);
  } else {
    // Fallback summary
    if (diff.addedCount > 0) parts.push(`Added ${diff.addedCount} new sections`);
    if (diff.removedCount > 0) parts.push(`Removed ${diff.removedCount} sections`);
  }
  
  // Category insight
  const categoryInsights = {
    'major_update': 'Major overhaul detected',
    'pricing_change': 'Pricing information updated',
    'product_update': 'Product features changed',
    'content_update': 'Significant content revision',
    'minor_update': 'Minor tweaks only'
  };
  
  if (categoryInsights[category]) {
    parts.push(categoryInsights[category]);
  }
  
  return parts.join('. ');
}

/**
 * Get reason for alert
 */
function getAlertReason(magnitude, relevanceScore, llmAnalysis) {
  const reasons = [];
  
  if (magnitude.percentageChange >= UNIFIED_CONFIG.magnitude.significant) {
    reasons.push(`${magnitude.percentageChange}% content change`);
  }
  
  if (relevanceScore >= UNIFIED_CONFIG.scoring.baseThreshold) {
    reasons.push(`High relevance score (${relevanceScore}/10)`);
  }
  
  if (llmAnalysis?.urgency === 'high') {
    reasons.push('LLM detected urgent change');
  }
  
  return reasons.join(', ') || 'Threshold exceeded';
}

/**
 * Determine if we should use LLM for this URL
 */
function shouldUseLLM(url) {
  const pageType = identifyPageType(url);
  const highValuePages = ['pricing', 'products', 'features', 'announcement', 'technology'];
  return highValuePages.includes(pageType);
}

/**
 * Handle new baseline creation
 */
function handleNewBaseline(company, url, extraction, results) {
  // Always analyze new pages with LLM if available
  const apiKey = PropertiesService.getScriptProperties().getProperty(UNIFIED_CONFIG.llm.apiKeyProperty);
  
  let intelligence = extraction.intelligence;
  if (apiKey) {
    try {
      intelligence = analyzeContentWithLLM(extraction.content, '', url, company);
    } catch (error) {
      console.error('LLM analysis failed for baseline:', error);
    }
  }
  
  storeBaseline(company, url, { ...extraction, intelligence });
  storeFullPageContent(url, extraction.content, null, extraction);
  
  results.urls.push({
    url: url,
    status: 'baseline_created',
    contentLength: extraction.contentLength,
    intelligence: intelligence
  });
}

// ============ ENHANCED DAILY MONITORING ============

/**
 * Run daily monitoring with unified intelligence
 */
function runDailyMonitoringUnified() {
  console.log('Starting unified intelligent monitoring...');
  
  const monitors = getMonitorConfigurations();
  const allChanges = [];
  const errors = [];
  const stats = {
    monitored: 0,
    changed: 0,
    alerted: 0,
    llmAnalyzed: 0,
    magnitudeDetected: 0
  };
  
  monitors.forEach(monitor => {
    try {
      const result = processMonitorUnified(monitor);
      
      stats.monitored += result.urls.length;
      stats.changed += result.changes.length;
      stats.alerted += result.changes.filter(c => c.shouldAlert).length;
      stats.llmAnalyzed += result.intelligence.llmUsed;
      stats.magnitudeDetected += result.intelligence.magnitudeDetected;
      
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
  
  // Generate reports
  const magnitudeReport = generateMagnitudeReport(allChanges);
  const intelligenceReport = generateIntelligenceReport(allChanges);
  
  // Send alerts for significant changes
  const alertableChanges = allChanges.filter(c => c.shouldAlert);
  if (alertableChanges.length > 0) {
    sendUnifiedAlert(alertableChanges, magnitudeReport, intelligenceReport);
  }
  
  // Update dashboards
  updateUnifiedDashboard(allChanges, stats);
  
  // Log summary
  console.log(`Monitoring complete: ${stats.monitored} URLs, ${stats.changed} changes, ${stats.alerted} alerts`);
  console.log(`Intelligence used: ${stats.llmAnalyzed} LLM analyses, ${stats.magnitudeDetected} significant magnitudes`);
  
  return {
    success: true,
    stats: stats,
    changes: allChanges.length,
    alerts: alertableChanges.length,
    errors: errors,
    reports: {
      magnitude: magnitudeReport,
      intelligence: intelligenceReport
    }
  };
}

/**
 * Generate intelligence report from changes
 */
function generateIntelligenceReport(changes) {
  const report = {
    byCategory: {},
    byCompany: {},
    topInsights: [],
    trends: []
  };
  
  // Categorize changes
  changes.forEach(change => {
    // By category
    if (!report.byCategory[change.category]) {
      report.byCategory[change.category] = [];
    }
    report.byCategory[change.category].push({
      company: change.company,
      url: change.url,
      summary: change.summary
    });
    
    // By company
    if (!report.byCompany[change.company]) {
      report.byCompany[change.company] = {
        changes: 0,
        categories: {},
        avgMagnitude: 0,
        insights: []
      };
    }
    report.byCompany[change.company].changes++;
    report.byCompany[change.company].categories[change.category] = 
      (report.byCompany[change.company].categories[change.category] || 0) + 1;
    
    // Collect insights
    if (change.llmAnalysis?.strategicInsights) {
      report.byCompany[change.company].insights.push(...change.llmAnalysis.strategicInsights);
    }
  });
  
  // Extract top insights
  const allInsights = changes
    .filter(c => c.llmAnalysis?.strategicInsights)
    .flatMap(c => c.llmAnalysis.strategicInsights)
    .filter((v, i, a) => a.indexOf(v) === i); // Unique
  
  report.topInsights = allInsights.slice(0, 5);
  
  // Identify trends
  if (report.byCategory.pricing_change?.length > 2) {
    report.trends.push('Multiple competitors adjusting pricing');
  }
  if (report.byCategory.product_update?.length > 3) {
    report.trends.push('Industry-wide product enhancement cycle');
  }
  
  return report;
}

/**
 * Send unified alert email
 */
function sendUnifiedAlert(changes, magnitudeReport, intelligenceReport) {
  const subject = `🚨 AI Monitor: ${changes.length} Important Changes Detected`;
  
  let html = `
    <h2>AI Competitor Monitor - Unified Intelligence Alert</h2>
    <p><strong>${magnitudeReport.summary}</strong></p>
    
    <h3>🎯 Key Changes Requiring Attention</h3>
  `;
  
  // Group by alert reason
  const byReason = {
    magnitude: changes.filter(c => c.magnitude.percentageChange >= 25),
    relevance: changes.filter(c => c.relevanceScore >= 6),
    llm: changes.filter(c => c.llmAnalysis?.urgency === 'high')
  };
  
  if (byReason.magnitude.length > 0) {
    html += '<h4>Major Content Changes (>25%)</h4><ul>';
    byReason.magnitude.forEach(change => {
      html += `
        <li>
          <strong>${change.company}</strong> - ${change.url}<br>
          📊 ${change.magnitude.percentageChange}% change (${change.magnitude.magnitude})<br>
          📝 ${change.summary}<br>
          ${change.llmAnalysis ? `🤖 AI: ${change.llmAnalysis.summary}` : ''}
        </li>
      `;
    });
    html += '</ul>';
  }
  
  if (byReason.relevance.length > 0) {
    html += '<h4>High Relevance Changes (Score 6+)</h4><ul>';
    byReason.relevance.forEach(change => {
      html += `
        <li>
          <strong>${change.company}</strong> - ${change.url}<br>
          ⭐ Relevance: ${change.relevanceScore}/10<br>
          📝 ${change.summary}
        </li>
      `;
    });
    html += '</ul>';
  }
  
  // Add intelligence insights
  if (intelligenceReport.topInsights.length > 0) {
    html += `
      <h3>🧠 Strategic Insights</h3>
      <ul>
        ${intelligenceReport.topInsights.map(insight => `<li>${insight}</li>`).join('')}
      </ul>
    `;
  }
  
  // Add trends
  if (intelligenceReport.trends.length > 0) {
    html += `
      <h3>📈 Detected Trends</h3>
      <ul>
        ${intelligenceReport.trends.map(trend => `<li>${trend}</li>`).join('')}
      </ul>
    `;
  }
  
  // Add detailed table
  html += `
    <h3>📊 Complete Change Analysis</h3>
    <table border="1" cellpadding="5" style="border-collapse: collapse;">
      <tr>
        <th>Company</th>
        <th>URL</th>
        <th>Change %</th>
        <th>Relevance</th>
        <th>Category</th>
        <th>Summary</th>
      </tr>
  `;
  
  changes.forEach(change => {
    const rowColor = change.magnitude.magnitude === 'major' ? '#ffcccc' : 
                     change.magnitude.magnitude === 'significant' ? '#fff3cd' : 
                     '#ffffff';
    
    html += `
      <tr style="background-color: ${rowColor}">
        <td>${change.company}</td>
        <td><a href="${change.url}">${change.url}</a></td>
        <td><strong>${change.magnitude.percentageChange}%</strong></td>
        <td>${change.relevanceScore}/10</td>
        <td>${change.category}</td>
        <td>${change.summary}</td>
      </tr>
    `;
  });
  
  html += '</table>';
  
  // Add footer
  html += `
    <hr>
    <p><em>Unified Intelligence: Magnitude Detection + LLM Analysis + Keyword Matching</em></p>
    <p>Alert triggered by: ${changes[0].alertReason}</p>
  `;
  
  const email = Session.getActiveUser().getEmail();
  GmailApp.sendEmail(email, subject, '', {
    htmlBody: html
  });
  
  console.log('Unified alert sent to:', email);
}

/**
 * Update unified dashboard
 */
function updateUnifiedDashboard(changes, stats) {
  const sheet = getOrCreateMonitorSheet();
  let dashboardSheet = sheet.getSheetByName('UnifiedDashboard');
  
  if (!dashboardSheet) {
    dashboardSheet = sheet.insertSheet('UnifiedDashboard');
    dashboardSheet.getRange(1, 1, 1, 8).setValues([[
      'Timestamp', 'URLs Monitored', 'Changes Detected', 'Alerts Sent',
      'LLM Analyses', 'Major Changes', 'Avg Change %', 'Top Category'
    ]]);
    dashboardSheet.setFrozenRows(1);
  }
  
  // Calculate statistics
  const majorChanges = changes.filter(c => c.magnitude.magnitude === 'major').length;
  const avgChange = changes.length > 0 ? 
    changes.reduce((sum, c) => sum + c.magnitude.percentageChange, 0) / changes.length : 0;
  
  // Find top category
  const categories = {};
  changes.forEach(c => {
    categories[c.category] = (categories[c.category] || 0) + 1;
  });
  const topCategory = Object.keys(categories)
    .sort((a, b) => categories[b] - categories[a])[0] || 'none';
  
  // Add row
  dashboardSheet.appendRow([
    new Date().toISOString(),
    stats.monitored,
    stats.changed,
    stats.alerted,
    stats.llmAnalyzed,
    majorChanges,
    Math.round(avgChange * 10) / 10,
    topCategory
  ]);
}

// ============ ACTIVATION FUNCTIONS ============

/**
 * Enable unified intelligence system
 */
function enableUnifiedIntelligence() {
  // Set configuration flags
  const props = PropertiesService.getScriptProperties();
  props.setProperty('UNIFIED_INTELLIGENCE_ENABLED', 'true');
  props.setProperty('MAGNITUDE_DETECTION_ENABLED', 'true');
  props.setProperty('LLM_ENABLED', 'true');
  
  // Check API key
  const apiKey = props.getProperty('CLAUDE_API_KEY');
  
  // Replace monitoring functions
  processMonitorEnhanced = processMonitorUnified;
  runDailyMonitoring = runDailyMonitoringUnified;
  
  // Log activation
  logActivity('Unified Intelligence System activated', 'configuration');
  
  return {
    success: true,
    message: 'Unified Intelligence active: Magnitude + LLM + Keywords',
    features: {
      magnitudeDetection: true,
      llmAnalysis: !!apiKey,
      keywordFallback: true,
      unifiedScoring: true
    },
    configuration: {
      magnitudeThresholds: UNIFIED_CONFIG.magnitude,
      relevanceThreshold: UNIFIED_CONFIG.scoring.baseThreshold,
      llmModel: apiKey ? UNIFIED_CONFIG.llm.model : 'Not configured'
    }
  };
}

/**
 * Test unified intelligence on a URL
 */
function testUnifiedIntelligence(url, company) {
  console.log(`Testing unified intelligence on ${url}`);
  
  // Extract current content
  const extraction = extractPageContent(url);
  if (!extraction.success) return extraction;
  
  // Get previous content
  const previousContent = getPreviousFullContent(url) || 'This is test baseline content for comparison.';
  
  // Run unified analysis
  const apiKey = PropertiesService.getScriptProperties().getProperty(UNIFIED_CONFIG.llm.apiKeyProperty);
  const analysis = analyzeChangeUnified(
    company || 'Test Company',
    url,
    previousContent,
    extraction.content,
    { contentHash: 'test-baseline-hash' },
    extraction,
    !!apiKey
  );
  
  return {
    success: true,
    url: url,
    analysis: {
      magnitude: analysis.change.magnitude,
      relevanceScore: analysis.change.relevanceScore,
      category: analysis.change.category,
      shouldAlert: analysis.change.shouldAlert,
      summary: analysis.change.summary,
      alertReason: analysis.change.alertReason,
      llmUsed: analysis.usedLLM,
      diff: analysis.change.diff
    },
    recommendation: analysis.change.shouldAlert ? 
      'This change requires immediate attention!' : 
      'This change can be reviewed in regular reports.'
  };
}

/**
 * Get unified intelligence statistics
 */
function getUnifiedStats() {
  const props = PropertiesService.getScriptProperties();
  
  return {
    enabled: props.getProperty('UNIFIED_INTELLIGENCE_ENABLED') === 'true',
    features: {
      magnitude: props.getProperty('MAGNITUDE_DETECTION_ENABLED') === 'true',
      llm: props.getProperty('LLM_ENABLED') === 'true',
      apiKey: !!props.getProperty('CLAUDE_API_KEY')
    },
    usage: {
      llmCalls: parseInt(props.getProperty('LLM_CALL_COUNT') || '0'),
      lastLLMCall: props.getProperty('LLM_LAST_CALL') || 'never',
      estimatedCost: '$' + (parseInt(props.getProperty('LLM_CALL_COUNT') || '0') * 0.03).toFixed(2)
    },
    thresholds: UNIFIED_CONFIG,
    magnitudeStats: getMagnitudeStats()
  };
}