import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Mock insights
const mockInsights = [
  {
    id: '1',
    type: 'velocity',
    severity: 'info',
    title: 'Velocity increased by 15% this sprint',
    description: 'Your team shipped more story points than the previous sprint.',
    recommendation: 'Consider documenting what worked well.',
    createdAt: new Date().toISOString(),
    isRead: false,
    isDismissed: false,
  },
  {
    id: '2',
    type: 'risk',
    severity: 'warning',
    title: 'Potential burnout risk detected',
    description: 'Alex has been working outside normal hours for 2 weeks.',
    recommendation: 'Consider redistributing tasks.',
    createdAt: new Date().toISOString(),
    isRead: false,
    isDismissed: false,
  },
];

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // TODO: Fetch real insights from database
    // const insights = await prisma.insight.findMany({
    //   where: { organizationId: session.user.user_metadata.organization_id },
    //   orderBy: { createdAt: 'desc' },
    // });

    return NextResponse.json({
      success: true,
      data: {
        items: mockInsights,
        total: mockInsights.length,
      },
    });
  } catch (error) {
    console.error('Insights error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
