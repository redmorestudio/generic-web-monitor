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

// Load data from GitHub Actions Backend API
async function loadData() {
    try {
        const response = await fetch(`${CONFIG.apiUrl}/dashboard`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        
        // Update global state with new backend format
        allCompanies = data.company_activity || [];
        allUpdates = data.recent_alerts || [];
        
        // Check if we have data but no companies
        if (allCompanies.length === 0) {
            showEmptyDataError();
            return;
        }
        
        // Update UI with new data format
        updateStats(data.stats);
        displayActivityFeed(allUpdates);
        displayCompanies(allCompanies);
        
    } catch (error) {
        console.error('Error loading data:', error);
        showError('Failed to connect to the GitHub Actions backend. Please check the server is running.');
    }
}

// Show initialization error with helpful instructions
function showInitializationError() {
    const feed = document.getElementById('activity-feed');
    const grid = document.getElementById('companies-grid');
    
    const errorHtml = `
        <div class="error-message" style="background: #1a1a1a; border: 1px solid #ff4444; border-radius: 8px; padding: 20px;">
            <h3 style="color: #ff4444; margin-top: 0;">⚠️ System Not Initialized</h3>
            <p>The monitoring system needs to be set up before it can display data.</p>
            <p style="margin-top: 15px;"><strong>To initialize the system:</strong></p>
            <ol style="margin-left: 20px;">
                <li>Open the <a href="manual-check.html" style="color: #00ff88;">Manual Check Tool</a></li>
                <li>Click "Initialize Spreadsheet" to create the database</li>
                <li>Click "Run Full Check" to populate company data</li>
                <li>Return here and refresh the page</li>
            </ol>
            <p style="margin-top: 15px;">
                <a href="manual-check.html" class="button" style="display: inline-block; background: #00ff88; color: #000; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 600;">
                    Open Manual Check Tool →
                </a>
            </p>
        </div>
    `;
    
    feed.innerHTML = errorHtml;
    grid.innerHTML = errorHtml;
}

// Show empty data error
function showEmptyDataError() {
    const feed = document.getElementById('activity-feed');
    const grid = document.getElementById('companies-grid');
    
    const errorHtml = `
        <div class="error-message" style="background: #1a1a1a; border: 1px solid #ffaa44; border-radius: 8px; padding: 20px;">
            <h3 style="color: #ffaa44; margin-top: 0;">📊 No Data Available</h3>
            <p>The system is initialized but no company data has been collected yet.</p>
            <p style="margin-top: 15px;">
                <a href="manual-check.html" class="button" style="display: inline-block; background: #00ff88; color: #000; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 600;">
                    Run Company Check →
                </a>
            </p>
        </div>
    `;
    
    feed.innerHTML = errorHtml;
    grid.innerHTML = errorHtml;
}

// Update header statistics
function updateStats(stats) {
    if (!stats) return;
    
    document.getElementById('total-companies').textContent = stats.companies || '--';
    document.getElementById('total-updates').textContent = stats.recent_changes || '--';
    
    // Use current time as last check since our backend is real-time
    const timeAgo = 'just now';
    document.getElementById('last-check').textContent = timeAgo;
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
        const changeCount = company.change_count || 0;
        const avgRelevance = company.avg_relevance || 'N/A';
        const status = changeCount > 0 ? 'Active' : 'Monitored';
        const statusClass = changeCount > 0 ? 'active' : 'inactive';
        
        return `
            <div class="company-card">
                <div class="company-header">
                    <div class="company-name">${company.name}</div>
                    <div class="company-category">AI/Marketing</div>
                </div>
                <div class="company-status">
                    <div class="status-indicator ${statusClass}"></div>
                    <span class="status-text">${status}</span>
                </div>
                <div class="company-details">
                    <div>Recent changes: ${changeCount}</div>
                    <div>Avg relevance: ${avgRelevance}</div>
                    <div>Last checked: just now</div>
                </div>
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