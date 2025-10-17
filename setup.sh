#!/bin/bash

# Generic Web Monitor - Quick Setup Script
# This script helps you get started with your own monitoring system

echo "🚀 Generic Web Monitor Setup"
echo "=========================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "github-actions-backend" ]; then
    echo "❌ Error: This script must be run from the repository root"
    echo "   Please cd into the generic-web-monitor directory first"
    exit 1
fi

# Function to create a new domain
create_domain() {
    local domain_id=$1
    local domain_name=$2
    
    echo "📁 Creating domain: $domain_id"
    
    # Create domain directory
    mkdir -p "config/domains/$domain_id/prompts"
    
    # Copy templates
    cp config/domains/_template/domain.yaml "config/domains/$domain_id/"
    cp config/domains/_template/interests.yaml "config/domains/$domain_id/"
    cp -r config/domains/_template/prompts/* "config/domains/$domain_id/prompts/" 2>/dev/null || true
    
    # Update domain ID and name in the files
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/your-domain-id/$domain_id/g" "config/domains/$domain_id/domain.yaml"
        sed -i '' "s/Your Domain Name/$domain_name/g" "config/domains/$domain_id/domain.yaml"
    else
        # Linux
        sed -i "s/your-domain-id/$domain_id/g" "config/domains/$domain_id/domain.yaml"
        sed -i "s/Your Domain Name/$domain_name/g" "config/domains/$domain_id/domain.yaml"
    fi
    
    echo "✅ Domain created at config/domains/$domain_id/"
}

# Interactive setup
echo "Let's set up your monitoring domain!"
echo ""

echo "What would you like to monitor?"
echo "1) News and Media"
echo "2) Government/Regulatory"
echo "3) Competitors/Industry"
echo "4) E-commerce/Prices"
echo "5) Academic/Research"
echo "6) Custom Domain"
echo ""
read -p "Choose an option (1-6): " choice

case $choice in
    1)
        domain_type="news"
        suggested_name="News Monitoring"
        ;;
    2)
        domain_type="regulatory"
        suggested_name="Regulatory Monitoring"
        ;;
    3)
        domain_type="competitive"
        suggested_name="Competitive Intelligence"
        ;;
    4)
        domain_type="ecommerce"
        suggested_name="Price Monitoring"
        ;;
    5)
        domain_type="academic"
        suggested_name="Research Monitoring"
        ;;
    6)
        domain_type="custom"
        suggested_name="Custom Monitoring"
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo ""
read -p "Enter a short ID for your domain (e.g., 'my-news'): " domain_id
read -p "Enter a display name (default: $suggested_name): " domain_name

# Use suggested name if none provided
if [ -z "$domain_name" ]; then
    domain_name=$suggested_name
fi

# Validate domain ID
if [[ ! "$domain_id" =~ ^[a-z0-9-]+$ ]]; then
    echo "❌ Error: Domain ID must contain only lowercase letters, numbers, and hyphens"
    exit 1
fi

# Check if domain already exists
if [ -d "config/domains/$domain_id" ]; then
    echo "❌ Error: Domain $domain_id already exists"
    exit 1
fi

# Create the domain
create_domain "$domain_id" "$domain_name"

echo ""
echo "🎉 Domain created successfully!"
echo ""
echo "Next steps:"
echo "1. Edit config/domains/$domain_id/domain.yaml to add URLs to monitor"
echo "2. Edit config/domains/$domain_id/interests.yaml to define what's important"
echo "3. Set up GitHub Secrets (see docs/SETUP.md)"
echo "4. Run: npm run init-domain $domain_id"
echo "5. Deploy to GitHub Pages"
echo ""
echo "📚 See docs/CONFIGURATION.md for detailed configuration options"
echo ""

# Offer to install dependencies
read -p "Would you like to install dependencies now? (y/n): " install_deps
if [ "$install_deps" = "y" ] || [ "$install_deps" = "Y" ]; then
    echo "Installing dependencies..."
    cd github-actions-backend && npm install
    echo "✅ Dependencies installed"
fi

echo ""
echo "🚀 Setup complete! Happy monitoring!"
