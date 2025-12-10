import { NextRequest, NextResponse } from 'next/server';
import { db, conversations } from '@/lib/db';
import { auth } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';
import { getConversationMessages } from '@/services/conversation';

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
    const { users } = await import('@/lib/db');
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const conversation = await db.query.conversations.findFirst({
      where: and(
        eq(conversations.id, params.id),
        eq(conversations.workspaceId, user.workspaceId)
      ),
      with: {
        lead: true,
        messages: {
          orderBy: (messages, { asc }) => [asc(messages.createdAt)],
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Calculate analytics
    const messages = conversation.messages;
    const messageCount = messages.length;
    
    // Calculate average response time (simplified)
    let totalResponseTime = 0;
    let responseCount = 0;
    
    for (let i = 1; i < messages.length; i++) {
      if (messages[i].role === 'assistant' && messages[i-1].role === 'user') {
        const responseTime = new Date(messages[i].createdAt).getTime() - new Date(messages[i-1].createdAt).getTime();
        totalResponseTime += responseTime;
        responseCount++;
      }
    }
    
    const averageResponseTime = responseCount > 0 ? Math.round(totalResponseTime / responseCount / 1000) : 0;
    
    // Calculate total duration
    const totalDuration = messages.length > 0 
      ? Math.round((new Date(messages[messages.length - 1].createdAt).getTime() - new Date(messages[0].createdAt).getTime()) / (1000 * 60))
      : 0;

    // Extract key topics (simplified)
    const allContent = messages.filter(m => m.role === 'user').map(m => m.content).join(' ').toLowerCase();
    const keyTopics: string[] = [];
    const topics = ['budget', 'timeline', 'team', 'qualification', 'leads', 'sales', 'conversion', 'process'];
    topics.forEach(topic => {
      if (allContent.includes(topic)) {
        keyTopics.push(topic);
      }
    });

    // Detect buying signals (simplified)
    const buyingSignals: string[] = [];
    const signals = ['budget', 'decision', 'timeline', 'authority', 'need', 'demo', 'meeting'];
    signals.forEach(signal => {
      if (allContent.includes(signal)) {
        buyingSignals.push(signal);
      }
    });

    const conversationWithAnalytics = {
      ...conversation,
      messageCount,
      analytics: {
        averageResponseTime,
        totalDuration,
        leadEngagement: conversation.sentiment === 'positive' ? 'high' : conversation.sentiment === 'negative' ? 'low' : 'medium',
        keyTopics,
        buyingSignals,
      },
    };

    return NextResponse.json({
      success: true,
      data: conversationWithAnalytics,
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversation' },
      { status: 500 }
    );
  }
}