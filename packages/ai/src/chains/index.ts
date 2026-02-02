import { createCompletion, createJSONCompletion } from '../client';
import {
  createCommitAnalysisPrompt,
  createPRReviewPrompt,
  createInsightGenerationPrompt,
  createTaskAssignmentPrompt,
  createCommitTipPrompt,
  createPRTipPrompt,
  createAchievementPrompt,
  createQuestionAnsweringPrompt,
  type CommitAnalysisInput,
  type CommitAnalysisResult,
  type PRReviewInput,
  type PRReviewResult,
  type InsightGenerationInput,
  type InsightGenerationResult,
  type TaskAssignmentInput,
  type TaskAssignmentResult,
} from '../prompts';

// ============================================
// Commit Analysis Chain
// ============================================

export async function analyzeCommit(input: CommitAnalysisInput): Promise<CommitAnalysisResult> {
  const prompt = createCommitAnalysisPrompt(input);
  
  return createJSONCompletion<CommitAnalysisResult>(prompt, {
    temperature: 0.3,
    maxTokens: 500,
  });
}

// ============================================
// PR Review Chain
// ============================================

export async function reviewPullRequest(input: PRReviewInput): Promise<PRReviewResult> {
  const prompt = createPRReviewPrompt(input);
  
  return createJSONCompletion<PRReviewResult>(prompt, {
    temperature: 0.4,
    maxTokens: 1000,
  });
}

// ============================================
// Insight Generation Chain
// ============================================

export async function generateInsights(input: InsightGenerationInput): Promise<InsightGenerationResult> {
  const prompt = createInsightGenerationPrompt(input);
  
  return createJSONCompletion<InsightGenerationResult>(prompt, {
    temperature: 0.5,
    maxTokens: 1500,
  });
}

// ============================================
// Task Assignment Chain
// ============================================

export async function suggestTaskAssignment(input: TaskAssignmentInput): Promise<TaskAssignmentResult> {
  const prompt = createTaskAssignmentPrompt(input);
  
  return createJSONCompletion<TaskAssignmentResult>(prompt, {
    temperature: 0.3,
    maxTokens: 800,
  });
}

// ============================================
// Slack Feedback Chains
// ============================================

export async function generateCommitTip(
  developerName: string,
  commitMessage: string,
  suggestions: string[]
): Promise<string> {
  const prompt = createCommitTipPrompt(developerName, commitMessage, suggestions);
  
  return createCompletion(prompt, {
    temperature: 0.7,
    maxTokens: 200,
  });
}

export async function generatePRTip(
  developerName: string,
  prTitle: string,
  highlights: string[],
  suggestions: string[]
): Promise<string> {
  const prompt = createPRTipPrompt(developerName, prTitle, highlights, suggestions);
  
  return createCompletion(prompt, {
    temperature: 0.7,
    maxTokens: 300,
  });
}

export async function generateAchievementMessage(
  developerName: string,
  achievement: string,
  stats: Record<string, number>
): Promise<string> {
  const prompt = createAchievementPrompt(developerName, achievement, stats);
  
  return createCompletion(prompt, {
    temperature: 0.8,
    maxTokens: 150,
  });
}

// ============================================
// Question Answering Chain
// ============================================

export async function answerQuestion(
  question: string,
  context: string,
  codebaseInfo?: string
): Promise<string> {
  const prompt = createQuestionAnsweringPrompt(question, context, codebaseInfo);
  
  return createCompletion(prompt, {
    temperature: 0.5,
    maxTokens: 1000,
  });
}

// ============================================
// Batch Processing
// ============================================

export interface BatchResult<T> {
  results: T[];
  errors: Array<{ index: number; error: string }>;
}

export async function batchAnalyzeCommits(
  commits: CommitAnalysisInput[]
): Promise<BatchResult<CommitAnalysisResult>> {
  const results: CommitAnalysisResult[] = [];
  const errors: Array<{ index: number; error: string }> = [];

  // Process in batches of 5 to avoid rate limits
  const batchSize = 5;
  
  for (let i = 0; i < commits.length; i += batchSize) {
    const batch = commits.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (commit, batchIndex) => {
      try {
        const result = await analyzeCommit(commit);
        return { index: i + batchIndex, result, error: null };
      } catch (error) {
        return { 
          index: i + batchIndex, 
          result: null, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    
    for (const { index, result, error } of batchResults) {
      if (result) {
        results[index] = result;
      } else if (error) {
        errors.push({ index, error });
      }
    }

    // Add delay between batches to respect rate limits
    if (i + batchSize < commits.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return { results, errors };
}
