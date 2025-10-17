// scripts/generate-dashboard-data.js
const fs = require('fs').promises;
const path = require('path');

async function generateDashboardData() {
  console.log('📊 Generating dashboard data...');
  
  try {
    // Ensure docs directory exists
    const docsDir = path.join(__dirname, '..', 'docs');
    await fs.mkdir(docsDir, { recursive: true });
    
    // Load latest analysis
    const analysisPath = path.join(__dirname, '..', 'data', 'analysis', 'latest.json');
    const analysis = JSON.parse(await fs.readFile(analysisPath, 'utf8'));
    
    // Load latest changes
    let changes = { changes: [] };
    try {
      const changesPath = path.join(__dirname, '..', 'data', 'changes', 'latest.json');
      changes = JSON.parse(await fs.readFile(changesPath, 'utf8'));
    } catch (e) {
      console.log('No changes file yet');
    }
    
    // Create dashboard data structure
    const dashboardData = {
      lastUpdated: new Date().toISOString(),
      summary: {
        totalUrls: analysis.length,
        successfulScrapes: analysis.filter(a => a.success).length,
        failedScrapes: analysis.filter(a => !a.success).length,
        highPriorityFindings: analysis.filter(a => a.aiAnalysis?.relevanceScore >= 7).length,
        recentChanges: changes.changes?.length || 0
      },
      companies: {},
      highPriorityAlerts: [],
      recentChanges: changes.changes || []
    };
    
    // Group by company
    analysis.forEach(item => {
      if (!dashboardData.companies[item.company]) {
        dashboardData.companies[item.company] = {
          name: item.company,
          urls: [],
          averageRelevance: 0,
          lastChecked: item.timestamp
        };
      }
      
      dashboardData.companies[item.company].urls.push({
        url: item.url,
        type: item.type,
        success: item.success,
        relevanceScore: item.aiAnalysis?.relevanceScore || 0,
        summary: item.aiAnalysis?.summary || 'No analysis available',
        error: item.error || null
      });
      
      // Add to high priority if relevant
      if (item.aiAnalysis?.relevanceScore >= 7) {
        dashboardData.highPriorityAlerts.push({
          company: item.company,
          url: item.url,
          type: item.type,
          relevanceScore: item.aiAnalysis.relevanceScore,
          summary: item.aiAnalysis.summary,
          threats: item.aiAnalysis.competitiveThreats,
          opportunities: item.aiAnalysis.opportunities
        });
      }
    });
    
    // Calculate average relevance per company
    Object.values(dashboardData.companies).forEach(company => {
      const scores = company.urls
        .map(u => u.relevanceScore)
        .filter(s => s > 0);
      
      company.averageRelevance = scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) / 10
        : 0;
    });
    
    // Sort high priority by relevance
    dashboardData.highPriorityAlerts.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    // Save dashboard data
    await fs.writeFile(
      path.join(docsDir, 'data.json'),
      JSON.stringify(dashboardData, null, 2)
    );
    
    // Create simple HTML dashboard if it doesn't exist
    const htmlPath = path.join(docsDir, 'index.html');
    try {
      await fs.access(htmlPath);
    } catch {
      await createDefaultDashboard(docsDir);
    }
    
    console.log('✅ Dashboard data generated at docs/data.json');
    
  } catch (error) {
    console.error('Error generating dashboard data:', error);
    process.exit(1);
  }
}

async function createDefaultDashboard(docsDir) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Competitive Intelligence Dashboard</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .header {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .summary-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            text-align: center;
        }
        .summary-card h3 {
            margin: 0;
            color: #666;
            font-size: 14px;
            font-weight: normal;
        }
        .summary-card .value {
            font-size: 32px;
            font-weight: bold;
            color: #2563eb;
            margin: 10px 0;
        }
        .alert {
            background: #fee;
            border-left: 4px solid #f44;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 4px;
        }
        .company-section {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        .relevance-score {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
        }
        .relevance-high { background: #ffd700; color: #000; }
        .relevance-medium { background: #87ceeb; color: #000; }
        .relevance-low { background: #ddd; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🤖 AI Competitive Intelligence Dashboard</h1>
        <p>Last updated: <span id="lastUpdated">Loading...</span></p>
    </div>
    
    <div id="alerts"></div>
    
    <div class="summary-grid" id="summary"></div>
    
    <div id="companies"></div>
    
    <script>
        async function loadDashboard() {
            try {
                const response = await fetch('data.json');
                const data = await response.json();
                
                // Update last updated
                document.getElementById('lastUpdated').textContent = 
                    new Date(data.lastUpdated).toLocaleString();
                
                // Show summary
                const summaryHtml = \`
                    <div class="summary-card">
                        <h3>Total URLs</h3>
                        <div class="value">\${data.summary.totalUrls}</div>
                    </div>
                    <div class="summary-card">
                        <h3>Successful</h3>
                        <div class="value">\${data.summary.successfulScrapes}</div>
                    </div>
                    <div class="summary-card">
                        <h3>High Priority</h3>
                        <div class="value">\${data.summary.highPriorityFindings}</div>
                    </div>
                    <div class="summary-card">
                        <h3>Recent Changes</h3>
                        <div class="value">\${data.summary.recentChanges}</div>
                    </div>
                \`;
                document.getElementById('summary').innerHTML = summaryHtml;
                
                // Show alerts
                if (data.highPriorityAlerts.length > 0) {
                    const alertsHtml = data.highPriorityAlerts.map(alert => \`
                        <div class="alert">
                            <strong>\${alert.company} - \${alert.type}</strong> 
                            (Relevance: \${alert.relevanceScore}/10)<br>
                            \${alert.summary}
                        </div>
                    \`).join('');
                    document.getElementById('alerts').innerHTML = alertsHtml;
                }
                
                // Show companies
                const companiesHtml = Object.values(data.companies).map(company => \`
                    <div class="company-section">
                        <h2>\${company.name}</h2>
                        <p>Average Relevance: \${company.averageRelevance}/10</p>
                        <ul>
                        \${company.urls.map(url => \`
                            <li>
                                <strong>\${url.type}</strong>: 
                                <span class="relevance-score relevance-\${
                                    url.relevanceScore >= 7 ? 'high' : 
                                    url.relevanceScore >= 4 ? 'medium' : 'low'
                                }">
                                    \${url.relevanceScore}/10
                                </span>
                                - \${url.summary || 'No summary'}
                            </li>
                        \`).join('')}
                        </ul>
                    </div>
                \`).join('');
                document.getElementById('companies').innerHTML = companiesHtml;
                
            } catch (error) {
                console.error('Error loading dashboard:', error);
                document.body.innerHTML = '<div class="alert">Error loading dashboard data</div>';
            }
        }
        
        loadDashboard();
        // Refresh every 5 minutes
        setInterval(loadDashboard, 5 * 60 * 1000);
    </script>
</body>
</html>`;
  
  await fs.writeFile(path.join(docsDir, 'index.html'), html);
  console.log('Created default dashboard HTML');
}

// Run if called directly
if (require.main === module) {
  generateDashboardData()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { generateDashboardData };
