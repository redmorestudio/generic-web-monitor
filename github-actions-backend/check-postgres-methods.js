#!/usr/bin/env node

/**
 * Check PostgreSQL Scripts for pg-promise Methods
 * 
 * This script checks all PostgreSQL scripts for usage of pg-promise methods
 * that are not compatible with our postgres-db.js wrapper.
 * 
 * Our wrapper uses SQLite-style methods:
 * - db.get() - returns first row
 * - db.all() - returns all rows
 * - db.run() - executes without returning results
 * 
 * NOT supported (pg-promise style):
 * - db.one() 
 * - db.oneOrNone()
 * - db.manyOrNone()
 * - db.none()
 */

const fs = require('fs');
const path = require('path');

// Methods that need to be replaced
const problematicMethods = {
  'db.one': 'db.get',
  'db.oneOrNone': 'db.get',
  'db.manyOrNone': 'db.all',
  'db.none': 'db.run'
};

// Find all PostgreSQL JavaScript files
function findPostgresFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules') {
      files.push(...findPostgresFiles(fullPath));
    } else if (entry.isFile() && entry.name.includes('postgres') && entry.name.endsWith('.js')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Check a file for problematic methods
function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  
  for (const [method, replacement] of Object.entries(problematicMethods)) {
    const regex = new RegExp(`\\b${method.replace('.', '\\.')}\\b`, 'g');
    let match;
    let lineNum = 1;
    const lines = content.split('\n');
    
    for (const line of lines) {
      if (regex.test(line)) {
        issues.push({
          line: lineNum,
          method,
          replacement,
          content: line.trim()
        });
      }
      lineNum++;
    }
  }
  
  return issues;
}

// Main execution
console.log('🔍 Checking PostgreSQL scripts for pg-promise methods...\n');

const dir = __dirname;
const postgresFiles = findPostgresFiles(dir);

console.log(`Found ${postgresFiles.length} PostgreSQL files to check:\n`);

let totalIssues = 0;
const filesWithIssues = [];

for (const file of postgresFiles) {
  const relativePath = path.relative(dir, file);
  const issues = checkFile(file);
  
  if (issues.length > 0) {
    totalIssues += issues.length;
    filesWithIssues.push({ file: relativePath, issues });
    
    console.log(`❌ ${relativePath}`);
    for (const issue of issues) {
      console.log(`   Line ${issue.line}: ${issue.method} → ${issue.replacement}`);
      console.log(`   ${issue.content}`);
    }
    console.log('');
  } else {
    console.log(`✅ ${relativePath}`);
  }
}

console.log('\n' + '='.repeat(60));
console.log(`Summary: ${totalIssues} issues found in ${filesWithIssues.length} files`);

if (totalIssues > 0) {
  console.log('\n📝 Files that need fixing:');
  for (const { file, issues } of filesWithIssues) {
    console.log(`   - ${file} (${issues.length} issues)`);
  }
  
  console.log('\n💡 Fix by replacing:');
  for (const [method, replacement] of Object.entries(problematicMethods)) {
    console.log(`   ${method} → ${replacement}`);
  }
  
  process.exit(1);
} else {
  console.log('\n✅ All PostgreSQL scripts are using correct database methods!');
  process.exit(0);
}
