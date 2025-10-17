#!/bin/bash

# AI Monitor - Trigger GitHub Actions Workflow
# This script triggers the AI Competitive Intelligence Monitor workflow

echo "🚀 Triggering AI Competitive Intelligence Monitor workflow..."

# Check if GITHUB_TOKEN is set
if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ Error: GITHUB_TOKEN environment variable not set"
    echo ""
    echo "Usage:"
    echo "  export GITHUB_TOKEN='your-token-with-workflow-scope'"
    echo "  ./trigger-workflow.sh [action]"
    echo ""
    echo "Available actions:"
    echo "  - full-monitor (default): Run complete monitoring pipeline"
    echo "  - scrape-only: Only run the scraper"
    echo "  - analyze-only: Only run AI analysis on existing data"
    echo "  - generate-data-only: Only generate static data files"
    exit 1
fi

# Default action
ACTION="${1:-full-monitor}"

# Trigger the workflow
response=$(curl -s -L \
  -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  https://api.github.com/repos/redmorestudio/ai-competitive-monitor/actions/workflows/monitor.yml/dispatches \
  -d "{\"ref\":\"main\",\"inputs\":{\"action\":\"$ACTION\"}}")

# Check if request was successful
if [ -z "$response" ]; then
    echo "✅ Workflow triggered successfully!"
    echo ""
    echo "Action: $ACTION"
    echo ""
    echo "View progress at: https://github.com/redmorestudio/ai-competitive-monitor/actions"
else
    echo "❌ Error triggering workflow:"
    echo "$response"
fi
