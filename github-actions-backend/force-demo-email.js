#!/usr/bin/env node

// Quick email test script
const fs = require('fs');
const path = require('path');

const testDir = path.join(__dirname, 'test-emails');
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const filename = `${timestamp}-forced-demo-email.html`;
const filepath = path.join(testDir, filename);

const html = `
<!DOCTYPE html>
<html>
<head>
  <title>🚨 AI Monitor Alert - Demo</title>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
    .alert { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 20px 0; border-radius: 5px; }
    .critical { background-color: #f8d7da; border-color: #f5c6cb; }
    .score { font-weight: bold; color: #d9534f; font-size: 1.2em; }
    .metric { background-color: #f0f0f0; padding: 5px 10px; border-radius: 3px; margin: 2px; display: inline-block; }
    .company { font-weight: bold; color: #0056b3; }
    .btn { background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
  </style>
</head>
<body>
  <h1>🚨 High-Priority Competitive Intelligence Alert</h1>
  
  <div class="alert critical">
    <strong>⚡ URGENT:</strong> 3 critical changes detected requiring immediate attention!
  </div>

  <h2>📊 24-Hour Summary</h2>
  <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px;">
    <span class="metric">🏢 52 Companies</span>
    <span class="metric">🔗 156 URLs</span>
    <span class="metric">📸 1,248 Snapshots</span>
    <span class="metric">🔄 12 Changes (24h)</span>
    <span class="metric">🚨 3 Critical</span>
  </div>

  <h2>🔴 Critical Changes (Score 9+)</h2>
  <table>
    <tr>
      <th>Time</th>
      <th>Company</th>
      <th>Score</th>
      <th>Type</th>
      <th>Summary</th>
    </tr>
    <tr>
      <td>2:30 PM</td>
      <td><span class="company">OpenAI</span><br><small>AI/LLM Provider</small></td>
      <td class="score">10/10</td>
      <td>Product Launch</td>
      <td>
        <strong>GPT-5 Announced:</strong> OpenAI unveils GPT-5 with claimed "near-AGI" capabilities, 
        10x performance improvement, and new reasoning architecture. Available via API starting next month.
      </td>
    </tr>
    <tr>
      <td>11:45 AM</td>
      <td><span class="company">Anthropic</span><br><small>AI/LLM Provider</small></td>
      <td class="score">9/10</td>
      <td>Strategic Partnership</td>
      <td>
        <strong>Google Partnership Expansion:</strong> Anthropic announces $10B expanded partnership with Google Cloud, 
        including exclusive compute access and joint enterprise offerings.
      </td>
    </tr>
    <tr>
      <td>9:15 AM</td>
      <td><span class="company">Microsoft</span><br><small>Tech Giant</small></td>
      <td class="score">9/10</td>
      <td>Pricing Change</td>
      <td>
        <strong>Copilot Price Reduction:</strong> Microsoft slashes GitHub Copilot pricing by 50% and announces 
        free tier for students and open source maintainers, aggressive move to capture developer market.
      </td>
    </tr>
  </table>

  <h2>⚠️ High Priority Changes (Score 7-8)</h2>
  <table>
    <tr>
      <th>Company</th>
      <th>Score</th>
      <th>Summary</th>
    </tr>
    <tr>
      <td><span class="company">Perplexity AI</span></td>
      <td class="score">8/10</td>
      <td>Launched enterprise search product with claimed 99.9% accuracy</td>
    </tr>
    <tr>
      <td><span class="company">Cohere</span></td>
      <td class="score">7/10</td>
      <td>Released new embedding model outperforming OpenAI on benchmarks</td>
    </tr>
  </table>

  <h2>💡 Key Insights</h2>
  <ul>
    <li><strong>AI Arms Race Intensifying:</strong> Major players announcing significant capability improvements</li>
    <li><strong>Price Wars Beginning:</strong> Microsoft's aggressive pricing signals market competition heating up</li>
    <li><strong>Partnership Consolidation:</strong> Big Tech securing exclusive relationships with AI labs</li>
    <li><strong>Enterprise Focus:</strong> Multiple companies launching enterprise-specific offerings</li>
  </ul>

  <h2>🎯 Recommended Actions</h2>
  <ol>
    <li>Review competitive positioning against GPT-5 capabilities</li>
    <li>Analyze pricing strategy in light of Microsoft's moves</li>
    <li>Consider partnership opportunities before market consolidates further</li>
    <li>Accelerate enterprise product roadmap to match competition</li>
  </ol>

  <p style="text-align: center; margin-top: 40px;">
    <a href="https://redmorestudio.github.io/ai-competitive-monitor/" class="btn">
      View Full Dashboard →
    </a>
  </p>

  <hr>
  <p style="font-size: 0.9em; color: #666; text-align: center;">
    This is a DEMO email from the AI Competitive Intelligence Monitor<br>
    Generated: ${new Date().toLocaleString()}<br>
    <a href="https://github.com/redmorestudio/ai-competitive-monitor">GitHub Repository</a>
  </p>
</body>
</html>`;

fs.writeFileSync(filepath, html);
console.log(`\n✅ Demo email created successfully!`);
console.log(`📧 View it at: ${filepath}\n`);
console.log(`To open in browser:`);
console.log(`   open "${filepath}"`);
