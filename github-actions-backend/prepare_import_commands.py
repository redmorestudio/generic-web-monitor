#!/usr/bin/env python3
"""
Import thoughts batch by batch and track ID mappings
"""
import json
import os
import time

# Initialize ID mapping
id_mapping = {}
import_log = []

# Load batch info
with open("/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/batch_info.json", 'r') as f:
    batch_info = json.load(f)

print(f"Starting import of {batch_info['total_thoughts']} thoughts in {batch_info['num_batches']} batches")
print("="*60)

# Process each batch
total_created = 0
total_failed = 0

for batch_meta in batch_info['thought_batches']:
    print(f"\nProcessing batch {batch_meta['batch_num']} ({batch_meta['count']} thoughts)...")
    
    # Load batch data
    with open(batch_meta['file'], 'r') as f:
        batch_data = json.load(f)
    
    batch_created = 0
    batch_failed = 0
    
    # Create import commands for this batch
    commands = []
    for thought in batch_data['thoughts']:
        # Prepare the command data
        cmd = {
            'old_id': thought['id'],
            'command': 'create_thought',
            'params': {
                'name': thought['name'],
                'kind': thought.get('kind', 1),
                'acType': thought.get('acType', 0)
            }
        }
        
        # Add optional parameters
        if 'label' in thought and thought['label']:
            cmd['params']['label'] = thought['label']
        if 'foregroundColor' in thought:
            cmd['params']['foregroundColor'] = thought['foregroundColor']
        if 'backgroundColor' in thought:
            cmd['params']['backgroundColor'] = thought['backgroundColor']
        
        commands.append(cmd)
    
    # Save commands for this batch
    batch_commands_file = f"/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/batch_{batch_meta['batch_num']}_commands.json"
    with open(batch_commands_file, 'w') as f:
        json.dump(commands, f, indent=2)
    
    print(f"Prepared {len(commands)} commands for batch {batch_meta['batch_num']}")
    print(f"Commands saved to: {batch_commands_file}")
    
    # Update totals
    total_created += len(commands)

print(f"\n{'='*60}")
print(f"Batch preparation complete!")
print(f"Total commands prepared: {total_created}")
print(f"\nNext step: Execute the import commands using MCP")

# Save the initial mapping file (empty for now)
with open("/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/id_mapping.json", 'w') as f:
    json.dump(id_mapping, f, indent=2)
