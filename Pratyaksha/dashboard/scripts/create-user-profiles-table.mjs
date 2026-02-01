// Script to create User_Profiles table in Airtable
// Run with: node scripts/create-user-profiles-table.mjs

import 'dotenv/config';

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || process.env.VITE_AIRTABLE_API_KEY;
const BASE_ID = process.env.AIRTABLE_BASE_ID || process.env.VITE_AIRTABLE_BASE_ID;

if (!AIRTABLE_API_KEY || !BASE_ID) {
  console.error('❌ Missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID in .env');
  process.exit(1);
}

async function createUserProfilesTable() {
  console.log('🚀 Creating User_Profiles table in Airtable...\n');
  console.log(`Base ID: ${BASE_ID}`);

  const tableSchema = {
    name: "User_Profiles",
    description: "Stores user settings, gamification data, and life blueprint for cloud sync",
    fields: [
      {
        name: "Firebase UID",
        type: "singleLineText",
        description: "Firebase Authentication User ID - Primary identifier"
      },
      {
        name: "Email",
        type: "email",
        description: "User's email address"
      },
      {
        name: "Display Name",
        type: "singleLineText",
        description: "User's display name"
      },
      {
        name: "Settings",
        type: "multilineText",
        description: "JSON: Personalization data (demographics, preferences, psychological context)"
      },
      {
        name: "Gamification",
        type: "multilineText",
        description: "JSON: Karma points, streaks, completed soul mapping topics"
      },
      {
        name: "Life Blueprint",
        type: "multilineText",
        description: "JSON: Vision, anti-vision, levers, goals, time horizon goals"
      },
      {
        name: "Daily Reminder Enabled",
        type: "checkbox",
        options: {
          color: "greenBright",
          icon: "check"
        }
      },
      {
        name: "Reminder Time",
        type: "singleLineText",
        description: "HH:MM format for daily reminder"
      },
      {
        name: "Onboarding Completed",
        type: "checkbox",
        options: {
          color: "greenBright",
          icon: "check"
        }
      },
      {
        name: "Badges",
        type: "multilineText",
        description: "JSON array of earned badge IDs"
      },
      {
        name: "FCM Token",
        type: "singleLineText",
        description: "Firebase Cloud Messaging token for push notifications"
      },
      {
        name: "Created At",
        type: "dateTime",
        options: {
          dateFormat: {
            name: "iso"
          },
          timeFormat: {
            name: "24hour"
          },
          timeZone: "utc"
        }
      },
      {
        name: "Last Active",
        type: "dateTime",
        options: {
          dateFormat: {
            name: "iso"
          },
          timeFormat: {
            name: "24hour"
          },
          timeZone: "utc"
        }
      }
    ]
  };

  try {
    const response = await fetch(`https://api.airtable.com/v0/meta/bases/${BASE_ID}/tables`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(tableSchema)
    });

    if (!response.ok) {
      const error = await response.json();

      if (response.status === 422 && error.error?.message?.includes('already exists')) {
        console.log('⚠️  Table "User_Profiles" already exists!\n');

        // Try to get existing table ID
        const tablesResponse = await fetch(`https://api.airtable.com/v0/meta/bases/${BASE_ID}/tables`, {
          headers: {
            'Authorization': `Bearer ${AIRTABLE_API_KEY}`
          }
        });

        if (tablesResponse.ok) {
          const tablesData = await tablesResponse.json();
          const existingTable = tablesData.tables.find(t => t.name === 'User_Profiles');
          if (existingTable) {
            console.log('✅ Found existing table:');
            console.log(`   Table ID: ${existingTable.id}`);
            console.log('\n📋 Add this to your .env file:');
            console.log(`   AIRTABLE_USER_PROFILES_TABLE_ID=${existingTable.id}`);
          }
        }
        return;
      }

      console.error('❌ Failed to create table:', error);
      console.error('\nNote: Creating tables requires Airtable API with Metadata access.');
      console.error('If this fails, you can create the table manually in Airtable UI.\n');

      // Print manual instructions
      printManualInstructions();
      return;
    }

    const data = await response.json();

    console.log('✅ Table created successfully!\n');
    console.log(`Table Name: ${data.name}`);
    console.log(`Table ID: ${data.id}`);
    console.log('\n📋 Add this to your .env file:');
    console.log(`   AIRTABLE_USER_PROFILES_TABLE_ID=${data.id}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n');
    printManualInstructions();
  }
}

function printManualInstructions() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('📖 MANUAL SETUP INSTRUCTIONS');
  console.log('═══════════════════════════════════════════════════════════════\n');
  console.log('1. Go to your Airtable base: https://airtable.com/' + BASE_ID);
  console.log('2. Click "+ Add or import" to create a new table');
  console.log('3. Name it: User_Profiles');
  console.log('4. Add these fields:\n');

  const fields = [
    ['Firebase UID', 'Single line text', 'Primary identifier'],
    ['Email', 'Email', 'User email'],
    ['Display Name', 'Single line text', 'User name'],
    ['Settings', 'Long text', 'JSON: personalization data'],
    ['Gamification', 'Long text', 'JSON: karma, streaks'],
    ['Life Blueprint', 'Long text', 'JSON: vision, goals'],
    ['Daily Reminder Enabled', 'Checkbox', ''],
    ['Reminder Time', 'Single line text', 'HH:MM format'],
    ['Onboarding Completed', 'Checkbox', ''],
    ['Badges', 'Long text', 'JSON array'],
    ['FCM Token', 'Single line text', 'Push notification token'],
    ['Created At', 'Date (with time)', 'ISO format'],
    ['Last Active', 'Date (with time)', 'ISO format'],
  ];

  console.log('   Field Name              | Type              | Notes');
  console.log('   ----------------------- | ----------------- | -----');
  fields.forEach(([name, type, notes]) => {
    console.log(`   ${name.padEnd(23)} | ${type.padEnd(17)} | ${notes}`);
  });

  console.log('\n5. After creating, get the Table ID from the URL:');
  console.log('   https://airtable.com/BASE_ID/TABLE_ID/...');
  console.log('                                  ^^^^^^^^');
  console.log('   The TABLE_ID starts with "tbl"');
  console.log('\n6. Add to .env:');
  console.log('   AIRTABLE_USER_PROFILES_TABLE_ID=tblXXXXXXXXXXXXXX');
  console.log('\n═══════════════════════════════════════════════════════════════\n');
}

createUserProfilesTable();
