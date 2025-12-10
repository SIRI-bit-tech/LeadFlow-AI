import { NextRequest, NextResponse } from 'next/server';
import { CalendarService } from '@/lib/calendar';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { leadId, scheduledAt, duration, type, notes } = body;

    if (!leadId || !scheduledAt) {
      return NextResponse.json(
        { error: 'Lead ID and scheduled time are required' },
        { status: 400 }
      );
    }

    // Get user's workspace ID from database
    const { users } = await import('@/lib/db');
    const { db } = await import('@/lib/db');
    const { eq } = await import('drizzle-orm');
    
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const workspaceId = user.workspaceId;
    
    const meetingId = await CalendarService.scheduleMeeting(
      leadId,
      workspaceId,
      new Date(scheduledAt),
      duration || 30,
      type || 'meeting',
      notes
    );

    return NextResponse.json({ 
      success: true,
      meetingId,
      message: 'Meeting scheduled successfully'
    });

  } catch (error) {
    console.error('Meeting scheduling error:', error);
    return NextResponse.json(
      { error: 'Failed to schedule meeting' },
      { status: 500 }
    );
  }
}