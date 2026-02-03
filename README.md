# Lucyn

> **The AI Product Engineer that works inside your company.**

Lucyn is an AI-powered engineering intelligence platform that transforms raw engineering activity into actionable business insights while providing developers with personalized guidance.

[![License](https://img.shields.io/badge/license-Private-red.svg)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)]()
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)]()

---

## 🎯 What is Lucyn?

Lucyn acts as a **senior team member** that:
- **Understands your codebase** through GitHub integration
- **Understands your people** through activity analysis
- **Participates in discussions** via Discord and meetings
- **Assigns work intelligently** based on skills and workload
- **Optimizes how your team builds** through continuous insights

## ✨ Key Features

### 📊 Engineering Intelligence Engine
- Ingests commits, PRs, and code reviews from GitHub
- Generates developer performance profiles (growth-focused, non-punitive)
- Tracks code health, velocity trends, and risk indicators

### 💬 Discord Feedback Agent
- Personalized tips on commits, PRs, and best practices
- Answers engineering questions contextually
- Celebrates achievements and milestones

### 📈 CEO Dashboard
- High-level engineering health overview
- Team velocity vs. roadmap tracking
- Risk flags and delivery confidence scores
- No technical jargon—business-aligned insights

### 🎯 Task Assignment Suggestions
- Intelligent assignment based on skills, workload, and growth opportunities
- Reduces burnout by balancing work dynamically
- Explains reasoning for every suggestion

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14, Tailwind CSS, shadcn/ui |
| **Backend** | Next.js API Routes, BullMQ |
| **Database** | PostgreSQL (Supabase), pgvector |
| **Queue** | Redis (Upstash), BullMQ |
| **Auth** | Supabase Auth |
| **AI/LLM** | OpenAI GPT-4, Embeddings |
| **Integrations** | GitHub, Discord |

## 📁 Project Structure

```
lucyn/
├── apps/
│   ├── web/              # Next.js dashboard & API
│   └── worker/           # Background job processor
├── packages/
│   ├── database/         # Prisma schema & client
│   ├── shared/           # Shared types & utilities
│   └── ai/               # LLM integration
├── docker-compose.yml
├── turbo.json
├── PRD.md                # Product Requirements
└── PLAN.md               # Technical Implementation Plan
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- Docker (for local PostgreSQL & Redis)
- Supabase account (or local Supabase)
- GitHub App credentials
- Discord App credentials
- OpenAI API key

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/lucyn.git
cd lucyn

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Start local services
docker-compose up -d

# Run database migrations
npm run db:migrate

# Seed development data (optional)
npm run db:seed

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Testing Locally Without External Services

You can test the dashboard UI without connecting to external services:

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Visit the dashboard:** Navigate to `http://localhost:3000/dashboard`
   - The dashboard displays mock data for all pages
   - Explore Team, Repositories, Insights, Tasks, and Discord pages

### Testing GitHub Integration

1. **Create a GitHub App:**
   - Go to GitHub Settings → Developer Settings → GitHub Apps
   - Create a new app with these permissions:
     - Repository: Contents (Read), Pull Requests (Read), Metadata (Read)
     - Subscribe to events: Push, Pull Request, Installation
   - Set webhook URL to `https://your-domain.com/api/github/webhook`

2. **Configure environment variables:**
   ```bash
   GITHUB_APP_ID=your_app_id
   GITHUB_CLIENT_ID=your_client_id
   GITHUB_CLIENT_SECRET=your_client_secret
   GITHUB_WEBHOOK_SECRET=your_webhook_secret
   ```

3. **Test with ngrok (local development):**
   ```bash
   ngrok http 3000
   # Use the ngrok URL as your webhook endpoint
   ```

4. **Verify webhook delivery:**
   - Install the app on a test repository
   - Make a commit or open a PR
   - Check the worker logs for processing events

### Testing Discord Integration

1. **Create a Discord Application:**
   - Go to [discord.com/developers/applications](https://discord.com/developers/applications)
   - Create a new application
   - Go to Bot section and create a bot
   - Enable required intents: `GUILDS`, `GUILD_MESSAGES`, `DIRECT_MESSAGES`
   - Set Interactions Endpoint URL to: `https://your-domain.com/api/discord/events`

2. **Configure environment variables:**
   ```bash
   DISCORD_CLIENT_ID=your_client_id
   DISCORD_CLIENT_SECRET=your_client_secret
   DISCORD_BOT_TOKEN=your_bot_token
   DISCORD_PUBLIC_KEY=your_public_key
   DISCORD_GUILD_ID=your_guild_id
   ```

3. **Test the bot:**
   - Add the bot to your Discord server
   - Use slash commands or mention the bot
   - Check logs for event processing

### Testing the Worker

1. **Start Redis locally:**
   ```bash
   docker run -d -p 6379:6379 redis:alpine
   ```

2. **Run the worker:**
   ```bash
   npm run worker:dev
   ```

3. **Manually queue a job (for testing):**
   ```typescript
   // In a test script or API route
   import { githubQueue } from '@lucyn/worker';
   
   await githubQueue.add('process-commit', {
     repositoryId: 'test-repo-id',
     commitSha: 'abc123',
     message: 'feat: add new feature',
     authorEmail: 'dev@example.com',
     authorName: 'Test Developer',
     additions: 50,
     deletions: 10,
     filesChanged: 5,
     committedAt: new Date().toISOString(),
   });
   ```

### Testing AI Features

1. **Set your OpenAI API key:**
   ```bash
   OPENAI_API_KEY=sk-your-api-key
   ```

2. **Test AI chains directly:**
   ```typescript
   import { analyzeCommit, reviewPullRequest } from '@lucyn/ai';
   
   // Test commit analysis
   const result = await analyzeCommit({
     message: 'fix: resolve memory leak in data pipeline',
     filesCount: 3,
     additions: 25,
     deletions: 10,
   });
   console.log(result);
   ```

### End-to-End Testing Checklist

- [ ] Dashboard loads with mock data
- [ ] Login/signup pages render correctly
- [ ] GitHub OAuth flow completes successfully
- [ ] Discord OAuth flow completes successfully
- [ ] Webhooks are received and processed
- [ ] Worker processes jobs from queue
- [ ] AI analysis returns valid responses
- [ ] Database migrations run without errors

### Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=

# Redis
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# GitHub App
GITHUB_APP_ID=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_WEBHOOK_SECRET=

# Discord App
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
DISCORD_BOT_TOKEN=
DISCORD_PUBLIC_KEY=
DISCORD_GUILD_ID=

# OpenAI
OPENAI_API_KEY=
```

## 📖 Documentation

- [Product Requirements (PRD)](./PRD.md) - Product vision and features
- [Implementation Plan](./PLAN.md) - Technical architecture and roadmap

## 🗺 Roadmap

### MVP (8 Weeks)
- [x] Planning complete
- [ ] GitHub data ingestion
- [ ] Discord feedback agent
- [ ] CEO dashboard
- [ ] Task assignment suggestions

### Phase 2 (Months 3-4)
- [ ] Advanced skill tracking
- [ ] Codebase embeddings (RAG)
- [ ] Jira/Linear integrations

### Phase 3 (Months 5-6)
- [ ] Google Meet integration
- [ ] Meeting summaries
- [ ] Action item extraction

### Phase 4+ (Months 7-12)
- [ ] Autonomous task assignment
- [ ] Predictive delivery estimates
- [ ] Enterprise features (SSO, audit logs)

## 🤝 Contributing

This is currently a private project. Contribution guidelines coming soon.

## 📄 License

Private - All rights reserved.

---

Built with ❤️ for engineering teams everywhere.