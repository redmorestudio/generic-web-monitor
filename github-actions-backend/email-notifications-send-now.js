const nodemailer = require('nodemailer');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

class SendNowEmailService {
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
    .company-header { background-color: #e9ecef; padding: 10px; margin-top: 20px; font-weight: bold; }
    .change-item { border-left: 4px solid #007bff; padding-left: 10px; margin: 10px 0; }
    .high-priority { border-left-color: #dc3545; }
    .medium-priority { border-left-color: #ffc107; }
    .low-priority { border-left-color: #28a745; }
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
  async sendEmail(mailOptions) {
    if (this.testMode) {
      return await this.saveTestEmail(mailOptions.subject, mailOptions.html);
    } else if (this.isConfigured) {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);
      return info;
    } else {
      console.log('Email not configured and not in test mode. Skipping.');
      return null;
    }
  }

  // Format HTML for email
  formatEmailHtml(title, content) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    h1, h2, h3 { color: #2c3e50; }
    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #3498db; color: white; }
    .priority-high { background-color: #f8d7da; }
    .priority-medium { background-color: #fff3cd; }
    .priority-low { background-color: #d4edda; }
    .score { font-weight: bold; }
    .url { color: #3498db; text-decoration: none; }
    .metric { background-color: #f0f0f0; padding: 5px 10px; border-radius: 3px; margin: 2px; display: inline-block; }
    .company-section { margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 5px; }
    .change-item { border-left: 4px solid #007bff; padding-left: 10px; margin: 10px 0; }
    .high-priority { border-left-color: #dc3545; }
    .medium-priority { border-left-color: #ffc107; }
    .low-priority { border-left-color: #28a745; }
    .timestamp { color: #666; font-size: 0.9em; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 0.9em; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${content}
  <div class="footer">
    <p>
      Generated at ${new Date().toLocaleString()}<br>
      <a href="https://redmorestudio.github.io/ai-competitive-monitor/">View Dashboard</a> |
      <a href="https://github.com/redmorestudio/ai-competitive-monitor">GitHub Repository</a>
    </p>
  </div>
</body>
</html>`;
  }

  // Send changes email with flexible time range
  async sendChanges(options = {}) {
    const { 
      hours = 24, 
      minScore = 0,
      company = null,
      includeAIAnalysis = true 
    } = options;

    try {
      console.log(`\n📋 Gathering changes from last ${hours} hours...`);
      
      // Build query with optional company filter
      let query = `
        SELECT 
          cd.*,
          cd.detected_at as created_at,
          cd.relevance_score as interest_level,
          cd.summary as change_summary,
          cc.url,
          cc.company_name,
          cc.detected_at
        FROM change_detection cd
        JOIN content_changes cc ON cd.url_id = cc.url_id 
          AND cd.detected_at = cc.detected_at
        WHERE cd.detected_at > datetime('now', '-${hours} hours')
        AND cd.relevance_score >= ${minScore}
      `;
      
      if (company) {
        query += ` AND LOWER(cc.company_name) LIKE LOWER('%${company}%')`;
      }
      
      query += ` ORDER BY cd.relevance_score DESC, cd.detected_at DESC`;
      
      const changes = this.processedDb.prepare(query).all();
      
      if (changes.length === 0) {
        console.log('No changes found for the specified criteria.');
        return false;
      }

      console.log(`Found ${changes.length} changes`);

      // Group changes by company
      const changesByCompany = {};
      changes.forEach(change => {
        const companyName = change.company_name || 'Unknown';
        if (!changesByCompany[companyName]) {
          changesByCompany[companyName] = [];
        }
        changesByCompany[companyName].push(change);
      });

      // Build HTML content
      let content = `
        <p>Found <strong>${changes.length}</strong> changes in the last ${hours} hours${company ? ` for ${company}` : ''}${minScore > 0 ? ` with score ≥ ${minScore}` : ''}.</p>
      `;

      // Summary statistics
      const highPriority = changes.filter(c => c.interest_level >= 8).length;
      const mediumPriority = changes.filter(c => c.interest_level >= 5 && c.interest_level < 8).length;
      const lowPriority = changes.filter(c => c.interest_level < 5).length;

      content += `
        <div style="margin: 20px 0;">
          <span class="metric" style="background-color: #f8d7da;">High Priority: ${highPriority}</span>
          <span class="metric" style="background-color: #fff3cd;">Medium Priority: ${mediumPriority}</span>
          <span class="metric" style="background-color: #d4edda;">Low Priority: ${lowPriority}</span>
        </div>
      `;

      // Changes by company
      Object.keys(changesByCompany).sort().forEach(companyName => {
        const companyChanges = changesByCompany[companyName];
        content += `
          <div class="company-section">
            <h2>${companyName} (${companyChanges.length} changes)</h2>
        `;

        companyChanges.forEach(change => {
          const priorityClass = change.interest_level >= 8 ? 'high-priority' : 
                               change.interest_level >= 5 ? 'medium-priority' : 'low-priority';
          
          content += `
            <div class="change-item ${priorityClass}">
              <strong>Score: ${change.interest_level}/10</strong> - ${change.change_type || 'Content Change'}<br>
              <a href="${change.url}" class="url">${change.url}</a><br>
              <p>${change.change_summary || 'No summary available'}</p>
              <span class="timestamp">${new Date(change.detected_at).toLocaleString()}</span>
            </div>
          `;
        });

        content += `</div>`;
      });

      // If requested, add AI analysis insights
      if (includeAIAnalysis && changes.length > 0) {
        const recentAnalysis = this.intelligenceDb.prepare(`
          SELECT 
            company_name,
            ai_summary,
            key_topics,
            key_technologies,
            sentiment,
            relevance_score,
            last_analyzed
          FROM current_intelligence
          WHERE last_analyzed > datetime('now', '-${hours} hours')
          ${company ? `AND LOWER(company_name) LIKE LOWER('%${company}%')` : ''}
          ORDER BY last_analyzed DESC
          LIMIT 10
        `).all();

        if (recentAnalysis.length > 0) {
          content += `
            <h2>AI Analysis Insights</h2>
            <div style="margin: 20px 0;">
          `;

          recentAnalysis.forEach(analysis => {
            content += `
              <div class="company-section">
                <h3>${analysis.company_name}</h3>
                ${analysis.ai_summary ? `<p><strong>Summary:</strong> ${analysis.ai_summary}</p>` : ''}
                ${analysis.key_topics ? `<p><strong>Key Topics:</strong> ${analysis.key_topics}</p>` : ''}
                ${analysis.key_technologies ? `<p><strong>Technologies:</strong> ${analysis.key_technologies}</p>` : ''}
                ${analysis.sentiment ? `<p><strong>Sentiment:</strong> ${analysis.sentiment}</p>` : ''}
                ${analysis.relevance_score ? `<p><strong>Relevance Score:</strong> ${analysis.relevance_score}/10</p>` : ''}
                <span class="timestamp">Analyzed: ${new Date(analysis.last_analyzed).toLocaleString()}</span>
              </div>
            `;
          });

          content += `</div>`;
        }
      }

      const subject = `🔄 AI Monitor: ${changes.length} Changes Detected${company ? ` for ${company}` : ''}${highPriority > 0 ? ' ⚠️' : ''}`;
      const html = this.formatEmailHtml('AI Monitor - Recent Changes', content);

      await this.sendEmail({
        from: `"AI Monitor" <${this.fromEmail}>`,
        to: this.recipient,
        subject: subject,
        html: html
      });

      return true;
    } catch (error) {
      console.error('Failed to send changes email:', error);
      return false;
    }
  }

  // Send state email with optional company filter
  async sendState(options = {}) {
    const { company = null, includeUrls = true, includeKeywords = true } = options;

    try {
      console.log(`\n📊 Generating state report${company ? ` for ${company}` : ''}...`);

      // Build query with optional company filter
      let companyQuery = `
        SELECT 
          c.*,
          GROUP_CONCAT(u.url, '||') as urls
        FROM companies c
        LEFT JOIN urls u ON c.id = u.company_id
      `;

      if (company) {
        companyQuery += ` WHERE LOWER(c.name) LIKE LOWER('%${company}%')`;
      }

      companyQuery += ` GROUP BY c.id ORDER BY c.category, c.name`;

      const companies = this.intelligenceDb.prepare(companyQuery).all();
      console.log(`Found ${companies.length} companies`);

      if (companies.length === 0) {
        console.log('No companies found for the specified criteria.');
        return false;
      }

      // Get statistics
      const stats = {
        totalCompanies: companies.length,
        totalUrls: this.intelligenceDb.prepare('SELECT COUNT(*) as count FROM urls').get().count,
        categoryCounts: {}
      };

      // Count by category
      companies.forEach(company => {
        const category = company.category || 'Uncategorized';
        stats.categoryCounts[category] = (stats.categoryCounts[category] || 0) + 1;
      });

      // Build HTML content
      let content = `
        <h2>System Overview</h2>
        <p>Monitoring <strong>${stats.totalCompanies}</strong> companies across <strong>${stats.totalUrls}</strong> URLs.</p>
      `;

      // Category breakdown
      content += `
        <div style="margin: 20px 0;">
          <h3>Companies by Category</h3>
      `;

      Object.entries(stats.categoryCounts).sort().forEach(([category, count]) => {
        content += `<span class="metric">${category}: ${count}</span> `;
      });

      content += `</div>`;

      // Companies detail
      content += `<h2>Monitored Companies</h2>`;

      // Group by category
      const companiesByCategory = {};
      companies.forEach(company => {
        const category = company.category || 'Uncategorized';
        if (!companiesByCategory[category]) {
          companiesByCategory[category] = [];
        }
        companiesByCategory[category].push(company);
      });

      Object.keys(companiesByCategory).sort().forEach(category => {
        content += `
          <div class="company-section">
            <h3>${category} (${companiesByCategory[category].length} companies)</h3>
        `;

        companiesByCategory[category].forEach(company => {
          content += `
            <div style="margin: 15px 0; padding: 10px; border-left: 3px solid #3498db;">
              <h4>${company.name}</h4>
          `;

          if (company.description) {
            content += `<p>${company.description}</p>`;
          }

          if (includeUrls && company.urls) {
            const urls = company.urls.split('||').filter(u => u);
            content += `<p><strong>URLs (${urls.length}):</strong></p><ul>`;
            urls.forEach(url => {
              content += `<li><a href="${url}" class="url">${url}</a></li>`;
            });
            content += `</ul>`;
          }

          if (includeKeywords) {
            // Get keywords from baseline_analysis
            const analysis = this.intelligenceDb.prepare(`
              SELECT 
                ba.entities,
                ba.semantic_categories,
                ba.competitive_data
              FROM baseline_analysis ba
              JOIN urls u ON ba.url_id = u.id
              WHERE u.company_id = ?
              ORDER BY ba.created_at DESC
              LIMIT 1
            `).get(company.id);
            
            if (analysis) {
              try {
                // Extract key information from JSON
                let keywords = new Set();
                let technologies = new Set();
                let topics = new Set();
                
                if (analysis.entities) {
                  const entities = JSON.parse(analysis.entities);
                  
                  // Extract products
                  if (entities.products) {
                    entities.products.forEach(p => {
                      keywords.add(p.name);
                      if (p.ai_capabilities) {
                        p.ai_capabilities.forEach(cap => keywords.add(cap));
                      }
                    });
                  }
                  
                  // Extract technologies
                  if (entities.technologies) {
                    entities.technologies.forEach(t => {
                      technologies.add(t.name);
                      keywords.add(t.name);
                    });
                  }
                  
                  // Extract AI/ML concepts
                  if (entities.ai_ml_concepts) {
                    entities.ai_ml_concepts.forEach(c => {
                      topics.add(c.concept);
                      keywords.add(c.concept);
                    });
                  }
                  
                  // Extract people
                  if (entities.people) {
                    entities.people.forEach(p => {
                      keywords.add(p.name);
                      if (p.role) keywords.add(p.role);
                    });
                  }
                }
                
                if (analysis.semantic_categories) {
                  const categories = JSON.parse(analysis.semantic_categories);
                  if (categories.core_capabilities) {
                    categories.core_capabilities.forEach(cap => topics.add(cap));
                  }
                  if (categories.business_focus) {
                    categories.business_focus.forEach(focus => topics.add(focus));
                  }
                  if (categories.value_props) {
                    categories.value_props.forEach(prop => keywords.add(prop));
                  }
                }
                
                // Display the extracted information
                if (keywords.size > 0) {
                  content += `<p><strong>Keywords:</strong> ${Array.from(keywords).slice(0, 10).join(', ')}</p>`;
                }
                if (technologies.size > 0) {
                  content += `<p><strong>Technologies:</strong> ${Array.from(technologies).join(', ')}</p>`;
                }
                if (topics.size > 0) {
                  content += `<p><strong>Key Topics:</strong> ${Array.from(topics).join(', ')}</p>`;
                }
              } catch (e) {
                console.error('Error parsing JSON data for', company.name, e);
              }
            }
          }

          content += `</div>`;
        });

        content += `</div>`;
      });

      // Recent high-priority changes
      const recentHighPriority = this.processedDb.prepare(`
        SELECT 
          cc.company_name,
          cd.relevance_score,
          cd.summary,
          cd.detected_at
        FROM change_detection cd
        JOIN content_changes cc ON cd.url_id = cc.url_id 
          AND cd.detected_at = cc.detected_at
        WHERE cd.detected_at > datetime('now', '-7 days')
        AND cd.relevance_score >= 8
        ${company ? `AND LOWER(cc.company_name) LIKE LOWER('%${company}%')` : ''}
        ORDER BY cd.relevance_score DESC
        LIMIT 10
      `).all();

      if (recentHighPriority.length > 0) {
        content += `
          <h2>Recent High-Priority Changes</h2>
          <div style="margin: 20px 0;">
        `;

        recentHighPriority.forEach(change => {
          content += `
            <div class="change-item high-priority">
              <strong>${change.company_name}</strong> - Score: ${change.relevance_score}/10<br>
              ${change.summary || 'No summary available'}<br>
              <span class="timestamp">${new Date(change.detected_at).toLocaleString()}</span>
            </div>
          `;
        });

        content += `</div>`;
      }

      const subject = `📊 AI Monitor State Report${company ? ` - ${company}` : ` - ${stats.totalCompanies} companies`}`;
      const html = this.formatEmailHtml('AI Monitor - System State', content);

      await this.sendEmail({
        from: `"AI Monitor" <${this.fromEmail}>`,
        to: this.recipient,
        subject: subject,
        html: html
      });

      return true;
    } catch (error) {
      console.error('Failed to send state email:', error);
      return false;
    }
  }

  // Quick test email
  async sendTest() {
    try {
      const html = this.formatEmailHtml('Test Email', `
        <p>This is a test email from the AI Competitive Monitor system.</p>
        <p>If you received this email, your email configuration is working correctly!</p>
        <div style="margin: 20px 0;">
          <h3>Configuration Details:</h3>
          <ul>
            <li>SMTP Host: ${process.env.SMTP_HOST || 'Not configured'}</li>
            <li>SMTP Port: ${process.env.SMTP_PORT || '587'}</li>
            <li>From: ${this.fromEmail}</li>
            <li>To: ${this.recipient}</li>
            <li>Test Mode: ${this.testMode ? 'Yes' : 'No'}</li>
          </ul>
        </div>
      `);

      await this.sendEmail({
        from: `"AI Monitor Test" <${this.fromEmail}>`,
        to: this.recipient,
        subject: '🧪 AI Monitor - Test Email',
        html: html
      });

      console.log('✅ Test email sent successfully!');
      return true;
    } catch (error) {
      console.error('Failed to send test email:', error);
      return false;
    }
  }
}

// Command-line interface
if (require.main === module) {
  async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    const emailService = new SendNowEmailService();
    
    console.log('\n📧 AI Monitor - Send Email Now');
    console.log('================================');
    
    if (!emailService.isConfigured && !emailService.testMode) {
      console.log('\n❌ Email notifications are not configured!');
      console.log('\nTo enable email notifications, set these environment variables:');
      console.log('  SMTP_HOST=smtp.gmail.com');
      console.log('  SMTP_PORT=587');
      console.log('  SMTP_USER=your-email@gmail.com');
      console.log('  SMTP_PASS=your-app-password');
      console.log('  EMAIL_TO=recipient@example.com');
      console.log('\nOr run in test mode with: --test-mode');
      process.exit(1);
    }

    if (emailService.testMode) {
      console.log('\n🧪 Running in TEST MODE - emails will be saved to files\n');
    }

    // Parse options
    const options = {};
    for (let i = 1; i < args.length; i++) {
      if (args[i] === '--hours' && args[i + 1]) {
        options.hours = parseInt(args[i + 1]);
        i++;
      } else if (args[i] === '--company' && args[i + 1]) {
        options.company = args[i + 1];
        i++;
      } else if (args[i] === '--min-score' && args[i + 1]) {
        options.minScore = parseInt(args[i + 1]);
        i++;
      } else if (args[i] === '--no-urls') {
        options.includeUrls = false;
      } else if (args[i] === '--no-keywords') {
        options.includeKeywords = false;
      } else if (args[i] === '--no-ai') {
        options.includeAIAnalysis = false;
      }
    }

    switch (command) {
      case 'test':
        console.log('Sending test email...');
        await emailService.sendTest();
        break;
        
      case 'changes':
        console.log('Sending changes email...');
        if (options.hours) console.log(`  Time range: ${options.hours} hours`);
        if (options.company) console.log(`  Company filter: ${options.company}`);
        if (options.minScore) console.log(`  Minimum score: ${options.minScore}`);
        await emailService.sendChanges(options);
        break;
        
      case 'state':
        console.log('Sending state email...');
        if (options.company) console.log(`  Company filter: ${options.company}`);
        await emailService.sendState(options);
        break;
        
      default:
        console.log('\nUsage:');
        console.log('  node email-notifications-send-now.js <command> [options]');
        console.log('\nCommands:');
        console.log('  test      - Send a test email to verify configuration');
        console.log('  changes   - Send recent changes email');
        console.log('  state     - Send system state email');
        console.log('\nOptions:');
        console.log('  --test-mode       Save emails to files instead of sending');
        console.log('  --hours N         Changes from last N hours (default: 24)');
        console.log('  --company NAME    Filter by company name (partial match)');
        console.log('  --min-score N     Minimum relevance score (default: 0)');
        console.log('  --no-urls         Exclude URLs from state report');
        console.log('  --no-keywords     Exclude keywords from state report');
        console.log('  --no-ai           Exclude AI analysis from changes report');
        console.log('\nExamples:');
        console.log('  node email-notifications-send-now.js test --test-mode');
        console.log('  node email-notifications-send-now.js changes --hours 48 --min-score 7');
        console.log('  node email-notifications-send-now.js changes --company "OpenAI"');
        console.log('  node email-notifications-send-now.js state --company "Anthropic" --no-urls');
    }

    // Close databases
    emailService.intelligenceDb.close();
    emailService.processedDb.close();
    emailService.rawDb.close();
  }
  
  main().catch(console.error);
}

module.exports = SendNowEmailService;
