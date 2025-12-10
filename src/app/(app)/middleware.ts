import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export async function checkOnboarding() {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }

  // Check if user has completed onboarding
  if (!session.user.onboardingCompleted) {
    redirect('/setup');
  }

  return session;
}