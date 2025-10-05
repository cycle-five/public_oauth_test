#!/bin/bash
# Simple deployment helper script for OAuth Test Page

set -e

echo "🚀 OAuth Test Page Deployment Helper"
echo "===================================="
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Show menu
echo "Choose deployment method:"
echo ""
echo "  1) Test locally (Python HTTP server)"
echo "  2) Deploy to Netlify"
echo "  3) Deploy to Vercel"
echo "  4) Deploy to GitHub Pages (manual steps)"
echo "  5) Generate deployment package"
echo ""
read -p "Enter choice [1-5]: " choice

case $choice in
    1)
        echo ""
        echo "Setting up local HTTPS server..."

        # Check if certificates exist, if not create them
        if [ ! -f "localhost.pem" ]; then
            echo "Generating self-signed certificate for localhost..."
            openssl req -x509 -newkey rsa:4096 -keyout localhost-key.pem -out localhost.pem \
                -days 365 -nodes -subj "/CN=localhost" \
                -addext "subjectAltName=DNS:localhost,IP:127.0.0.1" 2>/dev/null || \
            openssl req -x509 -newkey rsa:4096 -keyout localhost-key.pem -out localhost.pem \
                -days 365 -nodes -subj "/CN=localhost"

            # Combine cert and key for Python's ssl module
            cat localhost.pem localhost-key.pem > localhost-combined.pem
            echo "✓ Certificate created"
        fi

        echo ""
        echo "Starting local HTTPS server on https://localhost:8000"
        echo "Note: You'll need to accept the self-signed certificate warning in your browser"
        echo "Press Ctrl+C to stop"
        echo ""

        # Create a simple HTTPS server script
        python3 << 'EOF'
import http.server
import ssl
import socketserver

PORT = 8000

Handler = http.server.SimpleHTTPRequestHandler
Handler.extensions_map.update({
    '.js': 'application/javascript',
})

httpd = socketserver.TCPServer(("", PORT), Handler)

# Create SSL context
context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
context.load_cert_chain(certfile="./localhost.pem", keyfile="./localhost-key.pem")

# Wrap socket with SSL
httpd.socket = context.wrap_socket(httpd.socket, server_side=True)

print(f"Server running at https://localhost:{PORT}")
httpd.serve_forever()
EOF
        ;;

    2)
        if ! command_exists netlify; then
            echo ""
            echo "Netlify CLI not found. Installing..."
            npm install -g netlify-cli
        fi
        echo ""
        echo "Deploying to Netlify..."
        netlify deploy --prod --dir=.
        ;;

    3)
        if ! command_exists vercel; then
            echo ""
            echo "Vercel CLI not found. Installing..."
            npm install -g vercel
        fi
        echo ""
        echo "Deploying to Vercel..."
        vercel --prod
        ;;

    4)
        echo ""
        echo "GitHub Pages Deployment Steps:"
        echo "================================"
        echo ""
        echo "1. Create a new GitHub repository"
        echo "2. Initialize git in this directory:"
        echo "   cd public_oauth_test"
        echo "   git init"
        echo "   git add index.html README.md"
        echo "   git commit -m 'Add OAuth test page'"
        echo ""
        echo "3. Add remote and push:"
        echo "   git remote add origin https://github.com/USERNAME/REPO.git"
        echo "   git branch -M master"
        echo "   git push -u origin master"
        echo ""
        echo "4. Enable GitHub Pages:"
        echo "   - Go to repository Settings"
        echo "   - Navigate to Pages section"
        echo "   - Select 'master' branch"
        echo "   - Click Save"
        echo ""
        echo "5. Your page will be live at:"
        echo "   https://USERNAME.github.io/REPO/"
        echo ""
        ;;

    5)
        echo ""
        echo "Creating deployment package..."
        PACKAGE_NAME="oauth-test-page-$(date +%Y%m%d-%H%M%S).zip"

        if command_exists zip; then
            zip -r "../$PACKAGE_NAME" index.html README.md
            echo ""
            echo "✓ Package created: ../$PACKAGE_NAME"
            echo ""
            echo "You can now:"
            echo "  - Upload to Netlify Drop: https://app.netlify.com/drop"
            echo "  - Upload to Vercel"
            echo "  - Upload to any static hosting service"
        else
            tar -czf "../$PACKAGE_NAME.tar.gz" index.html README.md
            echo ""
            echo "✓ Package created: ../$PACKAGE_NAME.tar.gz"
            echo ""
            echo "Extract and upload to any static hosting service"
        fi
        ;;

    *)
        echo ""
        echo "Invalid choice. Please run again and select 1-5."
        exit 1
        ;;
esac

echo ""
echo "Done! 🎉"
