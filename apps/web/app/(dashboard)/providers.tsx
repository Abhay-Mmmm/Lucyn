'use client';

import { GitHubGate, RepositoryGate } from '@/components/dashboard';

export function DashboardProviders({ children }: { children: React.ReactNode }) {
    return (
        <GitHubGate>
            <RepositoryGate>
                {children}
            </RepositoryGate>
        </GitHubGate>
    );
}
