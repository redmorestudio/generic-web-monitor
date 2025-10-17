#!/usr/bin/env python3
"""
Comprehensive TheBrain Import Script
This script can be run independently to import the knowledge graph data
"""

import json
import time
import sys
from datetime import datetime

class TheBrainImporter:
    def __init__(self):
        self.kg_file = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/thebrain-knowledge-graph.json"
        self.progress_file = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/import_progress.json"
        self.commands_file = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend/data/import_commands.txt"
        
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
                "thought_id_map": {}
            }
        
        # Add the thoughts we've already imported
        if "9ef97d759d7c525be1abc8d3c6d1afd0" not in self.progress["thoughts_imported"]:
            self.progress["thoughts_imported"].extend([
                "9ef97d759d7c525be1abc8d3c6d1afd0",  # OpenAI
                "106bd0876b202b114115af61835bd36e",  # Anthropic
                "c2812622a114892f20341032d2580f10"   # Claude
            ])
            
            self.progress["thought_id_map"].update({
                "9ef97d759d7c525be1abc8d3c6d1afd0": "2f8d4c93-ecda-4c03-8ee2-0ad2fc970e36",  # OpenAI
                "106bd0876b202b114115af61835bd36e": "291949e5-8d64-4e8b-b8d4-1b3fa872516c",  # Anthropic
                "c2812622a114892f20341032d2580f10": "952e58f7-6365-4991-9cdc-a9be89039584"   # Claude
            })
            
            self.save_progress()
    
    def save_progress(self):
        """Save current progress"""
        with open(self.progress_file, "w") as f:
            json.dump(self.progress, f, indent=2)
    
    def generate_thought_commands(self, batch_size=20):
        """Generate MCP commands for the next batch of thoughts"""
        commands = []
        count = 0
        
        for thought in self.data["thoughts"]:
            if thought["id"] not in self.progress["thoughts_imported"]:
                # Escape special characters in strings
                name = thought["name"].replace('"', '\\"')
                label = thought.get("label", "").replace('"', '\\"')
                
                cmd = f'''
# Create thought: {name} ({label})
# Original ID: {thought["id"]}
thebrain-mcp:create_thought(
    name="{name}",
    label="{label}",
    kind={thought.get("kind", 1)},
    acType={thought.get("acType", 0)},
    foregroundColor="{thought.get("foregroundColor", "#ffffff")}",
    backgroundColor="{thought.get("backgroundColor", "#0f0f1e")}"
)
'''
                commands.append(cmd)
                count += 1
                if count >= batch_size:
                    break
        
        return commands
    
    def generate_link_commands(self, batch_size=20):
        """Generate MCP commands for the next batch of links"""
        commands = []
        count = 0
        
        for link in self.data["links"]:
            link_id = f"{link.get('thoughtIdA')}-{link.get('thoughtIdB')}"
            if link_id not in self.progress["links_imported"]:
                # Get the new thought IDs
                thought_a = self.progress["thought_id_map"].get(link.get("thoughtIdA"))
                thought_b = self.progress["thought_id_map"].get(link.get("thoughtIdB"))
                
                if thought_a and thought_b:
                    name = link.get("name", "").replace('"', '\\"')
                    
                    cmd = f'''
# Create link: {link.get("thoughtIdA")} -> {link.get("thoughtIdB")}
thebrain-mcp:create_link(
    thoughtIdA="{thought_a}",
    thoughtIdB="{thought_b}",
    relation={link.get("relation", 1)},
    name="{name}",
    color="{link.get("color", "#6fbf6f")}",
    thickness={link.get("thickness", 1)},
    direction={link.get("direction", 0)}
)
'''
                    commands.append(cmd)
                    count += 1
                    if count >= batch_size:
                        break
        
        return commands
    
    def get_status(self):
        """Get current import status"""
        thoughts_total = len(self.data["thoughts"])
        thoughts_done = len(self.progress["thoughts_imported"])
        links_total = len(self.data["links"])
        links_done = len(self.progress["links_imported"])
        
        return {
            "thoughts": {
                "total": thoughts_total,
                "imported": thoughts_done,
                "remaining": thoughts_total - thoughts_done,
                "percentage": round((thoughts_done / thoughts_total) * 100, 2)
            },
            "links": {
                "total": links_total,
                "imported": links_done,
                "remaining": links_total - links_done,
                "percentage": round((links_done / links_total) * 100, 2) if links_total > 0 else 0
            }
        }
    
    def print_status(self):
        """Print import status"""
        status = self.get_status()
        
        print("\n" + "="*60)
        print("TheBrain Import Status")
        print("="*60)
        print(f"Thoughts: {status['thoughts']['imported']}/{status['thoughts']['total']} " +
              f"({status['thoughts']['percentage']}%)")
        print(f"Links: {status['links']['imported']}/{status['links']['total']} " +
              f"({status['links']['percentage']}%)")
        print("="*60)
    
    def save_commands(self, commands, filename):
        """Save commands to a file"""
        with open(filename, "w") as f:
            f.write("# TheBrain Import Commands\n")
            f.write(f"# Generated: {datetime.now()}\n")
            f.write("#" + "="*50 + "\n\n")
            
            for cmd in commands:
                f.write(cmd)
                f.write("\n")
        
        print(f"Commands saved to: {filename}")
    
    def main(self):
        """Main execution"""
        self.print_status()
        
        # Check what to import next
        status = self.get_status()
        
        if status["thoughts"]["remaining"] > 0:
            print(f"\nGenerating commands for next {min(20, status['thoughts']['remaining'])} thoughts...")
            commands = self.generate_thought_commands(20)
            self.save_commands(commands, self.commands_file)
            
            print("\nTo import these thoughts:")
            print("1. Copy the commands from import_commands.txt")
            print("2. Execute them using the MCP tools")
            print("3. Update the progress file with the new IDs")
            print("4. Run this script again")
            
        elif status["links"]["remaining"] > 0:
            print(f"\nGenerating commands for next {min(20, status['links']['remaining'])} links...")
            commands = self.generate_link_commands(20)
            self.save_commands(commands, self.commands_file)
            
            print("\nTo import these links:")
            print("1. Copy the commands from import_commands.txt")
            print("2. Execute them using the MCP tools")
            print("3. Update the progress file")
            print("4. Run this script again")
            
        else:
            print("\n🎉 Import complete! All thoughts and links have been imported.")

if __name__ == "__main__":
    importer = TheBrainImporter()
    importer.main()
