# Authentication Setup - Quick Start

## Prerequisites

Before running the authentication system, complete these steps:

## 1. Database Migration

The schema includes a new `SLACK` provider type that needs to be added:

```bash
# Navigate to database package
cd packages/database

# Regenerate Prisma Client with updated schema
npx prisma generate

# Create and apply migration
npx prisma migrate dev --name add_slack_auth_provider

# Verify migration was successful
npx prisma migrate status
```

## 2. Environment Variables

Add these to your `.env` file:

```bash
# ============================================
# GitHub OAuth Configuration
# ============================================
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here

# ============================================
# Slack OAuth Configuration
# ============================================
SLACK_CLIENT_ID=your_slack_client_id_here
SLACK_CLIENT_SECRET=your_slack_client_secret_here

# ============================================
# Application Configuration
# ============================================
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ============================================
# Supabase (for session management)
# ============================================
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# ============================================
# Encryption (for storing OAuth tokens)
# ============================================
ENCRYPTION_KEY=your_32_character_encryption_key
```

### Generating Encryption Key

```bash
# Generate a secure random key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 3. OAuth Provider Setup

### GitHub OAuth App

1. Navigate to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: Lucyn
   - **Homepage URL**: `http://localhost:3000` (dev) or your production URL
   - **Authorization callback URL**: `http://localhost:3000/api/oauth/github/callback`
4. Click "Register application"
5. Copy **Client ID** to `GITHUB_CLIENT_ID`
6. Generate and copy **Client Secret** to `GITHUB_CLIENT_SECRET`

### Slack OAuth App

1. Navigate to https://api.slack.com/apps
2. Click "Create New App" → "From scratch"
3. Name it "Lucyn" and select your workspace
4. In "OAuth & Permissions":
   - Add **Redirect URLs**: `http://localhost:3000/api/oauth/slack/callback`
   - Add **User Token Scopes**:
     - `identity.basic`
     - `identity.email`
     - `identity.avatar`
5. In "Basic Information":
   - Copy **Client ID** to `SLACK_CLIENT_ID`
   - Copy **Client Secret** to `SLACK_CLIENT_SECRET`

## 4. Verify Setup

Run these checks:

```bash
# Check Prisma is generated
npm run build --workspace=@lucyn/database

# Check environment variables are loaded
npm run dev

# In another terminal, test GitHub OAuth flow
curl -I http://localhost:3000/api/oauth/github/authorize

# Should redirect to github.com with OAuth parameters
```

## 5. Test Authentication Flow

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/login`

3. Click "Continue with GitHub"
   - Should redirect to GitHub
   - After authorization, should redirect back
   - New users → `/onboarding`
   - Existing users → `/dashboard`

4. Click "Continue with Slack"
   - Should redirect to Slack
   - After authorization, should redirect back
   - Same behavior as GitHub

## Common Issues

### "Module has no exported member 'AuthProviderType'"

**Cause**: Prisma client not regenerated

**Fix**:
```bash
cd packages/database
npx prisma generate
```

### "Missing required GitHub OAuth environment variables"

**Cause**: Environment variables not set

**Fix**: Check `.env` file exists and has all required variables

### "CSRF token mismatch"

**Cause**: Cookie not being set or cleared

**Fix**: 
- Check `sameSite` cookie setting
- Verify domain matches between app and OAuth callback
- Clear browser cookies and try again

### "No verified email available"

**Cause**: OAuth provider doesn't have verified email

**Fix**:
- For GitHub: Verify email in GitHub settings
- For Slack: Ensure `identity.email` scope is granted

## Production Deployment

### Additional Steps for Production

1. **Update OAuth callback URLs**:
   - GitHub: Add `https://yourdomain.com/api/oauth/github/callback`
   - Slack: Add `https://yourdomain.com/api/oauth/slack/callback`

2. **Update environment variables**:
   ```bash
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   NODE_ENV=production
   ```

3. **Enable secure cookies**:
   - Automatically enabled in production (see route code)
   - Requires HTTPS

4. **Database**:
   - Apply migrations: `npx prisma migrate deploy`
   - Verify email unique constraint exists

5. **Monitor**:
   - Set up logging for OAuth errors
   - Track authentication success/failure rates
   - Monitor for CSRF attacks (invalid state errors)

## Security Checklist

Before going to production:

- [ ] All OAuth secrets in environment variables (not hardcoded)
- [ ] HTTPS enabled
- [ ] Secure cookies enabled
- [ ] CSRF protection active (state parameter)
- [ ] Email unique constraint in database
- [ ] OAuth tokens encrypted before storage
- [ ] Service role keys not exposed to client
- [ ] Error messages don't leak sensitive info
- [ ] Rate limiting on OAuth endpoints
- [ ] Logging for security events

## Next Steps

After setup is complete:

1. Customize onboarding flow in `/app/onboarding/page.tsx`
2. Update login page UI in `/app/(auth)/login/page.tsx`
3. Add session management to protected pages
4. Set up email notifications for account linking
5. Add account management page for linking/unlinking providers

## Support

If you encounter issues:

1. Check [README.md](./README.md) for detailed documentation
2. Review error logs in terminal
3. Verify all environment variables are set
4. Confirm OAuth apps are configured correctly
5. Check database migrations are applied
