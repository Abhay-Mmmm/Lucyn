# Lucyn - Implementation Plan

> **The AI Product Engineer that works inside your company.**

This document outlines the complete technical implementation plan for Lucyn MVP and beyond.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Technical Architecture](#2-technical-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Project Structure](#4-project-structure)
5. [Database Schema](#5-database-schema)
6. [API Design](#6-api-design)
7. [Core Features Implementation](#7-core-features-implementation)
8. [AI/LLM Integration Strategy](#8-aillm-integration-strategy)
9. [Security & Multi-Tenancy](#9-security--multi-tenancy)
10. [Infrastructure & Deployment](#10-infrastructure--deployment)
11. [Development Phases](#11-development-phases)
12. [Cost Projections](#12-cost-projections)
13. [Risk Mitigation](#13-risk-mitigation)
14. [Post-MVP Roadmap](#14-post-mvp-roadmap)

---

## 1. Executive Summary

### Vision
Lucyn is an AI-powered engineering intelligence platform that transforms raw engineering activity into actionable business insights while providing developers with personalized guidance.

### MVP Scope (8 Weeks)
| Feature | Priority | Status |
|---------|----------|--------|
| GitHub Data Ingestion | P0 | Planned |
| Slack Feedback Agent | P0 | Planned |
| CEO Dashboard | P0 | Planned |
| Task Assignment Suggestions | P1 | Planned |
| Developer Profiles | P1 | Planned |

### Deferred to Phase 2
- Google Meet integration
- Autonomous task execution
- Cross-company benchmarking
- Advanced skill progression tracking

---

## 2. Technical Architecture

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐  │
│  │   CEO Dashboard     │  │   Admin Portal      │  │   Slack App         │  │
│  │   (Next.js)         │  │   (Next.js)         │  │   (Bolt SDK)        │  │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API GATEWAY                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    Next.js API Routes                                │    │
│  │     • Authentication (Supabase Auth)                                 │    │
│  │     • Rate Limiting                                                  │    │
│  │     • Request Validation (Zod)                                       │    │
│  │     • CORS / Security Headers                                        │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
            ┌─────────────────────────┼─────────────────────────┐
            ▼                         ▼                         ▼
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────────┐
│   WEBHOOK HANDLERS  │  │   BACKGROUND JOBS   │  │   AI/LLM SERVICE        │
├─────────────────────┤  ├─────────────────────┤  ├─────────────────────────┤
│ • GitHub Webhooks   │  │ • Commit Processor  │  │ • OpenAI GPT-4 API      │
│ • Slack Events      │  │ • PR Analyzer       │  │ • Prompt Templates      │
│ • Event Queue       │  │ • Metrics Computer  │  │ • Response Caching      │
│                     │  │ • Insight Generator │  │ • Embeddings (pgvector) │
└─────────────────────┘  └─────────────────────┘  └─────────────────────────┘
            │                         │                         │
            └─────────────────────────┼─────────────────────────┘
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATA LAYER                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐  │
│  │   PostgreSQL        │  │   Redis             │  │   File Storage      │  │
│  │   (Supabase)        │  │   (Upstash)         │  │   (Supabase)        │  │
│  │                     │  │                     │  │                     │  │
│  │ • Core entities     │  │ • Job queues        │  │ • Avatars           │  │
│  │ • pgvector          │  │ • Rate limit cache  │  │ • Reports           │  │
│  │ • Row Level Security│  │ • Session store     │  │ • Exports           │  │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Data Flow Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   GitHub     │────▶│   Webhook    │────▶│   Redis      │────▶│   Worker     │
│   Events     │     │   Handler    │     │   Queue      │     │   Process    │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
                                                                       │
                                                                       ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Dashboard  │◀────│   API        │◀────│   Database   │◀────│   AI         │
│   Display    │     │   Response   │     │   Storage    │     │   Analysis   │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

---

## 3. Technology Stack

### Core Technologies

| Layer | Technology | Version | Justification |
|-------|------------|---------|---------------|
| **Frontend** | Next.js | 14.x | App Router, RSC, excellent DX |
| **UI Components** | shadcn/ui | latest | Accessible, customizable, Tailwind-based |
| **Styling** | Tailwind CSS | 3.x | Utility-first, rapid prototyping |
| **State Management** | Zustand + TanStack Query | latest | Lightweight state + server cache |
| **Charts** | Recharts | 2.x | React-native, good for dashboards |
| **Backend** | Next.js API Routes | 14.x | Full-stack, serverless-ready |
| **Database** | PostgreSQL (Supabase) | 15.x | RLS, pgvector, realtime |
| **ORM** | Prisma | 5.x | Type-safe, migrations, great DX |
| **Queue** | BullMQ | 5.x | Redis-backed, reliable, retries |
| **Cache** | Redis (Upstash) | 7.x | Serverless, pay-per-use |
| **Auth** | Supabase Auth | latest | OAuth, magic links, RLS integration |
| **AI/LLM** | OpenAI API | latest | GPT-4, function calling, embeddings |
| **Vector DB** | pgvector | 0.5+ | PostgreSQL extension, simpler stack |

### Development Tools

| Tool | Purpose |
|------|---------|
| **Turborepo** | Monorepo management, build caching |
| **TypeScript** | Type safety across full stack |
| **ESLint + Prettier** | Code quality and formatting |
| **Vitest** | Unit and integration testing |
| **Playwright** | E2E testing |
| **GitHub Actions** | CI/CD pipelines |
| **Sentry** | Error tracking and monitoring |

### External Integrations

| Integration | SDK/API | Purpose |
|-------------|---------|---------|
| **GitHub** | Octokit + REST API | OAuth, webhooks, data fetching |
| **Slack** | Bolt SDK | Bot, events, interactive messages |
| **OpenAI** | openai npm package | LLM completions, embeddings |

---

## 4. Project Structure

```
lucyn/
├── apps/
│   ├── web/                          # Next.js application
│   │   ├── app/
│   │   │   ├── (auth)/               # Auth routes (login, signup, callback)
│   │   │   │   ├── login/
│   │   │   │   ├── signup/
│   │   │   │   └── callback/
│   │   │   ├── (dashboard)/          # Protected dashboard routes
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx          # Overview/home
│   │   │   │   ├── team/
│   │   │   │   ├── repositories/
│   │   │   │   ├── insights/
│   │   │   │   ├── tasks/
│   │   │   │   └── settings/
│   │   │   ├── api/
│   │   │   │   ├── auth/
│   │   │   │   ├── github/
│   │   │   │   │   ├── callback/
│   │   │   │   │   └── webhook/
│   │   │   │   ├── slack/
│   │   │   │   │   ├── install/
│   │   │   │   │   └── events/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── developers/
│   │   │   │   ├── tasks/
│   │   │   │   └── ai/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx              # Landing page
│   │   ├── components/
│   │   │   ├── ui/                   # shadcn components
│   │   │   ├── dashboard/
│   │   │   ├── charts/
│   │   │   └── forms/
│   │   ├── lib/
│   │   │   ├── supabase/
│   │   │   ├── prisma.ts
│   │   │   ├── redis.ts
│   │   │   └── utils.ts
│   │   ├── hooks/
│   │   ├── stores/
│   │   └── types/
│   │
│   └── worker/                       # Background job processor
│       ├── src/
│       │   ├── jobs/
│       │   │   ├── github/
│       │   │   │   ├── processCommit.ts
│       │   │   │   ├── processPullRequest.ts
│       │   │   │   └── syncRepository.ts
│       │   │   ├── analytics/
│       │   │   │   ├── computeMetrics.ts
│       │   │   │   └── generateInsights.ts
│       │   │   └── slack/
│       │   │       └── sendFeedback.ts
│       │   ├── queues/
│       │   ├── services/
│       │   └── index.ts
│       └── package.json
│
├── packages/
│   ├── database/                     # Prisma schema and client
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── seed.ts
│   │   ├── src/
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── shared/                       # Shared types and utilities
│   │   ├── src/
│   │   │   ├── types/
│   │   │   ├── constants/
│   │   │   ├── validators/
│   │   │   └── utils/
│   │   └── package.json
│   │
│   └── ai/                           # AI/LLM utilities
│       ├── src/
│       │   ├── prompts/
│       │   ├── chains/
│       │   ├── embeddings.ts
│       │   └── client.ts
│       └── package.json
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── deploy-web.yml
│       └── deploy-worker.yml
│
├── docker-compose.yml                # Local development
├── turbo.json
├── package.json
├── .env.example
├── PRD.md
├── PLAN.md
└── README.md
```

---

## 5. Database Schema

### Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│  Organization   │───────│      User       │───────│DeveloperProfile │
└─────────────────┘       └─────────────────┘       └─────────────────┘
        │                         │
        │                         │
        ▼                         ▼
┌─────────────────┐       ┌─────────────────┐
│   Repository    │───────│     Commit      │
└─────────────────┘       └─────────────────┘
        │
        │
        ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│  PullRequest    │       │      Task       │       │    Insight      │
└─────────────────┘       └─────────────────┘       └─────────────────┘
```

### Prisma Schema

The database is defined using Prisma ORM. Tables are auto-generated via `prisma migrate dev`.

```prisma
// packages/database/prisma/schema.prisma

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [pgvector(map: "vector")]
}

// ============================================
// ENUMS
// ============================================

enum Role {
  ADMIN
  MANAGER
  MEMBER
}

enum PRState {
  OPEN
  CLOSED
  MERGED
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  IN_REVIEW
  DONE
  CANCELLED
}

enum InsightType {
  VELOCITY
  RISK
  HEALTH
  BOTTLENECK
  BURNOUT
  ACHIEVEMENT
  RECOMMENDATION
}

enum Severity {
  INFO
  WARNING
  CRITICAL
}

enum FeedbackType {
  COMMIT_TIP
  PR_SUGGESTION
  CODE_QUALITY
  BEST_PRACTICE
  ACHIEVEMENT
}

enum WorkloadTrend {
  INCREASING
  STABLE
  DECREASING
}

enum BurnoutRisk {
  LOW
  MEDIUM
  HIGH
}

// ============================================
// CORE MODELS
// ============================================

model Organization {
  id             String   @id @default(cuid())
  name           String
  slug           String   @unique
  avatarUrl      String?
  githubOrgId    BigInt?  @unique
  githubOrgLogin String?
  slackTeamId    String?  @unique
  slackTeamName  String?
  settings       Json     @default("{}")
  plan           String   @default("free")
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  // Relations
  users        User[]
  repositories Repository[]
  tasks        Task[]
  insights     Insight[]
  syncLogs     SyncLog[]
  meetings     Meeting[]

  @@map("organizations")
}

model User {
  id                String    @id @default(cuid())
  organizationId    String
  email             String    @unique
  name              String
  avatarUrl         String?
  role              Role      @default(MEMBER)
  githubId          BigInt?   @unique
  githubUsername    String?
  githubAccessToken String?   // encrypted
  slackUserId       String?
  isActive          Boolean   @default(true)
  lastSeenAt        DateTime?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  // Relations
  organization      Organization       @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  developerProfile  DeveloperProfile?
  commits           Commit[]
  pullRequests      PullRequest[]
  assignedTasks     Task[]             @relation("TaskAssignee")
  suggestedTasks    Task[]             @relation("TaskSuggested")
  slackFeedback     SlackFeedback[]

  @@index([organizationId])
  @@index([githubUsername])
  @@map("users")
}

model Repository {
  id             String    @id @default(cuid())
  organizationId String
  githubId       BigInt    @unique
  name           String
  fullName       String
  description    String?
  defaultBranch  String    @default("main")
  language       String?
  isPrivate      Boolean   @default(true)
  isActive       Boolean   @default(true)
  webhookId      BigInt?
  webhookSecret  String?   // encrypted
  lastSyncedAt   DateTime?
  stats          Json      @default("{}")
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  // Relations
  organization   Organization     @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  commits        Commit[]
  pullRequests   PullRequest[]
  tasks          Task[]
  codeEmbeddings CodeEmbedding[]

  @@index([organizationId])
  @@map("repositories")
}

model Commit {
  id           String   @id @default(cuid())
  repositoryId String
  authorId     String?
  sha          String
  message      String
  additions    Int      @default(0)
  deletions    Int      @default(0)
  filesChanged Int      @default(0)
  committedAt  DateTime
  qualityScore Float?   // 0-100
  analysis     Json     @default("{}")
  createdAt    DateTime @default(now())

  // Relations
  repository Repository @relation(fields: [repositoryId], references: [id], onDelete: Cascade)
  author     User?      @relation(fields: [authorId], references: [id], onDelete: SetNull)

  @@unique([repositoryId, sha])
  @@index([repositoryId])
  @@index([authorId])
  @@index([committedAt])
  @@map("commits")
}

model PullRequest {
  id                 String    @id @default(cuid())
  repositoryId       String
  authorId           String?
  githubId           BigInt
  number             Int
  title              String
  description        String?
  state              PRState   @default(OPEN)
  additions          Int       @default(0)
  deletions          Int       @default(0)
  filesChanged       Int       @default(0)
  commitsCount       Int       @default(0)
  commentsCount      Int       @default(0)
  reviewComments     Int       @default(0)
  firstReviewAt      DateTime?
  timeToFirstReview  Int?      // minutes
  timeToMerge        Int?      // minutes
  reviewCycles       Int       @default(0)
  qualityScore       Float?    // 0-100
  complexity         String?   // low, medium, high
  analysis           Json      @default("{}")
  createdAt          DateTime
  updatedAt          DateTime  @updatedAt
  mergedAt           DateTime?
  closedAt           DateTime?

  // Relations
  repository Repository @relation(fields: [repositoryId], references: [id], onDelete: Cascade)
  author     User?      @relation(fields: [authorId], references: [id], onDelete: SetNull)

  @@unique([repositoryId, githubId])
  @@index([repositoryId])
  @@index([authorId])
  @@index([state])
  @@index([createdAt])
  @@map("pull_requests")
}

// ============================================
// INTELLIGENCE MODELS
// ============================================

model DeveloperProfile {
  id                 String       @id @default(cuid())
  userId             String       @unique
  commitsPerWeek     Float        @default(0)
  prsPerWeek         Float        @default(0)
  reviewsPerWeek     Float        @default(0)
  linesPerWeek       Float        @default(0)
  commitQualityScore Float        @default(50)
  prQualityScore     Float        @default(50)
  reviewQualityScore Float        @default(50)
  overallScore       Float        @default(50)
  currentWorkload    Float        @default(50) // 0-100, 50 = balanced
  workloadTrend      WorkloadTrend @default(STABLE)
  burnoutRisk        BurnoutRisk  @default(LOW)
  primaryLanguages   Json         @default("[]")
  expertiseAreas     Json         @default("[]")
  repoFamiliarity    Json         @default("{}")
  strengths          Json         @default("[]")
  growthAreas        Json         @default("[]")
  recommendations    Json         @default("[]")
  lastComputedAt     DateTime     @default(now())
  createdAt          DateTime     @default(now())
  updatedAt          DateTime     @updatedAt

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([currentWorkload])
  @@index([burnoutRisk])
  @@map("developer_profiles")
}

model Insight {
  id             String      @id @default(cuid())
  organizationId String
  type           InsightType
  category       String?     // team, individual, repository
  severity       Severity    @default(INFO)
  title          String
  description    String
  data           Json        @default("{}")
  targetType     String?     // user, repository, organization
  targetId       String?
  isRead         Boolean     @default(false)
  isDismissed    Boolean     @default(false)
  isActionable   Boolean     @default(true)
  actionUrl      String?
  expiresAt      DateTime?
  createdAt      DateTime    @default(now())

  // Relations
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@index([organizationId])
  @@index([type])
  @@index([severity])
  @@index([createdAt])
  @@map("insights")
}

// ============================================
// TASK MANAGEMENT
// ============================================

model Task {
  id                  String     @id @default(cuid())
  organizationId      String
  repositoryId        String?
  externalSource      String?    // jira, linear, github
  externalId          String?
  externalUrl         String?
  title               String
  description         String?
  priority            Priority   @default(MEDIUM)
  difficulty          Int        @default(3) // 1-5
  estimatedHours      Float?
  status              TaskStatus @default(TODO)
  assigneeId          String?
  suggestedAssigneeId String?
  assignmentReason    Json       @default("{}")
  dueDate             DateTime?
  startedAt           DateTime?
  completedAt         DateTime?
  createdAt           DateTime   @default(now())
  updatedAt           DateTime   @updatedAt

  // Relations
  organization      Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  repository        Repository?  @relation(fields: [repositoryId], references: [id], onDelete: SetNull)
  assignee          User?        @relation("TaskAssignee", fields: [assigneeId], references: [id], onDelete: SetNull)
  suggestedAssignee User?        @relation("TaskSuggested", fields: [suggestedAssigneeId], references: [id], onDelete: SetNull)

  @@unique([organizationId, externalSource, externalId])
  @@index([organizationId])
  @@index([assigneeId])
  @@index([status])
  @@map("tasks")
}

// ============================================
// SLACK INTEGRATION
// ============================================

model SlackFeedback {
  id             String       @id @default(cuid())
  userId         String
  type           FeedbackType
  channelId      String?
  messageTs      String?      // Slack message timestamp
  content        String
  context        Json         @default("{}")
  reaction       String?      // thumbs_up, thumbs_down
  isAcknowledged Boolean      @default(false)
  sentAt         DateTime     @default(now())
  createdAt      DateTime     @default(now())

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([type])
  @@map("slack_feedback")
}

// ============================================
// MEETING INTEGRATION (Phase 2)
// ============================================

model Meeting {
  id               String    @id @default(cuid())
  organizationId   String
  externalId       String?   // Google Meet ID, Zoom ID, etc.
  platform         String    // google_meet, zoom, teams
  title            String
  scheduledAt      DateTime
  startedAt        DateTime?
  endedAt          DateTime?
  duration         Int?      // minutes
  transcriptUrl    String?
  recordingUrl     String?
  summary          String?   // AI-generated
  actionItems      Json      @default("[]")
  participants     Json      @default("[]")
  insights         Json      @default("[]")
  status           String    @default("scheduled") // scheduled, in_progress, completed, cancelled
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  // Relations
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@index([organizationId])
  @@index([scheduledAt])
  @@map("meetings")
}

// ============================================
// SYSTEM
// ============================================

model SyncLog {
  id             String    @id @default(cuid())
  organizationId String
  type           String    // github_repos, github_commits, etc
  status         String    // pending, running, completed, failed
  entityType     String?
  entityId       String?
  startedAt      DateTime  @default(now())
  completedAt    DateTime?
  itemsProcessed Int       @default(0)
  itemsFailed    Int       @default(0)
  error          String?
  metadata       Json      @default("{}")

  // Relations
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@index([organizationId])
  @@index([status])
  @@map("sync_logs")
}

// ============================================
// VECTOR STORAGE (pgvector)
// ============================================

model CodeEmbedding {
  id           String                       @id @default(cuid())
  repositoryId String
  filePath     String
  chunkIndex   Int                          @default(0)
  content      String
  embedding    Unsupported("vector(1536)")? // OpenAI ada-002 dimension
  metadata     Json                         @default("{}")
  createdAt    DateTime                     @default(now())

  // Relations
  repository Repository @relation(fields: [repositoryId], references: [id], onDelete: Cascade)

  @@unique([repositoryId, filePath, chunkIndex])
  @@index([repositoryId])
  @@map("code_embeddings")
}
```

### Key Schema Notes

- **Prisma generates migrations**: Run `npm run db:migrate` to create tables
- **pgvector**: Used for code embeddings and semantic search
- **Row Level Security**: Implemented at application layer + Supabase RLS policies
- **Indexes**: Defined on frequently queried columns for performance
- **Soft deletes**: Not used in MVP; can add `deletedAt` field later if needed

---

## 6. API Design

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create account |
| POST | `/api/auth/login` | Email login |
| GET | `/api/auth/callback` | OAuth callback |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get current user |

### GitHub Integration

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/github/install` | Redirect to GitHub App install |
| GET | `/api/github/callback` | GitHub OAuth callback |
| POST | `/api/github/webhook` | GitHub webhook receiver |
| GET | `/api/github/repos` | List connected repos |
| POST | `/api/github/repos/:id/sync` | Trigger repo sync |
| DELETE | `/api/github/repos/:id` | Disconnect repo |

### Slack Integration

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/slack/install` | Start Slack OAuth |
| GET | `/api/slack/callback` | Slack OAuth callback |
| POST | `/api/slack/events` | Slack Events API handler |
| POST | `/api/slack/interactions` | Slack Interactivity handler |

### Dashboard API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/overview` | Main dashboard data |
| GET | `/api/dashboard/velocity` | Velocity metrics |
| GET | `/api/dashboard/health` | Team health indicators |
| GET | `/api/dashboard/risks` | Risk flags |
| GET | `/api/dashboard/activity` | Recent activity feed |

### Developers API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/developers` | List team members |
| GET | `/api/developers/:id` | Get developer detail |
| GET | `/api/developers/:id/profile` | Get computed profile |
| GET | `/api/developers/:id/activity` | Get activity history |
| GET | `/api/developers/:id/insights` | Get personalized insights |

### Tasks API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List tasks |
| POST | `/api/tasks` | Create task |
| GET | `/api/tasks/:id` | Get task detail |
| PUT | `/api/tasks/:id` | Update task |
| POST | `/api/tasks/:id/assign` | Assign task |
| GET | `/api/tasks/suggestions` | Get assignment suggestions |

### Insights API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/insights` | List insights |
| GET | `/api/insights/:id` | Get insight detail |
| PUT | `/api/insights/:id/read` | Mark as read |
| PUT | `/api/insights/:id/dismiss` | Dismiss insight |

### AI Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/analyze-pr` | Analyze pull request |
| POST | `/api/ai/suggest-assignment` | Get task assignment suggestion |
| POST | `/api/ai/generate-insight` | Generate insight from data |
| POST | `/api/ai/answer` | Answer engineering question |

---

## 7. Core Features Implementation

### 7.1 GitHub Data Ingestion

#### Flow
```
1. User installs GitHub App on their org
2. App receives webhook for each event (push, PR, etc.)
3. Webhook handler validates signature & queues job
4. Worker processes event:
   - Parse commit/PR data
   - Match to internal user
   - Run AI analysis
   - Store in database
5. Metrics are computed in scheduled job
```

#### Webhook Events to Handle
| Event | Action |
|-------|--------|
| `installation.created` | Store GitHub App installation |
| `push` | Queue commit processing |
| `pull_request.*` | Queue PR processing |
| `pull_request_review.*` | Update PR review data |
| `repository.created` | Add new repo |
| `repository.deleted` | Deactivate repo |
| `member.*` | Sync team members |

#### Commit Processing Job
```typescript
interface ProcessCommitJob {
  repositoryId: string;
  commitSha: string;
  message: string;
  additions: number;
  deletions: number;
  filesChanged: number;
  authorEmail: string;
  authorName: string;
  committedAt: Date;
}

// Processing steps:
// 1. Find or create author by email/GitHub username
// 2. Analyze commit message quality (AI)
// 3. Calculate size metrics
// 4. Store commit with analysis
// 5. Update author's activity metrics
```

### 7.2 Slack Feedback Agent

#### Bot Capabilities
| Feature | Implementation |
|---------|----------------|
| **@mention responses** | Answer questions about codebase, metrics |
| **Proactive tips** | DM after low-quality commits |
| **PR suggestions** | DM with PR improvement tips |
| **Achievement notifications** | Celebrate milestones |
| **Daily/weekly digests** | Summary of activity |

#### Message Templates
```typescript
const templates = {
  commitTip: {
    poor_message: "💡 Tip: Your recent commit message could be more descriptive. Good commit messages explain the 'why', not just the 'what'. Try: `feat(auth): add password reset flow for better UX`",
    large_commit: "💡 Tip: That was a big commit! Consider breaking large changes into smaller, focused commits for easier review.",
  },
  prSuggestion: {
    missing_description: "📝 Your PR could use a description! A good description helps reviewers understand the context and speeds up review time.",
    long_review: "⏰ This PR has been open for a while. Would you like me to suggest reviewers or help summarize the changes?",
  },
  achievement: {
    streak: "🔥 You're on a roll! 5-day commit streak. Keep up the great work!",
    quality: "⭐ Your code quality score improved 15% this week. Nice work!",
  }
};
```

### 7.3 CEO Dashboard

#### Dashboard Sections

**1. Engineering Health Overview**
```typescript
interface HealthOverview {
  overallScore: number; // 0-100
  trend: 'improving' | 'stable' | 'declining';
  teamSize: number;
  activeRepos: number;
  highlights: string[]; // Key achievements
  concerns: string[];   // Items needing attention
}
```

**2. Velocity Metrics**
```typescript
interface VelocityMetrics {
  prsPerWeek: {
    current: number;
    previous: number;
    trend: number; // percentage change
  };
  avgTimeToMerge: {
    current: number; // hours
    previous: number;
    trend: number;
  };
  deploymentFrequency: {
    current: number;
    target: number;
  };
  sprintCompletion: {
    current: number; // percentage
    target: number;
  };
}
```

**3. Risk Indicators**
```typescript
interface RiskIndicators {
  burnoutRisk: {
    level: 'low' | 'medium' | 'high';
    affectedMembers: number;
    details: string;
  };
  bottlenecks: {
    type: 'review' | 'knowledge' | 'dependency';
    description: string;
    impact: string;
  }[];
  technicalDebt: {
    score: number; // 0-100
    hotspots: string[];
  };
}
```

**4. Team Distribution**
```typescript
interface TeamDistribution {
  workloadBalance: {
    overloaded: number;
    balanced: number;
    underutilized: number;
  };
  skillCoverage: {
    [area: string]: number; // percentage coverage
  };
  knowledgeRisk: {
    busFactorAreas: string[]; // areas with single expert
  };
}
```

### 7.4 Task Assignment Engine

#### Assignment Algorithm
```typescript
interface AssignmentFactors {
  // Skill match (40% weight)
  skillMatch: number;        // 0-1 based on language/area expertise
  repoFamiliarity: number;   // 0-1 based on past contributions
  
  // Availability (30% weight)
  currentWorkload: number;   // current task count
  burnoutRisk: number;       // 0-1, higher = more caution
  recentVelocity: number;    // recent completion rate
  
  // Growth (20% weight)
  stretchOpportunity: number; // is this a learning opportunity?
  difficultyMatch: number;    // appropriate challenge level
  
  // Team balance (10% weight)
  teamDistribution: number;   // helps balance workload
}

function suggestAssignee(task: Task, candidates: Developer[]): Assignment {
  const scores = candidates.map(dev => ({
    developer: dev,
    score: computeScore(dev, task),
    reasoning: explainScore(dev, task),
  }));
  
  return {
    suggested: scores[0].developer,
    alternatives: scores.slice(1, 3),
    reasoning: scores[0].reasoning,
    confidence: scores[0].score,
  };
}
```

### 7.5 Meeting Integration (Phase 2)

> **Note:** Meeting integration is deferred to Phase 2 (Months 5-6) due to complexity. This section documents the technical approach for planning purposes.

#### How AI Joins Meetings

There are several approaches to have an AI agent participate in video calls:

| Approach | How It Works | Pros | Cons | Cost |
|----------|--------------|------|------|------|
| **Recall.ai (Recommended)** | Third-party API that joins meetings as a bot participant | Turnkey solution, handles all complexity, works with Meet/Zoom/Teams | Vendor dependency | ~$0.15-0.25/min |
| **Google Meet API + Bot** | Create a service account that joins via Calendar API | Native integration, no third-party | Complex, requires Workspace admin approval | Development time |
| **Zoom SDK** | Use Zoom's Meeting SDK to create a bot | Good API support | Zoom-only, complex setup | Development time |
| **Manual Transcript Upload** | Users upload recordings or transcripts | Simple to build | Poor UX, requires manual effort | Free |
| **Browser Extension** | Captures audio from user's browser | No bot visible to participants | Privacy concerns, user install required | Development time |

#### Recommended Approach: Recall.ai

For a startup, **Recall.ai** is the recommended solution:

```typescript
// Example Recall.ai integration
interface RecallMeeting {
  id: string;
  meeting_url: string;  // Google Meet / Zoom URL
  bot_name: string;     // "Lucyn Assistant"
  join_at: Date;
  
  // Webhook callbacks
  on_transcript: (transcript: TranscriptSegment[]) => void;
  on_meeting_end: (summary: MeetingSummary) => void;
}

// Flow:
// 1. User schedules meeting via Google Calendar
// 2. Lucyn detects meeting via Calendar API
// 3. Lucyn calls Recall.ai to schedule bot join
// 4. Bot joins meeting at scheduled time
// 5. Recall.ai streams transcript via webhook
// 6. Lucyn processes transcript in real-time
// 7. On meeting end, generate summary + action items
```

#### Meeting Data Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Google     │     │   Recall.ai  │     │   Lucyn      │
│   Calendar   │────▶│   Bot        │────▶│   Webhook    │
│   Sync       │     │   Joins Meet │     │   Handler    │
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
                                                 ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Dashboard  │◀────│   AI         │◀────│   Transcript │
│   Display    │     │   Summary    │     │   Storage    │
└──────────────┘     └──────────────┘     └──────────────┘
```

#### Meeting Processing Pipeline

```typescript
// 1. Receive transcript chunks in real-time
interface TranscriptSegment {
  speaker: string;
  text: string;
  timestamp: number;
  confidence: number;
}

// 2. Process complete transcript
async function processMeetingTranscript(
  meetingId: string,
  transcript: TranscriptSegment[]
): Promise<MeetingInsights> {
  
  // Extract structured information using LLM
  const analysis = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{
      role: 'system',
      content: `You are analyzing a SCRUM/planning meeting transcript.
        Extract:
        1. Key decisions made
        2. Action items (who, what, when)
        3. Blockers discussed
        4. Risks identified
        5. Next steps agreed upon
        
        Format as structured JSON.`
    }, {
      role: 'user',
      content: formatTranscript(transcript)
    }],
    response_format: { type: 'json_object' }
  });
  
  return parseAnalysis(analysis);
}

// 3. Generate meeting summary
interface MeetingInsights {
  summary: string;
  keyDecisions: string[];
  actionItems: {
    assignee: string;
    task: string;
    dueDate?: string;
  }[];
  blockers: string[];
  risks: string[];
  nextSteps: string[];
  sentiment: 'positive' | 'neutral' | 'concerning';
}
```

#### Meeting Integration API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/meetings` | List meetings |
| POST | `/api/meetings/schedule-bot` | Schedule bot to join meeting |
| GET | `/api/meetings/:id` | Get meeting details |
| GET | `/api/meetings/:id/transcript` | Get full transcript |
| GET | `/api/meetings/:id/summary` | Get AI summary |
| GET | `/api/meetings/:id/action-items` | Get extracted action items |
| POST | `/api/meetings/webhook` | Recall.ai webhook handler |

#### Cost Considerations

| Usage Level | Meetings/Month | Minutes | Recall.ai Cost | Total |
|-------------|----------------|---------|----------------|-------|
| Small Team | 20 | 600 | ~$120 | ~$120/mo |
| Medium Team | 50 | 1,500 | ~$300 | ~$300/mo |
| Large Team | 100 | 3,000 | ~$600 | ~$600/mo |

#### Alternative: Manual Upload (MVP Friendly)

For early validation, offer manual transcript upload:

```typescript
// Allow users to upload meeting transcripts/recordings
// without needing Recall.ai integration

interface ManualMeetingUpload {
  file: File;           // .txt, .vtt, .srt, or audio file
  meetingTitle: string;
  meetingDate: Date;
  participants: string[];
}

// If audio file, use OpenAI Whisper for transcription
// Then process transcript same as real-time flow
```

---

## 8. AI/LLM Integration Strategy

### Prompt Architecture

#### Commit Analysis Prompt
```typescript
const commitAnalysisPrompt = `
Analyze this Git commit and provide structured feedback.

Commit Message: {message}
Files Changed: {filesCount}
Additions: {additions}
Deletions: {deletions}

Evaluate:
1. Message Quality (1-10): Is it descriptive? Does it follow conventions?
2. Scope (1-10): Is the commit focused or too broad?
3. Suggestions: What could be improved?

Respond in JSON format:
{
  "messageQuality": number,
  "scope": number,
  "overallScore": number,
  "suggestions": string[],
  "sentiment": "positive" | "neutral" | "needs_improvement"
}
`;
```

#### PR Review Suggestion Prompt
```typescript
const prReviewPrompt = `
You are a senior software engineer reviewing a pull request.

PR Title: {title}
Description: {description}
Files Changed: {files}
Diff Summary: {diffSummary}

Provide constructive feedback:
1. Overall assessment
2. Potential issues or risks
3. Suggestions for improvement
4. Questions for the author

Be helpful, not critical. Focus on learning and improvement.
`;
```

#### Insight Generation Prompt
```typescript
const insightPrompt = `
Based on the following engineering metrics, generate actionable insights for leadership.

Team Size: {teamSize}
Weekly Commits: {commits}
PR Merge Time Trend: {mergeTrend}
Open PR Age: {openPRAge}
Developer Workload Distribution: {workloadDist}

Generate 3-5 insights that are:
- Business-relevant (not technical jargon)
- Actionable (include what to do)
- Prioritized by impact

Format as JSON array of insights.
`;
```

### Cost Optimization Strategies

| Strategy | Implementation |
|----------|----------------|
| **Response Caching** | Cache identical prompt responses in Redis (1hr TTL) |
| **Batching** | Group multiple commits for single analysis call |
| **Tiered Models** | Use GPT-3.5 for simple tasks, GPT-4 for complex |
| **Prompt Optimization** | Minimize token usage in prompts |
| **Rate Limiting** | Limit AI calls per org per hour |
| **Lazy Analysis** | Analyze on-demand, not every event |

### Embedding Strategy

```typescript
// What to embed
const embeddingTargets = [
  'README files',
  'Documentation',
  'Code comments',
  'PR descriptions',
  'Commit messages',
];

// When to update
const embeddingTriggers = [
  'Repository sync',
  'New documentation commit',
  'Weekly refresh',
];

// How to query
async function semanticSearch(query: string, repoId: string) {
  const queryEmbedding = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: query,
  });
  
  const results = await prisma.$queryRaw`
    SELECT content, file_path, 
           1 - (embedding <=> ${queryEmbedding}::vector) as similarity
    FROM code_embeddings
    WHERE repository_id = ${repoId}
    ORDER BY embedding <=> ${queryEmbedding}::vector
    LIMIT 5
  `;
  
  return results;
}
```

---

## 9. Security & Multi-Tenancy

### Multi-Tenancy Model

**Approach: Shared Database with Row-Level Security (RLS)**

```sql
-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE repositories ENABLE ROW LEVEL SECURITY;
-- ... etc

-- Example policy for users table
CREATE POLICY "Users can only see their organization's data"
  ON users
  FOR ALL
  USING (organization_id = current_setting('app.current_org')::uuid);

-- Policy for admins
CREATE POLICY "Admins can manage organization"
  ON organizations
  FOR ALL
  USING (
    id = current_setting('app.current_org')::uuid
    AND EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = current_setting('app.current_user')::uuid
      AND users.role = 'admin'
    )
  );
```

### Authentication Flow

```
1. User signs up → Create user + organization
2. User logs in → Get JWT with user_id, org_id, role
3. Each API request:
   a. Validate JWT
   b. Set session context for RLS
   c. Execute query (RLS auto-filters)
```

### Security Measures

| Measure | Implementation |
|---------|----------------|
| **Encryption at Rest** | Supabase handles (AES-256) |
| **Encryption in Transit** | HTTPS everywhere |
| **Token Encryption** | Encrypt GitHub/Slack tokens before storage |
| **Input Validation** | Zod schemas on all endpoints |
| **Rate Limiting** | Per-user and per-org limits |
| **Webhook Verification** | Validate GitHub/Slack signatures |
| **Audit Logging** | Log sensitive operations |
| **RBAC** | Admin, Manager, Member roles |

### Data Privacy

| Requirement | Implementation |
|-------------|----------------|
| **GDPR Compliance** | Data export, deletion APIs |
| **No Public Ranking** | Scores visible only to self + managers |
| **Opt-in Feedback** | Users choose feedback preferences |
| **Data Retention** | Configurable retention periods |
| **Anonymization** | Option to anonymize in aggregates |

---

## 10. Infrastructure & Deployment

### Development Environment

```yaml
# docker-compose.yml for local dev
version: '3.8'

services:
  postgres:
    image: supabase/postgres:15.1.0.117
    ports:
      - "5432:5432"
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: lucyn
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  # Local Supabase (optional, can use cloud)
  supabase:
    image: supabase/studio:latest
    ports:
      - "3001:3000"
    depends_on:
      - postgres

volumes:
  postgres_data:
  redis_data:
```

### Production Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          VERCEL                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Next.js App                           │    │
│  │  • Static pages (landing, docs)                          │    │
│  │  • Server components (dashboard)                         │    │
│  │  • API routes (serverless functions)                     │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                               │
          ┌────────────────────┼────────────────────┐
          ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│    SUPABASE     │  │   UPSTASH       │  │   RENDER        │
│                 │  │                 │  │                 │
│ • PostgreSQL    │  │ • Redis         │  │ • Worker        │
│ • Auth          │  │ • Queues        │  │   Service       │
│ • Storage       │  │                 │  │ • BullMQ        │
│ • Realtime      │  │                 │  │   Processor     │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

### CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build

  deploy-preview:
    needs: lint-and-test
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-production:
    needs: lint-and-test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Environment Variables

```bash
# .env.example

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Database (direct connection for Prisma)
DATABASE_URL=postgresql://postgres:xxx@db.xxx.supabase.co:5432/postgres

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx

# GitHub App
GITHUB_APP_ID=xxx
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA..."
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx
GITHUB_WEBHOOK_SECRET=xxx

# Slack App
SLACK_CLIENT_ID=xxx
SLACK_CLIENT_SECRET=xxx
SLACK_SIGNING_SECRET=xxx
SLACK_BOT_TOKEN=xoxb-xxx

# OpenAI
OPENAI_API_KEY=sk-xxx

# App
NEXT_PUBLIC_APP_URL=https://app.lucyn.dev
```

### Monitoring & Observability

| Tool | Purpose | Setup |
|------|---------|-------|
| **Sentry** | Error tracking | `@sentry/nextjs` |
| **Vercel Analytics** | Web vitals | Built-in |
| **Supabase Dashboard** | DB metrics | Built-in |
| **Upstash Console** | Redis metrics | Built-in |
| **BullMQ Dashboard** | Job monitoring | `bull-board` |

---

## 11. Development Phases

### Phase 1: Foundation (Weeks 1-2)

#### Week 1: Project Setup
| Task | Est. Hours | Owner |
|------|-----------|-------|
| Initialize Turborepo with Next.js app | 4 | - |
| Set up Supabase project (DB, Auth) | 4 | - |
| Configure Prisma with schema | 6 | - |
| Set up shadcn/ui and Tailwind | 3 | - |
| Create base layout and navigation | 4 | - |
| Set up CI/CD with GitHub Actions | 4 | - |
| Configure ESLint, Prettier, TypeScript | 2 | - |
| **Total** | **27** | |

#### Week 2: Auth & Core UI
| Task | Est. Hours | Owner |
|------|-----------|-------|
| Implement Supabase Auth flow | 6 | - |
| Create login/signup pages | 4 | - |
| Build organization onboarding | 6 | - |
| Create dashboard shell layout | 4 | - |
| Implement protected routes | 3 | - |
| Set up Zustand stores | 3 | - |
| Deploy to Vercel (staging) | 2 | - |
| **Total** | **28** | |

### Phase 2: GitHub Integration (Weeks 3-4)

#### Week 3: GitHub OAuth & Webhooks
| Task | Est. Hours | Owner |
|------|-----------|-------|
| Create GitHub App configuration | 4 | - |
| Implement GitHub OAuth flow | 6 | - |
| Build repository selection UI | 4 | - |
| Set up webhook endpoint | 4 | - |
| Configure Upstash Redis & BullMQ | 4 | - |
| Create worker service skeleton | 4 | - |
| **Total** | **26** | |

#### Week 4: Data Processing
| Task | Est. Hours | Owner |
|------|-----------|-------|
| Build commit processing job | 6 | - |
| Build PR processing job | 6 | - |
| Implement user matching logic | 4 | - |
| Create repository sync job | 4 | - |
| Build basic metrics queries | 4 | - |
| Display commit/PR data in UI | 4 | - |
| **Total** | **28** | |

### Phase 3: Slack Agent (Weeks 5-6)

#### Week 5: Slack Setup
| Task | Est. Hours | Owner |
|------|-----------|-------|
| Create Slack App configuration | 4 | - |
| Implement Slack OAuth flow | 6 | - |
| Set up Bolt SDK for events | 6 | - |
| Handle @mention events | 4 | - |
| Create user linking flow | 4 | - |
| Build Slack feedback templates | 4 | - |
| **Total** | **28** | |

#### Week 6: Proactive Feedback
| Task | Est. Hours | Owner |
|------|-----------|-------|
| Integrate OpenAI for analysis | 6 | - |
| Build commit quality analyzer | 4 | - |
| Create feedback trigger logic | 4 | - |
| Implement feedback delivery job | 4 | - |
| Build user preferences UI | 4 | - |
| Add feedback tracking | 4 | - |
| **Total** | **26** | |

### Phase 4: Intelligence & Dashboard (Weeks 7-8)

#### Week 7: Dashboard & Metrics
| Task | Est. Hours | Owner |
|------|-----------|-------|
| Build dashboard overview page | 6 | - |
| Create velocity metrics charts | 6 | - |
| Build team health indicators | 4 | - |
| Create risk flags component | 4 | - |
| Build developer profiles page | 4 | - |
| Add activity timeline | 4 | - |
| **Total** | **28** | |

#### Week 8: AI & Polish
| Task | Est. Hours | Owner |
|------|-----------|-------|
| Build insight generation engine | 6 | - |
| Create task suggestion API | 4 | - |
| Add Sentry error tracking | 3 | - |
| Performance optimization | 4 | - |
| Write documentation | 4 | - |
| End-to-end testing | 4 | - |
| Production deployment | 3 | - |
| **Total** | **28** | |

### Milestone Summary

| Milestone | Week | Deliverable |
|-----------|------|-------------|
| **M1: Foundation** | 2 | Working auth, dashboard shell deployed |
| **M2: GitHub Live** | 4 | Repos connected, commits/PRs ingesting |
| **M3: Slack Live** | 6 | Bot responding, feedback sending |
| **M4: MVP Launch** | 8 | Full dashboard, insights, ready for beta |

---

## 12. Cost Projections

### Development Phase (Months 1-2)

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| Vercel | Free | $0 |
| Supabase | Free | $0 |
| Upstash Redis | Pay-as-you-go | ~$5 |
| Render (Worker) | Starter | $7 |
| OpenAI API | Pay-as-you-go | ~$50 |
| GitHub (Private) | Free | $0 |
| Sentry | Free | $0 |
| **Total** | | **~$62/month** |

### Early Production (Months 3-6)

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| Vercel | Pro | $20/user × 2 = $40 |
| Supabase | Pro | $25 |
| Upstash Redis | Pay-as-you-go | ~$20 |
| Render (Worker) | Standard | $25 |
| OpenAI API | Pay-as-you-go | ~$150 |
| Sentry | Team | $26 |
| Domain + Email | - | $20 |
| **Total** | | **~$306/month** |

### Growth Phase (Months 6-12)

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| Vercel | Pro | $20/user × 5 = $100 |
| Supabase | Pro | $25 + compute = $75 |
| Upstash Redis | Pro | $50 |
| Render (Worker) | Standard × 2 | $50 |
| OpenAI API | Pay-as-you-go | ~$400 |
| Sentry | Team | $26 |
| Monitoring (Grafana Cloud) | Free | $0 |
| **Total** | | **~$701/month** |

### Cost Optimization Tips

1. **LLM Costs**: Cache responses, batch requests, use GPT-3.5 for simple tasks
2. **Database**: Use connection pooling, optimize queries, archive old data
3. **Vercel**: Use ISR/static where possible, optimize edge functions
4. **Redis**: Use appropriate TTLs, clean up old jobs

---

## 13. Risk Mitigation

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **GitHub API rate limits** | Medium | High | Use GitHub App (higher limits), aggressive caching, queue throttling |
| **LLM costs explode** | Medium | High | Implement hard limits per org, caching, tiered model usage |
| **Webhook reliability** | Medium | Medium | Idempotent processing, dead letter queues, replay capability |
| **Multi-tenant data leak** | Low | Critical | RLS policies, thorough testing, audit logging, security review |
| **Supabase outage** | Low | High | Implement graceful degradation, status monitoring |
| **Performance issues** | Medium | Medium | Load testing, query optimization, CDN caching |

### Business Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Low adoption** | Medium | High | Ship fast, iterate on feedback, focus on clear value |
| **Privacy concerns** | Medium | High | Transparent data usage, opt-in features, privacy controls |
| **Competition** | Medium | Medium | Focus on unique value (participation, not just analytics) |
| **Team bandwidth** | High | Medium | Ruthless prioritization, defer non-MVP features |

### Contingency Plans

| Scenario | Response |
|----------|----------|
| OpenAI unavailable | Fallback to Anthropic Claude, cached responses |
| GitHub rate limited | Queue jobs, slower sync, prioritize webhooks |
| Cost overrun | Implement usage limits, disable expensive features |
| Security incident | Incident response plan, user notification, audit |

---

## 14. Post-MVP Roadmap

### Phase 2: Enhanced Intelligence (Months 3-4)

| Feature | Description |
|---------|-------------|
| **Advanced Skill Tracking** | Track skill progression over time, certifications |
| **Codebase Embeddings** | Full RAG implementation for code search |
| **Custom Insights** | User-defined metrics and alerts |
| **Team Comparisons** | Cross-team velocity and health comparisons |
| **Integration Marketplace** | Jira, Linear, Notion integrations |

### Phase 3: Meeting Integration (Months 5-6)

| Feature | Description |
|---------|-------------|
| **Google Meet Bot** | Join meetings, transcribe discussions |
| **Meeting Summaries** | Auto-generate structured meeting notes |
| **Action Item Extraction** | Identify and track commitments |
| **Calendar Analysis** | Meeting load and focus time metrics |

### Phase 4: Autonomous Actions (Months 7-9)

| Feature | Description |
|---------|-------------|
| **Auto Task Assignment** | AI assigns tasks with human approval |
| **PR Auto-Review** | First-pass automated code review |
| **Sprint Planning Assistant** | AI-suggested sprint compositions |
| **Predictive Delivery** | ML-based delivery date predictions |

### Phase 5: Enterprise & Scale (Months 10-12)

| Feature | Description |
|---------|-------------|
| **SSO/SAML** | Enterprise authentication |
| **Audit Logs** | Detailed compliance logging |
| **Custom Deployments** | Private cloud options |
| **Multi-Org** | Agency/holding company support |
| **API Access** | Public API for custom integrations |
| **Industry Models** | Specialized models for verticals |

---

## Appendix A: Quick Start for Developers

```bash
# Clone the repository
git clone https://github.com/your-org/lucyn.git
cd lucyn

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Start local services
docker-compose up -d

# Run database migrations
npm run db:migrate

# Seed development data
npm run db:seed

# Start development server
npm run dev

# App available at http://localhost:3000
```

## Appendix B: Key Decisions Log

| Decision | Choice | Rationale | Date |
|----------|--------|-----------|------|
| Monorepo tool | Turborepo | Best DX, Vercel integration | TBD |
| Database | Supabase (PostgreSQL) | Free tier, RLS, Auth included | TBD |
| ORM | Prisma | Type safety, migrations, DX | TBD |
| Auth | Supabase Auth | Integrated, cost-effective | TBD |
| Queue | BullMQ + Upstash | Serverless Redis, reliable | TBD |
| LLM Provider | OpenAI | Best function calling, ecosystem | TBD |
| Hosting | Vercel + Render | Best for Next.js + workers | TBD |

---

*This document is a living plan and will be updated as development progresses.*

**Last Updated:** February 2026  
**Version:** 1.0.0
