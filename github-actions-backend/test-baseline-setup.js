const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

async function testBaseline() {
  console.log('🧪 Testing baseline analysis setup...\n');
  
  // Check environment
  console.log('✓ API Key:', process.env.ANTHROPIC_API_KEY ? 'Found' : 'MISSING!');
  console.log('✓ TheBrain Key:', process.env.THEBRAIN_API_KEY ? 'Found' : 'MISSING!');
  console.log('✓ Brain ID:', process.env.THEBRAIN_BRAIN_ID || 'MISSING!');
  
  // Check database
  const dbPath = path.join(__dirname, 'data', 'monitor.db');
  const db = new Database(dbPath);
  
  // Count entities
  const stats = {
    companies: db.prepare('SELECT COUNT(*) as count FROM companies').get().count,
    snapshots: db.prepare('SELECT COUNT(*) as count FROM content_snapshots').get().count,
    changes: db.prepare('SELECT COUNT(*) as count FROM changes').get().count,
    baseline_analyses: db.prepare('SELECT COUNT(*) as count FROM baseline_analysis').get().count
  };
  
  console.log('\n📊 Database Stats:');
  console.log(`   Companies: ${stats.companies}`);
  console.log(`   Snapshots: ${stats.snapshots}`);
  console.log(`   Changes: ${stats.changes}`);
  console.log(`   Baseline Analyses: ${stats.baseline_analyses}`);
  
  // Get a sample snapshot to test
  const sample = db.prepare(`
    SELECT cs.*, u.url, u.type as url_type, c.name as company_name
    FROM content_snapshots cs
    JOIN urls u ON cs.url_id = u.id
    JOIN companies c ON u.company_id = c.id
    WHERE cs.extracted_content IS NOT NULL
    AND LENGTH(cs.extracted_content) > 500
    LIMIT 1
  `).get();
  
  if (sample) {
    console.log(`\n🔍 Sample snapshot found:`);
    console.log(`   Company: ${sample.company_name}`);
    console.log(`   URL Type: ${sample.url_type}`);
    console.log(`   Content Length: ${sample.extracted_content.length} chars`);
    
    console.log('\n🎯 Ready to run baseline analysis!');
    console.log('\nNext steps:');
    console.log('1. Run baseline analysis: node ai-analyzer-baseline.js');
    console.log('2. Sync to TheBrain (advanced): node thebrain-sync-enhanced.js sync --advanced');
  } else {
    console.log('\n⚠️  No snapshots found to analyze!');
    console.log('Run the scraper first to collect data.');
  }
  
  db.close();
}

testBaseline().catch(console.error);
