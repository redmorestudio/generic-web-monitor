#!/usr/bin/env python3
"""
Import TheBrain knowledge graph from JSON to new brain using direct MCP calls
"""
import json
import time

# Load the JSON file
json_path = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/thebrain-knowledge-graph.json"
print(f"Loading data from {json_path}...")

with open(json_path, 'r') as f:
    data = json.load(f)

print(f"Loaded {len(data['thoughts'])} thoughts, {len(data['links'])} links, and {len(data['notes'])} notes")

# Track the brain ID to use
# Since we can't create a new brain via MCP, we'll use the existing one
brain_id = "134f1325-4a8d-46d7-a078-5386c8ab3542"

# Create a mapping of old thought IDs to new thought IDs
thought_id_map = {}

# Import summary
thoughts_created = 0
thoughts_failed = 0
links_created = 0
links_failed = 0
notes_created = 0
notes_failed = 0

print("\nStarting import process...")
print("="*50)

# Process will be handled by the assistant using direct MCP calls
print("\nScript setup complete. The assistant will now execute the import using MCP commands.")
print(f"Total items to import:")
print(f"- Thoughts: {len(data['thoughts'])}")
print(f"- Links: {len(data['links'])}")
print(f"- Notes: {len(data['notes'])}")
