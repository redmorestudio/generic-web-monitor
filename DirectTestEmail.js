/**
 * Direct email test - no Session required
 * You'll need to replace YOUR_EMAIL with your actual email address
 */
function sendDirectTestEmail() {
  // IMPORTANT: Replace this with your email address
  const YOUR_EMAIL = 'your-email@redmore.studio'; // <-- CHANGE THIS
  
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #0066cc; color: white; padding: 20px; text-align: center;">
        <h1>🎉 AI Monitor Email Test Successful!</h1>
      </div>
      <div style="padding: 20px;">
        <p>Your email system is working perfectly!</p>
        <h3>✅ What's Set Up:</h3>
        <ul>
          <li>16 companies being monitored (6 AI + 10 Social Marketing)</li>
          <li>Daily emails at 9:15 AM PST</li>
          <li>Weekly summaries on Mondays</li>
          <li>Real-time alerts for significant changes</li>
        </ul>
        <p><strong>Your first automated daily digest will arrive tomorrow morning at 9:15 AM PST.</strong></p>
        <p><a href="https://docs.google.com/spreadsheets/d/18sv6UITXpNu0oMDjMkuQCBHjLYwjWNm21OmLNNwDQlM/edit" 
              style="background-color: #0066cc; color: white; padding: 10px 20px; text-decoration: none; display: inline-block; margin: 10px 0;">
              View Your Dashboard</a></p>
      </div>
    </div>
  `;
  
  try {
    MailApp.sendEmail({
      to: YOUR_EMAIL,
      subject: 'AI Monitor - Email System Test',
      htmlBody: htmlBody
    });
    
    return 'Email sent successfully to ' + YOUR_EMAIL;
  } catch(error) {
    return 'Error: ' + error.toString();
  }
}
