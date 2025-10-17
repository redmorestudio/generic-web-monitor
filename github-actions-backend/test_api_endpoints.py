#!/usr/bin/env python3
"""Test TheBrain API endpoints"""
import requests
import json

BRAIN_ID = "134f1325-4a8d-46d7-a078-5386c8ab3542"
API_KEY = "4c8eabea756ab437069c89c46ce7cf00c477591ab9787a526617370d22a4266c"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

print("Testing TheBrain API endpoints...")

# Test different endpoint formats
endpoints = [
    f"https://api.bra.in/v1/thoughts/{BRAIN_ID}",
    f"https://api.bra.in/v1/brains/{BRAIN_ID}/thoughts",
    f"https://api.thebrain.com/v1/thoughts/{BRAIN_ID}",
    f"https://api.thebrain.com/v1/brains/{BRAIN_ID}/thoughts",
]

for endpoint in endpoints:
    print(f"\nTesting: {endpoint}")
    try:
        # Try a simple GET first
        response = requests.get(endpoint, headers=headers)
        print(f"  GET Status: {response.status_code}")
        
        # Try POST
        payload = {
            "name": "Test Thought",
            "kind": 1,
            "foregroundColor": "#3b82f6",
            "label": "TEST"
        }
        response = requests.post(endpoint, json=payload, headers=headers)
        print(f"  POST Status: {response.status_code}")
        if response.status_code != 404:
            print(f"  Response: {response.text[:200]}")
    except Exception as e:
        print(f"  Error: {e}")
