#!/bin/bash

# MotoSnap Maintenance Mode Toggle Script
# This script helps toggle maintenance mode by updating the configuration

echo "MotoSnap Maintenance Mode Toggle"
echo "================================"

# Check if maintenance config file exists
CONFIG_FILE="src/config/maintenance.ts"

if [ ! -f "$CONFIG_FILE" ]; then
    echo "Error: Maintenance configuration file not found at $CONFIG_FILE"
    exit 1
fi

# Get current mode
CURRENT_MODE=$(grep "MAINTENANCE_MODE =" "$CONFIG_FILE" | cut -d'=' -f2 | tr -d ' ;')

echo "Current maintenance mode: $CURRENT_MODE"

# Toggle based on argument
if [ "$1" = "on" ] || [ "$1" = "true" ]; then
    echo "Enabling maintenance mode..."
    sed -i '' 's/export const MAINTENANCE_MODE = false;/export const MAINTENANCE_MODE = true;/' "$CONFIG_FILE"
    echo "✓ Maintenance mode enabled"
    echo "  Deploy the cleanup/maintenance-page branch to activate"

elif [ "$1" = "off" ] || [ "$1" = "false" ]; then
    echo "Disabling maintenance mode..."
    sed -i '' 's/export const MAINTENANCE_MODE = true;/export const MAINTENANCE_MODE = false;/' "$CONFIG_FILE"
    echo "✓ Maintenance mode disabled"
    echo "  Deploy the master branch to activate normal operation"

elif [ "$1" = "status" ]; then
    if [ "$CURRENT_MODE" = "true" ]; then
        echo "Status: Maintenance mode is ON"
    else
        echo "Status: Maintenance mode is OFF"
    fi

else
    echo ""
    echo "Usage:"
    echo "  ./toggle-maintenance.sh on     - Enable maintenance mode"
    echo "  ./toggle-maintenance.sh off    - Disable maintenance mode"
    echo "  ./toggle-maintenance.sh status - Check current status"
    echo ""
    echo "Manual deployment steps:"
    echo "1. Run: ./toggle-maintenance.sh on/off"
    echo "2. Commit changes: git add . && git commit -m 'Toggle maintenance mode'"
    echo "3. Push to appropriate branch:"
    echo "   - Maintenance mode: git push origin cleanup/maintenance-page"
    echo "   - Normal operation: git push origin master"
    echo "4. Deploy on Vercel"
fi

echo ""