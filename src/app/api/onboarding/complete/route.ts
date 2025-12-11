import { NextRequest, NextResponse } from 'next/server';
import { db, users, workspaces } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { companyName, industry, teamSize, goals, integrations } = body;

    // Get current user to check if workspace exists
    const currentUser = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (currentUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = currentUser[0];
    let workspaceId = user.workspaceId;

    // Create workspace if user doesn't have one
    if (!workspaceId) {
      const newWorkspace = await db
        .insert(workspaces)
        .values({
          id: crypto.randomUUID(),
          name: companyName || `${user.name}'s Workspace`,
          industry: industry || 'Technology',
          companySize: teamSize || '1-10',
          ownerId: user.id,
        })
        .returning();

      workspaceId = newWorkspace[0].id;
    }

    // Update user with onboarding data and workspace
    await db
      .update(users)
      .set({
        companyName,
        industry,
        teamSize,
        goals: JSON.stringify(goals),
        integrations: JSON.stringify(integrations),
        onboardingCompleted: true,
        workspaceId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));

    return NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully',
    });
  } catch (error) {
    console.error('Onboarding completion error:', error);
    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
      { status: 500 }
    );
  }
}