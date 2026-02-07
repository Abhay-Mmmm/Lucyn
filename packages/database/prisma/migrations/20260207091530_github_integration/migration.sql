-- CreateEnum
CREATE TYPE "SuggestionOutcome" AS ENUM ('PENDING', 'ACCEPTED', 'PARTIALLY_ACCEPTED', 'IGNORED', 'REJECTED', 'OUTDATED');

-- AlterEnum
ALTER TYPE "AuthProviderType" ADD VALUE 'SLACK';

-- CreateTable
CREATE TABLE "repository_memories" (
    "id" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "primaryLanguages" TEXT[],
    "frameworks" TEXT[],
    "buildTools" TEXT[],
    "testingFrameworks" TEXT[],
    "directoryMap" JSONB NOT NULL DEFAULT '{}',
    "keyFiles" JSONB NOT NULL DEFAULT '[]',
    "entryPoints" TEXT[],
    "repoSummary" TEXT,
    "architectureSummary" TEXT,
    "treeHash" TEXT,
    "lastFullScanAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "repository_memories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repository_patterns" (
    "id" TEXT NOT NULL,
    "memoryId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "examples" JSONB NOT NULL DEFAULT '[]',
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.8,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "repository_patterns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_suggestions" (
    "id" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "pullRequestId" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "whyItMatters" TEXT,
    "tradeoffs" TEXT,
    "suggestedChange" TEXT,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "affectedFiles" TEXT[],
    "relatedPatterns" TEXT[],
    "promptForAgents" TEXT,
    "commentId" TEXT,
    "outcome" "SuggestionOutcome" NOT NULL DEFAULT 'PENDING',
    "userFeedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "ai_suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "repository_memories_repositoryId_key" ON "repository_memories"("repositoryId");

-- CreateIndex
CREATE INDEX "repository_patterns_memoryId_idx" ON "repository_patterns"("memoryId");

-- CreateIndex
CREATE INDEX "ai_suggestions_repositoryId_idx" ON "ai_suggestions"("repositoryId");

-- CreateIndex
CREATE INDEX "ai_suggestions_pullRequestId_idx" ON "ai_suggestions"("pullRequestId");

-- CreateIndex
CREATE INDEX "ai_suggestions_outcome_idx" ON "ai_suggestions"("outcome");

-- AddForeignKey
ALTER TABLE "repository_memories" ADD CONSTRAINT "repository_memories_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "repositories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repository_patterns" ADD CONSTRAINT "repository_patterns_memoryId_fkey" FOREIGN KEY ("memoryId") REFERENCES "repository_memories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_suggestions" ADD CONSTRAINT "ai_suggestions_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "repositories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_suggestions" ADD CONSTRAINT "ai_suggestions_pullRequestId_fkey" FOREIGN KEY ("pullRequestId") REFERENCES "pull_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;
