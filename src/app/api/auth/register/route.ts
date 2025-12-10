import { NextRequest, NextResponse } from 'next/server';
import { db, users, workspaces } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { createSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, company } = body;

    console.log('Registration attempt:', { name, email, company });

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Generate a temporary UUID for workspace creation
    const tempUserId = crypto.randomUUID();

    // Create workspace first with temp owner
    const [workspace] = await db.insert(workspaces).values({
      name: company || `${name}'s Workspace`,
      ownerId: tempUserId,
    }).returning();

    // Create user
    const [user] = await db.insert(users).values({
      name,
      email,
      workspaceId: workspace.id,
      emailVerified: true, // Skip verification for now
    }).returning();

    // Update workspace with real owner
    await db.update(workspaces)
      .set({ ownerId: user.id })
      .where(eq(workspaces.id, workspace.id));

    // Create secure session
    const sessionToken = await createSession({
      id: user.id,
      name: user.name,
      email: user.email,
      workspaceId: user.workspaceId,
    });

    console.log('User created successfully:', user.id);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        workspaceId: user.workspaceId,
        onboardingCompleted: user.onboardingCompleted || false,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}