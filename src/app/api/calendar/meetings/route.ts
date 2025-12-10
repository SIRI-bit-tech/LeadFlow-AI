import { NextRequest, NextResponse } from 'next/server';
import { CalendarService } from '@/lib/calendar';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');
    const leadId = searchParams.get('leadId');

    if (!startDateStr || !endDateStr) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      );
    }

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    const meetings = await CalendarService.getMeetings(
      startDate,
      endDate,
      leadId || undefined
    );

    return NextResponse.json({ meetings });

  } catch (error) {
    console.error('Calendar meetings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meetings' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
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
    const { meetingId, status } = body;

    if (!meetingId || !status) {
      return NextResponse.json(
        { error: 'Meeting ID and status are required' },
        { status: 400 }
      );
    }

    await CalendarService.updateMeetingStatus(meetingId, status);

    return NextResponse.json({ 
      success: true,
      message: 'Meeting status updated successfully'
    });

  } catch (error) {
    console.error('Meeting update error:', error);
    return NextResponse.json(
      { error: 'Failed to update meeting status' },
      { status: 500 }
    );
  }
}