// AI Monitor - Workflow Test Script
// Tests individual workflow components locally

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

class WorkflowTester {
    constructor() {
        this.results = {
            scrape: { status: 'pending', errors: [] },
            analyze: { status: 'pending', errors: [] },
            sync: { status: 'pending', errors: [] }
        };
        this.dbPath = './data/monitor.db';
    }

    log(message, type = 'info') {
        const prefix = {
            info: '📝',
            success: '✅',
            error: '❌',
            warning: '⚠️'
        }[type] || '📝';
        
        console.log(`${prefix} ${message}`);
    }

    async testScraping() {
        this.log('Testing Scraping Module...', 'info');
        
        try {
            // Test with a single company to save time
            const testCompany = 'Anthropic';
            this.log(`Running scraper for ${testCompany}...`);
            
            // Backup current database
            if (fs.existsSync(this.dbPath)) {
                fs.copyFileSync(this.dbPath, `${this.dbPath}.backup`);
            }
            
            // Run scraper
            const output = execSync(
                `node scraper-wrapper.js --company "${testCompany}"`,
                { encoding: 'utf8', stdio: 'pipe' }
            );
            
            // Check results
            const db = new Database(this.dbPath, { readonly: true });
            
            // Verify content was scraped
            const recentScrapes = db.prepare(`
                SELECT COUNT(*) as count 
                FROM content_snapshots 
                WHERE company_name = ? 
                AND scraped_at > datetime('now', '-1 hour')
            `).get(testCompany).count;
            
            db.close();
            
            if (recentScrapes > 0) {
                this.log(`Scraping successful: ${recentScrapes} URLs scraped`, 'success');
                this.results.scrape.status = 'passed';
                
                // Test markdown conversion
                this.testMarkdownConversion();
            } else {
                throw new Error('No content scraped');
            }
            
        } catch (error) {
            this.log(`Scraping failed: ${error.message}`, 'error');
            this.results.scrape.status = 'failed';
            this.results.scrape.errors.push(error.message);
        }
    }

    testMarkdownConversion() {
        this.log('Testing Markdown Conversion...', 'info');
        
        try {
            const output = execSync(
                'node markdown-converter.js latest',
                { encoding: 'utf8', stdio: 'pipe' }
            );
            
            // Check if markdown was created
            const db = new Database(this.dbPath, { readonly: true });
            const markdownCount = db.prepare(`
                SELECT COUNT(*) as count 
                FROM content_snapshots 
                WHERE markdown_content IS NOT NULL
                AND scraped_at > datetime('now', '-1 hour')
            `).get().count;
            
            db.close();
            
            if (markdownCount > 0) {
                this.log(`Markdown conversion successful: ${markdownCount} documents`, 'success');
            } else {
                throw new Error('No markdown content generated');
            }
            
        } catch (error) {
            this.log(`Markdown conversion failed: ${error.message}`, 'error');
            this.results.scrape.errors.push(`Markdown: ${error.message}`);
        }
    }

    async testAnalysis() {
        this.log('Testing AI Analysis Module...', 'info');
        
        try {
            // Check if we have API key
            if (!process.env.ANTHROPIC_API_KEY) {
                throw new Error('ANTHROPIC_API_KEY not set in environment');
            }
            
            // Run analysis on recent content only
            this.log('Running baseline analysis...');
            const output = execSync(
                'node ai-analyzer-baseline.js --only-new',
                { encoding: 'utf8', stdio: 'pipe', timeout: 120000 } // 2 minute timeout
            );
            
            // Check results
            const db = new Database(this.dbPath, { readonly: true });
            
            const analysisCount = db.prepare(`
                SELECT COUNT(*) as count 
                FROM baseline_analysis 
                WHERE analysis_date > datetime('now', '-1 hour')
            `).get().count;
            
            if (analysisCount > 0) {
                this.log(`AI analysis successful: ${analysisCount} companies analyzed`, 'success');
                this.results.analyze.status = 'passed';
                
                // Sample some results
                const sample = db.prepare(`
                    SELECT company_name, relevance_score,
                           JSON_EXTRACT(extracted_data, '$.summary') as summary
                    FROM baseline_analysis 
                    WHERE analysis_date > datetime('now', '-1 hour')
                    LIMIT 3
                `).all();
                
                sample.forEach(s => {
                    this.log(`  ${s.company_name}: Score ${s.relevance_score}/10`, 'info');
                });
            } else {
                throw new Error('No analysis results found');
            }
            
            db.close();
            
        } catch (error) {
            this.log(`Analysis failed: ${error.message}`, 'error');
            this.results.analyze.status = 'failed';
            this.results.analyze.errors.push(error.message);
        }
    }

    async testDataGeneration() {
        this.log('Testing Static Data Generation...', 'info');
        
        try {
            // Generate JSON files
            const output = execSync(
                'node generate-static-data.js',
                { encoding: 'utf8', stdio: 'pipe' }
            );
            
            // Check generated files
            const requiredFiles = [
                '../api-data/dashboard.json',
                '../api-data/companies.json',
                '../api-data/content-snapshots.json',
                '../api-data/changes.json'
            ];
            
            let allFilesExist = true;
            for (const file of requiredFiles) {
                const fullPath = path.join(__dirname, file);
                if (fs.existsSync(fullPath)) {
                    const stats = fs.statSync(fullPath);
                    this.log(`  ✓ ${path.basename(file)}: ${stats.size} bytes`, 'success');
                } else {
                    this.log(`  ✗ ${path.basename(file)}: Missing`, 'error');
                    allFilesExist = false;
                }
            }
            
            if (allFilesExist) {
                this.results.sync.status = 'passed';
            } else {
                throw new Error('Some JSON files missing');
            }
            
        } catch (error) {
            this.log(`Data generation failed: ${error.message}`, 'error');
            this.results.sync.status = 'failed';
            this.results.sync.errors.push(error.message);
        }
    }

    async testTheBrainSync() {
        this.log('Testing TheBrain Integration...', 'info');
        
        try {
            // Check if credentials exist
            if (!process.env.THEBRAIN_API_KEY || !process.env.THEBRAIN_BRAIN_ID) {
                this.log('TheBrain credentials not configured - skipping', 'warning');
                return;
            }
            
            // Do a dry run
            const output = execSync(
                'node thebrain-sync-wrapper.js --dry-run',
                { encoding: 'utf8', stdio: 'pipe' }
            );
            
            if (output.includes('thoughts would be created')) {
                this.log('TheBrain sync test passed (dry run)', 'success');
            }
            
        } catch (error) {
            this.log(`TheBrain sync test failed: ${error.message}`, 'error');
            this.results.sync.errors.push(`TheBrain: ${error.message}`);
        }
    }

    generateReport() {
        console.log('\n========================================');
        console.log('📊 Workflow Test Report');
        console.log('========================================\n');
        
        // Overall status
        const allPassed = Object.values(this.results).every(r => r.status === 'passed');
        
        if (allPassed) {
            this.log('All workflow components tested successfully!', 'success');
        } else {
            this.log('Some workflow components have issues', 'error');
        }
        
        // Detailed results
        console.log('\nDetailed Results:');
        console.log('-----------------');
        
        for (const [component, result] of Object.entries(this.results)) {
            const icon = result.status === 'passed' ? '✅' : 
                        result.status === 'failed' ? '❌' : '⏳';
            console.log(`${icon} ${component.toUpperCase()}: ${result.status}`);
            
            if (result.errors.length > 0) {
                result.errors.forEach(err => {
                    console.log(`   └─ ${err}`);
                });
            }
        }
        
        // Save report
        const reportPath = '/tmp/ai-monitor-test-plan/workflow-test-report.json';
        fs.writeFileSync(reportPath, JSON.stringify({
            timestamp: new Date().toISOString(),
            results: this.results,
            summary: {
                total: Object.keys(this.results).length,
                passed: Object.values(this.results).filter(r => r.status === 'passed').length,
                failed: Object.values(this.results).filter(r => r.status === 'failed').length
            }
        }, null, 2));
        
        console.log(`\n📄 Detailed report saved to: ${reportPath}`);
        
        return allPassed;
    }

    async runAllTests() {
        console.log('🚀 AI Monitor Workflow Component Tests');
        console.log('=====================================\n');
        
        // Change to backend directory
        process.chdir(path.join(__dirname, '../github-actions-backend'));
        
        // Run tests in sequence
        await this.testScraping();
        await this.testAnalysis();
        await this.testDataGeneration();
        await this.testTheBrainSync();
        
        // Generate report
        const success = this.generateReport();
        
        // Restore database backup if exists
        if (fs.existsSync(`${this.dbPath}.backup`)) {
            fs.unlinkSync(`${this.dbPath}.backup`);
        }
        
        process.exit(success ? 0 : 1);
    }
}

// Run tests if called directly
if (require.main === module) {
    const tester = new WorkflowTester();
    tester.runAllTests().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = WorkflowTester;