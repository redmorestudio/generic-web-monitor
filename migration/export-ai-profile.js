/**
 * Export AI Competitor Monitor as Generic Profile
 * Converts existing AI monitoring system to new profile-based framework
 *
 * Usage: node migration/export-ai-profile.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const OLD_SYSTEM_PATH = '/Users/sethredmore/ai-competitive-monitor-correct';
const NEW_SYSTEM_PATH = '/Users/sethredmore/generic-web-monitor';
const OUTPUT_PATH = path.join(NEW_SYSTEM_PATH, 'profiles/examples/ai-competitors.json');

/**
 * Generate UUID v4
 */
function generateUUID() {
  return crypto.randomUUID();
}

/**
 * Load and parse CompanyConfigComplete.js from old system
 */
function loadOldSystemConfig() {
  console.log('📂 Loading old system configuration...');

  const configPath = path.join(OLD_SYSTEM_PATH, 'CompanyConfigComplete.js');

  if (!fs.existsSync(configPath)) {
    throw new Error(`Configuration file not found: ${configPath}`);
  }

  const configContent = fs.readFileSync(configPath, 'utf8');

  // Extract COMPLETE_MONITOR_CONFIG array from JavaScript file
  const configMatch = configContent.match(/const COMPLETE_MONITOR_CONFIG = (\[[\s\S]*?\]);/);

  if (!configMatch) {
    throw new Error('Could not parse COMPLETE_MONITOR_CONFIG from file');
  }

  // Use eval in a safe context (we control the source)
  // In production, consider using a proper JS parser
  const COMPLETE_MONITOR_CONFIG = eval(configMatch[1]);

  console.log(`✅ Loaded ${COMPLETE_MONITOR_CONFIG.length} companies`);
  return COMPLETE_MONITOR_CONFIG;
}

/**
 * Load keywords from IntelligentMonitor.js
 */
function loadKeywordsConfig() {
  console.log('📂 Loading keyword configuration...');

  const monitorPath = path.join(OLD_SYSTEM_PATH, 'IntelligentMonitor.js');

  if (!fs.existsSync(monitorPath)) {
    console.warn('⚠️  IntelligentMonitor.js not found, using defaults');
    return getDefaultKeywords();
  }

  const monitorContent = fs.readFileSync(monitorPath, 'utf8');

  // Extract keywords configuration
  const keywordsMatch = monitorContent.match(/keywords:\s*\{[\s\S]*?high:\s*(\[[\s\S]*?\]),[\s\S]*?medium:\s*(\[[\s\S]*?\]),[\s\S]*?low:\s*(\[[\s\S]*?\])/);

  if (!keywordsMatch) {
    console.warn('⚠️  Could not parse keywords, using defaults');
    return getDefaultKeywords();
  }

  const keywords = {
    high: eval(keywordsMatch[1]),
    medium: eval(keywordsMatch[2]),
    low: eval(keywordsMatch[3])
  };

  console.log(`✅ Loaded keywords: ${keywords.high.length} high, ${keywords.medium.length} medium, ${keywords.low.length} low`);
  return keywords;
}

/**
 * Load page weights from IntelligentMonitor.js
 */
function loadPageWeights() {
  console.log('📂 Loading page weights...');

  const monitorPath = path.join(OLD_SYSTEM_PATH, 'IntelligentMonitor.js');

  if (!fs.existsSync(monitorPath)) {
    console.warn('⚠️  IntelligentMonitor.js not found, using defaults');
    return getDefaultPageWeights();
  }

  const monitorContent = fs.readFileSync(monitorPath, 'utf8');

  // Extract page weights
  const weightsMatch = monitorContent.match(/pageWeights:\s*\{([\s\S]*?)\}/);

  if (!weightsMatch) {
    console.warn('⚠️  Could not parse page weights, using defaults');
    return getDefaultPageWeights();
  }

  // Parse the weights object
  const weightsStr = '{' + weightsMatch[1] + '}';
  const pageWeights = eval('(' + weightsStr + ')');

  console.log(`✅ Loaded ${Object.keys(pageWeights).length} page weight mappings`);
  return pageWeights;
}

/**
 * Default keywords if file not found
 */
function getDefaultKeywords() {
  return {
    high: ['price', 'pricing', 'launch', 'new', 'release', 'announce', 'available', 'introducing'],
    medium: ['feature', 'update', 'improve', 'enhance', 'api', 'model', 'performance', 'capability'],
    low: ['fix', 'patch', 'minor', 'small', 'tweak', 'adjust']
  };
}

/**
 * Default page weights if file not found
 */
function getDefaultPageWeights() {
  return {
    'homepage': 0.8,
    'index': 0.8,
    'home': 0.8,
    'news': 1.2,
    'blog': 1.2,
    'updates': 1.2,
    'technology': 1.5,
    'features': 1.5,
    'products': 1.5,
    'pricing': 2.0,
    'announcement': 2.0
  };
}

/**
 * Define importance bands for AI domain
 */
function getAIImportanceBands() {
  return [
    {
      min: 9,
      max: 10,
      label: "Critical",
      description: "New model releases, major pricing changes, strategic pivots, acquisitions",
      examples: [
        "GPT-5 launch announcement",
        "Major pricing overhaul (e.g., 50% price reduction)",
        "Company acquisition or merger",
        "Strategic pivot announcement",
        "Major partnership (e.g., Google + Anthropic collaboration)",
        "Breakthrough capability announcement"
      ]
    },
    {
      min: 7,
      max: 8,
      label: "Important",
      description: "New features, API updates, significant partnerships, model improvements",
      examples: [
        "New API endpoint release",
        "Major partnership announcement",
        "New feature launch (e.g., vision, voice, multimodal)",
        "Model performance improvement (20%+ better)",
        "Enterprise tier announcement",
        "New model variant (e.g., Claude 3 Opus)",
        "Security/compliance certification"
      ]
    },
    {
      min: 5,
      max: 6,
      label: "Moderate",
      description: "Documentation updates, blog posts, minor features, webinars",
      examples: [
        "Technical blog post or case study",
        "Documentation expansion or reorganization",
        "Minor feature addition",
        "Webinar or conference announcement",
        "Case study publication",
        "Developer tool update",
        "Community event"
      ]
    },
    {
      min: 3,
      max: 4,
      label: "Low",
      description: "Bug fixes, maintenance announcements, minor updates",
      examples: [
        "Bug fix announcement",
        "Scheduled maintenance notice",
        "Minor API update or deprecation",
        "Status page update",
        "Library version bump",
        "Minor UI improvements"
      ]
    },
    {
      min: 1,
      max: 2,
      label: "Minimal",
      description: "Website tweaks, minor content changes, routine updates",
      examples: [
        "Homepage content refresh",
        "Minor copy changes",
        "FAQ update",
        "Social media link additions",
        "Footer updates"
      ]
    },
    {
      min: 0,
      max: 0,
      label: "Trivial",
      description: "Typos, formatting, inconsequential changes",
      examples: [
        "Typo correction",
        "Copyright year update",
        "Minor formatting adjustment",
        "Image optimization",
        "Whitespace changes"
      ]
    }
  ];
}

/**
 * Export AI monitor configuration as new profile
 */
function exportAIMonitorAsProfile() {
  console.log('\n🚀 AI MONITOR EXPORT TO PROFILE\n');
  console.log('=' .repeat(60));

  try {
    // Load configurations from old system
    const companies = loadOldSystemConfig();
    const keywords = loadKeywordsConfig();
    const pageWeights = loadPageWeights();

    // Convert to new profile format
    const profile = {
      id: generateUUID(),
      name: "AI Competitors Monitor",
      domain: "ai-technology",
      description: "Monitor AI companies for product launches, pricing changes, model releases, and strategic moves. Covers major LLM providers, coding assistants, video/image AI, and enterprise AI platforms.",

      competitors: companies.map(company => ({
        name: company.company,
        urls: company.urls.map(u => ({
          url: u.url,
          type: u.type
        })),
        keywords: ["ai", "ml", "model", "api", "assistant", "agent", "llm", "neural"]
      })),

      importanceBands: getAIImportanceBands(),

      contentTypes: [
        "homepage",
        "products",
        "pricing",
        "blog",
        "news",
        "docs",
        "api",
        "features",
        "technology",
        "about"
      ],

      pageWeights: pageWeights,

      domainKeywords: {
        high: keywords.high,
        medium: keywords.medium,
        low: keywords.low
      },

      analysisPromptTemplate: "templates/ai-technology-analysis.txt",

      discovery: {
        enabled: false,
        autoExpand: false,
        seedCompetitors: ["OpenAI", "Anthropic", "Google DeepMind"],
        maxCompetitors: 20
      },

      created: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      status: "active"
    };

    // Wrap in profile object for schema compliance
    const profileDocument = {
      profile: profile
    };

    // Statistics
    const totalUrls = profile.competitors.reduce((sum, c) => sum + c.urls.length, 0);
    const urlTypes = {};
    profile.competitors.forEach(c => {
      c.urls.forEach(u => {
        urlTypes[u.type] = (urlTypes[u.type] || 0) + 1;
      });
    });

    console.log('\n📊 EXPORT STATISTICS:');
    console.log('-'.repeat(60));
    console.log(`Profile ID:        ${profile.id}`);
    console.log(`Profile Name:      ${profile.name}`);
    console.log(`Domain:            ${profile.domain}`);
    console.log(`Companies:         ${profile.competitors.length}`);
    console.log(`Total URLs:        ${totalUrls}`);
    console.log(`Avg URLs/Company:  ${(totalUrls / profile.competitors.length).toFixed(1)}`);
    console.log(`Importance Bands:  ${profile.importanceBands.length}`);
    console.log(`Content Types:     ${profile.contentTypes.length}`);
    console.log(`Page Weights:      ${Object.keys(profile.pageWeights).length}`);
    console.log(`\nURL Type Distribution:`);
    Object.entries(urlTypes).forEach(([type, count]) => {
      const pct = ((count / totalUrls) * 100).toFixed(1);
      console.log(`  ${type.padEnd(12)} ${count.toString().padStart(3)} (${pct}%)`);
    });

    // Save to file
    console.log('\n💾 SAVING PROFILE:');
    console.log('-'.repeat(60));

    // Ensure directory exists
    const outputDir = path.dirname(OUTPUT_PATH);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(profileDocument, null, 2), 'utf8');
    console.log(`✅ Profile saved to: ${OUTPUT_PATH}`);

    // Validate against schema if available
    const schemaPath = path.join(NEW_SYSTEM_PATH, 'profiles/schemas/profile-schema.json');
    if (fs.existsSync(schemaPath)) {
      console.log('\n✓ Schema validation available');
      console.log('  Run: node migration/validate-profile.js ai-competitors.json');
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ EXPORT COMPLETE\n');

    return {
      success: true,
      profile: profile,
      outputPath: OUTPUT_PATH,
      stats: {
        companies: profile.competitors.length,
        totalUrls: totalUrls,
        importanceBands: profile.importanceBands.length
      }
    };

  } catch (error) {
    console.error('\n❌ EXPORT FAILED:');
    console.error(error.message);
    console.error(error.stack);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run export if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  exportAIMonitorAsProfile();
}

export { exportAIMonitorAsProfile };
