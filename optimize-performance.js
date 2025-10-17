#!/usr/bin/env node

/**
 * Performance Optimization Script
 * 
 * Implements quick performance wins for the AI Monitor dashboard
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Paths
const PROJECT_ROOT = path.join(__dirname, '..');
const API_DATA_DIR = path.join(PROJECT_ROOT, 'api-data');

// 1. Add performance hints to HTML files
function addPerformanceHints() {
    console.log('🚀 Adding performance hints to HTML files...');
    
    const htmlFiles = [
        'index.html',
        'manage-companies.html',
        '3d-force-graph-local.html',
        'index-enhanced-ui.html'
    ];
    
    htmlFiles.forEach(file => {
        const filePath = path.join(PROJECT_ROOT, file);
        if (fs.existsSync(filePath)) {
            let content = fs.readFileSync(filePath, 'utf8');
            
            // Add preconnect hints
            if (!content.includes('rel="preconnect"')) {
                const preconnectHints = `
    <!-- Performance: Preconnect to external domains -->
    <link rel="preconnect" href="https://cdnjs.cloudflare.com">
    <link rel="dns-prefetch" href="https://cdnjs.cloudflare.com">`;
                
                content = content.replace('</head>', `${preconnectHints}\n</head>`);
            }
            
            // Add resource hints for critical resources
            if (!content.includes('rel="preload"') && file === 'index.html') {
                const preloadHints = `
    <!-- Performance: Preload critical resources -->
    <link rel="preload" href="api-data/dashboard.json" as="fetch" crossorigin>
    <link rel="preload" href="api-data/workflow-status.json" as="fetch" crossorigin>`;
                
                content = content.replace('</head>', `${preloadHints}\n</head>`);
            }
            
            fs.writeFileSync(filePath, content);
            console.log(`✅ Updated ${file}`);
        }
    });
}

// 2. Add debouncing to search functionality
function addSearchDebouncing() {
    console.log('🔍 Adding debouncing to search inputs...');
    
    const debounceCode = `
// Debounce function for better search performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}`;

    // Update manage-companies.html
    const manageCompaniesPath = path.join(PROJECT_ROOT, 'manage-companies.html');
    if (fs.existsSync(manageCompaniesPath)) {
        let content = fs.readFileSync(manageCompaniesPath, 'utf8');
        
        if (!content.includes('debounce')) {
            // Add debounce function
            content = content.replace(
                '// State management',
                `${debounceCode}\n\n        // State management`
            );
            
            // Update search event listener to use debounced version
            content = content.replace(
                "searchInput.addEventListener('input', (e) => {",
                "searchInput.addEventListener('input', debounce((e) => {"
            );
            
            content = content.replace(
                'renderCompanies();\n        });',
                'renderCompanies();\n        }, 300));'
            );
            
            fs.writeFileSync(manageCompaniesPath, content);
            console.log('✅ Added debouncing to manage-companies.html');
        }
    }
}

// 3. Create a performance monitoring script
function createPerfMonitor() {
    console.log('📊 Creating performance monitoring script...');
    
    const perfMonitorScript = `// Performance Monitoring Module
(function() {
    'use strict';
    
    // Only run in production
    if (window.location.hostname !== 'redmorestudio.github.io') return;
    
    // Navigation Timing API
    window.addEventListener('load', function() {
        setTimeout(function() {
            const perfData = performance.getEntriesByType('navigation')[0];
            
            const metrics = {
                // Page load metrics
                dns: perfData.domainLookupEnd - perfData.domainLookupStart,
                tcp: perfData.connectEnd - perfData.connectStart,
                request: perfData.responseStart - perfData.requestStart,
                response: perfData.responseEnd - perfData.responseStart,
                dom: perfData.domComplete - perfData.domLoading,
                load: perfData.loadEventEnd - perfData.loadEventStart,
                total: perfData.loadEventEnd - perfData.fetchStart,
                
                // Core Web Vitals (if available)
                fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
                lcp: 0, // Will be updated by observer
                cls: 0, // Will be updated by observer
                fid: 0, // Will be updated by observer
                
                // Custom metrics
                apiLoadTime: window.apiLoadTime || 0,
                timestamp: new Date().toISOString()
            };
            
            // Log to console in dev
            console.log('Performance Metrics:', metrics);
            
            // In production, you could send this to an analytics service
            // Example: sendToAnalytics(metrics);
            
        }, 1000);
    });
    
    // Largest Contentful Paint
    try {
        const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            window.lcpTime = lastEntry.startTime;
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
        // LCP not supported
    }
    
    // Cumulative Layout Shift
    try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                    window.clsValue = clsValue;
                }
            }
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
        // CLS not supported
    }
    
    // First Input Delay
    try {
        const fidObserver = new PerformanceObserver((list) => {
            const firstInput = list.getEntries()[0];
            window.fidValue = firstInput.processingStart - firstInput.startTime;
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
        // FID not supported
    }
    
    // API Load Time Tracking
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        const startTime = performance.now();
        return originalFetch.apply(this, args).then(response => {
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            // Track API calls
            if (args[0].includes('api-data/')) {
                window.apiLoadTime = Math.max(window.apiLoadTime || 0, duration);
                console.log(\`API Load: \${args[0]} - \${duration.toFixed(2)}ms\`);
            }
            
            return response;
        });
    };
})();
`;

    const perfPath = path.join(PROJECT_ROOT, 'performance-monitor.js');
    fs.writeFileSync(perfPath, perfMonitorScript);
    console.log('✅ Created performance-monitor.js');
}

// 4. Add lazy loading for 3D graph
function addLazyLoading() {
    console.log('💤 Adding lazy loading for 3D Force Graph...');
    
    const indexPath = path.join(PROJECT_ROOT, 'index.html');
    if (fs.existsSync(indexPath)) {
        let content = fs.readFileSync(indexPath, 'utf8');
        
        // Add lazy loading function
        const lazyLoadScript = `
        // Lazy load 3D Force Graph
        let graphLoaded = false;
        function load3DGraph() {
            if (!graphLoaded) {
                graphLoaded = true;
                const iframe = document.createElement('iframe');
                iframe.src = '3d-force-graph-complete.html';
                iframe.style.width = '100%';
                iframe.style.height = '600px';
                iframe.style.border = 'none';
                iframe.style.borderRadius = '12px';
                
                const container = document.getElementById('3d-graph-container');
                if (container) {
                    container.innerHTML = '';
                    container.appendChild(iframe);
                }
            }
        }`;
        
        if (!content.includes('load3DGraph')) {
            content = content.replace(
                '// Initialize when DOM is loaded',
                `${lazyLoadScript}\n\n        // Initialize when DOM is loaded`
            );
            
            console.log('✅ Added lazy loading for 3D graph');
        }
        
        fs.writeFileSync(indexPath, content);
    }
}

// 5. Create .htaccess for better caching (GitHub Pages doesn't support, but good for other deployments)
function createHtaccess() {
    console.log('📝 Creating .htaccess for caching rules...');
    
    const htaccessContent = `# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/css application/javascript application/json
</IfModule>

# Browser caching
<IfModule mod_expires.c>
    ExpiresActive On
    
    # HTML - 1 hour
    ExpiresByType text/html "access plus 1 hour"
    
    # CSS and JavaScript - 1 week
    ExpiresByType text/css "access plus 1 week"
    ExpiresByType application/javascript "access plus 1 week"
    
    # Images - 1 month
    ExpiresByType image/jpeg "access plus 1 month"
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType image/svg+xml "access plus 1 month"
    
    # JSON data - 5 minutes
    ExpiresByType application/json "access plus 5 minutes"
</IfModule>

# CORS headers for API data
<FilesMatch "\.(json)$">
    Header set Access-Control-Allow-Origin "*"
    Header set Cache-Control "public, max-age=300"
</FilesMatch>
`;

    fs.writeFileSync(path.join(PROJECT_ROOT, '.htaccess'), htaccessContent);
    console.log('✅ Created .htaccess file');
}

// 6. Optimize images (create WebP versions)
function createImageOptimizationGuide() {
    console.log('📸 Creating image optimization guide...');
    
    const guideContent = `# Image Optimization Guide

## Current Images
- favicon.ico (16x16, 32x32)
- favicon.svg (vector)

## Optimization Steps

### 1. Convert ICO to PNG
\`\`\`bash
# Convert favicon.ico to PNG
convert favicon.ico favicon.png
\`\`\`

### 2. Create WebP versions
\`\`\`bash
# Install cwebp if not available
# brew install webp

# Convert to WebP
cwebp -q 80 favicon.png -o favicon.webp
\`\`\`

### 3. Update HTML to use WebP with fallback
\`\`\`html
<picture>
    <source srcset="favicon.webp" type="image/webp">
    <img src="favicon.png" alt="AI Monitor">
</picture>
\`\`\`

### 4. Optimize SVG
\`\`\`bash
# Install svgo if not available
# npm install -g svgo

# Optimize SVG
svgo favicon.svg -o favicon.min.svg
\`\`\`

## Future Image Additions
When adding new images:
1. Always provide WebP version
2. Use responsive images with srcset
3. Add loading="lazy" for below-fold images
4. Compress with appropriate quality (80-85% for photos)
`;

    fs.writeFileSync(path.join(PROJECT_ROOT, 'image-optimization-guide.md'), guideContent);
    console.log('✅ Created image optimization guide');
}

// Main function
function main() {
    console.log('🚀 Starting performance optimizations...\n');
    
    // Run all optimizations
    addPerformanceHints();
    addSearchDebouncing();
    createPerfMonitor();
    addLazyLoading();
    createHtaccess();
    createImageOptimizationGuide();
    
    console.log('\n✅ Performance optimizations complete!');
    console.log('\n📝 Next steps:');
    console.log('1. Add <script src="performance-monitor.js"></script> to HTML files');
    console.log('2. Test debounced search functionality');
    console.log('3. Verify lazy loading works for 3D graph');
    console.log('4. Deploy and monitor performance metrics');
}

// Run optimizations
main();
