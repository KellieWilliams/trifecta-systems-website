<?php
// get_recaptcha_key.php - Server-side reCAPTCHA site key provider

// Set security headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://trifecta.systems');
header('Access-Control-Allow-Methods: GET');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

// Load configuration
    try {
        require_once __DIR__ . '/../config/secrets.php';
    } catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Configuration error']);
    exit();
}

// Return the site key (this should be different from the secret key)
// In production, you might want to store this separately or use environment variables
echo json_encode([
    'site_key' => RECAPTCHA_SITE_KEY ?? '6Lc0HhorAAAAACu9xCMytFjXm_Tolkrv3m-QU9OW'
]);
?> 