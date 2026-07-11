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

$backendApi = __DIR__ . '/../../backend/admin-api.php';

if (!file_exists($backendApi)) {
    // Fallback for unusual include paths
    $backendApi = dirname(__DIR__, 2) . '/backend/admin-api.php';
}

if (!file_exists($backendApi)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Backend admin API not found']);
    exit();
}

try {
    include $backendApi;
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
