# Generic Web Monitor

A domain-agnostic web monitoring framework with AI-powered configuration and analysis.

## Overview

This framework allows you to monitor ANY industry or domain (energy drinks, automobiles, SaaS, AI companies, etc.) with:

- **AI-powered discovery**: Provide 2-3 competitors, AI discovers 10-15+ competitors and 40+ URLs automatically
- **Manual configuration**: Full control over competitors, URLs, and importance scales
- **User-defined importance bands**: Custom 0-10 scale with domain-specific definitions
- **Multi-profile support**: Monitor multiple industries simultaneously

## Project Structure

```
generic-web-monitor/
├── core/                           # Domain-agnostic engine
│   ├── monitoring/                 # Web monitoring core
│   │   └── UniversalMonitor.js     # Profile-driven monitoring engine
│   ├── analysis/                   # AI analysis
│   │   └── UniversalAnalyzer.js    # Profile-driven Claude integration
│   ├── scoring/                    # Scoring system
│   │   └── ProfileScoring.js       # Dynamic scoring based on profile
│   ├── storage/                    # Data persistence
│   │   └── MultiProfileStorage.js  # Per-profile data management
│   ├── config/                     # Configuration management
│   │   └── ProfileManager.js       # Profile CRUD operations
│   └── api/                        # API endpoints
│       └── UniversalAPI.js         # Multi-profile API routing
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
│       ├── energy-drinks.json      # Energy drinks monitoring
│       └── automobiles.json        # Automobile industry monitoring
│
├── discovery/                      # AI-powered profile generation
│   ├── DomainDiscovery.js          # Main orchestrator
│   ├── CompetitorResearch.js       # Claude-powered competitor finding
│   ├── URLDiscovery.js             # Claude-powered URL discovery
│   ├── KeywordExtraction.js        # Domain keyword extraction
│   └── ImportanceBands.js          # Importance band suggester
│
├── dashboard/                      # User interface
│   ├── index.html                  # Main dashboard with profile selector
│   ├── setup-wizard.html           # Profile creation wizard
│   └── profile-manager.html        # Profile management interface
│
├── instances/                      # Deployable configurations
│   ├── ai-competitors/             # AI industry instance
│   └── energy-drinks/              # Energy drinks instance
│
└── migration/                      # Migration utilities
    └── export-ai-profile.js        # Export from old system

```

## Key Features

### 1. Profile-Based Configuration

All domain-specific information lives in profile JSON files:

- **Competitors**: List of companies and their URLs to monitor
- **Importance Bands**: Custom 0-10 scale with domain-specific definitions
- **Keywords**: High/medium/low priority keywords for the domain
- **Page Weights**: Multipliers for different page types
- **Analysis Templates**: Domain-specific Claude prompts

### 2. AI-Powered Discovery

Provide just 2-3 competitor names, and the AI will:

- Research and discover 10-15+ additional competitors
- Identify 40+ important URLs to monitor per competitor
- Extract domain-specific keywords (high/medium/low priority)
- Generate custom importance bands (0-10 scale)
- Suggest page weight multipliers

### 3. Multi-Profile Support

Run multiple industry monitors simultaneously:

- Each profile has isolated data storage
- Switch between profiles in the dashboard
- Profile-specific email reports
- Concurrent monitoring of different domains

### 4. Flexible Importance Scales

Define what matters in YOUR domain:

- **9-10 (Critical)**: "New product lines, major formula changes" (energy drinks)
- **9-10 (Critical)**: "New model releases, major pricing changes" (AI companies)
- **7-8 (Important)**: "New flavors, packaging redesigns" (energy drinks)
- **7-8 (Important)**: "New features, API updates" (AI companies)

## Getting Started

### Quick Setup (AI-Assisted)

1. Open `dashboard/setup-wizard.html`
2. Enter your domain (e.g., "energy drinks")
3. Provide 2-3 competitor names (e.g., "Red Bull, Monster Energy")
4. Click "Start AI Discovery"
5. Review and confirm the discovered competitors and URLs
6. Customize importance bands (or use AI suggestions)
7. Save and start monitoring

### Manual Setup

1. Copy `profiles/examples/energy-drinks.json`
2. Customize competitors, URLs, keywords, and importance bands
3. Save as `profiles/instances/my-domain.json`
4. Load profile and start monitoring

## Example Profile

```json
{
  "profile": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Energy Drinks Monitor",
    "domain": "energy-drinks",
    "competitors": [
      {
        "name": "Red Bull",
        "urls": [
          {"url": "https://redbull.com", "type": "homepage"},
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
      "high": ["launch", "new product", "price", "discontinued"],
      "medium": ["flavor", "packaging", "partnership"],
      "low": ["campaign", "promotion", "update"]
    }
  }
}
```

## Technology Stack

- **Backend**: Google Apps Script (or Node.js)
- **Storage**: Google Sheets (multi-profile structure)
- **AI Analysis**: Anthropic Claude API
- **Frontend**: Vanilla JavaScript with modern UI
- **Deployment**: GitHub Actions + Google Apps Script

## Development Status

**Phase 0: Repository Setup** - COMPLETE

Next phases:
- Phase 1: Core Architecture (UniversalMonitor, UniversalAnalyzer)
- Phase 2: AI Discovery System
- Phase 3: Configuration Interface
- Phase 4: Multi-Profile Dashboard
- Phase 5: Migration & Testing

## Migration from Old System

If migrating from an existing AI competitor monitor:

```bash
node migration/export-ai-profile.js
```

This will convert your existing configuration to the new profile format.

## License

MIT

## Contributing

See TRANSFORMATION-PLAN.md for detailed architecture and implementation roadmap.
