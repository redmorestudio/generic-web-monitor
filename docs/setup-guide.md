# AI Competitor Monitor - Setup Guide

## Prerequisites

- Google account
- GitHub account (for public dashboard)
- Basic familiarity with Google Sheets

## Step 1: Set Up Google Apps Script

### 1.1 Create the Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new blank spreadsheet
3. Name it "AI Competitor Monitor Data"

### 1.2 Open Apps Script Editor

1. In your spreadsheet, click **Extensions → Apps Script**
2. Delete any existing code in the editor
3. Copy the entire content from `Code.gs` in this repository
4. Paste it into the Apps Script editor
5. Click **Save** (💾) and name the project "AI Competitor Monitor"

### 1.3 Initial Setup

1. In the Apps Script editor, click **Run** → Select `initializeSpreadsheet`
2. You'll be prompted to authorize the script:
   - Click **Review permissions**
   - Choose your Google account
   - Click **Advanced** → **Go to AI Competitor Monitor (unsafe)**
   - Click **Allow**

### 1.4 Deploy as Web App

1. Click **Deploy** → **New deployment**
2. Click the gear icon → **Web app**
3. Configure:
   - Description: "AI Competitor Monitor API"
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Click **Deploy**
5. **Copy the Web App URL** - you'll need this for the dashboard

## Step 2: Set Up GitHub Pages Dashboard

### 2.1 Fork the Repository

1. Go to [this repository](https://github.com/redmorestudio/ai-competitive-monitor)
2. Click **Fork** in the top right
3. Choose your account as the destination

### 2.2 Configure the Dashboard

1. In your forked repository, navigate to `index.html`
2. Click the pencil icon to edit
3. Find this section:
   ```javascript
   const CONFIG = {
       apiUrl: 'YOUR_APPS_SCRIPT_URL_HERE'
   };
   ```
4. Replace `YOUR_APPS_SCRIPT_URL_HERE` with your Web App URL from Step 1.4
5. Commit the changes

### 2.3 Enable GitHub Pages

1. Go to **Settings** → **Pages** in your repository
2. Under "Source", select **Deploy from a branch**
3. Choose **main** branch and **/ (root)** folder
4. Click **Save**
5. Wait 2-3 minutes for deployment
6. Your dashboard will be available at:
   `https://[your-username].github.io/ai-competitive-monitor`

## Step 3: Configure Monitoring

### 3.1 Set Up Automated Checks

1. Go back to your Google Apps Script
2. Run the function `setupAutomatedMonitoring`
3. This creates a trigger to check companies every 6 hours

### 3.2 Configure Email Notifications

1. In the Apps Script, find the CONFIG section:
   ```javascript
   const CONFIG = {
     emailRecipient: 'your-email@example.com',
     ...
   };
   ```
2. Update with your email address
3. Save the script

### 3.3 Test the System

1. Run `checkAllCompanies` manually to test
2. Check your spreadsheet for data
3. Visit your dashboard to see the results

## Step 4: Customize (Optional)

### Add/Remove Companies

1. Edit the `CONFIG.companies` object in the Apps Script
2. Add companies following this format:
   ```javascript
   { 
     name: 'Company Name', 
     url: 'https://company.com', 
     selector: 'meta[name="description"]',
     category: 'Category Name' 
   }
   ```

### Adjust Check Frequency

1. Change `CONFIG.checkInterval` (in hours)
2. Run `setupAutomatedMonitoring` again

### Customize Dashboard Colors

1. Edit `styles.css` in your repository
2. Modify the CSS variables in `:root`

## Troubleshooting

### "Failed to load data" on Dashboard

1. Verify your API URL is correct in `index.html`
2. Check that the Web App is deployed with "Anyone" access
3. Try accessing the API URL directly in your browser

### No Data in Spreadsheet

1. Run `initializeSpreadsheet` again
2. Check the Logs sheet for errors
3. Verify company URLs are accessible

### No Email Notifications

1. Check spam folder
2. Verify email address in CONFIG
3. Run `sendUpdateEmail` manually with test data

## Security Considerations

- The Web App URL is public but only exposes aggregated data
- Your email and full data remain private in Google Sheets
- Consider using a separate Google account for production
- Enable 2FA on your Google account

## Next Steps

- Add more companies to monitor
- Set up Slack notifications (coming soon)
- Customize alert thresholds
- Create custom categories

---

Need help? Open an issue on GitHub!