#!/usr/bin/env node

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

console.log('🔧 Adding groups schema to database...');

// Database path
const dbPath = path.join(__dirname, '../data/monitor.db');

// Check if database exists
if (!fs.existsSync(dbPath)) {
  console.error('❌ Database not found at:', dbPath);
  console.log('💡 Run "npm run init-db" first to create the database');
  process.exit(1);
}

try {
  // Connect to database
  const db = new Database(dbPath);
  
  // Read and execute schema
  const schemaSQL = fs.readFileSync(path.join(__dirname, 'add-groups-schema.sql'), 'utf8');
  
  // Execute the schema (multiple statements)
  const statements = schemaSQL.split(';').filter(stmt => stmt.trim());
  
  console.log(`📊 Executing ${statements.length} SQL statements...`);
  
  statements.forEach((statement, index) => {
    const trimmed = statement.trim();
    if (trimmed) {
      try {
        db.exec(trimmed);
        console.log(`   ✅ Statement ${index + 1} executed successfully`);
      } catch (error) {
        console.log(`   ⚠️  Statement ${index + 1} skipped (might already exist): ${error.message}`);
      }
    }
  });
  
  // Verify the groups were created
  const groups = db.prepare('SELECT name, color FROM groups ORDER BY name').all();
  
  console.log('\n📋 Groups created:');
  groups.forEach(group => {
    console.log(`   ${group.color} ${group.name}`);
  });
  
  console.log('\n✅ Groups schema added successfully!');
  console.log('💡 Use CLI commands to assign companies and URLs to groups');
  
  db.close();
  
} catch (error) {
  console.error('❌ Error adding groups schema:', error.message);
  process.exit(1);
}
