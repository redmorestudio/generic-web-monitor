/**
 * Enhanced Claude Integration with Advanced Models
 * Uses Claude Opus for sophisticated entity extraction and analysis
 */

// ============ ENHANCED CLAUDE CONFIGURATION ============
const CLAUDE_CONFIG = {
  // Use the most advanced model for entity extraction
  entityModel: 'claude-3-opus-20240229',  // Most capable model for complex analysis
  changeModel: 'claude-3-sonnet-20240229', // Efficient for change detection
  apiVersion: '2023-06-01',
  maxTokens: 4000,  // Increased for comprehensive analysis
  temperature: 0.2  // Lower for more consistent extraction
};

/**
 * Extract entities from content using Claude Opus
 */
function extractEntitiesWithClaude(content, url, company) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('CLAUDE_API_KEY');
  
  if (!apiKey) {
    console.error('No Claude API key configured');
    return null;
  }
  
  const prompt = `You are an AI competitive intelligence analyst. Extract structured entities from this webpage content.

Company: ${company}
URL: ${url}

CONTENT:
${content.substring(0, 8000)}

Extract and categorize ALL relevant entities found in the content. Return a JSON object with:
{
  "products": [
    {
      "name": "Product Name",
      "type": "LLM/API/Tool/etc",
      "description": "Brief description",
      "features": ["key feature 1", "key feature 2"],
      "status": "announced/beta/ga/deprecated"
    }
  ],
  "technologies": [
    {
      "name": "Technology Name",
      "category": "ML/Infrastructure/API/etc",
      "description": "What it does"
    }
  ],
  "companies": [
    {
      "name": "Company Name",
      "relationship": "competitor/partner/customer/investor",
      "context": "How they're mentioned"
    }
  ],
  "people": [
    {
      "name": "Person Name",
      "role": "Their role",
      "context": "Why they're relevant"
    }
  ],
  "partnerships": [
    {
      "partners": ["Company A", "Company B"],
      "type": "technology/business/research",
      "description": "Nature of partnership"
    }
  ],
  "metrics": [
    {
      "metric": "Metric name",
      "value": "Value",
      "context": "What it measures"
    }
  ],
  "dates": [
    {
      "date": "YYYY-MM-DD or descriptive",
      "event": "What happens on this date",
      "significance": "Why it matters"
    }
  ],
  "insights": [
    "Key strategic insight 1",
    "Competitive intelligence finding 2"
  ]
}

Be thorough and extract ALL entities, even if uncertain. This is for competitive intelligence.`;

  try {
    const response = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
      method: 'post',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': CLAUDE_CONFIG.apiVersion,
        'content-type': 'application/json'
      },
      payload: JSON.stringify({
        model: CLAUDE_CONFIG.entityModel,
        max_tokens: CLAUDE_CONFIG.maxTokens,
        temperature: CLAUDE_CONFIG.temperature,
        messages: [{
          role: 'user',
          content: prompt
        }]
      }),
      muteHttpExceptions: true
    });
    
    if (response.getResponseCode() === 200) {
      const result = JSON.parse(response.getContentText());
      const entities = JSON.parse(result.content[0].text);
      
      // Add metadata
      entities.extractedAt = new Date().toISOString();
      entities.model = CLAUDE_CONFIG.entityModel;
      entities.company = company;
      entities.url = url;
      
      return entities;
    } else {
      console.error('Claude API error:', response.getContentText());
      return null;
    }
    
  } catch (error) {
    console.error('Entity extraction error:', error);
    return null;
  }
}

/**
 * Analyze changes and extract differential entities
 */
function analyzeChangeWithClaudeOpus(oldContent, newContent, url, company) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('CLAUDE_API_KEY');
  
  if (!apiKey) return null;
  
  const prompt = `You are analyzing website changes for competitive intelligence. Focus on what's NEW or CHANGED.

Company: ${company}
URL: ${url}

OLD CONTENT (excerpt):
${oldContent.substring(0, 4000)}

NEW CONTENT (excerpt):
${newContent.substring(0, 4000)}

Analyze what changed and extract NEW entities that appeared. Provide a detailed JSON response:
{
  "summary": "Executive summary of key changes (2-3 sentences)",
  "changeType": ["product_launch", "feature_update", "pricing_change", "partnership", "technical_update", "organizational", "other"],
  "newEntities": {
    "products": ["New products mentioned"],
    "features": ["New features added"],
    "technologies": ["New tech mentioned"],
    "companies": ["New companies mentioned"],
    "people": ["New people mentioned"],
    "partnerships": ["New partnerships"]
  },
  "removedEntities": {
    "products": ["Products no longer mentioned"],
    "features": ["Features removed"]
  },
  "significanceScore": 1-10,
  "competitiveImplications": [
    "Implication 1 for competitors",
    "Implication 2"
  ],
  "marketSignals": [
    "What this signals about their strategy",
    "Market direction indicators"
  ],
  "recommendations": [
    "Recommended action 1",
    "Recommended action 2"
  ],
  "quotableChanges": [
    {
      "original": "Key quote from old content",
      "new": "How it changed in new content",
      "significance": "Why this matters"
    }
  ]
}`;

  try {
    const response = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
      method: 'post',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': CLAUDE_CONFIG.apiVersion,
        'content-type': 'application/json'
      },
      payload: JSON.stringify({
        model: CLAUDE_CONFIG.entityModel,
        max_tokens: CLAUDE_CONFIG.maxTokens,
        temperature: CLAUDE_CONFIG.temperature,
        messages: [{
          role: 'user',
          content: prompt
        }]
      }),
      muteHttpExceptions: true
    });
    
    if (response.getResponseCode() === 200) {
      const result = JSON.parse(response.getContentText());
      return JSON.parse(result.content[0].text);
    }
    
  } catch (error) {
    console.error('Claude Opus analysis error:', error);
    return null;
  }
}

/**
 * Generate AI insights report across all monitored companies
 */
function generateCompetitiveLandscapeReport(allChanges) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('CLAUDE_API_KEY');
  if (!apiKey) return null;
  
  // Aggregate all entities
  const landscape = {
    companies: new Set(),
    products: new Set(),
    technologies: new Set(),
    partnerships: [],
    insights: []
  };
  
  allChanges.forEach(change => {
    if (change.claudeInsights && change.claudeInsights.newEntities) {
      const entities = change.claudeInsights.newEntities;
      entities.products?.forEach(p => landscape.products.add(p));
      entities.technologies?.forEach(t => landscape.technologies.add(t));
      entities.companies?.forEach(c => landscape.companies.add(c));
      entities.partnerships?.forEach(p => landscape.partnerships.push(p));
    }
  });
  
  const prompt = `Analyze this competitive landscape data and provide strategic insights:

PRODUCTS DETECTED: ${Array.from(landscape.products).join(', ')}
TECHNOLOGIES: ${Array.from(landscape.technologies).join(', ')}
COMPANIES MENTIONED: ${Array.from(landscape.companies).join(', ')}
PARTNERSHIPS: ${JSON.stringify(landscape.partnerships)}

Provide a strategic analysis:
{
  "executiveSummary": "2-3 paragraph strategic overview",
  "keyTrends": [
    {
      "trend": "Trend name",
      "evidence": ["Supporting evidence"],
      "implications": "What this means"
    }
  ],
  "competitiveDynamics": {
    "leaders": ["Companies leading in innovation"],
    "fastMovers": ["Companies making rapid changes"],
    "partnerships": ["Key alliance patterns"]
  },
  "emergingTechnologies": [
    {
      "technology": "Tech name",
      "adopters": ["Companies using it"],
      "maturity": "experimental/emerging/mainstream"
    }
  ],
  "marketPredictions": [
    "Prediction 1 based on evidence",
    "Prediction 2"
  ],
  "strategicRecommendations": [
    {
      "recommendation": "What to do",
      "rationale": "Why",
      "priority": "high/medium/low"
    }
  ]
}`;

  try {
    const response = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
      method: 'post',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': CLAUDE_CONFIG.apiVersion,
        'content-type': 'application/json'
      },
      payload: JSON.stringify({
        model: CLAUDE_CONFIG.entityModel,
        max_tokens: CLAUDE_CONFIG.maxTokens,
        temperature: 0.3,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });
    
    if (response.getResponseCode() === 200) {
      const result = JSON.parse(response.getContentText());
      return JSON.parse(result.content[0].text);
    }
  } catch (error) {
    console.error('Landscape analysis error:', error);
  }
  
  return null;
}

/**
 * Process monitor with enhanced entity extraction
 */
function processMonitorWithEntities(monitor) {
  const results = {
    company: monitor.company,
    urls: [],
    changes: [],
    entities: [],
    errors: []
  };
  
  const apiKey = PropertiesService.getScriptProperties().getProperty('CLAUDE_API_KEY');
  const useClaudeAnalysis = !!apiKey;
  
  monitor.urls.forEach(url => {
    try {
      const extraction = extractPageContent(url);
      
      if (!extraction.success) {
        results.errors.push({
          url: url,
          error: extraction.error
        });
        return;
      }
      
      // Extract entities if Claude is available
      if (useClaudeAnalysis) {
        const entities = extractEntitiesWithClaude(
          extraction.content,
          url,
          monitor.company
        );
        
        if (entities) {
          results.entities.push(entities);
        }
      }
      
      // Check for changes
      const baseline = getBaselineForUrl(url);
      
      if (!baseline) {
        storeBaseline(monitor.company, url, extraction);
        results.urls.push({
          url: url,
          status: 'baseline_created',
          entitiesExtracted: !!results.entities.length
        });
      } else if (baseline.contentHash !== extraction.contentHash) {
        // Analyze changes with Claude Opus
        let claudeInsights = null;
        
        if (useClaudeAnalysis) {
          claudeInsights = analyzeChangeWithClaudeOpus(
            baseline.content || '',
            extraction.content,
            url,
            monitor.company
          );
        }
        
        const change = {
          company: monitor.company,
          url: url,
          claudeInsights: claudeInsights,
          detectedAt: new Date().toISOString()
        };
        
        results.changes.push(change);
        storeBaseline(monitor.company, url, extraction);
        
        results.urls.push({
          url: url,
          status: 'changed',
          significanceScore: claudeInsights?.significanceScore || 0,
          newEntities: claudeInsights?.newEntities || {}
        });
      } else {
        results.urls.push({
          url: url,
          status: 'unchanged'
        });
      }
      
      Utilities.sleep(1000); // Respectful crawling
      
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
 * Check Claude configuration and recommend settings
 */
function checkClaudeConfiguration() {
  const apiKey = PropertiesService.getScriptProperties().getProperty('CLAUDE_API_KEY');
  
  return {
    apiKeySet: !!apiKey,
    recommendedModels: {
      entityExtraction: CLAUDE_CONFIG.entityModel,
      changeAnalysis: CLAUDE_CONFIG.changeModel
    },
    status: apiKey ? 'Ready for advanced analysis' : 'Need to set API key',
    capabilities: apiKey ? [
      'Entity extraction from web pages',
      'Change significance analysis',
      'Competitive intelligence insights',
      'Strategic recommendations',
      'Cross-company trend analysis'
    ] : []
  };
}
