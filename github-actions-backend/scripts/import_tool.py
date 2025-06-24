#!/usr/bin/env python3
"""
Automated import script for TheBrain using subprocess to call MCP tools
"""

import json
import subprocess
import time
import os

def load_batch():
    """Load the current batch to import"""
    with open("/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/next_batch.json", "r") as f:
        return json.load(f)

def load_progress():
    """Load progress data"""
    progress_file = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/import_progress.json"
    try:
        with open(progress_file, "r") as f:
            return json.load(f)
    except:
        return {
            "thoughts_imported": [],
            "links_imported": [],
            "thought_id_map": {}
        }

def save_progress(progress):
    """Save progress data"""
    progress_file = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/import_progress.json"
    with open(progress_file, "w") as f:
        json.dump(progress, f, indent=2)

def import_thoughts_batch(thoughts, progress):
    """Import a batch of thoughts and update progress"""
    
    # Create a temporary file with the thoughts to import
    temp_file = "/tmp/thoughts_to_import.json"
    with open(temp_file, "w") as f:
        json.dump(thoughts, f)
    
    # Generate the commands for importing
    commands = []
    for thought in thoughts:
        # Skip if already imported
        if thought["id"] in progress["thoughts_imported"]:
            continue
            
        cmd = {
            "thought": thought,
            "status": "pending"
        }
        commands.append(cmd)
    
    # Save commands to execute
    cmd_file = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/import_commands.json"
    with open(cmd_file, "w") as f:
        json.dump(commands, f, indent=2)
    
    print(f"Prepared {len(commands)} thoughts for import")
    print("Commands saved to: import_commands.json")
    print("\nPlease run the following command to import:")
    print("python3 /Users/sethredmore/ai-monitor-fresh/github-actions-backend/scripts/execute_import.py")
    
    return len(commands)

def main():
    # Load current batch and progress
    batch = load_batch()
    progress = load_progress()
    
    print("=== TheBrain Import Tool ===")
    print(f"Thoughts in batch: {len(batch['thoughts'])}")
    print(f"Links in batch: {len(batch['links'])}")
    print(f"Already imported: {len(progress['thoughts_imported'])} thoughts, {len(progress['links_imported'])} links")
    
    if batch['thoughts']:
        num_to_import = import_thoughts_batch(batch['thoughts'], progress)
        if num_to_import > 0:
            print(f"\n✅ Ready to import {num_to_import} thoughts")
        else:
            print("\n✅ All thoughts in this batch already imported")
    elif batch['links']:
        print("\n📎 Ready to import links (after all thoughts are done)")
    else:
        print("\n🎉 Nothing left to import!")

if __name__ == "__main__":
    main()
