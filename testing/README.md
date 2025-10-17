# AI Monitor Testing Suite

## Overview
This directory contains comprehensive testing tools for the AI Competitive Monitor system. The test suite covers infrastructure, functionality, integration, performance, and security aspects of the monitoring system.

## Directory Structure
```
testing/
├── AI-Monitor-Test-Plan.md      # Complete test plan documentation
├── QUICK-REFERENCE.md           # Quick testing guide
├── run-tests.sh                 # Automated health check script
├── test-dashboard.js            # Dashboard testing with Puppeteer
├── test-workflows.js            # Workflow component testing
└── README.md                    # This file
```

## Quick Start

### 1. Run Basic Health Check
```bash
chmod +x run-tests.sh
./run-tests.sh
```

### 2. Test Dashboard
```bash
# Install dependencies
npm install puppeteer

# Run tests
node test-dashboard.js
```

### 3. Test Workflow Components
```bash
node test-workflows.js
```

## Test Coverage

### Infrastructure Tests
- GitHub Actions workflow status
- Database connectivity and integrity
- API key configuration
- File system structure

### Functional Tests
- Web scraping accuracy
- HTML to Markdown conversion
- AI entity extraction quality
- Change detection accuracy
- Alert generation

### Integration Tests
- TheBrain synchronization
- Dashboard data generation
- Email notifications
- GitHub Issues creation

### Performance Tests
- Workflow execution times
- Rate limiting compliance
- Parallel processing efficiency
- Resource utilization

### Security Tests
- API key security
- Error handling
- Input validation

## Running Tests

### Manual Testing via GitHub Actions

1. **Test Scraping Only**
   - Go to: Actions → "1. Scrape Websites" → Run workflow
   - Optional: Enter company name filter

2. **Test Analysis Only**
   - Go to: Actions → "2. Analyze Content" → Run workflow
   - Select mode: all, only-new, or force

3. **Test Full Pipeline**
   - Go to: Actions → "Full Monitor Pipeline" → Run workflow
   - All stages run automatically

### Local Testing

For local testing, ensure you have:
- Node.js installed
- Access to the repository
- Environment variables set (ANTHROPIC_API_KEY, etc.)

```bash
cd /Users/sethredmore/ai-monitor-fresh/github-actions-backend

# Test specific components
node scraper-wrapper.js --company "Anthropic"
node ai-analyzer-baseline.js --only-new
node generate-static-data.js
```

## Performance Benchmarks

| Component | Expected Time | Alert If |
|-----------|--------------|----------|
| Scraping (all) | 20-25 min | > 30 min |
| Analysis (all) | 15-20 min | > 25 min |
| Sync & Deploy | 5-10 min | > 15 min |
| Full Pipeline | 40-55 min | > 60 min |

## Alert Thresholds

- **High Priority (Score ≥ 8)**: Creates GitHub Issue automatically
- **Medium Priority (Score 5-7)**: Highlighted on dashboard
- **Low Priority (Score < 5)**: Normal logging only

## Common Issues

### Workflow Timeouts
- Check if processing too many URLs
- Verify API rate limits
- Use `--only-new` mode for efficiency

### Missing Data on Dashboard
- Verify workflows completed successfully
- Check JSON files in api-data/
- Review browser console for errors

### TheBrain Sync Failures
- Verify API credentials
- Test with dry-run mode
- Check API permissions

## Test Results

After running tests, results are saved to:
- `dashboard-test-results.json` - Dashboard test outcomes
- `workflow-test-report.json` - Component test results
- `dashboard-screenshot.png` - Visual verification

## Continuous Improvement

The test suite should be updated when:
- New features are added
- Performance requirements change
- New companies are added to monitoring
- Infrastructure changes occur

## Support

For issues or questions:
1. Check QUICK-REFERENCE.md for common solutions
2. Review workflow logs in GitHub Actions
3. Create GitHub Issue with appropriate label:
   - `test-failure` - Test failures
   - `bug` - System bugs
   - `performance` - Performance issues

---

**Last Updated:** June 24, 2025  
**Maintained By:** AI Monitor Team