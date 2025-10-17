/**
 * Validate Profile Against Schema
 * Ensures exported profiles conform to the profile schema
 *
 * Usage: node migration/validate-profile.js <profile-filename>
 * Example: node migration/validate-profile.js ai-competitors.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const NEW_SYSTEM_PATH = '/Users/sethredmore/generic-web-monitor';
const SCHEMA_PATH = path.join(NEW_SYSTEM_PATH, 'profiles/schemas/profile-schema.json');
const PROFILES_DIR = path.join(NEW_SYSTEM_PATH, 'profiles/examples');

/**
 * Validate a value against JSON Schema type
 */
function validateType(value, type, fieldPath) {
  const errors = [];

  if (type === 'string' && typeof value !== 'string') {
    errors.push(`${fieldPath}: Expected string, got ${typeof value}`);
  } else if (type === 'integer' && !Number.isInteger(value)) {
    errors.push(`${fieldPath}: Expected integer, got ${typeof value}`);
  } else if (type === 'number' && typeof value !== 'number') {
    errors.push(`${fieldPath}: Expected number, got ${typeof value}`);
  } else if (type === 'boolean' && typeof value !== 'boolean') {
    errors.push(`${fieldPath}: Expected boolean, got ${typeof value}`);
  } else if (type === 'array' && !Array.isArray(value)) {
    errors.push(`${fieldPath}: Expected array, got ${typeof value}`);
  } else if (type === 'object' && (typeof value !== 'object' || Array.isArray(value) || value === null)) {
    errors.push(`${fieldPath}: Expected object, got ${typeof value}`);
  }

  return errors;
}

/**
 * Validate required fields
 */
function validateRequired(obj, required, fieldPath) {
  const errors = [];

  if (!required) return errors;

  required.forEach(field => {
    if (!(field in obj)) {
      errors.push(`${fieldPath}: Missing required field '${field}'`);
    }
  });

  return errors;
}

/**
 * Validate enum values
 */
function validateEnum(value, enumValues, fieldPath) {
  const errors = [];

  if (enumValues && !enumValues.includes(value)) {
    errors.push(`${fieldPath}: Value '${value}' not in allowed values: ${enumValues.join(', ')}`);
  }

  return errors;
}

/**
 * Validate URL format
 */
function validateURL(url, fieldPath) {
  const errors = [];

  try {
    new URL(url);
  } catch (e) {
    errors.push(`${fieldPath}: Invalid URL format: ${url}`);
  }

  return errors;
}

/**
 * Validate profile against schema
 */
function validateProfile(profile, profilePath) {
  console.log('\n🔍 PROFILE VALIDATION\n');
  console.log('='.repeat(60));

  const errors = [];
  const warnings = [];

  // Load schema
  let schema;
  try {
    const schemaContent = fs.readFileSync(SCHEMA_PATH, 'utf8');
    schema = JSON.parse(schemaContent);
  } catch (error) {
    errors.push(`Failed to load schema: ${error.message}`);
    return { valid: false, errors, warnings };
  }

  // Check top-level structure
  if (!profile.profile) {
    errors.push('Profile must have a "profile" root object');
    return { valid: false, errors, warnings };
  }

  const p = profile.profile;

  // Validate required fields
  const schemaProps = schema.properties.profile;
  errors.push(...validateRequired(p, schemaProps.required, 'profile'));

  // Validate profile.id
  if (p.id !== undefined) {
    errors.push(...validateType(p.id, 'string', 'profile.id'));
    if (typeof p.id === 'string' && p.id.trim() === '') {
      errors.push('profile.id: Cannot be empty');
    }
  }

  // Validate profile.name
  if (p.name !== undefined) {
    errors.push(...validateType(p.name, 'string', 'profile.name'));
  }

  // Validate profile.domain
  if (p.domain !== undefined) {
    errors.push(...validateType(p.domain, 'string', 'profile.domain'));
  }

  // Validate profile.description
  if (p.description !== undefined) {
    errors.push(...validateType(p.description, 'string', 'profile.description'));
  }

  // Extract allowed URL types from schema
  let allowedTypes = ['homepage', 'products', 'pricing', 'blog', 'news', 'docs']; // Default fallback
  try {
    const urlTypeEnum = schema.properties.profile.properties.competitors.items.properties.urls.items.properties.type.enum;
    if (urlTypeEnum && Array.isArray(urlTypeEnum)) {
      allowedTypes = urlTypeEnum;
    }
  } catch (e) {
    warnings.push('Could not extract URL types from schema, using defaults');
  }

  // Validate competitors array
  if (p.competitors !== undefined) {
    errors.push(...validateType(p.competitors, 'array', 'profile.competitors'));

    if (Array.isArray(p.competitors)) {
      p.competitors.forEach((comp, idx) => {
        const compPath = `profile.competitors[${idx}]`;

        errors.push(...validateRequired(comp, ['name', 'urls'], compPath));
        errors.push(...validateType(comp.name, 'string', `${compPath}.name`));
        errors.push(...validateType(comp.urls, 'array', `${compPath}.urls`));

        if (Array.isArray(comp.urls)) {
          comp.urls.forEach((url, urlIdx) => {
            const urlPath = `${compPath}.urls[${urlIdx}]`;

            errors.push(...validateRequired(url, ['url', 'type'], urlPath));
            errors.push(...validateType(url.url, 'string', `${urlPath}.url`));
            errors.push(...validateType(url.type, 'string', `${urlPath}.type`));

            // Validate URL format
            if (typeof url.url === 'string') {
              errors.push(...validateURL(url.url, `${urlPath}.url`));
            }

            // Validate type enum (now using schema-extracted values)
            if (typeof url.type === 'string') {
              errors.push(...validateEnum(url.type, allowedTypes, `${urlPath}.type`));
            }
          });
        }

        // Validate optional keywords
        if (comp.keywords !== undefined) {
          errors.push(...validateType(comp.keywords, 'array', `${compPath}.keywords`));
        }
      });
    }
  }

  // Validate importanceBands array
  if (p.importanceBands !== undefined) {
    errors.push(...validateType(p.importanceBands, 'array', 'profile.importanceBands'));

    if (Array.isArray(p.importanceBands)) {
      p.importanceBands.forEach((band, idx) => {
        const bandPath = `profile.importanceBands[${idx}]`;

        errors.push(...validateRequired(band, ['min', 'max', 'label', 'description', 'examples'], bandPath));
        errors.push(...validateType(band.min, 'integer', `${bandPath}.min`));
        errors.push(...validateType(band.max, 'integer', `${bandPath}.max`));
        errors.push(...validateType(band.label, 'string', `${bandPath}.label`));
        errors.push(...validateType(band.description, 'string', `${bandPath}.description`));
        errors.push(...validateType(band.examples, 'array', `${bandPath}.examples`));

        // Validate min/max ranges
        if (Number.isInteger(band.min) && (band.min < 0 || band.min > 10)) {
          errors.push(`${bandPath}.min: Must be between 0 and 10, got ${band.min}`);
        }
        if (Number.isInteger(band.max) && (band.max < 0 || band.max > 10)) {
          errors.push(`${bandPath}.max: Must be between 0 and 10, got ${band.max}`);
        }
        if (Number.isInteger(band.min) && Number.isInteger(band.max) && band.min > band.max) {
          errors.push(`${bandPath}: min (${band.min}) cannot be greater than max (${band.max})`);
        }
      });

      // Check for coverage of 0-10 range
      const coverage = new Set();
      p.importanceBands.forEach(band => {
        if (Number.isInteger(band.min) && Number.isInteger(band.max)) {
          for (let i = band.min; i <= band.max; i++) {
            coverage.add(i);
          }
        }
      });

      for (let i = 0; i <= 10; i++) {
        if (!coverage.has(i)) {
          warnings.push(`Importance bands: Score ${i} is not covered by any band`);
        }
      }
    }
  }

  // Validate domainKeywords
  if (p.domainKeywords !== undefined) {
    errors.push(...validateType(p.domainKeywords, 'object', 'profile.domainKeywords'));

    if (typeof p.domainKeywords === 'object' && p.domainKeywords !== null) {
      errors.push(...validateRequired(p.domainKeywords, ['high', 'medium', 'low'], 'profile.domainKeywords'));
      errors.push(...validateType(p.domainKeywords.high, 'array', 'profile.domainKeywords.high'));
      errors.push(...validateType(p.domainKeywords.medium, 'array', 'profile.domainKeywords.medium'));
      errors.push(...validateType(p.domainKeywords.low, 'array', 'profile.domainKeywords.low'));
    }
  }

  // Validate status enum
  if (p.status !== undefined) {
    const allowedStatuses = ['active', 'paused', 'archived'];
    errors.push(...validateEnum(p.status, allowedStatuses, 'profile.status'));
  }

  // Additional validation checks
  if (p.competitors && Array.isArray(p.competitors) && p.competitors.length === 0) {
    warnings.push('Profile has no competitors defined');
  }

  // Print results
  console.log(`Profile: ${profilePath}`);
  console.log(`Name:    ${p.name || 'N/A'}`);
  console.log(`Domain:  ${p.domain || 'N/A'}`);
  console.log(`Status:  ${p.status || 'N/A'}`);

  console.log('\n📊 VALIDATION RESULTS:');
  console.log('-'.repeat(60));

  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ VALID - No errors or warnings');
  } else {
    if (errors.length > 0) {
      console.log(`\n❌ ERRORS (${errors.length}):`);
      errors.forEach((err, idx) => {
        console.log(`  ${idx + 1}. ${err}`);
      });
    }

    if (warnings.length > 0) {
      console.log(`\n⚠️  WARNINGS (${warnings.length}):`);
      warnings.forEach((warn, idx) => {
        console.log(`  ${idx + 1}. ${warn}`);
      });
    }
  }

  console.log('\n' + '='.repeat(60));

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Test URL accessibility
 */
async function testURLAccessibility(profile) {
  console.log('\n🌐 URL ACCESSIBILITY TEST\n');
  console.log('='.repeat(60));

  const results = {
    total: 0,
    accessible: 0,
    failed: 0,
    details: []
  };

  if (!profile.profile || !profile.profile.competitors) {
    console.log('⚠️  No competitors to test');
    return results;
  }

  for (const comp of profile.profile.competitors) {
    for (const urlObj of comp.urls) {
      results.total++;

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(urlObj.url, {
          method: 'HEAD',
          signal: controller.signal,
          redirect: 'follow'
        });

        clearTimeout(timeout);

        const accessible = response.ok;
        if (accessible) {
          results.accessible++;
        } else {
          results.failed++;
        }

        results.details.push({
          company: comp.name,
          url: urlObj.url,
          type: urlObj.type,
          status: response.status,
          accessible: accessible
        });

        console.log(`${accessible ? '✅' : '❌'} ${comp.name.padEnd(25)} ${urlObj.type.padEnd(10)} ${response.status} ${urlObj.url}`);

      } catch (error) {
        results.failed++;
        results.details.push({
          company: comp.name,
          url: urlObj.url,
          type: urlObj.type,
          error: error.message,
          accessible: false
        });

        console.log(`❌ ${comp.name.padEnd(25)} ${urlObj.type.padEnd(10)} ERROR ${urlObj.url}`);
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  console.log('\n📊 ACCESSIBILITY SUMMARY:');
  console.log('-'.repeat(60));
  console.log(`Total URLs:     ${results.total}`);
  console.log(`Accessible:     ${results.accessible} (${((results.accessible / results.total) * 100).toFixed(1)}%)`);
  console.log(`Failed:         ${results.failed} (${((results.failed / results.total) * 100).toFixed(1)}%)`);

  console.log('\n' + '='.repeat(60));

  return results;
}

/**
 * Main validation function
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node validate-profile.js <profile-filename>');
    console.log('Example: node validate-profile.js ai-competitors.json');
    process.exit(1);
  }

  const profileFilename = args[0];
  const profilePath = path.join(PROFILES_DIR, profileFilename);

  if (!fs.existsSync(profilePath)) {
    console.error(`❌ Profile not found: ${profilePath}`);
    process.exit(1);
  }

  try {
    const profileContent = fs.readFileSync(profilePath, 'utf8');
    const profile = JSON.parse(profileContent);

    // Schema validation
    const schemaResult = validateProfile(profile, profileFilename);

    // URL accessibility test (optional)
    const testUrls = args.includes('--test-urls');
    let accessibilityResult = null;

    if (testUrls) {
      accessibilityResult = await testURLAccessibility(profile);
    }

    // Generate validation report
    const reportPath = path.join(NEW_SYSTEM_PATH, 'migration', `validation-report-${Date.now()}.json`);
    const report = {
      profilePath: profilePath,
      timestamp: new Date().toISOString(),
      schemaValidation: schemaResult,
      urlAccessibility: accessibilityResult
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    console.log(`\n📄 Validation report saved to: ${reportPath}\n`);

    process.exit(schemaResult.valid ? 0 : 1);

  } catch (error) {
    console.error(`\n❌ Validation failed: ${error.message}\n`);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { validateProfile, testURLAccessibility };
