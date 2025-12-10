import { NextRequest, NextResponse } from 'next/server';
import { db, users, verifications } from '@/lib/db';
import { eq, and, gt, lt } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resetToken, newPassword } = body;

    // Validate required fields
    if (!resetToken || !newPassword) {
      return NextResponse.json(
        { error: 'Reset token and new password are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Additional password strength validation
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      return NextResponse.json(
        { error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' },
        { status: 400 }
      );
    }

    // Find and validate reset token
    const resetRecord = await db.query.verifications.findFirst({
      where: and(
        eq(verifications.value, resetToken),
        gt(verifications.expiresAt, new Date()) // Token must not be expired
      ),
    });

    if (!resetRecord) {
      // Generic error to prevent token enumeration
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 401 }
      );
    }

    // Find user associated with the reset token
    const user = await db.query.users.findFirst({
      where: eq(users.email, resetRecord.identifier),
    });

    if (!user) {
      // Clean up invalid token and return generic error
      await db.delete(verifications).where(eq(verifications.id, resetRecord.id));
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 401 }
      );
    }

    // Hash new password securely
    const saltRounds = 12;
    let passwordHash: string;
    try {
      passwordHash = await bcrypt.hash(newPassword, saltRounds);
    } catch (hashError) {
      console.error('Password hashing failed:', hashError);
      return NextResponse.json(
        { error: 'Failed to process password' },
        { status: 500 }
      );
    }

    // Update user password and invalidate reset token in a transaction
    await db.transaction(async (tx) => {
      // Update user with new password hash
      await tx
        .update(users)
        .set({
          passwordHash,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));

      // Delete/invalidate the used reset token
      await tx.delete(verifications).where(eq(verifications.id, resetRecord.id));

      // Clean up any other expired tokens for this user (housekeeping)
      await tx.delete(verifications).where(
        and(
          eq(verifications.identifier, user.email),
          lt(verifications.expiresAt, new Date())
        )
      );
    });

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}