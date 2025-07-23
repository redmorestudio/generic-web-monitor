#!/usr/bin/env node

/**
 * AI-Enhanced Change Analyzer
 * 
 * Simple AI analysis to explain what changed in human-readable terms
 * Leverages existing interest scoring and infrastructure
 */

const Groq = require('groq-sdk');
const dbManager = require('./db-manager');
// Only load dotenv in development (not in GitHub Actions)
if (!process.env.GITHUB_ACTIONS && !process.env.POSTGRES_CONNECTION_STRING) {
  try {
    require('dotenv').config();
  } catch (e) {
    // dotenv not available or no .env file - this is fine
  }
}

// Initialize AI client - prefer Groq, fallback to mock for testing
let groq = null;
let useGroq = false;

if (process.env.GROQ_API_KEY) {
  groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
  });
  useGroq = true;
  console.log('✅ Using Groq API for AI analysis');
} else {
  console.log('⚠️ No GROQ_API_KEY found - using mock analysis for demo');
}

/**
 * Analyze a change and generate a human-readable explanation
 * @param {Object} change - Change object with old/new content
 * @param {Object} companyContext - Company information for context
 * @returns {Object} Enhanced change analysis
 */
async function analyzeChange(change, companyContext) {
  try {
    // Skip if no content to analyze
    if (!change.old_content || !change.new_content) {
      return {
        explanation: "Initial content capture - no previous version to compare.",
        key_changes: [],
        business_context: null
      };
    }
    
    // If no API key, use smart mock analysis
    if (!useGroq) {
      return mockAnalyzeChange(change, companyContext);
    }

    const prompt = `You are analyzing a website content change for competitive intelligence. 

Company: ${companyContext.name}
Company Type: ${companyContext.category}
URL: ${change.url}
Page Type: ${change.url_type || 'general'}

Previous Content (partial):
${change.old_content.substring(0, 1000)}

New Content (partial):
${change.new_content.substring(0, 1000)}

Please provide:
1. A clear, concise explanation of what changed (2-3 sentences max)
2. List the 3-5 most important specific changes (bullet points)
3. Brief business context - why might they have made these changes? (1-2 sentences)

Focus on factual observations, not speculation. Be specific about what changed.`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a competitive intelligence analyst. Provide clear, factual analysis of website changes."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "mixtral-8x7b-32768",
      temperature: 0.3,
      max_tokens: 500
    });

    const response = completion.choices[0]?.message?.content || '';
    
    // Parse the response into structured format
    const sections = response.split('\n\n');
    const explanation = sections[0] || "Change detected but analysis unavailable.";
    
    // Extract bullet points
    const keyChanges = [];
    const bulletSection = sections.find(s => s.includes('•') || s.includes('-') || s.includes('*'));
    if (bulletSection) {
      const bullets = bulletSection.split('\n').filter(line => 
        line.trim().startsWith('•') || 
        line.trim().startsWith('-') || 
        line.trim().startsWith('*')
      );
      keyChanges.push(...bullets.map(b => b.replace(/^[•\-\*]\s*/, '').trim()));
    }
    
    // Extract business context
    const contextSection = sections[sections.length - 1];
    const businessContext = contextSection && !contextSection.includes('•') ? 
      contextSection.trim() : null;

    return {
      explanation: explanation.trim(),
      key_changes: keyChanges.slice(0, 5), // Limit to 5
      business_context: businessContext,
      analyzed_at: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error analyzing change:', error);
    return {
      explanation: "Change detected - AI analysis unavailable.",
      key_changes: [],
      business_context: null,
      error: error.message
    };
  }
}

/**
 * Process all recent changes and add AI explanations
 */
async function processRecentChanges() {
  console.log('🤖 Starting AI change analysis...');
  
  const processedDb = dbManager.getProcessedDb();
  const intelligenceDb = dbManager.getIntelligenceDb();
  
  try {
    // First, add the AI columns if they don't exist
    try {
      processedDb.exec(`ALTER TABLE change_detection ADD COLUMN ai_explanation TEXT;`);
    } catch (e) { /* Column may already exist */ }
    
    try {
      processedDb.exec(`ALTER TABLE change_detection ADD COLUMN ai_key_changes TEXT;`);
    } catch (e) { /* Column may already exist */ }
    
    try {
      processedDb.exec(`ALTER TABLE change_detection ADD COLUMN ai_business_context TEXT;`);
    } catch (e) { /* Column may already exist */ }
    
    // Get recent changes that haven't been AI-analyzed yet
    const recentChanges = processedDb.prepare(`
      SELECT 
        cd.*,
        mc_old.markdown_text as old_content,
        mc_new.markdown_text as new_content
      FROM change_detection cd
      LEFT JOIN markdown_content mc_old ON cd.old_content_id = mc_old.id
      LEFT JOIN markdown_content mc_new ON cd.new_content_id = mc_new.id
      WHERE cd.detected_at > datetime('now', '-7 days')
        AND (cd.ai_explanation IS NULL OR cd.ai_explanation = '')
      ORDER BY cd.detected_at DESC
      LIMIT 20
    `).all();
    
    console.log(`Found ${recentChanges.length} changes to analyze`);
    
    // Prepare update statement
    const updateStmt = processedDb.prepare(`
      UPDATE change_detection 
      SET ai_explanation = ?,
          ai_key_changes = ?,
          ai_business_context = ?
      WHERE id = ?
    `);
    
    // Process each change
    for (const change of recentChanges) {
      console.log(`Analyzing change ${change.id} for URL: ${change.url_id}`);
      
      // Get company context
      const company = intelligenceDb.prepare(`
        SELECT c.* 
        FROM companies c
        JOIN urls u ON c.id = u.company_id
        WHERE u.id = ?
      `).get(change.url_id);
      
      if (!company) {
        console.log(`Skipping - no company found for URL ${change.url_id}`);
        continue;
      }
      
      // Analyze the change
      const analysis = await analyzeChange(change, company);
      
      // Update database
      updateStmt.run(
        analysis.explanation,
        JSON.stringify(analysis.key_changes),
        analysis.business_context,
        change.id
      );
      
      console.log(`✅ Analyzed change ${change.id}: ${analysis.explanation.substring(0, 50)}...`);
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('✅ AI change analysis complete!');
    
  } catch (error) {
    console.error('❌ Error in AI change analysis:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  processRecentChanges();
}

/**
 * Mock analyzer for testing without API key
 */
function mockAnalyzeChange(change, companyContext) {
  // Simple heuristic analysis based on content differences
  const oldContent = change.old_content.toLowerCase();
  const newContent = change.new_content.toLowerCase();
  
  const keyChanges = [];
  
  // Check for common patterns
  if (newContent.includes('gpt-5') && !oldContent.includes('gpt-5')) {
    keyChanges.push('New GPT-5 model announcement detected');
  }
  if (newContent.includes('pricing') && !oldContent.includes('pricing')) {
    keyChanges.push('New pricing information added');
  }
  if (newContent.includes('api') && !oldContent.includes('api')) {
    keyChanges.push('API-related content added');
  }
  if (newContent.includes('launch') || newContent.includes('announce')) {
    keyChanges.push('Product launch or announcement detected');
  }
  if (newContent.includes('partner') && !oldContent.includes('partner')) {
    keyChanges.push('New partnership information');
  }
  
  // Generate explanation based on findings
  let explanation = `Content updated on ${companyContext.name}'s ${change.url_type || 'page'}.`;
  if (keyChanges.length > 0) {
    explanation = `Significant updates detected on ${companyContext.name}'s ${change.url_type || 'page'} including ${keyChanges[0].toLowerCase()}.`;
  }
  
  // Business context based on company category
  let businessContext = null;
  if (companyContext.category === 'LLM Providers' && keyChanges.length > 0) {
    businessContext = 'Updates may indicate competitive positioning in the AI market or response to industry developments.';
  } else if (keyChanges.includes('pricing')) {
    businessContext = 'Pricing changes often reflect market dynamics or strategic repositioning.';
  }
  
  return {
    explanation,
    key_changes: keyChanges.slice(0, 5),
    business_context: businessContext,
    analyzed_at: new Date().toISOString()
  };
}

module.exports = { analyzeChange, processRecentChanges };
