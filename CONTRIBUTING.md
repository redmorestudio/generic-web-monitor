# Contributing to Generic Web Monitor

Thank you for your interest in contributing! This guide will help you add new domains, create analysis templates, and extend the framework.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Adding New Domains](#adding-new-domains)
3. [Creating Analysis Templates](#creating-analysis-templates)
4. [Profile Schema Extensions](#profile-schema-extensions)
5. [Testing Guidelines](#testing-guidelines)
6. [Code Style Guide](#code-style-guide)
7. [Submitting Contributions](#submitting-contributions)
8. [Community Guidelines](#community-guidelines)

---

## Getting Started

### Prerequisites

```bash
# Clone repository
git clone https://github.com/yourusername/generic-web-monitor.git
cd generic-web-monitor

# Install dependencies (for testing)
npm install

# Set up environment
cp .env.example .env
# Edit .env with your API keys
```

### Development Setup

```bash
# Install development tools
npm install -g @google/clasp  # For Google Apps Script

# Run tests
npm test

# Validate profiles
npm run validate:profiles

# Lint code
npm run lint
```

---

## Adding New Domains

Contributing a new domain profile helps the community monitor different industries.

### Step 1: Research the Domain

Before creating a profile, understand:
- Key players in the industry
- What types of changes matter
- Common terminology and keywords
- Important page types

**Example**: Restaurant chains
- Key players: McDonald's, Burger King, Wendy's, Taco Bell
- Important changes: Menu items, pricing, locations, promotions
- Keywords: "new menu item", "limited time", "price", "location"
- Page types: menu, nutrition, locations, deals

### Step 2: Use AI Discovery

```bash
# Quick discovery
node src/discovery.js \
  --domain "restaurant chains" \
  --seeds "McDonald's,Burger King,Wendy's" \
  --output profiles/examples/restaurant-chains.json
```

**Review output**:
- Check competitors list for accuracy
- Verify URLs are correct and accessible
- Review importance bands for domain fit
- Adjust keywords if needed

### Step 3: Customize the Profile

Edit the generated profile:

```json
{
  "profile": {
    "name": "Restaurant Chains Monitor",
    "domain": "restaurant-chains",
    "description": "Monitor menu changes, pricing, and new locations",

    "competitors": [
      {
        "name": "McDonald's",
        "urls": [
          {"url": "https://mcdonalds.com/menu", "type": "menu"},
          {"url": "https://mcdonalds.com/nutrition", "type": "nutrition"},
          {"url": "https://mcdonalds.com/deals", "type": "promotions"},
          {"url": "https://mcdonalds.com/locations", "type": "locations"}
        ],
        "keywords": ["burger", "fries", "Happy Meal", "Big Mac"]
      }
    ],

    "importanceBands": [
      {
        "min": 9, "max": 10,
        "label": "Critical",
        "description": "New signature items, major price changes, store closures",
        "examples": [
          "New signature burger launch",
          "Major menu restructuring",
          "Mass store closures",
          "Franchise agreement changes"
        ]
      },
      {
        "min": 7, "max": 8,
        "label": "Important",
        "description": "Limited time offers, combo meal changes",
        "examples": [
          "McRib return",
          "New breakfast sandwich",
          "Combo meal price increase"
        ]
      }
    ],

    "domainKeywords": {
      "high": ["new menu", "limited time", "discontinued", "price increase"],
      "medium": ["promotion", "deal", "combo", "value meal"],
      "low": ["nutrition info", "allergen", "hours"]
    },

    "pageWeights": {
      "menu": 2.5,
      "promotions": 2.0,
      "pricing": 2.0,
      "nutrition": 1.0,
      "locations": 0.8
    }
  }
}
```

### Step 4: Create Analysis Template

**File**: `profiles/templates/restaurant-chains-analysis.txt`

```
You are an expert analyst for the restaurant industry.

Company: {COMPANY}
URL: {URL}
Domain: {DOMAIN_NAME}

Key competitors: {COMPETITORS}

IMPORTANCE SCALE FOR RESTAURANT CHAINS:
{IMPORTANCE_BANDS}

Focus on competitive intelligence for the restaurant industry:
- Menu additions or removals
- Pricing changes (individual items and combos)
- Limited time offers (LTOs)
- Nutritional information updates
- Location expansions or closures
- Promotional campaigns

PREVIOUS CONTENT:
{PREVIOUS_CONTENT}

NEW CONTENT:
{CONTENT}

Analyze what changed and assess competitive implications.

Provide JSON response:
{
  "summary": "Executive summary of the change",
  "keyChanges": ["List of specific changes"],
  "significanceScore": 0-10,
  "urgency": "high|medium|low",
  "menuChanges": ["Menu-specific changes"],
  "pricingChanges": ["Pricing updates"],
  "competitiveIntel": ["Strategic insights for competitors"],
  "recommendations": ["Actionable recommendations"],
  "reasoning": "Why this score for restaurant industry"
}
```

### Step 5: Test the Profile

```bash
# Validate schema
npm run validate:profile restaurant-chains

# Test on sample content
npm run test:profile restaurant-chains

# Run dry-run monitoring
npm run monitor:dry-run restaurant-chains
```

### Step 6: Document Your Profile

**File**: `profiles/examples/README-restaurant-chains.md`

```markdown
# Restaurant Chains Monitoring Profile

## Overview
Monitors major restaurant chains for menu changes, pricing updates, and promotional campaigns.

## Competitors Covered
- McDonald's
- Burger King
- Wendy's
- Taco Bell
- Subway
[... full list ...]

## What It Monitors
- **Menu Changes**: New items, discontinued items, limited time offers
- **Pricing**: Individual items, combo meals, value menu
- **Promotions**: Deals, coupons, limited time offers
- **Locations**: New stores, closures
- **Nutrition**: Calorie info, allergen data

## Importance Scale
- **9-10 (Critical)**: New signature items, major price changes
- **7-8 (Important)**: Limited time offers, combo changes
- **5-6 (Moderate)**: Promotions, minor menu additions
- **3-4 (Low)**: Nutrition updates, website changes
- **1-2 (Minimal)**: Small content updates
- **0 (Trivial)**: Typos, formatting

## Example Changes Detected
- McDonald's launches Crispy Chicken Sandwich (Score: 9)
- Burger King adds new Whopper variant (Score: 8)
- Wendy's updates nutrition info (Score: 3)

## Customization Tips
- Add regional chains if monitoring specific markets
- Adjust page weights based on what matters to you
- Modify keywords for specialty items (e.g., "plant-based")

## Related Profiles
- Fast casual dining
- Coffee chains
- Pizza chains
```

### Step 7: Submit Profile

```bash
# Create branch
git checkout -b add/restaurant-chains-profile

# Add files
git add profiles/examples/restaurant-chains.json
git add profiles/templates/restaurant-chains-analysis.txt
git add profiles/examples/README-restaurant-chains.md

# Commit
git commit -m "Add restaurant chains monitoring profile

- 15 major restaurant chains
- Menu, pricing, and promotion tracking
- Custom importance bands for food industry
- Analysis template optimized for menu changes"

# Push and create PR
git push origin add/restaurant-chains-profile
```

---

## Creating Analysis Templates

Analysis templates customize how Claude AI analyzes changes for your domain.

### Template Structure

**Location**: `profiles/templates/{domain}-analysis.txt`

**Variables Available**:
- `{DOMAIN}`: Domain name (e.g., "restaurant-chains")
- `{DOMAIN_NAME}`: Display name (e.g., "Restaurant Chains Monitor")
- `{COMPANY}`: Competitor name (e.g., "McDonald's")
- `{URL}`: Page URL
- `{COMPETITORS}`: Comma-separated list of all competitors
- `{IMPORTANCE_BANDS}`: Formatted importance scale
- `{CONTENT}`: Current page content (up to 4000 chars)
- `{PREVIOUS_CONTENT}`: Previous content (up to 2000 chars)
- `{KEYWORDS_HIGH}`: High-priority keywords
- `{KEYWORDS_MEDIUM}`: Medium-priority keywords
- `{KEYWORDS_LOW}`: Low-priority keywords

### Template Best Practices

1. **Be Specific**: Tailor instructions to your domain
2. **Focus Areas**: List what to look for
3. **Output Format**: Always request JSON
4. **Examples**: Include domain-specific examples
5. **Scoring Context**: Reference importance bands

### Example Template

```
You are a competitive intelligence expert for {DOMAIN}.

Company: {COMPANY}
URL: {URL}
Industry Context: {DOMAIN_NAME}

Competitors: {COMPETITORS}

IMPORTANCE SCALE:
{IMPORTANCE_BANDS}

DOMAIN-SPECIFIC FOCUS:
[List 5-10 things specific to your domain]
- Item 1
- Item 2
...

HIGH PRIORITY SIGNALS:
{KEYWORDS_HIGH}

PREVIOUS STATE:
{PREVIOUS_CONTENT}

CURRENT STATE:
{CONTENT}

ANALYSIS INSTRUCTIONS:
1. What specifically changed?
2. Why does this matter in {DOMAIN}?
3. How should competitors respond?
4. Rate significance using the importance scale above

OUTPUT (JSON):
{
  "summary": "1-2 sentence executive summary",
  "keyChanges": ["Specific change 1", "Change 2"],
  "significanceScore": 0-10,
  "urgency": "high|medium|low",
  "domain_specific_field": ["Custom to your domain"],
  "competitiveIntel": ["Strategic insights"],
  "recommendations": ["Action items"],
  "reasoning": "Why this score"
}

Be concise. Focus on actionable intelligence for {DOMAIN}.
```

### Testing Templates

```javascript
// Test template with sample data
const analyzer = new UniversalAnalyzer(profile);
const prompt = analyzer.createAnalysisPrompt(
  sampleNewContent,
  sampleOldContent,
  'https://example.com',
  'Test Company'
);

console.log(prompt);
// Review for:
// - All variables substituted
// - Clear instructions
// - Domain-specific focus
```

---

## Profile Schema Extensions

Want to add new fields to profiles? Here's how:

### Step 1: Update Schema

**File**: `profiles/schemas/profile-schema.json`

```json
{
  "properties": {
    "profile": {
      "properties": {
        // ... existing fields ...

        "newField": {
          "type": "string",
          "description": "Description of new field",
          "example": "Example value"
        }
      }
    }
  }
}
```

### Step 2: Update Profile Manager

**File**: `core/storage/ProfileManager.js`

```javascript
class ProfileManager {
  saveProfile(profile) {
    // Validate new field
    if (profile.newField && !this.validateNewField(profile.newField)) {
      throw new Error('Invalid newField');
    }

    // ... existing save logic ...
  }

  validateNewField(value) {
    // Add validation logic
    return typeof value === 'string' && value.length > 0;
  }
}
```

### Step 3: Update Documentation

Update `/Users/sethredmore/generic-web-monitor/docs/PROFILE-GUIDE.md`:

```markdown
## New Field

The `newField` property allows you to...

**Example**:
```json
{
  "profile": {
    "newField": "example"
  }
}
```
```

### Step 4: Test Backward Compatibility

```javascript
// Test loading old profiles without new field
function testBackwardCompatibility() {
  const oldProfile = {
    // Profile without newField
  };

  const profile = loadProfile(oldProfile.id);
  console.assert(profile, 'Old profile should still load');
}
```

---

## Testing Guidelines

### Unit Tests

```javascript
// test/profile-manager.test.js
const { ProfileManager } = require('../core/storage/ProfileManager');

describe('ProfileManager', () => {
  it('should save and load profile', () => {
    const manager = new ProfileManager('json');
    const profile = createTestProfile();

    const id = manager.saveProfile(profile);
    const loaded = manager.loadProfile(id);

    expect(loaded.name).toBe(profile.name);
  });

  it('should validate schema', () => {
    const manager = new ProfileManager();
    const invalid = { profile: { /* missing required fields */ } };

    expect(() => manager.validateProfile(invalid)).toThrow();
  });
});
```

### Integration Tests

```javascript
// test/monitoring.test.js
describe('Monitoring Integration', () => {
  it('should detect changes', async () => {
    const profile = loadProfile('test-profile');
    const monitor = new UniversalMonitor(profile);

    const results = await monitorProfile(profile.id);

    expect(results.totalChanges).toBeGreaterThanOrEqual(0);
  });
});
```

### Profile Validation Tests

```bash
# Validate all example profiles
npm run test:profiles

# Output:
# ✓ energy-drinks.json - valid
# ✓ ai-competitors.json - valid
# ✓ restaurant-chains.json - valid
```

### Run Tests

```bash
# All tests
npm test

# Specific test file
npm test -- profile-manager.test.js

# With coverage
npm run test:coverage
```

---

## Code Style Guide

### JavaScript Style

**Use ES6+ Features**:
```javascript
// Good
const { profile } = loadProfile(id);
const competitors = profile.competitors.map(c => c.name);

// Avoid
var profile = loadProfile(id).profile;
var competitors = [];
for (var i = 0; i < profile.competitors.length; i++) {
  competitors.push(profile.competitors[i].name);
}
```

**Async/Await**:
```javascript
// Good
async function monitorProfile(profileId) {
  const profile = loadProfile(profileId);
  const results = await processMonitoring(profile);
  return results;
}

// Avoid
function monitorProfile(profileId) {
  return loadProfile(profileId).then(profile => {
    return processMonitoring(profile);
  });
}
```

**Error Handling**:
```javascript
// Good
try {
  const profile = loadProfile(id);
} catch (error) {
  log('ERROR', 'Failed to load profile', { id, error: error.message });
  throw new ProfileNotFoundError(id);
}

// Avoid
const profile = loadProfile(id);  // No error handling
```

### Naming Conventions

- **Functions**: camelCase (`loadProfile`, `calculateScore`)
- **Classes**: PascalCase (`UniversalMonitor`, `ProfileManager`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_COMPETITORS`, `API_KEY`)
- **Files**: kebab-case (`profile-manager.js`, `domain-discovery.js`)

### Comments

```javascript
/**
 * Calculate relevance score based on keyword matches
 *
 * @param {string} oldContent - Previous page content
 * @param {string} newContent - Current page content
 * @param {string} url - Page URL for type identification
 * @returns {number} Score from 1-10
 */
function calculateRelevanceScore(oldContent, newContent, url) {
  // Start with base score
  let score = 5;

  // Apply keyword scoring
  // High-priority keywords: +2 per match
  this.keywords.high.forEach(keyword => {
    // ...
  });

  return score;
}
```

### File Organization

```
generic-web-monitor/
├── core/              # Core functionality
│   ├── monitoring/    # Monitoring logic
│   ├── analysis/      # AI analysis
│   └── storage/       # Data persistence
├── profiles/          # Profile definitions
│   ├── schemas/       # JSON schemas
│   ├── templates/     # Analysis templates
│   └── examples/      # Example profiles
├── discovery/         # AI discovery
├── dashboard/         # UI components
└── tests/             # Test files
```

---

## Submitting Contributions

### Contribution Types

1. **New Domain Profile**: Add monitoring for a new industry
2. **Analysis Template**: Improve AI analysis for a domain
3. **Bug Fix**: Fix issues in existing code
4. **Feature**: Add new functionality
5. **Documentation**: Improve docs

### Submission Process

1. **Fork** the repository
2. **Create branch**: `feature/your-feature` or `fix/bug-description`
3. **Make changes**
4. **Test** thoroughly
5. **Commit** with clear messages
6. **Push** to your fork
7. **Create Pull Request**

### Pull Request Template

```markdown
## Description
[Clear description of changes]

## Type of Change
- [ ] New domain profile
- [ ] Analysis template
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation

## Testing
- [ ] All tests pass
- [ ] New tests added
- [ ] Manually tested
- [ ] Profile validated

## Checklist
- [ ] Code follows style guide
- [ ] Documentation updated
- [ ] No breaking changes
- [ ] Backward compatible

## Related Issues
Fixes #123
```

### Commit Messages

**Format**: `<type>: <subject>`

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `test`: Tests
- `refactor`: Code refactoring
- `profile`: New profile

**Examples**:
```
feat: Add restaurant chains monitoring profile
fix: Correct keyword matching in UniversalMonitor
docs: Update profile guide with examples
profile: Add craft coffee industry template
```

---

## Community Guidelines

### Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Assume good intentions

### Getting Help

- **Issues**: Open GitHub issue
- **Discussions**: Use GitHub Discussions
- **Questions**: Tag with `question` label

### Recognition

Contributors are recognized in:
- CHANGELOG.md
- Profile README files
- Annual contributor list

---

**Thank you for contributing to Generic Web Monitor!**

*Last Updated: 2025-01-16*
