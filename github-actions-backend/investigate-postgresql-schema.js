#!/usr/bin/env node

// SSL Certificate fix for Heroku PostgreSQL
if (process.env.NODE_ENV === 'production' || process.env.POSTGRES_CONNECTION_STRING) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const { db, end } = require('./postgres-db');

async function investigateSchema() {
  console.log('🔍 Investigating PostgreSQL Schema - Array vs JSONB Issue');
  console.log('=' .repeat(60));
  
  try {
    // Check baseline_analysis table structure
    console.log('\n📋 intelligence.baseline_analysis table:');
    const baselineColumns = await db.all(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'intelligence' 
        AND table_name = 'baseline_analysis'
      ORDER BY ordinal_position
    `);
    
    baselineColumns.forEach(col => {
      const problematic = ['entities', 'themes', 'sentiment', 'key_points', 'relationships'].includes(col.column_name);
      const marker = problematic ? '🔴' : '✅';
      console.log(`   ${marker} ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    // Check enhanced_analysis table structure  
    console.log('\n📋 intelligence.enhanced_analysis table:');
    const enhancedColumns = await db.all(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'intelligence' 
        AND table_name = 'enhanced_analysis'
      ORDER BY ordinal_position
    `);
    
    