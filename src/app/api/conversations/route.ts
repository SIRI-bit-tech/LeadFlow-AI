import { NextRequest, NextResponse } from 'next/server';
import { db, users } from '@/lib/db';
import { auth } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { getActiveConversations } from '@/services/conversation';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's workspace ID from database
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const sentiment = searchParams.get('sentiment');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const conversationsData = await getActiveConversations(user.workspaceId);

    // Apply filters
    let filteredConversations = conversationsData;

    if (status && status !== 'all') {
      filteredConversations = filteredConversations.filter(conv => conv.status === status);
    }

    if (sentiment && sentiment !== 'all') {
      filteredConversations = filteredConversations.filter(conv => conv.sentiment === sentiment);
    }

    if (search) {
      const searchTerm = search.toLowerCase();
      filteredConversations = filteredConversations.filter(conv => 
        conv.lead.name?.toLowerCase().includes(searchTerm) ||
        conv.lead.email.toLowerCase().includes(searchTerm) ||
        conv.lead.company?.toLowerCase().includes(searchTerm) ||
        conv.summary?.toLowerCase().includes(searchTerm)
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedConversations = filteredConversations.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: paginatedConversations,
      pagination: {
        page,
        limit,
        total: filteredConversations.length,
        pages: Math.ceil(filteredConversations.length / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}