<?php
// Admin Posts Proxy - For local development
// This file calls the backend admin posts API and passes through the response

// Security headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://trifecta.systems'); // Restrict to production domain
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

// Security: Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

// Include the backend admin posts API
$backendApi = __DIR__ . '/../../backend/admin-posts.php';

if (!file_exists($backendApi)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Backend admin posts API not found']);
    exit();
}

// Include and execute the backend admin posts API
include $backendApi;
?>
