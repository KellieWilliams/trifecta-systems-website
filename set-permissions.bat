@echo off
REM Set Permissions Script for Trifecta Website (Windows)
REM Run this after uploading the project to set correct permissions

echo 🔧 Setting Trifecta Website Permissions...
echo ==========================================

echo 📁 Setting public directory permissions...
REM Note: Windows doesn't have chmod, so this is a reminder script
REM You'll need to set permissions manually on the server after upload

echo.
echo 📋 Required permissions to set on Namecheap server:
echo.
echo   Directory Permissions:
echo     public_html/     - 755 (web accessible)
echo     public_html/js/  - 755 (web accessible)
echo     public_html/blog/ - 755 (web accessible)
echo     public_html/Gallery/ - 755 (web accessible)
echo     config/          - 750 (restricted)
echo     vendor/          - 750 (restricted)
echo     backend/         - 750 (restricted)
echo.
echo   Writable Directories (for app functionality):
echo     backend/admin-sessions/ - 755
echo     public_html/Gallery/Blog-images/ - 755
echo     public_html/blog/Blog-posts/ - 755
echo.
echo   File Permissions:
echo     public_html/*    - 644 (web accessible)
echo     config/*         - 640 (restricted)
echo     vendor/*         - 640 (restricted)
echo     backend/*        - 640 (restricted)
echo.
echo 🔒 Security: .htaccess blocks direct access to sensitive files
echo 🎯 Functionality: Admin sessions, image uploads, and posts will work
echo.
echo 💡 Tip: Use your hosting control panel or SSH to set these permissions
echo    after each project upload.
pause
