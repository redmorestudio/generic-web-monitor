#!/usr/bin/env node

require('dotenv').config();
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const crypto = require('crypto');
const path = require('path');
const dbManager = require('./db-manager');
const Groq = require('groq-sdk');
const CaptchaDetector = require('./captcha-detector');
const StealthSetup = require('./stealth-setup');

// Use stealth plugin
puppeteer.use(StealthPlugin());

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

class RequestThrottler {
  constructor() {
    this.domainLastRequest = new Map();
    this.minDelayPerDomain = 2000; // 2 seconds minimum between requests to same domain
  }
  
  async throttleForDomain(url) {
    const domain = new URL(url).hostname;
    const lastRequest = this.domainLastRequest.get(domain);
    
    if (lastRequest) {
      const elapsed = Date.now() - lastRequest;
      const delay = Math.max(0, this.minDelayPerDomain - elapsed);
      
      if (delay > 0) {
        console.log(`      ⏳ Throttling ${domain} for ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    this.domainLastRequest.set(domain, Date.now());
  }
}

class IntelligentScraperThreeDB {
  constructor() {
    this.browser = null;
    this.runId = null;
    this.rawDb = null;
    this.intelligenceDb = null;
    this.processedDb = null;
    this.startTime = null;
    this.captchaDetector = new CaptchaDetector();
    this.stealthSetup = new StealthSetup();
    this.throttler = new RequestThrottler();
  }

  async initialize() {
    console.log('🚀 Starting Intelligent Scraper with Enhanced Stealth and Captcha Detection...');
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

    // Launch Puppeteer with stealth
    this.browser = await puppeteer.launch({
      headless: 'new',
      args: this.stealthSetup.getBrowserArgs(),
      defaultViewport: null,
      ignoreDefaultArgs: ['--enable-automation']
    });

    // Create scraping run record
    const stmt = this.rawDb.prepare(`
      INSERT INTO scrape_runs (status, started_at)
      VALUES ('running', datetime('now'))
    `);
    const result = stmt.run();
    this.runId = result.lastInsertRowid;

    console.log(`📊 Scrape run ID: ${this.runId}`);
    console.log(`🥷 Stealth mode enabled with enhanced evasion techniques`);
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

    // Log captcha detection stats
    console.log('\n📊 Captcha Detection Statistics:');
    const stats = this.captchaDetector.getStats();
    for (const [type, count] of Object.entries(stats)) {
      if (count > 0 && type !== 'total') {
        console.log(`   ${type}: ${count}`);
      }
    }

    // Close database connections
    dbManager.closeAll();

    const duration = ((Date.now() - this.startTime) / 1000 / 60).toFixed(1);
    console.log(`✅ Scraper shutdown complete (took ${duration} minutes)`);
  }

  /**
   * Navigate with retry strategy
   */
  async navigateWithRetry(page, url, options = {}) {
    const defaultOptions = {
      waitUntil: 'networkidle2',
      timeout: PAGE_TIMEOUT
    };
    
    const navOptions = { ...defaultOptions, ...options };
    
    try {
      // First attempt with networkidle2
      const response = await page.goto(url, navOptions);
      return response;
    } catch (error) {
      if (error.message.includes('timeout')) {
        console.log('      ⚠️ Navigation timeout, trying with domcontentloaded...');
        
        // Second attempt with domcontentloaded
        try {
          const response = await page.goto(url, {
            ...navOptions,
            waitUntil: 'domcontentloaded'
          });
          
          // Wait for potential lazy-loaded content
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          return response;
        } catch (secondError) {
          console.log('      ⚠️ Second navigation attempt failed, trying load event...');
          
          // Final attempt with just load event
          const response = await page.goto(url, {
            ...navOptions,
            waitUntil: 'load'
          });
          
          await new Promise(resolve => setTimeout(resolve, 5000));
          return response;
        }
      }
      throw error;
    }
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
        response_format: { type: "json_object" } // Enforce JSON output
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
      let blockedUrls = 0; // Track captcha/challenge blocks

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
          if (result.blocked) {
            blockedUrls++;
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
      console.log(`   Blocked (Captcha/Challenge): ${blockedUrls}`);
      console.log(`   Success Rate: ${((processedUrls / allUrls.length) * 100).toFixed(1)}%`);

      // Validate that changes were saved to database
      console.log(`\n🔍 Validating database saves...`);
      const recentChanges = this.processedDb.prepare(`
        SELECT COUNT(*) as count
        FROM change_detection
        WHERE detected_at > datetime('now', '-1 hour')
      `).get();

      const recentAnalyses = this.intelligenceDb.prepare(`
        SELECT COUNT(*) as count
        FROM enhanced_analysis
        WHERE created_at > datetime('now', '-1 hour')
      `).get();

      console.log(`   Changes saved to DB in last hour: ${recentChanges.count}`);
      console.log(`   Enhanced analyses saved in last hour: ${recentAnalyses.count}`);

      if (recentChanges.count === 0 && changesDetected > 0) {
        console.error(`\n❌ CRITICAL: Detected ${changesDetected} changes but none were saved to database!`);
        console.error(`   This suggests a database write issue. Check logs above for error messages.`);
      } else if (recentChanges.count < changesDetected) {
        console.warn(`\n⚠️ WARNING: Only ${recentChanges.count} of ${changesDetected} detected changes were saved to database.`);
        console.warn(`   Some INSERTs may have failed. Check logs above for error messages.`);
      } else {
        console.log(`\n✅ Database validation passed!`);
      }

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

      // CRITICAL: Update last_scraped even on failure so it doesn't show "20286d ago"
      console.log(`      ⚠️ Failed to scrape ${urlConfig.url} after ${MAX_RETRIES + 1} attempts`);
      console.log(`      🔧 Updating last_scraped timestamp to prevent stale display...`);
      try {
        const updateUrlStmt = this.intelligenceDb.prepare(`
          UPDATE urls SET last_scraped = datetime('now') WHERE id = ?
        `);
        updateUrlStmt.run(urlConfig.id);
        console.log(`      ✅ Updated last_scraped timestamp for failed URL ID ${urlConfig.id}`);
      } catch (updateError) {
        console.error(`      ❌ Failed to update timestamp: ${updateError.message}`);
      }

      return {
        success: false,
        changed: false,
        analyzed: false,
        blocked: false,
        url: urlConfig.url,
        error: error.message
      };
    }
  }

  async scrapeUrl(urlConfig, companyName) {
    const page = await this.browser.newPage();

    try {
      console.log(`   📄 [${companyName}] ${urlConfig.url}`);

      // Apply stealth setup
      await this.stealthSetup.applyStealthToPage(page);

      // Apply domain-specific throttling
      await this.throttler.throttleForDomain(urlConfig.url);

      // Navigate with retry strategy
      const response = await this.navigateWithRetry(page, urlConfig.url);
      const statusCode = response.status();

      // Random delay to appear more human-like
      const randomDelay = 1000 + Math.floor(Math.random() * 2000);
      await new Promise(resolve => setTimeout(resolve, randomDelay));

      // Get full HTML content
      const htmlContent = await page.content();

      // Enhanced captcha detection using page object
      const captchaResult = await this.captchaDetector.detect(page, htmlContent, urlConfig.url);

      if (captchaResult.detected) {
        console.log(`      🚫 ${captchaResult.type} detected - marking as blocked`);

        // Store a record indicating the page was blocked
        const insertStmt = this.rawDb.prepare(`
          INSERT INTO raw_html (
            url_id, company_name, url, content_hash, html_content,
            status_code, scraped_at, scrape_status
          ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), 'blocked')
        `);

        insertStmt.run(
          urlConfig.id,
          companyName,
          urlConfig.url,
          'BLOCKED',
          htmlContent, // Still store the HTML for debugging
          statusCode
        );

        // Update last_scraped timestamp
        const updateUrlStmt = this.intelligenceDb.prepare(`
          UPDATE urls SET last_scraped = datetime('now') WHERE id = ?
        `);
        updateUrlStmt.run(urlConfig.id);

        await page.close();

        return {
          success: false,
          changed: false,
          analyzed: false,
          blocked: true,
          blockType: captchaResult.type,
          url: urlConfig.url,
          error: `${captchaResult.type} detected`
        };
      }

      // Calculate content hash
      const contentHash = crypto
        .createHash('sha256')
        .update(htmlContent)
        .digest('hex');

      // Check if content has changed
      const latestStmt = this.rawDb.prepare(`
        SELECT id, content_hash, html_content FROM raw_html
        WHERE url_id = ? AND (scrape_status IS NULL OR scrape_status != 'blocked')
        ORDER BY scraped_at DESC
        LIMIT 1
      `);
      const latest = latestStmt.get(urlConfig.id);

      const hasChanged = !latest || latest.content_hash !== contentHash;
      const isFirstScrape = !latest;

      // Always store the raw HTML
      console.log(`      💾 Saving HTML (length: ${htmlContent.length}) for URL ID ${urlConfig.id}...`);
      const insertStmt = this.rawDb.prepare(`
        INSERT INTO raw_html (
          url_id, company_name, url, content_hash, html_content,
          status_code, scraped_at, scrape_status
        ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), 'success')
      `);

      let insertResult;
      try {
        insertResult = insertStmt.run(
          urlConfig.id,
          companyName,
          urlConfig.url,
          contentHash,
          htmlContent,
          statusCode
        );
        console.log(`      ✅ Saved HTML to raw_content.db (ID: ${insertResult.lastInsertRowid})`);
      } catch (insertError) {
        console.error(`      ❌ Failed to insert HTML for URL ID ${urlConfig.id}: ${insertError.message}`);
        throw insertError; // Re-throw to maintain existing behavior
      }

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
        try {
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
            oldContentId, // Use the actual raw_html.id from previous snapshot
            newContentId, // Use the newly inserted raw_html.id
            assessment.interest_level, // For backward compatibility
            assessment.interest_level, // New field
            JSON.stringify(assessment) // Store full assessment data - NO TRAILING COMMA
          );

          console.log(`      📝 Inserted change detection record ID ${changeResult.lastInsertRowid}`);

          // Also try to save enhanced analysis for cross-reference
          if (!isFirstScrape && assessment) {
            try {
              const enhancedStmt = this.intelligenceDb.prepare(`
                INSERT INTO enhanced_analysis (
                  change_id,
                  entities,
                  relationships,
                  competitive_data,
                  full_extraction,
                  created_at
                ) VALUES (?, ?, ?, ?, ?, datetime('now'))
              `);

              enhancedStmt.run(
                changeResult.lastInsertRowid,
                JSON.stringify(assessment.entities || {}),
                JSON.stringify(assessment.relationships || []),
                JSON.stringify({ interest_assessment: assessment }),
                JSON.stringify(assessment)
              );
              console.log(`      ✅ Enhanced analysis saved`);
            } catch (enhancedError) {
              console.error(`      ⚠️ Failed to save enhanced analysis: ${enhancedError.message}`);
              // Don't fail the whole process
            }
          }
        } catch (changeError) {
          console.error(`      ❌ Failed to save change detection: ${changeError.message}`);
          console.error(`      📊 Debug info:`, {
            url_id: urlConfig.id,
            change_type: isFirstScrape ? 'initial_scrape' : 'content_update',
            old_content_id: latest ? latest.id : null,
            new_content_id: newContentId,
            interest_level: assessment?.interest_level
          });
          // Don't throw - continue processing other URLs
        }
      } else {
        console.log(`      ✓ No changes detected`);
      }

      await page.close();

      return {
        success: true,
        changed: hasChanged,
        analyzed: analyzed,
        blocked: false,
        url: urlConfig.url
      };

    } catch (error) {
      console.error(`      ❌ Error scraping ${urlConfig.url}: ${error.message}`);

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
