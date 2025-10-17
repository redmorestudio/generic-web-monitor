#!/usr/bin/env python3
"""
Automated TheBrain Import Runner
This script generates and tracks the import process
"""
import json
import os
import time

BASE_DIR = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data"
BRAIN_ID = "134f1325-4a8d-46d7-a078-5386c8ab3542"

# Track new imports here as they complete
COMPLETED_IMPORTS = {
    # Add new mappings here as thoughts are imported
    # "old_id": "new_id",
}

def load_bulk_data():
    """Load the bulk import data"""
    with open(os.path.join(BASE_DIR, "bulk_import_data.json"), 'r') as f:
        return json.load(f)

def update_mappings():
    """Update the mapping file with completed imports"""
    mapping_file = os.path.join(BASE_DIR, "id_mapping_current.json")
    
    # Load existing
    with open(mapping_file, 'r') as f:
        mappings = json.load(f)
    
    # Add completed imports
    mappings.update(COMPLETED_IMPORTS)
    
    # Save
    with open(mapping_file, 'w') as f:
        json.dump(mappings, f, indent=2)
    
    return len(mappings)

def generate_import_commands():
    """Generate the import commands for the next batch"""
    bulk_data = load_bulk_data()
    thoughts = bulk_data['thoughts']
    
    # Take first 20 thoughts
    batch = thoughts[:20]
    
    print("IMPORT COMMANDS FOR NEXT BATCH:")
    print("="*60)
    print(f"Importing {len(batch)} thoughts...")
    print("\nThe assistant should execute these using thebrain-mcp:create_thought")
    print("\nThoughts to import:")
    
    for i, thought in enumerate(batch):
        print(f"\n{i+1}. {thought['name']} ({thought['label']})")
        print(f"   Color: {thought['color']}")
        print(f"   Old ID: {thought['old_id']}")
    
    # Save batch for reference
    with open(os.path.join(BASE_DIR, "current_batch_to_import.json"), 'w') as f:
        json.dump(batch, f, indent=2)
    
    print(f"\nBatch saved to: current_batch_to_import.json")
    print("\nAfter import, update COMPLETED_IMPORTS in this script and run again.")

def check_progress():
    """Check overall import progress"""
    with open(os.path.join(BASE_DIR, "generated_notes.json"), 'r') as f:
        total_thoughts = len(json.load(f))
    
    mapped_count = update_mappings()
    remaining = total_thoughts - mapped_count
    progress = (mapped_count / total_thoughts) * 100
    
    print(f"\nOVERALL PROGRESS:")
    print(f"Total: {total_thoughts}")
    print(f"Imported: {mapped_count}")
    print(f"Remaining: {remaining}")
    print(f"Progress: {progress:.1f}%")
    
    if remaining == 0:
        print("\n✅ ALL THOUGHTS IMPORTED!")
        print("Ready to import links and add notes.")
    
    return remaining > 0

def main():
    print("TheBrain Import Automation")
    print("="*60)
    
    if check_progress():
        generate_import_commands()
    else:
        print("\nImport complete! Next steps:")
        print("1. Import links between thoughts")
        print("2. Add notes to all thoughts")

if __name__ == "__main__":
    main()
