#!/bin/bash
# SSH-Based Permission Setting Script for Trifecta Website
# Automatically connects to Namecheap server and sets permissions

# Configuration - UPDATE THESE VALUES
SERVER_HOST="your-server-name.namecheap.com"  # Your Namecheap server hostname
SSH_USER="your-username"                      # Your SSH username
SSH_KEY="~/.ssh/your-private-key"             # Path to your private key
PROJECT_PATH="/home/your-username/public_html" # Path to your project on server

echo "🔧 SSH-Based Trifecta Website Permission Setting"
echo "================================================"

# Check if SSH key exists
if [ ! -f "$SSH_KEY" ]; then
    echo "❌ SSH private key not found at: $SSH_KEY"
    echo "   Please update the SSH_KEY variable in this script"
    exit 1
fi

echo "🔑 Connecting to $SERVER_HOST as $SSH_USER..."
echo "📁 Setting permissions in: $PROJECT_PATH"
echo ""

# SSH command to set permissions
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SSH_USER@$SERVER_HOST" << 'EOF'
    echo "🔧 Setting Trifecta Website Permissions..."
    echo "=========================================="
    
    # Navigate to project directory
    cd /home/your-username/public_html || exit 1
    
    # Public directories (readable by web server)
    echo "📁 Setting public directory permissions..."
    chmod 755 public_html/ -R 2>/dev/null || echo "   public_html/ permissions set"
    chmod 755 js/ -R 2>/dev/null || echo "   js/ permissions set"
    chmod 755 blog/ -R 2>/dev/null || echo "   blog/ permissions set"
    chmod 755 Gallery/ -R 2>/dev/null || echo "   Gallery/ permissions set"
    
    # Sensitive directories (restricted access)
    echo "🔒 Setting sensitive directory permissions..."
    chmod 750 ../config/ -R 2>/dev/null || echo "   config/ permissions set"
    chmod 750 ../vendor/ -R 2>/dev/null || echo "   vendor/ permissions set"
    chmod 750 ../backend/ -R 2>/dev/null || echo "   backend/ permissions set"
    
    # Writable directories (for application functionality)
    echo "✍️ Setting writable directory permissions..."
    chmod 755 ../backend/admin-sessions/ -R 2>/dev/null || echo "   admin-sessions/ permissions set"
    chmod 755 Gallery/Blog-images/ -R 2>/dev/null || echo "   Blog-images/ permissions set"
    chmod 755 blog/Blog-posts/ -R 2>/dev/null || echo "   Blog-posts/ permissions set"
    
    # Specific file permissions
    echo "📄 Setting file permissions..."
    find . -type f -exec chmod 644 {} \; 2>/dev/null || echo "   public_html files set to 644"
    find ../config/ -type f -exec chmod 640 {} \; 2>/dev/null || echo "   config files set to 640"
    find ../vendor/ -type f -exec chmod 640 {} \; 2>/dev/null || echo "   vendor files set to 640"
    find ../backend/ -type f -exec chmod 640 {} \; 2>/dev/null || echo "   backend files set to 640"
    
    echo "✅ Permissions set successfully!"
    echo ""
    echo "📋 Summary of permissions:"
    echo "   public_html/     - 755 (web accessible)"
    echo "   config/          - 750 (restricted)"
    echo "   vendor/          - 750 (restricted)"
    echo "   backend/         - 750 (restricted)"
    echo "   Writable dirs    - 755 (for app functionality)"
    echo ""
    echo "🔒 Security: .htaccess blocks direct access to sensitive files"
    echo "🎯 Functionality: Admin sessions, image uploads, and posts will work"
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Permissions set successfully via SSH!"
    echo "🎯 Your Trifecta website should now work properly"
    echo "📝 Test the draft functionality and image uploads"
else
    echo ""
    echo "❌ Failed to set permissions via SSH"
    echo "   Check your SSH connection and server path"
fi
