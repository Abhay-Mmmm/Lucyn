// ============================================
// Commit Analysis Prompt
// ============================================

export interface CommitAnalysisInput {
  message: string;
  filesCount: number;
  additions: number;
  deletions: number;
  fileNames?: string[];
}

export function createCommitAnalysisPrompt(input: CommitAnalysisInput): string {
  return `
Analyze this Git commit and provide structured feedback.

Commit Message: ${input.message}
Files Changed: ${input.filesCount}
Additions: ${input.additions}
Deletions: ${input.deletions}
${input.fileNames ? `Files: ${input.fileNames.join(', ')}` : ''}

Evaluate:
1. Message Quality (1-10): Is it descriptive? Does it follow conventions?
2. Scope (1-10): Is the commit focused or too broad?
3. Suggestions: What could be improved?

Respond in JSON format:
{
  "messageQuality": number,
  "scopeScore": number,
  "suggestions": string[],
  "summary": string,
  "sentiment": "positive" | "neutral" | "needs_improvement"
}
`.trim();
}

export interface CommitAnalysisResult {
  messageQuality: number;
  scopeScore: number;
  suggestions: string[];
  summary: string;
  sentiment: 'positive' | 'neutral' | 'needs_improvement';
}

// ============================================
// PR Review Prompt
// ============================================

export interface PRReviewInput {
  title: string;
  description: string;
  files: string[];
  diffSummary: string;
  additions: number;
  deletions: number;
}

export function createPRReviewPrompt(input: PRReviewInput): string {
  return `
You are a senior software engineer reviewing a pull request.

PR Title: ${input.title}
Description: ${input.description || 'No description provided'}
Files Changed: ${input.files.slice(0, 20).join(', ')}${input.files.length > 20 ? ` and ${input.files.length - 20} more` : ''}
Lines Added: ${input.additions}
Lines Removed: ${input.deletions}

Diff Summary:
${input.diffSummary}

Provide constructive feedback:
1. Overall assessment
2. Potential issues or risks
3. Suggestions for improvement
4. Questions for the author

Be helpful, not critical. Focus on learning and improvement.

Respond in JSON format:
{
  "overallAssessment": string,
  "qualityScore": number (1-10),
  "risks": string[],
  "suggestions": string[],
  "questions": string[],
  "highlights": string[]
}
`.trim();
}

export interface PRReviewResult {
  overallAssessment: string;
  qualityScore: number;
  risks: string[];
  suggestions: string[];
  questions: string[];
  highlights: string[];
}

// ============================================
// Insight Generation Prompt
// ============================================

export interface InsightGenerationInput {
  teamSize: number;
  weeklyCommits: number;
  weeklyPRs: number;
  avgMergeTime: number;
  openPRCount: number;
  workloadDistribution: Array<{ name: string; percentage: number }>;
  recentTrends: {
    velocity: 'increasing' | 'stable' | 'decreasing';
    quality: 'improving' | 'stable' | 'declining';
  };
}

export function createInsightGenerationPrompt(input: InsightGenerationInput): string {
  return `
Based on the following engineering metrics, generate actionable insights for leadership.

Team Size: ${input.teamSize}
Weekly Commits: ${input.weeklyCommits}
Weekly Pull Requests: ${input.weeklyPRs}
Average PR Merge Time: ${input.avgMergeTime} hours
Open PRs: ${input.openPRCount}
Velocity Trend: ${input.recentTrends.velocity}
Quality Trend: ${input.recentTrends.quality}

Workload Distribution:
${input.workloadDistribution.map(w => `- ${w.name}: ${w.percentage}%`).join('\n')}

Generate 3-5 insights that are:
- Business-relevant (not technical jargon)
- Actionable (include what to do)
- Prioritized by impact

Respond in JSON format:
{
  "insights": [
    {
      "type": "velocity" | "quality" | "health" | "risk" | "opportunity" | "recommendation",
      "severity": "info" | "warning" | "critical",
      "title": string,
      "description": string,
      "recommendation": string,
      "impact": "low" | "medium" | "high"
    }
  ]
}
`.trim();
}

export interface InsightGenerationResult {
  insights: Array<{
    type: 'velocity' | 'quality' | 'health' | 'risk' | 'opportunity' | 'recommendation';
    severity: 'info' | 'warning' | 'critical';
    title: string;
    description: string;
    recommendation: string;
    impact: 'low' | 'medium' | 'high';
  }>;
}

// ============================================
// Task Assignment Prompt
// ============================================

export interface TaskAssignmentInput {
  task: {
    title: string;
    description: string;
    requiredSkills: string[];
    complexity: number;
    estimatedHours: number;
  };
  candidates: Array<{
    id: string;
    name: string;
    skills: string[];
    currentWorkload: number;
    recentPerformance: number;
    familiarity: string[];
  }>;
}

export function createTaskAssignmentPrompt(input: TaskAssignmentInput): string {
  return `
Suggest the best assignee for this task based on the team's capabilities.

Task:
- Title: ${input.task.title}
- Description: ${input.task.description || 'No description'}
- Required Skills: ${input.task.requiredSkills.join(', ') || 'Not specified'}
- Complexity: ${input.task.complexity}/10
- Estimated Hours: ${input.task.estimatedHours}

Available Team Members:
${input.candidates.map(c => `
- ${c.name} (ID: ${c.id})
  Skills: ${c.skills.join(', ')}
  Current Workload: ${c.currentWorkload}%
  Recent Performance: ${c.recentPerformance}/10
  Familiar with: ${c.familiarity.join(', ') || 'Nothing specific'}
`).join('\n')}

Consider:
1. Skill match (40% weight)
2. Current availability (25% weight)
3. Historical success with similar tasks (20% weight)
4. Growth opportunity (15% weight)

Respond in JSON format:
{
  "suggestedAssignee": {
    "id": string,
    "confidence": number (0-1)
  },
  "alternativeAssignees": [
    {
      "id": string,
      "confidence": number (0-1)
    }
  ],
  "reasoning": string,
  "factors": {
    "skillMatch": number (0-1),
    "availability": number (0-1),
    "historicalSuccess": number (0-1),
    "growthOpportunity": number (0-1)
  }
}
`.trim();
}

export interface TaskAssignmentResult {
  suggestedAssignee: {
    id: string;
    confidence: number;
  };
  alternativeAssignees: Array<{
    id: string;
    confidence: number;
  }>;
  reasoning: string;
  factors: {
    skillMatch: number;
    availability: number;
    historicalSuccess: number;
    growthOpportunity: number;
  };
}

// ============================================
// Slack Feedback Prompts
// ============================================

export function createCommitTipPrompt(
  developerName: string,
  commitMessage: string,
  suggestions: string[]
): string {
  return `
Generate a friendly, helpful Slack message for a developer about their commit.

Developer: ${developerName}
Commit Message: ${commitMessage}
Suggestions: ${suggestions.join('; ')}

The message should:
1. Be encouraging, not critical
2. Be concise (2-3 sentences)
3. Include a specific actionable tip
4. Feel like it's from a helpful teammate

Respond with just the message text, no JSON.
`.trim();
}

export function createPRTipPrompt(
  developerName: string,
  prTitle: string,
  highlights: string[],
  suggestions: string[]
): string {
  return `
Generate a friendly Slack message for a developer about their pull request.

Developer: ${developerName}
PR Title: ${prTitle}
What they did well: ${highlights.join('; ')}
Suggestions: ${suggestions.join('; ')}

The message should:
1. Acknowledge what they did well first
2. Provide constructive suggestions
3. Be brief and actionable
4. Feel supportive and helpful

Respond with just the message text, no JSON.
`.trim();
}

export function createAchievementPrompt(
  developerName: string,
  achievement: string,
  stats: Record<string, number>
): string {
  return `
Generate a celebratory Slack message for a developer's achievement.

Developer: ${developerName}
Achievement: ${achievement}
Stats: ${JSON.stringify(stats)}

The message should:
1. Be celebratory and fun
2. Include relevant emojis
3. Mention specific accomplishments
4. Be brief (1-2 sentences)

Respond with just the message text, no JSON.
`.trim();
}

// ============================================
// Question Answering Prompt
// ============================================

export function createQuestionAnsweringPrompt(
  question: string,
  context: string,
  codebaseInfo?: string
): string {
  return `
You are Lucyn, an AI assistant that helps developers with questions about their codebase and engineering practices.

${codebaseInfo ? `Codebase Context:\n${codebaseInfo}\n\n` : ''}
Additional Context:
${context}

User Question: ${question}

Provide a helpful, accurate answer. If you're not sure about something, say so. If the question is about code, provide examples when helpful.
`.trim();
}
