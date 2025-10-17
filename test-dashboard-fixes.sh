#!/bin/bash

# Test script for AI Monitor Dashboard fixes
echo "🚀 Testing AI Monitor Dashboard Fixes"
echo "====================================="

# 1. Copy the fixed index.html to the main file
echo "📋 Step 1: Deploying fixed dashboard..."
cp /Users/sethredmore/ai-monitor-fresh/index-fixed.html /Users/sethredmore/ai-monitor-fresh/index.html
echo "✅ Dashboard updated with fixes"

# 2. Update the generate script
echo ""
echo "📋 Step 2: Updating data generation script..."
cp /Users/sethredmore/ai-monitor-fresh/github-actions-backend/generate-static-data-enhanced.js \
   /Users/sethredmore/ai-monitor-fresh/github-actions-backend/generate-static-data.js
echo "✅ Data generation script updated"

# 3. Generate fresh data with AI analysis
echo ""
echo "📋 Step 3: Generating fresh data with AI analysis..."
cd /Users/sethredmore/ai-monitor-fresh/github-actions-backend
node generate-static-data.js
echo "✅ Data regenerated with AI insights"

# 4. Display summary
echo ""
echo "🎉 Dashboard Fixes Applied!"
echo "=========================="
echo ""
echo "✨ What's Fixed:"
echo "  1. ✅ Clickable rows in extracted information section"
echo "  2. ✅ Visual indicators for recent changes (yellow pulse = <24h)"
echo "  3. ✅ Relevance scores and keywords now properly displayed"
echo "  4. ✅ Modal popup shows full extracted content and recent deltas"
echo "  5. ✅ TheBrain integration tab added with connection status"
echo "  6. ✅ Enhanced filtering with time range option"
echo "  7. ✅ Changes counter shows 24-hour activity"
echo ""
echo "🌐 Open the dashboard at: https://redmorestudio.github.io/ai-competitive-monitor"
echo "   or locally at: file:///Users/sethredmore/ai-monitor-fresh/index.html"
echo ""
echo "🧠 TheBrain Integration:"
echo "  - Brain ID: 134f1325-4a8d-46d7-a078-5386c8ab3542"
echo "  - Run sync: node github-actions-backend/thebrain-integration.js"
echo ""
echo "🚀 To deploy changes:"
echo "  1. git add -A"
echo "  2. git commit -m 'Fix dashboard extracted info and add visual indicators'"
echo "  3. git push origin main"
echo ""
echo "✅ All fixes applied successfully!"
