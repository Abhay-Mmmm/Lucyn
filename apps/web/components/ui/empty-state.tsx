'use client';

import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { 
  GitBranch, 
  Users, 
  Lightbulb, 
  Activity,
  MessageSquare,
  Search,
  Inbox,
  FolderOpen
} from 'lucide-react';

interface EmptyStateProps {
  type?: 'repos' | 'team' | 'insights' | 'activity' | 'feedback' | 'search' | 'inbox' | 'generic';
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
}

const emptyStateConfigs = {
  repos: {
    icon: GitBranch,
    title: 'No repositories connected',
    description: 'Connect your GitHub repositories to start getting insights about your team\'s code.',
  },
  team: {
    icon: Users,
    title: 'No team members yet',
    description: 'Invite your engineering team to start tracking productivity and health metrics.',
  },
  insights: {
    icon: Lightbulb,
    title: 'No insights yet',
    description: 'Insights will appear here as Lucyn analyzes your team\'s activity and patterns.',
  },
  activity: {
    icon: Activity,
    title: 'No recent activity',
    description: 'Activity from your connected repositories will appear here.',
  },
  feedback: {
    icon: MessageSquare,
    title: 'No feedback collected',
    description: 'Developer feedback will appear here once you connect Discord or enable async standups.',
  },
  search: {
    icon: Search,
    title: 'No results found',
    description: 'Try adjusting your search terms or filters to find what you\'re looking for.',
  },
  inbox: {
    icon: Inbox,
    title: 'All caught up!',
    description: 'You have no new notifications or items to review.',
  },
  generic: {
    icon: FolderOpen,
    title: 'Nothing here yet',
    description: 'This section is empty. Content will appear once you start using this feature.',
  },
};

export function EmptyState({ 
  type = 'generic',
  title,
  description,
  icon,
  action,
}: EmptyStateProps) {
  const config = emptyStateConfigs[type];
  const Icon = icon || config.icon;
  const displayTitle = title || config.title;
  const displayDescription = description || config.description;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-6">
        {typeof Icon === 'function' ? (
          <Icon className="w-8 h-8 text-muted-foreground/50" />
        ) : (
          Icon
        )}
      </div>
      <h3 className="font-display text-xl font-semibold mb-2">{displayTitle}</h3>
      <p className="text-muted-foreground max-w-sm leading-relaxed">{displayDescription}</p>
      {action && (
        <Button 
          className="mt-6 bg-foreground text-background hover:bg-foreground/90"
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
