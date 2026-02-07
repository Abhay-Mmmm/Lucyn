'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthLayout } from '@/components/auth/auth-layout';
import { createClient } from '@/lib/supabase/client';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const message = searchParams.get('message');
  const urlError = searchParams.get('error');

  // Clear any stale sessions on mount
  useEffect(() => {
    const clearStaleSession = async () => {
      try {
        // Check for existing session
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error && error.message.includes('Refresh Token')) {
          // Clear the stale session
          await supabase.auth.signOut();
          console.log('Cleared stale session');
        }
      } catch (e) {
        // Silently handle - we'll let login proceed
        console.log('Session check failed, continuing...');
      }
    };
    clearStaleSession();
  }, [supabase.auth]);

  // Map URL error codes to user-friendly messages
  const errorMessages: Record<string, string> = {
    missing_token: 'Verification link is invalid. Please sign up again.',
    invalid_or_expired_token: 'This verification link has expired. Please request a new one.',
    verification_failed: 'Email verification failed. Please try again.',
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // First, ensure no stale session
      await supabase.auth.signOut();

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Handle specific error types
        if (error.message.includes('Refresh Token') || error.message.includes('refresh_token')) {
          setError('Session expired. Please try again.');
        } else if (error.message.includes('Invalid login credentials')) {
          setError('Invalid email or password.');
        } else {
          setError(error.message);
        }
        setLoading(false);
        return;
      }

      router.push('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      // Check for network errors
      if (err?.message?.includes('NetworkError') || err?.message?.includes('fetch')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(err?.message || 'Something went wrong. Please try again.');
      }
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account to continue"
    >
      <div className="space-y-6">
        {message && (
          <div className="bg-primary/5 text-primary text-sm p-4 rounded-lg text-center">
            {message}
          </div>
        )}

        {(error || urlError) && (
          <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-lg text-center">
            {error || (urlError && errorMessages[urlError]) || 'An error occurred. Please try again.'}
          </div>
        )}

        {/* Email Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link
            href="/signup"
            className="font-medium text-foreground hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
