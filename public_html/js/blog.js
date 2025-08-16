// blog.js - Blog-specific functionality for post display and index

import { formatDate, getCategoryColor } from './utils.js';

// Blog post functionality
export async function loadBlogPost() {
    try {
        // Get slug and preview parameters from URL
        const urlParams = new URLSearchParams(window.location.search);
        const slug = urlParams.get('slug');
        const isPreview = urlParams.get('preview') === 'true';
        
        if (!slug) {
            showError('No post specified');
            return;
        }
        
        // Use different endpoint for previews vs public posts
        const endpoint = isPreview ? 'admin-posts-proxy.php?action=post&slug=' : 'parser-proxy.php?action=post&slug=';
        const response = await fetch(endpoint + encodeURIComponent(slug));
        const result = await response.json();
        
        if (isPreview) {
            // For previews, the result is the post directly
            if (!result || !result.slug) {
                showError('Post not found or not accessible for preview');
                return;
            }
            const post = result;
            displayPost(post, true);
        } else {
            // For public posts, check success status
            if (!result.success) {
                showError(result.message || 'Post not found');
                return;
            }
            const post = result.post;
            displayPost(post, false);
        }
        
    } catch (error) {
        console.error('Error loading blog post:', error);
        showError('Error loading blog post. Please try again later.');
    }
}

export function displayPost(post, isPreview = false) {
    // Update page title and meta tags
    const pageTitle = document.getElementById('page-title');
    const pageDescription = document.getElementById('page-description');
    
    if (pageTitle) pageTitle.textContent = `${post.title} | Trifecta.Systems`;
    if (pageDescription) pageDescription.content = post.description || post.excerpt;
    
    // Find the first image in the blog post content
    const firstImage = findFirstImage(post.content);
    
    // Update Open Graph tags
    updateMetaTag('og-title', post.title);
    updateMetaTag('og-description', post.description || post.excerpt);
    updateMetaTag('og-url', window.location.href);
    updateMetaTag('og-image', firstImage);
    
    // Update Twitter Card tags
    updateMetaTag('twitter-title', post.title);
    updateMetaTag('twitter-description', post.description || post.excerpt);
    updateMetaTag('twitter-image', firstImage);
    
    // Update structured data
    updateStructuredData(post);
    
    // Update category badge
    const categoryBadge = document.getElementById('category-badge');
    if (categoryBadge) {
        categoryBadge.className = `${getCategoryColor(post.category_color)} text-white text-xs font-semibold px-3 py-1 rounded-full mr-4`;
        categoryBadge.textContent = post.category;
    }

    // Update post content
    updateElement('read-time', `${post.read_time} min read`);
    updateElement('post-title', post.title);
    updateElement('post-excerpt', post.excerpt || post.description || '');
    updateElement('post-date', formatDate(post.published_time));
    
    const postBody = document.getElementById('post-body');
    if (postBody) postBody.innerHTML = post.content;

    // Display tags if they exist
    const tagsContainer = document.getElementById('post-tags');
    if (post.tags && post.tags.trim() && tagsContainer) {
        const tags = post.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
        if (tags.length > 0) {
            const tagsHtml = tags.map(tag => 
                `<span class="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm">${tag}</span>`
            ).join('');
            const tagsDiv = tagsContainer.querySelector('div');
            if (tagsDiv) tagsDiv.innerHTML = tagsHtml;
            tagsContainer.classList.remove('hidden');
        }
    }

    // Show/hide preview banner
    const previewBanner = document.getElementById('preview-banner');
    if (previewBanner) {
        if (isPreview) {
            previewBanner.classList.remove('hidden');
        } else {
            previewBanner.classList.add('hidden');
        }
    }
    
    // Hide loading, show content
    hideElement('loading');
    showElement('blog-content');
}

// Blog index functionality
export async function loadBlogPosts() {
    try {
        console.log('Fetching blog posts...');
        const response = await fetch('parser-proxy.php?action=list');
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const posts = await response.json();
        console.log('Posts received:', posts);
        
        const postsContainer = document.getElementById('blog-posts');
        if (!postsContainer) {
            console.error('Blog posts container not found');
            return;
        }
        
        postsContainer.innerHTML = '';
        
        if (Array.isArray(posts)) {
            posts.forEach(post => {
                const postElement = createPostSummary(post);
                postsContainer.appendChild(postElement);
            });
        } else {
            console.error('Posts is not an array:', posts);
            postsContainer.innerHTML = '<p class="text-red-400 text-center col-span-full">Invalid response format from server.</p>';
        }
        
    } catch (error) {
        console.error('Error loading blog posts:', error);
        const postsContainer = document.getElementById('blog-posts');
        if (postsContainer) {
            postsContainer.innerHTML = `<p class="text-red-400 text-center col-span-full">Error loading blog posts: ${error.message}</p>`;
        }
    }
}

export function createPostSummary(post) {
    const article = document.createElement('article');
    article.className = 'bg-[#161B29] rounded-lg shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300';
    
    const categoryColor = getCategoryColor(post.category_color);
    
    article.innerHTML = `
        <div class="p-6">
            <div class="flex items-center justify-between mb-3">
                <span class="px-3 py-1 text-xs font-semibold text-white rounded-full ${categoryColor}">
                    ${post.category}
                </span>
                <span class="text-sm text-gray-400">${post.read_time} min read</span>
            </div>
            
            <h2 class="text-xl font-bold text-white mb-2 hover:text-blue-400 transition-colors">
                <a href="post.html?slug=${post.slug}">${post.title}</a>
            </h2>
            
            <p class="text-gray-300 mb-4 line-clamp-3">${post.excerpt || post.description}</p>
            
            <div class="flex items-center justify-between">
                <time class="text-sm text-gray-400" datetime="${post.published_time}">
                    ${formatDate(post.published_time)}
                </time>
                <a href="post.html?slug=${post.slug}" class="text-blue-400 hover:text-blue-300 font-medium">
                    Read more →
                </a>
            </div>
        </div>
    `;
    
    return article;
}

// Helper functions
function findFirstImage(content) {
    // Create a temporary div to parse the HTML content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    
    // Find the first img tag
    const firstImg = tempDiv.querySelector('img');
    
    if (firstImg && firstImg.src) {
        // If the image has a relative path, convert it to absolute
        let imageUrl = firstImg.src;
        
        // Handle relative paths (starting with ../Gallery/)
        if (imageUrl.startsWith('../Gallery/')) {
            imageUrl = 'https://trifecta.systems/Gallery/' + imageUrl.replace('../Gallery/', '');
        }
        // Handle relative paths (starting with Gallery/)
        else if (imageUrl.startsWith('Gallery/')) {
            imageUrl = 'https://trifecta.systems/Gallery/' + imageUrl.replace('Gallery/', '');
        }
        // If it's already an absolute URL, use it as is
        else if (imageUrl.startsWith('http')) {
            // Use as is
        }
        // Fallback to default logo if no valid image found
        else {
            imageUrl = 'https://trifecta.systems/Gallery/Trifecta_Logo.png';
        }
        
        return imageUrl;
    }
    
    // Fallback to default logo if no image found
    return 'https://trifecta.systems/Gallery/Trifecta_Logo.png';
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

function updateMetaTag(id, content) {
    const element = document.getElementById(id);
    if (element) element.content = content;
}

function updateElement(id, content) {
    const element = document.getElementById(id);
    if (element) element.textContent = content;
}

function showElement(id) {
    const element = document.getElementById(id);
    if (element) element.classList.remove('hidden');
}

function hideElement(id) {
    const element = document.getElementById(id);
    if (element) element.classList.add('hidden');
}

function showError(message) {
    hideElement('loading');
    showElement('error');
    const errorElement = document.querySelector('#error p:first-child');
    if (errorElement) errorElement.textContent = message;
}
