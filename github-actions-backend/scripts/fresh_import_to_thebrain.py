#!/usr/bin/env python3
"""
Fresh import of AI Competitive Intelligence data to TheBrain
Creates a new brain and imports all thoughts and links properly
"""

import json
import requests
import time
from datetime import datetime

# TheBrain API credentials
API_KEY = "4c8eabea756ab437069c89c46ce7cf00c477591ab9787a526617370d22a4266c"
BASE_URL = "https://api.thebrain.com/v2"

# Headers for API requests
headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

# Create a new brain
def create_new_brain():
    print("Creating new brain...")
    brain_data = {
        "name": f"AI-Monitor-Fresh-{datetime.now().strftime('%Y%m%d-%H%M%S')}",
        "description": "AI Competitive Intelligence Knowledge Graph"
    }
    
    # Note: TheBrain API doesn't have a direct create brain endpoint
    # We'll need to use the existing brain or create manually
    # For now, let's use the existing brain ID and clear it
    
    # Actually, let's just generate a mapping for a fresh import
    return None

# Load the knowledge graph data
def load_data():
    with open("/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/thebrain-knowledge-graph.json", "r") as f:
        return json.load(f)

# Create all thoughts
def create_thoughts(brain_id, thoughts_data):
    print(f"\nCreating {len(thoughts_data)} thoughts...")
    thought_id_map = {}
    
    for i, thought in enumerate(thoughts_data):
        if i % 50 == 0:
            print(f"Progress: {i}/{len(thoughts_data)} thoughts created...")
            time.sleep(1)  # Rate limiting
        
        # Create the thought
        thought_payload = {
            "name": thought["name"],
            "label": thought.get("label", ""),
            "kind": thought.get("kind", 1),
            "acType": thought.get("acType", 0),
            "foregroundColor": thought.get("foregroundColor", "#ffffff"),
            "backgroundColor": thought.get("backgroundColor", "#000000")
        }
        
        try:
            response = requests.post(
                f"{BASE_URL}/brains/{brain_id}/thoughts",
                headers=headers,
                json=thought_payload
            )
            
            if response.status_code == 200:
                result = response.json()
                new_id = result["id"]
                thought_id_map[thought["id"]] = new_id
                print(f"✓ Created: {thought['name']} -> {new_id}")
            else:
                print(f"✗ Failed to create thought {thought['name']}: {response.text}")
                
        except Exception as e:
            print(f"✗ Error creating thought {thought['name']}: {str(e)}")
    
    return thought_id_map

# Create all links
def create_links(brain_id, links_data, thought_id_map):
    print(f"\nCreating {len(links_data)} links...")
    successful_links = 0
    
    for i, link in enumerate(links_data):
        if i % 50 == 0:
            print(f"Progress: {i}/{len(links_data)} links created...")
            time.sleep(1)  # Rate limiting
        
        # Map old IDs to new IDs
        old_id_a = link.get("thoughtIdA", "")
        old_id_b = link.get("thoughtIdB", "")
        
        if old_id_a not in thought_id_map or old_id_b not in thought_id_map:
            print(f"✗ Skipping link - missing thought IDs: {old_id_a} -> {old_id_b}")
            continue
        
        new_id_a = thought_id_map[old_id_a]
        new_id_b = thought_id_map[old_id_b]
        
        # Create the link
        link_payload = {
            "thoughtIdA": new_id_a,
            "thoughtIdB": new_id_b,
            "relation": link.get("relation", 3),  # Default to jump (3)
            "name": link.get("name", ""),
            "color": link.get("color", "#6fbf6f"),
            "thickness": link.get("thickness", 1),
            "direction": link.get("direction", 0)
        }
        
        try:
            response = requests.post(
                f"{BASE_URL}/brains/{brain_id}/links",
                headers=headers,
                json=link_payload
            )
            
            if response.status_code == 200:
                successful_links += 1
            else:
                print(f"✗ Failed to create link {link.get('name', '')}: {response.text}")
                
        except Exception as e:
            print(f"✗ Error creating link: {str(e)}")
    
    print(f"\nSuccessfully created {successful_links}/{len(links_data)} links")
    return successful_links

# Main import function
def main():
    print("=== Fresh TheBrain Import ===")
    
    # Load data
    data = load_data()
    thoughts = data["thoughts"]
    links = data["links"]
    
    print(f"Loaded {len(thoughts)} thoughts and {len(links)} links")
    
    # Use the new brain we'll create manually
    # For now, let's use a fresh brain ID that we'll get from TheBrain
    brain_id = input("Please create a new brain in TheBrain and enter its ID: ").strip()
    
    if not brain_id:
        print("No brain ID provided. Exiting.")
        return
    
    # Create all thoughts
    thought_id_map = create_thoughts(brain_id, thoughts)
    
    # Save the mapping for reference
    with open("/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/thought_id_mapping.json", "w") as f:
        json.dump(thought_id_map, f, indent=2)
    
    print(f"\nSuccessfully created {len(thought_id_map)}/{len(thoughts)} thoughts")
    
    # Create all links
    if thought_id_map:
        create_links(brain_id, links, thought_id_map)
    
    print("\n=== Import Complete ===")
    print(f"Brain ID: {brain_id}")
    print(f"Created {len(thought_id_map)} thoughts")
    print("Check TheBrain to see your imported knowledge graph!")

if __name__ == "__main__":
    main()
