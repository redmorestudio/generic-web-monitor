#!/usr/bin/env node

/**
 * Fix Remaining Array Columns - Targeted Schema Fix
 * 
 * Based on investigation results, we need to fix 3 remaining columns:
 * - intelligence.enhanced_analysis.key_insights: ARRAY → JSONB
 * - intelligence.enhanced_analysis.market_signals: ARRAY → JSONB  
 * - intelligence.enhanced_analysis.risk_assessment: text → JSONB
 */

// SSL Certificate fix for Heroku PostgreSQL
if (process.env.NODE_ENV === 'production' || process.env.POSTGRES_CONNECTION_STRING) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const { db, end } = require('./postgres-db');
const { SchemaProtector } = require('./schema-protector');

async function fixRemainingColumns() {
  console.log('🔧 Targeted Fix - Remaining Array Columns to JSONB');
  console.log('=' .repeat(70));
  console.log('🎯 Fix 3 remaining problematic columns in enhanced_analysis');
  console.log('📋 Based on investigation: key_insights, market_signals, risk_assessment');
  console.log('');

  // Verify current state first
  console.log('🔍 Verifying current column state...');
  
  const problematicColumns = await db.all(`
    SELECT column_name, data_type
    FROM information_schema.columns 
    WHERE table_schema = 'intelligence' 
      AND table_name = 'enhanced_analysis'
      AND column_name IN ('key_insights', 'market_signals', 'risk_assessment')
    ORDER BY column_name
  `);

  console.log('📋 Current problematic columns:');
  const columnsToConvert = [];
  
  problematicColumns.forEach(col => {
    const needsFix = col.data_type !== 'jsonb';
    const status = needsFix ? '🔴 NEEDS FIX' : '✅ OK';
    console.log(`   ${status} ${col.column_name}: ${col.data_type}`);
    
    if (needsFix) {
      columnsToConvert.push(col.column_name);
    }
  });

  if (columnsToConvert.length === 0) {
    console.log('✅ All columns are already JSONB - no fix needed');
    return 0;
  }

  console.log('');
  console.log(`🔧 Converting ${columnsToConvert.length} columns to JSONB...`);

  // Check existing data
  const recordCount = await db.get('SELECT COUNT(*) as count FROM intelligence.enhanced_analysis');
  console.log(`📊 Table has ${recordCount.count} records to preserve`);

  let conversionsApplied = 0;

  // Convert each problematic column
  for (const columnName of columnsToConvert) {
    console.log(`');
    console.log(`🔄 Converting ${columnName}...`);
    
    try {
      const tempColumnName = `${columnName}_new_jsonb`;
      
      // Step 1: Add temporary JSONB column
      console.log(`   1. Adding temporary column ${tempColumnName}`);
      await db.run(`
        ALTER TABLE intelligence.enhanced_analysis 
        ADD COLUMN ${tempColumnName} JSONB
      `);
      
      // Step 2: Convert existing data with robust handling
      console.log(`   2. Converting existing data`);
      await db.run(`
        UPDATE intelligence.enhanced_analysis 
        SET ${tempColumnName} = CASE 
          WHEN ${columnName} IS NULL THEN NULL
          WHEN ${columnName}::text = '' THEN '{}'::jsonb
          WHEN ${columnName}::text ~ '^\\s*[\\[\\{]' THEN 
            -- Try to parse as JSON
            CASE 
              WHEN ${columnName}::text::jsonb IS NOT NULL THEN ${columnName}::text::jsonb
              ELSE ('{"error": "invalid_json", "original": ' || to_json(${columnName}::text) || '}')::jsonb
            END
          ELSE 
            -- Convert non-JSON data to JSONB string
            to_jsonb(${columnName}::text)
        END
      `);
      
      // Step 3: Drop old column
      console.log(`   3. Dropping old column`);
      await db.run(`ALTER TABLE intelligence.enhanced_analysis DROP COLUMN ${columnName}`);
      
      // Step 4: Rename new column
      console.log(`   4. Renaming column to ${columnName}`);
      await db.run(`ALTER TABLE intelligence.enhanced_analysis RENAME COLUMN ${tempColumnName} TO ${columnName}`);
      
      console.log(`   ✅ ${columnName} converted successfully`);
      conversionsApplied++;
      
    } catch (error) {
      console.error(`   ❌ Failed to convert ${columnName}:`, error.message);
      throw error;
    }
  }

  // Final verification
  console.log('');
  console.log('🔍 Verifying final state...');
  
  const finalColumns = await db.all(`
    SELECT column_name, data_type
    FROM information_schema.columns 
    WHERE table_schema = 'intelligence' 
      AND table_name = 'enhanced_analysis'
      AND column_name IN ('key_insights', 'market_signals', 'risk_assessment')
    ORDER BY column_name
  `);

  console.log('📋 Final column types:');
  finalColumns.forEach(col => {
    const status = col.data_type === 'jsonb' ? '✅' : '❌';
    console.log(`   ${status} ${col.column_name}: ${col.data_type}`);
  });

  console.log('');
  console.log(`✅ Targeted fix complete! ${conversionsApplied} columns converted to JSONB`);
  
  return conversionsApplied;
}

async function updateSchemaVersion() {
  console.log('');
  console.log('📝 Updating schema version to resolve integrity violation...');
  
  const protector = new SchemaProtector();
  await protector.initialize();
  
  // Update schema version with new checksum
  const newVersion = await protector.updateSchemaVersion(
    'fix-remaining-array-columns.js',
    ['Convert remaining TEXT[]/ARRAY columns to JSONB in enhanced_analysis table']
  );
  
  console.log(`✅ Schema version updated to ${newVersion.version}`);
  console.log(`📋 New checksum: ${newVersion.checksum}`);
  
  // Log the resolution
  await protector.logChange(
    'TARGETED_SCHEMA_FIX',
    'fix-remaining-array-columns.js',
    'Fixed remaining 3 columns: key_insights, market_signals, risk_assessment',
    true
  );
  
  return newVersion;
}

// Main execution
async function main() {
  console.log('🛠️ Fix Remaining Array Columns - Enhanced Analysis Table');
  console.log('=' .repeat(70));
  console.log('🎯 Goal: Complete the array-to-JSONB conversion');
  console.log('📋 Fix: key_insights, market_signals, risk_assessment columns');
  console.log('');

  try {
    // Fix the remaining columns
    const conversions = await fixRemainingColumns();
    
    if (conversions > 0) {
      // Update schema version to resolve integrity violation
      await updateSchemaVersion();
      
      console.log('');
      console.log('=' .repeat(70));
      console.log('✅ TARGETED FIX COMPLETED SUCCESSFULLY');
      console.log('=' .repeat(70));
      console.log(`🔧 Conversions applied: ${conversions} columns`);
      console.log('📋 Schema integrity: RESTORED');
      console.log('🎯 Result: All malformed array literal errors should now be resolved');
      console.log('');
      console.log('🚀 Next steps:');
      console.log('   1. Test enhanced analysis pipeline');
      console.log('   2. Verify all 21 companies can be analyzed successfully');
      
    } else {
      console.log('✅ No conversions needed - all columns already correct');
    }

  } catch (error) {
    console.error('');
    console.error('❌ TARGETED FIX FAILED:', error.message);
    throw error;
  }
}

// Export for testing
module.exports = { fixRemainingColumns, updateSchemaVersion };

// Run if called directly
if (require.main === module) {
  main()
    .then(() => {
      console.log('\n✅ Targeted fix completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Targeted fix failed:', error.message);
      process.exit(1);
    })
    .finally(() => {
      end();
    });
}
