#!/bin/bash

# AI Monitor Enhanced Integration Runner
# This script runs the enhanced AI analysis with TheBrain integration

echo "🚀 Starting AI Monitor Enhanced Integration..."

cd /Users/sethredmore/ai-monitor-fresh/github-actions-backend

# Check if server is running
if ! curl -s http://localhost:3000/api/health > /dev/null; then
    echo "⚠️  Starting local server..."
    node server.js &
    SERVER_PID=$!
    sleep 3
fi

# Run enhanced AI analysis
echo "🔍 Running enhanced AI extraction..."
node ai-analyzer-ultra-enhanced.js

# Sync to TheBrain
echo "🧠 Syncing to TheBrain..."
node thebrain-sync.js sync

# Generate static data for dashboard
echo "📊 Generating dashboard data..."
node generate-static-data.js

echo "✅ Enhanced integration complete!"

# Show summary
echo ""
echo "📈 Summary:"
echo "- Enhanced AI analysis: Complete"
echo "- TheBrain sync: Complete"
echo "- Dashboard data: Updated"
echo ""
echo "🌐 Access the management interface at: http://localhost:8000/manage-companies.html"
echo "🧠 Check TheBrain for the updated knowledge graph"

# Kill server if we started it
if [ ! -z "$SERVER_PID" ]; then
    kill $SERVER_PID 2>/dev/null
fi
