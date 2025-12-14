import { NextRequest, NextResponse } from 'next/server';
import { db, meetings, users } from '@/lib/db';
import { auth } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's workspace ID from database
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id: meetingId } = await params;
    const body = await request.json();
    const { notes } = body;

    if (notes === undefined) {
      return NextResponse.json(
        { error: 'Notes field is required' },
        { status: 400 }
      );
    }

    // Verify meeting exists and belongs to workspace
    const [existingMeeting] = await db
      .select({ id: meetings.id })
      .from(meetings)
      .where(
        and(
          eq(meetings.id, meetingId),
          eq(meetings.workspaceId, user.workspaceId)
        )
      );

    if (!existingMeeting) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      );
    }

    // Update meeting notes
    const [updatedMeeting] = await db
      .update(meetings)
      .set({
        notes,
        updatedAt: new Date(),
      })
      .where(eq(meetings.id, meetingId))
      .returning();

    return NextResponse.json({
      success: true,
      data: updatedMeeting,
      message: 'Meeting notes updated successfully',
    });
  } catch (error) {
    console.error('Error updating meeting notes:', error);
    return NextResponse.json(
      { error: 'Failed to update meeting notes' },
      { status: 500 }
    );
  }
}