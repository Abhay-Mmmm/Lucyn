'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Database, Brain, CheckCircle2, AlertCircle } from 'lucide-react';
import type { RepositoryStatus } from '@/lib/api/types';

interface RepositoryStatusDisplayProps {
    status: RepositoryStatus;
    repoName: string;
}

export function RepositoryStatusDisplay({ status, repoName }: RepositoryStatusDisplayProps) {
    if (status === 'ready') {
        return null;
    }

    const statusConfig = {
        pending: {
            icon: Loader2,
            title: 'Preparing Analysis',
            description: `Lucyn is setting up to analyze ${repoName}. This usually takes a few seconds.`,
            animate: true,
        },
        indexing: {
            icon: Database,
            title: 'Indexing Repository',
            description: `Lucyn is scanning the codebase structure and building an understanding of ${repoName}. This may take a few minutes for larger repositories.`,
            animate: true,
        },
        analyzing: {
            icon: Brain,
            title: 'Analyzing Patterns',
            description: `Lucyn is identifying architectural patterns, conventions, and potential improvements in ${repoName}.`,
            animate: true,
        },
        error: {
            icon: AlertCircle,
            title: 'Analysis Error',
            description: 'Something went wrong while analyzing this repository. Please try refreshing or contact support.',
            animate: false,
        },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
        <div className="flex items-center justify-center min-h-[40vh]">
            <Card className="max-w-md w-full">
                <CardHeader className="text-center pb-2">
                    <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${status === 'error' ? 'bg-destructive/10' : 'bg-zinc-100 dark:bg-zinc-800'
                        }`}>
                        <Icon className={`h-8 w-8 ${status === 'error' ? 'text-destructive' : ''} ${config.animate ? 'animate-spin' : ''}`} />
                    </div>
                    <CardTitle className="text-xl">{config.title}</CardTitle>
                    <CardDescription className="mt-2">
                        {config.description}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {status !== 'error' && (
                        <div className="space-y-2">
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all duration-1000 animate-pulse"
                                    style={{
                                        width: status === 'pending' ? '10%' : status === 'indexing' ? '45%' : '80%'
                                    }}
                                />
                            </div>
                            <p className="text-xs text-center text-muted-foreground">
                                This page will automatically update when ready
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
