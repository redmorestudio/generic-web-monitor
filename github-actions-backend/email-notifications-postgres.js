const nodemailer = require('nodemailer');
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

// Only load dotenv in development (not in GitHub Actions)
if (!process.env.GITHUB_ACTIONS && !process.env.DATABASE_URL) {
  try {
    require('dotenv').config();
  } catch (e) {
    // dotenv not available or no .env file - this is fine
  }
}

class PostgresEmailNotificationService {
  constructor() {
    // Initialize PostgreSQL connection
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    
    // Check if email is configured
    this.isConfigured = !!(
      process.env.SMTP_HOST && 
      process.env.SMTP_USER && 
      process.env.SMTP_PASS
    );

    // Test mode - write emails to files instead of sending
    this.testMode = process.env.EMAIL_TEST_MODE === 'true' || process.argv.includes('--test-mode');
    
    // Default recipient
    this.recipient = process.env.EMAIL_TO || process.env.NOTIFICATION_EMAIL || process.env.SMTP_USER || 'seth@redmore.studio';
    this.fromEmail = process.env.EMAIL_FROM || process.env.SMTP_USER || 'ai-monitor@redmore.studio';
    
    if (this.isConfigured && !this.testMode) {
      // Create transporter
      this.transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: false, // Use TLS, not SSL
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },
        tls: {
          // do not fail on invalid certs
          rejectUnauthorized: false
        }
      });
    }
  }

  // Close database connection
  async close() {
    await this.pool.end();
  }

  // Save email to file in test mode
  async saveTestEmail(subject, html) {
    const testDir = path.join(__dirname, 'test-emails');
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${timestamp}-${subject.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.html`;
    const filepath = path.join(testDir, filename);
    
    const fullHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>${subject}</title>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
    .alert { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; margin: 20px 0; }
    .score { font-weight: bold; color: #d9534f; }
    .metric { background-color: #f0f0f0; padding: 5px 10px; border-radius: 3px; margin: 2px; display: inline-block; }
  </style>
</head>
<body>
  <div style="background: #f5f5f5; padding: 10px; margin-bottom: 20px;">
    <strong>TEST MODE EMAIL</strong><br>
    To: ${this.recipient}<br>
    From: ${this.fromEmail}<br>
    Subject: ${subject}<br>
    Date: ${new Date().toLocaleString()}
  </div>
  ${html}
</body>
</html>`;
    
    fs.writeFileSync(filepath, fullHtml);
    console.log(`📧 Test email saved to: ${filepath}`);
    return filepath;
  }

  // Send or save email based on mode with proper error handling
  async sendEmail(mailOptions) {
    try {
      if (this.testMode) {
        const result = await this.saveTestEmail(mailOptions.subject, mailOptions.html);
        console.log('✅ Test email saved successfully');
        return result;
      } else if (this.isConfigured) {
        const info = await this.transporter.sendMail(mailOptions);
        console.log('✅ Email sent:', info.messageId);
        return info;
      } else {
        const error = new Error('Email not configured and not in test mode');
        console.error('❌', error.message);
        throw error;
      }
    } catch (error) {
      console.error('❌ Failed to send email:', error.message);
      throw error; // Re-throw to be handled by caller
    }
  }

  // Send daily digest with changes and insights
  async sendDailyDigest() {
    try {
      // Get changes from the last 24 hours
      const recentChangesResult = await this.pool.query(`
        SELECT 
          cd.id,
          cd.url,
          cd.change_type,
          cd.summary as change_summary,
          cd.interest_level,
          cd.detected_at as created_at,
          sp.company as company_name,
          sp.content as markdown_content
        FROM processed_content.change_detection cd
        JOIN raw_content.scraped_pages sp ON cd.url = sp.url
          AND cd.new_hash = sp.content_hash
        WHERE cd.detected_at > NOW() - INTERVAL '24 hours'
        ORDER BY cd.interest_level DESC, cd.detected_at DESC
      `);
      const recentChanges = recentChangesResult.rows;

      // Get AI analysis for these changes
      const changeIds = recentChanges.map(c => c.id);
      const aiAnalyses = {};
      
      if (changeIds.length > 0) {
        const analysesResult = await this.pool.query(`
          SELECT * FROM intelligence.baseline_analysis 
          WHERE url IN (SELECT url FROM processed_content.change_detection WHERE id = ANY($1))
        `, [changeIds]);
        
        analysesResult.rows.forEach(a => {
          aiAnalyses[a.url] = a;
        });
      }

      // Get company information for URLs
      const urlCompanyMap = {};
      const urls = [...new Set(recentChanges.map(c => c.url))];
      
      if (urls.length > 0) {
        const companiesResult = await this.pool.query(`
          SELECT u.url, c.name as company_name, c.category
          FROM intelligence.urls u
          JOIN intelligence.companies c ON u.company_id = c.id
          WHERE u.url = ANY($1)
        `, [urls]);
        
        companiesResult.rows.forEach(c => {
          urlCompanyMap[c.url] = c;
        });
      }

      // Get monitoring statistics
      const statsResult = await this.pool.query(`
        SELECT 
          (SELECT COUNT(*) FROM intelligence.companies) as total_companies,
          (SELECT COUNT(*) FROM intelligence.urls) as total_urls,
          (SELECT COUNT(*) FROM raw_content.scraped_pages) as total_snapshots,
          (SELECT COUNT(*) FROM processed_content.change_detection) as total_changes,
          (SELECT COUNT(*) FROM processed_content.change_detection 
           WHERE detected_at > NOW() - INTERVAL '24 hours') as changes_last_24h,
          (SELECT COUNT(*) FROM processed_content.change_detection 
           WHERE detected_at > NOW() - INTERVAL '24 hours' AND interest_level >= 8) as high_priority_changes
      `);
      const stats = statsResult.rows[0];

      // Build email content
      let html = `
        <h2>🤖 AI Competitive Monitor - Daily Digest</h2>
        <p><strong>${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong></p>
        
        <h3>📊 24-Hour Summary</h3>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px;">
          <span class="metric">🏢 ${stats.total_companies} Companies</span>
          <span class="metric">🔗 ${stats.total_urls} URLs</span>
          <span class="metric">📸 ${stats.total_snapshots} Snapshots</span>
          <span class="metric">🔄 ${stats.changes_last_24h} Changes (24h)</span>
          <span class="metric">🚨 ${stats.high_priority_changes} High Priority</span>
        </div>
      `;

      if (recentChanges.length === 0) {
        html += `
          <p style="padding: 20px; text-align: center; color: #666;">
            <em>No changes detected in the last 24 hours. All monitored sites remain stable.</em>
          </p>
        `;
      } else {
        // Group changes by interest level
        const criticalChanges = recentChanges.filter(c => c.interest_level >= 9);
        const highChanges = recentChanges.filter(c => c.interest_level >= 7 && c.interest_level < 9);
        const mediumChanges = recentChanges.filter(c => c.interest_level >= 5 && c.interest_level < 7);
        const lowChanges = recentChanges.filter(c => c.interest_level < 5);

        // Critical changes (9-10)
        if (criticalChanges.length > 0) {
          html += '<p style="color: #d9534f; font-weight: bold; margin: 15px 0;">🚨 GitHub issues have been automatically created for these critical changes.</p>';
          html += `
            <div class="alert">
              <h3>🚨 Critical Changes Requiring Immediate Attention</h3>
              <p>The following changes have been identified as critically important to your competitive position:</p>
            </div>
          `;
          html += this.formatChangesTable(criticalChanges, aiAnalyses, urlCompanyMap, true);
        }

        // High priority changes (7-8)
        if (highChanges.length > 0) {
          html += `<h3>⚠️ High Priority Changes</h3>`;
          html += this.formatChangesTable(highChanges, aiAnalyses, urlCompanyMap);
        }

        // Medium priority changes (5-6)
        if (mediumChanges.length > 0) {
          html += `<h3>📍 Notable Changes</h3>`;
          html += this.formatChangesTable(mediumChanges, aiAnalyses, urlCompanyMap);
        }

        // Low priority changes (0-4)
        if (lowChanges.length > 0) {
          html += `
            <details>
              <summary style="cursor: pointer; padding: 10px; background: #f0f0f0;">
                📝 Other Changes (${lowChanges.length} items)
              </summary>
              ${this.formatChangesTable(lowChanges, aiAnalyses, urlCompanyMap)}
            </details>
          `;
        }

        // Extract key insights from AI analyses
        const insights = this.extractKeyInsights(recentChanges, aiAnalyses);
        if (insights.length > 0) {
          html += `
            <h3>💡 Key Insights</h3>
            <ul>
          `;
          insights.forEach(insight => {
            html += `<li>${insight}</li>`;
          });
          html += `</ul>`;
        }
      }

      html += `
        <hr>
        <p style="text-align: center; margin-top: 30px;">
          <a href="https://redmorestudio.github.io/ai-competitive-monitor/" 
             style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            View Full Dashboard
          </a>
        </p>
        
        <p style="font-size: 0.9em; color: #666; text-align: center;">
          AI Competitive Intelligence Monitor (PostgreSQL)<br>
          <a href="https://github.com/redmorestudio/ai-competitive-monitor">GitHub Repository</a>
        </p>
      `;

      // Send email
      await this.sendEmail({
        from: `"AI Monitor" <${this.fromEmail}>`,
        to: this.recipient,
        subject: `📊 AI Monitor Daily Digest - ${stats.changes_last_24h} changes detected`,
        html: html
      });

      return true;
    } catch (error) {
      console.error('Failed to send daily digest:', error);
      return false;
    }
  }

  // Format changes into an HTML table
  formatChangesTable(changes, aiAnalyses, urlCompanyMap, detailed = false) {
    let html = `
      <table>
        <tr>
          <th>Time</th>
          <th>Company</th>
          <th>Score</th>
          <th>Type</th>
          <th>Summary</th>
    `;
    
    if (detailed) {
      html += `<th>Intelligence</th>`;
    }
    
    html += `</tr>`;

    for (const change of changes) {
      const company = urlCompanyMap[change.url] || { company_name: change.company_name || 'Unknown', category: 'Unknown' };
      const analysis = aiAnalyses[change.url];
      const time = new Date(change.created_at).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      html += `
        <tr>
          <td>${time}</td>
          <td>
            <strong>${company.company_name}</strong><br>
            <small style="color: #666;">${company.category}</small>
          </td>
          <td class="score">${change.interest_level}/10</td>
          <td>${change.change_type || 'Update'}</td>
          <td>${change.change_summary || 'Content changed'}</td>
      `;
      
      if (detailed && analysis) {
        html += `
          <td style="font-size: 0.9em;">
        `;
        
        // Handle JSONB fields
        if (analysis.key_insights) {
          const insights = typeof analysis.key_insights === 'string' ? 
            JSON.parse(analysis.key_insights) : analysis.key_insights;
          if (insights && insights.length) {
            html += `<p><strong>Insights:</strong> ${insights.join(', ')}</p>`;
          }
        }
        
        if (analysis.main_message) {
          html += `<p><strong>Main Message:</strong> ${analysis.main_message}</p>`;
        }
        
        html += `</td>`;
      }
      
      html += `</tr>`;
    }

    html += `</table>`;
    return html;
  }

  // Extract key insights from AI analyses
  extractKeyInsights(changes, aiAnalyses) {
    const insights = [];
    const companiesWithHighActivity = {};
    const significantCategories = {};

    changes.forEach(change => {
      const analysis = aiAnalyses[change.url];
      if (!analysis) return;

      // Count high-activity companies
      if (change.interest_level >= 7) {
        const company = change.company_name || 'Unknown';
        companiesWithHighActivity[company] = (companiesWithHighActivity[company] || 0) + 1;
      }

      // Track significant categories (from URL company mapping)
      if (change.interest_level >= 7) {
        // Categories would come from company data
        const category = 'AI'; // Placeholder - would get from company data
        significantCategories[category] = (significantCategories[category] || 0) + 1;
      }
    });

    // Generate insights
    Object.entries(companiesWithHighActivity).forEach(([company, count]) => {
      if (count >= 2) {
        insights.push(`${company} shows high activity with ${count} significant changes`);
      }
    });

    Object.entries(significantCategories).forEach(([category, count]) => {
      if (count >= 3) {
        insights.push(`Increased activity in ${category} category (${count} high-priority changes)`);
      }
    });

    return insights;
  }

  // Send high-priority alert for critical changes
  async sendHighPriorityAlert(changes) {
    try {
      // Get detailed information for each change
      const enrichedChanges = [];
      
      for (const change of changes) {
        // Get company info
        const companyResult = await this.pool.query(`
          SELECT c.name, c.category, u.url_type
          FROM intelligence.urls u
          JOIN intelligence.companies c ON u.company_id = c.id
          WHERE u.url = $1
        `, [change.url]);
        const companyInfo = companyResult.rows[0];

        // Get AI analysis
        const analysisResult = await this.pool.query(`
          SELECT * FROM intelligence.baseline_analysis
          WHERE url = $1
          ORDER BY analyzed_at DESC
          LIMIT 1
        `, [change.url]);
        const analysis = analysisResult.rows[0];

        enrichedChanges.push({
          ...change,
          company_name: companyInfo?.name || change.company_name || 'Unknown',
          company_category: companyInfo?.category || 'Unknown',
          url_type: companyInfo?.url_type || 'Unknown',
          analysis: analysis
        });
      }

      let html = `
        <h2>🚨 High-Priority Competitive Intelligence Alert</h2>
        <p><strong>${enrichedChanges.length} critical changes detected</strong> requiring immediate attention.</p>
        
        <div class="alert">
          <strong>⚡ Action Required:</strong> These changes may significantly impact your competitive position.
        </div>
      `;

      // Group by company
      const changesByCompany = {};
      enrichedChanges.forEach(change => {
        if (!changesByCompany[change.company_name]) {
          changesByCompany[change.company_name] = [];
        }
        changesByCompany[change.company_name].push(change);
      });

      // Format each company's changes
      for (const [company, companyChanges] of Object.entries(changesByCompany)) {
        html += `
          <h3>📍 ${company}</h3>
          <div style="margin-left: 20px;">
        `;

        for (const change of companyChanges) {
          html += `
            <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-left: 4px solid #dc3545;">
              <p><strong>Interest Level: <span class="score">${change.interest_level}/10</span></strong> | 
                 ${change.change_type} | ${new Date(change.created_at).toLocaleString()}</p>
              
              <p><strong>Change Summary:</strong> ${change.change_summary}</p>
          `;

          if (change.analysis) {
            html += `
              <div style="margin-top: 10px;">
            `;
            
            // Handle JSONB fields from PostgreSQL
            if (change.analysis.key_points) {
              const points = typeof change.analysis.key_points === 'string' ? 
                JSON.parse(change.analysis.key_points) : change.analysis.key_points;
              if (points && points.length) {
                html += `<p><strong>Key Points:</strong> ${points.join(', ')}</p>`;
              }
            }
            
            if (change.analysis.main_message) {
              html += `<p><strong>Main Message:</strong> ${change.analysis.main_message}</p>`;
            }
            
            if (change.analysis.target_audience) {
              html += `<p><strong>Target Audience:</strong> ${change.analysis.target_audience}</p>`;
            }
            
            html += `</div>`;
          }

          html += `
              <p><a href="${change.url}">View Source →</a></p>
            </div>
          `;
        }

        html += `</div>`;
      }

      html += `
        <hr>
        <h3>🎯 Recommended Next Steps</h3>
        <ol>
          <li>Review the detailed analysis on the dashboard</li>
          <li>Assess the strategic implications for your business</li>
          <li>Consider immediate response strategies</li>
          <li>Monitor these companies closely for follow-up changes</li>
        </ol>
        
        <p style="text-align: center; margin-top: 30px;">
          <a href="https://redmorestudio.github.io/ai-competitive-monitor/" 
             style="background-color: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            View Full Analysis on Dashboard
          </a>
        </p>
        
        <p style="font-size: 0.9em; color: #666; text-align: center;">
          This is an automated alert from the AI Competitive Intelligence Monitor (PostgreSQL).<br>
          Generated: ${new Date().toLocaleString()}
        </p>
      `;

      // Send email
      await this.sendEmail({
        from: `"AI Monitor ALERT" <${this.fromEmail}>`,
        to: this.recipient,
        subject: `🚨 URGENT: ${enrichedChanges.length} High-Priority Competitive Changes (Level ${Math.max(...enrichedChanges.map(c => c.interest_level))})`,
        html: html
      });

      return true;
    } catch (error) {
      console.error('Failed to send high-priority alert:', error);
      return false;
    }
  }

  // Test email configuration
  async sendTestEmail() {
    try {
      // Test database connection
      const dbTestResult = await this.pool.query('SELECT NOW() as current_time');
      const dbTime = dbTestResult.rows[0].current_time;

      const html = `
        <h2>✅ Email Configuration Test Successful!</h2>
        <p>This test email confirms that your email notifications are properly configured.</p>
        
        <h3>Configuration Details</h3>
        <ul>
          <li><strong>Mode:</strong> ${this.testMode ? 'TEST MODE (files only)' : 'LIVE MODE (SMTP)'}</li>
          <li><strong>Database:</strong> PostgreSQL</li>
          <li><strong>SMTP Host:</strong> ${process.env.SMTP_HOST || 'Not configured'}</li>
          <li><strong>SMTP Port:</strong> ${process.env.SMTP_PORT || 587}</li>
          <li><strong>From:</strong> ${this.fromEmail}</li>
          <li><strong>To:</strong> ${this.recipient}</li>
        </ul>
        
        <h3>Database Status</h3>
        <ul>
          <li>✅ PostgreSQL: Connected</li>
          <li>✅ Database Time: ${new Date(dbTime).toLocaleString()}</li>
        </ul>
        
        <p>You will receive notifications for:</p>
        <ul>
          <li>📊 Daily digest of all changes</li>
          <li>🚨 Real-time alerts for high-priority changes (score ≥ 8)</li>
          <li>📈 GitHub issues for critical changes (score ≥ 9)</li>
        </ul>
        
        <hr>
        <p style="font-size: 0.9em; color: #666;">
          <a href="https://redmorestudio.github.io/ai-competitive-monitor/">View Dashboard</a> |
          <a href="https://github.com/redmorestudio/ai-competitive-monitor">GitHub Repository</a>
        </p>
      `;

      await this.sendEmail({
        from: `"AI Monitor Test" <${this.fromEmail}>`,
        to: this.recipient,
        subject: '🧪 AI Monitor Email Test - PostgreSQL System',
        html: html
      });

      console.log('Test email sent successfully!');
      return true;
    } catch (error) {
      console.error('Failed to send test email:', error);
      throw error;
    }
  }

  // Send complete state report
  async sendCompleteState() {
    try {
      // Get all companies with stats
      const companiesResult = await this.pool.query(`
        SELECT 
          c.*,
          COUNT(DISTINCT u.id) as url_count
        FROM intelligence.companies c
        LEFT JOIN intelligence.urls u ON c.id = u.company_id
        GROUP BY c.id, c.name, c.category, c.interest_level
        ORDER BY c.name
      `);
      const companies = companiesResult.rows;

      // Get all URLs grouped by company
      const allUrlsResult = await this.pool.query(`
        SELECT 
          c.id as company_id,
          c.name as company_name,
          u.id as url_id,
          u.url,
          u.url_type
        FROM intelligence.companies c
        LEFT JOIN intelligence.urls u ON c.id = u.company_id
        ORDER BY c.name, u.url_type
      `);
      const allUrls = allUrlsResult.rows;

      // Group URLs by company
      const urlsByCompany = {};
      allUrls.forEach(row => {
        if (!urlsByCompany[row.company_id]) {
          urlsByCompany[row.company_id] = [];
        }
        if (row.url) {
          urlsByCompany[row.company_id].push({
            url: row.url,
            type: row.url_type,
            id: row.url_id
          });
        }
      });

      // Get baseline analysis for keywords
      const baselineResult = await this.pool.query(`
        SELECT 
          ba.company_id,
          ba.url_id,
          ba.url,
          ba.entities,
          ba.themes,
          ba.key_topics,
          ba.key_points
        FROM intelligence.baseline_analysis ba
        WHERE ba.analyzed_at IN (
          SELECT MAX(analyzed_at) 
          FROM intelligence.baseline_analysis 
          GROUP BY company_id, url_id
        )
      `);
      const baselineData = baselineResult.rows;

      // Group baseline data by company
      const keywordsByCompany = {};
      baselineData.forEach(row => {
        if (!keywordsByCompany[row.company_id]) {
          keywordsByCompany[row.company_id] = new Set();
        }
        
        // Extract keywords from JSONB fields
        try {
          if (row.entities) {
            const entities = typeof row.entities === 'string' ? 
              JSON.parse(row.entities) : row.entities;
            Object.values(entities).flat().forEach(entity => {
              if (typeof entity === 'string') {
                keywordsByCompany[row.company_id].add(entity);
              }
            });
          }
          
          if (row.themes) {
            const themes = typeof row.themes === 'string' ? 
              JSON.parse(row.themes) : row.themes;
            themes.forEach(theme => keywordsByCompany[row.company_id].add(theme));
          }
          
          if (row.key_topics) {
            row.key_topics.split(',').forEach(topic => 
              keywordsByCompany[row.company_id].add(topic.trim())
            );
          }
        } catch (e) {
          // Skip if parsing fails
        }
      });

      // Get monitoring statistics
      const statsResult = await this.pool.query(`
        SELECT 
          (SELECT COUNT(*) FROM intelligence.companies) as total_companies,
          (SELECT COUNT(*) FROM intelligence.urls) as total_urls,
          (SELECT COUNT(*) FROM raw_content.scraped_pages) as total_snapshots,
          (SELECT COUNT(*) FROM processed_content.change_detection) as total_changes,
          (SELECT COUNT(*) FROM intelligence.baseline_analysis) as total_baselines
      `);
      const stats = statsResult.rows[0];

      // Build email
      let html = `
        <h2>🔍 AI Monitor Complete State Report</h2>
        <p>Generated: ${new Date().toLocaleString()}</p>
        
        <h3>📊 System Overview</h3>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px;">
          <span class="metric">🏢 ${stats.total_companies} Companies</span>
          <span class="metric">🔗 ${stats.total_urls} URLs</span>
          <span class="metric">📸 ${stats.total_snapshots} Snapshots</span>
          <span class="metric">🔄 ${stats.total_changes} Total Changes</span>
          <span class="metric">🧠 ${stats.total_baselines} AI Analyses</span>
        </div>
        
        <h3>🏢 All Monitored Companies - URLs & Keywords</h3>
      `;

      // Create detailed company cards
      for (const company of companies) {
        const urls = urlsByCompany[company.id] || [];
        const keywords = keywordsByCompany[company.id] ? 
          Array.from(keywordsByCompany[company.id]).slice(0, 20) : [];

        html += `
          <div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px;">
            <h4 style="margin-top: 0; color: #0056b3;">${company.name}</h4>
            <p style="margin: 5px 0; color: #666;">
              <strong>Category:</strong> ${company.category || 'Uncategorized'} | 
              <strong>URLs:</strong> ${company.url_count}
            </p>
            
            <div style="margin: 10px 0;">
              <strong>Monitored URLs:</strong>
              <ul style="margin: 5px 0; font-size: 0.9em;">
        `;
        
        if (urls.length > 0) {
          urls.forEach(u => {
            html += `<li><a href="${u.url}">${u.url}</a> <em>(${u.type || 'general'})</em></li>`;
          });
        } else {
          html += `<li style="color: #999;">No URLs configured</li>`;
        }
        
        html += `
              </ul>
            </div>
            
            <div style="margin: 10px 0;">
              <strong>Extracted Keywords/Entities:</strong>
              <div style="margin: 5px 0;">
        `;
        
        if (keywords.length > 0) {
          keywords.forEach(keyword => {
            html += `<span style="background: #e9ecef; padding: 2px 8px; margin: 2px; border-radius: 3px; font-size: 0.85em; display: inline-block;">${keyword}</span>`;
          });
          if (keywordsByCompany[company.id] && keywordsByCompany[company.id].size > 20) {
            html += `<span style="color: #666; font-size: 0.85em;"> +${keywordsByCompany[company.id].size - 20} more</span>`;
          }
        } else {
          html += `<span style="color: #999; font-size: 0.9em;">No keywords extracted yet</span>`;
        }
        
        html += `
              </div>
            </div>
          </div>
        `;
      }

      // Get recent changes if any
      const recentChangesResult = await this.pool.query(`
        SELECT 
          cd.*,
          cd.detected_at as created_at,
          cd.interest_level,
          cd.summary as change_summary,
          cd.url,
          sp.company as company_name
        FROM processed_content.change_detection cd
        JOIN raw_content.scraped_pages sp ON cd.url = sp.url
          AND cd.new_hash = sp.content_hash
        WHERE cd.detected_at > NOW() - INTERVAL '7 days'
        AND cd.interest_level >= 7
        ORDER BY cd.interest_level DESC
        LIMIT 10
      `);
      const recentChanges = recentChangesResult.rows;

      if (recentChanges.length > 0) {
        html += `
          <h3>🚨 Recent High-Priority Changes (Last 7 Days)</h3>
          <table>
            <tr>
              <th>Date</th>
              <th>Company</th>
              <th>Score</th>
              <th>Summary</th>
            </tr>
        `;

        for (const change of recentChanges) {
          html += `
            <tr>
              <td>${new Date(change.created_at).toLocaleDateString()}</td>
              <td>${change.company_name}</td>
              <td class="score">${change.interest_level}/10</td>
              <td>${change.change_summary || 'Change detected'}</td>
            </tr>
          `;
        }

        html += `</table>`;
      }

      // System health
      const dbVersionResult = await this.pool.query('SELECT version()');
      const dbVersion = dbVersionResult.rows[0].version;

      html += `
        <h3>💚 System Health</h3>
        <ul>
          <li>Database: PostgreSQL</li>
          <li>Version: ${dbVersion.split(' ')[1]}</li>
          <li>Email Configuration: ${this.isConfigured ? '✅ Live' : '🧪 Test Mode'}</li>
          <li>PostgreSQL Architecture: ✅ Active</li>
          <li>Generated at: ${new Date().toISOString()}</li>
        </ul>
        
        <hr>
        <p style="font-size: 0.9em; color: #666; text-align: center;">
          This email confirms that all systems are operational.<br>
          <a href="https://redmorestudio.github.io/ai-competitive-monitor/">View Dashboard</a> |
          <a href="https://github.com/redmorestudio/ai-competitive-monitor">GitHub Repository</a>
        </p>
      `;

      await this.sendEmail({
        from: `"AI Monitor" <${this.fromEmail}>`,
        to: this.recipient,
        subject: `📊 AI Monitor Complete State Report - ${stats.total_companies} companies monitored`,
        html: html
      });

      return true;
    } catch (error) {
      console.error('Failed to send complete state report:', error);
      return false;
    }
  }

  // Send "no changes" confirmation email
  async sendNoChangesEmail() {
    try {
      // Get monitoring statistics
      const statsResult = await this.pool.query(`
        SELECT 
          (SELECT COUNT(*) FROM intelligence.companies) as total_companies,
          (SELECT COUNT(*) FROM intelligence.urls) as total_urls,
          $1::text as last_run,
          $2::text as next_run
      `, [
        new Date().toLocaleString(),
        new Date(Date.now() + 6 * 60 * 60 * 1000).toLocaleString() // 6 hours later
      ]);
      const stats = statsResult.rows[0];

      // Get list of monitored companies
      const companiesResult = await this.pool.query(`
        SELECT name, category FROM intelligence.companies ORDER BY name
      `);
      const companies = companiesResult.rows;

      // Check if there were ANY changes (not just high-priority)
      const recentChangesResult = await this.pool.query(`
        SELECT COUNT(*) as count
        FROM processed_content.change_detection 
        WHERE detected_at > NOW() - INTERVAL '6 hours'
      `);
      const recentChanges = recentChangesResult.rows[0].count;

      let html = `
        <h2>✅ AI Monitor: No Changes Detected</h2>
        <p><strong>${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong></p>
        
        <div style="background-color: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0; color: #155724;">
            <strong>All Clear!</strong> Your AI Competitive Monitor ran successfully and found no new changes across the monitored websites.
          </p>
        </div>
        
        <h3>📊 Monitoring Summary</h3>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px;">
          <p style="margin: 5px 0;">🏢 <strong>${stats.total_companies} Companies</strong> monitored</p>
          <p style="margin: 5px 0;">🔗 <strong>${stats.total_urls} URLs</strong> checked</p>
          <p style="margin: 5px 0;">🔄 <strong>${recentChanges} changes</strong> detected (all low priority)</p>
          <p style="margin: 5px 0;">⏰ <strong>Last check:</strong> ${stats.last_run}</p>
          <p style="margin: 5px 0;">⏰ <strong>Next check:</strong> ${stats.next_run}</p>
        </div>
        
        <h3>🏢 Monitored Companies</h3>
        <div style="columns: 2; column-gap: 20px;">
      `;

      // Group companies by category
      const companiesByCategory = {};
      companies.forEach(company => {
        const category = company.category || 'Other';
        if (!companiesByCategory[category]) {
          companiesByCategory[category] = [];
        }
        companiesByCategory[category].push(company.name);
      });

      // Display companies by category
      Object.entries(companiesByCategory).forEach(([category, names]) => {
        html += `
          <div style="break-inside: avoid; margin-bottom: 15px;">
            <strong>${category}:</strong>
            <ul style="margin: 5px 0; padding-left: 20px;">
        `;
        names.forEach(name => {
          html += `<li>${name}</li>`;
        });
        html += `</ul></div>`;
      });

      html += `
        </div>
        
        <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0;">
            <em>Everything is stable - no significant updates detected in this monitoring cycle.</em>
          </p>
        </div>
        
        <hr>
        <p style="text-align: center; margin-top: 30px;">
          <a href="https://redmorestudio.github.io/ai-competitive-monitor/" 
             style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            View Dashboard
          </a>
        </p>
        
        <p style="font-size: 0.9em; color: #666; text-align: center;">
          Stay tuned for the next update!<br>
          AI Competitive Intelligence Monitor (PostgreSQL)<br>
          <a href="https://github.com/redmorestudio/ai-competitive-monitor">GitHub Repository</a>
        </p>
      `;

      // Send email
      await this.sendEmail({
        from: `"AI Monitor" <${this.fromEmail}>`,
        to: this.recipient,
        subject: `✅ AI Monitor: No Changes Detected - ${new Date().toLocaleDateString()}`,
        html: html
      });

      return true;
    } catch (error) {
      console.error('Failed to send no changes email:', error);
      return false;
    }
  }

  // Check for recent changes and send alerts
  async checkAndAlert() {
    try {
      // Look for high-priority changes in the last hour
      const recentHighPriorityResult = await this.pool.query(`
        SELECT 
          cd.*,
          cd.detected_at as created_at,
          cd.interest_level,
          cd.summary as change_summary,
          cd.url,
          sp.company as company_name
        FROM processed_content.change_detection cd
        JOIN raw_content.scraped_pages sp ON cd.url = sp.url
          AND cd.new_hash = sp.content_hash
        WHERE cd.detected_at > NOW() - INTERVAL '1 hour'
        AND cd.interest_level >= 8
        ORDER BY cd.interest_level DESC
      `);
      const recentHighPriorityChanges = recentHighPriorityResult.rows;

      if (recentHighPriorityChanges.length > 0) {
        console.log(`Found ${recentHighPriorityChanges.length} high-priority changes`);
        await this.sendHighPriorityAlert(recentHighPriorityChanges);
      } else {
        // Check if there were ANY changes at all in the monitoring period
        const anyChangesResult = await this.pool.query(`
          SELECT COUNT(*) as count
          FROM processed_content.change_detection 
          WHERE detected_at > NOW() - INTERVAL '1 hour'
        `);
        const anyChanges = anyChangesResult.rows[0].count;

        if (anyChanges === 0) {
          console.log('No changes detected - sending confirmation email');
          await this.sendNoChangesEmail();
        } else {
          console.log(`${anyChanges} low-priority changes detected (no email needed)`);
        }
      }

      return true;
    } catch (error) {
      console.error('Failed to check and alert:', error);
      return false;
    }
  }
}

// Command-line interface
if (require.main === module) {
  async function main() {
    const command = process.argv[2];
    const emailService = new PostgresEmailNotificationService();
    let success = false;
    
    console.log('\n📧 PostgreSQL Email Notification Service');
    console.log('========================================');
    
    if (!emailService.isConfigured && !emailService.testMode) {
      console.log('\n❌ Email notifications are not configured!');
      console.log('\nTo enable email notifications, set these environment variables:');
      console.log('  DATABASE_URL=postgresql://user:pass@host:port/db');
      console.log('  SMTP_HOST=smtp.gmail.com');
      console.log('  SMTP_PORT=587');
      console.log('  SMTP_USER=your-email@gmail.com');
      console.log('  SMTP_PASS=your-app-password');
      console.log('  EMAIL_TO=recipient@example.com');
      console.log('  EMAIL_FROM=sender@example.com');
      console.log('\nOr run in test mode with: --test-mode');
      console.log('Example: node email-notifications-postgres.js test --test-mode\n');
      process.exit(1);
    }

    if (emailService.testMode) {
      console.log('\n🧪 Running in TEST MODE - emails will be saved to files\n');
    }

    try {
      switch (command) {
        case 'test':
          console.log('Sending test email...');
          await emailService.sendTestEmail();
          success = true;
          break;
          
        case 'check':
          console.log('Checking for recent high-priority changes...');
          success = await emailService.checkAndAlert();
          break;
          
        case 'daily':
          console.log('Generating daily digest...');
          await emailService.sendDailyDigest();
          success = true;
          break;
          
        case 'demo':
          console.log('Creating demo email with sample data...');
          // Create some fake changes for demo
          const demoChanges = [
            {
              id: 1,
              url: 'https://openai.com/blog',
              change_type: 'New Content',
              change_summary: 'OpenAI announces GPT-5 with breakthrough reasoning capabilities',
              interest_level: 9,
              created_at: new Date().toISOString()
            },
            {
              id: 2,
              url: 'https://anthropic.com/news',
              change_type: 'Product Launch',
              change_summary: 'Anthropic releases Claude 4 with 1M token context window',
              interest_level: 8,
              created_at: new Date().toISOString()
            }
          ];
          await emailService.sendHighPriorityAlert(demoChanges);
          success = true;
          break;
          
        case 'state':
          console.log('Generating complete state report...');
          await emailService.sendCompleteState();
          success = true;
          break;
          
        case 'nochanges':
          console.log('Sending no-changes notification...');
          await emailService.sendNoChangesEmail();
          success = true;
          break;
          
        default:
          console.log('\nUsage:');
          console.log('  node email-notifications-postgres.js test        - Send test email');
          console.log('  node email-notifications-postgres.js check       - Check and alert on recent changes');
          console.log('  node email-notifications-postgres.js daily       - Send daily digest');
          console.log('  node email-notifications-postgres.js state       - Send complete state report');
          console.log('  node email-notifications-postgres.js nochanges   - Send no-changes notification');
          console.log('  node email-notifications-postgres.js demo        - Create demo email with sample data');
          console.log('\nOptions:');
          console.log('  --test-mode    Save emails to files instead of sending');
          process.exit(0);
      }
    } catch (error) {
      console.error('\n❌ Email operation failed:', error.message);
      if (error.code === 'EAUTH') {
        console.error('   Authentication failed - check SMTP credentials');
      } else if (error.code === 'ECONNECTION') {
        console.error('   Connection failed - check SMTP host and port');
      } else if (error.code === 'ESOCKET') {
        console.error('   Network error - check internet connection');
      } else if (error.code === 'ECONNREFUSED') {
        console.error('   Database connection refused - check DATABASE_URL');
      }
      success = false;
    } finally {
      // Close database connection
      await emailService.close();
    }
    
    // Exit with proper code
    process.exit(success ? 0 : 1);
  }
  
  main().catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = PostgresEmailNotificationService;
