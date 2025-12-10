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
 * Handles IPv4, IPv6, and other identifier formats safely
 */
export function anonymizeIdentifier(identifier: string): string {
  // For IP:email format, find the last ':' to separate IP from email
  // This handles IPv6 addresses which contain multiple colons
  const lastColonIndex = identifier.lastIndexOf(':');
  
  if (lastColonIndex > 0 && lastColonIndex < identifier.length - 1) {
    const ipPortion = identifier.substring(0, lastColonIndex).trim();
    const emailPortion = identifier.substring(lastColonIndex + 1).trim();
    
    // Validate that the email portion contains exactly one '@'
    const atCount = (emailPortion.match(/@/g) || []).length;
    if (atCount === 1) {
      const emailParts = emailPortion.split('@');
      const localPart = emailParts[0];
      const domain = emailParts[1];
      
      // Safely handle short local parts
      let maskedLocal;
      if (localPart.length <= 2) {
        maskedLocal = '***';
      } else if (localPart.length <= 4) {
        maskedLocal = localPart.substring(0, 1) + '***';
      } else {
        maskedLocal = localPart.substring(0, 2) + '***';
      }
      
      return `${ipPortion}:${maskedLocal}@${domain}`;
    }
  }
  
  // Fallback: For other formats or invalid email, show first 3 chars + ***
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

/**
 * Test cases for anonymizeIdentifier function
 * These demonstrate correct handling of various address formats
 */
export const ANONYMIZE_TEST_CASES = {
  // IPv4 addresses
  ipv4: {
    input: '192.168.1.1:user@example.com',
    expected: '192.168.1.1:us***@example.com'
  },
  
  // IPv6 addresses (multiple colons)
  ipv6: {
    input: '2001:0db8:85a3:0000:0000:8a2e:0370:7334:user@example.com',
    expected: '2001:0db8:85a3:0000:0000:8a2e:0370:7334:us***@example.com'
  },
  
  // IPv6 compressed format
  ipv6Compressed: {
    input: '2001:db8::1:user@example.com',
    expected: '2001:db8::1:us***@example.com'
  },
  
  // Short email local parts
  shortLocal: {
    input: '192.168.1.1:a@example.com',
    expected: '192.168.1.1:***@example.com'
  },
  
  // Medium email local parts
  mediumLocal: {
    input: '192.168.1.1:abc@example.com',
    expected: '192.168.1.1:a***@example.com'
  },
  
  // Invalid email format (no @)
  invalidEmail: {
    input: '192.168.1.1:notanemail',
    expected: '192***'
  },
  
  // Multiple @ symbols (invalid)
  multipleAt: {
    input: '192.168.1.1:user@domain@com',
    expected: '192***'
  },
  
  // No colon separator
  noColon: {
    input: 'someidentifier',
    expected: 'som***'
  }
};