import { NextRequest, NextResponse } from 'next/server';
import { authenticateApiRequest, isAuthError } from '@/lib/api-auth';
import { db, users } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateApiRequest();
    if (isAuthError(authResult)) {
      return authResult.error;
    }

    const userId = authResult.session.user.id;

    // Get user settings
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = user[0];

    return NextResponse.json({
      success: true,
      settings: {
        name: userData.name,
        email: userData.email,
        companyName: userData.companyName || '',
        industry: userData.industry || '',
        teamSize: userData.teamSize || '',
        notifications: {
          newLeads: true, // Default values - could be stored in user preferences
          meetingReminders: true,
          weeklyReports: false,
        },
      },
    });

  } catch (error) {
    console.error('Get user settings error:', error);
    return NextResponse.json(
      { error: 'Failed to get settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await authenticateApiRequest();
    if (isAuthError(authResult)) {
      return authResult.error;
    }

    const userId = authResult.session.user.id;
    const body = await request.json();
    const { name, email, companyName, industry, teamSize, notifications } = body;

    // Update user settings
    await db
      .update(users)
      .set({
        name,
        email,
        companyName,
        industry,
        teamSize,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    // Note: In a full implementation, you'd also store notification preferences
    // in a separate user_preferences table

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
    });

  } catch (error) {
    console.error('Update user settings error:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}