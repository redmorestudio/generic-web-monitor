# Deployment Guide

Complete guide for deploying the Generic Web Monitor to Google Apps Script and setting up automation.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Google Apps Script Setup](#google-apps-script-setup)
3. [Environment Configuration](#environment-configuration)
4. [API Key Configuration](#api-key-configuration)
5. [Scheduler Setup](#scheduler-setup)
6. [Web App Deployment](#web-app-deployment)
7. [Security Considerations](#security-considerations)
8. [Monitoring and Maintenance](#monitoring-and-maintenance)
9. [Troubleshooting](#troubleshooting)
10. [Alternative Deployments](#alternative-deployments)

---

## Prerequisites

### Required

1. **Google Account** with Apps Script access
2. **Google Sheet** for data storage
3. **Anthropic API Key** (Claude)
   - Get from: https://console.anthropic.com/
   - Pricing: ~$3/million tokens

### Optional

4. **Custom Domain** for web dashboard
5. **GitHub Account** for Actions automation
6. **Slack Workspace** for notifications

### Checklist

```
[ ] Google Account created
[ ] Google Sheet created
[ ] Claude API key obtained
[ ] Repository cloned locally
[ ] Node.js installed (for local testing)
[ ] clasp installed (npm install -g @google/clasp)
```

---

## Google Apps Script Setup

### Step 1: Create Google Apps Script Project

**Option A: From Google Sheets**

1. Open your monitoring Google Sheet
2. Extensions → Apps Script
3. Project name: "Generic Web Monitor"

**Option B: Standalone**

1. Go to https://script.google.com/
2. New Project
3. Name: "Generic Web Monitor"

### Step 2: Install clasp (Command Line)

```bash
# Install clasp globally
npm install -g @google/clasp

# Login to Google
clasp login

# Create new project (or clone existing)
clasp create --title "Generic Web Monitor" --type standalone

# Or clone existing project
clasp clone <SCRIPT_ID>
```

### Step 3: Upload Code

**Using clasp**:

```bash
cd /Users/sethredmore/generic-web-monitor

# Create .clasp.json
cat > .clasp.json << EOF
{
  "scriptId": "YOUR_SCRIPT_ID",
  "rootDir": "./gas-deploy"
}
EOF

# Prepare deployment directory
mkdir -p gas-deploy
cp -r core/ gas-deploy/
cp -r profiles/ gas-deploy/
cp -r discovery/ gas-deploy/

# Deploy
clasp push
```

**Manual Upload**:

1. Apps Script Editor
2. Files → Upload files
3. Upload each .js file from core/, profiles/, discovery/

### Step 4: Set up Libraries

**Script Properties**:
1. Project Settings → Script Properties
2. Add properties (see Environment Configuration)

**External Libraries** (if needed):
```javascript
// In Apps Script Editor
// No external libraries needed for basic setup
```

### Step 5: Configure Spreadsheet

**Bind to Google Sheet**:

1. Apps Script Editor
2. Project Settings
3. Container type: Google Sheets
4. Container ID: Your sheet's ID from URL

**Or in code**:
```javascript
// Config.js
const SPREADSHEET_ID = 'YOUR_SHEET_ID';
const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
```

### Step 6: Test Deployment

```javascript
// Test.gs
function testDeployment() {
  Logger.log('Testing Generic Web Monitor...');

  // Test 1: Load profile
  const profiles = listProfiles();
  Logger.log(`Found ${profiles.length} profiles`);

  // Test 2: Create test profile
  const testProfile = {
    id: generateUUID(),
    name: 'Test Profile',
    domain: 'test',
    competitors: [
      {
        name: 'Test Company',
        urls: [{ url: 'https://example.com', type: 'homepage' }]
      }
    ],
    importanceBands: [
      { min: 0, max: 10, label: 'All', description: 'Test', examples: [''] }
    ]
  };

  const profileId = saveProfile(testProfile);
  Logger.log(`Created test profile: ${profileId}`);

  // Test 3: Cleanup
  deleteProfile(profileId);
  Logger.log('Test complete!');
}
```

Run in Apps Script Editor:
1. Select `testDeployment` function
2. Click Run
3. Authorize permissions
4. Check Execution log

---

## Environment Configuration

### Script Properties

**Setup**:
1. Apps Script Editor → Project Settings
2. Script Properties section
3. Add property → Enter key/value

**Required Properties**:

| Property | Value | Description |
|----------|-------|-------------|
| `CLAUDE_API_KEY` | `sk-ant-...` | Anthropic API key |
| `SPREADSHEET_ID` | `1abc...` | Google Sheet ID |
| `NOTIFICATION_EMAIL` | `you@example.com` | Alert recipient |

**Optional Properties**:

| Property | Value | Description |
|----------|-------|-------------|
| `SLACK_WEBHOOK_URL` | `https://hooks.slack.com/...` | Slack notifications |
| `MAX_CRAWL_DELAY` | `3000` | Delay between URLs (ms) |
| `ENABLE_AI_ANALYSIS` | `true` | Use Claude analysis |
| `LOG_LEVEL` | `INFO` | DEBUG, INFO, WARN, ERROR |

### Access Properties in Code

```javascript
// Config.js
function getConfig(key) {
  const props = PropertiesService.getScriptProperties();
  return props.getProperty(key);
}

function setConfig(key, value) {
  const props = PropertiesService.getScriptProperties();
  props.setProperty(key, value);
}

// Usage
const apiKey = getConfig('CLAUDE_API_KEY');
const sheetId = getConfig('SPREADSHEET_ID');
```

### Environment-Specific Configuration

```javascript
// Config.js
const ENV = {
  development: {
    crawlDelay: 5000,
    enableAI: false,
    logLevel: 'DEBUG'
  },
  production: {
    crawlDelay: 2000,
    enableAI: true,
    logLevel: 'INFO'
  }
};

function getEnvConfig() {
  const env = getConfig('ENVIRONMENT') || 'production';
  return ENV[env];
}
```

---

## API Key Configuration

### Anthropic Claude API

**Get API Key**:
1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Settings → API Keys
4. Create Key
5. Copy key (starts with `sk-ant-`)

**Store Securely**:

**Option 1: Script Properties (Recommended)**
```javascript
// Setup once
function setupClaudeAPI() {
  const apiKey = Browser.inputBox('Enter Claude API key:');
  setConfig('CLAUDE_API_KEY', apiKey);
  Logger.log('API key saved securely');
}
```

**Option 2: Environment Variable** (local dev)
```bash
export CLAUDE_API_KEY='sk-ant-...'
```

**Option 3: Secret Manager** (advanced)
```javascript
// Using Google Secret Manager
function getClaudeAPIKey() {
  const secretName = 'projects/YOUR_PROJECT/secrets/claude-api-key/versions/latest';
  // ... Secret Manager API call
}
```

### Test API Connection

```javascript
function testClaudeAPI() {
  const apiKey = getConfig('CLAUDE_API_KEY');

  const url = 'https://api.anthropic.com/v1/messages';
  const payload = {
    model: 'claude-sonnet-3.5-20241022',
    max_tokens: 100,
    messages: [{
      role: 'user',
      content: 'Say "API test successful" if you receive this.'
    }]
  };

  const options = {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText());
    Logger.log('API Test Result:', result.content[0].text);
    return true;
  } catch (error) {
    Logger.log('API Test Failed:', error);
    return false;
  }
}
```

---

## Scheduler Setup

### Time-Based Triggers

**Setup in UI**:
1. Apps Script Editor → Triggers (clock icon)
2. Add Trigger
3. Configure:
   - Function: `monitorAllProfiles`
   - Deployment: Head
   - Event source: Time-driven
   - Type: Hour timer
   - Interval: Every 6 hours

**Setup in Code**:
```javascript
function setupTriggers() {
  // Clear existing triggers
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));

  // Monitor every 6 hours
  ScriptApp.newTrigger('monitorAllProfiles')
    .timeBased()
    .everyHours(6)
    .create();

  // Daily summary at 9 AM
  ScriptApp.newTrigger('sendDailySummary')
    .timeBased()
    .atHour(9)
    .everyDays(1)
    .create();

  // Weekly cleanup on Sundays
  ScriptApp.newTrigger('weeklyCleanup')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.SUNDAY)
    .atHour(2)
    .create();

  Logger.log('Triggers configured');
}
```

### Monitoring Function

```javascript
// Triggers.gs
function monitorAllProfiles() {
  Logger.log('Starting scheduled monitoring...');

  const manager = new ProfileManager();
  const profiles = manager.listProfiles();

  const results = [];

  for (const profile of profiles) {
    if (profile.status !== 'active') {
      Logger.log(`Skipping ${profile.name} (status: ${profile.status})`);
      continue;
    }

    try {
      Logger.log(`Monitoring: ${profile.name}`);
      const result = monitorProfile(profile.id);

      results.push({
        profileId: profile.id,
        profileName: profile.name,
        success: true,
        changes: result.totalChanges,
        duration: result.duration
      });

      Logger.log(`${profile.name}: ${result.totalChanges} changes`);

    } catch (error) {
      Logger.log(`Error monitoring ${profile.name}: ${error}`);
      results.push({
        profileId: profile.id,
        profileName: profile.name,
        success: false,
        error: error.toString()
      });
    }

    // Respect rate limits
    Utilities.sleep(5000);
  }

  // Send summary
  sendMonitoringSummary(results);

  Logger.log('Scheduled monitoring complete');
  return results;
}
```

### Error Handling in Triggers

```javascript
function monitorAllProfilesSafe() {
  try {
    return monitorAllProfiles();
  } catch (error) {
    // Log to sheet
    logError('monitorAllProfiles', error);

    // Send alert
    sendErrorAlert('Monitoring failed', error);

    // Don't throw - prevents trigger from failing
    return { error: error.toString() };
  }
}

function logError(functionName, error) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName('ErrorLog') ||
    SpreadsheetApp.getActiveSpreadsheet().insertSheet('ErrorLog');

  sheet.appendRow([
    new Date(),
    functionName,
    error.toString(),
    error.stack || ''
  ]);
}
```

---

## Web App Deployment

### Deploy as Web App

**Steps**:
1. Apps Script Editor → Deploy → New deployment
2. Type: Web app
3. Configuration:
   - Description: "Generic Web Monitor Dashboard"
   - Execute as: Me
   - Who has access: Anyone (or Anyone with Google account)
4. Deploy
5. Copy Web App URL

### Web App Code

```javascript
// WebApp.gs
function doGet(e) {
  const page = e.parameter.page || 'dashboard';

  if (page === 'dashboard') {
    return HtmlService.createHtmlOutputFromFile('dashboard/index.html')
      .setTitle('Generic Web Monitor')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

  if (page === 'setup-wizard') {
    return HtmlService.createHtmlOutputFromFile('dashboard/setup-wizard.html')
      .setTitle('Create Profile');
  }

  if (page === 'profile-manager') {
    return HtmlService.createHtmlOutputFromFile('dashboard/profile-manager.html')
      .setTitle('Manage Profiles');
  }

  // API endpoint
  if (page === 'api') {
    return handleAPIRequest(e);
  }

  return HtmlService.createHtmlOutput('<h1>404 - Page Not Found</h1>');
}

function doPost(e) {
  return handleAPIRequest(e);
}
```

### API Endpoints

```javascript
// WebApp.gs
function handleAPIRequest(e) {
  const path = e.parameter.path || '';
  const method = e.parameter.method || e.parameter.httpMethod || 'GET';

  try {
    // GET /api/profiles
    if (method === 'GET' && path === 'profiles') {
      const profiles = listProfiles();
      return jsonResponse({ profiles, total: profiles.length });
    }

    // GET /api/profiles/:id
    if (method === 'GET' && path.startsWith('profiles/')) {
      const profileId = path.split('/')[1];
      const profile = loadProfile(profileId);
      return jsonResponse({ profile });
    }

    // POST /api/profiles
    if (method === 'POST' && path === 'profiles') {
      const profileData = JSON.parse(e.postData.contents);
      const profileId = saveProfile(profileData.profile);
      return jsonResponse({ id: profileId, status: 'created' }, 201);
    }

    // GET /api/profiles/:id/changes
    if (method === 'GET' && path.match(/profiles\/.+\/changes/)) {
      const profileId = path.split('/')[1];
      const limit = parseInt(e.parameter.limit) || 100;
      const changes = getRecentChanges(profileId, limit);
      return jsonResponse({ changes, total: changes.length });
    }

    // POST /api/profiles/:id/monitor
    if (method === 'POST' && path.match(/profiles\/.+\/monitor/)) {
      const profileId = path.split('/')[1];
      const results = monitorProfile(profileId);
      return jsonResponse({ results });
    }

    return jsonResponse({ error: 'Not found' }, 404);

  } catch (error) {
    return jsonResponse({ error: error.toString() }, 500);
  }
}

function jsonResponse(data, status = 200) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### CORS Configuration

```javascript
// WebApp.gs
function handleCORS(e) {
  const output = handleAPIRequest(e);

  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  // Handle preflight
  if (e.parameter.httpMethod === 'OPTIONS') {
    return ContentService.createTextOutput('')
      .setMimeType(ContentService.MimeType.JSON);
  }

  return output;
}
```

### Custom Domain (Optional)

Use Google Apps Script Web App URL as backend:
```javascript
// In your frontend
const API_BASE = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';

fetch(`${API_BASE}?page=api&path=profiles`)
  .then(res => res.json())
  .then(data => console.log(data.profiles));
```

---

## Security Considerations

### API Key Security

**DO**:
- Store in Script Properties
- Use Secret Manager for production
- Rotate keys regularly
- Monitor API usage

**DON'T**:
- Commit keys to git
- Log keys in console
- Share keys in code comments
- Hard-code in source files

### Access Control

**Web App Permissions**:
```
Execute as: Me (your account)
Who has access:
  - Only myself (most secure)
  - Anyone with Google account (team access)
  - Anyone (public, use with caution)
```

**Sheet Permissions**:
- Limit to specific Google accounts
- Use separate sheets for sensitive data
- Enable audit logging

### Data Privacy

**Sensitive Data**:
- Hash content before storage
- Don't store full page HTML
- Encrypt competitor lists (optional)
- Implement data retention policies

```javascript
// Hash content before storage
function hashContent(content) {
  const hash = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    content,
    Utilities.Charset.UTF_8
  );
  return hash.map(byte => {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');
}
```

### Rate Limiting

```javascript
// Implement rate limiting
const RATE_LIMITS = {
  monitor: { requests: 10, window: 3600000 }, // 10/hour
  discovery: { requests: 5, window: 3600000 }  // 5/hour
};

function checkRateLimit(action, userId) {
  const cache = CacheService.getUserCache();
  const key = `ratelimit_${action}_${userId}`;

  const count = parseInt(cache.get(key) || '0');
  const limit = RATE_LIMITS[action];

  if (count >= limit.requests) {
    throw new Error('Rate limit exceeded. Try again later.');
  }

  cache.put(key, count + 1, limit.window / 1000);
  return true;
}
```

---

## Monitoring and Maintenance

### Execution Logs

**View Logs**:
1. Apps Script Editor → Executions
2. Filter by function, status, date
3. Click execution to see detailed logs

**Log Levels**:
```javascript
function log(level, message, data = {}) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}`;

  if (level === 'ERROR') {
    console.error(logMessage, data);
    // Also log to sheet
    logToSheet('ErrorLog', [timestamp, level, message, JSON.stringify(data)]);
  } else if (level === 'WARN') {
    console.warn(logMessage, data);
  } else {
    console.log(logMessage, data);
  }
}
```

### Performance Monitoring

```javascript
function monitorPerformance(functionName, fn) {
  const start = new Date();

  try {
    const result = fn();

    const duration = new Date() - start;
    log('INFO', `${functionName} completed`, { duration });

    // Track slow executions
    if (duration > 30000) {
      log('WARN', `${functionName} slow execution`, { duration });
    }

    return result;

  } catch (error) {
    const duration = new Date() - start;
    log('ERROR', `${functionName} failed`, { duration, error: error.toString() });
    throw error;
  }
}

// Usage
function monitorAllProfiles() {
  return monitorPerformance('monitorAllProfiles', () => {
    // ... monitoring logic
  });
}
```

### Quota Monitoring

```javascript
function checkQuotas() {
  const quotas = {
    urlFetch: {
      used: 0,  // Track in script
      limit: 20000  // Per day
    },
    scriptRuntime: {
      used: 0,
      limit: 90  // Minutes per day
    }
  };

  // Alert if approaching limits
  for (const [service, quota] of Object.entries(quotas)) {
    const usage = (quota.used / quota.limit) * 100;
    if (usage > 80) {
      sendAlert(`${service} quota at ${usage.toFixed(0)}%`);
    }
  }
}
```

### Email Notifications

```javascript
function sendMonitoringSummary(results) {
  const email = getConfig('NOTIFICATION_EMAIL');
  if (!email) return;

  const totalChanges = results.reduce((sum, r) => sum + (r.changes || 0), 0);
  const failures = results.filter(r => !r.success);

  const subject = `Monitoring Summary: ${totalChanges} changes, ${failures.length} failures`;

  let body = `<h2>Generic Web Monitor - Summary</h2>`;
  body += `<p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>`;
  body += `<p><strong>Total Changes:</strong> ${totalChanges}</p>`;

  body += `<h3>Profile Results</h3><ul>`;
  for (const result of results) {
    body += `<li><strong>${result.profileName}</strong>: `;
    if (result.success) {
      body += `${result.changes} changes`;
    } else {
      body += `<span style="color: red;">FAILED - ${result.error}</span>`;
    }
    body += `</li>`;
  }
  body += `</ul>`;

  MailApp.sendEmail({
    to: email,
    subject: subject,
    htmlBody: body
  });
}
```

---

## Troubleshooting

### Common Issues

#### "Script timeout - exceeded maximum execution time"

**Cause**: Script runs > 6 minutes (Apps Script limit)

**Solutions**:
1. Process fewer competitors per run
2. Use execution continuation pattern
3. Split into multiple triggers

```javascript
function monitorWithContinuation() {
  const profiles = listProfiles();
  const processed = parseInt(getConfig('LAST_PROCESSED') || '0');

  // Process 3 profiles per run
  for (let i = processed; i < Math.min(processed + 3, profiles.length); i++) {
    monitorProfile(profiles[i].id);
  }

  // Save progress
  setConfig('LAST_PROCESSED', Math.min(processed + 3, profiles.length));

  // Reset if complete
  if (processed + 3 >= profiles.length) {
    setConfig('LAST_PROCESSED', '0');
  }
}
```

#### "Service invoked too many times"

**Cause**: Exceeded Google Apps Script quotas

**Solutions**:
1. Add delays between operations
2. Batch Sheet operations
3. Use caching

```javascript
// Batch sheet writes
function batchWriteChanges(changes) {
  const sheet = getChangesSheet(profileId);
  const rows = changes.map(c => [c.timestamp, c.company, c.url, c.score]);

  // Single write operation instead of multiple appends
  if (rows.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, 4)
      .setValues(rows);
  }
}
```

#### "Cannot find profile"

**Cause**: Profile ID doesn't match or sheet structure incorrect

**Solutions**:
1. Verify UUID format
2. Check sheet name matches profileId
3. Validate sheet structure

```javascript
function validateSheetStructure(profileId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const requiredSheets = [
    'Profiles',
    `Competitors_${profileId}`,
    `Changes_${profileId}`,
    `ImportanceBands_${profileId}`
  ];

  const missing = [];
  for (const sheetName of requiredSheets) {
    if (!ss.getSheetByName(sheetName)) {
      missing.push(sheetName);
    }
  }

  if (missing.length > 0) {
    throw new Error(`Missing sheets: ${missing.join(', ')}`);
  }
}
```

#### "API request failed"

**Cause**: Claude API error or network issue

**Solutions**:
1. Verify API key
2. Check quota limits
3. Implement retry logic

```javascript
function callClaudeWithRetry(prompt, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return callClaude(prompt);
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      Logger.log(`API call failed, retry ${i + 1}/${maxRetries}`);
      Utilities.sleep(2000 * (i + 1)); // Exponential backoff
    }
  }
}
```

### Debug Mode

```javascript
// Config.gs
const DEBUG = false;  // Set to true for verbose logging

function debug(message, data) {
  if (DEBUG) {
    console.log(`[DEBUG] ${message}`, data);
  }
}

// Usage
debug('Profile loaded', { profileId, name: profile.name });
```

---

## Alternative Deployments

### Local Node.js Development

```bash
# Install dependencies
npm install

# Set environment variables
export CLAUDE_API_KEY='sk-ant-...'
export SPREADSHEET_ID='...'

# Run monitoring
node src/monitor.js --profile energy-drinks

# Run discovery
node src/discovery.js --domain "craft beer" --seeds "Dogfish,Stone"
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV NODE_ENV=production

CMD ["node", "src/monitor.js", "--all"]
```

```bash
# Build
docker build -t generic-web-monitor .

# Run
docker run -e CLAUDE_API_KEY=$CLAUDE_API_KEY \
           -e SPREADSHEET_ID=$SPREADSHEET_ID \
           generic-web-monitor
```

### GitHub Actions

```yaml
# .github/workflows/monitor.yml
name: Scheduled Monitoring

on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:  # Manual trigger

jobs:
  monitor:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm install

      - name: Run monitoring
        env:
          CLAUDE_API_KEY: ${{ secrets.CLAUDE_API_KEY }}
          SPREADSHEET_ID: ${{ secrets.SPREADSHEET_ID }}
        run: node src/monitor.js --all

      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: monitoring-results
          path: results/*.json
```

### AWS Lambda

```javascript
// lambda/handler.js
exports.handler = async (event) => {
  const { profileId } = event;

  try {
    const results = await monitorProfile(profileId);

    return {
      statusCode: 200,
      body: JSON.stringify(results)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
```

---

**Next Steps**:
1. Complete Google Apps Script setup
2. Configure API keys
3. Set up triggers
4. Deploy web app
5. Test end-to-end
6. Monitor for 1 week
7. Adjust based on results

---

*Last Updated: 2025-10-16*
*Version: 2.0.0*
