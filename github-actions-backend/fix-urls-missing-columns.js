#!/usr/bin/env node

/**
 * Add missing columns to intelligence.urls table
 * Adds: is_primary, last_scraped, scrape_frequency
 */

// SSL Certificate fix for Heroku PostgreSQL
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { db, end } = require('./postgres-db');

async function addMissingUrlColumns() {
  console.log('🔧 Adding missing columns to intelligence.urls...\n');
  
  try {
    // Check which columns already exist
    const existingColumns = await db.all(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'intelligence' 
      AND table_name = 'urls'
    `);
    
    const columnNames = existingColumns.map(col => col.column_name);
    console.log('📊 Existing columns:', columnNames.join(', '));
    
    // Add is_primary if missing
    if (!columnNames.includes('is_primary')) {
      console.log('Adding is_primary column...');
      await db.run(`
        ALTER TABLE intelligence.urls 
        ADD COLUMN is_primary BOOLEAN DEFAULT false
      `);
      
      // Update primary URLs based on url_type
      await db.run(`
        UPDATE intelligence.urls 
        SET is_primary = true 
        WHERE url_type IN ('homepage', 'main', 'primary')
        AND is_primary IS false
      `);
      
      console.log('✅ is_primary column added');
    } else {
      console.log('✅ is_primary column already exists');
    }
    
    // Add last_scraped if missing
    if (!columnNames.includes('last_scraped')) {
      console.log('Adding last_scraped column...');
      await db.run(`
        ALTER TABLE intelligence.urls 
        ADD COLUMN last_scraped TIMESTAMP
      `);
      
      // Try to populate from scrape_status or scraped_pages
      await db.run(`
        UPDATE intelligence.urls u
        SET last_scraped = (
          SELECT MAX(sp.scraped_at)
          FROM raw_content.scraped_pages sp
          WHERE sp.url = u.url
        )
        WHERE last_scraped IS NULL
      `);
      
      console.log('✅ last_scraped column added');
    } else {
      console.log('✅ last_scraped column already exists');
    }
    
    // Add scrape_frequency if missing
    if (!columnNames.includes('scrape_frequency')) {
      console.log('Adding scrape_frequency column...');
      await db.run(`
        ALTER TABLE intelligence.urls 
        ADD COLUMN scrape_frequency INTEGER DEFAULT 86400
      `);
      
      // Set more frequent scraping for primary URLs
      await db.run(`
        UPDATE intelligence.urls 
        SET scrape_frequency = 43200 
        WHERE is_primary = true
        AND scrape_frequency = 86400
      `);
      
      console.log('✅ scrape_frequency column added (default: 86400 seconds = 24 hours)');
    } else {
      console.log('✅ scrape_frequency column already exists');
    }
    
    // Add created_at and updated_at if missing
    if (!columnNames.includes('created_at')) {
      console.log('Adding created_at column...');
      await db.run(`
        ALTER TABLE intelligence.urls 
        ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `);
      console.log('✅ created_at column added');
    }
    
    if (!columnNames.includes('updated_at')) {
      console.log('Adding updated_at column...');
      await db.run(`
        ALTER TABLE intelligence.urls 
        ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `);
      console.log('✅ updated_at column added');
    }
    
    console.log('\n✅ All missing columns added successfully');
    
    // Show final table structure
    const finalColumns = await db.all(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'intelligence' 
      AND table_name = 'urls'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📊 Final table structure:');
    finalColumns.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type})${col.column_default ? ' DEFAULT ' + col.column_default : ''}`);
    });
    
  } catch (error) {
    console.error('❌ Error adding columns:', error.message);
    throw error;
  } finally {
    await end();
  }
}

// Run if called directly
if (require.main === module) {
  addMissingUrlColumns()
    .then(() => {
      console.log('\n✅ URLs table fix completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ URLs table fix failed:', error);
      process.exit(1);
    });
}

module.exports = { addMissingUrlColumns };
