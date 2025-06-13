// AI Competitor Monitor - Dashboard Script

// State
let allCompanies = [];
let allUpdates = [];
let currentFilter = 'all';

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setupFilters();
    // Refresh every 5 minutes
    setInterval(loadData, 5 * 60 * 1000);
});

// Load data from API
async function loadData() {
    try {
        const response = await fetch(`${CONFIG.apiUrl}?function=getLatestData`);
        const data = await response.json();
        
        if (data.error) {
            showError('Failed to load data: ' + data.error);
            return;
        }
        
        // Update global state
        allCompanies = data.companies || [];
        allUpdates = data.recentUpdates || [];
        
        // Update UI
        updateStats(data);
        displayActivityFeed(allUpdates);
        displayCompanies(allCompanies);
        
    } catch (error) {
        console.error('Error loading data:', error);
        showError('Failed to connect to the monitoring system. Please check your configuration.');
    }
}

// Update header statistics
function updateStats(data) {
    document.getElementById('total-companies').textContent = allCompanies.length;
    document.getElementById('total-updates').textContent = allUpdates.length;
    
    if (data.lastCheck) {
        const lastCheck = new Date(data.lastCheck);
        const timeAgo = getTimeAgo(lastCheck);
        document.getElementById('last-check').textContent = timeAgo;
    }
}

// Display activity feed
function displayActivityFeed(updates) {
    const feed = document.getElementById('activity-feed');
    
    if (updates.length === 0) {
        feed.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <p>No updates detected yet</p>
                <p style="font-size: 14px; margin-top: 8px;">Updates will appear here when companies make changes</p>
            </div>
        `;
        return;
    }
    
    feed.innerHTML = updates.map(update => {
        const date = new Date(update.date);
        const timeAgo = getTimeAgo(date);
        
        return `
            <div class="activity-item update">
                <div class="activity-time">${timeAgo}</div>
                <div class="activity-company">${update.company}</div>
                <div class="activity-description">${update.description || 'Content update detected'}</div>
                ${update.url ? `<a href="${update.url}" target="_blank" class="activity-link">View →</a>` : ''}
            </div>
        `;
    }).join('');
}

// Display companies grid
function displayCompanies(companies) {
    const grid = document.getElementById('companies-grid');
    
    // Filter companies if needed
    let filteredCompanies = companies;
    if (currentFilter !== 'all') {
        filteredCompanies = companies.filter(c => c.category === currentFilter);
    }
    
    if (filteredCompanies.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <p>No companies found</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = filteredCompanies.map(company => {
        const lastChecked = company.lastChecked ? new Date(company.lastChecked) : null;
        const lastChange = company.lastChange ? new Date(company.lastChange) : null;
        const status = company.status || 'Not checked';
        const statusClass = status === 'Active' ? 'active' : status === 'Error' ? 'error' : 'inactive';
        
        return `
            <div class="company-card">
                <div class="company-header">
                    <div class="company-name">${company.name}</div>
                    <div class="company-category">${company.category}</div>
                </div>
                <div class="company-status">
                    <div class="status-indicator ${statusClass}"></div>
                    <span class="status-text">${status}</span>
                </div>
                <div class="company-details">
                    ${lastChecked ? `<div>Last checked: ${getTimeAgo(lastChecked)}</div>` : '<div>Never checked</div>'}
                    ${lastChange ? `<div>Last change: ${getTimeAgo(lastChange)}</div>` : '<div>No changes detected</div>'}
                </div>
                ${company.url ? `<a href="${company.url}" target="_blank" class="company-link">Visit website →</a>` : ''}
            </div>
        `;
    }).join('');
}

// Setup filter tabs
function setupFilters() {
    const tabs = document.querySelectorAll('.filter-tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active state
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Update filter and redisplay
            currentFilter = tab.dataset.filter;
            displayCompanies(allCompanies);
        });
    });
}

// Utility function to get relative time
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    const intervals = [
        { label: 'year', seconds: 31536000 },
        { label: 'month', seconds: 2592000 },
        { label: 'week', seconds: 604800 },
        { label: 'day', seconds: 86400 },
        { label: 'hour', seconds: 3600 },
        { label: 'minute', seconds: 60 },
        { label: 'second', seconds: 1 }
    ];
    
    for (const interval of intervals) {
        const count = Math.floor(seconds / interval.seconds);
        if (count > 0) {
            return count === 1 ? `${count} ${interval.label} ago` : `${count} ${interval.label}s ago`;
        }
    }
    
    return 'just now';
}

// Show error message
function showError(message) {
    const feed = document.getElementById('activity-feed');
    const grid = document.getElementById('companies-grid');
    
    const errorHtml = `
        <div class="error-message">
            <strong>Error:</strong> ${message}
        </div>
    `;
    
    feed.innerHTML = errorHtml;
    grid.innerHTML = errorHtml;
}

// Trigger manual check (for future enhancement)
function triggerCheck() {
    // This could call the checkAllCompanies function via API
    console.log('Manual check triggered');
}