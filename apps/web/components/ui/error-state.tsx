'use client';

import { Button } from '@/components/ui/button';
import { 
  AlertCircle, 
  RefreshCw, 
  WifiOff, 
  ServerOff, 
  ShieldAlert,
  Bug
} from 'lucide-react';

interface ErrorStateProps {
  type?: 'generic' | 'network' | 'server' | 'auth' | 'notFound';
  title?: string;
  description?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

const errorConfigs = {
  generic: {
    icon: AlertCircle,
    title: 'Something went wrong',
    description: 'We encountered an unexpected error. Please try again or contact support if the issue persists.',
  },
  network: {
    icon: WifiOff,
    title: 'Connection lost',
    description: 'Unable to connect to the server. Please check your internet connection and try again.',
  },
  server: {
    icon: ServerOff,
    title: 'Server unavailable',
    description: 'Our servers are temporarily unavailable. We\'re working on it. Please try again in a few minutes.',
  },
  auth: {
    icon: ShieldAlert,
    title: 'Authentication required',
    description: 'Your session has expired or you don\'t have permission to view this content.',
  },
  notFound: {
    icon: Bug,
    title: 'Page not found',
    description: 'The page you\'re looking for doesn\'t exist or has been moved.',
  },
};

export function ErrorState({ 
  type = 'generic',
  title,
  description,
  onRetry,
  showRetry = true,
}: ErrorStateProps) {
  const config = errorConfigs[type];
  const Icon = config.icon;
  const displayTitle = title || config.title;
  const displayDescription = description || config.description;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950 flex items-center justify-center mb-6">
        <Icon className="w-8 h-8 text-rose-500" />
      </div>
      <h3 className="font-display text-xl font-semibold mb-2">{displayTitle}</h3>
      <p className="text-muted-foreground max-w-md leading-relaxed">{displayDescription}</p>
      {showRetry && onRetry && (
        <Button 
          variant="outline"
          className="mt-6 gap-2"
          onClick={onRetry}
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}

// Inline error message
export function InlineError({ 
  message,
  onRetry 
}: { 
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800">
      <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
      <p className="text-sm text-rose-700 dark:text-rose-300 flex-1">{message}</p>
      {onRetry && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onRetry}
          className="shrink-0 text-rose-600 hover:text-rose-700 hover:bg-rose-100 dark:hover:bg-rose-900"
        >
          Retry
        </Button>
      )}
    </div>
  );
}
