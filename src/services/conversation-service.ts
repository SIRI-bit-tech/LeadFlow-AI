import { db } from '@/lib/db';
import { conversations, messages, leads } from '@/db/schema';
import { eq, and, desc, count, sql, inArray } from 'drizzle-orm';
import type { Conversation, Message, Lead } from '@/types';

export class ConversationService {
  static async getConversationById(id: string): Promise<(Conversation & { lead?: Lead; messageCount: number; lastMessage?: Message }) | null> {
    try {
      // Get conversation with lead data
      const result = await db
        .select({
          conversation: conversations,
          lead: leads,
        })
        .from(conversations)
        .leftJoin(leads, eq(conversations.leadId, leads.id))
        .where(eq(conversations.id, id))
        .limit(1);

      if (result.length === 0) return null;

      const { conversation, lead } = result[0];

      // Get message count
      const messageCountResult = await db
        .select({ count: count() })
        .from(messages)
        .where(eq(messages.conversationId, id));

      const messageCount = Number(messageCountResult[0]?.count ?? 0) || 0;

      // Get last message
      const lastMessageResult = await db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, id))
        .orderBy(desc(messages.createdAt))
        .limit(1);

      const lastMessage = lastMessageResult[0] || undefined;
      const normalizedRole = lastMessage
        ? (() => {
            const roleStr = String(lastMessage.role);
            return (roleStr === 'user' || roleStr === 'assistant' || roleStr === 'system')
              ? (roleStr as 'user' | 'assistant' | 'system')
              : 'assistant';
          })()
        : undefined;

      return {
        ...conversation,
        status: conversation.status as 'active' | 'completed' | 'abandoned',
        summary: conversation.summary || undefined,
        sentiment: (conversation.sentiment as 'neutral' | 'positive' | 'negative') || 'neutral',
        lead: lead ? {
          ...lead,
          name: lead.name || undefined,
          company: lead.company || undefined,
          industry: lead.industry || undefined,
          companySize: lead.companySize || undefined,
          phone: lead.phone || undefined,
        } as Lead : undefined,
        messageCount,
        lastMessage: lastMessage ? {
          ...lastMessage,
          role: normalizedRole as 'user' | 'assistant' | 'system',
        } as Message : undefined,
      };
    } catch (error) {
      console.error('Failed to get conversation:', error);
      return null;
    }
  }

  static async getConversationMessages(conversationId: string): Promise<Message[]> {
    try {
      const result = await db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, conversationId))
        .orderBy(messages.createdAt);

      return result.map(msg => ({
        ...msg,
        role: msg.role as 'user' | 'assistant' | 'system',
      })) as Message[];
    } catch (error) {
      console.error('Failed to get conversation messages:', error);
      return [];
    }
  }

  static async getConversationsByWorkspace(workspaceId: string): Promise<Array<Conversation & { lead?: Lead; messageCount: number; lastMessage?: Message }>> {
    try {
      // Get conversations with lead data
      const result = await db
        .select({
          conversation: conversations,
          lead: leads,
        })
        .from(conversations)
        .leftJoin(leads, eq(conversations.leadId, leads.id))
        .where(eq(conversations.workspaceId, workspaceId))
        .orderBy(desc(conversations.updatedAt));

      if (result.length === 0) return [];

      const conversationIds = result.map(r => r.conversation.id);

      // Batch fetch message counts for all conversations
      const messageCounts = await db
        .select({
          conversationId: messages.conversationId,
          count: count(),
        })
        .from(messages)
        .where(inArray(messages.conversationId, conversationIds))
        .groupBy(messages.conversationId);

      const countMap = new Map(messageCounts.map(mc => [mc.conversationId, mc.count]));

      // Batch fetch last messages using window function filtered in SQL
      const lastMessagesCte = db.$with('last_messages').as(
        db
          .select({
            conversationId: messages.conversationId,
            id: messages.id,
            role: messages.role,
            content: messages.content,
            metadata: messages.metadata,
            createdAt: messages.createdAt,
            rn: sql<number>`row_number() over (partition by ${messages.conversationId} order by ${messages.createdAt} desc)`.mapWith(Number).as('rn'),
          })
          .from(messages)
          .where(inArray(messages.conversationId, conversationIds))
      );

      const lastMessages = await db
        .with(lastMessagesCte)
        .select({
          conversationId: lastMessagesCte.conversationId,
          id: lastMessagesCte.id,
          role: lastMessagesCte.role,
          content: lastMessagesCte.content,
          metadata: lastMessagesCte.metadata,
          createdAt: lastMessagesCte.createdAt,
        })
        .from(lastMessagesCte)
        .where(eq(lastMessagesCte.rn, 1));

      // Map last messages by conversation
      const lastMessageMap = new Map();
      lastMessages.forEach(msg => {
        lastMessageMap.set(msg.conversationId, {
          id: msg.id,
          conversationId: msg.conversationId,
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content,
          metadata: msg.metadata,
          createdAt: msg.createdAt,
        });
      });

      // Combine all data
      const conversationsWithData = result.map(({ conversation, lead }) => ({
        ...conversation,
        status: conversation.status as 'active' | 'completed' | 'abandoned',
        summary: conversation.summary || undefined,
        sentiment: (conversation.sentiment as 'neutral' | 'positive' | 'negative') || 'neutral',
        lead: lead ? {
          ...lead,
          name: lead.name || undefined,
          company: lead.company || undefined,
          industry: lead.industry || undefined,
          companySize: lead.companySize || undefined,
          phone: lead.phone || undefined,
        } as Lead : undefined,
        messageCount: countMap.get(conversation.id) || 0,
        lastMessage: lastMessageMap.get(conversation.id) || undefined,
      }));

      return conversationsWithData;
    } catch (error) {
      console.error('Failed to get conversations:', error);
      return [];
    }
  }

  static async updateConversationStatus(conversationId: string, status: 'active' | 'completed' | 'abandoned'): Promise<boolean> {
    try {
      await db
        .update(conversations)
        .set({
          status,
          updatedAt: new Date(),
        })
        .where(eq(conversations.id, conversationId));

      return true;
    } catch (error) {
      console.error('Failed to update conversation status:', error);
      return false;
    }
  }

  static async getActiveConversationsCount(workspaceId: string): Promise<number> {
    try {
      const result = await db
        .select({ count: count() })
        .from(conversations)
        .where(and(
          eq(conversations.workspaceId, workspaceId),
          eq(conversations.status, 'active')
        ));

      return result[0]?.count || 0;
    } catch (error) {
      console.error('Failed to get active conversations count:', error);
      return 0;
    }
  }

  static async getConversationAnalytics(workspaceId: string) {
    try {
      // Get total conversations
      const totalResult = await db
        .select({ count: count() })
        .from(conversations)
        .where(eq(conversations.workspaceId, workspaceId));

      const total = totalResult[0]?.count || 0;

      // Get conversations by status
      const statusResults = await db
        .select({
          status: conversations.status,
          count: count(),
        })
        .from(conversations)
        .where(eq(conversations.workspaceId, workspaceId))
        .groupBy(conversations.status);

      const statusCounts = statusResults.reduce((acc, { status, count }) => {
        acc[status] = count;
        return acc;
      }, {} as Record<string, number>);

      // Get conversations by sentiment
      const sentimentResults = await db
        .select({
          sentiment: conversations.sentiment,
          count: count(),
        })
        .from(conversations)
        .where(eq(conversations.workspaceId, workspaceId))
        .groupBy(conversations.sentiment);

      const sentimentCounts = sentimentResults.reduce((acc, { sentiment, count }) => {
        acc[sentiment || 'neutral'] = count;
        return acc;
      }, {} as Record<string, number>);

      // Get average messages per conversation
      const messageCountResult = await db
        .select({ count: count() })
        .from(messages)
        .leftJoin(conversations, eq(messages.conversationId, conversations.id))
        .where(eq(conversations.workspaceId, workspaceId));

      const totalMessages = messageCountResult[0]?.count || 0;
      const avgMessages = total > 0 ? Math.round(totalMessages / total) : 0;

      return {
        total,
        active: statusCounts.active || 0,
        completed: statusCounts.completed || 0,
        abandoned: statusCounts.abandoned || 0,
        positive: sentimentCounts.positive || 0,
        neutral: sentimentCounts.neutral || 0,
        negative: sentimentCounts.negative || 0,
        avgMessages,
      };
    } catch (error) {
      console.error('Failed to get conversation analytics:', error);
      return {
        total: 0,
        active: 0,
        completed: 0,
        abandoned: 0,
        positive: 0,
        neutral: 0,
        negative: 0,
        avgMessages: 0,
      };
    }
  }
}