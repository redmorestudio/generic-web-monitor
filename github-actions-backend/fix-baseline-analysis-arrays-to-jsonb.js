#!/usr/bin/env node

/**
 * Fix baseline_analysis table ARRAY columns that should be JSONB
 * This fixes the "malformed array literal" error when trying to insert JSON strings
 */

const { db, end } = require('./postgres-db');

// Columns that need to be converted from ARRAY to JSONB
const ARRAY_COLUMNS_TO_CONVERT = [
  'key_topics',       // Currently ARRAY, needs to be JSONB
  'trust_elements',   // Currently ARRAY, needs to be JSONB
  'technology_stack'  // Currently ARRAY, needs to be JSONB
];

async function fixBaselineAnalysisArrayColumns() {
  console.log('🔧 Fixing intelligence.baseline_analysis ARRAY to JSONB columns...\n');
  
  try {
    // Start transaction
    await db.run('BEGIN');
    
    console.log('📊 Converting columns from ARRAY to JSONB:');
    
    for (const column of ARRAY_COLUMNS_TO_CONVERT) {
      try {
        console.log(`\n🔄 Converting ${column}...`);
        
        // First check current type
        const typeCheck = await db.get(`
          SELECT data_type, udt_name 
          FROM information_schema.columns 
          WHERE table_schema = 'intelligence' 
            AND table_name = 'baseline_analysis' 
            AND column_name = $1
        `, [column]);
        
        console.log(`   Current type: ${typeCheck.data_type} (${typeCheck.udt_name})`);
        
        // First, convert any NULL values to empty JSON object
        await db.run(`
          UPDATE intelligence.baseline_analysis 
          SET ${column} = '{}' 
          WHERE ${column} IS NULL
        `);
        
        // For ARRAY columns, we need a different conversion strategy
        if (typeCheck.data_type === 'ARRAY') {
          // First drop the column
          await db.run(`
            ALTER TABLE intelligence.baseline_analysis 
            DROP COLUMN ${column}
          `);
          
          // Then re-add as JSONB
          await db.run(`
            ALTER TABLE intelligence.baseline_analysis 
            ADD COLUMN ${column} JSONB
          `);
          
          console.log(`   ✅ ${column} converted from ARRAY to JSONB`);
        } else if (typeCheck.data_type === 'text') {
          // For TEXT columns, use direct conversion
          await db.run(`
            ALTER TABLE intelligence.baseline_analysis 
            ALTER COLUMN ${column} TYPE JSONB 
            USING ${column}::JSONB
          `);
          
          console.log(`   ✅ ${column} converted from TEXT to JSONB`);
        } else if (typeCheck.data_type === 'jsonb') {
          console.log(`   ℹ️  ${column} is already JSONB`);
        } else {
          console.log(`   ⚠️  ${column} has unexpected type: ${typeCheck.data_type}`);
        }
      } catch (error) {
        console.error(`   ❌ Error converting ${column}:`, error.message);
        throw error;
      }
    }
    
    // Commit transaction
    await db.run('COMMIT');
    
    console.log('\n✅ All columns converted successfully!');
    
    // Verify the changes
    console.log('\n📋 Verifying column types:');
    const result = await db.all(`
      SELECT 
        column_name,
        data_type,
        udt_name
      FROM information_schema.columns
      WHERE table_schema = 'intelligence' 
        AND table_name = 'baseline_analysis'
        AND column_name = ANY($1)
      ORDER BY ordinal_position
    `, [ARRAY_COLUMNS_TO_CONVERT]);
    
    console.log('─'.repeat(50));
    for (const col of result) {
      const status = col.data_type === 'jsonb' ? '✅' : '❌';
      console.log(`${status} ${col.column_name.padEnd(20)} | ${col.data_type}`);
    }
    console.log('─'.repeat(50));
    
    // Update schema version
    console.log('\n📝 Updating schema version...');
    try {
      const schemaProtector = require('./schema-protector');
      await schemaProtector.updateSchemaVersion('3.1.0', 'Fixed baseline_analysis ARRAY to JSONB columns');
    } catch (error) {
      console.log('   ⚠️  Could not update schema version:', error.message);
    }
    
    console.log('\n✨ Schema fix complete!');
    
  } catch (error) {
    console.error('\n❌ Error during conversion:', error.message);
    
    // Rollback on error
    try {
      await db.run('ROLLBACK');
      console.log('🔙 Transaction rolled back');
    } catch (rollbackError) {
      console.error('❌ Rollback failed:', rollbackError.message);
    }
    
    throw error;
  } finally {
    await end();
  }
}

// Run if called directly
if (require.main === module) {
  // Check for required environment variables
  if (!process.env.DATABASE_URL && !process.env.POSTGRES_CONNECTION_STRING) {
    console.error('❌ ERROR: DATABASE_URL or POSTGRES_CONNECTION_STRING environment variable not set');
    console.error('Make sure to set it in your environment or GitHub Actions secrets');
    process.exit(1);
  }
  
  fixBaselineAnalysisArrayColumns()
    .then(() => {
      console.log('\n🎉 Fix completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Fix failed:', error.message);
      process.exit(1);
    });
}

module.exports = { fixBaselineAnalysisArrayColumns };
