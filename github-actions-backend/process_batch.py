#!/usr/bin/env python3
"""
Process TheBrain import batch by batch
"""
import json
import os
import time

BASE_DIR = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data"

# Load the import commands
with open(os.path.join(BASE_DIR, "mcp_import_commands.json"), 'r') as f:
    import_data = json.load(f)

# Load current mapping
with open(os.path.join(BASE_DIR, "id_mapping_current.json"), 'r') as f:
    id_mapping = json.load(f)

print(f"Total batches: {import_data['total_batches']}")
print(f"Total thoughts to import: {import_data['total_thoughts']}")
print(f"Already mapped: {len(id_mapping)}")
print("\n" + "="*60)

# Find the next batch to process
current_batch = None
for batch in import_data['batches']:
    # Check if any thought in this batch is not yet mapped
    unmapped = False
    for cmd in batch['commands']:
        if cmd['old_id'] not in id_mapping:
            unmapped = True
            break
    if unmapped:
        current_batch = batch
        break

if current_batch:
    print(f"\nProcessing Batch {current_batch['batch_number']} with {current_batch['thought_count']} thoughts")
    print("="*60)
    
    # Save just this batch for processing
    batch_file = os.path.join(BASE_DIR, "current_batch.json")
    with open(batch_file, 'w') as f:
        json.dump(current_batch, f, indent=2)
    
    print(f"\nBatch saved to: {batch_file}")
    print("\nThoughts in this batch:")
    for i, cmd in enumerate(current_batch['commands'][:5]):  # Show first 5
        print(f"{i+1}. {cmd['params']['name']} ({cmd['params']['label']})")
    if len(current_batch['commands']) > 5:
        print(f"... and {len(current_batch['commands']) - 5} more")
    
    print("\nThe assistant will now import this batch using MCP commands.")
else:
    print("\nAll thoughts have been imported!")
    print("Next step: Import links and add notes")
