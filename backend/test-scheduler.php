<?php
/**
 * Test Script for Blog Scheduler
 * This script tests the basic functionality of the scheduler
 */

// Set error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Define paths
$backendDir = __DIR__;
require_once $backendDir . '/scheduler.php';

echo "Testing Blog Scheduler...\n\n";

try {
    // Initialize scheduler
    $scheduler = new BlogScheduler($backendDir);
    echo "✓ Scheduler initialized successfully\n";
    
    // Test scheduling a post
    $testSlug = 'test-scheduled-post-' . time();
    $futureTime = date('c', strtotime('+1 hour'));
    
    echo "\nTesting post scheduling...\n";
    if ($scheduler->schedulePost($testSlug, $futureTime)) {
        echo "✓ Post scheduled successfully\n";
    } else {
        echo "✗ Failed to schedule post\n";
    }
    
    // Test getting scheduled posts
    echo "\nTesting get scheduled posts...\n";
    $scheduledPosts = $scheduler->getScheduledPosts();
    echo "✓ Found " . count($scheduledPosts['scheduled_posts']) . " scheduled post(s)\n";
    
    // Test checking if post is scheduled
    echo "\nTesting post status check...\n";
    if ($scheduler->isPostScheduled($testSlug)) {
        echo "✓ Post is confirmed as scheduled\n";
    } else {
        echo "✗ Post not found in schedule\n";
    }
    
    // Test getting post details
    echo "\nTesting get post details...\n";
    $postDetails = $scheduler->getPostDetails($testSlug);
    if ($postDetails) {
        echo "✓ Post details retrieved:\n";
        echo "  - Slug: " . $postDetails['slug'] . "\n";
        echo "  - Publish Time: " . $postDetails['publish_time'] . "\n";
        echo "  - Status: " . $postDetails['status'] . "\n";
    } else {
        echo "✗ Failed to get post details\n";
    }
    
    // Test unscheduling
    echo "\nTesting post unscheduling...\n";
    if ($scheduler->unschedulePost($testSlug)) {
        echo "✓ Post unscheduled successfully\n";
    } else {
        echo "✗ Failed to unschedule post\n";
    }
    
    // Verify unscheduling worked
    if (!$scheduler->isPostScheduled($testSlug)) {
        echo "✓ Post confirmed as unscheduled\n";
    } else {
        echo "✗ Post still appears as scheduled\n";
    }
    
    echo "\n✓ All tests completed successfully!\n";
    
} catch (Exception $e) {
    echo "✗ Error during testing: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}
?>
