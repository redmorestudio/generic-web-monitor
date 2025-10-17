#!/usr/bin/env python3
"""
Process batch import and update mappings
"""
import json
import os
import time

BASE_DIR = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data"

# Import results will be collected here
IMPORT_RESULTS = []

def add_import_result(old_id, new_id, name):
    """Track import results"""
    IMPORT_RESULTS.append({
        "old_id": old_id,
        "new_id": new_id,
        "name": name
    })
    print(f"✓ Imported: {name}")

# After all imports, update the mapping file
def update_all_mappings():
    """Update the id_mapping_current.json with all new imports"""
    mapping_file = os.path.join(BASE_DIR, "id_mapping_current.json")
    
    # Load existing
    with open(mapping_file, 'r') as f:
        mappings = json.load(f)
    
    # Add all new mappings
    for result in IMPORT_RESULTS:
        mappings[result["old_id"]] = result["new_id"]
    
    # Save
    with open(mapping_file, 'w') as f:
        json.dump(mappings, f, indent=2)
    
    print(f"\nUpdated mappings. Total: {len(mappings)}")
    
    # Generate status report
    with open(os.path.join(BASE_DIR, "import_status.json"), 'w') as f:
        json.dump({
            "last_batch_size": len(IMPORT_RESULTS),
            "total_mapped": len(mappings),
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "last_imports": IMPORT_RESULTS[:10]  # Show last 10
        }, f, indent=2)

# Print commands to execute
print("IMPORT COMMANDS TO EXECUTE:")
print("="*60)
print("The assistant will now import the batch thoughts.")
print("After import, this script will update all mappings.")
