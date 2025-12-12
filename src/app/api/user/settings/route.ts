import { NextRequest, NextResponse } from 'next/server';
import { authenticateApiRequest, isAuthError } from '@/lib/api-auth';
import { db, users } from '@/lib/db';
import { eq, and, ne } from 'drizzle-orm';

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

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Valid team size options
const VALID_TEAM_SIZES = ['1', '2-5', '6-10', '11-25', '26-50', '51-100', '100+'];

export async function PUT(request: NextRequest) {
  try {
    const authResult = await authenticateApiRequest();
    if (isAuthError(authResult)) {
      return authResult.error;
    }

    const userId = authResult.session.user.id;
    const body = await request.json();
    const { name, email, companyName, industry, teamSize, notifications } = body;

    // Input validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || email.trim().length === 0) {
      return NextResponse.json(
        { error: 'Email is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json(
        { error: 'Email must be a valid email address' },
        { status: 400 }
      );
    }

    if (teamSize && !VALID_TEAM_SIZES.includes(teamSize)) {
      return NextResponse.json(
        { error: 'Team size must be one of: ' + VALID_TEAM_SIZES.join(', ') },
        { status: 400 }
      );
    }

    // Validate optional string fields
    if (companyName && typeof companyName !== 'string') {
      return NextResponse.json(
        { error: 'Company name must be a string' },
        { status: 400 }
      );
    }

    if (industry && typeof industry !== 'string') {
      return NextResponse.json(
        { error: 'Industry must be a string' },
        { status: 400 }
      );
    }

    // Check for email uniqueness (excluding current user)
    const existingUser = await db
      .select()
      .from(users)
      .where(and(
        eq(users.email, email.trim()),
        ne(users.id, userId)
      ))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Email address is already in use by another user' },
        { status: 409 }
      );
    }

    // Prepare update data
    const updateData = {
      name: name.trim(),
      email: email.trim(),
      companyName: companyName?.trim() || null,
      industry: industry?.trim() || null,
      teamSize: teamSize || null,
      updatedAt: new Date(),
    };

    // Update user settings with proper error handling
    try {
      await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, userId));
    } catch (dbError: any) {
      console.error('Database update error:', dbError);
      
      // Handle unique constraint violations
      if (dbError.code === '23505' || dbError.message?.includes('unique')) {
        return NextResponse.json(
          { error: 'Email address is already in use' },
          { status: 409 }
        );
      }
      
      // Handle other database errors
      throw dbError;
    }

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