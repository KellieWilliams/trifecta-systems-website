<?php
/**
 * Security Monitor for Trifecta.Systems
 * Logs and monitors security events
 */

// Prevent direct access
if (!defined('SECURITY_MONITOR_ACCESS')) {
    http_response_code(403);
    exit('Direct access not allowed');
}

class SecurityMonitor {
    private $logFile;
    private $alertThreshold = 10; // Number of events before alert
    private $timeWindow = 3600; // 1 hour window
    
    public function __construct($logFile = null) {
        $this->logFile = $logFile ?? sys_get_temp_dir() . '/security_events.log';
    }
    
    /**
     * Log security event
     */
    public function logEvent($eventType, $details, $ip = null, $severity = 'INFO') {
        $ip = $ip ?? $this->getClientIP();
        $timestamp = date('Y-m-d H:i:s');
        $logEntry = sprintf(
            "[%s] [%s] [%s] [%s] %s\n",
            $timestamp,
            $severity,
            $ip,
            $eventType,
            json_encode($details)
        );
        
        file_put_contents($this->logFile, $logEntry, FILE_APPEND | LOCK_EX);
        
        // Check if we need to send an alert
        $this->checkAlertThreshold($ip, $eventType);
    }
    
    /**
     * Log failed login attempts
     */
    public function logFailedAttempt($ip, $reason) {
        $this->logEvent('FAILED_ATTEMPT', [
            'reason' => $reason,
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown'
        ], $ip, 'WARNING');
    }
    
    /**
     * Log suspicious activity
     */
    public function logSuspiciousActivity($ip, $activity, $details = []) {
        $this->logEvent('SUSPICIOUS_ACTIVITY', array_merge([
            'activity' => $activity
        ], $details), $ip, 'WARNING');
    }
    
    /**
     * Log rate limit violations
     */
    public function logRateLimitViolation($ip, $limit, $window) {
        $this->logEvent('RATE_LIMIT_VIOLATION', [
            'limit' => $limit,
            'window' => $window,
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown'
        ], $ip, 'WARNING');
    }
    
    /**
     * Log CSRF violations
     */
    public function logCSRFViolation($ip) {
        $this->logEvent('CSRF_VIOLATION', [
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown',
            'referer' => $_SERVER['HTTP_REFERER'] ?? 'Unknown'
        ], $ip, 'WARNING');
    }
    
    /**
     * Log honeypot triggers
     */
    public function logHoneypotTrigger($ip, $triggeredFields) {
        $this->logEvent('HONEYPOT_TRIGGER', [
            'triggered_fields' => $triggeredFields,
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown'
        ], $ip, 'WARNING');
    }
    
    /**
     * Check if IP has exceeded alert threshold
     */
    private function checkAlertThreshold($ip, $eventType) {
        $recentEvents = $this->getRecentEvents($ip, $this->timeWindow);
        $eventCount = count($recentEvents);
        
        if ($eventCount >= $this->alertThreshold) {
            $this->sendSecurityAlert($ip, $eventCount, $recentEvents);
        }
    }
    
    /**
     * Get recent events for an IP
     */
    private function getRecentEvents($ip, $timeWindow) {
        if (!file_exists($this->logFile)) {
            return [];
        }
        
        $events = [];
        $cutoffTime = time() - $timeWindow;
        
        $lines = file($this->logFile, FILE_IGNORE_NEW_LINES);
        foreach ($lines as $line) {
            if (preg_match('/\[([^\]]+)\] \[([^\]]+)\] \[([^\]]+)\] \[([^\]]+)\] (.+)/', $line, $matches)) {
                $timestamp = strtotime($matches[1]);
                $severity = $matches[2];
                $logIp = $matches[3];
                $eventType = $matches[4];
                $details = json_decode($matches[5], true);
                
                if ($logIp === $ip && $timestamp >= $cutoffTime) {
                    $events[] = [
                        'timestamp' => $timestamp,
                        'severity' => $severity,
                        'event_type' => $eventType,
                        'details' => $details
                    ];
                }
            }
        }
        
        return $events;
    }
    
    /**
     * Send security alert (placeholder for email/SMS integration)
     */
    private function sendSecurityAlert($ip, $eventCount, $events) {
        $alertMessage = sprintf(
            "SECURITY ALERT: IP %s has triggered %d security events in the last hour.\n",
            $ip,
            $eventCount
        );
        
        // Log the alert
        $this->logEvent('SECURITY_ALERT', [
            'ip' => $ip,
            'event_count' => $eventCount,
            'events' => array_slice($events, -5) // Last 5 events
        ], $ip, 'ALERT');
        
        // TODO: Integrate with email/SMS service
        // mail(ADMIN_EMAIL, 'Security Alert - Trifecta.Systems', $alertMessage);
    }
    
    /**
     * Get client IP address
     */
    private function getClientIP() {
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
    
    /**
     * Get security statistics
     */
    public function getSecurityStats($hours = 24) {
        if (!file_exists($this->logFile)) {
            return [];
        }
        
        $stats = [
            'total_events' => 0,
            'failed_attempts' => 0,
            'suspicious_activities' => 0,
            'rate_limit_violations' => 0,
            'csrf_violations' => 0,
            'honeypot_triggers' => 0,
            'unique_ips' => [],
            'top_ips' => []
        ];
        
        $cutoffTime = time() - ($hours * 3600);
        $ipCounts = [];
        
        $lines = file($this->logFile, FILE_IGNORE_NEW_LINES);
        foreach ($lines as $line) {
            if (preg_match('/\[([^\]]+)\] \[([^\]]+)\] \[([^\]]+)\] \[([^\]]+)\] (.+)/', $line, $matches)) {
                $timestamp = strtotime($matches[1]);
                $severity = $matches[2];
                $ip = $matches[3];
                $eventType = $matches[4];
                
                if ($timestamp >= $cutoffTime) {
                    $stats['total_events']++;
                    $stats['unique_ips'][$ip] = true;
                    
                    if (!isset($ipCounts[$ip])) {
                        $ipCounts[$ip] = 0;
                    }
                    $ipCounts[$ip]++;
                    
                    switch ($eventType) {
                        case 'FAILED_ATTEMPT':
                            $stats['failed_attempts']++;
                            break;
                        case 'SUSPICIOUS_ACTIVITY':
                            $stats['suspicious_activities']++;
                            break;
                        case 'RATE_LIMIT_VIOLATION':
                            $stats['rate_limit_violations']++;
                            break;
                        case 'CSRF_VIOLATION':
                            $stats['csrf_violations']++;
                            break;
                        case 'HONEYPOT_TRIGGER':
                            $stats['honeypot_triggers']++;
                            break;
                    }
                }
            }
        }
        
        // Get top IPs by event count
        arsort($ipCounts);
        $stats['top_ips'] = array_slice($ipCounts, 0, 10, true);
        $stats['unique_ips'] = array_keys($stats['unique_ips']);
        
        return $stats;
    }
}

// Initialize security monitor
$securityMonitor = new SecurityMonitor();
?> 