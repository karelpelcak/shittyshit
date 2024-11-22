#!/bin/bash
set -e

# Check if 'dist' directory exists and remove it
[ -d dist ] && sudo rm -r dist

# Run the build process
npm run build

# Verify if 'dist' directory was created
if [ ! -d dist ]; then
    echo "Build failed: 'dist' directory not found!"
    exit 1
fi

# Check if target 'dist' directory exists and remove it
[ -d ../regiojet-kiosk/node_modules/@web/shop-logic/dist ] && sudo rm -r ../regiojet-kiosk/node_modules/@web/shop-logic/dist

[ -d ../regiojet-kiosk/.Next ] && sudo rm -r ../regiojet-kiosk/.Next

# Copy the newly built 'dist' directory to the target location
cp -r ./dist ../regiojet-kiosk/node_modules/@web/shop-logic

