# Google AI Studio Chatbot Setup Guide

This guide will help you set up the secure chatbot integration with Google AI Studio on your Trifecta.Systems website.

## Prerequisites

- Google AI Studio API key (free tier available)
- PHP 7.4+ with cURL extension enabled
- Web server with PHP support

## Step 1: Get Your Google AI Studio API Key

1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Navigate to "Get API key" in the left sidebar
4. Create a new API key or use an existing one
5. Copy the API key (it will look like: `AIzaSyC...`)

## Step 2: Configure the API Key

You have two options for storing your API key securely:

### Option A: Environment Variable (Recommended)

Set an environment variable on your server:

```bash
export GOOGLE_AI_STUDIO_API_KEY="your_actual_api_key_here"
```

### Option B: Configuration File

1. Edit `config/google-ai-config.php`
2. Uncomment and set your API key:

```php
define('GOOGLE_AI_STUDIO_API_KEY', 'your_actual_api_key_here');
```

**⚠️ Security Note**: Ensure the config file is outside the `public_html` directory and has restricted permissions (600 or 640).

## Step 3: Set File Permissions

Set secure file permissions:

```bash
chmod 600 config/google-ai-config.php
chmod 644 backend/chatbot-api.php
chmod 644 public_html/chatbot-proxy.php
chmod 644 public_html/js/chatbot.js
```

## Step 4: Test the Integration

1. Visit your website: `https://trifecta.systems/ai-custom-solutions.html`
2. Click "Give Gemini a Try! ✨"
3. Enter a test prompt like "Explain quantum computing in simple terms"
4. Click "Generate Response ✨"

## Step 5: Monitor and Debug

### Check Browser Console
Open Developer Tools (F12) and look for any JavaScript errors.

### Check Server Logs
Monitor your server's error logs for PHP errors:

```bash
tail -f /var/log/apache2/error.log  # Apache
tail -f /var/log/nginx/error.log    # Nginx
```

### Test API Endpoint
Test the proxy endpoint directly:

```bash
curl -X POST https://trifecta.systems/chatbot-proxy.php \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Hello, how are you?"}'
```

## Troubleshooting

### Common Issues

1. **"API key not configured" error**
   - Check that your API key is properly set in the config file or environment variable
   - Verify the config file path is correct

2. **"cURL error" messages**
   - Ensure PHP cURL extension is installed: `php -m | grep curl`
   - Check if your server can make outbound HTTPS requests

3. **CORS errors in browser**
   - Verify the `Access-Control-Allow-Origin` header in `chatbot-proxy.php`
   - Update the origin to match your actual domain

4. **Rate limiting errors**
   - The system limits to 10 requests per minute per IP
   - Wait a minute and try again

### Debug Mode

To enable debug logging, edit `backend/chatbot-api.php` and uncomment:

```php
error_reporting(E_ALL);
ini_set('display_errors', 1);
```

## Security Features

- ✅ API key stored outside public directory
- ✅ Rate limiting (10 requests/minute per IP)
- ✅ Input validation and sanitization
- ✅ CORS restrictions
- ✅ Request logging for monitoring
- ✅ XSS protection in responses

## Cost Management

Google AI Studio free tier includes:
- 15 requests per minute
- 1,000 requests per day
- No credit card required

Monitor usage in your Google AI Studio dashboard.

## Customization

### Change AI Model
Edit `config/google-ai-config.php`:

```php
define('GOOGLE_AI_MODEL', 'gemini-1.5-pro'); // or other available models
```

### Adjust Response Length
```php
define('GOOGLE_AI_MAX_TOKENS', 2000); // Increase for longer responses
```

### Modify Rate Limits
```php
define('CHATBOT_RATE_LIMIT_MAX_REQUESTS', 20); // Increase requests per minute
```

## Support

If you encounter issues:
1. Check this guide first
2. Review server error logs
3. Test with a simple prompt
4. Verify API key is valid in Google AI Studio dashboard

## Files Overview

- `backend/chatbot-api.php` - Secure backend API (outside public_html)
- `public_html/chatbot-proxy.php` - Public proxy endpoint
- `config/google-ai-config.php` - Configuration file
- `public_html/js/chatbot.js` - Frontend JavaScript
- `public_html/ai-custom-solutions.html` - Updated HTML page

---

**Need help?** Check the troubleshooting section above or review your server's error logs for specific error messages.
