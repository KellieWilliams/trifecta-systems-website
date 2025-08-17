<?php
/**
 * Test file to check backend API accessibility
 */

echo "=== Backend Access Test ===\n";

// Test 1: Check if we can read the backend file
$backendFile = '../backend/chatbot-api.php';
echo "1. Checking backend file accessibility...\n";

if (file_exists($backendFile)) {
    echo "   ✓ Backend file exists\n";
    
    if (is_readable($backendFile)) {
        echo "   ✓ Backend file is readable\n";
    } else {
        echo "   ✗ Backend file is NOT readable\n";
    }
} else {
    echo "   ✗ Backend file does not exist\n";
}

// Test 2: Check current working directory
echo "\n2. Current working directory:\n";
echo "   " . getcwd() . "\n";

// Test 3: Check if we can include the backend file
echo "\n3. Testing backend file inclusion...\n";
try {
    // Capture any output
    ob_start();
    
    // Try to include the backend file
    include $backendFile;
    
    $output = ob_get_clean();
    echo "   ✓ Backend file included successfully\n";
    
    if (!empty($output)) {
        echo "   Output length: " . strlen($output) . " characters\n";
    }
    
} catch (Exception $e) {
    echo "   ✗ Error including backend file: " . $e->getMessage() . "\n";
} catch (Error $e) {
    echo "   ✗ Fatal error including backend file: " . $e->getMessage() . "\n";
}

// Test 4: Check file permissions
echo "\n4. File permissions:\n";
if (file_exists($backendFile)) {
    $perms = fileperms($backendFile);
    echo "   Backend file permissions: " . substr(sprintf('%o', $perms), -4) . "\n";
    
    $owner = posix_getpwuid(fileowner($backendFile));
    echo "   Backend file owner: " . ($owner['name'] ?? 'unknown') . "\n";
}

echo "\n=== Test Complete ===\n";
?>
