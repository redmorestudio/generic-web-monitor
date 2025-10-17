#!/usr/bin/env node

/**
 * Fix Change Detection Database Schema
 * This script ensures the change_detection table exists in processed_content.db
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, 'data');
const PROCESSED_DB_PATH = path.join(DATA_DIR, 'processed_content.db');

console.log('🔧 Fixing change detection schema...');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    console.error('❌ Data directory not found. Run the scraper first.');
    process.exit(1);
}

// Check if processed_content.db exists
if (!fs.existsSync(PROCESSED_DB_PATH)) {
    console.error('❌ processed_content.db not found. Run the scraper first.');
    process.exit(1);
}

try {
    const db = new Database(PROCESSED_DB_PATH);
    
    // Create change_detection table if it doesn't exist
    db.exec(`
        CREATE TABLE IF NOT EXISTS change_detection (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            url_id INTEGER NOT NULL,
            detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            change_type TEXT,
            summary TEXT,
            old_content_id INTEGER,
            new_content_id INTEGER,
            relevance_score INTEGER DEFAULT 0,
            FOREIGN KEY (url_id) REFERENCES urls(id)
        )
    `);
    
    // Create index for faster queries
    db.exec(`
        CREATE INDEX IF NOT EXISTS idx_change_detection_detected_at 
        ON change_detection(detected_at);
        
        CREATE INDEX IF NOT EXISTS idx_change_detection_url_id 
        ON change_detection(url_id);
    `);
    
    // Check if table was created successfully
    const tableInfo = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='change_detection'").get();
    
    if (tableInfo) {
        console.log('✅ change_detection table created/verified successfully');
        
        // Get count of existing changes
        const count = db.prepare('SELECT COUNT(*) as count FROM change_detection').get();
        console.log(`📊 Current changes in database: ${count.count}`);
    } else {
        throw new Error('Failed to create change_detection table');
    }
    
    db.close();
    console.log('✅ Database schema fixed successfully');
    
} catch (error) {
    console.error('❌ Error fixing database schema:', error);
    process.exit(1);
}
