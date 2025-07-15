#!/bin/bash

# AI Competitive Monitor - Company Management Script
# This script helps manage companies and URLs in the intelligence database

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
DB_PATH="$SCRIPT_DIR/data/intelligence.db"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if database exists
if [ ! -f "$DB_PATH" ]; then
    echo -e "${RED}Error: Database not found at $DB_PATH${NC}"
    echo "Please run this script from the github-actions-backend directory"
    exit 1
fi

# Function to list all companies
list_companies() {
    echo -e "${GREEN}Companies in the monitor:${NC}"
    sqlite3 "$DB_PATH" -header -column "
        SELECT 
            c.id, 
            c.name, 
            c.category, 
            c.enabled,
            COUNT(u.id) as url_count 
        FROM companies c 
        LEFT JOIN urls u ON c.id = u.company_id 
        GROUP BY c.id 
        ORDER BY c.name;"
}

# Function to list URLs for a company
list_urls() {
    local company_name="$1"
    echo -e "${GREEN}URLs for $company_name:${NC}"
    sqlite3 "$DB_PATH" -header -column "
        SELECT 
            u.id,
            u.url,
            u.url_type,
            u.enabled
        FROM urls u
        JOIN companies c ON u.company_id = c.id
        WHERE c.name = '$company_name'
        ORDER BY u.url;"
}

# Function to add a company
add_company() {
    local name="$1"
    local category="$2"
    
    # Check if company already exists
    local exists=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM companies WHERE name='$name';")
    if [ "$exists" -gt 0 ]; then
        echo -e "${RED}Error: Company '$name' already exists${NC}"
        return 1
    fi
    
    sqlite3 "$DB_PATH" "INSERT INTO companies (name, category, enabled) VALUES ('$name', '$category', 1);"
    echo -e "${GREEN}✓ Added company: $name ($category)${NC}"
}

# Function to add a URL
add_url() {
    local company_name="$1"
    local url="$2"
    local url_type="${3:-homepage}"
    
    # Check if company exists
    local company_id=$(sqlite3 "$DB_PATH" "SELECT id FROM companies WHERE name='$company_name';")
    if [ -z "$company_id" ]; then
        echo -e "${RED}Error: Company '$company_name' not found${NC}"
        return 1
    fi
    
    # Check if URL already exists
    local exists=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM urls WHERE url='$url';")
    if [ "$exists" -gt 0 ]; then
        echo -e "${RED}Error: URL '$url' already exists${NC}"
        return 1
    fi
    
    sqlite3 "$DB_PATH" "INSERT INTO urls (company_id, url, url_type, enabled) VALUES ($company_id, '$url', '$url_type', 1);"
    echo -e "${GREEN}✓ Added URL: $url ($url_type) to $company_name${NC}"
}

# Function to delete a company
delete_company() {
    local name="$1"
    
    # Check if company exists
    local company_id=$(sqlite3 "$DB_PATH" "SELECT id FROM companies WHERE name='$name';")
    if [ -z "$company_id" ]; then
        echo -e "${RED}Error: Company '$name' not found${NC}"
        return 1
    fi
    
    # Get URL count
    local url_count=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM urls WHERE company_id=$company_id;")
    
    echo -e "${YELLOW}Warning: This will delete '$name' and $url_count associated URLs${NC}"
    read -p "Are you sure? (y/N): " confirm
    
    if [[ $confirm =~ ^[Yy]$ ]]; then
        sqlite3 "$DB_PATH" "DELETE FROM companies WHERE id=$company_id;"
        echo -e "${GREEN}✓ Deleted company: $name${NC}"
    else
        echo "Cancelled"
    fi
}

# Function to delete a URL
delete_url() {
    local url="$1"
    
    # Check if URL exists
    local exists=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM urls WHERE url='$url';")
    if [ "$exists" -eq 0 ]; then
        echo -e "${RED}Error: URL '$url' not found${NC}"
        return 1
    fi
    
    sqlite3 "$DB_PATH" "DELETE FROM urls WHERE url='$url';"
    echo -e "${GREEN}✓ Deleted URL: $url${NC}"
}

# Function to enable/disable a company
toggle_company() {
    local name="$1"
    local enabled="$2"
    
    # Check if company exists
    local company_id=$(sqlite3 "$DB_PATH" "SELECT id FROM companies WHERE name='$name';")
    if [ -z "$company_id" ]; then
        echo -e "${RED}Error: Company '$name' not found${NC}"
        return 1
    fi
    
    sqlite3 "$DB_PATH" "UPDATE companies SET enabled=$enabled WHERE id=$company_id;"
    local status=$([[ "$enabled" == "1" ]] && echo "enabled" || echo "disabled")
    echo -e "${GREEN}✓ Company '$name' $status${NC}"
}

# Main menu
show_menu() {
    echo -e "\n${GREEN}AI Competitive Monitor - Company Management${NC}"
    echo "=========================================="
    echo "1. List all companies"
    echo "2. List URLs for a company"
    echo "3. Add a new company"
    echo "4. Add a URL to a company"
    echo "5. Delete a company"
    echo "6. Delete a URL"
    echo "7. Enable a company"
    echo "8. Disable a company"
    echo "9. Exit"
    echo
}

# Main loop
if [ $# -eq 0 ]; then
    # Interactive mode
    while true; do
        show_menu
        read -p "Select an option: " choice
        
        case $choice in
            1)
                list_companies
                ;;
            2)
                read -p "Enter company name: " company_name
                list_urls "$company_name"
                ;;
            3)
                read -p "Enter company name: " name
                read -p "Enter category (e.g., 'LLM Providers'): " category
                add_company "$name" "$category"
                ;;
            4)
                read -p "Enter company name: " company_name
                read -p "Enter URL: " url
                read -p "Enter URL type (homepage/blog/docs/api) [homepage]: " url_type
                add_url "$company_name" "$url" "${url_type:-homepage}"
                ;;
            5)
                read -p "Enter company name to delete: " name
                delete_company "$name"
                ;;
            6)
                read -p "Enter URL to delete: " url
                delete_url "$url"
                ;;
            7)
                read -p "Enter company name to enable: " name
                toggle_company "$name" 1
                ;;
            8)
                read -p "Enter company name to disable: " name
                toggle_company "$name" 0
                ;;
            9)
                echo "Goodbye!"
                exit 0
                ;;
            *)
                echo -e "${RED}Invalid option${NC}"
                ;;
        esac
        
        echo
        read -p "Press Enter to continue..."
    done
else
    # Command line mode
    case "$1" in
        list)
            list_companies
            ;;
        list-urls)
            list_urls "$2"
            ;;
        add-company)
            add_company "$2" "$3"
            ;;
        add-url)
            add_url "$2" "$3" "${4:-homepage}"
            ;;
        delete-company)
            delete_company "$2"
            ;;
        delete-url)
            delete_url "$2"
            ;;
        enable)
            toggle_company "$2" 1
            ;;
        disable)
            toggle_company "$2" 0
            ;;
        *)
            echo "Usage: $0 [command] [args]"
            echo "Commands:"
            echo "  list                          - List all companies"
            echo "  list-urls <company>          - List URLs for a company"
            echo "  add-company <name> <category> - Add a new company"
            echo "  add-url <company> <url> [type] - Add a URL to a company"
            echo "  delete-company <company>      - Delete a company"
            echo "  delete-url <url>             - Delete a URL"
            echo "  enable <company>             - Enable a company"
            echo "  disable <company>            - Disable a company"
            echo ""
            echo "Run without arguments for interactive mode"
            exit 1
            ;;
    esac
fi
