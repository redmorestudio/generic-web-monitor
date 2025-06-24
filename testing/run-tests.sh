#!/bin/bash

# AI Monitor - Automated Test Suite
# Runs basic health checks on the monitoring system

echo "🔍 AI Monitor Test Suite - Starting..."
echo "=================================="

# Configuration
REPO_DIR="/Users/sethredmore/ai-monitor-fresh"
BACKEND_DIR="$REPO_DIR/github-actions-backend"
DB_PATH="$BACKEND_DIR/data/monitor.db"

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run a test
run_test() {
    local test_name=$1
    local test_command=$2
    
    echo -n "Testing $test_name... "
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASSED${NC}"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        ((TESTS_FAILED++))
        return 1
    fi
}

# Test 1: Check if repository exists
run_test "Repository exists" "[ -d '$REPO_DIR' ]"

# Test 2: Check if database exists
run_test "Database exists" "[ -f '$DB_PATH' ]"

# Test 3: Check Node.js installation
run_test "Node.js installed" "which node"

# Test 4: Check npm packages
run_test "NPM packages installed" "[ -d '$BACKEND_DIR/node_modules' ]"

# Test 5: Database integrity
echo "🗄️  Running database tests..."
cd "$BACKEND_DIR"

# Create a test script for database checks
cat > test-db.js << 'EOF'
const Database = require('better-sqlite3');
const path = require('path');

try {
    const db = new Database('./data/monitor.db', { readonly: true });
    
    // Check required tables
    const requiredTables = [
        'companies', 'urls', 'content_snapshots', 
        'changes', 'baseline_analysis', 'ai_analysis',
        'monitoring_runs'
    ];
    
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    const tableNames = tables.map(t => t.name);
    
    for (const table of requiredTables) {
        if (!tableNames.includes(table)) {
            console.error(`Missing table: ${table}`);
            process.exit(1);
        }
    }
    
    // Check data
    const companyCount = db.prepare('SELECT COUNT(*) as count FROM companies').get().count;
    const urlCount = db.prepare('SELECT COUNT(*) as count FROM urls').get().count;
    
    console.log(`Companies: ${companyCount}`);
    console.log(`URLs: ${urlCount}`);
    
    if (companyCount < 50 || urlCount < 150) {
        console.error('Insufficient data in database');
        process.exit(1);
    }
    
    db.close();
    process.exit(0);
} catch (error) {
    console.error('Database error:', error.message);
    process.exit(1);
}
EOF

run_test "Database structure" "node test-db.js"
rm -f test-db.js

# Test 6: Check workflow files
echo "📋 Checking workflow files..."
WORKFLOWS=("scrape.yml" "analyze.yml" "sync.yml" "full-monitor.yml")
for workflow in "${WORKFLOWS[@]}"; do
    run_test "Workflow $workflow exists" "[ -f '$REPO_DIR/.github/workflows/$workflow' ]"
done

# Test 7: Check API data directory
run_test "API data directory exists" "[ -d '$REPO_DIR/api-data' ]"

# Test 8: Check dashboard file
run_test "Dashboard (index.html) exists" "[ -f '$REPO_DIR/index.html' ]"

# Test 9: Recent monitoring activity
echo "📊 Checking recent activity..."
cd "$BACKEND_DIR"

cat > test-activity.js << 'EOF'
const Database = require('better-sqlite3');
const db = new Database('./data/monitor.db', { readonly: true });

try {
    // Check for recent scrapes (within last 24 hours)
    const recentScrapes = db.prepare(`
        SELECT COUNT(*) as count 
        FROM content_snapshots 
        WHERE scraped_at > datetime('now', '-24 hours')
    `).get().count;
    
    // Check for recent analysis
    const recentAnalysis = db.prepare(`
        SELECT COUNT(*) as count 
        FROM baseline_analysis 
        WHERE analysis_date > datetime('now', '-24 hours')
    `).get().count;
    
    console.log(`Recent scrapes (24h): ${recentScrapes}`);
    console.log(`Recent analyses (24h): ${recentAnalysis}`);
    
    db.close();
    
    // Consider it a pass if we have any recent activity
    process.exit(recentScrapes > 0 || recentAnalysis > 0 ? 0 : 1);
} catch (error) {
    console.error('Activity check error:', error.message);
    process.exit(1);
}
EOF

run_test "Recent monitoring activity" "node test-activity.js"
rm -f test-activity.js

# Test 10: Check for high-priority alerts
echo "🚨 Checking for alerts..."
cd "$BACKEND_DIR"

cat > test-alerts.js << 'EOF'
const Database = require('better-sqlite3');
const db = new Database('./data/monitor.db', { readonly: true });

try {
    const highPriorityAlerts = db.prepare(`
        SELECT company_name, url, relevance_score, ai_summary
        FROM changes 
        WHERE relevance_score >= 8
        AND detected_at > datetime('now', '-7 days')
        ORDER BY relevance_score DESC
        LIMIT 5
    `).all();
    
    if (highPriorityAlerts.length > 0) {
        console.log(`Found ${highPriorityAlerts.length} high-priority alerts`);
        highPriorityAlerts.forEach(alert => {
            console.log(`- ${alert.company_name}: Score ${alert.relevance_score}`);
        });
    } else {
        console.log('No high-priority alerts in the last 7 days');
    }
    
    db.close();
    process.exit(0);
} catch (error) {
    console.error('Alert check error:', error.message);
    process.exit(1);
}
EOF

run_test "Alert system check" "node test-alerts.js"
rm -f test-alerts.js

# Summary
echo ""
echo "=================================="
echo "🏁 Test Summary"
echo "=================================="
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed! System appears healthy.${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Please investigate.${NC}"
    exit 1
fi