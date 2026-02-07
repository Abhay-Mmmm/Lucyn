'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    FolderGit2,
    Search,
    Lock,
    Globe,
    Star,
    RefreshCw,
    AlertCircle,
    CheckCircle2,
    Loader2,
} from 'lucide-react';
import { useAvailableRepos, useConnectedRepos, useConnectRepository } from '@/lib/hooks';
import { useRepositoryStore } from '@/lib/stores';
import type { Repository } from '@/lib/api/types';

interface RepositoryGateProps {
    children: React.ReactNode;
}

export function RepositoryGate({ children }: RepositoryGateProps) {
    const { data: connectedData, isLoading: loadingConnected, error: connectedError, refetch } = useConnectedRepos();
    const selectedRepoId = useRepositoryStore((s) => s.selectedRepoId);
    const repositories = useRepositoryStore((s) => s.repositories);

    if (loadingConnected) {
        return <RepositoryGateLoading />;
    }

    if (connectedError) {
        return <RepositoryGateError error={(connectedError as Error).message} onRetry={() => refetch()} />;
    }

    if (!repositories.length) {
        return <SelectRepositoryPrompt />;
    }

    if (!selectedRepoId) {
        return <SelectRepositoryPrompt hasRepos />;
    }

    return <>{children}</>;
}

function RepositoryGateLoading() {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
                <p className="text-sm text-muted-foreground">Loading repositories...</p>
            </div>
        </div>
    );
}

function RepositoryGateError({ error, onRetry }: { error: string; onRetry: () => void }) {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="max-w-md w-full">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                        <AlertCircle className="h-6 w-6 text-destructive" />
                    </div>
                    <CardTitle>Unable to Load Repositories</CardTitle>
                    <CardDescription className="mt-2">{error}</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                    <Button onClick={onRetry} variant="outline">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Try Again
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

function SelectRepositoryPrompt({ hasRepos }: { hasRepos?: boolean }) {
    const [search, setSearch] = useState('');
    const { data, isLoading, error, refetch } = useAvailableRepos();
    const connectMutation = useConnectRepository();
    const selectRepository = useRepositoryStore((s) => s.selectRepository);
    const connectedRepos = useRepositoryStore((s) => s.repositories);

    const availableRepos = data?.repos ?? [];
    const filteredRepos = availableRepos.filter((repo) =>
        repo.fullName.toLowerCase().includes(search.toLowerCase())
    );

    const handleConnect = async (repo: Repository) => {
        try {
            const result = await connectMutation.mutateAsync({
                repoId: repo.githubId || repo.id,
                repoName: repo.name,
                fullName: repo.fullName,
                description: repo.description || undefined,
                language: repo.language || undefined,
                isPrivate: repo.isPrivate,
                defaultBranch: repo.defaultBranch,
            });
            selectRepository(result.repository.id);
        } catch (e) {
            console.error('Failed to connect repository:', e);
        }
    };

    const handleSelectExisting = (repo: Repository) => {
        selectRepository(repo.id);
    };

    return (
        <div className="flex items-center justify-center min-h-[60vh] p-6">
            <Card className="max-w-2xl w-full">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <FolderGit2 className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-2xl">
                        {hasRepos ? 'Select a Repository' : 'Connect a Repository'}
                    </CardTitle>
                    <CardDescription className="mt-2 text-base">
                        {hasRepos
                            ? 'Choose which repository you want to analyze.'
                            : 'Select a repository from your GitHub account to get started with Lucyn.'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {hasRepos && connectedRepos.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Connected Repositories</p>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {connectedRepos.map((repo) => (
                                    <button
                                        key={repo.id}
                                        onClick={() => handleSelectExisting(repo)}
                                        className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors text-left"
                                    >
                                        <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{repo.fullName}</p>
                                            {repo.description && (
                                                <p className="text-sm text-muted-foreground truncate">{repo.description}</p>
                                            )}
                                        </div>
                                        <Badge variant="secondary">{repo.language || 'Unknown'}</Badge>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-muted-foreground">
                                {hasRepos ? 'Or connect another repository' : 'Available Repositories'}
                            </p>
                            <Button variant="ghost" size="sm" onClick={() => refetch()}>
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search repositories..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-8 text-sm text-muted-foreground">
                            Failed to load repositories. Click refresh to try again.
                        </div>
                    ) : filteredRepos.length === 0 ? (
                        <div className="text-center py-8 text-sm text-muted-foreground">
                            {search ? 'No repositories match your search.' : 'No repositories available.'}
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {filteredRepos.map((repo) => (
                                <div
                                    key={repo.id}
                                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                                >
                                    {repo.isPrivate ? (
                                        <Lock className="h-5 w-5 text-muted-foreground shrink-0" />
                                    ) : (
                                        <Globe className="h-5 w-5 text-muted-foreground shrink-0" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{repo.fullName}</p>
                                        {repo.description && (
                                            <p className="text-sm text-muted-foreground truncate">{repo.description}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {repo.stars !== undefined && repo.stars > 0 && (
                                            <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                                <Star className="h-3.5 w-3.5" />
                                                {repo.stars}
                                            </span>
                                        )}
                                        {repo.isConnected ? (
                                            <Badge variant="secondary">Connected</Badge>
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleConnect(repo)}
                                                disabled={connectMutation.isPending}
                                            >
                                                {connectMutation.isPending ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    'Connect'
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
