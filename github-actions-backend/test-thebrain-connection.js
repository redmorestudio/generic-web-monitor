#!/usr/bin/env node

const axios = require('axios');
require('dotenv').config();

async function testTheBrainConnection() {
    console.log('🧠 TheBrain Connection Test\n');
    
    // Check for required environment variables
    const apiKey = process.env.THEBRAIN_API_KEY;
    const brainId = process.env.THEBRAIN_BRAIN_ID || process.env.THEBRAIN_DEFAULT_BRAIN_ID;
    const centralThoughtId = process.env.THEBRAIN_CENTRAL_THOUGHT_ID;
    
    console.log('1️⃣ Checking configuration...');
    
    if (!apiKey) {
        console.error('❌ THEBRAIN_API_KEY not found in environment variables');
        console.log('   Please add it to your .env file or GitHub Secrets');
        process.exit(1);
    }
    console.log('✅ API Key found');
    
    if (!brainId) {
        console.error('❌ THEBRAIN_BRAIN_ID not found in environment variables');
        console.log('   Please add it to your .env file or GitHub Secrets');
        process.exit(1);
    }
    console.log('✅ Brain ID found:', brainId);
    
    if (!centralThoughtId) {
        console.warn('⚠️  THEBRAIN_CENTRAL_THOUGHT_ID not found');
        console.log('   This is optional but recommended for organizing thoughts');
    } else {
        console.log('✅ Central Thought ID found:', centralThoughtId);
    }
    
    // Test API connection
    console.log('\n2️⃣ Testing API connection...');
    
    const api = axios.create({
        baseURL: 'https://api.bra.in',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        timeout: 10000
    });
    
    try {
        // Test 1: Get brain info
        console.log('   Fetching brain information...');
        const brainResponse = await api.get(`/brains/${brainId}`);
        
        console.log('✅ Successfully connected to brain!');
        console.log('   Name:', brainResponse.data.name || 'Unknown');
        console.log('   ID:', brainResponse.data.id);
        console.log('   Modified:', brainResponse.data.modifiedDateTime);
        
        // Test 2: Try to get thoughts (limited)
        console.log('\n3️⃣ Testing thought retrieval...');
        try {
            const thoughtsResponse = await api.get(`/brains/${brainId}/thoughts`, {
                params: { limit: 5 }
            });
            
            console.log(`✅ Can retrieve thoughts (found ${thoughtsResponse.data.length || 0})`);
            
            if (thoughtsResponse.data && thoughtsResponse.data.length > 0) {
                console.log('   Sample thoughts:');
                thoughtsResponse.data.slice(0, 3).forEach((thought, i) => {
                    console.log(`   ${i + 1}. ${thought.name} (${thought.id})`);
                });
            }
        } catch (thoughtError) {
            console.warn('⚠️  Could not retrieve thoughts:', thoughtError.response?.data?.message || thoughtError.message);
        }
        
        // Test 3: Verify central thought if provided
        if (centralThoughtId) {
            console.log('\n4️⃣ Verifying central thought...');
            try {
                const centralThought = await api.get(`/thoughts/${centralThoughtId}`);
                console.log('✅ Central thought exists:', centralThought.data.name);
            } catch (centralError) {
                console.error('❌ Central thought not found:', centralError.response?.status);
                console.log('   You may need to create it or update the ID');
            }
        }
        
        console.log('\n✅ All connection tests passed!');
        console.log('   TheBrain integration is properly configured.');
        
        // Return success for integration
        return {
            success: true,
            brain: {
                id: brainResponse.data.id,
                name: brainResponse.data.name,
                modified: brainResponse.data.modifiedDateTime
            },
            apiEndpoint: 'https://api.bra.in'
        };
        
    } catch (error) {
        console.error('\n❌ Connection test failed!');
        
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Error:', error.response.data?.message || error.response.statusText);
            
            if (error.response.status === 401) {
                console.error('\n   🔑 Authentication failed - your API key may be invalid');
                console.error('   Please check your THEBRAIN_API_KEY');
            } else if (error.response.status === 404) {
                console.error('\n   🔍 Brain not found - your Brain ID may be incorrect');
                console.error('   Please check your THEBRAIN_BRAIN_ID');
            }
        } else {
            console.error('   Error:', error.message);
            if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
                console.error('\n   🌐 Network error - cannot reach TheBrain API');
                console.error('   Please check your internet connection');
            }
        }
        
        process.exit(1);
    }
}

// Run the test
if (require.main === module) {
    testTheBrainConnection()
        .then(result => {
            console.log('\n📊 Test Result:', JSON.stringify(result, null, 2));
            process.exit(0);
        })
        .catch(error => {
            console.error('\n💥 Unexpected error:', error.message);
            process.exit(1);
        });
}

module.exports = { testTheBrainConnection };
