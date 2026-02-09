#!/usr/bin/env node

/**
 * Quick test of two-pass generation on Sarah and Jordan
 */

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api';

const TESTS = [
  {
    name: 'Sarah Martinez',
    firebaseUid: 'test-sarah-martinez',
    query: "I keep feeling like I'm not good enough for my role, especially with this upcoming launch. How do I balance pushing for excellence without burning out?",
    expectedTerms: ['imposter', 'work-life balance', 'boundaries', 'vision', '1-on-1', 'burnout']
  },
  {
    name: 'Jordan Lee',
    firebaseUid: 'test-jordan-lee',
    query: "Every day in this corporate job feels like a waste. I have a vision of running my own consultancy but I'm terrified to leave the stability. When is the right time to make the leap?",
    expectedTerms: ['consulting', 'corporate', 'draining', 'anti-vision', 'freedom', 'stability']
  }
];

async function testChat(firebaseUid, query) {
  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Firebase-UID': firebaseUid
    },
    body: JSON.stringify({
      message: query,
      history: [],
      userContext: {}
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Chat failed: ${error}`);
  }

  return response.json();
}

function scoreResponse(response, expectedTerms) {
  const text = response.response.toLowerCase();
  const found = expectedTerms.filter(term => text.includes(term.toLowerCase()));
  const score = (found.length / expectedTerms.length) * 100;
  return { score: Math.round(score), found, total: expectedTerms.length };
}

async function main() {
  console.log('\n🧪 TWO-PASS GENERATION TEST');
  console.log('━'.repeat(60));
  console.log('Testing Sarah & Jordan with new two-pass system\n');

  for (const test of TESTS) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`TEST: ${test.name}`);
    console.log('='.repeat(60));
    console.log(`\nQuery: "${test.query}"\n`);

    try {
      const result = await testChat(test.firebaseUid, test.query);

      console.log('📝 Response:');
      console.log(result.response);
      console.log('\n');

      const score = scoreResponse(result, test.expectedTerms);
      console.log(`📊 Term Match Score: ${score.score}% (${score.found.length}/${score.total})`);
      console.log(`   Found: ${score.found.join(', ') || 'None'}`);
      console.log(`   Missing: ${test.expectedTerms.filter(t => !score.found.includes(t)).join(', ')}`);

    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
    }

    console.log('\n⏳ Waiting 3 seconds...\n');
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  console.log('\n✅ Test complete!\n');
}

main();
