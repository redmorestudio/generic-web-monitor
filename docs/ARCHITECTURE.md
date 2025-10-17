# Generic Web Monitor - System Architecture

## Overview

The Generic Web Monitor is a domain-agnostic framework for monitoring website changes across any industry. The architecture is designed around **profiles** - self-contained configurations that define what to monitor and how to analyze changes.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACES                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Dashboard  │  │Setup Wizard  │  │Profile Mgr   │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
└─────────┼──────────────────┼──────────────────┼────────────────┘
          │                  │                  │
┌─────────┼──────────────────┼──────────────────┼────────────────┐
│         │      CORE ENGINE (Profile-Driven)   │                │
│  ┌──────▼────────┐  ┌──────▼───────┐  ┌──────▼───────┐        │
│  │Universal      │  │Universal     │  │Profile       │        │
│  │Monitor        │  │Analyzer      │  │Manager       │        │
│  └───────┬───────┘  └──────┬───────┘  └──────┬───────┘        │
│          │                  │                  │                │
│  ┌───────▼──────────────────▼──────────────────▼────┐          │
│  │         Multi-Profile Storage Layer              │          │
│  │    (Google Sheets / JSON files per profile)      │          │
│  └──────────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────┘
          │                  │                  │
┌─────────┼──────────────────┼──────────────────┼────────────────┐
│         │      AI DISCOVERY SYSTEM (Optional)  │                │
│  ┌──────▼────────┐  ┌──────▼───────┐  ┌──────▼───────┐        │
│  │Competitor     │  │URL           │  │Keyword       │        │
│  │Research       │  │Discovery     │  │Extraction    │        │
│  └───────────────┘  └──────────────┘  └──────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### 1. Core Components

#### UniversalMonitor (`core/monitoring/UniversalMonitor.js`)
**Responsibility**: Execute monitoring runs based on profile configuration

**Key Functions**:
- Load profile configuration
- Crawl competitor URLs
- Extract and hash content
- Compare with baselines
- Calculate relevance scores using profile keywords
- Apply page weight multipliers
- Store results in profile-specific storage

**Profile Integration**:
```javascript
const monitor = new UniversalMonitor(profile);
// Uses profile.domainKeywords for scoring
// Uses profile.pageWeights for multipliers
// Uses profile.importanceBands for classification
```

**Data Flow**:
```
Profile → Monitor → URLs → Content Extraction →
Baseline Comparison → Score Calculation →
Importance Band Assignment → Storage
```

#### UniversalAnalyzer (`core/analysis/UniversalAnalyzer.js`)
**Responsibility**: AI-powered analysis using profile-specific templates

**Key Functions**:
- Load Claude prompt templates
- Inject profile variables into prompts
- Call Claude API for analysis
- Parse and validate responses
- Map scores to importance bands
- Fallback to basic analysis if AI unavailable

**Template Variables**:
```
{DOMAIN} → profile.domain
{COMPANY} → competitor.name
{IMPORTANCE_BANDS} → formatted profile.importanceBands
{KEYWORDS_HIGH} → profile.domainKeywords.high
{COMPETITORS} → profile.competitors list
```

**Example Template Usage**:
```
You are an expert in {DOMAIN}.
Analyze changes for {COMPANY}.

Importance Scale for {DOMAIN}:
{IMPORTANCE_BANDS}

High-priority keywords: {KEYWORDS_HIGH}
```

#### ProfileManager (`core/storage/ProfileManager.js`)
**Responsibility**: CRUD operations for profiles

**Key Functions**:
- Create new profiles
- Load profile configurations
- Update profile settings
- Delete profiles and associated data
- List all profiles
- Validate profile schema

**Storage Structure** (Google Sheets):
```
Sheet: "Profiles"
- Profile metadata and full JSON config

Sheet: "Competitors_{profileId}"
- Per-profile competitor tracking

Sheet: "Changes_{profileId}"
- Per-profile change history

Sheet: "ImportanceBands_{profileId}"
- Per-profile importance definitions
```

### 2. Discovery System

#### DomainDiscovery (`discovery/DomainDiscovery.js`)
**Responsibility**: Orchestrate AI-powered profile creation

**Workflow**:
```
1. Competitor Research
   Input: 2-3 seed competitors
   Output: 10-15+ competitors with metadata

2. URL Discovery
   Input: Competitor list + domain
   Output: 4-8 URLs per competitor

3. Keyword Extraction
   Input: Domain + competitors
   Output: High/medium/low priority keywords

4. Importance Band Generation
   Input: Domain context
   Output: 6 bands (0-10 scale)

5. Page Weight Calculation
   Input: Domain characteristics
   Output: Page type multipliers

6. Profile Assembly
   Output: Complete profile JSON
```

**AI Prompts** (Claude API):
- Competitor research prompt
- URL discovery prompt (per competitor)
- Keyword extraction prompt
- Importance band generation prompt
- Page weight suggestion prompt

#### CompetitorResearch (`discovery/CompetitorResearch.js`)
**Responsibility**: Find competitors using AI

**Input**:
```json
{
  "domain": "energy drinks",
  "seedCompetitors": ["Red Bull", "Monster Energy"],
  "targetMarket": "US"
}
```

**Output**:
```json
{
  "competitors": [
    {
      "name": "Rockstar",
      "website": "https://rockstarenergy.com",
      "productLines": ["Energy Drinks", "Recovery"],
      "marketPosition": "challenger"
    }
  ],
  "totalFound": 12
}
```

#### URLDiscovery (`discovery/URLDiscovery.js`)
**Responsibility**: Identify important URLs for monitoring

**Per-Competitor Logic**:
- Analyze competitor website structure
- Identify key page types (products, pricing, blog, etc.)
- Prioritize URLs based on competitive intelligence value
- Return 4-8 most valuable URLs

### 3. Profile System

#### Profile Schema (`profiles/schemas/profile-schema.json`)
**Structure**:
```json
{
  "profile": {
    "id": "uuid",
    "name": "Display Name",
    "domain": "domain-identifier",

    "competitors": [
      {
        "name": "Company",
        "urls": [{"url": "...", "type": "homepage"}],
        "keywords": ["keyword1", "keyword2"]
      }
    ],

    "importanceBands": [
      {
        "min": 9, "max": 10,
        "label": "Critical",
        "description": "What qualifies as critical",
        "examples": ["Example 1", "Example 2"]
      }
    ],

    "domainKeywords": {
      "high": ["urgent keywords"],
      "medium": ["moderate keywords"],
      "low": ["routine keywords"]
    },

    "pageWeights": {
      "products": 2.0,
      "pricing": 2.0,
      "blog": 1.0
    }
  }
}
```

#### Profile Lifecycle

```
┌─────────────┐
│   CREATE    │ ← AI Discovery OR Manual
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  VALIDATE   │ ← Schema validation
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    SAVE     │ ← ProfileManager.saveProfile()
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   ACTIVE    │ ← Monitoring runs
└──────┬──────┘
       │
       ├─────→ PAUSED (temporarily stop)
       │
       └─────→ ARCHIVED (historical reference)
```

### 4. Dashboard Components

#### Main Dashboard (`dashboard/index.html`)
**Features**:
- Profile selector dropdown
- Real-time change feed
- Importance band filtering
- Search and sorting
- Multi-profile summary view

**Data Loading**:
```javascript
// Single profile view
loadProfileData(profileId) → Display changes

// Multi-profile view
loadAllProfiles() → Summary cards
```

#### Setup Wizard (`dashboard/setup-wizard.html`)
**5-Step Process**:
1. Domain Setup (name, description, mode)
2. AI Discovery (seed competitors, run AI)
3. Review Results (select competitors/URLs)
4. Importance Scale (customize bands)
5. Complete (summary and launch)

**Wizard State**:
```javascript
wizardState = {
  currentStep: 1,
  domain: "energy drinks",
  setupMode: "ai",
  discoveredProfile: {...},
  customizations: {...}
}
```

#### Profile Manager (`dashboard/profile-manager.html`)
**Features**:
- Grid view of all profiles
- Profile cards with stats
- Create/edit/delete operations
- Export/import profiles
- Quick profile switching

## Data Flow Diagrams

### Monitoring Workflow

```
┌──────────────┐
│ Trigger      │ (Manual or Scheduled)
│ Monitor Run  │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│ Load Profile Config  │
│ profileId → profile  │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ For Each Competitor  │
│ in profile           │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ For Each URL         │
│ Extract Content      │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Load Baseline        │
│ (previous content)   │
└──────┬───────────────┘
       │
       ├─→ No Baseline? → Create Baseline → DONE
       │
       ▼
┌──────────────────────┐
│ Content Changed?     │
└──────┬───────────────┘
       │
       ├─→ No → DONE
       │
       ▼ Yes
┌──────────────────────┐
│ Calculate Score      │
│ (keywords + weights) │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Find Importance Band │
│ score → band         │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Optional: AI Analysis│
│ (Claude enhancement) │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Store Change         │
│ Update Baseline      │
└──────┬───────────────┘
       │
       ▼
┌──────────────┐
│ Notification │ (Email, Slack, etc.)
└──────────────┘
```

### Profile Creation Workflow

```
┌──────────────┐
│ User Input   │
│ Domain + 2-3 │
│ Competitors  │
└──────┬───────┘
       │
       ▼
┌───────────────────────┐
│ AI Discovery          │
│ DomainDiscovery.js    │
└───────┬───────────────┘
        │
        ├─→ CompetitorResearch → 10-15 competitors
        │
        ├─→ URLDiscovery → 4-8 URLs each
        │
        ├─→ KeywordExtraction → High/med/low keywords
        │
        ├─→ ImportanceBands → 6 bands (0-10)
        │
        └─→ PageWeights → Type multipliers
        │
        ▼
┌───────────────────────┐
│ Assembled Profile     │
│ (JSON object)         │
└───────┬───────────────┘
        │
        ▼
┌───────────────────────┐
│ User Review & Edit    │
│ (Setup Wizard)        │
└───────┬───────────────┘
        │
        ▼
┌───────────────────────┐
│ Schema Validation     │
│ profile-schema.json   │
└───────┬───────────────┘
        │
        ▼
┌───────────────────────┐
│ Save Profile          │
│ ProfileManager        │
└───────┬───────────────┘
        │
        ▼
┌───────────────────────┐
│ Create Storage Sheets │
│ Competitors_{id}      │
│ Changes_{id}          │
│ ImportanceBands_{id}  │
└───────────────────────┘
```

## Integration Points

### External Services

**Claude API (Anthropic)**
- Analysis of content changes
- Profile discovery
- Intelligent scoring recommendations

**Google Sheets**
- Multi-profile data storage
- Change history
- Baseline content storage

**Email/Notifications**
- Profile-specific alerts
- Change summaries
- Critical change notifications

### API Endpoints

```
GET  /api/profiles              → List all profiles
GET  /api/profiles/{id}         → Get profile config
POST /api/profiles              → Create new profile
PUT  /api/profiles/{id}         → Update profile
DEL  /api/profiles/{id}         → Delete profile

GET  /api/profiles/{id}/changes → Get recent changes
GET  /api/profiles/{id}/monitor → Trigger monitor run
GET  /api/profiles/{id}/stats   → Get profile statistics

POST /api/discovery             → Start AI discovery
GET  /api/discovery/{jobId}     → Check discovery status
```

## Multi-Profile Architecture

### Data Isolation

Each profile has completely isolated data:

```
Profile A (Energy Drinks)
├── Competitors_abc123
├── Changes_abc123
└── ImportanceBands_abc123

Profile B (AI Companies)
├── Competitors_def456
├── Changes_def456
└── ImportanceBands_def456
```

### Concurrent Monitoring

Profiles can run simultaneously:
- Independent schedules
- Isolated error handling
- Separate notification channels
- No cross-contamination

### Profile Switching

Dashboard supports instant switching:
```javascript
switchProfile(newProfileId) {
  // Load profile config
  // Update UI context
  // Fetch profile-specific data
  // Update charts and tables
}
```

## Performance Considerations

### Caching Strategy

1. **Profile Config Cache**: Load once per run
2. **Template Cache**: Load templates once
3. **Baseline Cache**: Store in memory during run

### Rate Limiting

- Crawl delay between URLs (default: 2s)
- Claude API rate limits
- Google Sheets API quotas

### Optimization

- Batch Sheet operations
- Parallel URL processing (where safe)
- Incremental updates only
- Compression for large content

## Security Considerations

### API Key Management

- Claude API key stored in environment
- Never committed to git
- Encrypted in Google Sheets

### Profile Access Control

- Profile-level permissions (future)
- API authentication required
- CORS configuration for web app

### Data Privacy

- Content hashed before storage
- Optional content encryption
- Configurable data retention

## Scalability

### Current Limits

- Profiles: ~20 active profiles
- Competitors per profile: ~20
- URLs per competitor: ~10
- Total URLs: ~4000

### Future Scaling

- Profile sharding across sheets
- Database backend option
- Distributed crawling
- Queue-based processing

## Technology Stack

**Core**:
- JavaScript (ES6+)
- Google Apps Script
- Node.js (for local development)

**AI/ML**:
- Anthropic Claude API (Sonnet 3.5)

**Storage**:
- Google Sheets (primary)
- JSON files (development)

**Frontend**:
- Vanilla JavaScript
- CSS3 (modern grid/flexbox)
- No framework dependencies

**Deployment**:
- Google Apps Script (production)
- GitHub Actions (automation)
- Web App (dashboard hosting)

## Error Handling

### Monitoring Errors

```javascript
try {
  content = await extractContent(url)
} catch (error) {
  // Log error
  // Continue to next URL
  // Report in summary
  results.errors.push({url, error})
}
```

### AI Analysis Fallback

```javascript
try {
  analysis = await callClaude(prompt)
} catch (error) {
  // Use basic keyword analysis
  analysis = fallbackAnalysis(content)
  analysis.analysisType = 'basic'
}
```

### Profile Validation

```javascript
const valid = validateProfileSchema(profile)
if (!valid) {
  throw new ValidationError(validator.errors)
}
```

## Monitoring & Observability

### Logging

- Structured logs per profile
- Run summaries
- Error tracking
- Performance metrics

### Metrics

- Changes detected per profile
- Average relevance scores
- AI analysis success rate
- Crawl success rate
- Response times

### Alerts

- Critical changes (9-10)
- Monitoring failures
- API quota warnings
- Schema validation errors

## Future Architecture Enhancements

1. **Database Backend**: PostgreSQL or MongoDB
2. **Queue System**: Bull/Redis for job processing
3. **Microservices**: Split discovery/monitoring/analysis
4. **Caching Layer**: Redis for profile configs
5. **Event Streaming**: Kafka for change events
6. **GraphQL API**: More flexible querying
7. **WebSockets**: Real-time dashboard updates

---

*Last Updated: 2025-10-16*
*Version: 2.0.0*
