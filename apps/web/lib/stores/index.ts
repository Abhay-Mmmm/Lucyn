'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Repository, GitHubStatus } from '@/lib/api/types';

interface GitHubState {
    status: GitHubStatus | null;
    isLoading: boolean;
    error: string | null;
    setStatus: (status: GitHubStatus | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    reset: () => void;
}

export const useGitHubStore = create<GitHubState>((set) => ({
    status: null,
    isLoading: true,
    error: null,
    setStatus: (status) => set({ status, isLoading: false, error: null }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error, isLoading: false }),
    reset: () => set({ status: null, isLoading: true, error: null }),
}));

interface RepositoryState {
    repositories: Repository[];
    selectedRepoId: string | null;
    isLoading: boolean;
    error: string | null;
    setRepositories: (repos: Repository[]) => void;
    selectRepository: (repoId: string | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    reset: () => void;
}

export const useRepositoryStore = create<RepositoryState>()(
    persist(
        (set) => ({
            repositories: [],
            selectedRepoId: null,
            isLoading: true,
            error: null,
            setRepositories: (repositories) => set({ repositories, isLoading: false, error: null }),
            selectRepository: (selectedRepoId) => set({ selectedRepoId }),
            setLoading: (isLoading) => set({ isLoading }),
            setError: (error) => set({ error, isLoading: false }),
            reset: () => set({ repositories: [], selectedRepoId: null, isLoading: true, error: null }),
        }),
        {
            name: 'lucyn-repository',
            partialize: (state) => ({ selectedRepoId: state.selectedRepoId }),
        }
    )
);

// Helper hook to get the selected repository
export function useSelectedRepository(): Repository | null {
    const repositories = useRepositoryStore((s) => s.repositories);
    const selectedRepoId = useRepositoryStore((s) => s.selectedRepoId);

    if (!selectedRepoId) return null;
    return repositories.find((r) => r.id === selectedRepoId) ?? null;
}
