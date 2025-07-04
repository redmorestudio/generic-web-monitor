# GitHub Actions Secrets Configuration

This document lists all the secrets that need to be configured in your GitHub repository for the AI Competitive Monitor to work properly.

## Required Secrets

### 1. AI Analysis
- **`GROQ_API_KEY`** - Your Groq API key for AI analysis using Llama 3.3 70B
  - Get from: https://console.groq.com/

### 2. TheBrain Integration
- **`THEBRAIN_API_KEY`** - Your TheBrain API key
  - Get from: TheBrain application settings
- **`THEBRAIN_BRAIN_ID`** - The ID of your TheBrain brain
  - Current: `4de379f0-2268-436a-8459-f11491bfdbf5`
- **`THEBRAIN_CENTRAL_THOUGHT_ID`** - The central thought ID of your brain
  - Current: `26ba3392-8465-479a-8e49-708a0d01b54c`

### 3. GitHub Actions Token
- **`AI_COMPETITIVE_MONITOR_TOKEN`** - Personal Access Token for triggering workflows
  - Create at: https://github.com/settings/tokens
  - Required permissions: `repo`, `workflow`

### 4. Email Notifications (Optional)
- **`SMTP_HOST`** - SMTP server (e.g., smtp.gmail.com)
- **`SMTP_PORT`** - SMTP port (e.g., 587)
- **`SMTP_USER`** - Email username
- **`SMTP_PASS`** - Email password or app-specific password
- **`NOTIFICATION_EMAIL`** - Recipient email for alerts
- **`EMAIL_THRESHOLD`** - Minimum relevance score to trigger email (default: 7)

## How to Add Secrets

1. Go to your repository on GitHub
2. Click on **Settings** tab
3. Navigate to **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Add each secret with its name and value

## Current Configuration

For the production pipeline run, use these values:

```
GROQ_API_KEY=<your-groq-api-key>
THEBRAIN_API_KEY=<your-thebrain-api-key>
THEBRAIN_BRAIN_ID=4de379f0-2268-436a-8459-f11491bfdbf5
THEBRAIN_CENTRAL_THOUGHT_ID=26ba3392-8465-479a-8e49-708a0d01b54c
```

**Note**: The actual API keys have been stored securely in the repository secrets.

## Workflow Dependencies

- **Full Monitor Pipeline** (`full-monitor.yml`) - Requires all secrets
- **Individual workflows** - May require subset of secrets
- **Test workflows** - Useful for validating configuration

## Troubleshooting

If workflows are failing:
1. Check the Actions tab for error messages
2. Verify all required secrets are set
3. Run `test-thebrain.yml` to validate TheBrain connection
4. Check that API keys haven't expired
