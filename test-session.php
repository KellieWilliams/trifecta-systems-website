<?php
/**
 * Test Session File for XAMPP Localhost
 * This file helps diagnose PHP session issues
 */

// Set error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h2>PHP Session Diagnostic Tool</h2>";
echo "<p>Current Time: " . date('Y-m-d H:i:s') . "</p>";

// Start session
session_start();

echo "<h3>Session Information:</h3>";
echo "<ul>";
echo "<li><strong>Session ID:</strong> " . session_id() . "</li>";
echo "<li><strong>Session Name:</strong> " . session_name() . "</li>";
echo "<li><strong>Session Status:</strong> " . session_status() . "</li>";
echo "<li><strong>Session Save Path:</strong> " . session_save_path() . "</li>";
echo "<li><strong>Session Cookie Params:</strong> <pre>" . print_r(session_get_cookie_params(), true) . "</pre></li>";
echo "</ul>";

echo "<h3>Session Data:</h3>";
if (empty($_SESSION)) {
    echo "<p>No session data exists yet.</p>";
} else {
    echo "<pre>" . print_r($_SESSION, true) . "</pre>";
}

// Test session functionality
echo "<h3>Session Test:</h3>";
if (isset($_SESSION['test_counter'])) {
    $_SESSION['test_counter']++;
    echo "<p>Session test counter: " . $_SESSION['test_counter'] . " (incremented)</p>";
} else {
    $_SESSION['test_counter'] = 1;
    echo "<p>Session test counter: " . $_SESSION['test_counter'] . " (initialized)</p>";
}

if (isset($_SESSION['test_timestamp'])) {
    echo "<p>Session test timestamp: " . $_SESSION['test_timestamp'] . "</p>";
} else {
    $_SESSION['test_timestamp'] = date('Y-m-d H:i:s');
    echo "<p>Session test timestamp: " . $_SESSION['test_timestamp'] . " (initialized)</p>";
}

echo "<h3>PHP Configuration:</h3>";
echo "<ul>";
echo "<li><strong>PHP Version:</strong> " . phpversion() . "</li>";
echo "<li><strong>Session Save Handler:</strong> " . ini_get('session.save_handler') . "</li>";
echo "<li><strong>Session Use Cookies:</strong> " . ini_get('session.use_cookies') . "</li>";
echo "<li><strong>Session Use Only Cookies:</strong> " . ini_get('session.use_only_cookies') . "</li>";
echo "<li><strong>Session Cookie HTTP Only:</strong> " . ini_get('session.cookie_httponly') . "</li>";
echo "<li><strong>Session GC Max Lifetime:</strong> " . ini_get('session.gc_maxlifetime') . " seconds</li>";
echo "</ul>";

echo "<h3>File System Check:</h3>";
$sessionPath = session_save_path();
echo "<p>Session save path: " . $sessionPath . "</p>";

if (is_dir($sessionPath)) {
    echo "<p>✓ Session directory exists and is accessible</p>";
    
    // List session files
    $sessionFiles = glob($sessionPath . '/sess_*');
    echo "<p>Found " . count($sessionFiles) . " session files:</p>";
    if (!empty($sessionFiles)) {
        echo "<ul>";
        foreach (array_slice($sessionFiles, 0, 10) as $file) { // Show first 10
            $fileInfo = pathinfo($file);
            $fileSize = filesize($file);
            $fileTime = date('Y-m-d H:i:s', filemtime($file));
            echo "<li>" . $fileInfo['basename'] . " - Size: " . $fileSize . " bytes, Modified: " . $fileTime . "</li>";
        }
        if (count($sessionFiles) > 10) {
            echo "<li>... and " . (count($sessionFiles) - 10) . " more files</li>";
        }
        echo "</ul>";
    }
} else {
    echo "<p>✗ Session directory does not exist or is not accessible</p>";
}

echo "<h3>Browser Cookie Check:</h3>";
echo "<p>Check your browser's Developer Tools → Application/Storage → Cookies → localhost</p>";
echo "<p>Look for a cookie named: " . session_name() . "</p>";

echo "<h3>Instructions:</h3>";
echo "<ol>";
echo "<li>Refresh this page to see if the session counter increments</li>";
echo "<li>Check if the session ID changes on each refresh (it shouldn't)</li>";
echo "<li>Look for session files in: " . $sessionPath . "</li>";
echo "<li>Check browser cookies for session data</li>";
echo "</ol>";

echo "<hr>";
echo "<p><em>This file helps diagnose session issues. Remove it after testing.</em></p>";
?>

