# AI Competitive Monitor - GitHub Actions Edition

A complete rewrite of the AI Competitive Monitor using GitHub Actions, eliminating all Google Apps Script permission issues.

## 🚀 Why This Is Better

### No More Permission Hell
- ✅ **Full internet access** - No authorization prompts
- ✅ **Programmatic deployment** - Everything via Git
- ✅ **Modern DevOps** - CI/CD best practices
- ✅ **Version control** - All data in Git history
- ✅ **Free hosting** - GitHub Actions + GitHub Pages

### Powerful AI Integration
- 🤖 **Claude AI analysis** - Intelligent insights extraction
- 📊 **Relevance scoring** - Prioritize important changes
- 🔍 **Change detection** - Track what really matters
- 📧 **Smart alerts** - GitHub Issues for high-priority findings

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ GitHub Actions  │────▶│ Puppeteer Scrape │────▶│ Claude Analysis │
│ (Every 6 hours) │     │ (55 URLs)        │     │ (AI Insights)   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                           │
                                                           ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ GitHub Pages    │◀────│ Dashboard Data   │◀────│ Change Detection│
│ (Public View)   │     │ (JSON + HTML)    │     │ (Alerts)        │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

## 🛠️ Setup Instructions

### 1. Create New GitHub Repository
```bash
# Clone this solution
cp -r /Users/sethredmore/ai-monitor-fresh/github-actions-solution/* .
git init
git add .
git commit -m "Initial commit: AI Competitive Monitor v2"
```

### 2. Set Repository Secrets
Go to Settings → Secrets → Actions and add:
- `ANTHROPIC_API_KEY`: Your Claude API key

### 3. Enable GitHub Pages
- Settings → Pages
- Source: Deploy from branch
- Branch: main, folder: /docs

### 4. First Run
```bash
# Install dependencies locally
npm install

# Test scraping
npm run scrape

# Test AI analysis (needs ANTHROPIC_API_KEY env var)
ANTHROPIC_API_KEY=your-key npm run analyze
```

### 5. Deploy
```bash
git push origin main
```

The GitHub Action will automatically:
- Run every 6 hours
- Scrape all competitor sites
- Analyze with Claude AI
- Generate reports and dashboard
- Create issues for high-priority findings

## 📁 Project Structure

```
.
├── .github/workflows/
│   └── monitor.yml          # GitHub Actions workflow
├── scripts/
│   ├── config.json          # Companies and URLs to monitor
│   ├── scrape.js           # Puppeteer scraping logic
│   ├── analyze-with-ai.js  # Claude AI analysis
│   ├── detect-changes.js   # Change detection
│   └── generate-dashboard-data.js
├── data/                    # Generated data (git-tracked)
│   ├── raw/                # Raw scraped content
│   ├── analysis/           # AI analysis results
│   └── reports/            # Markdown reports
├── docs/                    # GitHub Pages site
│   ├── index.html          # Dashboard
│   └── data.json           # Dashboard data
└── package.json

```

## 🎯 Key Features

### 1. Intelligent Scraping
- Puppeteer for JavaScript-heavy sites
- Respectful delays between requests
- Error handling and retries
- Content hashing for change detection

### 2. AI-Powered Analysis
- Claude 3 Sonnet for deep insights
- Structured JSON output
- Relevance scoring (1-10)
- Competitive threat assessment

### 3. Automatic Reporting
- Daily markdown reports
- High-priority email alerts
- GitHub Issues for urgent items
- Historical data tracking

### 4. Zero Maintenance
- Self-healing on errors
- Automatic retries
- No manual intervention needed
- Full observability via GitHub Actions

## 🔧 Customization

### Add More Companies
Edit `scripts/config.json`:
```json
{
  "name": "New Company",
  "urls": [
    { "url": "https://example.com", "type": "homepage" },
    { "url": "https://example.com/pricing", "type": "pricing" }
  ]
}
```

### Adjust Analysis Prompts
Edit `scripts/analyze-with-ai.js` to customize what Claude extracts.

### Change Schedule
Edit `.github/workflows/monitor.yml`:
```yaml
schedule:
  - cron: '0 */4 * * *'  # Every 4 hours instead of 6
```

## 🚨 Monitoring & Alerts

### GitHub Issues
- Automatic issues for relevance score ≥ 7
- Tagged with `competitive-intel` and `high-priority`
- Links to full report

### Workflow Notifications
- Email on workflow failure
- GitHub UI shows run history
- Full logs available

## 💰 Cost Analysis

### GitHub Actions (Free Tier)
- 2,000 minutes/month free
- Each run: ~10 minutes
- 4 runs/day = 1,200 minutes/month
- **Cost: $0**

### Claude API
- ~$0.003 per 1K tokens
- ~2K tokens per URL analysis
- 55 URLs = 110K tokens
- 4 runs/day = ~$13/day
- **Cost: ~$400/month**

### Total: ~$400/month
(Mainly Claude API costs - could use GPT-3.5 for ~$50/month)

## 🎉 Benefits Over Google Apps Script

1. **No Permission Issues** - Everything just works
2. **Better Developer Experience** - Modern tools, Git-based
3. **More Reliable** - GitHub's infrastructure
4. **Easier to Debug** - Full logs, local testing
5. **Community Standard** - GitHub Actions is industry standard
6. **Scalable** - Easy to add more sites/analysis

## 🚀 Next Steps

1. **Deploy this solution** to a new GitHub repo
2. **Sunset Google Apps Script** - It's been a time sink
3. **Enhance with more AI** - Add GPT-4, Gemini, etc.
4. **Build better dashboards** - React, real-time updates
5. **Add more intelligence** - Sentiment analysis, trend detection

---

This solution eliminates ALL the permission issues you've been fighting with Google Apps Script while providing a more powerful, maintainable, and modern architecture.
