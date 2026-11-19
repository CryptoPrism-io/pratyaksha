// Unit tests for the chart data transforms in src/lib/transforms.ts.
// These shape every dashboard chart, so a regression here shows wrong charts
// without any error. No browser or server needed (Playwright "unit" project).
import { test, expect } from '@playwright/test'
import {
  toTimelineData,
  toModeDistribution,
  toEnergyShapeData,
  toTypeDistribution,
  toTagCloudData,
  toCalendarData,
  type Entry,
} from '../../src/lib/transforms'

let nextId = 0
function entry(fields: Partial<Entry>): Entry {
  nextId++
  return {
    id: `rec${nextId}`,
    name: `Entry ${nextId}`,
    type: 'Reflection',
    date: '2026-11-10',
    timestamp: '2026-11-10T09:00:00Z',
    text: '',
    inferredMode: 'Calm',
    inferredEnergy: 'Moderate',
    energyShape: 'Centered',
    sentimentAI: 'Neutral',
    themeTagsAI: [],
    ...fields,
  } as Entry
}

test.describe('toModeDistribution', () => {
  test('counts modes, rounds percentages and sorts by count', () => {
    const result = toModeDistribution([
      entry({ inferredMode: 'Anxious' }),
      entry({ inferredMode: 'Calm' }),
      entry({ inferredMode: 'Calm' }),
    ])
    expect(result).toEqual([
      { mode: 'Calm', count: 2, percentage: 67 },
      { mode: 'Anxious', count: 1, percentage: 33 },
    ])
  })

  test('returns an empty list for no entries', () => {
    expect(toModeDistribution([])).toEqual([])
  })
})

test.describe('toTypeDistribution', () => {
  test('counts entry types, most common first', () => {
    const result = toTypeDistribution([
      entry({ type: 'Work' }),
      entry({ type: 'Health' }),
      entry({ type: 'Work' }),
    ])
    expect(result).toEqual([
      { type: 'Work', count: 2 },
      { type: 'Health', count: 1 },
    ])
  })
})

test.describe('toEnergyShapeData', () => {
  test('always returns all 12 shapes in a fixed order, zero-filled', () => {
    const result = toEnergyShapeData([
      entry({ energyShape: 'Rising' }),
      entry({ energyShape: 'Rising' }),
      entry({ energyShape: 'Chaotic' }),
    ])
    expect(result).toHaveLength(12)
    expect(result.map((r) => r.shape)).toEqual([
      'Flat', 'Heavy', 'Chaotic', 'Rising', 'Collapsing', 'Expanding',
      'Contracted', 'Uneven', 'Centered', 'Cyclical', 'Stabilized', 'Pulsing',
    ])
    expect(result.find((r) => r.shape === 'Rising')?.count).toBe(2)
    expect(result.find((r) => r.shape === 'Chaotic')?.count).toBe(1)
    expect(result.find((r) => r.shape === 'Flat')?.count).toBe(0)
  })
})

test.describe('toTagCloudData', () => {
  test('normalises case and whitespace, drops empty tags', () => {
    const result = toTagCloudData([
      entry({ themeTagsAI: ['Work', ' work ', ''] }),
      entry({ themeTagsAI: ['Family'] }),
    ])
    expect(result).toEqual([
      { text: 'work', value: 2 },
      { text: 'family', value: 1 },
    ])
  })

  test('keeps only the top 30 tags', () => {
    const tags = Array.from({ length: 40 }, (_, i) => `tag${i}`)
    expect(toTagCloudData([entry({ themeTagsAI: tags })])).toHaveLength(30)
  })
})

test.describe('toTimelineData', () => {
  test('groups by day, averages sentiment (1-5 scale) and sorts by date', () => {
    const result = toTimelineData([
      entry({ date: '2026-11-12', sentimentAI: 'Positive' }),
      entry({ date: '2026-11-10', sentimentAI: 'Very Positive', inferredEnergy: 'High' }),
      entry({ date: '2026-11-10', sentimentAI: 'Negative' }),
    ])
    expect(result).toEqual([
      { date: '2026-11-10', sentiment: 3.5, energy: 'High', entries: 2 },
      { date: '2026-11-12', sentiment: 4, energy: 'Moderate', entries: 1 },
    ])
  })
})

test.describe('toCalendarData', () => {
  test('counts entries per day', () => {
    const result = toCalendarData([
      entry({ date: '2026-11-10' }),
      entry({ date: '2026-11-10' }),
      entry({ date: '2026-11-11' }),
    ])
    expect(result.find((d) => d.date === '2026-11-10')?.count).toBe(2)
    expect(result.find((d) => d.date === '2026-11-11')?.count).toBe(1)
  })

  // Known bug, not yet fixed: sentimentToScore() returns 1-5 (3 = neutral),
  // but toCalendarData compares the average against +/-0.3, so every day is
  // "positive". No component uses toCalendarData today, so nothing visible is
  // wrong yet. Fix the thresholds before using it, then drop the fixme.
  test.fixme('labels negative and neutral days correctly', () => {
    const result = toCalendarData([
      entry({ date: '2026-11-10', sentimentAI: 'Very Negative' }),
      entry({ date: '2026-11-11', sentimentAI: 'Neutral' }),
      entry({ date: '2026-11-12', sentimentAI: 'Very Positive' }),
    ])
    const byDate = Object.fromEntries(result.map((d) => [d.date, d.sentiment]))
    expect(byDate).toEqual({
      '2026-11-10': 'negative',
      '2026-11-11': 'neutral',
      '2026-11-12': 'positive',
    })
  })
})
