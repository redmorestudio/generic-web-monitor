#!/usr/bin/env node

/**
 * PostgreSQL Schema Migration - Add Missing JSONB Columns
 * July 23, 2025 - Fix for baseline_analysis table missing entities column
 */

// Load environment variables
if (!process.env.GITHUB_ACTIONS && !process.env.POSTGRES_CONNECTION_STRING) {
  try {
    require('dotenv').config();
  } catch (e) {
    // dotenv not available or no .env file - this is fine
  }
}

// SSL Certificate fix for Heroku PostgreSQL
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { db, end } = require('./postgres-db');

async function addMissingColumns() {
  console.log('🔧 PostgreSQL Schema Migration - Adding Missing JSONB Columns\n');
  
  try {
    // Check if we need to add the JSONB columns to baseline_analysis
    console.log('🔍 Checking baseline_analysis table structure...');
    
    const existingColumns = await db.all(`
      SELECT column_name, data_type
      FROM information_schema.columns 
      WHERE table_schema = 'intelligence' 
      AND table_name = 'baseline_analysis'
      ORDER BY ordinal_position
    `);
    
    console.log('📊 Current columns:');
    existingColumns.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });
    
    // Check which JSONB columns are missing
    const requiredJSONBColumns = ['entities', 'themes', 'sentiment', 'key_points', 'relationships'];
    const existingColumnNames = existingColumns.map(col => col.column_name);
    const missingColumns = requiredJSONBColumns.filter(col => !existingColumnNames.includes(col));
    
    if (missingColumns.length === 0) {
      console.log('✅ All required JSONB columns already exist!');
      return;
    }
    
    console.log(`\n🔧 Adding ${missingColumns.length} missing JSONB columns...`);
    
    // Add each missing column
    for (const columnName of missingColumns) {
      try {
        console.log(`  Adding ${columnName}...`);
        await db.run(`
          ALTER TABLE intelligence.baseline_analysis 
          ADD COLUMN IF NOT EXISTS ${columnName} JSONB
        `);
        console.log(`  ✅ Added ${columnName} column`);
      } catch (error) {
        console.log(`  ⚠️ Error adding ${columnName}: ${error.message}`);
        // Continue with other columns
      }
    }
    
    // Also add missing identity columns if needed
    const requiredIdColumns = ['company_id', 'url_id'];
    const missingIdColumns = requiredIdColumns.filter(col => !existingColumnNames.includes(col));
    
    if (missingIdColumns.length > 0) {
      console.log(`\n🔧 Adding ${missingIdColumns.length} missing ID columns...`);
      
      for (const columnName of missingIdColumns) {
        try {
          console.log(`  Adding ${columnName}...`);
          await db.run(`
            ALTER TABLE intelligence.baseline_analysis 
            ADD COLUMN IF NOT EXISTS ${columnName} INTEGER
          `);
          console.log(`  ✅ Added ${columnName} column`);
        } catch (error) {
          console.log(`  ⚠️ Error adding ${columnName}: ${error.message}`);
        }
      }
    }
    
    // Verify the migration
    console.log('\n🔍 Verifying migration...');
    const updatedColumns = await db.all(`
      SELECT column_name, data_type
      FROM information_schema.columns 
      WHERE table_schema = 'intelligence' 
      AND table_name = 'baseline_analysis'
      ORDER BY ordinal_position
    `);
    
    console.log('📊 Updated columns:');
    updatedColumns.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });
    
    // Check if entities column now exists
    const entitiesColumn = updatedColumns.find(col => col.column_name === 'entities');
    if (entitiesColumn) {
      console.log('\n✅ SUCCESS: entities column is now available!');
      console.log(`   Type: ${entitiesColumn.data_type}`);
    } else {
      console.log('\n❌ FAILED: entities column still missing');
      throw new Error('Migration failed - entities column not created');
    }
    
    console.log('\n✅ Schema migration complete!');
    
  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  } finally {
    await end();
  }
}

// Run if called directly
if (require.main === module) {
  addMissingColumns().catch(console.error);
}

module.exports = { addMissingColumns };
