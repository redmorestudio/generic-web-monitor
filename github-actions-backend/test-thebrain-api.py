#!/usr/bin/env python3
"""
Test TheBrain API endpoints to find the correct format
"""

import requests
import json
import os

# Test different API configurations
API_KEY = os.getenv('THEBRAIN_API_KEY', '4c8eabea756ab437069c89c46ce7cf00c477591ab9787a526617370d22a4266c')
BRAIN_ID = os.getenv('THEBRAIN_BRAIN_ID', '134f1325-4a8d-46d7-a078-5386c8ab3542')

# Test configurations
test_configs = [
    {
        'name': 'v1 with Bearer',
        'url': f'https://api.thebrain.com/v1/brains/{BRAIN_ID}',
        'headers': {
            'Authorization': f'Bearer {API_KEY}',
            'Content-Type': 'application/json'
        }
    },
    {
        'name': 'No version with Bearer',
        'url': f'https://api.thebrain.com/brains/{BRAIN_ID}',
        'headers': {
            'Authorization': f'Bearer {API_KEY}',
            'Content-Type': 'application/json'
        }
    },
    {
        'name': 'v1 with apikey header',
        'url': f'https://api.thebrain.com/v1/brains/{BRAIN_ID}',
        'headers': {
            'apikey': API_KEY,
            'Content-Type': 'application/json'
        }
    },
    {
        'name': 'v1 with X-API-Key',
        'url': f'https://api.thebrain.com/v1/brains/{BRAIN_ID}',
        'headers': {
            'X-API-Key': API_KEY,
            'Content-Type': 'application/json'
        }
    },
    {
        'name': 'v2 with Bearer',
        'url': f'https://api.thebrain.com/v2/brains/{BRAIN_ID}',
        'headers': {
            'Authorization': f'Bearer {API_KEY}',
            'Content-Type': 'application/json'
        }
    },
    {
        'name': 'API key in URL parameter',
        'url': f'https://api.thebrain.com/v1/brains/{BRAIN_ID}?apikey={API_KEY}',
        'headers': {
            'Content-Type': 'application/json'
        }
    }
]

print("Testing TheBrain API endpoints...")
print("=" * 60)
print(f"Brain ID: {BRAIN_ID}")
print(f"API Key: {API_KEY[:10]}...")
print("=" * 60)

for config in test_configs:
    print(f"\nTesting: {config['name']}")
    print(f"URL: {config['url']}")
    print(f"Headers: {json.dumps({k: v[:20] + '...' if k.lower().endswith('key') or k == 'Authorization' else v for k, v in config['headers'].items()}, indent=2)}")
    
    try:
        response = requests.get(config['url'], headers=config['headers'], timeout=10)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ SUCCESS!")
            print(f"Response: {json.dumps(response.json(), indent=2)}")
            break
        else:
            print(f"❌ Failed")
            if response.text:
                print(f"Response: {response.text[:200]}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print("-" * 40)

print("\nTesting complete.")
