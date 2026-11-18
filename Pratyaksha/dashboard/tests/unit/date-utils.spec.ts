// Unit tests for the server's ISO-week and month helpers. These drive the
// weekly/monthly summary endpoints, so off-by-one bugs here show the wrong
// entries in a summary. No browser or server needed (Playwright "unit" project).
import { test, expect } from '@playwright/test'
import {
  parseWeekId,
  getWeekDateRange,
  getWeekId,
  getPreviousWeekId,
  getNextWeekId,
  formatDateISO,
} from '../../server/lib/weekUtils'
import {
  parseMonthId,
  getMonthDateRange,
  getMonthId,
  getPreviousMonthId,
  getNextMonthId,
  formatMonthRange,
} from '../../server/lib/monthUtils'

test.describe('weekUtils', () => {
  test('parseWeekId accepts YYYY-Wnn and rejects anything else', () => {
    expect(parseWeekId('2026-W07')).toEqual({ year: 2026, week: 7 })
    for (const bad of ['2026-W7', '2026W07', '26-W07', '2026-07', '']) {
      expect(() => parseWeekId(bad), bad).toThrow(/Invalid week format/)
    }
  })

  test('week 1 can start in the previous calendar year', () => {
    // ISO 2026-W01 runs Mon 29 Dec 2025 to Sun 4 Jan 2026.
    const { start, end } = getWeekDateRange('2026-W01')
    expect(formatDateISO(start)).toBe('2025-12-29')
    expect(formatDateISO(end)).toBe('2026-01-04')
    expect(start.getDay()).toBe(1) // Monday
    expect(end.getDay()).toBe(0) // Sunday
    expect([end.getHours(), end.getMinutes()]).toEqual([23, 59])
  })

  test('getWeekId follows ISO 8601 at year boundaries', () => {
    const cases: Array<[string, string]> = [
      ['2025-12-29', '2026-W01'], // Monday of ISO week 1 of 2026
      ['2026-01-04', '2026-W01'],
      ['2026-01-05', '2026-W02'],
      ['2021-01-03', '2020-W53'], // 2020 has 53 ISO weeks
      ['2026-12-31', '2026-W53'], // so does 2026
      ['2027-01-03', '2026-W53'],
      ['2027-01-04', '2027-W01'],
    ]
    for (const [day, expected] of cases) {
      const [y, m, d] = day.split('-').map(Number)
      expect(getWeekId(new Date(y, m - 1, d)), day).toBe(expected)
    }
  })

  test('every day of a week maps back to that week', () => {
    const { start } = getWeekDateRange('2026-W47')
    for (let i = 0; i < 7; i++) {
      const day = new Date(start)
      day.setDate(start.getDate() + i)
      expect(getWeekId(day)).toBe('2026-W47')
    }
  })

  test('previous and next week cross year boundaries', () => {
    expect(getPreviousWeekId('2026-W01')).toBe('2025-W52')
    expect(getNextWeekId('2026-W52')).toBe('2026-W53')
    expect(getNextWeekId('2026-W53')).toBe('2027-W01')
    expect(getPreviousWeekId(getNextWeekId('2026-W30'))).toBe('2026-W30')
  })
})

test.describe('monthUtils', () => {
  test('parseMonthId accepts YYYY-MM and rejects anything else', () => {
    expect(parseMonthId('2026-02')).toEqual({ year: 2026, month: 2 })
    for (const bad of ['2026-2', '2026/02', '202602', '']) {
      expect(() => parseMonthId(bad), bad).toThrow(/Invalid month format/)
    }
  })

  test('month range covers the full month, including leap February', () => {
    const feb2028 = getMonthDateRange('2028-02')
    expect(formatDateISO(feb2028.start)).toBe('2028-02-01')
    expect(formatDateISO(feb2028.end)).toBe('2028-02-29')

    const feb2026 = getMonthDateRange('2026-02')
    expect(formatDateISO(feb2026.end)).toBe('2026-02-28')

    const dec = getMonthDateRange('2026-12')
    expect(formatDateISO(dec.end)).toBe('2026-12-31')
    expect([dec.end.getHours(), dec.end.getMinutes()]).toEqual([23, 59])
  })

  test('previous and next month wrap around the year', () => {
    expect(getPreviousMonthId('2026-01')).toBe('2025-12')
    expect(getNextMonthId('2026-12')).toBe('2027-01')
    expect(getNextMonthId('2026-09')).toBe('2026-10')
  })

  test('getMonthId pads the month and formatMonthRange is readable', () => {
    expect(getMonthId(new Date(2026, 2, 15))).toBe('2026-03')
    expect(formatMonthRange('2026-11')).toBe('November 2026')
  })
})
