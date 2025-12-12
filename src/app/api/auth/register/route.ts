import { NextRequest, NextResponse } from 'next/server';
import { db, users, workspaces } from '@/lib/db';
import { eq, sql } from 'drizzle-orm';
import { createSession } from '@/lib/session';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, company } = body;



    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Validate name is a non-empty string
    if (typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: 'Valid name is required' },
        { status: 400 }
      );
    }
    const trimmedName = name.trim();

    // Validate and coerce email to string
    if (typeof email !== 'string' || !email.trim()) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Validate and coerce password to string
    if (typeof password !== 'string' || !password.trim()) {
      return NextResponse.json(
        { error: 'Valid password is required' },
        { status: 400 }
      );
    }

    const workspaceName =
      typeof company === 'string' && company.trim()
        ? company.trim()
        : `${trimmedName}'s Workspace`;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Additional password strength validation
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return NextResponse.json(
        { error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' },
        { status: 400 }
      );
    }

    // Normalize email for consistent uniqueness checks
    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists using case-insensitive comparison
    const existingUser = await db.query.users.findFirst({
      where: sql`lower(${users.email}) = ${normalizedEmail}`,
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password with error handling
    const saltRounds = 12;
    let passwordHash: string;
    try {
      passwordHash = await bcrypt.hash(password, saltRounds);
    } catch (hashError) {
      console.error('Password hashing failed:', hashError);
      return NextResponse.json(
        { error: 'Failed to process password' },
        { status: 500 }
      );
    }

    // Create user and workspace in a transaction to ensure data consistency
    const result = await db.transaction(async (tx) => {
      try {
        // Create user first
        const [user] = await tx.insert(users).values({
          name: trimmedName,
          email: normalizedEmail,
          passwordHash,
          workspaceId: crypto.randomUUID(), // Temporary workspace ID
          emailVerified: true, // Skip verification for now
        }).returning();

        // Create workspace with the real user as owner
        const [workspace] = await tx.insert(workspaces).values({
          name: workspaceName,
          ownerId: user.id,
        }).returning();

        // Update user with the real workspace ID
        const [updatedUser] = await tx.update(users)
          .set({ workspaceId: workspace.id })
          .where(eq(users.id, user.id))
          .returning();

        return { user: updatedUser, workspace };
      } catch (txError) {
        console.error('Transaction failed:', txError);
        throw txError; // This will trigger rollback
      }
    });

    const { user } = result;

    // Create secure session
    await createSession({
      id: user.id,
      name: user.name,
      email: user.email,
      workspaceId: user.workspaceId,
    });



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