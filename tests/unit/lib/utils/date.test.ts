import { describe, it, expect } from 'vitest';
import { formatTime, formatLongDateTime, formatRelativeDateGroup, getDeadlineInfo } from '@/lib/utils';

describe('dates', () => {
  it('formats time in en and da', () => {
    const d = new Date('2026-05-28T12:00:00')
    expect(formatTime(d, 'en')).toBeDefined()
    expect(formatTime(d, 'da')).toBeDefined()
  })

  it('formats long date time', () => {
    const d = new Date('2026-05-28T12:00:00')
    expect(formatLongDateTime(d, 'en')).toBeDefined()
    expect(formatLongDateTime(d, 'da')).toBeDefined()
  })

  it('formats relative date group', () => {
    const now = new Date('2026-05-28T12:00:00')
    const today = new Date('2026-05-28T10:00:00')
    const yesterday = new Date('2026-05-27T10:00:00')
    const other = new Date('2026-05-20T10:00:00')

    expect(formatRelativeDateGroup(today, 'en', now)).toBe('Today')
    expect(formatRelativeDateGroup(yesterday, 'en', now)).toBe('Yesterday')
    expect(formatRelativeDateGroup(other, 'en', now)).toContain('May')
  })

  it('getDeadlineInfo returns correct info for various periods', () => {
    const now = new Date('2026-06-11T12:00:00')

    const overdue = new Date('2026-06-11T11:00:00')
    const info1 = getDeadlineInfo(overdue, 'da', now)
    expect(info1.urgency).toBe('overdue')
    expect(info1.color).toBe('var(--color-status-overdue)')

    const today = new Date('2026-06-11T15:00:00')
    const info2 = getDeadlineInfo(today, 'da', now)
    expect(info2.urgency).toBe('today')
    expect(info2.label).toBe('I dag · kl. 15:00')
    expect(info2.color).toBe('var(--color-status-urgent)')

    const tomorrow = new Date('2026-06-12T10:00:00')
    const info3 = getDeadlineInfo(tomorrow, 'da', now)
    expect(info3.urgency).toBe('tomorrow')
    expect(info3.label).toBe('I morgen · kl. 10:00')
    expect(info3.color).toBe('var(--color-status-warning)')

    const soon = new Date('2026-06-13T09:00:00')
    const info4 = getDeadlineInfo(soon, 'da', now)
    expect(info4.urgency).toBe('soon')
    expect(info4.color).toBe('var(--color-status-warning)')

    const later = new Date('2026-06-15T09:00:00')
    const info5 = getDeadlineInfo(later, 'en', now)
    expect(info5.urgency).toBe('later')
    expect(info5.label).toBe('In 4 days · Monday, Jun 15 at 09:00')
    expect(info5.color).toBe('var(--color-status-neutral)')
  })
})
