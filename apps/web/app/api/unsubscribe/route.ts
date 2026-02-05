import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyUnsubscribeToken } from '@/lib/unsubscribe-token';
import { rateLimit } from '@/lib/redis';

/**
 * Get client IP address from request headers
 */
function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
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
