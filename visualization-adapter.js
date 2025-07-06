/**
 * Visualization Adapter for AI Competitive Monitor
 * 
 * Provides a unified interface for multiple visualization frontends
 * (TheBrain, 3D Force Graph, etc.) to access the same monitoring data
 */

class VisualizationAdapter {
    constructor(dataPath = './api-data') {
        this.dataPath = dataPath;
        this.cache = new Map();
        this.lastFetch = 0;
        this.cacheTimeout = 60000; // 1 minute cache
    }

    /**
     * Fetch and cache data from API files
     */
    async fetchData(forceRefresh = false) {
        const now = Date.now();
        if (!forceRefresh && this.lastFetch && (now - this.lastFetch) < this.cacheTimeout) {
            return this.cache;
        }

        try {
            const [dashboard, companies, changes, extracted] = await Promise.all([
                fetch(`${this.dataPath}/dashboard.json`).then(r => r.json()),
                fetch(`${this.dataPath}/companies.json`).then(r => r.json()),
                fetch(`${this.dataPath}/changes.json`).then(r => r.json()),
                fetch(`${this.dataPath}/extracted-data.json`).then(r => r.json()).catch(() => ({}))
            ]);

            this.cache.set('dashboard', dashboard);
            this.cache.set('companies', companies);
            this.cache.set('changes', changes);
            this.cache.set('extracted', extracted);
            this.lastFetch = now;

            return this.cache;
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    }

    /**
     * Get unified graph data structure
     */
    async getGraphData(options = {}) {
        await this.fetchData(options.forceRefresh);
        
        const dashboard = this.cache.get('dashboard');
        const changes = this.cache.get('changes');
        
        const nodes = [];
        const links = [];
        const metadata = {
            stats: dashboard.stats,
            lastUpdate: new Date().toISOString(),
            viewModes: ['companies', 'technologies', 'concepts', 'changes', 'products', 'partners']
        };

        // Build nodes and links based on requested view
        switch (options.view || 'companies') {
            case 'companies':
                this._buildCompanyGraph(nodes, links, dashboard);
                break;
            case 'technologies':
                this._buildTechnologyGraph(nodes, links, dashboard);
                break;
            case 'concepts':
                this._buildConceptGraph(nodes, links, dashboard);
                break;
            case 'changes':
                this._buildChangeGraph(nodes, links, dashboard, changes);
                break;
            case 'products':
                this._buildProductGraph(nodes, links, dashboard);
                break;
            case 'partners':
                this._buildPartnerGraph(nodes, links, dashboard);
                break;
            default:
                this._buildCompanyGraph(nodes, links, dashboard);
        }

        return { nodes, links, metadata };
    }

    /**
     * Transform to TheBrain format
     */
    async toTheBrainFormat(options = {}) {
        const graphData = await this.getGraphData(options);
        const thoughts = [];
        const thoughtLinks = [];
        const thoughtMap = new Map();

        // Convert nodes to thoughts
        graphData.nodes.forEach(node => {
            const thought = {
                name: node.name,
                id: node.id,
                kind: this._getTheBrainKind(node.type),
                label: node.label || node.type,
                foregroundColor: node.color,
                backgroundColor: this._getLighterColor(node.color),
                acType: 0, // Public
                typeId: this._getTheBrainTypeId(node.type)
            };
            
            thoughts.push(thought);
            thoughtMap.set(node.id, thought);
        });

        // Convert links to TheBrain links
        graphData.links.forEach(link => {
            const thoughtLink = {
                thoughtIdA: link.source,
                thoughtIdB: link.target,
                relation: this._getTheBrainRelation(link.type),
                name: link.label,
                color: link.color || '#6fbf6f',
                thickness: link.weight || 1,
                direction: link.directed ? 1 : 0
            };
            thoughtLinks.push(thoughtLink);
        });

        return {
            thoughts,
            links: thoughtLinks,
            metadata: graphData.metadata
        };
    }

    /**
     * Transform to 3D Force Graph format
     */
    async to3DForceFormat(options = {}) {
        const graphData = await this.getGraphData(options);
        
        // Enhance for 3D visualization
        const enhanced = {
            nodes: graphData.nodes.map(node => ({
                ...node,
                val: node.size || this._calculateNodeSize(node),
                color: node.color || this._getNodeColor(node),
                label: `${node.name}\n${node.type}`,
                fx: node.fixed ? node.x : undefined,
                fy: node.fixed ? node.y : undefined,
                fz: node.fixed ? node.z : undefined
            })),
            links: graphData.links.map(link => ({
                ...link,
                width: link.weight || 0.5,
                color: link.color || '#666666',
                particles: link.active ? 4 : (link.recent ? 2 : 0),
                curvature: link.curved ? 0.3 : 0,
                opacity: link.strength || 0.3
            }))
        };

        // Add particle system configuration
        enhanced.particleConfig = {
            speed: 0.003,
            width: 2,
            color: node => node.particleColor || '#ffffff'
        };

        return enhanced;
    }

    /**
     * Build company-centric graph
     */
    _buildCompanyGraph(nodes, links, dashboard) {
        const nodeMap = new Map();
        
        // Create company nodes
        dashboard.company_activity.forEach(company => {
            const node = {
                id: company.company,
                name: company.company,
                type: 'company',
                subtype: company.type,
                size: company.url_count * 5,
                color: this._getCompanyColor(company.type),
                threatLevel: company.intelligence.threat_level,
                data: company
            };
            nodes.push(node);
            nodeMap.set(company.company, node);
        });

        // Create technology connections
        const techConnections = this._findConnections(
            dashboard.company_activity,
            'technologies'
        );

        this._createConnectionLinks(techConnections, links, 'technology');

        // Create AI concept connections
        const conceptConnections = this._findConnections(
            dashboard.company_activity,
            'ai_ml_concepts'
        );

        // Add concept nodes for heavily shared concepts
        conceptConnections.forEach((companies, concept) => {
            if (companies.length > 2) {
                const conceptNode = {
                    id: `concept-${concept}`,
                    name: concept,
                    type: 'concept',
                    size: companies.length * 3,
                    color: '#00ff88'
                };
                nodes.push(conceptNode);

                companies.forEach(company => {
                    links.push({
                        source: company,
                        target: conceptNode.id,
                        type: 'uses_concept',
                        label: 'uses',
                        weight: 1,
                        recent: true
                    });
                });
            }
        });
    }

    /**
     * Build technology-centric graph
     */
    _buildTechnologyGraph(nodes, links, dashboard) {
        const techMap = new Map();
        
        // Extract all technologies
        dashboard.company_activity.forEach(company => {
            company.intelligence.technologies.forEach(tech => {
                if (!techMap.has(tech)) {
                    techMap.set(tech, {
                        id: `tech-${tech}`,
                        name: tech,
                        type: 'technology',
                        companies: [],
                        size: 5
                    });
                }
                techMap.get(tech).companies.push(company.company);
                techMap.get(tech).size += 2;
            });
        });

        // Add technology nodes
        techMap.forEach(tech => {
            nodes.push(tech);
        });

        // Add company nodes
        dashboard.company_activity.forEach(company => {
            nodes.push({
                id: company.company,
                name: company.company,
                type: 'company',
                subtype: company.type,
                size: 3,
                color: this._getCompanyColor(company.type)
            });
        });

        // Create links
        techMap.forEach(tech => {
            tech.companies.forEach(company => {
                links.push({
                    source: tech.id,
                    target: company,
                    type: 'used_by',
                    weight: 1
                });
            });
        });
    }

    /**
     * Build change-centric graph for recent updates
     */
    _buildChangeGraph(nodes, links, dashboard, changes) {
        // Create time-based nodes
        const timeNodes = new Map();
        const now = new Date();
        
        // Group changes by time period
        const periods = ['today', 'yesterday', 'this_week', 'this_month'];
        periods.forEach(period => {
            const node = {
                id: `time-${period}`,
                name: this._getPeriodLabel(period),
                type: 'time_period',
                size: 10,
                color: '#ffd700',
                fixed: true,
                x: this._getTimeNodePosition(period).x,
                y: this._getTimeNodePosition(period).y,
                z: 0
            };
            nodes.push(node);
            timeNodes.set(period, node);
        });

        // Add companies with recent changes
        if (changes && changes.recent_changes) {
            changes.recent_changes.forEach(change => {
                const companyNode = {
                    id: change.company_id,
                    name: change.company_name,
                    type: 'company',
                    subtype: 'changed',
                    size: change.change_count * 3,
                    color: this._getThreatColor(change.threat_level),
                    data: change
                };
                nodes.push(companyNode);

                // Link to appropriate time period
                const period = this._getTimePeriod(change.last_change);
                links.push({
                    source: companyNode.id,
                    target: `time-${period}`,
                    type: 'changed_in',
                    weight: change.relevance_score / 10,
                    active: true
                });
            });
        }
    }

    /**
     * Helper methods
     */
    _findConnections(companies, field) {
        const connections = new Map();
        
        companies.forEach(company => {
            const items = company.intelligence[field] || [];
            items.forEach(item => {
                const key = typeof item === 'string' ? item : item.name;
                if (!connections.has(key)) {
                    connections.set(key, []);
                }
                connections.get(key).push(company.company);
            });
        });
        
        return connections;
    }

    _createConnectionLinks(connections, links, type) {
        connections.forEach((companies, item) => {
            if (companies.length > 1) {
                // Create mesh of connections
                for (let i = 0; i < companies.length - 1; i++) {
                    for (let j = i + 1; j < companies.length; j++) {
                        links.push({
                            source: companies[i],
                            target: companies[j],
                            type: `shared_${type}`,
                            label: item,
                            weight: 0.5
                        });
                    }
                }
            }
        });
    }

    _getCompanyColor(type) {
        const colors = {
            'LLM Providers': '#ff6b6b',
            'AI Hardware': '#4ecdc4',
            'AI Frameworks': '#45b7d1',
            'Cloud Providers': '#96ceb4',
            'AI Applications': '#f7b731',
            'AI Research': '#5f27cd'
        };
        return colors[type] || '#667eea';
    }

    _getThreatColor(level) {
        const colors = {
            'high': '#ff4444',
            'medium': '#ffa726',
            'low': '#66bb6a'
        };
        return colors[level] || '#666666';
    }

    _calculateNodeSize(node) {
        switch (node.type) {
            case 'company': return node.data?.url_count * 5 || 10;
            case 'technology': return 8;
            case 'concept': return 12;
            case 'product': return 6;
            default: return 5;
        }
    }

    _getNodeColor(node) {
        if (node.color) return node.color;
        
        switch (node.type) {
            case 'company': return this._getCompanyColor(node.subtype);
            case 'technology': return '#4ecdc4';
            case 'concept': return '#00ff88';
            case 'product': return '#f7b731';
            case 'partner': return '#96ceb4';
            default: return '#667eea';
        }
    }

    _getTheBrainKind(type) {
        const kindMap = {
            'company': 1,      // Normal
            'technology': 4,   // Tag
            'concept': 4,      // Tag
            'product': 1,      // Normal
            'time_period': 3   // Event
        };
        return kindMap[type] || 1;
    }

    _getTheBrainRelation(linkType) {
        const relationMap = {
            'uses_concept': 1,     // Child
            'shared_technology': 3, // Jump
            'competitor': 3,       // Jump
            'partner': 3,         // Jump
            'changed_in': 2       // Parent
        };
        return relationMap[linkType] || 3;
    }

    _getTheBrainTypeId(nodeType) {
        // These would map to actual TheBrain type IDs
        const typeMap = {
            'company': 'company-type-id',
            'technology': 'tech-type-id',
            'concept': 'concept-type-id'
        };
        return typeMap[nodeType] || null;
    }

    _getLighterColor(color) {
        // Simple color lightening for background
        return color + '33'; // Add transparency
    }

    _getTimePeriod(dateStr) {
        const date = new Date(dateStr);
        const now = new Date();
        const diffHours = (now - date) / (1000 * 60 * 60);
        
        if (diffHours < 24) return 'today';
        if (diffHours < 48) return 'yesterday';
        if (diffHours < 168) return 'this_week';
        return 'this_month';
    }

    _getPeriodLabel(period) {
        const labels = {
            'today': 'Today',
            'yesterday': 'Yesterday',
            'this_week': 'This Week',
            'this_month': 'This Month'
        };
        return labels[period] || period;
    }

    _getTimeNodePosition(period) {
        const positions = {
            'today': { x: 0, y: 100 },
            'yesterday': { x: -100, y: 0 },
            'this_week': { x: 100, y: 0 },
            'this_month': { x: 0, y: -100 }
        };
        return positions[period] || { x: 0, y: 0 };
    }
}

// Export for use in different contexts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VisualizationAdapter;
} else if (typeof window !== 'undefined') {
    window.VisualizationAdapter = VisualizationAdapter;
}