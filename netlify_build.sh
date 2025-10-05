#!/bin/bash
cat config.example.js | sed 's/YOUR_CLIENT_ID_HERE/'"$GOOGLE_CLIENT_ID"'/g' > config.js