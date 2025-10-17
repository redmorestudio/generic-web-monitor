#!/usr/bin/env node

// SSL Certificate fix for Heroku PostgreSQL
if (process.env.NODE_ENV === 'production' || process.env.POSTGRES_CONNECTION_STRING) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const { db, end } = require('./postgres-db');

async function fixIntelligenceChangesSchema() {
  console.log('🔧 Fixing intelligence.changes schema...\n');
  
  try {
    // Create intelligence.changes table
    console.log('1️⃣ Creating intelligence.changes table...');
    
    await db.run(`
      CREATE TABLE IF NOT EXISTS intelligence.changes (
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
    constraints.forEach(c => {
      console.log(`   - ${c.conname} (type: ${c.contype})`);
    });
    
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
      await db.run(`
        ALTER TABLE intelligence.enhanced_analysis 
        ADD CONSTRAINT enhanced_analysis_change_id_fkey 
        FOREIGN KEY (change_id) REFERENCES intelligence.changes(id)
      `);
      console.log('   ✅ Foreign key added');
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
