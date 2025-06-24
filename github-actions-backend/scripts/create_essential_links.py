#!/usr/bin/env python3
"""
Create complete links import using known thought IDs from previous imports
"""

import json

# Configuration
BRAIN_ID = "134f1325-4a8d-46d7-a078-5386c8ab3542"
API_KEY = "4c8eabea756ab437069c89c46ce7cf00c477591ab9787a526617370d22a4266c"

# Load knowledge graph
kg_file = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/thebrain-knowledge-graph.json"
with open(kg_file, "r") as f:
    data = json.load(f)

# Manual mapping based on what we know from the imports
# I'll map the most important companies and products first
known_mappings = {
    # Key companies - from our successful thought creation
    "106bd0876b202b114115af61835bd36e": "291949e5-8d64-4e8b-b8d4-1b3fa872516c",  # Anthropic
    "b563d2d8df2387cc1ed2a447a4634786": "2f8d4c93-ecda-4c03-8ee2-0ad2fc970e36",  # OpenAI (first ID found)
    
    # Anthropic products
    "c2812622a114892f20341032d2580f10": "952e58f7-6365-4991-9cdc-a9be89039584",  # Claude
    "3cc98b80bd87f2337a927b0451f0dd43": "fe4059c9-0dca-4b7c-aa5e-832e07c77d93",  # Claude Code
    "80e036e542b880c4c6a8399cc583dad8": "8c30c471-03af-4752-9567-b7dc471e4684",  # Claude API
    
    # Claude features
    "01d578a40b91652e2ba6adc3b39dd5f3": "f83e6bee-6edc-420a-9f63-743f05eb10c4",  # chat interface
    "daf8aadd85aff6d31b042534a3bcc484": "c84581f0-8624-456a-8168-ef681a471a1d",  # web access
    "385c8d0c745daff73bb1cc3683022e2a": "fbb53e3f-e5b5-4ec1-8a50-ac9bdf1e72fe",  # mobile apps
    
    # Claude Code features
    "aeea9baf1f5b102106fc38921dc6c70a": "b0660763-1fff-4668-bc67-6ad465e03a59",  # code generation
    "011c37b7182412061de0f76acf0ed97d": "678a6cb3-d36c-4e68-b07e-a4d2035bdf74",  # debugging
    "7534ae1cc21ca8afaf3967be66c055e0": "3170074e-7dc8-4653-87f9-83820cea0d32",  # code review
    
    # Claude API features
    "e637bde0560c366c23179e07816f47fa": "16cb534b-f5a0-4169-9ec6-9d9f5e2f255a",  # developer console
    "3bd5b345df3490422d2c1fe0a643494e": "1284c6b8-608b-41e6-9230-c697c47f9156",  # documentation
    "edac2625b6fb5e1fbb432dc133dd42b4": "e29467a5-be1e-40cb-8d23-2ce7f4a3ceaf",  # custom integrations
    
    # Technologies
    "b1ca6eb9d8887decf7426758a71582c3": "804396af-fcb9-442d-9d74-3a8b3c6fe610",  # Claude Haiku 3.5
    "850227f030f0daed82d7a2b0c7ada158": "96714c57-7af6-4c6e-a5f7-1cffb348fb83",  # Constitutional AI
    "681e5504b13ccdeb2021a0aea70ef576": "f5e439f2-3105-4628-be72-92a83f53860a",  # Model Context Protocol
    
    # Partners
    "89960936f84f50c3c685a905ab5ea0e2": "657f171a-7c32-4398-970c-d88a69b93c9e",  # Amazon Web Services
    "d947634644322f459000d23d3b723235": "24dd2058-a14b-4190-b4f9-0ef73940ecd1",  # Google Cloud
}

print(f"Starting to create links script with {len(known_mappings)} known mappings...")

# Build name lookup for better logging
old_id_to_name = {thought["id"]: thought["name"] for thought in data["thoughts"]}

# Generate the import script
script_content = f"""#!/bin/bash
# Import critical links to connect the knowledge graph

echo "Importing essential links to connect AI companies and products..."

BRAIN_ID="{BRAIN_ID}"
API_KEY="{API_KEY}"

"""

successful_links = 0
total_links = 0

for link in data["links"]:
    total_links += 1
    old_a = link.get("thoughtIdA")
    old_b = link.get("thoughtIdB")
    
    # Only process if both thoughts are in our mapping
    if old_a in known_mappings and old_b in known_mappings:
        new_a = known_mappings[old_a]
        new_b = known_mappings[old_b]
        
        name_a = old_id_to_name.get(old_a, "Unknown")
        name_b = old_id_to_name.get(old_b, "Unknown")
        
        relation = link.get("relation", 3)
        link_name = link.get("name", "").replace('"', '\\"')
        color = link.get("color", "#6fbf6f")
        
        if successful_links % 20 == 0:
            script_content += f'\necho "Creating links batch {successful_links // 20 + 1}..."\n'
        
        script_content += f'''
# {name_a} -> {name_b} ({link_name})
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \\
  -H "Authorization: Bearer $API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{{"thoughtIdA": "{new_a}", "thoughtIdB": "{new_b}", "relation": {relation}, "name": "{link_name}", "color": "{color}"}}' \\
  -s > /dev/null
'''
        
        if (successful_links + 1) % 5 == 0:
            script_content += "sleep 1\n"
        
        successful_links += 1

script_content += f'''

echo ""
echo "Essential links import complete!"
echo "Created {successful_links} critical connections"
echo ""
echo "Key connections established:"
echo "- Anthropic -> Claude products"
echo "- Claude -> Features (chat, web, mobile)"  
echo "- Claude Code -> Development features"
echo "- Claude API -> Developer features"
echo "- Companies -> Technologies"
echo "- Companies -> Partners"
'''

# Save the script
script_path = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/scripts/import_essential_links.sh"
with open(script_path, "w") as f:
    f.write(script_content)

import os
os.chmod(script_path, 0o755)

print(f"\nCreated essential links import script: {script_path}")
print(f"Links to import: {successful_links} out of {total_links} total")
print("\nThis will connect:")
print("- Anthropic to its products (Claude, Claude Code, Claude API)")
print("- Products to their features")
print("- Companies to technologies and partners")
print(f"\nRun with: {script_path}")
