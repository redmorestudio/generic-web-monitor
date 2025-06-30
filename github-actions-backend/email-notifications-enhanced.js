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

  // Send a verification email with all companies/URLs
  async sendDailyVerification() {
    if (!this.isConfigured) {
      console.log('Email notifications not configured. Set SMTP_* environment variables.');
      return false;
    }

    try {
      // Get all companies with their URLs
      const companies = this.db.prepare(`
        SELECT c.*, COUNT(u.id) as url_count
        FROM companies c
        LEFT JOIN urls u ON c.id = u.company_id
        WHERE c.enabled = 1
        GROUP BY c.id
        ORDER BY c.name
      `).all();

      // Get all URLs grouped by company
      const urlsByCompany = {};
      companies.forEach(company => {
        const urls = this.db.prepare(`
          SELECT url, type, enabled, last_check, last_content_hash
          FROM urls WHERE company_id = ?
          ORDER BY type, url
        `).all(company.id);
        urlsByCompany[company.id] = urls;
      });

      // Get today's stats
      const stats = this.getDailyStats();
      const totalUrls = Object.values(urlsByCompany).reduce((sum, urls) => sum + urls.length, 0);

      const subject = `AI Monitor Daily Summary - ${companies.length} Companies, ${totalUrls} URLs Monitored`;
      
      let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 24px; }
            .header p { margin: 5px 0 0 0; opacity: 0.9; }
            .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
            .stat-card { background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #e5e7eb; }
            .stat-number { font-size: 28px; font-weight: bold; color: #667eea; }
            .stat-label { font-size: 12px; color: #6b7280; margin-top: 5px; }
            .company-section { margin: 20px 0; background: #f8f9fa; padding: 15px; border-radius: 8px; }
            .company-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
            .company-name { font-size: 18px; font-weight: bold; color: #1a1a2e; }
            .url-count { background: #667eea; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; }
            .url-list { margin: 10px 0; }
            .url-item { background: white; padding: 8px; margin: 5px 0; border-radius: 5px; border: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; }
            .url-type { background: #e5e7eb; padding: 2px 6px; border-radius: 8px; font-size: 11px; color: #6b7280; }
            .url-link { color: #667eea; text-decoration: none; font-size: 14px; word-break: break-all; }
            .recent-changes { background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .change-item { background: white; padding: 10px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #f59e0b; }
            .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
            .cta-button { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 10px; }
            .alert { background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .success { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🤖 AI Competitive Monitor - Daily Summary</h1>
            <p>${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">${companies.length}</div>
              <div class="stat-label">Companies</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${totalUrls}</div>
              <div class="stat-label">URLs</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${stats.totalChanges}</div>
              <div class="stat-label">Changes Today</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${stats.highPriorityChanges}</div>
              <div class="stat-label">High Priority</div>
            </div>
          </div>
      `;

      // Add high-priority alerts if any
      if (stats.highPriorityChanges > 0) {
        htmlContent += `
          <div class="alert">
            <h3 style="margin-top: 0;">⚠️ ${stats.highPriorityChanges} High-Priority Changes Detected</h3>
            <p>These changes require immediate attention. Review them in the dashboard for detailed analysis.</p>
          </div>
        `;
      }

      // Add recent changes summary
      if (stats.totalChanges > 0) {
        htmlContent += `
          <div class="recent-changes">
            <h3 style="margin-top: 0;">📊 Recent Changes Summary</h3>
        `;
        
        stats.topCompanies.slice(0, 5).forEach(company => {
          if (company.change_count > 0) {
            htmlContent += `
              <div class="change-item">
                <strong>${company.name}</strong>: ${company.change_count} changes
                ${company.high_priority_count > 0 ? `(${company.high_priority_count} high priority)` : ''}
              </div>
            `;
          }
        });
        
        htmlContent += `</div>`;
      }

      // Add company details
      htmlContent += `
        <h2 style="margin: 30px 0 20px 0;">📋 Complete Company & URL List</h2>
        <p style="color: #6b7280;">Below is the complete list of all companies and URLs being monitored:</p>
      `;

      companies.forEach(company => {
        const urls = urlsByCompany[company.id] || [];
        const enabledUrls = urls.filter(u => u.enabled);
        
        htmlContent += `
          <div class="company-section">
            <div class="company-header">
              <span class="company-name">${company.name}</span>
              <span class="url-count">${enabledUrls.length} active URLs</span>
            </div>
            <div class="url-list">
        `;
        
        urls.forEach(url => {
          const isEnabled = url.enabled ? '✅' : '❌';
          const lastCheck = url.last_check ? new Date(url.last_check).toLocaleDateString() : 'Never';
          
          htmlContent += `
            <div class="url-item">
              <div>
                ${isEnabled} <a href="${url.url}" class="url-link">${url.url}</a>
                <span class="url-type">${url.type || 'general'}</span>
              </div>
              <div style="font-size: 11px; color: #9ca3af;">Last: ${lastCheck}</div>
            </div>
          `;
        });
        
        htmlContent += `
            </div>
          </div>
        `;
      });

      // Add footer with actions
      htmlContent += `
        <div style="text-align: center; margin: 40px 0;">
          <a href="https://redmorestudio.github.io/ai-competitive-monitor" class="cta-button">
            View Dashboard
          </a>
          <a href="https://github.com/redmorestudio/ai-competitive-monitor/actions" class="cta-button" style="background: #764ba2;">
            Check Workflows
          </a>
        </div>

        <div class="footer">
          <p><strong>Monitoring Schedule:</strong> Every 6 hours (12am, 6am, 12pm, 6pm UTC)</p>
          <p><strong>Next Run:</strong> In approximately ${this.getNextRunTime()} hours</p>
          <p>
            This daily summary is automatically generated by AI Competitive Monitor.<br>
            To add or remove companies, use the dashboard or GitHub Actions.
          </p>
        </div>
        </body>
        </html>
      `;

      // Send email
      const mailOptions = {
        from: process.env.SMTP_USER,
        to: this.recipient,
        subject: subject,
        html: htmlContent
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Daily verification email sent to ${this.recipient}`);
      
      // Log notification
      this.logNotification('daily_verification', companies.length, totalUrls);
      
      return true;
    } catch (error) {
      console.error('Failed to send daily verification email:', error);
      return false;
    }
  }

  // Send alert for new company/URL additions
  async sendNewCompanyAlert(company, urls = []) {
    if (!this.isConfigured) {
      console.log('Email notifications not configured');
      return false;
    }

    try {
      const subject = `🆕 New Company Added: ${company.name}`;
      
      let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #00ff88 0%, #00cc6a 100%); color: #1a1a2e; padding: 20px; border-radius: 10px; margin-bottom: 20px; }
            .content { background: #f8f9fa; padding: 20px; border-radius: 8px; }
            .url-item { background: white; padding: 10px; margin: 10px 0; border-radius: 5px; border: 1px solid #e5e7eb; }
            .cta-button { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🆕 New Company Added to Monitoring</h1>
          </div>
          
          <div class="content">
            <h2>${company.name}</h2>
            <p><strong>Type:</strong> ${company.type || 'Competitor'}</p>
            <p><strong>Added:</strong> ${new Date().toLocaleString()}</p>
            
            ${urls.length > 0 ? `
              <h3>URLs to Monitor (${urls.length})</h3>
              ${urls.map(url => `
                <div class="url-item">
                  <strong>${url.type || 'general'}:</strong> <a href="${url.url}">${url.url}</a>
                </div>
              `).join('')}
            ` : '<p>No URLs added yet. Add URLs through the dashboard.</p>'}
            
            <p style="margin-top: 20px;">
              <strong>Next Steps:</strong><br>
              • The monitoring system will begin scanning these URLs on the next scheduled run<br>
              • Initial baseline data will be captured<br>
              • AI analysis will identify key information and entities<br>
              • You'll receive alerts for any significant changes
            </p>
            
            <div style="text-align: center;">
              <a href="https://redmorestudio.github.io/ai-competitive-monitor" class="cta-button">
                View in Dashboard
              </a>
            </div>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: process.env.SMTP_USER,
        to: this.recipient,
        subject: subject,
        html: htmlContent
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ New company alert sent for: ${company.name}`);
      
      return true;
    } catch (error) {
      console.error('Failed to send new company alert:', error);
      return false;
    }
  }

  // Send complete state email with all metadata except full page content
  async sendCompleteState() {
    if (!this.isConfigured) {
      console.log('Email notifications not configured. Set SMTP_* environment variables.');
      return false;
    }

    try {
      // Get all companies with their metadata
      const companies = this.db.prepare(`
        SELECT c.*, COUNT(u.id) as url_count
        FROM companies c
        LEFT JOIN urls u ON c.id = u.company_id
        WHERE c.enabled = 1
        GROUP BY c.id
        ORDER BY c.name
      `).all();

      // Get detailed information for each company
      const completeState = [];
      
      for (const company of companies) {
        // Get all URLs with detailed info
        const urls = this.db.prepare(`
          SELECT 
            u.*,
            cs.title,
            cs.meta_description,
            cs.word_count,
            cs.full_content_hash,
            cs.created_at as last_scraped,
            GROUP_CONCAT(DISTINCT sk.keyword) as keywords
          FROM urls u
          LEFT JOIN content_snapshots cs ON u.id = cs.url_id 
            AND cs.created_at = (
              SELECT MAX(created_at) FROM content_snapshots WHERE url_id = u.id
            )
          LEFT JOIN snapshot_keywords sk ON cs.id = sk.snapshot_id
          WHERE u.company_id = ?
          GROUP BY u.id
          ORDER BY u.type, u.url
        `).all(company.id);

        // Get recent changes
        const recentChanges = this.db.prepare(`
          SELECT 
            c.*,
            aa.relevance_score,
            aa.summary,
            aa.category,
            aa.entities_json,
            aa.competitive_threats,
            aa.strategic_opportunities
          FROM changes c
          JOIN urls u ON c.url_id = u.id
          LEFT JOIN ai_analysis aa ON c.id = aa.change_id
          WHERE u.company_id = ?
          ORDER BY c.created_at DESC
          LIMIT 5
        `).all(company.id);

        // Get AI insights
        const aiInsights = this.db.prepare(`
          SELECT DISTINCT
            aa.category,
            aa.relevance_score,
            aa.entities_json,
            COUNT(*) as occurrence_count
          FROM ai_analysis aa
          JOIN changes c ON aa.change_id = c.id
          JOIN urls u ON c.url_id = u.id
          WHERE u.company_id = ?
          GROUP BY aa.category
          ORDER BY occurrence_count DESC
        `).all(company.id);

        completeState.push({
          company,
          urls,
          recentChanges,
          aiInsights
        });
      }

      // Build comprehensive email
      const subject = `AI Monitor Complete State Report - ${companies.length} Companies, ${new Date().toLocaleDateString()}`;
      
      let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 1200px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; }
            .header h1 { margin: 0; font-size: 28px; }
            .header p { margin: 10px 0 0 0; opacity: 0.9; }
            .company-block { margin: 30px 0; background: #f8f9fa; padding: 20px; border-radius: 10px; border: 1px solid #e5e7eb; }
            .company-header { background: #667eea; color: white; padding: 15px; border-radius: 8px; margin: -20px -20px 20px -20px; }
            .company-name { font-size: 22px; font-weight: bold; }
            .metadata-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px; margin: 20px 0; }
            .metadata-card { background: white; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; }
            .metadata-label { font-size: 12px; color: #6b7280; text-transform: uppercase; }
            .metadata-value { font-size: 16px; font-weight: bold; color: #1a1a2e; margin-top: 5px; }
            .url-section { margin: 20px 0; }
            .url-card { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border: 1px solid #e5e7eb; }
            .url-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
            .url-link { color: #667eea; text-decoration: none; font-weight: bold; }
            .url-type { background: #e5e7eb; padding: 3px 8px; border-radius: 12px; font-size: 11px; }
            .url-metadata { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 10px 0; font-size: 13px; }
            .keywords { margin: 10px 0; }
            .keyword { background: #ddd6fe; color: #5b21b6; padding: 3px 8px; border-radius: 12px; font-size: 11px; margin: 2px; display: inline-block; }
            .change-item { background: #fef3c7; padding: 10px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #f59e0b; }
            .ai-insight { background: #dbeafe; padding: 10px; margin: 5px 0; border-radius: 5px; }
            .entities { margin: 10px 0; }
            .entity { background: #dcfce7; color: #166534; padding: 3px 8px; border-radius: 12px; font-size: 11px; margin: 2px; display: inline-block; }
            .footer { margin-top: 40px; padding: 20px; background: #f3f4f6; border-radius: 10px; text-align: center; }
            .stats-row { display: flex; justify-content: space-around; margin: 20px 0; }
            .stat { text-align: center; }
            .stat-value { font-size: 24px; font-weight: bold; color: #667eea; }
            .stat-label { font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🔍 AI Competitive Monitor - Complete State Report</h1>
            <p>Comprehensive snapshot of all monitored companies, URLs, keywords, and AI insights</p>
            <p style="font-size: 14px; margin-top: 10px;">Generated: ${new Date().toLocaleString()}</p>
          </div>

          <div class="stats-row">
            <div class="stat">
              <div class="stat-value">${companies.length}</div>
              <div class="stat-label">COMPANIES</div>
            </div>
            <div class="stat">
              <div class="stat-value">${completeState.reduce((sum, c) => sum + c.urls.length, 0)}</div>
              <div class="stat-label">TOTAL URLS</div>
            </div>
            <div class="stat">
              <div class="stat-value">${completeState.reduce((sum, c) => sum + c.urls.filter(u => u.enabled).length, 0)}</div>
              <div class="stat-label">ACTIVE URLS</div>
            </div>
            <div class="stat">
              <div class="stat-value">${completeState.reduce((sum, c) => sum + c.recentChanges.length, 0)}</div>
              <div class="stat-label">RECENT CHANGES</div>
            </div>
          </div>
      `;

      // Add detailed company information
      for (const companyData of completeState) {
        const { company, urls, recentChanges, aiInsights } = companyData;
        const activeUrls = urls.filter(u => u.enabled);
        
        htmlContent += `
          <div class="company-block">
            <div class="company-header">
              <div class="company-name">${company.name}</div>
              <div style="font-size: 14px; margin-top: 5px;">
                Type: ${company.type || 'General'} | 
                ${activeUrls.length} active URLs | 
                ${recentChanges.length} recent changes
              </div>
            </div>

            <div class="metadata-grid">
              <div class="metadata-card">
                <div class="metadata-label">Company ID</div>
                <div class="metadata-value">${company.id}</div>
              </div>
              <div class="metadata-card">
                <div class="metadata-label">Monitoring Since</div>
                <div class="metadata-value">${new Date(company.created_at).toLocaleDateString()}</div>
              </div>
              <div class="metadata-card">
                <div class="metadata-label">Status</div>
                <div class="metadata-value">${company.enabled ? '✅ Active' : '❌ Disabled'}</div>
              </div>
            </div>

            <h3>Monitored URLs</h3>
            <div class="url-section">
        `;
        
        for (const url of urls) {
          const keywords = url.keywords ? url.keywords.split(',') : [];
          
          htmlContent += `
            <div class="url-card">
              <div class="url-header">
                <div>
                  <a href="${url.url}" class="url-link">${url.url}</a>
                  <span class="url-type">${url.type || 'general'}</span>
                  ${url.enabled ? '✅' : '❌'}
                </div>
                <div style="font-size: 12px; color: #6b7280;">
                  ID: ${url.id}
                </div>
              </div>
              
              <div class="url-metadata">
                <div><strong>Last Check:</strong> ${url.last_check ? new Date(url.last_check).toLocaleString() : 'Never'}</div>
                <div><strong>Last Scraped:</strong> ${url.last_scraped ? new Date(url.last_scraped).toLocaleString() : 'Never'}</div>
                <div><strong>Word Count:</strong> ${url.word_count || 'N/A'}</div>
              </div>
              
              ${url.title ? `
                <div style="margin: 10px 0;">
                  <strong>Page Title:</strong> ${url.title}
                </div>
              ` : ''}
              
              ${url.meta_description ? `
                <div style="margin: 10px 0; font-size: 13px; color: #4b5563;">
                  <strong>Description:</strong> ${url.meta_description}
                </div>
              ` : ''}
              
              ${keywords.length > 0 ? `
                <div class="keywords">
                  <strong>Keywords:</strong>
                  ${keywords.map(k => `<span class="keyword">${k.trim()}</span>`).join('')}
                </div>
              ` : ''}
              
              <div style="margin-top: 10px; font-size: 11px; color: #9ca3af;">
                Content Hash: ${url.full_content_hash ? url.full_content_hash.substring(0, 16) + '...' : 'N/A'}
              </div>
            </div>
          `;
        }

        // Add AI insights section
        if (aiInsights.length > 0) {
          htmlContent += `
            <h3>AI Analysis Patterns</h3>
            <div style="margin: 10px 0;">
          `;
          
          for (const insight of aiInsights) {
            const entities = insight.entities_json ? JSON.parse(insight.entities_json) : [];
            
            htmlContent += `
              <div class="ai-insight">
                <strong>${insight.category || 'General'}</strong> - 
                ${insight.occurrence_count} occurrences, 
                Avg Score: ${(insight.relevance_score || 0).toFixed(1)}/10
                ${entities.length > 0 ? `
                  <div class="entities">
                    Entities: ${entities.slice(0, 5).map(e => `<span class="entity">${e}</span>`).join('')}
                    ${entities.length > 5 ? `<span style="font-size: 11px; color: #6b7280;">+${entities.length - 5} more</span>` : ''}
                  </div>
                ` : ''}
              </div>
            `;
          }
          
          htmlContent += '</div>';
        }

        // Add recent changes
        if (recentChanges.length > 0) {
          htmlContent += `
            <h3>Recent Changes</h3>
          `;
          
          for (const change of recentChanges) {
            const entities = change.entities_json ? JSON.parse(change.entities_json) : [];
            
            htmlContent += `
              <div class="change-item">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                  <strong>Score: ${change.relevance_score || 'N/A'}/10</strong>
                  <span style="font-size: 12px;">${new Date(change.created_at).toLocaleString()}</span>
                </div>
                ${change.summary ? `<p style="margin: 5px 0;"><strong>Summary:</strong> ${change.summary}</p>` : ''}
                ${change.category ? `<p style="margin: 5px 0;"><strong>Category:</strong> ${change.category}</p>` : ''}
                ${change.competitive_threats ? `<p style="margin: 5px 0;"><strong>Threats:</strong> ${change.competitive_threats}</p>` : ''}
                ${change.strategic_opportunities ? `<p style="margin: 5px 0;"><strong>Opportunities:</strong> ${change.strategic_opportunities}</p>` : ''}
                ${entities.length > 0 ? `
                  <div class="entities">
                    <strong>Entities:</strong> ${entities.map(e => `<span class="entity">${e}</span>`).join('')}
                  </div>
                ` : ''}
              </div>
            `;
          }
        }

        htmlContent += '</div>';
      }

      // Add footer
      htmlContent += `
        <div class="footer">
          <h3>Complete State Report Summary</h3>
          <p>This report contains the complete current state of the AI Competitive Monitor system.</p>
          <p>
            <strong>Included:</strong> All companies, URLs, keywords, metadata, AI insights, and recent changes<br>
            <strong>Excluded:</strong> Full page content (available in dashboard)
          </p>
          <div style="margin-top: 20px;">
            <a href="https://redmorestudio.github.io/ai-competitive-monitor" 
               style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 5px;">
              View Dashboard
            </a>
            <a href="https://github.com/redmorestudio/ai-competitive-monitor" 
               style="background: #1a1a2e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 5px;">
              GitHub Repository
            </a>
          </div>
          <p style="margin-top: 20px; font-size: 12px; color: #6b7280;">
            Generated by AI Competitive Monitor<br>
            Next scheduled run: ${this.getNextRunTime()} hours
          </p>
        </div>
        </body>
        </html>
      `;

      // Send email
      const mailOptions = {
        from: process.env.SMTP_USER,
        to: this.recipient,
        subject: subject,
        html: htmlContent
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Complete state email sent to ${this.recipient}`);
      
      // Log notification
      this.logNotification('complete_state', companies.length, completeState.reduce((sum, c) => sum + c.urls.length, 0));
      
      return true;
    } catch (error) {
      console.error('Failed to send complete state email:', error);
      return false;
    }
  }

  // Send alert for high-priority changes
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
        to: this.recipient,
        subject: subject,
        html: htmlContent
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Alert email sent for ${highPriorityChanges.length} changes`);
      
      // Log notification in database
      this.logNotification('alert', highPriorityChanges.length, Object.keys(changesByCompany).length);
      
      return true;
    } catch (error) {
      console.error('Failed to send email notification:', error);
      return false;
    }
  }

  // Get daily statistics
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

    return {
      totalChanges: changes.length,
      highPriorityChanges: highPriorityChanges.length,
      companiesWithChanges: topCompanies.length,
      topCompanies
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

  logNotification(type, companyCount, urlCount = 0) {
    // Create notifications table if not exists
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS email_notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        company_count INTEGER,
        url_count INTEGER,
        sent_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    this.db.prepare(`
      INSERT INTO email_notifications (type, company_count, url_count)
      VALUES (?, ?, ?)
    `).run(type, companyCount, urlCount);
  }

  // Export monitoring summary for static file generation
  async exportEmailSummary() {
    const companies = this.db.prepare(`
      SELECT c.*, COUNT(u.id) as url_count
      FROM companies c
      LEFT JOIN urls u ON c.id = u.company_id
      WHERE c.enabled = 1
      GROUP BY c.id
      ORDER BY c.name
    `).all();

    const stats = this.getDailyStats();
    
    const summary = {
      generated_at: new Date().toISOString(),
      recipient: this.recipient,
      companies_count: companies.length,
      total_urls: companies.reduce((sum, c) => sum + c.url_count, 0),
      changes_today: stats.totalChanges,
      high_priority_changes: stats.highPriorityChanges,
      email_configured: this.isConfigured,
      next_run_hours: this.getNextRunTime()
    };

    // Save to api-data directory
    const apiDataPath = path.join(__dirname, '..', 'api-data');
    if (!fs.existsSync(apiDataPath)) {
      fs.mkdirSync(apiDataPath, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(apiDataPath, 'email-summary.json'),
      JSON.stringify(summary, null, 2)
    );

    return summary;
  }
}

// Export for use in other modules
module.exports = EnhancedEmailNotificationService;

// CLI interface
if (require.main === module) {
  async function main() {
    const args = process.argv.slice(2);
    const command = args[0] || 'check';
    
    const emailService = new EnhancedEmailNotificationService();
    
    // Log environment for debugging
    console.log('Email Configuration Status:');
    console.log('SMTP_HOST:', process.env.SMTP_HOST ? '✓ Set' : '✗ Missing');
    console.log('SMTP_PORT:', process.env.SMTP_PORT || '587 (default)');
    console.log('SMTP_USER:', process.env.SMTP_USER ? '✓ Set' : '✗ Missing');
    console.log('SMTP_PASS:', process.env.SMTP_PASS ? '✓ Set' : '✗ Missing');
    console.log('NOTIFICATION_EMAIL:', process.env.NOTIFICATION_EMAIL || 'Not set (will use SMTP_USER)');
    console.log('Email Configured:', emailService.isConfigured ? '✓ Yes' : '✗ No');
    console.log('Recipient:', emailService.recipient);
    console.log('');
    
    if (!emailService.isConfigured && command !== 'export') {
      console.log('\n⚠️  Email notifications not configured!');
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
