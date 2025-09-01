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

// Try to resolve the absolute path
$absolutePath = realpath($backendApi);
if ($absolutePath === false) {
    // Fallback to absolute path
    $backendApi = dirname(__DIR__, 2) . '/backend/admin-api.php';
}

// Debug: log the path and check if file exists
error_log("Admin API Proxy - Backend path: " . $backendApi);
error_log("Admin API Proxy - Absolute path: " . $absolutePath);
error_log("Admin API Proxy - File exists: " . (file_exists($backendApi) ? 'Yes' : 'No'));
error_log("Admin API Proxy - Current directory: " . __DIR__);

if (!file_exists($backendApi)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Backend admin API not found']);
    exit();
}

// Include and execute the backend admin API
error_log("Admin API Proxy - About to include: " . $backendApi);

try {
    include $backendApi;
    error_log("Admin API Proxy - Backend API included successfully");
} catch (Exception $e) {
    error_log("Admin API Proxy - Exception during include: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Backend API error: ' . $e->getMessage()]);
} catch (Error $e) {
    error_log("Admin API Proxy - Fatal error during include: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Backend API fatal error: ' . $e->getMessage()]);
}
?>
