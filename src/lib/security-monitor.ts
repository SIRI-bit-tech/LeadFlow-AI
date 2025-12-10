/**
 * Security monitoring utilities for production environments
 * 
 * In production, these should integrate with your monitoring system:
 * - Datadog, New Relic, Sentry for alerting
 * - CloudWatch, Grafana for dashboards
 * - PagerDuty for incident response
 */

export interface SecurityEvent {
  type: 'RATE_LIMIT_FAILURE' | 'BRUTE_FORCE_ATTEMPT' | 'DATABASE_ERROR';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  identifier: string; // Anonymized identifier
  metadata: Record<string, any>;
  timestamp: string;
}

/**
 * Log security events with appropriate severity levels
 */
export function logSecurityEvent(event: SecurityEvent): void {
  const logEntry = {
    ...event,
    environment: process.env.NODE_ENV,
    service: 'leadflow-auth',
  };

  switch (event.severity) {
    case 'CRITICAL':
      console.error('🚨 CRITICAL SECURITY EVENT:', logEntry);
      // In production: Send to PagerDuty, Slack alerts, etc.
      break;
    case 'HIGH':
      console.error('⚠️ HIGH SECURITY EVENT:', logEntry);
      // In production: Send to security team, create incident
      break;
    case 'MEDIUM':
      console.warn('⚡ MEDIUM SECURITY EVENT:', logEntry);
      // In production: Log to security dashboard
      break;
    case 'LOW':
      console.info('ℹ️ LOW SECURITY EVENT:', logEntry);
      // In production: Log for analysis
      break;
  }
}

/**
 * Anonymize sensitive identifiers for logging
 */
export function anonymizeIdentifier(identifier: string): string {
  // For IP:email format, hide the email part
  if (identifier.includes(':')) {
    const [ip, email] = identifier.split(':');
    const emailParts = email.split('@');
    if (emailParts.length === 2) {
      return `${ip}:${emailParts[0].substring(0, 2)}***@${emailParts[1]}`;
    }
  }
  
  // For other formats, show first 3 chars + ***
  return identifier.length > 3 ? `${identifier.substring(0, 3)}***` : '***';
}

/**
 * Check if we're experiencing a potential attack pattern
 */
export function detectAttackPattern(events: SecurityEvent[]): boolean {
  const recentEvents = events.filter(
    event => Date.now() - new Date(event.timestamp).getTime() < 5 * 60 * 1000 // 5 minutes
  );

  // Multiple rate limit failures could indicate coordinated attack
  const rateLimitFailures = recentEvents.filter(e => e.type === 'RATE_LIMIT_FAILURE');
  
  return rateLimitFailures.length > 10; // Threshold for attack detection
}