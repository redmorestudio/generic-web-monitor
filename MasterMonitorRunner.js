/**
 * Master AI Monitor Runner with TheBrain Integration
 * Coordinates the entire monitoring and knowledge graph process
 */

// Load configurations
eval(HtmlService.createHtmlOutputFromFile('ExpandedCompanyConfig.js').getContent());
eval(HtmlService.createHtmlOutputFromFile('EnhancedClaudeIntegration.js').getContent());

/**
 * Run comprehensive monitoring with entity extraction
 */
function runComprehensiveMonitoring() {
  const startTime = new Date();
  console.log('Starting comprehensive AI monitoring with entity extraction...');
  
  // Get expanded configuration
  const monitors = getExpandedMonitorConfigurations();
  
  const results = {
    timestamp: startTime.toISOString(),
    companies: monitors.length,
    totalUrls: monitors.reduce((sum, m) => sum + m.urls.length, 0),
    changes: [],
    entities: {
      products: new Map(),
      technologies: new Map(),
      companies: new Map(),
      people: new Map(),
      partnerships: []
    },
    errors: []
  };
  
  // Process each company
  monitors.forEach((monitor, index) => {
    console.log(`Processing ${index + 1}/${monitors.length}: ${monitor.company}`);
    
    try {
      const monitorResult = processMonitorWithEntities(monitor);
      
      // Aggregate changes
      if (monitorResult.changes.length > 0) {
        results.changes.push(...monitorResult.changes);
      }
      
      // Aggregate entities
      monitorResult.entities.forEach(entitySet => {
        // Products
        if (entitySet.products) {
          entitySet.products.forEach(product => {
            const key = `${product.name}|${monitor.company}`;
            results.entities.products.set(key, {
              ...product,
              company: monitor.company,
              foundAt: entitySet.url
            });
          });
        }
        
        // Technologies
        if (entitySet.technologies) {
          entitySet.technologies.forEach(tech => {
            const key = tech.name;
            if (!results.entities.technologies.has(key)) {
              results.entities.technologies.set(key, {
                ...tech,
                usedBy: [monitor.company]
              });
            } else {
              results.entities.technologies.get(key).usedBy.push(monitor.company);
            }
          });
        }
        
        // Companies
        if (entitySet.companies) {
          entitySet.companies.forEach(company => {
            const key = company.name;
            if (!results.entities.companies.has(key)) {
              results.entities.companies.set(key, {
                ...company,
                mentionedBy: [monitor.company]
              });
            } else {
              results.entities.companies.get(key).mentionedBy.push(monitor.company);
            }
          });
        }
        
        // People
        if (entitySet.people) {
          entitySet.people.forEach(person => {
            const key = person.name;
            results.entities.people.set(key, {
              ...person,
              associatedWith: monitor.company
            });
          });
        }
        
        // Partnerships
        if (entitySet.partnerships) {
          results.entities.partnerships.push(...entitySet.partnerships);
        }
      });
      
    } catch (error) {
      console.error(`Error processing ${monitor.company}:`, error);
      results.errors.push({
        company: monitor.company,
        error: error.toString()
      });
    }
    
    // Rate limiting between companies
    if (index < monitors.length - 1) {
      Utilities.sleep(2000);
    }
  });
  
  // Generate competitive landscape report
  if (results.changes.length > 0) {
    const landscapeReport = generateCompetitiveLandscapeReport(results.changes);
    if (landscapeReport) {
      results.landscapeAnalysis = landscapeReport;
    }
  }
  
  // Convert Maps to Arrays for storage
  results.entities.products = Array.from(results.entities.products.values());
  results.entities.technologies = Array.from(results.entities.technologies.values());
  results.entities.companies = Array.from(results.entities.companies.values());
  results.entities.people = Array.from(results.entities.people.values());
  
  // Calculate processing time
  const endTime = new Date();
  results.processingTime = (endTime - startTime) / 1000;
  
  // Store results
  storeMonitoringResults(results);
  
  console.log(`Monitoring complete in ${results.processingTime}s`);
  console.log(`Changes detected: ${results.changes.length}`);
  console.log(`Entities found: Products=${results.entities.products.length}, Technologies=${results.entities.technologies.length}`);
  
  return results;
}

/**
 * Store monitoring results for TheBrain integration
 */
function storeMonitoringResults(results) {
  const props = PropertiesService.getScriptProperties();
  
  // Store main results
  props.setProperty('latestMonitoringResults', JSON.stringify({
    timestamp: results.timestamp,
    summary: {
      companies: results.companies,
      changes: results.changes.length,
      products: results.entities.products.length,
      technologies: results.entities.technologies.length,
      people: results.entities.people.length
    }
  }));
  
  // Store entities separately due to size limits
  props.setProperty('latestEntities', JSON.stringify(results.entities));
  
  // Store in spreadsheet for persistence
  const sheet = getOrCreateEntitySheet();
  if (sheet.success) {
    appendEntitiesToSheet(sheet.spreadsheet, results.entities);
  }
  
  return true;
}

/**
 * Get or create entity tracking sheet
 */
function getOrCreateEntitySheet() {
  try {
    const existingSheetId = PropertiesService.getScriptProperties().getProperty('entitySheetId');
    let ss;
    
    if (existingSheetId) {
      try {
        ss = SpreadsheetApp.openById(existingSheetId);
      } catch (e) {
        // Sheet no longer exists
      }
    }
    
    if (!ss) {
      ss = SpreadsheetApp.create('AI Monitor Entities - ' + new Date().toLocaleDateString());
      PropertiesService.getScriptProperties().setProperty('entitySheetId', ss.getId());
    }
    
    // Ensure sheets exist
    ensureEntitySheets(ss);
    
    return { success: true, spreadsheet: ss };
  } catch (error) {
    console.error('Error creating entity sheet:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Ensure all entity sheets exist
 */
function ensureEntitySheets(ss) {
  const sheets = ['Products', 'Technologies', 'Companies', 'People', 'Partnerships'];
  
  sheets.forEach(sheetName => {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      
      // Set headers based on sheet type
      const headers = getHeadersForEntityType(sheetName);
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
  });
}

/**
 * Get headers for entity type
 */
function getHeadersForEntityType(entityType) {
  const headerMap = {
    'Products': ['Name', 'Company', 'Type', 'Description', 'Features', 'Status', 'Found At', 'Timestamp'],
    'Technologies': ['Name', 'Category', 'Description', 'Used By', 'Timestamp'],
    'Companies': ['Name', 'Relationship', 'Context', 'Mentioned By', 'Timestamp'],
    'People': ['Name', 'Role', 'Context', 'Associated With', 'Timestamp'],
    'Partnerships': ['Partners', 'Type', 'Description', 'Timestamp']
  };
  
  return headerMap[entityType] || ['Data', 'Timestamp'];
}

/**
 * Append entities to sheet
 */
function appendEntitiesToSheet(ss, entities) {
  const timestamp = new Date().toISOString();
  
  // Products
  if (entities.products && entities.products.length > 0) {
    const sheet = ss.getSheetByName('Products');
    const rows = entities.products.map(p => [
      p.name,
      p.company,
      p.type || '',
      p.description || '',
      (p.features || []).join('; '),
      p.status || '',
      p.foundAt || '',
      timestamp
    ]);
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
  }
  
  // Technologies
  if (entities.technologies && entities.technologies.length > 0) {
    const sheet = ss.getSheetByName('Technologies');
    const rows = entities.technologies.map(t => [
      t.name,
      t.category || '',
      t.description || '',
      (t.usedBy || []).join(', '),
      timestamp
    ]);
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
  }
  
  // Add other entity types similarly...
}

/**
 * Prepare data for TheBrain integration
 */
function prepareDataForTheBrain() {
  const props = PropertiesService.getScriptProperties();
  const entities = JSON.parse(props.getProperty('latestEntities') || '{}');
  
  // Structure data for TheBrain
  const brainData = {
    timestamp: new Date().toISOString(),
    categories: {
      products: {
        items: entities.products || [],
        count: (entities.products || []).length
      },
      technologies: {
        items: entities.technologies || [],
        count: (entities.technologies || []).length
      },
      companies: {
        items: entities.companies || [],
        count: (entities.companies || []).length
      },
      people: {
        items: entities.people || [],
        count: (entities.people || []).length
      }
    },
    relationships: {
      companyProducts: {},
      productTechnologies: {},
      companyPartnerships: entities.partnerships || []
    }
  };
  
  // Build relationship maps
  entities.products?.forEach(product => {
    if (!brainData.relationships.companyProducts[product.company]) {
      brainData.relationships.companyProducts[product.company] = [];
    }
    brainData.relationships.companyProducts[product.company].push(product.name);
  });
  
  return brainData;
}

/**
 * Quick test with a few companies
 */
function testMonitoringWithSample() {
  // Test with just 3 companies
  const testMonitors = getExpandedMonitorConfigurations().slice(0, 3);
  
  const results = {
    timestamp: new Date().toISOString(),
    companies: testMonitors.length,
    changes: [],
    entities: {
      products: new Map(),
      technologies: new Map(),
      companies: new Map(),
      people: new Map()
    }
  };
  
  testMonitors.forEach(monitor => {
    console.log(`Testing ${monitor.company}...`);
    const monitorResult = processMonitorWithEntities(monitor);
    
    // Just log the results
    console.log(`Results for ${monitor.company}:`, {
      changes: monitorResult.changes.length,
      entities: monitorResult.entities.length,
      errors: monitorResult.errors
    });
  });
  
  return results;
}

/**
 * Main entry point - run this!
 */
function runAIMonitorAndUpdateTheBrain() {
  console.log('Starting AI Monitor with TheBrain integration...');
  
  // 1. Update to expanded configuration
  const configUpdate = upgradeToExpandedConfig();
  console.log('Configuration updated:', configUpdate.stats);
  
  // 2. Run comprehensive monitoring
  const monitoringResults = runComprehensiveMonitoring();
  
  // 3. Prepare data for TheBrain
  const brainData = prepareDataForTheBrain();
  
  console.log('Monitoring complete! Ready for TheBrain integration:', {
    products: brainData.categories.products.count,
    technologies: brainData.categories.technologies.count,
    companies: brainData.categories.companies.count
  });
  
  return {
    success: true,
    monitoringResults: monitoringResults.summary,
    brainData: brainData
  };
}
