#!/usr/bin/env node

// SSL Certificate fix for Heroku PostgreSQL
if (process.env.NODE_ENV === 'production' || process.env.POSTGRES_CONNECTION_STRING) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

require('dotenv').config();
const puppeteer = require('puppeteer');
const crypto = require('crypto');
const path = require('path');
const { db, end } = require('./postgres-db');
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

class AICompetitorScraper {
  constructor() {
    this.browser = null;
    this.stats = {
      startTime: Date.now(),
      totalUrls: 0,
      processed: 0,
      succeeded: 0,
      failed: 0,
      changed: 0,
      unchanged: 0,
      new: 0,
      errors: []
    };
  }

  async initBrowser() {
    console.log('🚀 Launching browser...');
    this.browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    });
  }

  generateContentHash(content) {
    // Normalize content before hashing
    const normalized = content
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s]/g, '')
      .trim();
    
    return crypto
      .createHash('sha256')
      .update(normalized)
      .digest('hex');
  }

  async analyzeChange(content, previousContent) {
    try {
      const prompt = `${CHANGE_ANALYSIS_PROMPT}

Previous content snippet:
${previousContent ? previousContent.substring(0, 1000) : 'No previous content'}

Current content snippet:
${content.substring(0, 1000)}

Focus on AI/ML relevance and competitive intelligence value.`;

      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.1-70b-versatile',
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: "json_object" }
      });

      const analysis = JSON.parse(completion.choices[0].message.content);
      const assessment = analysis.interest_assessment;
      
      // Calculate average interest level
      assessment.interest_level = Math.round(
        (assessment.technical_innovation_score + assessment.business_impact_score) / 2
      );

      return assessment;
    } catch (error) {
      console.error('Error analyzing change:', error);
      return {
        technical_innovation_score: 5,
        business_impact_score: 5,
        interest_level: 5,
        interest_drivers: ['Error analyzing content'],
        category: 'Unknown',
        impact_areas: [],
        summary: 'Unable to analyze change'
      };
    }
  }

  async scrapeUrl(url, companyName, urlName, retryCount = 0) {
    const page = await this.browser.newPage();
    
    try {
      console.log(`  📄 Scraping: ${urlName || url}`);
      
      // Set realistic viewport
      await page.setViewport({ width: 1920, height: 1080 });
      
      // Navigate with timeout
      await page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: PAGE_TIMEOUT 
      });
      
      // Wait a bit for dynamic content
      await page.waitForTimeout(2000);
      
      // Get page content
      const content = await page.evaluate(() => {
        // Remove scripts and styles for cleaner content
        const scripts = document.querySelectorAll('script, style');
        scripts.forEach(el => el.remove());
        
        return {
          title: document.title,
          text: document.body.innerText,
          html: document.documentElement.outerHTML
        };
      });
      
      const fullContent = `Title: ${content.title}\n\n${content.text}`;
      const contentHash = this.generateContentHash(fullContent);
      
      // Check for existing content
      const existing = await db.get(
        `SELECT sp.*, cpb.content_hash as baseline_hash 
         FROM raw_content.scraped_pages sp
         LEFT JOIN raw_content.company_pages_baseline cpb 
           ON sp.company = cpb.company AND sp.url = cpb.url
         WHERE sp.url = $1 
         ORDER BY sp.scraped_at DESC 
         LIMIT 1`,
        [url]
      );
      
      let changeDetected = false;
      let changeType = 'none';
      let interest_level = 5;
      let interest_assessment = null;
      
      if (!existing) {
        changeType = 'new';
        changeDetected = true;
        this.stats.new++;
        console.log(`    ✨ New URL detected`);
        
        // Analyze new content
        interest_assessment = await this.analyzeChange(fullContent, null);
        interest_level = interest_assessment.interest_level;
      } else if (existing.content_hash !== contentHash) {
        changeType = 'modified';
        changeDetected = true;
        this.stats.changed++;
        console.log(`    🔄 Content changed`);
        
        // Analyze change
        interest_assessment = await this.analyzeChange(fullContent, existing.content);
        interest_level = interest_assessment.interest_level;
      } else {
        this.stats.unchanged++;
        console.log(`    ✓ No changes detected`);
      }
      
      // Store the scraped content
      await db.run(
        `INSERT INTO raw_content.scraped_pages 
         (company, url, url_name, content, html, title, content_hash, scraped_at, 
          change_detected, previous_hash, interest_level)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8, $9, $10)`,
        [
          companyName,
          url,
          urlName || url,
          fullContent,
          content.html,
          content.title,
          contentHash,
          changeDetected,
          existing?.content_hash || null,
          interest_level
        ]
      );
      
      // If change detected, update baseline and record change
      if (changeDetected) {
        // Update or insert baseline
        await db.run(
          `INSERT INTO raw_content.company_pages_baseline 
           (company, url, url_name, content, html, title, content_hash, last_updated, update_count)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), 1)
           ON CONFLICT (company, url) 
           DO UPDATE SET 
             content = EXCLUDED.content,
             html = EXCLUDED.html,
             title = EXCLUDED.title,
             content_hash = EXCLUDED.content_hash,
             last_updated = EXCLUDED.last_updated,
             update_count = company_pages_baseline.update_count + 1`,
          [
            companyName,
            url,
            urlName || url,
            fullContent,
            content.html,
            content.title,
            contentHash
          ]
        );
        
        // Record change detection with interest assessment
        await db.run(
          `INSERT INTO processed_content.change_detection 
           (company, url, url_name, change_type, old_hash, new_hash, detected_at, 
            interest_level, ai_analysis)
           VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7, $8)`,
          [
            companyName,
            url,
            urlName || url,
            changeType,
            existing?.content_hash || null,
            contentHash,
            interest_level,
            interest_assessment ? JSON.stringify(interest_assessment) : null
          ]
        );
        
        console.log(`    💡 Interest Level: ${interest_level}/10 - ${interest_assessment?.category || 'Unknown'}`);
      }
      
      return { success: true, url, changeDetected, interest_level };
      
    } catch (error) {
      console.error(`    ❌ Error scraping ${url}:`, error.message);
      
      // Retry logic
      if (retryCount < MAX_RETRIES) {
        console.log(`    🔄 Retrying (${retryCount + 1}/${MAX_RETRIES})...`);
        await page.close();
        await new Promise(resolve => setTimeout(resolve, 2000));
        return this.scrapeUrl(url, companyName, urlName, retryCount + 1);
      }
      
      this.stats.errors.push({ url, error: error.message });
      return { success: false, url, error: error.message };
      
    } finally {
      await page.close();
    }
  }

  async scrapeCompanyUrls(company, urls) {
    console.log(`\n🏢 Scraping ${company.name} (${urls.length} URLs)`);
    
    const results = [];
    
    // Process URLs in batches
    for (let i = 0; i < urls.length; i += BATCH_SIZE) {
      const batch = urls.slice(i, i + BATCH_SIZE);
      console.log(`  📦 Processing batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(urls.length/BATCH_SIZE)}`);
      
      // Add delay between batches to avoid rate limiting
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
      }
      
      // Process batch concurrently
      const batchResults = await Promise.all(
        batch.map(urlInfo => 
          this.scrapeUrl(urlInfo.url, company.name, urlInfo.name)
        )
      );
      
      results.push(...batchResults);
      
      // Update stats
      batchResults.forEach(result => {
        this.stats.processed++;
        if (result.success) {
          this.stats.succeeded++;
        } else {
          this.stats.failed++;
        }
      });
    }
    
    return results;
  }

  async run() {
    try {
      await this.initBrowser();
      
      console.log('🔍 AI Competitor Monitor - Web Scraper (PostgreSQL)');
      console.log('=' .repeat(80));
      
      // Get active companies and their URLs
      const companies = await db.all(
        `SELECT c.*, COUNT(u.id) as url_count
         FROM intelligence.companies c
         LEFT JOIN intelligence.company_urls u ON c.id = u.company_id
         WHERE c.active = true
         GROUP BY c.id
         ORDER BY c.name`
      );
      
      console.log(`📊 Found ${companies.length} active companies to monitor\n`);
      
      // Process each company
      for (const company of companies) {
        if (company.url_count === 0) {
          console.log(`⚠️  Skipping ${company.name} - no URLs configured`);
          continue;
        }
        
        // Get URLs for this company
        const urls = await db.all(
          `SELECT * FROM intelligence.company_urls 
           WHERE company_id = $1 AND active = true 
           ORDER BY name`,
          [company.id]
        );
        
        this.stats.totalUrls += urls.length;
        
        // Scrape all URLs for this company
        await this.scrapeCompanyUrls(company, urls);
      }
      
      // Generate summary
      const duration = Math.round((Date.now() - this.stats.startTime) / 1000);
      
      console.log('\n' + '=' .repeat(80));
      console.log('📈 Scraping Complete - Summary:');
      console.log(`  ⏱️  Duration: ${duration} seconds`);
      console.log(`  📊 Total URLs: ${this.stats.totalUrls}`);
      console.log(`  ✅ Succeeded: ${this.stats.succeeded}`);
      console.log(`  ❌ Failed: ${this.stats.failed}`);
      console.log(`  🔄 Changed: ${this.stats.changed}`);
      console.log(`  ✨ New: ${this.stats.new}`);
      console.log(`  ➖ Unchanged: ${this.stats.unchanged}`);
      
      if (this.stats.errors.length > 0) {
        console.log('\n⚠️  Errors:');
        this.stats.errors.forEach(err => {
          console.log(`  - ${err.url}: ${err.error}`);
        });
      }
      
      // Store run statistics
      await db.run(
        `INSERT INTO intelligence.scraping_runs 
         (started_at, completed_at, urls_total, urls_succeeded, urls_failed, 
          changes_detected, duration_seconds, errors)
         VALUES ($1, NOW(), $2, $3, $4, $5, $6, $7)`,
        [
          new Date(this.stats.startTime).toISOString(),
          this.stats.totalUrls,
          this.stats.succeeded,
          this.stats.failed,
          this.stats.changed + this.stats.new,
          duration,
          this.stats.errors.length > 0 ? JSON.stringify(this.stats.errors) : null
        ]
      );
      
    } catch (error) {
      console.error('Fatal error:', error);
      process.exit(1);
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
      await end(); // Close PostgreSQL connection pool
    }
  }
}

// Run the scraper
const scraper = new AICompetitorScraper();
scraper.run().catch(console.error);
