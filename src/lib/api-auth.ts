import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { createErrorResponse, logSecurityEvent } from '@/lib/api-errors';

/**
 * Utility function to handle authentication for API routes
 * Replaces the old auth.api.getSession() pattern
 */
export async function authenticateApiRequest(): Promise<
  { session: { user: { id: string; workspaceId: string; name: string; email: string } } } | 
  { error: NextResponse }
> {
  try {
    const session = await getSession();
    
    if (!session) {
      // Log unauthorized access attempt
      logSecurityEvent('UNAUTHORIZED_API_ACCESS', {}, 'medium');
      
      return {
        error: createErrorResponse('UNAUTHORIZED')
      };
    }

    return { session };
  } catch (error) {
    // Log authentication system error
    logSecurityEvent('AUTHENTICATION_SYSTEM_ERROR', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, 'high');
    
    return {
      error: createErrorResponse('SERVICE_UNAVAILABLE')
    };
  }
}

/**
 * Type guard to check if the result contains an error
 */
export function isAuthError(
  result: { session: any } | { error: NextResponse }
): result is { error: NextResponse } {
  return 'error' in result;
}