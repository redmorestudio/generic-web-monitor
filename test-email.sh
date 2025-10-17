#!/bin/bash

# Test email functionality locally
cd github-actions-backend

echo "Testing email configuration..."

# Test basic email
echo "1. Testing basic email alert..."
node email-notifications-enhanced.js test

# Test daily verification email
echo "2. Testing daily verification email..."
node email-notifications-enhanced.js daily

# Export email summary
echo "3. Exporting email summary..."
node email-notifications-enhanced.js export

echo "Done! Check your email for test messages."
