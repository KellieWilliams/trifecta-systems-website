<?php
/**
 * Blog Post Scheduler
 * Handles scheduling and publishing of blog posts
 */

class BlogScheduler {
    private $scheduledPostsFile;
    private $postsDir;
    
    public function __construct($backendDir) {
        $this->scheduledPostsFile = $backendDir . '/scheduled-posts.json';
        $this->postsDir = $backendDir . '/../public_html/blog/Blog-posts/';
        
        // Create scheduled posts file if it doesn't exist
        if (!file_exists($this->scheduledPostsFile)) {
            $this->initializeScheduledPostsFile();
        }
    }
    
    /**
     * Initialize the scheduled posts file
     */
    private function initializeScheduledPostsFile() {
        $initialData = [
            'scheduled_posts' => [],
            'last_updated' => date('c'),
            'version' => '1.0'
        ];
        
        file_put_contents($this->scheduledPostsFile, json_encode($initialData, JSON_PRETTY_PRINT));
    }
    
    /**
     * Add a post to the scheduling queue
     */
    public function schedulePost($slug, $publishTime, $status = 'scheduled') {
        $scheduledPosts = $this->getScheduledPosts();
        
        // Check if post already exists in schedule
        foreach ($scheduledPosts['scheduled_posts'] as $index => $post) {
            if ($post['slug'] === $slug) {
                // Update existing scheduled post
                $scheduledPosts['scheduled_posts'][$index]['publish_time'] = $publishTime;
                $scheduledPosts['scheduled_posts'][$index]['status'] = $status;
                $scheduledPosts['scheduled_posts'][$index]['last_updated'] = date('c');
                $this->saveScheduledPosts($scheduledPosts);
                return true;
            }
        }
        
        // Add new scheduled post
        $scheduledPosts['scheduled_posts'][] = [
            'slug' => $slug,
            'publish_time' => $publishTime,
            'status' => $status,
            'file_path' => $this->postsDir . $slug . '.md',
            'created_at' => date('c'),
            'last_updated' => date('c')
        ];
        
        $scheduledPosts['last_updated'] = date('c');
        $this->saveScheduledPosts($scheduledPosts);
        
        return true;
    }
    
    /**
     * Remove a post from the scheduling queue
     */
    public function unschedulePost($slug) {
        try {
            // Use raw data to avoid recursive enhancement calls
            $scheduledPosts = $this->getRawScheduledPosts();
            
            foreach ($scheduledPosts['scheduled_posts'] as $index => $post) {
                if ($post['slug'] === $slug) {
                    unset($scheduledPosts['scheduled_posts'][$index]);
                    $scheduledPosts['scheduled_posts'] = array_values($scheduledPosts['scheduled_posts']); // Re-index
                    $scheduledPosts['last_updated'] = date('c');
                    $this->saveScheduledPosts($scheduledPosts);
                    return true;
                }
            }
            
            return false;
        } catch (Exception $e) {
            error_log("Error in unschedulePost for slug '$slug': " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Get all scheduled posts with full metadata
     */
    public function getScheduledPosts() {
        if (!file_exists($this->scheduledPostsFile)) {
            $this->initializeScheduledPostsFile();
        }
        
        $content = file_get_contents($this->scheduledPostsFile);
        $data = json_decode($content, true) ?: ['scheduled_posts' => [], 'last_updated' => '', 'version' => '1.0'];
        
        // Enhance scheduled posts with metadata from markdown files
        $enhancedPosts = [];
        foreach ($data['scheduled_posts'] as $post) {
            $enhancedPost = $this->enhancePostWithMetadata($post);
            if ($enhancedPost !== null) {
                $enhancedPosts[] = $enhancedPost;
            }
        }
        
        $data['scheduled_posts'] = $enhancedPosts;
        return $data;
    }
    
    /**
     * Get raw scheduled posts without enhancement (for internal use)
     */
    private function getRawScheduledPosts() {
        if (!file_exists($this->scheduledPostsFile)) {
            $this->initializeScheduledPostsFile();
        }
        
        $content = file_get_contents($this->scheduledPostsFile);
        return json_decode($content, true) ?: ['scheduled_posts' => [], 'last_updated' => '', 'version' => '1.0'];
    }
    
    /**
     * Enhance a scheduled post with metadata from its markdown file
     */
    private function enhancePostWithMetadata($post) {
        $postFile = $this->postsDir . $post['slug'] . '.md';
        
        if (!file_exists($postFile)) {
            // If file doesn't exist, automatically remove it from scheduled posts
            // This prevents orphaned scheduled post entries
            // Note: We don't call unschedulePost here to avoid infinite recursion
            // The cleanup will be handled by the cleanupOrphanedPosts method
            error_log("Warning: Post file not found for scheduled post '{$post['slug']}', will be cleaned up later");
            
            // Return null to indicate this post should be filtered out
            return null;
        }
        
        // Read the markdown file and parse YAML frontmatter
        $content = file_get_contents($postFile);
        if ($content === false) {
            return array_merge($post, [
                'title' => 'Failed to read post',
                'excerpt' => 'Failed to read post',
                'description' => 'Failed to read post',
                'category' => 'Unknown',
                'category_color' => 'gray'
            ]);
        }
        
        // Parse YAML frontmatter
        if (preg_match('/^---\s*\n(.*?)\n---\s*\n(.*)$/s', $content, $matches)) {
            $yaml = $matches[1];
            
            // Extract metadata
            $metadata = [];
            $lines = explode("\n", $yaml);
            foreach ($lines as $line) {
                if (preg_match('/^(\w+):\s*(.+)$/', trim($line), $parts)) {
                    $key = trim($parts[1]);
                    $value = trim($parts[2]);
                    $metadata[$key] = $value;
                }
            }
            
            // Return enhanced post data
            return array_merge($post, [
                'title' => $metadata['title'] ?? 'Untitled',
                'excerpt' => $metadata['excerpt'] ?? '',
                'description' => $metadata['excerpt'] ?? '', // Use excerpt as description for compatibility
                'category' => $metadata['category'] ?? 'Uncategorized',
                'category_color' => $metadata['category_color'] ?? 'blue',
                'tags' => $metadata['tags'] ?? ''
            ]);
        }
        
        // If YAML parsing fails, return basic info
        return array_merge($post, [
            'title' => 'Invalid post format',
            'excerpt' => 'Invalid post format',
            'description' => 'Invalid post format',
            'category' => 'Unknown',
            'category_color' => 'gray'
        ]);
    }
    
    /**
     * Get posts that are ready to be published
     */
    public function getPostsReadyToPublish() {
        $scheduledPosts = $this->getScheduledPosts();
        $readyPosts = [];
        $currentTime = time();
        
        foreach ($scheduledPosts['scheduled_posts'] as $post) {
            if ($post['status'] === 'scheduled') {
                $publishTime = strtotime($post['publish_time']);
                if ($publishTime <= $currentTime) {
                    $readyPosts[] = $post;
                }
            }
        }
        
        return $readyPosts;
    }
    
    /**
     * Publish a scheduled post
     */
    public function publishPost($slug) {
        $postFile = $this->postsDir . $slug . '.md';
        
        if (!file_exists($postFile)) {
            error_log("Scheduler: Post file not found for slug: $slug");
            return false;
        }
        
        // Read the post content
        $content = file_get_contents($postFile);
        if ($content === false) {
            error_log("Scheduler: Failed to read post file for slug: $slug");
            return false;
        }
        
        // Update the status in the markdown file
        $updatedContent = $this->updatePostStatus($content, 'published');
        
        if ($updatedContent === false) {
            error_log("Scheduler: Failed to update post status for slug: $slug");
            return false;
        }
        
        // Write the updated content back to the file
        if (file_put_contents($postFile, $updatedContent) === false) {
            error_log("Scheduler: Failed to write updated post file for slug: $slug");
            return false;
        }
        
        // Remove from scheduled posts
        $this->unschedulePost($slug);
        
        error_log("Scheduler: Successfully published post: $slug");
        return true;
    }
    
    /**
     * Update the status in a post's YAML frontmatter
     */
    private function updatePostStatus($content, $newStatus) {
        // Parse YAML frontmatter
        if (!preg_match('/^---\s*\n(.*?)\n---\s*\n(.*)$/s', $content, $matches)) {
            return false;
        }
        
        $yaml = $matches[1];
        $markdown = $matches[2];
        
        // Update the status
        $yaml = preg_replace('/^status:\s*.*$/m', "status: $newStatus", $yaml);
        
        // Reconstruct the content
        return "---\n$yaml\n---\n\n$markdown";
    }
    
    /**
     * Save scheduled posts to file
     */
    private function saveScheduledPosts($data) {
        try {
            $result = file_put_contents($this->scheduledPostsFile, json_encode($data, JSON_PRETTY_PRINT));
            if ($result === false) {
                error_log("Failed to save scheduled posts to file: " . $this->scheduledPostsFile);
                return false;
            }
            return true;
        } catch (Exception $e) {
            error_log("Error saving scheduled posts: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Get post details for a slug
     */
    public function getPostDetails($slug) {
        $scheduledPosts = $this->getScheduledPosts();
        
        foreach ($scheduledPosts['scheduled_posts'] as $post) {
            if ($post['slug'] === $slug) {
                return $post;
            }
        }
        
        return null;
    }
    
    /**
     * Check if a post is scheduled
     */
    public function isPostScheduled($slug) {
        return $this->getPostDetails($slug) !== null;
    }
    
    /**
     * Clean up orphaned scheduled posts (posts that no longer have markdown files)
     */
    public function cleanupOrphanedPosts() {
        try {
            // Use raw data to avoid recursive enhancement calls
            $scheduledPosts = $this->getRawScheduledPosts();
            $cleanedPosts = [];
            $removedCount = 0;
            
            foreach ($scheduledPosts['scheduled_posts'] as $post) {
                $postFile = $this->postsDir . $post['slug'] . '.md';
                if (file_exists($postFile)) {
                    $cleanedPosts[] = $post;
                } else {
                    $removedCount++;
                }
            }
            
            if ($removedCount > 0) {
                $scheduledPosts['scheduled_posts'] = $cleanedPosts;
                $scheduledPosts['last_updated'] = date('c');
                $this->saveScheduledPosts($scheduledPosts);
            }
            
            return $removedCount;
        } catch (Exception $e) {
            error_log("Error in cleanupOrphanedPosts: " . $e->getMessage());
            return 0;
        }
    }
}
?>
