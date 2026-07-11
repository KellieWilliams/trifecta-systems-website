<?php
// Admin Image Upload Proxy
// Securely handles image uploads for the admin panel via the backend admin API

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://trifecta.systems');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

$backendApi = __DIR__ . '/../../backend/admin-api.php';

if (!file_exists($backendApi)) {
    error_log('Image Upload Proxy Error: Backend file not found at: ' . $backendApi);
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Backend admin API not found']);
    exit();
}

try {
    include $backendApi;
} catch (Throwable $e) {
    error_log('Image Upload Proxy Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Backend image upload failed']);
    exit();
}
