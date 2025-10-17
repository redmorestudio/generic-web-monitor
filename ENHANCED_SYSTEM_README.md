# AI Monitor Enhanced System with TheBrain Integration

## 🚀 Overview

This enhanced AI Monitor system now tracks ~45 companies across the AI landscape and uses Claude Opus 4 for sophisticated entity extraction and competitive intelligence analysis.

## 📊 What's New

### Expanded Coverage (45+ Companies)
- **Major LLM Providers**: Anthropic, OpenAI, Google DeepMind, Meta AI, Cohere, AI21 Labs, Mistral AI, etc.
- **AI-Assisted Coding**: GitHub Copilot, Cursor, Codeium, Tabnine, Replit AI, Amazon CodeWhisperer
- **AI Search & Research**: Perplexity AI, You.com, Phind, Neeva
- **AI Voice & Audio**: ElevenLabs, Resemble AI, Descript, Murf AI, WellSaid Labs
- **Video/Media AI**: Synthesia, Pika, RunwayML, HeyGen
- **Image Generation**: Midjourney, Ideogram, Leonardo AI
- **Enterprise AI**: Scale AI, Dataiku, DataRobot
- **AI Infrastructure**: Hugging Face, LangChain, Weights & Biases
- **AI Hardware**: NVIDIA AI, Cerebras, Graphcore

### Advanced Claude Integration
- Uses **Claude Opus 4** (claude-3-opus-20240229) for entity extraction
- Extracts: Products, Technologies, Companies, People, Partnerships, Metrics, Dates
- Provides competitive intelligence insights and strategic recommendations
- Analyzes change significance with 1-10 scoring

### TheBrain Integration
- Automatically creates knowledge graph from discovered entities
- Links companies → products → technologies
- Creates smart groups for cross-cutting themes
- Maintains relationships and competitive dynamics

## 🛠️ Setup Instructions

### 1. Configure Claude API Key
```javascript
// In Google Apps Script:
// 1. Go to Project Settings (gear icon)
// 2. Add Script Property: CLAUDE_API_KEY = your-key-here
```

### 2. Deploy the Enhanced Configuration
```bash
cd /Users/sethredmore/ai-monitor-fresh
./deploy-and-run.sh
```

### 3. Run Monitoring
In Google Apps Script console, run:
- `triggerMonitoring()` - Full monitoring of all 45+ companies
- `quickTest()` - Test with 3 companies
- `getMonitoringDashboard()` - Check system status

## 📁 Key Files

### Configuration
- `ExpandedCompanyConfig.js` - 45+ company definitions with URLs
- `EnhancedClaudeIntegration.js` - Claude Opus 4 integration
- `MasterMonitorRunner.js` - Main orchestration logic
- `TriggerMonitoring.js` - Easy-to-run trigger functions

### Integration
- `TheBrainEnhancedIntegration.js` - TheBrain connector
- `integrate_to_thebrain.py` - Python helper for batch updates

## 🔄 Workflow

1. **Monitor Websites** → Scrape 45+ companies across multiple URLs
2. **Extract Entities** → Claude Opus 4 identifies products, technologies, partnerships
3. **Analyze Changes** → Score significance, extract competitive intelligence
4. **Store Results** → Google Sheets + Script Properties
5. **Update TheBrain** → Create/update knowledge graph with relationships

## 📈 Data Structure

### Entities Extracted
```json
{
  "products": [{
    "name": "Claude Opus 4",
    "company": "Anthropic",
    "type": "LLM",
    "features": ["Advanced reasoning", "Long context"],
    "status": "GA"
  }],
  "technologies": [{
    "name": "Claude Code",
    "category": "Coding Assistant",
    "usedBy": ["Anthropic"]
  }],
  "companies": [{
    "name": "OpenAI",
    "relationship": "competitor",
    "mentionedBy": ["Anthropic", "Google"]
  }],
  "partnerships": [{
    "partners": ["Company A", "Company B"],
    "type": "technology",
    "description": "Integration partnership"
  }]
}
```

### TheBrain Structure
- **Hub**: AI Monitor Entity Graph
  - **Category**: 🤖 Products
    - Individual products linked to companies
  - **Category**: 💻 Technologies  
    - Tech linked to products using them
  - **Category**: 🏢 Companies
    - Companies linked to their products
  - **Smart Groups**: Cross-cutting themes
    - AI Models, Enterprise Features, Safety & Security

## 🎯 Next Steps

1. **Run Full Monitoring**: Execute `triggerMonitoring()` in Apps Script
2. **Review Results**: Check the entity spreadsheet for discovered items
3. **Update TheBrain**: Use the integration to create knowledge graph
4. **Set Schedule**: Configure daily/weekly runs via Apps Script triggers

## 🔧 Troubleshooting

- **Auth Issues**: Re-run `clasp login` if deployment fails
- **API Limits**: Monitor Claude API usage, use batch processing
- **Missing Entities**: Check URL accessibility, may need to adjust selectors
- **TheBrain Sync**: Ensure MCP server is running and connected

## 📊 Monitoring Stats

Current configuration monitors:
- 45+ companies
- ~150+ URLs total
- 9 AI market segments
- Produces ~500+ entities per full run

Processing time: ~15-20 minutes for full scan (with rate limiting)

## 🚨 Important Notes

- Uses Claude Opus 4 for maximum intelligence extraction
- Respects rate limits (2 second delay between companies)
- Stores all data in Google Sheets for persistence
- TheBrain integration creates rich, navigable knowledge graph
