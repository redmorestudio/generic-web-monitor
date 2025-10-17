// scripts/detect-changes.js
const fs = require('fs').promises;
const path = require('path');

async function detectChanges() {
  console.log('🔍 Detecting changes from previous run...');
  
  try {
    // Load current and previous analysis
    const analysisDir = path.join(__dirname, '..', 'data', 'analysis');
    const files = await fs.readdir(analysisDir);
    
    // Sort files to get the two most recent
    const jsonFiles = files
      .filter(f => f.endsWith('.json') && f !== 'latest.json')
      .sort()
      .reverse();
    
    if (jsonFiles.length < 2) {
      console.log('Not enough data for comparison yet');
      await fs.writeFile('.changes', 'false');
      return;
    }
    
    // Load current and previous
    const current = JSON.parse(
      await fs.readFile(path.join(analysisDir, jsonFiles[0]), 'utf8')
    );
    const previous = JSON.parse(
      await fs.readFile(path.join(analysisDir, jsonFiles[1]), 'utf8')
    );
    
    // Create lookup map for previous data
    const previousMap = new Map();
    previous.forEach(item => {
      previousMap.set(item.url, item);
    });
    
    // Detect changes
    const changes = [];
    let hasHighPriorityChanges = false;
    
    current.forEach(item => {
      const prev = previousMap.get(item.url);
      
      if (!prev) {
        // New URL added
        changes.push({
          type: 'new_url',
          company: item.company,
          url: item.url,
          relevance: item.aiAnalysis?.relevanceScore || 0
        });
      } else if (item.contentHash !== prev.contentHash) {
        // Content changed
        const relevanceScore = item.aiAnalysis?.relevanceScore || 0;
        
        changes.push({
          type: 'content_changed',
          company: item.company,
          url: item.url,
          urlType: item.type,
          relevance: relevanceScore,
          previousHash: prev.contentHash,
          currentHash: item.contentHash,
          sizeChange: item.contentLength - prev.contentLength,
          insights: item.aiAnalysis?.keyChanges || 'No AI analysis available'
        });
        
        if (relevanceScore >= 7) {
          hasHighPriorityChanges = true;
        }
      }
    });
    
    // Generate change summary
    console.log(`\n📊 Change Summary:`);
    console.log(`- Total URLs monitored: ${current.length}`);
    console.log(`- Changes detected: ${changes.length}`);
    console.log(`- High priority changes: ${changes.filter(c => c.relevance >= 7).length}`);
    
    // Save change report
    const changeReport = {
      timestamp: new Date().toISOString(),
      totalUrls: current.length,
      changesDetected: changes.length,
      highPriorityCount: changes.filter(c => c.relevance >= 7).length,
      changes: changes.sort((a, b) => b.relevance - a.relevance)
    };
    
    await fs.writeFile(
      path.join(__dirname, '..', 'data', 'changes', 'latest.json'),
      JSON.stringify(changeReport, null, 2)
    );
    
    // Write flag for GitHub Actions
    await fs.writeFile('.changes', hasHighPriorityChanges ? 'true' : 'false');
    
    // If high priority changes, create detailed alert
    if (hasHighPriorityChanges) {
      const alertContent = generateAlert(changes.filter(c => c.relevance >= 7));
      await fs.writeFile(
        path.join(__dirname, '..', 'data', 'alerts', 'latest.md'),
        alertContent
      );
    }
    
  } catch (error) {
    console.error('Error detecting changes:', error);
    await fs.writeFile('.changes', 'false');
  }
}

function generateAlert(highPriorityChanges) {
  let alert = `# 🔴 High Priority Competitive Intelligence Alert

Generated: ${new Date().toISOString()}

## Critical Changes Detected

`;

  highPriorityChanges.forEach(change => {
    alert += `### ${change.company} - ${change.urlType || 'Unknown Page Type'}
- **URL**: ${change.url}
- **Relevance Score**: ${change.relevance}/10
- **Change Type**: ${change.type === 'new_url' ? 'New URL Added' : 'Content Updated'}
`;
    
    if (change.sizeChange) {
      alert += `- **Content Size Change**: ${change.sizeChange > 0 ? '+' : ''}${change.sizeChange} characters\n`;
    }
    
    if (change.insights) {
      alert += `\n**Key Insights**:\n${change.insights}\n`;
    }
    
    alert += '\n---\n\n';
  });
  
  return alert;
}

// Run if called directly
if (require.main === module) {
  detectChanges()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { detectChanges };
