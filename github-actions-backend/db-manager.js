/**
 * Database Connections Module
 * Manages connections to the three-database architecture
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

class DatabaseManager {
  constructor() {
    this.dataDir = path.join(__dirname, 'data');
    this.connections = {};
    this.ensureDataDirectory();
  }

  ensureDataDirectory() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  /**
   * Get connection to raw content database
   */
  getRawDb() {
    if (!this.connections.raw) {
      const dbPath = path.join(this.dataDir, 'raw_content.db');
      this.connections.raw = new Database(dbPath);
      this.connections.raw.pragma('journal_mode = WAL');
    }
    return this.connections.raw;
  }

  /**
   * Get connection to processed content database
   */
  getProcessedDb() {
    if (!this.connections.processed) {
      const dbPath = path.join(this.dataDir, 'processed_content.db');
      this.connections.processed = new Database(dbPath);
      this.connections.processed.pragma('journal_mode = WAL');
    }
    return this.connections.processed;
  }

  /**
   * Get connection to intelligence database
   */
  getIntelligenceDb() {
    if (!this.connections.intelligence) {
      const dbPath = path.join(this.dataDir, 'intelligence.db');
      this.connections.intelligence = new Database(dbPath);
      this.connections.intelligence.pragma('journal_mode = WAL');
    }
    return this.connections.intelligence;
  }

  /**
   * Get connection to legacy monolithic database (for migration)
   */
  getLegacyDb() {
    if (!this.connections.legacy) {
      const dbPath = path.join(this.dataDir, 'monitor.db');
      if (fs.existsSync(dbPath)) {
        this.connections.legacy = new Database(dbPath);
        this.connections.legacy.pragma('journal_mode = WAL');
      }
    }
    return this.connections.legacy;
  }

  /**
   * Close all database connections
   */
  closeAll() {
    Object.values(this.connections).forEach(db => {
      if (db) db.close();
    });
    this.connections = {};
  }

  /**
   * Check if three-database architecture exists
   */
  hasThreeDbArchitecture() {
    const rawExists = fs.existsSync(path.join(this.dataDir, 'raw_content.db'));
    const processedExists = fs.existsSync(path.join(this.dataDir, 'processed_content.db'));
    const intelligenceExists = fs.existsSync(path.join(this.dataDir, 'intelligence.db'));
    
    return rawExists && processedExists && intelligenceExists;
  }

  /**
   * Check if legacy database exists
   */
  hasLegacyDb() {
    return fs.existsSync(path.join(this.dataDir, 'monitor.db'));
  }

  /**
   * Get database info
   */
  getDatabaseInfo() {
    const info = {
      architecture: this.hasThreeDbArchitecture() ? 'three-db' : 'legacy',
      databases: {}
    };

    const dbFiles = [
      { name: 'legacy', file: 'monitor.db' },
      { name: 'raw', file: 'raw_content.db' },
      { name: 'processed', file: 'processed_content.db' },
      { name: 'intelligence', file: 'intelligence.db' }
    ];

    dbFiles.forEach(({ name, file }) => {
      const dbPath = path.join(this.dataDir, file);
      if (fs.existsSync(dbPath)) {
        const stats = fs.statSync(dbPath);
        info.databases[name] = {
          path: dbPath,
          size: (stats.size / 1024 / 1024).toFixed(2) + ' MB',
          modified: stats.mtime
        };
      }
    });

    return info;
  }
}

// Export singleton instance
module.exports = new DatabaseManager();

// Also export the class for testing
module.exports.DatabaseManager = DatabaseManager;
