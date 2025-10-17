#!/usr/bin/env python3
"""
Simple direct import for TheBrain
"""
import json

# Load the test batch for immediate import
with open("/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/test_batch.json", 'r') as f:
    test_batch = json.load(f)

print(f"Ready to import {len(test_batch)} thoughts")
print("="*50)

# Display the thoughts to import
for i, cmd in enumerate(test_batch):
    print(f"{i+1}. {cmd['params']['name']} ({cmd['params']['label']})")

print("\nThe assistant will now import these thoughts using MCP commands.")
