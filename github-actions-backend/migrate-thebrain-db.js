// Initialize database migration script
const Database = require('better-sqlite3');
const path = require('path');

function migrateDatabase() {
  console.log('🔧 Running TheBrain database migration...');
  
  const dbPath = path.join(__dirname, 'data', 'intelligence.db');
  const db = new Database(dbPath);
  
  try {
    // Check if column already exists
    const columns = db.prepare("PRAGMA table_info(companies)").all();
    const hasColumn = columns.some(col => col.name === 'thebrain_thought_id');
    
    if (!hasColumn) {
      console.log('Adding thebrain_thought_id column to companies table...');
      db.prepare('ALTER TABLE companies ADD COLUMN thebrain_thought_id TEXT').run();
      console.log('✅ Column added successfully');
    } else {
      console.log('✅ Column already exists');
    }
    
    // Create mapping table
    console.log('Creating thebrain_mappings table...');
    db.prepare(`
      CREATE TABLE IF NOT EXISTS thebrain_mappings (
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        thought_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (entity_type, entity_id)
      )
    `).run();
    
    // Create index
    db.prepare(`
      CREATE INDEX IF NOT EXISTS idx_thebrain_mappings_thought_id 
      ON thebrain_mappings(thought_id)
    `).run();
    
    console.log('✅ Database migration complete');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    db.close();
  }
}

// Export for use in other scripts
module.exports = { migrateDatabase };

// Run if called directly
if (require.main === module) {
  migrateDatabase();
}
