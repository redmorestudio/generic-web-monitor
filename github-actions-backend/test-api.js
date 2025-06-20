#!/usr/bin/env node

const axios = require('axios');
const { spawn } = require('child_process');

const API_URL = 'http://localhost:3000/api';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testAPI() {
  console.log('🧪 Starting API tests...\n');
  
  try {
    // Test 1: Health check
    console.log('1️⃣ Testing health endpoint...');
    const health = await axios.get(`${API_URL}/health`);
    console.log('✅ Health check:', health.data);
    console.log('');
    
    // Test 2: List companies
    console.log('2️⃣ Testing company list...');
    const companies = await axios.get(`${API_URL}/companies`);
    console.log(`✅ Found ${companies.data.length} companies:`);
    companies.data.forEach(c => {
      console.log(`   - ${c.name} (${c.url_count} URLs)`);
    });
    console.log('');
    
    // Test 3: Get company details
    console.log('3️⃣ Testing company details...');
    const company = await axios.get(`${API_URL}/companies/1`);
    console.log(`✅ Company: ${company.data.name}`);
    console.log(`   URLs: ${company.data.urls.length}`);
    company.data.urls.forEach(u => {
      console.log(`   - ${u.url} (${u.type})`);
    });
    console.log('');
    
    // Test 4: Dashboard
    console.log('4️⃣ Testing dashboard endpoint...');
    const dashboard = await axios.get(`${API_URL}/dashboard`);
    console.log('✅ Dashboard stats:', dashboard.data.stats);
    console.log('');
    
    // Test 5: Configuration
    console.log('5️⃣ Testing configuration...');
    const config = await axios.get(`${API_URL}/config`);
    console.log('✅ Configuration:');
    Object.entries(config.data).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`);
    });
    console.log('');
    
    console.log('🎉 All API tests passed!\n');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

async function main() {
  // Start the server
  console.log('🚀 Starting API server...\n');
  
  const server = spawn('node', ['server.js'], {
    cwd: __dirname,
    env: { ...process.env, PORT: 3000 }
  });
  
  server.stdout.on('data', (data) => {
    console.log(`[SERVER] ${data.toString().trim()}`);
  });
  
  server.stderr.on('data', (data) => {
    console.error(`[SERVER ERROR] ${data.toString().trim()}`);
  });
  
  // Wait for server to start
  await sleep(2000);
  
  // Run tests
  await testAPI();
  
  // Cleanup
  console.log('🛑 Shutting down server...');
  server.kill('SIGINT');
  
  // Wait for graceful shutdown
  await sleep(1000);
  process.exit(0);
}

// Handle errors
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
  process.exit(1);
});

// Run the test
main();
