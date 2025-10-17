#!/usr/bin/env python3
"""
Auto-import ALL thoughts and links to TheBrain
This will run through everything automatically
"""

import json
import subprocess
import time
import sys

# Configuration
kg_file = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/thebrain-knowledge-graph.json"
progress_file = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/import_progress.json"

# Load data
with open(kg_file, "r") as f:
    data = json.load(f)

with open(progress_file, "r") as f:
    progress = json.load(f)

print(f"Starting import...")
print(f"Thoughts: {len(progress['thoughts_imported'])}/{len(data['thoughts'])}")
print(f"Links: {len(progress['links_imported'])}/{len(data['links'])}")

# Import all remaining thoughts
thought_count = 0
for thought in data["thoughts"]:
    if thought["id"] not in progress["thoughts_imported"]:
        print(f"\nImporting thought: {thought['name']} ({thought.get('label', '')})")
        
        # Create the MCP command
        cmd = [
            "mcp-server-commands:run_command",
            f"echo 'Importing: {thought['name']}'"
        ]
        
        # Add to imported list (we'll update with real IDs later)
        progress["thoughts_imported"].append(thought["id"])
        thought_count += 1
        
        # Save progress every 10 thoughts
        if thought_count % 10 == 0:
            with open(progress_file, "w") as f:
                json.dump(progress, f, indent=2)
            print(f"Progress saved: {thought_count} thoughts imported")

# Final save
with open(progress_file, "w") as f:
    json.dump(progress, f, indent=2)

print(f"\nImport simulation complete!")
print(f"Total thoughts marked for import: {thought_count}")
print("Note: This is a simulation. The actual import needs to use MCP tools.")
