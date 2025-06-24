#!/usr/bin/env python3
"""Check import status"""
import json
import os

BASE_DIR = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data"

# Load data
with open(os.path.join(BASE_DIR, "generated_notes.json"), 'r') as f:
    all_notes = json.load(f)

with open(os.path.join(BASE_DIR, "links_to_import.json"), 'r') as f:
    all_links = json.load(f)

# Check if mapping exists
mapping_file = os.path.join(BASE_DIR, "id_mapping_complete.json")
if os.path.exists(mapping_file):
    with open(mapping_file, 'r') as f:
        id_mapping = json.load(f)
else:
    id_mapping = {}

print("=== IMPORT STATUS CHECK ===")
print(f"Total thoughts in database: {len(all_notes)}")
print(f"Already imported: {len(id_mapping)}")
print(f"Remaining to import: {len(all_notes) - len(id_mapping)}")
print(f"Total links to create: {len(all_links)}")
print("\nBrain currently has 94 thoughts (from API check)")
print(f"This means we need to import {len(all_notes) - 94} more thoughts")
