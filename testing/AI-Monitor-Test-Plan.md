# AI Competitive Monitor - Comprehensive Test Plan

## Test Plan Overview
**Version:** 1.0  
**Date:** June 24, 2025  
**System:** AI-Powered Competitive Intelligence Monitor  
**Architecture:** Separated workflows (Scrape → Analyze → Sync)  

## Executive Summary

This test plan ensures the AI monitoring system functions correctly across all components:
- 52 companies monitored across 174 URLs
- Separated workflow architecture for modularity
- AI-powered entity extraction and threat scoring
- TheBrain integration for knowledge management
- Automated alerting for high-priority changes

## Test Categories

### 1. Infrastructure Tests
- [ ] GitHub Actions workflows
- [ ] Database integrity
- [ ] API connectivity
- [ ] Deployment pipeline

### 2. Functional Tests
- [ ] Web scraping accuracy
- [ ] AI analysis quality
- [ ] Change detection
- [ ] Alert generation

### 3. Integration Tests
- [ ] TheBrain synchronization
- [ ] Dashboard data flow
- [ ] Email notifications
- [ ] GitHub Issues creation

### 4. Performance Tests
- [ ] Workflow execution time
- [ ] Rate limiting compliance
- [ ] Parallel processing
- [ ] Resource utilization

### 5. Security Tests
- [ ] API key management
- [ ] Data access controls
- [ ] Error handling
- [ ] Input validation

## Detailed Test Cases

### Phase 1: Infrastructure Verification

#### Test 1.1: GitHub Actions Health Check
**Objective:** Verify all workflows are properly configured and executable

**Steps:**
1. Navigate to https://github.com/redmorestudio/ai-competitive-monitor/actions
2. Check status of all workflows:
   - `scrape.yml` - Should be green or ready to run
   - `analyze.yml` - Should be green or ready to run
   - `sync.yml` - Should be green or ready to run
   - `full-monitor.yml` - Should show scheduled runs
3. Verify cron schedule is active (every 6 hours)

**Expected Results:**
- All workflows show no syntax errors
- Scheduled workflow shows next run time
- Manual workflow triggers are available

#### Test 1.2: Database Connectivity
**Objective:** Ensure SQLite database is accessible and structured correctly

**Test Script:**
```bash
cd github-actions-backend
node -e "
const Database = require('better-sqlite3');
const db = new Database('./data/monitor.db');

// Check tables exist
const tables = db.prepare(\"SELECT name FROM sqlite_master WHERE type='table'\").all();
console.log('Tables found:', tables.map(t => t.name));

// Check record counts
const companies = db.prepare('SELECT COUNT(*) as count FROM companies').get();
console.log('Companies:', companies.count);

const urls = db.prepare('SELECT COUNT(*) as count FROM urls').get();
console.log('URLs:', urls.count);

db.close();
"
```

**Expected Results:**
- 52 companies in database
- 174 URLs in database
- All required tables present

#### Test 1.3: API Keys Validation
**Objective:** Verify all required API keys are configured

**Manual Check in GitHub:**
1. Go to Settings → Secrets and variables → Actions
2. Verify presence of:
   - `ANTHROPIC_API_KEY`
   - `THEBRAIN_API_KEY`
   - `THEBRAIN_BRAIN_ID`
   - `SMTP_*` (if email alerts enabled)

### Phase 2: Scraping Functionality

#### Test 2.1: Single Company Scrape
**Objective:** Test targeted scraping of a specific company

**Steps:**
1. Go to Actions → "1. Scrape Websites" → Run workflow
2. Enter company filter: "OpenAI"
3. Run workflow
4. Download database artifact after completion

**Validation Script:**
```javascript
// Check scraped content
const db = new Database('./monitor.db');
const recent = db.prepare(`
  SELECT url, status_code, has_content, markdown_content IS NOT NULL as has_markdown
  FROM content_snapshots
  WHERE url LIKE '%openai%'
  ORDER BY scraped_at DESC
  LIMIT 5
`).all();
console.log('Recent OpenAI scrapes:', recent);
```

**Expected Results:**
- All OpenAI URLs show status_code 200
- has_content = 1 for all entries
- has_markdown = 1 for all entries

#### Test 2.2: Rate Limiting Compliance
**Objective:** Verify 2-second delays between requests

**Monitor During Scrape:**
1. Run full scrape workflow
2. Check workflow logs for timing
3. Verify "Waiting 2 seconds before next request" messages

**Expected Results:**
- Consistent 2-second gaps between URL fetches
- No 429 (rate limit) errors

#### Test 2.3: HTML to Markdown Conversion
**Objective:** Ensure proper content conversion

**Test Script:**
```javascript
// Compare HTML vs Markdown quality
const samples = db.prepare(`
  SELECT url, 
         LENGTH(full_content) as html_size,
         LENGTH(markdown_content) as md_size,
         markdown_content
  FROM content_snapshots
  WHERE markdown_content IS NOT NULL
  LIMIT 3
`).all();

samples.forEach(s => {
  console.log(`
URL: ${s.url}`);
  console.log(`HTML: ${s.html_size} bytes → Markdown: ${s.md_size} bytes`);
  console.log(`Sample:`, s.markdown_content.substring(0, 200));
});
```

**Expected Results:**
- Markdown is significantly smaller than HTML
- Markdown contains readable text without HTML tags
- Key content is preserved

### Phase 3: AI Analysis Testing

#### Test 3.1: Baseline Analysis Accuracy
**Objective:** Verify AI extracts meaningful entities

**Steps:**
1. Run Analysis workflow with mode: "force"
2. Check a known company's results

**Validation Query:**
```sql
SELECT 
  company_name,
  JSON_EXTRACT(extracted_data, '$.products') as products,
  JSON_EXTRACT(extracted_data, '$.key_people') as people,
  JSON_EXTRACT(extracted_data, '$.technologies') as tech,
  relevance_score
FROM baseline_analysis
WHERE company_name = 'Anthropic'
ORDER BY analysis_date DESC
LIMIT 1;
```

**Expected Results:**
- Products include "Claude"
- Key people might include "Dario Amodei"
- Technologies include "AI", "LLM", etc.
- Relevance score between 0-10

#### Test 3.2: Change Detection
**Objective:** Test system detects content changes

**Steps:**
1. Note current content hash for a URL
2. Make a small change (if possible via test environment)
3. Run scrape → analyze pipeline
4. Check changes table

**Validation:**
```sql
SELECT 
  url,
  change_type,
  detected_at,
  relevance_score,
  ai_summary
FROM changes
WHERE url LIKE '%test-company%'
ORDER BY detected_at DESC;
```

**Expected Results:**
- New change record created
- AI summary describes the change
- Relevance score assigned

#### Test 3.3: Entity Extraction Quality
**Objective:** Measure extraction accuracy across categories

**Test different entity types:**
```javascript
// Count extracted entities by type
const stats = db.prepare(`
  SELECT 
    COUNT(DISTINCT JSON_EXTRACT(extracted_data, '$.products')) as product_count,
    COUNT(DISTINCT JSON_EXTRACT(extracted_data, '$.pricing_tiers')) as pricing_count,
    COUNT(DISTINCT JSON_EXTRACT(extracted_data, '$.partnerships')) as partnership_count
  FROM baseline_analysis
  WHERE analysis_date > datetime('now', '-1 day')
`).get();
console.log('Extraction stats:', stats);
```

### Phase 4: Integration Testing

#### Test 4.1: TheBrain Synchronization
**Objective:** Verify successful sync to TheBrain

**Steps:**
1. Run Sync workflow with TheBrain enabled
2. Check workflow logs for sync status
3. Verify in TheBrain application

**Expected Log Messages:**
- "Syncing to TheBrain..."
- "Created thought: [Company Name]"
- "Created link: [Relationship]"

#### Test 4.2: Dashboard Data Generation
**Objective:** Ensure JSON files are created correctly

**Check Generated Files:**
```bash
# After sync workflow completes
ls -la api-data/
# Should see:
# - dashboard.json
# - companies.json
# - content-snapshots.json
# - changes.json
# - monitoring-runs.json
# - workflow-status.json
```

**Validate JSON Structure:**
```javascript
// Check dashboard.json
const dashboard = JSON.parse(fs.readFileSync('api-data/dashboard.json'));
console.log('Total companies:', dashboard.totalCompanies);
console.log('Active companies:', dashboard.activeCompanies);
console.log('Recent changes:', dashboard.recentChanges.length);
```

#### Test 4.3: High Priority Alerts
**Objective:** Test GitHub Issue creation for high-relevance changes

**Simulate High Priority Change:**
1. Manually update database with high relevance score:
```sql
UPDATE changes 
SET relevance_score = 9, 
    ai_summary = 'MAJOR: Anthropic announces GPT-5 competitor'
WHERE id = (SELECT id FROM changes ORDER BY id DESC LIMIT 1);
```
2. Run sync workflow
3. Check GitHub Issues

**Expected Results:**
- New issue created with title containing company name
- Issue body contains AI summary
- Labels applied correctly

### Phase 5: End-to-End Testing

#### Test 5.1: Full Pipeline Execution
**Objective:** Test complete flow from scrape to dashboard

**Steps:**
1. Run full-monitor.yml workflow
2. Monitor each stage:
   - Scraping (should take ~15-20 minutes)
   - Analysis (should take ~10-15 minutes)
   - Sync (should take ~5 minutes)
3. Check dashboard after completion

**Success Criteria:**
- All stages complete without errors
- Dashboard shows updated timestamp
- New data visible in UI

#### Test 5.2: Dashboard Functionality
**Objective:** Verify all dashboard features work

**Test with Puppeteer:**
```javascript
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Load dashboard
  await page.goto('https://redmorestudio.github.io/ai-competitive-monitor');
  
  // Check main stats load
  await page.waitForSelector('.stats-card', { timeout: 10000 });
  const stats = await page.$$('.stats-card');
  console.log('Stats cards found:', stats.length);
  
  // Check company data loads
  await page.waitForSelector('.company-monitoring', { timeout: 10000 });
  const companies = await page.$$('.company-row');
  console.log('Companies displayed:', companies.length);
  
  // Test filtering
  await page.type('#companySearch', 'OpenAI');
  await page.waitForTimeout(500);
  const filtered = await page.$$('.company-row:not(.hidden)');
  console.log('Filtered companies:', filtered.length);
  
  await browser.close();
})();
```

### Phase 6: Performance Testing

#### Test 6.1: Workflow Execution Time
**Objective:** Ensure workflows complete within expected timeframes

**Measure Timings:**
- Scraping: Should complete in < 30 minutes for all companies
- Analysis: Should complete in < 20 minutes
- Sync: Should complete in < 10 minutes

#### Test 6.2: Parallel Processing
**Objective:** Verify batch processing works correctly

**Check Analysis Logs:**
Look for: "Processing batch of 10 URLs"
Verify no timeouts or memory issues

### Phase 7: Error Handling

#### Test 7.1: Failed URL Handling
**Objective:** System handles 404s and timeouts gracefully

**Test by checking:**
```sql
SELECT url, status_code, error_message
FROM content_snapshots
WHERE status_code != 200
ORDER BY scraped_at DESC;
```

#### Test 7.2: API Failure Recovery
**Objective:** System handles API failures

**Test scenarios:**
- Invalid API key (should fail gracefully)
- API rate limits (should retry)
- Network timeouts (should retry)

## Test Execution Schedule

### Daily Tests (Automated)
- Full pipeline execution (via cron)
- Dashboard availability check
- Database integrity check

### Weekly Tests (Manual)
- TheBrain sync verification
- Alert accuracy review
- Performance metrics review

### Monthly Tests
- Full system backup
- Security audit
- Cost analysis (API usage)

## Success Metrics

1. **Reliability**: 95%+ uptime for workflows
2. **Accuracy**: 90%+ entity extraction accuracy
3. **Performance**: < 1 hour total pipeline execution
4. **Coverage**: All 52 companies monitored successfully
5. **Alerts**: 0 false positives for high-priority alerts

## Issue Tracking

Create GitHub Issues for any failures with labels:
- `test-failure`: For failed test cases
- `performance`: For performance issues
- `bug`: For functional bugs
- `enhancement`: For improvement suggestions

## Rollback Plan

If critical issues found:
1. Revert to `monitor.yml` (monolithic workflow)
2. Disable scheduled runs
3. Fix issues in development
4. Re-test before re-enabling

## Sign-off Criteria

System ready for production when:
- [ ] All Phase 1-4 tests pass
- [ ] End-to-end test successful
- [ ] Performance within targets
- [ ] No critical bugs open
- [ ] Documentation updated

---

**Test Plan Prepared By:** AI Monitor Architecture Team  
**Review Status:** Ready for Execution  
**Next Review Date:** July 24, 2025