// PostgreSQL Data Compatibility Patch for 3D Force Graph
// This patch ONLY adds support for dashboard.json format
// It does NOT change any UI, controls, or visual features

// Insert this code after line 825 in the data loading section
// This adds support for PostgreSQL dashboard.json format while keeping everything else intact

function addPostgreSQLCompatibility() {
    // Find the loadData function and add this after fetching dashboard.json
    
    // After the existing data loading (around line 859), add:
    
    // Check if we have PostgreSQL format data (dashboard.json)
    if (dashboardData && dashboardData.companies) {
        console.log('Detected PostgreSQL format data');
        
        // Transform PostgreSQL format to match existing code expectations
        dashboardData.companies.forEach(company => {
            // Find or create the company in the existing structure
            let companyEntry = rawData.dashboard.company_activity.find(c => c.company === company.name);
            
            if (!companyEntry) {
                companyEntry = {
                    id: company.id,
                    company: company.name,
                    type: company.category || 'Other',
                    entity_type: company.category || 'Other',
                    url_count: company.urls ? company.urls.length : 0,
                    recent_changes: company.stats ? company.stats.totalChanges : 0,
                    high_interest_changes: company.stats ? company.stats.highInterestChanges : 0,
                    intelligence: {
                        interest_level: Math.max(1, (company.stats ? company.stats.highInterestChanges : 0) || 1),
                        ai_technologies: [],
                        ai_ml_concepts: [],
                        products: []
                    }
                };
                rawData.dashboard.company_activity.push(companyEntry);
            }
            
            // Update intelligence data if available
            if (company.intelligence) {
                // Handle both field names for technologies
                if (company.intelligence.ai_technologies || company.intelligence.technologies) {
                    companyEntry.intelligence.ai_technologies = company.intelligence.ai_technologies || company.intelligence.technologies || [];
                }
                
                // Handle concepts
                if (company.intelligence.ai_ml_concepts) {
                    companyEntry.intelligence.ai_ml_concepts = company.intelligence.ai_ml_concepts || [];
                }
                
                // Handle products
                if (company.intelligence.products) {
                    companyEntry.intelligence.products = company.intelligence.products || [];
                }
            }
        });
    }
}

// This is the ONLY change needed - everything else stays exactly as it was
