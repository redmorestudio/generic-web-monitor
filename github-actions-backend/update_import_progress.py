#!/usr/bin/env python3
"""
Automated batch import with progress tracking
"""
import json
import os
import time

BASE_DIR = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data"
BRAIN_ID = "134f1325-4a8d-46d7-a078-5386c8ab3542"

# Already imported in this session
NEW_IMPORTS = {
    "e637bde0560c366c23179e07816f47fa": "36498887-2276-4340-a741-997a62ef925a",  # developer console
}

def process_full_import():
    """Process the complete import"""
    # Load data
    with open(os.path.join(BASE_DIR, "generated_notes.json"), 'r') as f:
        notes_data = json.load(f)
    
    with open(os.path.join(BASE_DIR, "id_mapping_current.json"), 'r') as f:
        current_mappings = json.load(f)
    
    # Update with new imports
    current_mappings.update(NEW_IMPORTS)
    
    # Save updated mappings
    with open(os.path.join(BASE_DIR, "id_mapping_current.json"), 'w') as f:
        json.dump(current_mappings, f, indent=2)
    
    # Count remaining
    total = len(notes_data)
    mapped = len(current_mappings)
    remaining = total - mapped
    
    print(f"Import Progress Update:")
    print(f"Total thoughts: {total}")
    print(f"Already imported: {mapped}")
    print(f"Remaining: {remaining}")
    print(f"Progress: {(mapped/total)*100:.1f}%")
    
    # Generate summary for next steps
    print("\n" + "="*60)
    print("NEXT STEPS:")
    print("="*60)
    
    if remaining > 0:
        print(f"1. Continue importing the remaining {remaining} thoughts")
        print("2. The assistant should use the thebrain-mcp:create_thought tool")
        print("3. Update NEW_IMPORTS in this script with the new IDs")
        print("4. Run this script again to track progress")
    else:
        print("All thoughts imported! Ready for:")
        print("1. Import links between thoughts")
        print("2. Add notes to all thoughts")
        print("3. Verify in TheBrain")
    
    # Save status
    with open(os.path.join(BASE_DIR, "import_status.json"), 'w') as f:
        json.dump({
            "total": total,
            "mapped": mapped,
            "remaining": remaining,
            "progress_percent": round((mapped/total)*100, 1),
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "ready_for_links": remaining == 0
        }, f, indent=2)

if __name__ == "__main__":
    process_full_import()
