# Blog Post Scheduler

This system allows you to schedule blog posts to be published automatically at specific dates and times.

## Files

- `scheduler.php` - Main scheduler class
- `scheduled-posts.json` - Storage for scheduled posts
- `publish-scheduled-posts.php` - Script to check and publish scheduled posts
- `test-scheduler.php` - Test script to verify functionality

## How It Works

1. **Scheduling**: When you create or edit a post with a future publish date and status "published", it's automatically added to the scheduling queue
2. **Storage**: Scheduled posts are stored in `scheduled-posts.json` with their publish times
3. **Publishing**: The `publish-scheduled-posts.php` script checks for posts ready to publish and updates their status
4. **Filtering**: The blog parser automatically filters out scheduled posts from public listings

## Setup

### 1. Automatic Publishing

To enable automatic publishing, you need to run the publishing script regularly. Choose one of these methods:

#### Option A: Cron Job (Recommended)
Add this to your server's crontab to check every 5 minutes:
```bash
*/5 * * * * php /path/to/your/backend/publish-scheduled-posts.php
```

#### Option B: Webhook
Call the script via HTTP request:
```bash
curl https://yoursite.com/backend/publish-scheduled-posts.php
```

#### Option C: Manual Testing
Run manually to test:
```bash
php publish-scheduled-posts.php
```

### 2. File Permissions
Ensure the backend directory is writable by the web server:
```bash
chmod 755 backend/
chmod 644 backend/scheduled-posts.json
```

## Usage

### Creating Scheduled Posts

1. In the admin panel, set a future publish date
2. Set status to "published"
3. The system automatically schedules the post

### API Endpoints

- `POST /backend/admin-api.php?action=schedule_post` - Manually schedule a post
- `GET /backend/admin-api.php?action=get_scheduled_posts` - Get list of scheduled posts
- `POST /backend/admin-api.php?action=unschedule_post` - Remove a post from schedule

### Testing

Run the test script to verify everything works:
```bash
php test-scheduler.php
```

## Data Structure

Scheduled posts are stored in this format:
```json
{
  "scheduled_posts": [
    {
      "slug": "post-slug",
      "publish_time": "2025-01-15T09:00:00Z",
      "status": "scheduled",
      "file_path": "/path/to/post.md",
      "created_at": "2025-01-10T10:00:00Z",
      "last_updated": "2025-01-10T10:00:00Z"
    }
  ],
  "last_updated": "2025-01-10T10:00:00Z",
  "version": "1.0"
}
```

## Logging

The system logs all activities to:
- PHP error log
- `scheduler.log` file in the backend directory

## Troubleshooting

### Common Issues

1. **Posts not publishing**: Check if the publishing script is running
2. **Permission errors**: Verify file permissions on backend directory
3. **Posts showing as published**: Check if they're actually scheduled in `scheduled-posts.json`

### Debug Mode

Enable debug logging by checking the `scheduler.log` file:
```bash
tail -f backend/scheduler.log
```

## Security Notes

- Only authenticated admin users can schedule posts
- The publishing script should not be publicly accessible
- Consider adding IP restrictions to the publishing script

## Future Enhancements

- Timezone support
- Bulk scheduling
- Email notifications
- Publishing preview
- Editorial workflow
