import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyUnsubscribeToken } from '@/lib/unsubscribe-token';
import { rateLimit } from '@/lib/redis';

/**
 * List of trusted proxy IPs that are allowed to set X-Forwarded-For.
 * Configure this based on your infrastructure (e.g., load balancer IPs).
 * 
 * IMPORTANT: Your infrastructure must be configured to OVERWRITE (not append to)
 * the X-Forwarded-For header at the edge proxy/load balancer to prevent spoofing.
 */
const TRUSTED_PROXY_IPS = new Set(
  (process.env.TRUSTED_PROXY_IPS || '').split(',').filter(Boolean).map(ip => ip.trim())
);

/**
 * Get client IP address from request headers.
 * 
 * Security notes:
 * - X-Forwarded-For can be spoofed if not properly handled by infrastructure
 * - We use the RIGHTMOST IP in XFF when behind a known load balancer, as this
 *   is typically the IP added by the trusted edge proxy
 * - Falls back to x-real-ip or 'unknown' if XFF is not available/trusted
 * 
 * @param request - The incoming request
 * @returns The client IP address or 'unknown'
 */
function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  if (forwarded) {
    const ips = forwarded.split(',').map(ip => ip.trim());
    
    // If we have trusted proxies configured, use the rightmost IP
    // (the one added by our trusted edge proxy)
    if (TRUSTED_PROXY_IPS.size > 0) {
      // In a properly configured setup, the rightmost IP is added by our
      // trusted load balancer and represents the actual client IP
      const clientIp = ips[ips.length - 1];
      if (clientIp) {
        return clientIp;
      }
    } else {
      // No trusted proxies configured - use leftmost IP with caution
      // Warning: This can be spoofed if XFF is not overwritten at edge
      const clientIp = ips[0];
      if (clientIp) {
        return clientIp;
      }
    }
  }
  
  // Fallback to x-real-ip (typically set by nginx)
  if (realIp) {
    return realIp.trim();
  }
  
  return 'unknown';
}

export async function POST(request: Request) {
  try {
    // Extract token from body or query params
    const url = new URL(request.url);
    let token = url.searchParams.get('token');
    
    // If not in query, try body
    if (!token) {
      let body;
      try {
        body = await request.json();
      } catch (error) {
        if (error instanceof SyntaxError) {
          return NextResponse.json(
            { error: 'Invalid JSON in request body' },
            { status: 400 }
          );
        }
        throw error;
      }
      
      token = body.token;
    }

    // Validate token presence
    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Unsubscribe token is required' },
        { status: 400 }
      );
    }

    // Rate limiting by IP address (5 requests per 60 seconds per IP)
    const clientIp = getClientIp(request);
    const rateLimitResult = await rateLimit(`unsubscribe:${clientIp}`, 5, 60);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Verify token and extract email
    let email: string;
    try {
      const payload = verifyUnsubscribeToken(token);
      email = payload.email;
    } catch (error) {
      // Return 401 for invalid/expired tokens
      const message = error instanceof Error ? error.message : 'Invalid token';
      return NextResponse.json(
        { error: message },
        { status: 401 }
      );
    }

    // Find user by verified email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return success even if user not found (privacy - don't leak email existence)
      return NextResponse.json({ success: true });
    }

    // Update user to disable email notifications
    await prisma.user.update({
      where: { id: user.id },
      data: {
        feedbackEnabled: false,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
