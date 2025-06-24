#!/usr/bin/env python3
"""
Fix Smart Groups in TheBrain - Link smart groups to their members
"""
import json
import requests
import time
import os

BASE_DIR = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data"
BRAIN_ID = "134f1325-4a8d-46d7-a078-5386c8ab3542"
API_KEY = "4c8eabea756ab437069c89c46ce7cf00c477591ab9787a526617370d22a4266c"
API_BASE = "https://api.bra.in/v1"

# Headers for API requests
headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

def search_thoughts(query, max_results=100):
    """Search for thoughts in the brain"""
    url = f"{API_BASE}/search/{BRAIN_ID}"
    params = {
        "queryText": query,
        "maxResults": max_results,
        "onlySearchThoughtNames": True
    }
    
    try:
        response = requests.get(url, params=params, headers=headers)
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Search error: {response.status_code} - {response.text}")
            return []
    except Exception as e:
        print(f"Search exception: {e}")
        return []

def get_thought_graph(thought_id):
    """Get a thought with all its connections"""
    url = f"{API_BASE}/thoughts/{BRAIN_ID}/{thought_id}/graph"
    
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Graph error: {response.status_code}")
            return None
    except Exception as e:
        print(f"Graph exception: {e}")
        return None

def create_link_api(thought_id_a, thought_id_b, relation, name=None):
    """Create a link using the Brain API"""
    url = f"{API_BASE}/links/{BRAIN_ID}"
    
    payload = {
        "thoughtIdA": thought_id_a,
        "thoughtIdB": thought_id_b,
        "relation": relation
    }
    
    if name:
        payload["name"] = name
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        if response.status_code == 200:
            result = response.json()
            return result.get('id')
        else:
            print(f"     Link error: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"     Link exception: {e}")
        return None

def find_smart_groups():
    """Find all smart group thoughts"""
    smart_groups = []
    
    # Smart groups have specific labels
    group_labels = [
        "(COMPANY)",
        "(PRODUCT)",
        "(TECHNOLOGY)",
        "(PEOPLE)",
        "(INFRASTRUCTURE)",
        "(MARKET)",
        "(FEATURES)",
        "(COMPLIANCE)",
        "(INNOVATION)",
        "(PARTNERSHIPS)"
    ]
    
    for label in group_labels:
        results = search_thoughts(label)
        for result in results:
            if result['sourceThought'] and label in result['sourceThought'].get('label', ''):
                smart_groups.append(result['sourceThought'])
    
    return smart_groups

def find_members_for_group(group_thought):
    """Find all thoughts that should be members of this smart group"""
    members = []
    
    # Extract the category from the label
    label = group_thought.get('label', '')
    category = label.replace('(', '').replace(')', '').strip()
    
    # Search for thoughts that match this category
    # For example, if it's "(COMPANY)", search for company names
    if category == "COMPANY":
        companies = ["OpenAI", "Anthropic", "Google", "Microsoft", "Apple", "Tesla", "NVIDIA"]
        for company in companies:
            results = search_thoughts(company)
            members.extend([r['sourceThought'] for r in results if r['sourceThought']])
    
    elif category == "PRODUCT":
        products = ["ChatGPT", "Claude", "Copilot", "Gemini", "GPT-4", "Midjourney", "DALL-E"]
        for product in products:
            results = search_thoughts(product)
            members.extend([r['sourceThought'] for r in results if r['sourceThought']])
    
    elif category == "TECHNOLOGY":
        techs = ["Transformers", "Neural Networks", "Machine Learning", "Deep Learning", "NLP"]
        for tech in techs:
            results = search_thoughts(tech)
            members.extend([r['sourceThought'] for r in results if r['sourceThought']])
    
    # Remove duplicates
    seen_ids = set()
    unique_members = []
    for member in members:
        if member['id'] not in seen_ids:
            seen_ids.add(member['id'])
            unique_members.append(member)
    
    return unique_members

def main():
    print("TheBrain Smart Groups Fixer")
    print("="*60)
    
    # Find all smart groups
    print("Finding smart groups...")
    smart_groups = find_smart_groups()
    print(f"Found {len(smart_groups)} smart groups")
    
    total_links_created = 0
    
    for group in smart_groups:
        print(f"\nProcessing: {group['name']} {group.get('label', '')}")
        
        # Get current connections
        graph = get_thought_graph(group['id'])
        if not graph:
            continue
            
        # Find what should be connected
        members = find_members_for_group(group)
        print(f"  Found {len(members)} potential members")
        
        # Get existing connections
        existing_children = {child['id'] for child in graph.get('children', [])}
        existing_jumps = {jump['id'] for jump in graph.get('jumps', [])}
        existing_connected = existing_children | existing_jumps
        
        # Create missing connections
        links_created = 0
        for member in members:
            if member['id'] not in existing_connected and member['id'] != group['id']:
                # Create a jump link from smart group to member
                link_id = create_link_api(group['id'], member['id'], 3)  # 3 = Jump relation
                if link_id:
                    links_created += 1
                    print(f"    Linked to: {member['name']}")
                time.sleep(0.05)  # Rate limiting
        
        print(f"  Created {links_created} new links")
        total_links_created += links_created
    
    print("\n" + "="*60)
    print(f"Smart Groups Fix Complete!")
    print(f"Total links created: {total_links_created}")

if __name__ == "__main__":
    main()
