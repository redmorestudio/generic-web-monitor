#!/usr/bin/env node

// SSL Certificate fix for Heroku PostgreSQL
if (process.env.NODE_ENV === 'production' || process.env.POSTGRES_CONNECTION_STRING) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const { db, end } = require('./postgres-db');

async function fixAllAnalyzerSchemas() {
  console.log('🔧 Running comprehensive PostgreSQL analyzer schema fixes...\n');
  
  try {
    // Fix 1: Enhanced Analysis table
    console.log('1️⃣ Fixing enhanced_analysis table...');
    
    const enhancedTableExists = await db.get(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'intelligence' 
        AND table_name = 'enhanced_analysis'
      )
    `);
    
    if (enhancedTableExists.exists) {
      // Check if change_id column exists
      const changeIdExists = await db.get(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'intelligence' 
          AND table_name = 'enhanced_analysis'
          AND column_name = 'change_id'
        )
      `);
      
      if (!changeIdExists.exists) {
        console.log('   ⚠️  Adding missing change_id column...');
        await db.run(`
          ALTER TABLE intelligence.enhanced_analysis 
          ADD COLUMN IF NOT EXISTS change_id INTEGER REFERENCES intelligence.changes(id)
        `);
        
        // Add unique constraint
        await db.run(`
          ALTER TABLE intelligence.enhanced_analysis 
          ADD CONSTRAINT enhanced_analysis_change_id_key UNIQUE (change_id)
        `);
        console.log('   ✅ Added change_id column and constraint');
      } else {
        console.log('   ✅ change_id column already exists');
      }
    } else {
      console.log('   ❌ enhanced_analysis table does not exist!');
    }
    
    // Fix 2: Change Detection table
    console.log('\n2️⃣ Fixing change_detection table...');
    
    const changeDetectionExists = await db.get(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'processed_content' 
        AND table_name = 'change_detection'
      )
    `);
    
    if (changeDetectionExists.exists) {
      // Check and add old_hash column
      const oldHashExists = await db.get(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'processed_content' 
          AND table_name = 'change_detection'
          AND column_name = 'old_hash'
        )
      `);
      
      if (!oldHashExists.exists) {
        console.log('   ⚠️  Adding missing old_hash column...');
        await db.run(`
          ALTER TABLE processed_content.change_detection 
          ADD COLUMN IF NOT EXISTS old_hash TEXT
        `);
        console.log('   ✅ Added old_hash column');
      } else {
        console.log('   ✅ old_hash column already exists');
      }
      
      // Check and add new_hash column
      const newHashExists = await db.get(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'processed_content' 
          AND table_name = 'change_detection'
          AND column_name = 'new_hash'
        )
      `);
      
      if (!newHashExists.exists) {
        console.log('   ⚠️  Adding missing new_hash column...');
        await db.run(`
          ALTER TABLE processed_content.change_detection 
          ADD COLUMN IF NOT EXISTS new_hash TEXT
        `);
        console.log('   ✅ Added new_hash column');
      } else {
        console.log('   ✅ new_hash column already exists');
      }
      
      // Add indexes for better performance
      console.log('   🔍 Creating indexes for hash columns...');
      
      await db.run(`
        CREATE INDEX IF NOT EXISTS idx_change_detection_old_hash 
        ON processed_content.change_detection(old_hash)
      `);
      
      await db.run(`
        CREATE INDEX IF NOT EXISTS idx_change_detection_new_hash 
        ON processed_content.change_detection(new_hash)
      `);
      
      console.log('   ✅ Indexes created');
    } else {
      console.log('   ❌ change_detection table does not exist!');
    }
    
    // Verify schemas
    console.log('\n3️⃣ Verifying final schemas...\n');
    
    // Show change_detection columns
    const cdColumns = await db.all(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'processed_content' 
      AND table_name = 'change_detection'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 change_detection columns:');
    cdColumns.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });
    
    // Show enhanced_analysis columns
    const eaColumns = await db.all(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'intelligence' 
      AND table_name = 'enhanced_analysis'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 enhanced_analysis columns:');
    eaColumns.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });
    
    console.log('\n✅ All schema fixes complete!');
    
  } catch (error) {
    console.error('❌ Error fixing schemas:', error);
    process.exit(1);
  } finally {
    await end();
  }
}

// Run if called directly
if (require.main === module) {
  fixAllAnalyzerSchemas();
}

module.exports = { fixAllAnalyzerSchemas };
