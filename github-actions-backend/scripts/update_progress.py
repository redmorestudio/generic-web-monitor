#!/usr/bin/env python3
"""
Track import progress and prepare next batch
"""

import json

# Update progress with the thoughts we just imported
progress = {
    "thoughts_imported": [
        "9ef97d759d7c525be1abc8d3c6d1afd0",  # OpenAI
        "106bd0876b202b114115af61835bd36e"   # Anthropic
    ],
    "links_imported": [],
    "thought_id_map": {
        "9ef97d759d7c525be1abc8d3c6d1afd0": "2f8d4c93-ecda-4c03-8ee2-0ad2fc970e36",  # OpenAI
        "106bd0876b202b114115af61835bd36e": "291949e5-8d64-4e8b-b8d4-1b3fa872516c"   # Anthropic
    }
}

# Save progress
with open("/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/import_progress.json", "w") as f:
    json.dump(progress, f, indent=2)

# Load the full knowledge graph
with open("/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/thebrain-knowledge-graph.json", "r") as f:
    full_data = json.load(f)

# Get next 10 thoughts to import (smaller batch for manual import)
next_thoughts = []
for thought in full_data["thoughts"]:
    if thought["id"] not in progress["thoughts_imported"]:
        next_thoughts.append(thought)
        if len(next_thoughts) >= 10:
            break

print(f"Progress updated: {len(progress['thoughts_imported'])} thoughts imported")
print(f"Next batch: {len(next_thoughts)} thoughts ready")

# Save next mini-batch
mini_batch = {
    "thoughts": next_thoughts,
    "progress": progress
}

with open("/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/mini_batch.json", "w") as f:
    json.dump(mini_batch, f, indent=2)

print("\nNext thoughts to import:")
for i, t in enumerate(next_thoughts):
    print(f"{i+1}. {t['name']} ({t['label']})")

