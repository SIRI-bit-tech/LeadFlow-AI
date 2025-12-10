import { db, verifications } from '@/lib/db';
import { eq, and, gt, lt } from 'drizzle-orm';
import { logSecurityEvent, anonymizeIdentifier } from '@/lib/security-monitor';
import crypto from 'crypto';

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxAttempts: number; // Maximum attempts per window
  keyPrefix: string; // Prefix for the rate limit key
  failClosed?: boolean; // If true, deny requests on database errors (default: true for security)
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: Date;
  error?: string;
}

/**
 * Database-backed rate limiting for serverless environments
 * Uses the verifications table to store rate limit attempts
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  try {
    const rateLimitKey = `${config.keyPrefix}:${identifier}`;
    const now = new Date();

    // Atomically check rate limit and record attempt to prevent race conditions
    const result = await db.transaction(async (tx) => {
      // Clean up expired rate limit records (where expiresAt < now)
      await tx.delete(verifications).where(
        and(
          eq(verifications.identifier, rateLimitKey),
          lt(verifications.expiresAt, now)
        )
      );

      // Count recent attempts that are still valid (where expiresAt > now)
      const recentAttempts = await tx.query.verifications.findMany({
        where: and(
          eq(verifications.identifier, rateLimitKey),
          gt(verifications.expiresAt, now)
        ),
      });

      const remaining = Math.max(0, config.maxAttempts - recentAttempts.length);
      const resetTime = new Date(now.getTime() + config.windowMs);

      if (recentAttempts.length >= config.maxAttempts) {
        return {
          success: false,
          remaining: 0,
          resetTime,
          error: 'Rate limit exceeded. Please try again later.',
        };
      }

      // Record this attempt
      const attemptExpiry = new Date(now.getTime() + config.windowMs);
      await tx.insert(verifications).values({
        identifier: rateLimitKey,
        value: `attempt_${crypto.randomUUID()}`, // Unique value for each attempt
        expiresAt: attemptExpiry,
      });

      return {
        success: true,
        remaining: remaining - 1, // Subtract 1 for the attempt we just recorded
        resetTime,
      };
    });

    return result;
  } catch (error) {
    // Log security event for monitoring and alerting
    logSecurityEvent({
      type: 'RATE_LIMIT_FAILURE',
      severity: 'HIGH',
      identifier: anonymizeIdentifier(identifier),
      metadata: {
        keyPrefix: config.keyPrefix,
        error: error instanceof Error ? error.message : 'Unknown error',
        failClosed: config.failClosed !== false,
      },
      timestamp: new Date().toISOString(),
    });

    // Fail-closed by default for security (configurable per endpoint)
    const shouldFailClosed = config.failClosed !== false; // Default to true
    
    if (shouldFailClosed) {
      // Deny request on database errors to prevent abuse during outages
      return {
        success: false,
        remaining: 0,
        resetTime: new Date(Date.now() + config.windowMs),
        error: 'Service temporarily unavailable. Please try again later.',
      };
    } else {
      // Fail-open mode: Allow request but log security warning
      logSecurityEvent({
        type: 'RATE_LIMIT_FAILURE',
        severity: 'MEDIUM',
        identifier: anonymizeIdentifier(identifier),
        metadata: {
          keyPrefix: config.keyPrefix,
          action: 'BYPASSED_DUE_TO_ERROR',
          warning: 'Rate limiting disabled due to database error',
        },
        timestamp: new Date().toISOString(),
      });
      
      return {
        success: true,
        remaining: config.maxAttempts - 1,
        resetTime: new Date(Date.now() + config.windowMs),
      };
    }
  }
}

/**
 * Common rate limit configurations
 */
export const RATE_LIMITS = {
  // Security-critical: Fail-closed to prevent brute force during outages
  PASSWORD_RESET: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxAttempts: 3,
    keyPrefix: 'password_reset',
    failClosed: true, // Deny requests on database errors
  },
  LOGIN_ATTEMPTS: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxAttempts: 5,
    keyPrefix: 'login_attempts',
    failClosed: true, // Deny requests on database errors
  },
  REGISTRATION: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxAttempts: 3,
    keyPrefix: 'registration',
    failClosed: true, // Deny requests on database errors
  },
  // Non-critical: Could use fail-open if availability is more important
  API_GENERAL: {
    windowMs: 60 * 1000, // 1 minute
    maxAttempts: 100,
    keyPrefix: 'api_general',
    failClosed: false, // Allow requests on database errors (with logging)
  },
} as const;
