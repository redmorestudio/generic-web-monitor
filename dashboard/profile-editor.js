/**
 * Profile Editor Module
 *
 * Comprehensive profile management system for Generic Web Monitor
 * Handles CRUD operations, validation, state management, and UI interactions
 *
 * @module ProfileEditor
 * @version 1.0.0
 */

class ProfileEditor {
    constructor(profileId = null) {
        this.profileId = profileId;
        this.originalProfile = null;
        this.currentProfile = null;
        this.isDirtyFlag = false;
        this.changeHistory = [];
        this.currentHistoryIndex = -1;
        this.maxHistorySize = 50;
        this.autoSaveInterval = null;
        this.validationErrors = [];

        // Schema reference for validation
        this.schema = null;
        this.pageTypes = [
            'homepage', 'products', 'product', 'pricing', 'blog',
            'news', 'docs', 'api', 'features', 'technology',
            'about', 'platform', 'solutions', 'resources', 'other'
        ];

        this.init();
    }

    /**
     * Initialize the editor
     */
    async init() {
        try {
            // Load schema for validation
            await this.loadSchema();

            if (this.profileId) {
                await this.loadProfile(this.profileId);
            } else {
                // Create new profile template
                this.createNewProfile();
            }

            // Set up event listeners
            this.setupEventListeners();

            // Initialize first history state
            this.saveToHistory();

        } catch (error) {
            console.error('Failed to initialize profile editor:', error);
            this.showError('Failed to initialize editor: ' + error.message);
        }
    }

    /**
     * Load profile schema from server
     */
    async loadSchema() {
        try {
            const response = await fetch('/profiles/schemas/profile-schema.json');
            if (!response.ok) throw new Error('Failed to load schema');
            this.schema = await response.json();
        } catch (error) {
            console.warn('Schema not available, validation will be limited:', error);
        }
    }

    // =========================================================================
    // PROFILE LOADING & CREATION
    // =========================================================================

    /**
     * Load profile from server
     * @param {string} profileId - UUID of profile to load
     */
    async loadProfile(profileId) {
        try {
            const response = await fetch(`/api/profiles/${profileId}`);
            if (!response.ok) {
                throw new Error(`Failed to load profile: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            this.originalProfile = JSON.parse(JSON.stringify(data.profile));
            this.currentProfile = JSON.parse(JSON.stringify(data.profile));
            this.profileId = profileId;

            // Populate UI sections
            this.populateBasicInfo();
            this.populateCompetitors();
            this.populateImportanceBands();
            this.populateKeywords();
            this.populatePageWeights();
            this.populateAdvancedSettings();

            this.markClean();

            return this.currentProfile;

        } catch (error) {
            console.error('Error loading profile:', error);
            throw error;
        }
    }

    /**
     * Create new profile template
     */
    createNewProfile() {
        this.currentProfile = {
            id: this.generateUUID(),
            name: '',
            domain: '',
            description: '',
            competitors: [],
            importanceBands: this.getDefaultImportanceBands(),
            contentTypes: [],
            pageWeights: this.getDefaultPageWeights(),
            domainKeywords: {
                high: [],
                medium: [],
                low: []
            },
            analysisPromptTemplate: '',
            discovery: {
                enabled: false,
                autoExpand: false,
                seedCompetitors: [],
                maxCompetitors: 15
            },
            created: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            status: 'active'
        };

        this.originalProfile = JSON.parse(JSON.stringify(this.currentProfile));
        this.populateAllSections();
    }

    /**
     * Get default importance bands for new profiles
     */
    getDefaultImportanceBands() {
        return [
            {
                min: 9, max: 10,
                label: 'Critical',
                description: 'Major strategic changes, product launches, market entry/exit',
                examples: [
                    'Launching new product line',
                    'Major acquisition or merger',
                    'Entering new market'
                ]
            },
            {
                min: 7, max: 8,
                label: 'Important',
                description: 'Significant updates, pricing changes, new features',
                examples: [
                    'Major feature release',
                    'Pricing model change',
                    'Strategic partnership'
                ]
            },
            {
                min: 5, max: 6,
                label: 'Moderate',
                description: 'Notable updates, minor features, content changes',
                examples: [
                    'New blog post series',
                    'Minor feature update',
                    'Website redesign'
                ]
            },
            {
                min: 3, max: 4,
                label: 'Low',
                description: 'Routine updates, promotional content',
                examples: [
                    'Social media campaign',
                    'Minor promotional event',
                    'Content refresh'
                ]
            },
            {
                min: 1, max: 2,
                label: 'Minimal',
                description: 'Minor content updates, formatting changes',
                examples: [
                    'Text corrections',
                    'Minor copy updates',
                    'FAQ additions'
                ]
            },
            {
                min: 0, max: 0,
                label: 'Trivial',
                description: 'Typos, insignificant changes',
                examples: [
                    'Spelling corrections',
                    'Copyright year update',
                    'Minor formatting'
                ]
            }
        ];
    }

    /**
     * Get default page weights
     */
    getDefaultPageWeights() {
        return {
            'products': 2.0,
            'pricing': 2.0,
            'features': 1.5,
            'news': 1.2,
            'blog': 1.0,
            'homepage': 0.8
        };
    }

    // =========================================================================
    // COMPETITORS MANAGEMENT
    // =========================================================================

    /**
     * Add new competitor
     * @param {string} name - Competitor name
     * @param {string} domain - Competitor domain (optional)
     */
    addCompetitor(name, domain = '') {
        if (!name || name.trim() === '') {
            throw new Error('Competitor name is required');
        }

        const competitor = {
            name: name.trim(),
            urls: [],
            keywords: []
        };

        this.currentProfile.competitors.push(competitor);
        this.markDirty();
        this.saveToHistory();

        return this.currentProfile.competitors.length - 1;
    }

    /**
     * Remove competitor by index
     * @param {number} index - Competitor index
     */
    removeCompetitor(index) {
        if (index < 0 || index >= this.currentProfile.competitors.length) {
            throw new Error('Invalid competitor index');
        }

        const competitor = this.currentProfile.competitors[index];
        if (!confirm(`Remove competitor "${competitor.name}"?`)) {
            return false;
        }

        this.currentProfile.competitors.splice(index, 1);
        this.markDirty();
        this.saveToHistory();

        return true;
    }

    /**
     * Update competitor details
     * @param {number} index - Competitor index
     * @param {object} updates - Fields to update
     */
    updateCompetitor(index, updates) {
        if (index < 0 || index >= this.currentProfile.competitors.length) {
            throw new Error('Invalid competitor index');
        }

        const competitor = this.currentProfile.competitors[index];
        Object.assign(competitor, updates);

        this.markDirty();
        this.saveToHistory();
    }

    /**
     * Add URL to competitor
     * @param {number} competitorIndex - Competitor index
     * @param {string} url - URL to add
     * @param {string} type - Page type
     */
    addURL(competitorIndex, url, type = 'other') {
        if (competitorIndex < 0 || competitorIndex >= this.currentProfile.competitors.length) {
            throw new Error('Invalid competitor index');
        }

        if (!this.isValidURL(url)) {
            throw new Error('Invalid URL format');
        }

        if (!this.pageTypes.includes(type)) {
            throw new Error('Invalid page type');
        }

        const competitor = this.currentProfile.competitors[competitorIndex];

        // Check for duplicates
        if (competitor.urls.some(u => u.url === url)) {
            throw new Error('URL already exists for this competitor');
        }

        competitor.urls.push({ url, type });
        this.markDirty();
        this.saveToHistory();

        return competitor.urls.length - 1;
    }

    /**
     * Remove URL from competitor
     * @param {number} competitorIndex - Competitor index
     * @param {number} urlIndex - URL index
     */
    removeURL(competitorIndex, urlIndex) {
        if (competitorIndex < 0 || competitorIndex >= this.currentProfile.competitors.length) {
            throw new Error('Invalid competitor index');
        }

        const competitor = this.currentProfile.competitors[competitorIndex];

        if (urlIndex < 0 || urlIndex >= competitor.urls.length) {
            throw new Error('Invalid URL index');
        }

        competitor.urls.splice(urlIndex, 1);
        this.markDirty();
        this.saveToHistory();
    }

    /**
     * Update URL
     * @param {number} competitorIndex - Competitor index
     * @param {number} urlIndex - URL index
     * @param {string} newUrl - New URL
     * @param {string} newType - New page type
     */
    updateURL(competitorIndex, urlIndex, newUrl, newType) {
        if (competitorIndex < 0 || competitorIndex >= this.currentProfile.competitors.length) {
            throw new Error('Invalid competitor index');
        }

        const competitor = this.currentProfile.competitors[competitorIndex];

        if (urlIndex < 0 || urlIndex >= competitor.urls.length) {
            throw new Error('Invalid URL index');
        }

        if (!this.isValidURL(newUrl)) {
            throw new Error('Invalid URL format');
        }

        if (!this.pageTypes.includes(newType)) {
            throw new Error('Invalid page type');
        }

        competitor.urls[urlIndex] = { url: newUrl, type: newType };
        this.markDirty();
        this.saveToHistory();
    }

    /**
     * Reorder competitors (for drag-drop)
     * @param {number} fromIndex - Source index
     * @param {number} toIndex - Destination index
     */
    reorderCompetitors(fromIndex, toIndex) {
        if (fromIndex < 0 || fromIndex >= this.currentProfile.competitors.length) {
            throw new Error('Invalid source index');
        }
        if (toIndex < 0 || toIndex >= this.currentProfile.competitors.length) {
            throw new Error('Invalid destination index');
        }

        const [removed] = this.currentProfile.competitors.splice(fromIndex, 1);
        this.currentProfile.competitors.splice(toIndex, 0, removed);

        this.markDirty();
        this.saveToHistory();
    }

    // =========================================================================
    // IMPORTANCE BANDS MANAGEMENT
    // =========================================================================

    /**
     * Add importance band
     * @param {string} label - Band label
     * @param {number} min - Minimum score (0-10)
     * @param {number} max - Maximum score (0-10)
     * @param {string} description - Band description
     * @param {Array<string>} examples - Example scenarios
     */
    addBand(label, min, max, description, examples = []) {
        if (min < 0 || min > 10 || max < 0 || max > 10) {
            throw new Error('Band scores must be between 0 and 10');
        }

        if (min > max) {
            throw new Error('Minimum score cannot exceed maximum score');
        }

        const band = {
            min,
            max,
            label: label.trim(),
            description: description.trim(),
            examples: Array.isArray(examples) ? examples : []
        };

        this.currentProfile.importanceBands.push(band);

        // Sort bands by min score (descending)
        this.currentProfile.importanceBands.sort((a, b) => b.min - a.min);

        this.markDirty();
        this.saveToHistory();

        return this.currentProfile.importanceBands.findIndex(b => b === band);
    }

    /**
     * Remove importance band
     * @param {number} index - Band index
     */
    removeBand(index) {
        if (index < 0 || index >= this.currentProfile.importanceBands.length) {
            throw new Error('Invalid band index');
        }

        const band = this.currentProfile.importanceBands[index];
        if (!confirm(`Remove importance band "${band.label}" (${band.min}-${band.max})?`)) {
            return false;
        }

        this.currentProfile.importanceBands.splice(index, 1);
        this.markDirty();
        this.saveToHistory();

        return true;
    }

    /**
     * Update importance band
     * @param {number} index - Band index
     * @param {object} updates - Fields to update
     */
    updateBand(index, updates) {
        if (index < 0 || index >= this.currentProfile.importanceBands.length) {
            throw new Error('Invalid band index');
        }

        const band = this.currentProfile.importanceBands[index];

        // Validate numeric fields
        if (updates.min !== undefined && (updates.min < 0 || updates.min > 10)) {
            throw new Error('Minimum score must be between 0 and 10');
        }
        if (updates.max !== undefined && (updates.max < 0 || updates.max > 10)) {
            throw new Error('Maximum score must be between 0 and 10');
        }

        Object.assign(band, updates);

        // Re-sort if min/max changed
        if (updates.min !== undefined || updates.max !== undefined) {
            this.currentProfile.importanceBands.sort((a, b) => b.min - a.min);
        }

        this.markDirty();
        this.saveToHistory();
    }

    /**
     * Validate that importance bands cover entire 0-10 range
     * @returns {object} Validation result with coverage details
     */
    validateBandCoverage() {
        const bands = this.currentProfile.importanceBands;

        if (!bands || bands.length === 0) {
            return {
                valid: false,
                coverage: [],
                gaps: [[0, 10]],
                overlaps: []
            };
        }

        // Create coverage array
        const coverage = new Array(11).fill(0);
        const overlaps = [];

        bands.forEach((band, bandIndex) => {
            for (let i = band.min; i <= band.max; i++) {
                coverage[i]++;
                if (coverage[i] > 1) {
                    overlaps.push({
                        score: i,
                        bands: bands.filter(b => i >= b.min && i <= b.max)
                    });
                }
            }
        });

        // Find gaps
        const gaps = [];
        let gapStart = null;

        for (let i = 0; i <= 10; i++) {
            if (coverage[i] === 0) {
                if (gapStart === null) gapStart = i;
            } else {
                if (gapStart !== null) {
                    gaps.push([gapStart, i - 1]);
                    gapStart = null;
                }
            }
        }

        if (gapStart !== null) {
            gaps.push([gapStart, 10]);
        }

        return {
            valid: gaps.length === 0 && overlaps.length === 0,
            coverage: coverage,
            gaps: gaps,
            overlaps: overlaps
        };
    }

    /**
     * Visualize importance bands as a scale
     * @returns {string} HTML representation
     */
    visualizeBands() {
        const validation = this.validateBandCoverage();
        const bands = this.currentProfile.importanceBands;

        let html = '<div class="importance-scale">';

        // Draw scale from 10 to 0
        for (let score = 10; score >= 0; score--) {
            const band = bands.find(b => score >= b.min && score <= b.max);
            const isGap = validation.coverage[score] === 0;
            const isOverlap = validation.coverage[score] > 1;

            let className = 'scale-segment';
            if (isGap) className += ' gap';
            if (isOverlap) className += ' overlap';

            html += `
                <div class="${className}" data-score="${score}">
                    <span class="score">${score}</span>
                    <span class="band-label">${band ? band.label : (isGap ? 'GAP' : '')}</span>
                </div>
            `;
        }

        html += '</div>';

        return html;
    }

    /**
     * Suggest color for importance band based on name
     * @param {string} bandName - Band label
     * @returns {string} Hex color code
     */
    suggestBandColor(bandName) {
        const name = bandName.toLowerCase();

        const colorMap = {
            'critical': '#dc3545',
            'urgent': '#dc3545',
            'high': '#fd7e14',
            'important': '#ffc107',
            'medium': '#20c997',
            'moderate': '#20c997',
            'low': '#6c757d',
            'minor': '#6c757d',
            'minimal': '#adb5bd',
            'trivial': '#e9ecef'
        };

        for (const [keyword, color] of Object.entries(colorMap)) {
            if (name.includes(keyword)) {
                return color;
            }
        }

        return '#667eea'; // Default color
    }

    // =========================================================================
    // KEYWORDS MANAGEMENT
    // =========================================================================

    /**
     * Add keyword to specified level
     * @param {string} level - 'high', 'medium', or 'low'
     * @param {string} keyword - Keyword to add
     */
    addKeyword(level, keyword) {
        if (!['high', 'medium', 'low'].includes(level)) {
            throw new Error('Invalid keyword level');
        }

        const trimmedKeyword = keyword.trim().toLowerCase();

        if (!trimmedKeyword) {
            throw new Error('Keyword cannot be empty');
        }

        if (!this.currentProfile.domainKeywords[level]) {
            this.currentProfile.domainKeywords[level] = [];
        }

        // Check for duplicates
        if (this.currentProfile.domainKeywords[level].includes(trimmedKeyword)) {
            throw new Error('Keyword already exists in this level');
        }

        this.currentProfile.domainKeywords[level].push(trimmedKeyword);
        this.markDirty();
        this.saveToHistory();

        return this.currentProfile.domainKeywords[level].length - 1;
    }

    /**
     * Remove keyword from level
     * @param {string} level - Keyword level
     * @param {number} index - Keyword index
     */
    removeKeyword(level, index) {
        if (!['high', 'medium', 'low'].includes(level)) {
            throw new Error('Invalid keyword level');
        }

        if (!this.currentProfile.domainKeywords[level]) {
            throw new Error('No keywords at this level');
        }

        if (index < 0 || index >= this.currentProfile.domainKeywords[level].length) {
            throw new Error('Invalid keyword index');
        }

        this.currentProfile.domainKeywords[level].splice(index, 1);
        this.markDirty();
        this.saveToHistory();
    }

    /**
     * Bulk import keywords from CSV string
     * @param {string} level - Target level
     * @param {string} csvString - Comma-separated keywords
     * @returns {object} Import results
     */
    bulkImportKeywords(level, csvString) {
        if (!['high', 'medium', 'low'].includes(level)) {
            throw new Error('Invalid keyword level');
        }

        const keywords = csvString
            .split(',')
            .map(k => k.trim().toLowerCase())
            .filter(k => k.length > 0);

        const results = {
            added: 0,
            duplicates: 0,
            errors: []
        };

        if (!this.currentProfile.domainKeywords[level]) {
            this.currentProfile.domainKeywords[level] = [];
        }

        keywords.forEach(keyword => {
            try {
                if (this.currentProfile.domainKeywords[level].includes(keyword)) {
                    results.duplicates++;
                } else {
                    this.currentProfile.domainKeywords[level].push(keyword);
                    results.added++;
                }
            } catch (error) {
                results.errors.push({ keyword, error: error.message });
            }
        });

        if (results.added > 0) {
            this.markDirty();
            this.saveToHistory();
        }

        return results;
    }

    /**
     * Get keyword count for level
     * @param {string} level - Keyword level
     * @returns {number} Count
     */
    getKeywordCount(level) {
        if (!['high', 'medium', 'low'].includes(level)) {
            throw new Error('Invalid keyword level');
        }

        return this.currentProfile.domainKeywords[level]?.length || 0;
    }

    // =========================================================================
    // PAGE WEIGHTS MANAGEMENT
    // =========================================================================

    /**
     * Set page weight for page type
     * @param {string} pageType - Page type
     * @param {number} weight - Weight multiplier
     */
    setPageWeight(pageType, weight) {
        if (weight < 0 || weight > 10) {
            throw new Error('Weight must be between 0 and 10');
        }

        if (!this.currentProfile.pageWeights) {
            this.currentProfile.pageWeights = {};
        }

        this.currentProfile.pageWeights[pageType] = weight;
        this.markDirty();
        this.saveToHistory();
    }

    /**
     * Remove page type weight
     * @param {string} pageType - Page type to remove
     */
    removePageType(pageType) {
        if (!this.currentProfile.pageWeights || !this.currentProfile.pageWeights[pageType]) {
            return false;
        }

        delete this.currentProfile.pageWeights[pageType];
        this.markDirty();
        this.saveToHistory();

        return true;
    }

    /**
     * Add custom page type with weight
     * @param {string} name - Page type name
     * @param {number} weight - Weight multiplier
     */
    addCustomPageType(name, weight) {
        const typeName = name.trim().toLowerCase().replace(/\s+/g, '-');

        if (!typeName) {
            throw new Error('Page type name cannot be empty');
        }

        this.setPageWeight(typeName, weight);

        return typeName;
    }

    // =========================================================================
    // STATE MANAGEMENT
    // =========================================================================

    /**
     * Check if profile has unsaved changes
     * @returns {boolean} True if dirty
     */
    isDirty() {
        return this.isDirtyFlag;
    }

    /**
     * Mark profile as having unsaved changes
     */
    markDirty() {
        if (!this.isDirtyFlag) {
            this.isDirtyFlag = true;
            this.updateUIState();
            this.dispatchEvent('dirty');
        }
    }

    /**
     * Mark profile as saved (clean)
     */
    markClean() {
        if (this.isDirtyFlag) {
            this.isDirtyFlag = false;
            this.originalProfile = JSON.parse(JSON.stringify(this.currentProfile));
            this.updateUIState();
            this.dispatchEvent('clean');
        }
    }

    /**
     * Get changes from original profile
     * @returns {object} Diff object
     */
    getChanges() {
        return this.deepDiff(this.originalProfile, this.currentProfile);
    }

    /**
     * Revert all changes to original profile
     */
    revertChanges() {
        if (!confirm('Revert all unsaved changes?')) {
            return false;
        }

        this.currentProfile = JSON.parse(JSON.stringify(this.originalProfile));
        this.populateAllSections();
        this.markClean();
        this.clearHistory();
        this.saveToHistory();
        this.dispatchEvent('reverted');

        return true;
    }

    /**
     * Save current state to history for undo/redo
     */
    saveToHistory() {
        // Remove any states after current position
        if (this.currentHistoryIndex < this.changeHistory.length - 1) {
            this.changeHistory = this.changeHistory.slice(0, this.currentHistoryIndex + 1);
        }

        // Add current state
        const state = JSON.parse(JSON.stringify(this.currentProfile));
        this.changeHistory.push(state);

        // Limit history size
        if (this.changeHistory.length > this.maxHistorySize) {
            this.changeHistory.shift();
        } else {
            this.currentHistoryIndex++;
        }

        this.updateUIState();
    }

    /**
     * Undo last change
     */
    undo() {
        if (!this.canUndo()) {
            return false;
        }

        this.currentHistoryIndex--;
        this.currentProfile = JSON.parse(JSON.stringify(this.changeHistory[this.currentHistoryIndex]));
        this.populateAllSections();
        this.markDirty();
        this.updateUIState();
        this.dispatchEvent('undo');

        return true;
    }

    /**
     * Redo last undone change
     */
    redo() {
        if (!this.canRedo()) {
            return false;
        }

        this.currentHistoryIndex++;
        this.currentProfile = JSON.parse(JSON.stringify(this.changeHistory[this.currentHistoryIndex]));
        this.populateAllSections();
        this.markDirty();
        this.updateUIState();
        this.dispatchEvent('redo');

        return true;
    }

    /**
     * Check if undo is available
     */
    canUndo() {
        return this.currentHistoryIndex > 0;
    }

    /**
     * Check if redo is available
     */
    canRedo() {
        return this.currentHistoryIndex < this.changeHistory.length - 1;
    }

    /**
     * Clear history
     */
    clearHistory() {
        this.changeHistory = [];
        this.currentHistoryIndex = -1;
    }

    // =========================================================================
    // VALIDATION
    // =========================================================================

    /**
     * Validate entire profile against schema and business rules
     * @param {object} profile - Profile to validate (defaults to current)
     * @returns {object} Validation results
     */
    validateProfile(profile = null) {
        const targetProfile = profile || this.currentProfile;
        const errors = [];
        const warnings = [];

        // Basic required fields
        if (!targetProfile.name || targetProfile.name.trim() === '') {
            errors.push({ field: 'name', message: 'Profile name is required' });
        }

        if (!targetProfile.domain || targetProfile.domain.trim() === '') {
            errors.push({ field: 'domain', message: 'Domain identifier is required' });
        }

        // Competitors validation
        if (!targetProfile.competitors || targetProfile.competitors.length === 0) {
            warnings.push({ field: 'competitors', message: 'No competitors defined' });
        } else {
            targetProfile.competitors.forEach((comp, idx) => {
                if (!comp.name || comp.name.trim() === '') {
                    errors.push({
                        field: `competitors[${idx}].name`,
                        message: 'Competitor name is required'
                    });
                }

                if (!comp.urls || comp.urls.length === 0) {
                    warnings.push({
                        field: `competitors[${idx}].urls`,
                        message: `No URLs defined for ${comp.name}`
                    });
                } else {
                    comp.urls.forEach((urlObj, urlIdx) => {
                        if (!this.isValidURL(urlObj.url)) {
                            errors.push({
                                field: `competitors[${idx}].urls[${urlIdx}]`,
                                message: `Invalid URL: ${urlObj.url}`
                            });
                        }

                        if (!this.pageTypes.includes(urlObj.type)) {
                            errors.push({
                                field: `competitors[${idx}].urls[${urlIdx}].type`,
                                message: `Invalid page type: ${urlObj.type}`
                            });
                        }
                    });
                }
            });
        }

        // Importance bands validation
        if (!targetProfile.importanceBands || targetProfile.importanceBands.length === 0) {
            errors.push({ field: 'importanceBands', message: 'At least one importance band is required' });
        } else {
            const coverage = this.validateBandCoverage();

            if (coverage.gaps.length > 0) {
                warnings.push({
                    field: 'importanceBands',
                    message: `Importance scale has gaps: ${coverage.gaps.map(g => `${g[0]}-${g[1]}`).join(', ')}`
                });
            }

            if (coverage.overlaps.length > 0) {
                warnings.push({
                    field: 'importanceBands',
                    message: `Importance scale has overlaps at scores: ${[...new Set(coverage.overlaps.map(o => o.score))].join(', ')}`
                });
            }

            targetProfile.importanceBands.forEach((band, idx) => {
                if (band.min < 0 || band.min > 10 || band.max < 0 || band.max > 10) {
                    errors.push({
                        field: `importanceBands[${idx}]`,
                        message: 'Band scores must be between 0 and 10'
                    });
                }

                if (band.min > band.max) {
                    errors.push({
                        field: `importanceBands[${idx}]`,
                        message: 'Band minimum cannot exceed maximum'
                    });
                }

                if (!band.label || band.label.trim() === '') {
                    errors.push({
                        field: `importanceBands[${idx}].label`,
                        message: 'Band label is required'
                    });
                }

                if (!band.description || band.description.trim() === '') {
                    warnings.push({
                        field: `importanceBands[${idx}].description`,
                        message: `Band "${band.label}" missing description`
                    });
                }

                if (!band.examples || band.examples.length === 0) {
                    warnings.push({
                        field: `importanceBands[${idx}].examples`,
                        message: `Band "${band.label}" missing examples`
                    });
                }
            });
        }

        // Keywords validation
        if (targetProfile.domainKeywords) {
            const totalKeywords =
                (targetProfile.domainKeywords.high?.length || 0) +
                (targetProfile.domainKeywords.medium?.length || 0) +
                (targetProfile.domainKeywords.low?.length || 0);

            if (totalKeywords === 0) {
                warnings.push({
                    field: 'domainKeywords',
                    message: 'No keywords defined'
                });
            }

            if ((targetProfile.domainKeywords.high?.length || 0) === 0) {
                warnings.push({
                    field: 'domainKeywords.high',
                    message: 'No high-priority keywords defined'
                });
            }
        }

        // Page weights validation
        if (targetProfile.pageWeights) {
            Object.entries(targetProfile.pageWeights).forEach(([type, weight]) => {
                if (typeof weight !== 'number' || weight < 0 || weight > 10) {
                    errors.push({
                        field: `pageWeights.${type}`,
                        message: 'Page weight must be a number between 0 and 10'
                    });
                }
            });
        }

        this.validationErrors = errors;

        return {
            valid: errors.length === 0,
            errors: errors,
            warnings: warnings
        };
    }

    // =========================================================================
    // PERSISTENCE
    // =========================================================================

    /**
     * Save profile to server
     * @returns {Promise<object>} Saved profile
     */
    async saveProfile() {
        try {
            // Validate first
            const validation = this.validateProfile();

            if (!validation.valid) {
                this.showValidationErrors(validation.errors);
                throw new Error('Profile validation failed');
            }

            if (validation.warnings.length > 0) {
                const proceed = confirm(
                    `Profile has ${validation.warnings.length} warning(s). Continue saving?\n\n` +
                    validation.warnings.map(w => `- ${w.message}`).join('\n')
                );

                if (!proceed) {
                    return null;
                }
            }

            // Update timestamps
            this.currentProfile.lastModified = new Date().toISOString();
            if (!this.currentProfile.created) {
                this.currentProfile.created = new Date().toISOString();
            }

            // Save to server
            const url = this.profileId
                ? `/api/profiles/${this.profileId}`
                : '/api/profiles';

            const method = this.profileId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ profile: this.currentProfile })
            });

            if (!response.ok) {
                throw new Error(`Failed to save profile: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();

            // Update local state
            if (!this.profileId && result.profile.id) {
                this.profileId = result.profile.id;
                this.currentProfile.id = result.profile.id;
            }

            this.markClean();
            this.showSuccess('Profile saved successfully');
            this.dispatchEvent('saved', { profile: this.currentProfile });

            // Save draft to local storage as backup
            this.saveDraft();

            return this.currentProfile;

        } catch (error) {
            console.error('Error saving profile:', error);
            this.showError('Failed to save profile: ' + error.message);
            throw error;
        }
    }

    /**
     * Export profile as JSON file
     */
    exportProfile() {
        const validation = this.validateProfile();

        if (!validation.valid) {
            if (!confirm('Profile has validation errors. Export anyway?')) {
                return;
            }
        }

        const json = JSON.stringify({ profile: this.currentProfile }, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.currentProfile.domain || 'profile'}-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showSuccess('Profile exported successfully');
    }

    /**
     * Delete profile
     * @returns {Promise<boolean>} Success status
     */
    async deleteProfile() {
        if (!this.profileId) {
            throw new Error('Cannot delete unsaved profile');
        }

        const confirmed = confirm(
            `Delete profile "${this.currentProfile.name}"?\n\n` +
            'This action cannot be undone.'
        );

        if (!confirmed) {
            return false;
        }

        try {
            const response = await fetch(`/api/profiles/${this.profileId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`Failed to delete profile: ${response.status}`);
            }

            this.showSuccess('Profile deleted successfully');
            this.dispatchEvent('deleted', { profileId: this.profileId });

            // Clear local draft
            this.clearDraft();

            return true;

        } catch (error) {
            console.error('Error deleting profile:', error);
            this.showError('Failed to delete profile: ' + error.message);
            throw error;
        }
    }

    /**
     * Save draft to local storage
     */
    saveDraft() {
        try {
            const draftKey = `profile-draft-${this.profileId || 'new'}`;
            localStorage.setItem(draftKey, JSON.stringify({
                profile: this.currentProfile,
                timestamp: Date.now()
            }));
        } catch (error) {
            console.warn('Failed to save draft to local storage:', error);
        }
    }

    /**
     * Load draft from local storage
     */
    loadDraft() {
        try {
            const draftKey = `profile-draft-${this.profileId || 'new'}`;
            const draftData = localStorage.getItem(draftKey);

            if (draftData) {
                const { profile, timestamp } = JSON.parse(draftData);
                const age = Date.now() - timestamp;
                const ageMinutes = Math.floor(age / 60000);

                if (confirm(`Found draft from ${ageMinutes} minutes ago. Load it?`)) {
                    this.currentProfile = profile;
                    this.populateAllSections();
                    this.markDirty();
                    return true;
                }
            }
        } catch (error) {
            console.warn('Failed to load draft from local storage:', error);
        }

        return false;
    }

    /**
     * Clear draft from local storage
     */
    clearDraft() {
        try {
            const draftKey = `profile-draft-${this.profileId || 'new'}`;
            localStorage.removeItem(draftKey);
        } catch (error) {
            console.warn('Failed to clear draft:', error);
        }
    }

    // =========================================================================
    // TESTING
    // =========================================================================

    /**
     * Test profile configuration
     * @returns {Promise<object>} Test results
     */
    async testProfile() {
        const results = {
            validation: null,
            urlTests: [],
            keywordTests: [],
            bandTests: []
        };

        try {
            // 1. Run validation
            results.validation = this.validateProfile();

            // 2. Test URL accessibility (sample 5 URLs)
            const allUrls = this.currentProfile.competitors.flatMap(c =>
                c.urls.map(u => ({ competitor: c.name, ...u }))
            );

            const sampleUrls = this.sampleArray(allUrls, 5);

            for (const urlObj of sampleUrls) {
                try {
                    const testResult = await this.testURL(urlObj.url);
                    results.urlTests.push({
                        url: urlObj.url,
                        competitor: urlObj.competitor,
                        status: testResult.status,
                        responseTime: testResult.responseTime,
                        success: testResult.success
                    });
                } catch (error) {
                    results.urlTests.push({
                        url: urlObj.url,
                        competitor: urlObj.competitor,
                        status: 'error',
                        error: error.message,
                        success: false
                    });
                }
            }

            // 3. Test keyword coverage
            const allKeywords = [
                ...this.currentProfile.domainKeywords.high,
                ...this.currentProfile.domainKeywords.medium,
                ...this.currentProfile.domainKeywords.low
            ];

            results.keywordTests.push({
                total: allKeywords.length,
                high: this.currentProfile.domainKeywords.high.length,
                medium: this.currentProfile.domainKeywords.medium.length,
                low: this.currentProfile.domainKeywords.low.length
            });

            // 4. Test band coverage
            const coverage = this.validateBandCoverage();
            results.bandTests.push({
                coverage: coverage.valid,
                gaps: coverage.gaps,
                overlaps: coverage.overlaps
            });

            this.showTestResults(results);

            return results;

        } catch (error) {
            console.error('Error testing profile:', error);
            this.showError('Test failed: ' + error.message);
            throw error;
        }
    }

    /**
     * Test URL accessibility
     * @param {string} url - URL to test
     * @returns {Promise<object>} Test result
     */
    async testURL(url) {
        const startTime = Date.now();

        try {
            const response = await fetch(`/api/test-url?url=${encodeURIComponent(url)}`, {
                method: 'HEAD',
                timeout: 10000
            });

            const responseTime = Date.now() - startTime;

            return {
                success: response.ok,
                status: response.status,
                responseTime: responseTime
            };

        } catch (error) {
            return {
                success: false,
                status: 'error',
                responseTime: Date.now() - startTime,
                error: error.message
            };
        }
    }

    // =========================================================================
    // UI HELPERS
    // =========================================================================

    /**
     * Show unsaved changes warning before navigation
     * @returns {boolean} True if navigation should proceed
     */
    showUnsavedWarning() {
        if (!this.isDirty()) {
            return true;
        }

        return confirm(
            'You have unsaved changes.\n\n' +
            'Leave without saving?'
        );
    }

    /**
     * Show validation errors to user
     * @param {Array} errors - Validation errors
     */
    showValidationErrors(errors) {
        if (!errors || errors.length === 0) {
            return;
        }

        const errorList = errors.map(e => `- ${e.field}: ${e.message}`).join('\n');

        this.showError(
            `Profile has ${errors.length} validation error(s):\n\n${errorList}`
        );

        // Optionally highlight fields with errors in UI
        this.dispatchEvent('validation-errors', { errors });
    }

    /**
     * Show success message
     * @param {string} message - Success message
     */
    showSuccess(message) {
        console.log('[SUCCESS]', message);
        this.dispatchEvent('success', { message });
    }

    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        console.error('[ERROR]', message);
        alert(message); // Simple fallback
        this.dispatchEvent('error', { message });
    }

    /**
     * Show test results modal
     * @param {object} results - Test results
     */
    showTestResults(results) {
        let message = '=== Profile Test Results ===\n\n';

        // Validation
        message += `Validation: ${results.validation.valid ? 'PASSED' : 'FAILED'}\n`;
        if (results.validation.errors.length > 0) {
            message += `- ${results.validation.errors.length} errors\n`;
        }
        if (results.validation.warnings.length > 0) {
            message += `- ${results.validation.warnings.length} warnings\n`;
        }

        // URL Tests
        message += `\nURL Tests (${results.urlTests.length} tested):\n`;
        results.urlTests.forEach(test => {
            const status = test.success ? 'OK' : 'FAIL';
            message += `- ${status}: ${test.url} (${test.responseTime}ms)\n`;
        });

        // Keywords
        if (results.keywordTests.length > 0) {
            const kw = results.keywordTests[0];
            message += `\nKeywords: ${kw.total} total (${kw.high} high, ${kw.medium} medium, ${kw.low} low)\n`;
        }

        // Bands
        if (results.bandTests.length > 0) {
            const band = results.bandTests[0];
            message += `\nImportance Bands: ${band.coverage ? 'Complete coverage' : 'Gaps detected'}\n`;
            if (band.gaps.length > 0) {
                message += `- Gaps: ${band.gaps.map(g => `${g[0]}-${g[1]}`).join(', ')}\n`;
            }
        }

        alert(message);
        this.dispatchEvent('test-complete', { results });
    }

    /**
     * Enable auto-save at specified interval
     * @param {number} intervalMs - Auto-save interval in milliseconds
     */
    enableAutoSave(intervalMs = 60000) {
        this.disableAutoSave();

        this.autoSaveInterval = setInterval(async () => {
            if (this.isDirty()) {
                try {
                    console.log('[AUTO-SAVE] Saving profile...');
                    this.saveDraft();
                    this.dispatchEvent('auto-saved');
                } catch (error) {
                    console.error('[AUTO-SAVE] Failed:', error);
                }
            }
        }, intervalMs);
    }

    /**
     * Disable auto-save
     */
    disableAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    }

    // =========================================================================
    // UI POPULATION
    // =========================================================================

    /**
     * Populate all UI sections
     */
    populateAllSections() {
        this.populateBasicInfo();
        this.populateCompetitors();
        this.populateImportanceBands();
        this.populateKeywords();
        this.populatePageWeights();
        this.populateAdvancedSettings();
    }

    /**
     * Populate basic info section
     */
    populateBasicInfo() {
        const fields = ['name', 'domain', 'description'];
        fields.forEach(field => {
            const element = document.getElementById(`profile-${field}`);
            if (element) {
                element.value = this.currentProfile[field] || '';
            }
        });
    }

    /**
     * Populate competitors section
     */
    populateCompetitors() {
        const container = document.getElementById('competitors-container');
        if (!container) return;

        // Implementation depends on UI structure
        this.dispatchEvent('populate-competitors', {
            competitors: this.currentProfile.competitors
        });
    }

    /**
     * Populate importance bands section
     */
    populateImportanceBands() {
        const container = document.getElementById('importance-bands-container');
        if (!container) return;

        this.dispatchEvent('populate-bands', {
            bands: this.currentProfile.importanceBands
        });
    }

    /**
     * Populate keywords section
     */
    populateKeywords() {
        this.dispatchEvent('populate-keywords', {
            keywords: this.currentProfile.domainKeywords
        });
    }

    /**
     * Populate page weights section
     */
    populatePageWeights() {
        this.dispatchEvent('populate-weights', {
            weights: this.currentProfile.pageWeights
        });
    }

    /**
     * Populate advanced settings
     */
    populateAdvancedSettings() {
        this.dispatchEvent('populate-advanced', {
            settings: {
                discovery: this.currentProfile.discovery,
                status: this.currentProfile.status,
                template: this.currentProfile.analysisPromptTemplate
            }
        });
    }

    /**
     * Update UI state based on editor state
     */
    updateUIState() {
        this.dispatchEvent('state-changed', {
            isDirty: this.isDirty(),
            canUndo: this.canUndo(),
            canRedo: this.canRedo()
        });
    }

    // =========================================================================
    // EVENT HANDLING
    // =========================================================================

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Before unload warning
        window.addEventListener('beforeunload', (e) => {
            if (this.isDirty()) {
                e.preventDefault();
                e.returnValue = '';
                return '';
            }
        });

        // Auto-save draft periodically
        this.enableAutoSave(30000); // 30 seconds
    }

    /**
     * Dispatch custom event
     * @param {string} eventName - Event name
     * @param {object} detail - Event detail
     */
    dispatchEvent(eventName, detail = {}) {
        const event = new CustomEvent(`profile-editor:${eventName}`, {
            detail: { ...detail, editor: this }
        });
        window.dispatchEvent(event);
    }

    // =========================================================================
    // UTILITY FUNCTIONS
    // =========================================================================

    /**
     * Validate URL format
     * @param {string} url - URL to validate
     * @returns {boolean} True if valid
     */
    isValidURL(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
        } catch {
            return false;
        }
    }

    /**
     * Generate UUID v4
     * @returns {string} UUID
     */
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * Deep diff two objects
     * @param {object} obj1 - Original object
     * @param {object} obj2 - Modified object
     * @returns {object} Diff
     */
    deepDiff(obj1, obj2) {
        const changes = {};

        const compare = (original, modified, path = '') => {
            if (original === modified) return;

            if (typeof original !== 'object' || typeof modified !== 'object') {
                changes[path] = { from: original, to: modified };
                return;
            }

            const allKeys = new Set([
                ...Object.keys(original || {}),
                ...Object.keys(modified || {})
            ]);

            allKeys.forEach(key => {
                const newPath = path ? `${path}.${key}` : key;
                compare(original?.[key], modified?.[key], newPath);
            });
        };

        compare(obj1, obj2);
        return changes;
    }

    /**
     * Sample array randomly
     * @param {Array} array - Source array
     * @param {number} n - Number of samples
     * @returns {Array} Sampled items
     */
    sampleArray(array, n) {
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, n);
    }

    /**
     * Destroy editor and clean up
     */
    destroy() {
        this.disableAutoSave();
        window.removeEventListener('beforeunload', this.showUnsavedWarning);
        this.currentProfile = null;
        this.originalProfile = null;
        this.changeHistory = [];
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProfileEditor;
}
