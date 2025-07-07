#!/usr/bin/env node

// Integration test for analyzer error handling with --force flag
const path = require('path');
const fs = require('fs');

console.log('🧪 Running analyzer integration test with --force flag and invalid API...\n');

// Create a test script that uses the actual analyzer with injected errors
const testScript = `
require('dotenv').config();
const path = require('path');

// Override GROQ_API_KEY to simulate API failure
process.env.GROQ_API_KEY = 'invalid-key-for-testing';

console.log('📍 Test location: Analyzer with invalid API key and --force flag');
console.log('🔧 Expected behavior: Should fail when trying to validate API key\\n');

// Add --force to argv
process.argv.push('--force');

// Import the actual analyzer wrapper
try {
  require('../ai-analyzer-baseline-wrapper.js');
} catch (error) {
  console.error('Caught error:', error.message);
  process.exit(1);
}
`;

fs.writeFileSync('test-analyzer-force.js', testScript);

const { spawn } = require('child_process');
const child = spawn('node', ['test-analyzer-force.js'], {
  cwd: __dirname,
  env: { ...process.env, USE_THREE_DB: 'true' }
});

let output = '';
let errorOutput = '';

child.stdout.on('data', (data) => {
  output += data.toString();
  process.stdout.write(data);
});

child.stderr.on('data', (data) => {
  errorOutput += data.toString();
  process.stderr.write(data);
});

child.on('exit', (code) => {
  console.log(`\n📊 Test Results:`);
  console.log(`  Exit code: ${code}`);
  
  // Check for expected error handling
  const hasApiKeyError = output.includes('Failed to validate GROQ_API_KEY') || 
                        errorOutput.includes('Failed to validate GROQ_API_KEY');
  const hasProperExit = code === 1;
  
  console.log(`  ${hasApiKeyError ? '✅' : '❌'} Detected API key validation failure`);
  console.log(`  ${hasProperExit ? '✅' : '❌'} Exited with code 1`);
  
  // Clean up
  fs.unlinkSync('test-analyzer-force.js');
  
  if (hasApiKeyError && hasProperExit) {
    console.log('\n✅ Integration test PASSED! Error handling is working correctly.');
  } else {
    console.log('\n❌ Integration test FAILED!');
    if (!hasApiKeyError) {
      console.log('  Did not detect API key error');
    }
    if (!hasProperExit) {
      console.log('  Did not exit with code 1');
    }
  }
});
