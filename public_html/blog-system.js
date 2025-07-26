// Blog System for Trifecta.Systems
// This system provides templating functionality for blog posts

class BlogSystem {
    constructor() {
        this.blogPosts = [];
        this.currentPost = null;
        this.init();
    }

    async init() {
        await this.loadBlogPosts();
        this.setupEventListeners();
        this.renderCurrentPost();
    }

    async loadBlogPosts() {
        // Blog posts data - this could be loaded from a JSON file or API
        this.blogPosts = [
            {
                slug: 'cybersecurity-best-practices-2025',
                title: 'Essential Cybersecurity Practices for Small Businesses in 2025',
                description: 'As cyber threats continue to evolve, small businesses need to stay ahead of the curve. Here are the essential cybersecurity practices that every small business should implement in 2025.',
                excerpt: 'As cyber threats continue to evolve, small businesses need to stay ahead of the curve. Here are the essential cybersecurity practices that every small business should implement in 2025...',
                category: 'Cybersecurity',
                category_color: 'red',
                date: 'Jul 25, 2025',
                read_time: 5,
                published_time: '2025-07-25T00:00:00Z',
                content: `
                    <p>As cyber threats continue to evolve, small businesses need to stay ahead of the curve. Here are the essential cybersecurity practices that every small business should implement in 2025.</p>
                    
                    <h2 class="text-2xl font-bold text-white">1. Multi-Factor Authentication (MFA)</h2>
                    <p>Implement MFA across all business accounts and systems. This simple step can prevent the majority of account compromise attacks.</p>
                    
                    <h2 class="text-2xl font-bold text-white">2. Regular Security Updates</h2>
                    <p>Keep all software, operating systems, and applications updated with the latest security patches.</p>
                    
                    <h2 class="text-2xl font-bold text-white">3. Employee Security Training</h2>
                    <p>Regular training on phishing awareness, password security, and safe browsing practices is crucial.</p>
                    
                    <h2 class="text-2xl font-bold text-white">4. Data Backup Strategy</h2>
                    <p>Implement a 3-2-1 backup strategy: 3 copies, 2 different media types, 1 off-site location.</p>
                    
                    <h2 class="text-2xl font-bold text-white">5. Network Security</h2>
                    <p>Use firewalls, secure Wi-Fi networks, and consider VPN solutions for remote work.</p>
                `
            },
            {
                slug: 'privacy-law-compliance-small-businesses',
                title: 'Navigating the Labyrinth: Privacy Law Compliance for Small Web Businesses',
                description: 'Learn how small web development businesses can navigate the complex landscape of privacy laws including GDPR, CCPA, and state-specific regulations while maintaining compliance and building trust.',
                excerpt: 'In today\'s digital landscape, every website is a potential data collector. Learn how small web development businesses can navigate the complex landscape of privacy laws including GDPR, CCPA, and state-specific regulations...',
                category: 'Cybersecurity',
                category_color: 'red',
                date: 'Jul 18, 2025',
                read_time: 12,
                published_time: '2025-07-18T00:00:00Z',
                content: `
                    <p>In today's digital landscape, every website is a potential data collector. From analytics tracking to contact forms and e-commerce transactions, personal information is constantly being exchanged. For small web development businesses and the clients they serve, ensuring compliance with global and regional privacy laws isn't just good practice – it's an absolute necessity.</p>
                    
                    <p>But as the privacy landscape evolves at a breakneck pace, staying compliant feels less like a checklist and more like navigating a constantly shifting labyrinth.</p>

                    <h2 class="text-2xl font-bold text-white">The Ever-Expanding Web of Privacy Laws</h2>
                    
                    <p>You're probably familiar with the big players:</p>

                    <div class="bg-slate-700 rounded-lg p-6 my-6">
                        <h3 class="text-lg font-semibold text-white mb-3">GDPR (General Data Protection Regulation)</h3>
                        <p class="mb-3">The gold standard of privacy laws, originating from the European Union. If you have any users, customers, or even website visitors from the EU/EEA, GDPR's strict "opt-in" consent requirements, robust data subject rights (like the "right to be forgotten"), and hefty penalties apply to you, regardless of where your business is located.</p>
                        
                        <h3 class="text-lg font-semibold text-white mb-3">CCPA/CPRA (California Consumer Privacy Act / California Privacy Rights Act)</h3>
                        <p>California's comprehensive privacy law, setting a precedent for U.S. states. It grants California consumers extensive rights over their data, including the right to know, delete, and opt-out of the "sale" or "sharing" of their personal information. Unlike GDPR, it often operates on an "opt-out" model, but still demands significant transparency.</p>
                    </div>

                    <p>But these are just the tip of the iceberg. The reality is far more complex:</p>

                    <ul class="list-disc list-inside ml-6 space-y-2">
                        <li>The ePrivacy Directive ("Cookie Law") in the EU mandates consent for most cookies and tracking technologies.</li>
                        <li>Major countries like Brazil (LGPD), China (PIPL), and Canada (PIPEDA) have their own robust privacy frameworks, many mirroring GDPR's core principles.</li>
                        <li>And then, the United States. Without a single federal privacy law, a dizzying array of state-specific laws have emerged.</li>
                    </ul>

                    <p>Beyond California, states like Virginia (VCDPA), Colorado (CPA), Utah (UCPA), Connecticut (CTDPA), and Oregon (OCPA) have enacted their own unique regulations, each with different applicability thresholds, definitions, and compliance requirements. And more states are following suit every year!</p>

                    <h2 class="text-2xl font-bold text-white">Why It's a Challenge for Small Web Businesses</h2>
                    
                    <p>For a small web development agency or a solo freelancer, keeping up with this patchwork of legislation is a monumental task:</p>

                    <div class="grid md:grid-cols-2 gap-6 my-6">
                        <div class="bg-slate-700 rounded-lg p-4">
                            <h3 class="text-lg font-semibold text-white mb-2">Lack of Legal Expertise</h3>
                            <p class="text-sm">Most web developers are experts in code, not international privacy law. Hiring dedicated legal counsel for every project can be prohibitively expensive for small businesses and their clients.</p>
                        </div>
                        
                        <div class="bg-slate-700 rounded-lg p-4">
                            <h3 class="text-lg font-semibold text-white mb-2">Varying Definitions & Thresholds</h3>
                            <p class="text-sm">What constitutes "personal data" or "selling" data can differ between laws. Each law has different criteria for which businesses must comply.</p>
                        </div>
                        
                        <div class="bg-slate-700 rounded-lg p-4">
                            <h3 class="text-lg font-semibold text-white mb-2">Dynamic Landscape</h3>
                            <p class="text-sm">Privacy laws are constantly being updated, amended, or new ones are introduced. What was compliant last year might not be today.</p>
                        </div>
                        
                        <div class="bg-slate-700 rounded-lg p-4">
                            <h3 class="text-lg font-semibold text-white mb-2">Implementation Complexity</h3>
                            <p class="text-sm">Translating legal requirements into functional website features (cookie consent banners, privacy policies, data subject request forms, data mapping) can be technically intricate.</p>
                        </div>
                    </div>

                    <p><strong>Cost vs. Risk:</strong> Small businesses often operate on tight budgets. The perceived upfront cost of comprehensive compliance tools or legal advice can seem daunting, yet the penalties for non-compliance (tens of thousands to millions of dollars, plus reputational damage) are far more severe.</p>

                    <h2 class="text-2xl font-bold text-white">Navigating the Maze: Tools and Strategies for Web Developers</h2>
                    
                    <p>Despite the challenges, a proactive approach is essential. Here are tools and strategies that can help web developers and their clients navigate the privacy compliance landscape:</p>

                    <h3 class="text-xl font-semibold text-white">Comprehensive Privacy Policies & Terms of Service</h3>
                    
                    <p><strong>Generators:</strong> Tools like Termly, PrivacyPolicies.com, and CookieYes's Free Privacy Policy Generator can help create customized, legally sound documents by guiding you through questionnaires tailored to your data practices and target regions. While not a substitute for legal advice, they provide a strong starting point.</p>
                    
                    <p><strong>Placement:</strong> As a best practice, these links should be prominently displayed in the footer of every page on the website, making them easily accessible to users at all times.</p>

                    <h3 class="text-xl font-semibold text-white">Consent Management Platforms (CMPs)</h3>
                    
                    <p>These are crucial for handling cookie consent and user preferences, especially under GDPR and the ePrivacy Directive.</p>

                    <p><strong>Features to look for:</strong> Automated cookie scanning and categorization, geo-targeting to display relevant banners, multilingual support, customizable banner designs, consent logging for audit trails, and integration with common CMS platforms (WordPress, Shopify).</p>

                    <div class="bg-slate-700 rounded-lg p-6 my-6">
                        <h4 class="text-lg font-semibold text-white mb-3">Popular CMPs (many with free tiers for small sites):</h4>
                        <ul class="list-disc list-inside space-y-1">
                            <li>CookieYes</li>
                            <li>Osano</li>
                            <li>Cookiebot by Usercentrics</li>
                            <li>Termly</li>
                            <li>Seers.AI</li>
                            <li>Iubenda</li>
                        </ul>
                        <p class="mt-3 text-sm">Many CMPs now also support Google Consent Mode, which helps balance user privacy with analytics data collection.</p>
                    </div>

                    <h3 class="text-xl font-semibold text-white">Data Subject Request (DSR) Management</h3>
                    
                    <p>GDPR and many US state laws grant users rights to access, delete, or correct their personal data.</p>
                    
                    <p><strong>Tools:</strong> Some CMPs (like Osano, OneTrust, DataGrail) offer DSR management features, providing secure portals for users to submit requests and automated workflows to fulfill them. This streamlines a potentially complex and time-consuming process.</p>

                    <h3 class="text-xl font-semibold text-white">Website Scanning & Auditing Tools</h3>
                    
                    <p>Regularly scan your website to identify all cookies, trackers, and scripts that collect data. Many CMPs include this functionality.</p>
                    
                    <p><strong>Manual Checks:</strong> Use your browser's developer tools to inspect network requests and cookies to ensure you understand all third-party scripts loaded on a page.</p>

                    <h3 class="text-xl font-semibold text-white">AI as an Ally in Compliance</h3>
                    
                    <div class="bg-slate-700 rounded-lg p-6 my-6">
                        <h4 class="text-lg font-semibold text-white mb-3">AI-Powered Data Discovery</h4>
                        <p class="mb-3">Advanced AI tools (e.g., Securiti.ai, Private AI, Varonis) can scan vast datasets, both structured and unstructured, to automatically identify, classify, and map personal information. This is invaluable for understanding your data footprint.</p>
                        
                        <h4 class="text-lg font-semibold text-white mb-3">Automated Policy Updates</h4>
                        <p class="mb-3">Some AI-driven platforms can automatically update privacy policies based on changes in legislation, reducing the manual burden of staying current.</p>
                        
                        <h4 class="text-lg font-semibold text-white mb-3">Risk Assessment and Monitoring</h4>
                        <p class="mb-3">AI can analyze data flows, identify potential privacy risks, and flag compliance gaps in real-time, helping businesses proactively address vulnerabilities.</p>
                        
                        <h4 class="text-lg font-semibold text-white mb-3">Smart Compliance Workflows</h4>
                        <p class="mb-3">AI can automate responses to DSRs, streamline vendor risk assessments, and manage consent across multiple channels, making privacy operations more efficient.</p>
                        
                        <h4 class="text-lg font-semibold text-white">Code Assistance</h4>
                        <p>As you've experienced with Cursor, AI code assistants can help implement the technical aspects of compliance, such as adding meta tags, structured data, or setting up service workers, by generating and modifying code directly.</p>
                    </div>

                    <h2 class="text-2xl font-bold text-white">The Path Forward</h2>
                    
                    <p>For small web development businesses, achieving privacy compliance isn't about becoming a legal expert, but about adopting smart tools and processes. It's about:</p>

                    <div class="grid md:grid-cols-2 gap-4 my-6">
                        <div class="bg-slate-700 rounded-lg p-4">
                            <h4 class="text-lg font-semibold text-white mb-2">Transparency</h4>
                            <p class="text-sm">Clearly communicate your data practices to users.</p>
                        </div>
                        
                        <div class="bg-slate-700 rounded-lg p-4">
                            <h4 class="text-lg font-semibold text-white mb-2">Choice</h4>
                            <p class="text-sm">Empower users to control their data and consent preferences.</p>
                        </div>
                        
                        <div class="bg-slate-700 rounded-lg p-4">
                            <h4 class="text-lg font-semibold text-white mb-2">Security</h4>
                            <p class="text-sm">Protect the data you collect.</p>
                        </div>
                        
                        <div class="bg-slate-700 rounded-lg p-4">
                            <h4 class="text-lg font-semibold text-white mb-2">Diligence</h4>
                            <p class="text-sm">Regularly review and update your practices as laws evolve.</p>
                        </div>
                    </div>

                    <p>By leveraging purpose-built compliance platforms, AI-powered solutions, and maintaining a commitment to user privacy, small web developers can confidently build compliant, trustworthy, and successful websites in today's intricate legal environment. Compliance isn't just a cost; it's an investment in your clients' and your own brand reputation, fostering trust in a privacy-conscious world.</p>
                `
            },
            {
                slug: 'modern-web-development-trends',
                title: 'Modern Web Development Trends That Matter in 2025',
                description: 'Stay ahead of the curve with the latest web development technologies and trends that are shaping the industry in 2025.',
                excerpt: 'The web development landscape is constantly evolving. Here are the key trends and technologies that are shaping the industry in 2025...',
                category: 'Web Dev',
                category_color: 'green',
                date: 'Jul 11, 2025',
                read_time: 8,
                published_time: '2025-07-11T00:00:00Z',
                content: `
                    <p>The web development landscape is constantly evolving. Here are the key trends and technologies that are shaping the industry in 2025.</p>
                    
                    <h2 class="text-2xl font-bold text-white">1. AI-Powered Development Tools</h2>
                    <p>AI is revolutionizing how we write and debug code, with tools like GitHub Copilot and Cursor becoming essential for developers.</p>
                    
                    <h2 class="text-2xl font-bold text-white">2. Web Components and Micro-Frontends</h2>
                    <p>Component-based architecture is becoming the standard for scalable web applications.</p>
                    
                    <h2 class="text-2xl font-bold text-white">3. Performance-First Development</h2>
                    <p>Core Web Vitals and user experience metrics are driving development decisions more than ever.</p>
                `
            },
            {
                slug: 'data-driven-decision-making',
                title: 'Data-Driven Decision Making: A Guide for Non-Technical Leaders',
                description: 'Learn how to leverage data analytics to make informed business decisions, even if you\'re not a technical expert.',
                excerpt: 'Data-driven decision making isn\'t just for tech companies anymore. Here\'s how non-technical leaders can leverage data to improve their business...',
                category: 'Data Analytics',
                category_color: 'blue',
                date: 'Jul 4, 2025',
                read_time: 10,
                published_time: '2025-07-04T00:00:00Z',
                content: `
                    <p>Data-driven decision making isn't just for tech companies anymore. Here's how non-technical leaders can leverage data to improve their business.</p>
                    
                    <h2 class="text-2xl font-bold text-white">Understanding Your Data</h2>
                    <p>Start by identifying what data you already have and what questions you need answered.</p>
                    
                    <h2 class="text-2xl font-bold text-white">Key Metrics for Small Businesses</h2>
                    <p>Focus on actionable metrics that directly impact your business goals.</p>
                    
                    <h2 class="text-2xl font-bold text-white">Tools and Platforms</h2>
                    <p>User-friendly analytics tools that don't require technical expertise.</p>
                `
            },
            {
                slug: 'tech-predictions-2025',
                title: 'Technology Predictions for 2025: What Small Businesses Should Watch',
                description: 'Stay ahead of the curve with our predictions for the most impactful technology trends that will affect small businesses in 2025.',
                excerpt: 'The technology landscape is evolving rapidly. Here are the key trends that small businesses should be aware of in 2025...',
                category: 'Tech Trends',
                category_color: 'purple',
                date: 'Jun 27, 2025',
                read_time: 6,
                published_time: '2025-06-27T00:00:00Z',
                content: `
                    <p>The technology landscape is evolving rapidly. Here are the key trends that small businesses should be aware of in 2025.</p>
                    
                    <h2 class="text-2xl font-bold text-white">AI Integration Acceleration</h2>
                    <p>AI tools will become more accessible and affordable for small businesses.</p>
                    
                    <h2 class="text-2xl font-bold text-white">Enhanced Cybersecurity Threats</h2>
                    <p>Small businesses will face increasingly sophisticated cyber attacks.</p>
                    
                    <h2 class="text-2xl font-bold text-white">Sustainability in Tech</h2>
                    <p>Green computing and sustainable technology practices will gain importance.</p>
                `
            },
            {
                slug: 'phishing-attacks-prevention',
                title: 'The Evolution of Phishing Attacks: How to Protect Your Business',
                description: 'Phishing attacks are becoming more sophisticated. Learn about the latest tactics and how to protect your business from these threats.',
                excerpt: 'Phishing attacks have evolved far beyond the obvious spam emails of the past. Here\'s what you need to know to protect your business...',
                category: 'Cybersecurity',
                category_color: 'red',
                date: 'Jun 20, 2025',
                read_time: 7,
                published_time: '2025-06-20T00:00:00Z',
                content: `
                    <p>Phishing attacks have evolved far beyond the obvious spam emails of the past. Here's what you need to know to protect your business.</p>
                    
                    <h2 class="text-2xl font-bold text-white">Modern Phishing Techniques</h2>
                    <p>Attackers are using AI and social engineering to create highly convincing attacks.</p>
                    
                    <h2 class="text-2xl font-bold text-white">Multi-Channel Attacks</h2>
                    <p>Phishing now happens across email, SMS, social media, and even phone calls.</p>
                    
                    <h2 class="text-2xl font-bold text-white">Prevention Strategies</h2>
                    <p>Implementing layered security measures and employee training is crucial.</p>
                `
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

    navigateToPost(slug) {
        const post = this.blogPosts.find(p => p.slug === slug);
        if (post) {
            this.currentPost = post;
            this.renderPost(slug);
            
            // Update URL without page reload
            const url = `blog-posts/${slug}.html`;
            window.history.pushState({ slug }, post.title, url);
            
            // Update page title
            document.title = `${post.title} | Trifecta.Systems Blog`;
        }
    }

    renderPost(slug) {
        const post = this.blogPosts.find(p => p.slug === slug);
        if (!post) return;

        this.currentPost = post;
        
        // Update meta tags
        this.updateMetaTags(post);
        
        // Update content
        this.updateContent(post);
        
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

    updateContent(post) {
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

        // Update main content
        const contentDiv = document.getElementById('blog-content');
        if (contentDiv) {
            contentDiv.innerHTML = post.content;
        }
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

    renderCurrentPost() {
        // Check if we're on a blog post page
        const path = window.location.pathname;
        const blogPostMatch = path.match(/blog-posts\/([^\/]+)\.html$/);
        
        if (blogPostMatch) {
            const slug = blogPostMatch[1];
            this.renderPost(slug);
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
}

// Initialize the blog system when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.blogSystem = new BlogSystem();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlogSystem;
} 