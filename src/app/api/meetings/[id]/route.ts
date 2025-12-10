import { NextRequest, NextResponse } from 'next/server';
import { db, meetings, leads, users } from '@/lib/db';
import { auth } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';
import { sendEmail, emailTemplates } from '@/lib/email';

export async function GET(
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

    const [meeting] = await db
      .select({
        id: meetings.id,
        leadId: meetings.leadId,
        title: meetings.title,
        type: meetings.type,
        scheduledAt: meetings.scheduledAt,
        duration: meetings.duration,
        meetingUrl: meetings.meetingUrl,
        status: meetings.status,
        attendees: meetings.attendees,
        notes: meetings.notes,
        createdAt: meetings.createdAt,
        updatedAt: meetings.updatedAt,
        lead: {
          id: leads.id,
          name: leads.name,
          email: leads.email,
          company: leads.company,
          phone: leads.phone,
        },
      })
      .from(meetings)
      .leftJoin(leads, eq(meetings.leadId, leads.id))
      .where(
        and(
          eq(meetings.id, meetingId),
          eq(meetings.workspaceId, user.workspaceId)
        )
      );

    if (!meeting) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: meeting,
    });
  } catch (error) {
    console.error('Error fetching meeting:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meeting' },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const {
      title,
      type,
      scheduledAt,
      duration,
      meetingUrl,
      status,
      attendees,
      notes,
    } = body;

    // Verify meeting exists and belongs to workspace
    const [existingMeeting] = await db
      .select({
        id: meetings.id,
        leadId: meetings.leadId,
        scheduledAt: meetings.scheduledAt,
        status: meetings.status,
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

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (title !== undefined) updateData.title = title;
    if (type !== undefined) updateData.type = type;
    if (scheduledAt !== undefined) updateData.scheduledAt = new Date(scheduledAt);
    if (duration !== undefined) updateData.duration = duration;
    if (meetingUrl !== undefined) updateData.meetingUrl = meetingUrl;
    if (status !== undefined) updateData.status = status;
    if (attendees !== undefined) updateData.attendees = attendees;
    if (notes !== undefined) updateData.notes = notes;

    // Update meeting
    const [updatedMeeting] = await db
      .update(meetings)
      .set(updateData)
      .where(eq(meetings.id, meetingId))
      .returning();

    // If meeting was rescheduled, send notification
    if (scheduledAt && scheduledAt !== existingMeeting.scheduledAt.toISOString()) {
      const [lead] = await db
        .select()
        .from(leads)
        .where(eq(leads.id, existingMeeting.leadId));

      if (lead?.email) {
        try {
          await sendEmail({
            to: lead.email,
            subject: `Meeting Rescheduled: ${title || 'Your Meeting'}`,
            template: emailTemplates.meetingRescheduled,
            data: {
              leadName: lead.name || 'there',
              meetingTitle: title || 'Your Meeting',
              oldDate: existingMeeting.scheduledAt.toLocaleString(),
              newDate: new Date(scheduledAt).toLocaleString(),
              duration: duration || 30,
              meetingUrl,
              notes,
            },
          });
        } catch (emailError) {
          console.error('Failed to send reschedule notification:', emailError);
        }
      }
    }

    // If meeting was completed, update lead status
    if (status === 'completed' && existingMeeting.status !== 'completed') {
      await db
        .update(leads)
        .set({
          status: 'qualified',
          updatedAt: new Date(),
        })
        .where(eq(leads.id, existingMeeting.leadId));
    }

    return NextResponse.json({
      success: true,
      data: updatedMeeting,
      message: 'Meeting updated successfully',
    });
  } catch (error) {
    console.error('Error updating meeting:', error);
    return NextResponse.json(
      { error: 'Failed to update meeting' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Verify meeting exists and belongs to workspace
    const [existingMeeting] = await db
      .select({
        id: meetings.id,
        leadId: meetings.leadId,
        title: meetings.title,
        scheduledAt: meetings.scheduledAt,
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

    // Get lead info for notification
    const [lead] = await db
      .select()
      .from(leads)
      .where(eq(leads.id, existingMeeting.leadId));

    // Delete meeting
    await db.delete(meetings).where(eq(meetings.id, meetingId));

    // Send cancellation email to lead
    if (lead?.email) {
      try {
        await sendEmail({
          to: lead.email,
          subject: `Meeting Cancelled: ${existingMeeting.title}`,
          template: emailTemplates.meetingCancelled,
          data: {
            leadName: lead.name || 'there',
            meetingTitle: existingMeeting.title,
            scheduledAt: existingMeeting.scheduledAt.toLocaleString(),
          },
        });
      } catch (emailError) {
        console.error('Failed to send cancellation notification:', emailError);
      }
    }

    // Update lead status back to qualifying if it was meeting_scheduled
    if (lead?.status === 'meeting_scheduled') {
      await db
        .update(leads)
        .set({
          status: 'qualifying',
          updatedAt: new Date(),
        })
        .where(eq(leads.id, existingMeeting.leadId));
    }

    return NextResponse.json({
      success: true,
      message: 'Meeting cancelled successfully',
    });
  } catch (error) {
    console.error('Error deleting meeting:', error);
    return NextResponse.json(
      { error: 'Failed to cancel meeting' },
      { status: 500 }
    );
  }
}