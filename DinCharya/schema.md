# Din Charya - Airtable Schema

**Base Name:** Din Charya
**Base ID:** `appxNIbOfc9wPEU0i`
**Created:** 2026-01-01

---

## Tables Overview

| Table | ID | Purpose |
|-------|-----|---------|
| Priorities | `tbljgR0pbY8OEtMZg` | Master list of priorities across Day/Week/Month |
| Tasks | `tbl6mUGqsLzXKc6vP` | Granular tasks linked to priorities |

---

## Priorities Table

### Core Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Title | Single line text | Yes | The priority name (3-10 words) |
| Horizon | Single select | Yes | Day, Week, Month |
| Status | Single select | Yes | Active, Done, Deferred, Dropped |
| Rank | Number | No | Ordering (1 = highest) |
| Why | Long text | No | Motivation anchor - why this matters |
| Due Date | Date | No | Optional deadline |
| Category | Single select | No | Work, Personal, Health, Growth, Relationship |
| Created | Date | Auto | When priority was added |

### Relationship Fields

| Field | Type | Description |
|-------|------|-------------|
| Tasks | Link to Tasks | All tasks supporting this priority |

### Computed Fields

| Field | Type | Formula/Config |
|-------|------|----------------|
| Total Tasks | Count | Count of linked Tasks |
| Completed Tasks | Rollup | Count of Tasks where Status = "Done" |
| Task Completion % | Formula | Completed Tasks / Total Tasks * 100 |

### AI Fields

| Field | Type | Description |
|-------|------|-------------|
| Summary | AI Text | Auto-generated summary of the priority |
| Category Suggestion | AI Text | AI-suggested category based on title |

### Select Options

**Horizon:**
- Day
- Week
- Month

**Status:**
- Active (default)
- Done
- Deferred
- Dropped

**Category:**
- Work
- Personal
- Health
- Growth
- Relationship

---

## Tasks Table

### Core Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Task | Single line text | Yes | The specific action |
| Priority Link | Link to Priorities | Yes | Parent priority |
| Status | Single select | Yes | Todo, Doing, Done |
| Notes | Long text | No | Additional context |

### Lookup Fields

| Field | Type | Source |
|-------|------|--------|
| Priority Horizon | Lookup | Horizon from linked Priority |
| Priority Status | Lookup | Status from linked Priority |
| Priority Due Date | Lookup | Due Date from linked Priority |
| Priority Category | Lookup | Category from linked Priority |

### Computed Fields

| Field | Type | Formula |
|-------|------|---------|
| Days Until Due | Formula | DATETIME_DIFF({Priority Due Date}, TODAY(), 'days') |
| Is Overdue | Formula | IF({Days Until Due} < 0, "Yes", "No") |
| Task Age (days) | Formula | Days since task creation |

### AI Fields

| Field | Type | Description |
|-------|------|-------------|
| Task Summary (AI) | AI Text | Auto-generated task summary |
| Suggested Next Action (AI) | AI Text | AI-suggested next step |

### Select Options

**Status:**
- Todo (default)
- Doing
- Done

---

## API Access

```python
from pyairtable import Api
import os

api = Api(os.getenv('AIRTABLE_API_KEY'))

# Access Priorities
priorities = api.table('appxNIbOfc9wPEU0i', 'tbljgR0pbY8OEtMZg')

# Access Tasks
tasks = api.table('appxNIbOfc9wPEU0i', 'tbl6mUGqsLzXKc6vP')

# Get all active daily priorities
daily = priorities.all(
    formula="{Horizon}='Day' AND {Status}='Active'",
    sort=['Rank']
)

# Create a new priority
priorities.create({
    'Title': 'Finish the report',
    'Horizon': 'Day',
    'Status': 'Active',
    'Rank': 1,
    'Category': 'Work'
})

# Update status
priorities.update('rec123', {'Status': 'Done'})
```

---

## Views (Recommended)

| View Name | Filter | Sort |
|-----------|--------|------|
| Today | Horizon = "Day" AND Status = "Active" | Rank ascending |
| This Week | Horizon = "Week" AND Status = "Active" | Due Date, then Rank |
| This Month | Horizon = "Month" AND Status = "Active" | Due Date, then Rank |
| All Active | Status = "Active" | Horizon, then Rank |
| Completed | Status = "Done" | Created descending |
| Deferred | Status = "Deferred" | Created descending |

---

*Last Updated: 2026-01-01*
