import { cookies } from 'next/headers';
import { db, users, sessions } from '@/lib/db';
import { eq, and, gt, lt } from 'drizzle-orm';
import { SignJWT, jwtVerify } from 'jose';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  workspaceId: string;
  onboardingCompleted?: boolean;
}

const JWT_SECRET = new TextEncoder().encode(process.env.BETTER_AUTH_SECRET!);
const SESSION_DURATION = 60 * 60 * 24 * 7; // 7 days in seconds

export async function createSession(user: SessionUser): Promise<string> {
  try {
    // Generate secure session token
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + SESSION_DURATION * 1000);

    // Store session in database
    await db.insert(sessions).values({
      id: crypto.randomUUID(),
      userId: user.id,
      token: sessionToken,
      expiresAt,
      ipAddress: '', // You can get this from request headers if needed
      userAgent: '', // You can get this from request headers if needed
    });

    // Create JWT token containing session reference
    const jwtToken = await new SignJWT({ 
      sessionToken,
      userId: user.id,
      workspaceId: user.workspaceId 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(Math.floor(Date.now() / 1000) + SESSION_DURATION)
      .sign(JWT_SECRET);

    // Set secure HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('auth-token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION,
      path: '/',
    });

    return sessionToken;
  } catch (error) {
    console.error('Error creating session:', error);
    throw new Error('Failed to create session');
  }
}

export async function getSession(): Promise<{ user: SessionUser } | null> {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token');
    
    if (!authToken) {
      return null;
    }

    // Verify JWT token
    const { payload } = await jwtVerify(authToken.value, JWT_SECRET);
    const { sessionToken, userId } = payload as { 
      sessionToken: string; 
      userId: string; 
      workspaceId: string; 
    };

    // Verify session exists in database and hasn't expired
    const session = await db.query.sessions.findFirst({
      where: and(
        eq(sessions.token, sessionToken),
        eq(sessions.userId, userId),
        gt(sessions.expiresAt, new Date())
      ),
    });

    if (!session) {
      // Session expired or doesn't exist, clear cookie
      await destroySession();
      return null;
    }

    // Get user data
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      // User doesn't exist, clear session
      await destroySession();
      return null;
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        workspaceId: user.workspaceId,
        onboardingCompleted: user.onboardingCompleted || false,
      }
    };
  } catch (error) {
    console.error('Session verification error:', error);
    // Clear invalid session
    await destroySession();
    return null;
  }
}

export async function destroySession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token');
    
    if (authToken) {
      try {
        // Verify token to get session info
        const { payload } = await jwtVerify(authToken.value, JWT_SECRET);
        const { sessionToken } = payload as { sessionToken: string };

        // Remove session from database
        await db.delete(sessions).where(eq(sessions.token, sessionToken));
      } catch (error) {
        // Token might be invalid, but we still want to clear the cookie
        console.error('Error removing session from database:', error);
      }
    }

    // Clear cookie
    cookieStore.delete('auth-token');
  } catch (error) {
    console.error('Error destroying session:', error);
  }
}

export async function refreshSession(
  sessionToken: string,
  setCookie: (name: string, value: string, options: any) => void
): Promise<void> {
  try {
    const newExpiresAt = new Date(Date.now() + SESSION_DURATION * 1000);
    
    // Update session in database
    await db
      .update(sessions)
      .set({ 
        expiresAt: newExpiresAt,
        updatedAt: new Date(),
      })
      .where(eq(sessions.token, sessionToken));

    // Get session data to create new JWT
    const session = await db.query.sessions.findFirst({
      where: eq(sessions.token, sessionToken),
      with: {
        user: true,
      },
    });

    if (!session || !session.user) {
      throw new Error('Session not found');
    }

    // Create new JWT token with updated expiration
    const newJwtToken = await new SignJWT({ 
      sessionToken,
      userId: session.user.id,
      workspaceId: session.user.workspaceId 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(Math.floor(Date.now() / 1000) + SESSION_DURATION)
      .sign(JWT_SECRET);

    // Update client cookie with new JWT
    setCookie('auth-token', newJwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION,
      path: '/',
    });
  } catch (error) {
    console.error('Error refreshing session:', error);
    throw error;
  }
}

// Convenience function for Next.js API routes
export async function refreshSessionWithCookies(sessionToken: string): Promise<void> {
  const cookieStore = await cookies();
  
  await refreshSession(sessionToken, (name: string, value: string, options: any) => {
    cookieStore.set(name, value, options);
  });
}

// Cleanup expired sessions (run this periodically)
export async function cleanupExpiredSessions(): Promise<void> {
  try {
    await db.delete(sessions).where(
      lt(sessions.expiresAt, new Date())
    );
  } catch (error) {
    console.error('Error cleaning up expired sessions:', error);
  }
}