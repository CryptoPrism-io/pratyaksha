// Script to backfill Entry Sentiment (AI) for entries missing it
require('dotenv').config();

const API_KEY = process.env.VITE_AIRTABLE_API_KEY || process.env.AIRTABLE_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const BASE_ID = 'appMzFpUZLuZs9VGc';
const TABLE_ID = 'tblhKYssgHtjpmbni';

async function analyzeSentiment(text) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'openai/gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Analyze the sentiment of the following journal entry and respond with ONLY one word: "Positive", "Negative", or "Neutral". No explanation.`
        },
        {
          role: 'user',
          content: text
        }
      ],
      max_tokens: 10,
    }),
  });

  const data = await response.json();
  const sentiment = data.choices?.[0]?.message?.content?.trim();

  // Validate sentiment
  const validSentiments = ['Positive', 'Negative', 'Neutral'];
  if (validSentiments.includes(sentiment)) {
    return sentiment;
  }

  // Try to extract from response
  for (const valid of validSentiments) {
    if (sentiment?.toLowerCase().includes(valid.toLowerCase())) {
      return valid;
    }
  }

  return 'Neutral'; // Default fallback
}

async function updateRecord(recordId, sentiment) {
  const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}/${recordId}`;

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fields: {
        'Entry Sentiment (AI)': sentiment
      }
    }),
  });

  return response.ok;
}

async function fetchAllRecords() {
  const allRecords = [];
  let offset = null;

  do {
    const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}?sort[0][field]=Date&sort[0][direction]=desc${offset ? `&offset=${offset}` : ''}`;

    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${API_KEY}` },
    });

    const data = await response.json();
    allRecords.push(...(data.records || []));
    offset = data.offset;
  } while (offset);

  return allRecords;
}

async function main() {
  if (!API_KEY) {
    console.error('Error: No Airtable API key');
    process.exit(1);
  }
  if (!OPENROUTER_API_KEY) {
    console.error('Error: No OpenRouter API key');
    process.exit(1);
  }

  console.log('Fetching all records...');
  const records = await fetchAllRecords();
  console.log(`Found ${records.length} total records`);

  // Filter records missing sentiment (and not summaries)
  const needsSentiment = records.filter(r =>
    !r.fields['Entry Sentiment (AI)'] &&
    !r.fields['Is Summary?'] &&
    r.fields.Text
  );

  console.log(`${needsSentiment.length} entries need sentiment backfill`);
  console.log('');

  let updated = 0;
  let failed = 0;

  for (const record of needsSentiment) {
    const name = record.fields.Name || 'Unnamed';
    const text = record.fields.Text;

    if (!text || text.length < 5) {
      console.log(`Skipping ${name} - no text`);
      continue;
    }

    try {
      // Analyze sentiment
      const sentiment = await analyzeSentiment(text);

      // Update record
      const success = await updateRecord(record.id, sentiment);

      if (success) {
        console.log(`✓ ${name.substring(0, 40).padEnd(40)} → ${sentiment}`);
        updated++;
      } else {
        console.log(`✗ ${name.substring(0, 40).padEnd(40)} → FAILED`);
        failed++;
      }

      // Small delay to avoid rate limits
      await new Promise(r => setTimeout(r, 200));

    } catch (error) {
      console.log(`✗ ${name.substring(0, 40).padEnd(40)} → ERROR: ${error.message}`);
      failed++;
    }
  }

  console.log('');
  console.log('=== COMPLETE ===');
  console.log(`Updated: ${updated}`);
  console.log(`Failed: ${failed}`);
}

main().catch(console.error);
