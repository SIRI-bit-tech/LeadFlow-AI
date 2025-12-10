import { NextRequest } from 'next/server';
import { db, leads, conversations, messages } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { addMessage, analyzeConversationSentiment } from '@/services/conversation';
import { scoreLeadFromConversation } from '@/services/lead-scoring';
import { AIService, LEAD_QUALIFICATION_PROMPT } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const { messages: chatMessages, leadId, conversationId } = await request.json();

    if (!leadId || !conversationId) {
      return new Response('Lead ID and Conversation ID are required', { status: 400 });
    }

    // Get lead and conversation data
    const lead = await db.query.leads.findFirst({
      where: eq(leads.id, leadId),
      with: {
        conversation: true,
      },
    });

    if (!lead) {
      return new Response('Lead not found', { status: 404 });
    }

    // Save user message
    const userMessage = chatMessages[chatMessages.length - 1];
    if (userMessage.role === 'user') {
      await addMessage(conversationId, 'user', userMessage.content);
    }

    // Prepare context for AI
    const leadContext = {
      name: lead.name || 'there',
      company: lead.company || 'your company',
      industry: lead.industry || 'your industry',
      source: lead.source,
    };

    const systemPrompt = `${LEAD_QUALIFICATION_PROMPT}

Lead Context:
- Name: ${leadContext.name}
- Company: ${leadContext.company}
- Industry: ${leadContext.industry}
- Source: ${leadContext.source}
- Current Score: ${lead.score}/100

Guidelines for this conversation:
- Be warm and professional
- Ask one question at a time
- Show genuine interest in their challenges
- Gather information about company size, budget, timeline, and decision authority
- If they seem qualified (engaged and have budget/authority), offer to schedule a meeting
- If they seem unqualified, provide helpful resources and politely wrap up`;

    // Generate AI response with streaming using multi-provider fallback
    const result = await AIService.streamText(systemPrompt, {
      messages: chatMessages,
      temperature: 0.7,
      onFinish: async (result: any) => {
        // Save AI response
        await addMessage(conversationId, 'assistant', result.text);

        // Analyze sentiment
        await analyzeConversationSentiment(conversationId);

        // Score lead if conversation has enough messages
        if (chatMessages.length >= 4) {
          await scoreLeadFromConversation(
            leadId,
            chatMessages,
            {
              company: lead.company || undefined,
              industry: lead.industry || undefined,
              companySize: lead.companySize || undefined,
            }
          );
        }
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Error in AI chat:', error);
    return new Response('Internal server error', { status: 500 });
  }
}