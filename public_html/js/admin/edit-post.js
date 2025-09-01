// admin/edit-post.js - Admin edit post functionality
// This file contains only UI logic and delegates sensitive operations to secure backend endpoints

import { getCSRFToken } from '../utils.js';

// Admin edit post functionality
let editPostSessionId = null;
let currentPostSlug = null;

export function initializeAdminEditPost() {
    // Check session on page load
    checkEditPostSession();
    
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

export async function checkEditPostSession() {
    // Get session ID from URL parameter or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    editPostSessionId = urlParams.get('session_id') || localStorage.getItem('admin_session_id');
    currentPostSlug = urlParams.get('slug');
    
    if (!editPostSessionId) {
        // No session, redirect to login
        window.location.href = 'login.html';
        return;
    }

    if (!currentPostSlug) {
        // No slug provided, redirect to dashboard
        window.location.href = 'dashboard.html';
        return;
    }

    try {
        const response = await fetch(`../admin-auth-proxy.php?action=check_session&session_id=${editPostSessionId}`);
        const result = await response.json();
        
        if (result.success) {
            // Session is valid, show edit post form
            const editPostForm = document.getElementById('editPostForm');
            const loading = document.getElementById('loading');
            
            if (editPostForm) editPostForm.classList.remove('hidden');
            if (loading) loading.classList.add('hidden');
            
            // Store session ID
            localStorage.setItem('admin_session_id', editPostSessionId);
            
            // Generate CSRF token
            await generateCSRFToken();
            
            // Load post data
            await loadPostData();
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

export async function loadPostData() {
    showEditPostLoading(true);
    hideEditPostMessages();
    
    try {
        const response = await fetch(`../admin-posts-proxy.php?action=get_post&slug=${currentPostSlug}`);
        const result = await response.json();
        
        if (result.success && result.post) {
            populateForm(result.post);
        } else {
            showEditPostError('Failed to load post data. Post may not exist or you may not have permission to edit it.');
        }
        
    } catch (error) {
        console.error('Error loading post data:', error);
        showEditPostError('An error occurred while loading the post data. Please try again.');
    } finally {
        showEditPostLoading(false);
    }
}

export function populateForm(post) {
    // Populate form fields
    const titleInput = document.getElementById('title');
    const excerptInput = document.getElementById('excerpt');
    const contentInput = document.getElementById('content');
    const categoryInput = document.getElementById('category');
    const categoryColorInput = document.getElementById('category_color');
    const readTimeInput = document.getElementById('read_time');
    const statusInput = document.getElementById('status');
    const publishTimeInput = document.getElementById('publish_time');
    
    if (titleInput) titleInput.value = post.title || '';
    if (excerptInput) excerptInput.value = post.excerpt || '';
    if (contentInput) contentInput.value = post.content || '';
    if (categoryInput) categoryInput.value = post.category || '';
    if (categoryColorInput) categoryColorInput.value = post.category_color || 'blue';
    if (readTimeInput) readTimeInput.value = post.read_time || '';
    if (statusInput) statusInput.value = post.status || 'draft';
    
    // Handle publish time based on status
    if (publishTimeInput) {
        if (post.status === 'scheduled' && post.scheduled_time) {
            publishTimeInput.value = post.scheduled_time.slice(0, 16);
        } else if (post.status === 'published' && post.published_time) {
            publishTimeInput.value = post.published_time.slice(0, 16);
        } else {
            publishTimeInput.value = '';
        }
    }
    
    // Update scheduling options based on current status
    toggleSchedulingOptions();
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
        submitButton.textContent = 'Update Schedule';
        submitButton.className = 'px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors duration-200';
        
        // Set default publish time to tomorrow at 9 AM if not already set
        if (!publishTime.value) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(9, 0, 0, 0);
            publishTime.value = tomorrow.toISOString().slice(0, 16);
        }
    } else {
        schedulingOptions.classList.add('hidden');
        publishTime.required = false;
        submitButton.textContent = 'Update Post';
        submitButton.className = 'px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200';
    }
}

export async function handleSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    formData.append('session_id', editPostSessionId);
    formData.append('action', 'update_post');
    formData.append('slug', currentPostSlug);
    
    const status = formData.get('status');
    
    // Only include publish_time if status is scheduled or published
    if (status === 'scheduled' || status === 'published') {
        const publishTime = formData.get('publish_time');
        if (!publishTime || publishTime.trim() === '') {
            showEditPostError('Publish time is required for scheduled and published posts');
            return;
        }
        
        // For scheduled posts, validate future date
        if (status === 'scheduled') {
            const scheduledTime = new Date(publishTime);
            const now = new Date();
            
            if (scheduledTime <= now) {
                showEditPostError('Publish time must be in the future for scheduled posts');
                return;
            }
        }
    } else {
        // For drafts, remove publish_time field to avoid validation issues
        formData.delete('publish_time');
    }
    
    // Hide any existing messages
    hideEditPostMessages();
    
    // Show loading state
    showEditPostLoading(true);
    
    try {
        const response = await fetch('../admin-api-proxy.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            if (status === 'scheduled') {
                showEditPostSuccess(`Post scheduled successfully for ${new Date(formData.get('publish_time')).toLocaleString()}`);
            } else {
                showEditPostSuccess(result.message || 'Post updated successfully!');
            }
            
            // Redirect to dashboard after a short delay
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);
        } else {
            showEditPostError(result.message || 'An error occurred while updating the post');
        }
        
    } catch (error) {
        console.error('Submit error:', error);
        showEditPostError('An error occurred while updating the post. Please try again.');
    } finally {
        showEditPostLoading(false);
    }
}

// Edit Post UI Functions
export function showEditPostLoading(show) {
    const loading = document.getElementById('loading');
    if (loading) {
        if (show) {
            loading.classList.remove('hidden');
        } else {
            loading.classList.add('hidden');
        }
    }
}

export function showEditPostError(message) {
    const error = document.getElementById('error');
    const errorMessage = document.getElementById('errorMessage');
    
    if (error && errorMessage) {
        errorMessage.textContent = message;
        error.classList.remove('hidden');
    }
}

export function showEditPostSuccess(message) {
    const success = document.getElementById('success');
    const successMessage = document.getElementById('successMessage');
    
    if (success && successMessage) {
        successMessage.textContent = message;
        success.classList.remove('hidden');
    }
}

export function hideEditPostMessages() {
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
