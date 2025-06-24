# AI Monitor Test Plan - Quick Reference

## 🚀 Quick Start Testing

### 1. Basic Health Check
```bash
cd /tmp/ai-monitor-test-plan
chmod +x run-tests.sh
./run-tests.sh
```

### 2. Dashboard Testing
```bash
# Install dependencies first
npm install puppeteer

# Run dashboard tests
node test-dashboard.js
```

### 3. Workflow Component Testing
```bash
# Test individual workflow components
node test-workflows.js
```

## 📋 Manual Test Checklist

### Before Each Test Run
- [ ] Check GitHub Actions status: https://github.com/redmorestudio/ai-competitive-monitor/actions
- [ ] Verify all secrets are configured in GitHub
- [ ] Ensure local environment has latest code

### Daily Checks
- [ ] Dashboard loads: https://redmorestudio.github.io/ai-competitive-monitor
- [ ] Latest workflow run successful
- [ ] Data freshness (< 24 hours old)
- [ ] No high-priority alerts missed

### Weekly Deep Dive
- [ ] Review entity extraction accuracy
- [ ] Check TheBrain sync completeness
- [ ] Analyze performance metrics
- [ ] Review any failed workflows

## 🔍 Common Issues & Solutions

### Issue: Workflow Timeout
**Symptom:** Workflow fails after 30+ minutes  
**Solution:** 
1. Check if too many URLs being processed
2. Verify API rate limits not exceeded
3. Consider using `--only-new` flag for analysis

### Issue: No Data on Dashboard
**Symptom:** Dashboard shows 0 companies  
**Solution:**
1. Check if workflows have run successfully
2. Verify JSON files in api-data/ directory
3. Check browser console for errors

### Issue: TheBrain Sync Fails
**Symptom:** Sync workflow shows errors  
**Solution:**
1. Verify THEBRAIN_API_KEY and THEBRAIN_BRAIN_ID
2. Check API key permissions
3. Test with dry-run mode first

### Issue: High Memory Usage
**Symptom:** Workflow fails with allocation errors  
**Solution:**
1. Reduce batch size in analysis
2. Use filtered scraping for specific companies
3. Clear old data from database

## 📊 Performance Benchmarks

| Component | Expected Time | Warning Threshold |
|-----------|--------------|-------------------|
| Scraping (all) | 20-25 min | > 30 min |
| Analysis (all) | 15-20 min | > 25 min |
| Sync & Deploy | 5-10 min | > 15 min |
| Full Pipeline | 40-55 min | > 60 min |

## 🚨 Alert Thresholds

- **High Priority:** relevance_score >= 8 → GitHub Issue
- **Medium Priority:** relevance_score 5-7 → Dashboard highlight
- **Low Priority:** relevance_score < 5 → Normal logging

## 📝 Test Reporting

After running tests, check these locations:
- `/tmp/ai-monitor-test-plan/dashboard-test-results.json`
- `/tmp/ai-monitor-test-plan/workflow-test-report.json`
- `/tmp/ai-monitor-test-plan/dashboard-screenshot.png`

## 🔧 Advanced Testing

### Test Specific Company
```bash
# In GitHub Actions
Go to: Actions → "1. Scrape Websites" → Run workflow
Enter: Company name filter

# Locally
cd github-actions-backend
node scraper-wrapper.js --company "OpenAI"
```

### Force Re-analysis
```bash
# In GitHub Actions
Go to: Actions → "2. Analyze Content" → Run workflow
Select: Analysis mode = "force"
```

### Test Alert Generation
```sql
-- Manually create high-priority alert in SQLite
UPDATE changes 
SET relevance_score = 9,
    ai_summary = 'TEST: Major announcement'
WHERE id = (SELECT id FROM changes ORDER BY id DESC LIMIT 1);
```

## 📱 Contact for Issues

Create GitHub Issue with label:
- `test-failure` - For test failures
- `bug` - For system bugs
- `performance` - For performance issues

---

**Last Updated:** June 24, 2025  
**Version:** 1.0