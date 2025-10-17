#!/usr/bin/env python3
"""
FIXED BRAIN IMPORT SCRIPT - Using correct API format
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

# Fixed API endpoint - based on MCP server format
API_BASE = "https://api.thebrain.com/v1"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

def create_thought(name, color, label):
    """Create a thought using the Brain API"""
    # Correct endpoint format: /brains/{brainId}/thoughts
    url = f"{API_BASE}/brains/{BRAIN_ID}/thoughts"
    
    payload = {
        "name": name,
        "kind": 1,
        "foregroundColor": color,
        "label": label,
        "acType": 0  # Public access
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        if response.status_code in [200, 201]:
            result = response.json()
            return result.get('id')
        else:
            print(f"   Error: {response.status_code}")
            print(f"   Response: {response.text[:200]}")
            return None
    except Exception as e:
        print(f"   Exception: {e}")
        return None

def add_note_to_thought(thought_id, note_content):
    """Add a note to a thought"""
    # Correct endpoint format
    url = f"{API_BASE}/brains/{BRAIN_ID}/thoughts/{thought_id}/notes"
    
    payload = {"markdown": note_content}
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        if response.status_code in [200, 201]:
            return True
        else:
            print(f"   Note error: {response.status_code}")
            return False
    except Exception as e:
        print(f"   Note exception: {e}")
        return False

def create_link(thought_a, thought_b, relation_type):
    """Create a link between two thoughts"""
    # Correct endpoint format
    url = f"{API_BASE}/brains/{BRAIN_ID}/links"
    
    payload = {
        "thoughtIdA": thought_a,
        "thoughtIdB": thought_b,
        "relation": relation_type
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        if response.status_code in [200, 201]:
            return True
        else:
            print(f"   Link error: {response.status_code}")
            return False
    except Exception as e:
        print(f"   Link exception: {e}")
        return False

def main():
    print("=== FIXED BRAIN IMPORT ===")
    print(f"Started at: {datetime.now()}")
    print(f"Using API: {API_BASE}")
    
    # Load all data
    print("\nLoading data files...")
    with open(os.path.join(BASE_DIR, "generated_notes.json"), 'r') as f:
        all_notes = json.load(f)
    
    with open(os.path.join(BASE_DIR, "links_to_import.json"), 'r') as f:
        all_links = json.load(f)
    
    # Load or create mapping
    mapping_file = os.path.join(BASE_DIR, "id_mapping_complete.json")
    if os.path.exists(mapping_file):
        with open(mapping_file, 'r') as f:
            id_mapping = json.load(f)
    else:
        id_mapping = {}
    
    print(f"\nTotal thoughts: {len(all_notes)}")
    print(f"Already imported: {len(id_mapping)}")
    print(f"To import: {len(all_notes) - len(id_mapping)}")
    print(f"Total links: {len(all_links)}")
    
    # Test with one thought first
    if len(all_notes) - len(id_mapping) > 0:
        print("\n=== TESTING WITH ONE THOUGHT FIRST ===")
        
        # Get first unmapped thought
        test_id = None
        for old_id in all_notes:
            if old_id not in id_mapping:
                test_id = old_id
                break
        
        if test_id:
            note_content = all_notes[test_id]
            lines = note_content.strip().split('\n')
            name = lines[0].replace('# ', '').strip() if lines else 'Unknown'
            
            print(f"Testing with: {name}")
            new_id = create_thought(name, "#3b82f6", "TEST")
            
            if new_id:
                print("✓ Test successful! Continuing with full import...")
                id_mapping[test_id] = new_id
                with open(mapping_file, 'w') as f:
                    json.dump(id_mapping, f, indent=2)
            else:
                print("✗ Test failed. Please check API credentials and endpoint.")
                return
    
    # Import remaining thoughts
    print("\n=== IMPORTING ALL THOUGHTS ===")
    count = len(id_mapping)
    
    for old_id, note_content in all_notes.items():
        if old_id in id_mapping:
            continue
        
        # Extract info from note
        lines = note_content.strip().split('\n')
        name = lines[0].replace('# ', '').strip() if lines else 'Unknown'
        
        # Extract entity type
        entity_type = "unknown"
        for line in lines:
            if "**Entity Type:**" in line:
                entity_type = line.split("**Entity Type:**")[1].strip().lower()
                break
        
        # Determine color and label
        color_map = {
            "company": ("#3b82f6", "COMPANY"),
            "product": ("#10b981", "PRODUCT"),
            "feature": ("#14b8a6", "FEATURE"),
            "technology": ("#8b5cf6", "TECHNOLOGY"),
            "person": ("#ef4444", "PERSON"),
            "pricing": ("#f59e0b", "PRICING"),
            "market": ("#6b7280", "MARKET"),
            "capability": ("#10b981", "CAPABILITY")
        }
        
        color, label = color_map.get(entity_type, ("#9ca3af", entity_type.upper()))
        
        count += 1
        print(f"\n[{count}] {name} ({label})")
        
        # Create thought
        new_id = create_thought(name, color, label)
        if new_id:
            print(f"   ✓ Created: {new_id}")
            id_mapping[old_id] = new_id
            
            # Add note
            if add_note_to_thought(new_id, note_content):
                print(f"   ✓ Note added")
            
            # Save mapping after each successful import
            with open(mapping_file, 'w') as f:
                json.dump(id_mapping, f, indent=2)
        else:
            print(f"   ✗ Failed")
        
        # Rate limit
        time.sleep(0.5)
        
        # Progress update every 10
        if count % 10 == 0:
            print(f"\n--- Progress: {count} imported, {len(all_notes) - len(id_mapping)} remaining ---")
    
    # Import links
    print("\n\n=== IMPORTING LINKS ===")
    link_count = 0
    failed_links = []
    
    for link in all_links:
        source_id = id_mapping.get(link['thoughtIdA'])
        target_id = id_mapping.get(link['thoughtIdB'])
        
        if source_id and target_id:
            # Map relationship types from the links file
            relation_name = link.get('relation', 'jump').lower()
            rel_map = {
                "child": 1,
                "parent": 2,
                "jump": 3,
                "sibling": 4
            }
            relation = rel_map.get(relation_name, 3)  # Default to jump (3)
            
            if create_link(source_id, target_id, relation):
                link_count += 1
                if link_count % 10 == 0:
                    print(f"   Links created: {link_count}")
            else:
                failed_links.append(link)
            
            time.sleep(0.2)  # Rate limit for links
        else:
            # Track links that couldn't be created due to missing thoughts
            if not source_id:
                print(f"   Warning: Source thought not found: {link['thoughtIdA']}")
            if not target_id:
                print(f"   Warning: Target thought not found: {link['thoughtIdB']}")
    
    print(f"\n=== IMPORT COMPLETE ===")
    print(f"Total thoughts imported: {count}")
    print(f"Total thoughts in brain: {len(id_mapping)}")
    print(f"Total links created: {link_count}")
    print(f"Failed links: {len(failed_links)}")
    print(f"Completed at: {datetime.now()}")
    
    # Save failed links for debugging
    if failed_links:
        with open(os.path.join(BASE_DIR, "failed_links.json"), 'w') as f:
            json.dump(failed_links, f, indent=2)
        print(f"\nFailed links saved to: failed_links.json")

if __name__ == "__main__":
    main()
