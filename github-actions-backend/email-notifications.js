const nodemailer = require('nodemailer');
const Database = require('better-sqlite3');
const path = require('path');
// Only load dotenv in development (not in GitHub Actions)
if (!process.env.GITHUB_ACTIONS && !process.env.POSTGRES_CONNECTION_STRING) {
  try {
    require('dotenv').config();
  } catch (e) {
    // dotenv not available or no .env file - this is fine
  }
}

class EmailNotificationService {
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
    
    if (this.isConfigured) {
      // Create transporter
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    }
  }

  async sendChangeAlert(changes) {
    if (!this.isConfigured) {
      console.log('Email notifications not configured. Set SMTP_* environment variables.');
      return false;
    }

    try {
      // Filter high-priority changes
      const highPriorityChanges = changes.filter(c => c.relevance_score >= 7);
      
      if (highPriorityChanges.length === 0) {
        console.log('No high-priority changes to report');
        return false;
      }

      // Group changes by company
      const changesByCompany = {};
      highPriorityChanges.forEach(change => {
        if (!changesByCompany[change.company_name]) {
          changesByCompany[change.company_name] = [];
        }
        changesByCompany[change.company_name].push(change);
      });

      // Build email content
      const subject = `AI Monitor Alert: ${highPriorityChanges.length} High-Priority Changes Detected`;
      
      let htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a1a2e; border-bottom: 2px solid #667eea; padding-bottom: 10px;">
            AI Competitive Monitor Alert
          </h2>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #ef4444;">
              ⚠️ ${highPriorityChanges.length} High-Priority Changes Detected
            </h3>
            <p style="margin: 5px 0;">
              <strong>Time:</strong> ${new Date().toLocaleString()}<br>
              <strong>Companies Affected:</strong> ${Object.keys(changesByCompany).length}
            </p>
          </div>
      `;

      // Add changes by company
      for (const [company, companyChanges] of Object.entries(changesByCompany)) {
        htmlContent += `
          <div style="margin: 20px 0; border-left: 4px solid #667eea; padding-left: 15px;">
            <h3 style="color: #1a1a2e; margin-bottom: 10px;">${company}</h3>
        `;
        
        companyChanges.forEach(change => {
          const color = change.relevance_score >= 8 ? '#ef4444' : '#f59e0b';
          htmlContent += `
            <div style="background-color: #f9fafb; padding: 10px; margin-bottom: 10px; border-radius: 5px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <strong style="color: ${color};">Score: ${change.relevance_score}/10</strong>
                <span style="font-size: 12px; color: #6b7280;">${change.url_type} page</span>
              </div>
              
              <p style="margin: 10px 0 5px 0; font-weight: bold;">${change.summary || 'Change detected'}</p>
              
              ${change.category ? `<p style="margin: 5px 0; font-size: 14px;"><strong>Category:</strong> ${change.category}</p>` : ''}
              
              ${change.competitive_threats ? `
                <p style="margin: 5px 0; font-size: 14px;">
                  <strong>Threats:</strong> ${change.competitive_threats}
                </p>
              ` : ''}
              
              ${change.strategic_opportunities ? `
                <p style="margin: 5px 0; font-size: 14px;">
                  <strong>Opportunities:</strong> ${change.strategic_opportunities}
                </p>
              ` : ''}
              
              <a href="${change.url}" style="font-size: 12px; color: #667eea;">View Page →</a>
            </div>
          `;
        });
        
        htmlContent += '</div>';
      }

      // Add footer
      htmlContent += `
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="text-align: center; margin-bottom: 10px;">
            <a href="https://redmorestudio.github.io/ai-competitive-monitor" 
               style="background-color: #667eea; color: white; padding: 10px 20px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              View Full Dashboard
            </a>
          </p>
          
          <p style="font-size: 12px; color: #6b7280; text-align: center;">
            This is an automated alert from AI Competitive Monitor.<br>
            Monitoring ${this.getCompanyCount()} companies across the AI ecosystem.
          </p>
        </div>
      </div>
      `;

      // Send email
      const mailOptions = {
        from: process.env.SMTP_USER,
        to: process.env.NOTIFICATION_EMAIL || process.env.SMTP_USER,
        subject: subject,
        html: htmlContent
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Alert email sent for ${highPriorityChanges.length} changes`);
      
      // Log notification in database
      this.logNotification(highPriorityChanges.length, Object.keys(changesByCompany).length);
      
      return true;
    } catch (error) {
      console.error('Failed to send email notification:', error);
      return false;
    }
  }

  async sendDailySummary() {
    if (!this.isConfigured) {
      console.log('Email notifications not configured');
      return false;
    }

    try {
      // Get last 24 hours of activity
      const stats = this.getDailyStats();
      
      // Only send if there's activity
      if (stats.totalChanges === 0) {
        console.log('No changes in the last 24 hours, skipping daily summary');
        return false;
      }

      const subject = `AI Monitor Daily Summary: ${stats.totalChanges} Changes Detected`;
      
      let htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a1a2e; border-bottom: 2px solid #667eea; padding-bottom: 10px;">
            Daily Competitive Intelligence Summary
          </h2>
          
          <p style="color: #6b7280; margin: 10px 0;">
            ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;">
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center;">
              <div style="font-size: 32px; font-weight: bold; color: #1a1a2e;">${stats.totalChanges}</div>
              <div style="font-size: 14px; color: #6b7280;">Total Changes</div>
            </div>
            
            <div style="background-color: #fee2e2; padding: 15px; border-radius: 8px; text-align: center;">
              <div style="font-size: 32px; font-weight: bold; color: #ef4444;">${stats.highPriorityChanges}</div>
              <div style="font-size: 14px; color: #6b7280;">High Priority</div>
            </div>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1a1a2e;">Activity by Company</h3>
            <div style="margin-top: 10px;">
      `;

      // Add top 10 most active companies
      stats.topCompanies.slice(0, 10).forEach(company => {
        const width = (company.change_count / stats.topCompanies[0].change_count) * 100;
        htmlContent += `
          <div style="margin-bottom: 10px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
              <span style="font-size: 14px;">${company.name}</span>
              <span style="font-size: 14px; color: #6b7280;">${company.change_count} changes</span>
            </div>
            <div style="background-color: #e5e7eb; height: 20px; border-radius: 10px; overflow: hidden;">
              <div style="background-color: #667eea; height: 100%; width: ${width}%; 
                          display: flex; align-items: center; padding-left: 5px;">
                ${company.high_priority_count > 0 ? 
                  `<span style="font-size: 11px; color: white;">${company.high_priority_count} high</span>` : ''}
              </div>
            </div>
          </div>
        `;
      });

      htmlContent += `
            </div>
          </div>
          
          ${stats.insights.length > 0 ? `
            <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1a1a2e;">Key Insights</h3>
              <ul style="margin: 10px 0; padding-left: 20px;">
                ${stats.insights.map(insight => `<li style="margin-bottom: 5px;">${insight}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="text-align: center; margin-bottom: 10px;">
              <a href="https://redmorestudio.github.io/ai-competitive-monitor" 
                 style="background-color: #667eea; color: white; padding: 10px 20px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;">
                View Detailed Dashboard
              </a>
            </p>
            
            <p style="font-size: 12px; color: #6b7280; text-align: center;">
              Daily summary generated at ${new Date().toLocaleTimeString()}<br>
              Next monitoring run in ${this.getNextRunTime()} hours
            </p>
          </div>
        </div>
      `;

      // Send email
      const mailOptions = {
        from: process.env.SMTP_USER,
        to: process.env.NOTIFICATION_EMAIL || process.env.SMTP_USER,
        subject: subject,
        html: htmlContent
      };

      await this.transporter.sendMail(mailOptions);
      console.log('✅ Daily summary email sent');
      
      return true;
    } catch (error) {
      console.error('Failed to send daily summary:', error);
      return false;
    }
  }

  // Helper methods
  getDailyStats() {
    const changes = this.db.prepare(`
      SELECT 
        c.*,
        comp.name as company_name,
        aa.relevance_score,
        aa.summary,
        aa.category
      FROM changes c
      JOIN urls u ON c.url_id = u.id
      JOIN companies comp ON u.company_id = comp.id
      LEFT JOIN ai_analysis aa ON c.id = aa.change_id
      WHERE c.created_at > datetime('now', '-24 hours')
    `).all();

    const highPriorityChanges = changes.filter(c => c.relevance_score >= 7);
    
    // Group by company
    const companyStats = {};
    changes.forEach(change => {
      if (!companyStats[change.company_name]) {
        companyStats[change.company_name] = {
          name: change.company_name,
          change_count: 0,
          high_priority_count: 0
        };
      }
      companyStats[change.company_name].change_count++;
      if (change.relevance_score >= 7) {
        companyStats[change.company_name].high_priority_count++;
      }
    });

    const topCompanies = Object.values(companyStats)
      .sort((a, b) => b.change_count - a.change_count);

    // Generate insights
    const insights = [];
    if (highPriorityChanges.length > 0) {
      insights.push(`${highPriorityChanges.length} high-priority changes require immediate attention`);
    }
    if (topCompanies.length > 0) {
      insights.push(`${topCompanies[0].name} showed the most activity with ${topCompanies[0].change_count} changes`);
    }
    
    const categories = [...new Set(changes.map(c => c.category).filter(Boolean))];
    if (categories.length > 0) {
      insights.push(`Changes detected across ${categories.length} categories: ${categories.slice(0, 3).join(', ')}`);
    }

    return {
      totalChanges: changes.length,
      highPriorityChanges: highPriorityChanges.length,
      companiesWithChanges: topCompanies.length,
      topCompanies,
      insights
    };
  }

  getCompanyCount() {
    return this.db.prepare('SELECT COUNT(*) as count FROM companies WHERE enabled = 1').get().count;
  }

  getNextRunTime() {
    // Assuming runs every 6 hours
    const now = new Date();
    const nextRun = new Date(now);
    nextRun.setHours(Math.ceil(now.getHours() / 6) * 6, 0, 0, 0);
    if (nextRun <= now) {
      nextRun.setHours(nextRun.getHours() + 6);
    }
    return Math.round((nextRun - now) / (1000 * 60 * 60));
  }

  logNotification(changeCount, companyCount) {
    // Create notifications table if not exists
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS email_notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        change_count INTEGER,
        company_count INTEGER,
        sent_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    this.db.prepare(`
      INSERT INTO email_notifications (type, change_count, company_count)
      VALUES ('alert', ?, ?)
    `).run(changeCount, companyCount);
  }
}

// Export for use in other modules
module.exports = EmailNotificationService;

// CLI interface
if (require.main === module) {
  async function main() {
    const args = process.argv.slice(2);
    const command = args[0] || 'check';
    
    const emailService = new EmailNotificationService();
    
    if (!emailService.isConfigured) {
      console.log('\n⚠️  Email notifications not configured!');
      console.log('\nTo enable email notifications, add these to your .env file:');
      console.log('  SMTP_HOST=smtp.gmail.com');
      console.log('  SMTP_PORT=587');
      console.log('  SMTP_USER=your-email@gmail.com');
      console.log('  SMTP_PASS=your-app-password');
      console.log('  NOTIFICATION_EMAIL=recipient@example.com (optional)\n');
      process.exit(1);
    }

    switch (command) {
      case 'test':
        // Send a test email
        console.log('Sending test email...');
        const testChange = [{
          company_name: 'Test Company',
          url: 'https://example.com',
          url_type: 'homepage',
          relevance_score: 8,
          summary: 'This is a test alert',
          category: 'Product Launch',
          competitive_threats: 'Test threat',
          strategic_opportunities: 'Test opportunity'
        }];
        await emailService.sendChangeAlert(testChange);
        break;
        
      case 'check':
        // Check for recent high-priority changes and send alerts
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
        break;
        
      case 'daily':
        // Send daily summary
        console.log('Generating daily summary...');
        await emailService.sendDailySummary();
        break;
        
      default:
        console.log('Usage:');
        console.log('  node email-notifications.js test    - Send test email');
        console.log('  node email-notifications.js check   - Check and alert on recent changes');
        console.log('  node email-notifications.js daily   - Send daily summary');
    }
  }
  
  main().catch(console.error);
}
