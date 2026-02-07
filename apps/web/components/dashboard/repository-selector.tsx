'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FolderGit2, ChevronDown, Plus, Check, Loader2 } from 'lucide-react';
import { useRepositoryStore, useSelectedRepository } from '@/lib/stores';
import { useConnectedRepos } from '@/lib/hooks';

export function RepositorySelector() {
    const [open, setOpen] = useState(false);
    const { isLoading } = useConnectedRepos();
    const repositories = useRepositoryStore((s) => s.repositories);
    const selectedRepoId = useRepositoryStore((s) => s.selectedRepoId);
    const selectRepository = useRepositoryStore((s) => s.selectRepository);
    const selectedRepo = useSelectedRepository();

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading repos...
            </div>
        );
    }

    if (!repositories.length) {
        return (
            <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                <Plus className="h-4 w-4" />
                Connect Repository
            </Button>
        );
    }

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                    <div className="flex items-center gap-2 truncate">
                        <FolderGit2 className="h-4 w-4 shrink-0" />
                        <span className="truncate">{selectedRepo?.name || 'Select repository'}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="start">
                <DropdownMenuLabel>Repositories</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {repositories.map((repo) => (
                    <DropdownMenuItem
                        key={repo.id}
                        onClick={() => {
                            selectRepository(repo.id);
                            setOpen(false);
                        }}
                        className="flex items-center justify-between"
                    >
                        <span className="truncate">{repo.fullName}</span>
                        {repo.id === selectedRepoId && (
                            <Check className="h-4 w-4 shrink-0 text-primary" />
                        )}
                    </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => selectRepository(null)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Connect another repository
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
