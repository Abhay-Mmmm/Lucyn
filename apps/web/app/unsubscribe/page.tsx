'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, Mail } from 'lucide-react';

export default function UnsubscribePage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) return;

    setIsLoading(true);

    try {
      // TODO: Implement actual unsubscribe logic
      // This could be an API route that updates user preferences in the database
      const response = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error('Unsubscribe error:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
            {isSubmitted ? 'Unsubscribed' : 'Unsubscribe'}
          </CardTitle>
          <CardDescription className="text-center">
            {isSubmitted
              ? "You've been successfully unsubscribed from our emails."
              : 'We\'re sorry to see you go. Enter your email to unsubscribe from our mailing list.'}
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
          ) : (
            <form onSubmit={handleUnsubscribe} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Processing...' : 'Unsubscribe'}
              </Button>
              <div className="text-center">
                <Link
                  href="/"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Never mind, take me back
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
