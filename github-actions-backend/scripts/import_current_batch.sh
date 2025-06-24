#!/bin/bash

# TheBrain Import Script - Continues from where we left off
# Run this script to import the remaining thoughts

echo "Starting TheBrain import..."

# Import the remaining thoughts from the current batch

echo "Importing: developer console"
thebrain-mcp:create_thought name="developer console" label="FEATURE" kind=1 acType=0 foregroundColor="#14b8a6" backgroundColor="#0f0f1e" > /tmp/import_result.json
sleep 1

echo "Importing: documentation"
thebrain-mcp:create_thought name="documentation" label="FEATURE" kind=1 acType=0 foregroundColor="#14b8a6" backgroundColor="#0f0f1e" > /tmp/import_result.json
sleep 1

echo "Importing: custom integrations"
thebrain-mcp:create_thought name="custom integrations" label="FEATURE" kind=1 acType=0 foregroundColor="#14b8a6" backgroundColor="#0f0f1e" > /tmp/import_result.json
sleep 1

echo "Importing: Claude Opus 4"
thebrain-mcp:create_thought name="Claude Opus 4" label="TECHNOLOGY" kind=1 acType=0 foregroundColor="#8b5cf6" backgroundColor="#0f0f1e" > /tmp/import_result.json
sleep 1

echo "Importing: Claude Sonnet 4"
thebrain-mcp:create_thought name="Claude Sonnet 4" label="TECHNOLOGY" kind=1 acType=0 foregroundColor="#8b5cf6" backgroundColor="#0f0f1e" > /tmp/import_result.json
sleep 1

echo "Importing: Claude Haiku 3.5"
thebrain-mcp:create_thought name="Claude Haiku 3.5" label="TECHNOLOGY" kind=1 acType=0 foregroundColor="#8b5cf6" backgroundColor="#0f0f1e" > /tmp/import_result.json
sleep 1

echo "Importing: Constitutional AI"
thebrain-mcp:create_thought name="Constitutional AI" label="TECHNOLOGY" kind=1 acType=0 foregroundColor="#8b5cf6" backgroundColor="#0f0f1e" > /tmp/import_result.json
sleep 1

echo "Importing: Model Context Protocol"
thebrain-mcp:create_thought name="Model Context Protocol" label="TECHNOLOGY" kind=1 acType=0 foregroundColor="#8b5cf6" backgroundColor="#0f0f1e" > /tmp/import_result.json
sleep 1

echo "Importing: Amazon Web Services"
thebrain-mcp:create_thought name="Amazon Web Services" label="COMPANY" kind=1 acType=0 foregroundColor="#3b82f6" backgroundColor="#0f0f1e" > /tmp/import_result.json
sleep 1

echo "Importing: Google Cloud"
thebrain-mcp:create_thought name="Google Cloud" label="COMPANY" kind=1 acType=0 foregroundColor="#3b82f6" backgroundColor="#0f0f1e" > /tmp/import_result.json
sleep 1

echo "Batch import complete!"
echo "Run 'python3 scripts/thebrain_importer.py' to generate the next batch"
