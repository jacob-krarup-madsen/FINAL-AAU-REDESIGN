import { describe, it, expect } from 'vitest'
import { FileUp, MessageSquare, Clock, Star, Bell } from 'lucide-react'
import { getNotificationIcon, createMockNotifications } from '@/components/Notifications'

describe('getNotificationIcon', () => {
  it('returns FileUp for AFLEVERING', () => {
    expect(getNotificationIcon('AFLEVERING')).toBe(FileUp)
  })

  it('returns MessageSquare for FORUM', () => {
    expect(getNotificationIcon('FORUM')).toBe(MessageSquare)
  })

  it('returns Clock for DEADLINE', () => {
    expect(getNotificationIcon('DEADLINE')).toBe(Clock)
  })

  it('returns Star for FEEDBACK', () => {
    expect(getNotificationIcon('FEEDBACK')).toBe(Star)
  })

  it('returns Bell for unknown type (fallback)', () => {
    expect(getNotificationIcon('UNKNOWN')).toBe(Bell)
  })
})

describe('createMockNotifications', () => {
  it('returns array of length 5', () => {
    const items = createMockNotifications((k) => k)
    expect(items).toHaveLength(5)
  })

  it('each item has expected properties', () => {
    const items = createMockNotifications((k) => k)
    items.forEach((item) => {
      expect(item).toHaveProperty('id')
      expect(item).toHaveProperty('type')
      expect(item).toHaveProperty('text')
      expect(item).toHaveProperty('date')
      expect(item).toHaveProperty('isRead')
      expect(item).toHaveProperty('archived')
      expect(item).toHaveProperty('course')
      expect(item).toHaveProperty('content')
      expect(item).toHaveProperty('link')
    })
  })

  it('items 0 and 1 have isRead false', () => {
    const items = createMockNotifications((k) => k)
    expect(items[0].isRead).toBe(false)
    expect(items[1].isRead).toBe(false)
  })

  it('items 2, 3, 4 have isRead true', () => {
    const items = createMockNotifications((k) => k)
    expect(items[2].isRead).toBe(true)
    expect(items[3].isRead).toBe(true)
    expect(items[4].isRead).toBe(true)
  })

  it('text is a string', () => {
    const items = createMockNotifications((k) => k)
    items.forEach((item) => {
      expect(typeof item.text).toBe('string')
    })
  })

  it('date is a Date object', () => {
    const items = createMockNotifications((k) => k)
    items.forEach((item) => {
      expect(item.date).toBeInstanceOf(Date)
    })
  })
})
