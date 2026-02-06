# OAuth Authentication System

## Overview

This authentication system enforces **email uniqueness** across all OAuth providers. The same email address can never create multiple accounts, ensuring a single user identity regardless of the authentication method used.

## Architecture

### Core Principles

1. **Email is the unique identifier** - One email = One user
2. **Provider linking** - Users can link multiple OAuth providers to the same account
3. **Unified callback handler** - Single code path for all OAuth providers
4. **Backend enforcement** - Email uniqueness is enforced at database and application level
5. **Stateless frontend** - Frontend never checks for existing accounts

### Flow Diagram

```
User clicks "Sign in with GitHub/Slack"
           ↓
   Redirect to OAuth provider
           ↓
   User authorizes on provider
           ↓
   Callback with auth code
           ↓
   Exchange code for access token
           ↓
   Fetch user profile (including email)
           ↓
   ┌─────────────────────────────┐
   │ Unified OAuth Handler       │
   │                             │
   │ 1. Normalize email          │
   │ 2. Look up user by email    │
   │ 3. If exists:               │
   │    - Link provider          │
   │    - Log in                 │
   │ 4. If not exists:           │
   │    - Create user + org      │
   │    - Link provider          │
   │    - Log in                 │
   └─────────────────────────────┘
           ↓
   Generate session token
           ↓
   Set secure cookie
           ↓
   Redirect based on isNewUser flag
           ↓
   isNewUser=true → /onboarding
   isNewUser=false → /dashboard
```

## Implementation

### Directory Structure

```
apps/web/
├── lib/
│   └── auth/
│       └── oauth-handler.ts          # Core OAuth logic
└── app/
    └── api/
        └── oauth/
            ├── github/
            │   ├── authorize/
            │   │   └── route.ts      # Start GitHub OAuth flow
            │   └── callback/
            │       └── route.ts      # Handle GitHub callback
            └── slack/
                ├── authorize/
                │   └── route.ts      # Start Slack OAuth flow
                └── callback/
                    └── route.ts      # Handle Slack callback
```

### Database Schema

#### User Model

```prisma
model User {
  id             String   @id @default(cuid())
  email          String   @unique          // ← UNIQUE CONSTRAINT
  name           String?
  avatarUrl      String?
  githubId       String?  @unique
  githubUsername String?
  // ... other fields
  
  authProviders  AuthProvider[]
}
```

#### AuthProvider Model

```prisma
model AuthProvider {
  id             String           @id @default(cuid())
  provider       AuthProviderType
  providerUserId String
  email          String?
  accessToken    String?          // Encrypted
  refreshToken   String?          // Encrypted
  expiresAt      DateTime?
  
  user           User             @relation(...)
  userId         String
  
  @@unique([provider, providerUserId])
}

enum AuthProviderType {
  GITHUB
  GOOGLE
  DISCORD
  SLACK
}
```

### Environment Variables

Add to `.env`:

```bash
# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Slack OAuth
SLACK_CLIENT_ID=your_slack_client_id
SLACK_CLIENT_SECRET=your_slack_client_secret

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase (for session management)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
```

## Setup Instructions

### 1. Update Database Schema

The schema has been updated to include the `SLACK` provider type:

```bash
cd packages/database
npx prisma generate
npx prisma migrate dev --name add_slack_provider
```

### 2. Configure OAuth Apps

#### GitHub OAuth App

1. Go to https://github.com/settings/developers
2. Create new OAuth App
3. Set Authorization callback URL: `https://yourdomain.com/api/oauth/github/callback`
4. Copy Client ID and Secret to `.env`

#### Slack OAuth App

1. Go to https://api.slack.com/apps
2. Create new app
3. Enable "Sign in with Slack"
4. Add redirect URL: `https://yourdomain.com/api/oauth/slack/callback`
5. Add User Token Scopes:
   - `identity.basic`
   - `identity.email`
   - `identity.avatar`
6. Copy Client ID and Secret to `.env`

### 3. Frontend Integration

#### Login/Signup Page

```tsx
// app/(auth)/login/page.tsx

export default function LoginPage() {
  return (
    <div>
      <h1>Sign In</h1>
      
      {/* GitHub OAuth */}
      <a href="/api/oauth/github/authorize">
        <button>Continue with GitHub</button>
      </a>
      
      {/* Slack OAuth */}
      <a href="/api/oauth/slack/authorize">
        <button>Continue with Slack</button>
      </a>
    </div>
  );
}
```

**Important**: No separate signup page needed. The same button works for both signup and login.

## API Response Format

### OAuth Callback Response

The OAuth callback sets a secure cookie and redirects:

```typescript
// Cookie set
{
  name: 'session_token',
  value: string,
  httpOnly: true,
  secure: true, // production only
  sameSite: 'lax',
  maxAge: 604800 // 7 days
}

// Redirect URL
isNewUser ? '/onboarding' : '/dashboard'
```

### Internal Handler Response

The `handleOAuthCallback` function returns:

```typescript
{
  user: {
    id: string;
    email: string;
    name?: string;
    avatarUrl?: string;
  };
  sessionToken: string;
  isNewUser: boolean;
}
```

## Security Features

### CSRF Protection

- Random state token generated on authorization
- State stored in secure cookie
- Validated on callback
- Cookie deleted after use

### Token Security

- OAuth tokens encrypted before storage
- Uses `encryptToken` from `@lucyn/shared`
- Requires `ENCRYPTION_KEY` environment variable

### Email Verification

- Only verified emails accepted from OAuth providers
- GitHub: Fetches from `/user/emails` API if primary email is private
- Slack: Uses `identity.email` scope

### Race Condition Prevention

- Atomic `upsert` operations
- Database transactions for user creation
- Unique constraints at database level

## Error Handling

### Common Errors

| Error Code | Meaning | User Message |
|------------|---------|--------------|
| `missing_code` | No authorization code received | Authentication failed |
| `invalid_state` | CSRF token mismatch | Invalid authentication request |
| `no_verified_email` | Provider didn't return email | Email required for signup |
| `no_access_token` | Token exchange failed | Authentication failed |
| `authentication_failed` | General error | Unable to sign in |

### Error Response Flow

```
Error occurs
    ↓
Log to console (with context)
    ↓
Redirect to /login?error=<code>
    ↓
Frontend displays user-friendly message
```

## Edge Cases Handled

### 1. GitHub Private Emails

**Problem**: User's primary email is `user@users.noreply.github.com`

**Solution**: 
- Call `/user/emails` API with OAuth token
- Find primary verified email
- Fallback to any verified email

### 2. Same Email, Different Providers

**Problem**: User signs in with GitHub, then tries Slack with same email

**Solution**:
- Lookup user by email
- Link Slack provider to existing user
- Log user in (not sign up)
- `isNewUser = false`

### 3. Concurrent OAuth Callbacks

**Problem**: User clicks both GitHub and Slack buttons simultaneously

**Solution**:
- Database unique constraint prevents duplicate emails
- Atomic upsert operations
- Transaction rollback on conflict

### 4. Provider Doesn't Return Email

**Problem**: OAuth provider returns null email

**Solution**:
- Validate email before processing
- Redirect to error page
- Ask user to grant email permission

## Testing

### Manual Testing Checklist

- [ ] New user can sign up with GitHub
- [ ] New user can sign up with Slack
- [ ] Existing user can log in with existing provider
- [ ] Existing user can link new provider
- [ ] Same email cannot create duplicate accounts
- [ ] `isNewUser` flag is correct
- [ ] Session cookie is set
- [ ] Redirect works correctly
- [ ] CSRF protection works
- [ ] Error handling works

### Test Scenarios

```bash
# Scenario 1: New User Signup
1. Click "Sign in with GitHub"
2. Authorize on GitHub
3. Verify redirected to /onboarding
4. Check database - user created with GitHub provider

# Scenario 2: Existing User Login
1. Sign up with GitHub (email: test@example.com)
2. Log out
3. Click "Sign in with GitHub"
4. Authorize on GitHub
5. Verify redirected to /dashboard (not /onboarding)
6. Check database - no duplicate user

# Scenario 3: Provider Linking
1. Sign up with GitHub (email: test@example.com)
2. Click "Sign in with Slack" (same email)
3. Authorize on Slack
4. Verify redirected to /dashboard
5. Check database - same user, two auth providers
```

## Maintenance

### Adding New OAuth Provider

1. Add provider to `AuthProviderType` enum in schema
2. Run `prisma generate` and `prisma migrate dev`
3. Create `apps/web/app/api/oauth/<provider>/authorize/route.ts`
4. Create `apps/web/app/api/oauth/<provider>/callback/route.ts`
5. Follow existing patterns from GitHub/Slack
6. Add provider credentials to `.env`
7. Update frontend with new button

### Monitoring

Key metrics to track:
- OAuth callback success rate
- Failed authentications by error code
- Provider linking frequency
- Time from authorization to callback

### Troubleshooting

**Problem**: "Module has no exported member 'AuthProviderType'"

**Solution**: Run `cd packages/database && npx prisma generate`

---

**Problem**: "User ID mismatch during OAuth sync"

**Solution**: Check Supabase user creation logic, ensure IDs match

---

**Problem**: "Email already exists" database error

**Solution**: This shouldn't happen. Check if email uniqueness is enforced

---

## Migration from Existing Auth

If you have existing users:

1. **Backup database** before migration
2. Ensure all existing users have unique emails
3. Run migration to add `SLACK` to enum
4. Add auth providers for existing users:

```sql
-- For users who signed up with email/password
INSERT INTO auth_providers (id, provider, provider_user_id, email, user_id, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'GOOGLE', -- or other default
  email,
  email,
  id,
  created_at,
  updated_at
FROM users
WHERE id NOT IN (SELECT DISTINCT user_id FROM auth_providers);
```

## Support

For issues or questions:
1. Check error logs in console
2. Verify environment variables are set
3. Confirm OAuth apps are configured correctly
4. Check database constraints are in place
