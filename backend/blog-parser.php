<?php
// Blog Parser - Handles markdown files and YAML frontmatter
// Located in backend/ for better security

// Security headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://trifecta.systems'); // Restrict to your domain
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
if (!in_array($action, ['list', 'post', 'edit'])) {
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

// Simple YAML frontmatter parser
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
    
    // Debug logging removed - YAML parsing is working correctly
    
    return [$frontmatter, $markdown];
}

// Simple markdown to HTML converter
function markdownToHtml($markdown) {
    // Headers
    $markdown = preg_replace('/^### (.*$)/m', '<h3>$1</h3>', $markdown);
    $markdown = preg_replace('/^## (.*$)/m', '<h2>$1</h2>', $markdown);
    $markdown = preg_replace('/^# (.*$)/m', '<h1>$1</h1>', $markdown);
    
    // Bold and italic
    $markdown = preg_replace('/\*\*(.*?)\*\*/s', '<strong>$1</strong>', $markdown);
    $markdown = preg_replace('/\*(.*?)\*/s', '<em>$1</em>', $markdown);
    
    // Code blocks
    $markdown = preg_replace('/```(.*?)```/s', '<pre><code>$1</code></pre>', $markdown);
    $markdown = preg_replace('/`(.*?)`/s', '<code>$1</code>', $markdown);
    
    // Images (must be processed BEFORE links to avoid conflicts)
    // More robust image regex that handles various patterns
    $markdown = preg_replace('/!\[([^\]]*)\]\(([^)]+)\)/s', '<img src="$2" alt="$1" class="blog-image">', $markdown);
    
    // Links (processed after images to avoid conflicts)
    $markdown = preg_replace('/\[([^\]]+)\]\(([^)]+)\)/', '<a href="$2">$1</a>', $markdown);
    
    // Lists
    $markdown = preg_replace('/^\* (.*$)/m', '<li>$1</li>', $markdown);
    $markdown = preg_replace('/^- (.*$)/m', '<li>$1</li>', $markdown);
    
    // Wrap consecutive list items in ul tags
    $markdown = preg_replace('/(<li>.*<\/li>)/s', '<ul>$1</ul>', $markdown);
    
    // Paragraphs (wrap text in p tags if not already wrapped)
    $markdown = preg_replace('/^(?!<[h|u|p|pre])(.+)$/m', '<p>$1</p>', $markdown);
    
    // Clean up multiple consecutive p tags
    $markdown = preg_replace('/<\/p>\s*<p>/', "\n", $markdown);
    
    // Tables (basic support)
    $markdown = preg_replace('/\|(.+)\|/', '<tr><td>$1</td></tr>', $markdown);
    $markdown = preg_replace('/<tr><td>(.+)\|(.+)<\/td><\/tr>/', '<tr><td>$1</td><td>$2</td></tr>', $markdown);
    $markdown = preg_replace('/<tr><td>(.+)\|(.+)\|(.+)<\/td><\/tr>/', '<tr><td>$1</td><td>$2</td><td>$3</td></tr>', $markdown);
    
    // Wrap table rows in table tags
    $markdown = preg_replace('/(<tr>.*<\/tr>)/s', '<table>$1</table>', $markdown);
    
    // Blockquotes
    $markdown = preg_replace('/^> (.*$)/m', '<blockquote>$1</blockquote>', $markdown);
    
    return $markdown;
}

// Get all blog posts
function getBlogPosts($postsDir) {
    $posts = [];
    $files = glob($postsDir . '*.md');
    
    foreach ($files as $file) {
        $content = file_get_contents($file);
        if ($content === false) continue;
        
        list($frontmatter, $markdown) = parseYamlFrontmatter($content);
        
        if ($frontmatter) {
            $slug = pathinfo($file, PATHINFO_FILENAME);
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
                'status' => $frontmatter['status'] ?? 'published',
                'tags' => $frontmatter['tags'] ?? ''
            ];
        }
    }
    
    // Sort by published_time (newest first)
    usort($posts, function($a, $b) {
        $timeA = strtotime($a['published_time']);
        $timeB = strtotime($b['published_time']);
        return $timeB - $timeA;
    });
    
    return $posts;
}

// Get single blog post
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

// Get single blog post for editing (returns raw markdown)
function getBlogPostForEdit($postsDir, $slug) {
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
    
    $result = [
        'slug' => $slug,
        'title' => $frontmatter['title'] ?? 'Untitled',
        'description' => $frontmatter['description'] ?? '',
        'excerpt' => $frontmatter['excerpt'] ?? '',
        'category' => $frontmatter['category'] ?? 'Uncategorized',
        'category_color' => $frontmatter['category_color'] ?? 'blue',
        'date' => $frontmatter['date'] ?? '',
        'read_time' => $frontmatter['read_time'] ?? 5,
        'published_time' => $frontmatter['published_time'] ?? '',
        'content' => $markdown, // Return raw markdown instead of HTML
        'images' => $frontmatter['images'] ?? [],
        'tags' => $frontmatter['tags'] ?? ''
    ];
    

    
    return $result;
}

// Handle requests
try {
    switch ($action) {
        case 'list':
            $posts = getBlogPosts($postsDir);
            echo json_encode($posts);
            break;
            
        case 'post':
            $slug = $_GET['slug'] ?? '';
            if (empty($slug)) {
                echo json_encode(['success' => false, 'message' => 'Slug parameter required']);
                exit();
            }
            
            $post = getBlogPost($postsDir, $slug);
            if ($post) {
                echo json_encode(['success' => true, 'post' => $post]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Post not found']);
            }
            break;
            
        case 'edit':
            $slug = $_GET['slug'] ?? '';
            if (empty($slug)) {
                echo json_encode(['success' => false, 'message' => 'Slug parameter required']);
                exit();
            }
            
            $post = getBlogPostForEdit($postsDir, $slug);
            if ($post) {
                echo json_encode(['success' => true, 'post' => $post]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Post not found']);
            }
            break;
            
        default:
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
            break;
    }
} catch (Exception $e) {
    error_log('Blog parser error: ' . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Internal server error']);
}
?> 