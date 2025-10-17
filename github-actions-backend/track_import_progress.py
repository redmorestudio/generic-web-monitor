#!/usr/bin/env python3
"""
Import all thoughts to TheBrain using MCP commands
This script prepares the import and tracks progress
"""
import json
import os
import time

BASE_DIR = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data"
BRAIN_ID = "134f1325-4a8d-46d7-a078-5386c8ab3542"

# Track the mappings we've created so far
NEW_MAPPINGS = {
    "385c8d0c745daff73bb1cc3683022e2a": "4fcadd51-99cc-46b5-be7e-a64dd2e47fe3",  # mobile apps
    "3cc98b80bd87f2337a927b0451f0dd43": "ef586f76-74a9-4374-8753-05c3dc703263",  # Claude Code
    "aeea9baf1f5b102106fc38921dc6c70a": "33a14638-f05b-4c59-94db-ce5b0f9df436",  # code generation
    "011c37b7182412061de0f76acf0ed97d": "50a90617-5cb7-44c2-8879-511670a909f7",  # debugging
    "7534ae1cc21ca8afaf3967be66c055e0": "bb8624d7-8325-4637-9dd9-4a6790f1f906",  # code review
    "80e036e542b880c4c6a8399cc583dad8": "ee61cc1d-f1d2-41d0-9471-52e815a96efe",  # Claude API
}

def update_mappings():
    """Update the id_mapping_current.json file with new mappings"""
    mapping_file = os.path.join(BASE_DIR, "id_mapping_current.json")
    
    # Load existing mappings
    with open(mapping_file, 'r') as f:
        mappings = json.load(f)
    
    # Add new mappings
    mappings.update(NEW_MAPPINGS)
    
    # Save updated mappings
    with open(mapping_file, 'w') as f:
        json.dump(mappings, f, indent=2)
    
    print(f"Updated mappings. Total mapped: {len(mappings)}")
    return mappings

def get_import_status():
    """Get current import status"""
    # Load all data
    with open(os.path.join(BASE_DIR, "generated_notes.json"), 'r') as f:
        notes_data = json.load(f)
    
    with open(os.path.join(BASE_DIR, "id_mapping_current.json"), 'r') as f:
        id_mapping = json.load(f)
    
    total = len(notes_data)
    mapped = len(id_mapping)
    remaining = total - mapped
    
    print(f"\nImport Status:")
    print(f"Total thoughts: {total}")
    print(f"Already imported: {mapped}")
    print(f"Remaining: {remaining}")
    print(f"Progress: {(mapped/total)*100:.1f}%")
    
    return total, mapped, remaining

def prepare_next_batch(batch_size=20):
    """Prepare the next batch of thoughts to import"""
    # Load data
    with open(os.path.join(BASE_DIR, "mcp_import_commands.json"), 'r') as f:
        import_data = json.load(f)
    
    with open(os.path.join(BASE_DIR, "id_mapping_current.json"), 'r') as f:
        id_mapping = json.load(f)
    
    # Find unmapped thoughts
    next_batch = []
    for batch in import_data['batches']:
        for cmd in batch['commands']:
            if cmd['old_id'] not in id_mapping and len(next_batch) < batch_size:
                next_batch.append(cmd)
        if len(next_batch) >= batch_size:
            break
    
    if next_batch:
        # Save next batch
        batch_file = os.path.join(BASE_DIR, "next_import_batch.json")
        with open(batch_file, 'w') as f:
            json.dump(next_batch, f, indent=2)
        
        print(f"\nPrepared next batch with {len(next_batch)} thoughts")
        print("First 5 thoughts in batch:")
        for i, cmd in enumerate(next_batch[:5]):
            print(f"  {i+1}. {cmd['params']['name']} ({cmd['params']['label']})")
        
        return batch_file
    else:
        print("\nNo more thoughts to import!")
        return None

def main():
    print("TheBrain Import Progress Tracker")
    print("="*50)
    
    # Update mappings with what we've imported so far
    update_mappings()
    
    # Get current status
    total, mapped, remaining = get_import_status()
    
    if remaining > 0:
        # Prepare next batch
        batch_file = prepare_next_batch()
        if batch_file:
            print(f"\nNext batch saved to: {batch_file}")
            print("\nTo continue importing:")
            print("1. The assistant will import the thoughts from next_import_batch.json")
            print("2. Update NEW_MAPPINGS in this script with the new IDs")
            print("3. Run this script again to prepare the next batch")
            print("4. Repeat until all thoughts are imported")
    else:
        print("\nAll thoughts imported! Next steps:")
        print("1. Import links between thoughts")
        print("2. Add notes to all thoughts")
        print("3. Verify the complete knowledge graph in TheBrain")

if __name__ == "__main__":
    main()
