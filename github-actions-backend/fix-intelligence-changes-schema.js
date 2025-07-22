#!/usr/bin/env node

// SSL Certificate fix for Heroku PostgreSQL
if (process.env.NODE_ENV === 'production' || process.env.POSTGRES_CONNECTION_STRING) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const { db, end } = require('./postgres-db');

async function fixIntelligenceChangesSchema() {
  console.log('🔧 Fixing intelligence.changes schema...\n');
  
  try {
    // Check if table exists
    console.log('1️⃣ Checking if intelligence.changes table exists...');
    
    const tableExists = await db.get(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'intelligence' 
        AND table_name = 'changes'
      )
    `);
    
    if (tableExists.exists) {
      console.log('   ⚠️  Table already exists - checking for unique constraint...');
      
      // Check if the unique constraint exists
      const constraintExists = await db.get(`
        SELECT EXISTS (
          SELECT 1 
          FROM pg_constraint 
          WHERE conrelid = 'intelligence.changes'::regclass
          AND contype = 'u'
          AND conname LIKE '%company_url_detected_at%'
        )
      `);
      
      if (!constraintExists.exists) {
        console.log('   ⚠️  Unique constraint missing - adding it now...');
        try {
          await db.run(`
            ALTER TABLE intelligence.changes 
            ADD CONSTRAINT changes_company_url_detected_at_key 
            UNIQUE(company, url, detected_at)
          `);
          console.log('   ✅ Unique constraint added successfully!');
        } catch (error) {
          if (error.message.includes('already exists')) {
            console.log('   ✅ Constraint already exists (different name)');
          } else {
            throw error;
          }
        }
      } else {
        console.log('   ✅ Unique constraint already exists');
      }
    } else {
      // Create table with constraint
      console.log('   📦 Creating new table with unique constraint...');
      
      await db.run(`
        CREATE TABLE intelligence.changes (
          id SERIAL PRIMARY KEY,
          company TEXT NOT NULL,
          url TEXT NOT NULL,
          detected_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          change_type TEXT,
          before_content TEXT,
          after_content TEXT,
          analysis JSONB,
          interest_level INTEGER DEFAULT 5,
          ai_confidence REAL DEFAULT 0.8,
          content_hash_before TEXT,
          content_hash_after TEXT,
          markdown_before TEXT,
          markdown_after TEXT,
          ai_model TEXT DEFAULT 'groq-llama-3.3-70b',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(company, url, detected_at)
        )
      `);
      
      console.log('   ✅ Table created with unique constraint');
    }
    
    // Create indexes
    console.log('\n2️⃣ Creating indexes...');
    
    await db.run(`
      CREATE INDEX IF NOT EXISTS idx_intelligence_changes_company 
      ON intelligence.changes(company)
    `);
    
    await db.run(`
      CREATE INDEX IF NOT EXISTS idx_intelligence_changes_detected_at 
      ON intelligence.changes(detected_at DESC)
    `);
    
    await db.run(`
      CREATE INDEX IF NOT EXISTS idx_intelligence_changes_interest_level 
      ON intelligence.changes(interest_level DESC)
    `);
    
    console.log('   ✅ Indexes created');
    
    // Verify the constraint exists
    console.log('\n3️⃣ Verifying constraints...');
    
    const constraints = await db.all(`
      SELECT conname, contype 
      FROM pg_constraint 
      WHERE conrelid = 'intelligence.changes'::regclass
      AND contype = 'u'
    `);
    
    console.log('   Constraints found:');
    if (constraints.length === 0) {
      console.log('   ❌ NO UNIQUE CONSTRAINTS FOUND!');
    } else {
      constraints.forEach(c => {
        console.log(`   - ${c.conname} (type: ${c.contype})`);
      });
    }
    
    // Check if enhanced_analysis has the correct foreign key
    console.log('\n4️⃣ Checking enhanced_analysis foreign key...');
    
    const fkExists = await db.get(`
      SELECT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'enhanced_analysis_change_id_fkey'
      )
    `);
    
    if (!fkExists.exists) {
      console.log('   ⚠️  Adding foreign key constraint...');
      try {
        await db.run(`
          ALTER TABLE intelligence.enhanced_analysis 
          ADD CONSTRAINT enhanced_analysis_change_id_fkey 
          FOREIGN KEY (change_id) REFERENCES intelligence.changes(id)
        `);
        console.log('   ✅ Foreign key added');
      } catch (error) {
        if (error.message.includes('does not exist')) {
          console.log('   ⚠️  Enhanced analysis table may not exist yet');
        } else {
          throw error;
        }
      }
    } else {
      console.log('   ✅ Foreign key already exists');
    }
    
    // Show final schema
    console.log('\n5️⃣ Final schema verification:');
    
    const columns = await db.all(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'intelligence' 
      AND table_name = 'changes'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 intelligence.changes columns:');
    columns.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Double-check constraint after everything
    const finalConstraintCheck = await db.all(`
      SELECT conname 
      FROM pg_constraint 
      WHERE conrelid = 'intelligence.changes'::regclass
      AND contype = 'u'
    `);
    
    console.log('\n🔍 Final constraint check:');
    if (finalConstraintCheck.length === 0) {
      console.log('   ❌ ERROR: Still no unique constraints found!');
      process.exit(1);
    } else {
      console.log('   ✅ Unique constraints verified:');
      finalConstraintCheck.forEach(c => {
        console.log(`      - ${c.conname}`);
      });
    }
    
    console.log('\n✅ Schema fix complete!');
    
  } catch (error) {
    console.error('❌ Error fixing schema:', error);
    process.exit(1);
  } finally {
    await end();
  }
}

// Run if called directly
if (require.main === module) {
  fixIntelligenceChangesSchema();
}

module.exports = { fixIntelligenceChangesSchema };
