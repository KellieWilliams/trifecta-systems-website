# Trifecta.Systems Website

A modern, responsive business website showcasing technology services for small businesses and nonprofits. Built with performance, accessibility, SEO, and privacy compliance best practices in mind.

This public repository contains the **frontend / public web assets** used as a portfolio example. Private server-side code, configuration, and secrets are maintained separately and are not published here.

## Features

- **Responsive Design**: Mobile-first layout with a production Tailwind CSS build
- **Blog**: Markdown-based posts with an admin content workflow
- **SEO**: Structured data, meta tags, Open Graph, Twitter Cards, sitemap, robots.txt
- **Performance**: Lazy loading, image optimization, deferred scripts, compiled CSS
- **Security-minded frontend**: CSP-friendly setup, form protections, privacy controls
- **Privacy Compliance**: Cookie consent (Consent Mode), privacy policy, terms, data rights request page
- **Accessibility**: Semantic HTML and WCAG-oriented patterns

## Tech Stack (Public)

- HTML5, CSS3 (Tailwind production build + custom CSS)
- JavaScript (ES modules)
- Apache-friendly static hosting with `.htaccess` for headers/caching
- PHP used at the edge for public form/API gateways (implementation details private)

## Project Structure (Public)

```
Project/
├── public_html/                 # Public website files
│   ├── *.html                   # Site pages
│   ├── css/tailwind.min.css     # Production Tailwind build
│   ├── style.css                # Custom styles
│   ├── script.js                # Main JS entry
│   ├── js/                      # Frontend modules
│   ├── Gallery/                 # Images
│   ├── blog/                    # Blog UI + posts
│   ├── robots.txt
│   ├── sitemap.xml
│   └── .htaccess
├── css-src/                     # Tailwind source
├── build-css.sh                 # Rebuild production CSS
├── tailwind.config.js
├── SECURITY.md                  # High-level security overview
└── README.md
```

Private application code and configuration are intentionally excluded from this repository.

## Getting Started (Frontend)

### Prerequisites

- A local web server (PHP’s built-in server is fine for static/frontend checks)
- Git

### Local preview

Do not open pages via `file://` (ES modules and fetches need HTTP):

```bash
cd public_html && php -S 127.0.0.1:8000
```

### CSS build

Production styles are compiled with Tailwind (no CDN). Rebuild after changing utility classes:

```bash
./build-css.sh
```

## What This Portfolio Demonstrates

- Clean, maintainable frontend structure
- Privacy-aware analytics consent flow
- SEO and accessibility fundamentals
- Separation of public assets from private server-side systems

For security practices at a high level, see [SECURITY.md](SECURITY.md).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Website**: [trifecta.systems](https://trifecta.systems)
- **Contact**: Use the contact form on the website

---

**Built by Trifecta.Systems**  
*Empowering small businesses and nonprofits with practical technology solutions.*
