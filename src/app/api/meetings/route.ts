import { NextRequest, NextResponse } from 'next/server';
import { db, meetings, leads } from '@/lib/db';
import { authenticateApiRequest, isAuthError } from '@/lib/api-auth';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { sendEmail, emailTemplates } from '@/lib/email';

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateApiRequest();
    if (isAuthError(authResult)) {
      return authResult.error;
    }

    const workspaceId = authResult.session.user.workspaceId;

    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('leadId');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Apply filters
    const conditions = [eq(meetings.workspaceId, workspaceId)];

    if (leadId) {
      conditions.push(eq(meetings.leadId, leadId));
    }

    if (status) {
      conditions.push(eq(meetings.status, status));
    }

    if (type) {
      conditions.push(eq(meetings.type, type));
    }

    if (startDate) {
      conditions.push(gte(meetings.scheduledAt, new Date(startDate)));
    }

    if (endDate) {
      conditions.push(lte(meetings.scheduledAt, new Date(endDate)));
    }

    const meetingsData = await db
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
        },
      })
      .from(meetings)
      .leftJoin(leads, eq(meetings.leadId, leads.id))
      .where(and(...conditions))
      .orderBy(desc(meetings.scheduledAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      success: true,
      data: meetingsData,
      pagination: {
        limit,
        offset,
        total: meetingsData.length,
      },
    });
  } catch (error) {
    console.error('Error fetching meetings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meetings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateApiRequest();
    if (isAuthError(authResult)) {
      return authResult.error;
    }

    const workspaceId = authResult.session.user.workspaceId;

    const body = await request.json();
    const {
      leadId,
      title,
      type = 'meeting',
      scheduledAt,
      duration = 30,
      meetingUrl,
      attendees = [],
      notes,
    } = body;

    // Validate required fields
    if (!leadId || !title || !scheduledAt) {
      return NextResponse.json(
        { error: 'Missing required fields: leadId, title, scheduledAt' },
        { status: 400 }
      );
    }

    // Verify lead exists and belongs to workspace
    const [lead] = await db
      .select()
      .from(leads)
      .where(
        and(
          eq(leads.id, leadId),
          eq(leads.workspaceId, workspaceId)
        )
      );

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found or access denied' },
        { status: 404 }
      );
    }

    // Create meeting
    const [newMeeting] = await db
      .insert(meetings)
      .values({
        leadId,
        workspaceId: workspaceId,
        title,
        type,
        scheduledAt: new Date(scheduledAt),
        duration,
        meetingUrl,
        status: 'scheduled',
        attendees,
        notes,
      })
      .returning();

    // Update lead status if it's a new lead
    if (lead.status === 'new' || lead.status === 'qualifying') {
      await db
        .update(leads)
        .set({
          status: 'meeting_scheduled',
          updatedAt: new Date(),
        })
        .where(eq(leads.id, leadId));
    }

    // Send email notification to lead
    if (lead.email) {
      try {
        await sendEmail({
          to: lead.email,
          subject: `Meeting Scheduled: ${title}`,
          template: emailTemplates.meetingScheduled,
          data: {
            leadName: lead.name || 'there',
            meetingTitle: title,
            scheduledAt: new Date(scheduledAt).toLocaleString(),
            duration,
            meetingUrl,
            notes,
          },
        });
      } catch (emailError) {
        console.error('Failed to send meeting notification email:', emailError);
        // Don't fail the meeting creation if email fails
      }
    }

    return NextResponse.json({
      success: true,
      data: newMeeting,
      message: 'Meeting scheduled successfully',
    });
  } catch (error) {
    console.error('Error creating meeting:', error);
    return NextResponse.json(
      { error: 'Failed to create meeting' },
      { status: 500 }
    );
  }
}