#!/usr/bin/env node

/**
 * Fix Baseline Analysis Schema - FINAL PROPER VERSION
 * 
 * Creates ONE baseline_analysis table with the correct JSONB structure
 * in the intelligence schema that all scripts will use
 */

// Only load dotenv in development (not in GitHub Actions)
if (!process.env.GITHUB_ACTIONS && !process.env.POSTGRES_CONNECTION_STRING) {
  try {
    require('dotenv').config();
  } catch (e) {
    // dotenv not available or no .env file - this is fine
  }
}
const { db, end } = require('./postgres-db');

async function fixBaselineAnalysisSchemaProper() {
  try {
    console.log('🔧 Running FINAL baseline_analysis schema fix...\n');
    console.log('📋 This will create ONE table with proper JSONB structure\n');
    
    // 1. Create schemas if they don't exist
    console.log('📂 Ensuring schemas exist...');
    await db.run('CREATE SCHEMA IF NOT EXISTS intelligence');
    await db.run('CREATE SCHEMA IF NOT EXISTS processed_content');
    console.log('✅ Schemas ready\n');
    
    // 2. Backup any existing data before we start
    console.log('💾 Checking for existing data to preserve...');
    
    let existingData = [];
    
    // Check processed_content.baseline_analysis
    try {
      const processedData = await db.all(`
        SELECT * FROM processed_content.baseline_analysis LIMIT 100
      `);
      if (processedData.length > 0) {
        console.log(`   Found ${processedData.length} records in processed_content.baseline_analysis`);
        existingData = existingData.concat(processedData.map(d => ({...d, source: 'processed_content'})));
      }
    } catch (e) {
      console.log('   No data in processed_content.baseline_analysis');
    }
    
    // Check intelligence.baseline_analysis  
    try {
      const intelligenceData = await db.all(`
        SELECT * FROM intelligence.baseline_analysis LIMIT 100
      `);
      if (intelligenceData.length > 0) {
        console.log(`   Found ${intelligenceData.length} records in intelligence.baseline_analysis`);
        existingData = existingData.concat(intelligenceData.map(d => ({...d, source: 'intelligence'})));
      }
    } catch (e) {
      console.log('   No data in intelligence.baseline_analysis');
    }
    
    console.log(`📊 Total existing records found: ${existingData.length}\n`);
    
    // 3. Drop ALL existing baseline_analysis tables
    console.log('🧹 Dropping old tables...');
    await db.run('DROP TABLE IF EXISTS processed_content.baseline_analysis CASCADE');
    await db.run('DROP TABLE IF EXISTS intelligence.baseline_analysis CASCADE');
    console.log('✅ Old tables dropped\n');
    
    // 4. Create the ONE TRUE table with proper structure
    console.log('📊 Creating intelligence.baseline_analysis with proper JSONB structure...');
    
    await db.run(`
      CREATE TABLE intelligence.baseline_analysis (
        id SERIAL PRIMARY KEY,
        
        -- Company and URL references
        company_id INTEGER REFERENCES intelligence.companies(id),
        company_name TEXT NOT NULL,
        url_id INTEGER REFERENCES intelligence.company_urls(id),
        url TEXT NOT NULL,
        
        -- Rich JSONB fields for competitive intelligence
        entities JSONB DEFAULT '{}',      -- products, technologies, people, partnerships, integrations
        themes JSONB DEFAULT '[]',        -- key topics and trends
        sentiment JSONB DEFAULT '{}',     -- sentiment analysis
        key_points JSONB DEFAULT '[]',    -- key insights and takeaways
        relationships JSONB DEFAULT '[]', -- entity relationships and connections
        
        -- Analysis summary fields
        summary TEXT,                     -- Overall summary of the page/content
        company_type TEXT,                -- Type of company (startup, enterprise, etc)
        page_purpose TEXT,                -- Purpose of the page (product, about, etc)
        
        -- Simple array fields from original schema
        key_topics TEXT[],                -- Main topics (simple array)
        main_message TEXT,                -- Core message
        target_audience TEXT,             -- Who they're targeting
        unique_value TEXT,                -- Their unique value prop
        trust_elements TEXT[],            -- Trust signals
        differentiation TEXT,             -- How they differentiate
        technology_stack TEXT[],          -- Tech stack mentioned
        
        -- Metadata
        analysis_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        content_hash TEXT,
        ai_model TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        -- Ensure uniqueness per URL and content version
        UNIQUE(url_id, content_hash)
      )
    `);
    
    console.log('✅ Table created successfully\n');
    
    // 5. Create indexes for performance
    console.log('🔍 Creating indexes...');
    
    const indexes = [
      'CREATE INDEX idx_baseline_analysis_company_id ON intelligence.baseline_analysis(company_id)',
      'CREATE INDEX idx_baseline_analysis_url_id ON intelligence.baseline_analysis(url_id)',
      'CREATE INDEX idx_baseline_analysis_company_name ON intelligence.baseline_analysis(company_name)',
      'CREATE INDEX idx_baseline_analysis_analysis_date ON intelligence.baseline_analysis(analysis_date DESC)',
      'CREATE INDEX idx_baseline_analysis_created_at ON intelligence.baseline_analysis(created_at DESC)',
      'CREATE INDEX idx_baseline_analysis_content_hash ON intelligence.baseline_analysis(content_hash)',
      // JSONB indexes for querying
      'CREATE INDEX idx_baseline_analysis_entities ON intelligence.baseline_analysis USING GIN (entities)',
      'CREATE INDEX idx_baseline_analysis_themes ON intelligence.baseline_analysis USING GIN (themes)',
      'CREATE INDEX idx_baseline_analysis_relationships ON intelligence.baseline_analysis USING GIN (relationships)'
    ];
    
    for (const index of indexes) {
      try {
        await db.run(index);
        console.log(`✅ Created: ${index.match(/idx_\w+/)[0]}`);
      } catch (err) {
        if (err.message.includes('already exists')) {
          console.log(`⚠️  Already exists: ${index.match(/idx_\w+/)[0]}`);
        } else {
          console.error(`❌ Failed: ${index.match(/idx_\w+/)[0]} - ${err.message}`);
        }
      }
    }
    
    // 6. Migrate any existing data (if found)
    if (existingData.length > 0) {
      console.log(`\n📦 Migrating ${existingData.length} existing records...`);
      
      let migrated = 0;
      for (const record of existingData) {
        try {
          // Try to find company_id if not present
          let companyId = record.company_id;
          if (!companyId && record.company_name) {
            const company = await db.get(
              'SELECT id FROM intelligence.companies WHERE name = $1',
              [record.company_name]
            );
            companyId = company?.id;
          }
          
          // Try to find url_id if not present
          let urlId = record.url_id;
          if (!urlId && record.url) {
            const urlRecord = await db.get(
              'SELECT id FROM intelligence.company_urls WHERE url = $1',
              [record.url]
            );
            urlId = urlRecord?.id;
          }
          
          if (companyId && urlId) {
            await db.run(`
              INSERT INTO intelligence.baseline_analysis 
              (company_id, company_name, url_id, url, entities, themes, sentiment, key_points, 
               summary, content_hash, ai_model, created_at)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
              ON CONFLICT (url_id, content_hash) DO NOTHING
            `, [
              companyId,
              record.company_name || record.company || 'Unknown',
              urlId,
              record.url || '',
              record.entities || '{}',
              record.themes || '[]',
              record.sentiment || '{}',
              record.key_points || '[]',
              record.summary || '',
              record.content_hash || '',
              record.ai_model || 'unknown',
              record.created_at || new Date()
            ]);
            migrated++;
          }
        } catch (e) {
          console.log(`   ⚠️ Could not migrate record: ${e.message}`);
        }
      }
      console.log(`✅ Migrated ${migrated} records\n`);
    }
    
    // 7. Verify final structure
    console.log('🔍 Verifying final table structure...');
    
    const columns = await db.all(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'intelligence' 
      AND table_name = 'baseline_analysis'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Final table structure:');
    columns.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
    });
    
    // 8. Create views for backward compatibility (if needed)
    console.log('\n📐 Creating compatibility view in processed_content...');
    
    await db.run(`
      CREATE OR REPLACE VIEW processed_content.baseline_analysis AS
      SELECT 
        id,
        url_id,
        entities,
        themes,
        sentiment,
        key_points,
        summary,
        created_at,
        updated_at
      FROM intelligence.baseline_analysis
    `);
    
    console.log('✅ Compatibility view created');
    
    console.log('\n✨ Schema fix complete!');
    console.log('📍 ONE table: intelligence.baseline_analysis');
    console.log('📊 With proper JSONB structure for rich competitive intelligence');
    console.log('🔗 All scripts should now use this single source of truth\n');
    
  } catch (error) {
    console.error('\n❌ Error fixing schema:', error.message);
    console.error('Full error:', error.stack);
    process.exit(1);
  } finally {
    await end();
  }
}

// Run if called directly
if (require.main === module) {
  fixBaselineAnalysisSchemaProper()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { fixBaselineAnalysisSchemaProper };
