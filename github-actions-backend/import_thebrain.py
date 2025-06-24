#!/usr/bin/env python3
import re
import json
import requests
import time

# TheBrain API configuration
brain_id = "134f1325-4a8d-46d7-a078-5386c8ab3542"
api_key = "4c8eabea756ab437069c89c46ce7cf00c477591ab9787a526617370d22a4266c"
base_url = "https://api.thebrain.com/api/v1"

headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}

# Read the commands file
with open('/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/mcp_import_commands_all.txt', 'r') as f:
    content = f.read()

# Extract create_thought commands
thought_pattern = r'create_thought\(brainId="[^"]+", name="([^"]+)", foregroundColor="([^"]+)", label="([^"]+)", kind=(\d+)\)'
thoughts = re.findall(thought_pattern, content)

print(f"Found {len(thoughts)} thoughts to create")

# Create thoughts
created_thoughts = {}
for i, (name, color, label, kind) in enumerate(thoughts):
    print(f"Creating thought {i+1}/{len(thoughts)}: {name}")
    
    data = {
        "name": name,
        "foregroundColor": color,
        "label": label,
        "kind": int(kind),
        "acType": 0
    }
    
    try:
        response = requests.post(
            f"{base_url}/brains/{brain_id}/thoughts",
            headers=headers,
            json=data
        )
        
        if response.status_code == 201:
            result = response.json()
            created_thoughts[name] = result['id']
            print(f"  ✓ Created with ID: {result['id']}")
        else:
            print(f"  ✗ Failed: {response.status_code} - {response.text}")
    
    except Exception as e:
        print(f"  ✗ Error: {str(e)}")
    
    # Rate limiting
    time.sleep(0.1)

print(f"\nSuccessfully created {len(created_thoughts)} thoughts")

# Save mapping for later use
with open('/Users/sethredmore/ai-monitor-fresh/github-actions-backend/thought_mapping.json', 'w') as f:
    json.dump(created_thoughts, f, indent=2)
