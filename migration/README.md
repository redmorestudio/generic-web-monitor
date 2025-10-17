# Migration Scripts - AI Monitor to Generic Framework

This directory contains migration and testing scripts for safely transitioning from the old AI competitive monitoring system to the new generic web monitoring framework.

## Overview

The migration process converts the hardcoded AI monitoring configuration from the old system (`/Users/sethredmore/ai-competitive-monitor-correct`) into a profile-based configuration for the new generic system (`/Users/sethredmore/generic-web-monitor`).

## Migration Scripts

### 1. export-ai-profile.js

**Purpose**: Export current AI monitor as JSON profile

**What it does**:
- Reads `CompanyConfigComplete.js` from old system
- Reads `IntelligentMonitor.js` for keywords and page weights
- Converts to new profile format
- Generates AI-specific importance bands
- Saves as `profiles/examples/ai-competitors.json`

**Usage**:
```bash
node migration/export-ai-profile.js
```

**Output**:
- Creates `profiles/examples/ai-competitors.json`
- Prints statistics about exported data
- Shows URL type distribution

**Example Output**:
```
📦 Exporting AI Competitor Monitor as Profile...
✅ Loaded 16 companies
✅ Loaded keywords: 8 high, 8 medium, 6 low
✅ Loaded 10 page weight mappings

📊 EXPORT STATISTICS:
Companies:         16
Total URLs:        58
Avg URLs/Company:  3.6
Importance Bands:  6
Content Types:     10
Page Weights:      10

URL Type Distribution:
  homepage      16 (27.6%)
  product       10 (17.2%)
  pricing       8  (13.8%)
  blog          7  (12.1%)
  news          6  (10.3%)
  docs          5  (8.6%)
  ...
```

---

### 2. validate-profile.js

**Purpose**: Validate profile against schema and check URL accessibility

**What it does**:
- Validates profile structure against JSON schema
- Checks all required fields are present
- Validates data types and formats
- Verifies importance band coverage (0-10)
- Tests URL accessibility (optional with `--test-urls`)

**Usage**:
```bash
# Schema validation only
node migration/validate-profile.js ai-competitors.json

# Schema validation + URL accessibility test
node migration/validate-profile.js ai-competitors.json --test-urls
```

**Output**:
- Validation errors (schema violations)
- Validation warnings (non-critical issues)
- URL accessibility results (if --test-urls used)
- Generates `validation-report-{timestamp}.json`

**Example Output**:
```
🔍 PROFILE VALIDATION

Profile: ai-competitors.json
Name:    AI Competitors Monitor
Domain:  ai-technology
Status:  active

📊 VALIDATION RESULTS:
✅ VALID - No errors or warnings

🌐 URL ACCESSIBILITY TEST (if --test-urls)
✅ Anthropic              homepage    200 https://anthropic.com
✅ OpenAI                 homepage    200 https://openai.com
...

📊 ACCESSIBILITY SUMMARY:
Total URLs:     58
Accessible:     56 (96.6%)
Failed:         2 (3.4%)
```

---

### 3. compare-results.js

**Purpose**: Side-by-side comparison of old vs new system

**What it does**:
- Runs same URLs through both systems
- Compares content hashes
- Compares relevance scores
- Detects differences in behavior
- Validates scoring consistency

**Usage**:
```bash
# Compare 5 URLs (default)
node migration/compare-results.js

# Compare 10 URLs
node migration/compare-results.js 10
```

**Output**:
- Per-URL comparison results
- Hash match status
- Score comparison (delta)
- Success rate percentage
- Generates `comparison-report-{timestamp}.json`

**Example Output**:
```
🔬 SYSTEM COMPARISON TEST

Old System: 16 companies
New System: 16 competitors

Testing 5 sample URLs...

Testing: Anthropic - https://anthropic.com
  ✅ MATCH - Hash: true, Score: 7 vs 7

Testing: OpenAI - https://openai.com/pricing
  ⚠️  Score difference: 8 vs 9 (delta: 1)
...

📊 COMPARISON SUMMARY
Total URLs Tested:       5
Perfect Matches:         4 (80.0%)
Hash Mismatches:         0
Score Differences:       1
Old System Errors:       0
New System Errors:       0

Success Rate:            80.0%

✅ MIGRATION VALIDATION: PASS
   Systems show consistent behavior (≥80% match rate)
```

---

### 4. test-migration.js

**Purpose**: Full migration test suite

**What it does**:
- Test 1: Export AI profile
- Test 2: Validate profile schema
- Test 3: Load profile structure
- Test 4: Verify data completeness
- Test 5: Compare old vs new system results
- Test 6: URL accessibility (optional with `--full`)

**Usage**:
```bash
# Core tests only (faster)
node migration/test-migration.js

# All tests including URL accessibility (slower)
node migration/test-migration.js --full
```

**Output**:
- Individual test results
- Pass/fail status for each test
- Overall test suite summary
- Generates `test-report-{timestamp}.json`

**Example Output**:
```
🧪 MIGRATION TEST SUITE
Testing migration from AI Competitive Monitor to Generic Framework

================================================================================
TEST: Test 1: Export AI Profile
Convert old system configuration to new profile format
================================================================================
...
✅ PASS (1234ms)

================================================================================
TEST: Test 2: Validate Profile Schema
Ensure profile conforms to schema requirements
================================================================================
...
✅ PASS (456ms)

...

📊 TEST SUITE SUMMARY
================================================================================

Total Tests:     5
Passed:          5 ✅
Failed:          0 ❌
Warnings:        0 ⚠️

Pass Rate:       100.0%

✅ ALL TESTS PASSED - Migration ready for deployment
```

---

## Migration Workflow

### Step 1: Export Profile

```bash
cd /Users/sethredmore/generic-web-monitor
node migration/export-ai-profile.js
```

This creates `profiles/examples/ai-competitors.json` from the old system configuration.

### Step 2: Validate Profile

```bash
node migration/validate-profile.js ai-competitors.json
```

Ensures the exported profile conforms to the schema.

### Step 3: Compare Systems

```bash
node migration/compare-results.js 5
```

Tests a sample of URLs with both systems to verify consistent behavior.

### Step 4: Run Full Test Suite

```bash
node migration/test-migration.js
```

Runs all core tests to validate the migration.

### Step 5: Full Validation (Optional)

```bash
node migration/test-migration.js --full
```

Includes URL accessibility tests (takes longer).

---

## Generated Reports

All scripts generate detailed JSON reports in the `migration/` directory:

- **validation-report-{timestamp}.json**: Schema validation results
- **comparison-report-{timestamp}.json**: System comparison details
- **test-report-{timestamp}.json**: Full test suite results

Reports include:
- Timestamp
- Summary statistics
- Detailed test results
- Error/warning messages
- Pass/fail status

---

## Success Criteria

### Export Success
- ✅ Profile file created
- ✅ Valid JSON structure
- ✅ All 16 companies present
- ✅ All 58 URLs present
- ✅ 6 importance bands defined

### Validation Success
- ✅ No schema errors
- ✅ All required fields present
- ✅ Importance bands cover 0-10 range
- ✅ All URLs properly formatted
- ✅ ≥90% URLs accessible (if tested)

### Comparison Success
- ✅ ≥80% match rate between systems
- ✅ Score deltas ≤1 point
- ✅ No major behavioral differences

### Overall Migration Success
- ✅ All core tests pass
- ✅ <5 warnings total
- ✅ 100% pass rate preferred
- ✅ ≥90% pass rate acceptable

---

## Troubleshooting

### "Profile file not found"
- Ensure you've run `export-ai-profile.js` first
- Check that old system files exist at `/Users/sethredmore/ai-competitive-monitor-correct`

### Schema validation errors
- Review error messages for specific issues
- Check profile structure matches schema
- Verify all required fields are present

### Score differences in comparison
- Small differences (±1) are acceptable due to timing
- Large differences may indicate logic changes
- Review keyword matching and page weight application

### URL accessibility failures
- Some URLs may be temporarily down
- Check for redirects or moved pages
- Verify URLs are still valid in old system

### System comparison failures
- Content may change between requests (hash mismatch is normal)
- Focus on score consistency
- ≥60% match rate is acceptable, ≥80% is ideal

---

## Key Configuration Preserved

The migration preserves all key configuration from the old system:

**Companies (16 total)**:
- Anthropic, OpenAI, Google DeepMind, Mistral AI
- Codeium, Anysphere (Cursor)
- Synthesia, Pika, Moonvalley, HeyGen
- Ideogram, Midjourney
- Articul8, Prompt Security
- Modular, LangChain

**Keywords**:
- High: price, pricing, launch, new, release, announce, available, introducing
- Medium: feature, update, improve, enhance, api, model, performance, capability
- Low: fix, patch, minor, small, tweak, adjust

**Page Weights**:
- Pricing: 2.0x
- Announcement: 2.0x
- Technology/Features/Products: 1.5x
- News/Blog: 1.2x
- Homepage: 0.8x

**Importance Bands**:
- Critical (9-10): Model releases, major pricing changes, acquisitions
- Important (7-8): New features, API updates, partnerships
- Moderate (5-6): Documentation, blog posts, minor features
- Low (3-4): Bug fixes, maintenance
- Minimal (1-2): Website tweaks
- Trivial (0): Typos, formatting

---

## Next Steps After Migration

1. **Deploy Profile**: Move validated profile to production
2. **Run Monitoring**: Test monitoring with new system
3. **Compare Results**: Monitor side-by-side with old system
4. **Gradual Transition**: Phase out old system once confident
5. **Create Additional Profiles**: Apply learnings to other domains

---

## Support

For issues or questions about the migration:
1. Check generated reports for detailed error information
2. Review validation warnings
3. Compare results between systems
4. Consult GENERIC-WEB-MONITOR-TRANSFORMATION-PLAN.md

---

## Files Created

After running all scripts, you'll have:

```
/Users/sethredmore/generic-web-monitor/
├── profiles/
│   └── examples/
│       └── ai-competitors.json          # Exported profile
├── migration/
│   ├── export-ai-profile.js             # Export script
│   ├── validate-profile.js              # Validation script
│   ├── compare-results.js               # Comparison script
│   ├── test-migration.js                # Test suite
│   ├── README.md                        # This file
│   ├── validation-report-*.json         # Validation reports
│   ├── comparison-report-*.json         # Comparison reports
│   └── test-report-*.json               # Test reports
```

---

## Migration Timeline Estimate

- **Export**: ~1 second
- **Validation**: ~5 seconds (schema only), ~2-5 minutes (with URL tests)
- **Comparison**: ~1-2 minutes per URL (depends on sample size)
- **Full Test Suite**: ~3-5 minutes (core tests), ~10-20 minutes (with --full)

**Total Migration Time**: ~15-30 minutes for complete validation
