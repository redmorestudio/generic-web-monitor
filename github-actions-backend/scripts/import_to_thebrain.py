#!/usr/bin/env python3
"""
Import knowledge graph data into TheBrain
"""

import json
import requests
import time
import sys
from typing import Dict, List, Any

# TheBrain API configuration
API_KEY = "4c8eabea756ab437069c89c46ce7cf00c477591ab9787a526617370d22a4266c"
BRAIN_ID = "134f1325-4a8d-46d7-a078-5386c8ab3542"
BASE_URL = "https://thebrain.com/api/v1"

# Headers for API requests
headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

def create_thought(thought_data: Dict[str, Any]) -> bool:
    """Create a thought in TheBrain"""
    url = f"{BASE_URL}/thoughts"
    
    # Map the data from our JSON to TheBrain's API format
    payload = {
        "brainId": BRAIN_ID,
        "name": thought_data.get("name", ""),
        "label": thought_data.get("label", ""),
        "kind": thought_data.get("kind", 1),
        "acType": thought_data.get("acType", 0),
        "foregroundColor": thought_data.get("foregroundColor"),
        "backgroundColor": thought_data.get("backgroundColor")
    }
    
    # Store the original ID for mapping
    if "id" in thought_data:
        payload["externalId"] = thought_data["id"]
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        if response.status_code in [200, 201]:
            result = response.json()
            return result.get("id", thought_data.get("id"))
        else:
            print(f"Failed to create thought '{thought_data.get('name')}': {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"Error creating thought '{thought_data.get('name')}': {str(e)}")
        return None

def create_link(link_data: Dict[str, Any], thought_id_map: Dict[str, str]) -> bool:
    """Create a link in TheBrain"""
    url = f"{BASE_URL}/links"
    
    # Map the old IDs to new IDs
    thought_a_id = thought_id_map.get(link_data.get("thoughtIdA"), link_data.get("thoughtIdA"))
    thought_b_id = thought_id_map.get(link_data.get("thoughtIdB"), link_data.get("thoughtIdB"))
    
    payload = {
        "brainId": BRAIN_ID,
        "thoughtIdA": thought_a_id,
        "thoughtIdB": thought_b_id,
        "relation": link_data.get("relation", 1),
        "name": link_data.get("name", ""),
        "color": link_data.get("color"),
        "thickness": link_data.get("thickness", 1),
        "direction": link_data.get("direction", 0)
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        if response.status_code in [200, 201]:
            return True
        else:
            print(f"Failed to create link between '{thought_a_id}' and '{thought_b_id}': {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"Error creating link: {str(e)}")
        return False

def main():
    # Read the knowledge graph file
    with open("/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/thebrain-knowledge-graph.json", "r") as f:
        data = json.load(f)
    
    thoughts = data.get("thoughts", [])
    links = data.get("links", [])
    
    print(f"Found {len(thoughts)} thoughts and {len(links)} links to import")
    
    # Create progress tracking
    thought_id_map = {}  # Map old IDs to new IDs
    successful_thoughts = 0
    failed_thoughts = 0
    
    # Import thoughts
    print("\n=== Importing Thoughts ===")
    for i, thought in enumerate(thoughts):
        print(f"Progress: {i+1}/{len(thoughts)} - Importing: {thought.get('name', 'Unknown')}")
        
        new_id = create_thought(thought)
        if new_id:
            thought_id_map[thought.get("id")] = new_id
            successful_thoughts += 1
        else:
            failed_thoughts += 1
        
        # Add a small delay to avoid rate limiting
        if i % 10 == 0:
            time.sleep(0.5)
    
    print(f"\nThoughts imported: {successful_thoughts} successful, {failed_thoughts} failed")
    
    # Save the ID mapping for recovery
    with open("/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/thought_id_mapping.json", "w") as f:
        json.dump(thought_id_map, f, indent=2)
    
    # Import links
    print("\n=== Importing Links ===")
    successful_links = 0
    failed_links = 0
    
    for i, link in enumerate(links):
        print(f"Progress: {i+1}/{len(links)}")
        
        if create_link(link, thought_id_map):
            successful_links += 1
        else:
            failed_links += 1
        
        # Add a small delay to avoid rate limiting
        if i % 10 == 0:
            time.sleep(0.5)
    
    print(f"\nLinks imported: {successful_links} successful, {failed_links} failed")
    
    # Summary
    print("\n=== Import Complete ===")
    print(f"Total thoughts: {successful_thoughts}/{len(thoughts)}")
    print(f"Total links: {successful_links}/{len(links)}")
    print(f"ID mapping saved to: thought_id_mapping.json")

if __name__ == "__main__":
    main()
