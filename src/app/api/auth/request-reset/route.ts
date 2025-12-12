import { NextRequest, NextResponse } from 'next/server';
import { db, users, verifications } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Database-backed rate limiting (serverless-compatible)
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const rateLimitIdentifier = `${clientIP}:${email}`;
    
    const rateLimitResult = await checkRateLimit(rateLimitIdentifier, RATE_LIMITS.PASSWORD_RESET);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: rateLimitResult.error },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMITS.PASSWORD_RESET.maxAttempts.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toISOString(),
          }
        }
      );
    }

    // Always return success to prevent email enumeration
    // But only actually send reset email if user exists
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (user) {
      // Generate secure reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

      // Atomically clean up existing reset tokens and store new token
      // This prevents race conditions between delete and insert operations
      await db.transaction(async (tx) => {
        // Clean up any existing reset tokens for this user (but not rate limit records)
        // Rate limit records have identifier pattern: password_reset:ip:email
        // Reset tokens have identifier pattern: email (no prefix)
        await tx.delete(verifications).where(
          eq(verifications.identifier, email)
        );

        // Store reset token
        await tx.insert(verifications).values({
          identifier: email,
          value: resetToken,
          expiresAt,
        });
      });

      // TODO: Send reset email with token
      // In a real application, you would send an email here with a link like:
      // https://yourapp.com/reset-password?token=${resetToken}
      
      // Privacy-safe logging - no PII exposed
      if (process.env.NODE_ENV === 'development') {
        console.log('Password reset token generated for user:', user.id);
      }
    }

    // Always return the same response regardless of whether user exists
    // This prevents email enumeration attacks
    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { error: 'Failed to process reset request' },
      { status: 500 }
    );
  }
}