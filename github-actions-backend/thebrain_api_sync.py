#!/usr/bin/env python3
"""
TheBrain API Direct Sync - FIXED VERSION
Uses the TheBrain API directly to create thoughts and links
Fixed: Enhanced error logging for link creation debugging
"""

import os
import sys
import json
import sqlite3
import requests
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
import time

# Configuration - MUST be set via environment variables
BRAIN_ID = os.getenv('THEBRAIN_BRAIN_ID')
API_KEY = os.getenv('THEBRAIN_API_KEY')
API_BASE_URL = 'https://api.thebrain.com/v1'

# Validate credentials
if not BRAIN_ID or not API_KEY:
    print("❌ ERROR: Missing TheBrain credentials!")
    print("   Please set the following environment variables:")
    print("   - THEBRAIN_BRAIN_ID")
    print("   - THEBRAIN_API_KEY")
    print("\nFor GitHub Actions, add these as repository secrets.")
    sys.exit(1)

# Database paths
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
INTELLIGENCE_DB = os.path.join(DATA_DIR, 'intelligence.db')
RAW_DB = os.path.join(DATA_DIR, 'raw_content.db')
PROCESSED_DB = os.path.join(DATA_DIR, 'processed_content.db')

# Global tracking
thought_map = {}  # name -> thought_id
company_map = {}  # company_id -> thought_id
links_to_create = []  # List of (thoughtA, thoughtB, relation, name)


class TheBrainAPI:
    """Direct API wrapper for TheBrain"""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {API_KEY}',
            'Content-Type': 'application/json'
        })
        self.session.timeout = 30
    
    def test_connection(self) -> bool:
        """Test API connection"""
        try:
            response = self.session.get(f'{API_BASE_URL}/brains/{BRAIN_ID}')
            if response.status_code == 200:
                brain = response.json()
                print(f"✅ Connected to brain: {brain.get('name', 'Unknown')}")
                return True
            else:
                print(f"❌ Connection failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Connection error: {e}")
            return False
    
    def create_thought(self, data: dict) -> Optional[str]:
        """Create a thought and return its ID"""
        try:
            # Check if thought already exists
            if data['name'] in thought_map:
                return thought_map[data['name']]
            
            payload = {
                'name': data['name'],
                'label': data.get('label', ''),
                'kind': data.get('kind', 1),
                'acType': data.get('acType', 0),
                'foregroundColor': data.get('foregroundColor', '#ffffff'),
                'backgroundColor': data.get('backgroundColor', '#1a1a2e')
            }
            
            response = self.session.post(
                f'{API_BASE_URL}/brains/{BRAIN_ID}/thoughts',
                json=payload
            )
            
            if response.status_code in [200, 201]:
                result = response.json()
                thought_id = result['id']
                thought_map[data['name']] = thought_id
                print(f"   ✅ Created: {data['name']}")
                
                # Add note if provided
                if 'note' in data:
                    self.add_note(thought_id, data['note'])
                
                return thought_id
            else:
                print(f"   ❌ Failed to create {data['name']}: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            print(f"   ❌ Error creating thought: {e}")
            return None
    
    def create_link(self, thoughtA: str, thoughtB: str, relation: int, name: str = '') -> bool:
        """Create a link between thoughts"""
        try:
            payload = {
                'thoughtIdA': thoughtA,
                'thoughtIdB': thoughtB,
                'relation': relation,
                'name': name
            }
            
            # Enhanced logging
            print(f"   🔗 Attempting link: {thoughtA[:8]}... -> {thoughtB[:8]}... (relation: {relation}, name: '{name}')")
            
            response = self.session.post(
                f'{API_BASE_URL}/brains/{BRAIN_ID}/links',
                json=payload
            )
            
            if response.status_code in [200, 201]:
                print(f"   ✅ Link created successfully")
                return True
            else:
                print(f"   ❌ Link failed: Status {response.status_code}")
                print(f"   ❌ Error response: {response.text}")
                print(f"   ❌ Request payload: {json.dumps(payload, indent=2)}")
                
                # Try to parse error for more details
                try:
                    error_data = response.json()
                    if 'error' in error_data:
                        print(f"   ❌ Error message: {error_data['error']}")
                    if 'message' in error_data:
                        print(f"   ❌ Error details: {error_data['message']}")
                except:
                    pass
                
                return False
                
        except Exception as e:
            print(f"   ❌ Link exception: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    def add_note(self, thought_id: str, markdown: str) -> bool:
        """Add a note to a thought"""
        try:
            payload = {'markdown': markdown}
            
            response = self.session.post(
                f'{API_BASE_URL}/brains/{BRAIN_ID}/thoughts/{thought_id}/notes',
                json=payload
            )
            
            return response.status_code in [200, 201]
            
        except Exception as e:
            print(f"   ⚠️  Note error: {e}")
            return False


def create_root_structure(api: TheBrainAPI) -> Dict[str, str]:
    """Create root thought and main categories"""
    print("\n📊 Creating root structure...")
    
    # Create root
    root_id = api.create_thought({
        'name': 'AI Competitive Monitor',
        'label': 'SYSTEM',
        'kind': 2,  # Type
        'foregroundColor': '#667eea',
        'backgroundColor': '#1a1a2e',
        'note': f'''# AI Competitive Monitor

## System Overview
Real-time monitoring and analysis of 52+ companies in the AI space.

## Key Metrics
- Companies Monitored: 52+
- URLs Tracked: 200+
- Update Frequency: Every 6 hours
- Analysis Types: Entity extraction, competitive intelligence

## Architecture
- 3-Database System: Raw → Processed → Intelligence
- 4-Stage Pipeline: Scrape → Process → Analyze → Deploy
- GitHub Actions: Fully automated workflows

## Last Sync
{datetime.now().isoformat()}'''
    })
    
    if not root_id:
        raise Exception("Failed to create root thought")
    
    # Create main categories
    categories = {
        'companies': {
            'name': 'Monitored Companies',
            'icon': '🏢',
            'color': '#ef4444'
        },
        'changes': {
            'name': 'Recent Changes',
            'icon': '🔄',
            'color': '#f59e0b'
        },
        'architecture': {
            'name': 'System Architecture',
            'icon': '🏗️',
            'color': '#3b82f6'
        },
        'insights': {
            'name': 'AI Insights',
            'icon': '🧠',
            'color': '#22c55e'
        }
    }
    
    category_ids = {}
    for key, cat in categories.items():
        cat_id = api.create_thought({
            'name': cat['name'],
            'label': cat['icon'],
            'kind': 2,  # Type
            'foregroundColor': cat['color'],
            'backgroundColor': '#0f0f1e'
        })
        
        if cat_id:
            category_ids[key] = cat_id
            links_to_create.append((root_id, cat_id, 1, cat['name']))
    
    return category_ids


def create_companies(api: TheBrainAPI, companies_id: str):
    """Create company hierarchy"""
    print("\n🏢 Creating companies...")
    
    # Connect to database
    conn = sqlite3.connect(INTELLIGENCE_DB)
    cursor = conn.cursor()
    
    # Get companies
    cursor.execute('''
        SELECT c.*, COUNT(DISTINCT u.id) as url_count
        FROM companies c
        LEFT JOIN urls u ON c.id = u.company_id
        GROUP BY c.id
        ORDER BY c.category, c.name
    ''')
    
    companies = cursor.fetchall()
    print(f"   Found {len(companies)} companies")
    
    # Category groups
    category_groups = {
        'llm-provider': ('LLM Providers', '🤖', '#8b5cf6'),
        'ai-coding': ('AI Coding Tools', '💻', '#ec4899'),
        'ai-infrastructure': ('AI Infrastructure', '🏗️', '#f97316'),
        'ai-research': ('AI Research', '🔬', '#14b8a6'),
        'competitor': ('Direct Competitors', '⚔️', '#ef4444'),
        'partner': ('Partners', '🤝', '#22c55e'),
        'tool': ('AI Tools', '🛠️', '#f59e0b'),
        'industry': ('Industry Players', '🏭', '#3b82f6')
    }
    
    # Create category groups
    group_ids = {}
    for key, (name, icon, color) in category_groups.items():
        group_id = api.create_thought({
            'name': name,
            'label': icon,
            'kind': 2,  # Type
            'foregroundColor': color,
            'backgroundColor': '#1a1a2e'
        })
        
        if group_id:
            group_ids[key] = group_id
            links_to_create.append((companies_id, group_id, 1, name))
    
    # Create company thoughts
    count = 0
    for row in companies:
        company_id = row[0]
        company_name = row[1]
        category = row[3] if len(row) > 3 else 'industry'
        url_count = row[-1]
        
        # Get group
        group_id = group_ids.get(category, group_ids.get('industry'))
        if not group_id:
            continue
        
        # Create company thought
        _, _, color = category_groups.get(category, ('', '', '#667eea'))
        
        thought_id = api.create_thought({
            'name': company_name,
            'label': f'{url_count} URLs',
            'kind': 1,  # Normal
            'foregroundColor': color,
            'backgroundColor': '#111827'
        })
        
        if thought_id:
            company_map[company_id] = thought_id
            links_to_create.append((group_id, thought_id, 1, 'member'))
            
            # Update database
            cursor.execute(
                'UPDATE companies SET thebrain_thought_id = ? WHERE id = ?',
                (thought_id, company_id)
            )
            
            count += 1
            if count % 10 == 0:
                print(f"   Progress: {count}/{len(companies)}")
    
    conn.commit()
    conn.close()
    
    print(f"   ✅ Created {count} companies")


def create_architecture(api: TheBrainAPI, arch_id: str):
    """Create architecture visualization"""
    print("\n🏗️ Creating architecture...")
    
    # Database group
    db_group_id = api.create_thought({
        'name': '3-Database Architecture',
        'label': 'DATABASES',
        'kind': 2,
        'foregroundColor': '#10b981',
        'backgroundColor': '#1a1a2e'
    })
    
    if db_group_id:
        links_to_create.append((arch_id, db_group_id, 1, 'contains'))
        
        # Databases
        databases = [
            ('Raw Content DB', 'HTML snapshots', '#dc2626'),
            ('Processed Content DB', 'Markdown text', '#f59e0b'),
            ('Intelligence DB', 'AI analysis', '#22c55e')
        ]
        
        for name, desc, color in databases:
            db_id = api.create_thought({
                'name': name,
                'label': desc,
                'kind': 1,
                'foregroundColor': color,
                'backgroundColor': '#111827'
            })
            
            if db_id:
                links_to_create.append((db_group_id, db_id, 1, desc))
    
    # Workflow group
    wf_group_id = api.create_thought({
        'name': 'GitHub Workflows',
        'label': 'AUTOMATION',
        'kind': 2,
        'foregroundColor': '#8b5cf6',
        'backgroundColor': '#1a1a2e'
    })
    
    if wf_group_id:
        links_to_create.append((arch_id, wf_group_id, 1, 'runs'))
        
        # Workflows
        workflows = [
            ('Scrape Workflow', '#dc2626'),
            ('Process Workflow', '#f59e0b'),
            ('Analyze Workflow', '#22c55e'),
            ('Deploy Workflow', '#3b82f6')
        ]
        
        for name, color in workflows:
            wf_id = api.create_thought({
                'name': name,
                'label': 'WORKFLOW',
                'kind': 1,
                'foregroundColor': color,
                'backgroundColor': '#111827'
            })
            
            if wf_id:
                links_to_create.append((wf_group_id, wf_id, 1, name.split()[0].lower()))


def create_recent_changes(api: TheBrainAPI, changes_id: str):
    """Create recent high-value changes"""
    print("\n🔄 Creating recent changes...")
    
    conn = sqlite3.connect(INTELLIGENCE_DB)
    cursor = conn.cursor()
    
    # Check for ai_analysis table
    cursor.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='ai_analysis'"
    )
    
    if not cursor.fetchone():
        print("   ⚠️  No ai_analysis table found")
        conn.close()
        return
    
    # Get recent high-value changes
    cursor.execute('''
        SELECT 
            aa.id,
            aa.created_at,
            aa.relevance_score,
            aa.category,
            aa.summary,
            c.name as company_name,
            c.id as company_id
        FROM ai_analysis aa
        JOIN companies c ON aa.company_id = c.id
        WHERE aa.created_at > datetime('now', '-7 days')
        AND aa.relevance_score >= 7
        ORDER BY aa.relevance_score DESC
        LIMIT 15
    ''')
    
    changes = cursor.fetchall()
    print(f"   Found {len(changes)} high-value changes")
    
    if changes:
        # Create high priority group
        high_group_id = api.create_thought({
            'name': 'High Priority Changes',
            'label': '🔴',
            'kind': 2,
            'foregroundColor': '#dc2626',
            'backgroundColor': '#1a1a2e'
        })
        
        if high_group_id:
            links_to_create.append((changes_id, high_group_id, 1, 'contains'))
            
            # Add changes
            for change in changes:
                change_id, created_at, score, category, summary, company_name, company_id = change
                
                change_date = datetime.fromisoformat(created_at).strftime('%Y-%m-%d')
                
                thought_id = api.create_thought({
                    'name': f'{company_name} - {change_date}',
                    'label': f'Score: {score}/10',
                    'kind': 3,  # Event
                    'foregroundColor': '#ef4444',
                    'backgroundColor': '#111827',
                    'note': f'''# {company_name} Update

## Relevance Score
{score}/10

## Category
{category or 'General Update'}

## Summary
{summary or 'No summary available'}

## Detected
{created_at}'''
                })
                
                if thought_id:
                    links_to_create.append((high_group_id, thought_id, 1, 'detected'))
                    
                    # Link to company if exists
                    company_thought_id = company_map.get(company_id)
                    if company_thought_id:
                        links_to_create.append((company_thought_id, thought_id, 3, 'change'))
    
    conn.close()


def create_insights(api: TheBrainAPI, insights_id: str):
    """Create AI insights"""
    print("\n🧠 Creating insights...")
    
    # Create insight categories
    insight_categories = [
        ('Technology Trends', '📈', '#10b981'),
        ('Competitive Intelligence', '⚔️', '#dc2626'),
        ('Market Opportunities', '💡', '#f59e0b')
    ]
    
    for name, icon, color in insight_categories:
        cat_id = api.create_thought({
            'name': name,
            'label': icon,
            'kind': 2,
            'foregroundColor': color,
            'backgroundColor': '#1a1a2e'
        })
        
        if cat_id:
            links_to_create.append((insights_id, cat_id, 1, 'analysis'))


def create_all_links(api: TheBrainAPI):
    """Create all queued links"""
    print(f"\n🔗 Creating {len(links_to_create)} links...")
    
    created = 0
    failed = 0
    
    for i, (thoughtA, thoughtB, relation, name) in enumerate(links_to_create):
        if api.create_link(thoughtA, thoughtB, relation, name):
            created += 1
        else:
            failed += 1
        
        # Progress update
        if (i + 1) % 10 == 0:
            print(f"   Progress: {i + 1}/{len(links_to_create)} links")
        
        # Small delay to avoid rate limiting
        time.sleep(0.1)
    
    print(f"   ✅ Created {created} links ({failed} failed)")


def main():
    """Main sync function"""
    print("=" * 60)
    print("TheBrain API Direct Sync - FIXED VERSION")
    print("=" * 60)
    print(f"Brain ID: {BRAIN_ID}")
    print(f"API Key: {API_KEY[:10]}..." if API_KEY else "NOT SET")
    
    # Initialize API
    api = TheBrainAPI()
    
    # Test connection
    if not api.test_connection():
        print("\n❌ Failed to connect to TheBrain API")
        return 1
    
    try:
        # Phase 1: Create root and categories
        print("\n" + "="*40)
        print("PHASE 1: Root Structure")
        print("="*40)
        categories = create_root_structure(api)
        
        # Phase 2: Create companies
        print("\n" + "="*40)
        print("PHASE 2: Companies")
        print("="*40)
        if 'companies' in categories:
            create_companies(api, categories['companies'])
        
        # Phase 3: Create architecture
        print("\n" + "="*40)
        print("PHASE 3: Architecture")
        print("="*40)
        if 'architecture' in categories:
            create_architecture(api, categories['architecture'])
        
        # Phase 4: Create recent changes
        print("\n" + "="*40)
        print("PHASE 4: Recent Changes")
        print("="*40)
        if 'changes' in categories:
            create_recent_changes(api, categories['changes'])
        
        # Phase 5: Create insights
        print("\n" + "="*40)
        print("PHASE 5: Insights")
        print("="*40)
        if 'insights' in categories:
            create_insights(api, categories['insights'])
        
        # Phase 6: Create all links
        print("\n" + "="*40)
        print("PHASE 6: Links")
        print("="*40)
        create_all_links(api)
        
        # Summary
        print("\n" + "="*60)
        print("✅ SYNC COMPLETE!")
        print("="*60)
        print(f"Thoughts created: {len(thought_map)}")
        print(f"Companies synced: {len(company_map)}")
        print(f"Links created: {len(links_to_create)}")
        
        # Save report
        report = {
            'timestamp': datetime.now().isoformat(),
            'brain_id': BRAIN_ID,
            'thoughts_created': len(thought_map),
            'companies_synced': len(company_map),
            'links_created': len(links_to_create),
            'thought_map': thought_map,
            'status': 'success'
        }
        
        report_path = os.path.join(DATA_DIR, 'thebrain-api-sync-report.json')
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"\n📄 Report saved to: {report_path}")
        
        return 0
        
    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == '__main__':
    sys.exit(main())
