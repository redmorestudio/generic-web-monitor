#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Wrapper script for GitHub Actions workflow
// This ensures compatibility regardless of which email script is called

async function main() {
  const command = process.argv[2] || 'check';
  
  console.log(`📧 Email Notification Wrapper - Command: ${command}`);
  console.log('=========================================');
  
  // Use the three-db version
  const scriptPath = path.join(__dirname, 'email-notifications-three-db.js');
  
  // Pass through all arguments except the script name
  const args = [scriptPath, ...process.argv.slice(2)];
  
  // If running in GitHub Actions, ensure we're not in test mode unless explicitly set
  if (process.env.GITHUB_ACTIONS && !process.env.EMAIL_TEST_MODE) {
    console.log('Running in GitHub Actions - Live email mode');
  }
  
  const child = spawn('node', args, {
    stdio: 'inherit',
    env: process.env
  });
  
  child.on('error', (error) => {
    console.error('Failed to start email process:', error);
    process.exit(1);
  });
  
  child.on('exit', (code) => {
    process.exit(code || 0);
  });
}

main().catch(error => {
  console.error('Email wrapper error:', error);
  process.exit(1);
});
