// Blog System for Trifecta.Systems
// This system provides templating functionality for blog posts using Markdown files

class BlogSystem {
    constructor() {
        this.blogPosts = [];
        this.currentPost = null;
        this.markdownParser = null;
        this.init();
    }

    async init() {
        await this.loadMarkdownParser();
        await this.loadBlogPosts();
        this.setupEventListeners();
        this.renderCurrentPost();
    }

    async loadMarkdownParser() {
        // Load marked.js for Markdown parsing
        if (typeof marked === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
            script.onload = () => {
                this.markdownParser = marked;
                // Configure marked options
                this.markdownParser.setOptions({
                    breaks: true,
                    gfm: true
                });
            };
            document.head.appendChild(script);
        } else {
            this.markdownParser = marked;
            this.markdownParser.setOptions({
                breaks: true,
                gfm: true
            });
        }
    }

    async loadBlogPosts() {
        // Blog posts data with Markdown file references
        this.blogPosts = [
            {
                slug: 'cybersecurity-best-practices-2025',
                markdownFile: 'blog-posts/cybersecurity-best-practices-2025.md',
                title: 'Essential Cybersecurity Practices for Small Businesses in 2025',
                description: 'As cyber threats continue to evolve, small businesses need to stay ahead of the curve. Here are the essential cybersecurity practices that every small business should implement in 2025.',
                excerpt: 'As cyber threats continue to evolve, small businesses need to stay ahead of the curve. Here are the essential cybersecurity practices that every small business should implement in 2025.',
                category: 'Cybersecurity',
                category_color: 'red',
                date: 'Jul 25, 2025',
                read_time: 5,
                published_time: '2025-07-25T00:00:00Z'
            },
            {
                slug: 'privacy-law-compliance-small-businesses',
                markdownFile: 'blog-posts/privacy-law-compliance-small-businesses.md',
                title: 'Navigating the Labyrinth: Privacy Law Compliance for Small Web Businesses',
                description: 'Learn how small web development businesses can navigate the complex landscape of privacy laws including GDPR, CCPA, and state-specific regulations while maintaining compliance and building trust.',
                excerpt: 'In today\'s digital landscape, every website is a potential data collector. Learn how small web development businesses can navigate the complex landscape of privacy laws including GDPR, CCPA, and state-specific regulations.',
                category: 'Cybersecurity',
                category_color: 'red',
                date: 'Jul 18, 2025',
                read_time: 12,
                published_time: '2025-07-18T00:00:00Z'
            },
            {
                slug: 'modern-web-development-trends',
                markdownFile: 'blog-posts/modern-web-development-trends.md',
                title: 'Modern Web Development Trends That Matter in 2025',
                description: 'Stay ahead of the curve with the latest web development technologies and trends that are shaping the industry in 2025.',
                excerpt: 'The web development landscape is constantly evolving. Here are the key trends and technologies that are shaping the industry in 2025.',
                category: 'Web Dev',
                category_color: 'green',
                date: 'Jul 11, 2025',
                read_time: 8,
                published_time: '2025-07-11T00:00:00Z'
            },
            {
                slug: 'data-driven-decision-making',
                markdownFile: 'blog-posts/data-driven-decision-making.md',
                title: 'Data-Driven Decision Making: A Guide for Non-Technical Leaders',
                description: 'Learn how to leverage data analytics to make informed business decisions, even if you\'re not a technical expert.',
                excerpt: 'Data-driven decision making isn\'t just for tech companies anymore. Here\'s how non-technical leaders can leverage data to improve their business.',
                category: 'Data Analytics',
                category_color: 'blue',
                date: 'Jul 4, 2025',
                read_time: 10,
                published_time: '2025-07-04T00:00:00Z'
            },
            {
                slug: 'tech-predictions-2025',
                markdownFile: 'blog-posts/tech-predictions-2025.md',
                title: 'Technology Predictions for 2025: What Small Businesses Should Watch',
                description: 'Stay ahead of the curve with our predictions for the most impactful technology trends that will affect small businesses in 2025.',
                excerpt: 'The technology landscape is evolving rapidly. Here are the key trends that small businesses should be aware of in 2025.',
                category: 'Tech Trends',
                category_color: 'purple',
                date: 'Jun 27, 2025',
                read_time: 6,
                published_time: '2025-06-27T00:00:00Z'
            },
            {
                slug: 'phishing-attacks-prevention',
                markdownFile: 'blog-posts/phishing-attacks-prevention.md',
                title: 'The Evolution of Phishing Attacks: How to Protect Your Business',
                description: 'Phishing attacks are becoming more sophisticated. Learn about the latest tactics and how to protect your business from these threats.',
                excerpt: 'Phishing attacks have evolved far beyond the obvious spam emails of the past. Here\'s what you need to know to protect your business.',
                category: 'Cybersecurity',
                category_color: 'red',
                date: 'Jun 20, 2025',
                read_time: 7,
                published_time: '2025-06-20T00:00:00Z'
            }
        ];
    }

    setupEventListeners() {
        // Handle blog post navigation
        document.addEventListener('click', (e) => {
            if (e.target.matches('a[href*="blog-posts/"]')) {
                e.preventDefault();
                const href = e.target.getAttribute('href');
                const slug = href.split('/').pop().replace('.html', '');
                this.navigateToPost(slug);
            }
        });

        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.slug) {
                this.renderPost(e.state.slug);
            }
        });
    }

    async navigateToPost(slug) {
        const post = this.blogPosts.find(p => p.slug === slug);
        if (post) {
            this.currentPost = post;
            await this.renderPost(slug);
            
            // Update URL without page reload
            const url = `blog-posts/${slug}.html`;
            window.history.pushState({ slug }, post.title, url);
            
            // Update page title
            document.title = `${post.title} | Trifecta.Systems Blog`;
        }
    }

    async renderPost(slug) {
        const post = this.blogPosts.find(p => p.slug === slug);
        if (!post) return;

        this.currentPost = post;
        
        // Update meta tags
        this.updateMetaTags(post);
        
        // Update content
        await this.updateContent(post);
        
        // Update related posts
        this.updateRelatedPosts(post);
    }

    updateMetaTags(post) {
        // Update meta description
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute('content', post.description);
        }

        // Update Open Graph tags
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.setAttribute('content', post.title);

        const ogDescription = document.querySelector('meta[property="og:description"]');
        if (ogDescription) ogDescription.setAttribute('content', post.description);

        const ogUrl = document.querySelector('meta[property="og:url"]');
        if (ogUrl) ogUrl.setAttribute('content', `https://trifecta.systems/blog-posts/${post.slug}.html`);

        const ogPublishedTime = document.querySelector('meta[property="article:published_time"]');
        if (ogPublishedTime) ogPublishedTime.setAttribute('content', post.published_time);

        const ogSection = document.querySelector('meta[property="article:section"]');
        if (ogSection) ogSection.setAttribute('content', post.category);

        // Update Twitter tags
        const twitterTitle = document.querySelector('meta[property="twitter:title"]');
        if (twitterTitle) twitterTitle.setAttribute('content', post.title);

        const twitterDescription = document.querySelector('meta[property="twitter:description"]');
        if (twitterDescription) twitterDescription.setAttribute('content', post.description);

        const twitterUrl = document.querySelector('meta[property="twitter:url"]');
        if (twitterUrl) twitterUrl.setAttribute('content', `https://trifecta.systems/blog-posts/${post.slug}.html`);
    }

    async updateContent(post) {
        // Update breadcrumb
        const breadcrumbTitle = document.querySelector('nav ol li:last-child');
        if (breadcrumbTitle) {
            breadcrumbTitle.textContent = post.title;
        }

        // Update article header
        const categoryBadge = document.querySelector('article .bg-\\w+-600');
        if (categoryBadge) {
            categoryBadge.className = `bg-${post.category_color}-600 text-white text-sm px-3 py-1 rounded-full`;
            categoryBadge.textContent = post.category;
        }

        const dateSpan = document.querySelector('article .text-gray-400.text-sm.ml-4');
        if (dateSpan) {
            dateSpan.textContent = post.date;
        }

        const readTimeSpan = document.querySelector('article .text-gray-400.text-sm.ml-4:last-of-type');
        if (readTimeSpan) {
            readTimeSpan.textContent = `${post.read_time} min read`;
        }

        const title = document.querySelector('article h1');
        if (title) {
            title.textContent = post.title;
        }

        const excerpt = document.querySelector('article .text-xl.text-gray-300');
        if (excerpt) {
            excerpt.textContent = post.excerpt;
        }

        // Load and render Markdown content
        await this.loadMarkdownContent(post);
    }

    async loadMarkdownContent(post) {
        try {
            // Determine the correct path based on current page location
            const currentPath = window.location.pathname;
            const isInSubdirectory = currentPath.includes('/blog-posts/');
            const basePath = isInSubdirectory ? '../' : '';
            const markdownPath = basePath + post.markdownFile;

            const response = await fetch(markdownPath);
            if (!response.ok) {
                throw new Error(`Failed to load Markdown file: ${response.statusText}`);
            }

            const markdownText = await response.text();
            
            // Parse front matter and content
            const { frontMatter, content } = this.parseFrontMatter(markdownText);
            
            // Convert Markdown to HTML
            const htmlContent = this.markdownParser.parse(content);
            
            // Update the content div
            const contentDiv = document.getElementById('blog-content');
            if (contentDiv) {
                contentDiv.innerHTML = htmlContent;
            }

        } catch (error) {
            console.error('Error loading Markdown content:', error);
            const contentDiv = document.getElementById('blog-content');
            if (contentDiv) {
                contentDiv.innerHTML = '<p class="text-red-400">Error loading blog post content. Please try again later.</p>';
            }
        }
    }

    parseFrontMatter(markdownText) {
        const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
        const match = markdownText.match(frontMatterRegex);
        
        if (match) {
            const frontMatterText = match[1];
            const content = match[2];
            
            // Parse YAML front matter
            const frontMatter = {};
            frontMatterText.split('\n').forEach(line => {
                const colonIndex = line.indexOf(':');
                if (colonIndex > 0) {
                    const key = line.substring(0, colonIndex).trim();
                    let value = line.substring(colonIndex + 1).trim();
                    
                    // Remove quotes if present
                    if ((value.startsWith('"') && value.endsWith('"')) || 
                        (value.startsWith("'") && value.endsWith("'"))) {
                        value = value.slice(1, -1);
                    }
                    
                    frontMatter[key] = value;
                }
            });
            
            return { frontMatter, content };
        }
        
        // If no front matter, return the entire text as content
        return { frontMatter: {}, content: markdownText };
    }

    updateRelatedPosts(currentPost) {
        const relatedPostsContainer = document.getElementById('related-posts');
        if (!relatedPostsContainer) return;

        // Get related posts (same category, excluding current post)
        const relatedPosts = this.blogPosts
            .filter(post => post.category === currentPost.category && post.slug !== currentPost.slug)
            .slice(0, 3);

        // If not enough posts in same category, add posts from other categories
        if (relatedPosts.length < 3) {
            const otherPosts = this.blogPosts
                .filter(post => post.category !== currentPost.category && post.slug !== currentPost.slug)
                .slice(0, 3 - relatedPosts.length);
            relatedPosts.push(...otherPosts);
        }

        const relatedPostsHTML = relatedPosts.map(post => `
            <a href="blog-posts/${post.slug}.html" class="bg-slate-800 rounded-lg p-6 hover:bg-slate-700 transition-colors duration-200">
                <span class="bg-${post.category_color}-600 text-white text-xs px-2 py-1 rounded-full">${post.category}</span>
                <h4 class="text-lg font-semibold text-white mt-3 mb-2">${post.title}</h4>
                <p class="text-gray-400 text-sm">${post.excerpt}</p>
            </a>
        `).join('');

        relatedPostsContainer.innerHTML = relatedPostsHTML;
    }

    async renderCurrentPost() {
        // Check if we're on a blog post page
        const path = window.location.pathname;
        const blogPostMatch = path.match(/blog-posts\/([^\/]+)\.html$/);
        
        if (blogPostMatch) {
            const slug = blogPostMatch[1];
            await this.renderPost(slug);
        }
    }

    // Method to add new blog posts
    addBlogPost(postData) {
        this.blogPosts.push(postData);
        // Sort by date (newest first)
        this.blogPosts.sort((a, b) => new Date(b.published_time) - new Date(a.published_time));
    }

    // Method to get all blog posts (for the main blog page)
    getAllPosts() {
        return this.blogPosts;
    }

    // Method to get posts by category
    getPostsByCategory(category) {
        return this.blogPosts.filter(post => post.category === category);
    }

    // Method to create a new blog post from Markdown file
    async createPostFromMarkdown(markdownFile) {
        try {
            const response = await fetch(markdownFile);
            if (!response.ok) {
                throw new Error(`Failed to load Markdown file: ${response.statusText}`);
            }

            const markdownText = await response.text();
            const { frontMatter, content } = this.parseFrontMatter(markdownText);
            
            // Create post object from front matter
            const post = {
                slug: frontMatter.slug || markdownFile.replace('.md', '').split('/').pop(),
                markdownFile: markdownFile,
                title: frontMatter.title || 'Untitled',
                description: frontMatter.description || '',
                excerpt: frontMatter.excerpt || '',
                category: frontMatter.category || 'General',
                category_color: frontMatter.category_color || 'gray',
                date: frontMatter.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                read_time: parseInt(frontMatter.read_time) || 5,
                published_time: frontMatter.published_time || new Date().toISOString()
            };

            return post;
        } catch (error) {
            console.error('Error creating post from Markdown:', error);
            return null;
        }
    }
}

// Initialize the blog system when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.blogSystem = new BlogSystem();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlogSystem;
} 