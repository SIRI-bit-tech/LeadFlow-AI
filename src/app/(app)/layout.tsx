import { AppSidebar } from '@/components/layout/app-sidebar';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db, users, workspaces } from '@/lib/db';
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
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session) {
    return <div>Please log in</div>;
  }

  const userData = await getUserData(session.user.id);
  
  if (!userData) {
    return <div>User not found</div>;
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
      <AppSidebar user={user} workspace={workspace} notifications={5} />
      <main className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}