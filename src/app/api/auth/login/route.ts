import { NextRequest, NextResponse } from 'next/server';
import { db, users } from '@/lib/db';
import { eq, sql } from 'drizzle-orm';
import { createSession } from '@/lib/session';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;



    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Rate limiting for login attempts
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const normalizedEmail = email.trim().toLowerCase();
    const rateLimitIdentifier = `${clientIP}:${normalizedEmail}`;
    
    const rateLimitResult = await checkRateLimit(rateLimitIdentifier, RATE_LIMITS.LOGIN_ATTEMPTS);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: rateLimitResult.error },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMITS.LOGIN_ATTEMPTS.maxAttempts.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toISOString(),
          }
        }
      );
    }

    // Find user using case-insensitive comparison
    const user = await db.query.users.findFirst({
      where: sql`lower(${users.email}) = ${normalizedEmail}`,
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user has a password hash (new users) or is legacy user
    if (!user.passwordHash) {
      // Legacy user without password hash - use generic error to prevent email enumeration
      // Note: This prevents attackers from discovering valid email addresses in our system
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create secure session
    await createSession({
      id: user.id,
      name: user.name,
      email: user.email,
      workspaceId: user.workspaceId,
    });



    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        workspaceId: user.workspaceId,
        onboardingCompleted: user.onboardingCompleted,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    );
  }
}