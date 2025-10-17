#!/usr/bin/env python3
"""
TheBrain Import Runner - Execute all import scripts in order
"""
import subprocess
import sys
import os

BASE_DIR = "/Users/sethredmore/ai-monitor-fresh/github-actions-backend"

def run_script(script_name, description):
    """Run a Python script and handle output"""
    print(f"\n{'='*60}")
    print(f"Running: {description}")
    print(f"Script: {script_name}")
    print(f"{'='*60}\n")
    
    script_path = os.path.join(BASE_DIR, script_name)
    
    try:
        result = subprocess.run(
            [sys.executable, script_path],
            capture_output=False,
            text=True
        )
        
        if result.returncode != 0:
            print(f"\n❌ Error running {script_name}")
            print("Do you want to continue? (y/n): ", end='')
            if input().lower() != 'y':
                return False
    except Exception as e:
        print(f"\n❌ Exception running {script_name}: {e}")
        return False
    
    return True

def main():
    print("TheBrain Complete Import Process")
    print("="*60)
    print("This will import:")
    print("- All thoughts (720 items in batches)")
    print("- All links between thoughts")
    print("- All notes content")
    print("- Fix smart group connections")
    print("\nPress Ctrl+C at any time to stop.")
    print("\nReady to start? (y/n): ", end='')
    
    if input().lower() != 'y':
        print("Aborted.")
        return
    
    # Step 1: Import thoughts
    if not run_script("run_import_fixed.py", "Importing all thoughts"):
        print("Stopping due to error.")
        return
    
    print("\n✅ Thoughts imported successfully!")
    print("Press Enter to continue with links import...")
    input()
    
    # Step 2: Import links
    if not run_script("import_links_fixed.py", "Importing all links"):
        print("Stopping due to error.")
        return
    
    print("\n✅ Links imported successfully!")
    print("Press Enter to continue with notes import...")
    input()
    
    # Step 3: Import notes
    if not run_script("import_notes_fixed.py", "Importing all notes"):
        print("Stopping due to error.")
        return
    
    print("\n✅ Notes imported successfully!")
    print("Press Enter to fix smart groups...")
    input()
    
    # Step 4: Fix smart groups
    if not run_script("fix_smart_groups.py", "Fixing smart group connections"):
        print("Stopping due to error.")
        return
    
    print("\n" + "="*60)
    print("🎉 Import Complete!")
    print("="*60)
    print("\nAll data has been imported to TheBrain.")
    print(f"Brain ID: {BRAIN_ID}")
    print("\nYou can now view your brain in TheBrain application.")

if __name__ == "__main__":
    main()
