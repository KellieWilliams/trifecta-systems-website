<?php
/**
 * Data Rights Request Handler for Trifecta.Systems
 * Processes GDPR and CCPA data subject rights requests
 */

// Define security monitor access
define('SECURITY_MONITOR_ACCESS', true);

// 1. Set up CORS (Cross-Origin Resource Sharing)
header("Access-Control-Allow-Origin: https://trifecta.systems");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, X-CSRF-Token");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 2. Load configuration and security monitor
try {
    require_once __DIR__ . '/../config/secrets.php';
    require_once __DIR__ . '/security_monitor.php';
} catch (Throwable $e) {
    error_log("Failed to load configuration: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Server configuration error. Please try again later.']);
    http_response_code(500);
    exit();
}

// 3. Rate limiting for data rights requests (stricter than contact form)
function checkDataRightsRateLimit($ip) {
    $limit = 3; // 3 requests per day
    $window = 86400; // 24 hours
    $cacheFile = sys_get_temp_dir() . '/data_rights_rate_limit_' . md5($ip);
    $currentTime = time();
    
    if (file_exists($cacheFile)) {
        $data = json_decode(file_get_contents($cacheFile), true);
        if ($data && $currentTime - $data['timestamp'] < $window) {
            if ($data['count'] >= $limit) {
                return false; // Rate limit exceeded
            }
            $data['count']++;
        } else {
            $data = ['timestamp' => $currentTime, 'count' => 1];
        }
    } else {
        $data = ['timestamp' => $currentTime, 'count' => 1];
    }
    
    file_put_contents($cacheFile, json_encode($data));
    return true;
}

// 4. Validate data rights request
function validateDataRightsRequest($data) {
    $errors = [];
    
    // Required fields
    $requiredFields = ['requestType', 'firstName', 'lastName', 'email', 'verificationMethod'];
    foreach ($requiredFields as $field) {
        if (empty($data[$field])) {
            $errors[] = ucfirst($field) . ' is required';
        }
    }
    
    // Email validation
    if (!empty($data['email']) && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'Valid email address is required';
    }
    
    // Request type validation
    $validRequestTypes = ['access', 'deletion', 'portability', 'correction', 'objection', 'withdrawal'];
    if (!empty($data['requestType']) && !in_array($data['requestType'], $validRequestTypes)) {
        $errors[] = 'Invalid request type';
    }
    
    // Verification method validation
    $validVerificationMethods = ['email', 'phone', 'document'];
    if (!empty($data['verificationMethod']) && !in_array($data['verificationMethod'], $validVerificationMethods)) {
        $errors[] = 'Invalid verification method';
    }
    
    // Phone validation (if provided)
    if (!empty($data['phone'])) {
        $phoneDigits = preg_replace('/[^0-9]/', '', $data['phone']);
        if (strlen($phoneDigits) !== 10) {
            $errors[] = 'Phone number must be exactly 10 digits';
        }
    }
    
    return $errors;
}

// 5. Generate unique request ID
function generateRequestId() {
    return 'DRR-' . date('Ymd') . '-' . strtoupper(substr(md5(uniqid()), 0, 8));
}

// 6. Log data rights request
function logDataRightsRequest($requestId, $data, $ip) {
    $logEntry = [
        'timestamp' => date('Y-m-d H:i:s'),
        'request_id' => $requestId,
        'ip_address' => $ip,
        'request_type' => $data['requestType'],
        'user_email' => $data['email'],
        'verification_method' => $data['verificationMethod'],
        'status' => 'pending'
    ];
    
    $logFile = sys_get_temp_dir() . '/data_rights_requests.log';
    file_put_contents($logFile, json_encode($logEntry) . "\n", FILE_APPEND | LOCK_EX);
}

// 7. Send confirmation email
function sendDataRightsConfirmation($requestId, $data) {
    $to = $data['email'];
    $subject = "Data Rights Request Confirmation - Request ID: $requestId";
    
    $message = "
Dear {$data['firstName']} {$data['lastName']},

Thank you for submitting your data rights request. We have received your request and will process it in accordance with applicable privacy laws.

Request Details:
- Request ID: $requestId
- Request Type: " . ucfirst($data['requestType']) . "
- Date Submitted: " . date('Y-m-d H:i:s') . "

What happens next:
1. We will verify your identity within 24 hours
2. We will process your request within 30 days (or 45 days with notice)
3. We will provide you with the requested information or confirmation

If you have any questions about your request, please contact us at info@trifecta.systems and include your Request ID: $requestId

Best regards,
Trifecta.Systems Team
    ";
    
    $headers = "From: noreply@trifecta.systems\r\n";
    $headers .= "Reply-To: info@trifecta.systems\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    
    return mail($to, $subject, $message, $headers);
}

// 8. Main processing logic
try {
    // Get client IP for rate limiting
    $clientIP = getClientIP();
    
    // Check rate limit for data rights requests
    if (!checkDataRightsRateLimit($clientIP)) {
        $securityMonitor->logRateLimitViolation($clientIP, 3, 86400);
        error_log("Data rights rate limit exceeded for IP: " . $clientIP);
        echo json_encode(['success' => false, 'message' => 'Too many data rights requests. Please try again later.']);
        http_response_code(429);
        exit();
    }
    
    // Get and validate input data
    $input_data = json_decode(file_get_contents("php://input"), true);
    
    if (!$input_data) {
        echo json_encode(['success' => false, 'message' => 'Invalid request format.']);
        http_response_code(400);
        exit();
    }
    
    // Extract and sanitize data
    $requestType = trim($input_data['requestType'] ?? '');
    $firstName = trim($input_data['firstName'] ?? '');
    $lastName = trim($input_data['lastName'] ?? '');
    $email = trim($input_data['email'] ?? '');
    $phone = trim($input_data['phone'] ?? '');
    $verificationMethod = trim($input_data['verificationMethod'] ?? '');
    $additionalDetails = trim($input_data['additionalDetails'] ?? '');
    $recaptchaToken = $input_data['g-recaptcha-response'] ?? '';
    $csrfToken = $input_data['csrf_token'] ?? '';
    
    // Honeypot field validation
    $website = trim($input_data['website'] ?? '');
    $emailConfirm = trim($input_data['email_confirm'] ?? '');
    $phoneConfirm = trim($input_data['phone_confirm'] ?? '');
    
    // Check honeypot fields
    if (!empty($website) || !empty($emailConfirm) || !empty($phoneConfirm)) {
        $triggeredFields = [];
        if (!empty($website)) $triggeredFields[] = 'website';
        if (!empty($emailConfirm)) $triggeredFields[] = 'email_confirm';
        if (!empty($phoneConfirm)) $triggeredFields[] = 'phone_confirm';
        
        $securityMonitor->logHoneypotTrigger($clientIP, $triggeredFields);
        error_log("Honeypot field triggered for data rights request from IP: " . $clientIP);
        echo json_encode(['success' => false, 'message' => 'Invalid form submission. Please try again.']);
        http_response_code(400);
        exit();
    }
    
    // Validate CSRF token
    if (!validateCSRFToken($csrfToken)) {
        $securityMonitor->logCSRFViolation($clientIP);
        error_log("CSRF token validation failed for data rights request from IP: " . $clientIP);
        echo json_encode(['success' => false, 'message' => 'Security validation failed. Please refresh the page and try again.']);
        http_response_code(403);
        exit();
    }
    
    // Validate reCAPTCHA
    if (empty($recaptchaToken)) {
        echo json_encode(['success' => false, 'message' => 'Security verification required. Please try again.']);
        http_response_code(400);
        exit();
    }
    
    $recaptcha_url = 'https://www.google.com/recaptcha/api/siteverify';
    $recaptcha_data = [
        'secret' => RECAPTCHA_SECRET_KEY,
        'response' => $recaptchaToken
    ];
    
    $recaptcha_options = [
        'http' => [
            'header' => "Content-type: application/x-www-form-urlencoded\r\n",
            'method' => 'POST',
            'content' => http_build_query($recaptcha_data)
        ]
    ];
    
    $recaptcha_context = stream_context_create($recaptcha_options);
    $recaptcha_result = file_get_contents($recaptcha_url, false, $recaptcha_context);
    $recaptcha_response = json_decode($recaptcha_result, true);
    
    if (!$recaptcha_response['success'] || $recaptcha_response['score'] < RECAPTCHA_SCORE_THRESHOLD) {
        error_log("reCAPTCHA verification failed for data rights request from IP: " . $clientIP . " - Score: " . ($recaptcha_response['score'] ?? 'unknown'));
        echo json_encode(['success' => false, 'message' => 'Security verification failed. Please try again.']);
        http_response_code(400);
        exit();
    }
    
    // Validate request data
    $validationErrors = validateDataRightsRequest([
        'requestType' => $requestType,
        'firstName' => $firstName,
        'lastName' => $lastName,
        'email' => $email,
        'phone' => $phone,
        'verificationMethod' => $verificationMethod
    ]);
    
    if (!empty($validationErrors)) {
        echo json_encode(['success' => false, 'message' => implode(', ', $validationErrors)]);
        http_response_code(400);
        exit();
    }
    
    // Generate unique request ID
    $requestId = generateRequestId();
    
    // Log the request
    logDataRightsRequest($requestId, [
        'requestType' => $requestType,
        'firstName' => $firstName,
        'lastName' => $lastName,
        'email' => $email,
        'phone' => $phone,
        'verificationMethod' => $verificationMethod,
        'additionalDetails' => $additionalDetails
    ], $clientIP);
    
    // Send confirmation email
    $emailSent = sendDataRightsConfirmation($requestId, [
        'firstName' => $firstName,
        'lastName' => $lastName,
        'email' => $email,
        'requestType' => $requestType
    ]);
    
    // Log successful request
    if (defined('LOG_SUBMISSIONS') && LOG_SUBMISSIONS) {
        error_log("Data rights request submitted successfully - Request ID: $requestId, Type: $requestType, Email: $email, IP: $clientIP");
    }
    
    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'Your data rights request has been submitted successfully.',
        'request_id' => $requestId,
        'email_sent' => $emailSent
    ]);
    
} catch (Exception $e) {
    error_log("Error processing data rights request: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'An error occurred while processing your request. Please try again later.']);
    http_response_code(500);
}
?> 