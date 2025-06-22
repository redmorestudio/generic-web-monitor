#!/bin/bash

# Script to add necessary secrets to GitHub repository

echo "🔐 Adding GitHub Secrets for Enhanced AI Monitor..."

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed. Please install it first:"
    echo "   brew install gh"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub CLI. Please run:"
    echo "   gh auth login"
    exit 1
fi

# Read .env file to get values
if [ -f "github-actions-backend/.env" ]; then
    source github-actions-backend/.env
else
    echo "❌ .env file not found in github-actions-backend/"
    exit 1
fi

# Add secrets
echo "Adding ANTHROPIC_API_KEY..."
echo "$ANTHROPIC_API_KEY" | gh secret set ANTHROPIC_API_KEY -R redmorestudio/ai-competitive-monitor

echo "Adding THEBRAIN_API_KEY..."
echo "$THEBRAIN_API_KEY" | gh secret set THEBRAIN_API_KEY -R redmorestudio/ai-competitive-monitor

echo "Adding THEBRAIN_BRAIN_ID..."
echo "$THEBRAIN_BRAIN_ID" | gh secret set THEBRAIN_BRAIN_ID -R redmorestudio/ai-competitive-monitor

echo "✅ All secrets added successfully!"
echo ""
echo "📋 Secrets configured:"
echo "   - ANTHROPIC_API_KEY"
echo "   - THEBRAIN_API_KEY"
echo "   - THEBRAIN_BRAIN_ID"
echo ""
echo "🚀 Your enhanced AI monitoring is now ready to run!"
