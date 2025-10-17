/**
 * Compare Results Between Old and New Systems
 * Side-by-side comparison to validate migration correctness
 *
 * Usage: node migration/compare-results.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OLD_SYSTEM_PATH = '/Users/sethredmore/ai-competitive-monitor-correct';
const NEW_SYSTEM_PATH = '/Users/sethredmore/generic-web-monitor';

/**
 * Fetch URL content with timeout
 */
async function fetchWithTimeout(url, timeoutMs = 10000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WebMonitor/1.0)'
      }
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const text = await response.text();
    return { success: true, content: text, status: response.status };

  } catch (error) {
    clearTimeout(timeout);
    return { success: false, error: error.message };
  }
}

/**
 * Extract text content from HTML
 */
function extractTextFromHtml(html) {
  // Remove scripts, styles, navigation, headers, footers
  let text = html;
  text = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  text = text.replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '');
  text = text.replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, '');
  text = text.replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '');
  text = text.replace(/<[^>]+>/g, ' ');

  // Decode HTML entities
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");

  // Normalize whitespace
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

/**
 * Compute content hash
 */
function computeHash(content) {
  return crypto.createHash('md5').update(content).digest('hex');
}

/**
 * Analyze content for keywords (old system logic)
 */
function analyzeContentOldSystem(content) {
  const keywords = {
    high: ['price', 'pricing', 'launch', 'new', 'release', 'announce', 'available', 'introducing'],
    medium: ['feature', 'update', 'improve', 'enhance', 'api', 'model', 'performance', 'capability'],
    low: ['fix', 'patch', 'minor', 'small', 'tweak', 'adjust']
  };

  const found = {
    high: [],
    medium: [],
    low: []
  };

  const contentLower = content.toLowerCase();

  Object.keys(keywords).forEach(priority => {
    keywords[priority].forEach(keyword => {
      if (contentLower.includes(keyword)) {
        found[priority].push(keyword);
      }
    });
  });

  return found;
}

/**
 * Calculate relevance score (old system logic)
 */
function calculateRelevanceScoreOldSystem(analysis, url) {
  let score = 5;

  // Boost for high priority keywords
  score += analysis.high.length * 2;

  // Boost for medium priority keywords
  score += analysis.medium.length * 1;

  // Reduce for low priority keywords
  score -= analysis.low.length * 0.5;

  // Page type weighting
  const pageWeights = {
    'pricing': 2.0,
    'announcement': 2.0,
    'technology': 1.5,
    'features': 1.5,
    'products': 1.5,
    'news': 1.2,
    'blog': 1.2,
    'homepage': 0.8
  };

  const urlLower = url.toLowerCase();
  for (const [type, weight] of Object.entries(pageWeights)) {
    if (urlLower.includes(type)) {
      score = Math.round(score * weight);
      break;
    }
  }

  // Clamp to 1-10
  return Math.max(1, Math.min(10, score));
}

/**
 * Process URL with old system logic
 */
async function processUrlOldSystem(company, url) {
  const result = await fetchWithTimeout(url);

  if (!result.success) {
    return {
      company,
      url,
      success: false,
      error: result.error
    };
  }

  const textContent = extractTextFromHtml(result.content);
  const contentHash = computeHash(textContent);
  const analysis = analyzeContentOldSystem(textContent);
  const relevanceScore = calculateRelevanceScoreOldSystem(analysis, url);

  return {
    company,
    url,
    success: true,
    contentHash,
    contentLength: textContent.length,
    analysis,
    relevanceScore
  };
}

/**
 * Process URL with new system logic
 */
async function processUrlNewSystem(company, url, profile) {
  const result = await fetchWithTimeout(url);

  if (!result.success) {
    return {
      company,
      url,
      success: false,
      error: result.error
    };
  }

  const textContent = extractTextFromHtml(result.content);
  const contentHash = computeHash(textContent);

  // Use profile keywords
  const keywords = profile.profile.domainKeywords || {
    high: [],
    medium: [],
    low: []
  };

  const analysis = {
    high: [],
    medium: [],
    low: []
  };

  const contentLower = textContent.toLowerCase();

  Object.keys(keywords).forEach(priority => {
    keywords[priority].forEach(keyword => {
      if (contentLower.includes(keyword)) {
        analysis[priority].push(keyword);
      }
    });
  });

  // Calculate score using profile page weights
  let score = 5;
  score += analysis.high.length * 2;
  score += analysis.medium.length * 1;
  score -= analysis.low.length * 0.5;

  // Apply profile page weights
  const pageWeights = profile.profile.pageWeights || {};
  const urlLower = url.toLowerCase();

  for (const [type, weight] of Object.entries(pageWeights)) {
    if (urlLower.includes(type)) {
      score = Math.round(score * weight);
      break;
    }
  }

  score = Math.max(1, Math.min(10, score));

  return {
    company,
    url,
    success: true,
    contentHash,
    contentLength: textContent.length,
    analysis,
    relevanceScore: score
  };
}

/**
 * Load AI profile from new system
 */
function loadAIProfile() {
  const profilePath = path.join(NEW_SYSTEM_PATH, 'profiles/examples/ai-competitors.json');

  if (!fs.existsSync(profilePath)) {
    throw new Error(`AI profile not found at: ${profilePath}. Run export-ai-profile.js first.`);
  }

  const profileContent = fs.readFileSync(profilePath, 'utf8');
  return JSON.parse(profileContent);
}

/**
 * Load companies from old system
 */
function loadOldSystemCompanies() {
  const configPath = path.join(OLD_SYSTEM_PATH, 'CompanyConfigComplete.js');

  if (!fs.existsSync(configPath)) {
    throw new Error(`Old system config not found: ${configPath}`);
  }

  const configContent = fs.readFileSync(configPath, 'utf8');
  const configMatch = configContent.match(/const COMPLETE_MONITOR_CONFIG = (\[[\s\S]*?\]);/);

  if (!configMatch) {
    throw new Error('Could not parse COMPLETE_MONITOR_CONFIG');
  }

  return eval(configMatch[1]);
}

/**
 * Compare results between systems
 */
async function compareResults(sampleSize = 5) {
  console.log('\n🔬 SYSTEM COMPARISON TEST\n');
  console.log('='.repeat(80));

  try {
    // Load configurations
    const oldCompanies = loadOldSystemCompanies();
    const newProfile = loadAIProfile();

    console.log(`Old System: ${oldCompanies.length} companies`);
    console.log(`New System: ${newProfile.profile.competitors.length} competitors`);

    // Select sample URLs to test
    const sampleUrls = [];
    const companiesCount = Math.min(sampleSize, oldCompanies.length);

    for (let i = 0; i < companiesCount; i++) {
      const company = oldCompanies[i];
      if (company.urls && company.urls.length > 0) {
        sampleUrls.push({
          company: company.company,
          url: company.urls[0].url,
          type: company.urls[0].type
        });
      }
    }

    console.log(`\nTesting ${sampleUrls.length} sample URLs...\n`);

    const results = {
      tested: 0,
      matched: 0,
      hashMismatch: 0,
      scoreDifference: 0,
      oldSystemErrors: 0,
      newSystemErrors: 0,
      details: []
    };

    // Test each URL with both systems
    for (const sample of sampleUrls) {
      console.log(`Testing: ${sample.company} - ${sample.url}`);

      const oldResult = await processUrlOldSystem(sample.company, sample.url);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting

      const newResult = await processUrlNewSystem(sample.company, sample.url, newProfile);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting

      results.tested++;

      const comparison = {
        company: sample.company,
        url: sample.url,
        type: sample.type,
        oldSystem: {
          success: oldResult.success,
          contentHash: oldResult.contentHash,
          relevanceScore: oldResult.relevanceScore,
          keywordsFound: oldResult.analysis
        },
        newSystem: {
          success: newResult.success,
          contentHash: newResult.contentHash,
          relevanceScore: newResult.relevanceScore,
          keywordsFound: newResult.analysis
        }
      };

      // Compare results
      if (oldResult.success && newResult.success) {
        const hashMatch = oldResult.contentHash === newResult.contentHash;
        const scoreMatch = Math.abs(oldResult.relevanceScore - newResult.relevanceScore) <= 1;

        comparison.hashMatch = hashMatch;
        comparison.scoreMatch = scoreMatch;
        comparison.scoreDelta = Math.abs(oldResult.relevanceScore - newResult.relevanceScore);

        if (hashMatch && scoreMatch) {
          results.matched++;
          console.log(`  ✅ MATCH - Hash: ${hashMatch}, Score: ${oldResult.relevanceScore} vs ${newResult.relevanceScore}`);
        } else {
          if (!hashMatch) {
            results.hashMismatch++;
            console.log(`  ⚠️  Hash mismatch (content may have changed between requests)`);
          }
          if (!scoreMatch) {
            results.scoreDifference++;
            console.log(`  ⚠️  Score difference: ${oldResult.relevanceScore} vs ${newResult.relevanceScore} (delta: ${comparison.scoreDelta})`);
          }
        }
      } else {
        if (!oldResult.success) {
          results.oldSystemErrors++;
          console.log(`  ❌ Old system error: ${oldResult.error}`);
        }
        if (!newResult.success) {
          results.newSystemErrors++;
          console.log(`  ❌ New system error: ${newResult.error}`);
        }
      }

      results.details.push(comparison);
      console.log('');
    }

    // Print summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 COMPARISON SUMMARY\n');
    console.log(`Total URLs Tested:       ${results.tested}`);
    console.log(`Perfect Matches:         ${results.matched} (${((results.matched / results.tested) * 100).toFixed(1)}%)`);
    console.log(`Hash Mismatches:         ${results.hashMismatch}`);
    console.log(`Score Differences:       ${results.scoreDifference}`);
    console.log(`Old System Errors:       ${results.oldSystemErrors}`);
    console.log(`New System Errors:       ${results.newSystemErrors}`);

    const successRate = ((results.matched / results.tested) * 100).toFixed(1);
    console.log(`\nSuccess Rate:            ${successRate}%`);

    if (parseFloat(successRate) >= 80) {
      console.log('\n✅ MIGRATION VALIDATION: PASS');
      console.log('   Systems show consistent behavior (≥80% match rate)');
    } else if (parseFloat(successRate) >= 60) {
      console.log('\n⚠️  MIGRATION VALIDATION: REVIEW NEEDED');
      console.log('   Moderate differences detected (60-80% match rate)');
    } else {
      console.log('\n❌ MIGRATION VALIDATION: FAIL');
      console.log('   Significant differences detected (<60% match rate)');
    }

    // Save detailed report
    const reportPath = path.join(NEW_SYSTEM_PATH, 'migration', `comparison-report-${Date.now()}.json`);
    const report = {
      timestamp: new Date().toISOString(),
      sampleSize: results.tested,
      summary: {
        tested: results.tested,
        matched: results.matched,
        hashMismatch: results.hashMismatch,
        scoreDifference: results.scoreDifference,
        oldSystemErrors: results.oldSystemErrors,
        newSystemErrors: results.newSystemErrors,
        successRate: successRate
      },
      details: results.details
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);

    console.log('\n' + '='.repeat(80) + '\n');

    return report;

  } catch (error) {
    console.error(`\n❌ Comparison failed: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const sampleSize = parseInt(process.argv[2]) || 5;
  compareResults(sampleSize);
}

export { compareResults };
