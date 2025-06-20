#!/usr/bin/env node

const axios = require('axios');
const crypto = require('crypto');

// Simple scraper test without Puppeteer (for quick testing)
async function testScraperFlow() {
  const API_URL = 'http://localhost:3000/api';
  
  console.log('🧪 Testing scraper flow (simulated)...\n');
  
  try {
    // Get a URL to "scrape"
    const company = await axios.get(`${API_URL}/companies/1`);
    const url = company.data.urls[0];
    
    console.log(`📄 Simulating scrape of: ${url.url}`);
    
    // Simulate extracted content
    const simulatedContent = {
      title: 'OpenAI - Artificial Intelligence Research',
      metaDescription: 'OpenAI is an AI research company working on safe AGI',
      mainContent: `OpenAI is an artificial intelligence research laboratory consisting of 
      the for-profit corporation OpenAI LP and its parent company, the non-profit 
      OpenAI Inc. We're working on safe AGI that benefits all of humanity.
      
      Our latest model GPT-4 represents a significant advancement in large language
      models with improved reasoning capabilities. ChatGPT has over 100 million users
      worldwide. DALL-E 3 can generate images from text descriptions with unprecedented
      quality.`,
      fullText: 'Full page content would go here...'
    };
    
    // Calculate content hash
    const contentHash = crypto
      .createHash('sha256')
      .update(simulatedContent.mainContent)
      .digest('hex');
    
    console.log(`   Content hash: ${contentHash.substring(0, 16)}...`);
    
    // Store snapshot
    const snapshot = await axios.post(`${API_URL}/content-snapshots`, {
      url_id: url.id,
      content_hash: contentHash,
      full_content: simulatedContent.fullText.substring(0, 1000),
      extracted_content: simulatedContent.mainContent,
      title: simulatedContent.title,
      meta_description: simulatedContent.metaDescription
    });
    
    console.log(`✅ Snapshot stored! ID: ${snapshot.data.id}`);
    console.log(`   Word count: ${snapshot.data.word_count}`);
    console.log(`   Char count: ${snapshot.data.char_count}`);
    
    // Simulate a change by creating another snapshot with different content
    console.log('\n📄 Simulating content change...');
    
    const changedContent = simulatedContent.mainContent + `
    
    NEW: We're excited to announce GPT-5 is coming soon with multimodal capabilities
    and enhanced reasoning. Pricing updates will be announced next week.`;
    
    const newHash = crypto
      .createHash('sha256')
      .update(changedContent)
      .digest('hex');
    
    const newSnapshot = await axios.post(`${API_URL}/content-snapshots`, {
      url_id: url.id,
      content_hash: newHash,
      full_content: simulatedContent.fullText + ' Updated content...',
      extracted_content: changedContent,
      title: simulatedContent.title + ' - Updated',
      meta_description: simulatedContent.metaDescription
    });
    
    console.log(`✅ New snapshot stored! ID: ${newSnapshot.data.id}`);
    
    // Check diff endpoint
    const diff = await axios.get(`${API_URL}/diff/${snapshot.data.id}/${newSnapshot.data.id}`);
    
    console.log(`\n🔍 Change detected!`);
    console.log(`   Change percentage: ${diff.data.change.change_percentage.toFixed(1)}%`);
    console.log(`   Additions: ${diff.data.change.additions_count} words`);
    console.log(`   Deletions: ${diff.data.change.deletions_count} words`);
    
    console.log('\n🎉 Scraper flow test complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

// Run the test
testScraperFlow();
