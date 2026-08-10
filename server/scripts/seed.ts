import { prisma } from '../src/config/database';

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clean existing data in order due to foreign key constraints
  console.log('Wiping existing data...');
  await prisma.roadmapStep.deleteMany();
  await prisma.roadmap.deleteMany();
  await prisma.project.deleteMany();
  await prisma.userSkill.deleteMany();
  await prisma.skillRequirement.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.careerPath.deleteMany();
  await prisma.careerInterest.deleteMany();
  await prisma.careerGoal.deleteMany();
  await prisma.education.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  // 2. Seed Skills
  console.log('Seeding skills...');
  const skillHtmlCss = await prisma.skill.create({
    data: { name: 'HTML & CSS', category: 'FRONTEND' }
  });
  const skillJs = await prisma.skill.create({
    data: { name: 'JavaScript', category: 'FRONTEND' }
  });
  const skillReact = await prisma.skill.create({
    data: { name: 'React', category: 'FRONTEND' }
  });
  const skillTailwind = await prisma.skill.create({
    data: { name: 'Tailwind CSS', category: 'FRONTEND' }
  });
  const skillNode = await prisma.skill.create({
    data: { name: 'Node.js', category: 'BACKEND' }
  });
  const skillExpress = await prisma.skill.create({
    data: { name: 'Express', category: 'BACKEND' }
  });
  const skillPostgres = await prisma.skill.create({
    data: { name: 'PostgreSQL', category: 'BACKEND' }
  });
  const skillDocker = await prisma.skill.create({
    data: { name: 'Docker', category: 'DEVOPS' }
  });
  const skillSystemDesign = await prisma.skill.create({
    data: { name: 'System Design', category: 'SYSTEM' }
  });

  // 3. Seed Career Paths
  console.log('Seeding career paths...');
  const pathFrontend = await prisma.careerPath.create({
    data: {
      title: 'Frontend Developer',
      description: 'Specializes in crafting responsive, high-fidelity user interfaces and web applications.',
      industry: 'Tech',
    }
  });
  const pathBackend = await prisma.careerPath.create({
    data: {
      title: 'Backend Developer',
      description: 'Specializes in constructing scalable application programming interfaces (APIs), database systems, and server architecture.',
      industry: 'Tech',
    }
  });
  const pathFullStack = await prisma.careerPath.create({
    data: {
      title: 'Full Stack Engineer',
      description: 'Capable of handling both user-facing interface development and back-end logic integrations.',
      industry: 'Tech',
    }
  });

  // 4. Connect Career Paths to Skills (Requirements)
  console.log('Seeding skill requirements...');
  // Frontend Path Requirements
  await prisma.skillRequirement.createMany({
    data: [
      { careerPathId: pathFrontend.id, skillId: skillHtmlCss.id, targetLevel: 8, isCore: true },
      { careerPathId: pathFrontend.id, skillId: skillJs.id, targetLevel: 8, isCore: true },
      { careerPathId: pathFrontend.id, skillId: skillReact.id, targetLevel: 7, isCore: true },
      { careerPathId: pathFrontend.id, skillId: skillTailwind.id, targetLevel: 6, isCore: false },
    ]
  });

  // Backend Path Requirements
  await prisma.skillRequirement.createMany({
    data: [
      { careerPathId: pathBackend.id, skillId: skillNode.id, targetLevel: 8, isCore: true },
      { careerPathId: pathBackend.id, skillId: skillExpress.id, targetLevel: 7, isCore: true },
      { careerPathId: pathBackend.id, skillId: skillPostgres.id, targetLevel: 8, isCore: true },
      { careerPathId: pathBackend.id, skillId: skillDocker.id, targetLevel: 6, isCore: false },
    ]
  });

  // Full Stack Path Requirements
  await prisma.skillRequirement.createMany({
    data: [
      { careerPathId: pathFullStack.id, skillId: skillReact.id, targetLevel: 7, isCore: true },
      { careerPathId: pathFullStack.id, skillId: skillNode.id, targetLevel: 7, isCore: true },
      { careerPathId: pathFullStack.id, skillId: skillPostgres.id, targetLevel: 7, isCore: true },
      { careerPathId: pathFullStack.id, skillId: skillSystemDesign.id, targetLevel: 6, isCore: false },
    ]
  });

  // 5. Seed development user
  console.log('Seeding development user...');
  const devUser = await prisma.user.create({
    data: {
      email: 'dev@careeros.app',
      passwordHash: 'seeded_dummy_hash_do_not_use',
      role: 'STUDENT',
      isVerified: true,
      profile: {
        create: {
          firstName: 'Demo',
          lastName: 'Student',
          college: 'Global Institute of Technology',
          branch: 'Computer Science',
          graduationYear: 2026,
          currentYear: 3,
          semester: 5,
          cgpa: 3.8,
          location: 'San Francisco, CA',
          headline: 'Aspiring Full Stack Engineer',
          bio: 'Passionate computer science student seeking to build innovative web and cloud applications.',
          currentStatus: 'Looking for summer 2026 internships',
          careerGoals: {
            create: [
              {
                title: 'Become a Backend Engineer',
                status: 'ACTIVE',
              },
            ],
          },
          careerInterests: {
            create: [
              {
                industry: 'Tech',
                role: 'Backend Developer',
              },
            ],
          },
        },
      },
    },
    include: {
      profile: true,
    }
  });

  // 6. Seed some User Skills for the demo user
  console.log('Seeding user skills...');
  const profileId = devUser.profile!.id;
  await prisma.userSkill.createMany({
    data: [
      { profileId, skillId: skillHtmlCss.id, currentLevel: 5, confidence: 6, source: 'MANUAL' },
      { profileId, skillId: skillJs.id, currentLevel: 4, confidence: 5, source: 'MANUAL' },
    ]
  });

  console.log(`✅ Created Demo User: ${devUser.email}`);
  console.log('✅ Seeding finished.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
