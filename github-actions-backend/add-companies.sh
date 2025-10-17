#!/bin/bash

# NOTE: This script requires the Express server to be running (npm run server)
# It's intended for local development only, not for CI/CD environments

# Add remaining social marketing companies
# Make sure you're in the github-actions-backend directory

# SocialPilot
node cli.js company:add "SocialPilot" --type marketing --urls "https://socialpilot.co" "https://socialpilot.co/pricing" "https://socialpilot.co/blog"

# Planable
node cli.js company:add "Planable" --type marketing --urls "https://planable.io" "https://planable.io/pricing" "https://planable.io/blog"

# Crowdfire
node cli.js company:add "Crowdfire" --type marketing --urls "https://crowdfireapp.com" "https://crowdfireapp.com/pricing" "https://crowdfireapp.com/blog"

# PostPlanner
node cli.js company:add "PostPlanner" --type marketing --urls "https://postplanner.com" "https://postplanner.com/pricing" "https://postplanner.com/blog"

# SocialBee
node cli.js company:add "SocialBee" --type marketing --urls "https://socialbee.io" "https://socialbee.io/pricing" "https://socialbee.io/blog"

# Loomly
node cli.js company:add "Loomly" --type marketing --urls "https://loomly.com" "https://loomly.com/pricing" "https://loomly.com/blog"

# Zoho Social
node cli.js company:add "Zoho Social" --type marketing --urls "https://zoho.com/social" "https://zoho.com/social/pricing.html" "https://zoho.com/social/blog"

# Later
node cli.js company:add "Later" --type marketing --urls "https://later.com" "https://later.com/pricing" "https://later.com/blog"

echo "All companies added!"
node cli.js company:list
