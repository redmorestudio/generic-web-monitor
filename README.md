# Generic Web Monitor

A domain-agnostic web monitoring framework with AI-powered configuration and analysis.

## Overview

Monitor ANY industry or domain (energy drinks, automobiles, SaaS, AI companies, restaurants, etc.) with intelligent change detection and analysis.

### Key Features

- **AI-powered discovery**: Provide 2-3 competitors, AI discovers 10-15+ competitors and 40+ URLs automatically
- **Manual configuration**: Full control over competitors, URLs, and importance scales
- **User-defined importance bands**: Custom 0-10 scale with domain-specific definitions
- **Multi-profile support**: Monitor multiple industries simultaneously
- **Claude AI analysis**: Intelligent change analysis with domain-specific prompts
- **Profile-based architecture**: All domain-specific configuration in JSON
- **Google Sheets backend**: Reliable data storage with per-profile isolation

### Quick Example

**Input**:
```
Domain: "energy drinks"
Seed competitors: ["Red Bull", "Monster Energy"]
```

**AI Discovers** (in ~30 seconds):
- 12 energy drink companies
- 48 URLs to monitor
- Domain-specific keywords (launch, formula, sponsorship)
- Importance bands (9-10: New product lines, 7-8: New flavors, etc.)
- Page weights (products: 2.0, blog: 1.0)

**Result**: Complete monitoring profile ready to track the energy drinks industry

---

## Quick Start

### Option 1: AI-Assisted Setup (2 minutes)

```bash
# 1. Clone repository
git clone https://github.com/yourusername/generic-web-monitor.git
cd generic-web-monitor

# 2. Install dependencies (optional, for local testing)
npm install

# 3. Open setup wizard in browser
open dashboard/setup-wizard.html

# 4. Enter:
#    - Domain: "craft beer"
#    - Competitors: "Dogfish Head, Stone Brewing"
#    - Click "Start AI Discovery"

# 5. Review and save profile

# 6. Start monitoring
# (See deployment guide for Google Apps Script setup)
```

### Option 2: Manual Configuration (15 minutes)

```bash
# 1. Copy example profile
cp profiles/examples/energy-drinks.json profiles/my-domain.json

# 2. Edit in your favorite editor
nano profiles/my-domain.json

# 3. Customize:
#    - competitors
#    - importanceBands
#    - domainKeywords
#    - pageWeights

# 4. Validate
npm run validate:profile my-domain

# 5. Deploy to Google Apps Script
# (See deployment guide)
```

---

## Project Structure

```
generic-web-monitor/
├── core/                           # Domain-agnostic engine
│   ├── monitoring/                 # Web monitoring core
│   │   └── UniversalMonitor.js     # Profile-driven monitoring engine
│   ├── analysis/                   # AI analysis
│   │   └── UniversalAnalyzer.js    # Claude integration with templates
│   ├── scoring/                    # Scoring system
│   │   └── ProfileScoring.js       # Dynamic scoring
│   ├── storage/                    # Data persistence
│   │   ├── MultiProfileStorage.js  # Per-profile data management
│   │   └── ProfileManager.js       # Profile CRUD operations
│   └── api/                        # API endpoints
│       └── UniversalAPI.js         # Multi-profile routing
│
├── profiles/                       # Profile definitions
│   ├── schemas/                    # JSON schemas
│   │   └── profile-schema.json     # Profile validation schema
│   ├── templates/                  # Claude prompt templates
│   │   ├── generic-analysis.txt    # Default analysis template
│   │   ├── ai-technology-analysis.txt
│   │   └── energy-drinks-analysis.txt
│   └── examples/                   # Example profiles
│       ├── ai-competitors.json     # AI industry monitoring
│       └── energy-drinks.json      # Energy drinks monitoring
│
├── discovery/                      # AI-powered profile generation
│   ├── DomainDiscovery.js          # Main orchestrator
│   ├── CompetitorResearch.js       # Claude-powered competitor finding
│   ├── URLDiscovery.js             # URL discovery
│   ├── KeywordExtraction.js        # Domain keyword extraction
│   └── ImportanceBands.js          # Importance band generator
│
├── dashboard/                      # User interface
│   ├── index.html                  # Main dashboard
│   ├── setup-wizard.html           # Profile creation wizard
│   └── profile-manager.html        # Profile management
│
├── docs/                           # Documentation
│   ├── ARCHITECTURE.md             # System architecture
│   ├── PROFILE-GUIDE.md            # Profile creation guide
│   ├── API.md                      # JavaScript API reference
│   └── DEPLOYMENT.md               # Deployment guide
│
├── instances/                      # Deployable configurations
│   ├── ai-competitors/             # AI industry instance
│   └── energy-drinks/              # Energy drinks instance
│
├── migration/                      # Migration utilities
└── tests/                          # Test files
```

---

## Documentation

### Getting Started
- **[Profile Guide](docs/PROFILE-GUIDE.md)**: Complete guide to creating and customizing profiles
- **[Deployment Guide](docs/DEPLOYMENT.md)**: Google Apps Script setup and configuration
- **[Quick Start Examples](#quick-start)**: Get up and running in minutes

### Technical Documentation
- **[Architecture Guide](docs/ARCHITECTURE.md)**: System design and component breakdown
- **[API Reference](docs/API.md)**: Complete JavaScript API documentation
- **[Contributing Guide](CONTRIBUTING.md)**: Add new domains and features

### Reference
- **[Changelog](CHANGELOG.md)**: Version history and migration notes
- **[Example Profiles](profiles/examples/)**: Pre-built monitoring profiles

---

## Core Concepts

### 1. Profiles

A **profile** is a complete monitoring configuration for a specific domain:

```json
{
  "profile": {
    "id": "uuid",
    "name": "Energy Drinks Monitor",
    "domain": "energy-drinks",

    "competitors": [
      {
        "name": "Red Bull",
        "urls": [
          {"url": "https://redbull.com/products", "type": "products"}
        ],
        "keywords": ["energy", "caffeine", "taurine"]
      }
    ],

    "importanceBands": [
      {
        "min": 9, "max": 10,
        "label": "Critical",
        "description": "New product lines, major formula changes",
        "examples": ["Launching new drink line", "Discontinuing major product"]
      }
    ],

    "domainKeywords": {
      "high": ["launch", "new product", "discontinued"],
      "medium": ["flavor", "packaging", "partnership"],
      "low": ["campaign", "promotion"]
    },

    "pageWeights": {
      "products": 2.0,
      "pricing": 2.0,
      "blog": 1.0,
      "homepage": 0.8
    }
  }
}
```

### 2. Importance Bands

Define what changes matter in YOUR domain:

**Energy Drinks**:
- **9-10 (Critical)**: New product lines, major formula changes, recalls
- **7-8 (Important)**: New flavors, packaging redesigns, major sponsorships
- **5-6 (Moderate)**: Limited editions, regional launches, promotions

**SaaS Companies**:
- **9-10 (Critical)**: New product launch, major pricing overhaul, acquisitions
- **7-8 (Important)**: New features, API updates, strategic partnerships
- **5-6 (Moderate)**: Blog posts, documentation updates, webinars

### 3. AI Discovery

Automatic profile generation from minimal input:

```javascript
const profile = await discoverDomainQuick(
  "craft coffee",
  ["Blue Bottle", "Stumptown", "Intelligentsia"]
);

// Returns complete profile:
// - 12 coffee roasters discovered
// - 48 URLs identified
// - Keywords extracted: "roast", "origin", "blend", "limited edition"
// - Importance bands generated
// - Page weights optimized
```

### 4. Multi-Profile Architecture

Monitor multiple industries simultaneously:

```javascript
// Energy drinks profile
monitorProfile('energy-drinks-uuid');

// AI companies profile
monitorProfile('ai-competitors-uuid');

// Restaurant chains profile
monitorProfile('restaurant-chains-uuid');

// All profiles run independently with isolated data
```

---

## Use Cases

### Competitive Intelligence

Monitor competitors for strategic moves:
- New product launches
- Pricing changes
- Feature releases
- Market positioning shifts

**Example**: SaaS company monitors 15 competitors for pricing changes, new features, and API updates.

### Market Research

Track industry trends across multiple players:
- New market entrants
- Technology shifts
- Consumer trends
- Partnership patterns

**Example**: Investment firm monitors energy drink market for M&A opportunities and market share shifts.

### Content Monitoring

Track specific content types:
- Blog posts and thought leadership
- Product documentation changes
- Press releases
- Marketing campaigns

**Example**: Marketing agency monitors competitors' content strategies and campaign launches.

### Regulatory Compliance

Monitor for compliance-related changes:
- Privacy policy updates
- Terms of service changes
- Regulatory announcements
- Safety recalls

**Example**: Legal team tracks privacy policy changes across industry.

---

## Technology Stack

**Core**:
- JavaScript (ES6+)
- Google Apps Script (backend)
- Node.js (local development)

**AI/ML**:
- Anthropic Claude API (Sonnet 3.5+)
  - Competitor discovery
  - URL identification
  - Content analysis
  - Importance band generation

**Storage**:
- Google Sheets (primary backend)
- JSON files (development/testing)
- Per-profile data isolation

**Frontend**:
- Vanilla JavaScript
- CSS3 (modern grid/flexbox)
- No framework dependencies

**Deployment**:
- Google Apps Script Web App
- GitHub Actions (automation)
- Docker (optional)
- AWS Lambda (optional)

---

## Features in Detail

### Profile-Based Configuration

All domain-specific settings in JSON:
- **Competitors**: Companies and URLs to monitor
- **Keywords**: High/medium/low priority terms
- **Importance Bands**: Custom 0-10 scoring scale
- **Page Weights**: Multipliers for different page types
- **Analysis Templates**: Domain-specific AI prompts

### Intelligent Scoring

Multi-factor relevance scoring:
```
Base Score: 5
+ Keyword matches (high: +2, medium: +1, low: -1)
× Page weight multiplier
= Final relevance score (1-10)
→ Mapped to importance band
```

### AI-Enhanced Analysis

Claude AI provides:
- Executive summaries
- Key change identification
- Competitive intelligence insights
- Actionable recommendations
- Domain-specific analysis

**Example Output**:
```json
{
  "summary": "Red Bull announces new zero-sugar line",
  "keyChanges": [
    "New product line: Red Bull Zero",
    "Targeting health-conscious consumers",
    "Available nationwide starting March"
  ],
  "significanceScore": 9,
  "urgency": "high",
  "competitiveIntel": [
    "First major zero-sugar line from Red Bull",
    "Response to Monster's success in health segment"
  ],
  "recommendations": [
    "Monitor competitor responses within 6 months",
    "Track market share impact in Q2/Q3"
  ]
}
```

### Multi-Profile Support

Run unlimited profiles simultaneously:
- Complete data isolation
- Independent schedules
- Separate notifications
- Profile-specific dashboards

### Discovery System

AI-powered profile creation:
1. **Competitor Research**: Find 10-15 competitors from 2-3 seeds
2. **URL Discovery**: Identify 4-8 important URLs per competitor
3. **Keyword Extraction**: Generate high/medium/low priority keywords
4. **Importance Bands**: Create domain-specific 0-10 scale
5. **Page Weights**: Optimize multipliers for page types

---

## Deployment Options

### Google Apps Script (Recommended)

**Pros**:
- Free (within quotas)
- Integrated with Google Sheets
- No server maintenance
- Built-in scheduling

**See**: [Deployment Guide](docs/DEPLOYMENT.md)

### Node.js + Docker

**Pros**:
- Full control
- No quota limits
- Can use alternative databases
- Docker containerization

```bash
docker build -t generic-web-monitor .
docker run -e CLAUDE_API_KEY=$API_KEY generic-web-monitor
```

### AWS Lambda

**Pros**:
- Serverless
- Auto-scaling
- Pay per execution

**See**: [Deployment Guide - Alternative Deployments](docs/DEPLOYMENT.md#alternative-deployments)

---

## Performance

### Typical Execution Times

- **Profile creation (AI)**: 30-60 seconds
- **Profile creation (manual)**: 10-15 minutes
- **Single competitor monitoring**: 10-30 seconds
- **Full profile monitoring** (10 competitors): 3-5 minutes
- **AI analysis per change**: 2-5 seconds

### Scalability

**Current Limits**:
- Profiles: ~20 active
- Competitors per profile: ~20
- URLs per competitor: ~10
- Total URLs: ~4000

**Google Apps Script Quotas**:
- URL fetches: 20,000/day
- Script runtime: 6 minutes/execution
- Triggers: 20/account

---

## Pricing

### Costs

**Free Tier**:
- Google Apps Script: Free (within quotas)
- Google Sheets: Free (15 GB storage)

**Paid Services**:
- **Claude API**: ~$3 per million tokens
  - Discovery: ~$0.50-1.00 per profile
  - Analysis: ~$0.01-0.05 per change
  - Monthly estimate: $5-20 for typical usage

**Total Monthly Cost**: $5-20 (mostly Claude API)

---

## Security

### Best Practices

- Store API keys in Script Properties (encrypted)
- Use separate Google accounts for production
- Implement rate limiting
- Enable audit logging
- Regular backups

### Data Privacy

- Content hashed before storage
- No sensitive data in logs
- Configurable data retention
- Per-profile access control (future)

---

## Roadmap

### Version 2.1 (Q2 2025)
- Profile templates library
- Advanced dashboard filtering
- Slack/Discord notifications
- Automated profile backups

### Version 2.2 (Q3 2025)
- Multi-user access control
- Profile collaboration features
- Change trend analysis
- Custom webhook integrations

### Version 2.3 (Q4 2025)
- Machine learning score refinement
- Auto-expanding competitor discovery
- Natural language profile queries
- Mobile dashboard app

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Adding new domain profiles
- Creating analysis templates
- Improving documentation
- Reporting bugs
- Requesting features

---

## Support

### Documentation
- [Profile Guide](docs/PROFILE-GUIDE.md)
- [API Reference](docs/API.md)
- [Architecture Guide](docs/ARCHITECTURE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

### Community
- GitHub Issues: Bug reports and feature requests
- GitHub Discussions: Questions and community
- Examples: See `profiles/examples/`

---

## License

MIT License - see [LICENSE](LICENSE) file for details

---

## Acknowledgments

- **Anthropic Claude API**: AI-powered discovery and analysis
- **Google Apps Script**: Reliable backend platform
- **Community Contributors**: Profile templates and feedback

---

## Version

**Current Version**: 2.0.0

**Previous Version**: 1.0.0 (AI-specific monitor)

**See**: [CHANGELOG.md](CHANGELOG.md) for version history and migration guide

---

## Quick Links

- [Documentation](docs/)
- [Examples](profiles/examples/)
- [API Reference](docs/API.md)
- [Contributing](CONTRIBUTING.md)
- [Changelog](CHANGELOG.md)
- [Issues](https://github.com/yourusername/generic-web-monitor/issues)

---

**Ready to start monitoring?**

1. Read the [Profile Guide](docs/PROFILE-GUIDE.md)
2. Choose [AI-assisted](#option-1-ai-assisted-setup-2-minutes) or [manual](#option-2-manual-configuration-15-minutes) setup
3. Deploy using the [Deployment Guide](docs/DEPLOYMENT.md)
4. Start detecting competitive intelligence!

---

*Generic Web Monitor - Monitor Any Industry, Any Domain*

*Last Updated: 2025-10-16*
*Version: 2.0.0*
