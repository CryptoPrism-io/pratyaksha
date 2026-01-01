"""
Airtable Entries Sync Script
============================
Pulls all records from the Cognitive Log Airtable and saves to CSV.

Usage:
    python sync_airtable.py

Output:
    - entries_data.csv (overwritten with latest data)
    - Console summary of sync operation
"""

from pyairtable import Api
import csv
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env'))

# Configuration (from .env)
API_KEY = os.getenv('AIRTABLE_API_KEY')
BASE_ID = os.getenv('AIRTABLE_BASE_ID')
TABLE_ID = os.getenv('AIRTABLE_TABLE_ID')
OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_FILE = os.path.join(OUTPUT_DIR, 'entries_data.csv')

# Column definitions
COLUMNS = [
    'Record ID', 'Name', 'Type', 'Date', 'Timestamp', 'Text',
    'Inferred Mode', 'Inferred Energy', 'Energy Shape', 'Contradiction',
    'Snapshot', 'Loops', 'Next Action', 'Meta Flag', 'Is Summary?',
    'Summary (AI)', 'Actionable Insights (AI)', 'Entry Length (Words)',
    'Days Since Entry', 'Is Recent?', 'Entry Sentiment (AI)', 'Entry Theme Tags (AI)'
]


def extract_ai_field(value):
    """Extract value from AI field dict or return as-is."""
    if isinstance(value, dict):
        return value.get('value', '')
    return value or ''


def fetch_records():
    """Fetch all records from Airtable."""
    api = Api(API_KEY)
    table = api.table(BASE_ID, TABLE_ID)
    return table.all(sort=['Date'])


def process_record(rec):
    """Transform Airtable record to CSV row."""
    fields = rec['fields']
    return {
        'Record ID': rec['id'],
        'Name': fields.get('Name', ''),
        'Type': fields.get('Type', ''),
        'Date': fields.get('Date', ''),
        'Timestamp': fields.get('Timestamp', ''),
        'Text': fields.get('Text', ''),
        'Inferred Mode': fields.get('Inferred Mode', ''),
        'Inferred Energy': fields.get('Inferred Energy', ''),
        'Energy Shape': fields.get('Energy Shape', ''),
        'Contradiction': fields.get('Contradiction', ''),
        'Snapshot': fields.get('Snapshot', ''),
        'Loops': fields.get('Loops', ''),
        'Next Action': fields.get('Next Action', ''),
        'Meta Flag': fields.get('Meta Flag', ''),
        'Is Summary?': fields.get('Is Summary?', False),
        'Summary (AI)': fields.get('Summary (AI)', ''),
        'Actionable Insights (AI)': fields.get('Actionable Insights (AI)', ''),
        'Entry Length (Words)': fields.get('Entry Length (Words)', ''),
        'Days Since Entry': fields.get('Days Since Entry', ''),
        'Is Recent?': fields.get('Is Recent?', ''),
        'Entry Sentiment (AI)': extract_ai_field(fields.get('Entry Sentiment (AI)', '')),
        'Entry Theme Tags (AI)': extract_ai_field(fields.get('Entry Theme Tags (AI)', '')),
    }


def save_csv(rows):
    """Write rows to CSV file."""
    with open(OUTPUT_FILE, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=COLUMNS)
        writer.writeheader()
        writer.writerows(rows)


def main():
    """Main sync function."""
    print('=' * 50)
    print('AIRTABLE SYNC')
    print('=' * 50)
    print(f'Started: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}')
    print()

    # Fetch
    print('Fetching records from Airtable...')
    records = fetch_records()
    print(f'  Found: {len(records)} records')

    # Process
    print('Processing records...')
    rows = [process_record(rec) for rec in records]

    # Save
    print(f'Saving to: {OUTPUT_FILE}')
    save_csv(rows)

    # Summary
    print()
    print('-' * 50)
    print('SYNC COMPLETE')
    print('-' * 50)
    print(f'  Records: {len(rows)}')
    print(f'  Columns: {len(COLUMNS)}')
    print(f'  Output:  {OUTPUT_FILE}')
    print(f'  Time:    {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}')
    print()

    # Show date range
    dates = [r['Date'] for r in rows if r['Date']]
    if dates:
        print(f'  Date Range: {min(dates)} to {max(dates)}')

    # Show type distribution
    types = {}
    for r in rows:
        t = r['Type'] or 'Unknown'
        types[t] = types.get(t, 0) + 1
    print(f'  Types: {dict(sorted(types.items(), key=lambda x: -x[1]))}')

    print('=' * 50)


if __name__ == '__main__':
    main()
