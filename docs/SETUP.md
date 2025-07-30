# Generic Web Monitor - Setup Guide

This guide will help you set up your own web monitoring system in under 30 minutes.

## Prerequisites

- GitHub account
- Node.js 16+ installed locally (for initial setup)
- Basic familiarity with GitHub

## Quick Start (5 minutes)

### 1. Fork and Clone

```bash
# Fork this repository on GitHub, then:
git clone https://github.com/YOUR-USERNAME/generic-web-monitor.git
cd generic-web-monitor
```

### 2. Run Setup Wizard

```bash
./setup.sh
```

Follow the interactive prompts to:
- Choose your monitoring domain
- Create initial configuration
- Set up your first monitoring targets

### 3. Configure GitHub Secrets

Go to your repository Settings → Secrets and variables → Actions

Add these required secrets:

| Secret Name | Description | How to Get |
|------------|-------------|------------|
| `GROQ_API_KEY` | AI analysis API key | [Get from Groq Console](https://console.groq.com/keys) |
| `AI_COMPETITIVE_MONITOR_TOKEN` | GitHub Personal Access Token | [Create PAT](https://github.com/settings/tokens) with `repo` scope |

Optional secrets:
- `THEBRAIN_API_KEY` - For knowledge graph integration
- `DATABASE_URL` - For PostgreSQL (default uses SQLite)

### 4. Enable GitHub Pages

1. Go to Settings → Pages
2. Source: Deploy from a branch
3. Branch: `main` / `root`
4. Save

### 5. Initialize and Deploy

```bash
# Commit your configuration
git add -A
git commit -m "Initial domain configuration"
git push origin main

# Run initialization workflow
gh workflow run init-domain.yml
```

## Domain Configuration

### Understanding the Structure

```
config/domains/your-domain/
├── domain.yaml      # What to monitor
├── interests.yaml   # What's important
└── prompts/        # AI analysis prompts
    └── change-analysis.yaml
```

### Minimal Configuration Example

**domain.yaml** - Define what to monitor:
```yaml
domain:
  id: "tech-news"
  name: "Tech News Monitoring"
  
  monitoring_targets:
    - urls:
        - url: "https://techcrunch.com"
          name: "TechCrunch"
        - url: "https://www.theverge.com/tech"
          name: "The Verge"
```

**interests.yaml** - Define importance:
```yaml
interest_configuration:
  levels:
    - score_range: [8, 10]
      name: "critical"
      criteria:
        - "Major acquisition announced"
        - "Security breach reported"
    
    - score_range: [5, 7]
      name: "important"
      criteria:
        - "New product launch"
        - "Industry partnership"
```

## Running Your Monitor

### Manual Trigger

```bash
# Run full monitoring pipeline
gh workflow run full-monitor.yml

# Run specific components
gh workflow run scrape.yml
gh workflow run analyze.yml
```

### Automatic Scheduling

Edit `.github/workflows/full-monitor.yml`:

```yaml
on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
```

Common schedules:
- `0 * * * *` - Every hour
- `0 */4 * * *` - Every 4 hours  
- `0 9,17 * * *` - 9 AM and 5 PM
- `0 0 * * *` - Daily at midnight

## Viewing Results

Your dashboard will be available at:
```
https://YOUR-USERNAME.github.io/generic-web-monitor/
```

Features:
- Real-time change feed
- Interest-based filtering
- Company/entity tracking
- Historical analysis
- 3D relationship graph

## Adding Monitoring Targets

### Via Configuration

Edit `config/domains/your-domain/domain.yaml`:

```yaml
monitoring_targets:
  - category: "primary"
    urls:
      - url: "https://example.com/news"
        name: "Example News"
      - url: "https://example.com/blog"
        name: "Example Blog"
```

### Via Web Interface

1. Go to your dashboard
2. Click "Manage Companies"
3. Add new URLs
4. Save and sync

## Customizing Interest Levels

Edit `config/domains/your-domain/interests.yaml`:

```yaml
scoring_factors:
  - name: "urgency"
    weight: 0.4
    keywords:
      boost: ["immediate", "urgent", "breaking"]
      reduce: ["planned", "scheduled", "future"]
```

## Troubleshooting

### Common Issues

**No data showing:**
- Check workflow runs in Actions tab
- Verify secrets are set correctly
- Look for errors in workflow logs

**Pages not updating:**
- Check GitHub Pages is enabled
- Verify deployment workflow completed
- Hard refresh browser (Ctrl+Shift+R)

**Scraping failures:**
- Some sites block automated access
- Check `scrape_status` in data
- Consider adding delays or proxy

### Debug Commands

```bash
# Check configuration
cat config/domains/*/domain.yaml

# View recent runs
gh run list --workflow=full-monitor.yml

# Check database
sqlite3 github-actions-backend/data/intelligence.db ".tables"
```

## Next Steps

1. **Refine Configuration**
   - Add more URLs
   - Tune interest scoring
   - Customize prompts

2. **Set Up Notifications**
   - Email alerts for critical changes
   - Slack integration
   - Custom webhooks

3. **Advanced Features**
   - Multiple domains
   - Custom analyzers
   - API access

## Getting Help

- 📚 [Configuration Reference](CONFIGURATION.md)
- 🎯 [Example Domains](DOMAINS.md)
- 🔧 [Troubleshooting Guide](TROUBLESHOOTING.md)
- 💬 [GitHub Discussions](https://github.com/redmorestudio/generic-web-monitor/discussions)

---

**Need help?** Open an issue or start a discussion. We're here to help you succeed!
