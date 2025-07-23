const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Load environment variables
// Only load dotenv in development (not in GitHub Actions)
if (!process.env.GITHUB_ACTIONS && !process.env.POSTGRES_CONNECTION_STRING) {
  try {
    require('dotenv').config();
  } catch (e) {
    // dotenv not available or no .env file - this is fine
  }
}

// Import route modules
const changeDetailsRouter = require('./routes/change-details');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Mount API routes
app.use('/api', changeDetailsRouter);

// Database connection
const dbPath = path.join(__dirname, 'data', 'monitor.db');
if (!fs.existsSync(dbPath)) {
  console.error('❌ Database not found. Run npm run init-db first!');
  process.exit(1);
}

const db = new Database(dbPath);
db.exec('PRAGMA foreign_keys = ON');

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    version: '2.0.0',
    database: 'connected',
    timestamp: new Date().toISOString()
  });
});

// ==================== Company Management ====================

// List all companies
app.get('/api/companies', (req, res) => {
  try {
    const companies = db.prepare(`
      SELECT c.*, COUNT(u.id) as url_count
      FROM companies c
      LEFT JOIN urls u ON c.id = u.company_id
      GROUP BY c.id
      ORDER BY c.name
    `).all();
    
    res.json(companies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get company details with URLs
app.get('/api/companies/:id', (req, res) => {
  try {
    const company = db.prepare('SELECT * FROM companies WHERE id = ?').get(req.params.id);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    const urls = db.prepare('SELECT * FROM urls WHERE company_id = ?').all(req.params.id);
    
    res.json({ ...company, urls });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new company
app.post('/api/companies', (req, res) => {
  const { name, type = 'competitor', urls = [] } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Company name is required' });
  }
  
  try {
    const transaction = db.transaction(() => {
      const result = db.prepare(
        'INSERT INTO companies (name, type) VALUES (?, ?)'
      ).run(name, type);
      
      const companyId = result.lastInsertRowid;
      
      // Insert URLs if provided
      const insertUrl = db.prepare(`
        INSERT INTO urls (company_id, url, type, keywords) VALUES (?, ?, ?, ?)
      `);
      
      for (const urlData of urls) {
        insertUrl.run(
          companyId,
          urlData.url,
          urlData.type || 'general',
          JSON.stringify(urlData.keywords || [])
        );
      }
      
      return companyId;
    });
    
    const companyId = transaction();
    const company = db.prepare('SELECT * FROM companies WHERE id = ?').get(companyId);
    const companyUrls = db.prepare('SELECT * FROM urls WHERE company_id = ?').all(companyId);
    
    res.status(201).json({ ...company, urls: companyUrls });
  } catch (error) {
    if (error.message.includes('UNIQUE')) {
      res.status(409).json({ error: 'Company already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Update company
app.put('/api/companies/:id', (req, res) => {
  const { name, type, enabled } = req.body;
  
  try {
    const updates = [];
    const values = [];
    
    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (type !== undefined) {
      updates.push('type = ?');
      values.push(type);
    }
    if (enabled !== undefined) {
      updates.push('enabled = ?');
      values.push(enabled ? 1 : 0);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(req.params.id);
    
    const result = db.prepare(`
      UPDATE companies SET ${updates.join(', ')} WHERE id = ?
    `).run(...values);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    const company = db.prepare('SELECT * FROM companies WHERE id = ?').get(req.params.id);
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete company
app.delete('/api/companies/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM companies WHERE id = ?').run(req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== URL Management ====================

// Add URL to company
app.post('/api/companies/:id/urls', (req, res) => {
  const { url, type = 'general', css_selectors, keywords = [] } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }
  
  try {
    const result = db.prepare(`
      INSERT INTO urls (company_id, url, type, css_selectors, keywords)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      req.params.id,
      url,
      type,
      css_selectors ? JSON.stringify(css_selectors) : undefined,
      JSON.stringify(keywords)
    );
    
    const newUrl = db.prepare('SELECT * FROM urls WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newUrl);
  } catch (error) {
    if (error.message.includes('UNIQUE')) {
      res.status(409).json({ error: 'URL already exists for this company' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Update URL
app.put('/api/urls/:id', (req, res) => {
  const { type, check_frequency, css_selectors, keywords, enabled } = req.body;
  
  try {
    const updates = [];
    const values = [];
    
    if (type !== undefined) {
      updates.push('type = ?');
      values.push(type);
    }
    if (check_frequency !== undefined) {
      updates.push('check_frequency = ?');
      values.push(check_frequency);
    }
    if (css_selectors !== undefined) {
      updates.push('css_selectors = ?');
      values.push(JSON.stringify(css_selectors));
    }
    if (keywords !== undefined) {
      updates.push('keywords = ?');
      values.push(JSON.stringify(keywords));
    }
    if (enabled !== undefined) {
      updates.push('enabled = ?');
      values.push(enabled ? 1 : 0);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(req.params.id);
    
    const result = db.prepare(`
      UPDATE urls SET ${updates.join(', ')} WHERE id = ?
    `).run(...values);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'URL not found' });
    }
    
    const url = db.prepare('SELECT * FROM urls WHERE id = ?').get(req.params.id);
    res.json(url);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get URL details
app.get('/api/urls/:id', (req, res) => {
  try {
    const url = db.prepare('SELECT * FROM urls WHERE id = ?').get(req.params.id);
    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }
    res.json(url);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete URL
app.delete('/api/urls/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM urls WHERE id = ?').run(req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'URL not found' });
    }
    
    res.json({ message: 'URL deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== Group Management ====================

// List all groups
app.get('/api/groups', (req, res) => {
  try {
    const groups = db.prepare(`
      SELECT g.*, 
             COUNT(DISTINCT cg.company_id) as company_count,
             COUNT(DISTINCT ug.url_id) as url_count
      FROM groups g
      LEFT JOIN company_groups cg ON g.id = cg.group_id
      LEFT JOIN url_groups ug ON g.id = ug.group_id
      GROUP BY g.id
      ORDER BY g.name
    `).all();
    
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get group details with members
app.get('/api/groups/:id', (req, res) => {
  try {
    const group = db.prepare('SELECT * FROM groups WHERE id = ?').get(req.params.id);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    // Get companies in this group
    const companies = db.prepare(`
      SELECT c.*, cg.assigned_at
      FROM companies c
      JOIN company_groups cg ON c.id = cg.company_id
      WHERE cg.group_id = ?
      ORDER BY c.name
    `).all(req.params.id);
    
    // Get URLs in this group
    const urls = db.prepare(`
      SELECT u.*, c.name as company_name, ug.assigned_at
      FROM urls u
      JOIN url_groups ug ON u.id = ug.url_id
      JOIN companies c ON u.company_id = c.id
      WHERE ug.group_id = ?
      ORDER BY c.name, u.url
    `).all(req.params.id);
    
    res.json({ ...group, companies, urls });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new group
app.post('/api/groups', (req, res) => {
  const { name, description, color = '#3b82f6' } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Group name is required' });
  }
  
  try {
    const result = db.prepare(
      'INSERT INTO groups (name, description, color) VALUES (?, ?, ?)'
    ).run(name, description, color);
    
    const group = db.prepare('SELECT * FROM groups WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(group);
  } catch (error) {
    if (error.message.includes('UNIQUE')) {
      res.status(409).json({ error: 'Group name already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Update group
app.put('/api/groups/:id', (req, res) => {
  const { name, description, color } = req.body;
  
  try {
    const updates = [];
    const values = [];
    
    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (color !== undefined) {
      updates.push('color = ?');
      values.push(color);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(req.params.id);
    
    const result = db.prepare(`
      UPDATE groups SET ${updates.join(', ')} WHERE id = ?
    `).run(...values);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    const group = db.prepare('SELECT * FROM groups WHERE id = ?').get(req.params.id);
    res.json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete group
app.delete('/api/groups/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM groups WHERE id = ?').run(req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Assign company to group
app.post('/api/companies/:id/groups', (req, res) => {
  const { group_id } = req.body;
  
  if (!group_id) {
    return res.status(400).json({ error: 'group_id is required' });
  }
  
  try {
    db.prepare(
      'INSERT INTO company_groups (company_id, group_id) VALUES (?, ?)'
    ).run(req.params.id, group_id);
    
    res.status(201).json({ message: 'Company assigned to group successfully' });
  } catch (error) {
    if (error.message.includes('UNIQUE')) {
      res.status(409).json({ error: 'Company already assigned to this group' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Remove company from group
app.delete('/api/companies/:id/groups/:groupId', (req, res) => {
  try {
    const result = db.prepare(
      'DELETE FROM company_groups WHERE company_id = ? AND group_id = ?'
    ).run(req.params.id, req.params.groupId);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Company not assigned to this group' });
    }
    
    res.json({ message: 'Company removed from group successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Assign URL to group
app.post('/api/urls/:id/groups', (req, res) => {
  const { group_id } = req.body;
  
  if (!group_id) {
    return res.status(400).json({ error: 'group_id is required' });
  }
  
  try {
    db.prepare(
      'INSERT INTO url_groups (url_id, group_id) VALUES (?, ?)'
    ).run(req.params.id, group_id);
    
    res.status(201).json({ message: 'URL assigned to group successfully' });
  } catch (error) {
    if (error.message.includes('UNIQUE')) {
      res.status(409).json({ error: 'URL already assigned to this group' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Remove URL from group
app.delete('/api/urls/:id/groups/:groupId', (req, res) => {
  try {
    const result = db.prepare(
      'DELETE FROM url_groups WHERE url_id = ? AND group_id = ?'
    ).run(req.params.id, req.params.groupId);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'URL not assigned to this group' });
    }
    
    res.json({ message: 'URL removed from group successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get group for URL (with company fallback)
app.get('/api/urls/:id/group', (req, res) => {
  try {
    // First check for direct URL group assignment
    let group = db.prepare(`
      SELECT g.* FROM groups g
      JOIN url_groups ug ON g.id = ug.group_id
      WHERE ug.url_id = ?
    `).get(req.params.id);
    
    if (!group) {
      // Fall back to company group
      group = db.prepare(`
        SELECT g.* FROM groups g
        JOIN company_groups cg ON g.id = cg.group_id
        JOIN urls u ON cg.company_id = u.company_id
        WHERE u.id = ?
      `).get(req.params.id);
    }
    
    if (!group) {
      return res.status(404).json({ error: 'No group assigned' });
    }
    
    res.json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== Content & Monitoring ====================

// Store new content snapshot
app.post('/api/content-snapshots', (req, res) => {
  const { url_id, content_hash, full_content, extracted_content, title, meta_description } = req.body;
  
  if (!url_id || !content_hash || !full_content || !extracted_content) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  try {
    const word_count = extracted_content.split(/\s+/).length;
    const char_count = extracted_content.length;
    
    const result = db.prepare(`
      INSERT INTO content_snapshots 
      (url_id, content_hash, full_content, extracted_content, title, meta_description, word_count, char_count)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(url_id, content_hash, full_content, extracted_content, title, meta_description, word_count, char_count);
    
    const snapshot = db.prepare('SELECT * FROM content_snapshots WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(snapshot);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get content history for URL
app.get('/api/urls/:id/history', (req, res) => {
  const { limit = 30, offset = 0 } = req.query;
  
  try {
    const snapshots = db.prepare(`
      SELECT id, url_id, content_hash, title, meta_description, word_count, char_count, created_at
      FROM content_snapshots
      WHERE url_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(req.params.id, limit, offset);
    
    const total = db.prepare(
      'SELECT COUNT(*) as count FROM content_snapshots WHERE url_id = ?'
    ).get(req.params.id).count;
    
    res.json({ snapshots, total, limit: parseInt(limit), offset: parseInt(offset) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get diff between two snapshots
app.get('/api/diff/:old/:new', (req, res) => {
  try {
    const oldSnapshot = db.prepare(
      'SELECT * FROM content_snapshots WHERE id = ?'
    ).get(req.params.old);
    
    const newSnapshot = db.prepare(
      'SELECT * FROM content_snapshots WHERE id = ?'
    ).get(req.params.new);
    
    if (!oldSnapshot || !newSnapshot) {
      return res.status(404).json({ error: 'Snapshot not found' });
    }
    
    // Get or create change record
    let change = db.prepare(`
      SELECT * FROM changes 
      WHERE old_snapshot_id = ? AND new_snapshot_id = ?
    `).get(req.params.old, req.params.new);
    
    if (!change) {
      // Calculate diff (simplified - in production use a proper diff library)
      const oldWords = oldSnapshot.extracted_content.split(/\s+/);
      const newWords = newSnapshot.extracted_content.split(/\s+/);
      
      const additions = newWords.filter(w => !oldWords.includes(w));
      const deletions = oldWords.filter(w => !newWords.includes(w));
      
      const changePercentage = ((additions.length + deletions.length) / oldWords.length) * 100;
      
      const result = db.prepare(`
        INSERT INTO changes 
        (url_id, old_snapshot_id, new_snapshot_id, change_percentage, additions_count, deletions_count, additions_text, deletions_text)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        newSnapshot.url_id,
        req.params.old,
        req.params.new,
        changePercentage,
        additions.length,
        deletions.length,
        additions.slice(0, 100).join(' '),
        deletions.slice(0, 100).join(' ')
      );
      
      change = db.prepare('SELECT * FROM changes WHERE id = ?').get(result.lastInsertRowid);
    }
    
    res.json({
      change,
      old_snapshot: oldSnapshot,
      new_snapshot: newSnapshot
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== AI Analysis ====================

// Submit AI analysis for a change
app.post('/api/changes/:id/ai-analysis', (req, res) => {
  const { relevance_score, summary, category, competitive_threats, strategic_opportunities, raw_response } = req.body;
  
  if (!relevance_score || relevance_score < 1 || relevance_score > 10) {
    return res.status(400).json({ error: 'Valid relevance_score (1-10) is required' });
  }
  
  try {
    const result = db.prepare(`
      INSERT INTO ai_analysis 
      (change_id, relevance_score, summary, category, competitive_threats, strategic_opportunities, raw_response)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.params.id,
      relevance_score,
      summary,
      category,
      competitive_threats,
      strategic_opportunities,
      raw_response
    );
    
    const analysis = db.prepare('SELECT * FROM ai_analysis WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(analysis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recent changes with AI analysis
app.get('/api/changes/recent', (req, res) => {
  const { limit = 50, min_relevance = 0, company_id, group } = req.query;
  
  try {
    let query = `
      SELECT 
        c.*, 
        cs_old.title as old_title,
        cs_new.title as new_title,
        u.url,
        u.type as url_type,
        comp.name as company_name,
        aa.relevance_score,
        aa.summary,
        aa.category,
        aa.competitive_threats,
        aa.strategic_opportunities,
        aa.raw_response
      FROM changes c
      LEFT JOIN content_snapshots cs_old ON c.old_snapshot_id = cs_old.id
      JOIN content_snapshots cs_new ON c.new_snapshot_id = cs_new.id
      JOIN urls u ON c.url_id = u.id
      JOIN companies comp ON u.company_id = comp.id
      LEFT JOIN ai_analysis aa ON aa.change_id = c.id
    `;
    
    const params = [];
    const whereClauses = [];
    
    if (min_relevance > 0) {
      whereClauses.push('aa.relevance_score >= ?');
      params.push(min_relevance);
    }
    
    if (company_id) {
      whereClauses.push('comp.id = ?');
      params.push(company_id);
    }
    
    if (group) {
      // Filter by group name - check both URL groups and company groups
      query += `
        LEFT JOIN url_groups ug ON u.id = ug.url_id
        LEFT JOIN groups g1 ON ug.group_id = g1.id
        LEFT JOIN company_groups cg ON comp.id = cg.company_id
        LEFT JOIN groups g2 ON cg.group_id = g2.id
      `;
      whereClauses.push('(g1.name = ? OR g2.name = ?)');
      params.push(group, group);
    }
    
    if (whereClauses.length > 0) {
      query += ` WHERE ${whereClauses.join(' AND ')}`;
    }
    
    query += ' ORDER BY c.created_at DESC LIMIT ?';
    params.push(limit);
    
    const changes = db.prepare(query).all(...params);
    res.json(changes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== Dashboard & Reporting ====================

// Get dashboard data
app.get('/api/dashboard', (req, res) => {
  try {
    const stats = {
      companies: db.prepare('SELECT COUNT(*) as count FROM companies WHERE enabled = 1').get().count,
      urls: db.prepare('SELECT COUNT(*) as count FROM urls WHERE enabled = 1').get().count,
      total_snapshots: db.prepare('SELECT COUNT(*) as count FROM content_snapshots').get().count,
      recent_changes: db.prepare(`
        SELECT COUNT(*) as count FROM changes 
        WHERE created_at > datetime('now', '-24 hours')
      `).get().count,
      high_priority_alerts: db.prepare(`
        SELECT COUNT(*) as count 
        FROM changes c
        JOIN ai_analysis aa ON aa.change_id = c.id
        WHERE aa.relevance_score >= 7
        AND c.created_at > datetime('now', '-24 hours')
      `).get().count
    };
    
    const recent_alerts = db.prepare(`
      SELECT 
        c.*, 
        u.url,
        comp.name as company_name,
        aa.relevance_score,
        aa.summary,
        aa.category
      FROM changes c
      JOIN urls u ON c.url_id = u.id
      JOIN companies comp ON u.company_id = comp.id
      JOIN ai_analysis aa ON aa.change_id = c.id
      WHERE aa.relevance_score >= 7
      ORDER BY c.created_at DESC
      LIMIT 10
    `).all();
    
    const company_activity = db.prepare(`
      SELECT 
        comp.name,
        COUNT(DISTINCT c.id) as change_count,
        AVG(aa.relevance_score) as avg_relevance
      FROM companies comp
      LEFT JOIN urls u ON comp.id = u.company_id
      LEFT JOIN changes c ON u.id = c.url_id AND c.created_at > datetime('now', '-7 days')
      LEFT JOIN ai_analysis aa ON c.id = aa.change_id
      WHERE comp.enabled = 1
      GROUP BY comp.id
      ORDER BY change_count DESC
    `).all();
    
    res.json({
      stats,
      recent_alerts,
      company_activity,
      last_updated: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== LLM-Friendly Endpoints ====================

// Natural language company management
app.post('/api/llm/manage-company', (req, res) => {
  const { action, company_name, urls, keywords } = req.body;
  
  try {
    if (action === 'add') {
      // Use existing company creation endpoint logic
      const transaction = db.transaction(() => {
        const result = db.prepare(
          'INSERT INTO companies (name, type) VALUES (?, ?)'
        ).run(company_name, 'competitor');
        
        const companyId = result.lastInsertRowid;
        
        if (urls && urls.length > 0) {
          const insertUrl = db.prepare(`
            INSERT INTO urls (company_id, url, type, keywords) VALUES (?, ?, ?, ?)
          `);
          
          for (const urlData of urls) {
            insertUrl.run(
              companyId,
              urlData.url,
              urlData.type || 'general',
              JSON.stringify(keywords || [])
            );
          }
        }
        
        return companyId;
      });
      
      const companyId = transaction();
      res.json({ 
        success: true, 
        message: `Company "${company_name}" added successfully`,
        company_id: companyId 
      });
      
    } else if (action === 'remove') {
      const company = db.prepare('SELECT id FROM companies WHERE name = ?').get(company_name);
      if (!company) {
        return res.status(404).json({ error: 'Company not found' });
      }
      
      db.prepare('DELETE FROM companies WHERE id = ?').run(company.id);
      res.json({ 
        success: true, 
        message: `Company "${company_name}" removed successfully` 
      });
      
    } else {
      res.status(400).json({ error: 'Invalid action. Use "add" or "remove"' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get structured insights for LLMs
app.get('/api/llm/insights', (req, res) => {
  const { company, days = 7 } = req.query;
  
  try {
    let query = `
      SELECT 
        comp.name as company,
        c.created_at as detected_at,
        u.url,
        u.type as page_type,
        c.change_percentage,
        aa.relevance_score,
        aa.category,
        aa.summary,
        aa.competitive_threats,
        aa.strategic_opportunities
      FROM changes c
      JOIN urls u ON c.url_id = u.id
      JOIN companies comp ON u.company_id = comp.id
      LEFT JOIN ai_analysis aa ON c.id = aa.change_id
      WHERE c.created_at > datetime('now', '-' || ? || ' days')
    `;
    
    const params = [days];
    
    if (company) {
      query += ' AND comp.name = ?';
      params.push(company);
    }
    
    query += ' ORDER BY aa.relevance_score DESC, c.created_at DESC';
    
    const insights = db.prepare(query).all(...params);
    
    res.json({
      period: `${days} days`,
      company_filter: company || 'all',
      total_changes: insights.length,
      high_priority_count: insights.filter(i => i.relevance_score >= 7).length,
      insights: insights
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== Configuration ====================

// Get configuration
app.get('/api/config', (req, res) => {
  try {
    const config = db.prepare('SELECT * FROM config').all();
    const configObj = {};
    config.forEach(row => {
      configObj[row.key] = row.value;
    });
    res.json(configObj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update configuration
app.put('/api/config', (req, res) => {
  try {
    const updateConfig = db.prepare(
      'INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)'
    );
    
    const transaction = db.transaction(() => {
      for (const [key, value] of Object.entries(req.body)) {
        updateConfig.run(key, String(value));
      }
    });
    
    transaction();
    
    // Return updated config
    const config = db.prepare('SELECT * FROM config').all();
    const configObj = {};
    config.forEach(row => {
      configObj[row.key] = row.value;
    });
    
    res.json(configObj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AI Monitor API server running on port ${PORT}`);
  console.log(`📊 Database: ${dbPath}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  db.close();
  process.exit(0);
});

module.exports = app;
