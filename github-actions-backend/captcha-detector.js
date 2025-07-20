// captcha-detector.js
// Enhanced captcha and challenge detection module

class CaptchaDetector {
  constructor() {
    this.detectionStats = {
      recaptcha_v2: 0,
      recaptcha_v3: 0,
      hcaptcha: 0,
      cloudflare: 0,
      funcaptcha: 0,
      geetest: 0,
      custom: 0,
      image: 0,
      challenge_page: 0,
      total: 0
    };
  }

  /**
   * Extract visible text from HTML
   */
  extractTextFromHtml(html) {
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Main detection method - combines DOM and content analysis
   */
  async detect(page, htmlContent, url) {
    console.log('      🔍 Running comprehensive captcha detection...');
    
    // Quick content check first
    const textContent = this.extractTextFromHtml(htmlContent);
    const hasMinimalContent = textContent.length < 100;
    
    // 1. DOM-based detection (most reliable)
    const domResult = await this.detectViaDOM(page);
    if (domResult.detected) {
      this.detectionStats[domResult.type]++;
      this.detectionStats.total++;
      return domResult;
    }
    
    // 2. Title-based detection
    const titleResult = this.detectViaTitle(htmlContent);
    if (titleResult.detected) {
      this.detectionStats[titleResult.type]++;
      this.detectionStats.total++;
      return titleResult;
    }
    
    // 3. Content pattern detection (only if minimal content)
    if (hasMinimalContent) {
      const patternResult = this.detectViaPatterns(htmlContent);
      if (patternResult.detected) {
        this.detectionStats[patternResult.type]++;
        this.detectionStats.total++;
        return patternResult;
      }
    }
    
    // 4. Script-based detection
    const scriptResult = await this.detectViaScripts(page);
    if (scriptResult.detected) {
      this.detectionStats[scriptResult.type]++;
      this.detectionStats.total++;
      return scriptResult;
    }
    
    // 5. Dynamic wait detection (only if minimal content)
    if (hasMinimalContent) {
      const dynamicResult = await this.detectViaDynamicWait(page);
      if (dynamicResult.detected) {
        this.detectionStats[dynamicResult.type]++;
        this.detectionStats.total++;
        return dynamicResult;
      }
    }
    
    // 6. Site-specific detection
    const siteResult = this.detectViaSiteSpecific(url, htmlContent, hasMinimalContent);
    if (siteResult.detected) {
      this.detectionStats[siteResult.type]++;
      this.detectionStats.total++;
      return siteResult;
    }
    
    console.log('      ✅ No captcha or challenge detected');
    return { detected: false, type: null };
  }

  /**
   * DOM-based captcha detection
   */
  async detectViaDOM(page) {
    // reCAPTCHA v2
    const recaptchaV2 = await page.$('iframe[src*="recaptcha/api2/anchor"]');
    if (recaptchaV2) {
      console.log('      🚫 Detected: reCAPTCHA v2 iframe');
      return { detected: true, type: 'recaptcha_v2' };
    }
    
    // reCAPTCHA v3 or invisible
    const recaptchaV3 = await page.$('div.g-recaptcha[data-sitekey]');
    if (recaptchaV3) {
      console.log('      🚫 Detected: reCAPTCHA v3/invisible');
      return { detected: true, type: 'recaptcha_v3' };
    }
    
    // hCAPTCHA
    const hcaptcha = await page.$('iframe[src*="hcaptcha.com"], div[data-hcaptcha-widget-id]');
    if (hcaptcha) {
      console.log('      🚫 Detected: hCAPTCHA');
      return { detected: true, type: 'hcaptcha' };
    }
    
    // Cloudflare Turnstile
    const turnstile = await page.$('iframe[src*="challenges.cloudflare.com/cdn-cgi/challenge-platform"]');
    if (turnstile) {
      console.log('      🚫 Detected: Cloudflare Turnstile');
      return { detected: true, type: 'cloudflare' };
    }
    
    // FunCaptcha/Arkose Labs
    const funcaptcha = await page.$('[id*="funcaptcha"], [class*="funcaptcha"], iframe[src*="funcaptcha.com"], iframe[src*="arkoselabs.com"]');
    if (funcaptcha) {
      console.log('      🚫 Detected: FunCaptcha/Arkose Labs');
      return { detected: true, type: 'funcaptcha' };
    }
    
    // GeeTest
    const geetest = await page.$('div.geetest_captcha, div[id*="geetest"], div[class*="geetest"]');
    if (geetest) {
      console.log('      🚫 Detected: GeeTest CAPTCHA');
      return { detected: true, type: 'geetest' };
    }
    
    // Image captchas
    const imageCaptcha = await page.$('img[src*="captcha"], img[alt*="captcha"], div.captcha-image, div[class*="captcha"][class*="image"]');
    if (imageCaptcha) {
      console.log('      🚫 Detected: Image CAPTCHA');
      return { detected: true, type: 'image' };
    }
    
    // Custom captcha inputs
    const customCaptcha = await page.$('input[name*="captcha"], input[placeholder*="captcha"], label:has-text("captcha"), label:has-text("security code")');
    if (customCaptcha) {
      console.log('      🚫 Detected: Custom CAPTCHA input');
      return { detected: true, type: 'custom' };
    }
    
    return { detected: false };
  }

  /**
   * Title-based detection
   */
  detectViaTitle(htmlContent) {
    const titleMatch = htmlContent.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (!titleMatch || !titleMatch[1]) {
      return { detected: false };
    }
    
    const title = titleMatch[1].toLowerCase();
    const challengeTitles = [
      { pattern: 'just a moment', type: 'cloudflare' },
      { pattern: 'attention required', type: 'cloudflare' },
      { pattern: 'security check', type: 'challenge_page' },
      { pattern: 'access denied', type: 'challenge_page' },
      { pattern: 'please wait', type: 'challenge_page' },
      { pattern: 'checking your browser', type: 'cloudflare' },
      { pattern: 'verify you are human', type: 'challenge_page' },
      { pattern: 'one more step', type: 'challenge_page' },
      { pattern: 'are you a robot', type: 'challenge_page' },
      { pattern: 'prove you are human', type: 'challenge_page' },
      { pattern: 'enable cookies', type: 'challenge_page' },
      { pattern: 'enable javascript', type: 'challenge_page' }
    ];
    
    for (const { pattern, type } of challengeTitles) {
      if (title.includes(pattern)) {
        console.log(`      🚫 Challenge detected in title: "${titleMatch[1]}" (${type})`);
        return { detected: true, type };
      }
    }
    
    return { detected: false };
  }

  /**
   * Pattern-based detection in content
   */
  detectViaPatterns(htmlContent) {
    const patterns = [
      // Cloudflare
      { regex: /cf-browser-verification/i, type: 'cloudflare' },
      { regex: /cf-challenge/i, type: 'cloudflare' },
      { regex: /challenge-form/i, type: 'cloudflare' },
      { regex: /ray\s*id:\s*[a-f0-9]+/i, type: 'cloudflare' },
      
      // Generic challenges
      { regex: /checking\s+your\s+browser/i, type: 'challenge_page' },
      { regex: /this\s+process\s+is\s+automatic/i, type: 'challenge_page' },
      { regex: /you\s+will\s+be\s+redirected/i, type: 'challenge_page' },
      { regex: /verify\s+you\s+are\s+human/i, type: 'challenge_page' },
      { regex: /please\s+complete\s+the\s+security\s+check/i, type: 'challenge_page' },
      { regex: /enable\s+javascript\s+to\s+continue/i, type: 'challenge_page' },
      { regex: /ddos\s+protection\s+by/i, type: 'challenge_page' },
      { regex: /browser\s+verification\s+required/i, type: 'challenge_page' },
      
      // Bot detection services
      { regex: /datadome[-\s]?protection/i, type: 'challenge_page' },
      { regex: /perimeterx/i, type: 'challenge_page' },
      { regex: /kasada/i, type: 'challenge_page' },
      { regex: /shape\s+security/i, type: 'challenge_page' },
      { regex: /distil\s+networks/i, type: 'challenge_page' },
      { regex: /incapsula/i, type: 'challenge_page' },
      { regex: /akamai\s+bot\s+manager/i, type: 'challenge_page' }
    ];
    
    for (const { regex, type } of patterns) {
      if (regex.test(htmlContent)) {
        console.log(`      🚫 Challenge pattern detected: ${regex} (${type})`);
        return { detected: true, type };
      }
    }
    
    return { detected: false };
  }

  /**
   * Script-based detection
   */
  async detectViaScripts(page) {
    try {
      const scripts = await page.$$eval('script', elements => 
        elements.map(el => ({
          src: el.src || '',
          content: el.textContent.substring(0, 200) // First 200 chars
        }))
      );
      
      const captchaIndicators = [
        { pattern: 'recaptcha', type: 'recaptcha_v2' },
        { pattern: 'google.com/recaptcha', type: 'recaptcha_v2' },
        { pattern: 'hcaptcha.com', type: 'hcaptcha' },
        { pattern: 'funcaptcha', type: 'funcaptcha' },
        { pattern: 'arkoselabs', type: 'funcaptcha' },
        { pattern: 'geetest', type: 'geetest' },
        { pattern: 'challenges.cloudflare.com', type: 'cloudflare' },
        { pattern: 'datadome', type: 'challenge_page' },
        { pattern: 'perimeterx', type: 'challenge_page' }
      ];
      
      for (const script of scripts) {
        const combined = script.src + ' ' + script.content;
        for (const { pattern, type } of captchaIndicators) {
          if (combined.toLowerCase().includes(pattern)) {
            console.log(`      🚫 Captcha script detected: ${pattern} (${type})`);
            return { detected: true, type };
          }
        }
      }
    } catch (e) {
      // Page might have navigated away
    }
    
    return { detected: false };
  }

  /**
   * Dynamic wait detection
   */
  async detectViaDynamicWait(page) {
    console.log('      ⏳ Waiting for dynamic captcha elements...');
    try {
      await page.waitForSelector(
        [
          'iframe[src*="recaptcha"]',
          'iframe[src*="hcaptcha"]',
          'iframe[src*="challenges.cloudflare.com"]',
          'div.g-recaptcha',
          'div[id*="captcha"]',
          'div[class*="captcha"]',
          '.cf-challenge',
          '#challenge-form'
        ].join(', '),
        { timeout: 3000 }
      );
      console.log('      🚫 Dynamic captcha element appeared');
      return { detected: true, type: 'challenge_page' };
    } catch (e) {
      // No captcha appeared
    }
    
    return { detected: false };
  }

  /**
   * Site-specific detection rules
   */
  detectViaSiteSpecific(url, htmlContent, hasMinimalContent) {
    const hostname = new URL(url).hostname;
    
    // You.com specific
    if (hostname.includes('you.com') && hasMinimalContent && htmlContent.includes('security')) {
      console.log('      🚫 You.com security check detected');
      return { detected: true, type: 'challenge_page' };
    }
    
    // Add more site-specific rules as needed
    const siteRules = [
      {
        domain: 'example.com',
        check: (content) => content.includes('specific-pattern'),
        type: 'custom'
      }
    ];
    
    for (const rule of siteRules) {
      if (hostname.includes(rule.domain) && rule.check(htmlContent)) {
        console.log(`      🚫 Site-specific detection: ${rule.domain}`);
        return { detected: true, type: rule.type };
      }
    }
    
    return { detected: false };
  }

  /**
   * Get detection statistics
   */
  getStats() {
    return this.detectionStats;
  }
}

module.exports = CaptchaDetector;
