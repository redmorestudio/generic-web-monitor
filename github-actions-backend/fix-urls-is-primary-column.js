#!/usr/bin/env node

/**
 * Add missing is_primary column to intelligence.urls table
 */

// SSL Certificate fix for Heroku PostgreSQL
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { db, end } = require('./postgres-db');

async function addIsPrimaryColumn() {
  console.log('🔧 Adding is_primary column to intelligence.urls...\n');
  
  try {
    // Check if column already exists
    const columnExists = await db.get(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'intelligence' 
      AND table_name = 'urls' 
      AND column_name = 'is_primary'
    `);
    
    if (columnExists) {
      console.log('✅ Column is_primary already exists');
      return;
    }
    
    // Add the column
    console.log('Adding is_primary column...');
    await db.run(`
      ALTER TABLE intelligence.urls 
      ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT false
    `);
    
    console.log('✅ Column is_primary added successfully');
    
    // Update primary URLs based on url_type
    console.log('Updating primary URLs based on url_type...');
    await db.run(`
      UPDATE intelligence.urls 
      SET is_primary = true 
      WHERE url_type IN ('homepage', 'main', 'primary')
      AND is_primary IS false
    `);
    
    console.log('✅ Primary URLs updated');
    
  } catch (error) {
    console.error('❌ Error adding is_primary column:', error.message);
    throw error;
  } finally {
    await end();
  }
}

// Run if called directly
if (require.main === module) {
  addIsPrimaryColumn()
    .then(() => {
      console.log('\n✅ is_primary column fix completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ is_primary column fix failed:', error);
      process.exit(1);
    });
}

module.exports = { addIsPrimaryColumn };
