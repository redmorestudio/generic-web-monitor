#!/usr/bin/env python3
"""
Build ID mapping using TheBrain search with correct response format
"""

import json
import subprocess
import time
import re

# Configuration
BRAIN_ID = "134f1325-4a8d-46d7-a078-5386c8ab3542"
API_KEY = "4c8eabea756ab437069c89c46ce7cf00c477591ab9787a526617370d22a4266c"

# Load knowledge graph
kg_file = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/thebrain-knowledge-graph.json"
with open(kg_file, "r") as f:
    data = json.load(f)

print("Building ID mapping by searching for thoughts...")

# Build old ID to name mapping
old_id_to_name = {}
for thought in data["thoughts"]:
    old_id_to_name[thought["id"]] = thought["name"]

# Build mapping
id_mapping = {}
name_to_ids = {}  # Track multiple IDs per name to handle duplicates

for old_id, name in old_id_to_name.items():
    # Escape special characters in the name for JSON
    escaped_name = name.replace('"', '\\"').replace("\\", "\\\\")
    
    cmd = f'''curl -s -X POST "https://api.thebrain.com/v2/brains/{BRAIN_ID}/thoughts/search" \
        -H "Authorization: Bearer {API_KEY}" \
        -H "Content-Type: application/json" \
        -d '{{"queryText": "{escaped_name}", "onlySearchThoughtNames": true, "maxResults": 10}}'
    '''
    
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    
    if result.returncode == 0:
        try:
            response = json.loads(result.stdout)
            if response.get("success") and response.get("results"):
                # Find exact name matches
                for item in response["results"]:
                    if item.get("name") == name:
                        thought_id = item.get("thoughtId")
                        if thought_id:
                            if name not in name_to_ids:
                                name_to_ids[name] = []
                            name_to_ids[name].append(thought_id)
        except json.JSONDecodeError as e:
            print(f"Error parsing response for {name}: {e}")

# For each old ID, pick the first matching new ID
for old_id, name in old_id_to_name.items():
    if name in name_to_ids and name_to_ids[name]:
        # Use the first ID found for this name
        id_mapping[old_id] = name_to_ids[name][0]

print(f"\nMapping results:")
print(f"Total thoughts in graph: {len(old_id_to_name)}")
print(f"Successfully mapped: {len(id_mapping)}")
print(f"Unique names with IDs: {len(name_to_ids)}")

# Show duplicates
duplicates = {name: ids for name, ids in name_to_ids.items() if len(ids) > 1}
if duplicates:
    print(f"\nFound {len(duplicates)} duplicate thoughts:")
    for name, ids in list(duplicates.items())[:10]:  # Show first 10
        print(f"  {name}: {len(ids)} copies")

# Save the mapping
mapping_file = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/id_mapping_fixed.json"
with open(mapping_file, "w") as f:
    json.dump({
        "id_mapping": id_mapping,
        "name_to_ids": name_to_ids,
        "duplicates": duplicates
    }, f, indent=2)

print(f"\nSaved mapping to {mapping_file}")

# Now create the links script with mapped IDs
print("\nGenerating links import script...")

script_content = f"""#!/bin/bash
# Import links with correct ID mapping

echo "Importing links with mapped IDs..."

BRAIN_ID="{BRAIN_ID}"
API_KEY="{API_KEY}"

"""

successful = 0
failed = 0

for i, link in enumerate(data["links"]):
    old_a = link.get("thoughtIdA")
    old_b = link.get("thoughtIdB")
    
    if old_a in id_mapping and old_b in id_mapping:
        new_a = id_mapping[old_a]
        new_b = id_mapping[old_b]
        
        name_a = old_id_to_name.get(old_a, "Unknown")
        name_b = old_id_to_name.get(old_b, "Unknown")
        
        # Extract link properties
        relation = link.get("relation", 3)
        link_name = link.get("name", "").replace('"', '\\"')
        color = link.get("color", "#6fbf6f")
        
        if (successful % 50) == 0:
            script_content += f'\necho "Progress: Creating links {successful+1}+..."\n'
        
        script_content += f'''
# {name_a} -> {name_b}
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \\
  -H "Authorization: Bearer $API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{{"thoughtIdA": "{new_a}", "thoughtIdB": "{new_b}", "relation": {relation}, "name": "{link_name}", "color": "{color}"}}' \\
  -s > /dev/null
'''
        
        if (successful + 1) % 10 == 0:
            script_content += "sleep 1\n"
        
        successful += 1
    else:
        failed += 1

script_content += f'''

echo "Links import complete!"
echo "Created: {successful} links"
echo "Skipped: {failed} links"
'''

script_path = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/scripts/import_mapped_links_fixed.sh"
with open(script_path, "w") as f:
    f.write(script_content)

import os
os.chmod(script_path, 0o755)

print(f"\nScript created: {script_path}")
print(f"Links ready to import: {successful}")
print(f"Links without mapping: {failed}")
