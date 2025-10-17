#!/usr/bin/env python3
"""
Import to TheBrain using MCP commands directly
This avoids API endpoint issues by using the same method that worked earlier
"""
import json
import subprocess
import time
import os
from datetime import datetime

# Configuration
BASE_DIR = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data"
BRAIN_ID = "134f1325-4a8d-46d7-a078-5386c8ab3542"

def run_mcp_command(command):
    """Execute an MCP command through subprocess"""
    try:
        # Use the exact format that worked when creating thoughts manually
        result = subprocess.run(
            command,
            shell=True,
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            # Try to extract the thought ID from the output
            output = result.stdout
            if '"id"' in output:
                try:
                    # Parse JSON response
                    import re
                    json_match = re.search(r'\{.*\}', output, re.DOTALL)
                    if json_match:
                        response_data = json.loads(json_match.group())
                        if 'thought' in response_data and 'id' in response_data['thought']:
                            return response_data['thought']['id']
                        elif 'id' in response_data:
                            return response_data['id']
                except:
                    pass
            return True
        else:
            print(f"Command failed: {result.stderr}")
            return None
    except Exception as e:
        print(f"Exception running command: {e}")
        return None

def create_thought_mcp(name, color, label):
    """Create a thought using MCP command"""
    # Escape quotes in name and label
    name_escaped = name.replace('"', '\\"').replace("'", "\\'")
    label_escaped = label.replace('"', '\\"').replace("'", "\\'")
    
    # Build the MCP command using the exact syntax that worked
    command = f'''echo '{{"brainId": "{BRAIN_ID}", "name": "{name_escaped}", "foregroundColor": "{color}", "label": "{label_escaped}", "kind": 1}}' | nc localhost 3000'''
    
    # Alternative: Try using the Claude CLI if available
    command_alt = f'''claude mcp run thebrain-mcp create_thought --brainId "{BRAIN_ID}" --name "{name_escaped}" --foregroundColor "{color}" --label "{label_escaped}" --kind 1'''
    
    print(f"   Trying MCP command...")
    result = run_mcp_command(command_alt)
    
    if not result:
        print(f"   Trying alternative method...")
        result = run_mcp_command(command)
    
    return result

def add_note_mcp(thought_id, note_content):
    """Add a note to a thought using MCP"""
    # Escape the markdown content
    note_escaped = note_content.replace('"', '\\"').replace("'", "\\'").replace('\n', '\\n')
    
    command = f'''claude mcp run thebrain-mcp create_or_update_note --brainId "{BRAIN_ID}" --thoughtId "{thought_id}" --markdown "{note_escaped}"'''
    
    return run_mcp_command(command) is not None

def create_link_mcp(thought_a, thought_b, relation):
    """Create a link using MCP"""
    command = f'''claude mcp run thebrain-mcp create_link --brainId "{BRAIN_ID}" --thoughtIdA "{thought_a}" --thoughtIdB "{thought_b}" --relation {relation}'''
    
    return run_mcp_command(command) is not None

def main():
    print("=== BRAIN IMPORT USING MCP ===")
    print(f"Started at: {datetime.now()}")
    
    # Load all data
    print("\nLoading data files...")
    with open(os.path.join(BASE_DIR, "generated_notes.json"), 'r') as f:
        all_notes = json.load(f)
    
    with open(os.path.join(BASE_DIR, "links_to_import.json"), 'r') as f:
        all_links = json.load(f)
    
    # Load or create mapping
    mapping_file = os.path.join(BASE_DIR, "id_mapping_mcp.json")
    if os.path.exists(mapping_file):
        with open(mapping_file, 'r') as f:
            id_mapping = json.load(f)
    else:
        id_mapping = {}
    
    print(f"\nTotal thoughts: {len(all_notes)}")
    print(f"Already imported: {len(id_mapping)}")
    print(f"To import: {len(all_notes) - len(id_mapping)}")
    print(f"Total links: {len(all_links)}")
    
    # Import thoughts - limit to 10 for testing
    print("\n=== IMPORTING THOUGHTS (First 10 for testing) ===")
    count = len(id_mapping)
    test_limit = 10
    
    for old_id, note_content in all_notes.items():
        if old_id in id_mapping:
            continue
            
        if count >= test_limit:
            print(f"\nTest limit reached. {len(all_notes) - count} thoughts remaining.")
            break
        
        # Extract info from note
        lines = note_content.strip().split('\n')
        name = lines[0].replace('# ', '').strip() if lines else 'Unknown'
        
        # Extract entity type
        entity_type = "unknown"
        for line in lines:
            if "**Entity Type:**" in line:
                entity_type = line.split("**Entity Type:**")[1].strip().lower()
                break
        
        # Determine color and label
        color_map = {
            "company": ("#3b82f6", "COMPANY"),
            "product": ("#10b981", "PRODUCT"),
            "feature": ("#14b8a6", "FEATURE"),
            "technology": ("#8b5cf6", "TECHNOLOGY"),
            "person": ("#ef4444", "PERSON"),
            "pricing": ("#f59e0b", "PRICING"),
            "market": ("#6b7280", "MARKET"),
            "capability": ("#10b981", "CAPABILITY")
        }
        
        color, label = color_map.get(entity_type, ("#9ca3af", entity_type.upper()))
        
        count += 1
        print(f"\n[{count}] {name} ({label})")
        
        # Create thought using MCP
        new_id = create_thought_mcp(name, color, label)
        if new_id:
            print(f"   ✓ Created via MCP")
            id_mapping[old_id] = new_id if isinstance(new_id, str) else f"temp_{old_id}"
            
            # Save mapping after each successful import
            with open(mapping_file, 'w') as f:
                json.dump(id_mapping, f, indent=2)
        else:
            print(f"   ✗ Failed")
        
        # Rate limit
        time.sleep(1)
    
    print(f"\n=== TEST COMPLETE ===")
    print(f"Successfully imported: {count} thoughts")
    print(f"Check TheBrain to verify the thoughts were created.")
    print(f"\nIf successful, you can modify the test_limit variable to import all thoughts.")

if __name__ == "__main__":
    main()
