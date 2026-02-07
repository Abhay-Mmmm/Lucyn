'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Lightbulb,
    Copy,
    Check,
    ChevronDown,
    ChevronUp,
    ThumbsUp,
    ThumbsDown,
    X,
    AlertTriangle,
    Shield,
    Zap,
    Wrench,
    TestTube,
    RefreshCw,
    Loader2,
} from 'lucide-react';
import { useSuggestions, useUpdateSuggestionOutcome } from '@/lib/hooks';
import type { AISuggestion } from '@/lib/api/types';

interface SuggestionsListProps {
    repoId: string;
}

export function SuggestionsList({ repoId }: SuggestionsListProps) {
    const { data, isLoading, error, refetch, isFetching } = useSuggestions(repoId, { status: 'pending', limit: 10 });

    if (isLoading) {
        return <SuggestionsLoading />;
    }

    if (error) {
        return <SuggestionsError onRetry={() => refetch()} isRetrying={isFetching} />;
    }

    if (!data?.suggestions?.length) {
        return <SuggestionsEmpty />;
    }

    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
                <div>
                    <CardTitle className="text-base font-medium">AI Insights</CardTitle>
                    <CardDescription>{data.total} suggestions available</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => refetch()} disabled={isFetching}>
                    <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                {data.suggestions.map((suggestion) => (
                    <SuggestionCard key={suggestion.id} suggestion={suggestion} repoId={repoId} />
                ))}
            </CardContent>
        </Card>
    );
}

function SuggestionCard({ suggestion, repoId }: { suggestion: AISuggestion; repoId: string }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [copied, setCopied] = useState(false);
    const updateOutcome = useUpdateSuggestionOutcome();

    const typeConfig = {
        architecture: { icon: Lightbulb, color: 'text-blue-600', bg: 'bg-blue-100' },
        performance: { icon: Zap, color: 'text-amber-600', bg: 'bg-amber-100' },
        security: { icon: Shield, color: 'text-red-600', bg: 'bg-red-100' },
        maintainability: { icon: Wrench, color: 'text-purple-600', bg: 'bg-purple-100' },
        testing: { icon: TestTube, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    };

    const config = typeConfig[suggestion.type] || typeConfig.architecture;
    const Icon = config.icon;

    const handleCopy = async () => {
        if (suggestion.promptForAgents) {
            await navigator.clipboard.writeText(suggestion.promptForAgents);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleOutcome = async (outcome: 'accepted' | 'rejected' | 'dismissed') => {
        await updateOutcome.mutateAsync({
            repoId,
            suggestionId: suggestion.id,
            outcome,
        });
    };

    return (
        <div className="border rounded-lg overflow-hidden">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-4 flex items-start gap-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
            >
                <div className={`mt-0.5 p-2 rounded-full ${config.bg}`}>
                    <Icon className={`h-4 w-4 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h4 className="font-medium truncate">{suggestion.title}</h4>
                        <Badge variant="secondary" className="shrink-0 capitalize">
                            {suggestion.type}
                        </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {suggestion.explanation}
                    </p>
                </div>
                <div className="shrink-0 text-muted-foreground">
                    {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
            </button>

            {isExpanded && (
                <div className="border-t p-4 space-y-4 bg-zinc-50/50 dark:bg-zinc-900/50">
                    <div className="space-y-2">
                        <h5 className="text-sm font-medium">Explanation</h5>
                        <p className="text-sm text-muted-foreground">{suggestion.explanation}</p>
                    </div>

                    {suggestion.whyItMatters && (
                        <div className="space-y-2">
                            <h5 className="text-sm font-medium">Why It Matters</h5>
                            <p className="text-sm text-muted-foreground">{suggestion.whyItMatters}</p>
                        </div>
                    )}

                    {suggestion.tradeoffs && (
                        <div className="space-y-2">
                            <h5 className="text-sm font-medium">Tradeoffs to Consider</h5>
                            <p className="text-sm text-muted-foreground">{suggestion.tradeoffs}</p>
                        </div>
                    )}

                    {suggestion.suggestedChange && (
                        <div className="space-y-2">
                            <h5 className="text-sm font-medium">Suggested Change</h5>
                            <pre className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm overflow-x-auto">
                                {suggestion.suggestedChange}
                            </pre>
                        </div>
                    )}

                    {suggestion.affectedFiles.length > 0 && (
                        <div className="space-y-2">
                            <h5 className="text-sm font-medium">Affected Files</h5>
                            <div className="flex flex-wrap gap-1">
                                {suggestion.affectedFiles.map((file) => (
                                    <Badge key={file} variant="outline" className="font-mono text-xs">
                                        {file}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {suggestion.promptForAgents && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h5 className="text-sm font-medium">Prompt for AI Agents</h5>
                                <Button variant="ghost" size="sm" onClick={handleCopy} className="h-8 gap-1">
                                    {copied ? (
                                        <>
                                            <Check className="h-4 w-4 text-emerald-600" />
                                            Copied
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-4 w-4" />
                                            Copy
                                        </>
                                    )}
                                </Button>
                            </div>
                            <pre className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap">
                                {suggestion.promptForAgents}
                            </pre>
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-2 border-t">
                        <span className="text-xs text-muted-foreground mr-auto">
                            Confidence: {Math.round(suggestion.confidence * 100)}%
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOutcome('dismissed')}
                            disabled={updateOutcome.isPending}
                            className="text-muted-foreground"
                        >
                            <X className="h-4 w-4 mr-1" />
                            Dismiss
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOutcome('rejected')}
                            disabled={updateOutcome.isPending}
                            className="text-destructive"
                        >
                            <ThumbsDown className="h-4 w-4 mr-1" />
                            Not Helpful
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOutcome('accepted')}
                            disabled={updateOutcome.isPending}
                        >
                            {updateOutcome.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    <ThumbsUp className="h-4 w-4 mr-1" />
                                    Helpful
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

function SuggestionsLoading() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base font-medium">AI Insights</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            </CardContent>
        </Card>
    );
}

function SuggestionsError({ onRetry, isRetrying }: { onRetry: () => void; isRetrying: boolean }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base font-medium">AI Insights</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                    <AlertTriangle className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Failed to load suggestions</p>
                    <Button variant="outline" size="sm" onClick={onRetry} disabled={isRetrying}>
                        {isRetrying ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Try Again'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function SuggestionsEmpty() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base font-medium">AI Insights</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
                    <div className="p-3 rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <Lightbulb className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                        <p className="font-medium">No suggestions yet</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Lucyn is continuously learning from your repository.
                            <br />
                            Suggestions will appear here as patterns are detected.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
