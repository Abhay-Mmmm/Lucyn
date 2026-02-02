import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create a demo organization
  const org = await prisma.organization.upsert({
    where: { slug: 'demo-org' },
    update: {},
    create: {
      name: 'Demo Organization',
      slug: 'demo-org',
      domain: 'demo.lucyn.dev',
      settings: {
        features: {
          slackIntegration: true,
          githubIntegration: true,
          meetingIntegration: false,
        },
      },
    },
  });

  console.log(`✅ Created organization: ${org.name}`);

  // Create demo users
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@demo.lucyn.dev' },
    update: {},
    create: {
      email: 'admin@demo.lucyn.dev',
      name: 'Demo Admin',
      role: Role.ADMIN,
      organizationId: org.id,
      feedbackEnabled: true,
    },
  });

  const devUser = await prisma.user.upsert({
    where: { email: 'developer@demo.lucyn.dev' },
    update: {},
    create: {
      email: 'developer@demo.lucyn.dev',
      name: 'Demo Developer',
      role: Role.MEMBER,
      organizationId: org.id,
      feedbackEnabled: true,
    },
  });

  console.log(`✅ Created users: ${adminUser.name}, ${devUser.name}`);

  // Create developer profile for the dev user
  await prisma.developerProfile.upsert({
    where: { userId: devUser.id },
    update: {},
    create: {
      userId: devUser.id,
      skills: ['TypeScript', 'React', 'Node.js'],
      strengths: ['Frontend development', 'Code reviews'],
      areasForGrowth: ['Backend optimization', 'Testing'],
      preferredLanguages: ['TypeScript', 'JavaScript'],
      codeQualityScore: 7.5,
      velocityScore: 8.0,
      collaborationScore: 8.5,
    },
  });

  console.log('✅ Created developer profile');

  // Create a sample insight
  await prisma.insight.create({
    data: {
      organizationId: org.id,
      type: 'VELOCITY',
      severity: 'INFO',
      title: 'Welcome to Lucyn!',
      description: 'Your AI Product Engineer is ready to help. Connect your GitHub and Slack to get started.',
      recommendation: 'Visit Settings to connect your integrations.',
    },
  });

  console.log('✅ Created sample insight');

  console.log('🎉 Database seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
