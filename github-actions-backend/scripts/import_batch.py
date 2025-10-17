#!/usr/bin/env python3
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
print("\nPlease use the MCP tools to import this batch.")
