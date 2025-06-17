/**
 * Fixed test email function - works without Session permissions
 */
function sendTestEmailFixed() {
  // Use the effective user instead of active user
  const recipient = Session.getEffectiveUser().getEmail();
  const today = new Date().toLocaleDateString();
  const subject = `AI Monitor Test Email - ${today}`;
  const sheetUrl = 'https://docs.google.com/spreadsheets/d/18sv6UITXpNu0oMDjMkuQCBHjLYwjWNm21OmLNNwDQlM/edit';
  
  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #0066cc; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
        .header h1 { margin: 0; font-size: 24px; }
        .header p { margin: 5px 0 0 0; opacity: 0.9; font-size: 14px; }
        .summary-box { background-color: #f8f9fa; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #0066cc; }
        .section { margin: 20px 0; }
        .section h2 { color: #0066cc; font-size: 18px; margin-bottom: 10px; }
        .company-card { background-color: #fff; border: 1px solid #e0e0e0; padding: 10px; margin: 10px 0; border-radius: 5px; }
        .company-card.changed { border-left: 4px solid #28a745; }
        .company-name { font-weight: bold; color: #333; }
        .company-meta { font-size: 12px; color: #666; margin-top: 5px; }
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 15px 0; }
        .stat-card { background-color: #fff; border: 1px solid #e0e0e0; padding: 15px; text-align: center; border-radius: 5px; }
        .stat-number { font-size: 24px; font-weight: bold; color: #0066cc; }
        .stat-label { font-size: 12px; color: #666; margin-top: 5px; }
        .cta-button { display: inline-block; background-color: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🤖 AI Competitor Monitor - Test Email</h1>
          <p>Testing Daily Intelligence Digest - ${today}</p>
        </div>
        
        <div class="summary-box">
          <strong>🎉 Success!</strong> Your AI Monitor email system is working perfectly. 
          This is what your daily digest emails will look like starting tomorrow at 9:15 AM PST.
        </div>
        
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">16</div>
            <div class="stat-label">Companies Monitored</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">58</div>
            <div class="stat-label">URLs Tracked</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">Daily</div>
            <div class="stat-label">Email Frequency</div>
          </div>
        </div>
        
        <div class="section">
          <h2>📊 Sample Monitoring Results</h2>
          <div class="company-card changed">
            <div class="company-name">Mistral AI</div>
            <div class="company-meta">AI/LLM • 2 changes detected • New model announcement</div>
          </div>
          <div class="company-card changed">
            <div class="company-name">Sprout Social</div>
            <div class="company-meta">Social Media Management • 1 change detected • Pricing update</div>
          </div>
          <div class="company-card">
            <div class="company-name">Codeium</div>
            <div class="company-meta">AI/Dev Tools • No changes • Stable</div>
          </div>
        </div>
        
        <div class="section">
          <h2>🧠 What You'll Receive Daily</h2>
          <ul>
            <li><strong>Executive Summary</strong> - Key metrics and highlights at a glance</li>
            <li><strong>Change Detection</strong> - Companies with significant updates</li>
            <li><strong>AI Insights</strong> - Claude's analysis of competitive implications</li>
            <li><strong>Direct Links</strong> - Quick access to detailed reports</li>
            <li><strong>Strategic Recommendations</strong> - When important patterns emerge</li>
          </ul>
        </div>
        
        <div style="text-align: center;">
          <a href="${sheetUrl}" class="cta-button">View Your Dashboard</a>
        </div>
        
        <div class="footer">
          <p><strong>Email Schedule:</strong></p>
          <ul style="list-style: none; padding: 0;">
            <li>📅 <strong>Daily Digest:</strong> 9:15 AM PST (after monitoring run)</li>
            <li>📊 <strong>Weekly Summary:</strong> Mondays at 8:00 AM PST</li>
            <li>🚨 <strong>Priority Alerts:</strong> Real-time for significant changes</li>
          </ul>
          <p><strong>Coverage:</strong> 6 AI Technology + 10 Social Marketing companies</p>
          <hr style="margin: 10px 0;">
          <p style="color: #28a745;">
            ✅ This test confirms your email system is working!<br>
            Automated monitoring begins tomorrow morning.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  try {
    MailApp.sendEmail({
      to: recipient,
      subject: subject,
      htmlBody: htmlBody
    });
    
    return {
      success: true,
      message: 'Test email sent successfully!',
      recipient: recipient,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.toString(),
      message: 'Failed to send test email'
    };
  }
}

/**
 * Simple test without Session
 */
function sendSimpleTestEmail() {
  try {
    // Get the email from properties or use a default
    const props = PropertiesService.getScriptProperties();
    let recipient = props.getProperty('ownerEmail');
    
    if (!recipient) {
      // Try to get it once and store it
      try {
        recipient = Session.getEffectiveUser().getEmail();
        props.setProperty('ownerEmail', recipient);
      } catch(e) {
        return {
          success: false,
          error: 'Please run this function from the script editor first to set up email'
        };
      }
    }
    
    MailApp.sendEmail({
      to: recipient,
      subject: 'AI Monitor - Test Email',
      htmlBody: '<h2>Success!</h2><p>Your AI Monitor email system is working. Daily digests start tomorrow at 9:15 AM PST.</p>'
    });
    
    return {
      success: true,
      message: 'Email sent to ' + recipient
    };
  } catch(error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}
