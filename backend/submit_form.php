<?php
// submit_form.php - Enhanced Security Version

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

// 3. Rate Limiting Implementation
function checkRateLimit($ip, $limit = null, $window = null) {
    // Use configurable values or defaults
    $limit = $limit ?? (defined('RATE_LIMIT_REQUESTS') ? RATE_LIMIT_REQUESTS : 5);
    $window = $window ?? (defined('RATE_LIMIT_WINDOW') ? RATE_LIMIT_WINDOW : 300);
    $cacheFile = sys_get_temp_dir() . '/rate_limit_' . md5($ip);
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

// 4. CSRF Protection
function validateCSRFToken($token) {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    if (empty($token) || empty($_SESSION['csrf_token'])) {
        return false;
    }
    
    // Check if token is expired
    $expiry = defined('CSRF_TOKEN_EXPIRY') ? CSRF_TOKEN_EXPIRY : 3600;
    if (time() - $_SESSION['csrf_token_time'] > $expiry) {
        unset($_SESSION['csrf_token']);
        unset($_SESSION['csrf_token_time']);
        return false;
    }
    
    return hash_equals($_SESSION['csrf_token'], $token);
}

// 5. Enhanced Input Validation
function validateInput($data) {
    $errors = [];
    
    // Name validation
    if (empty($data['name']) || strlen($data['name']) > 100) {
        $errors[] = 'Name must be between 1 and 100 characters';
    }
    
    // Email validation
    if (empty($data['email']) || !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'Valid email address is required';
    }
    
    // Phone validation (optional)
    if (!empty($data['phone'])) {
        // Remove formatting and validate as 10 digits
        $phoneDigits = preg_replace('/[^0-9]/', '', $data['phone']);
        if (strlen($phoneDigits) !== 10) {
            $errors[] = 'Phone number must be exactly 10 digits';
        }
    }
    
    // Message validation
    if (empty($data['message']) || strlen($data['message']) > 2000) {
        $errors[] = 'Message must be between 1 and 2000 characters';
    }
    
    // Check for suspicious content
    $suspiciousPatterns = [
        '/<script/i',
        '/javascript:/i',
        '/on\w+\s*=/i',
        '/<iframe/i',
        '/<object/i',
        '/<embed/i',
        '/<form/i',
        '/<input/i',
        '/<textarea/i',
        '/<select/i',
        '/<button/i',
        '/<link/i',
        '/<meta/i',
        '/vbscript:/i',
        '/data:text\/html/i',
        '/data:application\/javascript/i'
    ];
    
    foreach ($suspiciousPatterns as $pattern) {
        if (preg_match($pattern, $data['message']) || preg_match($pattern, $data['name'])) {
            $errors[] = 'Suspicious content detected';
            break;
        }
    }
    
    return $errors;
}

// 6. Get client IP (handles proxy scenarios)
function getClientIP() {
    $ipKeys = ['HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'HTTP_CLIENT_IP', 'REMOTE_ADDR'];
    foreach ($ipKeys as $key) {
        if (array_key_exists($key, $_SERVER) === true) {
            foreach (explode(',', $_SERVER[$key]) as $ip) {
                $ip = trim($ip);
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false) {
                    return $ip;
                }
            }
        }
    }
    return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}

// 7. Main processing logic
try {
    // Get client IP for rate limiting
    $clientIP = getClientIP();
    
    // Check rate limit
    if (!checkRateLimit($clientIP)) {
        $securityMonitor->logRateLimitViolation($clientIP, RATE_LIMIT_REQUESTS, RATE_LIMIT_WINDOW);
        error_log("Rate limit exceeded for IP: " . $clientIP);
        echo json_encode(['success' => false, 'message' => 'Too many requests. Please try again later.']);
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
    $name = trim($input_data['name'] ?? '');
    $phone = trim($input_data['phone'] ?? '');
    $email = trim($input_data['email'] ?? '');
    $message = trim($input_data['message'] ?? '');
    $recaptchaToken = $input_data['g-recaptcha-response'] ?? '';
    $csrfToken = $input_data['csrf_token'] ?? '';
    
    // Honeypot field validation
    $website = trim($input_data['website'] ?? '');
    $emailConfirm = trim($input_data['email_confirm'] ?? '');
    $phoneConfirm = trim($input_data['phone_confirm'] ?? '');
    
    // Check honeypot fields - if any are filled, it's likely a bot
    if (!empty($website) || !empty($emailConfirm) || !empty($phoneConfirm)) {
        $triggeredFields = [];
        if (!empty($website)) $triggeredFields[] = 'website';
        if (!empty($emailConfirm)) $triggeredFields[] = 'email_confirm';
        if (!empty($phoneConfirm)) $triggeredFields[] = 'phone_confirm';
        
        $securityMonitor->logHoneypotTrigger($clientIP, $triggeredFields);
        error_log("Honeypot field triggered for IP: " . $clientIP . " - Website: '$website', Email Confirm: '$emailConfirm', Phone Confirm: '$phoneConfirm'");
        echo json_encode(['success' => false, 'message' => 'Invalid form submission. Please try again.']);
        http_response_code(400);
        exit();
    }
    
    // Validate CSRF token
    if (!validateCSRFToken($csrfToken)) {
        $securityMonitor->logCSRFViolation($clientIP);
        error_log("CSRF token validation failed for IP: " . $clientIP);
        echo json_encode(['success' => false, 'message' => 'Security validation failed. Please refresh the page and try again.']);
        http_response_code(403);
        exit();
    }
    
    // Validate input
    $validationErrors = validateInput([
        'name' => $name,
        'email' => $email,
        'phone' => $phone,
        'message' => $message
    ]);
    
    if (!empty($validationErrors)) {
        echo json_encode(['success' => false, 'message' => implode(', ', $validationErrors)]);
        http_response_code(400);
        exit();
    }
    
    // Enhanced reCAPTCHA verification
    if (empty($recaptchaToken)) {
        error_log("Missing reCAPTCHA token from IP: " . $clientIP);
        echo json_encode(['success' => false, 'message' => 'Security verification required. Please try again.']);
        http_response_code(400);
        exit();
    }
    
    // Verify reCAPTCHA with enhanced error handling
    $recaptcha_url = 'https://www.google.com/recaptcha/api/siteverify';
    $recaptcha_data = [
        'secret' => RECAPTCHA_SECRET_KEY,
        'response' => $recaptchaToken,
        'remoteip' => $clientIP
    ];
    
    $recaptcha_context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => 'Content-Type: application/x-www-form-urlencoded',
            'content' => http_build_query($recaptcha_data),
            'timeout' => 10
        ]
    ]);
    
    $recaptcha_response = file_get_contents($recaptcha_url, false, $recaptcha_context);
    $recaptcha_result = json_decode($recaptcha_response);
    
    if (!$recaptcha_result || !$recaptcha_result->success) {
        $errorCodes = $recaptcha_result->{'error-codes'} ?? ['unknown_error'];
        error_log("reCAPTCHA verification failed for IP: " . $clientIP . ", Errors: " . implode(', ', $errorCodes));
        echo json_encode(['success' => false, 'message' => 'Security verification failed. Please try again.']);
        http_response_code(401);
        exit();
    }
    
    // Enhanced score threshold (configurable)
    $scoreThreshold = defined('RECAPTCHA_SCORE_THRESHOLD') ? RECAPTCHA_SCORE_THRESHOLD : 0.7;
    if ($recaptcha_result->score < $scoreThreshold) {
        error_log("reCAPTCHA score too low for IP: " . $clientIP . ", Score: " . $recaptcha_result->score . ", Threshold: " . $scoreThreshold);
        echo json_encode(['success' => false, 'message' => 'Security verification failed. Please try again.']);
        http_response_code(401);
        exit();
    }
    
    // Log successful submission
    error_log("Contact form submission from IP: " . $clientIP . ", Email: " . $email . ", Score: " . $recaptcha_result->score);
    
    // 8. Send Email with enhanced security
    $email_body = "New Contact Form Submission\n";
    $email_body .= "==========================\n\n";
    $email_body .= "Name: " . htmlspecialchars($name) . "\n";
    $email_body .= "Email: " . htmlspecialchars($email) . "\n";
    $email_body .= "Phone: " . (empty($phone) ? "N/A" : htmlspecialchars($phone)) . "\n";
    $email_body .= "IP Address: " . $clientIP . "\n";
    $email_body .= "User Agent: " . ($_SERVER['HTTP_USER_AGENT'] ?? 'Unknown') . "\n";
    $email_body .= "Timestamp: " . date('Y-m-d H:i:s T') . "\n";
    $email_body .= "reCAPTCHA Score: " . $recaptcha_result->score . "\n";
    $email_body .= "reCAPTCHA Action: " . ($recaptcha_result->action ?? 'N/A') . "\n\n";
    $email_body .= "Message:\n" . htmlspecialchars($message) . "\n";
    
    $headers = [
        'From: ' . FROM_EMAIL,
        'Reply-To: ' . $email,
        'Content-Type: text/plain; charset=UTF-8',
        'X-Mailer: Trifecta.Systems Contact Form',
        'X-IP: ' . $clientIP
    ];
    
    $email_sent = mail(TO_EMAIL, 'New Contact Form Submission - Trifecta.Systems', $email_body, implode("\r\n", $headers));
    
    if ($email_sent) {
        echo json_encode(['success' => true, 'message' => 'Your message has been sent successfully! We\'ll get back to you soon.']);
        http_response_code(200);
    } else {
        error_log("Failed to send email from contact form for IP: " . $clientIP);
        echo json_encode(['success' => false, 'message' => 'Failed to send your message. Please try again later.']);
        http_response_code(500);
    }
    
} catch (Exception $e) {
    error_log("Contact form error: " . $e->getMessage() . " for IP: " . ($clientIP ?? 'unknown'));
    echo json_encode(['success' => false, 'message' => 'An unexpected error occurred. Please try again later.']);
    http_response_code(500);
}
?>
    