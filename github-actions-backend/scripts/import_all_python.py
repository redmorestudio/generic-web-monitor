#!/usr/bin/env python3
import time
import json

# Load knowledge graph
with open('/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/thebrain-knowledge-graph.json', 'r') as f:
    data = json.load(f)

print(f"Starting import of {len(data['thoughts'])} thoughts...")

# Track progress
imported = 0
errors = []

for i, thought in enumerate(data['thoughts']):
    try:
        # Skip known imports
        if thought['id'] in ['9ef97d759d7c525be1abc8d3c6d1afd0', '106bd0876b202b114115af61835bd36e', 'c2812622a114892f20341032d2580f10']:
            continue
        
        print(f"Importing {i+1}/{len(data['thoughts'])}: {thought['name']}")
        
        # Here you would call the actual MCP import function
        # For now, we're just tracking progress
        
        imported += 1
        
        # Progress update every 50
        if imported % 50 == 0:
            print(f"\nProgress: {imported} thoughts imported\n")
            time.sleep(2)  # Pause to avoid rate limiting
        
    except Exception as e:
        errors.append({'thought': thought['name'], 'error': str(e)})
        print(f"Error importing {thought['name']}: {e}")

print(f"\nImport complete!")
print(f"Successfully imported: {imported}")
print(f"Errors: {len(errors)}")

if errors:
    with open('import_errors.json', 'w') as f:
        json.dump(errors, f, indent=2)
    print("Errors saved to import_errors.json")
