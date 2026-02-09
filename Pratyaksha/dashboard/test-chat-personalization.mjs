#!/usr/bin/env node

/**
 * Simplified Chat Personalization Test
 * Tests chat responses across 5 user personas with different profile completion levels
 */

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api';

// Test scenarios
const TEST_SCENARIOS = [
  {
    name: 'Sarah Martinez - Imposter Syndrome & Work-Life Balance',
    email: 'sarah.martinez@example.com',
    firebaseUid: 'test-sarah-martinez',
    chatQuery: "I keep feeling like I'm not good enough for my role, especially with this upcoming launch. How do I balance pushing for excellence without burning out?",
    expectedTerms: ['imposter', 'work-life balance', 'boundaries', 'vision', '1-on-1', 'burnout', 'team'],
    targetScore: 35
  },
  {
    name: 'Riley Thompson - Teaching Passion vs Admin Burden',
    email: 'riley.thompson@example.com',
    firebaseUid: 'test-riley-thompson',
    chatQuery: "I'm feeling disconnected from why I became a teacher. The administrative work is overwhelming and I barely have time for actual student interaction. How do I reconnect with my purpose?",
    expectedTerms: ['meaningful conversation', 'students', 'impact', 'vision', 'saying no', 'committees', 'passion', 'teaching'],
    targetScore: 30
  },
  {
    name: 'Jordan Lee - Corporate Drain & Career Transition',
    email: 'jordan.lee@example.com',
    firebaseUid: 'test-jordan-lee',
    chatQuery: "Every day in this corporate job feels like a waste. I have a vision of running my own consultancy but I'm terrified to leave the stability. When is the right time to make the leap?",
    expectedTerms: ['consulting', 'corporate', 'draining', 'anti-vision', 'freedom', 'stability', 'business'],
    targetScore: 28
  },
  {
    name: 'Maya Patel - Creative Fulfillment & Designer\'s Block',
    email: 'maya.patel@example.com',
    firebaseUid: 'test-maya-patel',
    chatQuery: "I'm working on my portfolio redesign but hit a creative block. How do I push through this while staying true to my goal of creating work that genuinely delights users?",
    expectedTerms: ['delight', 'users', 'creative', 'design', 'portfolio', 'vision', 'fulfillment'],
    targetScore: 28
  },
  {
    name: 'Chris Anderson - Financial Security vs Life Quality',
    email: 'chris.anderson@example.com',
    firebaseUid: 'test-chris-anderson',
    chatQuery: "Tax season has me working 12-hour days and barely seeing my family. I need the income for financial security but at what cost? How do I find balance?",
    expectedTerms: ['financial security', 'family', 'practical', 'goal', 'security', 'balance'],
    targetScore: 22
  }
];

async function testChatResponse(firebaseUid, query) {
  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Firebase-UID': firebaseUid
    },
    body: JSON.stringify({
      message: query,
      history: [],
      userContext: {} // Will be loaded server-side
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Chat request failed (${response.status}): ${error}`);
  }

  return response.json();
}

function calculatePersonalizationScore(chatResponse, expectedTerms) {
  let score = 0;
  const responseText = (chatResponse.response || '').toLowerCase();
  const foundTerms = [];

  // Check for expected personalization terms (5 points each, max 35)
  for (const term of expectedTerms) {
    if (responseText.includes(term.toLowerCase())) {
      score += 5;
      foundTerms.push(term);
      if (score >= 35) break; // Cap at 35 from term matching
    }
  }

  // Check response length (indicates depth) - 5 points if > 200 words
  const wordCount = responseText.split(/\s+/).length;
  if (wordCount > 200) {
    score += 5;
  }

  return { score, foundTerms, wordCount };
}

async function runTestScenario(scenario, scenarioIndex) {
  console.log(`\n\n${'='.repeat(80)}`);
  console.log(`TEST ${scenarioIndex + 1}/5: ${scenario.name}`);
  console.log('='.repeat(80));

  try {
    console.log(`\n💬 CHAT TEST`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Query: "${scenario.chatQuery}"\n`);
    console.log('Sending request...');

    const chatResponse = await testChatResponse(scenario.firebaseUid, scenario.chatQuery);

    console.log('\n📝 Response:');
    console.log(chatResponse.response);

    // Calculate personalization score
    const scoreResult = calculatePersonalizationScore(chatResponse, scenario.expectedTerms);

    console.log(`\n\n📊 PERSONALIZATION SCORE: ${scoreResult.score}/40`);
    console.log(`   Target: ${scenario.targetScore}/40`);
    const delta = scoreResult.score - scenario.targetScore;
    console.log(`   Delta: ${delta >= 0 ? '✅' : '⚠️'} ${delta >= 0 ? '+' : ''}${delta}`);
    console.log(`\n   Found personalization terms (${scoreResult.foundTerms.length}/${scenario.expectedTerms.length}):`);
    console.log(`   ${scoreResult.foundTerms.join(', ') || 'None'}`);
    console.log(`\n   Response length: ${scoreResult.wordCount} words`);

    return {
      scenario: scenario.name,
      score: scoreResult.score,
      target: scenario.targetScore,
      delta: delta,
      wordCount: scoreResult.wordCount,
      foundTerms: scoreResult.foundTerms,
      matchRate: `${Math.round((scoreResult.foundTerms.length / scenario.expectedTerms.length) * 100)}%`
    };

  } catch (error) {
    console.error(`\n❌ Test failed: ${error.message}`);
    return {
      scenario: scenario.name,
      error: error.message
    };
  }
}

async function main() {
  console.log('\n🧪 CHAT PERSONALIZATION TEST');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Testing 5 scenarios with complete user profiles (Soul Mapping + Blueprint)');
  console.log('Each user has 6-8 journal entries with full AI processing');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const results = [];

  for (let i = 0; i < TEST_SCENARIOS.length; i++) {
    const result = await runTestScenario(TEST_SCENARIOS[i], i);
    results.push(result);

    // Delay between tests to avoid rate limiting
    if (i < TEST_SCENARIOS.length - 1) {
      console.log('\n\n⏳ Waiting 3 seconds before next test...\n');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  // Final summary
  console.log('\n\n\n');
  console.log('='.repeat(80));
  console.log('📊 FINAL SUMMARY');
  console.log('='.repeat(80));

  const successfulTests = results.filter(r => !r.error);
  const averageScore = successfulTests.reduce((sum, r) => sum + r.score, 0) / successfulTests.length;
  const averageTarget = successfulTests.reduce((sum, r) => sum + r.target, 0) / successfulTests.length;
  const averageDelta = averageScore - averageTarget;

  console.log(`\nTests completed: ${successfulTests.length}/${results.length}`);
  console.log(`Average score: ${averageScore.toFixed(1)}/40`);
  console.log(`Average target: ${averageTarget.toFixed(1)}/40`);
  console.log(`Overall delta: ${averageDelta >= 0 ? '✅' : '⚠️'} ${averageDelta >= 0 ? '+' : ''}${averageDelta.toFixed(1)}`);
  console.log(`Performance: ${Math.round((averageScore / averageTarget) * 100)}% of target`);

  console.log('\n\nDetailed Results:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  successfulTests.forEach((result, idx) => {
    console.log(`\n${idx + 1}. ${result.scenario}`);
    console.log(`   Score: ${result.score}/40 (Target: ${result.target})`);
    console.log(`   Delta: ${result.delta >= 0 ? '✅ +' : '⚠️ '}${result.delta}`);
    console.log(`   Term match rate: ${result.matchRate}`);
    console.log(`   Found: ${result.foundTerms.slice(0, 4).join(', ')}${result.foundTerms.length > 4 ? '...' : ''}`);
    console.log(`   Word count: ${result.wordCount} words`);
  });

  const failedTests = results.filter(r => r.error);
  if (failedTests.length > 0) {
    console.log('\n\n❌ Failed Tests:');
    failedTests.forEach(result => {
      console.log(`   ${result.scenario}: ${result.error}`);
    });
  }

  console.log('\n\n✅ Test suite complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main();
