import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth.config';
import { ProtectedNav } from '@/components/auth/protected-nav';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/');
  }

  return (
    <div>
      <ProtectedNav userName={session.user?.name} />
      {children}
    </div>
  );
}
