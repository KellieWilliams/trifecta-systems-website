<?php
/**
 * Chatbot Proxy - Secure gateway to the backend chatbot API
 * This file acts as a bridge between the frontend and the secure backend
 */

// Set headers for API
header('Content-Type: application/json');

// Allow multiple origins for development and production
$allowedOrigins = [
    'https://trifecta.systems',
    'https://www.trifecta.systems',
    'http://localhost:8000',
    'http://127.0.0.1:8000'
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
}

header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Basic input validation
$input = json_decode(file_get_contents('php://input'), true);
if (!$input || !isset($input['prompt']) || empty(trim($input['prompt']))) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid request: prompt is required']);
    exit();
}

// Include and execute the backend API directly
$backendFile = __DIR__ . '/../backend/chatbot-api.php';

if (!file_exists($backendFile)) {
    error_log("Chatbot Proxy: Backend file not found: " . $backendFile);
    http_response_code(500);
    echo json_encode(['error' => 'Backend API not available']);
    exit();
}

// Capture the output from the backend
ob_start();

try {
    // Include the backend file
    include $backendFile;
    
    // Get the captured output
    $response = ob_get_clean();
    
    // The backend should have already set the appropriate headers and response code
    echo $response;
    
} catch (Exception $e) {
    ob_end_clean();
    error_log("Chatbot Proxy Exception: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Backend API error: ' . $e->getMessage()]);
} catch (Error $e) {
    ob_end_clean();
    error_log("Chatbot Proxy Fatal Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Backend API fatal error: ' . $e->getMessage()]);
}
?>
