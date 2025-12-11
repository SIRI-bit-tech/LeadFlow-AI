import { db, conversations, messages, leads } from '@/lib/db';
import { eq, desc, count } from 'drizzle-orm';
import { generateConversationSummary, scoreLeadConversation } from '@/lib/ai';
import { calculateLeadScore, classifyLead } from '@/lib/utils';

export async function createConversation(leadId: string, workspaceId: string) {
  const [conversation] = await db.insert(conversations).values({
    leadId,
    workspaceId,
    status: 'active',
  }).returning();

  // Update lead with conversation ID
  await db.update(leads)
    .set({ conversationId: conversation.id })
    .where(eq(leads.id, leadId));

  return conversation;
}

export async function addMessage(
  conversationId: string,
  role: 'user' | 'assistant' | 'system',
  content: string,
  metadata?: Record<string, any>
) {
  const [message] = await db.insert(messages).values({
    conversationId,
    role,
    content,
    metadata,
  }).returning();

  return message;
}

export async function getConversationMessages(conversationId: string) {
  return await db.query.messages.findMany({
    where: eq(messages.conversationId, conversationId),
    orderBy: [messages.createdAt],
  });
}

export async function updateConversationSummary(conversationId: string) {
  const conversationMessages = await getConversationMessages(conversationId);
  
  if (conversationMessages.length === 0) return;

  const messageHistory = conversationMessages.map(m => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));

  try {
    const summary = await generateConversationSummary(messageHistory);
    
    await db.update(conversations)
      .set({ 
        summary,
        updatedAt: new Date(),
      })
      .where(eq(conversations.id, conversationId));

    return summary;
  } catch (error) {
    console.error('Error generating conversation summary:', error);
    return null;
  }
}

export async function completeConversation(conversationId: string) {
  // Get conversation and lead info
  const conversation = await db.query.conversations.findFirst({
    where: eq(conversations.id, conversationId),
    with: {
      lead: true,
      messages: {
        orderBy: [messages.createdAt],
      },
    },
  });

  if (!conversation) return;

  // Generate summary
  await updateConversationSummary(conversationId);

  // Score the lead based on conversation
  const messageHistory = conversation.messages.map(m => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));

  await scoreLeadFromConversationData(
    conversation.leadId,
    messageHistory,
    {
      company: conversation.lead.company || undefined,
      industry: conversation.lead.industry || undefined,
      companySize: conversation.lead.companySize || undefined,
    }
  );

  // Mark conversation as completed
  await db.update(conversations)
    .set({ 
      status: 'completed',
      updatedAt: new Date(),
    })
    .where(eq(conversations.id, conversationId));

  return conversation;
}

export async function getActiveConversations(workspaceId: string) {
  const rawConversations = await db.query.conversations.findMany({
    where: eq(conversations.workspaceId, workspaceId),
    with: {
      lead: true,
      messages: {
        orderBy: [desc(messages.createdAt)],
        limit: 1,
      },
    },
    orderBy: [desc(conversations.updatedAt)],
  });

  // Get accurate message counts for each conversation
  const conversationsWithCounts = await Promise.all(
    rawConversations.map(async (conv) => {
      const messageCountResult = await db
        .select({ count: count() })
        .from(messages)
        .where(eq(messages.conversationId, conv.id));

      const messageCount = messageCountResult[0]?.count || 0;

      return {
        id: conv.id,
        status: conv.status,
        summary: conv.summary,
        sentiment: conv.sentiment || 'neutral',
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
        messageCount,
        lead: {
          id: conv.lead.id,
          name: conv.lead.name,
          email: conv.lead.email,
          company: conv.lead.company,
          classification: conv.lead.classification,
          score: conv.lead.score,
        },
        lastMessage: conv.messages.length > 0 ? {
          role: conv.messages[0].role,
          content: conv.messages[0].content,
          timestamp: conv.messages[0].createdAt,
        } : {
          role: 'assistant',
          content: 'Conversation started',
          timestamp: conv.createdAt,
        },
      };
    })
  );

  return conversationsWithCounts;
}

export async function scoreLeadFromConversationData(
  leadId: string,
  messageHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  leadData?: {
    company?: string;
    industry?: string;
    companySize?: string;
  }
) {
  try {
    // Score the conversation using AI
    const scoring = await scoreLeadConversation(messageHistory, leadData);

    // Calculate total score
    const totalScore = calculateLeadScore({
      companyFit: scoring.companyFit,
      budgetAlignment: scoring.budgetAlignment,
      timeline: scoring.timeline,
      authority: scoring.authority,
      need: scoring.need,
      engagement: scoring.engagement,
    });

    // Update lead classification and status
    const classification = classifyLead(totalScore);
    const status = totalScore >= 70 ? 'qualified' : 'qualifying';

    await db
      .update(leads)
      .set({
        score: totalScore,
        classification,
        status,
        updatedAt: new Date(),
      })
      .where(eq(leads.id, leadId));

    return {
      totalScore,
      classification,
      status,
      scoring,
    };
  } catch (error) {
    console.error('Failed to score lead from conversation:', error);
    return null;
  }
}

export async function analyzeConversationSentiment(conversationId: string) {
  const conversationMessages = await getConversationMessages(conversationId);
  
  // Simple sentiment analysis based on keywords
  const positiveWords = ['great', 'excellent', 'perfect', 'love', 'amazing', 'interested', 'yes', 'definitely'];
  const negativeWords = ['no', 'not', 'bad', 'terrible', 'hate', 'never', 'wrong', 'problem'];
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  conversationMessages.forEach(message => {
    if (message.role === 'user') {
      const content = message.content.toLowerCase();
      positiveWords.forEach(word => {
        if (content.includes(word)) positiveCount++;
      });
      negativeWords.forEach(word => {
        if (content.includes(word)) negativeCount++;
      });
    }
  });
  
  let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
  if (positiveCount > negativeCount) sentiment = 'positive';
  else if (negativeCount > positiveCount) sentiment = 'negative';
  
  // Update conversation sentiment
  await db.update(conversations)
    .set({ sentiment })
    .where(eq(conversations.id, conversationId));
    
  return sentiment;
}