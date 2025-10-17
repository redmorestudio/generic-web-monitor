#!/usr/bin/env python3
"""
Test Import to TheBrain - Import just 10 thoughts to test
"""
import json
import requests
import time
import os

# Configuration
BASE_DIR = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data"
BRAIN_ID = "134f1325-4a8d-46d7-a078-5386c8ab3542"
API_KEY = "4c8eabea756ab437069c89c46ce7cf00c477591ab9787a526617370d22a4266c"
API_BASE = "https://api.bra.in/v1"

# Test limit
TEST_LIMIT = 10

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

def extract_entity_type_from_note(note_content):
    """Extract entity type from note content"""
    if "**Entity Type:**" in note_content:
        lines = note_content.split('\n')
        for line in lines:
            if "**Entity Type:**" in line:
                entity_type = line.split("**Entity Type:**")[1].strip()
                return entity_type.lower()
    return "unknown"

def create_thought_api(name):
    """Create a thought using the Brain API"""
    url = f"{API_BASE}/thoughts/{BRAIN_ID}"
    
    payload = {"name": name, "kind": 1}
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        if response.status_code == 200:
            result = response.json()
            return result.get('id')
        else:
            print(f"Error: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"Exception: {e}")
        return None

def main():
    print("TheBrain Test Import - Testing with 10 thoughts")
    print("="*50)
    
    # Load data
    with open(os.path.join(BASE_DIR, "generated_notes.json"), 'r') as f:
        notes_data = json.load(f)
    
    with open(os.path.join(BASE_DIR, "id_mapping_current.json"), 'r') as f:
        id_mapping = json.load(f)
    
    # Test with first few unmapped thoughts
    count = 0
    for old_id, note_content in notes_data.items():
        if old_id in id_mapping:
            continue
            
        if count >= TEST_LIMIT:
            break
            
        # Extract name
        lines = note_content.strip().split('\n')
        name = lines[0].replace('# ', '').strip() if lines else 'Unknown'
        entity_type = extract_entity_type_from_note(note_content)
        
        print(f"\n[{count + 1}] Creating: {name} (Type: {entity_type})")
        
        new_id = create_thought_api(name)
        if new_id:
            print(f"   Success! ID: {new_id}")
            id_mapping[old_id] = new_id
            count += 1
        else:
            print(f"   Failed!")
            
        time.sleep(0.5)  # Rate limit
    
    # Save updated mapping
    with open(os.path.join(BASE_DIR, "id_mapping_test.json"), 'w') as f:
        json.dump(id_mapping, f, indent=2)
        
    print(f"\nTest complete! Created {count} thoughts.")
    print("Check TheBrain to verify they appear correctly.")
    print("\nIf successful, run the full import with:")
    print("  ./run_brain_import.sh")

if __name__ == "__main__":
    main()