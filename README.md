# Trifecta.Systems Website

## Overview

This repository hosts the official landing page and static site for **Trifecta.Systems**, a consulting firm dedicated to empowering small businesses and nonprofits with cutting-edge technology solutions. The website serves as a primary point of contact and information, detailing our core service offerings and our commitment to fostering digital growth.

## Purpose

The main objective of this website is to showcase Trifecta.Systems' expertise in:
* **Website Development:** Crafting compelling and robust online presences.
* **Data Analytics:** Unlocking insights from data for informed business decisions.
* **Cybersecurity:** Safeguarding digital assets and systems from evolving threats.
* **AI-Powered Custom Digital Solutions:** Delivering tailored AI and prompt engineering solutions for unique business needs, including workflow automation and creative asset generation.

The site is designed to be intuitive and informative, guiding potential clients through our services and providing an easy method for inquiries.

## Technologies Used

The project leverages a modern stack for a responsive and performant user experience:

* **HTML5:** For the core structure and content of the web pages.
* **CSS3 (Tailwind CSS):** Utilized for responsive and utility-first styling, ensuring a consistent and appealing design across all devices.
* **JavaScript:** For interactive elements, including the mobile navigation toggle and client-side form interactions.
* **PHP:** Employed for the backend processing of the contact form submissions, ensuring secure data handling.
* **Google reCAPTCHA v3:** Integrated for spam protection on the contact form, verifying user authenticity without intrusive challenges.

*Note: The website also acknowledges the assistive role of AI (such as Google's Gemini) in its design and content creation process.*

## Project Structure

The repository includes the following key directories and files:

* `index.html`: The main landing page of the website.
* `web-development.html`, `data-analytics.html`, `cybersecurity.html`, `ai-custom-solutions.html`: Dedicated service pages (referenced in the main navigation).
* `about-the-owner.html`: An additional informational page.
* `style.css`: Custom CSS styles complementing Tailwind CSS.
* `script.js`: Client-side JavaScript functionalities.
* `Gallery/`: Contains all static image assets for the website (e.g., logos, service icons, background images).
* `backend/`: Houses server-side scripts, including `submit_form.php` for contact form processing.
* `config/`: (Locally ignored) Contains sensitive environment variables and API keys (e.g., reCAPTCHA secret key, email credentials), ensuring they are not publicly exposed on GitHub.

## Getting Started

To view or deploy this project:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/KellieWilliams/trifecta-systems-website.git
    ```
2.  **Navigate to the project directory:**
    ```bash
    cd trifecta-systems-website
    ```
3.  **Ensure PHP environment:** For the contact form to function, a PHP-enabled web server (e.g., Apache, Nginx with PHP-FPM) is required.
4.  **Configure backend secrets:**
    * Create a `config` directory at the root level of your project (parallel to `public_html/`).
    * Inside `config/`, create a file named `secrets.php`.
    * Add your reCAPTCHA secret key, recipient email (`TO_EMAIL`), and sender email (`FROM_EMAIL`) within this `secrets.php` file, following the structure expected by `backend/submit_form.php`. **(Example structure will be provided in a separate setup guide for production)**
    * Ensure the `config` directory is **not committed to Git** (as managed by the `.gitignore` file).

## Contributing

As this is a static business website, direct contributions are not typically sought. However, if you have suggestions or find issues, please open an issue on this repository.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
