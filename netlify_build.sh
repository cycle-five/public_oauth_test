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
sed 's/YOUR_CLIENT_ID_HERE/'"$GOOGLE_CLIENT_ID"'/g' config.example.js > config.js

# Verify config.js was created successfully and substitution occurred
if [ ! -f "config.js" ]; then
    echo "Error: Failed to generate config.js"
    exit 1
fi

# Check that GOOGLE_CLIENT_ID was substituted and placeholder is gone
if ! grep -q "$GOOGLE_CLIENT_ID" config.js; then
    echo "Error: GOOGLE_CLIENT_ID was not substituted correctly in config.js"
    exit 1
fi
if grep -q "YOUR_CLIENT_ID_HERE" config.js; then
    echo "Error: Placeholder YOUR_CLIENT_ID_HERE still present in config.js"
    exit 1
fi

echo "✓ config.js generated successfully"