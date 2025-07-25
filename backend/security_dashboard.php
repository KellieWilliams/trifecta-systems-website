<?php
/**
 * Security Dashboard for Trifecta.Systems
 * Provides security analytics and monitoring
 */

// Prevent direct access
if (!defined('SECURITY_MONITOR_ACCESS')) {
    http_response_code(403);
    exit('Direct access not allowed');
}

// Load security monitor
require_once __DIR__ . '/security_monitor.php';

// Set JSON response
header('Content-Type: application/json');

// Get security statistics
$stats = $securityMonitor->getSecurityStats(24); // Last 24 hours

// Calculate additional metrics
$totalEvents = $stats['total_events'];
$uniqueIPs = count($stats['unique_ips']);
$threatLevel = 'LOW';

if ($totalEvents > 50) {
    $threatLevel = 'HIGH';
} elseif ($totalEvents > 20) {
    $threatLevel = 'MEDIUM';
}

// Calculate event distribution
$eventDistribution = [
    'failed_attempts' => $stats['failed_attempts'],
    'suspicious_activities' => $stats['suspicious_activities'],
    'rate_limit_violations' => $stats['rate_limit_violations'],
    'csrf_violations' => $stats['csrf_violations'],
    'honeypot_triggers' => $stats['honeypot_triggers']
];

// Get top threat IPs
$topThreatIPs = [];
foreach ($stats['top_ips'] as $ip => $count) {
    $topThreatIPs[] = [
        'ip' => $ip,
        'event_count' => $count,
        'threat_level' => $count > 10 ? 'HIGH' : ($count > 5 ? 'MEDIUM' : 'LOW')
    ];
}

// Prepare dashboard data
$dashboardData = [
    'timestamp' => date('Y-m-d H:i:s'),
    'period' => '24 hours',
    'overview' => [
        'total_events' => $totalEvents,
        'unique_ips' => $uniqueIPs,
        'threat_level' => $threatLevel,
        'average_events_per_ip' => $uniqueIPs > 0 ? round($totalEvents / $uniqueIPs, 2) : 0
    ],
    'event_distribution' => $eventDistribution,
    'top_threat_ips' => array_slice($topThreatIPs, 0, 5),
    'security_metrics' => [
        'rate_limit_effectiveness' => $stats['rate_limit_violations'] > 0 ? 'ACTIVE' : 'NONE',
        'honeypot_effectiveness' => $stats['honeypot_triggers'] > 0 ? 'ACTIVE' : 'NONE',
        'csrf_protection' => $stats['csrf_violations'] > 0 ? 'VIOLATIONS_DETECTED' : 'CLEAN',
        'suspicious_activity_detection' => $stats['suspicious_activities'] > 0 ? 'DETECTED' : 'NONE'
    ],
    'recommendations' => []
];

// Generate security recommendations
if ($threatLevel === 'HIGH') {
    $dashboardData['recommendations'][] = 'Consider implementing IP blocking for repeated violations';
    $dashboardData['recommendations'][] = 'Review and tighten rate limiting thresholds';
}

if ($stats['honeypot_triggers'] > 0) {
    $dashboardData['recommendations'][] = 'Bot activity detected - honeypot fields are working';
}

if ($stats['csrf_violations'] > 0) {
    $dashboardData['recommendations'][] = 'CSRF attacks detected - ensure all forms use CSRF protection';
}

if ($stats['suspicious_activities'] > 0) {
    $dashboardData['recommendations'][] = 'Suspicious content detected - review input validation';
}

if (empty($dashboardData['recommendations'])) {
    $dashboardData['recommendations'][] = 'Security systems are functioning normally';
}

// Output JSON
echo json_encode($dashboardData, JSON_PRETTY_PRINT);
?> 