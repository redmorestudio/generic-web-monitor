#!/usr/bin/env node

/**
 * Normalize Keywords Script
 * 
 * This script normalizes keywords/entities to prevent case-sensitive duplicates
 * It updates the intelligence database to clean existing data and provides
 * functions for normalizing new data during extraction
 */

const path = require('path');
const Database = require('better-sqlite3');

// Database paths
const DATA_DIR = path.join(__dirname, 'data');
const INTELLIGENCE_DB = path.join(DATA_DIR, 'intelligence.db');

// Normalization function - converts to lowercase and trims whitespace
function normalizeKeyword(keyword) {
    if (!keyword || typeof keyword !== 'string') return keyword;
    return keyword.trim().toLowerCase();
}

// Deduplicate array while preserving original case of first occurrence
function deduplicatePreservingCase(arr) {
    const seen = new Map(); // Map of normalized -> original
    const result = [];
    
    for (const item of arr) {
        if (!item) continue;
        
        const normalized = normalizeKeyword(item);
        if (!seen.has(normalized)) {
            seen.set(normalized, item);
            result.push(item);
        }
    }
    
    return result;
}

// Fix existing data in the database
async function fixExistingData() {
    console.log('🔧 Opening intelligence database...');
    const db = new Database(INTELLIGENCE_DB, { verbose: console.log });
    
    try {
        // Begin transaction for safety
        db.prepare('BEGIN TRANSACTION').run();
        
        // Fix baseline_analysis table
        console.log('\n📊 Fixing baseline_analysis table...');
        const baselineRows = db.prepare('SELECT id, entities FROM baseline_analysis').all();
        let baselineFixed = 0;
        
        for (const row of baselineRows) {
            try {
                const entities = JSON.parse(row.entities || '{}');
                let changed = false;
                
                // Normalize each entity type
                for (const entityType of ['products', 'technologies', 'ai_ml_concepts', 'companies', 'people']) {
                    if (entities[entityType] && Array.isArray(entities[entityType])) {
                        const before = entities[entityType].length;
                        
                        // Handle both string arrays and object arrays
                        if (typeof entities[entityType][0] === 'string') {
                            entities[entityType] = deduplicatePreservingCase(entities[entityType]);
                        } else if (typeof entities[entityType][0] === 'object') {
                            // For objects, deduplicate by name/concept field
                            const seen = new Map();
                            entities[entityType] = entities[entityType].filter(item => {
                                const key = normalizeKeyword(item.name || item.concept || item.partner_name || '');
                                if (seen.has(key)) return false;
                                seen.set(key, true);
                                return true;
                            });
                        }
                        
                        if (entities[entityType].length < before) {
                            changed = true;
                        }
                    }
                }
                
                if (changed) {
                    db.prepare('UPDATE baseline_analysis SET entities = ? WHERE id = ?')
                      .run(JSON.stringify(entities), row.id);
                    baselineFixed++;
                }
            } catch (e) {
                console.error(`Error processing baseline_analysis row ${row.id}:`, e.message);
            }
        }
        
        console.log(`✅ Fixed ${baselineFixed} baseline_analysis records`);
        
        // Fix enhanced_analysis table
        console.log('\n📊 Fixing enhanced_analysis table...');
        const enhancedRows = db.prepare('SELECT id, entities, extracted_text FROM enhanced_analysis').all();
        let enhancedFixed = 0;
        
        for (const row of enhancedRows) {
            try {
                let changed = false;
                
                // Fix entities
                if (row.entities) {
                    const entities = JSON.parse(row.entities);
                    for (const entityType in entities) {
                        if (Array.isArray(entities[entityType])) {
                            const before = entities[entityType].length;
                            
                            if (entities[entityType].length > 0 && typeof entities[entityType][0] === 'string') {
                                entities[entityType] = deduplicatePreservingCase(entities[entityType]);
                            } else if (entities[entityType].length > 0 && typeof entities[entityType][0] === 'object') {
                                const seen = new Map();
                                entities[entityType] = entities[entityType].filter(item => {
                                    const key = normalizeKeyword(item.name || item.concept || '');
                                    if (seen.has(key)) return false;
                                    seen.set(key, true);
                                    return true;
                                });
                            }
                            
                            if (entities[entityType].length < before) {
                                changed = true;
                            }
                        }
                    }
                    
                    if (changed) {
                        db.prepare('UPDATE enhanced_analysis SET entities = ? WHERE id = ?')
                          .run(JSON.stringify(entities), row.id);
                    }
                }
                
                // Fix extracted_text
                if (row.extracted_text) {
                    const extracted = JSON.parse(row.extracted_text);
                    let textChanged = false;
                    
                    for (const field of ['key_phrases', 'technical_terms']) {
                        if (extracted[field] && Array.isArray(extracted[field])) {
                            const before = extracted[field].length;
                            extracted[field] = deduplicatePreservingCase(extracted[field]);
                            if (extracted[field].length < before) {
                                textChanged = true;
                            }
                        }
                    }
                    
                    if (textChanged) {
                        db.prepare('UPDATE enhanced_analysis SET extracted_text = ? WHERE id = ?')
                          .run(JSON.stringify(extracted), row.id);
                        changed = true;
                    }
                }
                
                if (changed) {
                    enhancedFixed++;
                }
            } catch (e) {
                console.error(`Error processing enhanced_analysis row ${row.id}:`, e.message);
            }
        }
        
        console.log(`✅ Fixed ${enhancedFixed} enhanced_analysis records`);
        
        // Commit transaction
        db.prepare('COMMIT').run();
        console.log('\n✅ Database normalization complete!');
        
        // Show some statistics
        const stats = db.prepare(`
            SELECT COUNT(DISTINCT id) as total_baseline
            FROM baseline_analysis
        `).get();
        
        console.log(`\n📊 Final statistics:`);
        console.log(`   Total baseline analyses: ${stats.total_baseline}`);
        console.log(`   Baseline records fixed: ${baselineFixed} (${(baselineFixed/stats.total_baseline*100).toFixed(1)}%)`);
        
    } catch (error) {
        console.error('❌ Error during normalization:', error);
        db.prepare('ROLLBACK').run();
        throw error;
    } finally {
        db.close();
    }
}

// Export functions for use in other scripts
module.exports = {
    normalizeKeyword,
    deduplicatePreservingCase
};

// Run if called directly
if (require.main === module) {
    fixExistingData().catch(console.error);
}
