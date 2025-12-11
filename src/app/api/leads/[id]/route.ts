import { NextRequest, NextResponse } from 'next/server';
import { db, leads } from '@/lib/db';
import { authenticateApiRequest, isAuthError } from '@/lib/api-auth';
import { eq, and } from 'drizzle-orm';
import { sanitizeInput } from '@/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await authenticateApiRequest();
    if (isAuthError(authResult)) {
      return authResult.error;
    }

    const { id } = await params;
    const workspaceId = authResult.session.user.workspaceId;

    const lead = await db.query.leads.findFirst({
      where: and(
        eq(leads.id, id),
        eq(leads.workspaceId, workspaceId)
      ),
      with: {
        score: true,
        assignedUser: {
          columns: { id: true, name: true, email: true },
        },
        conversation: {
          with: {
            messages: {
              orderBy: (messages, { asc }) => [asc(messages.createdAt)],
            },
          },
        },
        meetings: {
          orderBy: (meetings, { desc }) => [desc(meetings.scheduledAt)],
        },
      },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: lead,
    });
  } catch (error) {
    console.error('Error fetching lead:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lead' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await authenticateApiRequest();
    if (isAuthError(authResult)) {
      return authResult.error;
    }

    const { id } = await params;
    const workspaceId = authResult.session.user.workspaceId;

    const body = await request.json();
    const {
      name,
      company,
      industry,
      companySize,
      phone,
      status,
      assignedTo,
      metadata,
    } = body;

    // Verify lead exists and belongs to workspace
    const existingLead = await db.query.leads.findFirst({
      where: and(
        eq(leads.id, id),
        eq(leads.workspaceId, workspaceId)
      ),
    });

    if (!existingLead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Update lead
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name ? sanitizeInput(name) : null;
    if (company !== undefined) updateData.company = company ? sanitizeInput(company) : null;
    if (industry !== undefined) updateData.industry = industry ? sanitizeInput(industry) : null;
    if (companySize !== undefined) updateData.companySize = companySize ? sanitizeInput(companySize) : null;
    if (phone !== undefined) updateData.phone = phone ? sanitizeInput(phone) : null;
    if (status !== undefined) updateData.status = status;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo;
    if (metadata !== undefined) updateData.metadata = metadata;

    const [updatedLead] = await db.update(leads)
      .set(updateData)
      .where(eq(leads.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      data: updatedLead,
    });
  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json(
      { error: 'Failed to update lead' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await authenticateApiRequest();
    if (isAuthError(authResult)) {
      return authResult.error;
    }

    const { id } = await params;
    const workspaceId = authResult.session.user.workspaceId;

    // Verify lead exists and belongs to workspace
    const existingLead = await db.query.leads.findFirst({
      where: and(
        eq(leads.id, id),
        eq(leads.workspaceId, workspaceId)
      ),
    });

    if (!existingLead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Delete lead (cascade will handle related records)
    await db.delete(leads).where(eq(leads.id, id));

    return NextResponse.json({
      success: true,
      message: 'Lead deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting lead:', error);
    return NextResponse.json(
      { error: 'Failed to delete lead' },
      { status: 500 }
    );
  }
}