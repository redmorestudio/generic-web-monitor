#!/usr/bin/env python3
"""
Efficient batch import script for TheBrain
Processes thoughts in chunks and saves progress
"""
import json
import os
import sys

# Configuration
COMMANDS_FILE = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/all_import_commands.json"
ID_MAPPING_FILE = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/id_mapping.json"
PROGRESS_FILE = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/import_progress.json"
CHUNK_SIZE = 10  # Process 10 thoughts at a time

def load_progress():
    """Load existing progress or initialize"""
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE, 'r') as f:
            return json.load(f)
    return {
        'last_processed_index': 2,  # We already created 3 thoughts (0,1,2)
        'total_created': 3,
        'total_failed': 0,
        'completed': False
    }

def load_id_mapping():
    """Load existing ID mappings"""
    if os.path.exists(ID_MAPPING_FILE):
        with open(ID_MAPPING_FILE, 'r') as f:
            return json.load(f)
    return {}

def save_progress(progress, id_mapping):
    """Save current progress and ID mappings"""
    with open(PROGRESS_FILE, 'w') as f:
        json.dump(progress, f, indent=2)
    with open(ID_MAPPING_FILE, 'w') as f:
        json.dump(id_mapping, f, indent=2)

def main():
    # Load data
    progress = load_progress()
    id_mapping = load_id_mapping()
    
    with open(COMMANDS_FILE, 'r') as f:
        all_commands = json.load(f)
    
    total_thoughts = len(all_commands)
    start_index = progress['last_processed_index'] + 1
    
    print(f"Import Status:")
    print(f"- Total thoughts: {total_thoughts}")
    print(f"- Already created: {progress['total_created']}")
    print(f"- Remaining: {total_thoughts - progress['total_created']}")
    print(f"- Starting from index: {start_index}")
    print("="*50)
    
    if start_index >= total_thoughts:
        print("All thoughts have been imported!")
        progress['completed'] = True
        save_progress(progress, id_mapping)
        return
    
    # Process next chunk
    end_index = min(start_index + CHUNK_SIZE, total_thoughts)
    chunk = all_commands[start_index:end_index]
    
    print(f"\nProcessing chunk: indices {start_index} to {end_index-1}")
    print(f"Thoughts in this chunk: {len(chunk)}")
    print("-"*50)
    
    # Generate import commands for this chunk
    chunk_commands = []
    for i, cmd in enumerate(chunk):
        global_index = start_index + i
        print(f"[{global_index+1}/{total_thoughts}] {cmd['params']['name']} ({cmd['params']['label']})")
        chunk_commands.append({
            'index': global_index,
            'old_id': cmd['old_id'],
            'params': cmd['params']
        })
    
    # Save chunk for import
    chunk_file = f"/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/current_chunk.json"
    with open(chunk_file, 'w') as f:
        json.dump(chunk_commands, f, indent=2)
    
    print(f"\nChunk saved to: {chunk_file}")
    print("Ready for import!")
    print("\nTo continue after import, run this script again.")
    
    # Update progress for simulation (actual progress will be updated after import)
    progress['last_processed_index'] = end_index - 1
    progress['total_created'] = end_index
    save_progress(progress, id_mapping)

if __name__ == "__main__":
    main()
