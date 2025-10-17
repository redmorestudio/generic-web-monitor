# Profile Configuration Guide

## What is a Profile?

A **profile** is a self-contained configuration that defines:
- **What to monitor**: Competitors and their URLs
- **How to score changes**: Keywords and page weights
- **What matters**: Custom importance bands (0-10 scale)
- **How to analyze**: AI prompt templates

Think of it as a "monitoring recipe" for a specific industry or domain.

## Table of Contents

1. [Profile Structure](#profile-structure)
2. [Creating Your First Profile](#creating-your-first-profile)
3. [Importance Bands Design](#importance-bands-design)
4. [Keyword Selection Strategy](#keyword-selection-strategy)
5. [Page Weight Configuration](#page-weight-configuration)
6. [AI Discovery vs Manual Setup](#ai-discovery-vs-manual-setup)
7. [Example Profiles Walkthrough](#example-profiles-walkthrough)
8. [Advanced Configuration](#advanced-configuration)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

## Profile Structure

### Complete Profile Anatomy

```json
{
  "profile": {
    // === IDENTITY ===
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Energy Drinks Monitor",
    "domain": "energy-drinks",
    "description": "Track energy drink launches, pricing, and sponsorships",

    // === COMPETITORS ===
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

    // === IMPORTANCE SCALE ===
    "importanceBands": [
      {
        "min": 9, "max": 10,
        "label": "Critical",
        "description": "New product lines, major formula changes",
        "examples": ["Launching new drink", "Major recall"]
      }
    ],

    // === CONTENT ANALYSIS ===
    "contentTypes": ["products", "pricing", "blog", "news"],
    "pageWeights": {
      "products": 2.0,
      "pricing": 2.0,
      "blog": 1.0
    },
    "domainKeywords": {
      "high": ["launch", "new product", "discontinued"],
      "medium": ["flavor", "packaging"],
      "low": ["campaign", "promotion"]
    },

    // === AI CONFIGURATION ===
    "analysisPromptTemplate": "templates/energy-drinks-analysis.txt",

    // === DISCOVERY SETTINGS ===
    "discovery": {
      "enabled": true,
      "autoExpand": false,
      "seedCompetitors": ["Red Bull", "Monster"],
      "maxCompetitors": 15
    },

    // === METADATA ===
    "created": "2025-01-16T10:00:00Z",
    "lastModified": "2025-01-16T10:00:00Z",
    "status": "active"
  }
}
```

### Required Fields

**Minimum Viable Profile**:
```json
{
  "profile": {
    "id": "unique-uuid",
    "name": "My Monitor",
    "domain": "my-domain",
    "competitors": [
      {
        "name": "Company A",
        "urls": [{"url": "https://example.com", "type": "homepage"}]
      }
    ],
    "importanceBands": [
      {
        "min": 0, "max": 10,
        "label": "All Changes",
        "description": "Any change",
        "examples": ["Any update"]
      }
    ]
  }
}
```

## Creating Your First Profile

### Option 1: AI-Assisted (Recommended)

**Time**: ~2 minutes
**Effort**: Minimal

1. Open `dashboard/setup-wizard.html`
2. Enter domain: "craft beer"
3. Enter 2-3 competitors: "Dogfish Head, Stone Brewing, Lagunitas"
4. Click "Start AI Discovery"
5. Wait ~30 seconds while AI:
   - Discovers 10-15 competitors
   - Finds 40+ URLs to monitor
   - Generates importance bands
   - Extracts keywords
6. Review and adjust results
7. Save profile

**AI discovers**:
- Competitors: 12 craft breweries
- URLs: 48 total (4-8 per competitor)
- Keywords: High/medium/low priority
- Importance bands: 6 levels (0-10)
- Page weights: Optimized for craft beer

### Option 2: Manual Configuration

**Time**: ~15 minutes
**Effort**: Full control

1. Copy example profile:
   ```bash
   cp profiles/examples/energy-drinks.json profiles/my-domain.json
   ```

2. Edit basic info:
   ```json
   {
     "profile": {
       "id": "generate-new-uuid",
       "name": "Craft Beer Monitor",
       "domain": "craft-beer",
       "description": "Monitor craft beer releases and taproom updates"
     }
   }
   ```

3. Add competitors:
   ```json
   "competitors": [
     {
       "name": "Dogfish Head",
       "urls": [
         {"url": "https://dogfish.com", "type": "homepage"},
         {"url": "https://dogfish.com/beers", "type": "products"},
         {"url": "https://dogfish.com/taproom", "type": "news"}
       ],
       "keywords": ["IPA", "craft", "limited release"]
     }
   ]
   ```

4. Define importance bands (see next section)

5. Set keywords and page weights

6. Validate and save

## Importance Bands Design

Importance bands are the **heart** of your profile. They define what changes matter to you.

### Design Principles

1. **Context-Specific**: What's critical in energy drinks ≠ critical in SaaS
2. **Actionable**: Each band should trigger different responses
3. **Granular**: 6 bands (0-10) give good resolution
4. **Clear Examples**: Help AI understand your scale

### Band Architecture

```
10 ─────┐
9  ─────┤ Critical (9-10)    → Immediate attention, notify everyone
8  ─────┤ Important (7-8)    → Review within 24h, notify team
7  ─────┘
6  ─────┐
5  ─────┤ Moderate (5-6)     → Review this week, add to report
4  ─────┐
3  ─────┤ Low (3-4)          → Bulk review monthly
2  ─────┐
1  ─────┤ Minimal (1-2)      → Archive, maybe ignore
0  ─────┘ Trivial (0)        → Ignore completely
```

### Domain-Specific Examples

#### Energy Drinks Industry

**Critical (9-10)**:
- New product line launch
- Major formula change
- Company acquisition
- Safety recall
- Market entry/exit

**Important (7-8)**:
- New flavor release
- Packaging redesign
- Major sponsorship (sports team)
- Significant price change
- New size variant

**Moderate (5-6)**:
- Limited edition flavor
- Regional launch
- Website redesign
- Promotional campaign
- Minor sponsorship

**Low (3-4)**:
- Social media campaign
- Event participation
- Blog post
- FAQ update

**Minimal (1-2)**:
- Homepage copy change
- Image updates
- Minor content refresh

**Trivial (0)**:
- Typo fixes
- Copyright year update
- Color adjustments

#### SaaS Companies

**Critical (9-10)**:
- New product launch
- Major pricing overhaul
- Acquisition announcement
- Security breach
- Service shutdown

**Important (7-8)**:
- New major feature
- API breaking change
- Enterprise tier launch
- Strategic partnership
- Migration to new infrastructure

**Moderate (5-6)**:
- Minor feature addition
- Documentation expansion
- Webinar announcement
- Case study publication
- Integration announcement

**Low (3-4)**:
- Blog post
- Bug fix announcement
- UI tweak
- FAQ addition

**Minimal (1-2)**:
- Help doc update
- Screenshot update
- Minor copy change

**Trivial (0)**:
- Typo correction
- Link update
- Formatting fix

#### Automobile Industry

**Critical (9-10)**:
- New model announcement
- Recall announcement
- Factory closure/opening
- Major technology breakthrough (EV, autonomous)
- Acquisition/merger

**Important (7-8)**:
- Model refresh
- Trim level addition
- Major price change
- Warranty program change
- New market entry

**Moderate (5-6)**:
- Color addition
- Package option
- Dealer promotion
- Financing offer
- Press event

**Low (3-4)**:
- Website feature
- Configurator update
- Marketing campaign
- Social content

**Minimal (1-2)**:
- Brochure update
- Image gallery
- Minor copy

**Trivial (0)**:
- Typo fix
- Link correction

### Band Template

Copy and customize:

```json
{
  "importanceBands": [
    {
      "min": 9, "max": 10,
      "label": "Critical",
      "description": "[What qualifies as urgent/critical in YOUR domain]",
      "examples": [
        "[Specific example 1]",
        "[Specific example 2]",
        "[Specific example 3]",
        "[Specific example 4]",
        "[Specific example 5]"
      ]
    },
    {
      "min": 7, "max": 8,
      "label": "Important",
      "description": "[Significant but not urgent]",
      "examples": [
        "[Example 1]",
        "[Example 2]",
        "[Example 3]"
      ]
    },
    {
      "min": 5, "max": 6,
      "label": "Moderate",
      "description": "[Worth tracking but not priority]",
      "examples": ["[...]"]
    },
    {
      "min": 3, "max": 4,
      "label": "Low",
      "description": "[Minor changes]",
      "examples": ["[...]"]
    },
    {
      "min": 1, "max": 2,
      "label": "Minimal",
      "description": "[Routine updates]",
      "examples": ["[...]"]
    },
    {
      "min": 0, "max": 0,
      "label": "Trivial",
      "description": "[Can be ignored]",
      "examples": ["Typos", "Formatting", "Copyright year"]
    }
  ]
}
```

## Keyword Selection Strategy

Keywords drive the **initial scoring** before AI analysis.

### Three-Tier System

**High-Priority Keywords** (Score +2):
- Indicate critical business changes
- Should be rare and specific
- Examples: "launch", "discontinue", "acquire", "recall", "pivot"

**Medium-Priority Keywords** (Score +1):
- Indicate notable changes
- More common than high priority
- Examples: "feature", "update", "partnership", "redesign"

**Low-Priority Keywords** (Score -1):
- Indicate routine content
- Very common
- Examples: "blog", "post", "update", "minor", "fix"

### Selection Process

1. **Brainstorm** domain vocabulary
2. **Categorize** by business impact
3. **Test** on historical changes
4. **Refine** based on false positives/negatives

### Domain Examples

#### Energy Drinks
```json
"domainKeywords": {
  "high": [
    "launch", "new product", "discontinued",
    "recall", "formula", "ingredients",
    "acquisition", "market entry"
  ],
  "medium": [
    "flavor", "packaging", "redesign",
    "sponsorship", "partnership", "athlete",
    "price", "limited edition"
  ],
  "low": [
    "campaign", "promotion", "contest",
    "event", "social", "hashtag"
  ]
}
```

#### SaaS
```json
"domainKeywords": {
  "high": [
    "launch", "release", "pricing",
    "deprecate", "sunset", "migration",
    "security", "breach", "outage"
  ],
  "medium": [
    "feature", "api", "integration",
    "update", "improvement", "beta",
    "partnership", "enterprise"
  ],
  "low": [
    "blog", "webinar", "newsletter",
    "tutorial", "guide", "faq"
  ]
}
```

### Testing Keywords

Run this test on sample content:

```javascript
function testKeywords(content, keywords) {
  const results = {
    high: 0, medium: 0, low: 0
  };

  keywords.high.forEach(kw => {
    if (content.toLowerCase().includes(kw)) results.high++;
  });

  // ... same for medium and low

  const score = (results.high * 2) + (results.medium * 1) - (results.low * 1);
  return { results, score };
}

// Test on known changes
testKeywords("Launching new product line", keywords);
// Expected: high matches, high score

testKeywords("Minor blog post update", keywords);
// Expected: low matches, low score
```

## Page Weight Configuration

Page weights are **multipliers** applied to scores based on page type.

### Concept

```
Base Score: 5
Page Type: "products"
Weight: 2.0
Final Score: 5 × 2.0 = 10
```

### Weight Guidelines

| Weight | Meaning | Page Types |
|--------|---------|------------|
| 2.0-2.5 | Critical pages | Pricing, Products, API Docs |
| 1.5-1.9 | Important pages | News, Announcements, Press |
| 1.0-1.4 | Standard pages | Blog, About, Help |
| 0.5-0.9 | Low-priority pages | Homepage, Contact, Careers |

### Reasoning

**Homepage (0.8)**: Changes frequently, often cosmetic
**Products (2.0)**: Core business, high impact
**Pricing (2.0)**: Critical for competitive intelligence
**Blog (1.0)**: Standard content, variable importance

### Domain Examples

#### Energy Drinks
```json
"pageWeights": {
  "products": 2.0,      // New drink launches
  "pricing": 1.8,       // Retail price changes
  "sponsorships": 1.5,  // Athlete/team deals
  "news": 1.2,          // Company announcements
  "blog": 1.0,          // General content
  "about": 0.8,         // Company info
  "homepage": 0.7       // Frequent minor changes
}
```

#### SaaS
```json
"pageWeights": {
  "pricing": 2.5,       // Revenue impact
  "api": 2.0,           // Developer impact
  "docs": 2.0,          // Feature changes
  "changelog": 1.8,     // Product updates
  "status": 1.5,        // System health
  "blog": 1.0,          // Marketing content
  "about": 0.8,         // Company info
  "homepage": 0.6       // Marketing copy
}
```

### Custom Page Types

Define domain-specific types:

```json
"contentTypes": [
  "products",
  "pricing",
  "sponsorships",    // Energy drinks specific
  "taprooms",        // Craft beer specific
  "menu"             // Restaurant specific
],
"pageWeights": {
  "sponsorships": 1.5,
  "taprooms": 1.3,
  "menu": 2.0
}
```

## AI Discovery vs Manual Setup

### When to Use AI Discovery

**Best for**:
- New domains you're unfamiliar with
- Rapid prototyping
- Discovering competitors you didn't know about
- Getting started quickly

**Pros**:
- Fast (2 minutes)
- Comprehensive (10-15 competitors)
- Suggests importance bands
- Extracts keywords automatically

**Cons**:
- May include irrelevant competitors
- Generic importance bands
- Requires Claude API key
- Costs ~$0.50-1.00 per discovery

### When to Use Manual Setup

**Best for**:
- Precise control over monitoring
- Domains with complex structures
- Highly specific monitoring needs
- Cost sensitivity (no API calls)

**Pros**:
- Complete control
- Custom importance definitions
- No API dependencies
- No cost

**Cons**:
- Time-consuming (15-30 minutes)
- Requires domain expertise
- May miss competitors
- Manual keyword research

### Hybrid Approach (Recommended)

1. **Start with AI**: Let AI discover competitors and URLs
2. **Review**: Remove irrelevant, add missing
3. **Customize**: Edit importance bands for your needs
4. **Refine**: Adjust keywords based on results
5. **Iterate**: Fine-tune over first few monitoring runs

## Example Profiles Walkthrough

### Energy Drinks Profile

**Goal**: Monitor product launches, pricing, and major sponsorships

**Key Decisions**:
- Focus on product innovation (high weights on product pages)
- Sponsorships matter (unique page type)
- Limited editions are moderate priority
- Blog content is low priority

**Importance Hierarchy**:
1. New product lines (10)
2. Formula changes (9)
3. Major sponsorships (8)
4. New flavors (7)
5. Limited editions (5)
6. Promotions (3)

**See**: `/Users/sethredmore/generic-web-monitor/profiles/examples/energy-drinks.json`

### AI Technology Profile

**Goal**: Track model releases, pricing changes, API updates

**Key Decisions**:
- API documentation is critical
- Pricing changes are high priority
- Blog posts are variable (could be announcements)
- Homepage changes are usually marketing

**Importance Hierarchy**:
1. New model releases (10)
2. Pricing overhauls (10)
3. API breaking changes (9)
4. New features (8)
5. Documentation expansions (6)
6. Blog posts (5)

**See**: `/Users/sethredmore/generic-web-monitor/profiles/examples/ai-competitors-skeleton.json`

### Restaurant Chain Profile

**Example Profile**:

```json
{
  "profile": {
    "name": "Fast Food Chains",
    "domain": "fast-food",

    "competitors": [
      {
        "name": "McDonald's",
        "urls": [
          {"url": "https://mcdonalds.com/menu", "type": "menu"},
          {"url": "https://mcdonalds.com/nutrition", "type": "nutrition"},
          {"url": "https://mcdonalds.com/deals", "type": "promotions"}
        ]
      }
    ],

    "importanceBands": [
      {
        "min": 9, "max": 10,
        "label": "Critical",
        "description": "New menu items, major promotions, store closures",
        "examples": [
          "New signature burger",
          "Menu restructuring",
          "Major franchise announcement"
        ]
      },
      {
        "min": 7, "max": 8,
        "label": "Important",
        "description": "Limited time offers, price changes",
        "examples": [
          "McRib return",
          "Combo meal price increase",
          "New breakfast item"
        ]
      }
    ],

    "domainKeywords": {
      "high": ["new menu", "limited time", "discontinued"],
      "medium": ["promotion", "deal", "combo"],
      "low": ["nutrition info", "location", "hours"]
    },

    "pageWeights": {
      "menu": 2.5,
      "promotions": 2.0,
      "nutrition": 1.5,
      "locations": 0.8
    }
  }
}
```

## Advanced Configuration

### Custom Analysis Templates

Create domain-specific Claude prompts:

**File**: `profiles/templates/fast-food-analysis.txt`

```
You are an expert in the fast food industry.

Company: {COMPANY}
URL: {URL}

Key competitors: {COMPETITORS}

IMPORTANCE SCALE FOR FAST FOOD:
{IMPORTANCE_BANDS}

Analyze menu changes, pricing shifts, and promotional strategies.

Focus on:
- New menu items or discontinuations
- Price changes on core items
- Limited time offers
- Nutritional information updates
- Franchise expansion or closures

PREVIOUS CONTENT:
{PREVIOUS_CONTENT}

NEW CONTENT:
{CONTENT}

Provide JSON analysis with competitive intelligence.
```

Reference in profile:
```json
"analysisPromptTemplate": "templates/fast-food-analysis.txt"
```

### Multi-Region Profiles

Monitor same industry in different regions:

```json
{
  "profile": {
    "name": "Energy Drinks - Europe",
    "domain": "energy-drinks-eu",
    "targetMarket": "EU",

    "competitors": [
      {"name": "Red Bull Austria", "urls": [...]},
      {"name": "Monster Energy Europe", "urls": [...]}
    ]
  }
}
```

Separate profile:
```json
{
  "profile": {
    "name": "Energy Drinks - Asia",
    "domain": "energy-drinks-apac",
    "targetMarket": "APAC"
  }
}
```

### Seasonal Profiles

Activate during specific periods:

```json
{
  "profile": {
    "name": "Black Friday Tech Deals",
    "domain": "tech-deals-bf",
    "status": "paused",  // Active only Nov-Dec

    "importanceBands": [
      {
        "min": 9, "max": 10,
        "label": "Critical",
        "description": "Doorbusters, limited quantity deals",
        "examples": ["50%+ off flagship products"]
      }
    ]
  }
}
```

## Best Practices

### 1. Start Small
- Begin with 3-5 competitors
- Monitor 3-4 URLs per competitor
- Expand based on results

### 2. Iterate
- Run for 1 week
- Review false positives
- Adjust keywords and weights
- Refine importance bands

### 3. Document Decisions
Add comments to profiles:
```json
{
  "profile": {
    "name": "Energy Drinks",
    "_notes": "Products weighted 2.0 because launches are critical. Homepage weighted low due to frequent marketing changes. Last updated 2025-01-16.",
    "pageWeights": {
      "products": 2.0,
      "homepage": 0.7
    }
  }
}
```

### 4. Use Consistent Naming
- Profile IDs: UUIDs
- Domains: kebab-case (energy-drinks, not Energy_Drinks)
- Page types: lowercase (products, not Products)

### 5. Version Control
Track profile changes:
```bash
git commit -m "Energy drinks: Added Celsius as competitor"
git commit -m "Energy drinks: Increased sponsorships weight to 1.5"
```

### 6. Test Before Deploying
```javascript
// Load profile
const profile = loadProfile('energy-drinks');

// Validate schema
const valid = validateSchema(profile);
console.log('Valid:', valid);

// Test on sample content
const testResult = testScoring(profile, sampleContent);
console.log('Test score:', testResult.score);
```

## Troubleshooting

### Profile Not Loading
**Error**: "Profile not found"

**Solutions**:
1. Check profile ID is correct UUID
2. Verify file exists in correct location
3. Validate JSON syntax (use JSONLint)
4. Check file permissions

### Scores Too High/Low
**Problem**: Everything scores 9-10 or 1-2

**Solutions**:
1. Review keyword lists (too many high-priority?)
2. Check page weights (too extreme?)
3. Test with sample content
4. Adjust importance band thresholds

### AI Discovery Fails
**Error**: "Discovery failed" or timeout

**Solutions**:
1. Check Claude API key is set
2. Verify API quota not exceeded
3. Reduce maxCompetitors (15 → 10)
4. Check internet connection
5. Try manual setup instead

### Duplicate Changes Detected
**Problem**: Same change reported multiple times

**Solutions**:
1. Check baseline storage is working
2. Verify content hashing is consistent
3. Review URL normalization
4. Check for redirect loops

### No Changes Detected
**Problem**: Profile running but no changes found

**Solutions**:
1. Verify URLs are accessible
2. Check content extraction is working
3. Lower score thresholds temporarily
4. Review keyword relevance
5. Check if sites have actually changed

### Schema Validation Errors
**Error**: "Profile validation failed"

**Solutions**:
1. Ensure all required fields present
2. Check data types (string vs array)
3. Validate URL formats
4. Ensure importance bands cover 0-10
5. Use schema validator tool

## Quick Reference

### Minimal Profile Template
```json
{
  "profile": {
    "id": "NEW_UUID",
    "name": "My Monitor",
    "domain": "my-domain",
    "competitors": [
      {
        "name": "Company",
        "urls": [{"url": "https://...", "type": "homepage"}]
      }
    ],
    "importanceBands": [
      {"min": 0, "max": 10, "label": "All", "description": "Any change", "examples": [""]}
    ]
  }
}
```

### Generate UUID
```javascript
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
```

### Validate Profile
```bash
# Using Node.js
node -e "console.log(JSON.parse(require('fs').readFileSync('profile.json')))"

# Using online validator
# https://www.jsonschemavalidator.net/
# Load profile-schema.json and your profile
```

---

**Next Steps**:
1. Create your first profile (AI or manual)
2. Test with small competitor set
3. Review results after first run
4. Refine keywords and bands
5. Expand to full competitor list

**Need Help?**
- See `/Users/sethredmore/generic-web-monitor/docs/API.md` for programmatic access
- See `/Users/sethredmore/generic-web-monitor/profiles/examples/` for complete examples
- See transformation plan for architecture details

---

*Last Updated: 2025-10-16*
*Version: 2.0.0*
