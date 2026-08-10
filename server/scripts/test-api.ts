async function runTests() {
  const baseUrl = 'http://localhost:3000/api/v1';
  console.log('🧪 Starting API Verification Tests...');

  const uniqueId = Date.now();
  const testUser = {
    email: `api_test_${uniqueId}@careeros.app`,
    password: 'Password123!',
    firstName: 'API',
    lastName: 'Tester'
  };

  let token = '';
  let cookieHeader = '';

  // 1. Register User
  console.log('\n1. Registering a new user...');
  const regRes = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testUser)
  });
  
  if (!regRes.ok) {
    console.error('❌ Registration failed:', await regRes.text());
    process.exit(1);
  }
  console.log('✅ User registered successfully!');

  // Extract cookies for authentication (express-session / jwt cookies)
  const setCookie = regRes.headers.get('set-cookie');
  if (setCookie) {
    cookieHeader = setCookie.split(';')[0];
  }

  // 2. Fetch User Profile
  console.log('\n2. Fetching user profile...');
  const meRes = await fetch(`${baseUrl}/auth/me`, {
    headers: { 'Cookie': cookieHeader }
  });
  if (!meRes.ok) {
    console.error('❌ Fetching profile failed:', await meRes.text());
    process.exit(1);
  }
  const meData = await meRes.json();
  console.log('✅ Profile fetched! User email:', meData.data.user.email);

  // 3. Get Career Paths
  console.log('\n3. Fetching career paths...');
  const pathsRes = await fetch(`${baseUrl}/roadmap/career-paths`, {
    headers: { 'Cookie': cookieHeader }
  });
  if (!pathsRes.ok) {
    console.error('❌ Fetching career paths failed:', await pathsRes.text());
    process.exit(1);
  }
  const pathsData = await pathsRes.json();
  const paths = pathsData.data;
  console.log(`✅ Career paths fetched: ${paths.length} found.`);
  paths.forEach((p: any) => console.log(`   - ${p.title} (${p.id})`));

  if (paths.length === 0) {
    console.error('❌ No career paths found in database. Seed did not run?');
    process.exit(1);
  }
  const targetPath = paths[0];

  // 4. Generate Roadmap
  console.log(`\n4. Generating roadmap for: ${targetPath.title}...`);
  const genRes = await fetch(`${baseUrl}/roadmap/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookieHeader
    },
    body: JSON.stringify({ careerPathId: targetPath.id })
  });
  if (!genRes.ok) {
    console.error('❌ Roadmap generation failed:', await genRes.text());
    process.exit(1);
  }
  const genData = await genRes.json();
  const roadmap = genData.data;
  console.log(`✅ Roadmap generated successfully! ID: ${roadmap.id}, Steps count: ${roadmap.steps.length}`);

  // 5. Get User Skills & Gaps
  console.log('\n5. Fetching skills list...');
  const skillsRes = await fetch(`${baseUrl}/skills/my-skills`, {
    headers: { 'Cookie': cookieHeader }
  });
  if (!skillsRes.ok) {
    console.error('❌ Fetching skills failed:', await skillsRes.text());
    process.exit(1);
  }
  const skillsData = await skillsRes.json();
  console.log(`✅ Skills fetched: ${skillsData.data.length} found.`);

  // 6. Add Project (ATS Calculation test)
  console.log('\n6. Creating a new project...');
  const projectPayload = {
    title: 'E-Commerce Backend API',
    description: 'REST API built with Node.js, Express, and PostgreSQL with complete checkout and inventory features.',
    tech: ['Node.js', 'Express', 'PostgreSQL'],
    githubUrl: 'https://github.com/apitester/ecommerce',
    liveUrl: 'https://ecommerce.api.example.com'
  };
  const projCreateRes = await fetch(`${baseUrl}/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookieHeader
    },
    body: JSON.stringify(projectPayload)
  });
  if (!projCreateRes.ok) {
    console.error('❌ Project creation failed:', await projCreateRes.text());
    process.exit(1);
  }
  const projCreateData = await projCreateRes.json();
  const createdProject = projCreateData.data;
  console.log(`✅ Project created successfully! Title: ${createdProject.title}, ID: ${createdProject.id}, Match Score: ${createdProject.matchScore}%`);

  // 7. Get Projects list
  console.log('\n7. Fetching project list...');
  const listProjsRes = await fetch(`${baseUrl}/projects`, {
    headers: { 'Cookie': cookieHeader }
  });
  if (!listProjsRes.ok) {
    console.error('❌ Fetching projects failed:', await listProjsRes.text());
    process.exit(1);
  }
  const listProjsData = await listProjsRes.json();
  console.log(`✅ Project list fetched: ${listProjsData.data.length} projects found.`);

  // 8. Delete Project
  console.log(`\n8. Deleting project: ${createdProject.id}...`);
  const delProjRes = await fetch(`${baseUrl}/projects/${createdProject.id}`, {
    method: 'DELETE',
    headers: { 'Cookie': cookieHeader }
  });
  if (!delProjRes.ok) {
    console.error('❌ Project deletion failed:', await delProjRes.text());
    process.exit(1);
  }
  console.log('✅ Project deleted successfully!');

  // 9. Update Profile Fields
  console.log('\n9. Updating profile fields...');
  const profilePayload = {
    headline: 'Aspiring Backend Developer | Node.js & Databases',
    bio: 'Love building high-throughput services and relational database structures.',
    currentStatus: 'Ready for full-time backend roles',
    location: 'Austin, TX',
    college: 'University of Texas',
    branch: 'Computer Science',
    graduationYear: 2026,
    currentYear: 4,
    semester: 8,
    cgpa: 9.2
  };
  const profUpdateRes = await fetch(`${baseUrl}/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookieHeader
    },
    body: JSON.stringify(profilePayload)
  });
  if (!profUpdateRes.ok) {
    console.error('❌ Profile update failed:', await profUpdateRes.text());
    process.exit(1);
  }
  const profUpdateData = await profUpdateRes.json();
  const updatedProfile = profUpdateData.data;
  console.log('✅ Profile updated successfully!');
  console.log(`   - Headline: ${updatedProfile.headline}`);
  console.log(`   - Bio: ${updatedProfile.bio}`);
  console.log(`   - College: ${updatedProfile.college}`);

  // 10. Delete Roadmap (Testing cleanup)
  console.log(`\n10. Deleting roadmap: ${roadmap.id}...`);
  const delRoadmapRes = await fetch(`${baseUrl}/roadmap/${roadmap.id}`, {
    method: 'DELETE',
    headers: { 'Cookie': cookieHeader }
  });
  if (!delRoadmapRes.ok) {
    console.error('❌ Roadmap deletion failed:', await delRoadmapRes.text());
    process.exit(1);
  }
  console.log('✅ Roadmap deleted successfully!');

  // 11. Fetch All Skills & Generate Custom Career Path
  console.log('\n11. Fetching all available skills from DB...');
  const allSkillsRes = await fetch(`${baseUrl}/skills/list`, {
    headers: { 'Cookie': cookieHeader }
  });
  if (!allSkillsRes.ok) {
    console.error('❌ Fetching all skills list failed:', await allSkillsRes.text());
    process.exit(1);
  }
  const allSkillsData = await allSkillsRes.json();
  const dbSkills = allSkillsData.data;
  console.log(`✅ Available skills count: ${dbSkills.length}`);
  
  if (dbSkills.length > 0) {
    const testSkill = dbSkills[0];
    console.log(`\n12. Creating a Custom Career Path using skill: ${testSkill.name}...`);
    const customPathPayload = {
      title: `Custom Security Engineer_${uniqueId}`,
      description: 'Custom path focusing on security and backend systems.',
      industry: 'Cybersecurity',
      skills: [
        { skillId: testSkill.id, targetLevel: 8 }
      ]
    };
    
    const createPathRes = await fetch(`${baseUrl}/roadmap/career-paths`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader
      },
      body: JSON.stringify(customPathPayload)
    });
    
    if (!createPathRes.ok) {
      console.error('❌ Custom Career Path creation failed:', await createPathRes.text());
      process.exit(1);
    }
    const createPathData = await createPathRes.json();
    const customPath = createPathData.data;
    console.log(`✅ Custom Career Path created! ID: ${customPath.id}, Title: ${customPath.title}`);

    // Generate roadmap for custom path
    console.log(`\n13. Generating roadmap for custom path: ${customPath.title}...`);
    const genCustomRoadmapRes = await fetch(`${baseUrl}/roadmap/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader
      },
      body: JSON.stringify({ careerPathId: customPath.id })
    });
    if (!genCustomRoadmapRes.ok) {
      console.error('❌ Custom Roadmap generation failed:', await genCustomRoadmapRes.text());
      process.exit(1);
    }
    const genCustomRoadmapData = await genCustomRoadmapRes.json();
    console.log(`✅ Custom Roadmap generated! ID: ${genCustomRoadmapData.data.id}, Steps: ${genCustomRoadmapData.data.steps.length}`);
  }

  // 14. Connect Coding Profile
  console.log('\n14. Connecting a coding profile (LEETCODE)...');
  const connProfilePayload = {
    platform: 'LEETCODE',
    username: `api_test_coder_${uniqueId}`
  };
  const connProfileRes = await fetch(`${baseUrl}/coding-profiles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookieHeader
    },
    body: JSON.stringify(connProfilePayload)
  });
  if (!connProfileRes.ok) {
    console.error('❌ Coding profile connection failed:', await connProfileRes.text());
    process.exit(1);
  }
  const connProfileData = await connProfileRes.json();
  const codingProfile = connProfileData.data;
  console.log(`✅ Coding profile connected! Platform: ${codingProfile.platform}, Username: ${codingProfile.username}, Solved: ${codingProfile.solved}`);

  // 15. Fetch Coding Profiles list
  console.log('\n15. Fetching connected coding profiles list...');
  const listConnRes = await fetch(`${baseUrl}/coding-profiles`, {
    headers: { 'Cookie': cookieHeader }
  });
  if (!listConnRes.ok) {
    console.error('❌ Fetching coding profiles failed:', await listConnRes.text());
    process.exit(1);
  }
  const listConnData = await listConnRes.json();
  console.log(`✅ Connected coding profiles count: ${listConnData.data.length}`);

  // 16. Disconnect Coding Profile
  console.log(`\n16. Disconnecting coding profile: ${codingProfile.id}...`);
  const disConnRes = await fetch(`${baseUrl}/coding-profiles/${codingProfile.id}`, {
    method: 'DELETE',
    headers: { 'Cookie': cookieHeader }
  });
  if (!disConnRes.ok) {
    console.error('❌ Disconnecting coding profile failed:', await disConnRes.text());
    process.exit(1);
  }
  console.log('✅ Coding profile disconnected successfully!');

  console.log('\n🎉 ALL API TESTS COMPLETED SUCCESSFULLY! 🎉');
}

runTests().catch(err => {
  console.error('Test run error:', err);
  process.exit(1);
});
