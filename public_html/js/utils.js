// utils.js - Shared utility functions used across the application

// Email validation function
export function validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}

// Phone number mask function
export function formatPhoneNumber(input) {
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

// Date formatting function
export function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Time formatting function
export function formatTime(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

// Category color mapping
export function getCategoryColor(color) {
    const colors = {
        'blue': 'bg-blue-500',
        'green': 'bg-green-500',
        'red': 'bg-red-500',
        'yellow': 'bg-yellow-500',
        'purple': 'bg-purple-500',
        'pink': 'bg-pink-500',
        'indigo': 'bg-indigo-500',
        'gray': 'bg-gray-500',
        'orange': 'bg-orange-500'
    };
    return colors[color] || 'bg-blue-500';
}

// Status color mapping
export function getStatusColor(status) {
    const colors = {
        'published': 'bg-green-500',
        'draft': 'bg-yellow-500',
        'scheduled': 'bg-purple-500'
    };
    return colors[status] || 'bg-gray-500';
}

// Status text mapping
export function getStatusText(status) {
    const texts = {
        'published': 'Published',
        'draft': 'Draft',
        'scheduled': 'Scheduled'
    };
    return texts[status] || 'Unknown';
}

// CSRF token fetching
export async function getCSRFToken() {
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
