/**
 * ProfileManager.js
 *
 * Manages profile CRUD operations with Google Sheets integration.
 * Handles multi-sheet management per profile with data isolation.
 *
 * Google Sheets Structure:
 * - Profiles (main registry)
 * - Competitors_{profileId} (per-profile competitor tracking)
 * - Changes_{profileId} (per-profile change history)
 * - ImportanceBands_{profileId} (per-profile scoring definitions)
 *
 * @requires Google Apps Script SpreadsheetApp
 */

class ProfileManager {
  constructor() {
    this.spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    this.profilesSheet = this.getOrCreateSheet('Profiles');
  }

  /**
   * Save profile to Google Sheets
   * Creates new profile or updates existing one
   * Automatically creates associated sheets for new profiles
   *
   * @param {Object} profile - Profile configuration object
   * @param {string} profile.id - Unique profile identifier (UUID)
   * @param {string} profile.name - Display name
   * @param {string} profile.domain - Industry/domain identifier
   * @param {Array} profile.competitors - Array of competitor objects
   * @param {Array} profile.importanceBands - Importance scoring bands
   * @returns {string} Profile ID
   * @throws {Error} If profile validation fails
   */
  saveProfile(profile) {
    // Validate profile structure
    this.validateProfile(profile);

    const sheet = this.profilesSheet;
    const existingRow = this.findProfileRow(profile.id);

    const timestamp = new Date().toISOString();
    const rowData = [
      profile.id,
      profile.name,
      profile.domain,
      profile.status || 'active',
      profile.created || timestamp,
      timestamp, // lastModified
      JSON.stringify(profile)
    ];

    if (existingRow) {
      // Update existing profile
      sheet.getRange(existingRow, 1, 1, rowData.length).setValues([rowData]);
      Logger.log(`Profile updated: ${profile.id} (${profile.name})`);
    } else {
      // Create new profile
      sheet.appendRow(rowData);
      Logger.log(`Profile created: ${profile.id} (${profile.name})`);

      // Create associated sheets for new profile
      this.createProfileSheets(profile.id);
    }

    // Store importance bands in dedicated sheet
    this.saveImportanceBands(profile.id, profile.importanceBands);

    // Initialize competitors tracking
    if (profile.competitors && profile.competitors.length > 0) {
      this.initializeCompetitors(profile.id, profile.competitors);
    }

    return profile.id;
  }

  /**
   * Load profile from Google Sheets
   *
   * @param {string} profileId - Profile identifier
   * @returns {Object} Full profile configuration
   * @throws {Error} If profile not found
   */
  loadProfile(profileId) {
    const sheet = this.profilesSheet;
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === profileId) {
        const profile = JSON.parse(data[i][6]); // Config JSON column
        Logger.log(`Profile loaded: ${profileId}`);
        return profile;
      }
    }

    throw new Error(`Profile not found: ${profileId}`);
  }

  /**
   * List all profiles with summary information
   *
   * @param {string} status - Filter by status (optional: 'active', 'paused', 'archived')
   * @returns {Array} Array of profile summaries
   */
  listProfiles(status = null) {
    const sheet = this.profilesSheet;
    const data = sheet.getDataRange().getValues();

    const profiles = [];
    for (let i = 1; i < data.length; i++) {
      const profileStatus = data[i][3];

      // Filter by status if provided
      if (status && profileStatus !== status) {
        continue;
      }

      profiles.push({
        id: data[i][0],
        name: data[i][1],
        domain: data[i][2],
        status: profileStatus,
        created: data[i][4],
        lastModified: data[i][5]
      });
    }

    Logger.log(`Listed ${profiles.length} profiles` + (status ? ` (status: ${status})` : ''));
    return profiles;
  }

  /**
   * Delete profile and all associated sheets
   *
   * @param {string} profileId - Profile identifier
   * @returns {boolean} True if deleted, false if not found
   */
  deleteProfile(profileId) {
    const row = this.findProfileRow(profileId);

    if (!row) {
      Logger.log(`Profile not found for deletion: ${profileId}`);
      return false;
    }

    // Get profile name for logging
    const profileData = this.profilesSheet.getRange(row, 1, 1, 7).getValues()[0];
    const profileName = profileData[1];

    // Delete profile row
    this.profilesSheet.deleteRow(row);

    // Delete associated sheets
    this.deleteProfileSheets(profileId);

    Logger.log(`Profile deleted: ${profileId} (${profileName})`);
    return true;
  }

  /**
   * Create sheets for a new profile
   * Sets up all required data sheets with proper headers
   *
   * @param {string} profileId - Profile identifier
   * @private
   */
  createProfileSheets(profileId) {
    const ss = this.spreadsheet;

    // 1. Competitors sheet - tracks competitor monitoring status
    const competitorsSheet = ss.insertSheet(`Competitors_${profileId}`);
    competitorsSheet.appendRow([
      'Company',
      'URL Count',
      'Keywords',
      'Last Check',
      'Status',
      'Changes (24h)',
      'Total Changes'
    ]);
    this.formatHeaderRow(competitorsSheet, 7);

    // 2. Changes sheet - stores detected changes with AI analysis
    const changesSheet = ss.insertSheet(`Changes_${profileId}`);
    changesSheet.appendRow([
      'Timestamp',
      'Company',
      'URL',
      'Score',
      'Band Label',
      'Band Min-Max',
      'Summary',
      'AI Analysis JSON'
    ]);
    this.formatHeaderRow(changesSheet, 8);

    // 3. Importance Bands sheet - defines scoring criteria
    const bandsSheet = ss.insertSheet(`ImportanceBands_${profileId}`);
    bandsSheet.appendRow([
      'Min',
      'Max',
      'Label',
      'Description',
      'Examples JSON'
    ]);
    this.formatHeaderRow(bandsSheet, 5);

    Logger.log(`Created sheets for profile: ${profileId}`);
  }

  /**
   * Delete all sheets associated with a profile
   *
   * @param {string} profileId - Profile identifier
   * @private
   */
  deleteProfileSheets(profileId) {
    const ss = this.spreadsheet;
    const sheetNames = [
      `Competitors_${profileId}`,
      `Changes_${profileId}`,
      `ImportanceBands_${profileId}`
    ];

    let deletedCount = 0;
    sheetNames.forEach(name => {
      const sheet = ss.getSheetByName(name);
      if (sheet) {
        ss.deleteSheet(sheet);
        deletedCount++;
      }
    });

    Logger.log(`Deleted ${deletedCount} sheets for profile: ${profileId}`);
  }

  /**
   * Save importance bands to profile-specific sheet
   *
   * @param {string} profileId - Profile identifier
   * @param {Array} bands - Array of importance band objects
   * @private
   */
  saveImportanceBands(profileId, bands) {
    const sheet = this.spreadsheet.getSheetByName(`ImportanceBands_${profileId}`);
    if (!sheet) {
      Logger.log(`ImportanceBands sheet not found for profile: ${profileId}`);
      return;
    }

    // Clear existing data (except header)
    if (sheet.getLastRow() > 1) {
      sheet.deleteRows(2, sheet.getLastRow() - 1);
    }

    // Add bands
    if (bands && bands.length > 0) {
      bands.forEach(band => {
        sheet.appendRow([
          band.min,
          band.max,
          band.label,
          band.description,
          JSON.stringify(band.examples)
        ]);
      });

      Logger.log(`Saved ${bands.length} importance bands for profile: ${profileId}`);
    }
  }

  /**
   * Initialize competitors tracking sheet
   *
   * @param {string} profileId - Profile identifier
   * @param {Array} competitors - Array of competitor objects
   * @private
   */
  initializeCompetitors(profileId, competitors) {
    const sheet = this.spreadsheet.getSheetByName(`Competitors_${profileId}`);
    if (!sheet) {
      Logger.log(`Competitors sheet not found for profile: ${profileId}`);
      return;
    }

    // Clear existing data (except header)
    if (sheet.getLastRow() > 1) {
      sheet.deleteRows(2, sheet.getLastRow() - 1);
    }

    // Add competitors
    competitors.forEach(competitor => {
      const urlCount = competitor.urls ? competitor.urls.length : 0;
      const keywords = competitor.keywords ? competitor.keywords.join(', ') : '';

      sheet.appendRow([
        competitor.name,
        urlCount,
        keywords,
        '', // Last Check (will be filled during monitoring)
        'pending', // Status
        0, // Changes (24h)
        0  // Total Changes
      ]);
    });

    Logger.log(`Initialized ${competitors.length} competitors for profile: ${profileId}`);
  }

  /**
   * Validate profile structure
   *
   * @param {Object} profile - Profile to validate
   * @throws {Error} If validation fails
   * @private
   */
  validateProfile(profile) {
    const required = ['id', 'name', 'domain', 'competitors', 'importanceBands'];

    for (const field of required) {
      if (!profile[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate importance bands
    if (!Array.isArray(profile.importanceBands) || profile.importanceBands.length === 0) {
      throw new Error('importanceBands must be a non-empty array');
    }

    // Validate competitors
    if (!Array.isArray(profile.competitors) || profile.competitors.length === 0) {
      throw new Error('competitors must be a non-empty array');
    }
  }

  /**
   * Find profile row number by ID
   *
   * @param {string} profileId - Profile identifier
   * @returns {number|null} Row number (1-indexed) or null if not found
   * @private
   */
  findProfileRow(profileId) {
    const sheet = this.profilesSheet;
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === profileId) {
        return i + 1; // Row numbers are 1-indexed
      }
    }

    return null;
  }

  /**
   * Get or create sheet by name
   *
   * @param {string} sheetName - Name of sheet
   * @returns {Sheet} Google Sheets object
   * @private
   */
  getOrCreateSheet(sheetName) {
    let sheet = this.spreadsheet.getSheetByName(sheetName);

    if (!sheet) {
      sheet = this.spreadsheet.insertSheet(sheetName);

      if (sheetName === 'Profiles') {
        sheet.appendRow([
          'Profile ID',
          'Name',
          'Domain',
          'Status',
          'Created',
          'Last Modified',
          'Config JSON'
        ]);
        this.formatHeaderRow(sheet, 7);
      }
    }

    return sheet;
  }

  /**
   * Format header row (bold, freeze)
   *
   * @param {Sheet} sheet - Sheet to format
   * @param {number} columnCount - Number of columns in header
   * @private
   */
  formatHeaderRow(sheet, columnCount) {
    const headerRange = sheet.getRange(1, 1, 1, columnCount);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#4A90E2');
    headerRange.setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
  }

  /**
   * Get profile statistics
   *
   * @param {string} profileId - Profile identifier
   * @returns {Object} Statistics object
   */
  getProfileStats(profileId) {
    const changesSheet = this.spreadsheet.getSheetByName(`Changes_${profileId}`);
    const competitorsSheet = this.spreadsheet.getSheetByName(`Competitors_${profileId}`);

    if (!changesSheet || !competitorsSheet) {
      throw new Error(`Sheets not found for profile: ${profileId}`);
    }

    const changesData = changesSheet.getDataRange().getValues();
    const competitorsData = competitorsSheet.getDataRange().getValues();

    // Count changes by importance band
    const bandCounts = {};
    for (let i = 1; i < changesData.length; i++) {
      const bandLabel = changesData[i][4]; // Band Label column
      bandCounts[bandLabel] = (bandCounts[bandLabel] || 0) + 1;
    }

    return {
      totalCompetitors: competitorsData.length - 1, // Exclude header
      totalChanges: changesData.length - 1, // Exclude header
      changesByBand: bandCounts,
      lastUpdate: new Date().toISOString()
    };
  }
}

// ============================================================================
// Global Functions (Google Apps Script Export Interface)
// ============================================================================

const profileManager = new ProfileManager();

/**
 * Save profile (global function for Google Apps Script)
 */
function saveProfile(profile) {
  return profileManager.saveProfile(profile);
}

/**
 * Load profile (global function for Google Apps Script)
 */
function loadProfile(profileId) {
  return profileManager.loadProfile(profileId);
}

/**
 * List profiles (global function for Google Apps Script)
 */
function listProfiles(status = null) {
  return profileManager.listProfiles(status);
}

/**
 * Delete profile (global function for Google Apps Script)
 */
function deleteProfile(profileId) {
  return profileManager.deleteProfile(profileId);
}

/**
 * Get profile statistics (global function for Google Apps Script)
 */
function getProfileStats(profileId) {
  return profileManager.getProfileStats(profileId);
}
