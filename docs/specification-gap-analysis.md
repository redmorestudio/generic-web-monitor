# AI Competitor Monitor - Specification Analysis & Gap Assessment
*Date: June 13, 2025*

## Executive Summary

The AI Competitor Monitor was originally conceived as an intelligent competitive intelligence system that would use AI/LLM to understand and evaluate the importance of website changes. The current implementation has evolved to focus more on keyword-based detection and configuration management, losing some critical intelligent features along the way.

**Key Finding**: The system has lost its core "intelligence" layer - the ability to understand HOW MUCH a page changed and WHETHER that change matters, regardless of keywords.

## Original Vision (What We Set Out to Build)

### Core Concept
"Point the system at a competitor, and either specify pages or have the system pick the pages to watch. Extract data and watch to see if something changes. Keywords are good, but better is if we don't rely on them."

### Intelligent Features Intended

1. **Content-Based Change Detection**
   - Store full page content (not just hashes)
   - Calculate percentage of change (e.g., "30% different from yesterday")
   - Run diffs to show exactly what changed
   - Track evolution over time

2. **AI-Powered Importance Scoring**
   - LLM evaluates every change on a 1-10 scale
   - Considers context, not just keywords
   - Understands semantic meaning (e.g., "launched" vs "will launch")
   - Page type weighting (product pages > blog posts)

3. **Intelligent Filtering**
   - Automatic noise reduction (typos, date changes, minor tweaks)
   - Category detection: product_update, pricing_change, messaging_change
   - Threshold-based alerting (only 6+ relevance scores)
   - Learn what matters over time

4. **Deep Intelligence Extraction**
   ```javascript
   {
     messagingThemes: ["AI-first", "enterprise focus"],
     competitiveIntel: ["positioning against GPT-4"],
     pricingSignals: ["moving to usage-based"],
     strategicInsights: ["expanding to EU market"],
     recommendations: ["monitor their Azure partnership"]
   }
   ```

5. **CSS Selector Intelligence**
   - Smart content extraction using selectors
   - Focus on main content areas
   - Exclude navigation, footers, ads
   - Adapt to site structure changes

## Current Implementation (What We Actually Built)

### What's Working Well ✅

1. **Infrastructure**
   - Closed-loop HTTP API system
   - Google Sheets integration
   - Self-healing with retries
   - Scheduled monitoring
   - 19 companies configured

2. **Basic Monitoring**
   - Hash-based change detection
   - URL and status tracking
   - Manual check capability
   - Web-based management interface

3. **Configuration System** (Recently Added)
   - Editable keywords
   - Customizable CSS selectors
   - Company-specific settings
   - Check frequency control

4. **Data Extraction** (Recently Fixed)
   - Extracts page titles
   - Gets meta descriptions
   - Shows which keywords were found
   - Stores in "Extracted Data" sheet

### Critical Gaps ❌

1. **No Content Storage or Diff Analysis**
   - Only stores titles and descriptions, not full content
   - Can't show what specifically changed
   - No historical content comparison
   - Missing "how much changed" metric

2. **No AI/LLM Intelligence**
   - Relies entirely on keyword matching
   - No semantic understanding
   - No relevance scoring (1-10 scale)
   - Can't detect important changes without keywords

3. **No Change Magnitude Detection**
   - Can't tell if 5% or 50% of page changed
   - All changes treated equally
   - No threshold for "significant" changes
   - Missing the core requirement: "how much did this page change"

4. **Limited Intelligence Extraction**
   - No competitive intelligence analysis
   - No strategic insights
   - No trend detection
   - No natural language summaries

5. **CSS Selectors Not Fully Utilized**
   - Only extracting meta descriptions
   - Not capturing main content areas
   - No intelligent content filtering
   - Not adapting to structural changes

## Technical Architecture Comparison

### Original Architecture
```
Web Scraper → Content Extractor → Full Text Storage
     ↓              ↓                    ↓
Change Detector → Diff Engine → LLM Analyzer
     ↓              ↓              ↓
Relevance Scorer → Intelligence Extractor → Smart Alerts
```

### Current Architecture
```
URL Fetcher → Title/Meta Extractor → Hash Storage
     ↓              ↓                    ↓
Hash Comparison → Keyword Matcher → Binary Alert
```

## Feature Specification Matrix

| Feature | Original Spec | Current State | Gap |
|---------|--------------|---------------|-----|
| Full Content Storage | ✅ Required | ❌ Missing | Store complete page text |
| Diff Analysis | ✅ Required | ❌ Missing | Show what changed |
| Change Magnitude | ✅ Core feature | ❌ Missing | "How much changed" metric |
| AI Relevance Scoring | ✅ 1-10 scale | ❌ Missing | LLM evaluation |
| Keyword Detection | ✅ Secondary | ✅ Primary | Over-reliant on keywords |
| CSS Selectors | ✅ Full content | ⚠️ Partial | Only meta tags |
| Noise Filtering | ✅ AI-based | ❌ Missing | No intelligent filtering |
| Strategic Intelligence | ✅ Required | ❌ Missing | No insights extraction |
| Change Categories | ✅ Required | ❌ Missing | No classification |
| Threshold Alerts | ✅ Score-based | ⚠️ Keyword-based | Missing relevance threshold |

## Recommended Restoration Plan

### Phase 1: Restore Core Intelligence (Priority 1)
1. **Implement Full Content Storage**
   - Add "Content" column to PageContent sheet
   - Store complete extracted text (use Drive if too large)
   - Keep 30-day history

2. **Add Change Magnitude Detection**
   - Calculate percentage difference between versions
   - Track char count, word count, structural changes
   - Flag when change exceeds thresholds (10%, 25%, 50%)

3. **Implement Diff Engine**
   - Show side-by-side comparison
   - Highlight additions/deletions
   - Summarize what changed

### Phase 2: Add LLM Intelligence (Priority 2)
1. **Integrate Claude/GPT API**
   - Already have code from June 6 checkpoint
   - Score every change 1-10
   - Generate change summaries

2. **Implement Smart Thresholds**
   - Alert on 6+ relevance scores
   - OR alert on 25%+ content change
   - Override keywords when AI detects importance

3. **Add Intelligence Categories**
   - product_update, pricing_change, messaging_change
   - Auto-categorize using LLM
   - Track patterns over time

### Phase 3: Enhanced Intelligence (Priority 3)
1. **Competitive Intelligence Extraction**
   - Identify competitor mentions
   - Track positioning changes
   - Detect strategic shifts

2. **Trend Analysis**
   - Monitor change frequency
   - Identify update patterns
   - Predict future changes

3. **Executive Summaries**
   - Daily/weekly intelligence briefs
   - Key insights highlighted
   - Actionable recommendations

## Configuration Recommendations

### Keywords (Current Approach - Keep as Backup)
```
Primary: launch, announce, release, new product
Pricing: price, pricing, cost, fee, subscription
Technical: API, integration, model, performance
Strategic: partnership, acquisition, expansion
```

### CSS Selectors (Expand Usage)
```css
/* Current (Limited) */
meta[property="og:description"]

/* Recommended (Full Content) */
main, article, .content, #main-content
[role="main"], .post-content, .page-content
.product-features, .pricing-table, .announcement
```

### Monitoring Rules
```javascript
// Alert if ANY of these conditions are met:
1. Relevance score >= 6 (AI evaluation)
2. Content change >= 25% (magnitude detection)  
3. High-priority keywords found (current system)
4. Manual override flag set
```

## Success Metrics

### Current System
- Detects changes: ✅ (via hash)
- Shows what changed: ❌ 
- Evaluates importance: ❌ (keywords only)
- Reduces noise: ⚠️ (keyword-dependent)

### Target System
- Detects changes: ✅ (via content comparison)
- Shows what changed: ✅ (via diff)
- Evaluates importance: ✅ (via AI + magnitude)
- Reduces noise: ✅ (via intelligent filtering)

## Conclusion

The AI Competitor Monitor has evolved from an AI-powered intelligence system to a keyword-based change detector. While the current implementation has strong infrastructure and configuration capabilities, it's missing the core "intelligence" that would make it truly valuable:

1. **Understanding HOW MUCH changed** (magnitude detection)
2. **Evaluating WHETHER it matters** (AI relevance scoring)
3. **Working without keywords** (semantic understanding)

The system needs to be enhanced to fulfill its original promise: "Point it at a competitor and it tells you what matters, not just what changed."

## Next Steps

1. Review this specification with stakeholders
2. Prioritize which intelligence features to restore first
3. Implement Phase 1 (Core Intelligence) immediately
4. Test with real competitor changes
5. Iterate based on results

The foundation is solid - we just need to add back the "AI" in "AI Competitor Monitor".