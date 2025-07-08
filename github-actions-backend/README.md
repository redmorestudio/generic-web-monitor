# AI Competitive Intelligence Monitor - Full-Featured Backend

A complete rewrite of the AI Monitor with a proper backend that meets ALL functional requirements from the original spec.

## 🎯 Key Features - Meeting the Spec

### ✅ Full Content Storage
- Complete page text stored (not just hashes)
- Historical snapshots maintained
- 30-day rolling retention

### ✅ Change Magnitude Detection  
- Calculates exact percentage changed
- Tracks additions/deletions line by line
- "How much changed" metric fully implemented

### ✅ AI Relevance Scoring
- Claude AI analyzes every change
- 1-10 relevance scale
- Works WITHOUT keywords
- Plain English explanations of what changed
- Business context analysis

### ✅ Complete Configuration Management
- REST API for all operations
- Add/delete companies and URLs
- LLM-friendly endpoints
- CLI for easy management

### ✅ Intelligence Extraction
- Competitive threats analysis
- Strategic opportunities
- Change categorization
- Executive summaries
- Content snippet display (before/after)
- Key changes as bullet points

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Express API   │────▶│  SQLite Database │◀────│ GitHub Actions  │
│  (Full CRUD)    │     │  (All content)   │     │  (Automation)   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         ▲                       │                         │
         │                       ▼                         ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   CLI Tool      │     │   Diff Engine    │     │  Claude AI      │
│ (Management)    │     │ (Change tracking)│     │ (Intelligence)  │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

## 📁 Project Structure

```
github-actions-backend/
├── server.js              # Express API with all endpoints
├── scraper.js            # Intelligent content extraction
├── ai-analyzer.js        # Claude AI integration
├── ai-change-analyzer.js # Enhanced change explanations
├── cli.js                # Command-line management tool
├── .github/workflows/
│   └── monitor.yml       # GitHub Actions automation
├── scripts/
│   ├── init-db.js       # Database initialization
│   └── generate-dashboard.js
├── data/
│   └── monitor.db       # SQLite database
└── package.json
```

## 🚀 Quick Start

### 1. Local Development

```bash
# Install dependencies
npm install

# Initialize database
npm run init-db

# Start API server
npm start

# In another terminal, run scraper
npm run scrape

# Run AI analysis
npm run analyze

# Run enhanced change analysis (NEW!)
node ai-change-analyzer.js
```

### 2. Using the CLI

```bash
# Make CLI executable
chmod +x cli.js
npm link

# Add a company
ai-monitor company:add "OpenAI" --urls "https://openai.com" "https://openai.com/pricing"

# Check status
ai-monitor monitor:status

# View recent changes
ai-monitor monitor:changes --min-relevance 6

# LLM-friendly data
ai-monitor llm:insights --company "OpenAI"
```

### 3. Deploy with GitHub Actions

1. Create new GitHub repository
2. Add secrets:
   - `ANTHROPIC_API_KEY`
3. Push code
4. Actions run automatically every 6 hours

## 📊 Database Schema

### Companies Table
- `id`, `name`, `type`, `enabled`
- Full CRUD operations via API

### URLs Table  
- `company_id`, `url`, `type`, `check_frequency`
- CSS selectors for intelligent extraction

### Content Snapshots Table
- **Full page content stored**
- Content hash for change detection
- Title and metadata

### Changes Table
- Links old and new snapshots
- **Change percentage calculated**
- Additions/deletions tracked

### AI Analysis Table
- **Relevance score (1-10)**
- Summary, threats, opportunities
- Category classification

### Change Detection Table (Enhanced)
- **AI explanation** of changes
- **Key changes** as JSON array
- **Business context** analysis
- Before/after content IDs

## 🔌 API Endpoints

### Company Management
```
GET    /api/companies              # List all companies
GET    /api/companies/:id          # Get company details
POST   /api/companies              # Add company
PUT    /api/companies/:id          # Update company
DELETE /api/companies/:id          # Delete company
```

### URL Management
```
POST   /api/companies/:id/urls     # Add URL to company
PUT    /api/urls/:id               # Update URL
DELETE /api/urls/:id               # Delete URL
```

### Monitoring & Intelligence
```
POST   /api/content-snapshots      # Store new content (scraper)
GET    /api/urls/:id/history       # Content history
GET    /api/diff/:old/:new         # View diff between versions
POST   /api/changes/:id/ai-analysis # Submit AI analysis
GET    /api/changes/recent         # Recent changes with AI scores
GET    /api/dashboard              # Dashboard data
```

### LLM-Friendly Endpoints
```
POST   /api/llm/manage-company     # Natural language management
GET    /api/llm/insights           # Structured insights for LLMs
```

## 🤖 AI Intelligence Features

### Relevance Scoring
- Every change analyzed by Claude
- 1-10 scale based on strategic importance
- Considers context, not just keywords

### Change Explanations (NEW!)
- **Plain English summaries** of what changed
- **Key changes** listed as bullet points
- **Business context** explaining why changes were made
- **Content snippets** showing actual before/after text
- Works with or without API keys (smart fallback)

### Intelligence Categories
- `product_update` - New features or products
- `pricing_change` - Pricing modifications  
- `messaging_change` - Positioning shifts
- `feature_update` - Capability changes
- `partnership` - Strategic alliances
- `other` - Everything else

### Automatic Alerts
- High relevance (≥7) creates GitHub Issues
- Daily intelligence briefs
- Competitive threat analysis

## 🔧 Configuration

### Environment Variables
```bash
API_URL=http://localhost:3000/api
ANTHROPIC_API_KEY=your-key-here
PORT=3000
```

### Global Settings (via API)
```javascript
PUT /api/config
{
  "ai_threshold": 7,          // Min relevance for alerts
  "change_threshold": 10,     // Min % change to analyze
  "retention_days": 30,       // Content history retention
  "brief_schedule": "daily"   // Intelligence brief frequency
}
```

## 📈 Monitoring Rules

The system alerts when ANY of these conditions are met:
1. **AI Relevance Score ≥ 6** (intelligent detection)
2. **Content Change ≥ 25%** (magnitude detection)
3. **High-priority keywords found** (fallback)
4. **Manual override flag set**

## 🔍 Example: LLM Integration

```bash
# LLMs can manage companies naturally
curl -X POST http://localhost:3000/api/llm/manage-company \
  -H "Content-Type: application/json" \
  -d '{
    "action": "add",
    "company_name": "Anthropic",
    "urls": [
      {"url": "https://anthropic.com", "type": "homepage"},
      {"url": "https://anthropic.com/pricing", "type": "pricing"}
    ],
    "keywords": ["Claude", "constitutional AI", "safety"]
  }'

# Get insights for decision making
curl http://localhost:3000/api/llm/insights?company=Anthropic&days=7
```

## 📊 What Makes This Different

### vs Basic Scrapers
- **Stores full content**, not just metadata
- **Calculates change magnitude** automatically
- **AI understands importance** without keywords

### vs Google Apps Script
- **No permission issues** - everything just works
- **Real database** with proper queries
- **Git-based** version control
- **Industry-standard** tooling

### vs Original GitHub Actions Solution
- **Full backend API** (not just JSON files)
- **Complete CRUD operations**
- **LLM-accessible endpoints**
- **Meets ALL functional requirements**

## 🚨 Monitoring Flow

1. **Scraper** extracts full page content
2. **Diff Engine** calculates exact changes
3. **AI Analyzer** scores relevance (1-10)
4. **Alert System** creates issues for important changes
5. **Dashboard** shows intelligence visually

## 💡 Advanced Usage

### Custom CSS Selectors
```javascript
// Target specific content areas
{
  "css_selectors": [
    "main.content",
    "article.blog-post", 
    ".pricing-table",
    "[data-testid='feature-list']"
  ]
}
```

### Keyword Weighting
```javascript
// Higher weight = more important
{
  "keywords": [
    {"keyword": "launch", "weight": 2.0},
    {"keyword": "beta", "weight": 1.5},
    {"keyword": "update", "weight": 1.0}
  ]
}
```

### Change Categories
The AI automatically categorizes changes:
- Product launches
- Pricing updates
- Feature additions
- Strategic shifts
- Partnership announcements

## 🎯 Meeting Original Requirements

✅ **"How much did this page change?"** - Exact percentage tracked
✅ **"Is this change important?"** - AI scores 1-10
✅ **"What specifically changed?"** - Full diff available  
✅ **"Works without keywords"** - AI understands context
✅ **"LLMs can manage it"** - Natural language API
✅ **"See all the data"** - Complete visibility

## 🚀 Next Steps

1. **Deploy the backend** to your infrastructure
2. **Import your companies** via CLI or API
3. **Let it run** - automation handles everything
4. **Review intelligence** - not just raw changes

This is the system you originally envisioned - intelligent, automated, and actually useful for competitive intelligence.
