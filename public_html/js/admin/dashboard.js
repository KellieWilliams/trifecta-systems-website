// admin/dashboard.js - Admin dashboard functionality
// This file contains only UI logic and delegates sensitive operations to secure backend endpoints

import { formatDate, getCategoryColor, getStatusColor, getStatusText } from '../utils.js';

// Admin dashboard functionality
let currentSessionId = null;

export function initializeAdminDashboard() {
    // Check session on page load
    checkSession();
    
    // Event listeners
    const logoutBtn = document.getElementById('logoutBtn');
    const refreshBtn = document.getElementById('refreshBtn');
    const retryBtn = document.getElementById('retryBtn');
    const refreshScheduledBtn = document.getElementById('refreshScheduledBtn');
    
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    if (refreshBtn) refreshBtn.addEventListener('click', loadPosts);
    if (retryBtn) retryBtn.addEventListener('click', loadPosts);
    if (refreshScheduledBtn) refreshScheduledBtn.addEventListener('click', loadScheduledPosts);
}

export async function checkSession() {
    // Get session ID from URL parameter or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    currentSessionId = urlParams.get('session_id') || localStorage.getItem('admin_session_id');
    
    if (!currentSessionId) {
        // No session, redirect to login
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch(`../admin-auth-proxy.php?action=check_session&session_id=${currentSessionId}`);
        const result = await response.json();
        
        if (result.success) {
            // Session is valid, show dashboard
            const usernameElement = document.getElementById('username');
            const userInfoElement = document.getElementById('userInfo');
            const logoutBtnElement = document.getElementById('logoutBtn');
            
            if (usernameElement) usernameElement.textContent = result.username;
            if (userInfoElement) userInfoElement.classList.remove('hidden');
            if (logoutBtnElement) logoutBtnElement.classList.remove('hidden');
            
            // Store session ID
            localStorage.setItem('admin_session_id', currentSessionId);
            
            // Generate CSRF token
            await generateCSRFToken();
            
            // Load posts
            loadPosts();
            loadScheduledPosts();
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

export async function loadPosts() {
    showDashboardLoading(true);
    hideDashboardError();
    hideDashboardEmpty();
    hideDashboardTable();
    
    try {
        const response = await fetch('../admin-posts-proxy.php?action=list');
        const posts = await response.json();
        
        if (Array.isArray(posts) && posts.length > 0) {
            displayPosts(posts);
            updateStats(posts);
        } else {
            showDashboardEmpty();
        }
        
    } catch (error) {
        console.error('Error loading posts:', error);
        showDashboardError();
    } finally {
        showDashboardLoading(false);
    }
}

export function displayPosts(posts) {
    const tableBody = document.getElementById('postsTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    posts.forEach(post => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-[#1e293b] transition-colors';
        
        const isOverdue = post.scheduled_time && new Date(post.scheduled_time) < new Date();
        
        row.innerHTML = `
            <td class="py-4 px-4">
                <div class="flex items-center space-x-3">
                    <div class="flex-shrink-0">
                        <span class="px-3 py-1 text-xs font-semibold text-white rounded-full ${getCategoryColor(post.category_color)}">
                            ${post.category}
                        </span>
                    </div>
                    <div>
                        <h3 class="text-white font-medium">${post.title}</h3>
                        <p class="text-gray-400 text-sm">${post.excerpt || post.description || ''}</p>
                    </div>
                </div>
            </td>
            <td class="py-4 px-4">
                <span class="text-gray-300 text-sm">${post.read_time} min read</span>
            </td>
            <td class="py-4 px-4">
                <span class="text-gray-300 text-sm">${formatDate(post.published_time)}</span>
            </td>
            <td class="py-4 px-4">
                <span class="px-3 py-1 text-xs font-semibold text-white rounded-full ${post.status === 'published' ? 'bg-green-500' : post.status === 'draft' ? 'bg-yellow-500' : 'bg-blue-500'}">
                    ${post.status === 'published' ? 'Published' : post.status === 'draft' ? 'Draft' : 'Scheduled'}
                </span>
            </td>
            <td class="py-4 px-4">
                <div class="flex space-x-2">
                    <a href="edit-post.html?slug=${post.slug}" class="text-blue-400 hover:text-blue-300 text-sm">
                        Edit
                    </a>
                    <button onclick="deletePost('${post.slug}')" class="text-red-400 hover:text-red-300 text-sm">
                        Delete
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    showDashboardTable();
}

export function updateStats(posts) {
    const totalPostsElement = document.getElementById('totalPosts');
    const publishedPostsElement = document.getElementById('publishedPosts');
    const draftPostsElement = document.getElementById('draftPosts');
    
    if (totalPostsElement) totalPostsElement.textContent = posts.length;
    
    const publishedCount = posts.filter(post => post.status === 'published').length;
    const draftCount = posts.filter(post => post.status === 'draft').length;
    
    if (publishedPostsElement) publishedPostsElement.textContent = publishedCount;
    if (draftPostsElement) draftPostsElement.textContent = draftCount;
}

export async function loadScheduledPosts() {
    showScheduledLoading(true);
    hideScheduledError();
    hideScheduledEmpty();
    hideScheduledTable();
    
    try {
        const response = await fetch('../admin-posts-proxy.php?action=scheduled');
        const posts = await response.json();
        
        if (Array.isArray(posts) && posts.length > 0) {
            displayScheduledPosts(posts);
            updateScheduledStats(posts);
        } else {
            showScheduledEmpty();
        }
        
    } catch (error) {
        console.error('Error loading scheduled posts:', error);
        showScheduledError();
    } finally {
        showScheduledLoading(false);
    }
}

export function displayScheduledPosts(posts) {
    const tableBody = document.getElementById('scheduledPostsTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    posts.forEach(post => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-[#1e293b] transition-colors';
        
        const isOverdue = new Date(post.scheduled_time) < new Date();
        
        row.innerHTML = `
            <td class="py-4 px-4">
                <div class="flex items-center space-x-3">
                    <div class="flex-shrink-0">
                        <span class="px-3 py-1 text-xs font-semibold text-white rounded-full ${getCategoryColor(post.category_color)}">
                            ${post.category}
                        </span>
                    </div>
                    <div>
                        <h3 class="text-white font-medium">${post.title}</h3>
                        <p class="text-gray-400 text-sm">${post.excerpt || post.description || ''}</p>
                    </div>
                </div>
            </td>
            <td class="py-4 px-4">
                <span class="text-gray-300 text-sm">${formatDate(post.scheduled_time)}</span>
            </td>
            <td class="py-4 px-4">
                <span class="text-gray-300 text-sm">${formatTime(post.scheduled_time)}</span>
            </td>
            <td class="py-4 px-4">
                <span class="px-3 py-1 text-xs font-semibold text-white rounded-full ${isOverdue ? 'bg-red-500' : 'bg-purple-500'}">
                    ${isOverdue ? 'Overdue' : 'Scheduled'}
                </span>
            </td>
            <td class="py-4 px-4">
                <div class="flex space-x-2">
                    <button onclick="unschedulePost('${post.slug}')" class="text-red-400 hover:text-red-300 text-sm">
                        Unschedule
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    showScheduledTable();
}

export function updateScheduledStats(scheduledPosts) {
    const scheduledPostsElement = document.getElementById('scheduledPosts');
    if (scheduledPostsElement) {
        scheduledPostsElement.textContent = scheduledPosts.length;
    }
}

export async function unschedulePost(slug) {
    if (!confirm(`Are you sure you want to unschedule this post? It will return to draft status.`)) {
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('action', 'unschedule_post');
        formData.append('session_id', currentSessionId);
        formData.append('slug', slug);
        
        const response = await fetch('../admin-api-proxy.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(result.message);
            // Reload both posts and scheduled posts
            loadPosts();
            loadScheduledPosts();
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Unschedule error:', error);
        alert('An error occurred while unscheduling the post. Please try again.');
    }
}

export async function deletePost(slug) {
    if (!confirm(`Are you sure you want to delete "${slug}"? This action cannot be undone.`)) {
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('action', 'delete_post');
        formData.append('session_id', currentSessionId);
        formData.append('slug', slug);
        
        const response = await fetch('../admin-api-proxy.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(result.message);
            loadPosts();
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Delete error:', error);
        alert('An error occurred while deleting the post. Please try again.');
    }
}

export async function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        try {
            const formData = new FormData();
            formData.append('action', 'logout');
            formData.append('session_id', currentSessionId);
            
            await fetch('../admin-auth-proxy.php', {
                method: 'POST',
                body: formData
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear session and redirect regardless of API response
            localStorage.removeItem('admin_session_id');
            window.location.href = 'login.html';
        }
    }
}

// Helper functions
function formatTime(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

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

// Dashboard UI Functions
function showDashboardLoading(show) {
    const loading = document.getElementById('loading');
    if (loading) {
        if (show) {
            loading.classList.remove('hidden');
        } else {
            loading.classList.add('hidden');
        }
    }
}

function showDashboardError() {
    const error = document.getElementById('error');
    if (error) error.classList.remove('hidden');
}

function hideDashboardError() {
    const error = document.getElementById('error');
    if (error) error.classList.add('hidden');
}

function showDashboardEmpty() {
    const empty = document.getElementById('empty');
    if (empty) empty.classList.remove('hidden');
}

function hideDashboardEmpty() {
    const empty = document.getElementById('empty');
    if (empty) empty.classList.add('hidden');
}

function showDashboardTable() {
    const table = document.getElementById('postsTable');
    if (table) table.classList.remove('hidden');
}

function hideDashboardTable() {
    const table = document.getElementById('postsTable');
    if (table) table.classList.add('hidden');
}

// Scheduled Posts UI Functions
function showScheduledLoading(show) {
    const loading = document.getElementById('scheduledLoading');
    if (loading) {
        if (show) {
            loading.classList.remove('hidden');
        } else {
            loading.classList.add('hidden');
        }
    }
}

function showScheduledTable() {
    const table = document.getElementById('scheduledPostsTable');
    if (table) table.classList.remove('hidden');
}

function hideScheduledTable() {
    const table = document.getElementById('scheduledPostsTable');
    if (table) table.classList.add('hidden');
}

function showScheduledEmpty() {
    const empty = document.getElementById('scheduledEmpty');
    if (empty) empty.classList.remove('hidden');
}

function hideScheduledEmpty() {
    const empty = document.getElementById('scheduledEmpty');
    if (empty) empty.classList.remove('hidden');
}

function hideScheduledError() {
    // Placeholder for future error handling
}
