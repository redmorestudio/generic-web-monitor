#!/usr/bin/env python3
"""
Complete fresh import of AI Competitive Intelligence data to TheBrain
Handles ID mapping properly to ensure all links work
"""

import json
import subprocess
import time
from datetime import datetime

# TheBrain API credentials
BRAIN_ID = "134f1325-4a8d-46d7-a078-5386c8ab3542"  # Your existing brain
API_KEY = "4c8eabea756ab437069c89c46ce7cf00c477591ab9787a526617370d22a4266c"

# First, let's analyze what went wrong
def analyze_current_state():
    print("=== Analyzing Current Brain State ===")
    
    # Get all thoughts in the brain
    cmd = f'''curl -s -X GET "https://api.thebrain.com/v2/brains/{BRAIN_ID}/thoughts" \
        -H "Authorization: Bearer {API_KEY}" \
        -H "Content-Type: application/json"'''
    
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    
    if result.returncode == 0:
        try:
            data = json.loads(result.stdout)
            thoughts = data.get("thoughts", [])
            print(f"Found {len(thoughts)} thoughts in brain")
            
            # Create a mapping of names to IDs
            name_to_id = {}
            for thought in thoughts:
                name_to_id[thought["name"]] = thought["id"]
            
            return name_to_id
        except:
            print("Error parsing thoughts")
            return {}
    else:
        print("Error fetching thoughts")
        return {}

# Load and process the data
def load_and_process_data():
    with open("/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/thebrain-knowledge-graph.json", "r") as f:
        data = json.load(f)
    
    return data["thoughts"], data["links"]

# Create a script to import missing links
def create_links_script(thoughts_data, links_data, existing_name_to_id):
    print("\n=== Creating Links Import Script ===")
    
    # First, create a mapping from old IDs to thought names
    old_id_to_name = {}
    for thought in thoughts_data:
        old_id_to_name[thought["id"]] = thought["name"]
    
    # Now create the script
    script_content = f'''#!/bin/bash
# Import all links with correct ID mapping
# Generated on {datetime.now()}

BRAIN_ID="{BRAIN_ID}"
API_KEY="{API_KEY}"

echo "Starting links import..."

'''
    
    successful_mappings = 0
    failed_mappings = 0
    
    for i, link in enumerate(links_data):
        # Get the thought names from old IDs
        old_id_a = link.get("thoughtIdA", "")
        old_id_b = link.get("thoughtIdB", "")
        
        if old_id_a not in old_id_to_name or old_id_b not in old_id_to_name:
            failed_mappings += 1
            continue
        
        name_a = old_id_to_name[old_id_a]
        name_b = old_id_to_name[old_id_b]
        
        # Get the new IDs from existing thoughts
        if name_a not in existing_name_to_id or name_b not in existing_name_to_id:
            failed_mappings += 1
            continue
        
        new_id_a = existing_name_to_id[name_a]
        new_id_b = existing_name_to_id[name_b]
        
        successful_mappings += 1
        
        # Add progress indicator
        if i % 50 == 0:
            script_content += f'\necho "Progress: {i}/{len(links_data)} links..."\n'
        
        # Create the curl command
        relation = link.get("relation", 3)
        name = link.get("name", "").replace('"', '\\"').replace("'", "\\'")
        color = link.get("color", "#6fbf6f")
        thickness = link.get("thickness", 1)
        direction = link.get("direction", 0)
        
        script_content += f'''
curl -X POST "https://api.thebrain.com/v2/brains/$BRAIN_ID/links" \\
  -H "Authorization: Bearer $API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{{"thoughtIdA": "{new_id_a}", "thoughtIdB": "{new_id_b}", "relation": {relation}, "name": "{name}", "color": "{color}", "thickness": {thickness}, "direction": {direction}}}' \\
  -s > /dev/null
'''
        
        # Add small delay every 10 links
        if (i + 1) % 10 == 0:
            script_content += "sleep 0.5\n"
    
    script_content += f'''
echo ""
echo "Links import complete!"
echo "Successfully mapped: {successful_mappings} links"
echo "Failed to map: {failed_mappings} links"
'''
    
    # Save the script
    script_path = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/scripts/import_links_fixed.sh"
    with open(script_path, "w") as f:
        f.write(script_content)
    
    import os
    os.chmod(script_path, 0o755)
    
    print(f"Created import script: {script_path}")
    print(f"Successfully mapped: {successful_mappings} links")
    print(f"Failed to map: {failed_mappings} links")
    
    return script_path

def main():
    print("=== Fixing TheBrain Links Import ===")
    
    # Get current state
    existing_thoughts = analyze_current_state()
    
    if not existing_thoughts:
        print("No existing thoughts found. Please import thoughts first.")
        return
    
    # Load original data
    thoughts_data, links_data = load_and_process_data()
    
    print(f"\nOriginal data: {len(thoughts_data)} thoughts, {len(links_data)} links")
    
    # Create links import script
    script_path = create_links_script(thoughts_data, links_data, existing_thoughts)
    
    # Run it?
    response = input("\nRun the import script now? (y/n): ")
    if response.lower() == 'y':
        print("\nRunning import script...")
        subprocess.run(["bash", script_path])
        print("\nImport complete! Check TheBrain to see all connections.")

if __name__ == "__main__":
    main()
