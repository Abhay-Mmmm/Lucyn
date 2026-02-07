'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getGitHubStatus,
    disconnectGitHub,
    getAvailableRepos,
    connectRepository,
    getConnectedRepos,
    getRepositorySummary,
    getRepositoryHealth,
    getSuggestions,
    updateSuggestionOutcome,
    getActivity,
    getContributors,
    getPullRequests,
} from '@/lib/api/client';
import { useGitHubStore, useRepositoryStore } from '@/lib/stores';
import { useEffect } from 'react';

// GitHub Status
export function useGitHubStatus() {
    const setStatus = useGitHubStore((s) => s.setStatus);
    const setError = useGitHubStore((s) => s.setError);

    const query = useQuery({
        queryKey: ['github', 'status'],
        queryFn: getGitHubStatus,
        staleTime: 60 * 1000,
        retry: 1,
    });

    useEffect(() => {
        if (query.data) {
            setStatus(query.data);
        }
        if (query.error) {
            setError((query.error as Error).message);
        }
    }, [query.data, query.error, setStatus, setError]);

    return query;
}

export function useDisconnectGitHub() {
    const queryClient = useQueryClient();
    const reset = useGitHubStore((s) => s.reset);

    return useMutation({
        mutationFn: disconnectGitHub,
        onSuccess: () => {
            reset();
            queryClient.invalidateQueries({ queryKey: ['github'] });
            queryClient.invalidateQueries({ queryKey: ['repos'] });
        },
    });
}

// Repositories
export function useAvailableRepos() {
    const status = useGitHubStore((s) => s.status);

    return useQuery({
        queryKey: ['github', 'available-repos'],
        queryFn: getAvailableRepos,
        enabled: !!status?.connected,
        staleTime: 30 * 1000,
    });
}

export function useConnectRepository() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: connectRepository,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['repos'] });
            queryClient.invalidateQueries({ queryKey: ['github', 'available-repos'] });
        },
    });
}

export function useConnectedRepos() {
    const status = useGitHubStore((s) => s.status);
    const setRepositories = useRepositoryStore((s) => s.setRepositories);
    const setError = useRepositoryStore((s) => s.setError);

    const query = useQuery({
        queryKey: ['repos', 'connected'],
        queryFn: getConnectedRepos,
        enabled: !!status?.connected,
        staleTime: 30 * 1000,
    });

    useEffect(() => {
        if (query.data?.repos) {
            setRepositories(query.data.repos);
        }
        if (query.error) {
            setError((query.error as Error).message);
        }
    }, [query.data, query.error, setRepositories, setError]);

    return query;
}

// Repository Summary
export function useRepositorySummary(repoId: string | null) {
    return useQuery({
        queryKey: ['repos', repoId, 'summary'],
        queryFn: () => getRepositorySummary(repoId!),
        enabled: !!repoId,
        staleTime: 60 * 1000,
        refetchInterval: (query) => {
            const data = query.state.data;
            if (data?.status === 'indexing' || data?.status === 'analyzing') {
                return 10 * 1000;
            }
            return false;
        },
    });
}

// Repository Health
export function useRepositoryHealth(repoId: string | null) {
    return useQuery({
        queryKey: ['repos', repoId, 'health'],
        queryFn: () => getRepositoryHealth(repoId!),
        enabled: !!repoId,
        staleTime: 5 * 60 * 1000,
    });
}

// Suggestions
export function useSuggestions(
    repoId: string | null,
    options?: { status?: 'pending' | 'accepted' | 'rejected' | 'all'; limit?: number }
) {
    return useQuery({
        queryKey: ['repos', repoId, 'suggestions', options],
        queryFn: () => getSuggestions(repoId!, options),
        enabled: !!repoId,
        staleTime: 30 * 1000,
    });
}

export function useUpdateSuggestionOutcome() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            repoId,
            suggestionId,
            outcome,
            feedback,
        }: {
            repoId: string;
            suggestionId: string;
            outcome: 'accepted' | 'rejected' | 'dismissed';
            feedback?: string;
        }) => updateSuggestionOutcome(repoId, suggestionId, outcome, feedback),
        onSuccess: (_, { repoId }) => {
            queryClient.invalidateQueries({ queryKey: ['repos', repoId, 'suggestions'] });
        },
    });
}

// Activity
export function useActivity(
    repoId: string | null,
    options?: { limit?: number; type?: string }
) {
    return useQuery({
        queryKey: ['repos', repoId, 'activity', options],
        queryFn: () => getActivity(repoId!, options),
        enabled: !!repoId,
        staleTime: 30 * 1000,
    });
}

// Contributors
export function useContributors(repoId: string | null) {
    return useQuery({
        queryKey: ['repos', repoId, 'contributors'],
        queryFn: () => getContributors(repoId!),
        enabled: !!repoId,
        staleTime: 5 * 60 * 1000,
    });
}

// Pull Requests
export function usePullRequests(
    repoId: string | null,
    options?: { state?: 'open' | 'closed' | 'all'; limit?: number }
) {
    return useQuery({
        queryKey: ['repos', repoId, 'pull-requests', options],
        queryFn: () => getPullRequests(repoId!, options),
        enabled: !!repoId,
        staleTime: 30 * 1000,
    });
}
