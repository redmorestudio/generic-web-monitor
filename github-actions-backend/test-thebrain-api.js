#!/usr/bin/env node

// Test script for TheBrain API connection
const axios = require('axios');
require('dotenv').config();

async function testTheBrainAPI() {
  console.log('🧠 Testing TheBrain API Connection...\n');
  
  const apiKey = process.env.THEBRAIN_API_KEY;
  const brainId = process.env.THEBRAIN_BRAIN_ID;
  
  if (!apiKey) {
    console.error('❌ THEBRAIN_API_KEY not found in environment variables');
    return false;
  }
  
  if (!brainId) {
    console.error('❌ THEBRAIN_BRAIN_ID not found in environment variables');
    return false;
  }
  
  console.log('📋 Configuration:');
  console.log(`   API Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 5)}`);
  console.log(`   Brain ID: ${brainId}\n`);
  
  const api = axios.create({
    baseURL: 'https://api.bra.in',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    timeout: 10000
  });
  
  try {
    // Test 1: Get Brain Info
    console.log('1️⃣ Testing Brain Access...');
    const brainResponse = await api.get(`/brains/${brainId}`);
    console.log(`   ✅ Brain Name: ${brainResponse.data.name}`);
    console.log(`   ✅ Home Thought ID: ${brainResponse.data.homeThoughtId}\n`);
    
    // Test 2: Search for existing thoughts
    console.log('2️⃣ Testing Search...');
    const searchResponse = await api.get(`/search/${brainId}`, {
      params: {
        queryText: 'AI',
        maxResults: 5
      }
    });
    console.log(`   ✅ Found ${searchResponse.data.length} results\n`);
    
    // Test 3: Create a test thought
    console.log('3️⃣ Testing Thought Creation...');
    const testThought = {
      name: `API Test - ${new Date().toISOString()}`,
      label: '🔧',
      kind: 1, // Normal
      acType: 0 // Public
    };
    
    const createResponse = await api.post(`/thoughts/${brainId}`, testThought);
    const thoughtId = createResponse.data.id;
    console.log(`   ✅ Created thought with ID: ${thoughtId}\n`);
    
    // Test 4: Add a note
    console.log('4️⃣ Testing Note Creation...');
    const noteContent = `# API Test Note

This is a test note created at ${new Date().toLocaleString()}

## Test Results
- API Connection: ✅ Working
- Brain Access: ✅ Verified
- Thought Creation: ✅ Successful
- Note Creation: ✅ In Progress`;
    
    await api.post(`/notes/${brainId}/${thoughtId}/update`, {
      markdown: noteContent
    });
    console.log('   ✅ Note added successfully\n');
    
    // Test 5: Create a link to home thought
    console.log('5️⃣ Testing Link Creation...');
    if (brainResponse.data.homeThoughtId) {
      await api.post(`/links/${brainId}`, {
        thoughtIdA: brainResponse.data.homeThoughtId,
        thoughtIdB: thoughtId,
        relation: 1, // Child
        name: 'API Test'
      });
      console.log('   ✅ Link created successfully\n');
    }
    
    // Test 6: Clean up - delete the test thought
    console.log('6️⃣ Cleaning up...');
    await api.delete(`/thoughts/${brainId}/${thoughtId}`);
    console.log('   ✅ Test thought deleted\n');
    
    console.log('🎉 All API tests passed successfully!');
    console.log('   TheBrain API integration is working correctly.\n');
    
    return true;
    
  } catch (error) {
    console.error('\n❌ API Test Failed:');
    
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${error.response.data.error || error.response.statusText}`);
      
      if (error.response.status === 401) {
        console.error('\n   🔑 Authentication failed. Please check:');
        console.error('      - Is your API key correct?');
        console.error('      - Is the API key active?');
        console.error('      - Does it have the right permissions?');
      } else if (error.response.status === 404) {
        console.error('\n   🔍 Resource not found. Please check:');
        console.error('      - Is the Brain ID correct?');
        console.error('      - Do you have access to this brain?');
      }
    } else if (error.request) {
      console.error('   No response received from API');
      console.error('   Check your internet connection');
    } else {
      console.error(`   Error: ${error.message}`);
    }
    
    return false;
  }
}

// Run the test
if (require.main === module) {
  testTheBrainAPI().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = testTheBrainAPI;
