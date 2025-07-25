<?php
// csrf_token.php - CSRF Token Management

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Load configuration
    try {
        require_once __DIR__ . '/../config/secrets.php';
    } catch (Throwable $e) {
    http_response_code(500);
    exit('Configuration error');
}

// Generate CSRF token
function generateCSRFToken() {
    $expiry = defined('CSRF_TOKEN_EXPIRY') ? CSRF_TOKEN_EXPIRY : 3600;
    
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        $_SESSION['csrf_token_time'] = time();
    }
    
    // Regenerate token if it's expired
    if (time() - $_SESSION['csrf_token_time'] > $expiry) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        $_SESSION['csrf_token_time'] = time();
    }
    
    return $_SESSION['csrf_token'];
}

// Validate CSRF token
function validateCSRFToken($token) {
    $expiry = defined('CSRF_TOKEN_EXPIRY') ? CSRF_TOKEN_EXPIRY : 3600;
    
    if (empty($token) || empty($_SESSION['csrf_token'])) {
        return false;
    }
    
    // Check if token is expired
    if (time() - $_SESSION['csrf_token_time'] > $expiry) {
        unset($_SESSION['csrf_token']);
        unset($_SESSION['csrf_token_time']);
        return false;
    }
    
    return hash_equals($_SESSION['csrf_token'], $token);
}

// Handle AJAX requests for token generation
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: https://trifecta.systems');
    header('Access-Control-Allow-Methods: GET');
    
    echo json_encode([
        'csrf_token' => generateCSRFToken(),
        'timestamp' => $_SESSION['csrf_token_time']
    ]);
}
?> 