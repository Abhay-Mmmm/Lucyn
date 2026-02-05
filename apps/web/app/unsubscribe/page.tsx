'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function UnsubscribePage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Ref to track if unsubscribe is in progress to prevent duplicate calls
  const unsubscribeInProgressRef = useRef(false);

  const handleUnsubscribe = useCallback(async () => {
    if (!token) {
      setError('Invalid unsubscribe link. Please use the link from your email.');
      return;
    }
    
    // Prevent duplicate submissions using ref
    if (unsubscribeInProgressRef.current) {
      return;
    }
    unsubscribeInProgressRef.current = true;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/unsubscribe?token=${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        setError(null);
        setIsSubmitted(true);
      } else {
        const data = await response.json().catch(() => ({ error: 'Failed to unsubscribe' }));
        
        // Provide user-friendly error messages
        if (response.status === 401) {
          setError('This unsubscribe link has expired or is invalid. Please use the latest link from your email.');
        } else if (response.status === 429) {
          setError('Too many requests. Please try again in a few minutes.');
        } else {
          setError(data.error || 'Something went wrong. Please try again.');
        }
      }
    } catch (error) {
      console.error('Unsubscribe error:', error);
      setError(
        error instanceof Error 
          ? error.message 
          : 'Unable to process your request. Please try again later.'
      );
    } finally {
      setIsLoading(false);
      unsubscribeInProgressRef.current = false;
    }
  }, [token]);

  // Auto-submit when token is present
  useEffect(() => {
    if (token && !isSubmitted && !isLoading) {
      handleUnsubscribe();
    } else if (!token) {
      setError('Invalid unsubscribe link. Please use the link from your email.');
    }
  }, [token, isSubmitted, isLoading, handleUnsubscribe]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Link href="/" className="text-2xl font-display tracking-tight">
              Lucyn<span className="text-primary">.</span>
            </Link>
          </div>
          <CardTitle className="text-2xl text-center">
            {isSubmitted ? 'Unsubscribed' : isLoading ? 'Processing...' : 'Unsubscribe'}
          </CardTitle>
          <CardDescription className="text-center">
            {isSubmitted
              ? "You've been successfully unsubscribed from our emails."
              : isLoading
              ? 'Please wait while we process your request...'
              : error
              ? 'There was a problem with your request.'
              : 'Processing your unsubscribe request...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSubmitted ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <p className="text-center text-muted-foreground text-sm">
                You will no longer receive emails from Lucyn. You can resubscribe at any time from your account settings.
              </p>
              <div className="flex flex-col gap-2 pt-4">
                <Button asChild className="w-full">
                  <Link href="/">Return to Home</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/login">Sign In</Link>
                </Button>
              </div>
            </div>
          ) : error ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <XCircle className="h-16 w-16 text-destructive" />
              </div>
              <div className="rounded-md bg-destructive/10 border border-destructive/20 p-4">
                <p className="text-sm text-destructive text-center">{error}</p>
              </div>
              <p className="text-center text-muted-foreground text-sm">
                If you continue to have issues, please contact support or manage your email preferences from your account settings.
              </p>
              <div className="flex flex-col gap-2 pt-4">
                <Button asChild className="w-full">
                  <Link href="/">Return to Home</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/login">Sign In to Manage Preferences</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center">
                <Loader2 className="h-16 w-16 text-muted-foreground animate-spin" />
              </div>
              <p className="text-center text-muted-foreground text-sm">
                Processing your unsubscribe request...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
