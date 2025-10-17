# API Reference

Complete JavaScript API documentation for the Generic Web Monitor framework.

## Table of Contents

1. [UniversalMonitor API](#universalmonitor-api)
2. [UniversalAnalyzer API](#universalanalyzer-api)
3. [ProfileManager API](#profilemanager-api)
4. [DomainDiscovery API](#domaindiscovery-api)
5. [MultiProfileStorage API](#multiprofilestorage-api)
6. [Web API Endpoints](#web-api-endpoints)
7. [Error Handling](#error-handling)
8. [Examples](#examples)

---

## UniversalMonitor API

**Location**: `/Users/sethredmore/generic-web-monitor/core/monitoring/UniversalMonitor.js`

Profile-driven monitoring engine that crawls URLs and detects changes.

### Class: `UniversalMonitor`

#### Constructor

```javascript
new UniversalMonitor(profile, options)
```

**Parameters**:
- `profile` (Object): Complete profile configuration
- `options` (Object, optional): Override defaults

**Options**:
```javascript
{
  maxContentLength: 50000,     // Max chars to extract
  crawlDelay: 2000,            // Delay between URLs (ms)
  timeout: 30000,              // Request timeout (ms)
  userAgent: 'GenericWebMonitor/2.0'
}
```

**Example**:
```javascript
const profile = loadProfile('energy-drinks');
const monitor = new UniversalMonitor(profile, {
  crawlDelay: 3000  // Slower crawling
});
```

#### Methods

##### `processMonitor(competitor)`

Monitor all URLs for a single competitor.

**Parameters**:
- `competitor` (Object): Competitor object from profile

**Returns**: `Promise<Object>`
```javascript
{
  profileId: "uuid",
  profileName: "Energy Drinks",
  company: "Red Bull",
  urls: [
    {
      url: "https://redbull.com",
      type: "homepage",
      status: "changed" | "unchanged" | "baseline_created",
      relevanceScore: 7,
      importanceBand: "Important"
    }
  ],
  changes: [
    {
      profileId: "uuid",
      company: "Red Bull",
      url: "https://redbull.com/products",
      relevanceScore: 9,
      importanceBand: {
        min: 9, max: 10,
        label: "Critical",
        description: "..."
      },
      detectedAt: "2025-01-16T14:30:00Z"
    }
  ],
  errors: [
    {
      url: "https://example.com",
      error: "Timeout after 30s"
    }
  ]
}
```

**Example**:
```javascript
const competitor = profile.competitors[0];
const results = await monitor.processMonitor(competitor);

console.log(`Checked ${results.urls.length} URLs`);
console.log(`Found ${results.changes.length} changes`);
```

##### `calculateRelevanceScore(oldContent, newContent, url)`

Calculate relevance score based on profile keywords.

**Parameters**:
- `oldContent` (String): Previous page content
- `newContent` (String): Current page content
- `url` (String): Page URL

**Returns**: `Number` (1-10)

**Scoring Logic**:
```javascript
score = 5 (base)
+ 2 for each high-priority keyword found
+ 1 for each medium-priority keyword
- 1 for each low-priority keyword
× pageWeight multiplier
```

**Example**:
```javascript
const oldContent = "Welcome to our site";
const newContent = "Launching new product line with revolutionary formula";
const score = monitor.calculateRelevanceScore(oldContent, newContent, url);
// Returns: ~9 (has "launching", "new product", "formula")
```

##### `findImportanceBand(score)`

Map relevance score to importance band.

**Parameters**:
- `score` (Number): Relevance score (0-10)

**Returns**: `Object` or `null`
```javascript
{
  min: 9, max: 10,
  label: "Critical",
  description: "New product lines, major formula changes",
  examples: ["Launching new drink line", "..."]
}
```

**Example**:
```javascript
const band = monitor.findImportanceBand(9);
console.log(band.label);  // "Critical"
```

##### `extractPageContent(url)`

Extract and normalize page content.

**Parameters**:
- `url` (String): URL to extract

**Returns**: `Promise<Object>`
```javascript
{
  success: true,
  content: "Page text content...",
  contentHash: "sha256-hash",
  title: "Page Title",
  extractedAt: "2025-01-16T14:30:00Z",
  wordCount: 1523,
  links: 45
}
```

**Error Response**:
```javascript
{
  success: false,
  error: "Timeout after 30s",
  url: "https://example.com"
}
```

**Example**:
```javascript
const extraction = await monitor.extractPageContent('https://redbull.com');
if (extraction.success) {
  console.log(`Extracted ${extraction.wordCount} words`);
}
```

##### `identifyPageType(url)`

Identify page type from URL.

**Parameters**:
- `url` (String): URL to analyze

**Returns**: `String` (Page type)

**Recognition Patterns**:
```javascript
"/pricing" → "pricing"
"/products" → "products"
"/blog/" → "blog"
"/news/" → "news"
"/api" → "api"
"/docs" → "docs"
"/" → "homepage"
```

**Example**:
```javascript
const type = monitor.identifyPageType('https://example.com/products');
// Returns: "products"
```

##### `getBaseline(url)`

Retrieve baseline content for URL.

**Parameters**:
- `url` (String): URL to lookup

**Returns**: `Promise<Object | null>`
```javascript
{
  content: "Previous content",
  contentHash: "sha256-hash",
  storedAt: "2025-01-15T10:00:00Z"
}
```

**Example**:
```javascript
const baseline = await monitor.getBaseline('https://redbull.com');
if (baseline) {
  console.log(`Baseline from ${baseline.storedAt}`);
}
```

##### `storeBaseline(company, url, extraction)`

Store new baseline content.

**Parameters**:
- `company` (String): Company name
- `url` (String): URL
- `extraction` (Object): Extraction result

**Returns**: `Promise<void>`

**Example**:
```javascript
const extraction = await monitor.extractPageContent(url);
await monitor.storeBaseline('Red Bull', url, extraction);
```

### Function: `monitorProfile(profileId)`

Monitor all competitors in a profile.

**Parameters**:
- `profileId` (String): Profile UUID

**Returns**: `Promise<Object>`
```javascript
{
  profileId: "uuid",
  profileName: "Energy Drinks",
  startTime: "2025-01-16T14:00:00Z",
  endTime: "2025-01-16T14:15:00Z",
  competitors: [
    {
      company: "Red Bull",
      urls: [...],
      changes: [...],
      errors: [...]
    }
  ],
  totalChanges: 5,
  duration: 900  // seconds
}
```

**Example**:
```javascript
const results = await monitorProfile('energy-drinks-uuid');
console.log(`Found ${results.totalChanges} changes across ${results.competitors.length} competitors`);
```

---

## UniversalAnalyzer API

**Location**: `/Users/sethredmore/generic-web-monitor/core/analysis/UniversalAnalyzer.js`

AI-powered analysis using Claude with profile-specific templates.

### Class: `UniversalAnalyzer`

#### Constructor

```javascript
new UniversalAnalyzer(profile, options)
```

**Parameters**:
- `profile` (Object): Profile configuration
- `options` (Object, optional): API configuration

**Options**:
```javascript
{
  apiKey: 'sk-...',         // Claude API key
  model: 'claude-sonnet-3.5-20241022',
  maxTokens: 2000,
  temperature: 0
}
```

**Example**:
```javascript
const analyzer = new UniversalAnalyzer(profile, {
  apiKey: process.env.CLAUDE_API_KEY
});
```

#### Methods

##### `analyzeContent(content, previousContent, url, company)`

Analyze content change with AI.

**Parameters**:
- `content` (String): Current content
- `previousContent` (String): Previous content
- `url` (String): Page URL
- `company` (String): Company name

**Returns**: `Promise<Object>`
```javascript
{
  summary: "Red Bull announces new zero-sugar line",
  keyChanges: [
    "New product line: Red Bull Zero",
    "Targeting health-conscious consumers",
    "Available nationwide starting March"
  ],
  significanceScore: 9,
  urgency: "high",
  competitiveIntel: [
    "First major zero-sugar line from Red Bull",
    "Likely response to Monster's success in this segment"
  ],
  recommendations: [
    "Monitor competitor responses within 6 months",
    "Track market share impact in Q2/Q3"
  ],
  analysisType: "claude-enhanced",
  importanceBand: {
    min: 9, max: 10,
    label: "Critical"
  },
  profileId: "uuid"
}
```

**Example**:
```javascript
const analysis = await analyzer.analyzeContent(
  newContent,
  oldContent,
  'https://redbull.com/products',
  'Red Bull'
);

console.log(`Score: ${analysis.significanceScore}/10`);
console.log(`Summary: ${analysis.summary}`);
```

##### `createAnalysisPrompt(content, previousContent, url, company)`

Generate Claude prompt from template.

**Parameters**:
- Same as `analyzeContent()`

**Returns**: `String` (Formatted prompt)

**Example**:
```javascript
const prompt = analyzer.createAnalysisPrompt(
  newContent,
  oldContent,
  url,
  'Red Bull'
);
console.log(prompt);
```

##### `loadPromptTemplate(templatePath)`

Load and cache analysis template.

**Parameters**:
- `templatePath` (String): Path to template file

**Returns**: `String` (Template content)

**Example**:
```javascript
const template = analyzer.loadPromptTemplate(
  'templates/energy-drinks-analysis.txt'
);
```

##### `formatImportanceBands()`

Format importance bands for prompt injection.

**Returns**: `String` (Formatted bands)

**Output Example**:
```
9-10 (Critical): New product lines, major formula changes
  Examples: Launching new drink line, Discontinuing major product

7-8 (Important): New flavors, packaging redesigns
  Examples: New flavor release, Packaging overhaul
```

**Example**:
```javascript
const formatted = analyzer.formatImportanceBands();
console.log(formatted);
```

##### `fallbackAnalysis(content)`

Basic keyword-based analysis (when AI unavailable).

**Parameters**:
- `content` (String): Content to analyze

**Returns**: `Object`
```javascript
{
  summary: "Content updated (AI analysis unavailable)",
  significanceScore: 5,
  analysisType: "basic",
  keyChanges: [],
  urgency: "medium"
}
```

**Example**:
```javascript
const basic = analyzer.fallbackAnalysis(content);
```

---

## ProfileManager API

**Location**: `/Users/sethredmore/generic-web-monitor/core/storage/ProfileManager.js`

CRUD operations for profile management.

### Class: `ProfileManager`

#### Constructor

```javascript
new ProfileManager(storage)
```

**Parameters**:
- `storage` (String, optional): Storage backend ('sheets' or 'json')

**Example**:
```javascript
const manager = new ProfileManager('sheets');
```

#### Methods

##### `saveProfile(profile)`

Save or update profile.

**Parameters**:
- `profile` (Object): Complete profile configuration

**Returns**: `String` (Profile ID)

**Side Effects**:
- Creates associated storage sheets/files
- Saves importance bands
- Updates metadata

**Example**:
```javascript
const profile = {
  id: generateUUID(),
  name: "Energy Drinks",
  domain: "energy-drinks",
  // ... rest of profile
};

const profileId = manager.saveProfile(profile);
console.log(`Saved profile: ${profileId}`);
```

##### `loadProfile(profileId)`

Load profile by ID.

**Parameters**:
- `profileId` (String): Profile UUID

**Returns**: `Object` (Profile configuration)

**Throws**: `Error` if profile not found

**Example**:
```javascript
try {
  const profile = manager.loadProfile('energy-drinks-uuid');
  console.log(`Loaded: ${profile.name}`);
} catch (error) {
  console.error('Profile not found');
}
```

##### `listProfiles()`

List all profiles.

**Returns**: `Array<Object>`
```javascript
[
  {
    id: "uuid-1",
    name: "Energy Drinks",
    domain: "energy-drinks",
    status: "active",
    created: "2025-01-16T10:00:00Z",
    lastRun: "2025-01-16T14:30:00Z"
  },
  {
    id: "uuid-2",
    name: "AI Competitors",
    domain: "ai-technology",
    status: "active",
    created: "2025-01-10T12:00:00Z",
    lastRun: "2025-01-16T13:45:00Z"
  }
]
```

**Example**:
```javascript
const profiles = manager.listProfiles();
console.log(`Total profiles: ${profiles.length}`);

profiles.forEach(p => {
  console.log(`- ${p.name} (${p.status})`);
});
```

##### `deleteProfile(profileId)`

Delete profile and all associated data.

**Parameters**:
- `profileId` (String): Profile UUID

**Returns**: `void`

**Side Effects**:
- Deletes profile record
- Deletes associated sheets (Competitors, Changes, ImportanceBands)
- Removes baseline storage

**Warning**: This is irreversible!

**Example**:
```javascript
if (confirm('Delete profile permanently?')) {
  manager.deleteProfile('old-profile-uuid');
}
```

##### `validateProfile(profile)`

Validate profile against schema.

**Parameters**:
- `profile` (Object): Profile to validate

**Returns**: `Object`
```javascript
{
  valid: true,
  errors: []
}
// or
{
  valid: false,
  errors: [
    "Missing required field: competitors",
    "Invalid importance band range"
  ]
}
```

**Example**:
```javascript
const validation = manager.validateProfile(profile);
if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
}
```

##### `exportProfile(profileId, format)`

Export profile to file.

**Parameters**:
- `profileId` (String): Profile UUID
- `format` (String): 'json' or 'yaml'

**Returns**: `String` (Serialized profile)

**Example**:
```javascript
const json = manager.exportProfile('energy-drinks-uuid', 'json');
// Save to file
fs.writeFileSync('energy-drinks.json', json);
```

##### `importProfile(data, format)`

Import profile from file.

**Parameters**:
- `data` (String): Serialized profile
- `format` (String): 'json' or 'yaml'

**Returns**: `String` (New profile ID)

**Example**:
```javascript
const json = fs.readFileSync('energy-drinks.json', 'utf8');
const profileId = manager.importProfile(json, 'json');
console.log(`Imported as: ${profileId}`);
```

---

## DomainDiscovery API

**Location**: `/Users/sethredmore/generic-web-monitor/discovery/DomainDiscovery.js`

AI-powered profile discovery and generation.

### Class: `DomainDiscovery`

#### Constructor

```javascript
new DomainDiscovery(apiKey, options)
```

**Parameters**:
- `apiKey` (String): Claude API key
- `options` (Object, optional): Configuration

**Options**:
```javascript
{
  model: 'claude-sonnet-3.5-20241022',
  verbose: true  // Log progress
}
```

**Example**:
```javascript
const discovery = new DomainDiscovery(
  process.env.CLAUDE_API_KEY,
  { verbose: true }
);
```

#### Methods

##### `discoverDomain(seedInput)`

Complete domain discovery workflow.

**Parameters**:
- `seedInput` (Object): Discovery configuration

**Input Structure**:
```javascript
{
  domain: "energy drinks",
  seedCompetitors: ["Red Bull", "Monster Energy"],
  targetMarket: "US",
  maxCompetitors: 15,
  autoExpand: true
}
```

**Returns**: `Promise<Object>` (Complete profile)

**Example**:
```javascript
const profile = await discovery.discoverDomain({
  domain: "craft beer",
  seedCompetitors: ["Dogfish Head", "Stone Brewing"],
  targetMarket: "US",
  maxCompetitors: 12
});

console.log(`Discovered ${profile.competitors.length} competitors`);
console.log(`Generated ${profile.importanceBands.length} importance bands`);
```

##### `discoverCompetitors(seedInput)`

Find competitors using AI.

**Parameters**:
- `seedInput` (Object): See `discoverDomain()`

**Returns**: `Promise<Array<Object>>`
```javascript
[
  {
    name: "Rockstar",
    website: "https://rockstarenergy.com",
    productLines: ["Energy Drinks", "Recovery Drinks"],
    marketPosition: "challenger",
    description: "Energy drink brand owned by PepsiCo"
  }
]
```

**Example**:
```javascript
const competitors = await discovery.discoverCompetitors({
  domain: "energy drinks",
  seedCompetitors: ["Red Bull", "Monster"],
  targetMarket: "US"
});
```

##### `discoverURLs(competitors, domain)`

Discover important URLs for each competitor.

**Parameters**:
- `competitors` (Array): List of competitors
- `domain` (String): Domain context

**Returns**: `Promise<Array<Object>>`
```javascript
[
  {
    name: "Red Bull",
    urls: [
      {
        url: "https://redbull.com",
        type: "homepage",
        priority: "medium"
      },
      {
        url: "https://redbull.com/products",
        type: "products",
        priority: "high"
      }
    ]
  }
]
```

**Example**:
```javascript
const withUrls = await discovery.discoverURLs(competitors, "energy drinks");
```

##### `extractKeywords(domain, competitors)`

Extract domain-specific keywords.

**Parameters**:
- `domain` (String): Domain name
- `competitors` (Array): Competitor list

**Returns**: `Promise<Object>`
```javascript
{
  high: ["launch", "new product", "discontinued", "recall"],
  medium: ["flavor", "packaging", "partnership", "sponsorship"],
  low: ["campaign", "promotion", "contest", "event"]
}
```

**Example**:
```javascript
const keywords = await discovery.extractKeywords(
  "energy drinks",
  competitors
);
```

##### `generateImportanceBands(domain)`

Generate importance scale for domain.

**Parameters**:
- `domain` (String): Domain name

**Returns**: `Promise<Array<Object>>`
```javascript
[
  {
    min: 9, max: 10,
    label: "Critical",
    description: "New product lines, major formula changes, market entry/exit",
    examples: [
      "Launching new energy drink line",
      "Discontinuing major product",
      "Major formula reformulation"
    ]
  }
]
```

**Example**:
```javascript
const bands = await discovery.generateImportanceBands("energy drinks");
```

##### `suggestPageWeights(domain)`

Suggest page weight multipliers.

**Parameters**:
- `domain` (String): Domain name

**Returns**: `Promise<Object>`
```javascript
{
  pageWeights: {
    products: 2.0,
    pricing: 1.8,
    sponsorships: 1.5,
    news: 1.2,
    blog: 1.0,
    homepage: 0.7
  },
  reasoning: "Products and pricing are critical for energy drinks competitive intelligence"
}
```

**Example**:
```javascript
const weights = await discovery.suggestPageWeights("energy drinks");
```

### Function: `discoverDomainQuick(domain, seedCompetitors)`

Convenience function for rapid discovery.

**Parameters**:
- `domain` (String): Domain name
- `seedCompetitors` (Array<String>): 2-3 competitor names

**Returns**: `Promise<Object>` (Complete profile)

**Example**:
```javascript
const profile = await discoverDomainQuick(
  "fast food",
  ["McDonald's", "Burger King", "Wendy's"]
);

// Profile ready to save and use
saveProfile(profile);
```

---

## MultiProfileStorage API

**Location**: `/Users/sethredmore/generic-web-monitor/core/storage/MultiProfileStorage.js`

Per-profile data management.

### Class: `MultiProfileStorage`

#### Constructor

```javascript
new MultiProfileStorage(backend)
```

**Parameters**:
- `backend` (String): 'sheets' or 'json'

#### Methods

##### `storeChange(profileId, change)`

Store detected change.

**Parameters**:
- `profileId` (String): Profile UUID
- `change` (Object): Change data

**Returns**: `Promise<void>`

**Example**:
```javascript
await storage.storeChange('energy-drinks-uuid', {
  company: "Red Bull",
  url: "https://redbull.com/products",
  relevanceScore: 9,
  importanceBand: {...},
  detectedAt: new Date().toISOString()
});
```

##### `getRecentChanges(profileId, limit, sinceDate)`

Retrieve recent changes.

**Parameters**:
- `profileId` (String): Profile UUID
- `limit` (Number, optional): Max results (default: 100)
- `sinceDate` (String, optional): ISO date filter

**Returns**: `Promise<Array<Object>>`

**Example**:
```javascript
const changes = await storage.getRecentChanges(
  'energy-drinks-uuid',
  50,
  '2025-01-15T00:00:00Z'
);
```

##### `getProfileStats(profileId)`

Get profile statistics.

**Returns**: `Promise<Object>`
```javascript
{
  totalChanges: 125,
  changesLast24h: 5,
  changesLast7d: 23,
  criticalChanges: 3,
  lastRun: "2025-01-16T14:30:00Z",
  averageScore: 6.2
}
```

---

## Web API Endpoints

RESTful API for web dashboard.

### Profiles

#### GET `/api/profiles`

List all profiles.

**Response**:
```json
{
  "profiles": [
    {
      "id": "uuid",
      "name": "Energy Drinks",
      "domain": "energy-drinks",
      "status": "active",
      "created": "2025-01-16T10:00:00Z"
    }
  ],
  "total": 2
}
```

#### GET `/api/profiles/:id`

Get profile configuration.

**Response**:
```json
{
  "profile": {
    "id": "uuid",
    "name": "Energy Drinks",
    "competitors": [...],
    "importanceBands": [...]
  }
}
```

#### POST `/api/profiles`

Create new profile.

**Request Body**:
```json
{
  "profile": {
    "name": "My Profile",
    "domain": "my-domain",
    ...
  }
}
```

**Response**:
```json
{
  "id": "new-uuid",
  "status": "created"
}
```

#### PUT `/api/profiles/:id`

Update profile.

#### DELETE `/api/profiles/:id`

Delete profile.

### Monitoring

#### GET `/api/profiles/:id/changes`

Get recent changes.

**Query Parameters**:
- `limit` (Number): Max results
- `since` (ISO Date): Filter by date
- `minScore` (Number): Minimum relevance score

**Response**:
```json
{
  "changes": [
    {
      "company": "Red Bull",
      "url": "https://redbull.com/products",
      "score": 9,
      "band": "Critical",
      "detectedAt": "2025-01-16T14:30:00Z"
    }
  ],
  "total": 5
}
```

#### POST `/api/profiles/:id/monitor`

Trigger monitor run.

**Response**:
```json
{
  "jobId": "monitor-123",
  "status": "running",
  "startedAt": "2025-01-16T14:30:00Z"
}
```

### Discovery

#### POST `/api/discovery`

Start AI discovery.

**Request Body**:
```json
{
  "domain": "energy drinks",
  "seedCompetitors": ["Red Bull", "Monster"],
  "maxCompetitors": 15
}
```

**Response**:
```json
{
  "jobId": "discovery-456",
  "status": "running"
}
```

#### GET `/api/discovery/:jobId`

Check discovery status.

---

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "PROFILE_NOT_FOUND",
    "message": "Profile with ID 'abc123' does not exist",
    "details": {
      "profileId": "abc123"
    }
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `PROFILE_NOT_FOUND` | 404 | Profile doesn't exist |
| `INVALID_PROFILE` | 400 | Schema validation failed |
| `API_KEY_MISSING` | 401 | Claude API key not configured |
| `RATE_LIMIT` | 429 | Too many requests |
| `DISCOVERY_FAILED` | 500 | AI discovery error |
| `MONITORING_FAILED` | 500 | Monitor run error |

### Try-Catch Pattern

```javascript
try {
  const profile = loadProfile(profileId);
  const results = await monitorProfile(profile.id);
} catch (error) {
  if (error.code === 'PROFILE_NOT_FOUND') {
    console.error('Profile does not exist');
  } else if (error.code === 'API_KEY_MISSING') {
    console.error('Configure Claude API key');
  } else {
    console.error('Unexpected error:', error);
  }
}
```

---

## Examples

### Complete Monitoring Workflow

```javascript
// 1. Load profile
const profile = loadProfile('energy-drinks');

// 2. Create monitor
const monitor = new UniversalMonitor(profile);

// 3. Monitor all competitors
const results = await monitorProfile(profile.id);

// 4. Analyze changes with AI
const analyzer = new UniversalAnalyzer(profile);
for (const change of results.changes) {
  const analysis = await analyzer.analyzeContent(
    change.newContent,
    change.oldContent,
    change.url,
    change.company
  );

  console.log(`${change.company}: ${analysis.summary}`);
  console.log(`Score: ${analysis.significanceScore}/10`);
}

// 5. Store results
const storage = new MultiProfileStorage('sheets');
for (const change of results.changes) {
  await storage.storeChange(profile.id, change);
}
```

### Create Profile with AI Discovery

```javascript
// 1. Start discovery
const discovery = new DomainDiscovery(apiKey);
const profile = await discovery.discoverDomain({
  domain: "craft coffee",
  seedCompetitors: ["Blue Bottle", "Stumptown", "Intelligentsia"],
  targetMarket: "US",
  maxCompetitors: 12
});

// 2. Review and customize
profile.importanceBands[0].description = "New roast releases, cafe openings";

// 3. Validate
const manager = new ProfileManager();
const validation = manager.validateProfile(profile);
if (!validation.valid) {
  throw new Error('Invalid profile: ' + validation.errors.join(', '));
}

// 4. Save
const profileId = manager.saveProfile(profile);
console.log(`Created profile: ${profileId}`);

// 5. Run first monitor
const results = await monitorProfile(profileId);
console.log(`Found ${results.totalChanges} changes`);
```

### Dashboard Integration

```javascript
// Load profile data for dashboard
async function loadDashboard(profileId) {
  const manager = new ProfileManager();
  const storage = new MultiProfileStorage('sheets');

  // Load profile config
  const profile = manager.loadProfile(profileId);

  // Load recent changes
  const changes = await storage.getRecentChanges(profileId, 50);

  // Load stats
  const stats = await storage.getProfileStats(profileId);

  // Render dashboard
  renderDashboard({
    profile,
    changes,
    stats
  });
}
```

### Batch Processing

```javascript
// Monitor all active profiles
async function monitorAll() {
  const manager = new ProfileManager();
  const profiles = manager.listProfiles();

  const results = [];
  for (const profileMeta of profiles) {
    if (profileMeta.status !== 'active') continue;

    try {
      const result = await monitorProfile(profileMeta.id);
      results.push({
        profileId: profileMeta.id,
        success: true,
        changes: result.totalChanges
      });
    } catch (error) {
      results.push({
        profileId: profileMeta.id,
        success: false,
        error: error.message
      });
    }
  }

  return results;
}
```

---

**Next Steps**:
- See `/Users/sethredmore/generic-web-monitor/docs/ARCHITECTURE.md` for system design
- See `/Users/sethredmore/generic-web-monitor/docs/PROFILE-GUIDE.md` for profile creation
- See `/Users/sethredmore/generic-web-monitor/docs/DEPLOYMENT.md` for deployment

---

*Last Updated: 2025-10-16*
*Version: 2.0.0*
