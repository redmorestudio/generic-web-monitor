#!/usr/bin/env python3
"""
Import Links to TheBrain - Direct API Version (Fixed for links_to_import.json format)
"""
import json
import requests
import time
import os

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
            print(f"     Error: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"     Exception: {e}")
        return None

def update_link_properties(link_id, color=None, thickness=None, direction=None):
    """Update link properties using PATCH API"""
    url = f"{API_BASE}/links/{BRAIN_ID}/{link_id}"
    
    operations = []
    if color:
        operations.append({
            "op": "add",
            "path": "/color",
            "value": color
        })
    if thickness is not None:
        operations.append({
            "op": "add",
            "path": "/thickness", 
            "value": thickness
        })
    if direction is not None:
        operations.append({
            "op": "add",
            "path": "/direction",
            "value": direction
        })
    
    if not operations:
        return True
        
    try:
        response = requests.patch(url, json=operations, headers=headers)
        return response.status_code == 200
    except Exception as e:
        print(f"     Property update exception: {e}")
        return False

def main():
    print("TheBrain Link Import - Direct API Version")
    print("="*60)
    
    # Load ID mappings
    mapping_file = os.path.join(BASE_DIR, "id_mapping_current.json")
    if not os.path.exists(mapping_file):
        print("ERROR: No ID mapping file found. Run import_thoughts.py first!")
        return
        
    with open(mapping_file, 'r') as f:
        id_mapping = json.load(f)
    
    # Load links
    links_file = os.path.join(BASE_DIR, "links_to_import.json")
    if not os.path.exists(links_file):
        print("ERROR: No links file found!")
        return
        
    with open(links_file, 'r') as f:
        links_data = json.load(f)
    
    print(f"Found {len(links_data)} links to import")
    print(f"Have mappings for {len(id_mapping)} thoughts")
    
    created = 0
    failed = 0
    skipped = 0
    
    for i, link in enumerate(links_data):
        # Check if both thoughts exist in our mapping
        if link['thoughtIdA'] not in id_mapping:
            print(f"  [{i+1}] Skipping - thoughtIdA not mapped")
            skipped += 1
            continue
            
        if link['thoughtIdB'] not in id_mapping:
            print(f"  [{i+1}] Skipping - thoughtIdB not mapped")
            skipped += 1
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
        link_name = link.get('name', '[unnamed]')
        
        print(f"  [{i+1}] Creating: {from_name} -> {to_name} ({link_name}, relation: {relation_str})")
        
        # Create the link
        link_id = create_link_api(
            new_id_a,
            new_id_b,
            relation_num,
            link_name
        )
        
        if link_id:
            # Update properties if present
            update_link_properties(
                link_id,
                link.get('color'),
                link.get('thickness'),
                link.get('direction')
            )
            created += 1
        else:
            print(f"     Failed to create link")
            failed += 1
        
        # Rate limiting
        time.sleep(0.05)
        
        # Progress update
        if (i + 1) % 10 == 0:
            print(f"  Progress: {i+1}/{len(links_data)}")
    
    print("\n" + "="*60)
    print("Link Import Complete!")
    print(f"Created: {created}")
    print(f"Failed: {failed}")
    print(f"Skipped: {skipped}")
    print(f"Total: {len(links_data)}")

if __name__ == "__main__":
    main()
