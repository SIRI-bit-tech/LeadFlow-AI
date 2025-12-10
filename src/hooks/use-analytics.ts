'use client';

import { useState, useEffect } from 'react';

export interface AnalyticsData {
  totalLeads: number;
  qualifiedLeads: number;
  conversionRate: number;
  averageScore: number;
  meetingsScheduled: number;
  responseTime: number;
  leadsBySource: Array<{ source: string; count: number; percentage: number }>;
  leadsByStatus: Array<{ status: string; count: number; percentage: number }>;
  scoreDistribution: Array<{ range: string; count: number }>;
  recentActivity: Array<{
    id: string;
    type: 'lead_created' | 'lead_qualified' | 'meeting_scheduled' | 'conversation_started' | 'score_updated';
    description: string;
    timestamp: Date;
    leadName?: string;
    score?: number;
  }>;
}

export function useAnalytics(timeRange: '7d' | '30d' | '90d' = '30d') {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics/dashboard?timeRange=${timeRange}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      const analyticsData = await response.json();
      setData(analyticsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const refreshAnalytics = () => {
    fetchAnalytics();
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  return {
    data,
    loading,
    error,
    refreshAnalytics,
  };
}