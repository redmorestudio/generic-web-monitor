#!/bin/bash

echo "Starting TheBrain Import Process..."
echo "=================================="

cd /Users/sethredmore/ai-monitor-fresh/github-actions-backend

# Step 1: Import Thoughts
echo -e "\n1. IMPORTING THOUGHTS..."
python3 run_import.py

# Step 2: Import Links
echo -e "\n2. IMPORTING LINKS..."
if [ -f "scripts/import_essential_links.sh" ]; then
    bash scripts/import_essential_links.sh
else
    echo "Link import script not found, checking alternatives..."
    if [ -f "scripts/import_links_complete.py" ]; then
        python3 scripts/import_links_complete.py
    fi
fi

# Step 3: Import/Generate Notes
echo -e "\n3. GENERATING NOTES..."
if [ -f "generate_notes.py" ]; then
    python3 generate_notes.py
else
    echo "Note generation script not found"
fi

echo -e "\nImport process complete!"
