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
- **Participates in discussions** via Slack and meetings
- **Assigns work intelligently** based on skills and workload
- **Optimizes how your team builds** through continuous insights

## ✨ Key Features

### 📊 Engineering Intelligence Engine
- Ingests commits, PRs, and code reviews from GitHub
- Generates developer performance profiles (growth-focused, non-punitive)
- Tracks code health, velocity trends, and risk indicators

### 💬 Slack Feedback Agent
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
| **Integrations** | GitHub, Slack |

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
- Slack App credentials
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

# Slack App
SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=
SLACK_SIGNING_SECRET=

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
- [ ] Slack feedback agent
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