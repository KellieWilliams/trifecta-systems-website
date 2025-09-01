<?php
// Admin Image Upload Proxy
// Securely handles image uploads for the admin panel

// Security headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://trifecta.systems');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Security: Only allow POST and OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit(json_encode(['success' => false, 'message' => 'Method not allowed']));
}

// Include the backend admin API
require_once '../backend/admin-api.php';

// Check if admin API exists
if (!function_exists('handleImageUpload')) {
    http_response_code(500);
    exit(json_encode(['success' => false, 'message' => 'Backend functionality not available']));
}

// Handle the image upload request
try {
    $result = handleImageUpload($_POST, $_FILES);
    echo json_encode($result);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
