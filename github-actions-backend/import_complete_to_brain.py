#!/usr/bin/env python3
"""
Complete Import to TheBrain - Thoughts, Links, and Notes
Handles the full import process for the AI competitive monitor data
"""
import json
import requests
import time
import os
from datetime import datetime

# Configuration
BASE_DIR = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data"
BRAIN_ID = "134f1325-4a8d-46d7-a078-5386c8ab3542"
API_KEY = "4c8eabea756ab437069c89c46ce7cf00c477591ab9787a526617370d22a4266c"
API_BASE = "https://api.bra.in/v1"

# Headers for API requests
headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

# Map relation names to Brain API relation numbers
RELATION_MAP = {
    "child": 1,
    "parent": 2,
    "jump": 3,
    "sibling": 4
}

# Map entity types to TheBrain thought kinds
KIND_MAP = {
    "company": 1,  # Normal
    "product": 1,  # Normal
    "feature": 1,  # Normal
    "technology": 1,  # Normal
    "person": 1,  # Normal
    "market": 4,  # Tag
    "pricing": 1,  # Normal
    "capability": 1,  # Normal
}

# Colors for different entity types
COLOR_MAP = {
    "company": "#3498db",    # Blue
    "product": "#2ecc71",    # Green
    "feature": "#f39c12",    # Orange
    "technology": "#9b59b6", # Purple
    "person": "#e74c3c",     # Red
    "market": "#95a5a6",     # Gray
    "pricing": "#f1c40f",    # Yellow
    "capability": "#1abc9c", # Turquoise
}

def extract_entity_type_from_note(note_content):
    """Extract entity type from note content"""
    if "**Entity Type:**" in note_content:
        lines = note_content.split('\n')
        for line in lines:
            if "**Entity Type:**" in line:
                entity_type = line.split("**Entity Type:**")[1].strip()
                return entity_type.lower()
    return "unknown"

def create_thought_api(name, entity_type="unknown", note_content=""):
    """Create a thought using the Brain API"""
    url = f"{API_BASE}/thoughts/{BRAIN_ID}"
    
    # Determine kind and color based on entity type
    kind = KIND_MAP.get(entity_type, 1)
    color = COLOR_MAP.get(entity_type, None)
    
    payload = {
        "name": name,
        "kind": kind
    }
    
    if color:
        payload["foregroundColor"] = color
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        if response.status_code == 200:
            result = response.json()
            return result.get('id')
        else:
            print(f"     Error creating thought: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"     Exception: {e}")
        return None

def create_link_api(thought_id_a, thought_id_b, relation, name=None):
    """Create a link using the Brain API"""
    url = f"{API_BASE}/links/{BRAIN_ID}"
    
    payload = {
        "thoughtIdA": thought_id_a,
        "thoughtIdB": thought_id_b,
        "relation": relation
    }
    
    if name:
        payload["name"] = name
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        if response.status_code == 200:
            result = response.json()
            return result.get('id')
        else:
            print(f"     Link error: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"     Link exception: {e}")
        return None

def create_or_update_note(thought_id, markdown_content):
    """Create or update a note using the Brain API"""
    url = f"{API_BASE}/notes/{BRAIN_ID}/{thought_id}/update"
    
    payload = {
        "markdown": markdown_content
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        return response.status_code == 200
    except Exception as e:
        print(f"     Note exception: {e}")
        return False

def extract_thought_name_from_link(thought_id, links_data):
    """Extract thought name from link metadata"""
    for link in links_data:
        if link.get('thoughtIdA') == thought_id:
            return link.get('metadata', {}).get('fromName', 'Unknown')
        if link.get('thoughtIdB') == thought_id:
            return link.get('metadata', {}).get('toName', 'Unknown')
    return 'Unknown'

def main():
    print("TheBrain Complete Import - Thoughts, Links, and Notes")
    print("="*60)
    
    # Load all data files
    print("\n1. Loading data files...")
    
    # Load notes
    notes_file = os.path.join(BASE_DIR, "generated_notes.json")
    with open(notes_file, 'r') as f:
        notes_data = json.load(f)
    print(f"   Loaded {len(notes_data)} notes")
    
    # Load links
    links_file = os.path.join(BASE_DIR, "links_to_import.json")
    with open(links_file, 'r') as f:
        links_data = json.load(f)
    print(f"   Loaded {len(links_data)} links")
    
    # Load existing ID mapping
    mapping_file = os.path.join(BASE_DIR, "id_mapping_current.json")
    if os.path.exists(mapping_file):
        with open(mapping_file, 'r') as f:
            id_mapping = json.load(f)
    else:
        id_mapping = {}
    print(f"   Found {len(id_mapping)} existing mappings")
    
    # Phase 1: Create all missing thoughts
    print("\n2. Creating thoughts...")
    thoughts_created = 0
    thoughts_failed = 0
    
    # Build a map of thought IDs to names and types
    thought_info = {}
    for old_id, note_content in notes_data.items():
        # Extract name from note (first line after #)
        lines = note_content.strip().split('\n')
        name = lines[0].replace('# ', '').strip() if lines else 'Unknown'
        entity_type = extract_entity_type_from_note(note_content)
        
        # Also check links for better names
        link_name = extract_thought_name_from_link(old_id, links_data)
        if link_name != 'Unknown':
            name = link_name
            
        thought_info[old_id] = {
            'name': name,
            'type': entity_type,
            'note': note_content
        }
    
    # Create thoughts
    for old_id, info in thought_info.items():
        if old_id in id_mapping:
            print(f"   [{thoughts_created + 1}] Skipping '{info['name']}' - already mapped")
            continue
            
        print(f"   [{thoughts_created + 1}] Creating thought: {info['name']} ({info['type']})")
        
        new_id = create_thought_api(info['name'], info['type'], info['note'])
        
        if new_id:
            id_mapping[old_id] = new_id
            thoughts_created += 1
            
            # Save mapping after each successful creation
            with open(mapping_file, 'w') as f:
                json.dump(id_mapping, f, indent=2)
        else:
            thoughts_failed += 1
            
        # Rate limiting
        time.sleep(0.1)
        
        # Progress update
        if thoughts_created % 10 == 0 and thoughts_created > 0:
            print(f"   Progress: {thoughts_created} thoughts created")
    
    print(f"\n   Thoughts created: {thoughts_created}")
    print(f"   Thoughts failed: {thoughts_failed}")
    print(f"   Total mapped: {len(id_mapping)}")
    
    # Phase 2: Create all links
    print("\n3. Creating links...")
    links_created = 0
    links_failed = 0
    links_skipped = 0
    
    for i, link in enumerate(links_data):
        # Check if both thoughts exist in our mapping
        if link['thoughtIdA'] not in id_mapping:
            print(f"   [{i+1}] Skipping - source thought not mapped")
            links_skipped += 1
            continue
            
        if link['thoughtIdB'] not in id_mapping:
            print(f"   [{i+1}] Skipping - target thought not mapped")
            links_skipped += 1
            continue
        
        # Get mapped IDs
        new_id_a = id_mapping[link['thoughtIdA']]
        new_id_b = id_mapping[link['thoughtIdB']]
        
        # Map relation string to number
        relation_str = link.get('relation', 'jump').lower()
        relation_num = RELATION_MAP.get(relation_str, 3)  # Default to jump (3)
        
        # Get metadata for display
        metadata = link.get('metadata', {})
        from_name = metadata.get('fromName', 'Unknown')
        to_name = metadata.get('toName', 'Unknown')
        link_name = link.get('name', '')
        
        print(f"   [{i+1}] Creating link: {from_name} -> {to_name} ({link_name})")
        
        # Create the link
        link_id = create_link_api(new_id_a, new_id_b, relation_num, link_name)
        
        if link_id:
            links_created += 1
        else:
            links_failed += 1
        
        # Rate limiting
        time.sleep(0.05)
        
        # Progress update
        if (i + 1) % 25 == 0:
            print(f"   Progress: {i+1}/{len(links_data)} links processed")
    
    print(f"\n   Links created: {links_created}")
    print(f"   Links failed: {links_failed}")
    print(f"   Links skipped: {links_skipped}")
    
    # Phase 3: Add all notes
    print("\n4. Adding notes to thoughts...")
    notes_created = 0
    notes_failed = 0
    
    for old_id, note_content in notes_data.items():
        if old_id not in id_mapping:
            print(f"   Skipping note - thought not mapped")
            continue
            
        new_thought_id = id_mapping[old_id]
        info = thought_info[old_id]
        
        print(f"   Adding note to: {info['name']}")
        
        if create_or_update_note(new_thought_id, note_content):
            notes_created += 1
        else:
            notes_failed += 1
            
        # Rate limiting
        time.sleep(0.05)
        
        # Progress update
        if notes_created % 25 == 0 and notes_created > 0:
            print(f"   Progress: {notes_created} notes added")
    
    print(f"\n   Notes created: {notes_created}")
    print(f"   Notes failed: {notes_failed}")
    
    # Final summary
    print("\n" + "="*60)
    print("Import Complete!")
    print(f"Thoughts: {thoughts_created} created ({len(id_mapping)} total mapped)")
    print(f"Links: {links_created} created")
    print(f"Notes: {notes_created} added")
    print("\nYour AI competitive intelligence data has been imported to TheBrain!")
    print("You can now visualize and explore the relationships between:")
    print("- Companies and their products")
    print("- Products and their features")
    print("- Technologies and implementations")
    print("- Markets and capabilities")
    print("- People and organizations")
    
    # Save final mapping
    with open(mapping_file, 'w') as f:
        json.dump(id_mapping, f, indent=2)
    print(f"\nID mapping saved to: {mapping_file}")

if __name__ == "__main__":
    main()