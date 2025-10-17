#!/usr/bin/env python3
"""
Live TheBrain Integration for AI Monitor
Uses the MCP server to create entities in TheBrain
"""

import json
import os
from datetime import datetime

# Configuration
BRAIN_ID = "134f1325-4a8d-46d7-a078-5386c8ab3542"  # Your AI Monitor brain
PARENT_THOUGHT_ID = "29a92b52-3a6e-43d4-99de-b6f6e032cd4f"  # AI Monitor Entity Graph

def load_monitoring_data():
    """Load the latest monitoring results"""
    base_path = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data"
    
    try:
        # Load smart groups report
        with open(f"{base_path}/smart-groups-report.json", "r") as f:
            smart_groups = json.load(f)
        
        # Load TheBrain export
        with open(f"{base_path}/thebrain-export.json", "r") as f:
            export_data = json.load(f)
            
        return smart_groups, export_data
    except Exception as e:
        print(f"Error loading data: {e}")
        return None, None

def create_thebrain_commands(smart_groups):
    """Generate MCP commands to create TheBrain entities"""
    commands = []
    
    # Create commands for products
    for product in smart_groups['entities']['products'][:10]:  # Limit to top 10
        commands.append({
            "action": "create_thought",
            "params": {
                "name": product,
                "label": "AI Product",
                "relation": 1,  # Child
                "sourceThoughtId": "70d8bf22-ac08-4711-82d1-f1cbc1c3c39d"  # Products category
            }
        })
    
    # Create commands for technologies
    for tech in smart_groups['entities']['technologies'][:10]:
        commands.append({
            "action": "create_thought",
            "params": {
                "name": tech,
                "label": "Technology",
                "relation": 1,
                "sourceThoughtId": "6a115a81-d8a0-4f3f-9d11-607779959bec"  # Technologies category
            }
        })
    
    # Create commands for new companies
    for company in smart_groups['entities']['companies'][:10]:
        commands.append({
            "action": "create_thought", 
            "params": {
                "name": company,
                "label": "AI Company",
                "relation": 1,
                "sourceThoughtId": "d4670ba3-8065-41cd-b52f-9566232879dd"  # Companies category
            }
        })
    
    # Create smart groups
    for group_name in list(smart_groups['groups'].keys())[:10]:
        commands.append({
            "action": "create_thought",
            "params": {
                "name": f"🎯 {group_name}",
                "label": "Smart Group",
                "foregroundColor": "#FFD700",
                "relation": 1,
                "sourceThoughtId": "c4b2b34b-f2b9-474e-ac1f-e5c926404c06"  # Smart Groups category
            }
        })
    
    return commands

def main():
    print("🧠 AI Monitor → TheBrain Live Integration")
    print("=" * 50)
    
    # Load monitoring data
    smart_groups, export_data = load_monitoring_data()
    
    if not smart_groups:
        print("❌ No monitoring data found. Run monitoring first!")
        return
    
    print(f"\n📊 Found Data:")
    print(f"- Products: {len(smart_groups['entities']['products'])}")
    print(f"- Technologies: {len(smart_groups['entities']['technologies'])}")
    print(f"- Companies: {len(smart_groups['entities']['companies'])}")
    print(f"- Smart Groups: {len(smart_groups['groups'])}")
    
    # Generate commands
    commands = create_thebrain_commands(smart_groups)
    
    print(f"\n🔧 Generated {len(commands)} TheBrain commands")
    
    # Save commands for manual execution or MCP integration
    output_path = "/Users/sethredmore/ai-monitor-fresh/thebrain-commands.json"
    with open(output_path, "w") as f:
        json.dump({
            "timestamp": datetime.now().isoformat(),
            "brain_id": BRAIN_ID,
            "commands": commands,
            "summary": {
                "total_commands": len(commands),
                "products": len([c for c in commands if "AI Product" in str(c)]),
                "technologies": len([c for c in commands if "Technology" in str(c)]),
                "companies": len([c for c in commands if "AI Company" in str(c)]),
                "smart_groups": len([c for c in commands if "Smart Group" in str(c)])
            }
        }, f, indent=2)
    
    print(f"\n✅ Commands saved to: {output_path}")
    
    # Print sample commands
    print("\n📝 Sample Commands (first 3):")
    for cmd in commands[:3]:
        print(f"  - Create '{cmd['params']['name']}' as {cmd['params']['label']}")
    
    print("\n🚀 Next Steps:")
    print("1. Review the generated commands")
    print("2. Use MCP integration to execute them")
    print("3. Or manually create in TheBrain")
    
    # Show top discoveries
    print("\n🏆 Top Discoveries:")
    top_groups = sorted(smart_groups['groups'].items(), 
                       key=lambda x: x[1]['count'], 
                       reverse=True)[:5]
    
    for group, data in top_groups:
        print(f"  - {group}: {data['count']} occurrences")
        if data['changes']:
            high_threat = [c for c in data['changes'] if c.get('threat_level', 0) >= 7]
            if high_threat:
                print(f"    ⚠️  High threat from: {', '.join(c['company'] for c in high_threat)}")

if __name__ == "__main__":
    main()
