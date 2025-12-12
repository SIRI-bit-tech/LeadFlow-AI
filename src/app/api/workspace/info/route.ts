import { NextRequest, NextResponse } from 'next/server';
import { authenticateApiRequest, isAuthError } from '@/lib/api-auth';
import { db } from '@/lib/db';
import { workspaces } from '@/db/schema';
import { eq } from 'drizzle-orm';

// HTML attribute escaping function to prevent XSS
function escapeHtmlAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// Get validated public API origin
function getPublicApiOrigin(request: NextRequest): string {
  // Primary: Use environment variable for public API URL
  const envApiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL;
  
  if (envApiUrl) {
    // Validate and normalize the environment URL
    try {
      const url = new URL(envApiUrl);
      // Ensure it has a protocol and remove trailing slash
      return `${url.protocol}//${url.host}`;
    } catch (error) {
      console.warn('Invalid API_URL environment variable:', envApiUrl);
    }
  }

  // Fallback: Use trusted forwarded headers
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
  
  if (forwardedHost && isValidHost(forwardedHost)) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  // Last resort: Use request origin (but log warning)
  console.warn('Using request origin as API URL - consider setting NEXT_PUBLIC_API_URL environment variable');
  return request.nextUrl.origin;
}

// Validate host to prevent header injection
function isValidHost(host: string): boolean {
  // Basic validation: no spaces, control characters, or suspicious patterns
  const hostRegex = /^[a-zA-Z0-9.-]+(?::[0-9]+)?$/;
  return hostRegex.test(host) && host.length < 253; // DNS hostname limit
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateApiRequest();
    if (isAuthError(authResult)) {
      return authResult.error;
    }

    const user = authResult.session.user;

    // Get workspace info
    const workspace = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, user.workspaceId))
      .limit(1);

    if (workspace.length === 0) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      );
    }

    const workspaceData = workspace[0];

    // Get validated public API origin
    const publicApiOrigin = getPublicApiOrigin(request);
    
    // Escape dynamic values for safe HTML attribute usage
    const escapedOrigin = escapeHtmlAttribute(publicApiOrigin);
    const escapedWorkspaceId = escapeHtmlAttribute(workspaceData.id);
    const escapedWorkspaceName = escapeHtmlAttribute(workspaceData.name);

    return NextResponse.json({
      success: true,
      workspace: {
        id: workspaceData.id,
        name: workspaceData.name,
        industry: workspaceData.industry,
        companySize: workspaceData.companySize,
        website: workspaceData.website,
      },
      widgetCode: `<script src="${escapedOrigin}/widget.js" 
  data-api-url="${escapedOrigin}"
  data-workspace-id="${escapedWorkspaceId}"
  data-title="Chat with ${escapedWorkspaceName}"
  data-subtitle="We're here to help!"
  data-primary-color="#0A4D68"
  data-accent-color="#FF6B6B"
  data-position="bottom-right"></script>`,
    });

  } catch (error) {
    console.error('Workspace info error:', error);
    return NextResponse.json(
      { error: 'Failed to get workspace info' },
      { status: 500 }
    );
  }
}