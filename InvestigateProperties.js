/**
 * Investigate and clean up TheBrain properties
 */
function listAllScriptProperties() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const allProps = scriptProperties.getProperties();
  
  console.log('Total properties:', Object.keys(allProps).length);
  
  // Count TheBrain-related properties
  const theBrainProps = Object.keys(allProps).filter(key => 
    key.toLowerCase().includes('thebrain') || 
    key.toLowerCase().includes('thought')
  );
  
  console.log('TheBrain-related properties:', theBrainProps.length);
  
  // Show first 10 TheBrain properties
  console.log('\nFirst 10 TheBrain properties:');
  theBrainProps.slice(0, 10).forEach(key => {
    console.log(`- ${key}: ${allProps[key].substring(0, 50)}...`);
  });
  
  // Show all non-TheBrain properties
  console.log('\nNon-TheBrain properties:');
  Object.keys(allProps).forEach(key => {
    if (!key.toLowerCase().includes('thebrain') && !key.toLowerCase().includes('thought')) {
      console.log(`- ${key}: ${allProps[key]}`);
    }
  });
  
  return {
    totalProperties: Object.keys(allProps).length,
    theBrainProperties: theBrainProps.length,
    otherProperties: Object.keys(allProps).length - theBrainProps.length,
    sampleTheBrainKeys: theBrainProps.slice(0, 10)
  };
}

/**
 * Clean up TheBrain properties by consolidating them
 */
function consolidateTheBrainProperties() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const allProps = scriptProperties.getProperties();
  
  // Collect all TheBrain mappings
  const theBrainMappings = {};
  const propsToDelete = [];
  
  Object.keys(allProps).forEach(key => {
    if (key.startsWith('thebrain_')) {
      // Extract the company/url from the key
      const mappingKey = key.replace('thebrain_', '');
      theBrainMappings[mappingKey] = allProps[key];
      propsToDelete.push(key);
    }
  });
  
  console.log(`Found ${Object.keys(theBrainMappings).length} TheBrain mappings to consolidate`);
  
  // Store as a single JSON property
  if (Object.keys(theBrainMappings).length > 0) {
    scriptProperties.setProperty('THEBRAIN_MAPPINGS', JSON.stringify(theBrainMappings));
    console.log('Stored consolidated mappings in THEBRAIN_MAPPINGS');
    
    // Delete individual properties
    console.log(`Deleting ${propsToDelete.length} individual properties...`);
    propsToDelete.forEach(key => {
      scriptProperties.deleteProperty(key);
    });
    
    console.log('Cleanup complete!');
  }
  
  return {
    consolidated: Object.keys(theBrainMappings).length,
    deleted: propsToDelete.length,
    remaining: scriptProperties.getProperties()
  };
}

/**
 * Get a clean list of important properties only
 */
function getImportantProperties() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const allProps = scriptProperties.getProperties();
  
  const importantKeys = [
    'CLAUDE_API_KEY',
    'EMAIL_RECIPIENT',
    'THEBRAIN_API_KEY',
    'BASELINE_COMPLETED',
    'THEBRAIN_MAPPINGS'
  ];
  
  const importantProps = {};
  importantKeys.forEach(key => {
    if (allProps[key]) {
      importantProps[key] = allProps[key];
    }
  });
  
  console.log('Important properties:');
  Object.keys(importantProps).forEach(key => {
    const value = key.includes('KEY') ? '***HIDDEN***' : importantProps[key];
    console.log(`${key}: ${value}`);
  });
  
  return importantProps;
}
