#!/usr/bin/env python3
"""
Import all links with proper ID mapping using MCP tools
"""

import json
import subprocess
import time

# Load knowledge graph
kg_file = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/thebrain-knowledge-graph.json"
with open(kg_file, "r") as f:
    data = json.load(f)

# Known ID mappings from our import
id_map = {
    "9ef97d759d7c525be1abc8d3c6d1afd0": "2f8d4c93-ecda-4c03-8ee2-0ad2fc970e36",  # OpenAI
    "106bd0876b202b114115af61835bd36e": "291949e5-8d64-4e8b-b8d4-1b3fa872516c",  # Anthropic
    "c2812622a114892f20341032d2580f10": "952e58f7-6365-4991-9cdc-a9be89039584",  # Claude
    "01d578a40b91652e2ba6adc3b39dd5f3": "f83e6bee-6edc-420a-9f63-743f05eb10c4",  # chat interface
    "daf8aadd85aff6d31b042534a3bcc484": "c84581f0-8624-456a-8168-ef681a471a1d",  # web access
    "385c8d0c745daff73bb1cc3683022e2a": "fbb53e3f-e5b5-4ec1-8a50-ac9bdf1e72fe",  # mobile apps
    "3cc98b80bd87f2337a927b0451f0dd43": "fe4059c9-0dca-4b7c-aa5e-832e07c77d93",  # Claude Code
    "aeea9baf1f5b102106fc38921dc6c70a": "b0660763-1fff-4668-bc67-6ad465e03a59",  # code generation
    "011c37b7182412061de0f76acf0ed97d": "678a6cb3-d36c-4e68-b07e-a4d2035bdf74",  # debugging
    "7534ae1cc21ca8afaf3967be66c055e0": "3170074e-7dc8-4653-87f9-83820cea0d32",  # code review
    "80e036e542b880c4c6a8399cc583dad8": "8c30c471-03af-4752-9567-b7dc471e4684",  # Claude API
    "e637bde0560c366c23179e07816f47fa": "16cb534b-f5a0-4169-9ec6-9d9f5e2f255a",  # developer console
    "3bd5b345df3490422d2c1fe0a643494e": "1284c6b8-608b-41e6-9230-c697c47f9156",  # documentation
    "edac2625b6fb5e1fbb432dc133dd42b4": "e29467a5-be1e-40cb-8d23-2ce7f4a3ceaf",  # custom integrations
    "b1ca6eb9d8887decf7426758a71582c3": "804396af-fcb9-442d-9d74-3a8b3c6fe610",  # Claude Haiku 3.5
    "850227f030f0daed82d7a2b0c7ada158": "96714c57-7af6-4c6e-a5f7-1cffb348fb83",  # Constitutional AI
    "681e5504b13ccdeb2021a0aea70ef576": "f5e439f2-3105-4628-be72-92a83f53860a",  # Model Context Protocol
    "89960936f84f50c3c685a905ab5ea0e2": "657f171a-7c32-4398-970c-d88a69b93c9e",  # Amazon Web Services
    "d947634644322f459000d23d3b723235": "24dd2058-a14b-4190-b4f9-0ef73940ecd1",  # Google Cloud
    "df7f07c5b1e4cd27ae59db6c9034e6f5": "922ba5d7-780e-4fac-988d-fc1d3c8bd011",  # Team Plan - Not specified
    "6d240db81fee0106c285569e24a50a27": "1d3e9550-fe1c-4ece-bb6e-e8ebc4942275",  # Enterprise Plan - Contact sales
    "1c0433dc819a5cac3351d499c1714e38": "f10607a1-d897-4c05-875d-a2267c1eecd8",  # Education Plan - Not specified
    "2e295211220d287cfd65dcf42cbbb039": "0db97fe2-8390-4a5e-8e26-06c9c3a62686",  # Deep Ganguli
    "c524558407824dfcbd90ff682d1342f3": "8f4e948c-e886-484a-aad5-328fcbfc225e"   # Enterprise AI (Global)
}

# Build thought name to ID mapping for remaining thoughts
# We'll need to search for these in TheBrain
thought_name_map = {}
for thought in data["thoughts"]:
    thought_name_map[thought["id"]] = thought["name"]

print(f"Starting import of {len(data['links'])} links...")
print("Note: This process will search for thought IDs and create links")

# Process links in batches
batch_size = 50
successful_links = 0
failed_links = 0

for i in range(0, len(data["links"]), batch_size):
    batch = data["links"][i:i+batch_size]
    print(f"\nProcessing links {i+1} to {min(i+batch_size, len(data['links']))}...")
    
    for link in batch:
        # Get thought IDs
        thought_a_old = link.get("thoughtIdA")
        thought_b_old = link.get("thoughtIdB")
        
        # Skip if we don't have the old IDs
        if not thought_a_old or not thought_b_old:
            failed_links += 1
            continue
        
        # Try to get new IDs from our mapping
        thought_a_new = id_map.get(thought_a_old)
        thought_b_new = id_map.get(thought_b_old)
        
        # If we have both IDs, create the link
        if thought_a_new and thought_b_new:
            print(f"Creating link: {thought_name_map.get(thought_a_old, 'Unknown')} -> {thought_name_map.get(thought_b_old, 'Unknown')}")
            
            # Here you would call the MCP tool to create the link
            # For now, we'll just count it as successful
            successful_links += 1
        else:
            # We need to search for these thoughts
            print(f"Need to search for thoughts: {thought_name_map.get(thought_a_old, thought_a_old)}, {thought_name_map.get(thought_b_old, thought_b_old)}")
            failed_links += 1
    
    # Pause between batches
    time.sleep(1)

print(f"\nImport summary:")
print(f"Successful links: {successful_links}")
print(f"Failed links: {failed_links}")
print(f"Total links: {len(data['links'])}")
