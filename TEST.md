# Testing the GitHub Integration

## Prerequisites

1. **Run database migration:**
   ```powershell
   cd packages/database
   npx prisma migrate dev --name github_integration
   ```

2. **Environment variables** in `.env`:
   ```
   GITHUB_APP_ID=your_app_id
   GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n..."
   GITHUB_WEBHOOK_SECRET=your_webhook_secret
   GITHUB_CLIENT_ID=your_client_id
   GITHUB_CLIENT_SECRET=your_client_secret
   DATABASE_URL=postgresql://...
   REDIS_URL=redis://localhost:6379
   OPENAI_API_KEY=sk-...
   ```

---

## Option 1: Local Testing with ngrok

### Step 1: Start the app
```powershell
# Terminal 1
npm run dev
```

### Step 2: Expose via ngrok
```powershell
# Terminal 2
ngrok http 3000
```

### Step 3: Configure GitHub App
1. Go to https://github.com/settings/apps/YOUR_APP_NAME
2. Set **Webhook URL** to: `https://YOUR_NGROK_URL.ngrok.io/api/github/webhooks`
3. Save changes

### Step 4: Trigger events
- Install the app on a test repository
- Create a pull request
- Push commits to see webhook events

### Step 5: Monitor logs
Watch your terminal for webhook processing logs.

---

## Option 2: Manual Webhook Testing

Test the webhook endpoint directly with curl:

```powershell
# Ping event (simplest test)
curl -X POST http://localhost:3000/api/github/webhooks `
  -H "Content-Type: application/json" `  
  -H "X-GitHub-Event: ping" `
  -H "X-GitHub-Delivery: test-123" `
  -d '{"zen": "test"}'
```

> **Note:** Without a valid signature, the webhook will return 401. For testing without signature validation, temporarily comment out the verification in `route.ts`.

---

## Option 3: Unit Tests

Run individual package tests:

```powershell
# Test the github package
cd packages/github
npm test

# Test all packages
npm run test
```

### Example test file (`packages/github/src/__tests__/client.test.ts`):
```typescript
import { describe, it, expect } from 'vitest';
import { generateAppJWT } from '../client';

describe('GitHub Client', () => {
  it('generates valid JWT', () => {
    const jwt = generateAppJWT();
    expect(jwt).toBeDefined();
    expect(jwt.split('.')).toHaveLength(3);
  });
});
```

---

## Verifying the Integration Works

### 1. Check webhook received
Look for this in your terminal:
```
Received GitHub webhook: pull_request/opened
```

### 2. Check database
```sql
-- Check if repository was ingested
SELECT * FROM repository_memories;

-- Check AI suggestions
SELECT * FROM ai_suggestions ORDER BY created_at DESC;
```

### 3. Check PR comment
After analyzing a PR, Lucyn should post a comment with suggestions.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 401 Invalid signature | Check `GITHUB_WEBHOOK_SECRET` matches GitHub App settings |
| 500 Internal error | Check database connection and Redis |
| No webhook received | Verify ngrok URL is correct in GitHub App |
| Prisma errors | Run `npx prisma generate` after schema changes |

---

## Test Checklist

- [ ] Webhook endpoint responds to ping
- [ ] Installation event creates Organization record
- [ ] Push event queues repository ingestion
- [ ] PR event triggers analysis
- [ ] Suggestions appear in database
- [ ] Comment posted to GitHub PR
