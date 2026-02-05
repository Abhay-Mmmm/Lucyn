'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  GitBranch,
  Lightbulb,
  Settings,
  CheckSquare,
  MessageSquare,
} from 'lucide-react';

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Team', href: '/dashboard/team', icon: Users },
  { name: 'Repositories', href: '/dashboard/repos', icon: GitBranch },
  { name: 'Insights', href: '/dashboard/insights', icon: Lightbulb },
  { name: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
  { name: 'Feedback', href: '/dashboard/feedback', icon: MessageSquare },
];

const secondaryNavigation = [
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed left-0 top-0 z-40 h-screen w-64 bg-[hsl(var(--sidebar))] border-r border-[hsl(var(--sidebar-border))]"
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-[hsl(var(--sidebar-border))] px-6">
          <Link href="/dashboard" className="flex items-center">
            <span className="font-display text-xl tracking-tight text-foreground">
              Lucyn.
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          <div className="space-y-1">
            {navigation.map((item) => {
              // For Overview (/dashboard), only match exact path
              // For other routes, match exact path or sub-routes
              const isActive = item.href === '/dashboard' 
                ? pathname === item.href 
                : pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-accent-foreground))] shadow-sm'
                      : 'text-[hsl(var(--sidebar-muted))] hover:bg-[hsl(var(--sidebar-accent))/0.5] hover:text-[hsl(var(--sidebar-foreground))]'
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Secondary navigation */}
        <div className="border-t border-[hsl(var(--sidebar-border))] px-3 py-4">
          {secondaryNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-accent-foreground))] shadow-sm'
                    : 'text-[hsl(var(--sidebar-muted))] hover:bg-[hsl(var(--sidebar-accent))/0.5] hover:text-[hsl(var(--sidebar-foreground))]'
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

      </div>
    </aside>
  );
}
