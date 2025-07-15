const express = require('express');
const path = require('path');
const dbManager = require('../db-manager');
const TurndownService = require('turndown');

// Create router
const router = express.Router();

// Initialize Turndown for HTML to Markdown conversion
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced'
});

/**
 * GET /api/changes/:changeId
 * Get detailed information about a specific change including before/after content
 * Enhanced version with interest analysis, keyword extraction, and proper markdown conversion
 */
router.get('/changes/:changeId', async (req, res) => {
  try {
    const { changeId } = req.params;
    
    // Get database connections
    const processedDb = dbManager.getProcessedDb();
    const rawDb = dbManager.getRawDb();
    const intelligenceDb = dbManager.getIntelligenceDb();
    
    // Attach other databases for cross-database queries
    processedDb.exec(`ATTACH DATABASE '${path.join(__dirname, '..', 'data', 'raw_content.db')}' AS raw`);
    processedDb.exec(`ATTACH DATABASE '${path.join(__dirname, '..', 'data', 'intelligence.db')}' AS intel`);
    
    // Get change details with company, URL info, and enhanced analysis
    const changeQuery = processedDb.prepare(`
      SELECT 
        cd.*,
        u.url,
        u.url_type,
        c.name as company_name,
        c.category as company_category,
        ea.entities,
        ea.relationships,
        ea.competitive_data,
        ea.semantic_categories,
        ea.extracted_text
      FROM change_detection cd
      JOIN intel.urls u ON cd.url_id = u.id
      JOIN intel.companies c ON u.company_id = c.id
      LEFT JOIN intel.enhanced_analysis ea ON ea.change_id = cd.id
      WHERE cd.id = ?
    `);
    
    const change = changeQuery.get(changeId);
    
    if (!change) {
      return res.status(404).json({ error: 'Change not found' });
    }
    
    // Get before/after content with proper markdown conversion
    let beforeContent = null;
    let afterContent = null;
    
    // First try to get markdown content from processed_content.db
    if (change.old_hash) {
      const oldMarkdownQuery = processedDb.prepare(`
        SELECT mc.content_markdown, mc.processed_at
        FROM markdown_content mc
        JOIN raw.raw_html rh ON mc.raw_html_id = rh.id
        WHERE rh.content_hash = ?
        ORDER BY mc.processed_at DESC
        LIMIT 1
      `);
      const oldMarkdown = oldMarkdownQuery.get(change.old_hash);
      
      if (oldMarkdown) {
        beforeContent = {
          markdown: oldMarkdown.content_markdown,
          captured_at: oldMarkdown.processed_at
        };
      } else if (change.old_content_id) {
        // Fallback to HTML conversion
        const oldContentQuery = processedDb.prepare(`
          SELECT html_content, scraped_at FROM raw.raw_html WHERE id = ?
        `);
        const oldRaw = oldContentQuery.get(change.old_content_id);
        if (oldRaw) {
          beforeContent = {
            markdown: turndownService.turndown(oldRaw.html_content || ''),
            captured_at: oldRaw.scraped_at
          };
        }
      }
    }
    
    if (change.new_hash) {
      const newMarkdownQuery = processedDb.prepare(`
        SELECT mc.content_markdown, mc.processed_at
        FROM markdown_content mc
        JOIN raw.raw_html rh ON mc.raw_html_id = rh.id
        WHERE rh.content_hash = ?
        ORDER BY mc.processed_at DESC
        LIMIT 1
      `);
      const newMarkdown = newMarkdownQuery.get(change.new_hash);
      
      if (newMarkdown) {
        afterContent = {
          markdown: newMarkdown.content_markdown,
          captured_at: newMarkdown.processed_at
        };
      } else if (change.new_content_id) {
        // Fallback to HTML conversion
        const newContentQuery = processedDb.prepare(`
          SELECT html_content, scraped_at FROM raw.raw_html WHERE id = ?
        `);
        const newRaw = newContentQuery.get(change.new_content_id);
        if (newRaw) {
          afterContent = {
            markdown: turndownService.turndown(newRaw.html_content || ''),
            captured_at: newRaw.scraped_at
          };
        }
      }
    }
    
    // Parse enhanced analysis data
    let interestData = null;
    let entities = null;
    let extractedText = null;
    
    if (change.competitive_data) {
      try {
        const competitiveData = JSON.parse(change.competitive_data);
        interestData = competitiveData.interest_assessment || competitiveData;
      } catch (e) {
        console.error('Failed to parse competitive_data:', e);
      }
    }
    
    if (change.entities) {
      try {
        entities = JSON.parse(change.entities);
      } catch (e) {
        console.error('Failed to parse entities:', e);
      }
    }
    
    if (change.extracted_text) {
      try {
        extractedText = JSON.parse(change.extracted_text);
      } catch (e) {
        console.error('Failed to parse extracted_text:', e);
      }
    }
    
    // Extract keywords and create diff
    let keywordAnalysis = null;
    let contentDiff = null;
    
    if (beforeContent && afterContent) {
      keywordAnalysis = extractKeywords(beforeContent.markdown, afterContent.markdown);
      contentDiff = createEnhancedDiff(beforeContent.markdown, afterContent.markdown);
    }
    
    // Detach databases
    processedDb.exec('DETACH DATABASE raw');
    processedDb.exec('DETACH DATABASE intel');
    
    // Build enhanced response
    const response = {
      change_id: change.id,
      url: change.url,
      company: change.company_name,
      company_category: change.company_category,
      detected_at: change.detected_at,
      
      // Interest analysis
      interest_level: interestData?.interest_level || change.interest_level || change.relevance_score || 5,
      interest_category: interestData?.category || 'routine_change',
      interest_explanation: interestData?.summary || change.summary || 'Change detected',
      interest_drivers: interestData?.interest_drivers || [],
      technical_innovation_score: interestData?.technical_innovation_score || 5,
      business_impact_score: interestData?.business_impact_score || 5,
      
      // Content comparison
      before: beforeContent,
      after: afterContent,
      
      // Diff analysis
      diff: contentDiff || {
        added_keywords: [],
        removed_keywords: [],
        key_changes: [],
        change_percentage: 0
      },
      
      // Keyword analysis
      keywords: keywordAnalysis || {
        new_keywords: [],
        removed_keywords: [],
        frequency_changes: {}
      },
      
      // Extracted entities and text
      entities: entities,
      key_phrases: extractedText?.key_phrases || []
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('Error fetching change details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/changes/:changeId/diff
 * Get a simplified diff view of the change
 */
router.get('/changes/:changeId/diff', async (req, res) => {
  try {
    const { changeId } = req.params;
    
    // Get database connections
    const processedDb = dbManager.getProcessedDb();
    const rawDb = dbManager.getRawDb();
    
    // Get markdown content from processed_content.db
    const markdownQuery = processedDb.prepare(`
      SELECT 
        cd.*,
        mc_old.content_markdown as old_markdown,
        mc_new.content_markdown as new_markdown
      FROM change_detection cd
      LEFT JOIN markdown_content mc_old ON cd.old_content_id = mc_old.id
      LEFT JOIN markdown_content mc_new ON cd.new_content_id = mc_new.id
      WHERE cd.id = ?
    `);
    
    const change = markdownQuery.get(changeId);
    
    if (!change) {
      return res.status(404).json({ error: 'Change not found' });
    }
    
    // Create diff sections
    const diff = createDiff(change.old_markdown || '', change.new_markdown || '');
    
    res.json({
      id: change.id,
      detected_at: change.detected_at,
      diff: diff,
      interest_level: change.interest_level || change.relevance_score || 5
    });
    
  } catch (error) {
    console.error('Error creating diff:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to extract keywords from text
function extractKeywords(beforeText, afterText) {
  if (!beforeText || !afterText) return null;
  
  // Simple keyword extraction - in production use NLP library
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
    'is', 'are', 'was', 'were', 'been', 'be', 'have', 'has', 'had', 'will',
    'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that',
    'these', 'those', 'it', 'its', 'their', 'them', 'they', 'we', 'our', 'us'
  ]);
  
  // Extract words from text
  const extractWords = (text) => {
    return text.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));
  };
  
  const beforeWords = extractWords(beforeText);
  const afterWords = extractWords(afterText);
  
  // Count word frequencies
  const countFrequencies = (words) => {
    const freq = {};
    words.forEach(word => {
      freq[word] = (freq[word] || 0) + 1;
    });
    return freq;
  };
  
  const beforeFreq = countFrequencies(beforeWords);
  const afterFreq = countFrequencies(afterWords);
  
  // Find new keywords (in after but not before)
  const newKeywords = [];
  const removedKeywords = [];
  const frequencyChanges = {};
  
  // Check for new keywords
  Object.keys(afterFreq).forEach(word => {
    if (!beforeFreq[word]) {
      newKeywords.push({ word, frequency: afterFreq[word] });
    } else if (afterFreq[word] > beforeFreq[word]) {
      frequencyChanges[word] = {
        before: beforeFreq[word],
        after: afterFreq[word],
        change: afterFreq[word] - beforeFreq[word]
      };
    }
  });
  
  // Check for removed keywords
  Object.keys(beforeFreq).forEach(word => {
    if (!afterFreq[word]) {
      removedKeywords.push({ word, frequency: beforeFreq[word] });
    }
  });
  
  // Sort by frequency
  newKeywords.sort((a, b) => b.frequency - a.frequency);
  removedKeywords.sort((a, b) => b.frequency - a.frequency);
  
  // Extract significant phrases (bigrams)
  const extractPhrases = (words) => {
    const phrases = {};
    for (let i = 0; i < words.length - 1; i++) {
      const phrase = `${words[i]} ${words[i + 1]}`;
      phrases[phrase] = (phrases[phrase] || 0) + 1;
    }
    return Object.entries(phrases)
      .filter(([_, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([phrase, count]) => ({ phrase, count }));
  };
  
  const newPhrases = extractPhrases(afterWords);
  
  return {
    new_keywords: newKeywords.slice(0, 20),
    removed_keywords: removedKeywords.slice(0, 20),
    frequency_changes: Object.entries(frequencyChanges)
      .sort((a, b) => b[1].change - a[1].change)
      .slice(0, 10)
      .reduce((acc, [word, data]) => ({ ...acc, [word]: data }), {}),
    significant_phrases: newPhrases
  };
}

// Helper function to create enhanced diff with key change detection
function createEnhancedDiff(oldText, newText) {
  if (!oldText || !newText) return null;
  
  // Split into sentences for better granularity
  const splitSentences = (text) => {
    return text.match(/[^.!?]+[.!?]+/g) || [];
  };
  
  const oldSentences = splitSentences(oldText).map(s => s.trim());
  const newSentences = splitSentences(newText).map(s => s.trim());
  
  // Find added and removed sentences
  const oldSet = new Set(oldSentences);
  const newSet = new Set(newSentences);
  
  const addedSentences = [];
  const removedSentences = [];
  
  newSentences.forEach(sentence => {
    if (!oldSet.has(sentence)) {
      addedSentences.push(sentence);
    }
  });
  
  oldSentences.forEach(sentence => {
    if (!newSet.has(sentence)) {
      removedSentences.push(sentence);
    }
  });
  
  // Calculate change percentage
  const totalSentences = Math.max(oldSentences.length, newSentences.length);
  const changedSentences = addedSentences.length + removedSentences.length;
  const changePercentage = totalSentences > 0 ? 
    Math.round((changedSentences / totalSentences) * 100) : 0;
  
  // Extract key changes (look for specific patterns)
  const keyChanges = [];
  
  // Look for version numbers, prices, dates
  const versionPattern = /v?\d+\.\d+(\.\d+)?|version \d+/gi;
  const pricePattern = /\$[\d,]+(\.\d{2})?|[\d,]+\s*(USD|dollars?)/gi;
  const datePattern = /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}|\d{1,2}\/\d{1,2}\/\d{2,4}/gi;
  
  // Check for pattern changes
  const extractPatterns = (text, pattern) => {
    return [...new Set((text.match(pattern) || []))];
  };
  
  const oldVersions = extractPatterns(oldText, versionPattern);
  const newVersions = extractPatterns(newText, versionPattern);
  const oldPrices = extractPatterns(oldText, pricePattern);
  const newPrices = extractPatterns(newText, pricePattern);
  const oldDates = extractPatterns(oldText, datePattern);
  const newDates = extractPatterns(newText, datePattern);
  
  // Add key changes
  if (newVersions.length > 0 && newVersions.some(v => !oldVersions.includes(v))) {
    keyChanges.push(`New version: ${newVersions.filter(v => !oldVersions.includes(v)).join(', ')}`);
  }
  
  if (newPrices.length > 0 && newPrices.some(p => !oldPrices.includes(p))) {
    keyChanges.push(`Price change: ${newPrices.filter(p => !oldPrices.includes(p)).join(', ')}`);
  }
  
  if (newDates.length > 0 && newDates.some(d => !oldDates.includes(d))) {
    keyChanges.push(`New date mentioned: ${newDates.filter(d => !oldDates.includes(d)).join(', ')}`);
  }
  
  // Look for AI/ML specific terms
  const aiTerms = [
    'model', 'api', 'release', 'launch', 'announcement', 'update',
    'performance', 'benchmark', 'capability', 'feature', 'integration',
    'partnership', 'funding', 'acquisition', 'patent'
  ];
  
  aiTerms.forEach(term => {
    const termRegex = new RegExp(`\b${term}s?\b`, 'gi');
    const oldCount = (oldText.match(termRegex) || []).length;
    const newCount = (newText.match(termRegex) || []).length;
    
    if (newCount > oldCount && newCount > 0) {
      const contexts = newSentences.filter(s => s.toLowerCase().includes(term));
      if (contexts.length > 0) {
        keyChanges.push(`New ${term} mentioned`);
      }
    }
  });
  
  return {
    added_sentences: addedSentences.slice(0, 10),
    removed_sentences: removedSentences.slice(0, 10),
    key_changes: keyChanges.slice(0, 10),
    change_percentage: changePercentage,
    summary: `${changePercentage}% content changed (${addedSentences.length} additions, ${removedSentences.length} removals)`
  };
}

module.exports = router;