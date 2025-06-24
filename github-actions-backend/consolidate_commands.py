#!/usr/bin/env python3
"""
Generate consolidated import commands for all thoughts
"""
import json
import os

# Load existing mappings
id_mapping = {
    "9ef97d759d7c525be1abc8d3c6d1afd0": "23f01146-44a7-4eed-96df-35e6edc762d2",  # OpenAI
    "106bd0876b202b114115af61835bd36e": "32519c2f-830a-4942-b26d-487669c362fa",  # Anthropic  
    "c2812622a114892f20341032d2580f10": "10a932c7-1100-4757-a246-a4e34a8eb3cf"   # Claude
}

# Consolidate all batch commands
all_commands = []
batch_files = []

for i in range(1, 16):
    batch_file = f"/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/batch_{i}_commands.json"
    if os.path.exists(batch_file):
        with open(batch_file, 'r') as f:
            commands = json.load(f)
            all_commands.extend(commands)
            batch_files.append(f"Batch {i}: {len(commands)} thoughts")

print(f"Consolidated {len(all_commands)} thoughts from {len(batch_files)} batches")
print("\nBatch breakdown:")
for bf in batch_files:
    print(f"  {bf}")

# Save consolidated commands
consolidated_file = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/all_import_commands.json"
with open(consolidated_file, 'w') as f:
    json.dump(all_commands, f, indent=2)

print(f"\nAll commands saved to: {consolidated_file}")

# Also save a smaller test batch for testing
test_batch = all_commands[3:20]  # Skip the 3 we already created
test_file = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/test_batch.json"
with open(test_file, 'w') as f:
    json.dump(test_batch, f, indent=2)

print(f"Test batch (17 thoughts) saved to: {test_file}")

# Update ID mapping file
with open("/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/id_mapping.json", 'w') as f:
    json.dump(id_mapping, f, indent=2)

print(f"\nCurrent ID mappings: {len(id_mapping)}")
print("Ready to continue import process!")
