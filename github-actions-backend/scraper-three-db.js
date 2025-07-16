#!/usr/bin/env node

require('dotenv').config();
const puppeteer = require('puppeteer');
const crypto = require('crypto');
const path = require('path');
const dbManager = require('./db-manager');
const Groq = require('groq-sdk');

// Initialize Groq client for change analysis
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || process.env.ANTHROPIC_API_KEY
});

// Configuration
const BATCH_SIZE = 5; // Process 5 URLs concurrently
const PAGE_TIMEOUT = 30000; // 30 seconds per page
const RATE_LIMIT_DELAY = 500; // 500ms between batch starts
const MAX_RETRIES = 2; // Retry failed URLs

// Interest level assessment prompt
const CHANGE_ANALYSIS_PROMPT = `You are an AI competitive intelligence analyst. Analyze this web content change and assess its importance.

Provide TWO separate scores (1-10) that will be averaged:

A. TECHNICAL INNOVATION SCORE:
   - 9-10: Breakthrough AI models, SOTA achievements, novel architectures, 10x improvements
   - 7-8: Significant technical advances, 2-5x improvements, new capabilities
   - 5-6: Notable optimizations, useful tools, incremental improvements
   - 3-4: Minor updates, bug fixes, routine maintenance
   - 1-2: No technical relevance

B. BUSINESS IMPACT SCORE:
   - 9-10: Major launches, $100M+ funding, acquisitions, market-reshaping moves
   - 7-8: Important partnerships, $10M+ funding, market expansion
   - 5-6: Product updates, new features, team growth
   - 3-4: Routine updates, minor news
   - 1-2: Trivial changes

Provide your analysis in this JSON structure:
{
  "interest_assessment": {
    "technical_innovation_score": 0,
    "business_impact_score": 0,
    "interest_level": 0,
    "interest_drivers": [],
    "category": "",
    "impact_areas": [],
    "summary": ""
  }
}`;

class IntelligentScraperThreeDB {
  constructor() {
    this.browser = null;
    this.runId = null;
    this.rawDb = null;
    this.intelligenceDb = null;
    this.processedDb = null;
    this.startTime = null;
  }

  async initialize() {
    console.log('🚀 Starting Intelligent Scraper with Change Analysis...');
    this.startTime = Date.now();
    
    // Check if three-database architecture exists
    if (!dbManager.hasThreeDbArchitecture()) {
      console.log('📊 Creating three-database architecture...');
      require('./scripts/create-three-dbs');
    }
    
    // Get database connections
    this.rawDb = dbManager.getRawDb();
    this.intelligenceDb = dbManager.getIntelligenceDb();
    this.processedDb = dbManager.getProcessedDb();
    
    // Launch Puppeteer with optimized settings
    this.browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-blink-features=AutomationControlled'
      ]
    });

    // Create scraping run record
    const stmt = this.rawDb.prepare(`
      INSERT INTO scrape_runs (status, started_at)
      VALUES ('running', datetime('now'))
    `);
    const result = stmt.run();
    this.runId = result.lastInsertRowid;
    
    console.log(`📊 Scrape run ID: ${this.runId}`);
  }

  async shutdown() {
    if (this.browser) {
      await this.browser.close();
    }
    
    // Update scraping run status
    if (this.runId && this.rawDb) {
      const stmt = this.rawDb.prepare(`
        UPDATE scrape_runs 
        SET status = 'completed', completed_at = datetime('now')
        WHERE id = ?
      `);
      stmt.run(this.runId);
    }
    
    // Close database connections
    dbManager.closeAll();
    
    const duration = ((Date.now() - this.startTime) / 1000 / 60).toFixed(1);
    console.log(`✅ Scraper shutdown complete (took ${duration} minutes)`);
  }

  async analyzeChange(oldContent, newContent, company, url) {
    try {
      console.log(`      🧠 Analyzing change with AI...`);
      
      // Extract text content from HTML
      const oldText = oldContent ? this.extractTextFromHtml(oldContent).substring(0, 2000) : '[No previous content]';
      const newText = newContent ? this.extractTextFromHtml(newContent).substring(0, 2000) : '[No new content]';
      
      const prompt = `${CHANGE_ANALYSIS_PROMPT}

Company: ${company} - ${url.url}
URL Type: ${url.url_type}

PREVIOUS CONTENT:
${oldText}

CURRENT CONTENT:
${newText}

Analyze what changed and assess its importance. Focus on what's NEW or DIFFERENT.`;

      const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{
          role: 'user',
          content: prompt
        }],
        temperature: 0.5,
        max_completion_tokens: 1000,
        top_p: 1,
        stream: false,
        response_format: { type: "json_object" }  // Enforce JSON output
      });

      let result;
      try {
        result = JSON.parse(response.choices[0].message.content);
      } catch (parseError) {
        console.error('      ⚠️ Failed to parse AI response as JSON, attempting to extract...');
        // Try to extract JSON from text response
        const content = response.choices[0].message.content;
        const jsonMatch = content.match(/{[\s\S]*}/); 
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Could not extract JSON from AI response');
        }
      }
      const assessment = result.interest_assessment;
      
      // Calculate average interest level
      assessment.interest_level = Math.round(
        (assessment.technical_innovation_score + assessment.business_impact_score) / 2
      );
      
      // Determine category based on interest level
      if (assessment.interest_level >= 8) assessment.category = 'breakthrough';
      else if (assessment.interest_level >= 6) assessment.category = 'major_development';
      else if (assessment.interest_level >= 4) assessment.category = 'notable_update';
      else if (assessment.interest_level >= 2) assessment.category = 'routine_change';
      else assessment.category = 'trivial';
      
      console.log(`      ✨ Interest Level: ${assessment.interest_level}/10 (${assessment.category})`);
      
      return assessment;
    } catch (error) {
      console.error(`      ❌ AI analysis failed: ${error.message}`);
      // Return default assessment on error
      return {
        interest_level: 5,
        technical_innovation_score: 5,
        business_impact_score: 5,
        interest_drivers: ['Unable to analyze - using default'],
        category: 'notable_update',
        impact_areas: ['unknown'],
        summary: 'Change detected but analysis failed'
      };
    }
  }

  extractTextFromHtml(html) {
    // Simple HTML to text extraction
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  async scrapeAll() {
    try {
      // Get all companies and their URLs from intelligence database
      const companiesStmt = this.intelligenceDb.prepare(`
        SELECT c.*, COUNT(u.id) as url_count
        FROM companies c
        LEFT JOIN urls u ON c.id = u.company_id
        GROUP BY c.id
        ORDER BY c.name
      `);
      const companies = companiesStmt.all();
      
      console.log(`📊 Found ${companies.length} companies to monitor`);
      
      // Collect all URLs with company info
      const allUrls = [];
      for (const company of companies) {
        const urlsStmt = this.intelligenceDb.prepare(`
          SELECT * FROM urls WHERE company_id = ?
        `);
        const urls = urlsStmt.all(company.id);
        
        urls.forEach(url => {
          allUrls.push({
            ...url,
            companyName: company.name
          });
        });
      }
      
      console.log(`📊 Total URLs to scrape: ${allUrls.length}`);
      
      let processedUrls = 0;
      let changesDetected = 0;
      let changesAnalyzed = 0;
      let errors = 0;
      
      // Process URLs in batches
      for (let i = 0; i < allUrls.length; i += BATCH_SIZE) {
        const batch = allUrls.slice(i, i + BATCH_SIZE);
        const batchNum = Math.floor(i / BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(allUrls.length / BATCH_SIZE);
        
        console.log(`\n🔄 Processing batch ${batchNum}/${totalBatches} (${batch.length} URLs)...`);
        
        // Process batch concurrently
        const results = await Promise.all(
          batch.map(url => this.scrapeUrlWithRetry(url, url.companyName))
        );
        
        // Count results
        results.forEach(result => {
          if (result.success) {
            processedUrls++;
            if (result.changed) {
              changesDetected++;
              if (result.analyzed) {
                changesAnalyzed++;
              }
            }
          } else {
            errors++;
          }
        });
        
        // Progress update
        const progress = ((i + batch.length) / allUrls.length * 100).toFixed(1);
        console.log(`   Progress: ${progress}% complete`);
        
        // Small delay between batches to prevent overwhelming targets
        if (i + BATCH_SIZE < allUrls.length) {
          await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
        }
      }
      
      // Update scraping run stats
      const updateStmt = this.rawDb.prepare(`
        UPDATE scrape_runs 
        SET urls_processed = ?, urls_changed = ?, errors_count = ?
        WHERE id = ?
      `);
      updateStmt.run(processedUrls, changesDetected, errors, this.runId);
      
      console.log(`\n📈 Scraping Summary:`);
      console.log(`   Total URLs: ${allUrls.length}`);
      console.log(`   Processed: ${processedUrls}`);
      console.log(`   Changes Detected: ${changesDetected}`);
      console.log(`   Changes Analyzed: ${changesAnalyzed}`);
      console.log(`   Errors: ${errors}`);
      console.log(`   Success Rate: ${((processedUrls / allUrls.length) * 100).toFixed(1)}%`);
      
    } catch (error) {
      console.error('❌ Scraping error:', error.message);
      
      // Update run status to failed
      if (this.runId && this.rawDb) {
        const errorStmt = this.rawDb.prepare(`
          UPDATE scrape_runs 
          SET status = 'failed'
          WHERE id = ?
        `);
        errorStmt.run(this.runId);
      }
      
      throw error;
    }
  }

  async scrapeUrlWithRetry(urlConfig, companyName, retryCount = 0) {
    try {
      return await this.scrapeUrl(urlConfig, companyName);
    } catch (error) {
      if (retryCount < MAX_RETRIES) {
        console.log(`      ⚠️ Retrying ${urlConfig.url} (attempt ${retryCount + 2}/${MAX_RETRIES + 1})...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.scrapeUrlWithRetry(urlConfig, companyName, retryCount + 1);
      }
      return {
        success: false,
        changed: false,
        analyzed: false,
        url: urlConfig.url,
        error: error.message
      };
    }
  }

  async scrapeUrl(urlConfig, companyName) {
    const page = await this.browser.newPage();
    
    try {
      console.log(`   📄 [${companyName}] ${urlConfig.url}`);
      
      // Special debug logging for Redmore Studio
      if (companyName.toLowerCase().includes('redmore')) {
        console.log(`      🔍 DEBUG: Scraping Redmore Studio URL ID ${urlConfig.id}`);
      }
      
      // Set user agent to avoid bot detection
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      // Set viewport
      await page.setViewport({ width: 1920, height: 1080 });
      
      // Navigate to URL with timeout
      const response = await page.goto(urlConfig.url, {
        waitUntil: 'networkidle2',
        timeout: PAGE_TIMEOUT
      });
      
      const statusCode = response.status();
      
      // Wait a bit for dynamic content
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get full HTML content
      const htmlContent = await page.content();
      
      // Calculate content hash
      const contentHash = crypto
        .createHash('sha256')
        .update(htmlContent)
        .digest('hex');
      
      // Check if content has changed
      const latestStmt = this.rawDb.prepare(`
        SELECT id, content_hash, html_content FROM raw_html
        WHERE url_id = ?
        ORDER BY scraped_at DESC
        LIMIT 1
      `);
      const latest = latestStmt.get(urlConfig.id);
      
      const hasChanged = !latest || latest.content_hash !== contentHash;
      const isFirstScrape = !latest;
      
      // Always store the raw HTML
      const insertStmt = this.rawDb.prepare(`
        INSERT INTO raw_html (
          url_id, company_name, url, content_hash, html_content,
          status_code, scraped_at
        ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `);
      
      const insertResult = insertStmt.run(
        urlConfig.id,
        companyName,
        urlConfig.url,
        contentHash,
        htmlContent,
        statusCode
      );
      
      // Get the ID of the row we just inserted
      const newContentId = insertResult.lastInsertRowid;
      
      // CRITICAL FIX: Always update last_scraped timestamp after successful scrape
      const updateUrlStmt = this.intelligenceDb.prepare(`
        UPDATE urls SET last_scraped = datetime('now') WHERE id = ?
      `);
      updateUrlStmt.run(urlConfig.id);
      console.log(`      ✅ Updated last_scraped timestamp for URL ID ${urlConfig.id}`);
      
      let analyzed = false;
      
      if (hasChanged) {
        if (isFirstScrape) {
          console.log(`      🆕 First time scraping this URL - treating as important change`);
        } else {
          console.log(`      ✨ Change detected!`);
        }
        
        // Analyze the change with AI
        const oldContent = latest ? latest.html_content : null;
        const assessment = await this.analyzeChange(oldContent, htmlContent, companyName, urlConfig);
        
        // For first-time scrapes, boost the interest level slightly
        if (isFirstScrape && assessment.interest_level < 6) {
          assessment.interest_level = 6;
          assessment.summary = `Initial scrape of ${companyName} - ${urlConfig.url}. ${assessment.summary || ''}`;
          assessment.interest_drivers.unshift('First-time content capture');
        }
        
        analyzed = true;
        
        // Insert change detection record with proper interest level
        const changeStmt = this.processedDb.prepare(`
          INSERT INTO change_detection (
            url_id, 
            change_type, 
            summary, 
            old_content_id, 
            new_content_id,
            relevance_score,
            interest_level,
            interest_data,
            detected_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        `);
        
        // CRITICAL FIX: Ensure we use the correct content IDs, not URL IDs
        const oldContentId = latest ? latest.id : null;
        
        const changeResult = changeStmt.run(
          urlConfig.id,
          isFirstScrape ? 'initial_scrape' : 'content_update',
          assessment.summary || `Content ${isFirstScrape ? 'captured' : 'changed'} for ${companyName} - ${urlConfig.url}`,
          oldContentId,  // Use the actual raw_html.id from previous snapshot
          newContentId,  // Use the newly inserted raw_html.id
          assessment.interest_level, // For backward compatibility
          assessment.interest_level, // New field
          JSON.stringify(assessment), // Store full assessment data
        );
        
        console.log(`      📝 Inserted change detection record ID ${changeResult.lastInsertRowid}`);
      } else {
        console.log(`      ✓ No changes detected`);
      }
      
      await page.close();
      
      return {
        success: true,
        changed: hasChanged,
        analyzed: analyzed,
        url: urlConfig.url
      };
      
    } catch (error) {
      console.error(`      ❌ Error scraping ${urlConfig.url}:`, error.message);
      
      await page.close();
      
      throw error;
    }
  }
}

// Main execution
async function main() {
  const scraper = new IntelligentScraperThreeDB();
  
  try {
    await scraper.initialize();
    await scraper.scrapeAll();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    await scraper.shutdown();
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = IntelligentScraperThreeDB;