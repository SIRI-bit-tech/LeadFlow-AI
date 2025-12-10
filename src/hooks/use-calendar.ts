'use client';

import { useState, useEffect } from 'react';

export interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
}

export interface Meeting {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  leadId?: string;
  type: 'meeting' | 'call' | 'demo';
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
}

export function useCalendar() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAvailableSlots = async (date: Date, duration: number = 30): Promise<TimeSlot[]> => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/calendar/slots?date=${date.toISOString()}&duration=${duration}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch available slots');
      }
      
      const data = await response.json();
      return data.slots.map((slot: any) => ({
        ...slot,
        start: new Date(slot.start),
        end: new Date(slot.end),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch slots');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const scheduleMeeting = async (
    leadId: string,
    scheduledAt: Date,
    duration: number = 30,
    type: 'meeting' | 'call' | 'demo' = 'meeting',
    notes?: string
  ) => {
    try {
      setLoading(true);
      const response = await fetch('/api/calendar/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId,
          scheduledAt: scheduledAt.toISOString(),
          duration,
          type,
          notes,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to schedule meeting');
      }

      const result = await response.json();
      await fetchMeetings(); // Refresh meetings list
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule meeting');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchMeetings = async (startDate?: Date, endDate?: Date) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (startDate) params.append('startDate', startDate.toISOString());
      if (endDate) params.append('endDate', endDate.toISOString());

      const response = await fetch(`/api/calendar/meetings?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch meetings');
      }

      const data = await response.json();
      const formattedMeetings = data.meetings.map((meeting: any) => ({
        ...meeting,
        start: new Date(meeting.start),
        end: new Date(meeting.end),
      }));
      
      setMeetings(formattedMeetings);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch meetings');
    } finally {
      setLoading(false);
    }
  };

  const updateMeetingStatus = async (
    meetingId: string,
    status: 'scheduled' | 'completed' | 'cancelled' | 'no-show'
  ) => {
    try {
      const response = await fetch('/api/calendar/meetings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingId, status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update meeting status');
      }

      // Update local state
      setMeetings(prev => prev.map(meeting => 
        meeting.id === meetingId ? { ...meeting, status } : meeting
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update meeting');
      throw err;
    }
  };

  return {
    meetings,
    loading,
    error,
    getAvailableSlots,
    scheduleMeeting,
    fetchMeetings,
    updateMeetingStatus,
  };
}