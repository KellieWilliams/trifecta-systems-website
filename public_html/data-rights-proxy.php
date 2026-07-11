<?php
// Data Rights Request Proxy
// Calls the backend data rights handler and passes through the response

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://trifecta.systems');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

$backendFile = __DIR__ . '/../backend/data_rights_request.php';

if (!file_exists($backendFile)) {
    error_log('Data Rights Proxy Error: Backend file not found at: ' . $backendFile);
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Backend data rights handler not found']);
    exit();
}

try {
    include $backendFile;
} catch (Throwable $e) {
    error_log('Data Rights Proxy Error: ' . $e->getMessage() . ' File: ' . $backendFile);
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Backend data rights handler execution failed']);
    exit();
}
