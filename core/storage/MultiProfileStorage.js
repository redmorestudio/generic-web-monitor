/**
 * MultiProfileStorage.js
 *
 * Manages per-profile data isolation and storage operations.
 * Handles baseline storage, change history tracking, and profile-specific queries.
 *
 * Features:
 * - Per-profile data isolation in separate sheets
 * - Baseline snapshot management for change detection
 * - Change history with AI analysis storage
 * - Efficient querying with time-based filters
 * - Competitor update tracking
 *
 * @requires Google Apps Script SpreadsheetApp
 * @requires ProfileManager
 */

class MultiProfileStorage {
  constructor() {
    this.spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    this.cache = CacheService.getScriptCache();
  }

  // ==========================================================================
  // Baseline Management
  // ==========================================================================

  /**
   * Save baseline snapshot for a competitor URL
   * Used for change detection on subsequent runs
   *
   * @param {string} profileId - Profile identifier
   * @param {string} companyName - Competitor company name
   * @param {string} url - URL being monitored
   * @param {string} contentHash - Hash of content for change detection
   * @param {string} rawContent - Raw HTML/text content
   * @param {Object} metadata - Additional metadata (title, description, etc.)
   */
  saveBaseline(profileId, companyName, url, contentHash, rawContent, metadata = {}) {
    const sheetName = `Baselines_${profileId}`;
    const sheet = this.getOrCreateBaselineSheet(profileId);

    const timestamp = new Date().toISOString();
    const existingRow = this.findBaselineRow(sheet, url);

    const rowData = [
      timestamp,
      companyName,
      url,
      contentHash,
      metadata.title || '',
      metadata.description || '',
      metadata.lastModified || '',
      rawContent.substring(0, 10000) // Limit content size
    ];

    if (existingRow) {
      // Update existing baseline
      sheet.getRange(existingRow, 1, 1, rowData.length).setValues([rowData]);
    } else {
      // Create new baseline
      sheet.appendRow(rowData);
    }

    Logger.log(`Baseline saved: ${companyName} - ${url}`);
  }

  /**
   * Load baseline for a URL
   *
   * @param {string} profileId - Profile identifier
   * @param {string} url - URL to load baseline for
   * @returns {Object|null} Baseline data or null if not found
   */
  loadBaseline(profileId, url) {
    const sheetName = `Baselines_${profileId}`;
    const sheet = this.spreadsheet.getSheetByName(sheetName);

    if (!sheet) {
      return null;
    }

    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][2] === url) {
        return {
          timestamp: data[i][0],
          companyName: data[i][1],
          url: data[i][2],
          contentHash: data[i][3],
          title: data[i][4],
          description: data[i][5],
          lastModified: data[i][6],
          rawContent: data[i][7]
        };
      }
    }

    return null;
  }

  /**
   * Delete baseline for a URL
   *
   * @param {string} profileId - Profile identifier
   * @param {string} url - URL to delete baseline for
   * @returns {boolean} True if deleted, false if not found
   */
  deleteBaseline(profileId, url) {
    const sheetName = `Baselines_${profileId}`;
    const sheet = this.spreadsheet.getSheetByName(sheetName);

    if (!sheet) {
      return false;
    }

    const row = this.findBaselineRow(sheet, url);
    if (row) {
      sheet.deleteRow(row);
      Logger.log(`Baseline deleted: ${url}`);
      return true;
    }

    return false;
  }

  // ==========================================================================
  // Change History Management
  // ==========================================================================

  /**
   * Save detected change with AI analysis
   *
   * @param {string} profileId - Profile identifier
   * @param {Object} change - Change object
   * @param {string} change.companyName - Competitor name
   * @param {string} change.url - URL where change detected
   * @param {number} change.score - Importance score (0-10)
   * @param {string} change.bandLabel - Importance band label
   * @param {string} change.summary - Human-readable summary
   * @param {Object} change.aiAnalysis - Full AI analysis object
   */
  saveChange(profileId, change) {
    const sheet = this.spreadsheet.getSheetByName(`Changes_${profileId}`);

    if (!sheet) {
      throw new Error(`Changes sheet not found for profile: ${profileId}`);
    }

    const timestamp = new Date().toISOString();
    const bandRange = `${change.aiAnalysis.bandMin || 0}-${change.aiAnalysis.bandMax || 10}`;

    const rowData = [
      timestamp,
      change.companyName,
      change.url,
      change.score,
      change.bandLabel,
      bandRange,
      change.summary,
      JSON.stringify(change.aiAnalysis)
    ];

    sheet.appendRow(rowData);

    // Update competitor statistics
    this.updateCompetitorStats(profileId, change.companyName);

    Logger.log(`Change saved: ${change.companyName} - Score: ${change.score}/10`);
  }

  /**
   * Load recent changes for a profile
   *
   * @param {string} profileId - Profile identifier
   * @param {Object} options - Query options
   * @param {number} options.limit - Maximum number of changes to return
   * @param {string} options.companyName - Filter by company name
   * @param {number} options.minScore - Minimum importance score
   * @param {number} options.hoursAgo - Only return changes within X hours
   * @returns {Array} Array of change objects
   */
  loadChanges(profileId, options = {}) {
    const sheet = this.spreadsheet.getSheetByName(`Changes_${profileId}`);

    if (!sheet) {
      return [];
    }

    const data = sheet.getDataRange().getValues();
    const changes = [];

    // Calculate time threshold if specified
    const timeThreshold = options.hoursAgo
      ? new Date(Date.now() - options.hoursAgo * 60 * 60 * 1000)
      : null;

    for (let i = data.length - 1; i >= 1; i--) {
      // Start from end (most recent)
      const timestamp = new Date(data[i][0]);
      const companyName = data[i][1];
      const score = data[i][3];

      // Apply filters
      if (timeThreshold && timestamp < timeThreshold) continue;
      if (options.companyName && companyName !== options.companyName) continue;
      if (options.minScore && score < options.minScore) continue;

      const change = {
        timestamp: data[i][0],
        companyName: data[i][1],
        url: data[i][2],
        score: data[i][3],
        bandLabel: data[i][4],
        bandRange: data[i][5],
        summary: data[i][6],
        aiAnalysis: JSON.parse(data[i][7])
      };

      changes.push(change);

      // Apply limit
      if (options.limit && changes.length >= options.limit) {
        break;
      }
    }

    return changes;
  }

  /**
   * Get change statistics for a profile
   *
   * @param {string} profileId - Profile identifier
   * @param {number} hoursAgo - Time window for statistics
   * @returns {Object} Statistics object
   */
  getChangeStats(profileId, hoursAgo = 24) {
    const changes = this.loadChanges(profileId, { hoursAgo });

    const stats = {
      total: changes.length,
      byBand: {},
      byCompany: {},
      averageScore: 0,
      criticalCount: 0
    };

    let totalScore = 0;

    changes.forEach(change => {
      // Count by band
      stats.byBand[change.bandLabel] = (stats.byBand[change.bandLabel] || 0) + 1;

      // Count by company
      stats.byCompany[change.companyName] = (stats.byCompany[change.companyName] || 0) + 1;

      // Track scores
      totalScore += change.score;
      if (change.score >= 9) {
        stats.criticalCount++;
      }
    });

    if (changes.length > 0) {
      stats.averageScore = (totalScore / changes.length).toFixed(2);
    }

    return stats;
  }

  // ==========================================================================
  // Competitor Tracking
  // ==========================================================================

  /**
   * Update competitor statistics after change detection
   *
   * @param {string} profileId - Profile identifier
   * @param {string} companyName - Competitor name
   * @private
   */
  updateCompetitorStats(profileId, companyName) {
    const sheet = this.spreadsheet.getSheetByName(`Competitors_${profileId}`);

    if (!sheet) {
      return;
    }

    const data = sheet.getDataRange().getValues();
    const now = new Date().toISOString();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === companyName) {
        const row = i + 1;

        // Update Last Check
        sheet.getRange(row, 4).setValue(now);

        // Increment Changes (24h)
        const current24h = data[i][5] || 0;
        sheet.getRange(row, 6).setValue(current24h + 1);

        // Increment Total Changes
        const currentTotal = data[i][6] || 0;
        sheet.getRange(row, 7).setValue(currentTotal + 1);

        // Update status
        sheet.getRange(row, 5).setValue('monitored');

        Logger.log(`Updated stats for competitor: ${companyName}`);
        return;
      }
    }
  }

  /**
   * Reset 24-hour change counters for all competitors
   * Should be called daily via trigger
   *
   * @param {string} profileId - Profile identifier
   */
  resetDailyCounters(profileId) {
    const sheet = this.spreadsheet.getSheetByName(`Competitors_${profileId}`);

    if (!sheet) {
      return;
    }

    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      // Reset Changes (24h) column to 0
      const range = sheet.getRange(2, 6, lastRow - 1, 1);
      const values = new Array(lastRow - 1).fill([0]);
      range.setValues(values);

      Logger.log(`Reset daily counters for profile: ${profileId}`);
    }
  }

  /**
   * Get competitor monitoring status
   *
   * @param {string} profileId - Profile identifier
   * @returns {Array} Array of competitor status objects
   */
  getCompetitorStatus(profileId) {
    const sheet = this.spreadsheet.getSheetByName(`Competitors_${profileId}`);

    if (!sheet) {
      return [];
    }

    const data = sheet.getDataRange().getValues();
    const competitors = [];

    for (let i = 1; i < data.length; i++) {
      competitors.push({
        company: data[i][0],
        urlCount: data[i][1],
        keywords: data[i][2],
        lastCheck: data[i][3],
        status: data[i][4],
        changes24h: data[i][5],
        totalChanges: data[i][6]
      });
    }

    return competitors;
  }

  // ==========================================================================
  // Importance Bands
  // ==========================================================================

  /**
   * Load importance bands for a profile
   *
   * @param {string} profileId - Profile identifier
   * @returns {Array} Array of importance band objects
   */
  loadImportanceBands(profileId) {
    const sheet = this.spreadsheet.getSheetByName(`ImportanceBands_${profileId}`);

    if (!sheet) {
      return [];
    }

    const data = sheet.getDataRange().getValues();
    const bands = [];

    for (let i = 1; i < data.length; i++) {
      bands.push({
        min: data[i][0],
        max: data[i][1],
        label: data[i][2],
        description: data[i][3],
        examples: JSON.parse(data[i][4])
      });
    }

    return bands;
  }

  /**
   * Get importance band for a score
   *
   * @param {string} profileId - Profile identifier
   * @param {number} score - Importance score (0-10)
   * @returns {Object|null} Matching importance band or null
   */
  getBandForScore(profileId, score) {
    const bands = this.loadImportanceBands(profileId);

    for (const band of bands) {
      if (score >= band.min && score <= band.max) {
        return band;
      }
    }

    return null;
  }

  // ==========================================================================
  // Utility Methods
  // ==========================================================================

  /**
   * Get or create baseline sheet for a profile
   *
   * @param {string} profileId - Profile identifier
   * @returns {Sheet} Google Sheets object
   * @private
   */
  getOrCreateBaselineSheet(profileId) {
    const sheetName = `Baselines_${profileId}`;
    let sheet = this.spreadsheet.getSheetByName(sheetName);

    if (!sheet) {
      sheet = this.spreadsheet.insertSheet(sheetName);
      sheet.appendRow([
        'Timestamp',
        'Company',
        'URL',
        'Content Hash',
        'Title',
        'Description',
        'Last Modified',
        'Raw Content'
      ]);

      const headerRange = sheet.getRange(1, 1, 1, 8);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#4A90E2');
      headerRange.setFontColor('#FFFFFF');
      sheet.setFrozenRows(1);

      Logger.log(`Created baseline sheet: ${sheetName}`);
    }

    return sheet;
  }

  /**
   * Find baseline row for a URL
   *
   * @param {Sheet} sheet - Baseline sheet
   * @param {string} url - URL to find
   * @returns {number|null} Row number (1-indexed) or null
   * @private
   */
  findBaselineRow(sheet, url) {
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][2] === url) {
        return i + 1;
      }
    }

    return null;
  }

  /**
   * Clean up old baseline data
   * Remove baselines older than specified days
   *
   * @param {string} profileId - Profile identifier
   * @param {number} daysOld - Delete baselines older than this many days
   */
  cleanupOldBaselines(profileId, daysOld = 30) {
    const sheetName = `Baselines_${profileId}`;
    const sheet = this.spreadsheet.getSheetByName(sheetName);

    if (!sheet) {
      return;
    }

    const threshold = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
    const data = sheet.getDataRange().getValues();
    let deletedCount = 0;

    // Delete from bottom to top to maintain row numbers
    for (let i = data.length - 1; i >= 1; i--) {
      const timestamp = new Date(data[i][0]);
      if (timestamp < threshold) {
        sheet.deleteRow(i + 1);
        deletedCount++;
      }
    }

    Logger.log(`Cleaned up ${deletedCount} old baselines for profile: ${profileId}`);
  }

  /**
   * Export profile data as JSON
   *
   * @param {string} profileId - Profile identifier
   * @returns {Object} Complete profile data export
   */
  exportProfileData(profileId) {
    return {
      profileId,
      exportedAt: new Date().toISOString(),
      competitors: this.getCompetitorStatus(profileId),
      changes: this.loadChanges(profileId, { limit: 100 }),
      importanceBands: this.loadImportanceBands(profileId),
      stats: this.getChangeStats(profileId, 24)
    };
  }
}

// ============================================================================
// Global Functions (Google Apps Script Export Interface)
// ============================================================================

const multiProfileStorage = new MultiProfileStorage();

/**
 * Save baseline (global function)
 */
function saveBaseline(profileId, companyName, url, contentHash, rawContent, metadata) {
  return multiProfileStorage.saveBaseline(profileId, companyName, url, contentHash, rawContent, metadata);
}

/**
 * Load baseline (global function)
 */
function loadBaseline(profileId, url) {
  return multiProfileStorage.loadBaseline(profileId, url);
}

/**
 * Save change (global function)
 */
function saveChange(profileId, change) {
  return multiProfileStorage.saveChange(profileId, change);
}

/**
 * Load changes (global function)
 */
function loadChanges(profileId, options) {
  return multiProfileStorage.loadChanges(profileId, options);
}

/**
 * Get change statistics (global function)
 */
function getChangeStats(profileId, hoursAgo) {
  return multiProfileStorage.getChangeStats(profileId, hoursAgo);
}

/**
 * Get competitor status (global function)
 */
function getCompetitorStatus(profileId) {
  return multiProfileStorage.getCompetitorStatus(profileId);
}

/**
 * Reset daily counters (global function)
 */
function resetDailyCounters(profileId) {
  return multiProfileStorage.resetDailyCounters(profileId);
}

/**
 * Load importance bands (global function)
 */
function loadImportanceBands(profileId) {
  return multiProfileStorage.loadImportanceBands(profileId);
}

/**
 * Get band for score (global function)
 */
function getBandForScore(profileId, score) {
  return multiProfileStorage.getBandForScore(profileId, score);
}

/**
 * Export profile data (global function)
 */
function exportProfileData(profileId) {
  return multiProfileStorage.exportProfileData(profileId);
}

/**
 * Cleanup old baselines (global function)
 */
function cleanupOldBaselines(profileId, daysOld) {
  return multiProfileStorage.cleanupOldBaselines(profileId, daysOld);
}
