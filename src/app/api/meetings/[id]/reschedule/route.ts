import { NextRequest, NextResponse } from 'next/server';
import { db, meetings, leads, users } from '@/lib/db';
import { auth } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';
import { sendEmail, emailTemplates } from '@/lib/email';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const meetingId = params.id;
    const body = await request.json();
    const { scheduledAt, reason } = body;

    if (!scheduledAt) {
      return NextResponse.json(
        { error: 'New scheduled time is required' },
        { status: 400 }
      );
    }

    // Verify meeting exists and belongs to workspace
    const [existingMeeting] = await db
      .select({
        id: meetings.id,
        leadId: meetings.leadId,
        title: meetings.title,
        scheduledAt: meetings.scheduledAt,
        duration: meetings.duration,
        meetingUrl: meetings.meetingUrl,
      })
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

    const oldScheduledAt = existingMeeting.scheduledAt;
    const newScheduledAt = new Date(scheduledAt);

    // Update meeting with new time
    const [updatedMeeting] = await db
      .update(meetings)
      .set({
        scheduledAt: newScheduledAt,
        updatedAt: new Date(),
        notes: reason ? `Rescheduled: ${reason}` : undefined,
      })
      .where(eq(meetings.id, meetingId))
      .returning();

    // Get lead info for notification
    const [lead] = await db
      .select()
      .from(leads)
      .where(eq(leads.id, existingMeeting.leadId));

    // Send reschedule notification email
    if (lead?.email) {
      try {
        await sendEmail({
          to: lead.email,
          subject: `Meeting Rescheduled: ${existingMeeting.title}`,
          template: emailTemplates.meetingRescheduled,
          data: {
            leadName: lead.name || 'there',
            meetingTitle: existingMeeting.title,
            oldDate: oldScheduledAt.toLocaleString(),
            newDate: newScheduledAt.toLocaleString(),
            duration: existingMeeting.duration,
            meetingUrl: existingMeeting.meetingUrl,
            reason: reason || 'Schedule conflict',
          },
        });
      } catch (emailError) {
        console.error('Failed to send reschedule notification:', emailError);
      }
    }

    return NextResponse.json({
      success: true,
      data: updatedMeeting,
      message: 'Meeting rescheduled successfully',
    });
  } catch (error) {
    console.error('Error rescheduling meeting:', error);
    return NextResponse.json(
      { error: 'Failed to reschedule meeting' },
      { status: 500 }
    );
  }
}