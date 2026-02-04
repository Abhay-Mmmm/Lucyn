# Lucyn Auth & Integration Checklist

> **Core Responsibility:** Make users exist, log in safely, and connect GitHub — without breaking future OAuth flows.

---

## 📋 Phase 1: Auth Architecture (MOST IMPORTANT)

### 1.1 Auth Model Decision
- [ ] Confirm email-based primary identity approach
- [ ] Document the auth model decision
  - Email + password (optional)
  - OAuth providers (optional, can link to existing user)
  - Connected integrations (GitHub, Discord - separate from auth)

**Current Status:** Using Supabase Auth (handles email/password + OAuth)

---

## 📋 Phase 2: Database Schema

### 2.1 Review Existing Schema
- [ ] Review current `User` model in `packages/database/prisma/schema.prisma`
- [ ] Verify `password_hash` field handling (Supabase manages this)

### 2.2 Auth Providers Table (for future OAuth linking)
- [ ] Add `AuthProvider` model to schema:
  ```
  - id (uuid)
  - user_id (FK)
  - provider (github, google, etc)
  - provider_user_id
  - created_at
  ```

### 2.3 Integrations Table (for GitHub/Discord tokens)
- [ ] Add `Integration` model to schema:
  ```
  - id (uuid)
  - user_id (FK)
  - provider (github, discord)
  - access_token (encrypted)
  - refresh_token (encrypted, nullable)
  - scopes (string)
  - expires_at (nullable)
  - created_at
  - updated_at
  ```

### 2.4 Migration
- [ ] Create migration for new tables
- [ ] Run migration against dev database
- [ ] Test migration rollback

**Current Status:**
- ✅ `User` model exists with `githubId`, `githubUsername`, `discordId`, `discordUsername`
- ❌ No `AuthProvider` model
- ❌ No `Integration` model for encrypted tokens

---

## 📋 Phase 3: Password Rules & Validation

### 3.1 Define Password Requirements
- [ ] Minimum 8 characters
- [ ] At least 1 uppercase letter
- [ ] At least 1 lowercase letter
- [ ] At least 1 number
- [ ] At least 1 special character

### 3.2 Backend Validation (Source of Truth)
- [ ] Update `signUpSchema` in `packages/shared/src/validators/index.ts`
- [ ] Add password strength regex validation
- [ ] Return clear error messages for each failed rule

### 3.3 Frontend Validation
- [ ] Add real-time password strength indicator to signup page
- [ ] Show which rules are met/unmet
- [ ] Keep UI unchanged (logic only)

### 3.4 Create API Route for Signup
- [ ] Create `/api/auth/signup` route
- [ ] Validate password server-side
- [ ] Return appropriate error responses

**Current Status:**
- ⚠️ Basic validation exists (`min(8)` only)
- ❌ No complex password rules
- ❌ Signup goes directly to Supabase (no backend validation)

---

## 📋 Phase 4: Encryption & Security

### 4.1 Password Hashing
- [ ] Confirm Supabase handles bcrypt hashing (it does)
- [ ] Document that we don't store passwords manually

### 4.2 Token Encryption (for GitHub/Discord)
- [ ] Create encryption utility in `packages/shared/src/utils/`
  - [ ] `encryptToken(token: string): string`
  - [ ] `decryptToken(encryptedToken: string): string`
- [ ] Use AES-256-GCM encryption
- [ ] Store encryption key in environment variable
- [ ] Add `TOKEN_ENCRYPTION_KEY` to `.env.example`

### 4.3 Security Best Practices
- [ ] Never log tokens in production
- [ ] Validate webhook signatures (GitHub ✅, Discord ✅)
- [ ] Add rate limiting to auth endpoints

**Current Status:**
- ✅ Supabase handles password hashing
- ✅ Webhook signature verification implemented
- ❌ No token encryption utility

---

## 📋 Phase 5: Login & Signup Flows

### 5.1 Email + Password Signup
- [ ] Create `/api/auth/signup` endpoint
- [ ] Validate all fields server-side
- [ ] Create user in Supabase Auth
- [ ] Create corresponding user in Prisma DB
- [ ] Create organization record
- [ ] Return success/error response

### 5.2 Email + Password Login
- [ ] Create `/api/auth/login` endpoint (optional, Supabase handles)
- [ ] Verify credentials via Supabase
- [ ] Return session token

### 5.3 Session Management
- [ ] Verify Supabase session middleware works
- [ ] Test session refresh
- [ ] Test logout flow

### 5.4 Post-Auth Sync
- [ ] After Supabase auth, sync user to Prisma DB
- [ ] Handle user metadata (name, org) from Supabase

**Current Status:**
- ⚠️ Signup uses Supabase directly from frontend
- ⚠️ No backend validation before Supabase signup
- ✅ Login flow works via Supabase
- ❌ User not synced to Prisma DB after auth

---

## 📋 Phase 6: GitHub Integration (Priority)

### 6.1 GitHub OAuth Setup
- [ ] Create GitHub App (or verify existing)
- [ ] Configure permissions: Contents (Read), PRs (Read), Metadata (Read)
- [ ] Set webhook URL
- [ ] Store credentials in environment

### 6.2 GitHub Connect Flow
- [ ] Create `/api/github/connect` - initiates OAuth
- [ ] Update `/api/github/callback`:
  - [ ] Exchange code for access token
  - [ ] Encrypt access token
  - [ ] Store in `Integration` table
  - [ ] Link to current user
  - [ ] Fetch and store GitHub user info

### 6.3 Token Storage
- [ ] Store encrypted `access_token` in Integration table
- [ ] Store `refresh_token` if available
- [ ] Store token scopes
- [ ] Store expiration time

### 6.4 GitHub Webhook Handling
- [ ] Verify webhook signature (✅ done)
- [ ] Handle `installation` events
- [ ] Handle `push` events
- [ ] Handle `pull_request` events
- [ ] Queue jobs for processing

### 6.5 Repository Sync
- [ ] List user's accessible repositories
- [ ] Store selected repos in DB
- [ ] Create sync job for each repo

**Current Status:**
- ✅ `/api/github/callback` exists (basic)
- ✅ `/api/github/webhook` exists with signature verification
- ❌ Tokens not encrypted or stored
- ❌ No `Integration` table
- ❌ No repository sync implemented

---

## 📋 Phase 7: OAuth Users (Design for Future)

### 7.1 OAuth Login Architecture
- [ ] Design: OAuth creates user WITHOUT password
- [ ] Email becomes canonical identifier
- [ ] If OAuth email exists → link provider to existing user

### 7.2 Password-Optional Handling
- [ ] Login with OAuth: skip password check
- [ ] Allow OAuth users to add password later (optional feature)
- [ ] No crashes when `password_hash` is null

### 7.3 Provider Linking
- [ ] If user signs up with email/password, then connects GitHub OAuth:
  - [ ] Link GitHub provider to existing user
  - [ ] Don't create duplicate user

**Current Status:**
- ✅ Supabase handles OAuth user creation
- ⚠️ Need to sync OAuth users to Prisma DB
- ❌ No explicit provider linking logic

---

## 📋 Phase 8: Testing

### 8.1 Unit Tests
- [ ] Password validation tests
  - [ ] Valid password passes
  - [ ] Too short fails
  - [ ] Missing uppercase fails
  - [ ] Missing lowercase fails
  - [ ] Missing number fails
  - [ ] Missing special char fails

- [ ] Token encryption tests
  - [ ] Encrypt then decrypt returns original
  - [ ] Invalid key fails decryption
  - [ ] Tampered ciphertext fails

### 8.2 Integration Tests
- [ ] Signup with valid password → success
- [ ] Signup with invalid password → appropriate error
- [ ] Login with correct credentials → success
- [ ] Login with wrong password → failure
- [ ] Login with non-existent email → failure

### 8.3 GitHub Integration Tests
- [ ] GitHub connect flow completes
- [ ] Token stored encrypted
- [ ] Webhook signature validation works
- [ ] Invalid webhook signature rejected

### 8.4 OAuth Edge Cases
- [ ] OAuth user without password can login
- [ ] OAuth user linked to existing email user
- [ ] Multiple OAuth providers on one user

**Current Status:**
- ❌ No auth tests exist
- ❌ No integration tests

---

## 🚫 DO NOT Do Right Now

- ❌ Discord integration (later)
- ❌ Linear integration (later)
- ❌ UI changes (keep existing design)
- ❌ Over-optimizing OAuth UX
- ❌ Custom crypto logic (use standard libraries)

---

## 📅 Suggested Daily Execution Plan

### Day 1: Database & Foundation
- [ ] Finalize database schema additions
- [ ] Create migration
- [ ] Create token encryption utility
- [ ] Add encryption key to env

### Day 2: Auth Flow
- [ ] Implement password validation (frontend + backend)
- [ ] Create `/api/auth/signup` with validation
- [ ] Sync users to Prisma after Supabase auth
- [ ] Test email/password flow end-to-end

### Day 3: GitHub Integration
- [ ] Complete GitHub OAuth flow
- [ ] Store encrypted tokens
- [ ] Test webhook handling
- [ ] Write tests

---

## 📊 Progress Summary

| Phase | Status | Items Done | Items Total |
|-------|--------|------------|-------------|
| 1. Auth Architecture | 🟡 In Progress | 0 | 2 |
| 2. Database Schema | 🔴 Not Started | 0 | 8 |
| 3. Password Rules | 🔴 Not Started | 0 | 8 |
| 4. Encryption | 🔴 Not Started | 0 | 7 |
| 5. Login/Signup | 🟡 Partial | 2 | 10 |
| 6. GitHub Integration | 🟡 Partial | 2 | 15 |
| 7. OAuth Design | 🟡 Partial | 1 | 6 |
| 8. Testing | 🔴 Not Started | 0 | 15 |

**Overall Progress:** ~7% complete (5 of ~71 items)

---

## 🔗 Key Files Reference

| File | Purpose |
|------|---------|
| [packages/database/prisma/schema.prisma](packages/database/prisma/schema.prisma) | Database schema |
| [packages/shared/src/validators/index.ts](packages/shared/src/validators/index.ts) | Validation schemas |
| [apps/web/app/(auth)/signup/page.tsx](apps/web/app/(auth)/signup/page.tsx) | Signup UI |
| [apps/web/app/(auth)/login/page.tsx](apps/web/app/(auth)/login/page.tsx) | Login UI |
| [apps/web/app/api/github/callback/route.ts](apps/web/app/api/github/callback/route.ts) | GitHub OAuth callback |
| [apps/web/app/api/github/webhook/route.ts](apps/web/app/api/github/webhook/route.ts) | GitHub webhooks |
| [apps/web/app/auth/callback/route.ts](apps/web/app/auth/callback/route.ts) | Supabase auth callback |
| [apps/web/lib/supabase/](apps/web/lib/supabase/) | Supabase client setup |

---

*Last Updated: February 4, 2026*
