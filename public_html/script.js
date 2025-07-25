// script.js

// --- reCAPTCHA Callback and Form Validation ---
// Removed: var onloadCallback = function() { ... }
// Removed: function onSubmit(token) { ... }


// Enhanced client-side form validation and reCAPTCHA execution
async function validateFormAndRecaptcha(event) {
    event.preventDefault();

    const contactForm = document.getElementById("contactForm");
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const messageInput = document.getElementById('message');
    const recaptchaResponseInput = document.getElementById('recaptchaResponse');
    const submitButton = contactForm.querySelector('button[type="submit"]');

    // Enhanced client-side validation
    const validationErrors = [];
    
    // Name validation
    if (!nameInput.value.trim()) {
        validationErrors.push('Name is required');
    } else if (nameInput.value.trim().length > 100) {
        validationErrors.push('Name must be 100 characters or less');
    }
    
    // Email validation
    if (!emailInput.value.trim()) {
        validationErrors.push('Email is required');
    } else if (!validateEmail(emailInput.value.trim())) {
        validationErrors.push('Please enter a valid email address');
    }
    
    // Message validation
    if (!messageInput.value.trim()) {
        validationErrors.push('Message is required');
    } else if (messageInput.value.trim().length > 2000) {
        validationErrors.push('Message must be 2000 characters or less');
    }
    
    // Phone validation (optional)
    const phoneInput = document.getElementById('phone');
    if (phoneInput && phoneInput.value.trim()) {
        // Remove formatting for validation
        const phoneDigits = phoneInput.value.replace(/\D/g, '');
        if (phoneDigits.length !== 10) {
            validationErrors.push('Please enter a valid 10-digit phone number');
        }
    }
    
    // Honeypot field validation (should be empty)
    const honeypotFields = ['website', 'email_confirm', 'phone_confirm'];
    for (const fieldName of honeypotFields) {
        const field = document.getElementById(fieldName);
        if (field && field.value.trim()) {
            validationErrors.push('Invalid form submission detected');
            break;
        }
    }

    if (validationErrors.length > 0) {
        alert('Please correct the following errors:\n' + validationErrors.join('\n'));
        return false;
    }

    // Disable submit button to prevent double submission
    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';

    try {
        // Execute reCAPTCHA with enhanced error handling
        if (typeof grecaptcha !== 'undefined' && grecaptcha.execute) {
            // Get reCAPTCHA site key from server
            const siteKeyResponse = await fetch('../backend/get_recaptcha_key.php');
            if (!siteKeyResponse.ok) {
                throw new Error('Failed to get security configuration. Please refresh the page and try again.');
            }
            const siteKeyData = await siteKeyResponse.json();
            
            const token = await grecaptcha.execute(siteKeyData.site_key, { 
                action: 'submit_contact_form' 
            });
            recaptchaResponseInput.value = token;
        } else {
            throw new Error('reCAPTCHA is not available. Please refresh the page and try again.');
        }

        // Get CSRF token from server
        const csrfToken = await getCSRFToken();
        if (!csrfToken) {
            throw new Error('Failed to get security token. Please refresh the page and try again.');
        }

        // Prepare form data with enhanced security
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData.entries());
        
        // Remove honeypot fields from data before sending
        delete data['website'];
        delete data['email_confirm'];
        delete data['phone_confirm'];
        
        data['g-recaptcha-response'] = recaptchaResponseInput.value;
        data['csrf_token'] = csrfToken;

        const response = await fetch('../backend/submit_form.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Network error occurred' }));
            throw new Error(errorData.message || `HTTP ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            alert(result.message);
            contactForm.reset();
            // Clear any stored tokens and honeypot fields
            recaptchaResponseInput.value = '';
            honeypotFields.forEach(fieldName => {
                const field = document.getElementById(fieldName);
                if (field) field.value = '';
            });
        } else {
            throw new Error(result.message || 'Submission failed');
        }

    } catch (error) {
        console.error('Form submission error:', error);
        alert('Error: ' + error.message);
    } finally {
        // Re-enable submit button
        submitButton.disabled = false;
        submitButton.textContent = 'Send Message';
    }
}

// Fetch CSRF token from server
async function getCSRFToken() {
    try {
        const response = await fetch('../backend/csrf_token.php');
        if (response.ok) {
            const data = await response.json();
            return data.csrf_token;
        }
    } catch (error) {
        console.error('Failed to get CSRF token:', error);
    }
    return null;
}

// Phone number mask function
function formatPhoneNumber(input) {
    // Remove all non-digits
    let value = input.value.replace(/\D/g, '');
    
    // Limit to 10 digits
    value = value.substring(0, 10);
    
    // Apply mask: ###-###-####
    if (value.length >= 6) {
        value = value.substring(0, 3) + '-' + value.substring(3, 6) + '-' + value.substring(6);
    } else if (value.length >= 3) {
        value = value.substring(0, 3) + '-' + value.substring(3);
    }
    
    input.value = value;
}

// Initialize phone number mask
function initializePhoneMask() {
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        // Apply mask on input
        phoneInput.addEventListener('input', function() {
            formatPhoneNumber(this);
        });
        
        // Apply mask on paste
        phoneInput.addEventListener('paste', function(e) {
            setTimeout(() => {
                formatPhoneNumber(this);
            }, 0);
        });
        
        // Handle backspace and delete properly
        phoneInput.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' || e.key === 'Delete') {
                // Allow default behavior for backspace/delete
                return;
            }
            
            // Only allow digits, backspace, delete, tab, escape, enter
            if (!/[\d\b\delete\tab\escape\enter]/.test(e.key.toLowerCase())) {
                e.preventDefault();
            }
        });
    }
}

// Email validation function
function validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}

// Initialize email validation
function initializeEmailValidation() {
    const emailInput = document.getElementById('email');
    if (emailInput) {
        // Real-time validation on input
        emailInput.addEventListener('input', function() {
            const email = this.value.trim();
            const isValid = email === '' || validateEmail(email);
            
            // Update visual feedback
            if (email === '') {
                this.classList.remove('border-red-500', 'border-green-500');
                this.classList.add('border-gray-600');
            } else if (isValid) {
                this.classList.remove('border-red-500', 'border-gray-600');
                this.classList.add('border-green-500');
            } else {
                this.classList.remove('border-green-500', 'border-gray-600');
                this.classList.add('border-red-500');
            }
        });
        
        // Validation on blur (when user leaves the field)
        emailInput.addEventListener('blur', function() {
            const email = this.value.trim();
            if (email !== '' && !validateEmail(email)) {
                // Show error message
                showEmailError('Please enter a valid email address');
            } else {
                hideEmailError();
            }
        });
        
        // Clear validation on focus
        emailInput.addEventListener('focus', function() {
            hideEmailError();
        });
    }
}

// Show email error message
function showEmailError(message) {
    let errorElement = document.getElementById('email-error');
    if (!errorElement) {
        const emailInput = document.getElementById('email');
        if (emailInput) {
            errorElement = document.createElement('div');
            errorElement.id = 'email-error';
            errorElement.className = 'text-red-500 text-sm mt-1';
            emailInput.parentNode.appendChild(errorElement);
        }
    }
    if (errorElement) {
        errorElement.textContent = message;
    }
}

// Hide email error message
function hideEmailError() {
    const errorElement = document.getElementById('email-error');
    if (errorElement) {
        errorElement.remove();
    }
}

// --- Cookie Management System ---

// Cookie consent management
class CookieManager {
    constructor() {
        this.cookieBanner = document.getElementById('cookie-banner');
        this.cookieModal = document.getElementById('cookie-modal');
        this.cookieConsentKey = 'trifecta_cookie_consent';
        this.cookiePreferencesKey = 'trifecta_cookie_preferences';
        this.init();
    }
    
    init() {
        // Check if user has already made a choice
        const consent = this.getCookieConsent();
        if (!consent) {
            this.showCookieBanner();
        }
        
        this.bindEvents();
    }
    
    bindEvents() {
        // Banner buttons
        const acceptBtn = document.getElementById('accept-cookies');
        const settingsBtn = document.getElementById('cookie-settings');
        
        if (acceptBtn) {
            acceptBtn.addEventListener('click', () => this.acceptAllCookies());
        }
        
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.showCookieModal());
        }
        
        // Modal buttons
        const closeBtn = document.getElementById('close-cookie-modal');
        const saveBtn = document.getElementById('save-cookie-preferences');
        const acceptAllBtn = document.getElementById('accept-all-cookies');
        const rejectAllBtn = document.getElementById('reject-all-cookies');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideCookieModal());
        }
        
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.savePreferences());
        }
        
        if (acceptAllBtn) {
            acceptAllBtn.addEventListener('click', () => this.acceptAllCookies());
        }
        
        if (rejectAllBtn) {
            rejectAllBtn.addEventListener('click', () => this.rejectAllCookies());
        }
        
        // Close modal when clicking outside
        if (this.cookieModal) {
            this.cookieModal.addEventListener('click', (e) => {
                if (e.target === this.cookieModal) {
                    this.hideCookieModal();
                }
            });
        }
    }
    
    showCookieBanner() {
        if (this.cookieBanner) {
            // Small delay to ensure page is loaded
            setTimeout(() => {
                this.cookieBanner.classList.remove('translate-y-full');
            }, 1000);
        }
    }
    
    hideCookieBanner() {
        if (this.cookieBanner) {
            this.cookieBanner.classList.add('translate-y-full');
        }
    }
    
    showCookieModal() {
        if (this.cookieModal) {
            this.cookieModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }
    
    hideCookieModal() {
        if (this.cookieModal) {
            this.cookieModal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    }
    
    acceptAllCookies() {
        const preferences = {
            essential: true,
            functional: true,
            analytics: true,
            timestamp: new Date().toISOString()
        };
        
        this.setCookieConsent('accepted', preferences);
        this.hideCookieBanner();
        this.hideCookieModal();
        this.loadCookies(preferences);
    }
    
    rejectAllCookies() {
        const preferences = {
            essential: true, // Essential cookies cannot be rejected
            functional: false,
            analytics: false,
            timestamp: new Date().toISOString()
        };
        
        this.setCookieConsent('rejected', preferences);
        this.hideCookieBanner();
        this.hideCookieModal();
        this.loadCookies(preferences);
    }
    
    savePreferences() {
        const functionalCookies = document.getElementById('functional-cookies');
        const analyticsCookies = document.getElementById('analytics-cookies');
        
        const preferences = {
            essential: true, // Always true
            functional: functionalCookies ? functionalCookies.checked : false,
            analytics: analyticsCookies ? analyticsCookies.checked : false,
            timestamp: new Date().toISOString()
        };
        
        this.setCookieConsent('custom', preferences);
        this.hideCookieBanner();
        this.hideCookieModal();
        this.loadCookies(preferences);
    }
    
    setCookieConsent(status, preferences) {
        // Store in localStorage for persistence
        localStorage.setItem(this.cookieConsentKey, status);
        localStorage.setItem(this.cookiePreferencesKey, JSON.stringify(preferences));
        
        // Also set a cookie for server-side access
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        document.cookie = `${this.cookieConsentKey}=${status}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Strict`;
    }
    
    getCookieConsent() {
        return localStorage.getItem(this.cookieConsentKey);
    }
    
    getCookiePreferences() {
        const preferences = localStorage.getItem(this.cookiePreferencesKey);
        return preferences ? JSON.parse(preferences) : null;
    }
    
    loadCookies(preferences) {
        // Essential cookies are always loaded
        this.loadEssentialCookies();
        
        // Load other cookies based on preferences
        if (preferences.functional) {
            this.loadFunctionalCookies();
        }
        
        if (preferences.analytics) {
            this.loadAnalyticsCookies();
        }
    }
    
    loadEssentialCookies() {
        // Essential cookies are already loaded (reCAPTCHA, sessionStorage)
        console.log('Essential cookies loaded');
    }
    
    loadFunctionalCookies() {
        // Load functional cookies (Google Fonts optimization, etc.)
        console.log('Functional cookies loaded');
    }
    
    loadAnalyticsCookies() {
        // Load analytics cookies (future implementation)
        console.log('Analytics cookies loaded');
    }
    
    // Check if specific cookie type is allowed
    isCookieAllowed(type) {
        const preferences = this.getCookiePreferences();
        if (!preferences) return false;
        
        switch (type) {
            case 'essential':
                return true; // Always allowed
            case 'functional':
                return preferences.functional;
            case 'analytics':
                return preferences.analytics;
            default:
                return false;
        }
    }
}

// Initialize cookie manager
let cookieManager;

// Data Rights Request Form Handler
function initializeDataRightsForm() {
    const form = document.getElementById('dataRightsForm');
    if (form) {
        form.addEventListener('submit', handleDataRightsSubmit);
    }
}

async function handleDataRightsSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    try {
        // Disable submit button
        submitButton.disabled = true;
        submitButton.textContent = 'Processing...';
        
        // Validate form
        const validationErrors = validateDataRightsForm(form);
        if (validationErrors.length > 0) {
            throw new Error(validationErrors.join(', '));
        }
        
        // Execute reCAPTCHA
        const recaptchaResponseInput = document.getElementById('recaptchaResponse');
        if (typeof grecaptcha !== 'undefined' && grecaptcha.execute) {
            // Get reCAPTCHA site key from server
            const siteKeyResponse = await fetch('../backend/get_recaptcha_key.php');
            if (!siteKeyResponse.ok) {
                throw new Error('Failed to get security configuration. Please refresh the page and try again.');
            }
            const siteKeyData = await siteKeyResponse.json();

            const token = await grecaptcha.execute(siteKeyData.site_key, {
                action: 'submit_data_rights_request'
            });
            recaptchaResponseInput.value = token;
        } else {
            throw new Error('reCAPTCHA is not available. Please refresh the page and try again.');
        }
        
        // Get CSRF token
        const csrfToken = await getCSRFToken();
        if (!csrfToken) {
            throw new Error('Failed to get security token. Please refresh the page and try again.');
        }
        
        // Prepare form data
        const formData = new FormData(form);
        const data = {};
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        // Add CSRF token
        data.csrf_token = csrfToken;
        
        // Remove honeypot fields
        delete data.website;
        delete data.email_confirm;
        delete data.phone_confirm;
        
        // Submit request
        const response = await fetch('../backend/data_rights_request.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Show success message
            showDataRightsSuccess(result.request_id);
            form.reset();
        } else {
            throw new Error(result.message || 'An error occurred while submitting your request.');
        }
        
    } catch (error) {
        console.error('Data rights request error:', error);
        showDataRightsError(error.message);
    } finally {
        // Re-enable submit button
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
}

function validateDataRightsForm(form) {
    const errors = [];
    
    // Required fields validation
    const requiredFields = ['requestType', 'firstName', 'lastName', 'email', 'verificationMethod'];
    requiredFields.forEach(field => {
        const input = form.querySelector(`[name="${field}"]`);
        if (!input || !input.value.trim()) {
            errors.push(`${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`);
        }
    });
    
    // Email validation
    const emailInput = form.querySelector('[name="email"]');
    if (emailInput && emailInput.value.trim() && !validateEmail(emailInput.value.trim())) {
        errors.push('Please enter a valid email address');
    }
    
    // Phone validation (if provided)
    const phoneInput = form.querySelector('[name="phone"]');
    if (phoneInput && phoneInput.value.trim()) {
        const phoneDigits = phoneInput.value.replace(/\D/g, '');
        if (phoneDigits.length !== 10) {
            errors.push('Phone number must be exactly 10 digits');
        }
    }
    
    // Honeypot validation
    const honeypotFields = ['website', 'email_confirm', 'phone_confirm'];
    honeypotFields.forEach(field => {
        const input = form.querySelector(`[name="${field}"]`);
        if (input && input.value.trim()) {
            errors.push('Invalid form submission');
        }
    });
    
    return errors;
}

function showDataRightsSuccess(requestId) {
    // Create success message
    const successDiv = document.createElement('div');
    successDiv.className = 'fixed top-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-md';
    successDiv.innerHTML = `
        <div class="flex items-start">
            <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-green-200" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
            </div>
            <div class="ml-3">
                <h3 class="text-sm font-medium">Request Submitted Successfully!</h3>
                <div class="mt-2 text-sm">
                    <p>Your data rights request has been submitted.</p>
                    <p class="mt-1 font-mono text-xs">Request ID: ${requestId}</p>
                    <p class="mt-1 text-xs">Check your email for confirmation.</p>
                </div>
            </div>
            <div class="ml-auto pl-3">
                <button onclick="this.parentElement.parentElement.remove()" class="text-green-200 hover:text-white">
                    <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(successDiv);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (successDiv.parentElement) {
            successDiv.remove();
        }
    }, 10000);
}

function showDataRightsError(message) {
    // Create error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'fixed top-4 right-4 bg-red-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-md';
    errorDiv.innerHTML = `
        <div class="flex items-start">
            <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-200" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                </svg>
            </div>
            <div class="ml-3">
                <h3 class="text-sm font-medium">Error</h3>
                <div class="mt-2 text-sm">
                    <p>${message}</p>
                </div>
            </div>
            <div class="ml-auto pl-3">
                <button onclick="this.parentElement.parentElement.remove()" class="text-red-200 hover:text-white">
                    <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(errorDiv);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (errorDiv.parentElement) {
            errorDiv.remove();
        }
    }, 10000);
}

// Email obfuscation function
function obfuscateEmail() {
    const emailElements = document.querySelectorAll('#obfuscated-email');
    emailElements.forEach(emailElement => {
        // Obfuscated email parts
        const parts = ['info', 'trifecta', 'systems'];
        const domain = parts[1] + '.' + parts[2];
        const email = parts[0] + '@' + domain;
        
        // Create clickable email link
        emailElement.innerHTML = email;
        emailElement.addEventListener('click', function() {
            window.location.href = 'mailto:' + email;
        });
        
        // Add title attribute for accessibility
        emailElement.title = 'Click to send email to ' + email;
    });
}

// Load cookie banner HTML
async function loadCookieBanner() {
    try {
        const response = await fetch('cookie-banner.html');
        const html = await response.text();
        const container = document.getElementById('cookie-banner-container');
        if (container) {
            container.innerHTML = html;
        }
    } catch (error) {
        console.error('Failed to load cookie banner:', error);
    }
}

// --- Gemini AI Integration Logic for ai-custom-solutions.html ---

// Function to generate a response from the general Gemini API demo.
async function generateGeminiResponse() {
    const promptInput = document.getElementById('geminiPromptInput');
    const responseDisplay = document.getElementById('geminiResponseDisplay');
    const loadingSpinner = document.getElementById('geminiLoadingSpinner');

    const userPrompt = promptInput.value.trim();

    // Validate if the user has entered a prompt.
    if (!userPrompt) {
        responseDisplay.innerHTML = '<p class="text-red-400">Please enter a prompt to get a response.</p>';
        return;
    }

    // Clear any previous response and display the loading spinner.
    responseDisplay.innerHTML = '<p class="text-gray-400">Generating response...</p>';
    loadingSpinner.style.display = 'block';

    try {
        // Prepare the chat history for the Gemini API request.
        let chatHistory = [{ role: "user", parts: [{ text: userPrompt }] }];
        const payload = { contents: chatHistory };

        // The API key is left empty as Canvas will automatically provide it at runtime.
        const apiKey = "";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            const generatedText = result.candidates[0].content.parts[0].text;
            responseDisplay.innerHTML = `<p>${generatedText.replace(/\n/g, '<br>')}</p>`;
        } else {
            console.error("Unexpected Gemini API response structure:", result);
            responseDisplay.innerHTML = '<p class="text-red-400">Error: Could not get a valid response from AI. Please try again.</p>';
        }
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        responseDisplay.innerHTML = `<p class="text-red-400">Error: Failed to connect to AI service. ${error.message}</p>`;
    } finally {
        loadingSpinner.style.display = 'none';
    }
}

// --- Facebook Reviews Widget Logic (Dummy Data & Cycling with Fade) ---
const dummyReviews = [
    {
        author: "Emily R.",
        rating: 5,
        text: "Company ABC completely transformed our online presence! Their web development skills are top-notch, and they delivered exactly what we envisioned. Highly recommended!",
        date: "2024-05-15"
    },
    {
        author: "Michael T.",
        rating: 5,
        text: "We partnered with Company ABC for our data analytics needs, and their insights have been invaluable. They helped us make smarter, data-driven decisions that boosted our efficiency. Fantastic work!",
        date: "2024-04-28"
    },
    {
        author: "Sarah L.",
        rating: 5,
        text: "Thanks to Company ABC, our cybersecurity infrastructure is stronger than ever. Their team is incredibly knowledgeable and provides robust protection. Peace of mind guaranteed!",
        date: "2024-06-01"
    }
];

let currentReviewIndex = 0; // Tracks the currently displayed review

function updateReviewDisplay() {
    const reviewsDisplayArea = document.getElementById('reviewsDisplayArea');
    if (!reviewsDisplayArea) {
        // console.error("reviewsDisplayArea element not found for reviews cycling!");
        return;
    }

    if (dummyReviews.length === 0) {
        reviewsDisplayArea.innerHTML = '<p class="text-gray-400 text-center">No reviews to display yet.</p>';
        return;
    }

    // Start fade-out effect
    reviewsDisplayArea.classList.remove('fade-in');
    reviewsDisplayArea.classList.add('fade-out');

    // Wait for fade-out to complete before changing content and fading in
    setTimeout(() => {
        const review = dummyReviews[currentReviewIndex];
        reviewsDisplayArea.innerHTML = `
            <h3 class="text-2xl font-bold mb-4 text-white">Recent Reviews for Company ABC:</h3>
            <div class="bg-gray-600 p-4 rounded-lg shadow-md mb-4 border border-gray-500">
                <div class="flex items-center mb-2">
                    <span class="text-yellow-400 mr-2">${'⭐'.repeat(review.rating)}</span>
                    <strong class="text-white">${review.author}</strong>
                    <span class="text-gray-400 text-sm ml-auto">${review.date}</span>
                </div>
                <p class="text-gray-200">${review.text}</p>
            </div>
        `;

        // Apply fade-in effect
        reviewsDisplayArea.classList.remove('fade-out');
        reviewsDisplayArea.classList.add('fade-in');

        currentReviewIndex = (currentReviewIndex + 1) % dummyReviews.length; // Cycle to the next review
    }, 500); // This timeout should match the CSS transition duration for fade-out
}


// --- Service Worker Registration ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// --- DOMContentLoaded Event Listener ---
// Ensures that the JavaScript runs only after the entire HTML document has been loaded.
document.addEventListener('DOMContentLoaded', () => {
    // console.log("DOMContentLoaded fired."); // Debugging log

    // Logo animation logic for the main header logo.
    const mainLogo = document.getElementById('mainLogo');
    // Use sessionStorage to ensure the animation plays only once per session.
    const hasAnimated = sessionStorage.getItem('hasLogoAnimated');

    if (mainLogo && !hasAnimated) { // Only animate if logo element exists and hasn't animated this session.
        mainLogo.classList.add('animate-logo-spin');
        sessionStorage.setItem('hasLogoAnimated', 'true');
        // Remove the animation class after it completes to prevent re-triggering on subsequent scrolls/hovers.
        mainLogo.addEventListener('animationend', () => {
            mainLogo.classList.remove('animate-logo-spin');
        }, { once: true }); // Ensure the event listener is removed after first use.
    }

    // --- Mobile Hamburger Menu Toggle ---
    const mobileMenuButton = document.getElementById('mobileMenuButton');
    const mobileMenu = document.getElementById('mobileMenu');

    // NEW: Get references to the services dropdown elements
    const servicesDropdownToggle = document.getElementById('servicesDropdownToggle');
    const servicesSubmenu = document.getElementById('servicesSubmenu');
    // Get the SVG icon inside the services dropdown toggle button
    const servicesDropdownIcon = servicesDropdownToggle ? servicesDropdownToggle.querySelector('svg') : null;


    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden'); // Toggle visibility
            mobileMenu.classList.toggle('flex');   // Toggle flex display
            
            // NEW: Close services submenu when main menu is closed
            if (mobileMenu.classList.contains('hidden') && servicesSubmenu && !servicesSubmenu.classList.contains('hidden')) {
                servicesSubmenu.classList.add('hidden');
                if (servicesDropdownIcon) {
                    servicesDropdownIcon.classList.remove('rotate-180');
                }
            }
        });

        // NEW: Event Listener for Services Dropdown Toggle (for mobile)
        if (servicesDropdownToggle && servicesSubmenu) {
            servicesDropdownToggle.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent this click from bubbling up and closing the main menu immediately
                servicesSubmenu.classList.toggle('hidden'); // Toggle submenu visibility
                if (servicesDropdownIcon) {
                    servicesDropdownIcon.classList.toggle('rotate-180'); // Rotate icon
                }
            });
        }

        // Optional: Close menu when a link is clicked (for single-page navigation)
        // MODIFIED: Also close services submenu and reset its icon
        const menuLinks = mobileMenu.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                // Only hide if it's actually a mobile menu (i.e., not a desktop view)
                // This check is important as it prevents menu from disappearing on desktop clicks
                if (window.innerWidth < 768) { // Tailwind's 'md' breakpoint is 768px
                    mobileMenu.classList.add('hidden');
                    mobileMenu.classList.remove('flex');
                    
                    // NEW: Also close the services submenu if it's open
                    if (servicesSubmenu && !servicesSubmenu.classList.contains('hidden')) {
                        servicesSubmenu.classList.add('hidden');
                        if (servicesDropdownIcon) {
                            servicesDropdownIcon.classList.remove('rotate-180');
                        }
                    }
                }
            });
        });
    }

    // --- Event Listeners for General Gemini Interaction Section ---
    const tryGeminiButton = document.getElementById('tryGeminiButton');
    const geminiInteractionSection = document.getElementById('gemini-interaction-section');
    const generateResponseButton = document.getElementById('generateResponseButton');
    const geminiPromptInput = document.getElementById('geminiPromptInput');

    // Check if all necessary elements for the Gemini general interaction exist on the current page.
    if (tryGeminiButton && geminiInteractionSection && generateResponseButton && geminiPromptInput) {
        // Toggle visibility of the Gemini interaction section when the "Give it a try" button is clicked.
        tryGeminiButton.addEventListener('click', () => {
            geminiInteractionSection.classList.toggle('hidden'); // Add/remove 'hidden' class.
            // Scroll to the interaction section smoothly if it becomes visible.
            if (!geminiInteractionSection.classList.contains('hidden')) {
                geminiInteractionSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });

        // Attach the response generation function to the "Generate Response" button.
        generateResponseButton.addEventListener('click', generateGeminiResponse);

        // Allow submitting the prompt by pressing Enter within the textarea (Shift+Enter for newline).
        geminiPromptInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault(); // Prevent default Enter behavior (newline).
                generateGeminiResponse(); // Trigger AI response generation.
            }
        });
    }

    // The sentiment analyzer logic has been removed.

    // --- Dynamic thumbnail loading for portfolio items ---
    // This section is present for continuity but currently handles static image loading.
    // If you were to re-implement dynamic screenshot generation (e.g., via a backend),
    // this is where the fetching logic for .loading-thumbnail elements would be placed.
    const portfolioImages = document.querySelectorAll('.loading-thumbnail');
    portfolioImages.forEach(img => {
        const targetUrl = img.dataset.targetUrl;
        if (targetUrl) {
            // Currently no active fetching logic here, as thumbnails are static.
            // This loop serves as a placeholder if dynamic loading is re-enabled.
        }
    });

    // --- Contact Form Event Listener ---
    // Attach the validation and submission logic to the contact form if it exists on the page.
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', validateFormAndRecaptcha);
    }

    // --- Initialize Reviews Cycling ---
    // Check if reviewsDisplayArea exists before starting the interval
    if (document.getElementById('reviewsDisplayArea')) {
        updateReviewDisplay(); // Display the first review immediately and start fade-in
        setInterval(updateReviewDisplay, 20000); // Cycle every 20 seconds
    }
    
    // --- Initialize Phone Number Mask ---
    initializePhoneMask();
    
    // --- Initialize Email Validation ---
    initializeEmailValidation();
    
    // --- Load Cookie Banner and Initialize Cookie Manager ---
    loadCookieBanner().then(() => {
        cookieManager = new CookieManager();
    });
    
    // --- Initialize Email Obfuscation ---
    obfuscateEmail();
    
    // --- Initialize Data Rights Request Form ---
    initializeDataRightsForm();
});