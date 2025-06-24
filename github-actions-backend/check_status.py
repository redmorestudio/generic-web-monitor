#!/usr/bin/env python3
"""
Check TheBrain Import Status
"""
import json
import os

BASE_DIR = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data"

# Load original data
with open(os.path.join(BASE_DIR, "thebrain-knowledge-graph.json"), 'r') as f:
    original_data = json.load(f)

# Load current mappings
mapping_file = os.path.join(BASE_DIR, "id_mapping_current.json")
if os.path.exists(mapping_file):
    with open(mapping_file, 'r') as f:
        current_mappings = json.load(f)
else:
    current_mappings = {}

# Count batches
batch_count = 0
for i in range(1, 100):
    if os.path.exists(os.path.join(BASE_DIR, f"import_batch_{i}.json")):
        batch_count = i
    else:
        break

print("TheBrain Import Status")
print("="*60)
print(f"Original brain: {original_data['brain']['name']}")
print(f"Target brain ID: 134f1325-4a8d-46d7-a078-5386c8ab3542")
print()
print("Progress:")
print(f"- Total thoughts in source: {len(original_data['thoughts'])}")
print(f"- Thoughts imported: {len(current_mappings)}")
print(f"- Thoughts remaining: {len(original_data['thoughts']) - len(current_mappings)}")
print(f"- Progress: {len(current_mappings)/len(original_data['thoughts'])*100:.1f}%")
print()
print(f"- Total links to import: {len(original_data['links'])}")
print(f"- Batches prepared: {batch_count}")
print()

if len(current_mappings) > 0:
    print("Recently imported thoughts:")
    items = list(current_mappings.items())[-5:]  # Last 5
    for old_id, new_id in items:
        # Find thought name
        thought = next((t for t in original_data['thoughts'] if t['id'] == old_id), None)
        if thought:
            print(f"  - {thought['name']} ({thought.get('label', 'N/A')})")

print("\nTo continue import:")
print("1. Run: python3 run_import.py")
print("   This will import all remaining thoughts in batches")
print("2. Or run specific batch: python3 run_import.py 1")
print("   This will import just batch 1")
print("\nThe script uses npx @modelcontextprotocol/cli to execute imports.")
