/**
 * Email utilities for generating unsubscribe links
 * 
 * Use these helpers when sending notification emails to include
 * secure unsubscribe links with signed tokens.
 */

import { generateUnsubscribeToken } from './unsubscribe-token';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * Generate a secure unsubscribe URL for a given email address
 * 
 * @param email - The user's email address
 * @returns A complete unsubscribe URL with signed token
 * 
 * @example
 * ```typescript
 * const url = getUnsubscribeUrl('user@example.com');
 * // Returns: https://lucyn.app/unsubscribe?token=eyJlbWFpb...
 * ```
 */
export function getUnsubscribeUrl(email: string): string {
  const token = generateUnsubscribeToken(email);
  return `${APP_URL}/unsubscribe?token=${encodeURIComponent(token)}`;
}

/**
 * Add unsubscribe footer to email HTML
 * 
 * @param htmlContent - The main email HTML content
 * @param email - The recipient's email address
 * @returns HTML with unsubscribe footer appended
 * 
 * @example
 * ```typescript
 * const emailHtml = '<h1>Weekly Summary</h1><p>Here are your insights...</p>';
 * const withFooter = addUnsubscribeFooter(emailHtml, 'user@example.com');
 * ```
 */
export function addUnsubscribeFooter(htmlContent: string, email: string): string {
  const unsubscribeUrl = getUnsubscribeUrl(email);
  
  const footer = `
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
      <p style="margin: 0 0 8px 0;">
        You're receiving this email because you're a Lucyn user with notifications enabled.
      </p>
      <p style="margin: 0;">
        <a href="${unsubscribeUrl}" style="color: #6b7280; text-decoration: underline;">
          Unsubscribe from these emails
        </a>
      </p>
    </div>
  `;
  
  return htmlContent + footer;
}

/**
 * Add unsubscribe footer to plain text email
 * 
 * @param textContent - The main email text content
 * @param email - The recipient's email address
 * @returns Text with unsubscribe footer appended
 * 
 * @example
 * ```typescript
 * const emailText = 'Weekly Summary\n\nHere are your insights...';
 * const withFooter = addUnsubscribeFooterText(emailText, 'user@example.com');
 * ```
 */
export function addUnsubscribeFooterText(textContent: string, email: string): string {
  const unsubscribeUrl = getUnsubscribeUrl(email);
  
  const footer = `

────────────────────────────────────────

You're receiving this email because you're a Lucyn user with notifications enabled.

Unsubscribe: ${unsubscribeUrl}
`;
  
  return textContent + footer;
}

/**
 * Email template data with unsubscribe link
 * Use this type when building email templates that need unsubscribe functionality
 */
export interface EmailTemplateData {
  unsubscribeUrl: string;
  [key: string]: unknown;
}

/**
 * Prepare email template data with unsubscribe URL
 * 
 * @param email - The recipient's email address
 * @param additionalData - Any additional template variables
 * @returns Template data object with unsubscribeUrl included
 * 
 * @example
 * ```typescript
 * const templateData = prepareEmailData('user@example.com', {
 *   userName: 'John Doe',
 *   weeklyStats: { commits: 42, prs: 7 }
 * });
 * 
 * // Use in template:
 * // <a href="{{unsubscribeUrl}}">Unsubscribe</a>
 * ```
 */
export function prepareEmailData(
  email: string,
  additionalData: Record<string, unknown> = {}
): EmailTemplateData {
  return {
    unsubscribeUrl: getUnsubscribeUrl(email),
    ...additionalData,
  };
}
