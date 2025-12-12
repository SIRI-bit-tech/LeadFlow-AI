import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { conversations, messages, leads, leadScores, workspaces } from '@/db/schema';
import { generateLeadResponse, scoreLeadConversation, generateConversationSummary } from '@/lib/ai';
import { calculateLeadScore, classifyLead, validateEmail, sanitizeInput } from '@/lib/utils';
import { eq, and, desc } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { message, conversationId, leadData, workspaceId } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const sanitizedMessage = sanitizeInput(message);
    let conversation;
    let lead;

    // Get or create conversation
    if (conversationId) {
      // Existing conversation
      const existingConversation = await db
        .select()
        .from(conversations)
        .where(eq(conversations.id, conversationId))
        .limit(1);

      if (existingConversation.length === 0) {
        return NextResponse.json(
          { error: 'Conversation not found' },
          { status: 404 }
        );
      }

      conversation = existingConversation[0];

      // Get associated lead
      const existingLead = await db
        .select()
        .from(leads)
        .where(eq(leads.id, conversation.leadId))
        .limit(1);

      if (existingLead.length > 0) {
        lead = existingLead[0];
      }
    } else {
      // New conversation - create lead and conversation
      // For now, create anonymous lead (email will be collected during conversation)
      const newLeadId = crypto.randomUUID();
      const newConversationId = crypto.randomUUID();

      // Get workspace ID from request - required for production
      const targetWorkspaceId = workspaceId || await getWorkspaceFromRequest(request);
      
      if (!targetWorkspaceId) {
        return NextResponse.json(
          { error: 'Workspace ID is required' },
          { status: 400 }
        );
      }

      // Verify workspace exists or create demo workspace
      let workspaceExists = await db
        .select()
        .from(workspaces)
        .where(eq(workspaces.id, targetWorkspaceId))
        .limit(1);

      if (workspaceExists.length === 0) {
        // If it's the demo workspace, create it
        if (targetWorkspaceId === '550e8400-e29b-41d4-a716-446655440000') {
          const demoUserId = '550e8400-e29b-41d4-a716-446655440001';
          await db.insert(workspaces).values({
            id: targetWorkspaceId,
            name: 'Demo Workspace',
            industry: 'Technology',
            companySize: '11-25',
            website: 'https://demo.leadflow.ai',
            ownerId: demoUserId,
          });
        } else {
          return NextResponse.json(
            { error: 'Invalid workspace' },
            { status: 400 }
          );
        }
      }

      // Create lead with minimal data
      await db.insert(leads).values({
        id: newLeadId,
        email: leadData?.email || `${crypto.randomUUID()}@example.invalid`,
        name: leadData?.name,
        company: leadData?.company,
        source: 'widget',
        status: 'qualifying',
        score: 0,
        classification: 'cold',
        workspaceId: targetWorkspaceId,
        conversationId: newConversationId,
        metadata: leadData || {},
      });

      // Create conversation
      await db.insert(conversations).values({
        id: newConversationId,
        leadId: newLeadId,
        workspaceId: targetWorkspaceId,
        status: 'active',
        sentiment: 'neutral',
      });

      conversation = {
        id: newConversationId,
        leadId: newLeadId,
        workspaceId: targetWorkspaceId,
        status: 'active',
        sentiment: 'neutral',
      };

      lead = {
        id: newLeadId,
        email: leadData?.email || `${crypto.randomUUID()}@example.invalid`,
        name: leadData?.name,
        company: leadData?.company,
        source: 'widget',
        status: 'qualifying',
        score: 0,
        classification: 'cold',
        workspaceId: targetWorkspaceId,
        conversationId: newConversationId,
        metadata: leadData || {},
      };
    }

    // Save user message
    await db.insert(messages).values({
      id: crypto.randomUUID(),
      conversationId: conversation.id,
      role: 'user',
      content: sanitizedMessage,
    });

    // Get conversation history
    const messageHistory = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversation.id))
      .orderBy(messages.createdAt);

    // Format messages for AI
    const aiMessages = messageHistory.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

    // Generate AI response
    const aiResponse = await generateLeadResponse(aiMessages, {
      name: lead?.name || undefined,
      company: lead?.company || undefined,
      industry: lead?.industry || undefined,
      source: lead?.source || undefined,
    });

    let responseText = '';
    for await (const chunk of aiResponse.textStream) {
      responseText += chunk;
    }

    // Save AI response
    await db.insert(messages).values({
      id: crypto.randomUUID(),
      conversationId: conversation.id,
      role: 'assistant',
      content: responseText,
    });

    // Update conversation and lead scoring every few messages
    const messageCount = messageHistory.length + 2; // +2 for the new messages
    if (lead && messageCount >= 4 && messageCount % 3 === 0) {
      await updateLeadScoring(conversation.id, lead.id);
    }

    return NextResponse.json({
      message: responseText,
      conversationId: conversation.id,
      leadId: lead?.id,
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}

async function updateLeadScoring(conversationId: string, leadId: string) {
  try {
    // Get all messages for scoring
    const allMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);

    const aiMessages = allMessages.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

    // Get current lead data
    const leadData = await db
      .select()
      .from(leads)
      .where(eq(leads.id, leadId))
      .limit(1);

    if (leadData.length === 0) return;

    const lead = leadData[0];

    // Score the conversation
    const scoring = await scoreLeadConversation(aiMessages, {
      company: lead.company || undefined,
      industry: lead.industry || undefined,
      companySize: lead.companySize || undefined,
    });

    // Calculate total score
    const totalScore = calculateLeadScore({
      companyFit: scoring.companyFit,
      budgetAlignment: scoring.budgetAlignment,
      timeline: scoring.timeline,
      authority: scoring.authority,
      need: scoring.need,
      engagement: scoring.engagement,
    });

    // Update lead score
    await db.insert(leadScores).values({
      id: crypto.randomUUID(),
      leadId: leadId,
      companyFit: scoring.companyFit,
      budgetAlignment: scoring.budgetAlignment,
      timeline: scoring.timeline,
      authority: scoring.authority,
      need: scoring.need,
      engagement: scoring.engagement,
      total: totalScore,
      reasoning: scoring.reasoning,
    }).onConflictDoUpdate({
      target: leadScores.leadId,
      set: {
        companyFit: scoring.companyFit,
        budgetAlignment: scoring.budgetAlignment,
        timeline: scoring.timeline,
        authority: scoring.authority,
        need: scoring.need,
        engagement: scoring.engagement,
        total: totalScore,
        reasoning: scoring.reasoning,
        updatedAt: new Date(),
      },
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

    // Update conversation sentiment and summary
    const summary = await generateConversationSummary(aiMessages);
    
    await db
      .update(conversations)
      .set({
        sentiment: scoring.sentiment,
        summary: summary,
        updatedAt: new Date(),
      })
      .where(eq(conversations.id, conversationId));

  } catch (error) {
    console.error('Failed to update lead scoring:', error);
  }
}

async function getWorkspaceFromRequest(request: NextRequest): Promise<string | null> {
  try {
    // In production, workspace ID should always be provided by the widget
    // If not provided, this is an invalid request
    return null;
  } catch (error) {
    console.error('Failed to get workspace:', error);
    return null;
  }
}