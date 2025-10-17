#!/bin/bash
# Run the complete TheBrain import

echo "Starting TheBrain import process..."
echo "This will import all thoughts, links, and notes from your AI competitive monitor."
echo ""

cd /Users/sethredmore/ai-monitor-fresh/github-actions-backend

# Make the script executable
chmod +x import_complete_to_brain.py

# Run the import
python3 import_complete_to_brain.py

echo ""
echo "Import process complete!"
echo "You can now open TheBrain to see your imported competitive intelligence data."