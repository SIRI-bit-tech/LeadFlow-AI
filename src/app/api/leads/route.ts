import { NextRequest, NextResponse } from 'next/server';
import { db, leads } from '@/lib/db';
import { authenticateApiRequest, isAuthError } from '@/lib/api-auth';
import { eq, desc, and, like, or, count } from 'drizzle-orm';
import { validateEmail, sanitizeInput } from '@/lib/utils';
import { createConversation } from '@/services/conversation';

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateApiRequest();
    if (isAuthError(authResult)) {
      return authResult.error;
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const classification = searchParams.get('classification');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const workspaceId = authResult.session.user.workspaceId;
    let whereConditions = [eq(leads.workspaceId, workspaceId)];

    if (status) {
      whereConditions.push(eq(leads.status, status));
    }
    if (classification) {
      whereConditions.push(eq(leads.classification, classification));
    }
    if (search) {
      const searchTerm = `%${search}%`;
      whereConditions.push(
        or(
          like(leads.name, searchTerm),
          like(leads.email, searchTerm),
          like(leads.company, searchTerm)
        )!
      );
    }

    const whereClause = whereConditions.length > 1 ? and(...whereConditions) : whereConditions[0];
    
    const leadsData = await db.query.leads.findMany({
      where: whereClause,
      with: {
        score: true,
        assignedUser: {
          columns: { id: true, name: true, email: true },
        },
        conversation: {
          columns: { id: true, status: true, summary: true, sentiment: true },
        },
      },
      orderBy: [desc(leads.createdAt)],
      limit,
      offset,
    });

    // Count total leads with same conditions
    const countResult = await db.select({ count: count() }).from(leads).where(whereClause);
    const total = countResult[0]?.count || 0;

    return NextResponse.json({
      success: true,
      data: {
        leads: leadsData,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateApiRequest();
    if (isAuthError(authResult)) {
      return authResult.error;
    }

    const workspaceId = authResult.session.user.workspaceId;

    const body = await request.json();
    const {
      email,
      name,
      company,
      industry,
      companySize,
      phone,
      source = 'manual',
      metadata = {},
    } = body;

    // Validation
    if (!email || !validateEmail(email)) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Check if lead already exists
    const existingLead = await db.query.leads.findFirst({
      where: and(
        eq(leads.email, email),
        eq(leads.workspaceId, workspaceId)
      ),
    });

    if (existingLead) {
      return NextResponse.json(
        { error: 'Lead with this email already exists' },
        { status: 409 }
      );
    }

    // Create lead
    const [newLead] = await db.insert(leads).values({
      email: sanitizeInput(email),
      name: name ? sanitizeInput(name) : null,
      company: company ? sanitizeInput(company) : null,
      industry: industry ? sanitizeInput(industry) : null,
      companySize: companySize ? sanitizeInput(companySize) : null,
      phone: phone ? sanitizeInput(phone) : null,
      source,
      workspaceId: workspaceId,
      metadata,
    }).returning();

    // Create conversation for the lead
    const conversation = await createConversation(newLead.id, workspaceId);

    return NextResponse.json({
      success: true,
      data: {
        ...newLead,
        conversation,
      },
    });
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    );
  }
}