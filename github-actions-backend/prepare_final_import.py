#!/usr/bin/env python3
"""
Complete TheBrain Import Script
This script prepares all the import data and provides instructions for execution
"""
import json
import os
from datetime import datetime

# Paths
BASE_DIR = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data"
JSON_FILE = os.path.join(BASE_DIR, "thebrain-knowledge-graph.json")
FINAL_SCRIPT = os.path.join(BASE_DIR, "final_import_script.sh")

# Load the original data
with open(JSON_FILE, 'r') as f:
    data = json.load(f)

print(f"TheBrain Import Summary")
print("="*60)
print(f"Export Date: {data['brain']['exportDate']}")
print(f"Brain Name: {data['brain']['name']}")
print(f"Total Thoughts: {len(data['thoughts'])}")
print(f"Total Links: {len(data['links'])}")
print()

# Current mappings (what we've created so far)
current_mappings = {
    "9ef97d759d7c525be1abc8d3c6d1afd0": "23f01146-44a7-4eed-96df-35e6edc762d2",  # OpenAI
    "106bd0876b202b114115af61835bd36e": "32519c2f-830a-4942-b26d-487669c362fa",  # Anthropic  
    "c2812622a114892f20341032d2580f10": "10a932c7-1100-4757-a246-a4e34a8eb3cf",  # Claude
    "01d578a40b91652e2ba6adc3b39dd5f3": "a25c9050-b233-4f8c-ba48-7950e9c5f3a5",  # chat interface
    "daf8aadd85aff6d31b042534a3bcc484": "c8d6c325-93b1-4619-9848-7071d0747459"   # web access
}

thoughts_created = len(current_mappings)
thoughts_remaining = len(data['thoughts']) - thoughts_created

print(f"Import Progress:")
print(f"- Thoughts created: {thoughts_created}")
print(f"- Thoughts remaining: {thoughts_remaining}")
print(f"- Links to create: {len(data['links'])}")
print()

# Generate batch import commands
print("Generating batch import commands...")

# Split remaining thoughts into manageable batches
BATCH_SIZE = 25
remaining_thoughts = [t for t in data['thoughts'] if t['id'] not in current_mappings]
batches = []

for i in range(0, len(remaining_thoughts), BATCH_SIZE):
    batch = remaining_thoughts[i:i + BATCH_SIZE]
    batch_num = len(batches) + 1
    batches.append({
        'batch_num': batch_num,
        'thoughts': batch
    })

print(f"Created {len(batches)} batches of {BATCH_SIZE} thoughts each")

# Save each batch
for batch in batches:
    batch_file = os.path.join(BASE_DIR, f"import_batch_{batch['batch_num']}.json")
    with open(batch_file, 'w') as f:
        json.dump({
            'batch_num': batch['batch_num'],
            'thoughts': batch['thoughts'],
            'count': len(batch['thoughts'])
        }, f, indent=2)

# Save current mappings
mapping_file = os.path.join(BASE_DIR, "id_mapping_current.json")
with open(mapping_file, 'w') as f:
    json.dump(current_mappings, f, indent=2)

# Generate import instructions
instructions = f"""
THEBRAIN IMPORT INSTRUCTIONS
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

Total Items to Import:
- Thoughts: {len(remaining_thoughts)} (in {len(batches)} batches)
- Links: {len(data['links'])}

Files Generated:
- Batch files: import_batch_1.json through import_batch_{len(batches)}.json
- Current mappings: id_mapping_current.json
- Links data: links_to_import.json

To complete the import:

1. Import all thoughts (batch by batch):
   - Each batch contains {BATCH_SIZE} thoughts
   - Use thebrain-mcp:create_thought for each thought
   - Save the new IDs to id_mapping_current.json

2. After all thoughts are imported:
   - Use the id_mapping to create links
   - Each link requires the new thought IDs

3. Verify the import:
   - Check total thought count in TheBrain
   - Verify all links are properly connected

The import is designed to be resumable - if interrupted, 
check id_mapping_current.json to see what's been completed.
"""

# Save instructions
instructions_file = os.path.join(BASE_DIR, "import_instructions.txt")
with open(instructions_file, 'w') as f:
    f.write(instructions)

# Save links for later import
links_file = os.path.join(BASE_DIR, "links_to_import.json")
with open(links_file, 'w') as f:
    json.dump(data['links'], f, indent=2)

print("\nImport preparation complete!")
print(f"\nFiles created in {BASE_DIR}:")
print(f"- {len(batches)} batch files (import_batch_*.json)")
print(f"- Current ID mappings (id_mapping_current.json)")
print(f"- Links data (links_to_import.json)")
print(f"- Import instructions (import_instructions.txt)")
print()
print("Next step: Execute the batch imports using the MCP server")
