import { NextRequest, NextResponse } from 'next/server';
import { db, users, verifications } from '@/lib/db';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

// Rate limiting - simple in-memory store (in production, use Redis or database)
const resetAttempts = new Map<string, { count: number; lastAttempt: number }>();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 3;

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

    // Rate limiting check
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = `${clientIP}:${email}`;
    const now = Date.now();
    const attempts = resetAttempts.get(rateLimitKey);

    if (attempts) {
      // Clean up old attempts
      if (now - attempts.lastAttempt > RATE_LIMIT_WINDOW) {
        resetAttempts.delete(rateLimitKey);
      } else if (attempts.count >= MAX_ATTEMPTS) {
        return NextResponse.json(
          { error: 'Too many reset attempts. Please try again later.' },
          { status: 429 }
        );
      }
    }

    // Update rate limiting counter
    const currentAttempts = attempts ? attempts.count + 1 : 1;
    resetAttempts.set(rateLimitKey, { count: currentAttempts, lastAttempt: now });

    // Always return success to prevent email enumeration
    // But only actually send reset email if user exists
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (user) {
      // Generate secure reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

      // Clean up any existing reset tokens for this user
      await db.delete(verifications).where(
        eq(verifications.identifier, email)
      );

      // Store reset token
      await db.insert(verifications).values({
        identifier: email,
        value: resetToken,
        expiresAt,
      });

      // TODO: Send reset email with token
      // In a real application, you would send an email here with a link like:
      // https://yourapp.com/reset-password?token=${resetToken}
      
      // Privacy-safe logging - no PII exposed
      console.log('Password reset token generated for user:', user.id);
      
      // For development only - remove in production
      if (process.env.NODE_ENV === 'development') {
        console.log(`Reset link: ${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`);
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