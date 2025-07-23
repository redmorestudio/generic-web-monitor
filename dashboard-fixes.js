// Dashboard fixes for AI Monitor - July 22, 2025

// Fixed loadRecentChanges function that properly displays AI summaries
async function loadRecentChanges() {
    const data = await loadStaticData('changes.json');
    const changesDiv = document.getElementById('recentChanges');

    if (data.error || !data.changes || data.changes.length === 0) {
        changesDiv.innerHTML = `
            <h3 style="margin: 0 0 15px 0; color: var(--primary-color);">📈 Recent Changes</h3>
            <div class="error-message">No recent changes detected.</div>
        `;
        return;
    }

    // Filter to only show changes with interest level >= 3
    const significantChanges = data.changes.filter(c => c.interest_level >= 3);
    const recentChanges = significantChanges.slice(0, 3); // Show top 3
    let html = ``;

    recentChanges.forEach((change, index) => {
        // Parse AI analysis if it's a string
        let aiAnalysis = null;
        if (change.ai_analysis) {
            try {
                aiAnalysis = typeof change.ai_analysis === 'string' 
                    ? JSON.parse(change.ai_analysis) 
                    : change.ai_analysis;
            } catch (e) {
                console.error('Failed to parse AI analysis:', e);
            }
        }

        // Use AI summary if available, otherwise fall back to regular summary
        const displaySummary = aiAnalysis?.summary || change.summary || 'No summary available';
        
        // Determine time display
        const timeDisplay = change.time_ago || (change.detected_at ? formatTimeAgo(new Date(change.detected_at)) : 'Unknown');

        const changeId = change.id || change.change_id || `change-${index}`;
        html += `
            <div class="change-item" style="background: rgba(59, 130, 246, 0.1); padding: 15px; border-radius: 10px; margin-bottom: 10px; border-left: 4px solid ${getInterestColor(change.interest_level)}; cursor: pointer;" 
                 onclick="showChangeDetail.call(this, '${changeId}', event)" data-change='${JSON.stringify(change).replace(/'/g, "&apos;")}'>
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                    <span style="font-size: 1.5rem;">${getInterestEmoji(change.interest_level)}</span>
                    <span style="font-weight: bold; color: #93c5fd;">${escapeHtml(change.company)}</span>
                    <span style="color: #6b7280; font-size: 0.85rem;">${timeDisplay}</span>
                </div>
                <div style="color: #d1d5db; font-size: 0.9rem; line-height: 1.4;">
                    ${escapeHtml(displaySummary.substring(0, 200))}${displaySummary.length > 200 ? '...' : ''}
                </div>
                ${change.interest_level ? `
                    <div style="margin-top: 8px; display: flex; align-items: center; gap: 10px;">
                        <span style="background: rgba(59, 130, 246, 0.2); color: #60a5fa; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem;">
                            Interest: ${change.interest_level}/10
                        </span>
                        ${aiAnalysis?.category ? `
                            <span style="background: rgba(16, 185, 129, 0.2); color: #34d399; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem;">
                                ${escapeHtml(aiAnalysis.category)}
                            </span>
                        ` : ''}
                    </div>
                ` : ''}
            </div>
        `;
    });

    changesDiv.innerHTML = html;
}

// Helper function to get interest level color
function getInterestColor(level) {
    if (level >= 8) return '#FFD700'; // Gold for high interest
    if (level >= 5) return '#87CEEB'; // Sky blue for medium
    return '#6bcf7f'; // Green for low
}

// Helper function to get interest level emoji
function getInterestEmoji(level) {
    if (level >= 8) return '🌟'; // Star for high interest
    if (level >= 5) return '📌'; // Pin for medium
    return '📊'; // Chart for low
}

// Fixed showChangeDetail function that properly displays AI analysis
async function showChangeDetail(changeIdOrElement, event) {
    let changeData;
    
    // Handle different calling patterns
    if (typeof changeIdOrElement === 'string' || typeof changeIdOrElement === 'number') {
        const changeId = changeIdOrElement;
        
        // Try to find the change in recent changes
        if (window.dashboardData && window.dashboardData.changes) {
            changeData = window.dashboardData.changes.find(c => 
                (c.id == changeId || c.change_id == changeId)
            );
        }
        
        // If not found in dashboard data, try changes.json
        if (!changeData && window.changesData && window.changesData.changes) {
            changeData = window.changesData.changes.find(c => 
                (c.id == changeId || c.change_id == changeId)
            );
        }
        
        // If still not found, create minimal data
        if (!changeData) {
            changeData = {
                id: changeId,
                change_id: changeId,
                company: 'Loading...',
                url: '#'
            };
        }
    } else {
        // Called with element context
        const clickedElement = this || changeIdOrElement;
        const dataAttr = clickedElement.getAttribute('data-change');
        if (dataAttr) {
            changeData = JSON.parse(dataAttr);
        } else {
            console.error('No data-change attribute found');
            return;
        }
    }
    
    if (event) {
        event.stopPropagation();
    }
    
    const modal = document.getElementById('companyModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');
    
    modalTitle.textContent = `Change Details: ${changeData.company}`;
    
    // Parse AI analysis if available
    let aiAnalysis = null;
    if (changeData.ai_analysis) {
        try {
            aiAnalysis = typeof changeData.ai_analysis === 'string' 
                ? JSON.parse(changeData.ai_analysis) 
                : changeData.ai_analysis;
        } catch (e) {
            console.error('Failed to parse AI analysis:', e);
        }
    }

    // Display the change details with AI analysis
    modalContent.innerHTML = `
        <div class="config-section">
            <h4>📊 Change Information</h4>
            <p><strong>Company:</strong> ${escapeHtml(changeData.company)}</p>
            <p><strong>URL:</strong> ${changeData.url ? `<a href="${escapeHtml(changeData.url)}" target="_blank">${escapeHtml(changeData.url)}</a>` : 'Not available'}</p>
            <p><strong>Type:</strong> ${escapeHtml(changeData.category || 'Content Update')}</p>
            <p><strong>Detected:</strong> ${changeData.detected_at ? new Date(changeData.detected_at).toLocaleString() : 'Unknown'}</p>
            <p><strong>Interest Level:</strong> ${changeData.interest_level}/10 ${getInterestEmoji(changeData.interest_level)}</p>
        </div>
        
        ${aiAnalysis ? `
            <div class="config-section">
                <h4>🤖 AI Analysis Summary</h4>
                <p>${escapeHtml(aiAnalysis.summary)}</p>
            </div>
            
            ${aiAnalysis.interest_drivers && aiAnalysis.interest_drivers.length > 0 ? `
                <div class="config-section">
                    <h4>🎯 Key Interest Drivers</h4>
                    <div style="margin-top: 10px;">
                        ${aiAnalysis.interest_drivers.map(driver => `
                            <span style="background: rgba(59, 130, 246, 0.2); color: #60a5fa; padding: 4px 12px; border-radius: 16px; font-size: 0.85rem; margin-right: 8px; display: inline-block; margin-bottom: 5px;">
                                ${escapeHtml(driver)}
                            </span>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${aiAnalysis.impact_areas && aiAnalysis.impact_areas.length > 0 ? `
                <div class="config-section">
                    <h4>💼 Impact Areas</h4>
                    <ul style="margin: 0; padding-left: 20px;">
                        ${aiAnalysis.impact_areas.map(area => `<li>${escapeHtml(area)}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            
            <div class="config-section">
                <h4>📈 Analysis Scores</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div style="background: #1e293b; padding: 15px; border-radius: 8px;">
                        <h5 style="margin: 0 0 5px 0; color: #94a3b8;">Technical Innovation</h5>
                        <div style="font-size: 1.5rem; color: #60a5fa;">${aiAnalysis.technical_innovation_score || 0}/10</div>
                    </div>
                    <div style="background: #1e293b; padding: 15px; border-radius: 8px;">
                        <h5 style="margin: 0 0 5px 0; color: #94a3b8;">Business Impact</h5>
                        <div style="font-size: 1.5rem; color: #34d399;">${aiAnalysis.business_impact_score || 0}/10</div>
                    </div>
                </div>
            </div>
            
            ${aiAnalysis.category ? `
                <div class="config-section">
                    <h4>📁 Category</h4>
                    <p>${escapeHtml(aiAnalysis.category)}</p>
                </div>
            ` : ''}
        ` : `
            <div class="config-section">
                <h4>📝 Summary</h4>
                <p>${escapeHtml(changeData.summary || 'No summary available')}</p>
            </div>
        `}
        
        <div class="action-buttons" style="margin-top: 20px;">
            ${changeData.url ? `<a href="${escapeHtml(changeData.url)}" target="_blank" class="button button-primary">View Current Page</a>` : ''}
            <button type="button" class="button button-secondary" onclick="closeModal()">Close</button>
        </div>
    `;
    
    modal.style.display = 'block';
    
    // Optionally try to load more detailed data
    if (changeData.id || changeData.change_id) {
        const changeId = changeData.id || changeData.change_id;
        fetch(`${CONFIG.apiBaseUrl}/changes/change-${changeId}.json?t=${Date.now()}`)
            .then(response => response.json())
            .then(detailData => {
                // Update modal with additional details if available
                console.log('Loaded additional change details:', detailData);
            })
            .catch(error => {
                console.log('No additional details available');
            });
    }
}
