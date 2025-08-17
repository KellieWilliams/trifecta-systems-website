<?php
// Admin Login JavaScript Proxy
// Securely serves the admin login JavaScript from the backend directory

// Security headers
header('Content-Type: application/javascript');
header('Access-Control-Allow-Origin: https://trifecta.systems');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Security: Only allow GET and OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    exit('Method not allowed');
}

// Path to the JavaScript file in the backend
$jsFile = '../../backend/admin-login.js';

if (!file_exists($jsFile)) {
    http_response_code(404);
    exit('JavaScript file not found');
}

// Read and output the JavaScript file
$jsContent = file_get_contents($jsFile);
if ($jsContent === false) {
    http_response_code(500);
    exit('Failed to read JavaScript file');
}

// Output the JavaScript content
echo $jsContent;
?>
