#!/bin/bash
set -e

# Check if GOOGLE_CLIENT_ID environment variable is set
if [ -z "$GOOGLE_CLIENT_ID" ]; then
    echo "Error: GOOGLE_CLIENT_ID environment variable not set"
    echo "Please configure it in your Netlify environment variables"
    exit 1
fi

# Check if config.example.js exists
if [ ! -f "config.example.js" ]; then
    echo "Error: config.example.js not found"
    exit 1
fi

# Generate config.js from template
cat config.example.js | sed 's/YOUR_CLIENT_ID_HERE/'"$GOOGLE_CLIENT_ID"'/g' > config.js

# Verify config.js was created successfully
if [ -f "config.js" ]; then
    echo "✓ config.js generated successfully"
else
    echo "Error: Failed to generate config.js"
    exit 1
fi