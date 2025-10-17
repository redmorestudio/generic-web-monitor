#!/bin/bash

# Quick test script for TheBrain integration

echo "🧠 Testing TheBrain Integration..."

cd /Users/sethredmore/ai-monitor-fresh/github-actions-backend

# Check if THEBRAIN_API_KEY exists
if [ -z "$THEBRAIN_API_KEY" ]; then
    if [ -f ".env" ]; then
        export $(cat .env | grep THEBRAIN_API_KEY | xargs)
    fi
fi

if [ -z "$THEBRAIN_API_KEY" ]; then
    echo "❌ THEBRAIN_API_KEY not found!"
    echo "Please add to .env file:"
    echo "THEBRAIN_API_KEY=your_api_key_here"
    exit 1
fi

echo "✅ API Key found"

# Test TheBrain connection
node -e "
const TheBrainIntegration = require('./thebrain-sync.js');
async function test() {
    const tb = new TheBrainIntegration();
    const initialized = await tb.initialize();
    if (initialized) {
        console.log('✅ TheBrain connection successful!');
        process.exit(0);
    } else {
        console.log('❌ TheBrain connection failed');
        process.exit(1);
    }
}
test().catch(console.error);
"

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 TheBrain integration is ready!"
    echo ""
    echo "Next steps:"
    echo "1. Run initial sync: node thebrain-sync.js companies"
    echo "2. Sync recent changes: node thebrain-sync.js changes"
    echo "3. Create landscape view: node thebrain-sync.js landscape"
else
    echo ""
    echo "⚠️  Please check:"
    echo "1. TheBrain MCP server is running"
    echo "2. You have at least one brain created in TheBrain"
    echo "3. API key is valid"
fi
