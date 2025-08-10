<?php
// Admin API Handler
// This file handles creating, updating, and deleting blog posts

// Security headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://trifecta.systems'); // Restrict to your domain
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Security: Only allow POST and GET requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (!in_array($_SERVER['REQUEST_METHOD'], ['POST', 'GET'])) {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

// Define paths
$backendDir = __DIR__;
$postsDir = $backendDir . '/../public_html/blog/Blog-posts/';
$imagesDir = $backendDir . '/../public_html/Gallery/Blog-images/';
$sessionsDir = $backendDir . '/admin-sessions/';

// Debug: log the paths
error_log("Backend directory: " . $backendDir);
error_log("Posts directory: " . $postsDir);
error_log("Images directory: " . $imagesDir);
error_log("Sessions directory: " . $sessionsDir);

// Create directories if they don't exist
if (!is_dir($postsDir)) {
    mkdir($postsDir, 0755, true);
}
if (!is_dir($imagesDir)) {
    mkdir($imagesDir, 0755, true);
}
if (!is_dir($sessionsDir)) {
    mkdir($sessionsDir, 0755, true);
}

// Handle different actions
$action = $_POST['action'] ?? $_GET['action'] ?? '';

switch ($action) {
    case 'create_post':
        handleCreatePost();
        break;
    case 'update_post':
        handleUpdatePost();
        break;
    case 'delete_post':
        handleDeletePost();
        break;
    case 'delete_image':
        handleDeleteImage();
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
        break;
}

function handleCreatePost() {
    global $postsDir, $imagesDir;
    
    // Validate session first
    $sessionId = $_POST['session_id'] ?? '';
    if (!validateSession($sessionId)) {
        echo json_encode(['success' => false, 'message' => 'Invalid session']);
        return;
    }
    
    // Validate required fields
    $title = trim($_POST['title'] ?? '');
    $category = trim($_POST['category'] ?? '');
    $categoryColor = trim($_POST['category_color'] ?? '');
    $excerpt = trim($_POST['excerpt'] ?? '');
    $content = $_POST['content'] ?? '';
    $readTime = intval($_POST['read_time'] ?? 0);
    $publishDate = $_POST['publish_date'] ?? '';
    $status = $_POST['status'] ?? 'published';
    $tags = trim($_POST['tags'] ?? '');
    
    // Debug: log the received status
    error_log("Create post - Received status: " . $status);
    
    if (empty($title) || empty($category) || empty($categoryColor) || empty($excerpt) || empty($content) || $readTime <= 0 || empty($publishDate)) {
        echo json_encode(['success' => false, 'message' => 'All required fields must be filled']);
        return;
    }
    
    // Generate slug from title
    $slug = generateSlug($title);
    
    // Check if slug already exists
    $existingFiles = glob($postsDir . '*.md');
    foreach ($existingFiles as $file) {
        $existingSlug = basename($file, '.md');
        if ($existingSlug === $slug) {
            $slug = $slug . '-' . time();
            break;
        }
    }
    
    // Handle image uploads
    $uploadedImages = [];
    if (isset($_FILES['images']) && is_array($_FILES['images']['name'])) {
        $postImagesDir = $imagesDir . $slug . '/';
        if (!is_dir($postImagesDir)) {
            mkdir($postImagesDir, 0755, true);
        }
        
        for ($i = 0; $i < count($_FILES['images']['name']); $i++) {
            if ($_FILES['images']['error'][$i] === UPLOAD_ERR_OK) {
                $fileName = $_FILES['images']['name'][$i];
                $fileTmpName = $_FILES['images']['tmp_name'][$i];
                $fileSize = $_FILES['images']['size'][$i];
                $fileType = $_FILES['images']['type'][$i];
                
                // Validate file
                if (!validateImageFile($fileName, $fileType, $fileSize)) {
                    continue;
                }
                
                // Use original filename (sanitized for security)
                $fileExtension = pathinfo($fileName, PATHINFO_EXTENSION);
                $sanitizedFileName = preg_replace('/[^a-zA-Z0-9._-]/', '_', $fileName);
                $uploadPath = $postImagesDir . $sanitizedFileName;
                
                // Handle filename conflicts by adding a number suffix
                $counter = 1;
                $originalFileName = $sanitizedFileName;
                while (file_exists($uploadPath)) {
                    $nameWithoutExt = pathinfo($originalFileName, PATHINFO_FILENAME);
                    $sanitizedFileName = $nameWithoutExt . '_' . $counter . '.' . $fileExtension;
                    $uploadPath = $postImagesDir . $sanitizedFileName;
                    $counter++;
                }
                
                if (move_uploaded_file($fileTmpName, $uploadPath)) {
                    // Use relative path for image URLs (from blog/ to Gallery/Blog-images/)
                    $imageUrl = '../Gallery/Blog-images/' . $slug . '/' . $sanitizedFileName;
                    $uploadedImages[] = $imageUrl;
                }
            }
        }
    }
    
    // Handle external images
    $externalImages = [];
    $externalImagesText = trim($_POST['external_images'] ?? '');
    if (!empty($externalImagesText)) {
        $externalImages = array_filter(array_map('trim', explode("\n", $externalImagesText)));
    }
    
    // Combine all images
    $allImages = array_merge($uploadedImages, $externalImages);
    
    // Create markdown content with YAML frontmatter
    $yamlFrontmatter = createYamlFrontmatter($title, $category, $categoryColor, $excerpt, $content, $readTime, $publishDate, $status, $tags, $allImages);
    
    // Write markdown file
    $markdownFile = $postsDir . $slug . '.md';
    if (file_put_contents($markdownFile, $yamlFrontmatter)) {
        echo json_encode([
            'success' => true, 
            'message' => 'Post created successfully',
            'slug' => $slug,
            'uploaded_images' => $uploadedImages
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to create post file']);
    }
}

function handleUpdatePost() {
    global $postsDir, $imagesDir;
    
    // Debug: log the request
    error_log("Update post - Request received: " . json_encode($_POST));
    
    // Validate session
    $sessionId = $_POST['session_id'] ?? '';
    if (!validateSession($sessionId)) {
        error_log("Update post - Invalid session: " . $sessionId);
        echo json_encode(['success' => false, 'message' => 'Invalid session']);
        return;
    }
    
    // Validate required fields
    $originalSlug = trim($_POST['original_slug'] ?? '');
    $title = trim($_POST['title'] ?? '');
    $category = trim($_POST['category'] ?? '');
    $categoryColor = trim($_POST['category_color'] ?? '');
    $excerpt = trim($_POST['excerpt'] ?? '');
    $content = $_POST['content'] ?? '';
    $readTime = intval($_POST['read_time'] ?? 0);
    $publishDate = $_POST['publish_date'] ?? '';
    $status = $_POST['status'] ?? 'published';
    $tags = trim($_POST['tags'] ?? '');
    
    // Debug: log the received status
    error_log("Update post - Received status: " . $status);
    
    if (empty($originalSlug) || empty($title) || empty($category) || empty($categoryColor) || empty($excerpt) || empty($content) || $readTime <= 0 || empty($publishDate)) {
        echo json_encode(['success' => false, 'message' => 'All required fields must be filled']);
        return;
    }
    
    // Check if original post exists
    $originalFile = $postsDir . $originalSlug . '.md';
    if (!file_exists($originalFile)) {
        echo json_encode(['success' => false, 'message' => 'Original post not found']);
        return;
    }
    
    // Generate new slug from title
    $newSlug = generateSlug($title);
    
    // Check if new slug conflicts with other posts (excluding the original)
    $existingFiles = glob($postsDir . '*.md');
    foreach ($existingFiles as $file) {
        $existingSlug = basename($file, '.md');
        if ($existingSlug === $newSlug && $existingSlug !== $originalSlug) {
            $newSlug = $newSlug . '-' . time();
            break;
        }
    }
    
    // Handle new image uploads
    $uploadedImages = [];
    if (isset($_FILES['images']) && is_array($_FILES['images']['name'])) {
        $postImagesDir = $imagesDir . $newSlug . '/';
        if (!is_dir($postImagesDir)) {
            mkdir($postImagesDir, 0755, true);
        }
        
        for ($i = 0; $i < count($_FILES['images']['name']); $i++) {
            if ($_FILES['images']['error'][$i] === UPLOAD_ERR_OK) {
                $fileName = $_FILES['images']['name'][$i];
                $fileTmpName = $_FILES['images']['tmp_name'][$i];
                $fileSize = $_FILES['images']['size'][$i];
                $fileType = $_FILES['images']['type'][$i];
                
                // Validate file
                if (!validateImageFile($fileName, $fileType, $fileSize)) {
                    continue;
                }
                
                // Use original filename (sanitized for security)
                $fileExtension = pathinfo($fileName, PATHINFO_EXTENSION);
                $sanitizedFileName = preg_replace('/[^a-zA-Z0-9._-]/', '_', $fileName);
                $uploadPath = $postImagesDir . $sanitizedFileName;
                
                // Handle filename conflicts by adding a number suffix
                $counter = 1;
                $originalFileName = $sanitizedFileName;
                while (file_exists($uploadPath)) {
                    $nameWithoutExt = pathinfo($originalFileName, PATHINFO_FILENAME);
                    $sanitizedFileName = $nameWithoutExt . '_' . $counter . '.' . $fileExtension;
                    $uploadPath = $postImagesDir . $sanitizedFileName;
                    $counter++;
                }
                
                if (move_uploaded_file($fileTmpName, $uploadPath)) {
                    // Use relative path for image URLs (from blog/ to Gallery/Blog-images/)
                    $imageUrl = '../Gallery/Blog-images/' . $newSlug . '/' . $sanitizedFileName;
                    $uploadedImages[] = $imageUrl;
                }
            }
        }
    }
    
    // Handle external images
    $externalImages = [];
    $externalImagesText = trim($_POST['external_images'] ?? '');
    if (!empty($externalImagesText)) {
        $externalImages = array_filter(array_map('trim', explode("\n", $externalImagesText)));
    }
    
    // Get existing images from the original post
    $existingImages = [];
    $originalContent = file_get_contents($originalFile);
    if (preg_match('/^---\s*\n(.*?)\n---\s*\n(.*)$/s', $originalContent, $matches)) {
        $yaml = $matches[1];
        if (preg_match('/images:\s*\n((?:\s*-\s*[^\n]+\n?)*)/', $yaml, $imageMatches)) {
            $imageLines = explode("\n", trim($imageMatches[1]));
            foreach ($imageLines as $line) {
                if (preg_match('/^\s*-\s*(.+)$/', trim($line), $urlMatch)) {
                    $existingImages[] = trim($urlMatch[1]);
                }
            }
        }
    }
    
    // Combine all images (existing + new + external)
    $allImages = array_merge($existingImages, $uploadedImages, $externalImages);
    
    // Create markdown content with YAML frontmatter
    $yamlFrontmatter = createYamlFrontmatter($title, $category, $categoryColor, $excerpt, $content, $readTime, $publishDate, $status, $tags, $allImages);
    
    // Write updated markdown file
    $newMarkdownFile = $postsDir . $newSlug . '.md';
    
    // Debug: log the file path and check if directory exists
    error_log("Update post - Writing to file: " . $newMarkdownFile);
    error_log("Update post - Directory exists: " . (is_dir($postsDir) ? 'yes' : 'no'));
    error_log("Update post - Directory writable: " . (is_writable($postsDir) ? 'yes' : 'no'));
    
    if (file_put_contents($newMarkdownFile, $yamlFrontmatter)) {
        // If slug changed, delete the original file
        if ($newSlug !== $originalSlug) {
            unlink($originalFile);
            
            // Move images from old slug directory to new slug directory if they exist
            $oldImagesDir = $imagesDir . $originalSlug . '/';
            if (is_dir($oldImagesDir)) {
                $newImagesDir = $imagesDir . $newSlug . '/';
                if (!is_dir($newImagesDir)) {
                    mkdir($newImagesDir, 0755, true);
                }
                
                $oldImages = glob($oldImagesDir . '*');
                foreach ($oldImages as $oldImage) {
                    $fileName = basename($oldImage);
                    $newImagePath = $newImagesDir . $fileName;
                    rename($oldImage, $newImagePath);
                }
                
                // Remove old directory if empty
                if (count(glob($oldImagesDir . '*')) === 0) {
                    rmdir($oldImagesDir);
                }
            }
        }
        
        $response = [
            'success' => true, 
            'message' => 'Post updated successfully',
            'slug' => $newSlug,
            'uploaded_images' => $uploadedImages
        ];
        error_log("Update post - Success response: " . json_encode($response));
        echo json_encode($response);
    } else {
        // Debug: log the specific error
        error_log("Update post - Failed to write file. Error: " . (error_get_last()['message'] ?? 'Unknown error'));
        echo json_encode(['success' => false, 'message' => 'Failed to update post file']);
    }
}

function handleDeletePost() {
    global $postsDir, $imagesDir;
    
    // Validate session first
    $sessionId = $_POST['session_id'] ?? '';
    if (!validateSession($sessionId)) {
        echo json_encode(['success' => false, 'message' => 'Invalid session']);
        return;
    }
    
    // Validate required fields
    $slug = trim($_POST['slug'] ?? '');
    
    if (empty($slug)) {
        echo json_encode(['success' => false, 'message' => 'Slug is required']);
        return;
    }
    
    // Validate slug format (only allow alphanumeric, hyphens, underscores)
    if (!preg_match('/^[a-zA-Z0-9_-]+$/', $slug)) {
        echo json_encode(['success' => false, 'message' => 'Invalid slug format']);
        return;
    }
    
    // Check if post exists
    $postFile = $postsDir . $slug . '.md';
    if (!file_exists($postFile)) {
        echo json_encode(['success' => false, 'message' => 'Post not found']);
        return;
    }
    
    // Get post title for confirmation message
    $content = file_get_contents($postFile);
    $title = 'Unknown Post';
    if ($content && preg_match('/^---\s*\n(.*?)\n---\s*\n(.*)/s', $content, $matches)) {
        $yaml = $matches[1];
        if (preg_match('/title:\s*(.+)$/m', $yaml, $titleMatch)) {
            $title = trim($titleMatch[1]);
            // Remove quotes if present
            if (preg_match('/^["\'](.+)["\']$/', $title, $quotes)) {
                $title = $quotes[1];
            }
        }
    }
    
    // Delete the markdown file
    if (!unlink($postFile)) {
        echo json_encode(['success' => false, 'message' => 'Failed to delete post file']);
        return;
    }
    
    // Delete associated images directory if it exists
    $postImagesDir = $imagesDir . $slug . '/';
    if (is_dir($postImagesDir)) {
        // Recursively delete all files in the directory
        $files = glob($postImagesDir . '*');
        foreach ($files as $file) {
            if (is_file($file)) {
                unlink($file);
            }
        }
        // Remove the empty directory
        rmdir($postImagesDir);
    }
    
    echo json_encode([
        'success' => true, 
        'message' => "Post '{$title}' deleted successfully"
    ]);
}

function validateSession($sessionId) {
    global $sessionsDir;
    
    error_log("Validating session: " . $sessionId);
    error_log("Sessions directory: " . $sessionsDir);
    
    if (empty($sessionId)) {
        error_log("Session ID is empty");
        return false;
    }
    
    $sessionFile = $sessionsDir . $sessionId . '.json';
    error_log("Session file path: " . $sessionFile);
    
    if (!file_exists($sessionFile)) {
        error_log("Session file does not exist");
        return false;
    }
    
    $sessionData = json_decode(file_get_contents($sessionFile), true);
    
    if (!$sessionData) {
        error_log("Failed to decode session data");
        return false;
    }
    
    $maxSessionTime = 24 * 60 * 60; // 24 hours
    $currentTime = time();
    $sessionAge = $currentTime - $sessionData['last_activity'];
    
    error_log("Session age: " . $sessionAge . " seconds, max: " . $maxSessionTime);
    
    $isValid = ($sessionAge < $maxSessionTime);
    error_log("Session validation result: " . ($isValid ? 'valid' : 'invalid'));
    
    return $isValid;
}

function generateSlug($title) {
    // Convert to lowercase
    $slug = strtolower($title);
    
    // Replace spaces and special characters with hyphens
    $slug = preg_replace('/[^a-z0-9\s-]/', '', $slug);
    $slug = preg_replace('/[\s-]+/', '-', $slug);
    
    // Remove leading/trailing hyphens
    $slug = trim($slug, '-');
    
    // Limit length
    if (strlen($slug) > 50) {
        $slug = substr($slug, 0, 50);
        $slug = rtrim($slug, '-');
    }
    
    return $slug;
}

function validateImageFile($fileName, $fileType, $fileSize) {
    // Check file size (5MB limit)
    $maxSize = 5 * 1024 * 1024; // 5MB
    if ($fileSize > $maxSize) {
        return false;
    }
    
    // Check file type
    $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!in_array($fileType, $allowedTypes)) {
        return false;
    }
    
    // Check file extension
    $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
    if (!in_array($fileExtension, $allowedExtensions)) {
        return false;
    }
    
    return true;
}

function createYamlFrontmatter($title, $category, $categoryColor, $excerpt, $content, $readTime, $publishDate, $status, $tags, $images) {
    // Debug: log the status being written to YAML
    error_log("Creating YAML frontmatter with status: " . $status);
    
    $yaml = "---\n";
    $yaml .= "title: " . yamlEscape($title) . "\n";
    $yaml .= "category: " . yamlEscape($category) . "\n";
    $yaml .= "category_color: " . yamlEscape($categoryColor) . "\n";
    $yaml .= "excerpt: " . yamlEscape($excerpt) . "\n";
    $yaml .= "read_time: " . $readTime . "\n";
    $yaml .= "published_time: " . $publishDate . "T00:00:00Z\n";
    $yaml .= "status: " . yamlEscape($status) . "\n";
    
    if (!empty($tags)) {
        $yaml .= "tags: " . yamlEscape($tags) . "\n";
    }
    
    if (!empty($images)) {
        $yaml .= "images:\n";
        foreach ($images as $image) {
            $yaml .= "  - " . yamlEscape($image) . "\n";
        }
    }
    
    $yaml .= "---\n\n";
    $yaml .= $content;
    
    // Debug logging removed - YAML generation is working correctly
    
    return $yaml;
}

function yamlEscape($string) {
    // Only escape if absolutely necessary for YAML
    // Most image URLs don't need escaping
    if (strpos($string, "\n") !== false || strpos($string, '"') !== false) {
        return '"' . str_replace('"', '\\"', $string) . '"';
    }
    
    return $string;
}

function handleDeleteImage() {
    global $postsDir, $imagesDir, $backendDir;
    
    // Validate session
    $sessionId = $_POST['session_id'] ?? '';
    if (!validateSession($sessionId)) {
        echo json_encode(['success' => false, 'message' => 'Invalid session']);
        return;
    }
    
    // Validate required fields
    $slug = trim($_POST['slug'] ?? '');
    $imageUrl = trim($_POST['image_url'] ?? '');
    
    if (empty($slug) || empty($imageUrl)) {
        echo json_encode(['success' => false, 'message' => 'Slug and image URL are required']);
        return;
    }
    
    // Validate slug format (alphanumeric, hyphens, underscores only)
    if (!preg_match('/^[a-zA-Z0-9_-]+$/', $slug)) {
        echo json_encode(['success' => false, 'message' => 'Invalid slug format']);
        return;
    }
    
    // Validate image URL format
    if (!preg_match('/^[^<>"\']+$/', $imageUrl)) {
        echo json_encode(['success' => false, 'message' => 'Invalid image URL format']);
        return;
    }
    
    // Check if post exists
    $postFile = $postsDir . $slug . '.md';
    
    if (!file_exists($postFile)) {
        echo json_encode(['success' => false, 'message' => 'Post not found']);
        return;
    }
    
    // Read the current post content
    $postContent = file_get_contents($postFile);
    if ($postContent === false) {
        echo json_encode(['success' => false, 'message' => 'Failed to read post file']);
        return;
    }
    
    // Parse YAML frontmatter to get current images
    $images = [];
    if (preg_match('/^---\s*\n(.*?)\n---\s*\n(.*)$/s', $postContent, $matches)) {
        $yaml = $matches[1];
        $markdown = $matches[2];
        
        if (preg_match('/images:\s*\n((?:\s*-\s*[^\n]+\n?)*)/', $yaml, $imageMatches)) {
            $imageLines = explode("\n", trim($imageMatches[1]));
            
            foreach ($imageLines as $line) {
                if (preg_match('/^\s*-\s*(.+)$/', trim($line), $urlMatch)) {
                    $images[] = trim($urlMatch[1]);
                }
            }
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid post format - YAML frontmatter not found']);
        return;
    }
    
    // Remove the specified image from the array
    $imageIndex = array_search($imageUrl, $images);
    if ($imageIndex === false) {
        echo json_encode(['success' => false, 'message' => 'Image not found in post']);
        return;
    }
    
    // Remove the image from the array
    unset($images[$imageIndex]);
    $images = array_values($images); // Re-index array
    
    // If this is a local image (not external), also delete the file
    if (strpos($imageUrl, '../Gallery/Blog-images/') === 0) {
        // Extract the relative path and convert to absolute path
        $relativePath = substr($imageUrl, 3); // Remove '../'
        $absoluteImagePath = $backendDir . '/../public_html/' . $relativePath;
        
        if (file_exists($absoluteImagePath)) {
            if (!unlink($absoluteImagePath)) {
                $error = error_get_last();
                echo json_encode([
                    'success' => false, 
                    'message' => 'Failed to delete image file: ' . ($error['message'] ?? 'Unknown error')
                ]);
                return;
            }
            
            // Check if the images directory is now empty and remove it if so
            $imageDir = dirname($absoluteImagePath);
            if (is_dir($imageDir) && count(glob($imageDir . '/*')) === 0) {
                if (!rmdir($imageDir)) {
                    // Directory removal failed, but this is not critical
                }
            }
        }
    }
    
    // Recreate the post content with updated images
    $yaml = $matches[1];
    
    // Remove the old images section (handle both with and without images)
    // Use a more flexible regex that handles various YAML formatting
    $yaml = preg_replace('/images:\s*\n((?:\s*[-*]\s*[^\n]*\n?)*)/', '', $yaml);
    
    // Clean up any trailing whitespace and ensure proper YAML formatting
    $yaml = rtrim($yaml);
    
    // Add the new images section if there are remaining images
    if (!empty($images)) {
        $yaml .= "\nimages:\n";
        foreach ($images as $image) {
            $escapedImage = yamlEscape($image);
            $yaml .= "  - " . $escapedImage . "\n";
        }
    }
    
    // Ensure there's a newline before the closing ---
    if (!empty($yaml) && substr($yaml, -1) !== "\n") {
        $yaml .= "\n";
    }
    
    // Reconstruct the post content
    $newPostContent = "---\n" . $yaml . "---\n\n" . $matches[2];
    
    // Validate that the new content is not empty and has proper structure
    if (empty(trim($newPostContent)) || !preg_match('/^---\s*\n.*\n---\s*\n/s', $newPostContent)) {
        echo json_encode(['success' => false, 'message' => 'Generated post content is invalid']);
        return;
    }
    
    // Write the updated content back to the file
    if (file_put_contents($postFile, $newPostContent)) {
        echo json_encode([
            'success' => true, 
            'message' => 'Image deleted successfully',
            'remaining_images' => $images
        ]);
    } else {
        $error = error_get_last();
        echo json_encode([
            'success' => false, 
            'message' => 'Failed to update post file: ' . ($error['message'] ?? 'Unknown error')
        ]);
    }
}
?>
