    <?php
    // submit_form.php

    // 1. Set up CORS (Cross-Origin Resource Sharing)
    // This is important if your HTML/JS is served from a different subdomain or directory
    // than your PHP script. For example, if your HTML is at example.com
    // and your PHP script is called via example.com/submit_form.php, you might not need it,
    // but if your HTML is local (file://) or a different domain, you will.
    // In a production environment, ensure 'https://trifecta.systems' is your exact domain.
    header("Access-Control-Allow-Origin: https://trifecta.systems");
    header("Access-Control-Allow-Methods: POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");
    header("Content-Type: application/json"); // Ensure the response is JSON

    // Handle preflight OPTIONS request (important for complex CORS requests)
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }

    // 2. Load reCAPTCHA Secret Key and Email Configuration from a secure location
    // The '__DIR__' constant ensures this path is relative to the current script's directory.
    // Adjust '/../../config/secrets.php' if your 'config' folder is structured differently relative to 'backend'.
    // For example, if 'backend' is in public_html and 'config' is parallel to public_html, this path is common.
    try {
        require_once __DIR__ . '/../../config/secrets.php';
    } catch (Throwable $e) {
        // Log the error for internal debugging, but don't expose sensitive info to the user
        error_log("Failed to load secrets.php: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Server configuration error. Please try again later.']);
        http_response_code(500); // Internal Server Error
        exit();
    }

    // You can now use RECAPTCHA_SECRET_KEY, TO_EMAIL, FROM_EMAIL defined in secrets.php
    define('EMAIL_SUBJECT', 'New Contact Form Submission from Your Website');

    // 3. Get input data from the POST request
    // Using file_get_contents("php://input") for JSON data from fetch()
    $input_data = json_decode(file_get_contents("php://input"), true);

    $name = $input_data['name'] ?? '';
    $phone = $input_data['phone'] ?? '';
    $email = $input_data['email'] ?? '';
    $message = $input_data['message'] ?? '';
    $recaptchaToken = $input_data['g-recaptcha-response'] ?? '';

    // 4. Basic Server-Side Validation
    if (empty($name) || empty($email) || empty($message)) {
        echo json_encode(['success' => false, 'message' => 'Please fill in all required fields.']);
        http_response_code(400); // Bad Request
        exit();
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['success' => false, 'message' => 'Invalid email format.']);
        http_response_code(400);
        exit();
    }

    // 5. reCAPTCHA Verification
    if (empty($recaptchaToken)) {
        echo json_encode(['success' => false, 'message' => 'reCAPTCHA token is missing.']);
        http_response_code(400);
        exit();
    }

    $recaptcha_url = 'https://www.google.com/recaptcha/api/siteverify';
    $recaptcha_response = file_get_contents($recaptcha_url . '?secret=' . RECAPTCHA_SECRET_KEY . '&response=' . $recaptchaToken);
    $recaptcha_data = json_decode($recaptcha_response);

    if (!$recaptcha_data->success || $recaptcha_data->score < 0.5) { // Adjust score threshold as needed
        // Log the error for your own debugging, but don't expose sensitive info to the user
        error_log("reCAPTCHA verification failed. Score: " . ($recaptcha_data->score ?? 'N/A') . ", Errors: " . implode(', ', $recaptcha_data->{'error-codes'} ?? []));
        echo json_encode(['success' => false, 'message' => 'reCAPTCHA verification failed. Please try again.']);
        http_response_code(401); // Unauthorized
        exit();
    }

    // 6. Process the form data (Send Email)
    // At this point, reCAPTCHA has passed, and your form data is valid.
    $email_body = "Name: " . htmlspecialchars($name) . "\n";
    $email_body .= "Email: " . htmlspecialchars($email) . "\n";
    $email_body .= "Phone: " . (empty($phone) ? "N/A" : htmlspecialchars($phone)) . "\n\n";
    $email_body .= "Message:\n" . htmlspecialchars($message) . "\n\n";
    $email_body .= "reCAPTCHA Score: " . $recaptcha_data->score . "\n";
    $email_body .= "reCAPTCHA Action: " . ($recaptcha_data->action ?? 'N/A') . "\n";

    $headers = "From: " . FROM_EMAIL . "\r\n";
    $headers .= "Reply-To: " . $email . "\r\n"; // $email is validated by filter_var, reducing header injection risk
    $headers .= "Content-type: text/plain; charset=UTF-8\r\n";

    // Use mail() function. Ensure your Namecheap hosting allows mail() and configure SPF/DKIM for FROM_EMAIL.
    if (mail(TO_EMAIL, EMAIL_SUBJECT, $email_body, $headers)) {
        echo json_encode(['success' => true, 'message' => 'Your message has been sent successfully!']);
        http_response_code(200); // OK
    } else {
        error_log("Failed to send email from contact form. Mail function failed.");
        echo json_encode(['success' => false, 'message' => 'Failed to send your message. Please try again later.']);
        http_response_code(500); // Internal Server Error
    }

    ?>
    