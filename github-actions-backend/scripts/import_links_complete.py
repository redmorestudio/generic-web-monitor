#!/usr/bin/env python3
"""
Complete links import with full ID mapping
"""

import json
import subprocess
import sys
import time

# Configuration
BRAIN_ID = "134f1325-4a8d-46d7-a078-5386c8ab3542"
API_KEY = "4c8eabea756ab437069c89c46ce7cf00c477591ab9787a526617370d22a4266c"

# Load knowledge graph
kg_file = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/thebrain-knowledge-graph.json"
with open(kg_file, "r") as f:
    data = json.load(f)

print("Step 1: Building complete ID mapping from TheBrain...")

# First, let's get all thoughts from TheBrain to build our mapping
# We'll use the search API to find all thoughts
id_mapping = {}
name_to_new_id = {}

# Build a map of old ID to name from our knowledge graph
old_id_to_name = {}
for thought in data["thoughts"]:
    old_id_to_name[thought["id"]] = thought["name"]

print(f"Found {len(old_id_to_name)} thoughts in knowledge graph")

# Search for each thought by name to get its new ID
print("\nSearching for thoughts in TheBrain to build ID mapping...")
search_count = 0

for old_id, name in old_id_to_name.items():
    search_count += 1
    if search_count % 10 == 0:
        print(f"Progress: {search_count}/{len(old_id_to_name)} thoughts mapped...")
    
    # Use curl to search for the thought
    cmd = f'''curl -s -X POST "https://api.thebrain.com/v2/brains/{BRAIN_ID}/thoughts/search" \
        -H "Authorization: Bearer {API_KEY}" \
        -H "Content-Type: application/json" \
        -d '{{"queryText": "{name}", "onlySearchThoughtNames": true, "maxResults": 5}}'
    '''
    
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    
    if result.returncode == 0:
        try:
            response = json.loads(result.stdout)
            if response.get("searchResults"):
                for result_item in response["searchResults"]:
                    if result_item.get("name") == name:
                        new_id = result_item.get("id")
                        if new_id:
                            id_mapping[old_id] = new_id
                            name_to_new_id[name] = new_id
                            break
        except json.JSONDecodeError:
            pass
    
    # Small delay to avoid rate limiting
    if search_count % 20 == 0:
        time.sleep(1)

print(f"\nSuccessfully mapped {len(id_mapping)} out of {len(old_id_to_name)} thoughts")

# Save the mapping for future use
mapping_file = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/id_mapping.json"
with open(mapping_file, "w") as f:
    json.dump({
        "id_mapping": id_mapping,
        "name_to_id": name_to_new_id
    }, f, indent=2)
print(f"Saved ID mapping to {mapping_file}")

# Now create the links import script with the correct IDs
print("\nStep 2: Creating links import script with correct IDs...")

script_content = f"""#!/bin/bash
# TheBrain links import with correct ID mapping
# Generated with complete ID mapping

echo "Importing links with correct ID mapping..."

BRAIN_ID="{BRAIN_ID}"
API_KEY="{API_KEY}"

"""

# Process links
successful_links = 0
skipped_links = 0

for i, link in enumerate(data["links"]):
    old_a = link.get("thoughtIdA")
    old_b = link.get("thoughtIdB")
    
    if old_a in id_mapping and old_b in id_mapping:
        new_a = id_mapping[old_a]
        new_b = id_mapping[old_b]
        
        name_a = old_id_to_name.get(old_a, "Unknown")
        name_b = old_id_to_name.get(old_b, "Unknown")
        
        relation = link.get("relation", 3)  # Default to jump
        link_name = link.get("name", "").replace('"', '\\"').replace("'", "\\'")
        color = link.get("color", "#6fbf6f")
        thickness = link.get("thickness", 1)
        direction = link.get("direction", 0)
        
        if (i + 1) % 50 == 1:
            script_content += f'\necho "Progress: Importing links {i+1} to {min(i+50, len(data["links"]))}..."\n'
        
        script_content += f'''
# Link {i+1}: {name_a} -> {name_b}
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \\
  -H "Authorization: Bearer $API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{{"thoughtIdA": "{new_a}", "thoughtIdB": "{new_b}", "relation": {relation}, "name": "{link_name}", "color": "{color}", "thickness": {thickness}, "direction": {direction}}}' \\
  -s > /dev/null
'''
        
        if (i + 1) % 10 == 0:
            script_content += "sleep 1\n"
        
        successful_links += 1
    else:
        skipped_links += 1

script_content += f'''
echo ""
echo "Links import completed!"
echo "Successfully mapped links: {successful_links}"
echo "Skipped links (missing thoughts): {skipped_links}"
'''

# Save the script
script_path = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/scripts/import_mapped_links.sh"
with open(script_path, "w") as f:
    f.write(script_content)

import os
os.chmod(script_path, 0o755)

print(f"\nLinks import script created: {script_path}")
print(f"Links that can be imported: {successful_links}")
print(f"Links skipped (missing thoughts): {skipped_links}")
print(f"\nRun the script with: {script_path}")
