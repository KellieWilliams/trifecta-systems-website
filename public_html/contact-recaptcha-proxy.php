<?php
// Contact Form reCAPTCHA Site Key Proxy
// This file calls the backend reCAPTCHA key handler and passes through the response

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

// Include the backend reCAPTCHA key handler
$backendRecaptcha = __DIR__ . '/../backend/get_recaptcha_key.php';

if (!file_exists($backendRecaptcha)) {
    error_log("reCAPTCHA Proxy Error: Backend file not found at: " . $backendRecaptcha);
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Backend reCAPTCHA handler not found']);
    exit();
}

// Include and execute the backend reCAPTCHA handler with error handling
try {
    include $backendRecaptcha;
} catch (Throwable $e) {
    error_log("reCAPTCHA Proxy Error: Failed to include backend file. Error: " . $e->getMessage() . " File: " . $backendRecaptcha);
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Backend reCAPTCHA handler execution failed']);
    exit();
}
?>

