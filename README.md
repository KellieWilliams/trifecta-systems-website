# Trifecta.Systems Website

A modern, responsive business website showcasing technology services for small businesses and nonprofits. Built with performance, accessibility, SEO, and privacy compliance best practices in mind.

## 🚀 Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Progressive Web App**: Service worker for offline functionality and caching
- **Blog Management System**: Full admin portal for content management
- **SEO Optimized**: Structured data, meta tags, and semantic HTML
- **Performance**: Lazy loading, image optimization, and deferred scripts
- **Security**: Content Security Policy, security headers, and form protection
- **Privacy Compliance**: GDPR/CCPA compliant with cookie consent and data rights
- **Accessibility**: WCAG 2.1 AA compliant with proper ARIA labels
- **Modern Standards**: HTML5, CSS3, ES6+, and modern web APIs

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3 (Tailwind CSS), JavaScript (ES6+)
- **Backend**: PHP (contact form, data rights processing, blog management)
- **Blog System**: Markdown parsing with Parsedown library
- **Security**: Google reCAPTCHA v3, CSRF protection, honeypot fields
- **Performance**: Service Worker, lazy loading, compression, WebP images
- **SEO**: Schema.org structured data, Open Graph, Twitter Cards
- **Privacy**: Cookie consent management, data rights request system
- **Hosting**: Apache with .htaccess configuration

## 📁 Project Structure

```
Project/
├── public_html/                 # Main website files
│   ├── index.html               # Homepage
│   ├── web-development.html     # Web development services
│   ├── data-analytics.html      # Data analytics services
│   ├── cybersecurity.html       # Cybersecurity services
│   ├── ai-custom-solutions.html # AI and custom solutions
│   ├── about-the-owner.html     # About the owner page
│   ├── privacy-policy.html      # Privacy policy page
│   ├── terms-of-service.html    # Terms of service page
│   ├── data-rights-request.html # Data rights request form
│   ├── offline.html             # Offline page for PWA
│   ├── style.css                # Custom CSS styles
│   ├── script.js                # JavaScript functionality
│   ├── sw.js                    # Service worker
│   ├── robots.txt               # Search engine directives
│   ├── sitemap.xml              # XML sitemap
│   ├── .htaccess                # Apache configuration
│   ├── Gallery/                 # Image assets
│   │   ├── Blog-images/         # Images for blog posts
│   │   ├── favicon/             # Favicon files
│   │   └── *.png/jpg/webp       # Website images
│   └── blog/                    # Blog system
│       ├── index.html           # Blog listing page
│       ├── post.html            # Individual post template
│       ├── Blog-posts/          # Markdown blog posts
│       ├── admin/               # Blog admin portal
│       │   ├── login.html       # Admin login
│       │   ├── dashboard.html   # Admin dashboard
│       │   ├── create-post.html # Create new post
│       │   └── edit-post.html   # Edit existing post
│       └── *-proxy.php          # Secure API proxies
├── backend_files/               # Server-side scripts (outside web root)
├── config_files/                # Configuration files (gitignored)
├── vendor_files/                # Composer dependencies
│   └── erusev/parsedown/        # Markdown parsing library
├── SECURITY.md                  # Security documentation
└── README.md                    # This file
```

## 🚀 Getting Started

### Prerequisites

- Web server with PHP support (Apache/Nginx)
- SSL certificate (HTTPS required for PWA features)
- Git for version control
- Composer for PHP dependencies

### Production Deployment

**Security Features**: The system includes comprehensive security measures including CORS protection, file access control, and security headers.

**Architecture**: Secure proxy architecture ensures backend APIs are protected while maintaining functionality.

### Apache Configuration

The `.htaccess` file includes:
- Security headers (CSP, X-Frame-Options, etc.)
- HTTPS redirect
- Gzip compression
- Browser caching rules
- File access restrictions
- Blog proxy file allowances

### Service Worker

The service worker (`sw.js`) provides:
- Offline functionality
- Static asset caching
- Network-first strategy for dynamic content

## 📝 Blog Management System

### Features
- **Markdown Support**: Write posts in Markdown format
- **Admin Portal**: Secure login and dashboard
- **Post Management**: Create, edit, delete, and schedule posts
- **Image Upload**: Support for blog post images
- **Scheduling**: Schedule posts for future publication
- **SEO Integration**: Automatic meta tag generation

### Admin Access
- Secure authentication system
- CSRF protection on all forms
- Session management with expiration
- Role-based access control

## 📊 Performance Features

### Optimizations Implemented

- **Image Optimization**: WebP format with PNG fallbacks, lazy loading
- **Script Loading**: Deferred non-critical JavaScript
- **Resource Preloading**: Critical images and fonts with `fetchpriority`
- **Caching**: Service worker with intelligent cache strategies
- **Compression**: Gzip compression for text assets
- **Minification**: Tailwind CSS CDN for optimized styles

### Performance Metrics

- **Lighthouse Score**: 90+ across all categories
- **Core Web Vitals**: Optimized for LCP, FID, and CLS
- **Mobile Performance**: Responsive design with touch-friendly interactions

## 🔒 Security Features

### Implemented Security Measures

- **Content Security Policy**: Restricts resource loading
- **HTTPS Enforcement**: Automatic redirect from HTTP
- **Security Headers**: Comprehensive security header implementation
- **Form Protection**: reCAPTCHA v3, honeypot fields, CSRF tokens
- **Input Validation**: Client and server-side validation with XSS protection
- **Rate Limiting**: IP-based rate limiting for forms
- **Security Monitoring**: Logging and alerting for suspicious activity
- **File Access Control**: Blocked dangerous file types and sensitive files
- **CORS Protection**: Domain-restricted API access
- **Admin Security**: Secure authentication and session management

## 🎯 SEO Features

### Search Engine Optimization

- **Structured Data**: Schema.org markup for all pages (Organization, Service, Person, OfferCatalog)
- **Meta Tags**: Comprehensive meta descriptions and titles
- **Open Graph**: Social media sharing optimization
- **Twitter Cards**: Twitter-specific meta tags
- **XML Sitemap**: Automated sitemap generation
- **Robots.txt**: Search engine crawling directives
- **Blog SEO**: Automatic meta tags for blog posts

### Local SEO

- **Business Schema**: Organization and service markup
- **Contact Information**: Structured contact data
- **Service Areas**: Geographic service coverage

## 🔐 Privacy & Compliance

### GDPR/CCPA Compliance

- **Cookie Consent**: Comprehensive cookie banner with categories
- **Privacy Policy**: Detailed privacy policy with legal basis
- **Data Rights**: Data Subject Rights (DSR) request form
- **Terms of Service**: Complete terms of service page
- **Email Obfuscation**: Bot-protected email addresses
- **Children's Privacy**: Age 18+ protection (GDPR requirement)

### Cookie Management

- **Essential Cookies**: Required for site functionality
- **Functional Cookies**: Enhanced user experience
- **Analytics Cookies**: Optional tracking (user consent required)
- **Settings Modal**: Detailed cookie preferences

## ♿ Accessibility Features

### WCAG 2.1 AA Compliance

- **Semantic HTML**: Proper heading hierarchy and landmarks
- **ARIA Labels**: Screen reader support
- **Keyboard Navigation**: Full keyboard accessibility
- **Color Contrast**: AA compliant color ratios
- **Focus Management**: Visible focus indicators
- **Alt Text**: Descriptive image alt attributes

## 📱 Progressive Web App

### PWA Features

- **Service Worker**: Offline functionality and caching
- **Web App Manifest**: Installable app experience
- **Offline Page**: Custom offline experience
- **App Icons**: Multiple sizes for different devices
- **Theme Colors**: Consistent branding

## 🧪 Testing

### Manual Testing Checklist

- [ ] Responsive design on all devices
- [ ] Contact form functionality with validation
- [ ] Blog admin system (login, create/edit posts)
- [ ] Blog post display and navigation
- [ ] Cookie consent banner and settings
- [ ] Privacy policy and data rights forms
- [ ] Service worker registration
- [ ] Offline functionality
- [ ] Social media sharing
- [ ] Search engine indexing
- [ ] Accessibility compliance

### Automated Testing

- Lighthouse audits for performance
- Google PageSpeed Insights
- WAVE accessibility testing
- Schema.org validation
- Security header testing

## 🚀 Deployment

### Production Checklist

- [ ] SSL certificate installed
- [ ] Environment variables configured
- [ ] Backend directory moved outside web root
- [ ] CORS headers configured for production domain
- [ ] .htaccess properly configured for PHP proxies
- [ ] Error logging enabled
- [ ] Backup strategy implemented
- [ ] Monitoring tools configured
- [ ] Analytics tracking setup
- [ ] Privacy compliance verified

### Recommended Hosting

- **Shared Hosting**: Namecheap, SiteGround
- **VPS**: DigitalOcean, Linode
- **Cloud**: AWS, Google Cloud Platform

### Deployment Notes

The system is designed with security best practices and can be deployed on any hosting provider that supports PHP and Apache/Nginx.

## 📈 Analytics & Monitoring

### Recommended Tools

- **Google Analytics 4**: Website traffic and user behavior
- **Google Search Console**: Search performance monitoring
- **Lighthouse CI**: Automated performance testing
- **Uptime Monitoring**: Pingdom, UptimeRobot
- **Security Monitoring**: Built-in security dashboard

## 🤝 Contributing

This is a business website, so direct contributions are not typically sought. However, if you find issues or have suggestions:

1. Open an issue on GitHub
2. Provide detailed description of the problem
3. Include browser/device information
4. Suggest potential solutions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For technical support or business inquiries:
- **Website**: [trifecta.systems](https://trifecta.systems)
- **Contact**: Use the contact form on the website

---

**Built with ❤️ by Trifecta.Systems**  
*Empowering small businesses and nonprofits with cutting-edge technology solutions.*
