/**
 * Full Migration Test Suite
 * Comprehensive testing of migration from old AI monitor to new generic framework
 *
 * Usage: node migration/test-migration.js [--full]
 *   --full: Run all tests including URL accessibility (slower)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exportAIMonitorAsProfile } from './export-ai-profile.js';
import { validateProfile, testURLAccessibility } from './validate-profile.js';
import { compareResults } from './compare-results.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NEW_SYSTEM_PATH = '/Users/sethredmore/generic-web-monitor';
const PROFILE_PATH = path.join(NEW_SYSTEM_PATH, 'profiles/examples/ai-competitors.json');

/**
 * Test result tracker
 */
class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
    this.warnings = 0;
  }

  async runTest(name, description, testFn) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`TEST: ${name}`);
    console.log(`${description}`);
    console.log('='.repeat(80));

    const startTime = Date.now();
    let result;

    try {
      result = await testFn();
      const duration = Date.now() - startTime;

      if (result.success) {
        this.passed++;
        console.log(`\n✅ PASS (${duration}ms)`);
      } else {
        this.failed++;
        console.log(`\n❌ FAIL (${duration}ms)`);
        if (result.error) {
          console.log(`   Error: ${result.error}`);
        }
      }

      if (result.warnings && result.warnings.length > 0) {
        this.warnings += result.warnings.length;
      }

      this.tests.push({
        name,
        description,
        success: result.success,
        duration,
        details: result
      });

      return result;

    } catch (error) {
      this.failed++;
      const duration = Date.now() - startTime;

      console.log(`\n❌ FAIL (${duration}ms)`);
      console.log(`   Exception: ${error.message}`);

      this.tests.push({
        name,
        description,
        success: false,
        duration,
        error: error.message,
        stack: error.stack
      });

      return { success: false, error: error.message };
    }
  }

  printSummary() {
    console.log(`\n${'='.repeat(80)}`);
    console.log('📊 TEST SUITE SUMMARY');
    console.log('='.repeat(80));

    console.log(`\nTotal Tests:     ${this.tests.length}`);
    console.log(`Passed:          ${this.passed} ✅`);
    console.log(`Failed:          ${this.failed} ❌`);
    console.log(`Warnings:        ${this.warnings} ⚠️`);

    const passRate = ((this.passed / this.tests.length) * 100).toFixed(1);
    console.log(`\nPass Rate:       ${passRate}%`);

    if (this.failed === 0) {
      console.log('\n✅ ALL TESTS PASSED - Migration ready for deployment');
    } else if (this.failed <= 1 && this.warnings === 0) {
      console.log('\n⚠️  MOSTLY PASSING - Review failed tests before deployment');
    } else {
      console.log('\n❌ TESTS FAILED - Fix issues before proceeding with migration');
    }

    console.log('\n' + '='.repeat(80));

    return {
      total: this.tests.length,
      passed: this.passed,
      failed: this.failed,
      warnings: this.warnings,
      passRate: parseFloat(passRate)
    };
  }

  saveReport() {
    const reportPath = path.join(NEW_SYSTEM_PATH, 'migration', `test-report-${Date.now()}.json`);

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.tests.length,
        passed: this.passed,
        failed: this.failed,
        warnings: this.warnings,
        passRate: ((this.passed / this.tests.length) * 100).toFixed(1)
      },
      tests: this.tests
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    console.log(`\n📄 Test report saved to: ${reportPath}\n`);

    return reportPath;
  }
}

/**
 * Test 1: Export AI Profile
 */
async function testExportProfile() {
  const result = exportAIMonitorAsProfile();

  if (!result.success) {
    return { success: false, error: result.error };
  }

  // Verify file was created
  if (!fs.existsSync(PROFILE_PATH)) {
    return { success: false, error: 'Profile file was not created' };
  }

  // Verify file is valid JSON
  try {
    const content = fs.readFileSync(PROFILE_PATH, 'utf8');
    const profile = JSON.parse(content);

    if (!profile.profile) {
      return { success: false, error: 'Profile missing root "profile" object' };
    }

    return {
      success: true,
      profileId: profile.profile.id,
      companies: result.stats.companies,
      urls: result.stats.totalUrls
    };

  } catch (error) {
    return { success: false, error: `JSON parsing failed: ${error.message}` };
  }
}

/**
 * Test 2: Validate Profile Schema
 */
async function testValidateProfile() {
  if (!fs.existsSync(PROFILE_PATH)) {
    return { success: false, error: 'Profile file does not exist. Run Test 1 first.' };
  }

  try {
    const content = fs.readFileSync(PROFILE_PATH, 'utf8');
    const profile = JSON.parse(content);

    const validation = validateProfile(profile, 'ai-competitors.json');

    return {
      success: validation.valid,
      errors: validation.errors,
      warnings: validation.warnings,
      errorCount: validation.errors.length,
      warningCount: validation.warnings.length
    };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Test 3: Load Profile Structure
 */
async function testLoadProfile() {
  if (!fs.existsSync(PROFILE_PATH)) {
    return { success: false, error: 'Profile file does not exist' };
  }

  try {
    const content = fs.readFileSync(PROFILE_PATH, 'utf8');
    const profile = JSON.parse(content);

    const p = profile.profile;

    // Check all required fields
    const requiredFields = ['id', 'name', 'domain', 'competitors', 'importanceBands'];
    const missing = requiredFields.filter(field => !(field in p));

    if (missing.length > 0) {
      return { success: false, error: `Missing required fields: ${missing.join(', ')}` };
    }

    // Verify structure
    const checks = {
      hasCompetitors: Array.isArray(p.competitors) && p.competitors.length > 0,
      hasImportanceBands: Array.isArray(p.importanceBands) && p.importanceBands.length > 0,
      hasKeywords: p.domainKeywords && p.domainKeywords.high && p.domainKeywords.medium,
      hasPageWeights: p.pageWeights && typeof p.pageWeights === 'object'
    };

    const allPassed = Object.values(checks).every(v => v === true);

    return {
      success: allPassed,
      checks,
      competitors: p.competitors.length,
      importanceBands: p.importanceBands.length
    };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Test 4: Verify Data Completeness
 */
async function testDataCompleteness() {
  if (!fs.existsSync(PROFILE_PATH)) {
    return { success: false, error: 'Profile file does not exist' };
  }

  try {
    const content = fs.readFileSync(PROFILE_PATH, 'utf8');
    const profile = JSON.parse(content);
    const p = profile.profile;

    const stats = {
      totalCompetitors: p.competitors.length,
      totalUrls: 0,
      urlTypes: {},
      competitorsWithKeywords: 0,
      emptyUrlArrays: 0
    };

    p.competitors.forEach(comp => {
      if (comp.urls && comp.urls.length > 0) {
        stats.totalUrls += comp.urls.length;

        comp.urls.forEach(url => {
          stats.urlTypes[url.type] = (stats.urlTypes[url.type] || 0) + 1;
        });
      } else {
        stats.emptyUrlArrays++;
      }

      if (comp.keywords && comp.keywords.length > 0) {
        stats.competitorsWithKeywords++;
      }
    });

    // Check importance bands coverage
    const coverage = new Set();
    p.importanceBands.forEach(band => {
      for (let i = band.min; i <= band.max; i++) {
        coverage.add(i);
      }
    });

    const fullCoverage = coverage.size === 11; // 0-10 inclusive
    stats.importanceBandsCoverage = coverage.size;
    stats.fullCoverage = fullCoverage;

    const issues = [];

    if (stats.emptyUrlArrays > 0) {
      issues.push(`${stats.emptyUrlArrays} competitors have no URLs`);
    }

    if (!fullCoverage) {
      issues.push(`Importance bands do not cover full 0-10 range (coverage: ${coverage.size}/11)`);
    }

    if (stats.totalUrls === 0) {
      issues.push('No URLs defined in any competitor');
    }

    return {
      success: issues.length === 0,
      stats,
      issues,
      warnings: issues
    };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Test 5: Compare Old vs New Systems
 */
async function testSystemComparison() {
  console.log('\nRunning system comparison (this may take a few minutes)...\n');

  try {
    const comparisonResult = await compareResults(3); // Test 3 URLs

    const successRate = parseFloat(comparisonResult.summary.successRate);

    return {
      success: successRate >= 60, // At least 60% match rate
      successRate: successRate,
      tested: comparisonResult.summary.tested,
      matched: comparisonResult.summary.matched,
      warnings: successRate < 80 ? ['Success rate below 80%'] : []
    };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Test 6: URL Accessibility (Optional - slower)
 */
async function testUrlAccessibility() {
  if (!fs.existsSync(PROFILE_PATH)) {
    return { success: false, error: 'Profile file does not exist' };
  }

  try {
    const content = fs.readFileSync(PROFILE_PATH, 'utf8');
    const profile = JSON.parse(content);

    console.log('\nTesting URL accessibility (this will take several minutes)...\n');

    const accessibilityResult = await testURLAccessibility(profile);

    const successRate = (accessibilityResult.accessible / accessibilityResult.total) * 100;

    return {
      success: successRate >= 70, // At least 70% accessible
      total: accessibilityResult.total,
      accessible: accessibilityResult.accessible,
      failed: accessibilityResult.failed,
      successRate: successRate.toFixed(1),
      warnings: successRate < 90 ? [`${accessibilityResult.failed} URLs are not accessible`] : []
    };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Main test suite
 */
async function runMigrationTests(fullTest = false) {
  console.log('\n🧪 MIGRATION TEST SUITE');
  console.log('Testing migration from AI Competitive Monitor to Generic Framework\n');

  const runner = new TestRunner();

  // Core tests (always run)
  await runner.runTest(
    'Test 1: Export AI Profile',
    'Convert old system configuration to new profile format',
    testExportProfile
  );

  await runner.runTest(
    'Test 2: Validate Profile Schema',
    'Ensure profile conforms to schema requirements',
    testValidateProfile
  );

  await runner.runTest(
    'Test 3: Load Profile Structure',
    'Verify profile can be loaded and has required structure',
    testLoadProfile
  );

  await runner.runTest(
    'Test 4: Verify Data Completeness',
    'Check that all data from old system is present in new profile',
    testDataCompleteness
  );

  await runner.runTest(
    'Test 5: Compare Old vs New Systems',
    'Side-by-side comparison of monitoring results',
    testSystemComparison
  );

  // Optional full test
  if (fullTest) {
    await runner.runTest(
      'Test 6: URL Accessibility',
      'Verify all profile URLs are accessible',
      testUrlAccessibility
    );
  } else {
    console.log('\n⏭️  Skipping URL accessibility test (use --full flag to include)');
  }

  // Print summary and save report
  const summary = runner.printSummary();
  const reportPath = runner.saveReport();

  // Exit with appropriate code
  process.exit(summary.failed === 0 ? 0 : 1);
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const fullTest = process.argv.includes('--full');
  runMigrationTests(fullTest);
}

export { runMigrationTests, TestRunner };
