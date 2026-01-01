"""
Din Charya - Airtable Sync Script
==================================
Pulls all Priorities and Tasks from Airtable and saves to CSV.

Usage:
    python sync_dincharya.py

Output:
    - priorities.csv
    - tasks.csv
"""

from pyairtable import Api
import csv
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables from .env (in parent AirTable folder)
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '.env'))

# Configuration (from .env)
API_KEY = os.getenv('AIRTABLE_API_KEY')
BASE_ID = os.getenv('DINCHARYA_BASE_ID')
PRIORITIES_TABLE_ID = os.getenv('DINCHARYA_PRIORITIES_TABLE_ID')
TASKS_TABLE_ID = os.getenv('DINCHARYA_TASKS_TABLE_ID')

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))

# Column definitions
PRIORITY_COLUMNS = [
    'Record ID', 'Title', 'Horizon', 'Status', 'Rank', 'Why',
    'Due Date', 'Category', 'Created', 'Total Tasks', 'Completed Tasks',
    'Task Completion %', 'Summary', 'Category Suggestion'
]

TASK_COLUMNS = [
    'Record ID', 'Task', 'Priority', 'Status', 'Notes',
    'Priority Horizon', 'Priority Status', 'Priority Due Date',
    'Days Until Due', 'Is Overdue', 'Task Age (days)',
    'Task Summary (AI)', 'Suggested Next Action (AI)'
]


def extract_field(value):
    """Extract value from complex field types."""
    if value is None:
        return ''
    if isinstance(value, dict):
        return value.get('value', str(value))
    if isinstance(value, list):
        # For linked records or lookups, join values
        return ', '.join(str(v) for v in value)
    return value


def fetch_priorities(api):
    """Fetch all priorities from Airtable."""
    table = api.table(BASE_ID, PRIORITIES_TABLE_ID)
    records = table.all(sort=['Rank'])

    rows = []
    for rec in records:
        fields = rec['fields']
        rows.append({
            'Record ID': rec['id'],
            'Title': fields.get('Title', ''),
            'Horizon': fields.get('Horizon', ''),
            'Status': fields.get('Status', ''),
            'Rank': fields.get('Rank', ''),
            'Why': fields.get('Why', ''),
            'Due Date': fields.get('Due Date', ''),
            'Category': fields.get('Category', ''),
            'Created': fields.get('Created', ''),
            'Total Tasks': fields.get('Total Tasks', ''),
            'Completed Tasks': fields.get('Completed Tasks', ''),
            'Task Completion %': fields.get('Task Completion %', ''),
            'Summary': extract_field(fields.get('Summary', '')),
            'Category Suggestion': extract_field(fields.get('Category Suggestion', '')),
        })
    return rows


def fetch_tasks(api):
    """Fetch all tasks from Airtable."""
    table = api.table(BASE_ID, TASKS_TABLE_ID)
    records = table.all()

    rows = []
    for rec in records:
        fields = rec['fields']
        rows.append({
            'Record ID': rec['id'],
            'Task': fields.get('Task', ''),
            'Priority': extract_field(fields.get('Priority Link', '')),
            'Status': fields.get('Status', ''),
            'Notes': fields.get('Notes', ''),
            'Priority Horizon': extract_field(fields.get('Priority Horizon', '')),
            'Priority Status': extract_field(fields.get('Priority Status', '')),
            'Priority Due Date': extract_field(fields.get('Priority Due Date', '')),
            'Days Until Due': fields.get('Days Until Due', ''),
            'Is Overdue': fields.get('Is Overdue', ''),
            'Task Age (days)': fields.get('Task Age (days)', ''),
            'Task Summary (AI)': extract_field(fields.get('Task Summary (AI)', '')),
            'Suggested Next Action (AI)': extract_field(fields.get('Suggested Next Action (AI)', '')),
        })
    return rows


def save_csv(rows, columns, filename):
    """Write rows to CSV file."""
    filepath = os.path.join(OUTPUT_DIR, filename)
    with open(filepath, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=columns)
        writer.writeheader()
        writer.writerows(rows)
    return filepath


def main():
    """Main sync function."""
    print('=' * 50)
    print('DIN CHARYA SYNC')
    print('=' * 50)
    print(f'Started: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}')
    print()

    api = Api(API_KEY)

    # Fetch Priorities
    print('Fetching priorities...')
    priorities = fetch_priorities(api)
    print(f'  Found: {len(priorities)} priorities')

    priorities_file = save_csv(priorities, PRIORITY_COLUMNS, 'priorities.csv')
    print(f'  Saved: {priorities_file}')

    # Fetch Tasks
    print()
    print('Fetching tasks...')
    tasks = fetch_tasks(api)
    print(f'  Found: {len(tasks)} tasks')

    tasks_file = save_csv(tasks, TASK_COLUMNS, 'tasks.csv')
    print(f'  Saved: {tasks_file}')

    # Summary
    print()
    print('-' * 50)
    print('SYNC COMPLETE')
    print('-' * 50)
    print(f'  Priorities: {len(priorities)}')
    print(f'  Tasks: {len(tasks)}')
    print(f'  Time: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}')

    # Show horizon distribution
    if priorities:
        horizons = {}
        for p in priorities:
            h = p['Horizon'] or 'Unknown'
            horizons[h] = horizons.get(h, 0) + 1
        print(f'  Horizons: {dict(sorted(horizons.items()))}')

    # Show status distribution
    if priorities:
        statuses = {}
        for p in priorities:
            s = p['Status'] or 'Unknown'
            statuses[s] = statuses.get(s, 0) + 1
        print(f'  Statuses: {dict(sorted(statuses.items()))}')

    print('=' * 50)


if __name__ == '__main__':
    main()
