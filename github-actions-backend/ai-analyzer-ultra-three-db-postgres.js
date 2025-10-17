#!/usr/bin/env node

// SSL Certificate fix for Heroku PostgreSQL
if (process.env.NODE_ENV === 'production' || process.env.POSTGRES_CONNECTION_STRING) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const Groq = require('groq-sdk');
const path = require('path');
const fs = require('fs');
const { db, end } = require('./postgres-db');
// Only load dotenv in development (not in GitHub Actions)
if (!process.env.GITHUB_ACTIONS && !process.env.POSTGRES_CONNECTION_STRING) {
  try {
    require('dotenv').config();
  } catch (e) {
    // dotenv not available or no .env file - this is fine
  }
}

// Validate API key
if (!process.env.GROQ_API_KEY) {
  console.error('❌ Error: GROQ_API_KEY environment variable is required');
  process.exit(1);
}

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Error tracking class
class AnalysisErrorTracker {
  constructor() {
    this.errors = [];
    this.failedChanges = [];
    this.criticalErrors = 0;
    this.successCount = 0;
  }
  
  addError(change, error, critical = false) {
    this.errors.push({ 
      change_id: change.id,
      company: change.company,
      url: change.url_name,
      error: error.message, 
      timestamp: new Date().toISOString() 
    });
    this.failedChanges.push(change.id);
    if (critical) this.criticalErrors++;
  }
  
  addSuccess() {
    this.successCount++;
  }
  
  hasErrors() {
    return this.errors.length > 0;
  }
  
  getReport() {
    return {
      totalProcessed: this.successCount + this.errors.length,
      successful: this.successCount,
      failed: this.errors.length,
      criticalErrors: this.criticalErrors,
      errors: this.errors
    };
  }
}

// Enhanced extraction prompt for change analysis
const ENHANCED_CHANGE_PROMPT = `You are an AI competitive intelligence analyst specializing in deep content extraction and change analysis. Analyze what changed between these two versions of content and extract comprehensive intelligence.

CRITICAL: Focus on WHAT CHANGED and WHY IT MATTERS.

Extract the following from the CHANGES:

1. **Change Summary** (CRITICAL):
   - What specifically changed (be precise)
   - Type of change (content addition, removal, update, restructure)
   - Scale of change (minor tweak, significant update, major overhaul)

2. **Strategic Significance**:
   - Why this change was likely made
   - Business implications
   - Market signals this sends
   - Competitive positioning impact

3. **Entities Affected** - From the changed content, identify:
   - New products or features announced
   - Pricing changes
   - New partnerships or integrations
   - Technology updates
   - Personnel changes
   - Market expansions

4. **Interest Assessment** (CRITICAL - Score 1-10):
   - 9-10: Major strategic moves (new products, acquisitions, major pivots)
   - 7-8: Significant updates (important features, partnerships, pricing)
   - 5-6: Notable changes (minor features, team updates, content refresh)
   - 3-4: Routine updates (typo fixes, minor UI changes)
   - 1-2: Trivial changes (formatting, wording tweaks)

5. **Competitive Intelligence**:
   - Competitive advantages revealed
   - Market positioning changes
   - Strategic direction indicators
   - Innovation signals

6. **Actionable Insights**:
   - What actions should we consider based on this change
   - How this affects our competitive landscape
   - Opportunities or threats identified

Provide your analysis in this JSON structure:
{
  "change_summary": {
    "what_changed": "",
    "change_type": "addition/removal/update/restructure",
    "change_scale": "minor/significant/major",
    "specific_changes": []
  },
  "interest_assessment": {
    "interest_level": 0,
    "reasoning": "",
    "category": "strategic_move/product_update/partnership/pricing/content_update/minor_change",
    "confidence": 0.0
  },
  "entities": {
    "products": [],
    "features": [],
    "partnerships": [],
    "technologies": [],
    "people": [],
    "pricing": [],
    "markets": []
  },
  "strategic_analysis": {
    "business_impact": "",
    "market_signals": [],
    "competitive_implications": "",
    "strategic_direction": ""
  },
  "insights": {
    "key_findings": [],
    "opportunities": [],
    "threats": [],
    "recommended_actions": []
  }
}`;

async function analyzeChangeWithGroq(beforeContent, afterContent, company, url) {
  const maxRetries = 3;
  const baseDelay = 5000;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are an AI competitive intelligence analyst. Always respond with valid JSON only, no markdown formatting."
          },
          {
            role: "user",
            content: `${ENHANCED_CHANGE_PROMPT}

Company: ${company}
URL: ${url}

BEFORE CONTENT:
${beforeContent || '[This is new content - no previous version]'}

AFTER CONTENT:
${afterContent}

Analyze what changed and its significance.`
          }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.1,
        max_tokens: 4000,
        response_format: { type: "json_object" }
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('Empty response from Groq');
      }

      return JSON.parse(response);
    } catch (error) {
      const isRateLimitError = error.status === 429 || error.message?.includes('rate limit');
      
      if (isRateLimitError && attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(`   ⏳ Rate limited. Waiting ${delay/1000}s before retry ${attempt}/${maxRetries}...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      if (attempt === maxRetries) {
        throw error;
      }
    }
  }
}

async function processRecentChanges(mode = 'recent') {
  console.log('🔍 Starting ultra-enhanced change analysis with PostgreSQL...');
  console.log(`📊 Mode: ${mode === 'full' ? 'FULL - Processing all changes' : 'RECENT - Last 24 hours only'}`);
  console.log('⚡ Using Groq Llama 3.3 for ultra-fast inference\n');

  const errorTracker = new AnalysisErrorTracker();

  try {
    // Get changes based on mode
    let timeFilter = '';
    if (mode !== 'full') {
      timeFilter = "WHERE cd.detected_at > NOW() - INTERVAL '24 hours'";
    }

    const changes = await db.all(`
      SELECT 
        cd.id,
        cd.company,
        cd.url_name,
        cd.change_type,
        cd.old_hash,
        cd.new_hash,
        cd.detected_at,
        cd.interest_level as initial_interest,
        cd.ai_analysis as initial_analysis
      FROM processed_content.change_detection cd
      ${timeFilter}
      ORDER BY cd.detected_at DESC
      LIMIT 500
    `);

    console.log(`📋 Found ${changes.length} changes to analyze\n`);

    if (changes.length === 0) {
      console.log('✅ No changes to process');
      return;
    }

    let processed = 0;
    const startTime = Date.now();

    for (const change of changes) {
      processed++;
      const progress = Math.round((processed / changes.length) * 100);
      
      console.log(`\n[${processed}/${changes.length}] (${progress}%) Analyzing change for ${change.company}`);
      console.log(`   📍 ${change.url_name}`);
      console.log(`   🔄 Type: ${change.change_type}`);
      
      try {
        // Skip if already has enhanced analysis (unless in full mode)
        if (mode !== 'full') {
          const existing = await db.get(
            'SELECT id FROM intelligence.enhanced_analysis WHERE change_id = $1',
            [change.id]
          );
          if (existing) {
            console.log('   ⏭️  Already analyzed, skipping');
            continue;
          }
        }

        // Get the actual content for before/after comparison
        let beforeContent = null;
        let afterContent = null;

        if (change.old_hash) {
          const before = await db.get(`
            SELECT content 
            FROM processed_content.markdown_pages 
            WHERE source_hash = $1
          `, [change.old_hash]);
          beforeContent = before?.content;
        }

        if (change.new_hash) {
          const after = await db.get(`
            SELECT content 
            FROM processed_content.markdown_pages 
            WHERE source_hash = $1
          `, [change.new_hash]);
          afterContent = after?.content;
        }

        if (!afterContent) {
          console.log('   ⚠️  No content found for analysis');
          continue;
        }

        // Analyze with Groq
        console.log('   🧠 Performing ultra-enhanced analysis...');
        const analysis = await analyzeChangeWithGroq(
          beforeContent?.substring(0, 15000),
          afterContent.substring(0, 15000),
          change.company,
          change.url_name
        );

        // Store the enhanced analysis
        const interestLevel = analysis.interest_assessment?.interest_level || change.initial_interest || 5;
        
        // First, create or update the change record in intelligence.changes
        const changeResult = await db.run(`
          INSERT INTO intelligence.changes 
          (company, url, detected_at, change_type, before_content, after_content,
           analysis, interest_level, ai_confidence, content_hash_before, content_hash_after,
           markdown_before, markdown_after, ai_model)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          ON CONFLICT (company, url, detected_at) DO UPDATE SET
            analysis = EXCLUDED.analysis,
            interest_level = EXCLUDED.interest_level,
            ai_confidence = EXCLUDED.ai_confidence
          RETURNING id
        `, [
          change.company,
          change.url_name,
          change.detected_at,
          change.change_type,
          beforeContent?.substring(0, 1000) || '',
          afterContent.substring(0, 1000) || '',
          JSON.stringify(analysis),  // FIXED: Store FULL analysis, not just change_summary
          interestLevel,
          analysis.interest_assessment?.confidence || 0.8,
          change.old_hash,
          change.new_hash,
          beforeContent,
          afterContent,
          'groq-llama-3.3-70b'
        ]);

        // Get the ID from the insert/update
        const changeRecord = await db.get(`
          SELECT id FROM intelligence.changes
          WHERE company = $1 AND url = $2 AND detected_at = $3
        `, [change.company, change.url_name, change.detected_at]);

        // Get company_id for enhanced_analysis
        const companyData = await db.get(`
          SELECT id FROM intelligence.companies WHERE name = $1
        `, [change.company]);
        
        // If company doesn't exist, create it
        let companyId = companyData?.id;
        if (!companyId) {
          const newCompany = await db.get(`
            INSERT INTO intelligence.companies (name, category, interest_level)
            VALUES ($1, 'auto-created', 5)
            ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
            RETURNING id
          `, [change.company]);
          companyId = newCompany.id;
          console.log(`   📌 Created new company: ${change.company} (ID: ${companyId})`);
        }
        
        // Get content_id from markdown_pages
        const contentData = await db.get(`
          SELECT id FROM processed_content.markdown_pages WHERE source_hash = $1
        `, [change.new_hash]);

        // Then store the enhanced analysis - FIXED: Pass JSONB data as JavaScript objects, not strings
        await db.run(`
          INSERT INTO intelligence.enhanced_analysis
          (company_id, content_id, change_id, ultra_analysis, key_insights, business_impact, 
           competitive_implications, market_signals, risk_assessment, 
           opportunity_score, analysis_timestamp, ai_model)
          VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, $6, $7, $8::jsonb, $9::jsonb, $10, NOW(), $11)
          ON CONFLICT (change_id) DO UPDATE SET
            company_id = EXCLUDED.company_id,
            content_id = EXCLUDED.content_id,
            ultra_analysis = EXCLUDED.ultra_analysis,
            key_insights = EXCLUDED.key_insights,
            business_impact = EXCLUDED.business_impact,
            competitive_implications = EXCLUDED.competitive_implications,
            market_signals = EXCLUDED.market_signals,
            risk_assessment = EXCLUDED.risk_assessment,
            opportunity_score = EXCLUDED.opportunity_score,
            analysis_timestamp = NOW()
        `, [
          companyId,  // company_id (guaranteed to exist now)
          contentData?.id || null,  // content_id (can be null if content not found)
          changeRecord.id,
          JSON.stringify(analysis),  // ultra_analysis as JSONB - PostgreSQL will parse this
          JSON.stringify(analysis.insights?.key_findings || []),  // key_insights as JSONB
          analysis.strategic_analysis?.business_impact || '',
          analysis.strategic_analysis?.competitive_implications || '',
          JSON.stringify(analysis.strategic_analysis?.market_signals || []),  // market_signals as JSONB
          JSON.stringify(analysis.insights?.threats || []),  // risk_assessment as JSONB
          interestLevel,
          'groq-llama-3.3-70b'
        ]);

        console.log(`   ✅ Enhanced analysis complete (interest: ${interestLevel}/10)`);
        errorTracker.addSuccess();
        
      } catch (error) {
        console.error(`   ❌ Analysis failed:`, error.message);
        errorTracker.addError(change, error);
      }

      // Progress update every 10 changes
      if (processed % 10 === 0) {
        const elapsed = (Date.now() - startTime) / 1000;
        const rate = processed / elapsed;
        console.log(`\n⏱️  Progress: ${processed}/${changes.length}`);
        console.log(`   Rate: ${rate.toFixed(1)} changes/sec`);
      }
    }

    const totalTime = (Date.now() - startTime) / 1000;
    const report = errorTracker.getReport();
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ ULTRA-ENHANCED ANALYSIS COMPLETE');
    console.log('='.repeat(50));
    console.log(`📊 Total processed: ${report.totalProcessed} changes`);
    console.log(`✅ Successful: ${report.successful} changes`);
    console.log(`❌ Failed: ${report.failed} changes`);
    console.log(`⏱️  Total time: ${Math.round(totalTime)} seconds`);

    if (errorTracker.hasErrors()) {
      console.log('\n❌ Failed changes:');
      report.errors.forEach(error => {
        console.log(`   - Change ID ${error.change_id}: ${error.company}`);
        console.log(`     Error: ${error.error}`);
      });
    }

    // Generate summary report
    await generateEnhancedReport();

  } catch (error) {
    console.error('❌ Fatal error in change analysis:', error);
    throw error;
  }
}

async function generateEnhancedReport() {
  console.log('\n📊 Generating enhanced analysis report...');

  try {
    const summary = await db.get(`
      SELECT 
        COUNT(*) as total_changes,
        COUNT(CASE WHEN interest_level >= 7 THEN 1 END) as high_interest,
        COUNT(CASE WHEN interest_level >= 5 AND interest_level < 7 THEN 1 END) as medium_interest,
        COUNT(CASE WHEN interest_level < 5 THEN 1 END) as low_interest,
        AVG(interest_level) as avg_interest
      FROM intelligence.changes
      WHERE detected_at > NOW() - INTERVAL '7 days'
    `);

    const topChanges = await db.all(`
      SELECT 
        c.company,
        c.url,
        c.interest_level,
        c.change_type,
        c.analysis,
        ea.business_impact,
        ea.key_insights
      FROM intelligence.changes c
      JOIN intelligence.enhanced_analysis ea ON ea.change_id = c.id
      WHERE c.detected_at > NOW() - INTERVAL '7 days'
      ORDER BY c.interest_level DESC, c.detected_at DESC
      LIMIT 20
    `);

    const report = {
      generated_at: new Date().toISOString(),
      database: 'PostgreSQL',
      period: 'last_7_days',
      summary: {
        total_changes: parseInt(summary.total_changes),
        high_interest: parseInt(summary.high_interest),
        medium_interest: parseInt(summary.medium_interest),
        low_interest: parseInt(summary.low_interest),
        average_interest: parseFloat(summary.avg_interest).toFixed(1)
      },
      top_changes: topChanges.map(change => ({
        company: change.company,
        url: change.url,
        interest_level: change.interest_level,
        type: change.change_type,
        impact: change.business_impact,
        insights: change.key_insights
      }))
    };

    // Save report
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const reportPath = path.join(dataDir, 'enhanced-analysis-report-postgres.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log('✅ Report generated:', reportPath);
    console.log('📊 Summary:');
    console.log(`   - Total changes: ${report.summary.total_changes}`);
    console.log(`   - High interest: ${report.summary.high_interest}`);
    console.log(`   - Average interest: ${report.summary.average_interest}/10`);

  } catch (error) {
    console.error('❌ Failed to generate report:', error);
  }
}

// Export functions
module.exports = {
  analyzeChangeWithGroq,
  processRecentChanges,
  generateEnhancedReport
};

// Run if called directly
if (require.main === module) {
  // Check for mode parameter
  const mode = process.argv[2] || 'recent';
  
  processRecentChanges(mode)
    .then(() => {
      console.log('\n✅ Ultra-enhanced analysis complete!');
      console.log('📍 Report saved to: data/enhanced-analysis-report-postgres.json');
      console.log('\n🎯 Next step: Generate static data files');
      
      // Clean up database connection
      end();
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Analysis failed:', error.message);
      
      // Clean up database connection even on error
      end();
      process.exit(1);
    });
}
