import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Mock data
const mockDevelopers = [
  {
    id: '1',
    name: 'Alex Johnson',
    email: 'alex@company.com',
    role: 'Senior Engineer',
    avatarUrl: null,
    githubUsername: 'alexj',
    stats: { commits: 45, prs: 12, reviews: 28 },
    workload: 85,
    status: 'overloaded',
    skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL'],
    profile: {
      codeQualityScore: 8.5,
      velocityScore: 9.0,
      collaborationScore: 7.5,
      strengths: ['Fast delivery', 'Clean code'],
      areasForGrowth: ['Code reviews', 'Documentation'],
    },
  },
  {
    id: '2',
    name: 'Sarah Chen',
    email: 'sarah@company.com',
    role: 'Engineer',
    avatarUrl: null,
    githubUsername: 'sarahc',
    stats: { commits: 32, prs: 8, reviews: 15 },
    workload: 60,
    status: 'balanced',
    skills: ['Python', 'Django', 'PostgreSQL', 'Redis'],
    profile: {
      codeQualityScore: 8.0,
      velocityScore: 7.5,
      collaborationScore: 8.5,
      strengths: ['Backend architecture', 'Helpful reviews'],
      areasForGrowth: ['Frontend skills'],
    },
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

    // TODO: Fetch real data from database
    // const developers = await prisma.user.findMany({
    //   where: { organizationId: session.user.user_metadata.organization_id },
    //   include: { profile: true },
    // });

    return NextResponse.json({
      success: true,
      data: {
        items: mockDevelopers,
        total: mockDevelopers.length,
      },
    });
  } catch (error) {
    console.error('Developers list error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
