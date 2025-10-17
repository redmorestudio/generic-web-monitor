#!/usr/bin/env node

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const http = require('http');

/**
 * Health Check Service for AI Competitive Monitor
 * 
 * Provides a simple HTTP endpoint (/health) that checks:
 * - Database connectivity and integrity
 * - File system access
 * - Recent workflow runs
 * - Data freshness
 */

class HealthCheckService {
  constructor() {
    this.dataDir = path.join(__dirname, 'data');
    this.apiDataDir = path.join(__dirname, '..', 'api-data');
    this.port = process.env.HEALTH_CHECK_PORT || 3000;
    
    // Initialize health status
    this.status = {
      status: 'initializing',
      timestamp: new Date().toISOString(),
      checks: {}
    };
  }

  // Check database connectivity and basic integrity
  async checkDatabases() {
    const dbChecks = {
      intelligence: { path: 'intelligence.db', tables: ['companies', 'urls', 'baseline_analysis'] },
      processed: { path: 'processed_content.db', tables: ['markdown_content', 'change_detection', 'content_changes'] },
      raw: { path: 'raw_content.db', tables: ['raw_html', 'scrape_runs'] }
    };

    const results = {};

    for (const [name, config] of Object.entries(dbChecks)) {
      try {
        const dbPath = path.join(this.dataDir, config.path);
        
        // Check if file exists
        if (!fs.existsSync(dbPath)) {
          results[name] = {
            status: 'error',
            message: 'Database file not found',
            path: dbPath
          };
          continue;
        }

        // Open database
        const db = new Database(dbPath, { readonly: true });
        
        // Check tables exist
        const missingTables = [];
        for (const table of config.tables) {
          const tableExists = db.prepare(
            "SELECT name FROM sqlite_master WHERE type='table' AND name=?"
          ).get(table);
          
          if (!tableExists) {
            missingTables.push(table);
          }
        }

        // Get row counts for main tables
        const counts = {};
        for (const table of config.tables) {
          try {
            const result = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get();
            counts[table] = result.count;
          } catch (e) {
            counts[table] = 'error';
          }
        }

        // Get database size
        const stats = fs.statSync(dbPath);
        const sizeMB = (stats.size / 1024 / 1024).toFixed(2);

        db.close();

        results[name] = {
          status: missingTables.length > 0 ? 'warning' : 'healthy',
          message: missingTables.length > 0 ? `Missing tables: ${missingTables.join(', ')}` : 'All tables present',
          size: `${sizeMB} MB`,
          tables: counts
        };

      } catch (error) {
        results[name] = {
          status: 'error',
          message: error.message
        };
      }
    }

    return results;
  }

  // Check recent workflow status
  async checkWorkflowStatus() {
    try {
      const workflowStatusPath = path.join(this.apiDataDir, 'workflow-status.json');
      
      if (!fs.existsSync(workflowStatusPath)) {
        return {
          status: 'warning',
          message: 'Workflow status file not found'
        };
      }

      const workflowStatus = JSON.parse(fs.readFileSync(workflowStatusPath, 'utf8'));
      const lastRun = new Date(workflowStatus.last_run);
      const hoursSinceRun = (Date.now() - lastRun.getTime()) / (1000 * 60 * 60);

      return {
        status: hoursSinceRun > 12 ? 'warning' : 'healthy',
        message: hoursSinceRun > 12 ? 'No recent workflow runs' : 'Workflows running normally',
        last_run: workflowStatus.last_run,
        hours_since_run: hoursSinceRun.toFixed(1),
        workflow_status: workflowStatus.status,
        trigger_source: workflowStatus.trigger_source
      };

    } catch (error) {
      return {
        status: 'error',
        message: error.message
      };
    }
  }

  // Check data freshness
  async checkDataFreshness() {
    try {
      const db = new Database(path.join(this.dataDir, 'processed_content.db'), { readonly: true });
      
      // Get most recent change detection
      const recentChange = db.prepare(`
        SELECT detected_at 
        FROM change_detection 
        ORDER BY detected_at DESC 
        LIMIT 1
      `).get();

      // Get most recent content snapshot
      const recentSnapshot = db.prepare(`
        SELECT processed_at 
        FROM markdown_content 
        ORDER BY processed_at DESC 
        LIMIT 1
      `).get();

      db.close();

      const results = {};

      if (recentChange) {
        const changeDate = new Date(recentChange.detected_at);
        const daysSinceChange = (Date.now() - changeDate.getTime()) / (1000 * 60 * 60 * 24);
        results.last_change = {
          status: daysSinceChange > 7 ? 'warning' : 'healthy',
          message: daysSinceChange > 7 ? 'No changes detected in over a week' : 'Recent changes detected',
          timestamp: recentChange.detected_at,
          days_ago: daysSinceChange.toFixed(1)
        };
      } else {
        results.last_change = {
          status: 'warning',
          message: 'No changes recorded'
        };
      }

      if (recentSnapshot) {
        const snapshotDate = new Date(recentSnapshot.processed_at);
        const hoursSinceSnapshot = (Date.now() - snapshotDate.getTime()) / (1000 * 60 * 60);
        results.last_snapshot = {
          status: hoursSinceSnapshot > 24 ? 'warning' : 'healthy',
          message: hoursSinceSnapshot > 24 ? 'No snapshots in over 24 hours' : 'Recent snapshots captured',
          timestamp: recentSnapshot.processed_at,
          hours_ago: hoursSinceSnapshot.toFixed(1)
        };
      } else {
        results.last_snapshot = {
          status: 'warning',
          message: 'No snapshots recorded'
        };
      }

      return results;

    } catch (error) {
      return {
        status: 'error',
        message: error.message
      };
    }
  }

  // Check file system access
  async checkFileSystem() {
    const paths = [
      { name: 'data_directory', path: this.dataDir },
      { name: 'api_data_directory', path: this.apiDataDir },
      { name: 'dashboard', path: path.join(__dirname, '..', 'index.html') }
    ];

    const results = {};

    for (const check of paths) {
      try {
        const exists = fs.existsSync(check.path);
        const readable = exists && fs.accessSync(check.path, fs.constants.R_OK) === undefined;
        
        results[check.name] = {
          status: exists && readable ? 'healthy' : 'error',
          message: !exists ? 'Path not found' : !readable ? 'Not readable' : 'Accessible',
          path: check.path
        };
      } catch (error) {
        results[check.name] = {
          status: 'error',
          message: error.message
        };
      }
    }

    return results;
  }

  // Perform all health checks
  async performHealthCheck() {
    console.log('Performing health check...');
    
    const checks = {
      databases: await this.checkDatabases(),
      workflow: await this.checkWorkflowStatus(),
      data_freshness: await this.checkDataFreshness(),
      file_system: await this.checkFileSystem()
    };

    // Determine overall status
    let overallStatus = 'healthy';
    let errorCount = 0;
    let warningCount = 0;

    const checkStatus = (obj) => {
      if (typeof obj === 'object' && obj !== null) {
        if (obj.status === 'error') {
          errorCount++;
          overallStatus = 'error';
        } else if (obj.status === 'warning' && overallStatus !== 'error') {
          warningCount++;
          overallStatus = 'warning';
        }
        // Recursively check nested objects
        Object.values(obj).forEach(value => {
          if (typeof value === 'object' && value !== null) {
            checkStatus(value);
          }
        });
      }
    };

    Object.values(checks).forEach(checkStatus);

    this.status = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      summary: {
        errors: errorCount,
        warnings: warningCount,
        message: overallStatus === 'healthy' ? 'All systems operational' :
                 overallStatus === 'warning' ? `${warningCount} warnings detected` :
                 `${errorCount} errors detected`
      },
      checks: checks
    };

    return this.status;
  }

  // Start HTTP server
  async startServer() {
    const server = http.createServer(async (req, res) => {
      // Enable CORS
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET');
      res.setHeader('Content-Type', 'application/json');

      if (req.url === '/health') {
        try {
          const status = await this.performHealthCheck();
          res.statusCode = status.status === 'healthy' ? 200 : 
                          status.status === 'warning' ? 200 : 503;
          res.end(JSON.stringify(status, null, 2));
        } catch (error) {
          res.statusCode = 503;
          res.end(JSON.stringify({
            status: 'error',
            timestamp: new Date().toISOString(),
            error: error.message
          }));
        }
      } else {
        res.statusCode = 404;
        res.end(JSON.stringify({
          error: 'Not found',
          message: 'Use /health endpoint'
        }));
      }
    });

    server.listen(this.port, () => {
      console.log(`Health check server running on http://localhost:${this.port}/health`);
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\nShutting down health check server...');
      server.close(() => {
        process.exit(0);
      });
    });
  }

  // Run once and exit (for CLI usage)
  async runOnce() {
    const status = await this.performHealthCheck();
    console.log(JSON.stringify(status, null, 2));
    return status.status === 'healthy' ? 0 : 1;
  }
}

// CLI interface
if (require.main === module) {
  const service = new HealthCheckService();
  const command = process.argv[2];

  if (command === 'serve' || command === 'server') {
    // Start HTTP server
    service.startServer().catch(error => {
      console.error('Failed to start server:', error);
      process.exit(1);
    });
  } else {
    // Run once and exit
    service.runOnce().then(exitCode => {
      process.exit(exitCode);
    }).catch(error => {
      console.error('Health check failed:', error);
      process.exit(1);
    });
  }
}

module.exports = HealthCheckService;
