#!/usr/bin/env node

console.log('=== Environment Variable Test ===');
console.log('');

// List of environment variables to check
const envVars = [
  'SMTP_HOST',
  'SMTP_PORT', 
  'SMTP_USER',
  'SMTP_PASS',
  'NOTIFICATION_EMAIL',
  'SMTP_SECURE',
  'EMAIL_THRESHOLD'
];

// Check each variable
envVars.forEach(varName => {
  const value = process.env[varName];
  
  if (value === undefined) {
    console.log(`${varName}: undefined (not set)`);
  } else if (value === '') {
    console.log(`${varName}: "" (empty string)`);
  } else if (value === null) {
    console.log(`${varName}: null`);
  } else {
    // Mask sensitive values
    const maskedValue = varName.includes('PASS') ? '***' : value.substring(0, 3) + '***';
    console.log(`${varName}: "${maskedValue}" (length: ${value.length})`);
  }
});

console.log('');
console.log('=== Checking email configuration ===');

const isConfigured = !!(
  process.env.SMTP_HOST && 
  process.env.SMTP_USER && 
  process.env.SMTP_PASS
);

console.log('Email configured:', isConfigured ? 'YES' : 'NO');

if (!isConfigured) {
  console.log('');
  console.log('Missing requirements:');
  if (!process.env.SMTP_HOST) console.log('- SMTP_HOST is missing or empty');
  if (!process.env.SMTP_USER) console.log('- SMTP_USER is missing or empty');
  if (!process.env.SMTP_PASS) console.log('- SMTP_PASS is missing or empty');
}

console.log('');
console.log('=== GitHub Actions Context ===');
console.log('GITHUB_ACTIONS:', process.env.GITHUB_ACTIONS || 'not set');
console.log('GITHUB_WORKFLOW:', process.env.GITHUB_WORKFLOW || 'not set');
console.log('GITHUB_RUN_ID:', process.env.GITHUB_RUN_ID || 'not set');
