import { NextRequest, NextResponse } from 'next/server';
import { AIService, getAvailableProviders } from '@/lib/ai';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
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

    const availableProviders = getAvailableProviders();
    const providerStatus = AIService.getProviderStatus();

    return NextResponse.json({
      availableProviders: availableProviders.map(p => p.name),
      providerStatus,
      totalProviders: availableProviders.length,
      hasBackup: availableProviders.length > 1
    });

  } catch (error) {
    console.error('AI providers status error:', error);
    return NextResponse.json(
      { error: 'Failed to get AI provider status' },
      { status: 500 }
    );
  }
}

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

    const { providerName } = await request.json();

    if (!providerName) {
      return NextResponse.json(
        { error: 'Provider name is required' },
        { status: 400 }
      );
    }

    const success = AIService.switchProvider(providerName);

    if (success) {
      return NextResponse.json({
        success: true,
        message: `Switched to ${providerName}`,
        currentProvider: providerName
      });
    } else {
      return NextResponse.json(
        { error: 'Provider not found or not available' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('AI provider switch error:', error);
    return NextResponse.json(
      { error: 'Failed to switch AI provider' },
      { status: 500 }
    );
  }
}