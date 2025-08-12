<?php
// Admin API Proxy - For local development
// This file calls the backend admin API and passes through the response

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

// Include the backend admin API
$backendApi = '../../backend/admin-api.php';

if (!file_exists($backendApi)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Backend admin API not found']);
    exit();
}

// Include and execute the backend admin API
include $backendApi;
?>
