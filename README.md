# Trifecta.Systems Website

A modern, responsive business website showcasing technology services for small businesses and nonprofits. Built with performance, accessibility, and SEO best practices in mind.

## 🚀 Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Progressive Web App**: Service worker for offline functionality and caching
- **SEO Optimized**: Structured data, meta tags, and semantic HTML
- **Performance**: Lazy loading, image optimization, and deferred scripts
- **Security**: Content Security Policy and security headers
- **Accessibility**: WCAG 2.1 AA compliant with proper ARIA labels
- **Modern Standards**: HTML5, CSS3, ES6+, and modern web APIs

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3 (Tailwind CSS), JavaScript (ES6+)
- **Backend**: PHP (contact form processing)
- **Security**: Google reCAPTCHA v3
- **Performance**: Service Worker, lazy loading, compression
- **SEO**: Schema.org structured data, Open Graph, Twitter Cards
- **Hosting**: Apache with .htaccess configuration

## 📁 Project Structure

```
Trifecta/
├── public_html/                 # Main website files
│   ├── index.html              # Homepage
│   ├── web-development.html    # Web development services
│   ├── data-analytics.html     # Data analytics services
│   ├── cybersecurity.html      # Cybersecurity services
│   ├── ai-custom-solutions.html # AI and custom solutions
│   ├── about-the-owner.html    # About the owner page
│   ├── offline.html            # Offline page for PWA
│   ├── style.css               # Custom CSS styles
│   ├── script.js               # JavaScript functionality
│   ├── sw.js                   # Service worker
│   ├── robots.txt              # Search engine directives
│   ├── sitemap.xml             # XML sitemap
│   ├── .htaccess               # Apache configuration
│   └── Gallery/                # Image assets
│       ├── favicon/            # Favicon files
│       └── *.png/jpg/webp      # Website images
├── backend/                    # Server-side scripts
│   ├── submit_form.php         # Contact form handler
│   ├── csrf_token.php          # CSRF token management
│   └── get_recaptcha_key.php   # reCAPTCHA key provider
├── config/                     # Configuration files (gitignored)
│   └── secrets.php             # API keys and sensitive data
└── README.md                   # This file
```

## 🚀 Getting Started

### Prerequisites

- Web server with PHP support (Apache/Nginx)
- SSL certificate (HTTPS required for PWA features)
- Git for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/KellieWilliams/trifecta-systems-website.git
   cd trifecta-systems-website
   ```

2. **Configure environment**
   - Create `config/secrets.php` with your API keys:
   ```php
   <?php
   define('RECAPTCHA_SECRET_KEY', 'your_recaptcha_secret_key');
   define('TO_EMAIL', 'your_email@domain.com');
   define('FROM_EMAIL', 'noreply@yourdomain.com');
   ?>
   ```

3. **Upload to web server**
   - Upload `public_html/` contents to your web root
   - Upload `backend/` directory to a secure location outside web root
   - Ensure `config/` directory is outside web root for security

4. **Verify setup**
   - Visit your domain to confirm the site loads
   - Test the contact form functionality
   - Check browser console for service worker registration

## 🔧 Configuration

### Environment Variables

The following variables need to be configured in `config/secrets.php`:

**Important**: The `backend/` directory should be placed outside the web root for security. Update the fetch URLs in `script.js` if your backend is located elsewhere.

- `RECAPTCHA_SECRET_KEY`: Google reCAPTCHA v3 secret key
- `TO_EMAIL`: Email address to receive contact form submissions
- `FROM_EMAIL`: Email address for sending notifications

### Apache Configuration

The `.htaccess` file includes:
- Security headers (CSP, X-Frame-Options, etc.)
- HTTPS redirect
- Gzip compression
- Browser caching rules

### Service Worker

The service worker (`sw.js`) provides:
- Offline functionality
- Static asset caching
- Network-first strategy for dynamic content

## 📊 Performance Features

### Optimizations Implemented

- **Image Optimization**: Lazy loading for below-fold images
- **Script Loading**: Deferred non-critical JavaScript
- **Resource Preloading**: Critical images and fonts
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
- **Security Headers**: X-Frame-Options, X-Content-Type-Options, etc.
- **Form Validation**: Client and server-side validation
- **reCAPTCHA v3**: Bot protection for contact forms
- **Input Sanitization**: PHP security best practices

## 🎯 SEO Features

### Search Engine Optimization

- **Structured Data**: Schema.org markup for all pages
- **Meta Tags**: Comprehensive meta descriptions and titles
- **Open Graph**: Social media sharing optimization
- **Twitter Cards**: Twitter-specific meta tags
- **XML Sitemap**: Automated sitemap generation
- **Robots.txt**: Search engine crawling directives

### Local SEO

- **Business Schema**: Organization and service markup
- **Contact Information**: Structured contact data
- **Service Areas**: Geographic service coverage

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
- [ ] Contact form functionality
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

## 🚀 Deployment

### Production Checklist

- [ ] SSL certificate installed
- [ ] Environment variables configured
- [ ] Error logging enabled
- [ ] Backup strategy implemented
- [ ] Monitoring tools configured
- [ ] Analytics tracking setup

### Recommended Hosting

- **Shared Hosting**: Namecheap, SiteGround
- **VPS**: DigitalOcean, Linode
- **Cloud**: AWS, Google Cloud Platform

## 📈 Analytics & Monitoring

### Recommended Tools

- **Google Analytics 4**: Website traffic and user behavior
- **Google Search Console**: Search performance monitoring
- **Lighthouse CI**: Automated performance testing
- **Uptime Monitoring**: Pingdom, UptimeRobot

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
- **GitHub**: [KellieWilliams](https://github.com/KellieWilliams)

---

**Built with ❤️ by Trifecta.Systems**  
*Empowering small businesses and nonprofits with cutting-edge technology solutions.*
