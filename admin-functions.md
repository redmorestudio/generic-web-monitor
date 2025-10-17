# AI Competitor Monitor - Fully Automated Solution

## Authorization Solution

### The Problem
The Google Apps Script web app is configured with `ANYONE_ANONYMOUS` access, which prevents external URL fetching even though the correct scope (`https://www.googleapis.com/auth/script.external_request`) is in the manifest file.

### The Solution
We've implemented a fully automated solution that requires **zero manual operation** after initial setup:

1. **Public Web App** - Keeps the existing deployment with `ANYONE_ANONYMOUS` access for viewing results
2. **Automated Admin Functions** - Uses time-based triggers to run all data collection automatically

## One-Time Setup (Just 2 Steps)

### Step 1: Authorize URL Fetching (One-Time Only)
1. Open the Apps Script editor at: https://script.google.com/d/12l6cAE0m_NMRCze5T0sZTvNuPPC0RfwAKf1k7VIlF3jdcywonZNe_oMK/edit
2. Click on View → Show project manifest
3. Make sure the following scopes are listed in the "oauthScopes" section:
   ```json
   "oauthScopes": [
     "https://www.googleapis.com/auth/spreadsheets",
     "https://www.googleapis.com/auth/script.external_request",
     "https://www.googleapis.com/auth/script.scriptapp",
     "https://www.googleapis.com/auth/script.send_mail",
     "https://www.googleapis.com/auth/userinfo.email"
   ]
   ```
4. Save the project
5. Select `forceReauthorization` from the function dropdown
6. Click the Run button (▶️)
7. **IMPORTANT**: Accept ALL permission prompts that appear
8. You should see a success message with a 200 response code

### Step 2: Set Up Automation (One-Time Only)
1. Select `setupFullyAutomatedSystem` from the function dropdown
2. Click the Run button (▶️)
3. That's it! The system is now completely automated!

## What Gets Automated

After the one-time setup, the system automatically:

1. **Daily Baseline Generation (1 AM)** - Processes new URLs only
2. **Weekly Full Baseline (Sunday 2 AM)** - Complete refresh of all content
3. **Regular Monitoring (Every 6 Hours)** - Checks for changes and updates the system

## Checking Automation Status

If you ever want to verify that automation is working:

1. Select `getAutomationStatus` from the function dropdown
2. Click the Run button (▶️)
3. Check the execution log for detailed status information

## How It Works

This approach solves the authorization issue because:

1. Time-based triggers run with the full permissions of your account
2. No need to modify `appsscript.json` settings
3. No need to require user authentication for viewing the dashboard

## Customizing Schedules (Optional)

If you want to change the default schedules, you can modify these values in the `setupFullyAutomatedSystem` function:

```javascript
// For daily baseline (new URLs only)
ScriptApp.newTrigger('automatedDailyBaseline')
  .timeBased()
  .everyDays(1)
  .atHour(1) // 1 AM - change this number for a different hour
  .create();

// For weekly full baseline
ScriptApp.newTrigger('automatedWeeklyFullBaseline')
  .timeBased()
  .onWeekDay(ScriptApp.WeekDay.SUNDAY) // Change to a different day
  .atHour(2) // 2 AM - change this number for a different hour
  .create();

// For monitoring (every 6 hours)
ScriptApp.newTrigger('adminMonitorAll')
  .timeBased()
  .everyHours(6) // Change to a different interval
  .create();
```

## Troubleshooting

If anything stops working:

1. Run `getAutomationStatus()` to check the current state
2. If needed, run `setupFullyAutomatedSystem()` again to re-establish all automation

## Key Benefits

1. **Zero Manual Operation** - Everything runs automatically on schedule
2. **Separation of Concerns** - Public viewing stays anonymous while data collection happens with full permissions
3. **Best of Both Worlds** - No authentication required for viewing, but full permissions for background operations
4. **Resilient** - System recovers automatically and continues processing where it left off