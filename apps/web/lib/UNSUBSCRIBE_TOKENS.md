# Unsubscribe Token System

## Overview
The unsubscribe system uses signed HMAC-SHA256 tokens to securely process unsubscribe requests without allowing arbitrary email addresses to be unsubscribed.

## Security Features
- **Signed tokens**: HMAC-SHA256 signature prevents tampering
- **Time-limited**: Tokens expire after 72 hours (configurable)
- **Rate limiting**: 5 requests per IP per 60 seconds
- **Timing-safe comparison**: Prevents timing attacks on signature verification

## Environment Variables
Set one of these in your `.env` file:
```env
UNSUBSCRIBE_TOKEN_SECRET=your-secret-key-here
# OR fallback to:
NEXTAUTH_SECRET=your-nextauth-secret
```

## Usage

### 1. Generating Tokens (for email templates)
```typescript
import { generateUnsubscribeToken } from '@/lib/unsubscribe-token';

const token = generateUnsubscribeToken('user@example.com');
const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?token=${token}`;
```

### 2. Email Template Example
```html
<p>
  If you no longer wish to receive these emails, you can 
  <a href="{{unsubscribeUrl}}">unsubscribe here</a>.
</p>
```

### 3. API Endpoint
The endpoint automatically:
- Extracts token from query params or body
- Validates signature and expiry
- Rate limits by IP address
- Updates user preferences

**Request:**
```http
POST /api/unsubscribe?token=<base64url-encoded-token>
```

**Responses:**
- `200`: Success
- `400`: Missing token or invalid JSON
- `401`: Invalid or expired token
- `429`: Rate limit exceeded
- `500`: Server error

### 4. User Flow
1. User clicks unsubscribe link with token in email
2. Browser navigates to `/unsubscribe?token=...`
3. Page auto-submits to API endpoint
4. API validates token, updates preferences
5. User sees success or error message

## Token Format
```text
base64url(email|timestamp|hmac-sha256-signature)
```

Example (decoded):
```text
user@example.com|1738963200000|a1b2c3d4e5f6...
```

## Integration Points

### Discord Notifications
```typescript
// packages/discord/src/notifications/weekly-summary.ts
// Note: For external packages like Discord, you have two options:
// 1. Export unsubscribe-token from @lucyn/web package and import it
// 2. Implement the same HMAC signing logic directly in the Discord package
// 
// Option 1 requires adding to packages/web/package.json exports:
//   "exports": { "./lib/unsubscribe-token": "./lib/unsubscribe-token.ts" }
//
// For now, tokens should be generated in the web app context:
import { getUnsubscribeUrl } from '@/lib/email-utils';

const unsubscribeUrl = getUnsubscribeUrl(user.email);
```

### Email Service
```typescript
// apps/worker/src/jobs/email/send-notification.ts
import { generateUnsubscribeToken } from '@/lib/unsubscribe-token';

async function sendEmail(to: string, subject: string, body: string) {
  const token = generateUnsubscribeToken(to);
  const unsubscribeLink = `${appUrl}/unsubscribe?token=${token}`;
  
  // Add link to email template
  const enrichedBody = body + `\n\nUnsubscribe: ${unsubscribeLink}`;
  
  // Send email...
}
```

## Testing

### Valid Token Test
```bash
# Generate a token first (in dev console or test script)
curl -X POST "http://localhost:3000/api/unsubscribe?token=YOUR_TOKEN_HERE"
```

### Invalid Token Test
```bash
curl -X POST "http://localhost:3000/api/unsubscribe?token=invalid-token"
# Should return 401
```

### Rate Limit Test
```bash
# Send 6+ requests rapidly from same IP
for i in {1..7}; do
  curl -X POST "http://localhost:3000/api/unsubscribe?token=YOUR_TOKEN"
done
# 6th request should return 429
```

## Migration Notes
If you have existing unsubscribe links that use raw email addresses:
1. Old links will be rejected with 400 "Unsubscribe token is required"
2. Users should use latest email for valid token
3. Consider a grace period with dual support (email OR token) if needed

## Security Considerations
- Never log the full token in production
- Rotate `UNSUBSCRIBE_TOKEN_SECRET` if compromised
- Monitor rate limit metrics for abuse patterns
- Consider adding CAPTCHA for persistent abuse
- Tokens are one-time use conceptually but technically reusable until expiry
