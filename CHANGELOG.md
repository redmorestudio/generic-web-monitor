# Changelog

All notable changes to the AI Competitive Monitor project will be documented in this file.

## [2.1.0] - 2025-01-07

### Added
- **Content Snippet Display**: Shows before/after content for changes
  - Smart extraction algorithm finds relevant changed sections
  - Limited to 300 characters for performance
  - Color-coded display (red for old, green for new)

- **AI-Powered Change Explanations**: 
  - Plain English summaries of what changed
  - Key changes listed as bullet points
  - Business context explaining why changes were made
  - Uses existing interest scoring (0-10)

- **Pattern-Based Fallback**:
  - Works without API keys
  - Detects common patterns (launches, pricing, partnerships)
  - Provides basic but useful analysis

### Enhanced
- Dashboard now displays both raw content changes and AI insights
- Change detection provides complete transparency
- Database schema extended with AI explanation fields

### Technical
- Added `ai-change-analyzer.js` for intelligent analysis
- Added `extractContentSnippets()` function in generate-static-data
- Updated dashboard modal to show enhanced information
- Created comprehensive documentation in `docs/ai-change-detection.md`

## [2.0.0] - 2025-01-04

### Changed
- Complete rewrite with three-database architecture
- Moved from Google Apps Script to GitHub Actions
- Added full backend API with Express
- Implemented proper content storage (not just hashes)

### Added
- SQLite database for reliable data storage
- Change magnitude calculation
- AI relevance scoring (1-10)
- Full CRUD operations via API
- CLI tool for management
- LLM-friendly endpoints

## [1.0.0] - 2024-12-15

### Initial Release
- Basic monitoring with Google Apps Script
- Simple hash-based change detection
- Email notifications
- Static dashboard with GitHub Pages
