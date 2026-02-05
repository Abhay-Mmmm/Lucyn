# Email Templates for Lucyn

This folder contains HTML email templates for authentication flows. These templates are designed to be used with **Supabase Auth** email customization.

## Available Templates

| Template | File | Purpose |
|----------|------|---------|
| Email Verification | `verification-email.html` | Sent when a new user signs up |
| Password Reset | `password-reset-email.html` | Sent when user requests password reset |

## Setup Instructions

### Configuring in Supabase Dashboard

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **Email Templates**
4. For each template type:
   - Select the template (e.g., "Confirm signup")
   - Copy the contents of the corresponding HTML file
   - Paste into the "Body" field
   - Set the Subject line (e.g., "Verify your email - Lucyn")
   - Click **Save**

### Template Variables

Supabase provides these variables for use in templates:

| Variable | Description |
|----------|-------------|
| `{{ .ConfirmationURL }}` | The email verification link |
| `{{ .Token }}` | The verification token (if needed separately) |
| `{{ .TokenHash }}` | Hashed version of the token |
| `{{ .SiteURL }}` | Your configured site URL |
| `{{ .Email }}` | The user's email address |

### Recommended Subject Lines

- **Email Verification**: "Verify your email address - Lucyn"
- **Password Reset**: "Reset your password - Lucyn"
- **Magic Link**: "Your login link - Lucyn"
- **Email Change**: "Confirm your new email - Lucyn"

## Design System

These templates follow Lucyn's dark theme design system:

- **Primary Color**: `#6366f1` (Indigo)
- **Background**: `#0a0a0a` (Near black)
- **Card Background**: `#18181b` to `#1f1f23` (Dark zinc gradient)
- **Text Primary**: `#ffffff`
- **Text Secondary**: `#a1a1aa`
- **Text Muted**: `#71717a`
- **Border**: `#27272a`

## Testing Emails

To test your email templates:

1. **Supabase Testing**: Use the "Send test email" feature in the Supabase dashboard
2. **Local Development**: Set up a tool like [Mailhog](https://github.com/mailhog/MailHog) or use services like [Mailtrap](https://mailtrap.io/)
3. **Litmus/Email on Acid**: For cross-client compatibility testing

## Email Client Compatibility

These templates are tested and optimized for:

- ✅ Gmail (Web & Mobile)
- ✅ Apple Mail (macOS & iOS)
- ✅ Outlook (Web, Desktop & Mobile)
- ✅ Yahoo Mail
- ✅ Samsung Email

### Key Compatibility Features

- Inline CSS for maximum compatibility
- MSO conditional comments for Outlook
- Fallback fonts
- Mobile-responsive design with media queries
- Preheader text for better preview
