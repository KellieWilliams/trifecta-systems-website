<?php
// Contact Form Submission Proxy
// This file calls the backend form handler and passes through the response

// Security headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://trifecta.systems');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Security: Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

// Include the backend form handler
$backendForm = __DIR__ . '/../backend/submit_form.php';

if (!file_exists($backendForm)) {
    error_log("Form Proxy Error: Backend file not found at: " . $backendForm);
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Backend form handler not found']);
    exit();
}

// Include and execute the backend form handler with error handling
try {
    include $backendForm;
} catch (Throwable $e) {
    error_log("Form Proxy Error: Failed to include backend file. Error: " . $e->getMessage() . " File: " . $backendForm);
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Backend form handler execution failed']);
    exit();
}
?>
