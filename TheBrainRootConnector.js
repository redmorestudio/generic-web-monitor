/**
 * Connect all orphaned thoughts to the root
 * This ensures everything is accessible from the central AI Competitive Monitor thought
 */
function connectAllToRoot() {
  try {
    console.log('🔗 Connecting all thoughts to root...');
    
    const props = PropertiesService.getScriptProperties();
    const rootId = props.getProperty('THEBRAIN_ROOT_ID');
    
    if (!rootId) {
      console.error('❌ Root thought ID not found!');
      return {
        success: false,
        error: 'Root thought not found. Run setupEnhancedTheBrainIntegration first.'
      };
    }
    
    console.log('📍 Root thought ID:', rootId);
    
    // Get all companies and ensure they're connected to root
    const companies = getMonitorConfigurationsMultiUrl();
    let connected = 0;
    let errors = 0;
    
    companies.forEach(company => {
      try {
        // Search for company thought
        const searchResult = searchTheBrain(company.company);
        
        if (searchResult.success && searchResult.results.length > 0) {
          searchResult.results.forEach(thought => {
            // Link to root if it's a company thought
            if (thought.type === 'company' || thought.name.includes(company.company)) {
              linkThoughts(rootId, thought.id, 'child');
              connected++;
              console.log(`✅ Connected ${company.company} to root`);
            }
          });
        }
      } catch (error) {
        console.error(`❌ Error connecting ${company.company}:`, error);
        errors++;
      }
    });
    
    // Also ensure concept clusters are connected
    const conceptMapStr = props.getProperty('THEBRAIN_CONCEPT_MAP');
    if (conceptMapStr) {
      const conceptMap = JSON.parse(conceptMapStr);
      Object.keys(conceptMap).forEach(conceptKey => {
        linkThoughts(rootId, conceptMap[conceptKey], 'child');
        console.log(`✅ Connected concept ${conceptKey} to root`);
      });
    }
    
    // Ensure configuration root is connected
    const configRootId = props.getProperty('THEBRAIN_CONFIG_ROOT');
    if (configRootId) {
      linkThoughts(rootId, configRootId, 'child');
      console.log('✅ Connected configuration to root');
    }
    
    return {
      success: true,
      message: `Connected ${connected} company thoughts to root. Errors: ${errors}`,
      rootId: rootId,
      connected: connected,
      errors: errors
    };
    
  } catch (error) {
    console.error('❌ Error in connectAllToRoot:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Ensure new thoughts are always connected to root
 * Enhanced version of createOrUpdateCompanyThought
 */
function createOrUpdateCompanyThoughtWithRoot(companyName, visualProps) {
  try {
    const props = PropertiesService.getScriptProperties();
    const rootId = props.getProperty('THEBRAIN_ROOT_ID');
    
    // Check if thought already exists
    const searchResult = searchTheBrain(companyName);
    
    if (searchResult.success && searchResult.results.length > 0) {
      // Update existing thought
      const existingThought = searchResult.results[0];
      
      // Ensure it's connected to root
      if (rootId) {
        linkThoughts(rootId, existingThought.id, 'child');
      }
      
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
      // Link to root first
      if (rootId) {
        linkThoughts(rootId, thought.thoughtId, 'child');
        console.log(`🔗 Connected ${companyName} to root`);
      }
      
      // Then link to concept clusters
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
 * Get the root thought info
 */
function getRootThoughtInfo() {
  try {
    const props = PropertiesService.getScriptProperties();
    const rootId = props.getProperty('THEBRAIN_ROOT_ID');
    
    if (!rootId) {
      return {
        success: false,
        error: 'Root thought not configured'
      };
    }
    
    // Get the thought data
    const thoughtData = getThoughtById(rootId);
    
    return {
      success: true,
      rootId: rootId,
      thought: thoughtData || {
        id: rootId,
        name: '🎯 AI Competitive Monitor',
        type: 'root'
      }
    };
    
  } catch (error) {
    console.error('Error getting root info:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Fix the enhanced integration to use the new function
 */
function updateTheBrainAlertWithRoot(changeData) {
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
    
    // Get root ID
    const props = PropertiesService.getScriptProperties();
    const rootId = props.getProperty('THEBRAIN_ROOT_ID');
    
    // Determine alert level and visual properties
    const alertLevel = calculateAlertLevel(magnitude, relevanceScore);
    const visualProps = getVisualPropertiesForAlert(alertLevel, changeType);
    
    // Create or update the company thought (now with root connection)
    const companyThought = createOrUpdateCompanyThoughtWithRoot(company, visualProps);
    
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
      
      // Also link change directly to root for visibility
      if (rootId && alertLevel === 'critical' || alertLevel === 'high') {
        linkThoughts(rootId, changeThought.thoughtId, 'child');
      }
      
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
      changeThoughtId: changeThought.thoughtId,
      connectedToRoot: !!rootId
    };
    
  } catch (error) {
    console.error('Error updating TheBrain alert:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}