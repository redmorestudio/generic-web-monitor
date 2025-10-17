/**
 * TheBrain Enhanced Integration for AI Competitive Monitor
 * Implements: Alerting, Concept Clustering, and Configuration
 */

// ========================================
// CONCEPT CLUSTERING SYSTEM
// ========================================

/**
 * Core concept types that form the clustering system
 */
const CONCEPT_TYPES = {
  // Change-based clusters
  PRICING_CHANGES: { name: '💰 Pricing Changes', color: '#ffcc00', priority: 'high' },
  PRODUCT_LAUNCHES: { name: '🚀 Product Launches', color: '#00ff88', priority: 'high' },
  AI_FEATURES: { name: '🤖 AI Features', color: '#667eea', priority: 'high' },
  PARTNERSHIPS: { name: '🤝 Partnerships', color: '#ff6b6b', priority: 'medium' },
  TECHNICAL_UPDATES: { name: '⚙️ Technical Updates', color: '#4a90e2', priority: 'medium' },
  
  // Industry clusters
  COMPETITORS: { name: '🎯 Competitors', color: '#ff4444', priority: 'high' },
  AI_MODELS: { name: '🧠 AI Models', color: '#764ba2', priority: 'high' },
  MARKET_TRENDS: { name: '📈 Market Trends', color: '#00cc88', priority: 'medium' },
  
  // Time-based clusters
  RECENT_CHANGES: { name: '🔥 Last 24 Hours', color: '#ff6b6b', priority: 'critical' },
  THIS_WEEK: { name: '📅 This Week', color: '#ffa726', priority: 'high' },
  THIS_MONTH: { name: '📆 This Month', color: '#66bb6a', priority: 'medium' },
  
  // Alert levels
  CRITICAL_ALERTS: { name: '🚨 Critical Alerts', color: '#ff0000', priority: 'critical' },
  HIGH_ALERTS: { name: '⚠️ High Priority', color: '#ff6b6b', priority: 'high' },
  MONITORING: { name: '👁️ Monitoring', color: '#4a90e2', priority: 'normal' }
};

/**
 * Initialize TheBrain concept clustering
 */
function initializeTheBrainClustering() {
  try {
    console.log('🧠 Initializing TheBrain concept clustering...');
    
    // Create root thought for AI Monitor
    const rootThought = createTheBrainThought({
      name: '🎯 AI Competitive Monitor',
      type: 'root',
      notes: 'Central hub for competitive intelligence monitoring',
      color: '#667eea'
    });
    
    if (!rootThought.success) {
      return {
        success: false,
        error: 'Failed to create root thought'
      };
    }
    
    const rootId = rootThought.thoughtId;
    const createdConcepts = [];
    const conceptMap = {};
    
    // Create concept thoughts
    Object.keys(CONCEPT_TYPES).forEach(conceptKey => {
      const concept = CONCEPT_TYPES[conceptKey];
      
      const conceptThought = createTheBrainThought({
        name: concept.name,
        type: 'concept',
        notes: `Cluster for ${concept.name}`,
        color: concept.color
      });
      
      if (conceptThought.success) {
        conceptMap[conceptKey] = conceptThought.thoughtId;
        createdConcepts.push({
          key: conceptKey,
          id: conceptThought.thoughtId,
          ...concept
        });
        
        // Link to root
        linkThoughts(rootId, conceptThought.thoughtId, 'child');
      }
    });
    
    // Create cross-links between related concepts
    createConceptCrossLinks(conceptMap);
    
    // Store concept map for future use
    const props = PropertiesService.getScriptProperties();
    props.setProperty('THEBRAIN_CONCEPT_MAP', JSON.stringify(conceptMap));
    props.setProperty('THEBRAIN_ROOT_ID', rootId);
    
    return {
      success: true,
      message: 'TheBrain clustering initialized',
      rootId: rootId,
      concepts: createdConcepts,
      conceptMap: conceptMap
    };
    
  } catch (error) {
    console.error('Error initializing clustering:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Create cross-links between related concepts
 */
function createConceptCrossLinks(conceptMap) {
  // Link pricing changes to competitors
  if (conceptMap.PRICING_CHANGES && conceptMap.COMPETITORS) {
    linkThoughts(conceptMap.PRICING_CHANGES, conceptMap.COMPETITORS, 'jump');
  }
  
  // Link product launches to AI features
  if (conceptMap.PRODUCT_LAUNCHES && conceptMap.AI_FEATURES) {
    linkThoughts(conceptMap.PRODUCT_LAUNCHES, conceptMap.AI_FEATURES, 'jump');
  }
  
  // Link time-based concepts
  if (conceptMap.RECENT_CHANGES && conceptMap.THIS_WEEK) {
    linkThoughts(conceptMap.RECENT_CHANGES, conceptMap.THIS_WEEK, 'child');
  }
  
  if (conceptMap.THIS_WEEK && conceptMap.THIS_MONTH) {
    linkThoughts(conceptMap.THIS_WEEK, conceptMap.THIS_MONTH, 'child');
  }
  
  // Link alerts to monitoring
  if (conceptMap.CRITICAL_ALERTS && conceptMap.HIGH_ALERTS) {
    linkThoughts(conceptMap.CRITICAL_ALERTS, conceptMap.HIGH_ALERTS, 'sibling');
  }
}

// ========================================
// ALERTING SYSTEM WITH VISUAL CHANGES
// ========================================

/**
 * Update TheBrain thought based on change detection
 */
function updateTheBrainAlert(changeData) {
  try {
    const {
      company,
      url,
      changeType,
      magnitude,
      relevanceScore,
      previousState,
      currentState,
      keywords
    } = changeData;
    
    // Determine alert level and visual properties
    const alertLevel = calculateAlertLevel(magnitude, relevanceScore);
    const visualProps = getVisualPropertiesForAlert(alertLevel, changeType);
    
    // Create or update the company thought
    const companyThought = createOrUpdateCompanyThought(company, visualProps);
    
    // Create a change event thought
    const changeThought = createTheBrainThought({
      name: `${visualProps.emoji} ${company} - ${changeType}`,
      type: 'change',
      notes: `
Change detected at ${new Date().toISOString()}
URL: ${url}
Magnitude: ${magnitude}%
Relevance: ${relevanceScore}/10
Keywords: ${keywords.join(', ')}

Previous State:
${previousState}

Current State:
${currentState}
      `,
      color: visualProps.color
    });
    
    if (changeThought.success && companyThought.success) {
      // Link change to company
      linkThoughts(companyThought.thoughtId, changeThought.thoughtId, 'child');
      
      // Link to appropriate concept clusters
      linkToConceptClusters(changeThought.thoughtId, changeType, alertLevel);
      
      // Update company visual state
      updateCompanyVisualState(companyThought.thoughtId, visualProps);
    }
    
    return {
      success: true,
      alertLevel: alertLevel,
      visualProps: visualProps,
      companyThoughtId: companyThought.thoughtId,
      changeThoughtId: changeThought.thoughtId
    };
    
  } catch (error) {
    console.error('Error updating TheBrain alert:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Calculate alert level based on change metrics
 */
function calculateAlertLevel(magnitude, relevanceScore) {
  // Critical: High magnitude AND high relevance
  if (magnitude >= 50 && relevanceScore >= 8) {
    return 'critical';
  }
  
  // High: Moderate magnitude with high relevance OR high magnitude
  if ((magnitude >= 25 && relevanceScore >= 7) || magnitude >= 75) {
    return 'high';
  }
  
  // Medium: Moderate changes
  if (magnitude >= 10 || relevanceScore >= 5) {
    return 'medium';
  }
  
  // Low: Minor changes
  return 'low';
}

/**
 * Get visual properties based on alert level and change type
 */
function getVisualPropertiesForAlert(alertLevel, changeType) {
  const alertVisuals = {
    critical: {
      color: '#ff0000',
      emoji: '🚨',
      shape: 'star' // If TheBrain supports shapes
    },
    high: {
      color: '#ff6b6b',
      emoji: '⚠️',
      shape: 'hexagon'
    },
    medium: {
      color: '#ffa726',
      emoji: '📊',
      shape: 'circle'
    },
    low: {
      color: '#66bb6a',
      emoji: '✓',
      shape: 'circle'
    }
  };
  
  // Add change-type specific emojis
  const changeEmojis = {
    'pricing': '💰',
    'product': '🚀',
    'feature': '⚡',
    'partnership': '🤝',
    'technical': '⚙️',
    'content': '📝'
  };
  
  const visual = alertVisuals[alertLevel];
  
  // Combine alert emoji with change type emoji
  if (changeEmojis[changeType]) {
    visual.emoji = `${visual.emoji}${changeEmojis[changeType]}`;
  }
  
  return visual;
}

// ========================================
// CONCEPT SURFING AND EXPLORATION
// ========================================

/**
 * Get related concepts for a given thought
 */
function getRelatedConcepts(thoughtId) {
  try {
    // Get the thought details
    const thought = getThoughtById(thoughtId);
    
    if (!thought) {
      return {
        success: false,
        error: 'Thought not found'
      };
    }
    
    // Determine concept relationships based on content
    const relatedConcepts = [];
    const content = (thought.name + ' ' + thought.notes).toLowerCase();
    
    // Check for pricing-related content
    if (content.includes('price') || content.includes('cost') || content.includes('pricing')) {
      relatedConcepts.push({
        concept: 'PRICING_CHANGES',
        strength: 0.9
      });
    }
    
    // Check for AI/ML content
    if (content.includes('ai') || content.includes('model') || content.includes('llm') || 
        content.includes('gpt') || content.includes('claude')) {
      relatedConcepts.push({
        concept: 'AI_FEATURES',
        strength: 0.9
      });
      relatedConcepts.push({
        concept: 'AI_MODELS',
        strength: 0.8
      });
    }
    
    // Check for product/feature content
    if (content.includes('launch') || content.includes('release') || content.includes('announce')) {
      relatedConcepts.push({
        concept: 'PRODUCT_LAUNCHES',
        strength: 0.9
      });
    }
    
    // Check for partnership content
    if (content.includes('partner') || content.includes('collaboration') || content.includes('integrate')) {
      relatedConcepts.push({
        concept: 'PARTNERSHIPS',
        strength: 0.8
      });
    }
    
    // Time-based clustering
    const thoughtDate = new Date(thought.createdAt || thought.timestamp);
    const now = new Date();
    const hoursDiff = (now - thoughtDate) / (1000 * 60 * 60);
    
    if (hoursDiff <= 24) {
      relatedConcepts.push({
        concept: 'RECENT_CHANGES',
        strength: 1.0
      });
    }
    
    if (hoursDiff <= 168) { // 7 days
      relatedConcepts.push({
        concept: 'THIS_WEEK',
        strength: 0.8
      });
    }
    
    if (hoursDiff <= 720) { // 30 days
      relatedConcepts.push({
        concept: 'THIS_MONTH',
        strength: 0.6
      });
    }
    
    return {
      success: true,
      thoughtId: thoughtId,
      thought: thought,
      relatedConcepts: relatedConcepts.sort((a, b) => b.strength - a.strength),
      suggestions: generateSurfingSuggestions(relatedConcepts)
    };
    
  } catch (error) {
    console.error('Error getting related concepts:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Generate surfing suggestions based on concepts
 */
function generateSurfingSuggestions(relatedConcepts) {
  const suggestions = [];
  
  relatedConcepts.forEach(({ concept, strength }) => {
    const conceptInfo = CONCEPT_TYPES[concept];
    
    if (conceptInfo && strength >= 0.7) {
      suggestions.push({
        action: `Explore ${conceptInfo.name}`,
        concept: concept,
        reason: `Strong relationship (${Math.round(strength * 100)}%)`,
        query: generateConceptQuery(concept)
      });
    }
  });
  
  return suggestions;
}

/**
 * Generate search query for concept exploration
 */
function generateConceptQuery(concept) {
  const queries = {
    PRICING_CHANGES: 'price OR pricing OR cost OR subscription',
    PRODUCT_LAUNCHES: 'launch OR release OR announce OR introducing',
    AI_FEATURES: 'AI OR model OR LLM OR GPT OR claude',
    PARTNERSHIPS: 'partner OR collaboration OR integrate',
    TECHNICAL_UPDATES: 'update OR improve OR enhance OR fix'
  };
  
  return queries[concept] || concept.toLowerCase().replace(/_/g, ' ');
}

// ========================================
// CONFIGURATION INTERFACE IN THEBRAIN
// ========================================

/**
 * Create TheBrain configuration structure
 */
function createTheBrainConfiguration() {
  try {
    console.log('🔧 Creating TheBrain configuration interface...');
    
    // Create main configuration thought
    const configRoot = createTheBrainThought({
      name: '⚙️ Monitor Configuration',
      type: 'config',
      notes: 'Visual configuration interface for AI Competitive Monitor',
      color: '#4a90e2'
    });
    
    if (!configRoot.success) {
      return {
        success: false,
        error: 'Failed to create config root'
      };
    }
    
    // Create configuration categories
    const configCategories = {
      COMPANIES: {
        name: '🏢 Monitored Companies',
        notes: 'Configure which companies to monitor',
        color: '#667eea'
      },
      THRESHOLDS: {
        name: '📊 Alert Thresholds',
        notes: 'Set sensitivity levels for change detection',
        color: '#ffa726'
      },
      SCHEDULES: {
        name: '⏰ Monitoring Schedules',
        notes: 'Configure when and how often to check',
        color: '#66bb6a'
      },
      KEYWORDS: {
        name: '🔍 Priority Keywords',
        notes: 'Keywords that increase relevance scores',
        color: '#ff6b6b'
      },
      INTEGRATIONS: {
        name: '🔗 Integrations',
        notes: 'Configure external service connections',
        color: '#764ba2'
      }
    };
    
    const categoryIds = {};
    
    // Create category thoughts
    Object.keys(configCategories).forEach(catKey => {
      const category = configCategories[catKey];
      
      const catThought = createTheBrainThought({
        name: category.name,
        type: 'config-category',
        notes: category.notes,
        color: category.color
      });
      
      if (catThought.success) {
        categoryIds[catKey] = catThought.thoughtId;
        linkThoughts(configRoot.thoughtId, catThought.thoughtId, 'child');
      }
    });
    
    // Create company configuration thoughts
    if (categoryIds.COMPANIES) {
      createCompanyConfigThoughts(categoryIds.COMPANIES);
    }
    
    // Create threshold configuration thoughts
    if (categoryIds.THRESHOLDS) {
      createThresholdConfigThoughts(categoryIds.THRESHOLDS);
    }
    
    // Store configuration mapping
    const props = PropertiesService.getScriptProperties();
    props.setProperty('THEBRAIN_CONFIG_ROOT', configRoot.thoughtId);
    props.setProperty('THEBRAIN_CONFIG_CATEGORIES', JSON.stringify(categoryIds));
    
    return {
      success: true,
      message: 'Configuration interface created',
      configRootId: configRoot.thoughtId,
      categories: categoryIds
    };
    
  } catch (error) {
    console.error('Error creating configuration:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Create company configuration thoughts
 */
function createCompanyConfigThoughts(parentId) {
  const config = getMonitorConfigurationsMultiUrl();
  
  config.forEach(company => {
    const companyParams = getCompanyParameters(company.company);
    const params = companyParams.success ? companyParams.parameters : {};
    
    // Determine color based on priority
    const colorMap = {
      'high': '#ff6b6b',
      'normal': '#4a90e2',
      'low': '#66bb6a'
    };
    
    const companyConfigThought = createTheBrainThought({
      name: `${company.company} Settings`,
      type: 'company-config',
      notes: `
Company: ${company.company}
Type: ${company.type || 'competitor'}
URLs: ${company.urls ? company.urls.length : 0}
Priority: ${params.priority || 'normal'}
Monitoring: ${params.monitoringEnabled !== false ? 'Enabled' : 'Disabled'}
Email Alerts: ${params.enableEmailAlerts ? 'Yes' : 'No'}

Change Threshold: ${params.changeThreshold || 'inherit'}
Relevance Threshold: ${params.relevanceThreshold || 'inherit'}
Check Frequency: ${params.frequency || 'inherit'}

Custom Keywords: ${params.customKeywords ? params.customKeywords.join(', ') : 'None'}
      `,
      color: colorMap[params.priority] || '#4a90e2'
    });
    
    if (companyConfigThought.success) {
      linkThoughts(parentId, companyConfigThought.thoughtId, 'child');
      
      // Create URL thoughts for this company
      if (company.urls && Array.isArray(company.urls)) {
        company.urls.forEach((urlObj, index) => {
          const url = typeof urlObj === 'string' ? urlObj : urlObj.url;
          const urlType = typeof urlObj === 'object' ? urlObj.type : 'unknown';
          
          const urlThought = createTheBrainThought({
            name: `📎 ${urlType}: ${url.substring(0, 50)}...`,
            type: 'url-config',
            notes: `URL: ${url}\nType: ${urlType}\nIndex: ${index}`,
            color: '#888888'
          });
          
          if (urlThought.success) {
            linkThoughts(companyConfigThought.thoughtId, urlThought.thoughtId, 'child');
          }
        });
      }
    }
  });
}

/**
 * Create threshold configuration thoughts
 */
function createThresholdConfigThoughts(parentId) {
  const thresholds = [
    {
      name: '🔴 Critical Changes (50%+)',
      notes: 'Major changes that require immediate attention',
      value: 50,
      color: '#ff0000'
    },
    {
      name: '🟠 High Priority (25%+)',
      notes: 'Significant changes worth investigating',
      value: 25,
      color: '#ff6b6b'
    },
    {
      name: '🟡 Medium Priority (10%+)',
      notes: 'Notable changes to track',
      value: 10,
      color: '#ffa726'
    },
    {
      name: '🟢 Low Priority (5%+)',
      notes: 'Minor changes for awareness',
      value: 5,
      color: '#66bb6a'
    }
  ];
  
  thresholds.forEach(threshold => {
    const thresholdThought = createTheBrainThought({
      name: threshold.name,
      type: 'threshold-config',
      notes: `${threshold.notes}\n\nThreshold Value: ${threshold.value}%`,
      color: threshold.color
    });
    
    if (thresholdThought.success) {
      linkThoughts(parentId, thresholdThought.thoughtId, 'child');
    }
  });
}

// ========================================
// MAIN INTEGRATION FUNCTIONS
// ========================================

/**
 * Setup complete TheBrain enhanced integration
 */
function setupEnhancedTheBrainIntegration() {
  try {
    console.log('🚀 Setting up enhanced TheBrain integration...');
    
    const results = {
      clustering: initializeTheBrainClustering(),
      configuration: createTheBrainConfiguration()
    };
    
    // Create initial company thoughts
    const companies = getMonitorConfigurationsMultiUrl();
    const companyResults = [];
    
    companies.forEach(company => {
      const result = createOrUpdateCompanyThought(company.company, {
        color: '#4a90e2',
        emoji: '🏢'
      });
      companyResults.push(result);
    });
    
    results.companies = {
      success: true,
      created: companyResults.filter(r => r.success).length,
      total: companies.length
    };
    
    return {
      success: true,
      message: 'Enhanced TheBrain integration complete',
      results: results
    };
    
  } catch (error) {
    console.error('Error in enhanced setup:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Create or update a company thought
 */
function createOrUpdateCompanyThought(companyName, visualProps) {
  try {
    // Check if thought already exists
    const searchResult = searchTheBrain(companyName);
    
    if (searchResult.success && searchResult.results.length > 0) {
      // Update existing thought
      const existingThought = searchResult.results[0];
      
      // For now, we'll just return the existing thought
      // In a real implementation, we'd update its properties
      return {
        success: true,
        thoughtId: existingThought.id,
        updated: true
      };
    }
    
    // Create new thought
    const thought = createTheBrainThought({
      name: `${visualProps.emoji} ${companyName}`,
      type: 'company',
      notes: `Monitoring data for ${companyName}`,
      color: visualProps.color
    });
    
    if (thought.success) {
      // Link to competitors concept
      linkToConceptClusters(thought.thoughtId, 'company', 'normal');
    }
    
    return thought;
    
  } catch (error) {
    console.error('Error creating/updating company thought:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Link thought to appropriate concept clusters
 */
function linkToConceptClusters(thoughtId, type, alertLevel) {
  try {
    const props = PropertiesService.getScriptProperties();
    const conceptMapStr = props.getProperty('THEBRAIN_CONCEPT_MAP');
    
    if (!conceptMapStr) {
      console.log('Concept map not found, skipping cluster linking');
      return;
    }
    
    const conceptMap = JSON.parse(conceptMapStr);
    
    // Link based on type
    if (type === 'pricing' && conceptMap.PRICING_CHANGES) {
      linkThoughts(conceptMap.PRICING_CHANGES, thoughtId, 'child');
    }
    
    if (type === 'product' && conceptMap.PRODUCT_LAUNCHES) {
      linkThoughts(conceptMap.PRODUCT_LAUNCHES, thoughtId, 'child');
    }
    
    if (type === 'company' && conceptMap.COMPETITORS) {
      linkThoughts(conceptMap.COMPETITORS, thoughtId, 'child');
    }
    
    // Link based on alert level
    if (alertLevel === 'critical' && conceptMap.CRITICAL_ALERTS) {
      linkThoughts(conceptMap.CRITICAL_ALERTS, thoughtId, 'child');
    }
    
    if (alertLevel === 'high' && conceptMap.HIGH_ALERTS) {
      linkThoughts(conceptMap.HIGH_ALERTS, thoughtId, 'child');
    }
    
    // Always link to monitoring
    if (conceptMap.MONITORING) {
      linkThoughts(conceptMap.MONITORING, thoughtId, 'child');
    }
    
  } catch (error) {
    console.error('Error linking to clusters:', error);
  }
}

/**
 * Update company visual state based on changes
 */
function updateCompanyVisualState(thoughtId, visualProps) {
  // In the current implementation, we can't actually update visual properties
  // But we can track the state for future use
  
  const props = PropertiesService.getScriptProperties();
  const stateKey = `THEBRAIN_VISUAL_STATE_${thoughtId}`;
  
  props.setProperty(stateKey, JSON.stringify({
    ...visualProps,
    lastUpdated: new Date().toISOString()
  }));
}

/**
 * Helper function to link two thoughts
 */
function linkThoughts(thoughtA, thoughtB, relation) {
  // This is a placeholder - in real implementation would use TheBrain API
  console.log(`Linking ${thoughtA} to ${thoughtB} as ${relation}`);
  
  // Store link information
  const props = PropertiesService.getScriptProperties();
  const linkKey = `THEBRAIN_LINK_${thoughtA}_${thoughtB}`;
  
  props.setProperty(linkKey, JSON.stringify({
    from: thoughtA,
    to: thoughtB,
    relation: relation,
    createdAt: new Date().toISOString()
  }));
}

/**
 * Get thought by ID
 */
function getThoughtById(thoughtId) {
  // Simple implementation using properties
  const props = PropertiesService.getScriptProperties();
  const thoughtKey = `THEBRAIN_THOUGHT_${thoughtId}`;
  const thoughtData = props.getProperty(thoughtKey);
  
  if (thoughtData) {
    return JSON.parse(thoughtData);
  }
  
  return null;
}

// ========================================
// TEST FUNCTIONS
// ========================================

/**
 * Test the enhanced integration
 */
function testEnhancedTheBrainIntegration() {
  console.log('🧪 Testing enhanced TheBrain integration...');
  
  // Test alert system
  const testChange = {
    company: 'OpenAI',
    url: 'https://openai.com/pricing',
    changeType: 'pricing',
    magnitude: 75,
    relevanceScore: 9,
    previousState: 'GPT-4: $20/month',
    currentState: 'GPT-4: $30/month',
    keywords: ['pricing', 'increase', 'gpt-4']
  };
  
  const alertResult = updateTheBrainAlert(testChange);
  console.log('Alert result:', alertResult);
  
  // Test concept surfing
  if (alertResult.success && alertResult.changeThoughtId) {
    const concepts = getRelatedConcepts(alertResult.changeThoughtId);
    console.log('Related concepts:', concepts);
  }
  
  return {
    success: true,
    message: 'Enhanced integration tested',
    alertTest: alertResult
  };
}
