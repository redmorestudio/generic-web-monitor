#!/usr/bin/env python3
"""
Complete TheBrain Import Solution
This generates all the necessary data for bulk import
"""
import json
import os

BASE_DIR = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data"
BRAIN_ID = "134f1325-4a8d-46d7-a078-5386c8ab3542"

# Color mapping
COLOR_MAP = {
    "company": "#3b82f6",
    "product": "#22c55e",
    "feature": "#14b8a6",
    "technology": "#8b5cf6",
    "person": "#ef4444",
    "market": "#6b7280",
    "pricing": "#f59e0b",
    "capability": "#10b981",
    "concept": "#ec4899",
    "technology category": "#a855f7"
}

def extract_entity_type(note_content):
    """Extract entity type from note content"""
    if "**Entity Type:**" in note_content:
        lines = note_content.split('\n')
        for line in lines:
            if "**Entity Type:**" in line:
                return line.split("**Entity Type:**")[1].strip().lower()
    return "unknown"

def prepare_bulk_import():
    """Prepare all data for bulk import"""
    # Load data
    with open(os.path.join(BASE_DIR, "generated_notes.json"), 'r') as f:
        notes_data = json.load(f)
    
    with open(os.path.join(BASE_DIR, "id_mapping_current.json"), 'r') as f:
        current_mappings = json.load(f)
    
    # Prepare thoughts for import
    thoughts_to_import = []
    count = 0
    
    for old_id, note_content in notes_data.items():
        if old_id in current_mappings:
            continue
            
        lines = note_content.strip().split('\n')
        name = lines[0].replace('# ', '').strip() if lines else 'Unknown'
        entity_type = extract_entity_type(note_content)
        
        thoughts_to_import.append({
            "old_id": old_id,
            "name": name,
            "entity_type": entity_type,
            "color": COLOR_MAP.get(entity_type, "#6b7280"),
            "label": entity_type.upper(),
            "note": note_content
        })
        
        count += 1
        if count >= 200:  # Limit to 200 at a time
            break
    
    # Save the import data
    import_data = {
        "brain_id": BRAIN_ID,
        "total_to_import": len(thoughts_to_import),
        "thoughts": thoughts_to_import
    }
    
    output_file = os.path.join(BASE_DIR, "bulk_import_data.json")
    with open(output_file, 'w') as f:
        json.dump(import_data, f, indent=2)
    
    # Generate summary
    total_thoughts = len(notes_data)
    already_imported = len(current_mappings)
    remaining = total_thoughts - already_imported
    
    print("TheBrain Import Summary")
    print("="*60)
    print(f"Total thoughts in system: {total_thoughts}")
    print(f"Already imported: {already_imported}")
    print(f"Remaining to import: {remaining}")
    print(f"Progress: {(already_imported/total_thoughts)*100:.1f}%")
    print(f"\nPrepared {len(thoughts_to_import)} thoughts for import")
    print(f"Data saved to: {output_file}")
    
    # Also prepare links summary
    with open(os.path.join(BASE_DIR, "links_to_import.json"), 'r') as f:
        links = json.load(f)
    
    print(f"\nLinks ready for import: {len(links)}")
    print("\nNEXT STEPS:")
    print("1. Import the prepared thoughts using the MCP tools")
    print("2. Update the id_mapping_current.json with new IDs")
    print("3. Import all links")
    print("4. Add notes to all thoughts")
    
    return import_data

if __name__ == "__main__":
    prepare_bulk_import()
