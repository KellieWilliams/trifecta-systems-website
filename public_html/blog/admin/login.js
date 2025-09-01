// Admin Login JavaScript
// Handles login form submission and first-time admin setup

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const setupForm = document.getElementById('setupForm');
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const errorMessage = document.getElementById('errorMessage');
    
    // Check if this is first-time setup
    checkFirstTimeSetup();
    
    // Login form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleLogin();
    });
    
    // Setup form submission
    setupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleSetup();
    });
    
    // Check if admin credentials exist
    async function checkFirstTimeSetup() {
        try {
            const response = await fetch('../admin-auth-proxy.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: 'action=login&username=test&password=test'
            });
            
            const data = await response.json();
            
            if (data.message === 'first_time_setup_required') {
                // Show setup form, hide login form
                loginForm.classList.add('hidden');
                setupForm.classList.remove('hidden');
                
                // Update the header text
                const header = document.querySelector('main h1');
                if (header) {
                    header.textContent = 'First-Time Admin Setup';
                }
                
                const subheader = document.querySelector('main p');
                if (subheader) {
                    subheader.textContent = 'Create your admin account to get started';
                }
            }
        } catch (error) {
            console.error('Error checking setup status:', error);
        }
    }
    
    // Handle login form submission
    async function handleLogin() {
        const formData = new FormData(loginForm);
        const username = formData.get('username');
        const password = formData.get('password');
        
        if (!username || !password) {
            showError('Please fill in all fields');
            return;
        }
        
        showLoading();
        hideError();
        
        try {
            const response = await fetch('../admin-auth-proxy.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `action=login&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Store session ID
                localStorage.setItem('admin_session_id', data.session_id);
                
                // Redirect to dashboard
                window.location.href = 'dashboard.html';
            } else {
                if (data.message === 'first_time_setup_required') {
                    // Switch to setup form
                    loginForm.classList.add('hidden');
                    setupForm.classList.remove('hidden');
                    
                    // Update the header text
                    const header = document.querySelector('main h1');
                    if (header) {
                        header.textContent = 'First-Time Admin Setup';
                    }
                    
                    const subheader = document.querySelector('main p');
                    if (subheader) {
                        subheader.textContent = 'Create your admin account to get started';
                    }
                } else {
                    showError(data.message || 'Login failed');
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('Network error. Please try again.');
        } finally {
            hideLoading();
        }
    }
    
    // Handle setup form submission
    async function handleSetup() {
        const formData = new FormData(setupForm);
        const username = formData.get('setupUsername');
        const password = formData.get('setupPassword');
        const confirmPassword = formData.get('setupConfirmPassword');
        
        if (!username || !password || !confirmPassword) {
            showError('Please fill in all fields');
            return;
        }
        
        if (password !== confirmPassword) {
            showError('Passwords do not match');
            return;
        }
        
        if (password.length < 8) {
            showError('Password must be at least 8 characters long');
            return;
        }
        
        if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
            showError('Username must be 3-20 characters, alphanumeric and underscores only');
            return;
        }
        
        showLoading();
        hideError();
        
        try {
            const response = await fetch('../admin-auth-proxy.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `action=setup&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&confirm_password=${encodeURIComponent(confirmPassword)}`
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Show success message and switch back to login form
                showError(data.message, 'success');
                
                setTimeout(() => {
                    // Switch back to login form
                    setupForm.classList.add('hidden');
                    loginForm.classList.remove('hidden');
                    
                    // Reset forms
                    loginForm.reset();
                    setupForm.reset();
                    
                    // Update header back to login
                    const header = document.querySelector('main h1');
                    if (header) {
                        header.textContent = 'Admin Login';
                    }
                    
                    const subheader = document.querySelector('main p');
                    if (subheader) {
                        subheader.textContent = 'Access the blog management portal';
                    }
                    
                    hideError();
                }, 3000);
            } else {
                showError(data.message || 'Setup failed');
            }
        } catch (error) {
            console.error('Setup error:', error);
            showError('Network error. Please try again.');
        } finally {
            hideLoading();
        }
    }
    
    // Utility functions
    function showLoading() {
        loading.classList.remove('hidden');
    }
    
    function hideLoading() {
        loading.classList.add('hidden');
    }
    
    function showError(message, type = 'error') {
        errorMessage.textContent = message;
        error.classList.remove('hidden');
        
        if (type === 'success') {
            error.className = 'mt-4 p-4 bg-green-900 border border-green-700 rounded-lg';
            errorMessage.className = 'text-green-300 text-sm';
        } else {
            error.className = 'mt-4 p-4 bg-red-900 border border-red-700 rounded-lg';
            errorMessage.className = 'text-red-300 text-sm';
        }
    }
    
    function hideError() {
        error.classList.add('hidden');
    }
});
