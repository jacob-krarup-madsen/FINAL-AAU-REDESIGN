import { describe, it, expect } from 'vitest';
import { courses, courseList, forums, notificationsData } from '@/lib/data';

describe('data', () => {
  it('courses is an object with at least 1 key', () => {
    expect(Object.keys(courses).length).toBeGreaterThan(0)
  })
  it('courseList is an array with length > 0', () => {
    expect(courseList.length).toBeGreaterThan(0)
  })
  it('forums is defined and has items', () => {
    expect(forums).toBeDefined()
    expect(forums.length).toBeGreaterThan(0)
  })

  it('notificationsData is an array', () => {
    expect(Array.isArray(notificationsData)).toBe(true)
  })
})
