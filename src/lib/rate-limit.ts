import { db, verifications } from '@/lib/db';
import { eq, and, gt, lt } from 'drizzle-orm';
import crypto from 'crypto';

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxAttempts: number; // Maximum attempts per window
  keyPrefix: string; // Prefix for the rate limit key
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
    const windowStart = new Date(now.getTime() - config.windowMs);

    // Atomically check rate limit and record attempt to prevent race conditions
    const result = await db.transaction(async (tx) => {
      // Clean up expired rate limit records
      await tx.delete(verifications).where(
        and(
          eq(verifications.identifier, rateLimitKey),
          lt(verifications.expiresAt, windowStart)
        )
      );

      // Count recent attempts within the rate limit window
      const recentAttempts = await tx.query.verifications.findMany({
        where: and(
          eq(verifications.identifier, rateLimitKey),
          gt(verifications.expiresAt, windowStart)
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
    console.error('Rate limit check failed:', error);
    // On error, allow the request to proceed (fail open)
    return {
      success: true,
      remaining: config.maxAttempts - 1,
      resetTime: new Date(Date.now() + config.windowMs),
    };
  }
}

/**
 * Common rate limit configurations
 */
export const RATE_LIMITS = {
  PASSWORD_RESET: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxAttempts: 3,
    keyPrefix: 'password_reset',
  },
  LOGIN_ATTEMPTS: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxAttempts: 5,
    keyPrefix: 'login_attempts',
  },
  REGISTRATION: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxAttempts: 3,
    keyPrefix: 'registration',
  },
} as const;
