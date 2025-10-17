# AI Monitor Automated System Checklist

Use this checklist to verify that the fully automated system is working correctly.

## Initial Setup Verification

- [ ] Open the Apps Script editor at: https://script.google.com/d/12l6cAE0m_NMRCze5T0sZTvNuPPC0RfwAKf1k7VIlF3jdcywonZNe_oMK/edit
- [ ] Verify the manifest file (`View → Show project manifest`) has all required scopes:
  ```json
  "oauthScopes": [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/script.external_request",
    "https://www.googleapis.com/auth/script.scriptapp",
    "https://www.googleapis.com/auth/script.send_mail",
    "https://www.googleapis.com/auth/userinfo.email"
  ]
  ```
- [ ] Run `forceReauthorization()` function from WebApp.gs
- [ ] Verify it shows "Success! Response code: 200" in the execution log
- [ ] Run `testAuthorizationWithMultipleDomains()` function from AdminFunctions.gs
- [ ] Check which domains succeed and which fail in the execution log
- [ ] Run `setupFullyAutomatedSystem()` function from AdminFunctions.gs
- [ ] Verify it successfully creates all triggers and completes

## Trigger Verification

- [ ] In the Apps Script editor, go to `Triggers` in the left sidebar
- [ ] Verify the following triggers exist:
  - [ ] `automatedDailyBaseline` - Time-driven - Day timer - 1:00 AM to 2:00 AM
  - [ ] `automatedWeeklyFullBaseline` - Time-driven - Week timer - Sunday - 2:00 AM to 3:00 AM
  - [ ] `adminMonitorAll` - Time-driven - Hour timer - Every 6 hours
- [ ] Click on `Executions` in the left sidebar
- [ ] Verify there are successful executions of the setup functions

## Data Verification

- [ ] Open the Google Spreadsheet at: https://docs.google.com/spreadsheets/d/18sv6UITXpNu0oMDjMkuQCBHjLYwjWNm21OmLNNwDQlM/edit?usp=sharing
- [ ] Check the "AI_Baselines" sheet for baseline data
- [ ] Verify at least some URLs have been successfully processed
- [ ] If needed, manually run `adminGenerateBaseline({mode: 'new'})` to process more URLs

## Frontend Verification

- [ ] Visit the frontend at: https://redmorestudio.github.io/ai-competitive-monitor
- [ ] Check that it shows system status as operational
- [ ] Verify it can display the data from the spreadsheet
- [ ] Check that it shows the correct number of companies and URLs being monitored

## Troubleshooting

If you encounter issues:

1. **Trigger failures**: 
   - Run `getAutomationStatus()` to check the current state
   - Check execution logs for specific error messages

2. **URL fetching issues**:
   - Run `testAuthorizationWithMultipleDomains()` to identify which domains work
   - If Google domains work but others don't, the issue is likely with the permissions

3. **Baseline generation not running**:
   - Check the execution logs for the `automatedDailyBaseline` function
   - Run it manually to see if there are specific errors

4. **Monitoring not working**:
   - Run `adminMonitorAll()` manually to check for errors
   - Verify that the correct spreadsheet is being accessed

## Re-Deployment (If Needed)

If you need to redeploy the web app:

1. Make any necessary changes to the code
2. Run `clasp push` to push changes to the project
3. Create a new deployment using the Apps Script editor
4. Update the frontend to use the new deployment URL

## Recovery

If triggers get deleted or stop working:

1. Run `setupFullyAutomatedSystem()` again to recreate all triggers
2. This will not duplicate data, just ensure the automation is working