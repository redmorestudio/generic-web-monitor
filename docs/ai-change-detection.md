# AI-Enhanced Change Detection Documentation

## Overview

The AI Competitive Monitor now includes advanced change detection features that provide both raw content visibility and intelligent business analysis.

## Features

### 1. Content Snippet Display

Shows the actual text that changed between versions:

- **Before Content**: Previous version text (red background)
- **After Content**: New version text (green background)
- **Smart Extraction**: Finds the most relevant changed section
- **Length Limited**: 300 characters for optimal performance

#### How It Works

The `extractContentSnippets()` function:
1. Compares old and new markdown content
2. Finds the first significant difference (>10 characters)
3. Extracts 3 lines of context before and after the change
4. Returns formatted snippets for display

### 2. AI-Powered Change Explanations

Provides business context for changes:

- **Plain English Summary**: What changed in 2-3 sentences
- **Key Changes**: Bullet points of specific changes
- **Business Context**: Why the changes might have been made
- **Interest Level**: Uses existing 0-10 scoring system

#### Example Output

```json
{
  "ai_explanation": "OpenAI announced GPT-5 development with enhanced multimodal capabilities and real-time learning features.",
  "key_changes": [
    "New GPT-5 model announcement detected",
    "10x parameter increase mentioned",
    "Real-time learning capability added",
    "Multimodal by default feature"
  ],
  "ai_business_context": "Updates indicate competitive positioning in the AI market and response to recent advances by competitors.",
  "interest_level": 9
}
```

### 3. Pattern-Based Fallback

When no AI API key is available, the system uses intelligent pattern matching:

- Detects keywords like "launch", "announce", "pricing", "partner"
- Identifies common change patterns
- Provides basic but useful analysis
- Enables testing without API costs

## Implementation Details

### Database Schema

Added to `change_detection` table:
```sql
ALTER TABLE change_detection ADD COLUMN ai_explanation TEXT;
ALTER TABLE change_detection ADD COLUMN ai_key_changes TEXT;
ALTER TABLE change_detection ADD COLUMN ai_business_context TEXT;
```

### Files Modified

1. **ai-change-analyzer.js** (NEW)
   - Processes recent changes
   - Calls AI or uses pattern matching
   - Updates database with analysis

2. **generate-static-data-three-db.js**
   - Added `extractContentSnippets()` function
   - Fetches content using IDs
   - Includes AI fields in JSON output

3. **index.html**
   - Enhanced modal display
   - Shows AI explanation and key changes
   - Displays before/after content snippets

## Usage

### Running AI Analysis

```bash
# Analyze recent changes
cd github-actions-backend
node ai-change-analyzer.js

# Regenerate static data with insights
node generate-static-data-three-db.js
```

### Workflow Integration

For automated analysis:
```bash
# Run after scraper detects changes
./run-ai-change-analysis.sh
```

## Configuration

### Environment Variables

```bash
# Optional - works without it using pattern matching
GROQ_API_KEY=your-api-key-here
```

### Analysis Settings

In `ai-change-analyzer.js`:
```javascript
const contextLength = 300;  // Characters to show
const lookbackDays = 7;     // Days of history to analyze
const rateLimit = 1000;     // MS between API calls
```

## Dashboard Display

The dashboard automatically shows:

1. **AI Analysis Section**
   - Explanation or summary
   - Interest level score
   - Key changes as bullets
   - Business context in italics

2. **Content Changes Section**
   - Before content (red background)
   - After content (green background)
   - Scrollable containers for long content

## Best Practices

1. **Regular Analysis**: Run after each scraping cycle
2. **Review High Scores**: Focus on changes with interest level ≥ 7
3. **Validate AI**: Compare AI explanations with actual content
4. **Monitor Costs**: API calls are rate-limited to control costs

## Troubleshooting

### No AI Explanations Showing
- Check if `ai-change-analyzer.js` has been run
- Verify changes have both old and new content IDs
- Look for errors in console output

### Content Snippets Missing
- Ensure both content versions exist in database
- Check `markdown_content` table has records
- Verify content IDs are correctly linked

### Pattern Matching Only
- This is normal without API key
- Provides basic but useful analysis
- Add API key for enhanced insights

## Future Enhancements

Potential improvements:
- Multi-language change detection
- Visual diff highlighting
- Change trend analysis
- Competitive comparison views
- Custom pattern definitions
