/**
 * Test functions for intelligent monitoring
 */

// Test content extraction on a single URL
function testContentExtraction(url) {
  try {
    const response = UrlFetchApp.fetch(url || 'https://mistral.ai', {
      muteHttpExceptions: true,
      followRedirects: true
    });
    
    if (response.getResponseCode() === 200) {
      const html = response.getContentText();
      const content = extractRelevantContent(html);
      const intelligence = analyzePageContent(content);
      
      return {
        success: true,
        url: url,
        contentLength: content.length,
        contentPreview: content.substring(0, 500),
        intelligence: intelligence,
        keywords: CONFIG.keywords
      };
    } else {
      return {
        success: false,
        error: `HTTP ${response.getResponseCode()}`
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

// Test intelligent baseline generation
function testIntelligentBaseline() {
  const monitors = getMonitorConfigurations();
  const testMonitor = monitors[0]; // Test with first company
  
  console.log(`Testing intelligent monitoring for ${testMonitor.company}...`);
  
  const result = processMonitorEnhanced(testMonitor);
  
  // Log results
  console.log(`Processed ${result.results.length} URLs`);
  result.results.forEach(r => {
    console.log(`- ${r.url}: ${r.status} (${r.contentLength} chars)`);
    if (r.intelligence) {
      console.log(`  Themes: ${r.intelligence.messagingThemes.join(', ')}`);
      console.log(`  Pricing: ${r.intelligence.pricingSignals.join(', ')}`);
    }
  });
  
  return result;
}

// Test change detection
function testChangeDetection() {
  // First, get current content
  const monitors = getMonitorConfigurations();
  const newResults = monitors.map(m => processMonitorEnhanced(m));
  
  // Store it
  storePageContent(newResults);
  
  // Simulate a change by modifying content
  if (newResults[0].results[0]) {
    newResults[0].results[0].content += ' NEW PRODUCT LAUNCH ANNOUNCEMENT';
    newResults[0].results[0].contentHash = 'changed-hash';
  }
  
  // Detect changes
  const changes = detectAllChanges(newResults);
  
  console.log(`Detected ${changes.length} changes`);
  changes.forEach(c => {
    console.log(`- ${c.company} ${c.url}: Score ${c.analysis.relevanceScore}/10`);
    console.log(`  Type: ${c.analysis.changeType}`);
    console.log(`  Summary: ${c.analysis.summary}`);
  });
  
  return {
    totalChanges: changes.length,
    relevantChanges: changes.filter(c => c.analysis.relevanceScore >= 6),
    changes: changes
  };
}