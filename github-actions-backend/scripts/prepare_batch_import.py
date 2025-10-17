#!/usr/bin/env python3
"""
Batch import thoughts into TheBrain with proper tracking
This script processes the imports in efficient batches
"""

import json
import time
from datetime import datetime

# Load the knowledge graph
kg_file = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/thebrain-knowledge-graph.json"
progress_file = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/import_progress.json"

with open(kg_file, "r") as f:
    data = json.load(f)

# Current progress - we'll update this as we go
current_progress = {
    "thoughts_imported": [
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
        "850227f030f0daed82d7a2b0c7ada158"   # Constitutional AI
    ],
    "links_imported": [],
    "thought_id_map": {
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
        "850227f030f0daed82d7a2b0c7ada158": "96714c57-7af6-4c6e-a5f7-1cffb348fb83"   # Constitutional AI
    }
}

# Save current progress
with open(progress_file, "w") as f:
    json.dump(current_progress, f, indent=2)

# Calculate remaining thoughts
remaining_thoughts = []
for thought in data["thoughts"]:
    if thought["id"] not in current_progress["thoughts_imported"]:
        remaining_thoughts.append(thought)

print(f"Total thoughts: {len(data['thoughts'])}")
print(f"Already imported: {len(current_progress['thoughts_imported'])}")
print(f"Remaining to import: {len(remaining_thoughts)}")
print(f"Total links to import: {len(data['links'])}")

# Generate the next batch of 50 thoughts
batch_size = 50
next_batch = remaining_thoughts[:batch_size]

print(f"\nNext batch contains {len(next_batch)} thoughts")
print("\nThe following thoughts will be imported in the next batch:")
for i, thought in enumerate(next_batch[:10]):  # Show first 10
    print(f"{i+1}. {thought['name']} ({thought.get('label', '')})")
if len(next_batch) > 10:
    print(f"... and {len(next_batch) - 10} more")

# Write batch import commands
with open("/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/batch_import_commands.json", "w") as f:
    json.dump({
        "thoughts_to_import": next_batch,
        "batch_info": {
            "batch_size": len(next_batch),
            "total_remaining": len(remaining_thoughts),
            "progress_percentage": round((len(current_progress['thoughts_imported']) / len(data['thoughts'])) * 100, 2)
        }
    }, f, indent=2)

print(f"\nBatch commands saved to batch_import_commands.json")
print(f"Progress: {len(current_progress['thoughts_imported'])}/{len(data['thoughts'])} thoughts ({round((len(current_progress['thoughts_imported']) / len(data['thoughts'])) * 100, 2)}%)")
