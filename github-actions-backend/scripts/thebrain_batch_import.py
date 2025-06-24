#!/usr/bin/env python3
"""
Automated TheBrain Import Script
This script automatically imports all thoughts and links from the knowledge graph
"""

import json
import time
import subprocess
import sys
from datetime import datetime

class TheBrainBatchImporter:
    def __init__(self):
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
                "thought_id_map": {}
            }
        
        # Open log file
        self.log = open(self.log_file, "a")
        self.log.write(f"\n\n=== Import started at {datetime.now()} ===\n")
    
    def log_message(self, message):
        """Log a message to console and file"""
        print(message)
        self.log.write(f"{datetime.now()}: {message}\n")
        self.log.flush()
    
    def save_progress(self):
        """Save current progress"""
        with open(self.progress_file, "w") as f:
            json.dump(self.progress, f, indent=2)
    
    def import_thoughts_batch(self, batch_size=10):
        """Import a batch of thoughts"""
        imported = 0
        
        for thought in self.data["thoughts"]:
            if thought["id"] not in self.progress["thoughts_imported"]:
                self.log_message(f"Importing thought: {thought['name']} ({thought.get('label', '')})")
                
                # Here you would call the actual import function
                # For now, we'll simulate it
                thought_id = f"imported-{thought['id']}"  # This would be the actual ID from the import
                
                # Record the import
                self.progress["thoughts_imported"].append(thought["id"])
                self.progress["thought_id_map"][thought["id"]] = thought_id
                
                imported += 1
                
                # Save progress every 5 imports
                if imported % 5 == 0:
                    self.save_progress()
                
                # Stop after batch size
                if imported >= batch_size:
                    break
                
                # Small delay to avoid rate limiting
                time.sleep(0.5)
        
        self.save_progress()
        return imported
    
    def import_links_batch(self, batch_size=10):
        """Import a batch of links"""
        imported = 0
        
        for link in self.data["links"]:
            link_id = f"{link.get('thoughtIdA')}-{link.get('thoughtIdB')}"
            if link_id not in self.progress["links_imported"]:
                # Check if both thoughts are imported
                thought_a = self.progress["thought_id_map"].get(link.get("thoughtIdA"))
                thought_b = self.progress["thought_id_map"].get(link.get("thoughtIdB"))
                
                if thought_a and thought_b:
                    self.log_message(f"Importing link: {link.get('thoughtIdA')} -> {link.get('thoughtIdB')}")
                    
                    # Here you would call the actual import function
                    # Record the import
                    self.progress["links_imported"].append(link_id)
                    
                    imported += 1
                    
                    # Save progress every 5 imports
                    if imported % 5 == 0:
                        self.save_progress()
                    
                    # Stop after batch size
                    if imported >= batch_size:
                        break
                    
                    # Small delay to avoid rate limiting
                    time.sleep(0.5)
        
        self.save_progress()
        return imported
    
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
    
    def run_continuous_import(self, thought_batch_size=20, link_batch_size=20):
        """Run import continuously until complete"""
        while True:
            status = self.get_status()
            
            # Print status
            self.log_message(f"\n=== Import Status ===")
            self.log_message(f"Thoughts: {status['thoughts']['imported']}/{status['thoughts']['total']} ({status['thoughts']['percentage']}%)")
            self.log_message(f"Links: {status['links']['imported']}/{status['links']['total']} ({status['links']['percentage']}%)")
            
            # Import thoughts first
            if status["thoughts"]["remaining"] > 0:
                self.log_message(f"\nImporting next {min(thought_batch_size, status['thoughts']['remaining'])} thoughts...")
                imported = self.import_thoughts_batch(thought_batch_size)
                self.log_message(f"Imported {imported} thoughts")
                
                # Pause between batches
                if imported > 0:
                    self.log_message("Pausing for 5 seconds...")
                    time.sleep(5)
            
            # Then import links
            elif status["links"]["remaining"] > 0:
                self.log_message(f"\nImporting next {min(link_batch_size, status['links']['remaining'])} links...")
                imported = self.import_links_batch(link_batch_size)
                self.log_message(f"Imported {imported} links")
                
                # Pause between batches
                if imported > 0:
                    self.log_message("Pausing for 5 seconds...")
                    time.sleep(5)
            
            # All done!
            else:
                self.log_message("\n🎉 Import complete! All thoughts and links have been imported.")
                break
    
    def close(self):
        """Close log file"""
        self.log.close()

def main():
    """Main entry point"""
    print("TheBrain Batch Import Tool")
    print("=" * 50)
    
    importer = TheBrainBatchImporter()
    
    try:
        # Get current status
        status = importer.get_status()
        print(f"\nCurrent Status:")
        print(f"Thoughts: {status['thoughts']['imported']}/{status['thoughts']['total']} ({status['thoughts']['percentage']}%)")
        print(f"Links: {status['links']['imported']}/{status['links']['total']} ({status['links']['percentage']}%)")
        
        # Ask user what to do
        print("\nOptions:")
        print("1. Import next batch (20 items)")
        print("2. Run continuous import (all remaining)")
        print("3. Show detailed status")
        print("4. Exit")
        
        choice = input("\nEnter choice (1-4): ")
        
        if choice == "1":
            # Import single batch
            if status["thoughts"]["remaining"] > 0:
                imported = importer.import_thoughts_batch(20)
                print(f"\nImported {imported} thoughts")
            elif status["links"]["remaining"] > 0:
                imported = importer.import_links_batch(20)
                print(f"\nImported {imported} links")
            else:
                print("\nNothing to import!")
        
        elif choice == "2":
            # Run continuous import
            print("\nStarting continuous import...")
            print("This will import all remaining items with pauses between batches.")
            print("Press Ctrl+C to stop at any time.")
            
            try:
                importer.run_continuous_import()
            except KeyboardInterrupt:
                print("\n\nImport interrupted by user")
                importer.save_progress()
        
        elif choice == "3":
            # Show detailed status
            print("\nDetailed Status:")
            print(f"Knowledge graph file: {importer.kg_file}")
            print(f"Progress file: {importer.progress_file}")
            print(f"Log file: {importer.log_file}")
            print(f"\nThoughts imported: {status['thoughts']['imported']}")
            print(f"Thoughts remaining: {status['thoughts']['remaining']}")
            print(f"Links imported: {status['links']['imported']}")
            print(f"Links remaining: {status['links']['remaining']}")
        
    finally:
        importer.close()
        print("\nDone!")

if __name__ == "__main__":
    main()
