const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const TurndownService = require('turndown');

// Initialize Turndown for HTML to Markdown conversion
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced'
});

// Database paths
const dataDir = path.join(__dirname, 'data');
const processedDb = new Database(path.join(dataDir, 'processed_content.db'));
const rawDb = new Database(path.join(dataDir, 'raw_content.db'));
const intelligenceDb = new Database(path.join(dataDir, 'intelligence.db'));

// Output directory for change details
const outputDir = path.join(__dirname, '..', 'api-data', 'changes');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Attach databases for cross-database queries
processedDb.exec(`ATTACH DATABASE '${path.join(dataDir, 'raw_content.db')}' AS raw`);
processedDb.exec(`ATTACH DATABASE '${path.join(dataDir, 'intelligence.db')}' AS intel`);

console.log('📝 Generating static change detail files...');

// Get all recent changes
const changesQuery = processedDb.prepare(`
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
  ORDER BY cd.detected_at DESC
  LIMIT 100
`);

const changes = changesQuery.all();

console.log(`Found ${changes.length} changes to process`);

// Process each change
changes.forEach((change, index) => {
  try {
    // Get before/after content
    let beforeContent = null;
    let afterContent = null;
    
    if (change.old_content_id) {
      // Try to get markdown content first
      const oldMarkdownQuery = processedDb.prepare(`
        SELECT markdown_text, processed_at
        FROM markdown_content
        WHERE raw_html_id = ?
        ORDER BY processed_at DESC
        LIMIT 1
      `);
      const oldMarkdown = oldMarkdownQuery.get(change.old_content_id);
      
      if (oldMarkdown && oldMarkdown.markdown_text) {
        beforeContent = {
          markdown: oldMarkdown.markdown_text,
          captured_at: oldMarkdown.processed_at
        };
      } else {
        // Fallback to HTML conversion
        const oldContentQuery = processedDb.prepare(`
          SELECT html_content, scraped_at FROM raw.raw_html WHERE id = ?
        `);
        const oldRaw = oldContentQuery.get(change.old_content_id);
        if (oldRaw && oldRaw.html_content) {
          beforeContent = {
            markdown: turndownService.turndown(oldRaw.html_content),
            captured_at: oldRaw.scraped_at
          };
        }
      }
    }
    
    if (change.new_content_id) {
      // Try to get markdown content first
      const newMarkdownQuery = processedDb.prepare(`
        SELECT markdown_text, processed_at
        FROM markdown_content
        WHERE raw_html_id = ?
        ORDER BY processed_at DESC
        LIMIT 1
      `);
      const newMarkdown = newMarkdownQuery.get(change.new_content_id);
      
      if (newMarkdown && newMarkdown.markdown_text) {
        afterContent = {
          markdown: newMarkdown.markdown_text,
          captured_at: newMarkdown.processed_at
        };
      } else {
        // Fallback to HTML conversion
        const newContentQuery = processedDb.prepare(`
          SELECT html_content, scraped_at FROM raw.raw_html WHERE id = ?
        `);
        const newRaw = newContentQuery.get(change.new_content_id);
        if (newRaw && newRaw.html_content) {
          afterContent = {
            markdown: turndownService.turndown(newRaw.html_content),
            captured_at: newRaw.scraped_at
          };
        }
      }
    }
    
    // Parse enhanced analysis data
    let interestData = null;
    let entities = null;
    let extractedText = null;
    
    const interestDataSource = change.interest_data || change.competitive_data;
    if (interestDataSource) {
      try {
        const parsedData = JSON.parse(interestDataSource);
        interestData = parsedData.interest_assessment || parsedData;
      } catch (e) {
        console.error('Failed to parse interest data:', e);
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
    
    if (beforeContent && afterContent && beforeContent.markdown && afterContent.markdown) {
      keywordAnalysis = extractKeywords(beforeContent.markdown, afterContent.markdown);
      contentDiff = createEnhancedDiff(beforeContent.markdown, afterContent.markdown);
    }
    
    // Build change detail object
    const changeDetail = {
      change_id: change.id,
      url: change.url,
      company: change.company_name,
      company_category: change.company_category,
      detected_at: change.detected_at,
      
      // Interest analysis
      interest_level: change.interest_level || interestData?.interest_level || change.relevance_score || 5,
      interest_category: interestData?.category || 'routine_change',
      interest_explanation: change.ai_explanation || interestData?.summary || change.summary || 'Change detected',
      interest_drivers: interestData?.interest_drivers || [],
      technical_innovation_score: interestData?.technical_innovation_score || 5,
      business_impact_score: interestData?.business_impact_score || 5,
      
      // AI analysis fields
      ai_key_changes: change.ai_key_changes,
      ai_business_context: change.ai_business_context,
      
      // Content comparison (limit size for static files)
      has_content: !!(beforeContent && afterContent),
      content_preview: {
        before: beforeContent ? beforeContent.markdown.substring(0, 500) + '...' : null,
        after: afterContent ? afterContent.markdown.substring(0, 500) + '...' : null
      },
      
      // Diff analysis
      diff: contentDiff || {
        added_sentences: [],
        removed_sentences: [],
        key_changes: [],
        change_percentage: 0,
        summary: 'No diff available'
      },
      
      // Keyword analysis
      keywords: keywordAnalysis || {
        new_keywords: [],
        removed_keywords: [],
        frequency_changes: {},
        significant_phrases: []
      },
      
      // Extracted entities and text
      entities: entities,
      key_phrases: extractedText?.key_phrases || []
    };
    
    // Save to file
    const filename = path.join(outputDir, `change-${change.id}.json`);
    fs.writeFileSync(filename, JSON.stringify(changeDetail, null, 2));
    
    if (index % 10 === 0) {
      console.log(`  ✅ Processed ${index + 1}/${changes.length} changes`);
    }
    
  } catch (error) {
    console.error(`Error processing change ${change.id}:`, error);
  }
});

// Detach databases
processedDb.exec('DETACH DATABASE raw');
processedDb.exec('DETACH DATABASE intel');

console.log(`✅ Generated ${changes.length} change detail files in ${outputDir}`);

// Helper function to extract keywords
function extractKeywords(beforeText, afterText) {
  if (!beforeText || !afterText) return null;
  
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
    'is', 'are', 'was', 'were', 'been', 'be', 'have', 'has', 'had', 'will',
    'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that',
    'these', 'those', 'it', 'its', 'their', 'them', 'they', 'we', 'our', 'us'
  ]);
  
  const extractWords = (text) => {
    return text.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));
  };
  
  const beforeWords = extractWords(beforeText);
  const afterWords = extractWords(afterText);
  
  const countFrequencies = (words) => {
    const freq = {};
    words.forEach(word => {
      freq[word] = (freq[word] || 0) + 1;
    });
    return freq;
  };
  
  const beforeFreq = countFrequencies(beforeWords);
  const afterFreq = countFrequencies(afterWords);
  
  const newKeywords = [];
  const removedKeywords = [];
  const frequencyChanges = {};
  
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
  
  Object.keys(beforeFreq).forEach(word => {
    if (!afterFreq[word]) {
      removedKeywords.push({ word, frequency: beforeFreq[word] });
    }
  });
  
  newKeywords.sort((a, b) => b.frequency - a.frequency);
  removedKeywords.sort((a, b) => b.frequency - a.frequency);
  
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

// Helper function to create enhanced diff
function createEnhancedDiff(oldText, newText) {
  if (!oldText || !newText) {
    return {
      added_sentences: [],
      removed_sentences: [],
      key_changes: ['Content comparison not available'],
      change_percentage: 0,
      summary: 'Unable to create diff - missing content'
    };
  }
  
  const splitSentences = (text) => {
    return text.match(/[^.!?]+[.!?]+/g) || [];
  };
  
  const oldSentences = splitSentences(oldText).map(s => s.trim());
  const newSentences = splitSentences(newText).map(s => s.trim());
  
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
  
  const totalSentences = Math.max(oldSentences.length, newSentences.length);
  const changedSentences = addedSentences.length + removedSentences.length;
  const changePercentage = totalSentences > 0 ? 
    Math.round((changedSentences / totalSentences) * 100) : 0;
  
  const keyChanges = [];
  
  const versionPattern = /v?\d+\.\d+(\.\d+)?|version \d+/gi;
  const pricePattern = /\$[\d,]+(\.\d{2})?|[\d,]+\s*(USD|dollars?)/gi;
  const datePattern = /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}|\d{1,2}\/\d{1,2}\/\d{2,4}/gi;
  
  const extractPatterns = (text, pattern) => {
    return [...new Set((text.match(pattern) || []))];
  };
  
  const oldVersions = extractPatterns(oldText, versionPattern);
  const newVersions = extractPatterns(newText, versionPattern);
  const oldPrices = extractPatterns(oldText, pricePattern);
  const newPrices = extractPatterns(newText, pricePattern);
  const oldDates = extractPatterns(oldText, datePattern);
  const newDates = extractPatterns(newText, datePattern);
  
  if (newVersions.length > 0 && newVersions.some(v => !oldVersions.includes(v))) {
    keyChanges.push(`New version: ${newVersions.filter(v => !oldVersions.includes(v)).join(', ')}`);
  }
  
  if (newPrices.length > 0 && newPrices.some(p => !oldPrices.includes(p))) {
    keyChanges.push(`Price change: ${newPrices.filter(p => !oldPrices.includes(p)).join(', ')}`);
  }
  
  if (newDates.length > 0 && newDates.some(d => !oldDates.includes(d))) {
    keyChanges.push(`New date mentioned: ${newDates.filter(d => !oldDates.includes(d)).join(', ')}`);
  }
  
  const aiTerms = [
    'model', 'api', 'release', 'launch', 'announcement', 'update',
    'performance', 'benchmark', 'capability', 'feature', 'integration',
    'partnership', 'funding', 'acquisition', 'patent'
  ];
  
  aiTerms.forEach(term => {
    const termRegex = new RegExp(`\\b${term}s?\\b`, 'gi');
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