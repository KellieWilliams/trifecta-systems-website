<?php
/**
 * Publish Scheduled Posts Script
 * This script checks for scheduled posts and publishes them when ready
 * 
 * Usage:
 * - Run manually: php publish-scheduled-posts.php
 * - Set up as cron job: 5 * * * * php /path/to/publish-scheduled-posts.php
 * - Call via webhook: curl https://yoursite.com/backend/publish-scheduled-posts.php
 */

// Set error reporting
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Define paths
$backendDir = __DIR__;
require_once $backendDir . '/scheduler.php';

// Initialize scheduler
$scheduler = new BlogScheduler($backendDir);

// Log function
function logMessage($message) {
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] $message" . PHP_EOL;
    
    // Log to error log
    error_log($logMessage);
    
    // Also log to a dedicated scheduler log file
    $logFile = __DIR__ . '/scheduler.log';
    file_put_contents($logFile, $logMessage, FILE_APPEND | LOCK_EX);
}

// Main execution
try {
    logMessage("Starting scheduled posts check...");
    
    // Get posts ready to publish
    $readyPosts = $scheduler->getPostsReadyToPublish();
    
    if (empty($readyPosts)) {
        logMessage("No posts ready to publish at this time.");
        exit(0);
    }
    
    logMessage("Found " . count($readyPosts) . " post(s) ready to publish.");
    
    $publishedCount = 0;
    $failedCount = 0;
    
    foreach ($readyPosts as $post) {
        logMessage("Attempting to publish post: {$post['slug']} (scheduled for: {$post['publish_time']})");
        
        if ($scheduler->publishPost($post['slug'])) {
            logMessage("Successfully published post: {$post['slug']}");
            $publishedCount++;
        } else {
            logMessage("Failed to publish post: {$post['slug']}");
            $failedCount++;
        }
    }
    
    logMessage("Publishing complete. Published: $publishedCount, Failed: $failedCount");
    
    // Return appropriate exit code
    if ($failedCount > 0) {
        exit(1); // Error occurred
    } else {
        exit(0); // Success
    }
    
} catch (Exception $e) {
    logMessage("Error during scheduled posts check: " . $e->getMessage());
    exit(1);
}
?>
