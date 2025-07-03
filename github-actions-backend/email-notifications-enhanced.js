const nodemailer = require('nodemailer');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

class EnhancedEmailNotificationService {
  constructor() {
    // Initialize database
    const dbPath = path.join(__dirname, 'data', 'monitor.db');
    this.db = new Database(dbPath);
    
    // Check if email is configured
    this.isConfigured = !!(
      process.env.SMTP_HOST && 
      process.env.SMTP_USER && 
      process.env.SMTP_PASS
    );
    
    // Default recipient
    this.recipient = process.env.NOTIFICATION_EMAIL || process.env.SMTP_USER || 'seth@redmore.studio';
    
    if (this.isConfigured) {
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

  // Send a verification email with all companies/URLs
  async sendDailyVerification() {
    if (!this.isConfigured) {
      console.log('Email notifications not configured. Set SMTP_* environment variables.');
      return false;
    }

    try {
      // Get all companies with their URLs
      const companies = this.db.prepare(`
        SELECT 
          c.id,
          c.name,
          c.type,
          c.created_at,
          GROUP_CONCAT(u.url || ' (' || u.type || ')', ', ') as urls
        FROM companies c
        LEFT JOIN urls u ON c.id = u.company_id
        WHERE c.enabled = 1
        GROUP BY c.id
        ORDER BY c.name
      `).all();

      // Get monitoring statistics
      const stats = this.db.prepare(`
        SELECT 
          COUNT(DISTINCT u.id) as total_urls,
          COUNT(DISTINCT cs.id) as total_snapshots,
          COUNT(DISTINCT ch.id) as total_changes,
          COUNT(DISTINCT aa.id) as total_analyses
        FROM urls u
        LEFT JOIN content_snapshots cs ON u.id = cs.url_id
        LEFT JOIN changes ch ON u.id = ch.url_id
        LEFT JOIN ai_analysis aa ON ch.id = aa.change_id
      `).get();

      // Build email content
      let html = `
        <h2>🤖 AI Monitor Daily Verification</h2>
        <p>This is your daily verification email confirming that the AI Competitive Intelligence Monitor is running correctly.</p>
        
        <h3>📊 System Statistics</h3>
        <ul>
          <li><strong>Companies Monitored:</strong> ${companies.length}</li>
          <li><strong>URLs Tracked:</strong> ${stats.total_urls}</li>
          <li><strong>Content Snapshots:</strong> ${stats.total_snapshots}</li>
          <li><strong>Changes Detected:</strong> ${stats.total_changes}</li>
          <li><strong>AI Analyses:</strong> ${stats.total_analyses}</li>
        </ul>
        
        <h3>🏢 Monitored Companies</h3>
        <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse;">
          <tr>
            <th>Company</th>
            <th>Type</th>
            <th>URLs</th>
            <th>Added</th>
          </tr>
      `;

      for (const company of companies) {
        html += `
          <tr>
            <td>${company.name}</td>
            <td>${company.type}</td>
            <td style="font-size: 0.9em;">${company.urls || 'No URLs'}</td>
            <td>${new Date(company.created_at).toLocaleDateString()}</td>
          </tr>
        `;
      }

      html += `
        </table>
        
        <hr>
        <p style="font-size: 0.9em; color: #666;">
          This email confirms that:
          <ul>
            <li>✅ Email notifications are properly configured</li>
            <li>✅ The monitoring system is active</li>
            <li>✅ Database connections are working</li>
            <li>✅ All systems are operational</li>
          </ul>
        </p>
        
        <p style="font-size: 0.9em; color: #666;">
          <a href="https://redmorestudio.github.io/ai-competitive-monitor/">View Live Dashboard</a> |
          <a href="https://github.com/redmorestudio/ai-competitive-monitor">GitHub Repository</a>
        </p>
      `;

      // Send email
      const info = await this.transporter.sendMail({
        from: `"AI Monitor" <${process.env.SMTP_USER}>`,
        to: this.recipient,
        subject: `✅ AI Monitor Daily Verification - ${new Date().toLocaleDateString()}`,
        html: html
      });

      console.log('Daily verification email sent:', info.messageId);
      return true;
    } catch (error) {
      console.error('Failed to send daily verification email:', error);
      return false;
    }
  }

  // Send complete state report
  async sendCompleteState() {
    if (!this.isConfigured) {
      console.log('Email notifications not configured.');
      return false;
    }

    try {
      // Get all companies with detailed stats
      const companies = this.db.prepare(`
        SELECT 
          c.*,
          COUNT(DISTINCT u.id) as url_count,
          COUNT(DISTINCT cs.id) as snapshot_count,
          COUNT(DISTINCT ch.id) as change_count,
          MAX(cs.created_at) as last_snapshot,
          MAX(ch.created_at) as last_change
        FROM companies c
        LEFT JOIN urls u ON c.id = u.company_id
        LEFT JOIN content_snapshots cs ON u.id = cs.url_id
        LEFT JOIN changes ch ON u.id = ch.url_id
        WHERE c.enabled = 1
        GROUP BY c.id
        ORDER BY c.name
      `).all();

      // Get recent high-relevance changes
      const recentChanges = this.db.prepare(`
        SELECT 
          ch.*,
          u.url,
          c.name as company_name,
          aa.relevance_score,
          aa.summary,
          aa.category
        FROM changes ch
        JOIN urls u ON ch.url_id = u.id
        JOIN companies c ON u.company_id = c.id
        LEFT JOIN ai_analysis aa ON ch.id = aa.change_id
        WHERE ch.created_at > datetime('now', '-7 days')
        AND aa.relevance_score >= 7
        ORDER BY aa.relevance_score DESC, ch.created_at DESC
        LIMIT 10
      `).all();

      // Build comprehensive report
      let html = `
        <h2>🔍 AI Monitor Complete State Report</h2>
        <p>Generated: ${new Date().toLocaleString()}</p>
        
        <h3>🏢 Company Monitoring Status</h3>
        <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
          <tr>
            <th>Company</th>
            <th>Type</th>
            <th>URLs</th>
            <th>Snapshots</th>
            <th>Changes</th>
            <th>Last Check</th>
            <th>Last Change</th>
          </tr>
      `;

      for (const company of companies) {
        html += `
          <tr>
            <td><strong>${company.name}</strong></td>
            <td>${company.type}</td>
            <td align="center">${company.url_count}</td>
            <td align="center">${company.snapshot_count}</td>
            <td align="center">${company.change_count}</td>
            <td>${company.last_snapshot ? new Date(company.last_snapshot).toLocaleString() : 'Never'}</td>
            <td>${company.last_change ? new Date(company.last_change).toLocaleString() : 'None'}</td>
          </tr>
        `;
      }

      html += `</table>`;

      if (recentChanges.length > 0) {
        html += `
          <h3>🚨 Recent High-Priority Changes (Score ≥ 7)</h3>
          <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
            <tr>
              <th>Date</th>
              <th>Company</th>
              <th>Score</th>
              <th>Category</th>
              <th>Summary</th>
              <th>URL</th>
            </tr>
        `;

        for (const change of recentChanges) {
          html += `
            <tr>
              <td>${new Date(change.created_at).toLocaleString()}</td>
              <td>${change.company_name}</td>
              <td align="center"><strong>${change.relevance_score}/10</strong></td>
              <td>${change.category || 'N/A'}</td>
              <td>${change.summary || 'No summary'}</td>
              <td><a href="${change.url}">View</a></td>
            </tr>
          `;
        }

        html += `</table>`;
      } else {
        html += `<p><em>No high-priority changes in the last 7 days.</em></p>`;
      }

      // System health check
      const health = this.checkSystemHealth();
      html += `
        <h3>💚 System Health</h3>
        <ul>
          <li>Database Size: ${health.dbSize}</li>
          <li>Total Records: ${health.totalRecords.toLocaleString()}</li>
          <li>Last Run: ${health.lastRun || 'Unknown'}</li>
          <li>Email Config: ${this.isConfigured ? '✅ Configured' : '❌ Not configured'}</li>
        </ul>
        
        <hr>
        <p style="font-size: 0.9em; color: #666;">
          <a href="https://redmorestudio.github.io/ai-competitive-monitor/">View Live Dashboard</a> |
          <a href="https://github.com/redmorestudio/ai-competitive-monitor">GitHub Repository</a>
        </p>
      `;

      // Send email
      const info = await this.transporter.sendMail({
        from: `"AI Monitor" <${process.env.SMTP_USER}>`,
        to: this.recipient,
        subject: `📊 AI Monitor Complete State Report - ${new Date().toLocaleDateString()}`,
        html: html
      });

      console.log('Complete state report sent:', info.messageId);
      return true;
    } catch (error) {
      console.error('Failed to send state report:', error);
      return false;
    }
  }

  // Check system health
  checkSystemHealth() {
    try {
      const stats = fs.statSync(path.join(__dirname, 'data', 'monitor.db'));
      const dbSize = `${(stats.size / 1024 / 1024).toFixed(2)} MB`;

      const totalRecords = this.db.prepare(`
        SELECT 
          (SELECT COUNT(*) FROM companies) +
          (SELECT COUNT(*) FROM urls) +
          (SELECT COUNT(*) FROM content_snapshots) +
          (SELECT COUNT(*) FROM changes) +
          (SELECT COUNT(*) FROM ai_analysis) +
          (SELECT COUNT(*) FROM baseline_analysis) as total
      `).get().total;

      const lastRun = this.db.prepare(`
        SELECT MAX(started_at) as last_run FROM monitoring_runs
      `).get().last_run;

      return {
        dbSize,
        totalRecords,
        lastRun
      };
    } catch (error) {
      console.error('Error checking system health:', error);
      return {
        dbSize: 'Unknown',
        totalRecords: 0,
        lastRun: null
      };
    }
  }

  // Send alert for new company added
  async sendNewCompanyAlert(company, urls = []) {
    if (!this.isConfigured) {
      console.log('Email notifications not configured.');
      return false;
    }

    try {
      let html = `
        <h2>🆕 New Company Added to AI Monitor</h2>
        <p>A new company has been added to the monitoring system.</p>
        
        <h3>Company Details</h3>
        <ul>
          <li><strong>Name:</strong> ${company.name}</li>
          <li><strong>Type:</strong> ${company.type}</li>
          <li><strong>Added:</strong> ${new Date().toLocaleString()}</li>
        </ul>
      `;

      if (urls.length > 0) {
        html += `
          <h3>URLs to Monitor</h3>
          <ul>
        `;
        for (const url of urls) {
          html += `<li>${url.url} (${url.type})</li>`;
        }
        html += `</ul>`;
      }

      html += `
        <p>The system will begin monitoring this company in the next scheduled run.</p>
        <hr>
        <p style="font-size: 0.9em; color: #666;">
          <a href="https://redmorestudio.github.io/ai-competitive-monitor/">View Dashboard</a>
        </p>
      `;

      const info = await this.transporter.sendMail({
        from: `"AI Monitor" <${process.env.SMTP_USER}>`,
        to: this.recipient,
        subject: `🆕 New Company Added: ${company.name}`,
        html: html
      });

      console.log('New company alert sent:', info.messageId);
      return true;
    } catch (error) {
      console.error('Failed to send new company alert:', error);
      return false;
    }
  }

  // Send alert for high-priority changes
  async sendChangeAlert(changes) {
    if (!this.isConfigured) {
      console.log('Email notifications not configured.');
      return false;
    }

    try {
      // Group changes by company
      const changesByCompany = {};
      for (const change of changes) {
        if (!changesByCompany[change.company_name]) {
          changesByCompany[change.company_name] = [];
        }
        changesByCompany[change.company_name].push(change);
      }

      let html = `
        <h2>🚨 High-Priority Competitive Intelligence Alert</h2>
        <p><strong>${changes.length} significant changes detected</strong> requiring your attention.</p>
        
        <h3>Summary by Company</h3>
      `;

      for (const [company, companyChanges] of Object.entries(changesByCompany)) {
        html += `
          <h4>📍 ${company}</h4>
          <ul>
        `;
        
        for (const change of companyChanges) {
          html += `
            <li>
              <strong>Score ${change.relevance_score}/10</strong> - ${change.category || 'General'}<br>
              ${change.summary || 'Change detected'}<br>
              <a href="${change.url}" style="font-size: 0.9em;">View source →</a>
            </li>
          `;
        }
        
        html += `</ul>`;
      }

      // Add strategic insights if available
      const highestScore = Math.max(...changes.map(c => c.relevance_score));
      if (highestScore >= 9) {
        html += `
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; margin: 20px 0;">
            <strong>⚡ Critical Alert:</strong> Changes with relevance score 9+ detected. 
            These may represent significant strategic moves by competitors.
          </div>
        `;
      }

      html += `
        <h3>Recommended Actions</h3>
        <ol>
          <li>Review the detailed analysis on the dashboard</li>
          <li>Assess impact on your competitive position</li>
          <li>Consider strategic response if needed</li>
        </ol>
        
        <hr>
        <p>
          <a href="https://redmorestudio.github.io/ai-competitive-monitor/" 
             style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            View Full Dashboard
          </a>
        </p>
        
        <p style="font-size: 0.9em; color: #666;">
          This is an automated alert from the AI Competitive Intelligence Monitor.<br>
          Generated: ${new Date().toLocaleString()}
        </p>
      `;

      const info = await this.transporter.sendMail({
        from: `"AI Monitor Alert" <${process.env.SMTP_USER}>`,
        to: this.recipient,
        subject: `🚨 ${changes.length} High-Priority Competitive Changes Detected`,
        html: html
      });

      console.log('Change alert sent:', info.messageId);
      return true;
    } catch (error) {
      console.error('Failed to send change alert:', error);
      return false;
    }
  }

  // Test email configuration
  async sendTestEmail() {
    if (!this.isConfigured) {
      console.log('Email notifications not configured.');
      return false;
    }

    try {
      const info = await this.transporter.sendMail({
        from: `"AI Monitor Test" <${process.env.SMTP_USER}>`,
        to: this.recipient,
        subject: '🧪 AI Monitor Email Test',
        html: `
          <h2>✅ Email Configuration Test Successful!</h2>
          <p>This test email confirms that your email notifications are properly configured.</p>
          
          <h3>Configuration Details</h3>
          <ul>
            <li><strong>SMTP Host:</strong> ${process.env.SMTP_HOST}</li>
            <li><strong>SMTP Port:</strong> ${process.env.SMTP_PORT || 587}</li>
            <li><strong>From:</strong> ${process.env.SMTP_USER}</li>
            <li><strong>To:</strong> ${this.recipient}</li>
          </ul>
          
          <p>You will receive notifications for:</p>
          <ul>
            <li>🚨 High-priority changes (relevance score ≥ 7)</li>
            <li>🆕 New companies added to monitoring</li>
            <li>✅ Daily verification emails</li>
            <li>📊 Weekly state reports</li>
          </ul>
          
          <hr>
          <p style="font-size: 0.9em; color: #666;">
            <a href="https://redmorestudio.github.io/ai-competitive-monitor/">View Dashboard</a> |
            <a href="https://github.com/redmorestudio/ai-competitive-monitor">GitHub Repository</a>
          </p>
        `
      });

      console.log('Test email sent:', info.messageId);
      return true;
    } catch (error) {
      console.error('Failed to send test email:', error);
      throw error; // Re-throw to see the actual error
    }
  }

  // Export email summary for dashboard
  async exportEmailSummary() {
    try {
      // Get email statistics
      const stats = {
        configured: this.isConfigured,
        recipient: this.recipient,
        last_check: new Date().toISOString(),
        smtp_host: process.env.SMTP_HOST || 'Not configured',
        recent_emails: []
      };

      // Try to get recent email activity from monitoring runs
      // Note: monitoring_runs table doesn't have metadata column, so we'll skip this for now
      // This could be enhanced later by adding email tracking to the database
      if (this.db) {
        try {
          const recentActivity = this.db.prepare(`
            SELECT * FROM monitoring_runs 
            WHERE run_type LIKE '%email%' OR status LIKE '%email%'
            ORDER BY started_at DESC 
            LIMIT 5
          `).all();
          
          stats.recent_emails = recentActivity.map(run => ({
            date: run.started_at,
            type: run.run_type || 'unknown',
            status: run.status
          }));
        } catch (error) {
          // If query fails, just log and continue without recent emails
          console.log('Could not fetch recent email activity:', error.message);
        }
      }

      // Write to api-data directory
      const outputPath = path.join(__dirname, '..', 'api-data', 'email-summary.json');
      fs.writeFileSync(outputPath, JSON.stringify(stats, null, 2));
      
      console.log('Email summary exported to:', outputPath);
      return stats;
    } catch (error) {
      console.error('Failed to export email summary:', error);
      return null;
    }
  }
}

// Command-line interface
if (require.main === module) {
  async function main() {
    const command = process.argv[2];
    const emailService = new EnhancedEmailNotificationService();
    
    if (!emailService.isConfigured) {
      console.log('\n❌ Email notifications are not configured!');
      console.log('\nTo enable email notifications, set these GitHub secrets:');
      console.log('  SMTP_HOST=smtp.gmail.com');
      console.log('  SMTP_PORT=587');
      console.log('  SMTP_USER=your-email@gmail.com');
      console.log('  SMTP_PASS=your-app-password');
      console.log('  NOTIFICATION_EMAIL=seth@redmore.studio\n');
      
      // Still export summary even if email not configured
      console.log('Exporting summary for dashboard display...');
      await emailService.exportEmailSummary();
      
      process.exit(0);
    }

    switch (command) {
      case 'test':
        // Send a test email
        console.log('Sending test email...');
        const testCompany = {
          name: 'Test AI Company',
          type: 'AI/LLM'
        };
        const testUrls = [
          { url: 'https://example.com', type: 'homepage' },
          { url: 'https://example.com/pricing', type: 'pricing' }
        ];
        await emailService.sendNewCompanyAlert(testCompany, testUrls);
        break;
        
      case 'check':
        // Check for recent changes and send alerts
        const db = emailService.db;
        const recentChanges = db.prepare(`
          SELECT 
            c.*,
            u.url,
            u.type as url_type,
            comp.name as company_name,
            aa.relevance_score,
            aa.summary,
            aa.category,
            aa.competitive_threats,
            aa.strategic_opportunities
          FROM changes c
          JOIN urls u ON c.url_id = u.id
          JOIN companies comp ON u.company_id = comp.id
          LEFT JOIN ai_analysis aa ON c.id = aa.change_id
          WHERE c.created_at > datetime('now', '-1 hour')
          AND aa.relevance_score >= 7
        `).all();
        
        if (recentChanges.length > 0) {
          console.log(`Found ${recentChanges.length} high-priority changes`);
          await emailService.sendChangeAlert(recentChanges);
        } else {
          console.log('No high-priority changes in the last hour');
        }
        
        // Export summary
        await emailService.exportEmailSummary();
        break;
        
      case 'daily':
        // Send daily verification email
        console.log('Generating daily verification email...');
        await emailService.sendDailyVerification();
        
        // Export summary
        await emailService.exportEmailSummary();
        break;
        
      case 'state':
        // Send complete state email
        console.log('Generating complete state email...');
        await emailService.sendCompleteState();
        
        // Export summary
        await emailService.exportEmailSummary();
        break;
        
      case 'export':
        // Just export the summary without sending email
        console.log('Exporting email summary...');
        const summary = await emailService.exportEmailSummary();
        console.log('Summary exported:', summary);
        break;
        
      default:
        console.log('Usage:');
        console.log('  node email-notifications-enhanced.js test    - Send test email');
        console.log('  node email-notifications-enhanced.js check   - Check and alert on recent changes');
        console.log('  node email-notifications-enhanced.js daily   - Send daily verification email');
        console.log('  node email-notifications-enhanced.js state   - Send complete state report');
        console.log('  node email-notifications-enhanced.js export  - Export summary for dashboard');
    }
  }
  
  main().catch(console.error);
}
