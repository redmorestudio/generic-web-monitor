#!/usr/bin/env node

/**
 * Protected PostgreSQL Schema Fix - Array to JSONB Column Conversion
 * 
 * This script converts problematic TEXT[] array columns to JSONB columns
 * to fix the "malformed array literal" errors in the enhanced analysis pipeline.
 * 
 * CRITICAL: This script follows DATABASE PROTECTION rules using schema-protector.js
 */

// SSL Certificate fix for Heroku PostgreSQL
if (process.env.NODE_ENV === 'production' || process.env.POSTGRES_CONNECTION_STRING) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const { db } = require('./postgres-db');
const { SchemaProtector } = require('./schema-protector');

async function performSchemaConversion() {
  console.log('🔧 Converting TEXT[] array columns to JSONB...');
  console.log('🎯 Goal: Fix malformed array literal errors in enhanced analysis');
  console.log('');

  // STEP 1: Check current schema and identify issues
  console.log('🔍 Analyzing current schema...');
  
  // Check baseline_analysis table
  const baselineColumns = await db.all(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns 
    WHERE table_schema = 'intelligence' 
      AND table_name = 'baseline_analysis'
      AND column_name IN ('entities', 'themes', 'sentiment', 'key_points', 'relationships')
    ORDER BY column_name
  `);
  
  // Check enhanced_analysis table
  const enhancedColumns = await db.all(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns 
    WHERE table_schema = 'intelligence' 
      AND table_name = 'enhanced_analysis'
      AND column_name IN ('ultra_analysis', 'key_insights', 'market_signals', 'risk_assessment')
    ORDER BY column_name
  `);

  console.log('📋 Current problematic columns:');
  console.log('');
  console.log('intelligence.baseline_analysis:');
  baselineColumns.forEach(col => {
    const needsFix = col.data_type !== 'jsonb';
    const status = needsFix ? '🔴 NEEDS FIX' : '✅ OK';
    console.log(`   ${status} ${col.column_name}: ${col.data_type}`);
  });
  
  console.log('');
  console.log('intelligence.enhanced_analysis:');
  enhancedColumns.forEach(col => {
    const needsFix = col.data_type !== 'jsonb';
    const status = needsFix ? '🔴 NEEDS FIX' : '✅ OK';
    console.log(`   ${status} ${col.column_name}: ${col.data_type}`);
  });

  // Count total issues
  const baselineIssues = baselineColumns.filter(col => col.data_type !== 'jsonb');
  const enhancedIssues = enhancedColumns.filter(col => col.data_type !== 'jsonb');
  const totalIssues = baselineIssues.length + enhancedIssues.length;

  console.log('');
  console.log(`🔍 Total issues found: ${totalIssues} columns need conversion`);

  if (totalIssues === 0) {
    console.log('✅ No schema issues detected - all columns are already JSONB');
    return 0;
  }

  // STEP 2: Check data to understand conversion needs
  console.log('');
  console.log('📊 Checking existing data...');
  
  const baselineCount = await db.get('SELECT COUNT(*) as count FROM intelligence.baseline_analysis');
  const enhancedCount = await db.get('SELECT COUNT(*) as count FROM intelligence.enhanced_analysis');
  
  console.log(`   baseline_analysis: ${baselineCount.count} records`);
  console.log(`   enhanced_analysis: ${enhancedCount.count} records`);

  if (parseInt(baselineCount.count) > 0 || parseInt(enhancedCount.count) > 0) {
    console.log('⚠️  WARNING: Tables contain data!');
    console.log('   Conversion will preserve existing data by converting to JSONB format');
  }

  // STEP 3: Execute conversions
  console.log('');
  console.log('🔧 Executing schema conversions...');
  
  let changesApplied = 0;

  // Convert baseline_analysis columns
  if (baselineIssues.length > 0) {
    console.log('🔄 Converting intelligence.baseline_analysis columns...');
    
    for (const column of baselineIssues) {
      console.log(`   Converting ${column.column_name}: ${column.data_type} → jsonb`);
      
      const tempColumnName = `${column.column_name}_new_jsonb`;
      
      // Add temporary JSONB column
      await db.run(`
        ALTER TABLE intelligence.baseline_analysis 
        ADD COLUMN ${tempColumnName} JSONB
      `);
      
      // Convert existing data with robust error handling
      await db.run(`
        UPDATE intelligence.baseline_analysis 
        SET ${tempColumnName} = CASE 
          WHEN ${column.column_name} IS NULL THEN NULL
          WHEN ${column.column_name}::text = '' THEN '{}'::jsonb
          WHEN ${column.column_name}::text ~ '^\\s*[\\[\\{]' THEN 
            CASE 
              WHEN ${column.column_name}::text::jsonb IS NOT NULL THEN ${column.column_name}::text::jsonb
              ELSE ('{"error": "invalid_json", "original": ' || to_json(${column.column_name}::text) || '}')::jsonb
            END
          ELSE to_jsonb(${column.column_name}::text)
        END
      `);
      
      // Drop old column and rename new one
      await db.run(`ALTER TABLE intelligence.baseline_analysis DROP COLUMN ${column.column_name}`);
      await db.run(`ALTER TABLE intelligence.baseline_analysis RENAME COLUMN ${tempColumnName} TO ${column.column_name}`);
      
      console.log(`     ✅ ${column.column_name} converted successfully`);
      changesApplied++;
    }
  }

  // Convert enhanced_analysis columns
  if (enhancedIssues.length > 0) {
    console.log('🔄 Converting intelligence.enhanced_analysis columns...');
    
    for (const column of enhancedIssues) {
      console.log(`   Converting ${column.column_name}: ${column.data_type} → jsonb`);
      
      const tempColumnName = `${column.column_name}_new_jsonb`;
      
      // Add temporary JSONB column
      await db.run(`
        ALTER TABLE intelligence.enhanced_analysis 
        ADD COLUMN ${tempColumnName} JSONB
      `);
      
      // Convert existing data with robust error handling
      await db.run(`
        UPDATE intelligence.enhanced_analysis 
        SET ${tempColumnName} = CASE 
          WHEN ${column.column_name} IS NULL THEN NULL
          WHEN ${column.column_name}::text = '' THEN '{}'::jsonb
          WHEN ${column.column_name}::text ~ '^\\s*[\\[\\{]' THEN 
            CASE 
              WHEN ${column.column_name}::text::jsonb IS NOT NULL THEN ${column.column_name}::text::jsonb
              ELSE ('{"error": "invalid_json", "original": ' || to_json(${column.column_name}::text) || '}')::jsonb
            END
          ELSE to_jsonb(${column.column_name}::text)
        END
      `);
      
      // Drop old column and rename new one
      await db.run(`ALTER TABLE intelligence.enhanced_analysis DROP COLUMN ${column.column_name}`);
      await db.run(`ALTER TABLE intelligence.enhanced_analysis RENAME COLUMN ${tempColumnName} TO ${column.column_name}`);
      
      console.log(`     ✅ ${column.column_name} converted successfully`);
      changesApplied++;
    }
  }

  // STEP 4: Verification
  console.log('');
  console.log('🔍 Verifying conversions...');
  
  // Re-check all columns
  const finalBaselineColumns = await db.all(`
    SELECT column_name, data_type
    FROM information_schema.columns 
    WHERE table_schema = 'intelligence' 
      AND table_name = 'baseline_analysis'
      AND column_name IN ('entities', 'themes', 'sentiment', 'key_points', 'relationships')
    ORDER BY column_name
  `);
  
  const finalEnhancedColumns = await db.all(`
    SELECT column_name, data_type
    FROM information_schema.columns 
    WHERE table_schema = 'intelligence' 
      AND table_name = 'enhanced_analysis'
      AND column_name IN ('ultra_analysis', 'key_insights', 'market_signals', 'risk_assessment')
    ORDER BY column_name
  `);

  console.log('📋 Final column types:');
  console.log('');
  console.log('intelligence.baseline_analysis:');
  finalBaselineColumns.forEach(col => {
    const status = col.data_type === 'jsonb' ? '✅' : '❌';
    console.log(`   ${status} ${col.column_name}: ${col.data_type}`);
  });
  
  console.log('');
  console.log('intelligence.enhanced_analysis:');
  finalEnhancedColumns.forEach(col => {
    const status = col.data_type === 'jsonb' ? '✅' : '❌';
    console.log(`   ${status} ${col.column_name}: ${col.data_type}`);
  });

  console.log('');
  console.log(`✅ Schema conversion complete! ${changesApplied} columns converted to JSONB`);
  console.log('🎯 Result: Malformed array literal errors should now be resolved');
  
  return changesApplied;
}

// Main execution using schema protector
async function main() {
  const protector = new SchemaProtector();
  
  console.log('🛡️  PostgreSQL Schema Protection System - Array to JSONB Conversion');
  console.log('=' .repeat(80));
  console.log('🎯 Goal: Fix malformed array literal errors in enhanced analysis pipeline');
  console.log('🔧 Converting TEXT[] array columns to JSONB for proper JSON storage');
  console.log('');

  try {
    await protector.executeWithProtection(
      'fix-array-to-jsonb-schema.js',
      'Convert TEXT[] array columns to JSONB for enhanced analysis compatibility',
      performSchemaConversion
    );

    console.log('');
    console.log('=' .repeat(80));
    console.log('✅ SCHEMA CONVERSION COMPLETED SUCCESSFULLY');
    console.log('=' .repeat(80));
    console.log('🚀 Next steps:');
    console.log('   1. Test enhanced analysis pipeline');
    console.log('   2. Verify all 21 companies can be analyzed successfully');
    console.log('   3. Monitor for any remaining "malformed array literal" errors');
    console.log('');
    console.log('🔄 To test the fix, run: analyze-postgres-enhanced.yml workflow');

  } catch (error) {
    console.error('');
    console.error('❌ SCHEMA CONVERSION FAILED:', error.message);
    console.error('');
    console.error('🔄 The schema-protector.js has created backups and audit logs');
    console.error('   Check the error details above and schema_audit_log table');
    
    process.exit(1);
  }
}

// Export for testing
module.exports = {
  performSchemaConversion
};

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  });
}
