# Email Notification Setup for AI Monitor

## Overview

The AI Competitive Intelligence Monitor now supports email notifications for:
- **Real-time alerts** when high-priority changes are detected (score ≥ 7)
- **Daily summaries** of all monitoring activity

## Setup Instructions

### 1. Configure SMTP Settings

Add the following secrets to your GitHub repository:

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add:

| Secret Name | Description | Example |
|------------|-------------|---------|
| `SMTP_HOST` | Your SMTP server hostname | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_USER` | Your email address | `your-email@gmail.com` |
| `SMTP_PASS` | Your email password/app password* | `your-app-password` |
| `NOTIFICATION_EMAIL` | (Optional) Recipient email | `alerts@company.com` |

*For Gmail, you'll need to use an [App Password](https://support.google.com/accounts/answer/185833) instead of your regular password.

### 2. How It Works

- **Automatic Alerts**: Every time the monitor runs (every 6 hours), it checks for high-priority changes and sends alerts
- **Daily Summary**: Once per day, a comprehensive summary is sent with all activity
- **GitHub Issues**: High-priority alerts also create GitHub issues for tracking

### 3. Email Templates

#### Alert Email
- Triggered when relevance score ≥ 7
- Shows company name, change summary, threats, and opportunities
- Includes direct link to dashboard

#### Daily Summary  
- Shows total changes in last 24 hours
- Lists most active companies
- Provides key insights and metrics
- Includes activity visualization

### 4. Testing Email Notifications

To test your email configuration:

```bash
cd github-actions-backend
node email-notifications.js test
```

### 5. Monitoring Without Email

If you don't configure email settings, the system will still:
- Create GitHub issues for high-priority alerts
- Update the dashboard at https://redmorestudio.github.io/ai-competitive-monitor
- Log all changes in the database

## Troubleshooting

### Gmail Setup
1. Enable 2-factor authentication
2. Generate an app password at https://myaccount.google.com/apppasswords
3. Use the app password as `SMTP_PASS`

### Common Issues
- **Authentication Failed**: Check your app password is correct
- **No Emails Sent**: Verify SMTP settings and check GitHub Actions logs
- **Rate Limiting**: Some providers limit emails per hour/day

## Current Alert Thresholds

- **High Priority**: Score ≥ 7 (immediate alert)
- **Medium Priority**: Score 4-6 (included in daily summary)
- **Low Priority**: Score < 4 (logged only)

## Customization

To adjust alert thresholds or email frequency, modify:
- `/github-actions-backend/email-notifications.js`
- `/.github/workflows/monitor.yml`
