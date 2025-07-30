# Cherry-Pick Tracking

This file tracks commits from ai-competitive-monitor that should be cherry-picked to generic-web-monitor.

## How to Use

1. When making fixes in ai-competitive-monitor, tag them appropriately:
   - `fix:` - Bug fixes (usually cherry-pick)
   - `perf:` - Performance improvements (usually cherry-pick)
   - `security:` - Security updates (always cherry-pick)
   - `feat:` - New features (selective cherry-pick)
   - `ai:` - AI-specific features (never cherry-pick)

2. Run sync script:
   ```bash
   ./sync-from-ai-monitor.sh
   ```

## Cherry-Pick Log

### Always Cherry-Pick
- Database schema fixes
- Scraper improvements (captcha detection, stealth mode)
- Performance optimizations
- Security updates
- Bug fixes in core logic

### Never Cherry-Pick
- AI company list updates
- AI-specific scoring criteria
- AI-specific prompts
- Hardcoded AI references

### Pending Cherry-Picks

| Date | Commit | Type | Description | Status |
|------|--------|------|-------------|--------|
| | | | | |

### Completed Cherry-Picks

| Date | Original Commit | New Commit | Description |
|------|----------------|------------|-------------|
| 2025-07-30 | Initial | Initial | Forked from ai-competitive-monitor |

## Sync Script

Save as `sync-from-ai-monitor.sh`:

```bash
#!/bin/bash

# Fetch latest from AI monitor
git fetch ai-monitor main

# Show recent commits
echo "Recent commits in AI monitor:"
git log ai-monitor/main --oneline -20 --grep="^fix:\|^perf:\|^security:" 

echo ""
echo "Cherry-pick specific commits with:"
echo "git cherry-pick <commit-hash>"
```
