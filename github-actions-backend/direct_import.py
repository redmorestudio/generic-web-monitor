#!/usr/bin/env python3
"""Direct import using MCP commands"""
import json
import subprocess
import time

# Load the batch data
with open("/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/current_batch_to_import.json", 'r') as f:
    batch_data = json.load(f)

# Brain configuration
BRAIN_ID = "134f1325-4a8d-46d7-a078-5386c8ab3542"

# Import each thought
for i, thought in enumerate(batch_data):
    if i < 7:  # Skip the ones we already imported
        continue
        
    name = thought['name']
    color = thought['color']
    label = thought['label']
    
    print(f"\n[{i+1}/{len(batch_data)}] Importing: {name} ({label})")
    
    # Create thought using the MCP command
    cmd = f'''claude mcp run thebrain-mcp:create_thought '{{"brainId": "{BRAIN_ID}", "name": "{name}", "foregroundColor": "{color}", "label": "{label}", "kind": 1}}'
    '''
    
    # Execute the command
    try:
        subprocess.run(cmd, shell=True, check=True)
        print(f"   Success!")
    except Exception as e:
        print(f"   Failed: {e}")
    
    time.sleep(0.5)  # Rate limit

print("\nBatch import complete!")
