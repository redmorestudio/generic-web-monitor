#!/usr/bin/env python3
"""
Debug TheBrain API connection issue
"""

import requests
import sys

# Configuration
BRAIN_ID = '4de379f0-2268-436a-8459-f11491bfdbf5'
API_KEYS = [
    '4c8eabea756ab437069c89c46ce7cf00c477591ab9787a526617370d22a4266c',  # From documents (first)
    'f1a20acf4b122eaf273ea4f028632783b584db7ef167334139f5583f002fea62'   # From documents (second)
]

# API endpoints to test
ENDPOINTS = [
    'https://api.thebrain.com/v1/brains/{brain_id}',
    'https://api.thebrain.com/v2/brains/{brain_id}',
    'https://api.thebrain.com/brains/{brain_id}',
]

print("=" * 60)
print("TheBrain API Debug")
print("=" * 60)
print(f"Brain ID: {BRAIN_ID}\n")

# Test each combination
for api_key_idx, api_key in enumerate(API_KEYS):
    print(f"Testing API Key #{api_key_idx + 1}: {api_key[:10]}...")
    
    for endpoint in ENDPOINTS:
        url = endpoint.format(brain_id=BRAIN_ID)
        print(f"\n  Testing: {url}")
        
        headers = {
            'Authorization': f'Bearer {api_key}',
            'Accept': 'application/json'
        }
        
        try:
            response = requests.get(url, headers=headers, timeout=10)
            print(f"    Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"    ✅ SUCCESS! Brain name: {data.get('name', 'Unknown')}")
                print(f"    Full response: {data}")
                # Found a working combination
                print(f"\n✅ WORKING CONFIGURATION:")
                print(f"   API Key: {api_key}")
                print(f"   Endpoint: {url}")
                sys.exit(0)
            else:
                print(f"    ❌ Error: {response.text[:100]}...")
                
        except Exception as e:
            print(f"    ❌ Exception: {e}")

# Also test without version in path
print("\n\nTesting alternative endpoints...")

# Test MCP-style endpoint (no version)
for api_key in API_KEYS:
    print(f"\nTesting direct endpoint with key {api_key[:10]}...")
    
    # Test getting brain info without version
    url = f'https://api.thebrain.com/brains/{BRAIN_ID}'
    headers = {'Authorization': f'Bearer {api_key}'}
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        print(f"  Status: {response.status_code}")
        if response.status_code == 200:
            print(f"  ✅ SUCCESS! {response.json()}")
    except Exception as e:
        print(f"  ❌ Error: {e}")

print("\n❌ No working configuration found!")
print("\nPossible issues:")
print("1. API keys might be incorrect or expired")
print("2. Brain ID might be wrong")
print("3. API endpoint structure might have changed")
