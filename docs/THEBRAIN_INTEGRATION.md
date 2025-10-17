# TheBrain Integration for AI Competitive Monitor

## 🎯 Overview

This document describes the TheBrain integration for the AI Competitive Monitor system, which now uses a three-database architecture for better separation of concerns.

## 🏗️ Architecture Visualization

The TheBrain integration creates a visual knowledge graph of your competitive intelligence system:

```
AI Competitive Monitor (Root Node)
│
├── 🏢 Monitored Companies (52 total)
│   ├── ⚔️ Competitors (18)
│   │   ├── OpenAI
│   │   ├── Anthropic
│   │   ├── Google AI
│   │   └── ... more
│   │
│   ├── 🤝 Partners (12)
│   │   ├── Hugging Face
│   │   ├── Weights & Biases
│   │   └── ... more
│   │
│   ├── 🛠️ AI Tools (15)
│   │   ├── LangChain
│   │   ├── Pinecone
│   │   └── ... more
│   │
│   └── 🏭 Industry Players (7)
│       ├── NVIDIA
│       ├── Microsoft
│       └── ... more
│
├── 🔄 Recent Changes
│   ├── 🔴 High Priority (Score 8-10)
│   ├── 🟡 Medium Priority (Score 6-7)
│   ├── 🔵 Low Priority (Score 4-5)
│   └── ⏳ Unanalyzed
│
├── 🏗️ System Architecture
│   ├── 💾 Raw Content Database
│   │   ├── content_snapshots table
│   │   └── changes table
│   │
│   ├── 📄 Processed Content Database
│   │   ├── processed_content table
│   │   └── markdown_content table
│   │
│   ├── 🧩 Intelligence Database
│   │   ├── companies table
│   │   ├── urls table
│   │   ├── baseline_analysis table
│   │   └── ai_analysis table
│   │
│   └── ⚙️ GitHub Workflows
│       ├── Scrape Workflow (every 6 hours)
│       ├── Process Workflow
│       ├── Analyze Workflow
│       └── Sync Workflow
│
├── 🧠 AI Insights
│   ├── ⚠️ Top Competitive Threats
│   ├── 📈 Technology Trends
│   └── 💡 Strategic Opportunities
│
└── ⚠️ Threat Analysis
    └── Real-time competitive intelligence
```

## 🚀 How to Use

### 1. Automatic Integration (Recommended)

The TheBrain sync is automatically triggered as part of the sync workflow:

```bash
# This happens automatically when the sync workflow runs
# You can also trigger it manually in GitHub Actions
```

### 2. Manual Sync

To manually sync your data to TheBrain:

```bash
cd github-actions-backend

# Full sync - creates complete visualization
node thebrain-sync-wrapper.js sync

# Export only - creates JSON file for manual import
node thebrain-sync-wrapper.js export
```

### 3. Visualization Demo

To see a demo of what will be created:

```bash
cd github-actions-backend
node thebrain-visualization-demo.js
```

## 📊 What Gets Visualized

### Companies
- Each company becomes a thought
- Grouped by type (competitor, partner, tool, industry)
- Shows number of monitored URLs
- Links to recent changes and analyses

### Changes
- Recent changes grouped by priority
- Color-coded by relevance score
- Linked to parent company
- Shows AI analysis summary

### Architecture
- Visual representation of three-database design
- Workflow dependencies
- Data flow visualization

### Insights
- Top competitive threats
- Emerging technology trends
- Strategic opportunities
- Pattern recognition across companies

## 🎨 Visual Indicators

### Colors
- **Red**: High priority/threat (competitors, score 8-10)
- **Amber**: Medium priority (score 6-7)
- **Blue**: Low priority (score 4-5)
- **Green**: Partners/opportunities
- **Purple**: System/architecture
- **Gray**: Unanalyzed/inactive

### Icons
- 🏢 Companies
- 🔄 Changes/Updates
- 🏗️ Architecture
- 🧠 AI Insights
- ⚠️ Threats
- 💡 Opportunities
- 📈 Trends

## 🔧 Configuration

The integration uses these environment variables (already set in GitHub Secrets):

```bash
THEBRAIN_API_KEY=<your-api-key>
THEBRAIN_BRAIN_ID=<your-brain-id>
```

## 📁 Files Created

1. **thebrain-sync-three-db.js** - Main integration for three-database architecture
2. **thebrain-sync-wrapper.js** - Updated to detect and use correct integration
3. **thebrain-visualization-demo.js** - Demo script showing structure
4. **thebrain-export-3db.json** - Export file (created after sync)
5. **thebrain-visualization-summary.json** - Statistics and summary

## 🎯 Benefits

1. **Visual Intelligence**: See relationships between companies, changes, and threats at a glance
2. **Pattern Recognition**: Identify trends across the competitive landscape
3. **Strategic Planning**: Use visual insights for better decision-making
4. **Knowledge Management**: All competitive intelligence in one interconnected brain
5. **Real-time Updates**: Automatic sync keeps visualization current

## 📈 Next Steps

1. Run the sync to populate your TheBrain
2. Open TheBrain to explore the visualization
3. Use the visual insights for strategic planning
4. Monitor automated updates in GitHub Actions

## 🔗 Integration Status

✅ **Complete and Ready to Use!**

The TheBrain integration is now fully operational with your three-database architecture. Every time your workflows run, the visualization will be updated with the latest competitive intelligence.
