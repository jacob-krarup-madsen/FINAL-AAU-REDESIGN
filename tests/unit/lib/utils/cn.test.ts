import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible')
  })

  it('handles empty input', () => {
    expect(cn()).toBe('')
  })

  it('handles undefined values', () => {
    expect(cn('foo', undefined, 'bar')).toBe('foo bar')
  })
})
