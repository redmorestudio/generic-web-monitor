#!/usr/bin/env python3
"""
Execute TheBrain Import - Direct API Version
This script processes batches and tracks progress using the Brain API
"""
import json
import requests
import time
import os
import sys

BASE_DIR = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data"
BRAIN_ID = "134f1325-4a8d-46d7-a078-5386c8ab3542"
API_KEY = "4c8eabea756ab437069c89c46ce7cf00c477591ab9787a526617370d22a4266c"
API_BASE = "https://api.bra.in/v1"

# Headers for API requests
headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

def create_thought_api(thought_data):
    """Create a thought using the Brain API"""
    url = f"{API_BASE}/thoughts/{BRAIN_ID}"
    
    # Map our data to API format
    payload = {
        "name": thought_data['name'],
        "kind": thought_data.get('kind', 1),
        "acType": thought_data.get('acType', 0)
    }
    
    # Add optional fields
    if 'label' in thought_data:
        payload['label'] = thought_data['label']
    if 'sourceThoughtId' in thought_data:
        payload['sourceThoughtId'] = thought_data['sourceThoughtId']
    if 'relation' in thought_data:
        payload['relation'] = thought_data['relation']
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        if response.status_code == 200:
            result = response.json()
            return result.get('id')
        else:
            print(f"     Error: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"     Exception: {e}")
        return None

def update_thought_colors(thought_id, foreground_color=None, background_color=None):
    """Update thought colors using PATCH API"""
    if not foreground_color and not background_color:
        return True
        
    url = f"{API_BASE}/thoughts/{BRAIN_ID}/{thought_id}"
    
    # Build patch operations
    operations = []
    if foreground_color:
        operations.append({
            "op": "add",
            "path": "/foregroundColor",
            "value": foreground_color
        })
    if background_color:
        operations.append({
            "op": "add", 
            "path": "/backgroundColor",
            "value": background_color
        })
    
    try:
        response = requests.patch(url, json=operations, headers=headers)
        return response.status_code == 200
    except Exception as e:
        print(f"     Color update exception: {e}")
        return False

def import_batch(batch_num):
    """Import a single batch of thoughts"""
    batch_file = os.path.join(BASE_DIR, f"import_batch_{batch_num}.json")
    mapping_file = os.path.join(BASE_DIR, "id_mapping_current.json")
    
    # Load batch
    with open(batch_file, 'r') as f:
        batch_data = json.load(f)
    
    # Load current mappings
    if os.path.exists(mapping_file):
        with open(mapping_file, 'r') as f:
            id_mapping = json.load(f)
    else:
        id_mapping = {}
    
    print(f"\nProcessing Batch {batch_num} ({batch_data['count']} thoughts)")
    print("-" * 50)
    
    created = 0
    failed = 0
    
    for i, thought in enumerate(batch_data['thoughts']):
        # Skip if already mapped
        if thought['id'] in id_mapping:
            print(f"  [{i+1}] Skipping {thought['name']} - already imported")
            continue
        
        # Create thought
        print(f"  [{i+1}] Creating: {thought['name']} ({thought.get('label', 'N/A')})")
        
        new_id = create_thought_api(thought)
        
        if new_id:
            # Update colors if present
            if 'foregroundColor' in thought or 'backgroundColor' in thought:
                update_thought_colors(
                    new_id,
                    thought.get('foregroundColor'),
                    thought.get('backgroundColor')
                )
            
            id_mapping[thought['id']] = new_id
            created += 1
            
            # Save mapping after each success
            if created % 5 == 0:
                with open(mapping_file, 'w') as f:
                    json.dump(id_mapping, f, indent=2)
        else:
            print(f"     Failed to create thought")
            failed += 1
        
        # Small delay to avoid rate limits
        time.sleep(0.1)
    
    # Save final mappings for this batch
    with open(mapping_file, 'w') as f:
        json.dump(id_mapping, f, indent=2)
    
    print(f"\nBatch {batch_num} complete: {created} created, {failed} failed")
    return created, failed

def main():
    print("TheBrain Import Automation - Direct API Version")
    print("="*60)
    
    # Check how many batches we have
    batch_count = 0
    for i in range(1, 100):
        if os.path.exists(os.path.join(BASE_DIR, f"import_batch_{i}.json")):
            batch_count = i
        else:
            break
    
    print(f"Found {batch_count} batches to import")
    
    if len(sys.argv) > 1:
        # Import specific batch
        batch_num = int(sys.argv[1])
        print(f"\nImporting batch {batch_num} only")
        created, failed = import_batch(batch_num)
    else:
        # Import all batches
        total_created = 0
        total_failed = 0
        
        for batch_num in range(1, batch_count + 1):
            created, failed = import_batch(batch_num)
            total_created += created
            total_failed += failed
            
            # Pause between batches
            if batch_num < batch_count:
                print("\nPausing before next batch...")
                time.sleep(2)
        
        print("\n" + "="*60)
        print("Import Complete!")
        print(f"Total thoughts created: {total_created}")
        print(f"Total thoughts failed: {total_failed}")
    
    print("\nNext step: Import links using the ID mappings")

if __name__ == "__main__":
    main()
