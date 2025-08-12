<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title id="page-title">Blog Post | Trifecta.Systems</title>
    <meta name="description" id="page-description" content="Blog post from Trifecta.Systems">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article">
    <meta property="og:url" id="og-url" content="">
    <meta property="og:title" id="og-title" content="">
    <meta property="og:description" id="og-description" content="">
    <meta property="og:image" content="https://trifecta.systems/Gallery/Trifecta_Logo.png">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" id="twitter-url" content="">
    <meta property="twitter:title" id="twitter-title" content="">
    <meta property="twitter:description" id="twitter-description" content="">
    <meta property="twitter:image" content="https://trifecta.systems/Gallery/Trifecta_Logo.png">
    
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../style.css">

    <!-- favicon -->
    <link rel="icon" type="image/png" href="../Gallery/favicon/favicon-96x96.png" sizes="96x96" />
    <link rel="icon" type="image/svg+xml" href="../Gallery/favicon/favicon.svg" />
    <link rel="shortcut icon" href="../Gallery/favicon/favicon.ico" />
    <link rel="apple-touch-icon" sizes="180x180" href="../Gallery/favicon/apple-touch-icon.png" />
    <meta name="apple-mobile-web-app-title" content="Trifecta" />
    <link rel="manifest" href="../Gallery/favicon/site.webmanifest" />

    <style>
        /* Blog post content styling */
        .blog-content h1, .blog-content h2, .blog-content h3, .blog-content h4, .blog-content h5, .blog-content h6 {
            color: #ffffff;
            margin-top: 2rem;
            margin-bottom: 1rem;
            font-weight: 600;
        }
        
        .blog-content h1 { font-size: 2.25rem; }
        .blog-content h2 { font-size: 1.875rem; }
        .blog-content h3 { font-size: 1.5rem; }
        .blog-content h4 { font-size: 1.25rem; }
        
        .blog-content p {
            color: #d1d5db;
            line-height: 1.75;
            margin-bottom: 1.5rem;
        }
        
        .blog-content ul, .blog-content ol {
            color: #d1d5db;
            margin-bottom: 1.5rem;
            padding-left: 1.5rem;
        }
        
        .blog-content li {
            margin-bottom: 0.5rem;
        }
        
        .blog-content blockquote {
            border-left: 4px solid #3b82f6;
            padding-left: 1rem;
            margin: 1.5rem 0;
            font-style: italic;
            color: #9ca3af;
        }
        
        .blog-content code {
            background-color: #374151;
            color: #f3f4f6;
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
            font-family: 'Courier New', monospace;
        }
        
        .blog-content pre {
            background-color: #1f2937;
            color: #f3f4f6;
            padding: 1rem;
            border-radius: 0.5rem;
            overflow-x: auto;
            margin: 1.5rem 0;
        }
        
        .blog-content pre code {
            background: none;
            padding: 0;
        }
        
        .blog-content table {
            width: 100%;
            border-collapse: collapse;
            margin: 1.5rem 0;
        }
        
        .blog-content th, .blog-content td {
            border: 1px solid #374151;
            padding: 0.75rem;
            text-align: left;
        }
        
        .blog-content th {
            background-color: #374151;
            color: #ffffff;
            font-weight: 600;
        }
        
        .blog-content td {
            color: #d1d5db;
        }
        
        .blog-content a {
            color: #3b82f6;
            text-decoration: underline;
        }
        
        .blog-content a:hover {
            color: #60a5fa;
        }
        
        .blog-content strong {
            color: #ffffff;
            font-weight: 600;
        }
        
        .blog-content em {
            color: #9ca3af;
        }
        
        .blog-content img {
            max-width: 100%;
            height: auto;
            border-radius: 0.5rem;
            margin: 1.5rem 0;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        
        .blog-content img:hover {
            transform: scale(1.02);
            transition: transform 0.2s ease-in-out;
        }
        
        .blog-content hr {
            border: none;
            height: 1px;
            background-color: #374151;
            margin: 2rem 0;
            width: 100%;
        }
    </style>
</head>
<body>
    <!-- Header -->
    <header class="bg-[#0F131C] text-white shadow-lg sticky top-0 z-50 main-navigation-header">
        <nav class="container mx-auto px-4 py-4">
            <div class="flex justify-between items-center">
                <a href="../index.html" class="flex items-center space-x-3 flex-shrink-0">
                    <img id="mainLogo" src="../Gallery/Trifecta_Logo.png" alt="Trifecta.Systems Logo" class="w-auto h-10 rounded-md" loading="eager">
                    <span class="text-3xl font-bold text-white">Trifecta.Systems</span>
                </a>
                <div class="hidden md:flex space-x-8">
                    <a href="../index.html" class="nav-link">Home</a>
                    <a href="../index.html#services" class="nav-link">Services</a>
                    <a href="../index.html#about" class="nav-link">About</a>
                    <a href="../index.html#contact" class="nav-link">Contact</a>
                    <a href="index.html" class="nav-link text-blue-400 font-semibold">Blog</a>
                </div>
                <button id="mobileMenuBtn" class="md:hidden text-white">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                </button>
            </div>
            <div id="mobileMenu" class="md:hidden hidden mt-4 pb-4">
                <ul class="space-y-2">
                    <li><a href="../index.html" class="nav-link">Home</a></li>
                    <li><a href="../index.html#services" class="nav-link">Services</a></li>
                    <li><a href="../index.html#about" class="nav-link">About</a></li>
                    <li><a href="../index.html#contact" class="nav-link">Contact</a></li>
                    <li><a href="index.html" class="nav-link text-blue-400 font-semibold">Blog</a></li>
                </ul>
            </div>
        </nav>
    </header>

    <!-- Blog Post Content -->
    <main class="bg-[#0F131C] min-h-screen">
        <article class="container mx-auto px-4 py-16">
            <div class="max-w-4xl mx-auto bg-[#161B29] rounded-lg shadow-xl p-8">
                <!-- Back to Blog Link -->
                <div class="mb-8">
                    <a href="index.html" class="text-blue-400 hover:text-blue-300 font-semibold flex items-center">
                        ← Back to Blog
                    </a>
                </div>

                <!-- Loading State -->
                <div id="loading" class="text-center py-16">
                    <div class="loading-spinner"></div>
                    <p class="text-gray-400 mt-4">Loading blog post...</p>
                </div>

                <!-- Blog Post Content -->
                <div id="blog-content" class="hidden">
                    <!-- Preview Banner -->
                    <div id="preview-banner" class="hidden bg-yellow-600 text-white p-4 mb-6 rounded-lg">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center">
                                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                                </svg>
                                <span class="font-semibold">Preview Mode</span>
                            </div>
                            <span class="text-sm opacity-90">This is a draft preview - not visible to the public</span>
                        </div>
                    </div>
                    
                    <!-- Post Header -->
                    <header class="mb-12">
                        <div class="flex items-center mb-6">
                            <span id="category-badge" class="text-white text-xs font-semibold px-3 py-1 rounded-full mr-4">
                                <!-- Category will be inserted here -->
                            </span>
                            <span id="read-time" class="text-gray-400 text-sm">
                                <!-- Read time will be inserted here -->
                            </span>
                        </div>
                        <h1 id="post-title" class="text-4xl md:text-5xl font-bold text-white mb-6">
                            <!-- Title will be inserted here -->
                        </h1>
                        <p id="post-excerpt" class="text-xl text-gray-300 mb-6">
                            <!-- Excerpt will be inserted here -->
                        </p>
                        <div class="flex items-center text-gray-400 text-sm">
                            <span id="post-date">
                                <!-- Date will be inserted here -->
                            </span>
                        </div>
                        
                        <!-- Tags -->
                        <div id="post-tags" class="mt-4 hidden">
                            <div class="flex flex-wrap gap-2">
                                <!-- Tags will be inserted here -->
                            </div>
                        </div>
                    </header>

                    <!-- Post Content -->
                    <div id="post-body" class="blog-content prose prose-invert max-w-none">
                        <!-- Content will be inserted here -->
                    </div>

                    <!-- Post Footer -->
                    <footer class="mt-12 pt-8 border-t border-gray-700">
                        <div class="flex items-center justify-between">
                            <div>
                                <span class="text-gray-400 text-sm">Written by Trifecta.Systems</span>
                            </div>
                            <a href="index.html" class="text-blue-400 hover:text-blue-300 font-semibold">
                                ← Back to Blog
                            </a>
                        </div>
                    </footer>
                </div>

                <!-- Error State -->
                <div id="error" class="hidden text-center py-16">
                    <p class="text-red-400 text-xl mb-4">Post Not Found</p>
                    <p class="text-gray-400 mb-8">The blog post you're looking for doesn't exist or has been moved.</p>
                    <a href="index.html" class="btn-primary">Back to Blog</a>
                </div>
            </div>
        </article>
    </main>

    <!-- Footer -->
    <footer class="bg-[#161B29] text-white py-12">
        <div class="container mx-auto px-4">
            <div class="text-center">
                <p>&copy; 2025 Trifecta.Systems. All rights reserved.</p>
                <p class="text-gray-400 mt-2">Designed with purpose for small businesses & nonprofits with the help of Google's Gemini and other AI.</p>
                <div class="mt-4 space-x-4">
                    <a href="../privacy-policy.html" class="text-blue-400 hover:text-blue-300">Privacy Policy</a>
                    <a href="../terms-of-service.html" class="text-blue-400 hover:text-blue-300">Terms of Service</a>
                    <a href="../data-rights-request.html" class="text-blue-400 hover:text-blue-300">Data Rights</a>
                </div>
            </div>
        </div>
    </footer>

    <script src="../script.js"></script>
    
    <?php
    require '../../vendor/autoload.php';
    
    // Create an instance of the Parsedown class
    $Parsedown = new Parsedown();
    
    // Get slug from URL
    $slug = $_GET['slug'] ?? '';
    $isPreview = isset($_GET['preview']) && $_GET['preview'] === 'true';
    
    if (empty($slug)) {
        $errorMessage = 'No post specified';
        $showError = true;
    } else {
        // Define paths
        $postsDir = __DIR__ . '/../Blog-posts/';
        $postFile = $postsDir . $slug . '.md';
        
        if (!file_exists($postFile)) {
            $errorMessage = 'Post not found';
            $showError = true;
        } else {
            $content = file_get_contents($postFile);
            if ($content === false) {
                $errorMessage = 'Error reading post file';
                $showError = true;
            } else {
                // Parse YAML frontmatter
                if (preg_match('/^---\s*\n(.*?)\n---\s*\n(.*)/s', $content, $matches)) {
                    $yaml = $matches[1];
                    $markdown = $matches[2];
                    
                    // Simple YAML parsing for the fields we need
                    $frontmatter = [];
                    $lines = explode("\n", $yaml);
                    foreach ($lines as $line) {
                        if (preg_match('/^([^:]+):\s*(.*)$/', trim($line), $parts)) {
                            $key = trim($parts[1]);
                            $value = trim($parts[2]);
                            // Remove quotes if present
                            if (preg_match('/^["\'](.+)["\']$/', $value, $quotes)) {
                                $value = $quotes[1];
                            }
                            $frontmatter[$key] = $value;
                        }
                    }
                    
                    // Convert markdown to HTML using Parsedown
                    $htmlContent = $Parsedown->text($markdown);
                    
                    $post = [
                        'slug' => $slug,
                        'title' => $frontmatter['title'] ?? 'Untitled',
                        'description' => $frontmatter['description'] ?? '',
                        'excerpt' => $frontmatter['excerpt'] ?? '',
                        'category' => $frontmatter['category'] ?? 'Uncategorized',
                        'category_color' => $frontmatter['category_color'] ?? 'blue',
                        'date' => $frontmatter['date'] ?? '',
                        'read_time' => $frontmatter['read_time'] ?? 5,
                        'published_time' => $frontmatter['published_time'] ?? '',
                        'content' => $htmlContent,
                        'tags' => $frontmatter['tags'] ?? '',
                        'status' => $frontmatter['status'] ?? 'published'
                    ];
                    
                    $showError = false;
                } else {
                    $errorMessage = 'Invalid post format';
                    $showError = true;
                }
            }
        }
    }
    ?>
    
    <script>
        // Blog post functionality
        document.addEventListener('DOMContentLoaded', function() {
            <?php if ($showError): ?>
                showError('<?php echo addslashes($errorMessage); ?>');
            <?php else: ?>
                displayPost(<?php echo json_encode($post); ?>, <?php echo $isPreview ? 'true' : 'false'; ?>);
            <?php endif; ?>
        });

        function displayPost(post, isPreview = false) {
            // Update page title and meta tags
            document.getElementById('page-title').textContent = `${post.title} | Trifecta.Systems`;
            document.getElementById('page-description').content = post.description || post.excerpt;
            
            // Update Open Graph tags
            document.getElementById('og-title').content = post.title;
            document.getElementById('og-description').content = post.description || post.excerpt;
            document.getElementById('og-url').content = window.location.href;
            
            // Update Twitter Card tags
            document.getElementById('twitter-title').content = post.title;
            document.getElementById('twitter-description').content = post.description || post.excerpt;
            
            // Update structured data
            updateStructuredData(post);
            
            // Update category badge
            const categoryBadge = document.getElementById('category-badge');
            const colorClasses = {
                'blue': 'bg-blue-500',
                'red': 'bg-red-500',
                'green': 'bg-green-500',
                'purple': 'bg-purple-500',
                'yellow': 'bg-yellow-500',
                'orange': 'bg-orange-500'
            };
            categoryBadge.className = `${colorClasses[post.category_color] || 'bg-blue-500'} text-white text-xs font-semibold px-3 py-1 rounded-full mr-4`;
            categoryBadge.textContent = post.category;

            // Update post content
            document.getElementById('read-time').textContent = `${post.read_time} min read`;
            document.getElementById('post-title').textContent = post.title;
            document.getElementById('post-excerpt').textContent = post.excerpt || post.description || '';
            document.getElementById('post-date').textContent = formatDate(post.published_time);
            document.getElementById('post-body').innerHTML = post.content;

            // Display tags if they exist
            const tagsContainer = document.getElementById('post-tags');
            if (post.tags && post.tags.trim()) {
                const tags = post.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
                if (tags.length > 0) {
                    const tagsHtml = tags.map(tag => 
                        `<span class="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm">${tag}</span>`
                    ).join('');
                    tagsContainer.querySelector('div').innerHTML = tagsHtml;
                    tagsContainer.classList.remove('hidden');
                }
            }

            // Show/hide preview banner
            const previewBanner = document.getElementById('preview-banner');
            if (isPreview) {
                previewBanner.classList.remove('hidden');
            } else {
                previewBanner.classList.add('hidden');
            }
            
            // Hide loading, show content
            document.getElementById('loading').classList.add('hidden');
            document.getElementById('blog-content').classList.remove('hidden');
        }

        function updateStructuredData(post) {
            const structuredData = {
                "@context": "https://schema.org",
                "@type": "BlogPosting",
                "headline": post.title,
                "description": post.description || post.excerpt,
                "author": {
                    "@type": "Person",
                    "name": "Trifecta.Systems"
                },
                "publisher": {
                    "@type": "Organization",
                    "name": "Trifecta.Systems",
                    "logo": {
                        "@type": "ImageObject",
                        "url": "https://trifecta.systems/Gallery/Trifecta_Logo.png"
                    }
                },
                "datePublished": post.published_time,
                "dateModified": post.published_time,
                "mainEntityOfPage": {
                    "@type": "WebPage",
                    "@id": window.location.href
                }
            };
            
            // Remove existing structured data script
            const existingScript = document.querySelector('script[type="application/ld+json"]');
            if (existingScript) {
                existingScript.remove();
            }
            
            // Add new structured data
            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.textContent = JSON.stringify(structuredData);
            document.head.appendChild(script);
        }

        function getCategoryColor(color) {
            const colors = {
                'blue': 'bg-blue-500',
                'green': 'bg-green-500',
                'red': 'bg-red-500',
                'yellow': 'bg-yellow-500',
                'purple': 'bg-purple-500',
                'pink': 'bg-pink-500',
                'indigo': 'bg-indigo-500',
                'gray': 'bg-gray-500'
            };
            return colors[color] || 'bg-blue-500';
        }

        function formatDate(dateString) {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }

        function showError(message) {
            document.getElementById('loading').classList.add('hidden');
            document.getElementById('error').classList.remove('hidden');
            document.querySelector('#error p:first-child').textContent = message;
        }
    </script>
</body>
</html> 