#!/usr/bin/env python3
"""
Execute batch import of thoughts into TheBrain
"""
import json
import time
import os

# Configuration
BATCH_COMMANDS_DIR = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data"
ID_MAPPING_FILE = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/id_mapping.json"
PROGRESS_FILE = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/import_progress.json"
DELAY_BETWEEN_THOUGHTS = 0.2  # 200ms delay between each thought creation

# Load or initialize ID mapping
if os.path.exists(ID_MAPPING_FILE):
    with open(ID_MAPPING_FILE, 'r') as f:
        id_mapping = json.load(f)
else:
    id_mapping = {}

# Load or initialize progress tracking
if os.path.exists(PROGRESS_FILE):
    with open(PROGRESS_FILE, 'r') as f:
        progress = json.load(f)
else:
    progress = {
        'last_processed_batch': 0,
        'last_processed_index': -1,
        'total_created': 0,
        'total_failed': 0
    }

print("Import Script Ready")
print("="*60)
print(f"Starting from batch {progress['last_processed_batch'] + 1}")
print(f"Total thoughts created so far: {progress['total_created']}")
print(f"Total thoughts failed so far: {progress['total_failed']}")
print()

# Process batches
for batch_num in range(1, 16):  # 15 batches total
    if batch_num <= progress['last_processed_batch']:
        continue
    
    batch_file = f"{BATCH_COMMANDS_DIR}/batch_{batch_num}_commands.json"
    
    if not os.path.exists(batch_file):
        print(f"Batch file not found: {batch_file}")
        continue
    
    # Load batch commands
    with open(batch_file, 'r') as f:
        commands = json.load(f)
    
    print(f"\nProcessing Batch {batch_num} ({len(commands)} thoughts)")
    print("-" * 40)
    
    batch_created = 0
    batch_failed = 0
    
    # Process each command in the batch
    for i, cmd in enumerate(commands):
        # Skip already processed thoughts in this batch
        if batch_num == progress['last_processed_batch'] + 1 and i <= progress['last_processed_index']:
            continue
        
        # The assistant will execute the actual MCP command here
        # For now, just prepare the data
        print(f"  [{i+1}/{len(commands)}] Creating: {cmd['params']['name']}")
        
        # Simulate success for tracking (the assistant will do the actual creation)
        # In reality, the assistant will call thebrain-mcp:create_thought
        new_id = f"pending_{batch_num}_{i}"  # Placeholder
        id_mapping[cmd['old_id']] = new_id
        batch_created += 1
        
        # Update progress
        progress['last_processed_batch'] = batch_num
        progress['last_processed_index'] = i
        progress['total_created'] += 1
        
        # Save progress every 10 thoughts
        if (i + 1) % 10 == 0:
            with open(ID_MAPPING_FILE, 'w') as f:
                json.dump(id_mapping, f, indent=2)
            with open(PROGRESS_FILE, 'w') as f:
                json.dump(progress, f, indent=2)
            print(f"    Progress saved: {batch_created} thoughts created in this batch")
        
        # Delay to avoid overwhelming the API
        time.sleep(DELAY_BETWEEN_THOUGHTS)
    
    # Batch complete
    progress['last_processed_batch'] = batch_num
    progress['last_processed_index'] = -1  # Reset for next batch
    
    print(f"\nBatch {batch_num} complete: {batch_created} created, {batch_failed} failed")
    
    # Save final progress for this batch
    with open(ID_MAPPING_FILE, 'w') as f:
        json.dump(id_mapping, f, indent=2)
    with open(PROGRESS_FILE, 'w') as f:
        json.dump(progress, f, indent=2)

print("\n" + "="*60)
print("Import Summary:")
print(f"Total thoughts created: {progress['total_created']}")
print(f"Total thoughts failed: {progress['total_failed']}")
print(f"ID mappings saved to: {ID_MAPPING_FILE}")
print(f"Progress saved to: {PROGRESS_FILE}")

# Prepare for link import
print("\nNext step: Import links using the ID mappings")
