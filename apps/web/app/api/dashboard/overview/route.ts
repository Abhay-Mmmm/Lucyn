import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Mock data for now - will be replaced with real database queries
const mockOverview = {
  healthScore: 78,
  healthTrend: 'improving' as const,
  highlights: [
    'PR velocity increased by 15% this sprint',
    'Code review turnaround improved to 4 hours',
    'Zero critical bugs in production this week',
  ],
  concerns: [
    'One team member showing signs of burnout',
    'Technical debt in auth module increasing',
  ],
  velocity: {
    prsPerWeek: { current: 24, previous: 21, trend: 14 },
    commitsPerDay: { current: 22, previous: 25, trend: -12 },
    avgMergeTime: { current: 4.2, previous: 5.1, trend: -18 },
    reviewTurnaround: { current: 4, previous: 8, trend: -50 },
  },
  team: {
    total: 8,
    active: 7,
    balanced: 5,
    overloaded: 1,
    underutilized: 1,
  },
  recentActivity: [
    { type: 'pr_merged', user: 'alex', repo: 'frontend', title: 'Add user settings page', time: '2 hours ago' },
    { type: 'commit', user: 'sarah', repo: 'api', title: 'Fix auth token refresh', time: '3 hours ago' },
    { type: 'review', user: 'mike', repo: 'frontend', title: 'Reviewed: Dashboard charts', time: '4 hours ago' },
    { type: 'pr_opened', user: 'emily', repo: 'api', title: 'Add rate limiting', time: '5 hours ago' },
  ],
};

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

    // TODO: Fetch real data from database based on user's organization
    // const orgId = session.user.user_metadata.organization_id;
    // const data = await prisma.organization.findUnique({ where: { id: orgId }, include: { ... } });

    return NextResponse.json({
      success: true,
      data: mockOverview,
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
