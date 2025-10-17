#!/usr/bin/env python3
"""
Import TheBrain knowledge graph from JSON to TheBrain
"""
import json
import subprocess
import time
import sys

def main():
    # Load the JSON file
    json_path = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/thebrain-knowledge-graph.json"
    print(f"Loading data from {json_path}...")
    
    with open(json_path, 'r') as f:
        data = json.load(f)
    
    print(f"\nData loaded successfully!")
    print(f"Brain: {data['brain']['name']}")
    print(f"Thoughts to import: {len(data['thoughts'])}")
    print(f"Links to import: {len(data['links'])}")
    
    # Extract unique entity types and their colors
    entity_types = {}
    for thought in data['thoughts']:
        entity_type = thought.get('entityType', 'unknown')
        if entity_type not in entity_types:
            entity_types[entity_type] = {
                'foregroundColor': thought.get('foregroundColor', '#ffffff'),
                'backgroundColor': thought.get('backgroundColor', '#000000'),
                'label': thought.get('label', entity_type.upper())
            }
    
    print(f"\nFound {len(entity_types)} entity types:")
    for et, info in entity_types.items():
        print(f"  - {et}: {info['label']}")
    
    print("\nReady to import. The assistant will now execute the import using MCP commands.")
    
    # Save the entity types for reference
    with open('/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/entity_types.json', 'w') as f:
        json.dump(entity_types, f, indent=2)
    
    print("\nEntity types saved to entity_types.json")

if __name__ == "__main__":
    main()
