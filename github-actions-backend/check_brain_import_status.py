#!/usr/bin/env python3
"""
Check TheBrain Import Status
Shows what's already imported and what remains
"""
import json
import os

BASE_DIR = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data"

def main():
    print("TheBrain Import Status Check")
    print("="*60)
    
    # Load data files
    notes_file = os.path.join(BASE_DIR, "generated_notes.json")
    links_file = os.path.join(BASE_DIR, "links_to_import.json")
    mapping_file = os.path.join(BASE_DIR, "id_mapping_current.json")
    
    # Load notes
    with open(notes_file, 'r') as f:
        notes_data = json.load(f)
    
    # Load links
    with open(links_file, 'r') as f:
        links_data = json.load(f)
    
    # Load existing mapping
    if os.path.exists(mapping_file):
        with open(mapping_file, 'r') as f:
            id_mapping = json.load(f)
    else:
        id_mapping = {}
    
    print(f"\nTotal thoughts in data: {len(notes_data)}")
    print(f"Already mapped: {len(id_mapping)}")
    print(f"Remaining to import: {len(notes_data) - len(id_mapping)}")
    print(f"\nTotal links to process: {len(links_data)}")
    
    # Analyze entity types
    entity_types = {}
    for thought_id, note_content in notes_data.items():
        if "**Entity Type:**" in note_content:
            lines = note_content.split('\n')
            for line in lines:
                if "**Entity Type:**" in line:
                    entity_type = line.split("**Entity Type:**")[1].strip()
                    entity_types[entity_type] = entity_types.get(entity_type, 0) + 1
                    break
    
    print("\nEntity types found:")
    for entity_type, count in sorted(entity_types.items()):
        print(f"  - {entity_type}: {count}")
    
    # Check which thoughts are already mapped
    print("\nCurrently mapped thoughts:")
    for old_id, new_id in list(id_mapping.items())[:10]:  # Show first 10
        # Extract name from note
        if old_id in notes_data:
            lines = notes_data[old_id].strip().split('\n')
            name = lines[0].replace('# ', '').strip() if lines else 'Unknown'
            print(f"  - {name}")
    
    if len(id_mapping) > 10:
        print(f"  ... and {len(id_mapping) - 10} more")

if __name__ == "__main__":
    main()