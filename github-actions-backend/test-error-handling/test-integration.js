#!/usr/bin/env node

// Integration test for analyzer error handling
const path = require('path');
const fs = require('fs');

console.log('🧪 Running analyzer integration test with forced errors...\n');

// Create a test script that uses the actual analyzer with injected errors
const testScript = `
// Only load dotenv in development (not in GitHub Actions)
if (!process.env.GITHUB_ACTIONS && !process.env.POSTGRES_CONNECTION_STRING) {
  try {
    require('dotenv').config();
  } catch (e) {
    // dotenv not available or no .env file - this is fine
  }
}
const path = require('path');

// Override GROQ_API_KEY to simulate API failure
process.env.GROQ_API_KEY = 'invalid-key-for-testing';

console.log('📍 Test location: Analyzer with invalid API key');
console.log('🔧 Expected behavior: Should fail with proper error message and exit code 1\\n');

// Import the actual analyzer wrapper
try {
  require('../ai-analyzer-baseline-wrapper.js');
} catch (error) {
  console.error('Caught error:', error.message);
  process.exit(1);
}
`;

fs.writeFileSync('test-analyzer-integration.js', testScript);

const { spawn } = require('child_process');
const child = spawn('node', ['test-analyzer-integration.js'], {
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
  const hasApiKeyError = errorOutput.includes('Invalid GROQ_API_KEY') || 
                        errorOutput.includes('GROQ_API_KEY environment variable is required');
  const hasProperExit = code === 1;
  
  console.log(`  ${hasApiKeyError ? '✅' : '❌'} Detected invalid API key`);
  console.log(`  ${hasProperExit ? '✅' : '❌'} Exited with code 1`);
  
  // Clean up
  fs.unlinkSync('test-analyzer-integration.js');
  
  if (hasApiKeyError && hasProperExit) {
    console.log('\n✅ Integration test PASSED! Error handling is working correctly.');
  } else {
    console.log('\n❌ Integration test FAILED!');
    console.log('Output:', output);
    console.log('Error output:', errorOutput);
  }
});
