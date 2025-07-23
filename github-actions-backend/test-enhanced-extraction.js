#!/usr/bin/env node

/**
 * Test Enhanced Entity Extraction Locally
 * Run this to verify the enhanced analyzer works before deploying
 */

const fs = require('fs');
const path = require('path');
// Only load dotenv in development (not in GitHub Actions)
if (!process.env.GITHUB_ACTIONS && !process.env.POSTGRES_CONNECTION_STRING) {
  try {
    require('dotenv').config();
  } catch (e) {
    // dotenv not available or no .env file - this is fine
  }
}

// Test data - sample content from different companies
const TEST_COMPANIES = [
    {
        company: 'Anthropic',
        url: 'https://anthropic.com',
        content: `
Anthropic is an AI safety company working to build reliable, interpretable, and steerable AI systems. 

Our flagship product is Claude, a family of AI assistants based on our research into training helpful, harmless, and honest AI systems. Claude can help with tasks like analysis, writing, coding, math, and creative projects.

Key Products:
- Claude 3.5 Sonnet: Our most intelligent model, excelling at complex tasks
- Claude 3 Opus: Powerful model for highly complex tasks  
- Claude 3 Haiku: Fast, affordable model for simple tasks
- Claude API: Integrate Claude into your applications
- Claude for Business: Enterprise-grade AI assistant

Technologies We Use:
- Constitutional AI (CAI): Our method for training AI systems to be helpful, harmless, and honest
- RLHF (Reinforcement Learning from Human Feedback)
- Large Language Models with up to 200K context windows
- Transformer architectures
- Advanced safety research techniques

Integrations:
- Slack integration for Claude
- API access via REST and Python SDK
- Zapier automation
- Microsoft Azure partnership

Research Areas:
- AI Alignment and Safety
- Interpretability research
- Constitutional AI development
- Long-context understanding
- Multi-modal AI systems

Leadership:
- Dario Amodei (CEO) - Former VP of Research at OpenAI
- Daniela Amodei (President) - Former VP of Operations at OpenAI
- Chris Olah - Research on neural network interpretability
- Sam McCandlish - Scaling laws research
- Jared Kaplan - Research on model scaling

Use Cases:
- Research and analysis
- Content creation and editing
- Code development and debugging
- Educational tutoring
- Customer support automation
- Data analysis and insights
        `
    },
    {
        company: 'OpenAI',
        url: 'https://openai.com',
        content: `
OpenAI is an AI research and deployment company on a mission to ensure that artificial general intelligence benefits all of humanity.

Products and Services:
- GPT-4: Most capable model for complex reasoning
- GPT-4 Turbo: Optimized for speed and cost
- GPT-3.5 Turbo: Fast, inexpensive model for simple tasks
- DALL-E 3: Advanced image generation
- Whisper: Speech recognition model
- ChatGPT: Consumer AI assistant
- ChatGPT Enterprise: Business-grade ChatGPT
- ChatGPT Team: Collaborative AI for teams

API Offerings:
- Chat Completions API
- Embeddings API
- Fine-tuning API
- Assistants API
- Vision API
- Function calling

Technologies:
- Transformer architectures
- Reinforcement Learning from Human Feedback (RLHF)
- Few-shot learning
- Zero-shot learning
- Chain-of-thought prompting
- WebGPT for web browsing
- Plugins architecture

Partnerships:
- Microsoft: Exclusive cloud partnership, Azure integration
- Bain & Company: Enterprise AI adoption
- Scale AI: Data labeling partnership
- Various enterprise customers

Research Focus:
- AGI development
- AI safety and alignment
- Multimodal models
- Reasoning capabilities
- Tool use and function calling
        `
    }
];

// Import the enhanced analyzer
const { analyzeWithEnhancedPrompt } = require('./ai-analyzer-baseline-enhanced-postgres');

async function testEntityExtraction() {
    console.log('🧪 Testing Enhanced Entity Extraction\n');
    console.log('Using test data (not hitting actual websites)\n');
    
    const results = [];
    
    for (const testCase of TEST_COMPANIES) {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`Testing: ${testCase.company}`);
        console.log(`URL: ${testCase.url}`);
        console.log('='.repeat(60));
        
        try {
            console.log('🔍 Extracting entities...');
            const startTime = Date.now();
            
            const extractedData = await analyzeWithEnhancedPrompt(
                testCase.content,
                testCase.company,
                testCase.url
            );
            
            const elapsed = (Date.now() - startTime) / 1000;
            
            console.log(`\n✅ Extraction completed in ${elapsed.toFixed(1)}s`);
            console.log('\n📊 Extraction Results:');
            console.log(`   Total Entities: ${extractedData.entity_stats.total_entities}`);
            console.log(`   - AI Technologies: ${extractedData.entity_stats.ai_technologies}`);
            console.log(`   - Products: ${extractedData.entity_stats.products}`);
            console.log(`   - Technologies: ${extractedData.entity_stats.technologies}`);
            console.log(`   - Concepts: ${extractedData.entity_stats.concepts}`);
            console.log(`   - Partnerships: ${extractedData.entity_stats.partnerships}`);
            console.log(`   - People: ${extractedData.entity_stats.people}`);
            console.log(`   - Use Cases: ${extractedData.entity_stats.use_cases}`);
            console.log(`   - Competitors: ${extractedData.entity_stats.competitors}`);
            
            console.log(`\n   Total Relationships: ${extractedData.relationship_stats.total_relationships}`);
            console.log('   Relationship Types:');
            for (const [type, count] of Object.entries(extractedData.relationship_stats.relationship_types)) {
                console.log(`     - ${type}: ${count}`);
            }
            
            // Show sample entities
            console.log('\n📝 Sample Extracted Entities:');
            
            if (extractedData.entities.ai_technologies?.length > 0) {
                console.log('\n   AI Technologies:');
                extractedData.entities.ai_technologies.slice(0, 3).forEach(tech => {
                    console.log(`     - ${tech.name} (${tech.type})`);
                    if (tech.vendor) console.log(`       Vendor: ${tech.vendor}`);
                    if (tech.capabilities?.length > 0) {
                        console.log(`       Capabilities: ${tech.capabilities.join(', ')}`);
                    }
                });
            }
            
            if (extractedData.entities.products?.length > 0) {
                console.log('\n   Products:');
                extractedData.entities.products.slice(0, 3).forEach(product => {
                    console.log(`     - ${product.name} (${product.status || 'active'})`);
                    console.log(`       ${product.description}`);
                    if (product.technologies_used?.length > 0) {
                        console.log(`       Uses: ${product.technologies_used.join(', ')}`);
                    }
                });
            }
            
            if (extractedData.entities.partnerships?.length > 0) {
                console.log('\n   Partnerships:');
                extractedData.entities.partnerships.slice(0, 3).forEach(partner => {
                    console.log(`     - ${partner.partner} (${partner.type})`);
                    console.log(`       ${partner.description}`);
                });
            }
            
            if (extractedData.entities.people?.length > 0) {
                console.log('\n   Key People:');
                extractedData.entities.people.slice(0, 3).forEach(person => {
                    console.log(`     - ${person.name} - ${person.title}`);
                    if (person.background) {
                        console.log(`       Background: ${person.background}`);
                    }
                });
            }
            
            // Save detailed results
            const outputDir = path.join(__dirname, 'test-results');
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }
            
            const outputFile = path.join(outputDir, `${testCase.company.toLowerCase()}-entities.json`);
            fs.writeFileSync(outputFile, JSON.stringify(extractedData, null, 2));
            console.log(`\n💾 Full results saved to: ${outputFile}`);
            
            results.push({
                company: testCase.company,
                success: true,
                stats: extractedData.entity_stats,
                relationships: extractedData.relationship_stats
            });
            
        } catch (error) {
            console.error(`\n❌ Extraction failed: ${error.message}`);
            results.push({
                company: testCase.company,
                success: false,
                error: error.message
            });
        }
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    
    const successful = results.filter(r => r.success).length;
    const failed = results.length - successful;
    
    console.log(`\nTotal Tests: ${results.length}`);
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    
    if (successful > 0) {
        const avgEntities = results
            .filter(r => r.success)
            .reduce((sum, r) => sum + r.stats.total_entities, 0) / successful;
        
        const avgRelationships = results
            .filter(r => r.success)
            .reduce((sum, r) => sum + r.relationships.total_relationships, 0) / successful;
        
        console.log(`\nAverage Entities per Company: ${avgEntities.toFixed(1)}`);
        console.log(`Average Relationships per Company: ${avgRelationships.toFixed(1)}`);
    }
    
    // Show failures
    if (failed > 0) {
        console.log('\n❌ Failed Extractions:');
        results.filter(r => !r.success).forEach(r => {
            console.log(`   - ${r.company}: ${r.error}`);
        });
    }
}

// Check if we have API key
if (!process.env.GROQ_API_KEY) {
    console.error('❌ Error: GROQ_API_KEY not found in environment');
    console.error('   Please add it to your .env file:');
    console.error('   GROQ_API_KEY=your-api-key-here');
    process.exit(1);
}

// Run the test
testEntityExtraction()
    .then(() => {
        console.log('\n✅ Test completed successfully!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Test failed:', error);
        process.exit(1);
    });
