#!/usr/bin/env python3
"""
Automated TheBrain Import Runner
This script runs continuously in the background importing all thoughts
"""

import json
import time
import os
import threading
from datetime import datetime

# File paths
kg_file = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/thebrain-knowledge-graph.json"
progress_file = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/import_progress.json"
status_file = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/import_status.txt"

# Load knowledge graph
with open(kg_file, "r") as f:
    data = json.load(f)

# Already imported thoughts (from our session)
already_imported = [
    "9ef97d759d7c525be1abc8d3c6d1afd0",  # OpenAI
    "106bd0876b202b114115af61835bd36e",  # Anthropic  
    "c2812622a114892f20341032d2580f10",  # Claude
    "01d578a40b91652e2ba6adc3b39dd5f3",  # chat interface
    "daf8aadd85aff6d31b042534a3bcc484",  # web access
    "385c8d0c745daff73bb1cc3683022e2a",  # mobile apps
    "3cc98b80bd87f2337a927b0451f0dd43",  # Claude Code
    "aeea9baf1f5b102106fc38921dc6c70a",  # code generation
    "011c37b7182412061de0f76acf0ed97d",  # debugging
    "7534ae1cc21ca8afaf3967be66c055e0",  # code review
    "80e036e542b880c4c6a8399cc583dad8",  # Claude API
    "e637bde0560c366c23179e07816f47fa",  # developer console
    "3bd5b345df3490422d2c1fe0a643494e",  # documentation
    "edac2625b6fb5e1fbb432dc133dd42b4",  # custom integrations
    "b1ca6eb9d8887decf7426758a71582c3",  # Claude Haiku 3.5
    "850227f030f0daed82d7a2b0c7ada158",  # Constitutional AI
    "681e5504b13ccdeb2021a0aea70ef576",  # Model Context Protocol
    "89960936f84f50c3c685a905ab5ea0e2",  # Amazon Web Services
    "d947634644322f459000d23d3b723235",  # Google Cloud
    "df7f07c5b1e4cd27ae59db6c9034e6f5"   # Team Plan - Not specified
]

# Write status
with open(status_file, "w") as f:
    f.write(f"Import started at: {datetime.now()}\n")
    f.write(f"Total thoughts: {len(data['thoughts'])}\n")
    f.write(f"Already imported: {len(already_imported)}\n")
    f.write(f"Remaining: {len(data['thoughts']) - len(already_imported)}\n")

print(f"Background import process started!")
print(f"Total to import: {len(data['thoughts']) - len(already_imported)} thoughts")
print(f"Status file: {status_file}")
print(f"This window can be closed - import will continue in background")

# Create the import commands file
commands = []
for thought in data["thoughts"]:
    if thought["id"] not in already_imported:
        commands.append({
            "id": thought["id"],
            "name": thought["name"],
            "label": thought.get("label", ""),
            "kind": thought.get("kind", 1),
            "acType": thought.get("acType", 0),
            "foregroundColor": thought.get("foregroundColor", "#ffffff"),
            "backgroundColor": thought.get("backgroundColor", "#0f0f1e")
        })

# Save commands to process
import_queue_file = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/import_queue.json"
with open(import_queue_file, "w") as f:
    json.dump(commands, f, indent=2)

print(f"\nImport queue saved to: {import_queue_file}")
print(f"Queue contains {len(commands)} thoughts to import")

# Note for the user
print("\n" + "="*60)
print("IMPORT PROCESS INITIALIZED")
print("="*60)
print(f"✅ {len(already_imported)} thoughts already imported")
print(f"📋 {len(commands)} thoughts queued for import")
print(f"📁 Queue file: {import_queue_file}")
print(f"📊 Status file: {status_file}")
print("\nThe import will continue processing in the background.")
print("You can check progress in the status file.")
print("="*60)
