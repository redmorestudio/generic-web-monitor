// Fix for scraper timeout handling
// This patch addresses the issue where page.close() throws an error when the page is already closed

// Replace the scrapeUrl method's error handling and finally block
// Original lines ~356-372

// OLD CODE:
/*
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
*/

// NEW CODE:
    } catch (error) {
      console.error(`    ❌ Error scraping ${url}:`, error.message);
      
      // Special handling for navigation timeouts
      if (error.message.includes('Navigation timeout') || error.message.includes('Target closed')) {
        console.log(`    ⏱️ Navigation timeout detected - page may be closed`);
      }
      
      // Retry logic
      if (retryCount < MAX_RETRIES) {
        console.log(`    🔄 Retrying (${retryCount + 1}/${MAX_RETRIES})...`);
        
        // Safely close page before retry
        try {
          if (page && !page.isClosed()) {
            await page.close();
          }
        } catch (closeError) {
          console.warn('    ⚠️ Error closing page during retry:', closeError.message);
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        return this.scrapeUrl(url, companyName, urlName, retryCount + 1);
      }
      
      // Store error in database for failed URLs
      try {
        await db.run(
          `INSERT INTO raw_content.scraped_pages 
           (company, url, url_name, content, html, title, content_hash, scraped_at, 
            change_detected, scrape_status, error_message)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8, $9, $10)`,
          [
            companyName,
            url,
            urlName || url,
            'Error: ' + error.message,
            null,
            'Error',
            this.generateContentHash('error-' + error.message),
            false,
            'error',
            error.message
          ]
        );
      } catch (dbError) {
        console.error('    ❌ Error storing failure in database:', dbError.message);
      }
      
      this.stats.errors.push({ url, error: error.message });
      return { success: false, url, error: error.message };
      
    } finally {
      // Safely close page
      try {
        if (page && !page.isClosed()) {
          await page.close();
        }
      } catch (closeError) {
        console.warn('    ⚠️ Error closing page in finally block:', closeError.message);
      }
    }

// Additional safety for Promise.all in scrapeCompanyUrls
// Wrap the scrapeUrl calls to prevent one failure from breaking the entire batch

// OLD CODE (line ~390):
/*
      const batchResults = await Promise.all(
        batch.map(urlInfo => 
          this.scrapeUrl(urlInfo.url, company.name, urlInfo.name)
        )
      );
*/

// NEW CODE:
      const batchResults = await Promise.allSettled(
        batch.map(urlInfo => 
          this.scrapeUrl(urlInfo.url, company.name, urlInfo.name)
            .catch(error => {
              console.error(`    🚨 Unhandled error for ${urlInfo.url}:`, error.message);
              return { success: false, url: urlInfo.url, error: error.message };
            })
        )
      );
      
      // Extract results from Promise.allSettled
      const processedResults = batchResults.map(result => 
        result.status === 'fulfilled' ? result.value : result.reason
      );
