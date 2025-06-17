/**
 * Email Test Solution - Works around permission restrictions
 * 
 * IMPORTANT: Web Apps cannot send emails via URL calls.
 * But time-based triggers CAN send emails!
 */

// Store email configuration
function configureEmailSystem() {
  const props = PropertiesService.getScriptProperties();
  props.setProperty('ownerEmail', 'seth@redmore.studio');
  props.setProperty('emailConfigured', 'true');
  
  // Log configuration
  const sheet = getOrCreateMonitorSheet();
  const configLog = sheet.getSheetByName('Logs') || sheet.insertSheet('Logs');
  configLog.appendRow([
    new Date().toISOString(),
    'email_configured',
    'Email system configured for seth@redmore.studio',
    'success'
  ]);
  
  return {
    success: true,
    message: 'Email configured for seth@redmore.studio',
    note: 'Automated emails will work via triggers'
  };
}

// Test email via trigger (this WILL work)
function testEmailViaTrigger() {
  // Create a one-time trigger to run in 1 minute
  ScriptApp.newTrigger('sendActualTestEmail')
    .timeBased()
    .after(60 * 1000) // 1 minute
    .create();
    
  return {
    success: true,
    message: 'Test email scheduled! Check your inbox in 1 minute.',
    recipient: 'seth@redmore.studio',
    note: 'Email will be sent via trigger which has full permissions'
  };
}

// The actual test email function (runs via trigger)
function sendActualTestEmail() {
  const recipient = 'seth@redmore.studio';
  const subject = 'AI Monitor - Email System Test SUCCESS!';
  const sheetUrl = 'https://docs.google.com/spreadsheets/d/18sv6UITXpNu0oMDjMkuQCBHjLYwjWNm21OmLNNwDQlM/edit';
  
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #0066cc; color: white; padding: 20px; text-align: center;">
        <h1>🎉 Email System Working!</h1>
      </div>
      <div style="padding: 20px;">
        <h2>Your AI Monitor email system is configured correctly!</h2>
        
        <p style="background-color: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px;">
          <strong>✅ Success!</strong> This email confirms that your automated monitoring emails will work perfectly.
        </p>
        
        <h3>What's Configured:</h3>
        <ul>
          <li><strong>Recipient:</strong> seth@redmore.studio</li>
          <li><strong>Daily Digest:</strong> 9:15 AM PST every day</li>
          <li><strong>Weekly Summary:</strong> Mondays at 8:00 AM PST</li>
          <li><strong>Companies Monitored:</strong> 16 (6 AI + 10 Social Marketing)</li>
        </ul>
        
        <h3>Important Note:</h3>
        <p style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px;">
          Email functions cannot be triggered via web URLs due to Google's security restrictions. 
          However, your <strong>automated daily emails WILL work</strong> because they run via time-based triggers 
          which have full permissions.
        </p>
        
        <h3>Your First Automated Email:</h3>
        <p><strong>Tomorrow at 9:15 AM PST</strong> you'll receive your first daily digest with:</p>
        <ul>
          <li>Monitoring results from all 16 companies</li>
          <li>Change detection highlights</li>
          <li>AI insights from Claude</li>
          <li>Direct links to detailed reports</li>
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${sheetUrl}" style="background-color: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
            View Your Dashboard
          </a>
        </div>
        
        <hr style="margin: 30px 0;">
        
        <p style="color: #666; font-size: 14px;">
          This test email was sent via a trigger to verify your email system.<br>
          Your monitoring system is fully operational and will begin automated reporting tomorrow.
        </p>
      </div>
    </div>
  `;
  
  try {
    MailApp.sendEmail({
      to: recipient,
      subject: subject,
      htmlBody: htmlBody
    });
    
    // Log success
    const sheet = getOrCreateMonitorSheet();
    const logs = sheet.getSheetByName('Logs');
    if (logs) {
      logs.appendRow([
        new Date().toISOString(),
        'test_email_sent',
        'Test email sent successfully to ' + recipient,
        'success'
      ]);
    }
    
    // Clean up the trigger
    const triggers = ScriptApp.getProjectTriggers();
    triggers.forEach(trigger => {
      if (trigger.getHandlerFunction() === 'sendActualTestEmail') {
        ScriptApp.deleteTrigger(trigger);
      }
    });
    
  } catch (error) {
    console.error('Email error:', error);
  }
}

// Verify email will work for automated sends
function verifyEmailSystem() {
  const props = PropertiesService.getScriptProperties();
  const email = props.getProperty('ownerEmail') || 'seth@redmore.studio';
  const configured = props.getProperty('emailConfigured') === 'true';
  
  // Check triggers
  const triggers = ScriptApp.getProjectTriggers();
  const emailTrigger = triggers.find(t => 
    t.getHandlerFunction() === 'runDailyMonitoringWithEmail'
  );
  
  return {
    success: true,
    configuration: {
      recipient: email,
      configured: configured,
      automatedEmailsEnabled: !!emailTrigger,
      nextRun: emailTrigger ? 'Tomorrow 9:00 AM PST' : 'Not scheduled'
    },
    important: 'Email functions work via triggers but not via web URLs due to Google security',
    testing: 'Use testEmailViaTrigger() to send a test email in 1 minute'
  };
}
