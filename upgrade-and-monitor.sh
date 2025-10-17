#!/bin/bash

# Upgrade AI Monitor to expanded company list and run monitoring
# This script updates the database and triggers a full monitoring run

echo "🚀 AI Monitor System Upgrade - Expanding to 50 Companies"
echo "======================================================="
echo ""

# Set environment variables
# GitHub token should be set as environment variable
# export GITHUB_TOKEN='your-token-here'
cd /Users/sethredmore/ai-monitor-fresh

# Step 1: Backup current database
echo "📦 Backing up current database..."
cp github-actions-backend/data/monitor.db github-actions-backend/data/monitor.db.backup.$(date +%Y%m%d_%H%M%S)

# Step 2: Update to expanded company list
echo "🔄 Updating database with expanded company list..."
cd github-actions-backend/scripts
node init-db-expanded.js
cd ../..

# Step 3: Generate updated static data
echo "📊 Generating dashboard data..."
cd github-actions-backend
node generate-static-data.js
cd ..

# Step 4: Commit changes
echo "💾 Committing database updates..."
git add -A
git commit -m "feat: Expand monitoring to 50 companies across all AI sectors

- Added major LLM providers (10 companies)
- Added AI-assisted coding tools (8 companies)
- Added AI search & research (5 companies)
- Added AI voice & audio (5 companies)
- Added video/media AI (4 companies)
- Added image generation (3 companies)
- Added enterprise AI (3 companies)
- Added AI infrastructure (4 companies)
- Added AI hardware (3 companies)

Total: 45 companies with ~150 URLs"

git push origin main

# Step 5: Trigger monitoring workflow
echo ""
echo "🏃 Triggering GitHub Actions workflow..."
gh workflow run monitor.yml

# Wait a moment for the workflow to start
sleep 5

# Step 6: Check workflow status
echo ""
echo "📋 Checking workflow status..."
RUN_ID=$(gh run list --workflow=monitor.yml --limit=1 --json databaseId --jq '.[0].databaseId')

if [ -n "$RUN_ID" ]; then
    echo "✅ Workflow started! Run ID: $RUN_ID"
    echo ""
    echo "📺 Watch progress at: https://github.com/redmorestudio/ai-competitive-monitor/actions/runs/$RUN_ID"
    echo ""
    echo "Or watch in terminal:"
    echo "gh run watch $RUN_ID"
else
    echo "⚠️  Could not get workflow ID. Check manually:"
    echo "gh run list --workflow=monitor.yml --limit=5"
fi

echo ""
echo "🎯 What's happening now:"
echo "1. GitHub Actions is scraping all 45 companies"
echo "2. AI will analyze changes and extract entities"
echo "3. Smart groups will be auto-created"
echo "4. TheBrain export will be updated"
echo "5. Dashboard will show all results"
echo ""
echo "⏱️  Estimated time: 20-30 minutes for full scan"
echo ""
echo "📊 View results at:"
echo "- Dashboard: https://redmorestudio.github.io/ai-competitive-monitor"
echo "- Management: https://redmorestudio.github.io/ai-competitive-monitor/index-manage.html"
