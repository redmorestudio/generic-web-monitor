#!/usr/bin/env node

/**
 * Update Company Categories Script
 * 
 * This script updates company categories in the intelligence database
 * It can be called from GitHub Actions or run locally
 */

const path = require('path');
const Database = require('better-sqlite3');
const fs = require('fs');

// Database paths
const DATA_DIR = path.join(__dirname, 'data');
const INTELLIGENCE_DB = path.join(DATA_DIR, 'intelligence.db');

// Function to update a single company's category
function updateCompanyCategory(companyName, newCategory) {
    const db = new Database(INTELLIGENCE_DB);
    
    try {
        const stmt = db.prepare('UPDATE companies SET category = ? WHERE name = ?');
        const result = stmt.run(newCategory, companyName);
        
        if (result.changes > 0) {
            console.log(`✅ Updated ${companyName} to category: ${newCategory}`);
            return true;
        } else {
            console.error(`❌ Company not found: ${companyName}`);
            return false;
        }
    } catch (error) {
        console.error(`❌ Error updating ${companyName}:`, error.message);
        return false;
    } finally {
        db.close();
    }
}

// Function to update multiple companies
function updateMultipleCompanies(updates) {
    const db = new Database(INTELLIGENCE_DB);
    let successCount = 0;
    
    try {
        // Use transaction for efficiency and atomicity
        const updateStmt = db.prepare('UPDATE companies SET category = ? WHERE name = ?');
        
        const updateMany = db.transaction((updates) => {
            for (const { company, category } of updates) {
                const result = updateStmt.run(category, company);
                if (result.changes > 0) {
                    successCount++;
                    console.log(`✅ Updated ${company} to category: ${category}`);
                } else {
                    console.warn(`⚠️ Company not found: ${company}`);
                }
            }
        });
        
        updateMany(updates);
        
        console.log(`\n📊 Summary: Updated ${successCount} out of ${updates.length} companies`);
        return successCount;
    } catch (error) {
        console.error('❌ Error during bulk update:', error.message);
        return 0;
    } finally {
        db.close();
    }
}

// Function to add a new category (categories are implicit in the company records)
function getExistingCategories() {
    const db = new Database(INTELLIGENCE_DB);
    
    try {
        const categories = db.prepare('SELECT DISTINCT category FROM companies WHERE category IS NOT NULL').all();
        return categories.map(row => row.category);
    } catch (error) {
        console.error('❌ Error fetching categories:', error.message);
        return [];
    } finally {
        db.close();
    }
}

// Function to generate a category mapping file for the frontend
function generateCategoryMappingFile() {
    const db = new Database(INTELLIGENCE_DB);
    
    try {
        const companies = db.prepare('SELECT name, category FROM companies ORDER BY name').all();
        const categories = [...new Set(companies.map(c => c.category).filter(Boolean))].sort();
        
        const mapping = {
            categories: categories,
            companies: companies.reduce((acc, company) => {
                acc[company.name] = company.category || 'Uncategorized';
                return acc;
            }, {}),
            generated_at: new Date().toISOString()
        };
        
        const outputPath = path.join(__dirname, '..', 'api-data', 'company-categories.json');
        fs.writeFileSync(outputPath, JSON.stringify(mapping, null, 2));
        
        console.log(`✅ Generated category mapping file: ${outputPath}`);
        console.log(`   Categories: ${categories.length}`);
        console.log(`   Companies: ${companies.length}`);
        
        return mapping;
    } catch (error) {
        console.error('❌ Error generating category mapping:', error.message);
        return null;
    } finally {
        db.close();
    }
}

// Main function for CLI usage
function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log('Usage:');
        console.log('  node update-company-categories.js --single <company> <category>');
        console.log('  node update-company-categories.js --bulk <json-file>');
        console.log('  node update-company-categories.js --generate-mapping');
        console.log('  node update-company-categories.js --list-categories');
        console.log('\nExamples:');
        console.log('  node update-company-categories.js --single "OpenAI" "LLM Providers"');
        console.log('  node update-company-categories.js --bulk updates.json');
        console.log('  node update-company-categories.js --generate-mapping');
        return;
    }
    
    const command = args[0];
    
    switch (command) {
        case '--single':
            if (args.length < 3) {
                console.error('❌ Please provide company name and category');
                return;
            }
            updateCompanyCategory(args[1], args[2]);
            // Regenerate mapping after update
            generateCategoryMappingFile();
            break;
            
        case '--bulk':
            if (args.length < 2) {
                console.error('❌ Please provide path to JSON file');
                return;
            }
            try {
                const updates = JSON.parse(fs.readFileSync(args[1], 'utf8'));
                if (!Array.isArray(updates)) {
                    console.error('❌ JSON file must contain an array of {company, category} objects');
                    return;
                }
                updateMultipleCompanies(updates);
                // Regenerate mapping after updates
                generateCategoryMappingFile();
            } catch (error) {
                console.error('❌ Error reading JSON file:', error.message);
            }
            break;
            
        case '--generate-mapping':
            generateCategoryMappingFile();
            break;
            
        case '--list-categories':
            const categories = getExistingCategories();
            console.log('📋 Existing categories:');
            categories.forEach(cat => console.log(`   - ${cat}`));
            console.log(`\nTotal: ${categories.length} categories`);
            break;
            
        default:
            console.error(`❌ Unknown command: ${command}`);
    }
}

// Export functions for use in other scripts
module.exports = {
    updateCompanyCategory,
    updateMultipleCompanies,
    getExistingCategories,
    generateCategoryMappingFile
};

// Run if called directly
if (require.main === module) {
    main();
}
