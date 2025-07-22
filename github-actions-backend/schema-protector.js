#!/usr/bin/env node

/**
 * PostgreSQL Schema Protection System
 * MUST be run before ANY schema modifications
 */

require('dotenv').config();

// SSL Certificate fix for Heroku PostgreSQL
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const { db, end } = require('./postgres-db');

// Schema version file location
const SCHEMA_VERSION_FILE = path.join(__dirname, 'schema-version.json');
const SCHEMA_BACKUP_DIR = path.join(__dirname, 'schema-backups');

class SchemaProtector {
  constructor() {
    this.isLocked = false;
  }

  async initialize() {
    // Create backup directory if it doesn't exist
    await fs.mkdir(SCHEMA_BACKUP_DIR, { recursive: true });
    
    // Create schema audit table
    await db.run(`
      CREATE TABLE IF NOT EXISTS public.schema_audit_log (
        id SERIAL PRIMARY KEY,
        action TEXT NOT NULL,
        script_name TEXT,
        query TEXT,
        success BOOLEAN DEFAULT true,
        error_message TEXT,
        executed_by TEXT DEFAULT CURRENT_USER,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        schema_version_before TEXT,
        schema_version_after TEXT
      )
    `);

    // Create schema lock table
    await db.run(`
      CREATE TABLE IF NOT EXISTS public.schema_lock (
        id INTEGER PRIMARY KEY DEFAULT 1,
        is_locked BOOLEAN DEFAULT false,
        locked_by TEXT,
        locked_at TIMESTAMP,
        lock_reason TEXT,
        CHECK (id = 1)
      )
    `);

    // Insert default lock record if not exists
    await db.run(`
      INSERT INTO public.schema_lock (id, is_locked) 
      VALUES (1, false) 
      ON CONFLICT (id) DO NOTHING
    `);
  }

  async getCurrentSchemaHash() {
    // Get complete schema definition
    const schema = await db.all(`
      SELECT 
        ns.nspname as schema_name,
        cls.relname as table_name,
        attr.attname as column_name,
        pg_catalog.format_type(attr.atttypid, attr.atttypmod) as data_type,
        attr.attnotnull as not_null,
        pg_get_expr(def.adbin, def.adrelid) as default_value
      FROM pg_catalog.pg_attribute attr
      JOIN pg_catalog.pg_class cls ON cls.oid = attr.attrelid
      JOIN pg_catalog.pg_namespace ns ON ns.oid = cls.relnamespace
      LEFT JOIN pg_catalog.pg_attrdef def ON def.adrelid = cls.oid AND def.adnum = attr.attnum
      WHERE ns.nspname IN ('intelligence', 'raw_content', 'processed_content')
        AND cls.relkind IN ('r', 'v')
        AND attr.attnum > 0
        AND NOT attr.attisdropped
      ORDER BY ns.nspname, cls.relname, attr.attnum
    `);

    // Create hash of schema
    const schemaString = JSON.stringify(schema, null, 2);
    return crypto.createHash('sha256').update(schemaString).digest('hex');
  }

  async getSchemaVersion() {
    try {
      const content = await fs.readFile(SCHEMA_VERSION_FILE, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      // Return default if file doesn't exist
      return {
        version: '0.0.0',
        lastModified: new Date().toISOString(),
        checksum: await this.getCurrentSchemaHash()
      };
    }
  }

  async updateSchemaVersion(scriptName, changes) {
    const newChecksum = await this.getCurrentSchemaHash();
    const currentVersion = await this.getSchemaVersion();
    
    // Increment version
    const [major, minor, patch] = currentVersion.version.split('.').map(Number);
    const newVersion = `${major}.${minor}.${patch + 1}`;

    const versionInfo = {
      version: newVersion,
      lastModified: new Date().toISOString(),
      modifiedBy: scriptName,
      checksum: newChecksum,
      changes: changes,
      previousVersion: currentVersion.version,
      previousChecksum: currentVersion.checksum
    };

    await fs.writeFile(SCHEMA_VERSION_FILE, JSON.stringify(versionInfo, null, 2));
    return versionInfo;
  }

  async acquireLock(scriptName, reason) {
    // Check if already locked
    const lock = await db.get('SELECT * FROM public.schema_lock WHERE id = 1');
    
    if (lock.is_locked) {
      throw new Error(`Schema is already locked by ${lock.locked_by} at ${lock.locked_at}. Reason: ${lock.lock_reason}`);
    }

    // Acquire lock
    await db.run(`
      UPDATE public.schema_lock 
      SET is_locked = true, 
          locked_by = $1, 
          locked_at = CURRENT_TIMESTAMP,
          lock_reason = $2
      WHERE id = 1
    `, [scriptName, reason]);

    this.isLocked = true;
    console.log('🔒 Schema lock acquired');
  }

  async releaseLock() {
    if (!this.isLocked) return;

    await db.run(`
      UPDATE public.schema_lock 
      SET is_locked = false, 
          locked_by = NULL, 
          locked_at = NULL,
          lock_reason = NULL
      WHERE id = 1
    `);

    this.isLocked = false;
    console.log('🔓 Schema lock released');
  }

  async backupSchema() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(SCHEMA_BACKUP_DIR, `schema-${timestamp}.json`);

    // Get complete schema
    const tables = await db.all(`
      SELECT 
        schemaname,
        tablename,
        tableowner
      FROM pg_tables
      WHERE schemaname IN ('intelligence', 'raw_content', 'processed_content')
      ORDER BY schemaname, tablename
    `);

    const views = await db.all(`
      SELECT 
        schemaname,
        viewname,
        viewowner
      FROM pg_views
      WHERE schemaname IN ('intelligence', 'raw_content', 'processed_content')
      ORDER BY schemaname, viewname
    `);

    const backup = {
      timestamp,
      tables,
      views,
      checksum: await this.getCurrentSchemaHash()
    };

    await fs.writeFile(backupFile, JSON.stringify(backup, null, 2));
    console.log(`💾 Schema backed up to: ${backupFile}`);
    return backupFile;
  }

  async logChange(action, scriptName, query, success, error = null) {
    await db.run(`
      INSERT INTO public.schema_audit_log 
      (action, script_name, query, success, error_message)
      VALUES ($1, $2, $3, $4, $5)
    `, [action, scriptName, query, success, error]);
  }

  async validateSchema() {
    const version = await this.getSchemaVersion();
    const currentHash = await this.getCurrentSchemaHash();

    if (version.checksum !== currentHash) {
      console.error('❌ Schema has been modified outside of version control!');
      console.error(`Expected checksum: ${version.checksum}`);
      console.error(`Current checksum: ${currentHash}`);
      
      // Log the violation
      await this.logChange(
        'SCHEMA_VIOLATION',
        'unknown',
        'Schema modified without version update',
        false,
        'Checksum mismatch detected'
      );

      throw new Error('Schema integrity violation detected!');
    }

    console.log('✅ Schema validation passed');
    return true;
  }

  async executeWithProtection(scriptName, changes, callback) {
    let backupFile;
    
    try {
      // Initialize protection system
      await this.initialize();

      // Validate current schema
      await this.validateSchema();

      // Acquire lock
      await this.acquireLock(scriptName, changes);

      // Backup current schema
      backupFile = await this.backupSchema();

      // Log start
      await this.logChange('SCHEMA_CHANGE_START', scriptName, changes, true);

      // Execute the changes
      console.log('🔧 Executing schema changes...');
      await callback();

      // Update version
      const newVersion = await this.updateSchemaVersion(scriptName, changes);

      // Log success
      await this.logChange('SCHEMA_CHANGE_COMPLETE', scriptName, changes, true);

      console.log(`✅ Schema updated to version ${newVersion.version}`);

    } catch (error) {
      console.error('❌ Schema change failed:', error.message);
      
      // Log failure
      await this.logChange(
        'SCHEMA_CHANGE_FAILED',
        scriptName,
        changes,
        false,
        error.message
      );

      // Provide restoration instructions
      if (backupFile) {
        console.error(`\n🚨 To restore schema, use backup: ${backupFile}`);
      }

      throw error;

    } finally {
      // Always release lock
      await this.releaseLock();
      await end();
    }
  }
}

// Export for use in other scripts
module.exports = { SchemaProtector };

// CLI interface
if (require.main === module) {
  const command = process.argv[2];
  const protector = new SchemaProtector();

  async function run() {
    await protector.initialize();

    switch (command) {
      case 'validate':
        await protector.validateSchema();
        break;

      case 'backup':
        await protector.backupSchema();
        break;

      case 'status':
        const lock = await db.get('SELECT * FROM public.schema_lock WHERE id = 1');
        const version = await protector.getSchemaVersion();
        
        console.log('\n📊 Schema Status:');
        console.log(`Version: ${version.version}`);
        console.log(`Last Modified: ${version.lastModified}`);
        console.log(`Modified By: ${version.modifiedBy || 'unknown'}`);
        console.log(`Locked: ${lock.is_locked ? `Yes (by ${lock.locked_by})` : 'No'}`);
        
        if (lock.is_locked) {
          console.log(`Lock Reason: ${lock.lock_reason}`);
          console.log(`Locked At: ${lock.locked_at}`);
        }
        break;

      case 'history':
        const history = await db.all(`
          SELECT * FROM public.schema_audit_log 
          ORDER BY executed_at DESC 
          LIMIT 20
        `);
        
        console.log('\n📜 Recent Schema Changes:');
        history.forEach(entry => {
          console.log(`\n${entry.executed_at} - ${entry.action}`);
          console.log(`  Script: ${entry.script_name}`);
          console.log(`  Success: ${entry.success ? '✅' : '❌'}`);
          if (entry.error_message) {
            console.log(`  Error: ${entry.error_message}`);
          }
        });
        break;

      default:
        console.log(`
PostgreSQL Schema Protection System

Usage:
  node schema-protector.js validate   - Validate current schema
  node schema-protector.js backup     - Backup current schema
  node schema-protector.js status     - Show schema status
  node schema-protector.js history    - Show change history

To use in your scripts:
  const { SchemaProtector } = require('./schema-protector');
  const protector = new SchemaProtector();
  
  await protector.executeWithProtection(
    'my-script.js',
    'Adding new column to companies table',
    async () => {
      // Your schema changes here
    }
  );
        `);
    }

    await end();
  }

  run().catch(console.error);
}
