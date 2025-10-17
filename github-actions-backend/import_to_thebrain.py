#!/usr/bin/env python3
"""
Import TheBrain knowledge graph from JSON to new brain via MCP server
"""
import json
import subprocess
import sys
import time

# MCP server configuration
MCP_SERVER = "thebrain-mcp"
API_KEY = "4c8eabea756ab437069c89c46ce7cf00c477591ab9787a526617370d22a4266c"

def run_mcp_command(function_name, parameters):
    """Execute MCP command and return result"""
    cmd = [
        "npx", 
        "@modelcontextprotocol/cli", 
        "call",
        MCP_SERVER,
        function_name
    ]
    
    # Add parameters as JSON string
    if parameters:
        cmd.extend(["--params", json.dumps(parameters)])
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        return json.loads(result.stdout) if result.stdout else None
    except subprocess.CalledProcessError as e:
        print(f"Error calling {function_name}: {e.stderr}")
        return None
    except json.JSONDecodeError:
        print(f"Could not parse response from {function_name}")
        return None

def main():
    # Load the JSON file
    json_path = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/thebrain-knowledge-graph.json"
    print(f"Loading data from {json_path}...")
    
    with open(json_path, 'r') as f:
        data = json.load(f)
    
    print(f"Loaded {len(data['thoughts'])} thoughts, {len(data['links'])} links, and {len(data['notes'])} notes")
    
    # First, list existing brains to find or create "competitive-graph"
    print("\nListing existing brains...")
    brains_result = run_mcp_command("list_brains", {})
    
    if not brains_result:
        print("Failed to list brains")
        return
    
    # Check if competitive-graph already exists
    competitive_brain_id = None
    for brain in brains_result.get('brains', []):
        if brain.get('name') == 'competitive-graph':
            competitive_brain_id = brain.get('brainId')
            print(f"Found existing 'competitive-graph' brain: {competitive_brain_id}")
            break
    
    # If not found, we'll need to create it via the API directly
    # For now, let's use the existing brain ID from the document
    if not competitive_brain_id:
        competitive_brain_id = "134f1325-4a8d-46d7-a078-5386c8ab3542"
        print(f"Using brain ID: {competitive_brain_id}")
    
    # Set active brain
    print(f"\nSetting active brain to {competitive_brain_id}...")
    set_brain_result = run_mcp_command("set_active_brain", {"brainId": competitive_brain_id})
    
    if not set_brain_result:
        print("Failed to set active brain")
        return
    
    # Create a mapping of old thought IDs to new thought IDs
    thought_id_map = {}
    
    # Import thoughts
    print("\nImporting thoughts...")
    thoughts_created = 0
    thoughts_failed = 0
    
    for i, thought in enumerate(data['thoughts']):
        if i % 10 == 0:
            print(f"Progress: {i}/{len(data['thoughts'])} thoughts...")
        
        # Create thought with all properties
        params = {
            "name": thought['name'],
            "kind": thought.get('kind', 1),
            "label": thought.get('label', ''),
            "acType": thought.get('acType', 0),
            "foregroundColor": thought.get('foregroundColor'),
            "backgroundColor": thought.get('backgroundColor')
        }
        
        result = run_mcp_command("create_thought", params)
        
        if result and 'thought' in result:
            new_thought_id = result['thought']['id']
            thought_id_map[thought['id']] = new_thought_id
            thoughts_created += 1
        else:
            print(f"Failed to create thought: {thought['name']}")
            thoughts_failed += 1
        
        # Small delay to avoid overwhelming the API
        time.sleep(0.1)
    
    print(f"\nThoughts created: {thoughts_created}, failed: {thoughts_failed}")
    
    # Import links
    print("\nImporting links...")
    links_created = 0
    links_failed = 0
    
    for i, link in enumerate(data['links']):
        if i % 10 == 0:
            print(f"Progress: {i}/{len(data['links'])} links...")
        
        # Map old thought IDs to new ones
        thought_a = thought_id_map.get(link['thoughtIdA'])
        thought_b = thought_id_map.get(link['thoughtIdB'])
        
        if not thought_a or not thought_b:
            print(f"Skipping link - missing thought mapping")
            links_failed += 1
            continue
        
        params = {
            "thoughtIdA": thought_a,
            "thoughtIdB": thought_b,
            "relation": link['relation']
        }
        
        # Add optional properties if they exist
        if 'name' in link and link['name']:
            params['name'] = link['name']
        if 'color' in link:
            params['color'] = link['color']
        if 'thickness' in link:
            params['thickness'] = link['thickness']
        if 'direction' in link:
            params['direction'] = link['direction']
        
        result = run_mcp_command("create_link", params)
        
        if result:
            links_created += 1
        else:
            links_failed += 1
        
        time.sleep(0.1)
    
    print(f"\nLinks created: {links_created}, failed: {links_failed}")
    
    # Import notes
    print("\nImporting notes...")
    notes_created = 0
    notes_failed = 0
    
    for i, note in enumerate(data['notes']):
        if i % 5 == 0:
            print(f"Progress: {i}/{len(data['notes'])} notes...")
        
        # Map old thought ID to new one
        new_thought_id = thought_id_map.get(note['thoughtId'])
        
        if not new_thought_id:
            print(f"Skipping note - missing thought mapping")
            notes_failed += 1
            continue
        
        params = {
            "thoughtId": new_thought_id,
            "markdown": note['markdown']
        }
        
        result = run_mcp_command("create_or_update_note", params)
        
        if result:
            notes_created += 1
        else:
            notes_failed += 1
        
        time.sleep(0.1)
    
    print(f"\nNotes created: {notes_created}, failed: {notes_failed}")
    
    # Summary
    print("\n" + "="*50)
    print("Import Summary:")
    print(f"Thoughts: {thoughts_created} created, {thoughts_failed} failed")
    print(f"Links: {links_created} created, {links_failed} failed")
    print(f"Notes: {notes_created} created, {notes_failed} failed")
    print("="*50)

if __name__ == "__main__":
    main()
