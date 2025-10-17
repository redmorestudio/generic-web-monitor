#!/usr/bin/env node

/**
 * Check baseline_analysis table column types
 */

const { db, end } = require('./postgres-db');

async function checkColumns() {
  console.log('🔍 Checking intelligence.baseline_analysis column types...\n');
  
  try {
    // Get column information
    const result = await db.all(`
      SELECT 
        column_name,
        data_type,
        udt_name,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'intelligence' 
        AND table_name = 'baseline_analysis'
      ORDER BY ordinal_position
    `);
    
    console.log('📊 Column Details:');
    console.log('─'.repeat(80));
    
    // Identify potential problem columns
    const textColumns = [];
    
    for (const col of result) {
      const marker = col.data_type === 'text' && 
                    ['entities', 'themes', 'sentiment', 'key_points', 'relationships',
                     'key_topics', 'trust_elements', 'technology_stack'].includes(col.column_name) 
                    ? ' ⚠️  SHOULD BE JSONB' : '';
      
      console.log(`${col.column_name.padEnd(20)} | ${col.data_type.padEnd(15)} | ${col.is_nullable.padEnd(8)} ${marker}`);
      
      if (marker) {
        textColumns.push(col.column_name);
      }
    }
    
    console.log('─'.repeat(80));
    
    if (textColumns.length > 0) {
      console.log('\n❌ Found TEXT columns that should be JSONB:');
      textColumns.forEach(col => console.log(`   - ${col}`));
      
      console.log('\n💡 These columns are being used to store JSON data but are defined as TEXT.');
      console.log('   This causes PostgreSQL to interpret JSON arrays as malformed array literals.');
      
      // Check if any data exists
      const countResult = await db.get('SELECT COUNT(*) as count FROM intelligence.baseline_analysis');
      const hasData = countResult && countResult.count > 0;
      
      if (hasData) {
        console.log(`\n⚠️  Table has ${countResult.count} rows. Conversion needs to preserve data.`);
      }
      
      return textColumns;
    } else {
      console.log('\n✅ All columns have appropriate types!');
      return [];
    }
    
  } catch (error) {
    console.error('❌ Error checking columns:', error.message);
    throw error;
  } finally {
    await end();
  }
}

// Run if called directly
if (require.main === module) {
  checkColumns()
    .then(textColumns => {
      if (textColumns.length > 0) {
        console.log('\n📝 To fix, run: node fix-baseline-analysis-jsonb.js');
      }
      process.exit(textColumns.length > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('Failed:', error);
      process.exit(1);
    });
}

module.exports = { checkColumns };
