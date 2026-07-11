# Security Documentation - Trifecta.Systems

## Overview

Trifecta.Systems is built with security and privacy in mind. Sensitive application logic and configuration are kept outside the public web root and are not part of this public repository.

This document describes security practices at a high level suitable for a public portfolio. Implementation details, private server paths, and operational secrets are intentionally omitted.

## Practices in Place

### Transport & Headers
- HTTPS with HSTS
- Security headers including Content Security Policy, frame protections, and MIME sniffing protections

### Forms & Abuse Prevention
- Bot protection (including reCAPTCHA)
- CSRF protections on sensitive actions
- Honeypot fields and server-side validation
- Rate limiting on public form endpoints

### Application Architecture
- Public frontend separated from private server-side handlers
- Secrets and credentials stored outside the public codebase
- Admin access protected with authentication and session controls
- Uploads restricted by type and size

### Privacy
- Cookie consent with Google Consent Mode defaults that deny analytics until opt-in
- Privacy policy, terms of service, and data subject rights request flow

### Monitoring
- Security event logging and review processes for suspicious activity

## Responsible Disclosure

If you believe you have found a security issue on [trifecta.systems](https://trifecta.systems), please report it via the contact form on the website. Please do not open public GitHub issues for sensitive vulnerabilities.

## Notes for Reviewers

This repository contains the public website assets used as a portfolio example. Private backend code, configuration, and credentials are maintained separately and are not published here.

---

**Last Updated:** July 2026
