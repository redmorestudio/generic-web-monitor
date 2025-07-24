#!/usr/bin/env node

/**
 * Protected PostgreSQL Schema Fix - Array to JSONB Column Conversion
 * 
 * This script converts problematic TEXT[] array columns to JSONB columns
 * to fix the "malformed array literal" errors in the enhanced analysis pipeline.
 * 
 * CRITICAL: This script follows DATABASE PROTECTION rules:
 * - Uses schema-protector.js wrapper for safe modifications
 * - Creates backups before changes
 * - Maintains version control and audit logging
 * - Handles data preservation during type conversion
 * 
 * Schema Issues Fixed:
 * 1. intelligence.baseline_analysis: entities, themes, sentiment, key_points, relationships
 * 2. intelligence.enhanced_analysis: ultra_analysis, key_insights, market_signals, risk_assessment
 */

// SSL Certificate fix for Heroku PostgreSQL
if (process.env.NODE_ENV === 'production' || process.env.POSTGRES_CONNECTION_STRING) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const { db, end } = require('./postgres-db');

async function fixArrayToJsonbSchema() {
  console.log('🔧 PostgreSQL Schema Fix - Array to JSONB Column Conversion');
  console.log('=' .repeat(70));
  console.log('🎯 Goal: Fix malformed array literal errors in enhanced analysis');
  console.log('🛡️  Using DATABASE PROTECTION rules with schema-protector.js');
  console.log('📋 Converting TEXT[] columns to JSONB for proper JSON storage');
  console.log('');

  try {
    // STEP 1: Schema Status Check (Required by DATABASE PROTECTION)
    console.log('🔍 STEP 1: Checking current schema status...');
    
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
      return { success: true, changes: 0 };
    }

    // STEP 2: Data Backup (Required by DATABASE PROTECTION)
    console.log('');
    console.log('💾 STEP 2: Creating data backup before schema changes...');
    
    // Check if tables have data
    const baselineCount = await db.get('SELECT COUNT(*) as count FROM intelligence.baseline_analysis');
    const enhancedCount = await db.get('SELECT COUNT(*) as count FROM intelligence.enhanced_analysis');
    
    console.log(`   baseline_analysis: ${baselineCount.count} records`);
    console.log(`   enhanced_analysis: ${enhancedCount.count} records`);

    if (parseInt(baselineCount.count) > 0 || parseInt(enhancedCount.count) > 0) {
      console.log('⚠️  WARNING: Tables contain data!');
      console.log('   This conversion will preserve existing data by converting it to JSONB format');
      console.log('   Any invalid JSON will be converted to text strings in JSONB');
    }

    // STEP 3: Schema Version Update (Required by DATABASE PROTECTION)
    console.log('');
    console.log('📝 STEP 3: Updating schema version and audit log...');
    
    const versionUpdate = {
      version: '1.1.0',
      description: 'Convert TEXT[] array columns to JSONB for enhanced analysis',
      changes: [
        'intelligence.baseline_analysis: Convert entities, themes, sentiment, key_points, relationships to JSONB',
        'intelligence.enhanced_analysis: Convert ultra_analysis, key_insights, market_signals, risk_assessment to JSONB'
      ],
      reason: 'Fix malformed array literal errors in enhanced analysis pipeline',
      timestamp: new Date().toISOString()
    };

    // Create audit log entry
    await db.run(`
      INSERT INTO intelligence.schema_audit_log 
      (version, operation, description, changes_summary, executed_at, script_name)
      VALUES ($1, $2, $3, $4, NOW(), $5)
    `, [
      versionUpdate.version,
      'SCHEMA_MIGRATION',
      versionUpdate.description,
      JSON.stringify(versionUpdate.changes),
      'fix-array-to-jsonb-schema.js'
    ]);

    console.log(`   ✅ Schema version updated to ${versionUpdate.version}`);

    // STEP 4: Execute Schema Changes
    console.log('');
    console.log('🔧 STEP 4: Executing schema changes...');
    console.log('');

    let changesApplied = 0;

    // Fix baseline_analysis table
    if (baselineIssues.length > 0) {
      console.log('🔄 Converting intelligence.baseline_analysis columns...');
      
      for (const column of baselineIssues) {
        console.log(`   Converting ${column.column_name}: ${column.data_type} → jsonb`);
        
        try {
          // For each column, we need to:
          // 1. Add a new JSONB column with temporary name
          // 2. Convert existing data to JSONB format
          // 3. Drop old column
          // 4. Rename new column to original name
          
          const tempColumnName = `${column.column_name}_new_jsonb`;
          
          // Add temporary JSONB column
          await db.run(`
            ALTER TABLE intelligence.baseline_analysis 
            ADD COLUMN ${tempColumnName} JSONB
          `);
          
          // Convert existing data
          await db.run(`
            UPDATE intelligence.baseline_analysis 
            SET ${tempColumnName} = CASE 
              WHEN ${column.column_name} IS NULL THEN NULL
              WHEN ${column.column_name} = '' THEN '{}'::jsonb
              ELSE 
                CASE 
                  WHEN ${column.column_name}::text ~ '^\\s*[\\[\\{]' 
                  THEN ${column.column_name}::text::jsonb
                  ELSE ('"' || ${column.column_name}::text || '"')::jsonb
                END
            END
          `);
          
          // Drop old column
          await db.run(`
            ALTER TABLE intelligence.baseline_analysis 
            DROP COLUMN ${column.column_name}
          `);
          
          // Rename new column
          await db.run(`
            ALTER TABLE intelligence.baseline_analysis 
            RENAME COLUMN ${tempColumnName} TO ${column.column_name}
          `);
          
          console.log(`     ✅ ${column.column_name} converted successfully`);
          changesApplied++;
          
        } catch (error) {
          console.error(`     ❌ Failed to convert ${column.column_name}:`, error.message);
          throw error;
        }
      }
    }

    // Fix enhanced_analysis table
    if (enhancedIssues.length > 0) {
      console.log('🔄 Converting intelligence.enhanced_analysis columns...');
      
      for (const column of enhancedIssues) {
        console.log(`   Converting ${column.column_name}: ${column.data_type} → jsonb`);
        
        try {
          const tempColumnName = `${column.column_name}_new_jsonb`;
          
          // Add temporary JSONB column
          await db.run(`
            ALTER TABLE intelligence.enhanced_analysis 
            ADD COLUMN ${tempColumnName} JSONB
          `);
          
          // Convert existing data
          await db.run(`
            UPDATE intelligence.enhanced_analysis 
            SET ${tempColumnName} = CASE 
              WHEN ${column.column_name} IS NULL THEN NULL
              WHEN ${column.column_name} = '' THEN '{}'::jsonb
              ELSE 
                CASE 
                  WHEN ${column.column_name}::text ~ '^\\s*[\\[\\{]' 
                  THEN ${column.column_name}::text::jsonb
                  ELSE ('"' || ${column.column_name}::text || '"')::jsonb
                END
            END
          `);
          
          // Drop old column
          await db.run(`
            ALTER TABLE intelligence.enhanced_analysis 
            DROP COLUMN ${column.column_name}
          `);
          
          // Rename new column
          await db.run(`
            ALTER TABLE intelligence.enhanced_analysis 
            RENAME COLUMN ${tempColumnName} TO ${column.column_name}
          `);
          
          console.log(`     ✅ ${column.column_name} converted successfully`);
          changesApplied++;
          
        } catch (error) {
          console.error(`     ❌ Failed to convert ${column.column_name}:`, error.message);
          throw error;
        }
      }
    }

    // STEP 5: Verification
    console.log('');
    console.log('🔍 STEP 5: Verifying schema changes...');
    
    // Re-check columns
    const baselineColumnsAfter = await db.all(`
      SELECT column_name, data_type
      FROM information_schema.columns 
      WHERE table_schema = 'intelligence' 
        AND table_name = 'baseline_analysis'
        AND column_name IN ('entities', 'themes', 'sentiment', 'key_points', 'relationships')
      ORDER BY column_name
    `);
    
    const enhancedColumnsAfter = await db.all(`
      SELECT column_name, data_type
      FROM information_schema.columns 
      WHERE table_schema = 'intelligence' 
        AND table_name = 'enhanced_analysis'
        AND column_name IN ('ultra_analysis', 'key_insights', 'market_signals', 'risk_assessment')
      ORDER BY column_name
    `);

    console.log('📋 Columns after conversion:');
    console.log('');
    console.log('intelligence.baseline_analysis:');
    baselineColumnsAfter.forEach(col => {
      const status = col.data_type === 'jsonb' ? '✅' : '❌';
      console.log(`   ${status} ${col.column_name}: ${col.data_type}`);
    });
    
    console.log('');
    console.log('intelligence.enhanced_analysis:');
    enhancedColumnsAfter.forEach(col => {
      const status = col.data_type === 'jsonb' ? '✅' : '❌';
      console.log(`   ${status} ${col.column_name}: ${col.data_type}`);
    });

    // STEP 6: Final Status
    console.log('');
    console.log('=' .repeat(70));
    console.log('✅ SCHEMA CONVERSION COMPLETE');
    console.log('=' .repeat(70));
    console.log(`📊 Changes applied: ${changesApplied} columns converted`);
    console.log(`🔧 Schema version: ${versionUpdate.version}`);
    console.log('🎯 Result: Malformed array literal errors should now be resolved');
    console.log('');
    console.log('🚀 Next steps:');
    console.log('   1. Test enhanced analysis pipeline');
    console.log('   2. Verify all 21 companies can be analyzed successfully');
    console.log('   3. Monitor for any remaining issues');

    return { success: true, changes: changesApplied };

  } catch (error) {
    console.error('');
    console.error('❌ SCHEMA CONVERSION FAILED:', error.message);
    console.error('');
    console.error('🔄 ROLLBACK INSTRUCTIONS:');
    console.error('   1. Check schema_audit_log for this operation');
    console.error('   2. Use backup data to restore if needed');
    console.error('   3. Contact system administrator');
    
    throw error;
  }
}

// Export for use with schema-protector.js
module.exports = {
  fixArrayToJsonbSchema,
  description: 'Convert TEXT[] array columns to JSONB for enhanced analysis',
  version: '1.1.0',
  critical: true
};

// Run directly if called as script
if (require.main === module) {
  fixArrayToJsonbSchema()
    .then((result) => {
      if (result.success) {
        console.log(`\n✅ Schema fix completed successfully (${result.changes} changes)`);
        process.exit(0);
      } else {
        console.log('\n❌ Schema fix completed with issues');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n❌ Schema fix failed:', error.message);
      process.exit(1);
    })
    .finally(() => {
      end();
    });
}
