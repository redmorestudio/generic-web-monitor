#!/usr/bin/env python3
"""
Complete TheBrain Import Solution
Handles thoughts, links, and notes in an efficient manner
"""
import json
import os
import sys
import time

BASE_DIR = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data"
BRAIN_ID = "134f1325-4a8d-46d7-a078-5386c8ab3542"

# Color mapping for entity types
COLOR_MAP = {
    "company": "#3b82f6",      # Blue
    "product": "#22c55e",      # Green  
    "feature": "#14b8a6",      # Teal
    "technology": "#8b5cf6",   # Purple
    "person": "#ef4444",       # Red
    "market": "#6b7280",       # Gray
    "pricing": "#f59e0b",      # Amber
    "capability": "#10b981",   # Emerald
    "concept": "#ec4899",      # Pink
    "technology category": "#a855f7"  # Purple variant
}

def extract_entity_type(note_content):
    """Extract entity type from note content"""
    if "**Entity Type:**" in note_content:
        lines = note_content.split('\n')
        for line in lines:
            if "**Entity Type:**" in line:
                return line.split("**Entity Type:**")[1].strip().lower()
    return "unknown"

def get_import_status():
    """Get current import status"""
    with open(os.path.join(BASE_DIR, "generated_notes.json"), 'r') as f:
        notes_data = json.load(f)
    
    with open(os.path.join(BASE_DIR, "id_mapping_current.json"), 'r') as f:
        id_mapping = json.load(f)
    
    total = len(notes_data)
    mapped = len(id_mapping)
    
    return {
        "total_thoughts": total,
        "imported": mapped,
        "remaining": total - mapped,
        "progress": (mapped/total)*100
    }

def prepare_thoughts_batch(batch_size=50):
    """Prepare a batch of thoughts for import"""
    # Load data
    with open(os.path.join(BASE_DIR, "generated_notes.json"), 'r') as f:
        notes_data = json.load(f)
    
    with open(os.path.join(BASE_DIR, "id_mapping_current.json"), 'r') as f:
        id_mapping = json.load(f)
    
    # Find unmapped thoughts
    batch = []
    for old_id, note_content in notes_data.items():
        if old_id in id_mapping:
            continue
            
        lines = note_content.strip().split('\n')
        name = lines[0].replace('# ', '').strip() if lines else 'Unknown'
        entity_type = extract_entity_type(note_content)
        
        batch.append({
            "old_id": old_id,
            "name": name,
            "entity_type": entity_type,
            "color": COLOR_MAP.get(entity_type, "#6b7280"),
            "note": note_content
        })
        
        if len(batch) >= batch_size:
            break
    
    return batch

def prepare_links_batch(batch_size=50):
    """Prepare links for import after thoughts are created"""
    # Load data
    with open(os.path.join(BASE_DIR, "links_to_import.json"), 'r') as f:
        links_data = json.load(f)
    
    with open(os.path.join(BASE_DIR, "id_mapping_current.json"), 'r') as f:
        id_mapping = json.load(f)
    
    # Find links where both thoughts are mapped
    ready_links = []
    for link in links_data:
        if link['thoughtIdA'] in id_mapping and link['thoughtIdB'] in id_mapping:
            ready_links.append({
                "old_idA": link['thoughtIdA'],
                "old_idB": link['thoughtIdB'],
                "new_idA": id_mapping[link['thoughtIdA']],
                "new_idB": id_mapping[link['thoughtIdB']],
                "name": link.get('name', ''),
                "metadata": link.get('metadata', {})
            })
            
            if len(ready_links) >= batch_size:
                break
    
    return ready_links

def main():
    print("TheBrain Import Manager")
    print("="*60)
    
    # Check current status
    status = get_import_status()
    print(f"\nCurrent Status:")
    print(f"Total thoughts: {status['total_thoughts']}")
    print(f"Already imported: {status['imported']}")
    print(f"Remaining: {status['remaining']}")
    print(f"Progress: {status['progress']:.1f}%")
    
    if status['remaining'] > 0:
        # Prepare next batch of thoughts
        print("\nPreparing next batch of thoughts...")
        thoughts_batch = prepare_thoughts_batch(50)
        
        if thoughts_batch:
            # Save batch for import
            batch_file = os.path.join(BASE_DIR, "current_import_batch.json")
            with open(batch_file, 'w') as f:
                json.dump({
                    "batch_size": len(thoughts_batch),
                    "thoughts": thoughts_batch
                }, f, indent=2)
            
            print(f"Saved {len(thoughts_batch)} thoughts to: {batch_file}")
            print("\nFirst 5 thoughts in batch:")
            for i, thought in enumerate(thoughts_batch[:5]):
                print(f"  {i+1}. {thought['name']} ({thought['entity_type'].upper()})")
            
            # Generate MCP commands
            print("\n" + "="*60)
            print("MCP COMMANDS TO EXECUTE:")
            print("="*60)
            print("\nThe assistant should now import these thoughts using the thebrain-mcp tools.")
            print("After import, run this script again to continue.")
    else:
        print("\nAll thoughts imported! Checking links...")
        
        # Check links
        with open(os.path.join(BASE_DIR, "links_to_import.json"), 'r') as f:
            total_links = len(json.load(f))
        
        ready_links = prepare_links_batch(100)
        
        if ready_links:
            print(f"\nFound {len(ready_links)} links ready to import")
            
            # Save links batch
            links_file = os.path.join(BASE_DIR, "current_links_batch.json")
            with open(links_file, 'w') as f:
                json.dump({
                    "batch_size": len(ready_links),
                    "links": ready_links
                }, f, indent=2)
            
            print(f"Saved links to: {links_file}")
            print("\nThe assistant should now import these links.")
        else:
            print("\nImport complete!")
            print(f"- {status['imported']} thoughts imported")
            print(f"- {total_links} links ready")
            print("\nNext steps:")
            print("1. Add notes to all thoughts")
            print("2. Verify the knowledge graph in TheBrain")

if __name__ == "__main__":
    main()
