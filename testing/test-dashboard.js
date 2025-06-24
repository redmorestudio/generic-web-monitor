// AI Monitor - Dashboard Test Suite
// Tests the live dashboard using Puppeteer

const puppeteer = require('puppeteer');
const fs = require('fs');

const DASHBOARD_URL = 'https://redmorestudio.github.io/ai-competitive-monitor';

// Test results collector
const testResults = {
    passed: 0,
    failed: 0,
    tests: []
};

// Helper function to run a test
async function runTest(name, testFn) {
    console.log(`\nTesting: ${name}`);
    try {
        await testFn();
        console.log(`✅ PASSED: ${name}`);
        testResults.passed++;
        testResults.tests.push({ name, status: 'passed' });
    } catch (error) {
        console.log(`❌ FAILED: ${name}`);
        console.error(`   Error: ${error.message}`);
        testResults.failed++;
        testResults.tests.push({ name, status: 'failed', error: error.message });
    }
}

// Main test suite
async function runDashboardTests() {
    console.log('🔍 AI Monitor Dashboard Test Suite');
    console.log('==================================');
    console.log(`Testing: ${DASHBOARD_URL}\n`);

    const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Enable console logging
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.error('Console error:', msg.text());
        }
    });

    try {
        // Test 1: Dashboard loads successfully
        await runTest('Dashboard loads', async () => {
            const response = await page.goto(DASHBOARD_URL, { 
                waitUntil: 'networkidle2',
                timeout: 30000 
            });
            if (!response.ok()) {
                throw new Error(`HTTP ${response.status()}`);
            }
        });

        // Test 2: Main stats cards appear
        await runTest('Stats cards load', async () => {
            await page.waitForSelector('.bg-blue-500', { timeout: 10000 });
            const statsCards = await page.$$('.bg-blue-500, .bg-green-500, .bg-purple-500, .bg-orange-500');
            if (statsCards.length < 4) {
                throw new Error(`Expected 4 stats cards, found ${statsCards.length}`);
            }
            
            // Check if stats have actual numbers
            const totalCompanies = await page.$eval('.bg-blue-500 .text-3xl', el => el.textContent);
            if (!totalCompanies || totalCompanies === '0') {
                throw new Error('No companies found in stats');
            }
            console.log(`   Total companies: ${totalCompanies}`);
        });

        // Test 3: Company monitoring section loads
        await runTest('Company monitoring section', async () => {
            await page.waitForSelector('#company-monitoring', { timeout: 10000 });
            const companies = await page.$$('#company-monitoring tbody tr');
            if (companies.length === 0) {
                throw new Error('No companies in monitoring table');
            }
            console.log(`   Companies loaded: ${companies.length}`);
        });

        // Test 4: Search functionality
        await runTest('Search functionality', async () => {
            // Type in search box
            await page.type('#companySearch', 'OpenAI');
            await page.waitForTimeout(500);
            
            // Check filtered results
            const visibleCompanies = await page.$$eval('#company-monitoring tbody tr', rows => 
                rows.filter(row => !row.classList.contains('hidden')).length
            );
            
            if (visibleCompanies === 0) {
                throw new Error('Search returned no results for "OpenAI"');
            }
            console.log(`   Search results: ${visibleCompanies} companies`);
            
            // Clear search
            await page.evaluate(() => {
                document.querySelector('#companySearch').value = '';
                document.querySelector('#companySearch').dispatchEvent(new Event('input'));
            });
        });

        // Test 5: AI Enhanced Extractions section
        await runTest('AI extractions load', async () => {
            await page.waitForSelector('#extracted-data', { timeout: 10000 });
            const extractedItems = await page.$$('#extracted-data .bg-white.rounded-lg.shadow');
            if (extractedItems.length === 0) {
                throw new Error('No AI extracted data found');
            }
            console.log(`   Extracted items: ${extractedItems.length}`);
        });

        // Test 6: Change history section
        await runTest('Change history loads', async () => {
            await page.waitForSelector('#change-history', { timeout: 10000 });
            const changes = await page.$$('#change-history tbody tr');
            console.log(`   Changes found: ${changes.length}`);
        });

        // Test 7: Category pills are interactive
        await runTest('Category filter pills', async () => {
            // Click on a category pill
            const categoryPills = await page.$$('.category-pill');
            if (categoryPills.length > 0) {
                await categoryPills[0].click();
                await page.waitForTimeout(300);
                
                // Check if filtering happened
                const activeFilter = await page.$('.category-pill.active');
                if (!activeFilter) {
                    console.log('   Warning: Category pills might not be interactive');
                }
            }
        });

        // Test 8: System logs section
        await runTest('System logs present', async () => {
            await page.waitForSelector('#system-logs', { timeout: 10000 });
            const logEntries = await page.$$('#system-logs tbody tr');
            console.log(`   Log entries: ${logEntries.length}`);
        });

        // Test 9: TheBrain integration status
        await runTest('TheBrain integration check', async () => {
            const brainStatus = await page.$('#thebrain-status');
            if (brainStatus) {
                const statusText = await page.$eval('#thebrain-status', el => el.textContent);
                console.log(`   TheBrain status: ${statusText}`);
            }
        });

        // Test 10: Responsive design
        await runTest('Mobile responsiveness', async () => {
            // Test mobile viewport
            await page.setViewport({ width: 375, height: 667 });
            await page.waitForTimeout(500);
            
            // Check if main elements are still visible
            const mobileStats = await page.$('.bg-blue-500');
            if (!mobileStats) {
                throw new Error('Stats not visible on mobile');
            }
            
            // Reset viewport
            await page.setViewport({ width: 1920, height: 1080 });
        });

        // Test 11: Data freshness
        await runTest('Data freshness check', async () => {
            // Look for last updated timestamp
            const footerText = await page.$eval('body', el => el.textContent);
            if (footerText.includes('Last updated:')) {
                const match = footerText.match(/Last updated: ([^|]+)/);
                if (match) {
                    console.log(`   ${match[0].trim()}`);
                    
                    // Check if update is recent (within 24 hours)
                    const lastUpdate = new Date(match[1].trim());
                    const hoursSinceUpdate = (Date.now() - lastUpdate) / (1000 * 60 * 60);
                    if (hoursSinceUpdate > 24) {
                        console.log(`   Warning: Data is ${Math.round(hoursSinceUpdate)} hours old`);
                    }
                }
            }
        });

        // Take screenshots for documentation
        await page.screenshot({ 
            path: '/tmp/ai-monitor-test-plan/dashboard-screenshot.png',
            fullPage: true 
        });
        console.log('\n📸 Screenshot saved: dashboard-screenshot.png');

    } finally {
        await browser.close();
    }

    // Print summary
    console.log('\n==================================');
    console.log('📊 Test Summary');
    console.log('==================================');
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`📝 Total:  ${testResults.passed + testResults.failed}`);
    
    // Save detailed results
    fs.writeFileSync(
        '/tmp/ai-monitor-test-plan/dashboard-test-results.json',
        JSON.stringify(testResults, null, 2)
    );
    
    if (testResults.failed === 0) {
        console.log('\n🎉 All dashboard tests passed!');
        process.exit(0);
    } else {
        console.log('\n⚠️  Some tests failed. Check results for details.');
        process.exit(1);
    }
}

// Run the tests
runDashboardTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});