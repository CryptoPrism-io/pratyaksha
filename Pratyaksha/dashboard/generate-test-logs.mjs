#!/usr/bin/env node

/**
 * Generate 50 unique, realistic journal entries for test users
 * All users have 100% profile completion (Soul Mapping + Blueprint + Onboarding)
 */

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api';

// 50 diverse journal entries mapped to realistic user personas
const JOURNAL_ENTRIES = [
  // Sarah Martinez (PM at Startup) - 8 entries
  {
    user: 'sarah.martinez@example.com',
    text: "Had a tough sprint planning meeting today. The engineering team pushed back on the timeline I proposed for the new feature. Part of me feels like I'm not technical enough to lead this, but I also know I've successfully shipped 3 products before. Need to trust my experience more.",
    type: 'Work'
  },
  {
    user: 'sarah.martinez@example.com',
    text: "Managed to leave work by 6pm today! First time this week. Had dinner with the family and actually felt present. This is what work-life balance is supposed to feel like. Small win, but it matters.",
    type: 'Reflection'
  },
  {
    user: 'sarah.martinez@example.com',
    text: "User feedback from beta is pouring in and it's mostly positive. One user said our app 'changed how they work.' That's exactly the impact I wanted. Feeling energized and proud of the team.",
    type: 'Emotional'
  },
  {
    user: 'sarah.martinez@example.com',
    text: "Set a boundary today - told my boss I can't take on the additional project right now. He respected it. Why do I always expect pushback when I advocate for myself? Need to remember this feeling next time.",
    type: 'Cognitive'
  },
  {
    user: 'sarah.martinez@example.com',
    text: "Imposter syndrome hitting hard today. Got promoted to Senior PM and now I'm terrified everyone will realize I don't know what I'm doing. Logically I know this is irrational - I earned this - but the feeling is so strong.",
    type: 'Emotional'
  },
  {
    user: 'sarah.martinez@example.com',
    text: "Weekly 1-on-1 with my direct report went really well. She opened up about struggling with work-life balance. Shared what's been working for me - setting firm boundaries, blocking family time on calendar. Feels good to mentor someone through this.",
    type: 'Work'
  },
  {
    user: 'sarah.martinez@example.com',
    text: "Product launch is in 2 weeks and I'm feeling the pressure. Can't sleep, constantly checking Slack. This is exactly the burnout pattern I want to avoid. Need to course-correct before I spiral.",
    type: 'Reflection'
  },
  {
    user: 'sarah.martinez@example.com',
    text: "Celebrated 1 year at the startup today. Reflected on how much I've grown as a leader. Built a product from 0 to 50K users. Led a team of 8. And I'm still here - not burned out, not cynical. That's success.",
    type: 'Reflection'
  },

  // Alex Chen (Software Engineer) - 6 entries
  {
    user: 'alex.chen@example.com',
    text: "Spent 4 hours debugging a memory leak today. Finally found it - one line of code causing the whole service to crash. Frustrating but satisfying once solved. This is why I love engineering.",
    type: 'Work'
  },
  {
    user: 'alex.chen@example.com',
    text: "Anxiety is creeping up again. Too many deadlines, not enough time. Started using the Pomodoro technique today - 25 min focus, 5 min break. Helped a bit. Need to be more consistent with stress management techniques.",
    type: 'Cognitive'
  },
  {
    user: 'alex.chen@example.com',
    text: "Code review feedback was harsh today. Felt defensive at first but after reading it again, the senior engineer is right - my approach was overly complex. Learning to take feedback less personally.",
    type: 'Work'
  },
  {
    user: 'alex.chen@example.com',
    text: "Finished the authentication module ahead of schedule. Team lead gave me positive feedback in standup. Feels good to be recognized for quality work, not just speed.",
    type: 'Emotional'
  },
  {
    user: 'alex.chen@example.com',
    text: "Stress levels through the roof. Three production bugs, one high-priority feature, and performance reviews next week. Need to break this down into smaller tasks instead of feeling overwhelmed by everything at once.",
    type: 'Reflection'
  },
  {
    user: 'alex.chen@example.com',
    text: "Mentored a junior developer today on async programming. Explaining concepts to someone else helped me understand them better too. Maybe I should do more teaching.",
    type: 'Work'
  },

  // Jordan Lee (Marketing Director) - 6 entries
  {
    user: 'jordan.lee@example.com',
    text: "Another 10-hour day in a corporate job I hate. Keep thinking about what my consulting business would look like. Freedom to choose clients, work from anywhere, focus on strategy I actually believe in. But the stability here is hard to leave.",
    type: 'Reflection'
  },
  {
    user: 'jordan.lee@example.com',
    text: "Campaign launched today and the client is thrilled. But I feel nothing. Used to love this work - the creative strategy, the execution. Now it's just... draining. This corporate grind is killing my passion.",
    type: 'Emotional'
  },
  {
    user: 'jordan.lee@example.com',
    text: "Had coffee with a friend who runs her own consultancy. She's making it work - good income, flexible schedule, time with her kids. She said 'the hardest part was deciding to leave.' Maybe that's what I need to hear.",
    type: 'Cognitive'
  },
  {
    user: 'jordan.lee@example.com',
    text: "Extreme stress today. Presenting to the C-suite tomorrow and I'm not confident in the strategy. Also, kids are sick and I had to work late instead of being home. This is exactly what I want to avoid - sacrificing family for a job that doesn't fulfill me.",
    type: 'Work'
  },
  {
    user: 'jordan.lee@example.com',
    text: "Started sketching out a business plan for my consultancy during lunch. Services I'd offer, target clients, pricing. Felt more alive doing that than I have in months of actual work. That's telling.",
    type: 'Reflection'
  },
  {
    user: 'jordan.lee@example.com',
    text: "Boss asked me to take on another project. Said yes automatically, then immediately regretted it. Why can't I just say no? I don't even want to be here long-term. Need to stop people-pleasing.",
    type: 'Cognitive'
  },

  // Maya Patel (UX Designer) - 6 entries
  {
    user: 'maya.patel@example.com',
    text: "User testing today was amazing. Watching people use the interface I designed and seeing them smile when they discovered a delightful interaction - this is why I became a designer. Pure creative fulfillment.",
    type: 'Emotional'
  },
  {
    user: 'maya.patel@example.com',
    text: "Designer's block today. Stared at Figma for 2 hours and produced nothing. Low stress about it though - I know creativity comes in waves. Going for a walk instead of forcing it.",
    type: 'Cognitive'
  },
  {
    user: 'maya.patel@example.com',
    text: "Portfolio redesign is 60% done. Showcasing projects that demonstrate creative problem-solving, not just pretty screens. Want to attract clients who value thoughtful design, not just aesthetics.",
    type: 'Work'
  },
  {
    user: 'maya.patel@example.com',
    text: "Feedback from the design critique was constructive and inspiring. The team challenged me to push the concept further - make it MORE delightful, more unexpected. Love working with people who elevate my thinking.",
    type: 'Work'
  },
  {
    user: 'maya.patel@example.com',
    text: "Submitted a talk proposal to a design conference about 'Designing for Delight in B2B Products.' If accepted, this would be my first speaking gig. Nervous but excited.",
    type: 'Reflection'
  },
  {
    user: 'maya.patel@example.com',
    text: "Saw a competitor's product today and felt a pang of envy - their design is stunning. But then I remembered: my goal isn't to be the best designer, it's to create work that genuinely delights users. Different measuring stick.",
    type: 'Cognitive'
  },

  // Chris Anderson (Accountant) - 6 entries
  {
    user: 'chris.anderson@example.com',
    text: "Tax season is brutal. Working 12-hour days, barely seeing the family. Stress is at a 5/5. Need this job for financial security but it's taking a toll. When does it get easier?",
    type: 'Work'
  },
  {
    user: 'chris.anderson@example.com',
    text: "Caught an error in a client's books that could have cost them $50K in penalties. They were grateful. Moments like this remind me why precision matters in this work, even when it's tedious.",
    type: 'Reflection'
  },
  {
    user: 'chris.anderson@example.com',
    text: "Financial security for my family is the goal. Paid off another chunk of the mortgage this month. Slow progress but it's progress. Trying to find satisfaction in the practical outcomes, not the work itself.",
    type: 'Cognitive'
  },
  {
    user: 'chris.anderson@example.com',
    text: "Client meeting went poorly. They questioned my recommendation and I took it personally. Need to remember: my job is to give sound advice, not to be liked. Action-focused, not emotional.",
    type: 'Work'
  },
  {
    user: 'chris.anderson@example.com',
    text: "Realized today that I've been doing this for 15 years and I still don't love it. But it provides. And that's what matters for my family's future. Practical over passionate.",
    type: 'Reflection'
  },
  {
    user: 'chris.anderson@example.com',
    text: "Extreme deadline pressure today. Multiple audits due, regulatory changes to incorporate. Can't afford mistakes. This is the stress I deal with for security. Worth it?",
    type: 'Emotional'
  },

  // Riley Thompson (Teacher) - 8 entries
  {
    user: 'riley.thompson@example.com',
    text: "Had a breakthrough moment with a struggling student today. She finally understood the concept she'd been fighting for weeks. The look on her face - pure joy. This is why I teach. This is the impact I want.",
    type: 'Emotional'
  },
  {
    user: 'riley.thompson@example.com',
    text: "Another committee meeting about standardized testing. Administrative work is drowning out the actual teaching. This is what I want to avoid - burning out on bureaucracy instead of focusing on students.",
    type: 'Work'
  },
  {
    user: 'riley.thompson@example.com',
    text: "Said no to chairing the textbook selection committee today. It was hard but necessary. I need to protect time for meaningful work - one good conversation with a student is worth more than ten admin meetings.",
    type: 'Reflection'
  },
  {
    user: 'riley.thompson@example.com',
    text: "Launched the project-based learning unit today. Students are researching local environmental issues and proposing solutions. Watching them discover their own potential as problem-solvers is incredible.",
    type: 'Work'
  },
  {
    user: 'riley.thompson@example.com',
    text: "Feeling stressed and anxious about this big curriculum redesign. Worried it won't work, worried about pushback from parents. But I know innovation in education requires risk. Deep breath.",
    type: 'Emotional'
  },
  {
    user: 'riley.thompson@example.com',
    text: "Mentored a new teacher during lunch today. Shared what I've learned about classroom management, building relationships with students. Feels good to help someone else avoid the mistakes I made early on.",
    type: 'Work'
  },
  {
    user: 'riley.thompson@example.com',
    text: "Losing passion for teaching lately. Too much admin work, too little actual impact. Need to reconnect with why I started - helping students discover their potential. Maybe I need to have more of those meaningful conversations.",
    type: 'Reflection'
  },
  {
    user: 'riley.thompson@example.com',
    text: "Built a strong classroom community this year. Students feel safe to share ideas, make mistakes, learn from each other. This is the environment I wanted to create. Vision coming to life.",
    type: 'Emotional'
  },

  // Taylor Kim (Graduate Student) - 5 entries
  {
    user: 'taylor.kim@example.com',
    text: "Thesis proposal got approved! Huge relief but also terrifying - now I actually have to do it. Job market is brutal and I'm not sure academia is for me. Need clarity on what comes after graduation.",
    type: 'Reflection'
  },
  {
    user: 'taylor.kim@example.com',
    text: "High stress today. Dissertation chapter due, TA grading piling up, job applications to finish. Feel like I'm drowning. Need to break this down into manageable pieces.",
    type: 'Cognitive'
  },
  {
    user: 'taylor.kim@example.com',
    text: "Attended a career panel today - PhDs in industry vs academia. Industry folks seemed happier, less stressed, better work-life balance. Maybe that's the path for me. Need to explore this more.",
    type: 'Work'
  },
  {
    user: 'taylor.kim@example.com',
    text: "Advisor feedback was critical today. Felt defensive but trying to stay practical - revise, improve, move forward. Can't let emotions derail progress.",
    type: 'Work'
  },
  {
    user: 'taylor.kim@example.com',
    text: "Applied to 5 industry roles today. Feels like I'm betraying the academic path but also... relieved? Maybe I've known for a while that academia isn't for me. Figuring out what I actually want to do is the hard part.",
    type: 'Reflection'
  },

  // Anonymous (Minimal Profile) - 5 entries
  {
    user: 'anonymous@example.com',
    text: "Feeling stressed about work. Lots of deadlines and not enough time. Don't know how to cope with this.",
    type: 'Emotional'
  },
  {
    user: 'anonymous@example.com',
    text: "Had a good day today. Things went well at work and I felt productive. Nice to have a positive day for once.",
    type: 'Reflection'
  },
  {
    user: 'anonymous@example.com',
    text: "Anxious about a big presentation coming up. Worried I won't do well. This always happens before important events.",
    type: 'Cognitive'
  },
  {
    user: 'anonymous@example.com',
    text: "Tired and overwhelmed. Too much going on. Need to find a way to manage stress better.",
    type: 'Emotional'
  },
  {
    user: 'anonymous@example.com',
    text: "Reflecting on the past month. Some good moments, some challenging ones. Trying to learn from both.",
    type: 'Reflection'
  }
];

// Test users with 100% profile completion
const TEST_USERS = [
  {
    firebaseUid: 'test-sarah-martinez',
    displayName: 'Sarah Martinez',
    email: 'sarah.martinez@example.com',
    personalization: {
      profession: 'Product Manager at Tech Startup',
      stressLevel: 4,
      emotionalOpenness: 5,
      personalGoal: 'Build a product that impacts 1M users while maintaining work-life balance'
    },
    gamification: {
      completedSoulMappingTopics: ['childhood-beliefs', 'relationship-patterns', 'fear-analysis', 'values-clarification', 'identity-exploration']
    },
    lifeBlueprint: {
      vision: [
        { text: 'Leading a team that ships products users love', category: 'career', createdAt: new Date().toISOString() },
        { text: 'Having deep relationships with family and friends', category: 'relationships', createdAt: new Date().toISOString() }
      ],
      antiVision: [
        { text: 'Burning out from overwork', category: 'career', createdAt: new Date().toISOString() },
        { text: 'Neglecting relationships for career', category: 'relationships', createdAt: new Date().toISOString() }
      ],
      levers: [
        { name: 'Setting boundaries', description: 'Saying no to non-essential commitments', pushesToward: 'vision', createdAt: new Date().toISOString() },
        { name: 'Weekly 1-on-1s', description: 'Deep conversations with team members', pushesToward: 'vision', createdAt: new Date().toISOString() }
      ],
      goals: [
        { text: 'Launch v2.0 with 85%+ user satisfaction', category: 'career', horizon: '6months', createdAt: new Date().toISOString() }
      ],
      responses: [],
      completedSections: ['vision', 'anti-vision', 'levers', 'goals']
    }
  },
  {
    firebaseUid: 'test-alex-chen',
    displayName: 'Alex Chen',
    email: 'alex.chen@example.com',
    personalization: {
      profession: 'Software Engineer',
      stressLevel: 3,
      emotionalOpenness: 3,
      personalGoal: 'Get better at managing stress and anxiety'
    },
    gamification: {
      completedSoulMappingTopics: ['childhood-beliefs', 'fear-analysis']
    },
    lifeBlueprint: {
      vision: [],
      antiVision: [],
      levers: [],
      goals: [],
      responses: [],
      completedSections: []
    }
  },
  {
    firebaseUid: 'test-jordan-lee',
    displayName: 'Jordan Lee',
    email: 'jordan.lee@example.com',
    personalization: {
      profession: 'Marketing Director',
      stressLevel: 5,
      emotionalOpenness: 4,
      personalGoal: 'Find clarity on next career move'
    },
    gamification: {
      completedSoulMappingTopics: []
    },
    lifeBlueprint: {
      vision: [
        { text: 'Running my own consulting business', category: 'career', createdAt: new Date().toISOString() },
        { text: 'Having time to spend with my kids', category: 'relationships', createdAt: new Date().toISOString() }
      ],
      antiVision: [
        { text: 'Staying in corporate job that drains me', category: 'career', createdAt: new Date().toISOString() }
      ],
      levers: [],
      goals: [],
      responses: [],
      completedSections: ['vision', 'anti-vision']
    }
  },
  {
    firebaseUid: 'test-maya-patel',
    displayName: 'Maya Patel',
    email: 'maya.patel@example.com',
    personalization: {
      profession: 'UX Designer',
      stressLevel: 2,
      emotionalOpenness: 4,
      personalGoal: 'Find creative fulfillment in my work'
    },
    gamification: {
      completedSoulMappingTopics: ['values-clarification', 'identity-exploration', 'fear-analysis']
    },
    lifeBlueprint: {
      vision: [
        { text: 'Creating design work that genuinely delights users', category: 'career', createdAt: new Date().toISOString() }
      ],
      antiVision: [],
      levers: [],
      goals: [
        { text: 'Ship portfolio redesign', category: 'career', horizon: '6months', createdAt: new Date().toISOString() }
      ],
      responses: [],
      completedSections: ['vision', 'goals']
    }
  },
  {
    firebaseUid: 'test-chris-anderson',
    displayName: 'Chris Anderson',
    email: 'chris.anderson@example.com',
    personalization: {
      profession: 'Senior Accountant',
      stressLevel: 5,
      emotionalOpenness: 2,
      personalGoal: 'Achieve financial security for my family'
    },
    gamification: {
      completedSoulMappingTopics: ['childhood-beliefs', 'relationship-patterns', 'fear-analysis', 'values-clarification', 'identity-exploration']
    },
    lifeBlueprint: {
      vision: [],
      antiVision: [],
      levers: [],
      goals: [],
      responses: [],
      completedSections: []
    }
  },
  {
    firebaseUid: 'test-riley-thompson',
    displayName: 'Riley Thompson',
    email: 'riley.thompson@example.com',
    personalization: {
      profession: 'High School Teacher',
      stressLevel: 3,
      emotionalOpenness: 5,
      personalGoal: 'Make a lasting impact on my students\' lives'
    },
    gamification: {
      completedSoulMappingTopics: []
    },
    lifeBlueprint: {
      vision: [
        { text: 'Helping students discover their potential', category: 'career', createdAt: new Date().toISOString() },
        { text: 'Building a supportive classroom community', category: 'career', createdAt: new Date().toISOString() }
      ],
      antiVision: [
        { text: 'Burning out from administrative work', category: 'career', createdAt: new Date().toISOString() },
        { text: 'Losing my passion for teaching', category: 'personal-growth', createdAt: new Date().toISOString() }
      ],
      levers: [
        { name: 'One meaningful conversation per day', description: 'Deep connection with a student', pushesToward: 'vision', createdAt: new Date().toISOString() },
        { name: 'Saying no to extra committees', description: 'Protecting time for teaching', pushesToward: 'vision', createdAt: new Date().toISOString() }
      ],
      goals: [
        { text: 'Implement project-based learning curriculum', category: 'career', horizon: '6months', createdAt: new Date().toISOString() }
      ],
      responses: [],
      completedSections: ['vision', 'anti-vision', 'levers', 'goals']
    }
  },
  {
    firebaseUid: 'test-taylor-kim',
    displayName: 'Taylor Kim',
    email: 'taylor.kim@example.com',
    personalization: {
      profession: 'Graduate Student',
      stressLevel: 4,
      emotionalOpenness: 2,
      personalGoal: 'Figure out what I want to do after graduation'
    },
    gamification: {
      completedSoulMappingTopics: []
    },
    lifeBlueprint: {
      vision: [],
      antiVision: [],
      levers: [],
      goals: [],
      responses: [],
      completedSections: []
    }
  },
  {
    firebaseUid: 'test-anonymous',
    displayName: 'Anonymous User',
    email: 'anonymous@example.com',
    personalization: {},
    gamification: {
      completedSoulMappingTopics: []
    },
    lifeBlueprint: {
      vision: [],
      antiVision: [],
      levers: [],
      goals: [],
      responses: [],
      completedSections: []
    }
  }
];

async function setupUsers() {
  console.log('🔧 Setting up 8 test users with varying profile completion...\n');

  const users = [];

  for (const userData of TEST_USERS) {
    const response = await fetch(`${API_BASE}/test-users/setup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Setup failed for ${userData.displayName}: ${error}`);
    }

    const result = await response.json();
    users.push({ ...result.user, email: userData.email });
    console.log(`✅ Created: ${userData.displayName} (${userData.email})`);
  }

  console.log(`\n✅ Created ${users.length} test users\n`);
  return users;
}

async function createEntry(firebaseUid, text, type) {
  const response = await fetch(`${API_BASE}/process-entry`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Firebase-UID': firebaseUid
    },
    body: JSON.stringify({ text, type })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Entry creation failed: ${error}`);
  }

  return response.json();
}

async function generateAllEntries(users) {
  console.log('📝 Generating 50 unique journal entries...\n');

  const userMap = {};
  users.forEach(u => {
    userMap[u.email] = u.firebaseUid;
  });

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < JOURNAL_ENTRIES.length; i++) {
    const entry = JOURNAL_ENTRIES[i];
    const firebaseUid = userMap[entry.user];

    if (!firebaseUid) {
      console.log(`⚠️  User not found: ${entry.user}`);
      errorCount++;
      continue;
    }

    try {
      const result = await createEntry(firebaseUid, entry.text, entry.type);
      successCount++;

      const userName = entry.user.split('@')[0].replace('.', ' ');
      const preview = entry.text.substring(0, 60) + '...';
      console.log(`✅ [${successCount}/50] ${userName}: "${preview}"`);
      console.log(`   Type: ${result.type} | Mode: ${result.inferredMode} | Energy: ${result.inferredEnergy}`);
      console.log(`   Next Action: ${result.nextAction}\n`);

      // Rate limiting - wait 500ms between entries to avoid overwhelming the AI
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`❌ Error creating entry for ${entry.user}: ${error.message}\n`);
      errorCount++;
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📊 SUMMARY: ${successCount} entries created, ${errorCount} errors`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

async function main() {
  try {
    console.log('🚀 Starting Test Log Generation');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const users = await setupUsers();
    await generateAllEntries(users);

    console.log('✅ Test log generation complete!\n');
    console.log('Next step: Run insight and chat response tests');
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

main();
