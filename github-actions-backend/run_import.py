#!/usr/bin/env python3
"""
Execute TheBrain Import - Automated Runner
This script processes batches and tracks progress
"""
import json
import subprocess
import time
import os
import sys

BASE_DIR = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data"
BRAIN_ID = "134f1325-4a8d-46d7-a078-5386c8ab3542"

def run_mcp_command(function_name, params):
    """Execute MCP command via CLI"""
    cmd = [
        "npx",
        "@modelcontextprotocol/cli",
        "call",
        "thebrain-mcp",
        function_name,
        "--params",
        json.dumps(params)
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        return json.loads(result.stdout) if result.stdout else None
    except subprocess.CalledProcessError as e:
        print(f"Error: {e.stderr}")
        return None
    except Exception as e:
        print(f"Unexpected error: {e}")
        return None

def import_batch(batch_num):
    """Import a single batch of thoughts"""
    batch_file = os.path.join(BASE_DIR, f"import_batch_{batch_num}.json")
    mapping_file = os.path.join(BASE_DIR, "id_mapping_current.json")
    
    # Load batch
    with open(batch_file, 'r') as f:
        batch_data = json.load(f)
    
    # Load current mappings
    with open(mapping_file, 'r') as f:
        id_mapping = json.load(f)
    
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
        params = {
            "name": thought['name'],
            "kind": thought.get('kind', 1),
            "acType": thought.get('acType', 0),
            "brainId": BRAIN_ID
        }
        
        # Add optional fields
        if 'label' in thought:
            params['label'] = thought['label']
        if 'foregroundColor' in thought:
            params['foregroundColor'] = thought['foregroundColor']
        if 'backgroundColor' in thought:
            params['backgroundColor'] = thought['backgroundColor']
        
        print(f"  [{i+1}] Creating: {thought['name']} ({thought.get('label', 'N/A')})")
        
        result = run_mcp_command("create_thought", params)
        
        if result and result.get('success') and 'thought' in result:
            new_id = result['thought']['id']
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
    print("TheBrain Import Automation")
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
