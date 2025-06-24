#!/usr/bin/env python3
"""
Generate all MCP commands for import
This creates a list of commands you can execute
"""
import json
import os

# Configuration
BASE_DIR = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data"
BRAIN_ID = "134f1325-4a8d-46d7-a078-5386c8ab3542"

# Load all data
print("Loading data files...")
with open(os.path.join(BASE_DIR, "generated_notes.json"), 'r') as f:
    all_notes = json.load(f)

# Load existing mapping to skip already imported thoughts
mapping_file = os.path.join(BASE_DIR, "id_mapping_complete.json")
if os.path.exists(mapping_file):
    with open(mapping_file, 'r') as f:
        id_mapping = json.load(f)
else:
    id_mapping = {}

print(f"Total thoughts: {len(all_notes)}")
print(f"Already imported: {len(id_mapping)}")
print(f"To import: {len(all_notes) - len(id_mapping)}")

# Generate commands
commands = []
count = 0

for old_id, note_content in all_notes.items():
    if old_id in id_mapping:
        continue
    
    # Extract info from note
    lines = note_content.strip().split('\n')
    name = lines[0].replace('# ', '').strip() if lines else 'Unknown'
    
    # Extract entity type
    entity_type = "unknown"
    for line in lines:
        if "**Entity Type:**" in line:
            entity_type = line.split("**Entity Type:**")[1].strip().lower()
            break
    
    # Determine color and label
    color_map = {
        "company": ("#3b82f6", "COMPANY"),
        "product": ("#10b981", "PRODUCT"),
        "feature": ("#14b8a6", "FEATURE"),
        "technology": ("#8b5cf6", "TECHNOLOGY"),
        "person": ("#ef4444", "PERSON"),
        "pricing": ("#f59e0b", "PRICING"),
        "market": ("#6b7280", "MARKET"),
        "capability": ("#10b981", "CAPABILITY")
    }
    
    color, label = color_map.get(entity_type, ("#9ca3af", entity_type.upper()))
    
    count += 1
    
    # Create command with escaped quotes
    name_safe = name.replace('"', '\\"')
    label_safe = label.replace('"', '\\"')
    
    cmd = f'# [{count}] {name} ({label}) - old_id: {old_id}\n'
    cmd += f'create_thought(brainId="{BRAIN_ID}", name="{name_safe}", foregroundColor="{color}", label="{label_safe}", kind=1)\n'
    
    commands.append(cmd)

# Save commands to file
output_file = os.path.join(BASE_DIR, "mcp_import_commands_all.txt")
with open(output_file, 'w') as f:
    f.write("# MCP Commands for TheBrain Import\n")
    f.write(f"# Total commands: {len(commands)}\n")
    f.write("# Execute these using the MCP tools\n")
    f.write("#" + "="*50 + "\n\n")
    
    for cmd in commands:
        f.write(cmd)
        f.write("\n")

print(f"\nCommands saved to: {output_file}")
print(f"Total commands generated: {len(commands)}")
print("\nNow you can:")
print("1. Open the file and copy commands in batches")
print("2. Execute them using the MCP tools that are already working")
print("3. Update the id_mapping_complete.json file as you go")
