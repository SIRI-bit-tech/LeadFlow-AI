import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { companyName, industry, teamSize, goals, integrations } = body;

    // Update user with onboarding data
    await db
      .update(users)
      .set({
        companyName,
        industry,
        teamSize,
        goals: JSON.stringify(goals),
        integrations: JSON.stringify(integrations),
        onboardingCompleted: true,
        updatedAt: new Date()
      })
      .where(eq(users.id, session.user.id));

    return NextResponse.json({ 
      success: true,
      message: 'Onboarding completed successfully'
    });

  } catch (error) {
    console.error('Onboarding completion error:', error);
    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
      { status: 500 }
    );
  }
}