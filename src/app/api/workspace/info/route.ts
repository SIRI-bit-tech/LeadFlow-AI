import { NextRequest, NextResponse } from 'next/server';
import { authenticateApiRequest, isAuthError } from '@/lib/api-auth';
import { db } from '@/lib/db';
import { workspaces } from '@/db/schema';
import { eq } from 'drizzle-orm';

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

    return NextResponse.json({
      success: true,
      workspace: {
        id: workspaceData.id,
        name: workspaceData.name,
        industry: workspaceData.industry,
        companySize: workspaceData.companySize,
        website: workspaceData.website,
      },
      widgetCode: `<script src="${request.nextUrl.origin}/widget.js" 
  data-api-url="${request.nextUrl.origin}"
  data-workspace-id="${workspaceData.id}"
  data-title="Chat with ${workspaceData.name}"
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