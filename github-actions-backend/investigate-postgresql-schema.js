#!/usr/bin/env node

// SSL Certificate fix for Heroku PostgreSQL
if (process.env.NODE_ENV === 'production' || process.env.POSTGRES_CONNECTION_STRING) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const { db, end } = require('./postgres-db');

async function investigateSchema() {
  console.log('🔍 Investigating PostgreSQL Schema - Array vs JSONB Issue');
  console.log('=' .repeat(60));
  
  try {
    // Check baseline_analysis table structure
    console.log('\n📋 intelligence.baseline_analysis table:');
    const baselineColumns = await db.all(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'intelligence' 
        AND table_name = 'baseline_analysis'
      ORDER BY ordinal_position
    `);
    
    const problematicColumns = ['entities', 'themes', 'sentiment', 'key_points', 'relationships'];
    let baselineIssues = [];
    
    baselineColumns.forEach(col => {
      const isProblematic = problematicColumns.includes(col.column_name);
      const marker = isProblematic ? '🔴' : '✅';
      console.log(`   ${marker} ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      
      if (isProblematic && col.data_type !== 'jsonb') {
        baselineIssues.push({
          column: col.column_name,
          currentType: col.data_type,
          shouldBe: 'jsonb'
        });
      }
    });

    // Check enhanced_analysis table structure  
    console.log('\n📋 intelligence.enhanced_analysis table:');
    const enhancedColumns = await db.all(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'intelligence' 
        AND table_name = 'enhanced_analysis'
      ORDER BY ordinal_position
    `);
    
    const enhancedProblematicColumns = ['ultra_analysis', 'key_insights', 'market_signals', 'risk_assessment'];
    let enhancedIssues = [];
    
    enhancedColumns.forEach(col => {
      const isProblematic = enhancedProblematicColumns.includes(col.column_name);
      const marker = isProblematic ? '🔴' : '✅';
      console.log(`   ${marker} ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      
      if (isProblematic && col.data_type !== 'jsonb') {
        enhancedIssues.push({
          column: col.column_name,
          currentType: col.data_type,
          shouldBe: 'jsonb'
        });
      }
    });

    // Check changes table structure
    console.log('\n📋 intelligence.changes table:');
    const changesColumns = await db.all(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'intelligence' 
        AND table_name = 'changes'
      ORDER BY ordinal_position
    `);
    
    changesColumns.forEach(col => {
      console.log(`   ✅ ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    // Summary of issues found
    console.log('\n🔍 ANALYSIS SUMMARY:');
    console.log('=' .repeat(60));
    
    if (baselineIssues.length > 0) {
      console.log('\n🔴 intelligence.baseline_analysis ISSUES:');
      baselineIssues.forEach(issue => {
        console.log(`   - ${issue.column}: Currently ${issue.currentType}, should be ${issue.shouldBe}`);
      });
    } else {
      console.log('\n✅ intelligence.baseline_analysis: All JSONB columns are correct');
    }
    
    if (enhancedIssues.length > 0) {
      console.log('\n🔴 intelligence.enhanced_analysis ISSUES:');
      enhancedIssues.forEach(issue => {
        console.log(`   - ${issue.column}: Currently ${issue.currentType}, should be ${issue.shouldBe}`);
      });
    } else {
      console.log('\n✅ intelligence.enhanced_analysis: All JSONB columns are correct');
    }

    const totalIssues = baselineIssues.length + enhancedIssues.length;
    
    if (totalIssues > 0) {
      console.log(`\n⚠️  TOTAL ISSUES FOUND: ${totalIssues} columns need to be converted to JSONB`);
      console.log('\n🔧 NEXT STEPS:');
      console.log('   1. Create protected schema fix using schema-protector.js');
      console.log('   2. Convert TEXT/TEXT[] columns to JSONB');
      console.log('   3. Preserve existing data during conversion');
      console.log('   4. Test with sample data');
    } else {
      console.log('\n✅ NO SCHEMA ISSUES FOUND');
      console.log('   The malformed array literal error may be caused by something else');
    }

    // Sample data check
    console.log('\n📊 SAMPLE DATA CHECK:');
    const sampleBaseline = await db.get(`
      SELECT company, entities, themes 
      FROM intelligence.baseline_analysis 
      LIMIT 1
    `);
    
    if (sampleBaseline) {
      console.log('\n📋 Sample baseline_analysis data:');
      console.log(`   Company: ${sampleBaseline.company}`);
      console.log(`   Entities type: ${typeof sampleBaseline.entities}`);
      console.log(`   Entities value: ${JSON.stringify(sampleBaseline.entities)?.substring(0, 100)}...`);
      console.log(`   Themes type: ${typeof sampleBaseline.themes}`);
      console.log(`   Themes value: ${JSON.stringify(sampleBaseline.themes)?.substring(0, 100)}...`);
    } else {
      console.log('   No data in baseline_analysis table');
    }

    return {
      baselineIssues,
      enhancedIssues,
      totalIssues
    };

  } catch (error) {
    console.error('❌ Schema investigation failed:', error.message);
    throw error;
  }
}

// Run investigation
if (require.main === module) {
  investigateSchema()
    .then((result) => {
      console.log('\n🔍 Schema investigation complete!');
      if (result.totalIssues > 0) {
        console.log(`🔧 Found ${result.totalIssues} schema issues that need fixing`);
        process.exit(1); // Exit with error to indicate issues found
      } else {
        console.log('✅ No schema issues detected');
        process.exit(0);
      }
    })
    .catch(error => {
      console.error('❌ Investigation failed:', error.message);
      process.exit(1);
    })
    .finally(() => {
      end();
    });
}

module.exports = { investigateSchema };
