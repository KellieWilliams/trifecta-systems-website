<?php
// Contact Form CSRF Token Proxy
// This file calls the backend CSRF token handler and passes through the response

// Security headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://trifecta.systems');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

// Security: Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

// Include the backend CSRF token handler
$backendCSRF = __DIR__ . '/../backend/csrf_token.php';

if (!file_exists($backendCSRF)) {
    error_log("CSRF Proxy Error: Backend file not found at: " . $backendCSRF);
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Backend CSRF handler not found']);
    exit();
}

// Include and execute the backend CSRF handler with error handling
try {
    include $backendCSRF;
} catch (Throwable $e) {
    error_log("CSRF Proxy Error: Failed to include backend file. Error: " . $e->getMessage() . " File: " . $backendCSRF);
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Backend CSRF handler execution failed']);
    exit();
}
?>
