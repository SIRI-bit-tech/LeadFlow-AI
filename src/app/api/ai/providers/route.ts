import { NextRequest, NextResponse } from 'next/server';
import { AIService, getAvailableProviders } from '@/lib/ai';
import { authenticateApiRequest, isAuthError } from '@/lib/api-auth';

export async function GET() {
  try {
    const authResult = await authenticateApiRequest();
    if (isAuthError(authResult)) {
      return authResult.error;
    }

    const availableProviders = getAvailableProviders();
    const providerStatus = AIService.getProviderStatus();

    return NextResponse.json({
      availableProviders: availableProviders.map(p => p.name),
      providerStatus,
      totalProviders: availableProviders.length
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
    const authResult = await authenticateApiRequest();
    if (isAuthError(authResult)) {
      return authResult.error;
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