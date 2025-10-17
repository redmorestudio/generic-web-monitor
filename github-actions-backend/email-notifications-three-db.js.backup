const nodemailer = require('nodemailer');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

class ThreeDBEmailNotificationService {
  constructor() {
    // Initialize three databases
    const dataDir = path.join(__dirname, 'data');
    this.intelligenceDb = new Database(path.join(dataDir, 'intelligence.db'));
    this.processedDb = new Database(path.join(dataDir, 'processed_content.db'));
    this.rawDb = new Database(path.join(dataDir, 'raw_content.db'));
    
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
      this.transporter = nodemailer.createTransport({
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

  // Send or save email based on mode
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
      const recentChanges = this.processedDb.prepare(`
        SELECT 
          cd.id,
          cd.url_id,
          cd.change_type,
          cd.summary as change_summary,
          cd.relevance_score as interest_level,
          cd.detected_at as created_at,
          cc.url,
          cc.company_name,
          mc.content as markdown_content
        FROM change_detection cd
        JOIN content_changes cc ON cd.url_id = cc.url_id 
          AND cd.detected_at = cc.detected_at
        LEFT JOIN markdown_content mc ON cd.new_content_id = mc.raw_content_id
        WHERE cd.detected_at > datetime('now', '-24 hours')
        ORDER BY cd.relevance_score DESC, cd.detected_at DESC
      `).all();

      // Get AI analysis for these changes
      const changeIds = recentChanges.map(c => c.id);
      const aiAnalyses = {};
      
      if (changeIds.length > 0) {
        const analyses = this.intelligenceDb.prepare(`
          SELECT * FROM baseline_analysis 
          WHERE change_detection_id IN (${changeIds.map(() => '?').join(',')})
        `).all(...changeIds);
        
        analyses.forEach(a => {
          aiAnalyses[a.change_detection_id] = a;
        });
      }

      // Get company information for URLs
      const urlCompanyMap = {};
      const urls = [...new Set(recentChanges.map(c => c.url))];
      
      if (urls.length > 0) {
        const companies = this.intelligenceDb.prepare(`
          SELECT u.url, c.name as company_name, c.category
          FROM urls u
          JOIN companies c ON u.company_id = c.id
          WHERE u.url IN (${urls.map(() => '?').join(',')})
        `).all(...urls);
        
        companies.forEach(c => {
          urlCompanyMap[c.url] = c;
        });
      }

      // Get monitoring statistics
      const stats = {
        totalCompanies: this.intelligenceDb.prepare('SELECT COUNT(*) as count FROM companies').get().count,
        totalUrls: this.intelligenceDb.prepare('SELECT COUNT(*) as count FROM urls').get().count,
        totalSnapshots: this.processedDb.prepare('SELECT COUNT(*) as count FROM markdown_content').get().count,
        totalChanges: this.processedDb.prepare('SELECT COUNT(*) as count FROM change_detection').get().count,
        changesLast24h: recentChanges.length,
        highPriorityChanges: recentChanges.filter(c => c.interest_level >= 8).length
      };

      // Build email content
      let html = `
        <h2>🤖 AI Competitive Monitor - Daily Digest</h2>
        <p><strong>${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong></p>
        
        <h3>📊 24-Hour Summary</h3>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px;">
          <span class="metric">🏢 ${stats.totalCompanies} Companies</span>
          <span class="metric">🔗 ${stats.totalUrls} URLs</span>
          <span class="metric">📸 ${stats.totalSnapshots} Snapshots</span>
          <span class="metric">🔄 ${stats.changesLast24h} Changes (24h)</span>
          <span class="metric">🚨 ${stats.highPriorityChanges} High Priority</span>
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
          html += '<p style="color: #d9534f; font-weight: bold; margin: 15px 0;">🚨 GitHub issues have been automatically created for these critical changes.</p>';          html += `
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
          AI Competitive Intelligence Monitor<br>
          <a href="https://github.com/redmorestudio/ai-competitive-monitor">GitHub Repository</a>
        </p>
      `;

      // Send email
      await this.sendEmail({
        from: `"AI Monitor" <${this.fromEmail}>`,
        to: this.recipient,
        subject: `📊 AI Monitor Daily Digest - ${stats.changesLast24h} changes detected`,
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
      const company = urlCompanyMap[change.url] || { company_name: 'Unknown', category: 'Unknown' };
      const analysis = aiAnalyses[change.id];
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
            ${analysis.summary ? `<p><strong>Summary:</strong> ${analysis.summary}</p>` : ''}
            ${analysis.key_insights ? `<p><strong>Insights:</strong> ${analysis.key_insights}</p>` : ''}
            ${analysis.competitive_impact ? `<p><strong>Impact:</strong> ${analysis.competitive_impact}</p>` : ''}
            ${analysis.recommended_actions ? `<p><strong>Actions:</strong> ${analysis.recommended_actions}</p>` : ''}
          </td>
        `;
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
      const analysis = aiAnalyses[change.id];
      if (!analysis) return;

      // Count high-activity companies
      if (change.interest_level >= 7) {
        const company = analysis.company_name || 'Unknown';
        companiesWithHighActivity[company] = (companiesWithHighActivity[company] || 0) + 1;
      }

      // Track significant categories
      if (analysis.category && change.interest_level >= 7) {
        significantCategories[analysis.category] = (significantCategories[analysis.category] || 0) + 1;
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
        const companyInfo = this.intelligenceDb.prepare(`
          SELECT c.name, c.category, u.url_type
          FROM urls u
          JOIN companies c ON u.company_id = c.id
          WHERE u.url = ?
        `).get(change.url);

        // Get AI analysis
        const analysis = this.intelligenceDb.prepare(`
          SELECT * FROM baseline_analysis
          WHERE change_detection_id = ?
        `).get(change.id);

        enrichedChanges.push({
          ...change,
          company_name: companyInfo?.name || 'Unknown',
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
                ${change.analysis.summary ? `<p><strong>AI Analysis:</strong> ${change.analysis.summary}</p>` : ''}
                ${change.analysis.key_insights ? `<p><strong>Key Insights:</strong> ${change.analysis.key_insights}</p>` : ''}
                ${change.analysis.competitive_impact ? `<p><strong>Competitive Impact:</strong> ${change.analysis.competitive_impact}</p>` : ''}
                ${change.analysis.recommended_actions ? `<p><strong>Recommended Actions:</strong> ${change.analysis.recommended_actions}</p>` : ''}
              </div>
            `;
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
          This is an automated alert from the AI Competitive Intelligence Monitor.<br>
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
      // GitHub issues are now created directly by the sync.yml workflow
      // This avoids token redundancy and prevents duplicate issues
      // The workflow uses actions/github-script which has automatic token access
//       // Also create a GitHub issue if score is 9 or 10
//       const criticalChanges = enrichedChanges.filter(c => c.interest_level >= 9);
//       if (criticalChanges.length > 0 && process.env.GITHUB_TOKEN) {
//         await this.createGitHubIssue(criticalChanges);
//       }

      return true;
    } catch (error) {
      console.error('Failed to send high-priority alert:', error);
      return false;
    }
  }

  // Create GitHub issue for critical changes
  async createGitHubIssue(changes) {
    try {
      const fetch = (await import('node-fetch')).default;
      
      const title = `🚨 Critical Competitive Changes Detected (${changes.length} items)`;
      const body = changes.map(c => 
        `## ${c.company_name}\n- **Score:** ${c.interest_level}/10\n- **Summary:** ${c.change_summary}\n- **URL:** ${c.url}\n- **Time:** ${new Date(c.created_at).toLocaleString()}`
      ).join('\n\n');

      const response = await fetch('https://api.github.com/repos/redmorestudio/ai-competitive-monitor/issues', {
        method: 'POST',
        headers: {
          'Authorization': `token ${process.env.GITHUB_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          body,
          labels: ['critical', 'competitive-intelligence', 'automated']
        })
      });

      if (response.ok) {
        console.log('GitHub issue created successfully');
      } else {
        console.error('Failed to create GitHub issue:', await response.text());
      }
    } catch (error) {
      console.error('Error creating GitHub issue:', error);
    }
  }

  // Test email configuration
  async sendTestEmail() {
    try {
      const html = `
        <h2>✅ Email Configuration Test Successful!</h2>
        <p>This test email confirms that your email notifications are properly configured.</p>
        
        <h3>Configuration Details</h3>
        <ul>
          <li><strong>Mode:</strong> ${this.testMode ? 'TEST MODE (files only)' : 'LIVE MODE (SMTP)'}</li>
          <li><strong>SMTP Host:</strong> ${process.env.SMTP_HOST || 'Not configured'}</li>
          <li><strong>SMTP Port:</strong> ${process.env.SMTP_PORT || 587}</li>
          <li><strong>From:</strong> ${this.fromEmail}</li>
          <li><strong>To:</strong> ${this.recipient}</li>
        </ul>
        
        <h3>Database Status</h3>
        <ul>
          <li>✅ Intelligence DB: Connected</li>
          <li>✅ Processed Content DB: Connected</li>
          <li>✅ Raw Content DB: Connected</li>
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
        subject: '🧪 AI Monitor Email Test - Three DB System',
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
      const companies = this.intelligenceDb.prepare(`
        SELECT 
          c.*,
          COUNT(DISTINCT u.id) as url_count
        FROM companies c
        LEFT JOIN urls u ON c.id = u.company_id
        GROUP BY c.id
        ORDER BY c.name
      `).all();

      // Get all URLs grouped by company
      const allUrls = this.intelligenceDb.prepare(`
        SELECT 
          c.id as company_id,
          c.name as company_name,
          u.id as url_id,
          u.url,
          u.url_type
        FROM companies c
        LEFT JOIN urls u ON c.id = u.company_id
        ORDER BY c.name, u.url_type
      `).all();

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
      const baselineData = this.intelligenceDb.prepare(`
        SELECT 
          ba.company_id,
          ba.url_id,
          ba.entities,
          ba.semantic_categories,
          ba.competitive_data,
          ba.quantitative_data,
          ba.summary
        FROM baseline_analysis ba
        WHERE ba.id IN (
          SELECT MAX(id) 
          FROM baseline_analysis 
          GROUP BY company_id, url_id
        )
      `).all();

      // Group baseline data by company
      const keywordsByCompany = {};
      baselineData.forEach(row => {
        if (!keywordsByCompany[row.company_id]) {
          keywordsByCompany[row.company_id] = new Set();
        }
        
        // Extract keywords from different fields
        try {
          if (row.entities) {
            const entities = JSON.parse(row.entities);
            Object.keys(entities).forEach(category => {
              if (Array.isArray(entities[category])) {
                entities[category].forEach(item => {
                  if (typeof item === 'string') {
                    keywordsByCompany[row.company_id].add(item);
                  } else if (item.name) {
                    keywordsByCompany[row.company_id].add(item.name);
                  }
                });
              }
            });
          }
          
          if (row.semantic_categories) {
            const categories = JSON.parse(row.semantic_categories);
            if (Array.isArray(categories)) {
              categories.forEach(cat => keywordsByCompany[row.company_id].add(cat));
            }
          }
        } catch (e) {
          // Skip if JSON parsing fails
        }
      });

      // Get monitoring statistics
      const stats = {
        totalCompanies: this.intelligenceDb.prepare('SELECT COUNT(*) as count FROM companies').get().count,
        totalUrls: this.intelligenceDb.prepare('SELECT COUNT(*) as count FROM urls').get().count,
        totalSnapshots: this.processedDb.prepare('SELECT COUNT(*) as count FROM markdown_content').get().count,
        totalChanges: this.processedDb.prepare('SELECT COUNT(*) as count FROM change_detection').get().count,
        totalBaselines: this.intelligenceDb.prepare('SELECT COUNT(*) as count FROM baseline_analysis').get().count
      };

      // Build email
      let html = `
        <h2>🔍 AI Monitor Complete State Report</h2>
        <p>Generated: ${new Date().toLocaleString()}</p>
        
        <h3>📊 System Overview</h3>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px;">
          <span class="metric">🏢 ${stats.totalCompanies} Companies</span>
          <span class="metric">🔗 ${stats.totalUrls} URLs</span>
          <span class="metric">📸 ${stats.totalSnapshots} Snapshots</span>
          <span class="metric">🔄 ${stats.totalChanges} Total Changes</span>
          <span class="metric">🧠 ${stats.totalBaselines} AI Analyses</span>
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
      const recentChanges = this.processedDb.prepare(`
        SELECT 
          cd.*,
          cd.detected_at as created_at,
          cd.relevance_score as interest_level,
          cd.summary as change_summary,
          cc.url,
          cc.company_name
        FROM change_detection cd
        JOIN content_changes cc ON cd.url_id = cc.url_id 
          AND cd.detected_at = cc.detected_at
        WHERE cd.detected_at > datetime('now', '-7 days')
        AND cd.relevance_score >= 7
        ORDER BY cd.relevance_score DESC
        LIMIT 10
      `).all();

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
      const dbPath = path.join(__dirname, 'data', 'intelligence.db');
      const dbSize = fs.existsSync(dbPath) ? 
        `${(fs.statSync(dbPath).size / 1024 / 1024).toFixed(2)} MB` : 'Unknown';

      html += `
        <h3>💚 System Health</h3>
        <ul>
          <li>Intelligence DB Size: ${dbSize}</li>
          <li>Email Configuration: ${this.isConfigured ? '✅ Live' : '🧪 Test Mode'}</li>
          <li>Three-Database Architecture: ✅ Active</li>
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
        subject: `📊 AI Monitor Complete State Report - ${stats.totalCompanies} companies monitored`,
        html: html
      });

      return true;
    } catch (error) {
      console.error('Failed to send complete state report:', error);
      return false;
    }
  }

  // Check for recent changes and send alerts
  async checkAndAlert() {
    try {
      // Look for high-priority changes in the last hour
      const recentHighPriorityChanges = this.processedDb.prepare(`
        SELECT 
          cd.*,
          cd.detected_at as created_at,
          cd.relevance_score as interest_level,
          cd.summary as change_summary,
          cc.url,
          cc.company_name
        FROM change_detection cd
        JOIN content_changes cc ON cd.url_id = cc.url_id 
          AND cd.detected_at = cc.detected_at
        WHERE cd.detected_at > datetime('now', '-1 hour')
        AND cd.relevance_score >= 8
        ORDER BY cd.relevance_score DESC
      `).all();

      if (recentHighPriorityChanges.length > 0) {
        console.log(`Found ${recentHighPriorityChanges.length} high-priority changes`);
        await this.sendHighPriorityAlert(recentHighPriorityChanges);
      } else {
        console.log('No high-priority changes in the last hour');
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
    const emailService = new ThreeDBEmailNotificationService();
    let success = false;
    
    console.log('\n📧 Three-DB Email Notification Service');
    console.log('=====================================');
    
    if (!emailService.isConfigured && !emailService.testMode) {
      console.log('\n❌ Email notifications are not configured!');
      console.log('\nTo enable email notifications, set these environment variables:');
      console.log('  SMTP_HOST=smtp.gmail.com');
      console.log('  SMTP_PORT=587');
      console.log('  SMTP_USER=your-email@gmail.com');
      console.log('  SMTP_PASS=your-app-password');
      console.log('  EMAIL_TO=recipient@example.com');
      console.log('  EMAIL_FROM=sender@example.com');
      console.log('\nOr run in test mode with: --test-mode');
      console.log('Example: node email-notifications-three-db.js test --test-mode\n');
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
          
        default:
          console.log('\nUsage:');
          console.log('  node email-notifications-three-db.js test     - Send test email');
          console.log('  node email-notifications-three-db.js check    - Check and alert on recent changes');
          console.log('  node email-notifications-three-db.js daily    - Send daily digest');
          console.log('  node email-notifications-three-db.js state    - Send complete state report');
          console.log('  node email-notifications-three-db.js demo     - Create demo email with sample data');
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
      }
      success = false;
    } finally {
      // Close databases
      emailService.intelligenceDb.close();
      emailService.processedDb.close();
      emailService.rawDb.close();
    }
    
    // Exit with proper code
    process.exit(success ? 0 : 1);
  }
  
  main().catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = ThreeDBEmailNotificationService;
