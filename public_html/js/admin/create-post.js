// admin/create-post.js - Admin create post functionality

import { getCSRFToken } from '../utils.js';

// Admin create post functionality
let createPostSessionId = null;

export function initializeAdminCreatePost() {
    // Check session on page load
    checkCreatePostSession();
    
    // Event listeners
    const statusSelect = document.getElementById('status');
    const submitButton = document.getElementById('submitButton');
    
    if (statusSelect) {
        statusSelect.addEventListener('change', toggleSchedulingOptions);
    }
    
    if (submitButton) {
        submitButton.addEventListener('click', handleSubmit);
    }
    
    // Initialize scheduling options
    toggleSchedulingOptions();
}

export async function checkCreatePostSession() {
    // Get session ID from URL parameter or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    createPostSessionId = urlParams.get('session_id') || localStorage.getItem('admin_session_id');
    
    if (!createPostSessionId) {
        // No session, redirect to login
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch(`../admin-auth-proxy.php?action=check_session&session_id=${createPostSessionId}`);
        const result = await response.json();
        
        if (result.success) {
            // Session is valid, show create post form
            const createPostForm = document.getElementById('createPostForm');
            const loading = document.getElementById('loading');
            
            if (createPostForm) createPostForm.classList.remove('hidden');
            if (loading) loading.classList.add('hidden');
            
            // Store session ID
            localStorage.setItem('admin_session_id', createPostSessionId);
            
            // Generate CSRF token
            await generateCSRFToken();
        } else {
            // Invalid session, redirect to login
            localStorage.removeItem('admin_session_id');
            window.location.href = 'login.html';
        }
        
    } catch (error) {
        console.error('Session check error:', error);
        window.location.href = 'login.html';
    }
}

export function toggleSchedulingOptions() {
    const status = document.getElementById('status');
    const schedulingOptions = document.getElementById('schedulingOptions');
    const publishTime = document.getElementById('publish_time');
    const submitButton = document.getElementById('submitButton');
    
    if (!status || !schedulingOptions || !publishTime || !submitButton) return;
    
    if (status.value === 'scheduled') {
        schedulingOptions.classList.remove('hidden');
        publishTime.required = true;
        submitButton.textContent = 'Schedule Post';
        submitButton.className = 'px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors duration-200';
        
        // Set default publish time to tomorrow at 9 AM
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0);
        publishTime.value = tomorrow.toISOString().slice(0, 16);
    } else {
        schedulingOptions.classList.add('hidden');
        publishTime.required = false;
        submitButton.textContent = 'Publish Post';
        submitButton.className = 'px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200';
    }
}

export async function handleSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    formData.append('session_id', createPostSessionId);
    formData.append('action', 'create_post');
    
    const status = formData.get('status');
    
    // Only include publish_time if status is scheduled or published
    if (status === 'scheduled' || status === 'published') {
        const publishTime = formData.get('publish_time');
        if (!publishTime || publishTime.trim() === '') {
            showCreatePostError('Publish time is required for scheduled and published posts');
            return;
        }
        
        // For scheduled posts, validate future date
        if (status === 'scheduled') {
            const scheduledTime = new Date(publishTime);
            const now = new Date();
            
            if (scheduledTime <= now) {
                showCreatePostError('Publish time must be in the future for scheduled posts');
                return;
            }
        }
    } else {
        // For drafts, remove publish_time field to avoid validation issues
        formData.delete('publish_time');
    }
    
    // Hide any existing messages
    hideCreatePostMessages();
    
    // Show loading state
    showCreatePostLoading(true);
    
    try {
        const response = await fetch('../admin-api-proxy.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            if (status === 'scheduled') {
                showCreatePostSuccess(`Post scheduled successfully for ${new Date(formData.get('publish_time')).toLocaleString()}`);
            } else {
                showCreatePostSuccess(result.message || 'Post created successfully!');
            }
            
            // Reset form
            event.target.reset();
            const publishTimeInput = document.getElementById('publish_time');
            if (publishTimeInput) {
                publishTimeInput.value = new Date().toISOString().split('T')[0];
            }
            toggleSchedulingOptions(); // Reset scheduling options
            
            // Redirect to dashboard after a short delay
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);
        } else {
            showCreatePostError(result.message || 'An error occurred while creating the post');
        }
        
    } catch (error) {
        console.error('Submit error:', error);
        showCreatePostError('An error occurred while creating the post. Please try again.');
    } finally {
        showCreatePostLoading(false);
    }
}

// Create Post UI Functions
export function showCreatePostLoading(show) {
    const loading = document.getElementById('loading');
    if (loading) {
        if (show) {
            loading.classList.remove('hidden');
        } else {
            loading.classList.add('hidden');
        }
    }
}

export function showCreatePostError(message) {
    const error = document.getElementById('error');
    const errorMessage = document.getElementById('errorMessage');
    
    if (error && errorMessage) {
        errorMessage.textContent = message;
        error.classList.remove('hidden');
    }
}

export function showCreatePostSuccess(message) {
    const success = document.getElementById('success');
    const successMessage = document.getElementById('successMessage');
    
    if (success && successMessage) {
        successMessage.textContent = message;
        success.classList.remove('hidden');
    }
}

export function hideCreatePostMessages() {
    const error = document.getElementById('error');
    const success = document.getElementById('success');
    
    if (error) error.classList.add('hidden');
    if (success) success.classList.add('hidden');
}

// Helper functions
async function generateCSRFToken() {
    try {
        const response = await fetch('../admin-csrf-proxy.php');
        if (response.ok) {
            const data = await response.json();
            const csrfTokenInput = document.getElementById('csrfToken');
            if (csrfTokenInput) {
                csrfTokenInput.value = data.csrf_token;
            }
        } else {
            console.error('Failed to get CSRF token');
        }
    } catch (error) {
        console.error('Error generating CSRF token:', error);
    }
}
