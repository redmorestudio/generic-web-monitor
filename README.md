# AI Competitor Monitor 🚀

Real-time competitive intelligence for AI companies. Monitor 16+ competitors, get AI-powered insights, and never miss important updates.

![Dashboard Preview](docs/images/dashboard-preview.png)

## ✨ Features

- **Automated Monitoring**: Checks competitor websites every 6 hours
- **AI-Powered Analysis**: Sentiment analysis, categorization, and relevance scoring
- **Change Intelligence**: See what changed with before/after content snippets
- **Smart Explanations**: AI explains changes in plain English with business context
- **Smart Alerts**: Get notified only about what matters
- **Beautiful Dashboard**: Real-time visualization of competitor activity
- **Email Summaries**: Daily intelligence reports delivered to your inbox
- **Easy Setup**: Get running in under 30 minutes

## 🎯 What It Monitors

Currently tracking:
- OpenAI, Anthropic, Google AI, Meta AI
- Perplexity, Midjourney, Mistral AI, Cohere
- Stability AI, Runway ML, Eleven Labs
- Jasper AI, Copy.ai, Writesonic, Tome, Beautiful.ai

## 🚀 Quick Start

### Option 1: Automatic Setup with Claude (Recommended)

If you have Claude Desktop with MCPs enabled:

```
"Claude, I have filesystem, gdrive, and github MCPs enabled. 
Please set up the AI Competitor Monitor for me with daily email summaries."
```

That's it! Claude will handle everything.

### Option 2: Manual Setup

1. **Copy the Google Apps Script**
   - Open Google Sheets
   - Create a new spreadsheet
   - Go to Extensions → Apps Script
   - Copy the code from `Code.gs`
   - Save and run `setupSpreadsheet()`

2. **Configure Companies**
   - Add companies to monitor in the Configuration sheet
   - Include URLs for blogs, news, and documentation pages

3. **Deploy Dashboard**
   - Fork this repository
   - Enable GitHub Pages in Settings
   - Update `CONFIG.apiUrl` in index.html with your Apps Script URL

4. **Set Up Triggers**
   - In Apps Script, run `setupTriggers()`
   - Or use the menu: AI Monitor → Setup Triggers

## 📊 Dashboard Access

### Public Demo
Visit: `https://[your-username].github.io/ai-competitive-monitor`

### Private Deployment
See [Private Deployment Guide](docs/private-deployment.md) for Google Sites instructions.

## ⚙️ Configuration

### Basic Settings
Edit these in the Apps Script:

```javascript
const CONFIG = {
  email: {
    recipients: ['your-email@example.com'],
    sendTime: '09:00',
    timezone: 'America/New_York'
  }
};
```

### Advanced Features
- **AI Analysis**: Add your Claude API key for intelligent insights
- **Custom Categories**: Define your own update categories
- **Alert Rules**: Set thresholds for urgent notifications

See [Configuration Guide](docs/configuration.md) for all options.

## 📧 Email Reports

Daily summaries include:
- Executive summary with key metrics
- Updates grouped by company
- Sentiment analysis
- Urgency indicators
- Direct links to sources

## 🔒 Privacy & Security

- All data stored in your private Google Sheets
- Dashboard can be public or private
- No data sent to third parties (except optional AI analysis)
- Respects robots.txt and rate limits

## 🤝 Contributing

We welcome contributions! Please:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## 📚 Documentation

- [Setup Guide](docs/setup-guide.md) - Detailed installation instructions
- [Configuration](docs/configuration.md) - All configuration options
- [Private Deployment](docs/private-deployment.md) - For internal use
- [API Reference](docs/api-reference.md) - Dashboard API endpoints
- [AI Change Detection](docs/ai-change-detection.md) - Content snippets & AI explanations

## 🐛 Troubleshooting

**Dashboard shows "Failed to load"**
- Check your Apps Script Web App URL
- Ensure Web App is deployed with "Anyone" access

**No emails received**
- Verify email addresses in configuration
- Check spam folder
- Run `sendDailySummary()` manually to test

**Updates not detected**
- Some sites may have anti-scraping measures
- Check the Cache sheet for stored hashes
- Verify URLs are accessible

## 📈 Roadmap

- [ ] Slack integration
- [ ] Custom webhook support
- [ ] Competitor comparison charts
- [ ] Mobile app
- [ ] Historical trend analysis
- [ ] Export to PDF reports

## 📄 License

MIT License - see [LICENSE](LICENSE) file

## 🙏 Acknowledgments

Built with:
- Google Apps Script
- Claude AI
- GitHub Pages
- Community feedback

---

**Questions?** Open an issue or reach out!

*Never miss another competitor move. Stay ahead with AI Competitor Monitor.*