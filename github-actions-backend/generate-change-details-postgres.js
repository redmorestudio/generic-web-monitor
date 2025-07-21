#!/usr/bin/env node

// SSL Certificate fix for Heroku PostgreSQL
if (process.env.NODE_ENV === 'production' || process.env.POSTGRES_CONNECTION_STRING) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const path = require('path');
const fs = require('fs');
const { db, end } = require('./postgres-db');
const TurndownService = require('turndown');

// Initialize Turndown for HTML to Markdown conversion
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced'
});

// Output directory for change details
const outputDir = path.join(__dirname, '..', 'api-data', 'changes');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('📝 Generating static change detail files (PostgreSQL)...');

async function generateChangeDetails() {
  try {
    // Get all recent changes with enhanced analysis
    const changes = await db.manyOrNone(`
      SELECT 
        c.id,
        c.company,
        c.url,
        c.detected_at,
        c.change_type,
        c.before_content,
        c.after_content,
        c.analysis,
        c.interest_level,
        c.ai_confidence,
        c.markdown_before,
        c.markdown_after,
        ea.ultra_analysis,
        ea.key_insights,
        ea.business_impact,
        ea.competitive_implications,
        ea.market_signals,
        ea.risk_assessment,
        ea.opportunity_score
      FROM intelligence.changes c
      LEFT JOIN intelligence.enhanced_analysis ea ON ea.change_id = c.id
      ORDER BY c.detected_at DESC
      LIMIT 100
    `);

    console.log(`📋 Found ${changes.length} changes to generate details for`);

    let generated = 0;
    let failed = 0;

    for (const change of changes) {
      try {
        // Parse JSON fields
        const analysis = typeof change.analysis === 'string' ? 
          JSON.parse(change.analysis) : change.analysis;
        
        const ultraAnalysis = change.ultra_analysis && typeof change.ultra_analysis === 'string' ? 
          JSON.parse(change.ultra_analysis) : change.ultra_analysis;

        // Create detailed change object
        const changeDetail = {
          id: change.id,
          company: change.company,
          url: change.url,
          detected_at: change.detected_at,
          change_type: change.change_type,
          interest_level: change.interest_level,
          ai_confidence: change.ai_confidence,
          
          // Basic analysis
          summary: analysis?.what_changed || 'Content changed',
          change_scale: analysis?.change_scale || 'unknown',
          specific_changes: analysis?.specific_changes || [],
          
          // Enhanced analysis
          business_impact: change.business_impact,
          competitive_implications: change.competitive_implications,
          key_insights: change.key_insights || [],
          market_signals: change.market_signals || [],
          risk_assessment: change.risk_assessment,
          opportunity_score: change.opportunity_score,
          
          // Entities from ultra analysis
          entities: ultraAnalysis?.entities || {},
          strategic_analysis: ultraAnalysis?.strategic_analysis || {},
          insights: ultraAnalysis?.insights || {},
          
          // Content comparison (truncated for file size)
          before_preview: change.markdown_before?.substring(0, 500) || '',
          after_preview: change.markdown_after?.substring(0, 500) || '',
          
          // Metadata
          generated_at: new Date().toISOString()
        };

        // Generate filename based on company and timestamp
        const timestamp = new Date(change.detected_at).getTime();
        const filename = `${change.company.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${timestamp}.json`;
        const filepath = path.join(outputDir, filename);
        
        // Write JSON file
        fs.writeFileSync(filepath, JSON.stringify(changeDetail, null, 2));
        
        generated++;
        
        // Also generate an HTML preview file
        const htmlContent = generateHTMLPreview(changeDetail);
        const htmlFilepath = filepath.replace('.json', '.html');
        fs.writeFileSync(htmlFilepath, htmlContent);
        
      } catch (error) {
        console.error(`❌ Failed to generate details for change ${change.id}:`, error.message);
        failed++;
      }
    }

    console.log(`\n✅ Generated ${generated} change detail files`);
    if (failed > 0) {
      console.log(`❌ Failed to generate ${failed} files`);
    }

    // Generate index file
    await generateChangeIndex();

  } catch (error) {
    console.error('❌ Fatal error generating change details:', error);
    throw error;
  }
}

function generateHTMLPreview(change) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${change.company} - Change Details</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .header {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .company-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .metadata {
            color: #666;
            font-size: 14px;
        }
        .interest-level {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 4px;
            font-weight: bold;
            margin-left: 10px;
        }
        .interest-high { background: #fee; color: #c00; }
        .interest-medium { background: #ffeaa7; color: #d68910; }
        .interest-low { background: #e8f5e9; color: #2e7d32; }
        .section {
            background: white;
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .section-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #333;
        }
        .content-comparison {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        .content-box {
            padding: 15px;
            background: #f8f8f8;
            border-radius: 4px;
            font-family: monospace;
            font-size: 12px;
            overflow-x: auto;
        }
        .insights-list {
            list-style: none;
            padding: 0;
        }
        .insights-list li {
            padding: 8px 0;
            border-bottom: 1px solid #eee;
        }
        .insights-list li:last-child {
            border-bottom: none;
        }
        .tag {
            display: inline-block;
            padding: 2px 8px;
            background: #e3f2fd;
            color: #1976d2;
            border-radius: 3px;
            font-size: 12px;
            margin-right: 5px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">${change.company}</div>
        <div class="metadata">
            <span>${new Date(change.detected_at).toLocaleDateString()}</span>
            <span class="interest-level interest-${change.interest_level >= 7 ? 'high' : change.interest_level >= 5 ? 'medium' : 'low'}">
                Interest: ${change.interest_level}/10
            </span>
            <span style="margin-left: 10px;">Type: ${change.change_type}</span>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Change Summary</div>
        <p>${change.summary}</p>
        ${change.specific_changes.length > 0 ? `
        <ul>
            ${change.specific_changes.map(c => `<li>${c}</li>`).join('')}
        </ul>
        ` : ''}
    </div>

    ${change.business_impact ? `
    <div class="section">
        <div class="section-title">Business Impact</div>
        <p>${change.business_impact}</p>
    </div>
    ` : ''}

    ${change.key_insights.length > 0 ? `
    <div class="section">
        <div class="section-title">Key Insights</div>
        <ul class="insights-list">
            ${change.key_insights.map(insight => `<li>${insight}</li>`).join('')}
        </ul>
    </div>
    ` : ''}

    <div class="section">
        <div class="section-title">Content Preview</div>
        <div class="content-comparison">
            <div>
                <strong>Before:</strong>
                <div class="content-box">${change.before_preview || '[No previous content]'}</div>
            </div>
            <div>
                <strong>After:</strong>
                <div class="content-box">${change.after_preview}</div>
            </div>
        </div>
    </div>

    ${Object.keys(change.entities).some(key => change.entities[key].length > 0) ? `
    <div class="section">
        <div class="section-title">Entities Detected</div>
        ${Object.entries(change.entities).map(([type, items]) => 
          items.length > 0 ? `
            <div style="margin-bottom: 10px;">
                <strong>${type}:</strong>
                ${items.map(item => `<span class="tag">${item}</span>`).join('')}
            </div>
          ` : ''
        ).join('')}
    </div>
    ` : ''}
</body>
</html>`;
}

async function generateChangeIndex() {
  console.log('\n📋 Generating change index...');
  
  try {
    // Get summary of all changes
    const summary = await db.one(`
      SELECT 
        COUNT(*) as total_changes,
        COUNT(CASE WHEN interest_level >= 7 THEN 1 END) as high_interest,
        COUNT(CASE WHEN interest_level >= 5 THEN 1 END) as medium_plus,
        MAX(detected_at) as last_change
      FROM intelligence.changes
    `);

    // Get recent high-interest changes
    const recentChanges = await db.manyOrNone(`
      SELECT 
        id,
        company,
        url,
        detected_at,
        interest_level,
        analysis
      FROM intelligence.changes
      WHERE interest_level >= 5
      ORDER BY detected_at DESC
      LIMIT 50
    `);

    const index = {
      generated_at: new Date().toISOString(),
      summary: {
        total_changes: parseInt(summary.total_changes),
        high_interest: parseInt(summary.high_interest),
        medium_plus: parseInt(summary.medium_plus),
        last_change: summary.last_change
      },
      recent_changes: recentChanges.map(change => ({
        id: change.id,
        company: change.company,
        url: change.url,
        detected_at: change.detected_at,
        interest_level: change.interest_level,
        filename: `${change.company.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${new Date(change.detected_at).getTime()}.json`
      }))
    };

    const indexPath = path.join(outputDir, 'index.json');
    fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
    
    console.log('✅ Change index generated');
    
  } catch (error) {
    console.error('❌ Failed to generate index:', error);
  }
}

// Run if called directly
if (require.main === module) {
  generateChangeDetails()
    .then(() => {
      console.log('\n✅ Change detail generation complete!');
      console.log(`📁 Files saved to: ${outputDir}`);
      
      // Clean up database connection
      end();
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Generation failed:', error.message);
      
      // Clean up database connection even on error
      end();
      process.exit(1);
    });
}

module.exports = {
  generateChangeDetails,
  generateHTMLPreview,
  generateChangeIndex
};
