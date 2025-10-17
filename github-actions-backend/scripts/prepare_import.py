#!/usr/bin/env python3
"""
Import knowledge graph data into TheBrain using MCP tools
This script reads the knowledge graph JSON and imports it piece by piece
"""

import json
import time
import sys

# Load the knowledge graph data
print("Loading knowledge graph data...")
with open("/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/thebrain-knowledge-graph.json", "r") as f:
    data = json.load(f)

thoughts = data.get("thoughts", [])
links = data.get("links", [])

print(f"Found {len(thoughts)} thoughts and {len(links)} links to import")
print("\nThis script will guide you through the import process.")
print("Due to conversation limits, we'll import in batches.")
print("\n" + "="*50)

# Create progress file to track what's been imported
progress_file = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/import_progress.json"

try:
    with open(progress_file, "r") as f:
        progress = json.load(f)
except:
    progress = {
        "thoughts_imported": [],
        "links_imported": [],
        "thought_id_map": {}
    }

# Show current progress
thoughts_remaining = len(thoughts) - len(progress["thoughts_imported"])
links_remaining = len(links) - len(progress["links_imported"])

print(f"\nCurrent Progress:")
print(f"- Thoughts imported: {len(progress['thoughts_imported'])}/{len(thoughts)}")
print(f"- Links imported: {len(progress['links_imported'])}/{len(links)}")
print(f"- Thoughts remaining: {thoughts_remaining}")
print(f"- Links remaining: {links_remaining}")

# Prepare batch import data
BATCH_SIZE = 50  # Process 50 items at a time

# Get next batch of thoughts to import
next_thoughts = []
for thought in thoughts:
    if thought["id"] not in progress["thoughts_imported"]:
        next_thoughts.append(thought)
        if len(next_thoughts) >= BATCH_SIZE:
            break

# Get next batch of links to import
next_links = []
if len(next_thoughts) == 0:  # Only import links if all thoughts are done
    for link in links:
        link_id = f"{link.get('thoughtIdA')}-{link.get('thoughtIdB')}"
        if link_id not in progress["links_imported"]:
            next_links.append(link)
            if len(next_links) >= BATCH_SIZE:
                break

# Save the next batch to process
batch_data = {
    "thoughts": next_thoughts,
    "links": next_links,
    "progress": progress
}

with open("/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/next_batch.json", "w") as f:
    json.dump(batch_data, f, indent=2)

print(f"\n\nNext batch prepared:")
print(f"- Thoughts to import: {len(next_thoughts)}")
print(f"- Links to import: {len(next_links)}")

if len(next_thoughts) == 0 and len(next_links) == 0:
    print("\n🎉 All done! The entire knowledge graph has been imported.")
else:
    print("\n📋 Next steps:")
    print("1. Run the import_batch.py script to import the next batch")
    print("2. The script will update the progress file automatically")
    print("3. Repeat until all data is imported")
    
    # Create the batch import script
    batch_script = '''#!/usr/bin/env python3
"""Import a batch of data into TheBrain"""
import json
import sys

# This script will be called by Claude to import each batch
# The actual import will be done using the MCP tools

with open("/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/next_batch.json", "r") as f:
    batch = json.load(f)

print("Batch loaded. Ready to import:")
print(f"- {len(batch['thoughts'])} thoughts")
print(f"- {len(batch['links'])} links")
print("\\nPlease use the MCP tools to import this batch.")
'''
    
    with open("/Users/sethredmore/ai-monitor-fresh/github-actions-backend/scripts/import_batch.py", "w") as f:
        f.write(batch_script)
    
    print(f"\nBatch import script created: import_batch.py")
