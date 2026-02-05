-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MANAGER', 'MEMBER');

-- CreateEnum
CREATE TYPE "PRState" AS ENUM ('OPEN', 'CLOSED', 'MERGED');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InsightType" AS ENUM ('VELOCITY', 'QUALITY', 'HEALTH', 'RISK', 'OPPORTUNITY', 'RECOMMENDATION');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('INFO', 'WARNING', 'CRITICAL');

-- CreateEnum
CREATE TYPE "FeedbackType" AS ENUM ('COMMIT_TIP', 'PR_SUGGESTION', 'REFACTOR_HINT', 'ACHIEVEMENT');

-- CreateEnum
CREATE TYPE "WorkloadTrend" AS ENUM ('INCREASING', 'STABLE', 'DECREASING');

-- CreateEnum
CREATE TYPE "BurnoutRisk" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "AuthProviderType" AS ENUM ('GITHUB', 'GOOGLE', 'DISCORD');

-- CreateEnum
CREATE TYPE "IntegrationProvider" AS ENUM ('GITHUB', 'DISCORD', 'LINEAR', 'JIRA');

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "domain" TEXT,
    "logoUrl" TEXT,
    "githubOrgId" TEXT,
    "githubOrgLogin" TEXT,
    "discordGuildId" TEXT,
    "discordGuildName" TEXT,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "avatarUrl" TEXT,
    "role" "Role" NOT NULL DEFAULT 'MEMBER',
    "githubId" TEXT,
    "githubUsername" TEXT,
    "discordId" TEXT,
    "discordUsername" TEXT,
    "feedbackEnabled" BOOLEAN NOT NULL DEFAULT true,
    "feedbackFrequency" TEXT NOT NULL DEFAULT 'daily',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "lastActiveAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_providers" (
    "id" TEXT NOT NULL,
    "provider" "AuthProviderType" NOT NULL,
    "providerUserId" TEXT NOT NULL,
    "email" TEXT,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "auth_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integrations" (
    "id" TEXT NOT NULL,
    "provider" "IntegrationProvider" NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "scopes" TEXT[],
    "expiresAt" TIMESTAMP(3),
    "metadata" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repositories" (
    "id" TEXT NOT NULL,
    "githubId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "description" TEXT,
    "defaultBranch" TEXT NOT NULL DEFAULT 'main',
    "language" TEXT,
    "isPrivate" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "webhookId" TEXT,
    "lastSyncedAt" TIMESTAMP(3),
    "settings" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "repositories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commits" (
    "id" TEXT NOT NULL,
    "sha" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "messageScore" DOUBLE PRECISION,
    "additions" INTEGER NOT NULL DEFAULT 0,
    "deletions" INTEGER NOT NULL DEFAULT 0,
    "filesChanged" INTEGER NOT NULL DEFAULT 0,
    "analysis" JSONB,
    "committedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "repositoryId" TEXT NOT NULL,
    "authorId" TEXT,

    CONSTRAINT "commits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pull_requests" (
    "id" TEXT NOT NULL,
    "githubId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "state" "PRState" NOT NULL DEFAULT 'OPEN',
    "isDraft" BOOLEAN NOT NULL DEFAULT false,
    "additions" INTEGER NOT NULL DEFAULT 0,
    "deletions" INTEGER NOT NULL DEFAULT 0,
    "filesChanged" INTEGER NOT NULL DEFAULT 0,
    "commitsCount" INTEGER NOT NULL DEFAULT 0,
    "reviewsCount" INTEGER NOT NULL DEFAULT 0,
    "commentsCount" INTEGER NOT NULL DEFAULT 0,
    "qualityScore" DOUBLE PRECISION,
    "timeToFirstReview" INTEGER,
    "timeToMerge" INTEGER,
    "analysis" JSONB,
    "labels" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "mergedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "repositoryId" TEXT NOT NULL,
    "authorId" TEXT,

    CONSTRAINT "pull_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "developer_profiles" (
    "id" TEXT NOT NULL,
    "skills" JSONB NOT NULL DEFAULT '[]',
    "strengths" TEXT[],
    "areasForGrowth" TEXT[],
    "preferredLanguages" TEXT[],
    "codeQualityScore" DOUBLE PRECISION,
    "velocityScore" DOUBLE PRECISION,
    "collaborationScore" DOUBLE PRECISION,
    "currentWorkload" INTEGER NOT NULL DEFAULT 0,
    "workloadTrend" "WorkloadTrend" NOT NULL DEFAULT 'STABLE',
    "burnoutRisk" "BurnoutRisk" NOT NULL DEFAULT 'LOW',
    "averageCommitSize" DOUBLE PRECISION,
    "averagePRSize" DOUBLE PRECISION,
    "reviewTurnaround" DOUBLE PRECISION,
    "lastAnalyzedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "developer_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insights" (
    "id" TEXT NOT NULL,
    "type" "InsightType" NOT NULL,
    "severity" "Severity" NOT NULL DEFAULT 'INFO',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "data" JSONB,
    "recommendation" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isDismissed" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "insights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "externalId" TEXT,
    "source" TEXT NOT NULL DEFAULT 'lucyn',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "estimatedHours" DOUBLE PRECISION,
    "actualHours" DOUBLE PRECISION,
    "requiredSkills" TEXT[],
    "complexity" INTEGER,
    "suggestedAssigneeId" TEXT,
    "assignmentReason" TEXT,
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "repositoryId" TEXT,
    "assigneeId" TEXT,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discord_feedback" (
    "id" TEXT NOT NULL,
    "type" "FeedbackType" NOT NULL,
    "message" TEXT NOT NULL,
    "channelId" TEXT,
    "messageId" TEXT,
    "wasHelpful" BOOLEAN,
    "userResponse" TEXT,
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "commitId" TEXT,
    "pullRequestId" TEXT,

    CONSTRAINT "discord_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meetings" (
    "id" TEXT NOT NULL,
    "externalId" TEXT,
    "platform" TEXT NOT NULL DEFAULT 'google_meet',
    "title" TEXT,
    "scheduledStart" TIMESTAMP(3),
    "scheduledEnd" TIMESTAMP(3),
    "actualStart" TIMESTAMP(3),
    "actualEnd" TIMESTAMP(3),
    "transcript" TEXT,
    "summary" TEXT,
    "actionItems" JSONB,
    "decisions" JSONB,
    "participants" TEXT[],
    "recordingUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "meetings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_logs" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "status" TEXT NOT NULL,
    "itemsProcessed" INTEGER NOT NULL DEFAULT 0,
    "itemsFailed" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "metadata" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "sync_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "code_embeddings" (
    "id" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "embedding" vector(1536),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "repositoryId" TEXT NOT NULL,

    CONSTRAINT "code_embeddings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PRReviewers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_githubOrgId_key" ON "organizations"("githubOrgId");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_discordGuildId_key" ON "organizations"("discordGuildId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_githubId_key" ON "users"("githubId");

-- CreateIndex
CREATE INDEX "users_organizationId_idx" ON "users"("organizationId");

-- CreateIndex
CREATE INDEX "users_githubUsername_idx" ON "users"("githubUsername");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "auth_providers_userId_idx" ON "auth_providers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "auth_providers_provider_providerUserId_key" ON "auth_providers"("provider", "providerUserId");

-- CreateIndex
CREATE INDEX "integrations_userId_idx" ON "integrations"("userId");

-- CreateIndex
CREATE INDEX "integrations_provider_idx" ON "integrations"("provider");

-- CreateIndex
CREATE UNIQUE INDEX "integrations_userId_provider_key" ON "integrations"("userId", "provider");

-- CreateIndex
CREATE UNIQUE INDEX "repositories_githubId_key" ON "repositories"("githubId");

-- CreateIndex
CREATE INDEX "repositories_organizationId_idx" ON "repositories"("organizationId");

-- CreateIndex
CREATE INDEX "repositories_fullName_idx" ON "repositories"("fullName");

-- CreateIndex
CREATE UNIQUE INDEX "commits_sha_key" ON "commits"("sha");

-- CreateIndex
CREATE INDEX "commits_repositoryId_idx" ON "commits"("repositoryId");

-- CreateIndex
CREATE INDEX "commits_authorId_idx" ON "commits"("authorId");

-- CreateIndex
CREATE INDEX "commits_committedAt_idx" ON "commits"("committedAt");

-- CreateIndex
CREATE UNIQUE INDEX "pull_requests_githubId_key" ON "pull_requests"("githubId");

-- CreateIndex
CREATE INDEX "pull_requests_repositoryId_idx" ON "pull_requests"("repositoryId");

-- CreateIndex
CREATE INDEX "pull_requests_authorId_idx" ON "pull_requests"("authorId");

-- CreateIndex
CREATE INDEX "pull_requests_state_idx" ON "pull_requests"("state");

-- CreateIndex
CREATE INDEX "pull_requests_createdAt_idx" ON "pull_requests"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "developer_profiles_userId_key" ON "developer_profiles"("userId");

-- CreateIndex
CREATE INDEX "insights_organizationId_idx" ON "insights"("organizationId");

-- CreateIndex
CREATE INDEX "insights_type_idx" ON "insights"("type");

-- CreateIndex
CREATE INDEX "insights_createdAt_idx" ON "insights"("createdAt");

-- CreateIndex
CREATE INDEX "tasks_organizationId_idx" ON "tasks"("organizationId");

-- CreateIndex
CREATE INDEX "tasks_status_idx" ON "tasks"("status");

-- CreateIndex
CREATE INDEX "tasks_assigneeId_idx" ON "tasks"("assigneeId");

-- CreateIndex
CREATE INDEX "discord_feedback_userId_idx" ON "discord_feedback"("userId");

-- CreateIndex
CREATE INDEX "meetings_organizationId_idx" ON "meetings"("organizationId");

-- CreateIndex
CREATE INDEX "meetings_scheduledStart_idx" ON "meetings"("scheduledStart");

-- CreateIndex
CREATE INDEX "sync_logs_organizationId_idx" ON "sync_logs"("organizationId");

-- CreateIndex
CREATE INDEX "sync_logs_entityType_idx" ON "sync_logs"("entityType");

-- CreateIndex
CREATE INDEX "code_embeddings_repositoryId_idx" ON "code_embeddings"("repositoryId");

-- CreateIndex
CREATE UNIQUE INDEX "code_embeddings_repositoryId_filePath_key" ON "code_embeddings"("repositoryId", "filePath");

-- CreateIndex
CREATE UNIQUE INDEX "_PRReviewers_AB_unique" ON "_PRReviewers"("A", "B");

-- CreateIndex
CREATE INDEX "_PRReviewers_B_index" ON "_PRReviewers"("B");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_providers" ADD CONSTRAINT "auth_providers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integrations" ADD CONSTRAINT "integrations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repositories" ADD CONSTRAINT "repositories_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commits" ADD CONSTRAINT "commits_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "repositories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commits" ADD CONSTRAINT "commits_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pull_requests" ADD CONSTRAINT "pull_requests_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "repositories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pull_requests" ADD CONSTRAINT "pull_requests_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "developer_profiles" ADD CONSTRAINT "developer_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insights" ADD CONSTRAINT "insights_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "repositories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_suggestedAssigneeId_fkey" FOREIGN KEY ("suggestedAssigneeId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discord_feedback" ADD CONSTRAINT "discord_feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discord_feedback" ADD CONSTRAINT "discord_feedback_commitId_fkey" FOREIGN KEY ("commitId") REFERENCES "commits"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discord_feedback" ADD CONSTRAINT "discord_feedback_pullRequestId_fkey" FOREIGN KEY ("pullRequestId") REFERENCES "pull_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sync_logs" ADD CONSTRAINT "sync_logs_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "code_embeddings" ADD CONSTRAINT "code_embeddings_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "repositories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PRReviewers" ADD CONSTRAINT "_PRReviewers_A_fkey" FOREIGN KEY ("A") REFERENCES "pull_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PRReviewers" ADD CONSTRAINT "_PRReviewers_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
