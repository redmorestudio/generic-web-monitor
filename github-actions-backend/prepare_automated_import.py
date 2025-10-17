#!/usr/bin/env python3
"""
Fully automated TheBrain import using MCP
This script generates the exact commands needed for import
"""
import json
import os

BASE_DIR = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data"
BRAIN_ID = "134f1325-4a8d-46d7-a078-5386c8ab3542"

def main():
    # Load all data
    with open(os.path.join(BASE_DIR, "generated_notes.json"), 'r') as f:
        notes_data = json.load(f)
    
    with open(os.path.join(BASE_DIR, "id_mapping_current.json"), 'r') as f:
        id_mapping = json.load(f)
    
    with open(os.path.join(BASE_DIR, "links_to_import.json"), 'r') as f:
        links_data = json.load(f)
    
    # Extract entity info
    thoughts_to_create = []
    for old_id, note_content in notes_data.items():
        if old_id in id_mapping:
            continue
            
        lines = note_content.strip().split('\n')
        name = lines[0].replace('# ', '').strip() if lines else 'Unknown'
        
        # Extract entity type
        entity_type = "unknown"
        if "**Entity Type:**" in note_content:
            for line in lines:
                if "**Entity Type:**" in line:
                    entity_type = line.split("**Entity Type:**")[1].strip().lower()
                    break
        
        thoughts_to_create.append({
            "old_id": old_id,
            "name": name,
            "entity_type": entity_type,
            "note": note_content
        })
    
    # Save thoughts to create
    output = {
        "total": len(thoughts_to_create),
        "thoughts": thoughts_to_create[:100]  # First 100
    }
    
    with open(os.path.join(BASE_DIR, "batch_to_import.json"), 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"Prepared {len(output['thoughts'])} thoughts for import")
    print(f"Total remaining: {len(thoughts_to_create)}")
    
    # Also prepare link data for later
    link_mapping = []
    for link in links_data:
        link_mapping.append({
            "thoughtIdA": link["thoughtIdA"],
            "thoughtIdB": link["thoughtIdB"], 
            "name": link.get("name", ""),
            "metadata": link.get("metadata", {})
        })
    
    with open(os.path.join(BASE_DIR, "links_ready.json"), 'w') as f:
        json.dump(link_mapping, f, indent=2)
    
    print(f"Also prepared {len(link_mapping)} links for later import")

if __name__ == "__main__":
    main()
