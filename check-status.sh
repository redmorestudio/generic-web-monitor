#!/bin/bash

# AI Monitor Status Check - Now with Claude 4 Opus!
echo "🔍 AI Monitor System Status"
echo "=========================="
echo ""
echo "🧠 AI Model: Claude 4 Opus (Maximum Intelligence)"
echo ""

cd /Users/sethredmore/ai-monitor-fresh

# Check current companies in database
echo "📊 Current Database Stats:"
sqlite3 github-actions-backend/data/monitor.db <<EOF
SELECT 'Companies:', COUNT(*) FROM companies;
SELECT 'URLs:', COUNT(*) FROM urls;
SELECT 'Snapshots:', COUNT(*) FROM content_snapshots;
SELECT 'Changes:', COUNT(*) FROM changes;
SELECT 'AI Analyses:', COUNT(*) FROM ai_analysis;
SELECT '';
SELECT 'Companies by type:';
SELECT type, COUNT(*) as count FROM companies GROUP BY type;
EOF

# Check last workflow run
echo ""
echo "🏃 Last Workflow Run:"
# GitHub token should be set as environment variable
# export GITHUB_TOKEN='your-token-here'
gh run list --workflow=monitor.yml --limit=1

# Check if monitoring is currently running
RUNNING=$(gh run list --workflow=monitor.yml --status=in_progress --limit=1 --json status --jq '.[0].status // "none"')
if [ "$RUNNING" != "none" ]; then
    echo ""
    echo "⚡ MONITORING IS CURRENTLY RUNNING!"
    RUN_ID=$(gh run list --workflow=monitor.yml --status=in_progress --limit=1 --json databaseId --jq '.[0].databaseId')
    echo "Watch progress: gh run watch $RUN_ID"
fi

# Check for recent high-relevance changes (using ai_analysis table)
echo ""
echo "🚨 Recent High-Relevance Changes (last 24h):"
sqlite3 github-actions-backend/data/monitor.db <<EOF
SELECT comp.name || ': Score ' || aa.relevance_score || '/10 - ' || datetime(ch.created_at)
FROM ai_analysis aa
JOIN changes ch ON aa.change_id = ch.id
JOIN urls u ON ch.url_id = u.id
JOIN companies comp ON u.company_id = comp.id
WHERE aa.relevance_score >= 7
AND ch.created_at > datetime('now', '-1 day')
ORDER BY aa.relevance_score DESC
LIMIT 5;
EOF

echo ""
echo "📍 Quick Links:"
echo "- Dashboard: https://redmorestudio.github.io/ai-competitive-monitor"
echo "- GitHub Actions: https://github.com/redmorestudio/ai-competitive-monitor/actions"
echo "- Local path: $(pwd)"
echo ""
echo "💪 Using Claude 4 Opus for maximum intelligence extraction!"
