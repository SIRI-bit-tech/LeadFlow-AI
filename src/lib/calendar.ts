import { db } from './db';
import { meetings } from '@/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  attendeeEmail?: string;
  leadId?: string;
  type: 'meeting' | 'call' | 'demo';
}

export interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
}

export class CalendarService {
  // Get available time slots for scheduling
  static async getAvailableSlots(
    date: Date,
    duration: number = 30 // minutes
  ): Promise<TimeSlot[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(9, 0, 0, 0); // 9 AM start
    
    const endOfDay = new Date(date);
    endOfDay.setHours(17, 0, 0, 0); // 5 PM end

    // Get existing meetings for the day
    const existingMeetings = await db
      .select()
      .from(meetings)
      .where(
        and(
          gte(meetings.scheduledAt, startOfDay),
          lte(meetings.scheduledAt, endOfDay)
        )
      );

    const slots: TimeSlot[] = [];
    const slotDuration = duration * 60 * 1000; // Convert to milliseconds
    
    for (let time = startOfDay.getTime(); time < endOfDay.getTime(); time += slotDuration) {
      const slotStart = new Date(time);
      const slotEnd = new Date(time + slotDuration);
      
      // Check if this slot conflicts with existing meetings
      const hasConflict = existingMeetings.some(meeting => {
        const meetingStart = new Date(meeting.scheduledAt);
        const meetingEnd = new Date(meetingStart.getTime() + (meeting.duration || 30) * 60 * 1000);
        
        return (
          (slotStart >= meetingStart && slotStart < meetingEnd) ||
          (slotEnd > meetingStart && slotEnd <= meetingEnd) ||
          (slotStart <= meetingStart && slotEnd >= meetingEnd)
        );
      });

      slots.push({
        start: slotStart,
        end: slotEnd,
        available: !hasConflict
      });
    }

    return slots;
  }

  // Schedule a new meeting
  static async scheduleMeeting(
    leadId: string,
    workspaceId: string,
    scheduledAt: Date,
    duration: number = 30,
    type: 'meeting' | 'call' | 'demo' = 'meeting',
    notes?: string
  ): Promise<string> {
    const meetingId = crypto.randomUUID();
    const title = `${type.charAt(0).toUpperCase() + type.slice(1)} - Lead ${leadId}`;
    
    const [meeting] = await db
      .insert(meetings)
      .values({
        id: meetingId,
        leadId,
        workspaceId,
        title,
        type,
        scheduledAt,
        duration,
        status: 'scheduled',
        notes,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    return meeting.id;
  }

  // Get meetings for a specific date range
  static async getMeetings(
    startDate: Date,
    endDate: Date,
    leadId?: string
  ): Promise<CalendarEvent[]> {
    let whereConditions = and(
      gte(meetings.scheduledAt, startDate),
      lte(meetings.scheduledAt, endDate)
    );

    if (leadId) {
      whereConditions = and(
        whereConditions,
        eq(meetings.leadId, leadId)
      );
    }

    const meetingResults = await db
      .select({
        id: meetings.id,
        leadId: meetings.leadId,
        title: meetings.title,
        scheduledAt: meetings.scheduledAt,
        duration: meetings.duration,
        type: meetings.type,
        notes: meetings.notes,
        status: meetings.status
      })
      .from(meetings)
      .where(whereConditions);

    return meetingResults.map(meeting => ({
      id: meeting.id,
      title: meeting.title,
      start: new Date(meeting.scheduledAt),
      end: new Date(new Date(meeting.scheduledAt).getTime() + (meeting.duration || 30) * 60 * 1000),
      description: meeting.notes || '',
      leadId: meeting.leadId,
      type: meeting.type as 'meeting' | 'call' | 'demo'
    }));
  }

  // Update meeting status
  static async updateMeetingStatus(
    meetingId: string,
    status: 'scheduled' | 'completed' | 'cancelled' | 'no-show'
  ): Promise<void> {
    await db
      .update(meetings)
      .set({ 
        status,
        updatedAt: new Date()
      })
      .where(eq(meetings.id, meetingId));
  }

  // Cancel a meeting
  static async cancelMeeting(meetingId: string): Promise<void> {
    await this.updateMeetingStatus(meetingId, 'cancelled');
  }

  // Generate calendar invite data
  static generateCalendarInvite(event: CalendarEvent): string {
    const startTime = event.start.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endTime = event.end.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//LeadFlow AI//Calendar//EN',
      'BEGIN:VEVENT',
      `UID:${event.id}@leadflow.ai`,
      `DTSTART:${startTime}`,
      `DTEND:${endTime}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description || ''}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    return icsContent;
  }
}

// Utility functions for date/time handling
export const formatTimeSlot = (slot: TimeSlot): string => {
  const startTime = slot.start.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  const endTime = slot.end.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  return `${startTime} - ${endTime}`;
};

export const isBusinessHours = (date: Date): boolean => {
  const hour = date.getHours();
  const day = date.getDay();
  
  // Monday to Friday, 9 AM to 5 PM
  return day >= 1 && day <= 5 && hour >= 9 && hour < 17;
};

export const getNextBusinessDay = (date: Date): Date => {
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  
  // Skip weekends
  while (nextDay.getDay() === 0 || nextDay.getDay() === 6) {
    nextDay.setDate(nextDay.getDate() + 1);
  }
  
  return nextDay;
};