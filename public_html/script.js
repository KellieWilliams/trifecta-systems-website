// script.js

// --- reCAPTCHA Callback and Form Validation ---
// Removed: var onloadCallback = function() { ... }
// Removed: function onSubmit(token) { ... }


// Client-side form validation and reCAPTCHA execution for the contact form.
async function validateFormAndRecaptcha(event) {
    event.preventDefault(); // Prevent the default form submission

    const contactForm = document.getElementById("contactForm");
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const messageInput = document.getElementById('message');
    const recaptchaResponseInput = document.getElementById('recaptchaResponse'); // Get the hidden input

    // Perform basic client-side validation for required fields.
    if (!nameInput || !emailInput || !messageInput || !nameInput.value || !emailInput.value || !messageInput.value) {
        alert('Please fill in all required fields (Name, Email, Message).'); // User-friendly alert
        return false; // Prevent further execution.
    }

    try {
        // Execute reCAPTCHA and get the token
        if (typeof grecaptcha !== 'undefined' && grecaptcha.execute) {
            // Replace 'YOUR_RECAPTCHA_SITE_KEY' with your actual reCAPTCHA site key from Google Admin Console
            const token = await grecaptcha.execute('6Lc0HhorAAAAACu9xCMytFjXm_Tolkrv3m-QU9OW', { action: 'submit_contact_form' });
            recaptchaResponseInput.value = token; // Set the hidden input value
        } else {
            console.error('reCAPTCHA script not loaded or grecaptcha.execute not available.');
            // THIS IS THE LINE TO UPDATE FOR BRAVE USERS
            alert('Error: reCAPTCHA is not available. Please try again. If using Brave Browser, please turn off Shields for this site.');
            return false; // Strictly prevent submission if reCAPTCHA isn't ready
        }

        // Collect all form data
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData.entries());

        // Ensure the reCAPTCHA token is explicitly included in the data sent
        data['g-recaptcha-response'] = recaptchaResponseInput.value;

        // THIS IS THE NEW LINE YOU NEED TO ADD, and adjust its path:
        // Adjust this URL to the actual path of your submit_form.php on Namecheap
        // Assuming index.html is in public_html and submit_form.php is in public_html/backend/
        const backendUrl = 'backend/submit_form.php'; // Correct path for your setup

        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // Tell the server you're sending JSON
            },
            body: JSON.stringify(data), // Send the data as a JSON string
        });

        const result = await response.json(); // Parse the JSON response from PHP

        if (result.success) {
            alert(result.message); // Show success message
            contactForm.reset(); // Clear the form
        } else {
            alert(`Error: ${result.message}`); // Show error message from backend
        }

    } catch (error) {
        console.error('Form submission error:', error);
        alert('An unexpected error occurred. Please try again.');
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
});