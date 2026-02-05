import { ReactNode } from 'react';
import Link from 'next/link';
import { InteractiveBackground } from '@/components/background';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <InteractiveBackground />
      
      {/* Header */}
      <header className="flex items-center justify-between p-6">
        <Link href="/" className="flex items-center">
          <span className="font-display text-2xl tracking-tight text-foreground">Lucyn.</span>
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-display font-semibold tracking-tight text-balance">
              {title}
            </h1>
            {subtitle && (
              <p className="text-muted-foreground text-balance">
                {subtitle}
              </p>
            )}
          </div>

          {/* Form content */}
          <div className="surface-elevated rounded-xl p-8">
            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-sm text-muted-foreground">
        <p>
          By continuing, you agree to our{' '}
          <Link href="/terms" className="underline hover:text-foreground transition-colors">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="underline hover:text-foreground transition-colors">
            Privacy Policy
          </Link>
        </p>
      </footer>
    </div>
  );
}
