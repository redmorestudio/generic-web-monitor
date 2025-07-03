// Simple nodemailer test
console.log('Testing nodemailer import...');

try {
  const nodemailer = require('nodemailer');
  console.log('✅ Nodemailer loaded successfully!');
  console.log('Available methods:', Object.keys(nodemailer));
  
  // Try to create a transporter
  const transporter = nodemailer.createTransporter({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'test@example.com',
      pass: 'test'
    }
  });
  
  console.log('✅ Transporter created successfully!');
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}
