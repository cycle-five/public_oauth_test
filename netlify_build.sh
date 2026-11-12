#!/bin/bash
set -e

# Generate config.js from config.example.js using the shared writer script.
# Fails (non-zero) when neither GOOGLE_CLIENT_ID nor GOOGLE_APP_ID is set.
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

OUT="${OUT:-config.js}" bash "$script_dir/scripts/write-config.sh" OUT="$OUT"

echo "✓ config.js generated successfully"
