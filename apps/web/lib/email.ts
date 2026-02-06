import 'server-only';
import { Resend } from 'resend';

// ============================================
// RESEND EMAIL CLIENT
// ============================================

if (!process.env.RESEND_API_KEY && process.env.NODE_ENV !== 'development') {
  throw new Error(
    'Missing RESEND_API_KEY environment variable. ' +
    'Get your API key from https://resend.com/api-keys'
  );
}

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : (null as unknown as Resend); // dev fallback — email sending is bypassed

// Sender address — must be a verified domain in Resend
const FROM_EMAIL = process.env.EMAIL_FROM || 'Lucyn <noreply@lucyn.dev>';

// ============================================
// TYPES
// ============================================

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// ============================================
// SEND EMAIL
// ============================================

/**
 * Send a transactional email via Resend.
 * 
 * @param options - Email options (to, subject, html, optional text)
 * @returns Result with success status and message ID
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    if (error) {
      console.error('Resend email error:', {
        error: error.message,
        to: options.to.substring(0, 3) + '***', // redact for logs
      });
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Failed to send email:', {
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}

// ============================================
// EMAIL TEMPLATES
// ============================================

/**
 * Build the verification email HTML using the existing branded template.
 * Replaces the Supabase template variables with actual values.
 */
export function buildVerificationEmailHtml(verificationUrl: string, siteUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Verify Your Email - Lucyn</title>
  <style>
    body, table, td, p, a, li, blockquote {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    body {
      height: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
    }
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; margin: auto !important; }
      .mobile-padding { padding-left: 24px !important; padding-right: 24px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: Georgia, 'Times New Roman', serif;">
  <div style="display: none; font-size: 1px; color: #0a0a0a; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    Verify your email address to get started with Lucyn.
  </div>
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 40px 10px;">
        <table role="presentation" class="email-container" cellspacing="0" cellpadding="0" border="0" width="580" style="margin: auto;">
          <tr>
            <td align="center" style="padding: 20px 0 40px 0;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="font-size: 32px; font-weight: 600; color: #ffffff; letter-spacing: -1px;">
                    Lucyn<span style="color: #6366f1;">.</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td class="mobile-padding" style="background: linear-gradient(145deg, #18181b 0%, #1f1f23 100%); border-radius: 16px; border: 1px solid #27272a; padding: 48px 40px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 24px;">
                    <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 16px; display: inline-block; text-align: center; line-height: 64px;">
                      <span style="font-size: 28px;">✉️</span>
                    </div>
                  </td>
                </tr>
              </table>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 16px;">
                    <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #ffffff; letter-spacing: -0.5px;">
                      Verify your email address
                    </h1>
                  </td>
                </tr>
              </table>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 32px;">
                    <p style="margin: 0; font-size: 16px; line-height: 26px; color: #a1a1aa;">
                      Thanks for signing up for Lucyn! Please verify your email address to unlock powerful developer insights and team analytics.
                    </p>
                  </td>
                </tr>
              </table>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 32px;">
                    <a href="${verificationUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 16px 48px; border-radius: 12px; box-shadow: 0 4px 14px 0 rgba(99, 102, 241, 0.39);">
                      Verify Email Address
                    </a>
                  </td>
                </tr>
              </table>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding: 24px 0;">
                    <div style="height: 1px; background-color: #27272a;"></div>
                  </td>
                </tr>
              </table>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 12px 0; font-size: 14px; color: #71717a;">
                      If the button doesn't work, copy and paste this link into your browser:
                    </p>
                    <p style="margin: 0; font-size: 13px; color: #6366f1; word-break: break-all;">
                      ${verificationUrl}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 32px 20px 0 20px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: rgba(99, 102, 241, 0.1); border-radius: 12px; border: 1px solid rgba(99, 102, 241, 0.2);">
                <tr>
                  <td class="mobile-padding" style="padding: 20px 24px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td width="40" valign="top">
                          <span style="font-size: 20px;">🔒</span>
                        </td>
                        <td valign="top">
                          <p style="margin: 0; font-size: 14px; line-height: 22px; color: #a1a1aa;">
                            <strong style="color: #e4e4e7;">Security tip:</strong> This link expires in 24 hours. If you didn't request this email, you can safely ignore it.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 40px 20px 0 20px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 16px;">
                    <p style="margin: 0; font-size: 14px; color: #71717a;">
                      Need help? <a href="mailto:support@lucyn.dev" style="color: #6366f1; text-decoration: none;">Contact our support team</a>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom: 16px;">
                    <p style="margin: 0; font-size: 13px; color: #52525b;">
                      &copy; 2026 Lucyn. All rights reserved.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <p style="margin: 0; font-size: 12px; color: #3f3f46;">
                      This is a one-time verification email.<br>
                      <a href="${siteUrl}/privacy" style="color: #52525b; text-decoration: underline;">Privacy Policy</a> &middot;
                      <a href="${siteUrl}/terms" style="color: #52525b; text-decoration: underline;">Terms of Service</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Build plain-text fallback for the verification email
 */
export function buildVerificationEmailText(verificationUrl: string): string {
  return `Verify your email address

Thanks for signing up for Lucyn! Please verify your email address to get started.

Click this link to verify:
${verificationUrl}

This link expires in 24 hours.

If you didn't sign up for Lucyn, you can safely ignore this email.

— The Lucyn Team`;
}
