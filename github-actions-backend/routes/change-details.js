const express = require('express');
const path = require('path');
const dbManager = require('../db-manager');

// Create router
const router = express.Router();

/**
 * GET /api/changes/:changeId
 * Get detailed information about a specific change including before/after content
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
    
    // Get change details with company and URL info
    const changeQuery = processedDb.prepare(`
      SELECT 
        cd.*,
        u.url,
        u.url_type,
        c.name as company_name,
        c.category as company_category
      FROM change_detection cd
      JOIN intel.urls u ON cd.url_id = u.id
      JOIN intel.companies c ON u.company_id = c.id
      WHERE cd.id = ?
    `);
    
    const change = changeQuery.get(changeId);
    
    if (!change) {
      return res.status(404).json({ error: 'Change not found' });
    }
    
    // Get before/after content if available
    let beforeContent = null;
    let afterContent = null;
    
    if (change.old_content_id) {
      const oldContentQuery = processedDb.prepare(`
        SELECT html_content FROM raw.raw_html WHERE id = ?
      `);
      const oldRaw = oldContentQuery.get(change.old_content_id);
      if (oldRaw) {
        beforeContent = {
          html: oldRaw.html_content,
          markdown: extractMarkdown(oldRaw.html_content)
        };
      }
    }
    
    if (change.new_content_id) {
      const newContentQuery = processedDb.prepare(`
        SELECT html_content FROM raw.raw_html WHERE id = ?
      `);
      const newRaw = newContentQuery.get(change.new_content_id);
      if (newRaw) {
        afterContent = {
          html: newRaw.html_content,
          markdown: extractMarkdown(newRaw.html_content)
        };
      }
    }
    
    // Parse interest data if available
    let interestData = null;
    if (change.interest_data) {
      try {
        interestData = JSON.parse(change.interest_data);
      } catch (e) {
        console.error('Failed to parse interest_data:', e);
      }
    }
    
    // Detach databases
    processedDb.exec('DETACH DATABASE raw');
    processedDb.exec('DETACH DATABASE intel');
    
    // Build response
    const response = {
      id: change.id,
      company: {
        name: change.company_name,
        category: change.company_category
      },
      url: {
        url: change.url,
        type: change.url_type
      },
      change: {
        type: change.change_type,
        summary: change.summary,
        detected_at: change.detected_at,
        interest_level: change.interest_level || change.relevance_score || 5,
        interest_data: interestData
      },
      content: {
        before: beforeContent,
        after: afterContent,
        hasComparison: !!(beforeContent && afterContent)
      }
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

// Helper function to extract markdown from HTML
function extractMarkdown(html) {
  if (!html) return '';
  
  // Simple HTML to markdown conversion
  // In production, you'd use a proper library like turndown
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    .replace(/<br[^>]*>/gi, '\n')
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
    .replace(/<a[^>]+href="([^"]+)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

// Helper function to create a simple diff
function createDiff(oldText, newText) {
  // Split into lines
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  
  // Simple diff - in production you'd use a proper diff library
  const diff = {
    added: [],
    removed: [],
    summary: ''
  };
  
  // Find unique lines in each
  const oldSet = new Set(oldLines.filter(l => l.trim()));
  const newSet = new Set(newLines.filter(l => l.trim()));
  
  // Find additions and removals
  for (const line of newSet) {
    if (!oldSet.has(line) && line.trim()) {
      diff.added.push(line);
    }
  }
  
  for (const line of oldSet) {
    if (!newSet.has(line) && line.trim()) {
      diff.removed.push(line);
    }
  }
  
  // Create summary
  if (diff.added.length > 0 || diff.removed.length > 0) {
    diff.summary = `${diff.added.length} lines added, ${diff.removed.length} lines removed`;
  } else {
    diff.summary = 'Minor formatting changes only';
  }
  
  return diff;
}

module.exports = router;