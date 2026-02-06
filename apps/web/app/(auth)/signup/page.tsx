'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthLayout } from '@/components/auth/auth-layout';

// Password validation helper
function validatePassword(password: string) {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };
}

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orgName, setOrgName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [resending, setResending] = useState(false);

  // Real-time password validation
  const passwordValidation = useMemo(() => validatePassword(password), [password]);
  const isPasswordValid = Object.values(passwordValidation).every(Boolean);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Client-side validation
    if (!isPasswordValid) {
      setError('Please meet all password requirements');
      setLoading(false);
      return;
    }

    try {
      // Call our API which validates and creates user in DB
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, organizationName: orgName }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.details?.join(', ') || data.error || 'Signup failed');
        setLoading(false);
        return;
      }

      // Show the "check your email" state instead of redirecting
      setEmailSent(true);
      setLoading(false);
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to resend. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setResending(false);
    }
  };

  // ── Email-sent confirmation screen ──────────────────────────────
  if (emailSent) {
    return (
      <AuthLayout
        title="Check your email"
        subtitle={`We sent a verification link to ${email}`}
      >
        <div className="space-y-6">
          <div className="bg-primary/10 text-primary text-sm p-4 rounded-lg text-center">
            Click the link in the email to verify your account. The link expires in 24 hours.
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-lg text-center">
              {error}
            </div>
          )}

          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Didn't receive the email? Check your spam folder, or
            </p>
            <Button
              variant="outline"
              onClick={handleResend}
              disabled={resending}
              className="w-full"
            >
              {resending ? 'Sending...' : 'Resend verification email'}
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Wrong email?{' '}
            <button
              onClick={() => { setEmailSent(false); setError(''); }}
              className="font-medium text-foreground hover:underline"
            >
              Go back
            </button>
          </p>

          <p className="text-center text-sm text-muted-foreground">
            Already verified?{' '}
            <Link
              href="/login"
              className="font-medium text-foreground hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </AuthLayout>
    );
  }

  // ── Signup form ────────────────────────────────────────────────────
  return (
    <AuthLayout
      title="Start your free trial"
      subtitle="No credit card required. Get started in minutes."
    >
      <div className="space-y-6">
        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Email Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Your name
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Jane Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="orgName" className="text-sm font-medium">
                Company
              </label>
              <Input
                id="orgName"
                type="text"
                placeholder="Acme Inc"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Work email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="jane@acme.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
            {/* Password requirements */}
            {password && (
              <div className="text-xs space-y-1 mt-2">
                <p className={passwordValidation.minLength ? 'text-green-600' : 'text-muted-foreground'}>
                  {passwordValidation.minLength ? '✓' : '○'} At least 8 characters
                </p>
                <p className={passwordValidation.hasUppercase ? 'text-green-600' : 'text-muted-foreground'}>
                  {passwordValidation.hasUppercase ? '✓' : '○'} One uppercase letter
                </p>
                <p className={passwordValidation.hasLowercase ? 'text-green-600' : 'text-muted-foreground'}>
                  {passwordValidation.hasLowercase ? '✓' : '○'} One lowercase letter
                </p>
                <p className={passwordValidation.hasNumber ? 'text-green-600' : 'text-muted-foreground'}>
                  {passwordValidation.hasNumber ? '✓' : '○'} One number
                </p>
                <p className={passwordValidation.hasSpecial ? 'text-green-600' : 'text-muted-foreground'}>
                  {passwordValidation.hasSpecial ? '✓' : '○'} One special character (!@#$%^&*)
                </p>
              </div>
            )}
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={loading || !isPasswordValid}>
            {loading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium text-foreground hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
