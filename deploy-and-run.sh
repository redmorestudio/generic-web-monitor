#!/bin/bash

# Deploy and run AI Monitor with TheBrain integration

echo "🚀 Deploying AI Monitor with expanded configuration..."

# Push the code to Google Apps Script
cd /Users/sethredmore/ai-monitor-fresh
clasp push

echo "✅ Code deployed successfully!"
echo ""
echo "📊 To run the comprehensive monitoring:"
echo "1. Open: https://script.google.com/d/12l6cAE0m_NMRCze5T0sZTvNuPPC0RfwAKf1k7VIlF3jdcywonZNe_oMK/edit"
echo "2. Select 'MasterMonitorRunner.gs' file"
echo "3. Run the function: runAIMonitorAndUpdateTheBrain()"
echo ""
echo "Or for a quick test with 3 companies:"
echo "Run: testMonitoringWithSample()"
echo ""
echo "🧠 After monitoring completes, the data will be ready for TheBrain integration!"
