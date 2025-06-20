#!/bin/bash

# setup.sh - Quick setup script for AI Competitive Monitor

echo "🚀 AI Competitive Monitor - GitHub Actions Setup"
echo "=============================================="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Initializing git repository..."
    git init
fi

# Check for node_modules
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Create data directories
echo "📁 Creating data directories..."
mkdir -p data/raw data/analysis data/reports data/changes data/alerts docs

# Test configuration
echo "✅ Configuration check:"
node -e "console.log('Config companies:', require('./scripts/config.json').companies.length)"

# Check for API key
if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "⚠️  Warning: ANTHROPIC_API_KEY not set"
    echo "   Set it with: export ANTHROPIC_API_KEY='your-key-here'"
else
    echo "✅ ANTHROPIC_API_KEY is set"
fi

echo ""
echo "📋 Next steps:"
echo "1. Set ANTHROPIC_API_KEY environment variable"
echo "2. Run test scrape: npm run scrape"
echo "3. Run test analysis: npm run analyze"
echo "4. Create GitHub repo and push"
echo "5. Add ANTHROPIC_API_KEY to GitHub Secrets"
echo "6. Enable GitHub Pages in repo settings"
echo ""
echo "🎉 Setup complete!"
