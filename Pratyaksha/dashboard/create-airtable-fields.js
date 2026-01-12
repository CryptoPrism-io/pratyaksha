// Script to create Is Bookmarked? and Is Deleted? fields in Airtable
require('dotenv').config();

const API_KEY = process.env.VITE_AIRTABLE_API_KEY || process.env.AIRTABLE_API_KEY;
const BASE_ID = 'appMzFpUZLuZs9VGc';
const TABLE_ID = 'tblhKYssgHtjpmbni';

async function createField(name, type, options = {}) {
  console.log(`Creating field: ${name}...`);

  const body = {
    name: name,
    type: type,
  };

  if (Object.keys(options).length > 0) {
    body.options = options;
  }

  const response = await fetch(
    `https://api.airtable.com/v0/meta/bases/${BASE_ID}/tables/${TABLE_ID}/fields`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );

  const data = await response.json();

  if (response.ok) {
    console.log(`✓ Created '${name}' successfully!`);
    return true;
  } else {
    console.log(`✗ Failed to create '${name}':`, data.error?.message || JSON.stringify(data));
    return false;
  }
}

async function main() {
  if (!API_KEY) {
    console.error('Error: No Airtable API key found in environment');
    process.exit(1);
  }

  console.log('Creating Airtable fields...\n');

  // Create Is Bookmarked? checkbox field
  await createField('Is Bookmarked?', 'checkbox', {
    color: 'yellowBright',
    icon: 'star'
  });

  // Create Is Deleted? checkbox field
  await createField('Is Deleted?', 'checkbox', {
    color: 'redBright',
    icon: 'check'
  });

  console.log('\nDone!');
}

main().catch(console.error);
