import { NextRequest, NextResponse } from 'next/server';
import { db, leads, conversations, meetings } from '@/lib/db';
import { auth } from '@/lib/auth';
import { eq, and, gte, count, avg, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's workspace ID from database
    const { users } = await import('@/lib/db');
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const workspaceId = user.workspaceId;
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get current metrics
    const [totalLeadsResult] = await db
      .select({ count: count() })
      .from(leads)
      .where(eq(leads.workspaceId, workspaceId));

    const [qualifiedLeadsResult] = await db
      .select({ count: count() })
      .from(leads)
      .where(and(
        eq(leads.workspaceId, workspaceId),
        eq(leads.status, 'qualified')
      ));

    const [averageScoreResult] = await db
      .select({ avg: avg(leads.score) })
      .from(leads)
      .where(eq(leads.workspaceId, workspaceId));

    const [activeConversationsResult] = await db
      .select({ count: count() })
      .from(conversations)
      .where(and(
        eq(conversations.workspaceId, workspaceId),
        eq(conversations.status, 'active')
      ));

    const [meetingsScheduledResult] = await db
      .select({ count: count() })
      .from(meetings)
      .where(and(
        eq(meetings.workspaceId, workspaceId),
        gte(meetings.scheduledAt, now)
      ));

    // Get previous period metrics for comparison
    const [totalLeadsLastMonth] = await db
      .select({ count: count() })
      .from(leads)
      .where(and(
        eq(leads.workspaceId, workspaceId),
        gte(leads.createdAt, lastMonth)
      ));

    const [qualifiedLeadsLastWeek] = await db
      .select({ count: count() })
      .from(leads)
      .where(and(
        eq(leads.workspaceId, workspaceId),
        eq(leads.status, 'qualified'),
        gte(leads.updatedAt, lastWeek)
      ));

    // Get recent activity
    const recentLeads = await db.query.leads.findMany({
      where: eq(leads.workspaceId, workspaceId),
      orderBy: [desc(leads.createdAt)],
      limit: 10,
      with: {
        conversation: true,
      },
    });

    const recentActivity = recentLeads.map(lead => ({
      id: lead.id,
      type: lead.status === 'qualified' ? 'lead_qualified' : 'lead_created',
      description: lead.status === 'qualified' ? 'Qualified as lead' : 'New lead created',
      timestamp: lead.createdAt,
      leadName: lead.name || 'Unknown',
      score: lead.score,
    }));

    const totalLeads = totalLeadsResult.count || 0;
    const qualifiedLeads = qualifiedLeadsResult.count || 0;
    const averageScore = Math.round(Number(averageScoreResult.avg) || 0);
    const activeConversations = activeConversationsResult.count || 0;
    const meetingsScheduled = meetingsScheduledResult.count || 0;

    const conversionRate = totalLeads > 0 ? Number(((qualifiedLeads / totalLeads) * 100).toFixed(1)) : 0;

    // Calculate changes
    const totalLeadsChange = totalLeadsLastMonth.count || 0;
    const qualifiedLeadsChange = qualifiedLeadsLastWeek.count || 0;

    return NextResponse.json({
      success: true,
      data: {
        totalLeads,
        qualifiedLeads,
        conversionRate,
        averageScore,
        meetingsScheduled,
        activeConversations,
        totalLeadsChange,
        qualifiedLeadsChange,
        conversionRateChange: 0, // Would need historical data
        averageScoreChange: 0, // Would need historical data
        recentActivity,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}