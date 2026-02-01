import 'dotenv/config';

const API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = process.env.AIRTABLE_BASE_ID;
const TABLE_ID = 'tblmncNWqXioyJYPc';

const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}?maxRecords=10`, {
  headers: { Authorization: `Bearer ${API_KEY}` }
});

const data = await response.json();

console.log('=== User Profiles in Airtable ===\n');

if (data.records && data.records.length > 0) {
  data.records.forEach((r, i) => {
    console.log(`--- Profile ${i + 1} ---`);
    console.log('Firebase UID:', r.fields['Firebase UID'] || '(none)');
    console.log('Email:', r.fields['Email'] || '(none)');
    console.log('Display Name:', r.fields['Display Name'] || '(none)');
    console.log('Onboarding:', r.fields['Onboarding Completed'] ? '✅ Yes' : '❌ No');
    console.log('Has Gamification:', r.fields['Gamification'] ? '✅ Yes' : '❌ No');
    console.log('Has Life Blueprint:', r.fields['Life Blueprint'] ? '✅ Yes' : '❌ No');
    console.log('Last Active:', r.fields['Last Active'] || '(never)');
    console.log('');
  });
  console.log(`Total: ${data.records.length} profile(s)`);
} else {
  console.log('No profiles found yet.');
  console.log('User needs to login to trigger sync.');
}
