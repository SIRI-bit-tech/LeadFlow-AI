import { NextRequest, NextResponse } from 'next/server';
import { db, workspaces, users } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Use a fixed UUID for demo workspace
    const demoId = '550e8400-e29b-41d4-a716-446655440000'; // Fixed demo UUID
    
    // Check if demo workspace exists
    let demoWorkspace = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, demoId))
      .limit(1);

    if (demoWorkspace.length === 0) {
      // Create demo workspace if it doesn't exist
      const demoUserId = '550e8400-e29b-41d4-a716-446655440001'; // Fixed demo user UUID
      
      // First, ensure demo user exists (handle circular dependency)
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.id, demoUserId))
        .limit(1);

      if (existingUser.length === 0) {
        // Create demo user with temporary workspace ID (will be updated after workspace creation)
        await db.insert(users).values({
          id: demoUserId,
          email: 'demo@example.invalid',
          name: 'Demo User',
          role: 'admin',
          workspaceId: demoId, // Reference the workspace we're about to create
          onboardingCompleted: true,
        });
      }

      // Now create the workspace
      await db.insert(workspaces).values({
        id: demoId,
        name: 'Demo Workspace',
        industry: 'Technology',
        companySize: '11-25',
        website: 'https://demo.leadflow.ai',
        ownerId: demoUserId,
      });

      demoWorkspace = await db
        .select()
        .from(workspaces)
        .where(eq(workspaces.id, demoId))
        .limit(1);
    }

    return NextResponse.json({
      success: true,
      workspace: demoWorkspace[0],
    });

  } catch (error) {
    console.error('Demo workspace error:', error);
    
    // Return the fixed demo workspace ID for testing
    return NextResponse.json({
      success: true,
      workspace: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Demo Workspace',
        industry: 'Technology',
        companySize: '11-25',
        website: 'https://demo.leadflow.ai',
      },
    });
  }
}