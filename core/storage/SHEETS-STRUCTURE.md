# Google Sheets Storage Structure

## Overview

The multi-profile storage system uses Google Sheets for persistent data storage with complete data isolation between profiles. Each profile gets its own dedicated sheets for competitors, changes, baselines, and importance bands.

## Sheet Architecture

### 1. Profiles Sheet (Global)

**Purpose**: Master registry of all monitoring profiles

**Columns**:
```
| Profile ID | Name | Domain | Status | Created | Last Modified | Config JSON |
```

**Example Data**:
```
| uuid-abc-123 | Energy Drinks | energy-drinks | active | 2025-01-15T10:00:00Z | 2025-01-16T14:00:00Z | {full JSON config} |
| uuid-def-456 | AI Competitors | ai-technology | active | 2025-01-10T12:00:00Z | 2025-01-16T13:30:00Z | {full JSON config} |
| uuid-ghi-789 | Automobiles | automotive | paused | 2024-12-01T09:00:00Z | 2025-01-15T08:00:00Z | {full JSON config} |
```

**Fields**:
- **Profile ID**: Unique identifier (UUID)
- **Name**: Display name for the profile
- **Domain**: Industry/domain identifier (e.g., "energy-drinks", "ai-technology")
- **Status**: `active`, `paused`, or `archived`
- **Created**: ISO 8601 timestamp of creation
- **Last Modified**: ISO 8601 timestamp of last update
- **Config JSON**: Complete profile configuration as JSON string

**Operations**:
- Created automatically on first use
- Updated via `ProfileManager.saveProfile()`
- Queried via `ProfileManager.listProfiles()`
- Deleted via `ProfileManager.deleteProfile()`

---

### 2. Competitors_{ProfileID} Sheet (Per Profile)

**Purpose**: Track monitoring status for each competitor in a profile

**Sheet Name Format**: `Competitors_energy-drinks`, `Competitors_ai-technology`, etc.

**Columns**:
```
| Company | URL Count | Keywords | Last Check | Status | Changes (24h) | Total Changes |
```

**Example Data**:
```
| Red Bull | 5 | energy, caffeine, taurine | 2025-01-16T14:00:00Z | monitored | 2 | 47 |
| Monster | 6 | energy, extreme, gaming | 2025-01-16T14:05:00Z | monitored | 1 | 23 |
| Rockstar | 4 | energy, performance | 2025-01-16T14:10:00Z | monitored | 0 | 15 |
```

**Fields**:
- **Company**: Competitor company name
- **URL Count**: Number of URLs being monitored for this competitor
- **Keywords**: Comma-separated list of tracking keywords
- **Last Check**: ISO 8601 timestamp of most recent check
- **Status**: `pending`, `monitored`, `error`, `paused`
- **Changes (24h)**: Number of changes detected in last 24 hours (reset daily)
- **Total Changes**: All-time change count

**Operations**:
- Created automatically when profile is saved
- Initialized via `ProfileManager.initializeCompetitors()`
- Updated via `MultiProfileStorage.updateCompetitorStats()`
- Queried via `MultiProfileStorage.getCompetitorStatus()`
- Daily reset via `MultiProfileStorage.resetDailyCounters()`

---

### 3. Changes_{ProfileID} Sheet (Per Profile)

**Purpose**: Store all detected changes with AI analysis

**Sheet Name Format**: `Changes_energy-drinks`, `Changes_ai-technology`, etc.

**Columns**:
```
| Timestamp | Company | URL | Score | Band Label | Band Min-Max | Summary | AI Analysis JSON |
```

**Example Data**:
```
| 2025-01-16T14:00:00Z | Red Bull | redbull.com/products | 9 | Critical | 9-10 | New product line: Red Bull Zero | {full AI analysis} |
| 2025-01-16T13:45:00Z | Monster | monster.com/pricing | 7 | Important | 7-8 | Price increase on Ultra line | {full AI analysis} |
| 2025-01-16T13:30:00Z | Rockstar | rockstar.com/news | 5 | Moderate | 5-6 | New blog post on sponsorships | {full AI analysis} |
```

**Fields**:
- **Timestamp**: ISO 8601 timestamp when change was detected
- **Company**: Competitor that changed
- **URL**: Specific URL where change was detected
- **Score**: Importance score (0-10) from AI analysis
- **Band Label**: Importance band label (e.g., "Critical", "Important")
- **Band Min-Max**: Score range for the band (e.g., "9-10", "7-8")
- **Summary**: Human-readable change summary
- **AI Analysis JSON**: Complete AI analysis object including reasoning, competitive impact, etc.

**AI Analysis JSON Structure**:
```json
{
  "score": 9,
  "bandLabel": "Critical",
  "bandMin": 9,
  "bandMax": 10,
  "reasoning": "Launch of new product line targeting health-conscious consumers",
  "competitiveImpact": "High - direct competition to sugar-free segment",
  "recommendedActions": [
    "Analyze market positioning",
    "Consider response product",
    "Monitor customer response"
  ],
  "confidence": 0.95,
  "keywords": ["launch", "product", "sugar-free", "health"],
  "changeType": "new_product"
}
```

**Operations**:
- Created automatically when profile is created
- Appended via `MultiProfileStorage.saveChange()`
- Queried via `MultiProfileStorage.loadChanges()` with filters
- Stats via `MultiProfileStorage.getChangeStats()`

---

### 4. ImportanceBands_{ProfileID} Sheet (Per Profile)

**Purpose**: Define domain-specific importance scoring criteria

**Sheet Name Format**: `ImportanceBands_energy-drinks`, `ImportanceBands_ai-technology`, etc.

**Columns**:
```
| Min | Max | Label | Description | Examples JSON |
```

**Example Data (Energy Drinks)**:
```
| 9 | 10 | Critical | New product lines, major formula changes, market entry/exit | ["Launching new drink line", "Discontinuing major product", "Major reformulation"] |
| 7 | 8 | Important | New flavors, pricing changes, major partnerships | ["New flavor variant", "Price increase >10%", "Major sponsorship deal"] |
| 5 | 6 | Moderate | Marketing campaigns, packaging updates, minor partnerships | ["New ad campaign", "Can redesign", "Local event sponsorship"] |
| 3 | 4 | Minor | Blog posts, social media, routine updates | ["Instagram post", "Team announcement", "Event recap"] |
| 0 | 2 | Trivial | Typo fixes, minor text changes, irrelevant updates | ["Spelling correction", "Footer update", "Copyright year"] |
```

**Example Data (AI Technology)**:
```
| 9 | 10 | Critical | New AI models, major API changes, pricing shifts | ["GPT-5 release", "API v3 breaking changes", "Enterprise pricing launch"] |
| 7 | 8 | Important | Feature releases, performance improvements, partnerships | ["New embedding model", "2x speed increase", "Microsoft integration"] |
| 5 | 6 | Moderate | Documentation updates, bug fixes, minor features | ["API docs rewrite", "Token limit increase", "New SDK release"] |
| 3 | 4 | Minor | Blog posts, tutorials, community updates | ["How-to guide", "Case study", "Community showcase"] |
| 0 | 2 | Trivial | Typos, minor text edits, formatting changes | ["Spelling fix", "Link update", "CSS adjustment"] |
```

**Fields**:
- **Min**: Minimum score for this band (inclusive)
- **Max**: Maximum score for this band (inclusive)
- **Label**: Display label (e.g., "Critical", "Important", "Moderate")
- **Description**: What types of changes fall into this band
- **Examples JSON**: Array of concrete examples as JSON string

**Operations**:
- Created automatically when profile is created
- Populated via `ProfileManager.saveImportanceBands()`
- Queried via `MultiProfileStorage.loadImportanceBands()`
- Used for scoring via `MultiProfileStorage.getBandForScore()`

---

### 5. Baselines_{ProfileID} Sheet (Per Profile)

**Purpose**: Store content snapshots for change detection

**Sheet Name Format**: `Baselines_energy-drinks`, `Baselines_ai-technology`, etc.

**Columns**:
```
| Timestamp | Company | URL | Content Hash | Title | Description | Last Modified | Raw Content |
```

**Example Data**:
```
| 2025-01-16T14:00:00Z | Red Bull | redbull.com/products | sha256:abc123... | Red Bull Products | Energy drinks... | 2025-01-15T10:00:00Z | <html>... |
| 2025-01-16T14:05:00Z | Monster | monster.com/pricing | sha256:def456... | Monster Pricing | Our pricing... | 2025-01-14T15:30:00Z | <html>... |
```

**Fields**:
- **Timestamp**: When this baseline was captured
- **Company**: Competitor company name
- **URL**: URL of the page
- **Content Hash**: SHA-256 hash of normalized content for change detection
- **Title**: Page title
- **Description**: Meta description
- **Last Modified**: Last-Modified header from HTTP response
- **Raw Content**: Raw HTML/text (truncated to 10,000 chars)

**Operations**:
- Created automatically on first content save
- Updated via `MultiProfileStorage.saveBaseline()`
- Queried via `MultiProfileStorage.loadBaseline()`
- Cleaned up via `MultiProfileStorage.cleanupOldBaselines()`

---

## Data Flow

### Profile Creation Flow
```
1. User creates profile via UI or API
2. ProfileManager.saveProfile() called
3. Row added to "Profiles" sheet
4. Four sheets created:
   - Competitors_{profileId}
   - Changes_{profileId}
   - ImportanceBands_{profileId}
   - Baselines_{profileId} (on-demand)
5. Importance bands populated
6. Competitors initialized
```

### Monitoring Flow
```
1. Monitoring system loads profile via ProfileManager.loadProfile()
2. For each competitor URL:
   a. Fetch current content
   b. Load baseline via MultiProfileStorage.loadBaseline()
   c. Compare content hashes
   d. If changed:
      - Extract changes
      - Call AI for analysis
      - Save change via MultiProfileStorage.saveChange()
      - Update baseline via MultiProfileStorage.saveBaseline()
      - Update stats via MultiProfileStorage.updateCompetitorStats()
```

### Dashboard Query Flow
```
1. Load profile list via ProfileManager.listProfiles()
2. For selected profile:
   a. Load recent changes via MultiProfileStorage.loadChanges()
   b. Load competitor status via MultiProfileStorage.getCompetitorStatus()
   c. Load importance bands via MultiProfileStorage.loadImportanceBands()
   d. Calculate stats via MultiProfileStorage.getChangeStats()
3. Display in UI with band context
```

---

## Best Practices

### Performance
- Use `MultiProfileStorage.loadChanges()` with `limit` parameter for pagination
- Cache importance bands in memory during monitoring runs
- Use content hashes for efficient change detection
- Batch writes when possible

### Data Management
- Run `MultiProfileStorage.resetDailyCounters()` daily via trigger
- Run `MultiProfileStorage.cleanupOldBaselines()` weekly to remove old data
- Archive profiles instead of deleting to preserve history
- Export data regularly via `MultiProfileStorage.exportProfileData()`

### Sheet Limits
- Google Sheets max: 10 million cells per spreadsheet
- Consider splitting very active profiles into separate spreadsheets
- Archive old changes after 90 days to separate sheet
- Monitor sheet size via Apps Script Dashboard

### Security
- Restrict spreadsheet access to authorized users only
- Use service account for API access
- Never expose raw content in public APIs
- Sanitize user input before storage

---

## Migration Guide

### From Single Profile to Multi-Profile

If migrating from a single-profile system:

1. Create `Profiles` sheet
2. Generate UUID for existing profile
3. Rename existing sheets:
   - `Competitors` → `Competitors_{profileId}`
   - `Changes` → `Changes_{profileId}`
   - `ImportanceBands` → `ImportanceBands_{profileId}`
4. Add row to `Profiles` sheet
5. Test with `ProfileManager.loadProfile()`

### Adding New Profile Fields

To add new fields to profiles:

1. Update schema in `/profiles/schemas/profile-schema.json`
2. Add column to `Profiles` sheet
3. Update `ProfileManager.saveProfile()` to include new field
4. Update `ProfileManager.loadProfile()` to parse new field
5. Backfill existing profiles with default values

---

## Troubleshooting

### "Profile not found" Error
- Check profile ID spelling
- Verify row exists in `Profiles` sheet
- Check status is not `archived`

### Missing Changes
- Verify `Changes_{profileId}` sheet exists
- Check content hash comparison logic
- Review AI analysis logs

### Slow Queries
- Add indexes via filters/sorts
- Use time-based filtering
- Implement caching layer
- Consider moving to database for >100k changes

---

## API Reference

See inline JSDoc comments in:
- `/core/storage/ProfileManager.js`
- `/core/storage/MultiProfileStorage.js`

For usage examples, see test files in `/tests/storage/`
