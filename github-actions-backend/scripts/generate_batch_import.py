#!/usr/bin/env python3
"""
Batch import script for TheBrain using MCP commands
This generates a script you can run directly to import all thoughts
"""

import json
import os

# Load knowledge graph
kg_file = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/thebrain-knowledge-graph.json"
progress_file = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/import_progress.json"

with open(kg_file, "r") as f:
    data = json.load(f)

# Load progress
try:
    with open(progress_file, "r") as f:
        progress = json.load(f)
except:
    progress = {
        "thoughts_imported": [],
        "links_imported": [],
        "thought_id_map": {}
    }

# Generate import commands for ALL remaining thoughts
print("#!/bin/bash")
print("# TheBrain Batch Import Script")
print("# Generated on:", str(datetime.now()))
print("# Total thoughts to import:", len(data["thoughts"]) - len(progress["thoughts_imported"]))
print()

print("# Set up progress tracking")
print("PROGRESS_FILE='/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/import_progress.json'")
print()

count = 0
for thought in data["thoughts"]:
    if thought["id"] not in progress["thoughts_imported"]:
        # Escape quotes in strings
        name = thought["name"].replace('"', '\\"').replace("'", "\\'")
        label = thought.get("label", "").replace('"', '\\"').replace("'", "\\'")
        
        print(f"# Import thought {count + 1}: {name}")
        print(f"echo 'Importing: {name}'")
        
        # Create the thought using Claude CLI with MCP
        cmd = f"""claude mcp run thebrain-mcp:create_thought '{{"name": "{name}", "label": "{label}", "kind": {thought.get("kind", 1)}, "acType": {thought.get("acType", 0)}, "foregroundColor": "{thought.get("foregroundColor", "#ffffff")}", "backgroundColor": "{thought.get("backgroundColor", "#0f0f1e")}"}}'"""
        
        print(cmd)
        print()
        
        count += 1
        
        # Add a delay every 10 thoughts to avoid rate limiting
        if count % 10 == 0:
            print("# Brief pause to avoid rate limiting")
            print("sleep 2")
            print()

print(f"echo 'Import complete! Imported {count} thoughts.'")
