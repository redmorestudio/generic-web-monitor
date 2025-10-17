#!/usr/bin/env node

/**
 * Update PostgreSQL companies from companies.json
 * This script syncs the companies.json file to the PostgreSQL database
 */

const { db, end } = require('./postgres-db');
const fs = require('fs');
const path = require('path');

async function updateCompaniesInPostgres() {
  try {
    console.log('🔄 Updating PostgreSQL companies from companies.json...\n');
    
    // Read the companies.json file
    const companiesJsonPath = path.join(__dirname, '..', 'api-data', 'companies.json');
    const companiesData = JSON.parse(fs.readFileSync(companiesJsonPath, 'utf8'));
    
    console.log(`📄 Loaded ${companiesData.companies.length} companies from companies.json`);
    
    // Get current companies in PostgreSQL
    const currentCompanies = await db.all(`
      SELECT c.id, c.name, c.category
      FROM intelligence.companies c
      ORDER BY c.name
    `);
    
    console.log(`🐘 Found ${currentCompanies.length} companies in PostgreSQL`);
    
    // Create a map of companies to keep
    const companiesToKeep = new Map();
    companiesData.companies.forEach(company => {
      companiesToKeep.set(company.name, company);
    });
    
    // Start transaction
    await db.exec('BEGIN');
    
    try {
      // First, delete companies that are not in the JSON
      for (const dbCompany of currentCompanies) {
        if (!companiesToKeep.has(dbCompany.name)) {
          console.log(`🗑️  Deleting ${dbCompany.name} and its URLs...`);
          
          // Delete URLs first (foreign key constraint)
          await db.run(`
            DELETE FROM intelligence.company_urls 
            WHERE company_id = $1
          `, [dbCompany.id]);
          
          // Delete from url_metadata
          await db.run(`
            DELETE FROM intelligence.url_metadata
            WHERE company_id = $1
          `, [dbCompany.id]);
          
          // Delete the company
          await db.run(`
            DELETE FROM intelligence.companies 
            WHERE id = $1
          `, [dbCompany.id]);
        }
      }
      
      // Update or insert companies from JSON
      for (const [name, company] of companiesToKeep) {
        // Check if company exists
        const existing = await db.get(`
          SELECT id FROM intelligence.companies 
          WHERE name = $1
        `, [name]);
        
        if (existing) {
          console.log(`✅ Keeping ${name}`);
          // Update category if different
          await db.run(`
            UPDATE intelligence.companies 
            SET category = $1
            WHERE id = $2
          `, [company.category, existing.id]);
        } else {
          console.log(`➕ Adding ${name}`);
          // This shouldn't happen if we're reducing, but just in case
          await db.run(`
            INSERT INTO intelligence.companies (name, category)
            VALUES ($1, $2)
          `, [name, company.category]);
        }
      }
      
      // Commit transaction
      await db.exec('COMMIT');
      console.log('\n✅ Successfully updated PostgreSQL companies!');
      
      // Show final count
      const finalCount = await db.get(`
        SELECT COUNT(*) as count 
        FROM intelligence.companies
      `);
      
      console.log(`\n📊 Final company count: ${finalCount.count}`);
      
      // List remaining companies
      const remainingCompanies = await db.all(`
        SELECT name, category 
        FROM intelligence.companies 
        ORDER BY name
      `);
      
      console.log('\n📋 Remaining companies:');
      remainingCompanies.forEach(c => {
        console.log(`   - ${c.name} (${c.category})`);
      });
      
    } catch (error) {
      // Rollback on error
      await db.exec('ROLLBACK');
      throw error;
    }
    
  } catch (error) {
    console.error('❌ Error updating companies:', error);
    process.exit(1);
  } finally {
    await end();
  }
}

// Run the update
updateCompaniesInPostgres();