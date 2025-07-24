#!/usr/bin/env node

/**
 * EMERGENCY Schema Integrity Investigation
 * 
 * A schema integrity violation was detected. This script investigates
 * what unauthorized changes were made to the database.
 */

// SSL Certificate fix for Heroku PostgreSQL
if (process.env.NODE_ENV === 'production' || process.env.POSTGRES_CONNECTION_STRING) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const { db, end } = require('./postgres-db');

async function investigateSchemaViolation() {
  console.log('🚨 EMERGENCY SCHEMA INTEGRITY INVESTIGATION');
  console.log('=' .repeat(80));
  console.log('🎯 A schema integrity violation was detected by schema-protector.js');
  console.log('📋 Investigating unauthorized database changes...');
  console.log('');

  try {
    // Check if audit table exists
    const auditTableExists = await db.get(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'schema_audit_log'
      ) as exists
    `);

    if (auditTableExists.exists) {
      console.log('📜 SCHEMA AUDIT LOG - Recent Changes:');
      console.log('-'.repeat(80));
      
      const auditEntries = await db.all(`
        SELECT 
          executed_at,
          action,
          script_name,
          success,
          error_message,
          executed_by,
          query
        FROM public.schema_audit_log 
        ORDER BY executed_at DESC 
        LIMIT 20
      `);

      if (auditEntries.length > 0) {
        auditEntries.forEach((entry, index) => {
          const status = entry.success ? '✅' : '❌';
          console.log(`\n${index + 1}. ${entry.executed_at} ${status}`);
          console.log(`   Action: ${entry.action}`);
          console.log(`   Script: ${entry.script_name || 'unknown'}`);
          console.log(`   User: ${entry.executed_by || 'unknown'}`);
          if (entry.error_message) {
            console.log(`   Error: ${entry.error_message}`);
          }
          if (entry.query && entry.query.length < 200) {
            console.log(`   Query: ${entry.query}`);
          }
        });
      } else {
        console.log('   No audit entries found');
      }
    } else {
      console.log('⚠️  Schema audit table does not exist');
    }

    // Check for schema lock status
    console.log('\n🔒 SCHEMA LOCK STATUS:');
    console.log('-'.repeat(80));
    
    const lockTableExists = await db.get(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'schema_lock'
      ) as exists
    `);

    if (lockTableExists.exists) {
      const lockStatus = await db.get('SELECT * FROM public.schema_lock WHERE id = 1');
      
      if (lockStatus) {
        console.log(`Lock Status: ${lockStatus.is_locked ? '🔒 LOCKED' : '🔓 UNLOCKED'}`);
        if (lockStatus.is_locked) {
          console.log(`Locked By: ${lockStatus.locked_by}`);
          console.log(`Locked At: ${lockStatus.locked_at}`);
          console.log(`Reason: ${lockStatus.lock_reason}`);
        }
      } else {
        console.log('No lock record found');
      }
    } else {
      console.log('⚠️  Schema lock table does not exist');
    }

    // Get current schema state
    console.log('\n📊 CURRENT SCHEMA STATE:');
    console.log('-'.repeat(80));
    
    // Check intelligence schema tables
    const intelligenceTables = await db.all(`
      SELECT table_name, 
             (SELECT COUNT(*) FROM information_schema.columns 
              WHERE table_schema = 'intelligence' AND table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'intelligence'
      ORDER BY table_name
    `);

    console.log('\nIntelligence Schema Tables:');
    intelligenceTables.forEach(table => {
      console.log(`   📋 ${table.table_name} (${table.column_count} columns)`);
    });

    // Check the problematic columns we're trying to fix
    console.log('\n🔍 PROBLEMATIC COLUMNS STATUS:');
    console.log('-'.repeat(80));
    
    const problemColumns = [
      { table: 'baseline_analysis', columns: ['entities', 'themes', 'sentiment', 'key_points', 'relationships'] },
      { table: 'enhanced_analysis', columns: ['ultra_analysis', 'key_insights', 'market_signals', 'risk_assessment'] }
    ];

    for (const tableInfo of problemColumns) {
      console.log(`\n📋 intelligence.${tableInfo.table}:`);
      
      const tableExists = await db.get(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'intelligence' 
          AND table_name = $1
        ) as exists
      `, [tableInfo.table]);

      if (tableExists.exists) {
        for (const column of tableInfo.columns) {
          const columnInfo = await db.get(`
            SELECT data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_schema = 'intelligence' 
              AND table_name = $1
              AND column_name = $2
          `, [tableInfo.table, column]);

          if (columnInfo) {
            const status = columnInfo.data_type === 'jsonb' ? '✅' : '🔴';
            console.log(`   ${status} ${column}: ${columnInfo.data_type}`);
          } else {
            console.log(`   ❌ ${column}: COLUMN MISSING`);
          }
        }
      } else {
        console.log(`   ❌ TABLE MISSING: intelligence.${tableInfo.table}`);
      }
    }

    // Check recent schema modifications
    console.log('\n🔄 RECENT SCHEMA MODIFICATIONS:');
    console.log('-'.repeat(80));
    
    const recentChanges = await db.all(`
      SELECT 
        schemaname,
        tablename,
        tableowner
      FROM pg_stat_user_tables 
      WHERE schemaname IN ('intelligence', 'raw_content', 'processed_content')
      ORDER BY schemaname, tablename
    `);

    recentChanges.forEach(change => {
      console.log(`   📋 ${change.schemaname}.${change.tablename} (owner: ${change.tableowner})`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('🔍 INVESTIGATION COMPLETE');
    console.log('=' .repeat(80));
    console.log('');
    console.log('🚨 CRITICAL: Schema integrity violated - unauthorized changes detected');
    console.log('📋 Review the audit log above to identify the source of changes');
    console.log('🔧 Recommendation: Restore from backup or manually reconcile schema');
    console.log('⚠️  DO NOT proceed with schema changes until integrity is restored');

  } catch (error) {
    console.error('❌ Investigation failed:', error.message);
    throw error;
  }
}

// Run investigation
if (require.main === module) {
  investigateSchemaViolation()
    .then(() => {
      console.log('\n✅ Investigation complete - check results above');
      process.exit(1); // Exit with error since violation detected
    })
    .catch(error => {
      console.error('❌ Investigation failed:', error.message);
      process.exit(1);
    })
    .finally(() => {
      end();
    });
}

module.exports = { investigateSchemaViolation };
