<?php
// Blog Parser Proxy - For local development
// This file calls the backend parser and passes through the response

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

// Include the backend parser
$backendParser = __DIR__ . '/../../backend/blog-parser.php';

if (!file_exists($backendParser)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Backend parser not found']);
    exit();
}

// Include and execute the backend parser
include $backendParser;
?> 