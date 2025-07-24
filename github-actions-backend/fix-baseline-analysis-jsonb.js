#!/usr/bin/env node

/**
 * Fix baseline_analysis table TEXT columns that should be JSONB
 * This fixes the "malformed array literal" error
 */

const { db, end } = require('./postgres-db');

// Columns that need to be converted from TEXT to JSONB
const COLUMNS_TO_CONVERT = [
  'entities',      // Stores {products, technologies, people, partnerships}
  'themes',        // Key topics and trends
  'sentiment',     // Sentiment analysis
  'key_points',    // Key insights
  'relationships', // Entity relationships
  'key_topics',    // The column causing the current error!
  'trust_elements',
  'technology_stack'
];

async function fixBaselineAnalysisColumns() {
  console.log('🔧 Fixing intelligence.baseline_analysis TEXT to JSONB columns...\n');
  
  try {
    // Start transaction
    await db.run('BEGIN');
    
    console.log('📊 Converting columns from TEXT to JSONB:');
    
    for (const column of COLUMNS_TO_CONVERT) {
      try {
        console.log(`\n🔄 Converting ${column}...`);
        
        // First, update any NULL values to empty JSON object
        await db.run(`
          UPDATE intelligence.baseline_analysis 
          SET ${column} = '{}' 
          WHERE ${column} IS NULL
        `);
        
        // Then convert the column
        await db.run(`
          ALTER TABLE intelligence.baseline_analysis 
          ALTER COLUMN ${column} TYPE JSONB 
          USING ${column}::JSONB
        `);
        
        console.log(`   ✅ ${column} converted successfully`);
      } catch (error) {
        if (error.message.includes('already of type jsonb')) {
          console.log(`   ℹ️  ${column} is already JSONB`);
        } else {
          throw error;
        }
      }
    }
    
    // Commit transaction
    await db.run('COMMIT');
    
    console.log('\n✅ All columns converted successfully!');
    
    // Verify the changes
    console.log('\n📋 Verifying column types:');
    const result = await db.run(`
      SELECT 
        column_name,
        data_type,
        udt_name
      FROM information_schema.columns
      WHERE table_schema = 'intelligence' 
        AND table_name = 'baseline_analysis'
        AND column_name = ANY($1)
      ORDER BY ordinal_position
    `, [COLUMNS_TO_CONVERT]);
    
    console.log('─'.repeat(50));
    for (const col of result.rows) {
      const status = col.data_type === 'jsonb' ? '✅' : '❌';
      console.log(`${status} ${col.column_name.padEnd(20)} | ${col.data_type}`);
    }
    console.log('─'.repeat(50));
    
    // Update schema version
    console.log('\n📝 Updating schema version...');
    const schemaProtector = require('./schema-protector');
    await schemaProtector.updateSchemaVersion('3.0.0', 'Fixed baseline_analysis TEXT to JSONB columns');
    
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
  
  fixBaselineAnalysisColumns()
    .then(() => {
      console.log('\n🎉 Fix completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Fix failed:', error.message);
      process.exit(1);
    });
}

module.exports = { fixBaselineAnalysisColumns };
