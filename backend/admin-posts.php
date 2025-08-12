<?php
// Admin Posts API - Returns all posts for admin dashboard
// This is separate from the public blog parser for security

// This line tells PHP where to find the libraries installed by Composer
try {
    require __DIR__ . '/../vendor/autoload.php';
    
    // Create a new instance of the Parsedown class
    $Parsedown = new Parsedown();
} catch (Exception $e) {
    error_log('Failed to load Parsedown: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to load markdown parser']);
    exit();
}

// Security headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Allow all origins for local development
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

// Security: Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

// Validate action parameter
$action = $_GET['action'] ?? '';
if (!in_array($action, ['list', 'post'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid action']);
    exit();
}

// Define paths (absolute path from backend folder)
$backendDir = __DIR__;
$postsDir = $backendDir . '/../public_html/blog/Blog-posts/';

// Validate directory exists
if (!is_dir($postsDir)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Blog posts directory not found: ' . $postsDir]);
    exit();
}

// Simple YAML frontmatter parser (same as blog-parser.php)
function parseYamlFrontmatter($content) {
    if (!preg_match('/^---\s*\n(.*?)\n---\s*\n(.*)/s', $content, $matches)) {
        return [null, $content];
    }
    
    $yaml = $matches[1];
    $markdown = $matches[2];
    
    $frontmatter = [];
    $lines = explode("\n", $yaml);
    $currentKey = null;
    $currentValue = '';
    $inArray = false;
    
    foreach ($lines as $line) {
        $originalLine = $line; // Keep original for indentation check
        $line = trim($line);
        if (empty($line)) continue;
        
        // Check if this is a new key-value pair (not indented)
        if (preg_match('/^([^:]+):\s*(.*)$/', $line, $parts) && !preg_match('/^\s/', $originalLine)) {
            // Save previous key-value if we were processing one
            if ($currentKey !== null) {
                if ($inArray) {
                    // Parse array value
                    $arrayItems = array_filter(array_map('trim', explode("\n", $currentValue)));
                    $frontmatter[$currentKey] = $arrayItems;
                } else {
                    // Remove quotes if present
                    if (preg_match('/^["\'](.+)["\']$/', $currentValue, $quotes)) {
                        $currentValue = $quotes[1];
                    }
                    $frontmatter[$currentKey] = $currentValue;
                }
            }
            
            $currentKey = trim($parts[1]);
            $currentValue = trim($parts[2]);
            $inArray = false;
            
            // Check if this starts an array (empty value followed by array items)
            if (empty($currentValue)) {
                $inArray = true;
                $currentValue = '';
            }
        } else if ($currentKey !== null && $inArray) {
            // This is an array item (starts with - or * and is indented)
            if (preg_match('/^\s*[-*]\s*(.+)$/', $originalLine, $arrayMatch)) {
                $currentValue .= trim($arrayMatch[1]) . "\n";
            }
        } else if ($currentKey !== null && !$inArray) {
            // This is a continuation of a single value
            $currentValue .= ' ' . $line;
        }
    }
    
    // Save the last key-value pair
    if ($currentKey !== null) {
        if ($inArray) {
            // Parse array value
            $arrayItems = array_filter(array_map('trim', explode("\n", $currentValue)));
            $frontmatter[$currentKey] = $arrayItems;
        } else {
            // Remove quotes if present
            if (preg_match('/^["\'](.+)["\']$/', $currentValue, $quotes)) {
                $currentValue = $quotes[1];
            }
            $frontmatter[$currentKey] = $currentValue;
        }
    }
    
    return [$frontmatter, $markdown];
}

// Get all blog posts for admin dashboard (including drafts and scheduled)
function getAllBlogPosts($postsDir) {
    $posts = [];
    $files = glob($postsDir . '*.md');
    
    foreach ($files as $file) {
        $content = file_get_contents($file);
        if ($content === false) continue;
        
        list($frontmatter, $markdown) = parseYamlFrontmatter($content);
        
        if ($frontmatter) {
            $slug = pathinfo($file, PATHINFO_FILENAME);
            $status = $frontmatter['status'] ?? 'published';
            
            // Include ALL posts regardless of status for admin dashboard
            $posts[] = [
                'slug' => $slug,
                'title' => $frontmatter['title'] ?? 'Untitled',
                'description' => $frontmatter['description'] ?? '',
                'excerpt' => $frontmatter['excerpt'] ?? '',
                'category' => $frontmatter['category'] ?? 'Uncategorized',
                'category_color' => $frontmatter['category_color'] ?? 'blue',
                'date' => $frontmatter['date'] ?? '',
                'read_time' => $frontmatter['read_time'] ?? 5,
                'published_time' => $frontmatter['published_time'] ?? '',
                'status' => $status,
                'tags' => $frontmatter['tags'] ?? ''
            ];
        }
    }
    
    // Sort by published_time (newest first), with drafts at the end
    usort($posts, function($a, $b) {
        // If both have published_time, sort by that
        if (!empty($a['published_time']) && !empty($b['published_time'])) {
            $timeA = strtotime($a['published_time']);
            $timeB = strtotime($b['published_time']);
            return $timeB - $timeA;
        }
        
        // If only one has published_time, prioritize it
        if (!empty($a['published_time']) && empty($b['published_time'])) {
            return -1;
        }
        if (empty($a['published_time']) && !empty($b['published_time'])) {
            return 1;
        }
        
        // If neither has published_time, sort by title
        return strcasecmp($a['title'], $b['title']);
    });
    
    return $posts;
}

// Get single blog post for preview (returns raw markdown)
function getBlogPost($postsDir, $slug) {
    // Validate slug (only allow alphanumeric, hyphens, underscores)
    if (!preg_match('/^[a-zA-Z0-9_-]+$/', $slug)) {
        return null;
    }
    
    $file = $postsDir . $slug . '.md';
    
    if (!file_exists($file)) {
        return null;
    }
    
    $content = file_get_contents($file);
    if ($content === false) {
        return null;
    }
    
    list($frontmatter, $markdown) = parseYamlFrontmatter($content);
    
    if (!$frontmatter) {
        return null;
    }
    
    // Convert markdown to HTML for preview
    $html = markdownToHtml($markdown);
    
    return [
        'slug' => $slug,
        'title' => $frontmatter['title'] ?? 'Untitled',
        'description' => $frontmatter['description'] ?? '',
        'excerpt' => $frontmatter['excerpt'] ?? '',
        'category' => $frontmatter['category'] ?? 'Uncategorized',
        'category_color' => $frontmatter['category_color'] ?? 'blue',
        'date' => $frontmatter['date'] ?? '',
        'read_time' => $frontmatter['read_time'] ?? 5,
        'published_time' => $frontmatter['published_time'] ?? '',
        'content' => $html,
        'tags' => $frontmatter['tags'] ?? ''
    ];
}

// Use Parsedown to convert markdown to HTML
function markdownToHtml($markdown) {
    global $Parsedown;
    if (!$Parsedown) {
        throw new Exception('Parsedown not initialized');
    }
    
    // Convert markdown to HTML - no path conversion needed
    // The markdown files already have the correct relative paths (../Gallery/Blog-images/)
    // that work with other view panes
    return $Parsedown->text($markdown);
}

// Handle the request
if ($action === 'list') {
    $posts = getAllBlogPosts($postsDir);
    echo json_encode($posts);
} elseif ($action === 'post') {
    $slug = $_GET['slug'] ?? '';
    if (empty($slug)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Slug parameter required']);
        exit();
    }
    
    $post = getBlogPost($postsDir, $slug);
    if ($post) {
        echo json_encode($post);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Post not found']);
    }
}
?>
