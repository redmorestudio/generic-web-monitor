#!/usr/bin/env python3
"""
Import Notes to TheBrain - Direct API Version
"""
import json
import requests
import time
import os

BASE_DIR = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data"
BRAIN_ID = "134f1325-4a8d-46d7-a078-5386c8ab3542"
API_KEY = "4c8eabea756ab437069c89c46ce7cf00c477591ab9787a526617370d22a4266c"
API_BASE = "https://api.bra.in/v1"

# Headers for API requests
headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

def create_or_update_note(thought_id, markdown_content):
    """Create or update a note using the Brain API"""
    url = f"{API_BASE}/notes/{BRAIN_ID}/{thought_id}/update"
    
    payload = {
        "markdown": markdown_content
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        return response.status_code == 200
    except Exception as e:
        print(f"     Exception: {e}")
        return False

def main():
    print("TheBrain Notes Import - Direct API Version")
    print("="*60)
    
    # Load ID mappings
    mapping_file = os.path.join(BASE_DIR, "id_mapping_current.json")
    if not os.path.exists(mapping_file):
        print("ERROR: No ID mapping file found. Run import_thoughts.py first!")
        return
        
    with open(mapping_file, 'r') as f:
        id_mapping = json.load(f)
    
    # Load notes
    notes_file = os.path.join(BASE_DIR, "import_notes.json")
    if not os.path.exists(notes_file):
        print("ERROR: No notes file found!")
        return
        
    with open(notes_file, 'r') as f:
        notes_data = json.load(f)
    
    print(f"Found {notes_data['count']} notes to import")
    print(f"Have mappings for {len(id_mapping)} thoughts")
    
    created = 0
    failed = 0
    skipped = 0
    
    for i, note in enumerate(notes_data['notes']):
        # Check if thought exists in our mapping
        if note['thoughtId'] not in id_mapping:
            print(f"  [{i+1}] Skipping - thought not mapped")
            skipped += 1
            continue
        
        # Get mapped ID
        new_thought_id = id_mapping[note['thoughtId']]
        
        # Show preview of note content
        preview = note['content'][:60].replace('\n', ' ')
        if len(note['content']) > 60:
            preview += "..."
        print(f"  [{i+1}] Adding note to thought: {preview}")
        
        # Create/update the note
        if create_or_update_note(new_thought_id, note['content']):
            created += 1
        else:
            print(f"     Failed to create note")
            failed += 1
        
        # Rate limiting
        time.sleep(0.05)
        
        # Progress update
        if (i + 1) % 10 == 0:
            print(f"  Progress: {i+1}/{notes_data['count']}")
    
    print("\n" + "="*60)
    print("Notes Import Complete!")
    print(f"Created: {created}")
    print(f"Failed: {failed}")
    print(f"Skipped: {skipped}")
    print(f"Total: {notes_data['count']}")

if __name__ == "__main__":
    main()
