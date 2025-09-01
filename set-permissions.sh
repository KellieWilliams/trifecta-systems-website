#!/bin/bash
# Set Permissions Script for Trifecta Website
# Run this after uploading the project to set correct permissions

echo "🔧 Setting Trifecta Website Permissions..."
echo "=========================================="

# Public directories (readable by web server)
echo "📁 Setting public directory permissions..."
chmod 755 public_html/ -R
chmod 755 public_html/js/ -R
chmod 755 public_html/blog/ -R
chmod 755 public_html/Gallery/ -R

# Sensitive directories (restricted access)
echo "🔒 Setting sensitive directory permissions..."
chmod 750 config/ -R
chmod 750 vendor/ -R
chmod 750 backend/ -R

# Writable directories (for application functionality)
echo "✍️ Setting writable directory permissions..."
chmod 755 backend/admin-sessions/ -R
chmod 755 public_html/Gallery/Blog-images/ -R
chmod 755 public_html/blog/Blog-posts/ -R

# Specific file permissions
echo "📄 Setting file permissions..."
find public_html/ -type f -exec chmod 644 {} \;
find config/ -type f -exec chmod 640 {} \;
find vendor/ -type f -exec chmod 640 {} \;
find backend/ -type f -exec chmod 640 {} \;

# Make this script executable
chmod +x set-permissions.sh

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
