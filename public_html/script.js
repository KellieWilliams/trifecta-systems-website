// Main script file - Imports and initializes functionality from modular files

// Import all modules
import { 
    validateEmail, 
    formatPhoneNumber, 
    formatDate, 
    formatTime, 
    getCategoryColor, 
    getStatusColor, 
    getStatusText, 
    getCSRFToken 
} from './js/utils.js';

import { 
    loadBlogPost, 
    displayPost, 
    loadBlogPosts, 
    createPostSummary 
} from './js/blog.js';

import { 
    initializeAdminDashboard, 
    loadPosts, 
    displayPosts, 
    updateStats,
    loadScheduledPosts,
    displayScheduledPosts,
    updateScheduledStats,
    unschedulePost,
    deletePost,
    handleLogout
} from './js/admin/dashboard.js';

import { 
    initializeAdminCreatePost, 
    checkCreatePostSession, 
    toggleSchedulingOptions,
    handleSubmit as handleCreatePostSubmit,
    showCreatePostLoading,
    showCreatePostError,
    showCreatePostSuccess,
    hideCreatePostMessages
} from './js/admin/create-post.js';

import { 
    initializeAdminEditPost, 
    checkEditPostSession, 
    loadPostData,
    populateForm,
    toggleSchedulingOptions as toggleEditSchedulingOptions,
    handleSubmit as handleEditPostSubmit,
    showEditPostLoading,
    showEditPostError,
    showEditPostSuccess,
    hideEditPostMessages
} from './js/admin/edit-post.js';

// Initialize functionality based on current page
document.addEventListener('DOMContentLoaded', function() {
    const currentPath = window.location.pathname;
    
    // Blog post page
    if (currentPath.includes('/blog/post.html')) {
        loadBlogPost();
    }
    
    // Blog index page
    if (currentPath.includes('/blog/index.html') || 
        (currentPath === '/blog/' && currentPath.endsWith('/blog/'))) {
        loadBlogPosts();
    }
    
    // Admin login page
    if (currentPath.includes('/blog/admin/login.html')) {
        // Login functionality is handled by the HTML form directly
        // No additional initialization needed
    }
    
    // Admin dashboard page
    if (currentPath.includes('/blog/admin/dashboard.html')) {
        initializeAdminDashboard();
    }
    
    // Admin create post page
    if (currentPath.includes('/blog/admin/create-post.html')) {
        initializeAdminCreatePost();
    }
    
    // Admin edit post page
    if (currentPath.includes('/blog/admin/edit-post.html')) {
        initializeAdminEditPost();
    }
    
    // Main site functionality (contact forms, etc.)
    initializeMainSiteFunctionality();
});

// Initialize main site functionality
function initializeMainSiteFunctionality() {
    // Initialize mobile menu
    initializeMobileMenu();
    
    // Initialize phone number formatting
    initializePhoneMask();
    
    // Initialize email validation
    initializeEmailValidation();
    
    // Initialize contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', validateFormAndRecaptcha);
    }
    
    // Initialize data rights form
    initializeDataRightsForm();
    
    // Initialize cookie banner
    loadCookieBanner();
    
    // Initialize email obfuscation
    obfuscateEmail();
    
    // Initialize review display
    updateReviewDisplay();
}



// --- Main Site Functionality Functions ---

// Mobile menu functionality
function initializeMobileMenu() {
    // Handle both ID variations: mobileMenuButton (main pages) and mobileMenuBtn (blog pages)
    const mobileMenuButton = document.getElementById('mobileMenuButton') || document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const servicesDropdownToggle = document.getElementById('servicesDropdownToggle');
    const servicesSubmenu = document.getElementById('servicesSubmenu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            // Toggle mobile menu visibility
            mobileMenu.classList.toggle('hidden');
            
            // Update button icon (hamburger to X and vice versa)
            const icon = mobileMenuButton.querySelector('svg');
            if (icon) {
                if (mobileMenu.classList.contains('hidden')) {
                    // Show hamburger icon
                    icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>';
                } else {
                    // Show X icon
                    icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>';
                }
            }
        });
    }
    
    // Services dropdown functionality for mobile
    if (servicesDropdownToggle && servicesSubmenu) {
        servicesDropdownToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Toggle services submenu
            servicesSubmenu.classList.toggle('hidden');
            
            // Rotate arrow icon
            const arrow = servicesDropdownToggle.querySelector('svg');
            if (arrow) {
                arrow.classList.toggle('rotate-180');
            }
        });
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (mobileMenu && !mobileMenu.contains(e.target) && !mobileMenuButton.contains(e.target)) {
            mobileMenu.classList.add('hidden');
            
            // Reset button icon to hamburger
            const icon = mobileMenuButton.querySelector('svg');
            if (icon) {
                icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>';
            }
        }
    });
    
    // Close mobile menu when window is resized to desktop size
    window.addEventListener('resize', function() {
        if (window.innerWidth >= 768) { // md breakpoint
            if (mobileMenu) {
                mobileMenu.classList.add('hidden');
            }
            
            // Reset button icon to hamburger
            if (mobileMenuButton) {
                const icon = mobileMenuButton.querySelector('svg');
                if (icon) {
                    icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>';
                }
            }
        }
    });
}

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
        // Wait for reCAPTCHA to be loaded and execute with enhanced error handling
        let recaptchaReady = false;
        let attempts = 0;
        const maxAttempts = 10;
        
        // Wait for reCAPTCHA to be available
        while (!recaptchaReady && attempts < maxAttempts) {
            if (typeof grecaptcha !== 'undefined' && grecaptcha.execute) {
                recaptchaReady = true;
            } else {
                await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms
                attempts++;
            }
        }
        
        if (!recaptchaReady) {
            throw new Error('reCAPTCHA is not available. Please refresh the page and try again.');
        }
        
        // Get reCAPTCHA site key from server
        const siteKeyResponse = await fetch('contact-recaptcha-proxy.php');
        if (!siteKeyResponse.ok) {
            throw new Error('Failed to get security configuration. Please refresh the page and try again.');
        }
        const siteKeyData = await siteKeyResponse.json();
        
        const token = await grecaptcha.execute(siteKeyData.site_key, { 
            action: 'submit_contact_form' 
        });
        recaptchaResponseInput.value = token;

        // Prepare form data with enhanced security
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData.entries());
        
        // Remove honeypot fields from data before sending
        honeypotFields.forEach(field => delete data[field]);
        
        // Submit form data
        const response = await fetch('contact-form-proxy.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                alert('Thank you for your message! We\'ll get back to you soon.');
                contactForm.reset();
            } else {
                throw new Error(result.message || 'Failed to send message');
            }
        } else {
            throw new Error('Failed to send message. Please try again.');
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

// Phone number formatting and masking
function initializePhoneMask() {
    const phoneInput = document.getElementById('phone');
    if (!phoneInput) return;
    
    phoneInput.addEventListener('input', function() {
        formatPhoneNumber(this);
    });
    
    phoneInput.addEventListener('paste', function(e) {
        e.preventDefault();
        const pastedText = (e.clipboardData || window.clipboardData).getData('text');
        this.value = pastedText.replace(/\D/g, '');
        formatPhoneNumber(this);
    });
    
    phoneInput.addEventListener('keydown', function(e) {
        // Allow: backspace, delete, tab, escape, enter, and navigation keys
        if ([8, 9, 27, 13, 46, 37, 38, 39, 40].indexOf(e.keyCode) !== -1 ||
            (e.keyCode === 65 && e.ctrlKey === true) || // Ctrl+A
            (e.keyCode === 67 && e.ctrlKey === true) || // Ctrl+C
            (e.keyCode === 86 && e.ctrlKey === true) || // Ctrl+V
            (e.keyCode === 88 && e.ctrlKey === true) || // Ctrl+X
            (e.keyCode === 90 && e.ctrlKey === true)) { // Ctrl+Z
            return;
        }
        // Ensure that it is a number and stop the keypress
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
        }
    });
}

// Email validation
function initializeEmailValidation() {
    const emailInput = document.getElementById('email');
    if (!emailInput) return;
    
    emailInput.addEventListener('input', function() {
        const email = this.value.trim();
        if (email && !validateEmail(email)) {
            showEmailError('Please enter a valid email address');
        } else {
            hideEmailError();
        }
    });
    
    emailInput.addEventListener('blur', function() {
        const email = this.value.trim();
        if (email && !validateEmail(email)) {
            showEmailError('Please enter a valid email address');
        }
    });
    
    emailInput.addEventListener('focus', function() {
        hideEmailError();
    });
}

function showEmailError(message) {
    const errorElement = document.getElementById('emailError');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

function hideEmailError() {
    const errorElement = document.getElementById('emailError');
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}

// Data rights request form
function initializeDataRightsForm() {
    const dataRightsForm = document.getElementById('dataRightsForm');
    if (dataRightsForm) {
        dataRightsForm.addEventListener('submit', handleDataRightsSubmit);
    }
}

async function handleDataRightsSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    if (!validateDataRightsForm(form)) {
        return;
    }
    
    const formData = new FormData(form);
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';
    
    try {
        const response = await fetch('../backend/data_rights_request.php', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                showDataRightsSuccess(result.request_id);
                form.reset();
            } else {
                showDataRightsError(result.message || 'Failed to submit request');
            }
        } else {
            showDataRightsError('Failed to submit request. Please try again.');
        }
        
    } catch (error) {
        console.error('Data rights request error:', error);
        showDataRightsError('An error occurred. Please try again.');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
}

function validateDataRightsForm(form) {
    const email = form.querySelector('[name="email"]').value.trim();
    const requestType = form.querySelector('[name="request_type"]').value;
    const reason = form.querySelector('[name="reason"]').value.trim();
    
    if (!email || !validateEmail(email)) {
        alert('Please enter a valid email address.');
        return false;
    }
    
    if (!requestType) {
        alert('Please select a request type.');
        return false;
    }
    
    if (!reason) {
        alert('Please provide a reason for your request.');
        return false;
    }
    
    return true;
}

function showDataRightsSuccess(requestId) {
    const successMessage = `Your data rights request has been submitted successfully! Request ID: ${requestId}`;
    alert(successMessage);
}

function showDataRightsError(message) {
    alert('Error: ' + message);
}

// Email obfuscation
function obfuscateEmail() {
    const emailElement = document.getElementById('obfuscated-email');
    if (!emailElement) return;
    
    emailElement.addEventListener('click', function() {
        const email = 'info@trifecta.systems';
        window.location.href = 'mailto:' + email;
    });
}

// Cookie banner
async function loadCookieBanner() {
    const container = document.getElementById('cookie-banner-container');
    if (!container) return;
    
    // Always load existing consent preferences first
    loadExistingConsent();
    
    // Check if user has already made a choice
    const cookieChoice = localStorage.getItem('cookieChoice');
    if (cookieChoice) {
        return; // Don't show banner if choice already made
    }
    
    try {
        // Load the cookie banner HTML
        const response = await fetch('cookie-banner.html');
        if (response.ok) {
            const html = await response.text();
            container.innerHTML = html;
            
            // Get the banner element and show it
            const cookieBanner = document.getElementById('cookie-banner');
            if (cookieBanner) {
                // Remove the translate-y-full class to show the banner
                cookieBanner.classList.remove('translate-y-full');
                
                // Add event listeners
                setupCookieBannerEvents();
            }
        }
    } catch (error) {
        console.error('Failed to load cookie banner:', error);
    }
}

// Setup cookie banner event listeners
function setupCookieBannerEvents() {
    const acceptBtn = document.getElementById('accept-cookies');
    const settingsBtn = document.getElementById('cookie-settings');
    const closeModalBtn = document.getElementById('close-cookie-modal');
    const savePreferencesBtn = document.getElementById('save-preferences');
    const acceptAllBtn = document.getElementById('accept-all-cookies');
    const rejectAllBtn = document.getElementById('reject-all-cookies');
    const functionalToggle = document.getElementById('functional-cookies');
    const analyticsToggle = document.getElementById('analytics-cookies');
    
    // Accept all cookies
    if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
            localStorage.setItem('cookieChoice', 'accepted');
            localStorage.setItem('functionalCookies', 'true');
            localStorage.setItem('analyticsCookies', 'true');
            updateConsentMode(true, true, true, true);
            hideCookieBanner();
            loadFunctionalCookies();
        });
    }
    
    // Cookie settings button
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            const modal = document.getElementById('cookie-modal');
            if (modal) modal.classList.remove('hidden');
        });
    }
    
    // Close modal
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            const modal = document.getElementById('cookie-modal');
            if (modal) modal.classList.add('hidden');
        });
    }
    
    // Save preferences
    if (savePreferencesBtn) {
        savePreferencesBtn.addEventListener('click', () => {
            const functional = functionalToggle ? functionalToggle.checked : false;
            const analytics = analyticsToggle ? analyticsToggle.checked : false;
            
            localStorage.setItem('cookieChoice', 'custom');
            localStorage.setItem('functionalCookies', functional.toString());
            localStorage.setItem('analyticsCookies', analytics.toString());
            
            updateConsentMode(true, functional, analytics, analytics);
            hideCookieBanner();
            if (functional) loadFunctionalCookies();
        });
    }
    
    // Accept all from modal
    if (acceptAllBtn) {
        acceptAllBtn.addEventListener('click', () => {
            localStorage.setItem('cookieChoice', 'accepted');
            localStorage.setItem('functionalCookies', 'true');
            localStorage.setItem('analyticsCookies', 'true');
            updateConsentMode(true, true, true, true);
            hideCookieBanner();
            loadFunctionalCookies();
        });
    }
    
    // Reject all from modal
    if (rejectAllBtn) {
        rejectAllBtn.addEventListener('click', () => {
            localStorage.setItem('cookieChoice', 'rejected');
            localStorage.setItem('functionalCookies', 'false');
            localStorage.setItem('analyticsCookies', 'false');
            updateConsentMode(true, false, false, false);
            hideCookieBanner();
        });
    }
    
    // Load existing preferences
    loadExistingPreferences();
}

// Load existing cookie preferences
function loadExistingPreferences() {
    const functionalToggle = document.getElementById('functional-cookies');
    const analyticsToggle = document.getElementById('analytics-cookies');
    
    if (functionalToggle) {
        const functional = localStorage.getItem('functionalCookies') === 'true';
        functionalToggle.checked = functional;
    }
    
    if (analyticsToggle) {
        const analytics = localStorage.getItem('analyticsCookies') === 'true';
        analyticsToggle.checked = analytics;
    }
}

// Hide cookie banner
function hideCookieBanner() {
    const cookieBanner = document.getElementById('cookie-banner');
    const modal = document.getElementById('cookie-modal');
    
    if (cookieBanner) {
        cookieBanner.classList.add('translate-y-full');
    }
    
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Update Google Analytics consent mode
function updateConsentMode(security, functional, analytics, ads) {
    if (typeof gtag !== 'undefined') {
        gtag('consent', 'update', {
            'analytics_storage': analytics ? 'granted' : 'denied',
            'ad_storage': ads ? 'granted' : 'denied',
            'ad_user_data': ads ? 'granted' : 'denied',
            'ad_personalization': ads ? 'granted' : 'denied',
            'functionality_storage': functional ? 'granted' : 'denied',
            'personalization_storage': functional ? 'granted' : 'denied',
            'security_storage': security ? 'granted' : 'denied'
        });
        console.log('Consent mode updated:', { security, functional, analytics, ads });
    }
}

// Load existing consent preferences on page load
function loadExistingConsent() {
    const cookieChoice = localStorage.getItem('cookieChoice');
    if (cookieChoice === 'accepted') {
        updateConsentMode(true, true, true, true);
    } else if (cookieChoice === 'rejected') {
        updateConsentMode(true, false, false, false);
    } else if (cookieChoice === 'custom') {
        const functional = localStorage.getItem('functionalCookies') === 'true';
        const analytics = localStorage.getItem('analyticsCookies') === 'true';
        updateConsentMode(true, functional, analytics, analytics);
    }
}

// Load functional cookies
function loadFunctionalCookies() {
    // Load Google Fonts optimization, etc.
    // This function can be expanded based on your needs
    console.log('Functional cookies loaded');
}

// Gemini AI response generation
async function generateGeminiResponse() {
    const promptInput = document.getElementById('geminiPrompt');
    const responseArea = document.getElementById('geminiResponse');
    const generateBtn = document.getElementById('generateGeminiBtn');
    
    if (!promptInput || !responseArea || !generateBtn) return;
    
    const prompt = promptInput.value.trim();
    if (!prompt) {
        alert('Please enter a prompt.');
        return;
    }
    
    generateBtn.disabled = true;
    generateBtn.textContent = 'Generating...';
    
    try {
        const response = await fetch('../backend/gemini_api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt: prompt })
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                responseArea.value = result.response;
            } else {
                responseArea.value = 'Error: ' + result.message;
            }
        } else {
            responseArea.value = 'Error: Failed to generate response';
        }
        
    } catch (error) {
        console.error('Gemini API error:', error);
        responseArea.value = 'Error: An error occurred while generating the response';
    } finally {
        generateBtn.disabled = false;
        generateBtn.textContent = 'Generate Response';
    }
}

// Review display functionality
function updateReviewDisplay() {
    // This function can be expanded based on your review system needs
    console.log('Review display updated');
}

// Export functions for global access if needed
window.Trifecta = {
    utils: {
        validateEmail,
        formatPhoneNumber,
        formatDate,
        formatTime,
        getCategoryColor,
        getStatusColor,
        getStatusText,
        getCSRFToken
    },
    blog: {
        loadBlogPost,
        displayPost,
        loadBlogPosts,
        createPostSummary
    },
    admin: {
        dashboard: {
            initializeAdminDashboard,
            loadPosts,
            displayPosts,
            updateStats,
            loadScheduledPosts,
            displayScheduledPosts,
            updateScheduledStats,
            unschedulePost,
            deletePost,
            handleLogout
        },
        createPost: {
            initializeAdminCreatePost,
            checkCreatePostSession,
            toggleSchedulingOptions,
            handleSubmit: handleCreatePostSubmit,
            showCreatePostLoading,
            showCreatePostError,
            showCreatePostSuccess,
            hideCreatePostMessages
        },
        editPost: {
            initializeAdminEditPost,
            checkEditPostSession,
            loadPostData,
            populateForm,
            toggleSchedulingOptions: toggleEditSchedulingOptions,
            handleSubmit: handleEditPostSubmit,
            showEditPostLoading,
            showEditPostError,
            showEditPostSuccess,
            hideEditPostMessages
        }
    }
};
