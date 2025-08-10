<?php
// Admin Authentication Handler
// This file handles login, logout, and session management for the blog admin portal

// Security headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://trifecta.systems'); // Restrict to your domain
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Security: Only allow POST and GET requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (!in_array($_SERVER['REQUEST_METHOD'], ['POST', 'GET'])) {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

// Define paths
$backendDir = __DIR__;
$credentialsFile = $backendDir . '/admin-credentials.json';
$sessionsDir = $backendDir . '/admin-sessions/';

// Create sessions directory if it doesn't exist
if (!is_dir($sessionsDir)) {
    mkdir($sessionsDir, 0755, true);
}

// Handle different actions
$action = $_POST['action'] ?? $_GET['action'] ?? '';

switch ($action) {
    case 'login':
        handleLogin();
        break;
    case 'logout':
        handleLogout();
        break;
    case 'check_session':
        checkSession();
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
        break;
}

function handleLogin() {
    global $credentialsFile;
    
    // Validate required fields
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';
    $csrfToken = $_POST['csrf_token'] ?? '';
    
    if (empty($username) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'Username and password are required']);
        return;
    }
    
    // Load credentials
    if (!file_exists($credentialsFile)) {
        // Create default admin credentials if file doesn't exist
        $defaultCredentials = [
            'username' => 'admin',
            'password_hash' => password_hash('admin123', PASSWORD_DEFAULT),
            'created' => date('Y-m-d H:i:s')
        ];
        file_put_contents($credentialsFile, json_encode($defaultCredentials, JSON_PRETTY_PRINT));
    }
    
    $credentials = json_decode(file_get_contents($credentialsFile), true);
    
    if (!$credentials) {
        echo json_encode(['success' => false, 'message' => 'Configuration error']);
        return;
    }
    
    // Verify credentials
    if ($username === $credentials['username'] && password_verify($password, $credentials['password_hash'])) {
        // Create session
        $sessionId = createSession($username);
        
        echo json_encode([
            'success' => true, 
            'message' => 'Login successful',
            'session_id' => $sessionId
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid username or password']);
    }
}

function handleLogout() {
    $sessionId = $_POST['session_id'] ?? $_GET['session_id'] ?? '';
    
    if (!empty($sessionId)) {
        deleteSession($sessionId);
    }
    
    echo json_encode(['success' => true, 'message' => 'Logged out successfully']);
}

function checkSession() {
    $sessionId = $_GET['session_id'] ?? '';
    
    if (empty($sessionId)) {
        echo json_encode(['success' => false, 'message' => 'No session provided']);
        return;
    }
    
    $session = getSession($sessionId);
    
    if ($session && isSessionValid($session)) {
        echo json_encode([
            'success' => true, 
            'message' => 'Session valid',
            'username' => $session['username']
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid or expired session']);
    }
}

function createSession($username) {
    global $sessionsDir;
    
    $sessionId = bin2hex(random_bytes(32));
    $sessionData = [
        'session_id' => $sessionId,
        'username' => $username,
        'created' => time(),
        'last_activity' => time()
    ];
    
    $sessionFile = $sessionsDir . $sessionId . '.json';
    file_put_contents($sessionFile, json_encode($sessionData, JSON_PRETTY_PRINT));
    
    return $sessionId;
}

function getSession($sessionId) {
    global $sessionsDir;
    
    $sessionFile = $sessionsDir . $sessionId . '.json';
    
    if (!file_exists($sessionFile)) {
        return null;
    }
    
    $sessionData = json_decode(file_get_contents($sessionFile), true);
    
    if (!$sessionData) {
        return null;
    }
    
    // Update last activity
    $sessionData['last_activity'] = time();
    file_put_contents($sessionFile, json_encode($sessionData, JSON_PRETTY_PRINT));
    
    return $sessionData;
}

function isSessionValid($session) {
    $maxSessionTime = 24 * 60 * 60; // 24 hours
    $currentTime = time();
    
    return ($currentTime - $session['last_activity']) < $maxSessionTime;
}

function deleteSession($sessionId) {
    global $sessionsDir;
    
    $sessionFile = $sessionsDir . $sessionId . '.json';
    
    if (file_exists($sessionFile)) {
        unlink($sessionFile);
    }
}

// Clean up old sessions (run occasionally)
function cleanupOldSessions() {
    global $sessionsDir;
    
    $maxSessionTime = 24 * 60 * 60; // 24 hours
    $currentTime = time();
    
    $files = glob($sessionsDir . '*.json');
    
    foreach ($files as $file) {
        $sessionData = json_decode(file_get_contents($file), true);
        
        if ($sessionData && ($currentTime - $sessionData['last_activity']) > $maxSessionTime) {
            unlink($file);
        }
    }
}

// Clean up old sessions (1 in 10 chance to run)
if (rand(1, 10) === 1) {
    cleanupOldSessions();
}
?>
