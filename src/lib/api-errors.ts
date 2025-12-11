import { NextResponse } from 'next/server';

/**
 * Standardized API error responses that don't leak sensitive information
 */
export const API_ERRORS = {
  // Authentication & Authorization
  UNAUTHORIZED: {
    message: 'Access denied',
    status: 401,
  },
  FORBIDDEN: {
    message: 'Insufficient permissions',
    status: 403,
  },
  
  // Client Errors
  BAD_REQUEST: {
    message: 'Invalid request',
    status: 400,
  },
  NOT_FOUND: {
    message: 'Resource not found',
    status: 404,
  },
  CONFLICT: {
    message: 'Resource already exists',
    status: 409,
  },
  RATE_LIMITED: {
    message: 'Too many requests',
    status: 429,
  },
  
  // Server Errors
  INTERNAL_ERROR: {
    message: 'Service temporarily unavailable',
    status: 500,
  },
  SERVICE_UNAVAILABLE: {
    message: 'Service unavailable',
    status: 503,
  },
} as const;

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  errorType: keyof typeof API_ERRORS,
  customMessage?: string
): NextResponse {
  const error = API_ERRORS[errorType];
  
  return NextResponse.json(
    { 
      error: customMessage || error.message,
      code: errorType.toLowerCase()
    },
    { status: error.status }
  );
}

/**
 * Log security events without exposing sensitive information
 */
export function logSecurityEvent(
  event: string,
  details: Record<string, any> = {},
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
): void {
  // In production, this should integrate with your monitoring system
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    severity,
    // Only log non-sensitive details
    details: {
      userAgent: details.userAgent ? 'present' : 'missing',
      ip: details.ip ? 'present' : 'missing',
      endpoint: details.endpoint,
      method: details.method,
    },
  };
  
  switch (severity) {
    case 'critical':
      console.error('🚨 CRITICAL SECURITY EVENT:', logEntry);
      break;
    case 'high':
      console.error('⚠️ HIGH SECURITY EVENT:', logEntry);
      break;
    case 'medium':
      console.warn('⚡ SECURITY EVENT:', logEntry);
      break;
    case 'low':
      console.info('ℹ️ SECURITY EVENT:', logEntry);
      break;
  }
}