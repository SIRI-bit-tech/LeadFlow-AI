import { NextRequest, NextResponse } from 'next/server';
import { db, meetings, users } from '@/lib/db';
import { auth } from '@/lib/auth';
import { eq, and, gte, lte } from 'drizzle-orm';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const duration = parseInt(searchParams.get('duration') || '30');

    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get all meetings for the specified date
    const existingMeetings = await db
      .select({
        scheduledAt: meetings.scheduledAt,
        duration: meetings.duration,
      })
      .from(meetings)
      .where(
        and(
          eq(meetings.workspaceId, user.workspaceId),
          gte(meetings.scheduledAt, startOfDay),
          lte(meetings.scheduledAt, endOfDay),
          eq(meetings.status, 'scheduled')
        )
      );

    // Generate available time slots (9 AM to 5 PM, 30-minute intervals)
    const availableSlots = [];
    const workingHours = {
      start: 9, // 9 AM
      end: 17,  // 5 PM
      interval: 30, // 30 minutes
    };

    for (let hour = workingHours.start; hour < workingHours.end; hour++) {
      for (let minute = 0; minute < 60; minute += workingHours.interval) {
        const slotTime = new Date(targetDate);
        slotTime.setHours(hour, minute, 0, 0);
        
        // Check if this slot conflicts with existing meetings
        const hasConflict = existingMeetings.some(meeting => {
          const meetingStart = new Date(meeting.scheduledAt);
          const meetingEnd = new Date(meetingStart.getTime() + (meeting.duration * 60000));
          const slotEnd = new Date(slotTime.getTime() + (duration * 60000));
          
          return (
            (slotTime >= meetingStart && slotTime < meetingEnd) ||
            (slotEnd > meetingStart && slotEnd <= meetingEnd) ||
            (slotTime <= meetingStart && slotEnd >= meetingEnd)
          );
        });

        if (!hasConflict) {
          availableSlots.push({
            time: slotTime.toISOString(),
            display: slotTime.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            }),
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        date: targetDate.toISOString().split('T')[0],
        duration,
        availableSlots,
        existingMeetings: existingMeetings.length,
      },
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    );
  }
}