import { NextRequest, NextResponse } from 'next/server';
import { ConversationService } from '@/services/conversation-service';
import { authenticateApiRequest, isAuthError } from '@/lib/api-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get authenticated user
    const authResult = await authenticateApiRequest();
    if (isAuthError(authResult)) {
      return authResult.error;
    }

    const user = authResult.session.user;

    // Get conversation to verify workspace ownership
    const conversation = await ConversationService.getConversationById(id);
    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Verify conversation belongs to user's workspace
    if (conversation.workspaceId !== user.workspaceId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Get conversation messages
    const messages = await ConversationService.getConversationMessages(id);

    return NextResponse.json({
      success: true,
      messages,
    });

  } catch (error) {
    console.error('Get conversation messages error:', error);
    return NextResponse.json(
      { error: 'Failed to get messages' },
      { status: 500 }
    );
  }
}