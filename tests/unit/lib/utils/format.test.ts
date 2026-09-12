import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatTime, formatLongDateTime, formatRelativeDateGroup, getCourseItemMetadata } from '@/lib/utils';

describe('format utils', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('formats times and dates correctly in different languages', () => {
    const d = new Date('2026-06-04T12:00:00')
    expect(formatTime(d, 'en')).toBeDefined()
    expect(formatLongDateTime(d, 'en')).toBeDefined()
    expect(formatRelativeDateGroup(d, 'en')).toBeDefined()
  })

  it('formats relative date groups correctly in Danish and English', () => {
    const now = new Date('2026-06-11T12:00:00')
    vi.setSystemTime(now)

    const today = new Date(now)
    expect(formatRelativeDateGroup(today, 'en')).toBe('Today')
    expect(formatRelativeDateGroup(today, 'da')).toBe('I dag')

    const yesterday = new Date(now.getTime() - 24 * 3600000)
    expect(formatRelativeDateGroup(yesterday, 'en')).toBe('Yesterday')
    expect(formatRelativeDateGroup(yesterday, 'da')).toBe('I går')
  })

  it('gets course item metadata strings correctly', () => {
    expect(getCourseItemMetadata({ id: 1, type: 'pdf', title: 'File', titleEn: 'File', size: '2 MB' }, 'en')).toBe('PDF · 2 MB')
    expect(getCourseItemMetadata({ id: 1, type: 'video', title: 'Video', titleEn: 'Video', duration: '10 min' }, 'en')).toBe('Video · 10 min')
    
    const futureDate = new Date(Date.now() + 4 * 24 * 3600000)
    expect(getCourseItemMetadata({ id: 1, type: 'assignment', title: 'Task', titleEn: 'Task', deadline: futureDate.toISOString() }, 'en')).toContain('Assignment · In 4 days')
    
    expect(getCourseItemMetadata({ id: 1, type: 'link', title: 'Link', titleEn: 'Link' }, 'en')).toBe('External resource')
  })
})
