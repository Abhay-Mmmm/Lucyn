// packages/ai/src/analysis/index.ts
// Context-aware code analysis chains

import { createJSONCompletion } from '../client';

export interface CodeAnalysisInput {
    type: 'pull_request' | 'commit' | 'file';
    title: string;
    description?: string;
    files: Array<{
        filename: string;
        status?: string;
        additions?: number;
        deletions?: number;
        patch?: string;
        content?: string;
    }>;
    repositoryContext: string;
    patterns: string[];
}

export interface CodeSuggestion {
    type: 'architecture' | 'performance' | 'security' | 'style' | 'refactor' | 'testing' | 'documentation' | 'bug';
    title: string;
    explanation: string;
    whyItMatters?: string;
    tradeoffs?: string;
    suggestedChange?: string;
    confidence: number;
    affectedFiles?: string[];
    relatedPatterns?: string[];
    promptForAgents?: string;
}

export interface CodeAnalysisResult {
    summary: string;
    overallScore: number; // 0-100
    suggestions: CodeSuggestion[];
    riskAreas: string[];
    positives: string[];
}

/**
 * Analyze code with full repository context
 */
export async function analyzeCodeWithContext(
    input: CodeAnalysisInput
): Promise<CodeAnalysisResult> {
    const systemPrompt = `You are Lucyn, an expert AI code reviewer and product engineer. 
You analyze code changes with deep understanding of the repository's architecture, patterns, and conventions.

Your analysis should:
1. Consider the repository's established patterns and conventions
2. Identify issues that could cause problems in production
3. Suggest improvements that align with the codebase's architecture
4. Avoid making suggestions that have been made before (check prior suggestions)
5. Focus on high-impact, actionable suggestions

When suggesting changes:
- Be specific and provide concrete examples
- Explain WHY something matters, not just WHAT to change
- Consider tradeoffs and acknowledge them
- Provide agent-ready prompts that could be used to implement the fix

Quality scoring (0-100):
- 90-100: Exceptional code, follows all best practices
- 70-89: Good code with minor suggestions
- 50-69: Acceptable code with notable issues
- 30-49: Problematic code that needs attention
- 0-29: Critical issues that should block merge`;

    const userPrompt = `Analyze this ${input.type}:

## Title
${input.title}

${input.description ? `## Description\n${input.description}\n` : ''}

## Repository Context
${input.repositoryContext}

## Established Patterns To Follow
${input.patterns.map(p => `- ${p}`).join('\n') || 'No specific patterns identified yet'}

## Changed Files
${input.files.map(f => `### ${f.filename} (${f.status || 'modified'})
${f.additions !== undefined ? `+${f.additions} -${f.deletions}` : ''}
${f.patch ? `\`\`\`diff\n${f.patch}\n\`\`\`` : ''}
${f.content ? `\`\`\`\n${f.content.slice(0, 2000)}\n\`\`\`` : ''}
`).join('\n')}

Respond with JSON matching this schema:
{
  "summary": "Brief summary of the changes and overall assessment",
  "overallScore": 75,
  "suggestions": [
    {
      "type": "performance|security|style|refactor|testing|documentation|bug|architecture",
      "title": "Clear, actionable title",
      "explanation": "Detailed explanation of the issue",
      "whyItMatters": "Impact on the codebase/product",
      "tradeoffs": "Any tradeoffs to consider",
      "suggestedChange": "Specific code change if applicable",
      "confidence": 0.85,
      "affectedFiles": ["path/to/file.ts"],
      "relatedPatterns": ["Pattern names this relates to"],
      "promptForAgents": "A prompt that could be given to an AI coding agent to implement this fix"
    }
  ],
  "riskAreas": ["Areas of concern"],
  "positives": ["Good practices observed"]
}`;

    const result = await createJSONCompletion<CodeAnalysisResult>(
        userPrompt,
        {
            systemPrompt: systemPrompt,
            temperature: 0.3,
            maxTokens: 4000,
        }
    );

    return result;
}

/**
 * Generate a summary of repository changes over time
 */
export async function generateChangeSummary(
    commits: Array<{
        sha: string;
        message: string;
        author: string;
        filesChanged: string[];
        timestamp: Date;
    }>,
    repositoryContext: string
): Promise<{
    summary: string;
    themes: string[];
    activeAreas: string[];
    contributors: Array<{ author: string; commits: number }>;
}> {
    const systemPrompt = `You are Lucyn, an AI that summarizes development activity.
Generate a concise summary of recent changes, identifying themes and patterns.`;

    const userPrompt = `Summarize these ${commits.length} commits:

${commits.slice(0, 50).map(c => `- [${c.author}] ${c.message} (${c.filesChanged.length} files)`).join('\n')}

Repository context:
${repositoryContext}

Respond with JSON:
{
  "summary": "Overview of recent work",
  "themes": ["Development themes identified"],
  "activeAreas": ["Most active areas of the codebase"],
  "contributors": [{"author": "username", "commits": 10}]
}`;

    const result = await createJSONCompletion<{
        summary: string;
        themes: string[];
        activeAreas: string[];
        contributors: Array<{ author: string; commits: number }>;
    }>(
        userPrompt,
        {
            systemPrompt: systemPrompt,
            temperature: 0.5
        }
    );

    return result;
}

/**
 * Generate code review for a specific file
 */
export async function reviewFile(
    filePath: string,
    content: string,
    language: string,
    repositoryContext: string,
    patterns: string[]
): Promise<{
    issues: Array<{
        line?: number;
        severity: 'error' | 'warning' | 'info';
        message: string;
        suggestion?: string;
    }>;
    summary: string;
}> {
    const systemPrompt = `You are Lucyn, reviewing a single file for issues.
Focus on:
- Bugs and potential runtime errors
- Security vulnerabilities
- Performance issues
- Style and maintainability
- Adherence to repository patterns`;

    const userPrompt = `Review this ${language} file: ${filePath}

\`\`\`${language}
${content.slice(0, 8000)}
\`\`\`

Repository patterns to follow:
${patterns.join('\n') || 'No specific patterns'}

Context:
${repositoryContext}

Respond with JSON:
{
  "issues": [
    {
      "line": 42,
      "severity": "warning",
      "message": "Description of issue",
      "suggestion": "How to fix it"
    }
  ],
  "summary": "Overall assessment of the file"
}`;

    const result = await createJSONCompletion<{
        issues: Array<{
            line?: number;
            severity: 'error' | 'warning' | 'info';
            message: string;
            suggestion?: string;
        }>;
        summary: string;
    }>(
        userPrompt,
        {
            systemPrompt: systemPrompt,
            temperature: 0.2
        }
    );

    return result;
}
