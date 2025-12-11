import { AppSidebar } from '@/components/layout/app-sidebar';
import { getSession } from '@/lib/session';
import { db, users } from '@/lib/db';
import { eq } from 'drizzle-orm';

async function getUserData(userId: string) {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      with: {
        workspace: true,
      },
    });
    return user;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to continue</p>
          <a href="/login" className="text-blue-600 hover:underline">Go to Login</a>
        </div>
      </div>
    );
  }

  const userData = await getUserData(session.user.id);
  
  if (!userData) {
    return <div>User not found</div>;
  }

  // Check if user needs to complete onboarding
  if (!userData.onboardingCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please complete your setup</p>
          <a href="/setup" className="text-blue-600 hover:underline">Complete Setup</a>
        </div>
      </div>
    );
  }

  const user = {
    name: userData.name,
    email: userData.email,
    role: userData.role,
  };

  const workspace = {
    name: userData.workspace?.name || 'Workspace',
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AppSidebar user={user} workspace={workspace} />
      <main className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}