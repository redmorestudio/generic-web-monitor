# Storage System Usage Examples

## Quick Start

### 1. Create a New Profile

```javascript
// Define profile configuration
const profile = {
  id: Utilities.getUuid(),
  name: "Energy Drinks Monitor",
  domain: "energy-drinks",
  description: "Monitor major energy drink competitors",
  status: "active",
  created: new Date().toISOString(),

  competitors: [
    {
      name: "Red Bull",
      urls: [
        { url: "https://redbull.com", type: "homepage" },
        { url: "https://redbull.com/products", type: "products" },
        { url: "https://redbull.com/news", type: "news" }
      ],
      keywords: ["energy", "caffeine", "taurine"]
    },
    {
      name: "Monster",
      urls: [
        { url: "https://monsterenergy.com", type: "homepage" },
        { url: "https://monsterenergy.com/products", type: "products" }
      ],
      keywords: ["energy", "extreme", "gaming"]
    }
  ],

  importanceBands: [
    {
      min: 9,
      max: 10,
      label: "Critical",
      description: "New product lines, major formula changes, market entry/exit",
      examples: [
        "Launching new energy drink line",
        "Discontinuing major product",
        "Major reformulation announcement"
      ]
    },
    {
      min: 7,
      max: 8,
      label: "Important",
      description: "New flavors, pricing changes, major partnerships",
      examples: [
        "New flavor variant launch",
        "Price increase >10%",
        "Major sponsorship deal"
      ]
    },
    {
      min: 5,
      max: 6,
      label: "Moderate",
      description: "Marketing campaigns, packaging updates, minor partnerships",
      examples: [
        "New ad campaign",
        "Can redesign",
        "Local event sponsorship"
      ]
    }
  ]
};

// Save profile
const profileId = saveProfile(profile);
Logger.log(`Profile created: ${profileId}`);
```

---

### 2. Load and List Profiles

```javascript
// Load specific profile
const profile = loadProfile("uuid-abc-123");
Logger.log(`Loaded: ${profile.name} with ${profile.competitors.length} competitors`);

// List all active profiles
const activeProfiles = listProfiles("active");
activeProfiles.forEach(p => {
  Logger.log(`${p.name} (${p.domain}) - Last run: ${p.lastModified}`);
});

// List all profiles
const allProfiles = listProfiles();
Logger.log(`Total profiles: ${allProfiles.length}`);
```

---

### 3. Monitor for Changes

```javascript
function monitorProfile(profileId) {
  const profile = loadProfile(profileId);

  profile.competitors.forEach(competitor => {
    competitor.urls.forEach(urlObj => {
      const url = urlObj.url;

      // Fetch current content
      const response = UrlFetchApp.fetch(url);
      const currentContent = response.getContentText();
      const currentHash = Utilities.computeDigest(
        Utilities.DigestAlgorithm.SHA_256,
        currentContent
      ).map(b => (b + 256).toString(16).slice(-2)).join('');

      // Load baseline
      const baseline = loadBaseline(profileId, url);

      if (!baseline) {
        // First run - save baseline
        saveBaseline(
          profileId,
          competitor.name,
          url,
          currentHash,
          currentContent,
          {
            title: extractTitle(currentContent),
            description: extractDescription(currentContent)
          }
        );
        Logger.log(`Baseline saved for ${competitor.name} - ${url}`);
        return;
      }

      // Check for changes
      if (currentHash !== baseline.contentHash) {
        Logger.log(`Change detected: ${competitor.name} - ${url}`);

        // Extract changes and get AI analysis
        const aiAnalysis = analyzeChange(
          baseline.rawContent,
          currentContent,
          profile.importanceBands
        );

        // Save change
        saveChange(profileId, {
          companyName: competitor.name,
          url: url,
          score: aiAnalysis.score,
          bandLabel: aiAnalysis.bandLabel,
          summary: aiAnalysis.summary,
          aiAnalysis: aiAnalysis
        });

        // Update baseline
        saveBaseline(
          profileId,
          competitor.name,
          url,
          currentHash,
          currentContent,
          {
            title: extractTitle(currentContent),
            description: extractDescription(currentContent)
          }
        );
      }
    });
  });
}
```

---

### 4. Query Changes for Dashboard

```javascript
// Get recent critical changes
const criticalChanges = loadChanges("uuid-abc-123", {
  minScore: 9,
  limit: 10,
  hoursAgo: 24
});

criticalChanges.forEach(change => {
  Logger.log(`${change.bandLabel} (${change.score}/10): ${change.summary}`);
});

// Get all changes for a specific competitor
const redbullChanges = loadChanges("uuid-abc-123", {
  companyName: "Red Bull",
  hoursAgo: 168 // Last 7 days
});

Logger.log(`Red Bull changes (7 days): ${redbullChanges.length}`);

// Get change statistics
const stats = getChangeStats("uuid-abc-123", 24);
Logger.log(`Total changes (24h): ${stats.total}`);
Logger.log(`Critical changes: ${stats.criticalCount}`);
Logger.log(`Average score: ${stats.averageScore}`);
Logger.log(`Changes by band:`, stats.byBand);
Logger.log(`Changes by company:`, stats.byCompany);
```

---

### 5. Work with Importance Bands

```javascript
// Load importance bands
const bands = loadImportanceBands("uuid-abc-123");
bands.forEach(band => {
  Logger.log(`${band.label} (${band.min}-${band.max}): ${band.description}`);
});

// Get band for a score
const score = 8;
const band = getBandForScore("uuid-abc-123", score);
if (band) {
  Logger.log(`Score ${score} is: ${band.label}`);
  Logger.log(`Examples: ${band.examples.join(", ")}`);
}
```

---

### 6. Monitor Competitor Status

```javascript
// Get competitor monitoring status
const competitors = getCompetitorStatus("uuid-abc-123");
competitors.forEach(comp => {
  Logger.log(`${comp.company}:`);
  Logger.log(`  URLs: ${comp.urlCount}`);
  Logger.log(`  Last check: ${comp.lastCheck}`);
  Logger.log(`  Changes (24h): ${comp.changes24h}`);
  Logger.log(`  Total changes: ${comp.totalChanges}`);
});
```

---

### 7. Daily Maintenance Tasks

```javascript
// Reset daily counters (run via time-based trigger)
function dailyMaintenance() {
  const profiles = listProfiles("active");

  profiles.forEach(profile => {
    // Reset 24-hour change counters
    resetDailyCounters(profile.id);
    Logger.log(`Reset counters for: ${profile.name}`);
  });
}

// Weekly cleanup (run via time-based trigger)
function weeklyCleanup() {
  const profiles = listProfiles();

  profiles.forEach(profile => {
    // Clean up baselines older than 30 days
    cleanupOldBaselines(profile.id, 30);
    Logger.log(`Cleaned up baselines for: ${profile.name}`);
  });
}
```

---

### 8. Export Profile Data

```javascript
// Export complete profile data
const exportData = exportProfileData("uuid-abc-123");

Logger.log(`Exported data for: ${exportData.profileId}`);
Logger.log(`Competitors: ${exportData.competitors.length}`);
Logger.log(`Changes: ${exportData.changes.length}`);
Logger.log(`Importance bands: ${exportData.importanceBands.length}`);

// Save to Drive or send via email
const json = JSON.stringify(exportData, null, 2);
DriveApp.createFile(
  `profile-export-${exportData.profileId}-${new Date().toISOString()}.json`,
  json,
  MimeType.PLAIN_TEXT
);
```

---

### 9. Delete Profile

```javascript
// Delete profile and all associated data
const deleted = deleteProfile("uuid-abc-123");
if (deleted) {
  Logger.log("Profile deleted successfully");
} else {
  Logger.log("Profile not found");
}
```

---

## Integration Patterns

### Web App API Endpoint

```javascript
function doGet(e) {
  const action = e.parameter.action;
  const profileId = e.parameter.profileId;

  let response;

  switch(action) {
    case 'list_profiles':
      response = listProfiles();
      break;

    case 'get_changes':
      const limit = parseInt(e.parameter.limit) || 50;
      const minScore = parseInt(e.parameter.minScore) || 0;
      response = loadChanges(profileId, { limit, minScore });
      break;

    case 'get_stats':
      const hours = parseInt(e.parameter.hours) || 24;
      response = getChangeStats(profileId, hours);
      break;

    case 'get_competitors':
      response = getCompetitorStatus(profileId);
      break;

    default:
      response = { error: "Unknown action" };
  }

  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### Time-Based Trigger Setup

```javascript
function setupTriggers() {
  // Monitor every hour
  ScriptApp.newTrigger('hourlyMonitoring')
    .timeBased()
    .everyHours(1)
    .create();

  // Daily maintenance at 2 AM
  ScriptApp.newTrigger('dailyMaintenance')
    .timeBased()
    .atHour(2)
    .everyDays(1)
    .create();

  // Weekly cleanup on Sundays at 3 AM
  ScriptApp.newTrigger('weeklyCleanup')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.SUNDAY)
    .atHour(3)
    .everyWeeks(1)
    .create();
}

function hourlyMonitoring() {
  const profiles = listProfiles("active");

  profiles.forEach(profile => {
    try {
      monitorProfile(profile.id);
      Logger.log(`Monitored: ${profile.name}`);
    } catch (error) {
      Logger.log(`Error monitoring ${profile.name}: ${error}`);
    }
  });
}
```

---

## Error Handling

```javascript
try {
  const profile = loadProfile("invalid-id");
} catch (error) {
  if (error.message.includes("Profile not found")) {
    Logger.log("Profile does not exist");
    // Create new profile or show error to user
  } else {
    Logger.log(`Unexpected error: ${error}`);
  }
}

// Validate before saving
try {
  saveProfile(incompleteProfile);
} catch (error) {
  if (error.message.includes("Missing required field")) {
    Logger.log("Profile validation failed");
    // Show validation errors to user
  }
}
```

---

## Performance Tips

```javascript
// Use limits when querying large datasets
const recentChanges = loadChanges(profileId, {
  limit: 100,
  hoursAgo: 24
});

// Cache importance bands in memory
const bandsCache = {};
function getCachedBands(profileId) {
  if (!bandsCache[profileId]) {
    bandsCache[profileId] = loadImportanceBands(profileId);
  }
  return bandsCache[profileId];
}

// Batch operations
const profiles = listProfiles("active");
profiles.forEach(profile => {
  // Process each profile
});
```

---

## See Also

- `/core/storage/ProfileManager.js` - Full API documentation
- `/core/storage/MultiProfileStorage.js` - Storage operations
- `/core/storage/SHEETS-STRUCTURE.md` - Sheet schema details
- `/profiles/schemas/profile-schema.json` - Profile JSON schema
