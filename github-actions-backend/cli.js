#!/usr/bin/env node

const axios = require('axios');
const { program } = require('commander');
const Table = require('cli-table3');
const chalk = require('chalk');

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:3000/api';

// Helper function to handle API errors
async function handleApiCall(promise) {
  try {
    const response = await promise;
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error(chalk.red(`❌ Error: ${error.response.data.error || error.response.statusText}`));
    } else if (error.request) {
      console.error(chalk.red('❌ Error: Cannot connect to API server. Is it running?'));
    } else {
      console.error(chalk.red(`❌ Error: ${error.message}`));
    }
    process.exit(1);
  }
}

// Company commands
program
  .command('company:list')
  .description('List all companies')
  .action(async () => {
    const companies = await handleApiCall(axios.get(`${API_URL}/companies`));
    
    const table = new Table({
      head: ['ID', 'Name', 'Type', 'URLs', 'Enabled'],
      colWidths: [5, 30, 15, 10, 10]
    });
    
    companies.forEach(company => {
      table.push([
        company.id,
        company.name,
        company.type,
        company.url_count,
        company.enabled ? chalk.green('✓') : chalk.red('✗')
      ]);
    });
    
    console.log(table.toString());
    console.log(chalk.gray(`Total: ${companies.length} companies`));
  });

program
  .command('company:add <name>')
  .description('Add a new company')
  .option('-t, --type <type>', 'Company type', 'competitor')
  .option('-u, --urls <urls...>', 'URLs to monitor')
  .action(async (name, options) => {
    const urls = options.urls ? options.urls.map(url => ({ url, type: 'general' })) : [];
    
    const company = await handleApiCall(
      axios.post(`${API_URL}/companies`, {
        name,
        type: options.type,
        urls
      })
    );
    
    console.log(chalk.green(`✅ Company "${company.name}" added successfully!`));
    console.log(chalk.gray(`ID: ${company.id}`));
    if (company.urls.length > 0) {
      console.log(chalk.gray(`URLs: ${company.urls.length} added`));
    }
  });

program
  .command('company:delete <id>')
  .description('Delete a company')
  .option('-f, --force', 'Skip confirmation')
  .action(async (id, options) => {
    if (!options.force) {
      console.log(chalk.yellow('⚠️  This will delete the company and all associated data.'));
      console.log(chalk.yellow('Use --force to confirm.'));
      process.exit(1);
    }
    
    await handleApiCall(axios.delete(`${API_URL}/companies/${id}`));
    console.log(chalk.green('✅ Company deleted successfully!'));
  });

program
  .command('company:toggle <id>')
  .description('Enable/disable a company')
  .action(async (id) => {
    const company = await handleApiCall(axios.get(`${API_URL}/companies/${id}`));
    const newState = !company.enabled;
    
    await handleApiCall(
      axios.put(`${API_URL}/companies/${id}`, { enabled: newState })
    );
    
    console.log(chalk.green(`✅ Company "${company.name}" ${newState ? 'enabled' : 'disabled'}!`));
  });

// URL commands
program
  .command('url:add <companyId> <url>')
  .description('Add a URL to a company')
  .option('-t, --type <type>', 'URL type', 'general')
  .option('-k, --keywords <keywords>', 'Comma-separated keywords')
  .action(async (companyId, url, options) => {
    const keywords = options.keywords ? options.keywords.split(',').map(k => k.trim()) : [];
    
    const newUrl = await handleApiCall(
      axios.post(`${API_URL}/companies/${companyId}/urls`, {
        url,
        type: options.type,
        keywords
      })
    );
    
    console.log(chalk.green('✅ URL added successfully!'));
    console.log(chalk.gray(`ID: ${newUrl.id}`));
  });

program
  .command('url:list <companyId>')
  .description('List URLs for a company')
  .action(async (companyId) => {
    const company = await handleApiCall(axios.get(`${API_URL}/companies/${companyId}`));
    
    console.log(chalk.bold(`\n${company.name} - URLs:\n`));
    
    const table = new Table({
      head: ['ID', 'URL', 'Type', 'Keywords', 'Enabled'],
      colWidths: [5, 50, 15, 30, 10]
    });
    
    company.urls.forEach(url => {
      const keywords = JSON.parse(url.keywords || '[]');
      table.push([
        url.id,
        url.url.substring(0, 48),
        url.type,
        keywords.slice(0, 3).join(', ') + (keywords.length > 3 ? '...' : ''),
        url.enabled ? chalk.green('✓') : chalk.red('✗')
      ]);
    });
    
    console.log(table.toString());
  });

// Monitoring commands
program
  .command('monitor:status')
  .description('Show monitoring status')
  .action(async () => {
    const dashboard = await handleApiCall(axios.get(`${API_URL}/dashboard`));
    
    console.log(chalk.bold('\n📊 Monitoring Status\n'));
    
    console.log(`Companies: ${chalk.cyan(dashboard.stats.companies)} active`);
    console.log(`URLs: ${chalk.cyan(dashboard.stats.urls)} monitored`);
    console.log(`Total Snapshots: ${chalk.cyan(dashboard.stats.total_snapshots)}`);
    console.log(`Recent Changes (24h): ${chalk.cyan(dashboard.stats.recent_changes)}`);
    console.log(`High Priority Alerts: ${chalk.red(dashboard.stats.high_priority_alerts)}`);
    
    if (dashboard.recent_alerts.length > 0) {
      console.log(chalk.bold('\n🚨 Recent High Priority Alerts:\n'));
      
      dashboard.recent_alerts.slice(0, 5).forEach(alert => {
        console.log(`${chalk.red(`[${alert.relevance_score}/10]`)} ${chalk.bold(alert.company_name)}`);
        console.log(`  ${alert.summary}`);
        console.log(chalk.gray(`  ${alert.url}`));
        console.log('');
      });
    }
  });

program
  .command('monitor:changes')
  .description('Show recent changes')
  .option('-l, --limit <limit>', 'Number of changes to show', '20')
  .option('-m, --min-relevance <score>', 'Minimum relevance score', '0')
  .option('-c, --company <id>', 'Filter by company ID')
  .action(async (options) => {
    const params = new URLSearchParams({
      limit: options.limit,
      min_relevance: options.minRelevance
    });
    
    if (options.company) {
      params.append('company_id', options.company);
    }
    
    const changes = await handleApiCall(
      axios.get(`${API_URL}/changes/recent?${params}`)
    );
    
    if (changes.length === 0) {
      console.log(chalk.gray('No changes found matching criteria'));
      return;
    }
    
    console.log(chalk.bold(`\n📝 Recent Changes (${changes.length}):\n`));
    
    changes.forEach(change => {
      const score = change.relevance_score || 0;
      const scoreColor = score >= 7 ? 'red' : score >= 5 ? 'yellow' : 'gray';
      
      console.log(`${chalk[scoreColor](`[${score}/10]`)} ${chalk.bold(change.company_name)} - ${change.url_type}`);
      console.log(`  ${change.summary || 'No AI analysis yet'}`);
      console.log(chalk.gray(`  ${change.url}`));
      console.log(chalk.gray(`  Changed: ${new Date(change.created_at).toLocaleString()}`));
      console.log('');
    });
  });

program
  .command('monitor:brief')
  .description('Generate enhanced intelligence brief')
  .option('-e, --enhanced', 'Use enhanced AI analyzer (recommended)', true)
  .action(async (options) => {
    const analyzer = options.enhanced ? 'ai-analyzer-enhanced.js' : 'ai-analyzer.js';
    const analyzerName = options.enhanced ? 'Enhanced AI' : 'Basic AI';
    
    console.log(chalk.yellow(`📋 Generating ${analyzerName} intelligence brief...`));
    console.log(chalk.gray('This will create an executive intelligence brief.'));
    
    const { spawn } = require('child_process');
    
    const analyzerProcess = spawn('node', [analyzer, 'brief'], {
      cwd: __dirname,
      stdio: 'inherit',
      env: { ...process.env }
    });
    
    analyzerProcess.on('close', (code) => {
      if (code === 0) {
        console.log(chalk.green(`✅ ${analyzerName} brief generated!`));
      } else {
        console.log(chalk.red(`❌ ${analyzerName} brief generation failed with code ${code}`));
      }
    });
  });

program
  .command('monitor:scrape [urlId]')
  .description('Run scraper (for all URLs or specific URL)')
  .action(async (urlId) => {
    console.log(chalk.yellow('🔄 Starting scraper...'));
    console.log(chalk.gray('This will run the scraper locally. For production, use GitHub Actions.'));
    
    const { spawn } = require('child_process');
    const args = ['scraper.js'];
    if (urlId) args.push(urlId);
    
    const scraper = spawn('node', args, {
      cwd: __dirname,
      stdio: 'inherit'
    });
    
    scraper.on('close', (code) => {
      if (code === 0) {
        console.log(chalk.green('✅ Scraping completed!'));
      } else {
        console.log(chalk.red(`❌ Scraper exited with code ${code}`));
      }
    });
  });

program
  .command('monitor:analyze')
  .description('Run AI analysis on recent changes')
  .option('-e, --enhanced', 'Use enhanced AI analyzer (recommended)', true)
  .action(async (options) => {
    const analyzer = options.enhanced ? 'ai-analyzer-enhanced.js' : 'ai-analyzer.js';
    const analyzerName = options.enhanced ? 'Enhanced AI' : 'Basic AI';
    
    console.log(chalk.yellow(`🤖 Starting ${analyzerName} analysis...`));
    console.log(chalk.gray('This will run the analyzer locally. For production, use GitHub Actions.'));
    
    const { spawn } = require('child_process');
    
    const analyzerProcess = spawn('node', [analyzer, 'analyze'], {
      cwd: __dirname,
      stdio: 'inherit',
      env: { ...process.env }
    });
    
    analyzerProcess.on('close', (code) => {
      if (code === 0) {
        console.log(chalk.green(`✅ ${analyzerName} analysis completed!`));
      } else {
        console.log(chalk.red(`❌ ${analyzerName} analyzer exited with code ${code}`));
      }
    });
  });

// LLM commands
program
  .command('llm:insights')
  .description('Get insights in LLM-friendly format')
  .option('-c, --company <name>', 'Filter by company name')
  .option('-d, --days <days>', 'Number of days to include', '7')
  .action(async (options) => {
    const params = new URLSearchParams({ days: options.days });
    if (options.company) {
      params.append('company', options.company);
    }
    
    const insights = await handleApiCall(
      axios.get(`${API_URL}/llm/insights?${params}`)
    );
    
    console.log(JSON.stringify(insights, null, 2));
  });

program
  .command('llm:manage')
  .description('Manage companies using natural language')
  .argument('<action>', 'Action to perform (add/remove)')
  .argument('<company>', 'Company name')
  .option('-u, --urls <urls...>', 'URLs to monitor')
  .option('-k, --keywords <keywords>', 'Comma-separated keywords')
  .action(async (action, company, options) => {
    const urls = options.urls ? 
      options.urls.map(url => ({ url, type: 'general' })) : [];
    
    const keywords = options.keywords ? 
      options.keywords.split(',').map(k => k.trim()) : [];
    
    const result = await handleApiCall(
      axios.post(`${API_URL}/llm/manage-company`, {
        action,
        company_name: company,
        urls,
        keywords
      })
    );
    
    console.log(chalk.green(`✅ ${result.message}`));
  });

// Configuration commands
program
  .command('config:get')
  .description('Show current configuration')
  .action(async () => {
    const config = await handleApiCall(axios.get(`${API_URL}/config`));
    
    console.log(chalk.bold('\n⚙️  Configuration:\n'));
    
    const table = new Table({
      head: ['Key', 'Value'],
      colWidths: [30, 50]
    });
    
    Object.entries(config).forEach(([key, value]) => {
      table.push([key, value]);
    });
    
    console.log(table.toString());
  });

program
  .command('config:set <key> <value>')
  .description('Set configuration value')
  .action(async (key, value) => {
    await handleApiCall(
      axios.put(`${API_URL}/config`, { [key]: value })
    );
    
    console.log(chalk.green(`✅ Configuration updated: ${key} = ${value}`));
  });

// Database commands
program
  .command('db:stats')
  .description('Show database statistics')
  .action(async () => {
    const dashboard = await handleApiCall(axios.get(`${API_URL}/dashboard`));
    
    console.log(chalk.bold('\n📊 Database Statistics:\n'));
    
    const stats = dashboard.stats;
    console.log(`Active Companies: ${chalk.cyan(stats.companies)}`);
    console.log(`Active URLs: ${chalk.cyan(stats.urls)}`);
    console.log(`Total Snapshots: ${chalk.cyan(stats.total_snapshots)}`);
    console.log(`Changes (24h): ${chalk.cyan(stats.recent_changes)}`);
    console.log(`High Priority (24h): ${chalk.red(stats.high_priority_alerts)}`);
    
    // TODO: Add more detailed stats from dedicated endpoint
  });

// Version and help
program
  .name('ai-monitor')
  .description('CLI for AI Competitive Intelligence Monitor')
  .version('2.0.0');

// Parse command line arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
