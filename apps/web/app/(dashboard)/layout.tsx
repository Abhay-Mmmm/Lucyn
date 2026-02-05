import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/layout/sidebar';
import { TopNav } from '@/components/layout/top-nav';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const user = {
    name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
    email: session.user.email || '',
    avatar: session.user.user_metadata?.avatar_url,
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      <Sidebar />
      <div className="pl-64 transition-all duration-300">
        <TopNav user={user} />
        <main className="min-h-[calc(100vh-4rem)] p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
