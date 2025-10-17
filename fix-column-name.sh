#!/bin/bash

# Fix the column name issue in thebrain-api-sync.js

cd /Users/sethredmore/ai-competitive-monitor/github-actions-backend

# Create a backup
cp thebrain-api-sync.js thebrain-api-sync.js.backup

# Replace all instances of company_category with category
sed -i '' 's/company_category/category/g' thebrain-api-sync.js

echo "Fixed column name references:"
grep -n "SELECT category" thebrain-api-sync.js | head -5

echo ""
echo "✅ Fixed: company_category -> category"
