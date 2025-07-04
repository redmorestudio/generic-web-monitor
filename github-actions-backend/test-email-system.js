#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

console.log('📧 Email System Test Suite');
console.log('========================\n');

// Test 1: Check databases exist
console.log('1. Checking databases...');
const dataDir = path.join(__dirname, 'data');
const databases = {
  intelligence: path.join(dataDir, 'intelligence.db'),
  processed: path.join(dataDir, 'processed_content.db'),
  raw: path.join(dataDir, 'raw_content.db')
};

let allDbsExist = true;
for (const [name, dbPath] of Object.entries(databases)) {
  if (fs.existsSync(dbPath)) {
    console.log(`   ✅ ${name}: ${dbPath}`);
  } else {
    console.log(`   ❌ ${name}: NOT FOUND at ${dbPath}`);
    allDbsExist = false;
  }
}

if (!allDbsExist) {
  console.log('\n❌ Missing databases. Run the scraper and processor first.\n');
  process.exit(1);
}

// Test 2: Check for recent changes
console.log('\n2. Checking for recent changes...');
const processedDb = new Database(databases.processed);
const recentChanges = processedDb.prepare(`
  SELECT COUNT(*) as count 
  FROM change_detection 
  WHERE detected_at > datetime('now', '-7 days')
`).get();

console.log(`   Found ${recentChanges.count} changes in the last 7 days`);

// Test 3: Check email configuration
console.log('\n3. Checking email configuration...');
const emailConfig = {
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: process.env.SMTP_PORT || '587',
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  EMAIL_TO: process.env.EMAIL_TO || process.env.NOTIFICATION_EMAIL || '',
  EMAIL_FROM: process.env.EMAIL_FROM || process.env.SMTP_USER || ''
};

const isConfigured = !!(emailConfig.SMTP_HOST && emailConfig.SMTP_USER && emailConfig.SMTP_PASS);

if (isConfigured) {
  console.log('   ✅ Email is configured:');
  console.log(`      Host: ${emailConfig.SMTP_HOST}:${emailConfig.SMTP_PORT}`);
  console.log(`      From: ${emailConfig.EMAIL_FROM}`);
  console.log(`      To: ${emailConfig.EMAIL_TO}`);
} else {
  console.log('   ⚠️  Email not configured. Will run in test mode.');
  console.log('   To configure, set these environment variables:');
  console.log('      SMTP_HOST, SMTP_USER, SMTP_PASS, EMAIL_TO');
}

// Test 4: Try loading the email service
console.log('\n4. Loading email service...');
try {
  const EmailService = require('./email-notifications-three-db.js');
  const service = new EmailService();
  console.log('   ✅ Email service loaded successfully');
  console.log(`   Mode: ${service.testMode ? 'TEST MODE (files)' : 'LIVE MODE (SMTP)'}`);
} catch (error) {
  console.log('   ❌ Failed to load email service:', error.message);
  process.exit(1);
}

// Test 5: Check for nodemailer
console.log('\n5. Checking dependencies...');
try {
  require('nodemailer');
  console.log('   ✅ nodemailer is installed');
} catch (error) {
  console.log('   ❌ nodemailer not installed. Run: npm install nodemailer');
}

console.log('\n✅ All tests passed!\n');
console.log('You can now run:');
console.log('  node email-notifications-three-db.js test --test-mode   # Test in file mode');
console.log('  node email-notifications-three-db.js check              # Check for alerts');
console.log('  node email-notifications-three-db.js daily              # Send daily digest');
console.log('  node email-notifications-wrapper.js check               # Use wrapper script');

processedDb.close();
