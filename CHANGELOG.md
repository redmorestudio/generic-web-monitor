# Changelog

All notable changes to the Generic Web Monitor project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-01-16

### Major Release - Domain-Agnostic Framework

This release represents a complete transformation from an AI-specific monitoring system to a generic, domain-agnostic framework.

### Added

#### Core Framework
- **Profile-based architecture**: All domain-specific configuration moved to JSON profiles
- **Multi-profile support**: Monitor multiple industries simultaneously with isolated data
- **Universal monitoring engine**: Domain-agnostic `UniversalMonitor` class
- **Universal analyzer**: Profile-driven AI analysis with template system
- **Profile manager**: Complete CRUD operations for profile lifecycle
- **Multi-profile storage**: Per-profile data isolation in Google Sheets

#### AI Discovery System
- **Automatic competitor discovery**: AI finds 10-15+ competitors from 2-3 seeds
- **URL discovery**: Intelligent identification of important monitoring URLs
- **Keyword extraction**: Domain-specific high/medium/low priority keywords
- **Importance band generation**: AI-generated 0-10 scales tailored to domain
- **Page weight suggestions**: Optimized multipliers for different page types
- **Complete profile assembly**: End-to-end AI-powered profile creation in ~2 minutes

#### User Interface
- **Setup wizard**: Step-by-step profile creation with AI assistance
- **Profile manager**: Visual interface for managing multiple profiles
- **Multi-profile dashboard**: Switch between profiles with profile-specific data
- **Importance band editor**: Customize scoring scales visually
- **Profile import/export**: JSON-based profile portability

#### Configuration
- **Profile schema**: JSON schema validation for all profiles
- **Analysis templates**: Domain-specific Claude prompt templates
- **Custom importance bands**: User-defined 0-10 scales with examples
- **Domain keywords**: Categorized keyword lists (high/medium/low)
- **Page weights**: Configurable multipliers per page type
- **Discovery settings**: AI behavior configuration per profile

#### Documentation
- **Architecture guide**: Complete system design documentation
- **Profile guide**: Comprehensive profile creation and customization guide
- **API reference**: Full JavaScript API documentation
- **Deployment guide**: Google Apps Script and alternative deployment options
- **Example profiles**: Energy drinks, AI technology, and more

#### Examples
- **Energy drinks profile**: Complete monitoring setup for beverage industry
- **AI technology profile**: Tech industry monitoring configuration
- **Profile templates**: Generic templates for rapid customization

### Changed

#### Breaking Changes
- **Monitoring engine**: Refactored from `IntelligentMonitor` to `UniversalMonitor`
  - No more hardcoded keywords (lines 13-17 removed)
  - No more hardcoded page weights (lines 19-31 removed)
  - All configuration loaded from profile
- **AI analysis**: Refactored from `ClaudeIntegration` to `UniversalAnalyzer`
  - No more hardcoded prompts (line 148 removed)
  - Template-based prompt system with variable substitution
- **Company config**: Migrated from JavaScript objects to JSON profiles
  - `CompanyConfigComplete.js` → `profiles/examples/ai-competitors.json`
- **Storage structure**: Multi-profile sheet architecture
  - New sheets: `Competitors_{profileId}`, `Changes_{profileId}`, `ImportanceBands_{profileId}`
- **API endpoints**: Added profile routing
  - All endpoints now accept `profileId` parameter
  - Multi-profile dashboard data

#### Migration Path

**From v1.x (AI-specific monitor)**:
1. Export existing configuration using `migration/export-ai-profile.js`
2. Validate exported profile against new schema
3. Import to new system as "AI Competitors" profile
4. Test side-by-side with old system
5. Gradual cutover when confident

### Removed

- **Hardcoded AI keywords**: Moved to profile configuration
- **Hardcoded page weights**: Moved to profile configuration
- **Single-domain limitation**: Now supports unlimited domains
- **Static importance scale**: Now user-customizable per profile
- **Monolithic configuration**: Replaced with modular profiles

### Migration Guide

#### For Existing AI Monitor Users

**Your data is safe**: The old `ai-competitive-monitor-correct` repository remains untouched as a rollback option.

**Migration steps**:

```bash
# 1. Export current AI monitoring configuration
cd ai-competitive-monitor-correct
node export-as-profile.js > ai-profile.json

# 2. Move to new system
cd ../generic-web-monitor

# 3. Import profile
node migration/import-profile.js ai-profile.json

# 4. Validate
node scripts/validate-profile.js ai-competitors

# 5. Test monitoring
node scripts/test-monitor.js ai-competitors

# 6. Compare results
node scripts/compare-with-old.js
```

**What changes**:
- Keywords are now in profile config (not hardcoded)
- Importance bands are customizable (not fixed)
- Monitoring works identically, but reads config from profile
- Dashboard has profile selector

**What stays the same**:
- Same Google Sheets backend
- Same Claude AI analysis
- Same monitoring logic
- Same scoring algorithm (now configurable)

#### For New Users

Start fresh with the new system:

1. **Quick Start (AI-Assisted)**:
   ```bash
   # Open setup wizard
   open dashboard/setup-wizard.html

   # Or use CLI
   node src/discovery.js --domain "your industry" --seeds "Company A,Company B"
   ```

2. **Manual Setup**:
   ```bash
   # Copy example
   cp profiles/examples/energy-drinks.json profiles/my-domain.json

   # Edit in your editor
   # Validate
   node scripts/validate-profile.js my-domain
   ```

### Technical Details

#### Architecture Changes

**Before (v1.x)**:
```
IntelligentMonitor (hardcoded AI keywords)
  → CompanyConfigComplete.js (16 AI companies)
    → ClaudeIntegration (AI-specific prompt)
      → Google Sheets (single monitor data)
```

**After (v2.0)**:
```
ProfileManager (loads any profile)
  → UniversalMonitor (profile-driven keywords)
    → UniversalAnalyzer (template-based prompts)
      → MultiProfileStorage (per-profile isolation)
```

#### Performance

- **Monitoring speed**: Identical to v1.x
- **Discovery speed**: ~30 seconds for 12 competitors
- **Profile creation**: 2 minutes (AI) or 15 minutes (manual)
- **Storage overhead**: ~5 additional sheets per profile

#### Compatibility

- **Node.js**: 14+ (ES6 features)
- **Google Apps Script**: V8 runtime required
- **Browsers**: Modern browsers (ES6 support)
- **Claude API**: Compatible with Sonnet 3.5 and newer

### Security

- **API keys**: Now stored in Script Properties (more secure)
- **Profile isolation**: Complete data separation between profiles
- **Access control**: Per-profile permissions (future)
- **Content hashing**: Baseline storage uses SHA-256

### Known Issues

- [ ] Very large profiles (50+ competitors) may hit execution time limits
- [ ] AI discovery occasionally suggests irrelevant competitors
- [ ] Profile export doesn't include historical change data
- [ ] Dashboard profile switcher requires page reload

### Future Roadmap

#### v2.1 (Q2 2025)
- [ ] Profile templates library
- [ ] Scheduled profile backups
- [ ] Advanced filtering in dashboard
- [ ] Slack/Discord notifications

#### v2.2 (Q3 2025)
- [ ] Multi-user access control
- [ ] Profile sharing and collaboration
- [ ] Change trend analysis
- [ ] Custom webhook integrations

#### v2.3 (Q4 2025)
- [ ] Machine learning scoring refinement
- [ ] Automated competitor discovery expansion
- [ ] Natural language profile queries
- [ ] Mobile dashboard app

### Deprecations

The following are deprecated but still supported with warnings:

- **Single-profile mode**: Use profile-based architecture instead
- **Hardcoded configurations**: Migrate to JSON profiles
- **Global importance scale**: Define per-profile scales

### Contributors

- Architecture design and implementation
- AI discovery system development
- Documentation and examples
- Testing and validation

### Acknowledgments

- Anthropic Claude API for AI-powered discovery
- Google Apps Script platform
- Open source community feedback

---

## [1.0.0] - 2025-01-10

### Initial Release - AI Competitor Monitor

- Basic web monitoring for AI companies
- Claude AI integration for analysis
- Google Sheets storage
- Email notifications
- GitHub Actions dashboard
- 16 hardcoded AI competitors
- Fixed importance scale
- Single-domain monitoring

---

## Version Comparison

| Feature | v1.0 | v2.0 |
|---------|------|------|
| Domains | AI only | Any industry |
| Competitors | 16 hardcoded | Unlimited, configurable |
| Profiles | Single | Multiple concurrent |
| Keywords | Hardcoded | Per-profile, customizable |
| Importance Scale | Fixed | User-defined per profile |
| Setup Time | N/A (pre-configured) | 2 min (AI) or 15 min (manual) |
| Discovery | Manual | AI-powered |
| Templates | Single AI prompt | Domain-specific templates |
| Storage | Single sheet set | Per-profile isolation |

---

**For detailed upgrade instructions**, see `/Users/sethredmore/generic-web-monitor/docs/MIGRATION.md` (coming soon)

**For breaking changes**, see [Breaking Changes](#breaking-changes) section above

**For API changes**, see `/Users/sethredmore/generic-web-monitor/docs/API.md`

---

*Changelog maintained by: Generic Web Monitor Team*
*Last Updated: 2025-01-16*
