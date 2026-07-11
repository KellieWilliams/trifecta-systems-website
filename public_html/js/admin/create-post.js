// admin/create-post.js - Admin create post functionality
// This file contains only UI logic and delegates sensitive operations to secure backend endpoints

import { getCSRFToken, getCategoryColor } from '../utils.js';

// Admin create post functionality
let createPostSessionId = null;

export function initializeAdminCreatePost() {
    // Check session on page load
    checkCreatePostSession();
    
    // Event listeners
    const statusSelect = document.getElementById('status');
    const submitButton = document.getElementById('submitButton');
    const categorySelect = document.getElementById('category');
    
    if (statusSelect) {
        statusSelect.addEventListener('change', toggleSchedulingOptions);
    }
    
    if (submitButton) {
        submitButton.addEventListener('click', handleSubmit);
    }
    
    if (categorySelect) {
        categorySelect.addEventListener('change', updateCategoryColor);
    }
    
    // Initialize image upload functionality
    initializeImageUpload();
    
    // Initialize scheduling options
    toggleSchedulingOptions();
    
    // Initialize category color dropdown
    initializeCategoryColorDropdown();
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
    
    // Add uploaded images to form data
    if (window.uploadedImages && window.uploadedImages.length > 0) {
        window.uploadedImages.forEach((image, index) => {
            formData.append(`images[${index}]`, image.file);
        });
    }
    
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
        // First, upload images if any
        let uploadedImageUrls = [];
        if (window.uploadedImages && window.uploadedImages.length > 0) {
            const imageFormData = new FormData();
            imageFormData.append('action', 'upload_image');
            imageFormData.append('session_id', createPostSessionId);
            imageFormData.append('csrf_token', formData.get('csrf_token'));
            
            window.uploadedImages.forEach((image, index) => {
                imageFormData.append(`images[${index}]`, image.file);
            });
            
            const imageResponse = await fetch('../admin-image-upload-proxy.php', {
                method: 'POST',
                body: imageFormData
            });
            
            const imageResult = await imageResponse.json();
            
            if (imageResult.success) {
                uploadedImageUrls = imageResult.uploaded_images.map(img => img.url);
                console.log('Images uploaded successfully:', uploadedImageUrls);
                console.log('Full image result:', imageResult);
                
                // Display image paths for easy copying
                displayImagePaths(imageResult.uploaded_images);
            } else {
                showCreatePostError(`Image upload failed: ${imageResult.message}`);
                return;
            }
        }
        
        // Add uploaded image URLs to the post data
        if (uploadedImageUrls.length > 0) {
            formData.append('image_urls', JSON.stringify(uploadedImageUrls));
        }
        
        // Now create the post
        const response = await fetch('../admin-api-proxy.php', {
            method: 'POST',
            body: formData
        });
        
        // Check if response is ok and get response text first
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const responseText = await response.text();
        console.log('Raw response from server:', responseText);
        
        let result;
        try {
            result = JSON.parse(responseText);
        } catch (parseError) {
            console.error('Failed to parse JSON response:', parseError);
            console.error('Response text:', responseText);
            throw new Error('Server returned invalid response format. Check server logs for PHP errors.');
        }
        
        if (result.success) {
            if (status === 'scheduled') {
                showCreatePostSuccess(`Post scheduled successfully for ${new Date(formData.get('publish_time')).toLocaleString()}`);
            } else {
                showCreatePostSuccess(result.message || 'Post created successfully!');
            }
            
            // Reset form and images
            event.target.reset();
            window.uploadedImages = [];
            const imagePreview = document.getElementById('imagePreview');
            const imageUrls = document.getElementById('imageUrls');
            const imageUrlList = document.getElementById('imageUrlList');
            if (imagePreview) imagePreview.innerHTML = '';
            if (imageUrls) imageUrls.classList.add('hidden');
            if (imageUrlList) imageUrlList.innerHTML = '';
            
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

// Initialize category color dropdown with all available colors
function initializeCategoryColorDropdown() {
    const categoryColorSelect = document.getElementById('category_color');
    
    if (!categoryColorSelect) return;
    
    // Define all available colors
    const colors = ['blue', 'green', 'red', 'purple', 'indigo', 'yellow', 'pink', 'gray', 'orange'];
    
    // Clear existing options
    categoryColorSelect.innerHTML = '';
    
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select a category first';
    defaultOption.selected = true;
    categoryColorSelect.appendChild(defaultOption);
    
    // Add all color options
    colors.forEach(color => {
        const option = document.createElement('option');
        option.value = color;
        option.textContent = color.charAt(0).toUpperCase() + color.slice(1);
        categoryColorSelect.appendChild(option);
    });
}

// Initialize image upload functionality
function initializeImageUpload() {
    const imageUpload = document.getElementById('imageUpload');
    const imagePreview = document.getElementById('imagePreview');
    const imageUrls = document.getElementById('imageUrls');
    const imageUrlList = document.getElementById('imageUrlList');
    
    if (!imageUpload || !imagePreview || !imageUrls || !imageUrlList) return;
    
    // Store uploaded images
    window.uploadedImages = [];
    
    // Add change event listener
    imageUpload.addEventListener('change', handleImageUpload);
}

// Handle image file uploads
function handleImageUpload(event) {
    const files = event.target.files;
    const imagePreview = document.getElementById('imagePreview');
    const imageUrls = document.getElementById('imageUrls');
    const imageUrlList = document.getElementById('imageUrlList');
    
    if (!files || !imagePreview || !imageUrls || !imageUrlList) return;
    
    // Clear previous previews
    imagePreview.innerHTML = '';
    imageUrlList.innerHTML = '';
    
    // Process each file
    Array.from(files).forEach((file, index) => {
        if (file.type.startsWith('image/')) {
            // Create preview
            const reader = new FileReader();
            reader.onload = function(e) {
                const previewDiv = document.createElement('div');
                previewDiv.className = 'relative';
                previewDiv.innerHTML = `
                    <img src="${e.target.result}" alt="Preview ${index + 1}" class="w-full h-24 object-cover rounded-lg">
                    <button type="button" onclick="removeImage(${index})" class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 text-xs hover:bg-red-600">×</button>
                `;
                imagePreview.appendChild(previewDiv);
                
                // Store file info
                window.uploadedImages[index] = {
                    file: file,
                    preview: e.target.result,
                    original_name: file.name
                };
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Show image URLs section if images are uploaded
    if (files.length > 0) {
        imageUrls.classList.remove('hidden');
        // Display placeholder paths for selected images (before upload)
        displaySelectedImagePaths(files);
    }
}

// Display selected image paths before upload (for copy/paste)
function displaySelectedImagePaths(files) {
    const imageUrls = document.getElementById('imageUrls');
    const imageUrlList = document.getElementById('imageUrlList');
    
    if (!imageUrls || !imageUrlList) return;
    
    // Clear existing list
    imageUrlList.innerHTML = '';
    
    // Add each selected image with markdown format
    Array.from(files).forEach((file, index) => {
        if (file.type.startsWith('image/')) {
            // Generate alt text from filename (remove extension, replace underscores/hyphens with spaces)
            const altText = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
            
            const imageItem = document.createElement('div');
            imageItem.className = 'flex items-center justify-between p-2 bg-gray-800 rounded border border-gray-600';
            imageItem.innerHTML = `
                <div class="flex-1">
                    <span class="text-gray-300 text-sm">${file.name}</span>
                    <div class="text-blue-400 text-xs font-mono break-all">![${altText}](../Gallery/Blog-images/${file.name})</div>
                </div>
                <button 
                    type="button" 
                    onclick="insertImagePath('![${altText}](../Gallery/Blog-images/${file.name})')" 
                    class="ml-2 px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded"
                >
                    Insert
                </button>
            `;
            imageUrlList.appendChild(imageItem);
        }
    });
    
    // Show the image URLs section
    imageUrls.classList.remove('hidden');
}

// Display image paths for easy copying (after successful upload)
function displayImagePaths(uploadedImages) {
    console.log('displayImagePaths called with:', uploadedImages);
    
    const imageUrls = document.getElementById('imageUrls');
    const imageUrlList = document.getElementById('imageUrlList');
    
    console.log('Found elements:', { imageUrls, imageUrlList });
    
    if (!imageUrls || !imageUrlList) {
        console.error('Required elements not found for displaying image paths');
        return;
    }
    
    // Clear existing list
    imageUrlList.innerHTML = '';
    
    // Add each image path with markdown format
    uploadedImages.forEach((image, index) => {
        console.log('Processing image:', image);
        
        // Generate alt text from filename (remove extension, replace underscores/hyphens with spaces)
        const altText = image.original_name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
        
        const imageItem = document.createElement('div');
        imageItem.className = 'flex items-center justify-between p-2 bg-gray-800 rounded border border-gray-600';
        imageItem.innerHTML = `
            <div class="flex-1">
                <span class="text-gray-300 text-sm">${image.original_name}</span>
                <div class="text-blue-400 text-xs font-mono break-all">![${altText}](${image.url})</div>
            </div>
            <button 
                type="button" 
                onclick="insertImagePath('![${altText}](${image.url})')" 
                class="ml-2 px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded"
            >
                Insert
            </button>
        `;
        imageUrlList.appendChild(imageItem);
    });
    
    // Show the image URLs section
    imageUrls.classList.remove('hidden');
    console.log('Image paths displayed successfully');
}

// Insert image path directly into content textarea (global function for HTML onclick)
window.insertImagePath = function(imagePath) {
    const contentTextarea = document.getElementById('content');
    
    if (!contentTextarea) {
        console.error('Content textarea not found');
        return;
    }
    
    // Get current cursor position
    const start = contentTextarea.selectionStart;
    const end = contentTextarea.selectionEnd;
    const currentContent = contentTextarea.value;
    
    // Insert the markdown at cursor position
    const newContent = currentContent.substring(0, start) + imagePath + currentContent.substring(end);
    contentTextarea.value = newContent;
    
    // Set cursor position after the inserted text
    const newCursorPos = start + imagePath.length;
    contentTextarea.setSelectionRange(newCursorPos, newCursorPos);
    
    // Focus back to the textarea
    contentTextarea.focus();
    
    // Show temporary success feedback
    const button = event.target;
    const originalText = button.textContent;
    button.textContent = 'Inserted!';
    button.className = 'ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded';
    
    setTimeout(() => {
        button.textContent = originalText;
        button.className = 'ml-2 px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded';
    }, 2000);
};

// Save post as draft (global function for HTML onclick)
window.saveDraft = function() {
    // Get form data
    const form = document.getElementById('createPostForm');
    if (!form) {
        console.error('Create post form not found');
        return;
    }
    
    const formData = new FormData(form);
    formData.append('session_id', createPostSessionId);
    formData.append('action', 'create_post');
    formData.append('status', 'draft'); // Force status to draft
    
    // Add uploaded images to form data
    if (window.uploadedImages && window.uploadedImages.length > 0) {
        window.uploadedImages.forEach((image, index) => {
            formData.append(`images[${index}]`, image.file);
        });
    }
    
    // Hide any existing messages
    hideCreatePostMessages();
    
    // Show loading state
    showCreatePostLoading(true);
    
    // Save as draft
    saveDraftPost(formData);
};

// Save draft post function
async function saveDraftPost(formData) {
    try {
        // First, upload images if any
        let uploadedImageUrls = [];
        if (window.uploadedImages && window.uploadedImages.length > 0) {
            const imageFormData = new FormData();
            imageFormData.append('action', 'upload_image');
            imageFormData.append('session_id', createPostSessionId);
            imageFormData.append('csrf_token', formData.get('csrf_token'));
            
            window.uploadedImages.forEach((image, index) => {
                imageFormData.append(`images[${index}]`, image.file);
            });
            
            const imageResponse = await fetch('../admin-image-upload-proxy.php', {
                method: 'POST',
                body: imageFormData
            });
            
            const imageResult = await imageResponse.json();
            
            if (imageResult.success) {
                uploadedImageUrls = imageResult.uploaded_images.map(img => img.url);
                console.log('Images uploaded successfully for draft:', uploadedImageUrls);
            } else {
                showCreatePostError(`Image upload failed: ${imageResult.message}`);
                return;
            }
        }
        
        // Add uploaded image URLs to the post data
        if (uploadedImageUrls.length > 0) {
            formData.append('image_urls', JSON.stringify(uploadedImageUrls));
        }
        
        // Now create the draft post
        const response = await fetch('../admin-api-proxy.php', {
            method: 'POST',
            body: formData
        });
        
        // Check if response is ok and get response text first
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const responseText = await response.text();
        console.log('Raw response from server:', responseText);
        
        let result;
        try {
            result = JSON.parse(responseText);
        } catch (parseError) {
            console.error('Failed to parse JSON response:', parseError);
            console.error('Response text:', responseText);
            throw new Error('Server returned invalid response format. Check server logs for PHP errors.');
        }
        
        if (result.success) {
            showCreatePostSuccess('Draft saved successfully!');
            
            // Don't redirect - let user continue editing
            // Just clear the success message after a delay
            setTimeout(() => {
                hideCreatePostMessages();
            }, 3000);
        } else {
            showCreatePostError(result.message || 'An error occurred while saving the draft');
        }
        
    } catch (error) {
        console.error('Save draft error:', error);
        showCreatePostError('An error occurred while saving the draft. Please try again.');
    } finally {
        showCreatePostLoading(false);
    }
}

// Copy image path to clipboard (global function for HTML onclick) - kept for backward compatibility
window.copyImagePath = function(imagePath) {
    navigator.clipboard.writeText(imagePath).then(() => {
        // Show temporary success feedback
        const button = event.target;
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        button.className = 'ml-2 px-2 py-1 bg-green-600 text-white text-xs rounded';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.className = 'ml-2 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = imagePath;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        // Show feedback
        const button = event.target;
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        button.className = 'ml-2 px-2 py-1 bg-green-600 text-white text-xs rounded';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.className = 'ml-2 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded';
        }, 2000);
    });
};

// Remove image from preview and array (global function for HTML onclick)
window.removeImage = function(index) {
    if (window.uploadedImages && window.uploadedImages[index]) {
        // Remove from array
        window.uploadedImages.splice(index, 1);
        
        // Refresh preview
        const imagePreview = document.getElementById('imagePreview');
        const imageUrls = document.getElementById('imageUrls');
        const imageUrlList = document.getElementById('imageUrlList');
        
        if (imagePreview && imageUrls && imageUrlList) {
            imagePreview.innerHTML = '';
            imageUrlList.innerHTML = '';
            
            if (window.uploadedImages.length === 0) {
                imageUrls.classList.add('hidden');
            } else {
                // Re-create previews for remaining images
                window.uploadedImages.forEach((image, idx) => {
                    const previewDiv = document.createElement('div');
                    previewDiv.className = 'relative';
                    previewDiv.innerHTML = `
                        <img src="${image.preview}" alt="Preview ${idx + 1}" class="w-full h-24 object-cover rounded-lg">
                        <button type="button" onclick="removeImage(${idx})" class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 text-xs hover:bg-red-600">×</button>
                    `;
                    imagePreview.appendChild(previewDiv);
                });
                
                // Refresh the image paths display with markdown format
                const remainingFiles = window.uploadedImages.map(img => ({
                    name: img.original_name,
                    type: 'image/*'
                }));
                displaySelectedImagePaths(remainingFiles);
            }
        }
    }
}

// Update category color based on selected category
function updateCategoryColor() {
    const categorySelect = document.getElementById('category');
    const categoryColorSelect = document.getElementById('category_color');
    
    if (!categorySelect || !categoryColorSelect) return;
    
    const selectedCategory = categorySelect.value;
    
    if (!selectedCategory) {
        // Reset to default state if no category selected
        categoryColorSelect.innerHTML = '<option value="">Select a category first</option>';
        return;
    }
    
    // Define category-to-color mapping (consistent with utils.js)
    const categoryColors = {
        'Tech Trends': 'blue',
        'Web Dev': 'green',
        'Cybersecurity': 'red',
        'Data Analytics': 'purple',
        'AI Solutions': 'indigo'
    };
    
    // Get the default color for the selected category
    const defaultColor = categoryColors[selectedCategory] || 'blue';
    
    // Populate the category color dropdown with all available colors
    categoryColorSelect.innerHTML = '';
    
    // Add the default color first
    const defaultOption = document.createElement('option');
    defaultOption.value = defaultColor;
    defaultOption.textContent = defaultColor.charAt(0).toUpperCase() + defaultColor.slice(1);
    defaultOption.selected = true;
    categoryColorSelect.appendChild(defaultOption);
    
    // Add all other colors as options
    Object.entries(categoryColors).forEach(([category, color]) => {
        if (color !== defaultColor) {
            const option = document.createElement('option');
            option.value = color;
            option.textContent = color.charAt(0).toUpperCase() + color.slice(1);
            categoryColorSelect.appendChild(option);
        }
    });
}
