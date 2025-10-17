#!/usr/bin/env node

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// Configuration
const dbPath = path.join(__dirname, '..', 'data', 'monitor.db');
const outputDir = path.join(__dirname, '..', 'public');

if (!fs.existsSync(dbPath)) {
  console.error('❌ Database not found. Run the system first to generate data.');
  process.exit(1);
}

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const db = new Database(dbPath, { readonly: true });

console.log('📊 Generating dashboard data...');

try {
  // Get dashboard statistics
  const stats = {
    companies: db.prepare('SELECT COUNT(*) as count FROM companies WHERE enabled = 1').get().count,
    urls: db.prepare('SELECT COUNT(*) as count FROM urls WHERE enabled = 1').get().count,
    total_snapshots: db.prepare('SELECT COUNT(*) as count FROM content_snapshots').get().count,
    total_changes: db.prepare('SELECT COUNT(*) as count FROM changes').get().count,
    recent_changes: db.prepare(`
      SELECT COUNT(*) as count FROM changes 
      WHERE created_at > datetime('now', '-24 hours')
    `).get().count,
    high_priority_alerts: db.prepare(`
      SELECT COUNT(*) as count 
      FROM changes c
      JOIN ai_analysis aa ON aa.change_id = c.id
      WHERE aa.relevance_score >= 7
      AND c.created_at > datetime('now', '-24 hours')
    `).get().count,
    last_updated: new Date().toISOString()
  };

  // Get recent high-priority changes
  const recentAlerts = db.prepare(`
    SELECT 
      c.id,
      c.created_at,
      c.change_percentage,
      u.url,
      u.type as url_type,
      comp.name as company_name,
      comp.type as company_type,
      cs_new.title as page_title,
      aa.relevance_score,
      aa.summary,
      aa.category,
      aa.competitive_threats,
      aa.strategic_opportunities
    FROM changes c
    JOIN urls u ON c.url_id = u.id
    JOIN companies comp ON u.company_id = comp.id
    JOIN content_snapshots cs_new ON c.new_snapshot_id = cs_new.id
    JOIN ai_analysis aa ON aa.change_id = c.id
    WHERE aa.relevance_score >= 7
    AND c.created_at > datetime('now', '-7 days')
    ORDER BY aa.relevance_score DESC, c.created_at DESC
    LIMIT 20
  `).all();

  // Get company activity summary
  const companyActivity = db.prepare(`
    SELECT 
      comp.id,
      comp.name,
      comp.type,
      comp.enabled,
      COUNT(DISTINCT u.id) as url_count,
      COUNT(DISTINCT c.id) as change_count_7d,
      COUNT(DISTINCT CASE WHEN aa.relevance_score >= 7 THEN c.id END) as high_priority_count_7d,
      AVG(aa.relevance_score) as avg_relevance_score,
      MAX(c.created_at) as last_change_detected
    FROM companies comp
    LEFT JOIN urls u ON comp.id = u.company_id
    LEFT JOIN changes c ON u.id = c.url_id AND c.created_at > datetime('now', '-7 days')
    LEFT JOIN ai_analysis aa ON c.id = aa.change_id
    WHERE comp.enabled = 1
    GROUP BY comp.id
    ORDER BY high_priority_count_7d DESC, change_count_7d DESC
  `).all();

  // Get change timeline (hourly for last 24 hours)
  const changeTimeline = db.prepare(`
    SELECT 
      strftime('%Y-%m-%d %H:00', created_at) as hour,
      COUNT(*) as change_count,
      COUNT(CASE WHEN aa.relevance_score >= 7 THEN 1 END) as high_priority_count
    FROM changes c
    LEFT JOIN ai_analysis aa ON c.id = aa.change_id
    WHERE c.created_at > datetime('now', '-24 hours')
    GROUP BY hour
    ORDER BY hour
  `).all();

  // Get category distribution
  const categoryDistribution = db.prepare(`
    SELECT 
      aa.category,
      COUNT(*) as count,
      AVG(aa.relevance_score) as avg_score
    FROM ai_analysis aa
    JOIN changes c ON aa.change_id = c.id
    WHERE c.created_at > datetime('now', '-30 days')
    AND aa.category IS NOT NULL
    GROUP BY aa.category
    ORDER BY count DESC
  `).all();

  // Get all configured companies with their URLs
  const allCompanies = db.prepare(`
    SELECT 
      c.id,
      c.name,
      c.type,
      c.enabled,
      json_group_array(
        json_object(
          'id', u.id,
          'url', u.url,
          'type', u.type,
          'enabled', u.enabled,
          'keywords', u.keywords
        )
      ) as urls
    FROM companies c
    LEFT JOIN urls u ON c.id = u.company_id
    GROUP BY c.id
    ORDER BY c.name
  `).all();

  // Parse the JSON arrays
  allCompanies.forEach(company => {
    company.urls = JSON.parse(company.urls).filter(u => u.id !== null);
  });

  // Create dashboard data object
  const dashboardData = {
    stats,
    recentAlerts,
    companyActivity,
    changeTimeline,
    categoryDistribution,
    allCompanies,
    generated_at: new Date().toISOString()
  };

  // Write dashboard data
  fs.writeFileSync(
    path.join(outputDir, 'dashboard-data.json'),
    JSON.stringify(dashboardData, null, 2)
  );

  console.log('✅ Dashboard data generated successfully!');
  console.log(`📁 Output: ${outputDir}/dashboard-data.json`);

  // Generate a simple HTML dashboard (optional)
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Competitive Intelligence Monitor - Dashboard</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: #f5f5f5;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        h1 {
            color: #333;
            margin-bottom: 30px;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .stat-value {
            font-size: 2em;
            font-weight: bold;
            color: #007bff;
        }
        .stat-label {
            color: #666;
            margin-top: 5px;
        }
        .alert-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 15px;
        }
        .alert-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        .company-name {
            font-weight: bold;
            font-size: 1.1em;
        }
        .relevance-score {
            background: #dc3545;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.9em;
        }
        .alert-summary {
            color: #333;
            margin-bottom: 10px;
        }
        .alert-meta {
            color: #666;
            font-size: 0.9em;
        }
        .section {
            margin-bottom: 40px;
        }
        .updated {
            text-align: center;
            color: #666;
            margin-top: 40px;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>AI Competitive Intelligence Monitor</h1>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">${stats.companies}</div>
                <div class="stat-label">Active Companies</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.urls}</div>
                <div class="stat-label">Monitored URLs</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.recent_changes}</div>
                <div class="stat-label">Changes (24h)</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.high_priority_alerts}</div>
                <div class="stat-label">High Priority (24h)</div>
            </div>
        </div>

        <div class="section">
            <h2>Recent High Priority Alerts</h2>
            ${recentAlerts.map(alert => `
                <div class="alert-card">
                    <div class="alert-header">
                        <div class="company-name">${alert.company_name}</div>
                        <div class="relevance-score">${alert.relevance_score}/10</div>
                    </div>
                    <div class="alert-summary">${alert.summary}</div>
                    <div class="alert-meta">
                        ${alert.category} • ${alert.url_type} • ${new Date(alert.created_at).toLocaleString()}
                    </div>
                </div>
            `).join('')}
        </div>

        <div class="updated">
            Last updated: ${new Date().toLocaleString()}
        </div>
    </div>

    <script>
        // Auto-refresh every 5 minutes
        setTimeout(() => location.reload(), 5 * 60 * 1000);
    </script>
</body>
</html>`;

  fs.writeFileSync(
    path.join(outputDir, 'index.html'),
    htmlContent
  );

  console.log(`📄 HTML dashboard: ${outputDir}/index.html`);

} catch (error) {
  console.error('❌ Error generating dashboard:', error.message);
  process.exit(1);
} finally {
  db.close();
}
