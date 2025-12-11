import { NextRequest, NextResponse } from 'next/server';
import { ConversationService } from '@/services/conversation-service';
import { getAuthenticatedUser } from '@/lib/api-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get authenticated user
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
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