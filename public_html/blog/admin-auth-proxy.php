<?php
// Admin Authentication Proxy - For local development
// This file calls the backend admin auth and passes through the response

// Security headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://trifecta.systems');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');



// Security: Only allow POST and GET requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (!in_array($_SERVER['REQUEST_METHOD'], ['POST', 'GET'])) {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

// Include the backend admin auth
$backendAuth = '../../backend/admin-auth.php';

if (!file_exists($backendAuth)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Backend admin auth not found']);
    exit();
}

// Include and execute the backend admin auth
include $backendAuth;
?>
