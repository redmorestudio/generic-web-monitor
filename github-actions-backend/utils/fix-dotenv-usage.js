#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const backendDir = '/Users/sethredmore/ai-competitive-monitor/github-actions-backend';

// Find all JS files that use require('dotenv')
function findFilesWithDotenv(dir) {
  const files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    
    if (item.isDirectory()) {
      files.push(...findFilesWithDotenv(fullPath));
    } else if (item.isFile() && item.name.endsWith('.js')) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes("require('dotenv')")) {
          files.push(fullPath);
        }
      } catch (e) {
        console.log(`Skipping ${fullPath}: ${e.message}`);
      }
    }
  }
  
  return files;
}

// Fix a single file
function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace require('dotenv').config() with conditional loading
    const oldPattern = /require\('dotenv'\)\.config\(\);?/g;
    const newCode = `// Only load dotenv in development (not in GitHub Actions)
if (!process.env.GITHUB_ACTIONS && !process.env.POSTGRES_CONNECTION_STRING) {
  try {
    require('dotenv').config();
  } catch (e) {
    // dotenv not available or no .env file - this is fine
  }
}`;
    
    const newContent = content.replace(oldPattern, newCode);
    
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent);
      console.log(`✅ Fixed: ${path.relative(backendDir, filePath)}`);
      return true;
    } else {
      console.log(`⏭️  No changes needed: ${path.relative(backendDir, filePath)}`);
      return false;
    }
  } catch (e) {
    console.log(`❌ Error fixing ${filePath}: ${e.message}`);
    return false;
  }
}

// Main function
function main() {
  console.log('🔧 Fixing dotenv usage in all JavaScript files...\n');
  
  const files = findFilesWithDotenv(backendDir);
  console.log(`Found ${files.length} files with dotenv usage\n`);
  
  let fixed = 0;
  for (const file of files) {
    if (fixFile(file)) {
      fixed++;
    }
  }
  
  console.log(`\n✅ Fixed ${fixed} files out of ${files.length} total`);
  console.log('🚀 All files now use conditional dotenv loading for GitHub Actions compatibility');
}

main();
