#!/usr/bin/env python3
"""
Automated TheBrain Import Script using API
This script runs independently to import all thoughts and links
"""

import json
import time
import sys
import requests
from datetime import datetime

class TheBrainAutoImporter:
    def __init__(self):
        # API Configuration
        self.api_key = "4c8eabea756ab437069c89c46ce7cf00c477591ab9787a526617370d22a4266c"
        self.brain_id = "134f1325-4a8d-46d7-a078-5386c8ab3542"
        self.base_url = "https://api.thebrain.com/v2"
        
        # Headers for API requests
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        # File paths
        self.kg_file = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/thebrain-knowledge-graph.json"
        self.progress_file = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/import_progress.json"
        self.log_file = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/import_log.txt"
        
        # Load knowledge graph
        with open(self.kg_file, "r") as f:
            self.data = json.load(f)
        
        # Load or initialize progress
        try:
            with open(self.progress_file, "r") as f:
                self.progress = json.load(f)
        except:
            self.progress = {
                "thoughts_imported": [],
                "links_imported": [],
                "thought_id_map": {},
                "errors": []
            }
        
        # Initialize already imported thoughts
        if not self.progress["thought_id_map"]:
            self.progress["thought_id_map"] = {
                # Already imported thoughts
                "9ef97d759d7c525be1abc8d3c6d1afd0": "2f8d4c93-ecda-4c03-8ee2-0ad2fc970e36",  # OpenAI
                "106bd0876b202b114115af61835bd36e": "291949e5-8d64-4e8b-b8d4-1b3fa872516c",  # Anthropic
                "c2812622a114892f20341032d2580f10": "952e58f7-6365-4991-9cdc-a9be89039584",  # Claude
                "01d578a40b91652e2ba6a