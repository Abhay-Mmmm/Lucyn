'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Github, ExternalLink, Shield, RefreshCw, AlertCircle } from 'lucide-react';
import { useGitHubStatus } from '@/lib/hooks';
import { useGitHubStore } from '@/lib/stores';

interface GitHubGateProps {
    children: React.ReactNode;
}

export function GitHubGate({ children }: GitHubGateProps) {
    const { isLoading, error, refetch, isFetching } = useGitHubStatus();
    const status = useGitHubStore((s) => s.status);

    if (isLoading) {
        return <GitHubGateLoading />;
    }

    if (error) {
        return <GitHubGateError error={(error as Error).message} onRetry={() => refetch()} isRetrying={isFetching} />;
    }

    if (!status?.connected) {
        return <GitHubConnectPrompt expired={status?.expired} />;
    }

    return <>{children}</>;
}

function GitHubGateLoading() {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
                <p className="text-sm text-muted-foreground">Checking GitHub connection...</p>
            </div>
        </div>
    );
}

function GitHubGateError({ error, onRetry, isRetrying }: { error: string; onRetry: () => void; isRetrying: boolean }) {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="max-w-md w-full">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                        <AlertCircle className="h-6 w-6 text-destructive" />
                    </div>
                    <CardTitle>Connection Error</CardTitle>
                    <CardDescription className="mt-2">
                        {error || 'Unable to check your GitHub connection status.'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                    <Button onClick={onRetry} disabled={isRetrying} variant="outline">
                        {isRetrying ? (
                            <>
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                Retrying...
                            </>
                        ) : (
                            <>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Try Again
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

function GitHubConnectPrompt({ expired }: { expired?: boolean }) {
    const handleConnect = () => {
        window.location.href = '/api/oauth/github';
    };

    return (
        <div className="flex items-center justify-center min-h-[60vh] p-6">
            <Card className="max-w-lg w-full">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <Github className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-2xl">
                        {expired ? 'Reconnect GitHub' : 'Connect GitHub to Continue'}
                    </CardTitle>
                    <CardDescription className="mt-2 text-base">
                        {expired
                            ? 'Your GitHub connection has expired. Please reconnect to continue using Lucyn.'
                            : 'Lucyn needs access to your GitHub repositories to provide intelligent insights and suggestions.'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-3">
                        <p className="text-sm font-medium text-muted-foreground">What Lucyn will access:</p>
                        <ul className="space-y-2">
                            <PermissionItem>Read repository code and structure</PermissionItem>
                            <PermissionItem>View pull requests and commits</PermissionItem>
                            <PermissionItem>Read contributor information</PermissionItem>
                            <PermissionItem>Post review comments (optional)</PermissionItem>
                        </ul>
                    </div>

                    <div className="flex items-start gap-2 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 text-sm">
                        <Shield className="h-4 w-4 mt-0.5 text-emerald-600 shrink-0" />
                        <p className="text-muted-foreground">
                            Your code remains private. Lucyn only analyzes patterns and structure—we never store your source code.
                        </p>
                    </div>

                    <Button onClick={handleConnect} size="lg" className="w-full gap-2">
                        <Github className="h-5 w-5" />
                        {expired ? 'Reconnect GitHub' : 'Connect with GitHub'}
                        <ExternalLink className="h-4 w-4 ml-1" />
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                        By connecting, you agree to our{' '}
                        <a href="/terms" className="underline hover:text-foreground">Terms of Service</a>
                        {' '}and{' '}
                        <a href="/privacy" className="underline hover:text-foreground">Privacy Policy</a>.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

function PermissionItem({ children }: { children: React.ReactNode }) {
    return (
        <li className="flex items-center gap-2 text-sm">
            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span>{children}</span>
        </li>
    );
}
