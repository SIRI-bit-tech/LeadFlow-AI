import { NextRequest, NextResponse } from 'next/server';
import { getSession, refreshSessionWithCookies } from '@/lib/session';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(process.env.BETTER_AUTH_SECRET!);

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'No active session' },
        { status: 401 }
      );
    }

    // Get current JWT to extract session token
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token');
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'No auth token found' },
        { status: 401 }
      );
    }

    // Verify and extract session token
    const { payload } = await jwtVerify(authToken.value, JWT_SECRET);
    const { sessionToken } = payload as { sessionToken: string };

    // Refresh the session (updates both DB and JWT cookie)
    await refreshSessionWithCookies(sessionToken);

    return NextResponse.json({
      success: true,
      message: 'Session refreshed successfully',
    });
  } catch (error) {
    console.error('Session refresh error:', error);
    return NextResponse.json(
      { error: 'Failed to refresh session' },
      { status: 500 }
    );
  }
}