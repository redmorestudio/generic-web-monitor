#!/usr/bin/env python3
"""
Batch import TheBrain knowledge graph
"""
import json
import time
import os

# Configuration
JSON_PATH = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/thebrain-knowledge-graph.json"
BATCH_SIZE = 50  # Process 50 items at a time
BRAIN_ID = "134f1325-4a8d-46d7-a078-5386c8ab3542"

# Load data
print("Loading data...")
with open(JSON_PATH, 'r') as f:
    data = json.load(f)

thoughts = data['thoughts']
links = data['links']

print(f"Total thoughts: {len(thoughts)}")
print(f"Total links: {len(links)}")

# Prepare batch files
print("\nPreparing batch files...")

# Split thoughts into batches
thought_batches = []
for i in range(0, len(thoughts), BATCH_SIZE):
    batch = thoughts[i:i + BATCH_SIZE]
    thought_batches.append({
        'batch_num': len(thought_batches) + 1,
        'start_idx': i,
        'end_idx': min(i + BATCH_SIZE, len(thoughts)),
        'thoughts': batch
    })

# Save batch info
batch_info = {
    'total_thoughts': len(thoughts),
    'total_links': len(links),
    'batch_size': BATCH_SIZE,
    'num_batches': len(thought_batches),
    'brain_id': BRAIN_ID,
    'thought_batches': []
}

# Save each batch
for i, batch in enumerate(thought_batches):
    batch_file = f"/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/thought_batch_{i+1}.json"
    with open(batch_file, 'w') as f:
        json.dump(batch, f, indent=2)
    
    batch_info['thought_batches'].append({
        'batch_num': i + 1,
        'file': batch_file,
        'count': len(batch['thoughts'])
    })
    print(f"Created batch {i+1}: {len(batch['thoughts'])} thoughts")

# Save batch info
with open("/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/batch_info.json", 'w') as f:
    json.dump(batch_info, f, indent=2)

# Also save links for later processing
with open("/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/links_to_import.json", 'w') as f:
    json.dump({'links': links}, f, indent=2)

print(f"\nBatch preparation complete!")
print(f"Created {len(thought_batches)} thought batches")
print("Ready for import process")
